import { useEffect, useState } from 'react'
import { Coffee } from 'lucide-react'
import { useTimerStore } from '../../store/useTimerStore'
import {
  PAUSE_NUDGE_MS,
  focusMsByDay,
  formatDuration,
  localDateKey,
  sessionFocusElapsedMs,
} from '../../lib/timerUtils'

export default function DailySummary() {
  const sessions = useTimerStore((s) => s.sessions)
  const activeTimer = useTimerStore((s) => s.activeTimer)
  const [now, setNow] = useState(() => Date.now())

  const running = Boolean(activeTimer?.startedAt)

  // Refresh periodically only while a timer is running (for the pause nudge).
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [running])

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

  const continuousFocus = running ? sessionFocusElapsedMs(activeTimer, now) : 0
  const showNudge = continuousFocus >= PAUSE_NUDGE_MS

  if (todayMs < 1000 && !activeTimer) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between rounded-2xl border border-line/60 bg-surface px-4 py-3 shadow-(--shadow-card)">
        <span className="text-sm text-ink-muted">Фокус сегодня</span>
        <span className="text-sm font-semibold text-ink">
          {formatDuration(todayMs)}
          {todayPomodoros > 0 && (
            <span className="ml-2 text-ink-muted">🍅 {todayPomodoros}</span>
          )}
        </span>
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
