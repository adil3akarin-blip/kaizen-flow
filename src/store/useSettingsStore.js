import { create } from 'zustand'
import { DEFAULT_INVESTMENT_TAGS } from '../lib/filterUtils'
import {
 buildDefaultNotificationPrefs,
} from '../lib/notificationTypes'
import { setPomodoroDurations } from '../lib/timerUtils'

const MISSION_KEY = 'kaizenflow-mission'
const CRITERIA_KEY = 'kaizenflow-filter-criteria'
const TAGS_KEY = 'kaizenflow-investment-tags'
const NOTIFICATIONS_KEY = 'kaizenflow-notification-prefs'
const PUSH_PROMPTED_KEY = 'kaizenflow-push-prompted'
const POMODORO_KEY = 'kaizenflow-pomodoro'

function loadJson(key, fallback) {
 try {
 const raw = localStorage.getItem(key)
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
 pomodoroFocusMin: initialPomodoro.focusMin,
 pomodoroBreakMin: initialPomodoro.breakMin,

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

 setPomodoro: (focusMin, breakMin) => {
 const next = {
 focusMin: clampInt(focusMin, 5, 60, 25),
 breakMin: clampInt(breakMin, 1, 30, 5),
 }
 localStorage.setItem(POMODORO_KEY, JSON.stringify(next))
 setPomodoroDurations({
 focusMs: next.focusMin * 60000,
 breakMs: next.breakMin * 60000,
 })
 set({
 pomodoroFocusMin: next.focusMin,
 pomodoroBreakMin: next.breakMin,
 })
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
