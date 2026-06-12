import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Clock } from 'lucide-react'
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
      <div className="flex justify-end">
        <div className="inline-flex gap-0.5 rounded-lg border border-line bg-glass-strong p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={clsx(
                'rounded-md px-3 py-1 text-xs font-semibold transition',
                range === r.id
                  ? 'bg-accent-soft text-accent'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="hm-glass rounded-2xl px-4 py-3.5">
          <div className="flex items-center gap-2 text-ink-muted">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Clock className="h-4 w-4" strokeWidth={2} />
            </span>
            <p className="m-0 text-xs">Фокус за период</p>
          </div>
          <p className="m-0 mt-2 text-2xl font-bold tabular-nums text-ink">
            {formatDuration(rangeFocusMs)}
          </p>
        </div>
        <div className="hm-glass rounded-2xl px-4 py-3.5">
          <div className="flex items-center gap-2 text-ink-muted">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-warn-soft text-base">
              🍅
            </span>
            <p className="m-0 text-xs">Всего помидоров</p>
          </div>
          <p className="m-0 mt-2 text-2xl font-bold tabular-nums text-ink">
            {totalPomodoros(sessions)}
          </p>
        </div>
      </div>

      <div className="hm-glass mt-4 rounded-2xl px-4 py-4">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="m-0 text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Фокус по дням
          </p>
          <p className="m-0 text-[11px] text-ink-faint">
            ср. {formatDuration(Math.round(rangeFocusMs / range))}/день
          </p>
        </div>
        <MiniBarChart data={chartData} formatValue={formatDuration} />
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-ink-faint">
        Последние сессии
      </p>
      <ul className="mt-2 flex list-none flex-col gap-1.5 p-0">
        {recent.map((s) => (
          <li
            key={s.id}
            className="hm-glass flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm"
          >
            <span className="min-w-0 flex-1 truncate text-ink">{cardTitle(s.cardId)}</span>
            <span className="shrink-0 text-xs text-ink-faint">{sessionDateLabel(s.startedAt, todayKey)}</span>
            <span className="shrink-0 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-semibold tabular-nums text-accent">
              {formatClock(s.durationMs)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
