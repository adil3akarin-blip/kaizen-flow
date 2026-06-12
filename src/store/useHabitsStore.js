import { create } from 'zustand'
import {
  createDebouncedPersist,
  loadJsonPersisted,
  saveJsonPersisted,
} from '../lib/persistStorage'
import { HABIT_COLORS, HABIT_ICONS, SCHEDULE_TYPES } from '../lib/habitUtils'
import { localDateKey } from '../lib/timerUtils'

const HABITS_KEY = 'kaizenflow-habits'

function loadInitial() {
  const persisted = loadJsonPersisted(HABITS_KEY)
  const habits = Array.isArray(persisted?.habits) ? persisted.habits : []
  const log =
    persisted?.log && typeof persisted.log === 'object' ? persisted.log : {}
  return { habits, log }
}

const initial = loadInitial()

function normalizeSchedule(schedule) {
  if (!schedule || !schedule.type) {
    return { type: SCHEDULE_TYPES.daily }
  }
  if (schedule.type === SCHEDULE_TYPES.weekly) {
    return {
      type: SCHEDULE_TYPES.weekly,
      timesPerWeek: Math.min(7, Math.max(1, schedule.timesPerWeek ?? 3)),
    }
  }
  if (schedule.type === SCHEDULE_TYPES.weekdays) {
    const weekdays = Array.isArray(schedule.weekdays) ? schedule.weekdays : []
    return {
      type: SCHEDULE_TYPES.weekdays,
      weekdays: weekdays.length ? weekdays : [0, 1, 2, 3, 4],
    }
  }
  return { type: SCHEDULE_TYPES.daily }
}

export const useHabitsStore = create((set, get) => ({
  habits: initial.habits,
  log: initial.log,

  addHabit: ({ title, icon, color, schedule }) => {
    const trimmed = (title ?? '').trim()
    if (!trimmed) return null

    const habit = {
      id: crypto.randomUUID(),
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

  toggleHabitDone: (id, dateKey = localDateKey(Date.now())) => {
    set((state) => {
      const current = state.log[id] ?? []
      const has = current.includes(dateKey)
      const nextDates = has
        ? current.filter((d) => d !== dateKey)
        : [...current, dateKey]
      return { log: { ...state.log, [id]: nextDates } }
    })
    return !get().log[id]?.includes(dateKey)
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
