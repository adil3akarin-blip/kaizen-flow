import { create } from 'zustand'
import { DEFAULT_INVESTMENT_TAGS } from '../lib/filterUtils'
import { generateId } from '../lib/id'
import {
  buildDefaultNotificationPrefs,
} from '../lib/notificationTypes'
import { syncPushRegistration, unsubscribeFromPush } from '../lib/pushClient'
import { enableNotificationsAfterPermission } from '../lib/pushEnable'
import { safeGetItem, safeSetItem } from '../lib/persistStorage'
import { setPomodoroDurations } from '../lib/timerUtils'

const MISSION_KEY = 'kaizenflow-mission'
const CRITERIA_KEY = 'kaizenflow-filter-criteria'
const TAGS_KEY = 'kaizenflow-investment-tags'
const NOTIFICATIONS_KEY = 'kaizenflow-notification-prefs'
const PUSH_PROMPTED_KEY = 'kaizenflow-push-prompted'
const POMODORO_KEY = 'kaizenflow-pomodoro'

function loadJson(key, fallback) {
  try {
    const raw = safeGetItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function clampInt(value, min, max, fallback) {
  const n = Math.round(Number(value))
  if (Number.isNaN(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function loadPomodoro() {
  const stored = loadJson(POMODORO_KEY, null)
  return {
    focusMin: clampInt(stored?.focusMin, 5, 60, 25),
    breakMin: clampInt(stored?.breakMin, 1, 30, 5),
  }
}

const initialPomodoro = loadPomodoro()
setPomodoroDurations({
  focusMs: initialPomodoro.focusMin * 60000,
  breakMs: initialPomodoro.breakMin * 60000,
})

function loadMission() {
  return safeGetItem(MISSION_KEY) || ''
}

function loadCriteria() {
  const stored = loadJson(CRITERIA_KEY, [])
  if (!Array.isArray(stored)) return []
  return stored
    .filter(
      (c) =>
        c && typeof c === 'object' && typeof c.label === 'string' && c.label.trim(),
    )
    .slice(0, 5)
    .map((c) => ({
      id: typeof c.id === 'string' && c.id ? c.id : generateId(),
      label: c.label.trim(),
    }))
}

function loadInvestmentTags() {
  const stored = loadJson(TAGS_KEY, null)
  if (!Array.isArray(stored)) return DEFAULT_INVESTMENT_TAGS
  const tags = stored
    .filter((t) => typeof t === 'string' && t.trim())
    .map((t) => t.trim())
  return tags.length ? tags : DEFAULT_INVESTMENT_TAGS
}

function loadNotificationPrefs() {
  const defaults = buildDefaultNotificationPrefs()
  const stored = loadJson(NOTIFICATIONS_KEY, null)
  if (!stored || typeof stored !== 'object') return defaults
  const prefs = { ...defaults }
  for (const id of Object.keys(defaults)) {
    if (typeof stored[id] === 'boolean') prefs[id] = stored[id]
  }
  return prefs
}

async function syncPushForPrefs(prefs, stuckCount = 0) {
  const anyEnabled = Object.values(prefs).some(Boolean)
  if (!anyEnabled) {
    await unsubscribeFromPush()
    return
  }
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    return
  }
  await syncPushRegistration({ prefs, stuckCount })
}

export const useSettingsStore = create((set, get) => ({
  personalMission: loadMission(),
  filterCriteria: loadCriteria(),
  investmentTags: loadInvestmentTags(),
  notificationPrefs: loadNotificationPrefs(),
  pushPromptShown: safeGetItem(PUSH_PROMPTED_KEY) === '1',
  pomodoroFocusMin: initialPomodoro.focusMin,
  pomodoroBreakMin: initialPomodoro.breakMin,

  setPersonalMission: (mission) => {
    safeSetItem(MISSION_KEY, mission)
    set({ personalMission: mission })
  },

  addFilterCriterion: (label) => {
    const trimmed = label.trim()
    if (!trimmed) return false

    const { filterCriteria } = get()
    if (filterCriteria.length >= 5) return false

    const criterion = { id: generateId(), label: trimmed }
    const next = [...filterCriteria, criterion]
    safeSetItem(CRITERIA_KEY, JSON.stringify(next))
    set({ filterCriteria: next })
    return true
  },

  removeFilterCriterion: (id) => {
    const next = get().filterCriteria.filter((c) => c.id !== id)
    safeSetItem(CRITERIA_KEY, JSON.stringify(next))
    set({ filterCriteria: next })
  },

  setInvestmentTags: (tags) => {
    safeSetItem(TAGS_KEY, JSON.stringify(tags))
    set({ investmentTags: tags })
  },

  setNotificationEnabled: (id, enabled, { stuckCount = 0 } = {}) => {
    const next = { ...get().notificationPrefs, [id]: enabled }
    safeSetItem(NOTIFICATIONS_KEY, JSON.stringify(next))
    set({ notificationPrefs: next })
    syncPushForPrefs(next, stuckCount).catch(() => {})
    return next
  },

  markPushPromptShown: () => {
    safeSetItem(PUSH_PROMPTED_KEY, '1')
    set({ pushPromptShown: true })
  },

  setPomodoro: (focusMin, breakMin) => {
    const next = {
      focusMin: clampInt(focusMin, 5, 60, 25),
      breakMin: clampInt(breakMin, 1, 30, 5),
    }
    safeSetItem(POMODORO_KEY, JSON.stringify(next))
    setPomodoroDurations({
      focusMs: next.focusMin * 60000,
      breakMs: next.breakMin * 60000,
    })
    set({
      pomodoroFocusMin: next.focusMin,
      pomodoroBreakMin: next.breakMin,
    })
  },

  requestPushPermission: async ({ stuckCount = 0 } = {}) => {
    if (typeof Notification === 'undefined') {
      return 'unsupported'
    }

    if (Notification.permission === 'granted') {
      await enableNotificationsAfterPermission({ stuckCount, includeInactive: true })
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      if (result === 'granted') {
        await enableNotificationsAfterPermission({ stuckCount, includeInactive: true })
      }
      return result
    } catch {
      return 'denied'
    }
  },
}))
