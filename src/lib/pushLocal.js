import { buildPushPayload, stuckBody } from './pushMessages'
import { showLocalNotification } from './pushClient'
import { getLastActiveAt, getLastDumpAt } from './pushActivity'
import {
  INACTIVE_MS,
  MORNING_HOUR,
  hasDumpedToday,
  isFirstDayOfMonth,
  localDateKey,
  localHour,
  localMonthKey,
} from './pushScheduleUtils'
import { canShowNotificationsNow, getUserTimezone } from './pushUtils'
import { safeGetItem, safeSetItem } from './persistStorage'
import { useSettingsStore } from '../store/useSettingsStore'
import { useAppStore } from '../store/useAppStore'

const SENT_KEYS = {
  morning: 'kaizenflow-push-morning-sent',
  stuck: 'kaizenflow-push-stuck-sent',
  elephants: 'kaizenflow-push-elephants-sent',
  inactive: 'kaizenflow-push-inactive-sent',
}

function sentToday(type) {
  return safeGetItem(SENT_KEYS[type]) === localDateKey()
}

function markSentToday(type) {
  safeSetItem(SENT_KEYS[type], localDateKey())
}

function markSentMonth(type) {
  safeSetItem(SENT_KEYS[type], localMonthKey())
}

function sentThisMonth(type) {
  return safeGetItem(SENT_KEYS[type]) === localMonthKey()
}

export function checkElephantsMonthlyTrigger() {
  const prefs = useSettingsStore.getState().notificationPrefs
  if (!prefs.elephants) return
  if (!isFirstDayOfMonth()) return

  const badgeKey = `kaizenflow-elephants-trigger-${localMonthKey()}`
  if (safeGetItem(badgeKey) === '1') return

  useAppStore.getState().setElephantsPending(true)
  safeSetItem(badgeKey, '1')
}

export async function maybeNotifyMorning() {
  const prefs = useSettingsStore.getState().notificationPrefs
  if (!prefs.morning) return
  if (!canShowNotificationsNow()) return
  if (sentToday('morning')) return

  const now = new Date()
  const tz = getUserTimezone()
  if (localHour(now, tz) < MORNING_HOUR) return
  if (hasDumpedToday(getLastDumpAt(), now, tz)) return

  const payload = buildPushPayload('morning')
  if (!payload) return

  const shown = await showLocalNotification(payload)
  if (shown) markSentToday('morning')
}

export async function maybeNotifyStuck(stuckCount) {
  if (stuckCount <= 0) return

  const prefs = useSettingsStore.getState().notificationPrefs
  if (!prefs.stuck) return
  if (!canShowNotificationsNow()) return
  if (sentToday('stuck')) return

  const base = buildPushPayload('stuck')
  if (!base) return

  const shown = await showLocalNotification({
    ...base,
    body: stuckBody(stuckCount),
  })

  if (shown) markSentToday('stuck')
}

export async function maybeNotifyElephants() {
  const prefs = useSettingsStore.getState().notificationPrefs
  if (!prefs.elephants) return
  if (!isFirstDayOfMonth()) return
  if (!canShowNotificationsNow()) return
  if (sentThisMonth('elephants')) return

  checkElephantsMonthlyTrigger()

  const payload = buildPushPayload('elephants')
  if (!payload) return

  const shown = await showLocalNotification(payload)
  if (shown) markSentMonth('elephants')
}

export async function maybeNotifyInactive() {
  const prefs = useSettingsStore.getState().notificationPrefs
  if (!prefs.inactive) return
  if (!canShowNotificationsNow()) return
  if (sentToday('inactive')) return

  const lastActive = getLastActiveAt()
  if (!lastActive) return
  if (Date.now() - lastActive < INACTIVE_MS) return

  const payload = buildPushPayload('inactive')
  if (!payload) return

  const shown = await showLocalNotification(payload)
  if (shown) markSentToday('inactive')
}

export async function runLocalPushChecks(stuckCount, { includeInactive = false } = {}) {
  if (includeInactive) {
    await maybeNotifyInactive()
  }
  await maybeNotifyMorning()
  checkElephantsMonthlyTrigger()
  await maybeNotifyElephants()
  await maybeNotifyStuck(stuckCount)
}

export const LOCAL_PUSH_INTERVAL_MS = 30 * 60 * 1000
