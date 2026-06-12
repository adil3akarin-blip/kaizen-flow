import { create } from 'zustand'
import {
  createDebouncedPersist,
  loadJsonPersisted,
  saveJsonPersisted,
} from '../lib/persistStorage'
import { hapticTap } from '../lib/haptics'
import { phaseDurationMs, sessionFocusElapsedMs } from '../lib/timerUtils'

const TIMER_KEY = 'kaizenflow-timer'
const MIN_SAVED_MS = 1000 // ignore sub-second sessions

function loadInitial() {
  const persisted = loadJsonPersisted(TIMER_KEY)
  const sessions = Array.isArray(persisted?.sessions) ? persisted.sessions : []
  const activeTimer =
    persisted?.activeTimer && typeof persisted.activeTimer === 'object'
      ? persisted.activeTimer
      : null
  return { sessions, activeTimer }
}

const initial = loadInitial()

// Build a finished session from an active timer (focus time only).
function buildSession(timer, now) {
  const durationMs = Math.round(sessionFocusElapsedMs(timer, now))
  if (durationMs < MIN_SAVED_MS) return null
  return {
    id: crypto.randomUUID(),
    cardId: timer.cardId,
    mode: timer.mode,
    startedAt: timer.sessionStartedAt,
    endedAt: now,
    durationMs,
    pomodorosCompleted: timer.pomodorosCompleted || 0,
  }
}

export const useTimerStore = create((set, get) => ({
  activeTimer: initial.activeTimer,
  sessions: initial.sessions,

  startTimer: (cardId, mode = 'stopwatch') => {
    const now = Date.now()
    set((state) => {
      // Finalize any orphaned timer first.
      const sessions = state.activeTimer
        ? [...state.sessions, buildSession(state.activeTimer, now)].filter(Boolean)
        : state.sessions
      return {
        sessions,
        activeTimer: {
          cardId,
          mode,
          phase: mode === 'pomodoro' ? 'focus' : null,
          startedAt: now,
          sessionStartedAt: now,
          accumulatedMs: 0,
          sessionFocusMs: 0,
          pomodorosCompleted: 0,
        },
      }
    })
    hapticTap()
  },

  pauseTimer: () => {
    set((state) => {
      const t = state.activeTimer
      if (!t || !t.startedAt) return state
      return {
        activeTimer: {
          ...t,
          accumulatedMs: t.accumulatedMs + Math.max(0, Date.now() - t.startedAt),
          startedAt: null,
        },
      }
    })
  },

  resumeTimer: () => {
    set((state) => {
      const t = state.activeTimer
      if (!t || t.startedAt) return state
      return { activeTimer: { ...t, startedAt: Date.now() } }
    })
  },

  setMode: (mode) => {
    set((state) => {
      const t = state.activeTimer
      if (!t || t.mode === mode) return state
      return {
        activeTimer: {
          ...t,
          mode,
          phase: mode === 'pomodoro' ? 'focus' : null,
        },
      }
    })
  },

  // Called by the FocusTimer when a pomodoro phase reaches its duration.
  advancePhase: () => {
    set((state) => {
      const t = state.activeTimer
      if (!t || t.mode !== 'pomodoro') return state
      const now = Date.now()
      const wasFocus = t.phase === 'focus'
      return {
        activeTimer: {
          ...t,
          phase: wasFocus ? 'break' : 'focus',
          sessionFocusMs: wasFocus
            ? t.sessionFocusMs + phaseDurationMs('focus')
            : t.sessionFocusMs,
          pomodorosCompleted: wasFocus
            ? t.pomodorosCompleted + 1
            : t.pomodorosCompleted,
          accumulatedMs: 0,
          startedAt: now,
        },
      }
    })
    hapticTap()
  },

  // Finalize the active timer into a session (counts focus time spent).
  stopTimer: () => {
    set((state) => {
      const t = state.activeTimer
      if (!t) return state
      const session = buildSession(t, Date.now())
      return {
        activeTimer: null,
        sessions: session ? [...state.sessions, session] : state.sessions,
      }
    })
  },

  // Stop only if the active timer belongs to this card (used on Done/Release).
  finalizeForCard: (cardId) => {
    const t = get().activeTimer
    if (t && t.cardId === cardId) get().stopTimer()
  },
}))

const debouncedPersist = createDebouncedPersist((activeTimer, sessions) => {
  saveJsonPersisted(TIMER_KEY, { activeTimer, sessions })
})

useTimerStore.subscribe((state, prev) => {
  if (state.activeTimer !== prev.activeTimer || state.sessions !== prev.sessions) {
    debouncedPersist(state.activeTimer, state.sessions)
  }
})
