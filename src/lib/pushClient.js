import {
  canUseLocalNotifications,
  canUseRemotePush,
  getPushApiUrl,
  getUserTimezone,
  isPushApiAvailable,
  isPushConfigured,
  urlBase64ToUint8Array,
} from './pushUtils'
import { getLastActiveAt, getLastDumpAt } from './pushActivity'

async function getRegistration() {
  if (!canUseLocalNotifications()) return null
  try {
    return await navigator.serviceWorker.ready
  } catch {
    return null
  }
}

export async function getPushSubscription() {
  if (!isPushApiAvailable()) return null
  const registration = await getRegistration()
  if (!registration) return null
  return registration.pushManager.getSubscription()
}

export async function subscribeToPush() {
  if (!isPushConfigured()) return null

  const registration = await getRegistration()
  if (!registration?.pushManager) return null

  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing

  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  })
}

export async function unsubscribeFromPush() {
  const subscription = await getPushSubscription()
  if (!subscription) return false

  const endpoint = subscription.endpoint
  const unsubscribed = await subscription.unsubscribe()

  if (unsubscribed && canUseRemotePush()) {
    await fetch(`${getPushApiUrl()}/api/push/unregister`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    }).catch(() => {})
  }

  return unsubscribed
}

export function collectPushContext(stuckCount = 0) {
  return {
    timezone: getUserTimezone(),
    lastActiveAt: getLastActiveAt() ?? Date.now(),
    lastDumpAt: getLastDumpAt(),
    stuckCount,
    appBase: import.meta.env.BASE_URL || '/',
  }
}

export async function syncPushRegistration({ prefs, stuckCount = 0 }) {
  if (!canUseRemotePush()) return { ok: false, reason: 'not-configured' }

  const subscription = await getPushSubscription()
  if (!subscription) return { ok: false, reason: 'no-subscription' }

  if (Notification.permission !== 'granted') {
    return { ok: false, reason: 'permission-denied' }
  }

  const anyEnabled = Object.values(prefs).some(Boolean)
  if (!anyEnabled) {
    await unsubscribeFromPush()
    return { ok: true, reason: 'unsubscribed' }
  }

  const response = await fetch(`${getPushApiUrl()}/api/push/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      prefs,
      ...collectPushContext(stuckCount),
    }),
  })

  if (!response.ok) {
    return { ok: false, reason: 'api-error' }
  }

  return { ok: true }
}

export async function registerPushAfterPermission({ prefs, stuckCount = 0 }) {
  if (!isPushApiAvailable() || !isPushConfigured()) {
    return { ok: false, reason: 'unsupported' }
  }

  const subscription = await subscribeToPush()
  if (!subscription) return { ok: false, reason: 'subscribe-failed' }

  return syncPushRegistration({ prefs, stuckCount })
}

export async function showLocalNotification(payload) {
  if (Notification.permission !== 'granted') return false

  const registration = await getRegistration()
  if (!registration) return false

  await registration.showNotification(payload.title, {
    body: payload.body,
    tag: payload.tag,
    data: { url: payload.url, type: payload.type },
    icon: 'pwa-icon-192.png',
    badge: 'pwa-icon-192.png',
  })
  return true
}

export async function ensureServiceWorkerReady() {
  if (!canUseLocalNotifications()) return false
  try {
    await navigator.serviceWorker.ready
    return true
  } catch {
    return false
  }
}
