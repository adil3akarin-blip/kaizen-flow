import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { useTimerStore } from '../../store/useTimerStore'
import { useCardsStore } from '../../store/useCardsStore'
import {
  focusMsByDay,
  formatClock,
  formatDuration,
  localDateKey,
  totalPomodoros,
} from '../../lib/timerUtils'
import MiniBarChart from './MiniBarChart'

const WD = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

const RANGES = [
  { id: 7, label: '7 дней' },
  { id: 30, label: '30 дней' },
]

function sessionDateLabel(ts, todayKey) {
  if (localDateKey(ts) === todayKey) return 'Сегодня'
  return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export default function TimeStatsView() {
  const sessions = useTimerStore((s) => s.sessions)
  const cards = useCardsStore((s) => s.cards)
  const [range, setRange] = useState(7)
  const [todayKey] = useState(() => localDateKey(Date.now()))

  const buckets = useMemo(() => focusMsByDay(sessions, range), [sessions, range])

  const chartData = useMemo(
    () =>
      buckets.map((b, i) => ({
        key: b.key,
        value: b.ms,
        highlight: i === buckets.length - 1,
        label:
          range === 7
            ? WD[new Date(b.ts).getDay()]
            : i % 5 === 0
              ? String(new Date(b.ts).getDate())
              : '',
      })),
    [buckets, range],
  )

  const rangeFocusMs = useMemo(
    () => buckets.reduce((sum, b) => sum + b.ms, 0),
    [buckets],
  )

  const cardTitle = (cardId) =>
    cards.find((c) => c.id === cardId)?.text ?? 'Без задачи'

  const recent = useMemo(
    () => [...sessions].sort((a, b) => b.startedAt - a.startedAt).slice(0, 8),
    [sessions],
  )

  if (sessions.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-ink-faint">
        Пока нет данных. Запусти таймер на задаче в «Сегодня».
      </p>
    )
  }

  return (
    <div className="mt-6">
      <div className="flex rounded-xl bg-sunken p-1">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className={clsx(
              'flex-1 rounded-lg py-1.5 text-xs font-medium transition',
              range === r.id ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line/60 bg-surface px-4 py-3 shadow-(--shadow-card)">
          <p className="m-0 text-xs text-ink-muted">Фокус за период</p>
          <p className="m-0 mt-1 text-xl font-semibold text-ink">{formatDuration(rangeFocusMs)}</p>
        </div>
        <div className="rounded-2xl border border-line/60 bg-surface px-4 py-3 shadow-(--shadow-card)">
          <p className="m-0 text-xs text-ink-muted">Всего помидоров</p>
          <p className="m-0 mt-1 text-xl font-semibold text-ink">🍅 {totalPomodoros(sessions)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-line/60 bg-surface px-4 py-4 shadow-(--shadow-card)">
        <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
          Фокус по дням
        </p>
        <MiniBarChart data={chartData} formatValue={formatDuration} />
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-ink-faint">
        Последние сессии
      </p>
      <ul className="mt-2 flex list-none flex-col gap-1.5 p-0">
        {recent.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-xl border border-line/50 bg-surface px-4 py-2.5 text-sm shadow-(--shadow-card)"
          >
            <span className="min-w-0 flex-1 truncate text-ink">{cardTitle(s.cardId)}</span>
            <span className="shrink-0 text-xs text-ink-faint">{sessionDateLabel(s.startedAt, todayKey)}</span>
            <span className="shrink-0 tabular-nums text-ink-muted">{formatClock(s.durationMs)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
