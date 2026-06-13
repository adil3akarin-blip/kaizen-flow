import { create } from 'zustand'
import {
  createDebouncedPersist,
  loadJsonPersisted,
  saveJsonPersisted,
} from '../lib/persistStorage'
import { HABIT_COLORS, HABIT_ICONS, SCHEDULE_TYPES } from '../lib/habitUtils'
import { generateId } from '../lib/id'
import { localDateKey } from '../lib/timerUtils'

const HABITS_KEY = 'kaizenflow-habits'
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/

function normalizeSchedule(schedule) {
  if (!schedule || !schedule.type) {
    return { type: SCHEDULE_TYPES.daily }
  }
  if (schedule.type === SCHEDULE_TYPES.weekly) {
    const n = Math.round(Number(schedule.timesPerWeek))
    return {
      type: SCHEDULE_TYPES.weekly,
      timesPerWeek: Number.isFinite(n) ? Math.min(7, Math.max(1, n)) : 3,
    }
  }
  if (schedule.type === SCHEDULE_TYPES.weekdays) {
    const weekdays = Array.isArray(schedule.weekdays)
      ? [...new Set(schedule.weekdays.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))]
      : []
    return {
      type: SCHEDULE_TYPES.weekdays,
      weekdays: weekdays.length ? weekdays : [0, 1, 2, 3, 4],
    }
  }
  return { type: SCHEDULE_TYPES.daily }
}

function sanitizeHabits(habits) {
  return habits
    .filter(
      (h) =>
        h && typeof h === 'object' && typeof h.title === 'string' && h.title.trim(),
    )
    .map((h) => ({
      id: typeof h.id === 'string' && h.id ? h.id : generateId(),
      title: h.title.trim(),
      icon: typeof h.icon === 'string' && h.icon ? h.icon : HABIT_ICONS[0],
      color: typeof h.color === 'string' && h.color ? h.color : HABIT_COLORS[0],
      schedule: normalizeSchedule(h.schedule),
      createdAt: typeof h.createdAt === 'number' ? h.createdAt : Date.now(),
      archived: Boolean(h.archived),
    }))
}

function sanitizeLog(log) {
  const out = {}
  for (const [habitId, dates] of Object.entries(log)) {
    if (!Array.isArray(dates)) continue
    out[habitId] = [
      ...new Set(dates.filter((d) => typeof d === 'string' && DATE_KEY_RE.test(d))),
    ]
  }
  return out
}

function loadInitial() {
  const persisted = loadJsonPersisted(HABITS_KEY)
  const habits = sanitizeHabits(
    Array.isArray(persisted?.habits) ? persisted.habits : [],
  )
  const log = sanitizeLog(
    persisted?.log && typeof persisted.log === 'object' ? persisted.log : {},
  )
  return { habits, log }
}

const initial = loadInitial()

export const useHabitsStore = create((set, get) => ({
  habits: initial.habits,
  log: initial.log,

  addHabit: ({ title, icon, color, schedule }) => {
    const trimmed = (title ?? '').trim()
    if (!trimmed) return null

    const habit = {
      id: generateId(),
      title: trimmed,
      icon: icon || HABIT_ICONS[0],
      color: color || HABIT_COLORS[0],
      schedule: normalizeSchedule(schedule),
      createdAt: Date.now(),
      archived: false,
    }
    set((state) => ({ habits: [...state.habits, habit] }))
    return habit
  },

  updateHabit: (id, patch) => {
    set((state) => ({
      habits: state.habits.map((h) => {
        if (h.id !== id) return h
        const next = { ...h, ...patch }
        if (patch.schedule) next.schedule = normalizeSchedule(patch.schedule)
        if (patch.title != null) next.title = patch.title.trim() || h.title
        return next
      }),
    }))
  },

  archiveHabit: (id) => {
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === id ? { ...h, archived: true } : h,
      ),
    }))
  },

  deleteHabit: (id) => {
    set((state) => {
      const log = { ...state.log }
      delete log[id]
      return { habits: state.habits.filter((h) => h.id !== id), log }
    })
  },

  // Returns whether the habit is now marked done for that date.
  toggleHabitDone: (id, dateKey = localDateKey(Date.now())) => {
    set((state) => {
      const current = state.log[id] ?? []
      const has = current.includes(dateKey)
      const nextDates = has
        ? current.filter((d) => d !== dateKey)
        : [...current, dateKey]
      return { log: { ...state.log, [id]: nextDates } }
    })
    return get().log[id]?.includes(dateKey) ?? false
  },
}))

const debouncedPersist = createDebouncedPersist((habits, log) => {
  saveJsonPersisted(HABITS_KEY, { habits, log })
})

useHabitsStore.subscribe((state, prev) => {
  if (state.habits !== prev.habits || state.log !== prev.log) {
    debouncedPersist(state.habits, state.log)
  }
})

export function selectActiveHabits(state) {
  return state.habits.filter((h) => !h.archived)
}
