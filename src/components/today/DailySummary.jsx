import { Clock, Coffee, Flame } from 'lucide-react'
import { useTimerStore } from '../../store/useTimerStore'
import { selectActiveHabits, useHabitsStore } from '../../store/useHabitsStore'
import { isDoneOn, isDueToday } from '../../lib/habitUtils'
import {
  PAUSE_NUDGE_MS,
  focusMsByDay,
  formatDuration,
  localDateKey,
  sessionFocusElapsedMs,
} from '../../lib/timerUtils'
import { useNow } from '../../lib/useNow'

function StatTile({ icon, accentClass, value, label }) {
  return (
    <div className="hm-glass flex flex-col gap-2 rounded-2xl px-4 py-3.5">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl text-base ${accentClass}`}
      >
        {icon}
      </span>
      <p className="m-0 text-xl font-bold leading-none tabular-nums text-ink">{value}</p>
      <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </p>
    </div>
  )
}

export default function DailySummary() {
  const sessions = useTimerStore((s) => s.sessions)
  const activeTimer = useTimerStore((s) => s.activeTimer)
  const habits = useHabitsStore((s) => s.habits)
  const log = useHabitsStore((s) => s.log)

  const running = Boolean(activeTimer?.startedAt)
  // Tick while running (for the pause nudge); also re-anchors at midnight.
  const now = useNow({ active: running, intervalMs: 30000 })
  const todayKey = localDateKey(now)
  const loggedToday = focusMsByDay(sessions, 1, now)[0]?.ms ?? 0
  const activeFocus = activeTimer ? sessionFocusElapsedMs(activeTimer, now) : 0
  const todayMs = loggedToday + activeFocus

  const todayPomodoros =
    sessions.reduce(
      (sum, s) =>
        localDateKey(s.endedAt) === todayKey ? sum + (s.pomodorosCompleted || 0) : sum,
      0,
    ) + (activeTimer?.pomodorosCompleted ?? 0)

  const dueHabits = selectActiveHabits({ habits }).filter((h) => isDueToday(h, log))
  const doneHabits = dueHabits.filter((h) => isDoneOn(log, h.id, todayKey)).length

  const continuousFocus = running ? sessionFocusElapsedMs(activeTimer, now) : 0
  const showNudge = continuousFocus >= PAUSE_NUDGE_MS

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={<Clock className="h-[18px] w-[18px]" strokeWidth={2} />}
          accentClass="bg-accent-soft text-accent"
          value={formatDuration(todayMs)}
          label="Фокус"
        />
        <StatTile
          icon={<span className="text-[15px]">🍅</span>}
          accentClass="bg-warn-soft"
          value={todayPomodoros}
          label="Помидоры"
        />
        <StatTile
          icon={<Flame className="h-[18px] w-[18px]" strokeWidth={2} />}
          accentClass="bg-success-soft text-success"
          value={dueHabits.length > 0 ? `${doneHabits}/${dueHabits.length}` : '—'}
          label="Привычки"
        />
      </div>

      {showNudge && (
        <div className="flex items-center gap-2 rounded-xl bg-warn-soft px-4 py-2.5 text-sm text-warn">
          <Coffee className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          Много фокуса подряд — сделай паузу
        </div>
      )}
    </div>
  )
}
