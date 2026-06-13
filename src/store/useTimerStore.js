import { create } from 'zustand'
import {
  createDebouncedPersist,
  loadJsonPersisted,
  saveJsonPersisted,
} from '../lib/persistStorage'
import { hapticTap } from '../lib/haptics'
import { generateId } from '../lib/id'
import {
  currentPhaseElapsedMs,
  phaseDurationMs,
  sessionFocusElapsedMs,
} from '../lib/timerUtils'

const TIMER_KEY = 'kaizenflow-timer'
const MIN_SAVED_MS = 1000 // ignore sub-second sessions
const RESUME_GRACE_MS = 2 * 60 * 1000
const HEARTBEAT_INTERVAL_MS = 30 * 1000
const TICK_MS = 1000

const TIMER_MODES = new Set(['stopwatch', 'pomodoro'])
const LINK_TYPES = new Set(['free', 'task', 'habit', 'tags'])

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

// A session/timer link: free (no link), a task (card), a habit, or tags.
function normalizeLink(link, cardId) {
  if (link && typeof link === 'object' && LINK_TYPES.has(link.type)) return link
  return cardId ? { type: 'task', cardId } : { type: 'free' }
}

function sanitizeSessions(sessions) {
  return sessions.filter(
    (s) =>
      s &&
      typeof s === 'object' &&
      isFiniteNumber(s.durationMs) &&
      s.durationMs > 0 &&
      isFiniteNumber(s.startedAt) &&
      isFiniteNumber(s.endedAt),
  )
}

function sanitizeActiveTimer(timer) {
  if (!timer || typeof timer !== 'object') return null
  if (!TIMER_MODES.has(timer.mode)) return null
  const num = (v) => (isFiniteNumber(v) ? Math.max(0, v) : 0)
  return {
    cardId: timer.cardId ?? timer.link?.cardId ?? null,
    link: normalizeLink(timer.link, timer.cardId),
    mode: timer.mode,
    phase:
      timer.mode === 'pomodoro'
        ? timer.phase === 'break'
          ? 'break'
          : 'focus'
        : null,
    focusMs: isFiniteNumber(timer.focusMs) ? timer.focusMs : undefined,
    breakMs: isFiniteNumber(timer.breakMs) ? timer.breakMs : undefined,
    startedAt: isFiniteNumber(timer.startedAt) ? timer.startedAt : null,
    sessionStartedAt: isFiniteNumber(timer.sessionStartedAt)
      ? timer.sessionStartedAt
      : Date.now(),
    accumulatedMs: num(timer.accumulatedMs),
    sessionFocusMs: num(timer.sessionFocusMs),
    pomodorosCompleted: num(timer.pomodorosCompleted),
    heartbeatAt: isFiniteNumber(timer.heartbeatAt) ? timer.heartbeatAt : null,
  }
}

// A timer left "running" while the app was closed would otherwise count the
// whole absence as focus time. If the last heartbeat is stale, pause at it.
function recoverActiveTimer(timer, now = Date.now()) {
  if (!timer || !timer.startedAt) return timer
  const lastSeen = Math.max(timer.startedAt, timer.heartbeatAt ?? 0)
  if (now - lastSeen <= RESUME_GRACE_MS) return timer
  return {
    ...timer,
    accumulatedMs: timer.accumulatedMs + Math.max(0, lastSeen - timer.startedAt),
    startedAt: null,
  }
}

function loadInitial() {
  const persisted = loadJsonPersisted(TIMER_KEY)
  const sessions = sanitizeSessions(
    Array.isArray(persisted?.sessions) ? persisted.sessions : [],
  )
  const activeTimer = recoverActiveTimer(sanitizeActiveTimer(persisted?.activeTimer))
  return { sessions, activeTimer }
}

const initial = loadInitial()

// Build a finished session from an active timer (focus time only).
function buildSession(timer, now) {
  const durationMs = Math.round(sessionFocusElapsedMs(timer, now))
  if (durationMs < MIN_SAVED_MS) return null
  const link = normalizeLink(timer.link, timer.cardId)
  return {
    id: generateId(),
    cardId: link.type === 'task' ? link.cardId : null,
    link,
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

  // startTimer(cardId, mode, { link, focusMs, breakMs })
  // cardId stays the first arg for the task flow; the modal passes a richer link.
  startTimer: (cardId, mode = 'stopwatch', opts = {}) => {
    const now = Date.now()
    const link = normalizeLink(opts.link, cardId)
    set((state) => {
      // Finalize any orphaned timer first.
      const sessions = state.activeTimer
        ? [...state.sessions, buildSession(state.activeTimer, now)].filter(Boolean)
        : state.sessions
      return {
        sessions,
        activeTimer: {
          cardId: link.type === 'task' ? link.cardId : null,
          link,
          mode,
          phase: mode === 'pomodoro' ? 'focus' : null,
          focusMs: isFiniteNumber(opts.focusMs) ? opts.focusMs : undefined,
          breakMs: isFiniteNumber(opts.breakMs) ? opts.breakMs : undefined,
          startedAt: now,
          sessionStartedAt: now,
          accumulatedMs: 0,
          sessionFocusMs: 0,
          pomodorosCompleted: 0,
          heartbeatAt: now,
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
      const now = Date.now()
      return { activeTimer: { ...t, startedAt: now, heartbeatAt: now } }
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

  // Advance a Pomodoro from focus→break (or back); driven by the global ticker.
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
            ? t.sessionFocusMs + phaseDurationMs('focus', t)
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

  touchHeartbeat: () => {
    set((state) => {
      const t = state.activeTimer
      if (!t || !t.startedAt) return state
      return { activeTimer: { ...t, heartbeatAt: Date.now() } }
    })
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

  removeSession: (id) => {
    set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) }))
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

// A single global ticker while a timer runs: auto-advances Pomodoro phases at
// their boundary (so free/habit timers advance without the WIP card mounted)
// and keeps heartbeatAt fresh for crash recovery.
let tickId = null
function syncRunning(state) {
  const running = Boolean(state.activeTimer?.startedAt)
  if (running && tickId == null) {
    tickId = setInterval(() => {
      const t = useTimerStore.getState().activeTimer
      if (!t || !t.startedAt) return
      if (
        t.mode === 'pomodoro' &&
        currentPhaseElapsedMs(t, Date.now()) >= phaseDurationMs(t.phase, t)
      ) {
        useTimerStore.getState().advancePhase()
      }
      if (Date.now() - (t.heartbeatAt ?? 0) >= HEARTBEAT_INTERVAL_MS) {
        useTimerStore.getState().touchHeartbeat()
      }
    }, TICK_MS)
  } else if (!running && tickId != null) {
    clearInterval(tickId)
    tickId = null
  }
}
useTimerStore.subscribe(syncRunning)
syncRunning(useTimerStore.getState())
