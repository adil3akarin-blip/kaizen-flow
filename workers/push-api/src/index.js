const MESSAGES = {
  morning: {
    title: 'KaizenFlow',
    body: 'Утро. Хочешь выгрузить мысли?',
    tag: 'kaizenflow-morning',
    query: { open: 'dump' },
  },
  stuck: {
    title: 'KaizenFlow',
    body: 'Одно дело застряло — пересмотреть?',
    tag: 'kaizenflow-stuck',
    query: { tab: 'today' },
  },
  elephants: {
    title: 'KaizenFlow',
    body: 'Месяц закрылся. Заглянуть в итоги?',
    tag: 'kaizenflow-elephants',
    query: { tab: 'kanban', elephants: '1' },
  },
  inactive: {
    title: 'KaizenFlow',
    body: 'Как дела с потоком?',
    tag: 'kaizenflow-inactive',
    query: { tab: 'today' },
  },
}

const INACTIVE_MS = 3 * 24 * 60 * 60 * 1000
const MORNING_HOUR = 8

function corsHeaders(origin, allowed) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  if (allowed && origin === allowed) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}

function buildUrl(appBase, query) {
  const base = appBase?.endsWith('/') ? appBase : `${appBase || '/'}`
  const params = new URLSearchParams(query)
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

function localDateKey(now, timezone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

function localMonthKey(now, timezone) {
  return localDateKey(now, timezone).slice(0, 7)
}

function localHour(now, timezone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(now)
  const hour = parts.find((p) => p.type === 'hour')?.value
  return Number(hour)
}

function startOfLocalDayMs(now, timezone) {
  const dateKey = localDateKey(now, timezone)
  const probe = new Date(now)
  for (let h = 0; h < 24; h += 1) {
    if (localDateKey(probe, timezone) === dateKey && localHour(probe, timezone) === 0) {
      return probe.getTime()
    }
    probe.setTime(probe.getTime() - 60 * 60 * 1000)
  }
  return now.getTime() - 24 * 60 * 60 * 1000
}

function stuckBody(stuckCount) {
  if (stuckCount === 1) return 'Одно дело застряло — пересмотреть?'
  return `${stuckCount} дел застряло — пересмотреть?`
}

function buildPayload(type, record) {
  const msg = MESSAGES[type]
  if (!msg) return null
  const url = buildUrl(record.appBase, msg.query)
  const body = type === 'stuck' ? stuckBody(record.stuckCount || 0) : msg.body
  return {
    title: msg.title,
    body,
    tag: msg.tag,
    url,
    type,
  }
}

async function sendPush(webpush, record, type, env) {
  const payload = buildPayload(type, record)
  if (!payload) return false

  webpush.setVapidDetails(
    env.VAPID_SUBJECT || 'mailto:push@kaizenflow.local',
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  )

  await webpush.sendNotification(record.subscription, JSON.stringify(payload))
  return true
}

function shouldSendMorning(record, now) {
  if (!record.prefs?.morning) return false
  const tz = record.timezone || 'UTC'
  const hour = localHour(now, tz)
  if (hour < MORNING_HOUR) return false

  const today = localDateKey(now, tz)
  if (record.sent?.morning === today) return false

  const dayStart = startOfLocalDayMs(now, tz)
  if (record.lastDumpAt && record.lastDumpAt >= dayStart) return false

  return true
}

function shouldSendStuck(record, now) {
  if (!record.prefs?.stuck) return false
  if (!record.stuckCount || record.stuckCount <= 0) return false

  const tz = record.timezone || 'UTC'
  const today = localDateKey(now, tz)
  if (record.sent?.stuck === today) return false

  return true
}

function shouldSendElephants(record, now) {
  if (!record.prefs?.elephants) return false

  const tz = record.timezone || 'UTC'
  const parts = localDateKey(now, tz).split('-')
  const day = Number(parts[2])
  if (day !== 1) return false

  const month = localMonthKey(now, tz)
  if (record.sent?.elephants === month) return false

  return true
}

function shouldSendInactive(record, now) {
  if (!record.prefs?.inactive) return false
  if (!record.lastActiveAt) return false

  const tz = record.timezone || 'UTC'
  const today = localDateKey(now, tz)
  if (record.sent?.inactive === today) return false

  return now.getTime() - record.lastActiveAt >= INACTIVE_MS
}

async function processSubscription(webpush, env, key, record, now) {
  const tz = record.timezone || 'UTC'
  const sent = { ...(record.sent || {}) }
  let changed = false

  const attempts = [
    ['morning', shouldSendMorning],
    ['stuck', shouldSendStuck],
    ['elephants', shouldSendElephants],
    ['inactive', shouldSendInactive],
  ]

  for (const [type, check] of attempts) {
    if (!check(record, now)) continue
    try {
      await sendPush(webpush, record, type, env)
      if (type === 'elephants') {
        sent.elephants = localMonthKey(now, tz)
      } else {
        sent[type] = localDateKey(now, tz)
      }
      changed = true
    } catch (err) {
      const status = err?.statusCode
      if (status === 404 || status === 410) {
        await env.SUBSCRIPTIONS.delete(key)
        return
      }
    }
  }

  if (changed) {
    await env.SUBSCRIPTIONS.put(key, JSON.stringify({ ...record, sent }))
  }
}

async function handleCron(env) {
  const webpush = await import('web-push')
  const now = new Date()
  let cursor

  do {
    const list = await env.SUBSCRIPTIONS.list({ cursor, limit: 100 })
    for (const { name } of list.keys) {
      const value = await env.SUBSCRIPTIONS.get(name)
      if (!value) continue
      try {
        const record = JSON.parse(value)
        if (!record?.subscription) continue
        await processSubscription(webpush, env, name, record, now)
      } catch {
        // skip malformed records
      }
    }
    cursor = list.list_complete ? undefined : list.cursor
  } while (cursor)
}

function subscriptionKey(subscription) {
  const endpoint = subscription?.endpoint
  if (!endpoint) return null
  return `sub:${endpoint.slice(-120)}`
}

async function handleSync(request, env) {
  const body = await request.json()
  const { subscription, prefs, timezone, lastActiveAt, lastDumpAt, stuckCount, appBase } = body

  if (!subscription?.endpoint) {
    return new Response(JSON.stringify({ error: 'missing subscription' }), { status: 400 })
  }

  const key = subscriptionKey(subscription)
  const existingRaw = await env.SUBSCRIPTIONS.get(key)
  const existing = existingRaw ? JSON.parse(existingRaw) : {}

  const record = {
    subscription,
    prefs: prefs || {},
    timezone: timezone || 'UTC',
    lastActiveAt: lastActiveAt || Date.now(),
    lastDumpAt: lastDumpAt ?? existing.lastDumpAt ?? null,
    stuckCount: stuckCount || 0,
    appBase: appBase || '/',
    sent: existing.sent || {},
    updatedAt: Date.now(),
  }

  await env.SUBSCRIPTIONS.put(key, JSON.stringify(record))
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

async function handleUnregister(request, env) {
  const body = await request.json()
  const endpoint = body?.endpoint
  if (!endpoint) {
    return new Response(JSON.stringify({ error: 'missing endpoint' }), { status: 400 })
  }
  const key = subscriptionKey({ endpoint })
  if (key) await env.SUBSCRIPTIONS.delete(key)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''
    const allowed = env.ALLOWED_ORIGIN || ''
    const headers = {
      'Content-Type': 'application/json',
      ...corsHeaders(origin, allowed),
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    if (url.pathname === '/api/push/health') {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers })
    }

    if (allowed && origin && origin !== allowed) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers })
    }

    try {
      if (url.pathname === '/api/push/sync') {
        const res = await handleSync(request, env)
        Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v))
        return res
      }

      if (url.pathname === '/api/push/unregister') {
        const res = await handleUnregister(request, env)
        Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v))
        return res
      }

      return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers })
    } catch {
      return new Response(JSON.stringify({ error: 'server error' }), { status: 500, headers })
    }
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(handleCron(env))
  },
}
