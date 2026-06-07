import { create } from 'zustand'
import { DEFAULT_INVESTMENT_TAGS } from '../lib/filterUtils'
import {
  buildDefaultNotificationPrefs,
} from '../lib/notificationTypes'

const MISSION_KEY = 'kaizenflow-mission'
const CRITERIA_KEY = 'kaizenflow-filter-criteria'
const TAGS_KEY = 'kaizenflow-investment-tags'
const NOTIFICATIONS_KEY = 'kaizenflow-notification-prefs'
const PUSH_PROMPTED_KEY = 'kaizenflow-push-prompted'

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function loadMission() {
  try {
    return localStorage.getItem(MISSION_KEY) || ''
  } catch {
    return ''
  }
}

function loadNotificationPrefs() {
  const defaults = buildDefaultNotificationPrefs()
  const stored = loadJson(NOTIFICATIONS_KEY, null)
  if (!stored) return defaults
  return { ...defaults, ...stored }
}

export const useSettingsStore = create((set, get) => ({
  personalMission: loadMission(),
  filterCriteria: loadJson(CRITERIA_KEY, []),
  investmentTags: loadJson(TAGS_KEY, DEFAULT_INVESTMENT_TAGS),
  notificationPrefs: loadNotificationPrefs(),
  pushPromptShown: localStorage.getItem(PUSH_PROMPTED_KEY) === '1',

  setPersonalMission: (mission) => {
    localStorage.setItem(MISSION_KEY, mission)
    set({ personalMission: mission })
  },

  addFilterCriterion: (label) => {
    const trimmed = label.trim()
    if (!trimmed) return false

    const { filterCriteria } = get()
    if (filterCriteria.length >= 5) return false

    const criterion = { id: crypto.randomUUID(), label: trimmed }
    const next = [...filterCriteria, criterion]
    localStorage.setItem(CRITERIA_KEY, JSON.stringify(next))
    set({ filterCriteria: next })
    return true
  },

  removeFilterCriterion: (id) => {
    const next = get().filterCriteria.filter((c) => c.id !== id)
    localStorage.setItem(CRITERIA_KEY, JSON.stringify(next))
    set({ filterCriteria: next })
  },

  setInvestmentTags: (tags) => {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags))
    set({ investmentTags: tags })
  },

  setNotificationEnabled: (id, enabled) => {
    const next = { ...get().notificationPrefs, [id]: enabled }
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next))
    set({ notificationPrefs: next })
    return next
  },

  markPushPromptShown: () => {
    localStorage.setItem(PUSH_PROMPTED_KEY, '1')
    set({ pushPromptShown: true })
  },

  requestPushPermission: async () => {
    if (typeof Notification === 'undefined') {
      return 'unsupported'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      return 'denied'
    }

    try {
      return await Notification.requestPermission()
    } catch {
      return 'denied'
    }
  },
}))
