// Timer model: one active timer at a time (tied to the WIP card).
// Stopwatch counts up; Pomodoro alternates focus/break phases.
// Only focus time counts as "time spent on the task".

export const POMODORO_DEFAULTS = {
  focusMs: 25 * 60 * 1000,
  breakMs: 5 * 60 * 1000,
}

// Continuous-focus threshold after which we gently suggest a pause.
export const PAUSE_NUDGE_MS = 90 * 60 * 1000

let pomodoroDurations = { ...POMODORO_DEFAULTS }

export function getPomodoroDurations() {
  return pomodoroDurations
}

// Phase 5 (settings) can override the defaults at runtime.
export function setPomodoroDurations({ focusMs, breakMs }) {
  pomodoroDurations = {
    focusMs: focusMs ?? pomodoroDurations.focusMs,
    breakMs: breakMs ?? pomodoroDurations.breakMs,
  }
}

export function phaseDurationMs(phase) {
  return phase === 'break'
    ? pomodoroDurations.breakMs
    : pomodoroDurations.focusMs
}

// Elapsed time within the current running segment / phase.
export function currentPhaseElapsedMs(activeTimer, now = Date.now()) {
  if (!activeTimer) return 0
  const running = activeTimer.startedAt ? Math.max(0, now - activeTimer.startedAt) : 0
  return activeTimer.accumulatedMs + running
}

// Total focus time accrued in this session, including any in-progress focus.
export function sessionFocusElapsedMs(activeTimer, now = Date.now()) {
  if (!activeTimer) return 0
  if (activeTimer.mode === 'stopwatch') {
    return currentPhaseElapsedMs(activeTimer, now)
  }
  const current =
    activeTimer.phase === 'focus' ? currentPhaseElapsedMs(activeTimer, now) : 0
  return activeTimer.sessionFocusMs + current
}

export function isActiveTimerForCard(activeTimer, cardId) {
  return Boolean(activeTimer) && activeTimer.cardId === cardId
}

// "07:32" or "1:05:09" for hours.
export function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

// Humanized: "1ч 20м", "5м", "40с".
export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  if (total < 60) return `${total}с`
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  if (h > 0) return m > 0 ? `${h}ч ${m}м` : `${h}ч`
  return `${m}м`
}

export function localDateKey(ts) {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function sessionsForCard(sessions, cardId) {
  return sessions
    .filter((s) => s.cardId === cardId)
    .sort((a, b) => b.startedAt - a.startedAt)
}

export function cardTotalMs(sessions, cardId) {
  return sessions.reduce(
    (sum, s) => (s.cardId === cardId ? sum + s.durationMs : sum),
    0,
  )
}

export function cardTodayMs(sessions, cardId, now = Date.now()) {
  const today = localDateKey(now)
  return sessions.reduce(
    (sum, s) =>
      s.cardId === cardId && localDateKey(s.endedAt) === today
        ? sum + s.durationMs
        : sum,
    0,
  )
}

// Aggregate focus time per local day for the last `days` days (oldest first).
export function focusMsByDay(sessions, days = 7, now = Date.now()) {
  const buckets = []
  const dayMs = 24 * 60 * 60 * 1000
  for (let i = days - 1; i >= 0; i--) {
    const ts = now - i * dayMs
    buckets.push({ key: localDateKey(ts), ts, ms: 0 })
  }
  const index = new Map(buckets.map((b) => [b.key, b]))
  for (const s of sessions) {
    const b = index.get(localDateKey(s.endedAt))
    if (b) b.ms += s.durationMs
  }
  return buckets
}

export function totalFocusMs(sessions) {
  return sessions.reduce((sum, s) => sum + s.durationMs, 0)
}

export function totalPomodoros(sessions) {
  return sessions.reduce((sum, s) => sum + (s.pomodorosCompleted || 0), 0)
}
