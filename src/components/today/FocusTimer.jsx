import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Pause, Play, Square } from 'lucide-react'
import { useTimerStore } from '../../store/useTimerStore'
import {
  cardTodayMs,
  currentPhaseElapsedMs,
  formatClock,
  formatDuration,
  isActiveTimerForCard,
  phaseDurationMs,
  sessionFocusElapsedMs,
} from '../../lib/timerUtils'

const MODES = [
  { id: 'stopwatch', label: 'Секундомер' },
  { id: 'pomodoro', label: 'Помодоро' },
]

export default function FocusTimer({ cardId, embedded = false }) {
  const activeTimer = useTimerStore((s) => s.activeTimer)
  const sessions = useTimerStore((s) => s.sessions)
  const startTimer = useTimerStore((s) => s.startTimer)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resumeTimer = useTimerStore((s) => s.resumeTimer)
  const setMode = useTimerStore((s) => s.setMode)
  const stopTimer = useTimerStore((s) => s.stopTimer)

  const [now, setNow] = useState(() => Date.now())
  const [idleMode, setIdleMode] = useState('stopwatch')

  const isActive = isActiveTimerForCard(activeTimer, cardId)
  const running = isActive && Boolean(activeTimer.startedAt)
  const mode = isActive ? activeTimer.mode : idleMode
  const isPomodoro = mode === 'pomodoro'
  const phase = isActive && isPomodoro ? activeTimer.phase : 'focus'

  // Tick while running; advance pomodoro phases at their boundary.
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const t = useTimerStore.getState().activeTimer
      if (!t || !t.startedAt) return
      setNow(Date.now())
      if (t.mode === 'pomodoro') {
        if (currentPhaseElapsedMs(t, Date.now()) >= phaseDurationMs(t.phase)) {
          useTimerStore.getState().advancePhase()
        }
      }
    }, 250)
    return () => clearInterval(id)
  }, [running])

  let clockMs
  if (isPomodoro) {
    const elapsed = isActive ? currentPhaseElapsedMs(activeTimer, now) : 0
    clockMs = Math.max(0, phaseDurationMs(phase) - elapsed)
  } else {
    clockMs = isActive ? sessionFocusElapsedMs(activeTimer, now) : 0
  }

  const pomodorosCompleted = isActive ? activeTimer.pomodorosCompleted : 0
  const todayMs =
    cardTodayMs(sessions, cardId, now) +
    (isActive ? sessionFocusElapsedMs(activeTimer, now) : 0)

  const handleMode = (m) => {
    if (isActive) setMode(m)
    else setIdleMode(m)
  }

  return (
    <div
      className={clsx(
        embedded
          ? ''
          : 'rounded-2xl border border-line/60 bg-surface px-4 py-4 shadow-(--shadow-card)',
      )}
    >
      <div className="flex rounded-xl bg-sunken p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => handleMode(m.id)}
            className={clsx(
              'flex-1 rounded-lg py-1.5 text-xs font-medium transition',
              mode === m.id
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col items-center">
        {isPomodoro && (
          <p className="m-0 text-xs font-semibold uppercase tracking-wider text-ink-faint">
            {phase === 'break' ? 'Перерыв' : 'Фокус'}
          </p>
        )}
        <p className="m-0 mt-1 font-semibold tabular-nums text-ink text-[44px] leading-none">
          {formatClock(clockMs)}
        </p>
        {isPomodoro && (
          <div className="mt-2 flex items-center gap-1.5">
            {Array.from({ length: Math.max(4, pomodorosCompleted) }).map((_, i) => (
              <span
                key={i}
                className={clsx(
                  'h-1.5 w-1.5 rounded-full',
                  i < pomodorosCompleted ? 'bg-accent' : 'bg-line-strong',
                )}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        {!isActive && (
          <button
            type="button"
            onClick={() => startTimer(cardId, mode)}
            className="hm-grad flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-(--shadow-glow) transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Play className="h-4 w-4" strokeWidth={2.4} fill="currentColor" />
            Старт
          </button>
        )}

        {isActive && running && (
          <button
            type="button"
            onClick={pauseTimer}
            className="flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition hover:border-line-strong hover:bg-sunken/60"
          >
            <Pause className="h-4 w-4" strokeWidth={2} />
            Пауза
          </button>
        )}

        {isActive && !running && (
          <button
            type="button"
            onClick={resumeTimer}
            className="hm-grad flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-(--shadow-glow) transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Play className="h-4 w-4" strokeWidth={2.4} fill="currentColor" />
            Продолжить
          </button>
        )}

        {isActive && (
          <button
            type="button"
            onClick={stopTimer}
            aria-label="Остановить и записать"
            className="flex items-center justify-center rounded-xl border border-line p-2.5 text-ink-muted transition hover:border-line-strong hover:bg-sunken/60"
          >
            <Square className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      {todayMs >= 1000 && (
        <p className="m-0 mt-3 text-center text-xs text-ink-faint">
          Сегодня на задаче: {formatDuration(todayMs)}
        </p>
      )}
    </div>
  )
}
