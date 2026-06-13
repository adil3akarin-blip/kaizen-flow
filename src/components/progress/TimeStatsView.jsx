import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Clock, Trash2 } from 'lucide-react'
import { useTimerStore } from '../../store/useTimerStore'
import { useCardsStore } from '../../store/useCardsStore'
import {
  formatClock,
  formatDuration,
  localDateKey,
  totalFocusMs,
} from '../../lib/timerUtils'
import {
  buildHeatmapColumns,
  buildMonthLabels,
} from '../../lib/heatmapUtils'
import { useTodayKey } from '../../lib/useTodayKey'
import ContributionHeatmap from './ContributionHeatmap'

const RENDER_CAP = 60
const DAY_MS = 24 * 60 * 60 * 1000

const TYPE_FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'pomodoro', label: '🍅 Помодоро' },
  { id: 'stopwatch', label: '⏱ Секундомер' },
]

const RANGE_FILTERS = [
  { id: 'today', label: 'Сегодня' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'all', label: 'Всё' },
]

const LEVEL_CLASS = ['bg-sunken', 'bg-accent/30', 'bg-accent/55', 'bg-accent/80', 'bg-accent']

function focusLevel(ms) {
  if (!ms) return 0
  const min = ms / 60000
  if (min < 25) return 1
  if (min < 60) return 2
  if (min < 120) return 3
  return 4
}

function sessionDateLabel(ts, todayKey) {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (localDateKey(ts) === todayKey) return `Сегодня в ${time}`
  if (localDateKey(ts - DAY_MS) === todayKey) return `Вчера в ${time}`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) + ` в ${time}`
}

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={clsx(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            value === o.id
              ? 'bg-accent-soft text-accent'
              : 'text-ink-muted hover:bg-sunken/60 hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function TimeStatsView() {
  const sessions = useTimerStore((s) => s.sessions)
  const removeSession = useTimerStore((s) => s.removeSession)
  const cards = useCardsStore((s) => s.cards)
  const todayKey = useTodayKey()

  const [now] = useState(() => Date.now())
  const [typeFilter, setTypeFilter] = useState('all')
  const [rangeFilter, setRangeFilter] = useState('all')

  const cardTitle = (cardId) =>
    cards.find((c) => c.id === cardId)?.text ?? 'Без задачи'

  // Prefer the session link (habit / tags / free / task); fall back to the
  // card title for sessions saved before links existed.
  const sessionLabel = (s) => {
    const link = s.link
    if (link?.type === 'habit') return link.label || 'Привычка'
    if (link?.type === 'tags') return link.label || 'Теги'
    if (link?.type === 'free') return 'Свободная сессия'
    if (link?.type === 'task') return link.label || cardTitle(link.cardId)
    return s.cardId ? cardTitle(s.cardId) : 'Свободная сессия'
  }

  const totalMs = useMemo(() => totalFocusMs(sessions), [sessions])
  const bestMs = useMemo(
    () => sessions.reduce((max, s) => Math.max(max, s.durationMs), 0),
    [sessions],
  )

  // Map each local day → focus ms, for the year heatmap.
  const msByDay = useMemo(() => {
    const map = new Map()
    for (const s of sessions) {
      const k = localDateKey(s.endedAt)
      map.set(k, (map.get(k) ?? 0) + s.durationMs)
    }
    return map
  }, [sessions])

  const columns = useMemo(() => buildHeatmapColumns(now, 53), [now])
  const monthLabels = useMemo(() => buildMonthLabels(columns), [columns])

  const filtered = useMemo(() => {
    const cutoff =
      rangeFilter === 'week' ? now - 7 * DAY_MS
      : rangeFilter === 'month' ? now - 30 * DAY_MS
      : null
    return sessions
      .filter((s) => {
        if (typeFilter !== 'all' && s.mode !== typeFilter) return false
        if (rangeFilter === 'today') return localDateKey(s.startedAt) === todayKey
        if (cutoff != null) return s.startedAt >= cutoff
        return true
      })
      .sort((a, b) => b.startedAt - a.startedAt)
  }, [sessions, typeFilter, rangeFilter, now, todayKey])

  const shown = filtered.slice(0, RENDER_CAP)

  const cellFor = (cell) => {
    if (cell.future) return { className: 'bg-transparent' }
    const ms = msByDay.get(cell.key) ?? 0
    return {
      className: LEVEL_CLASS[focusLevel(ms)],
      title: ms > 0 ? `${cell.key}: ${formatDuration(ms)}` : cell.key,
    }
  }

  if (sessions.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-ink-faint">
        Пока нет данных. Запусти таймер на задаче в «Сегодня».
      </p>
    )
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <section className="hm-glass rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Clock className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="m-0 text-sm font-semibold text-ink">Активность таймера</p>
            <p className="m-0 mt-0.5 text-sm text-ink-muted">
              <span className="text-lg font-bold text-accent">
                {(totalMs / 3_600_000).toFixed(1)} ч
              </span>
              <span className="mx-1.5 text-ink-faint">·</span>
              {sessions.length} сессий
              {bestMs > 0 && (
                <>
                  <span className="mx-1.5 text-ink-faint">·</span>
                  рекорд {formatDuration(bestMs)}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ContributionHeatmap
            columns={columns}
            monthLabels={monthLabels}
            cellFor={cellFor}
            legend={
              <>
                <span>Меньше</span>
                {LEVEL_CLASS.map((c, i) => (
                  <span key={i} className={clsx('h-2.5 w-2.5 rounded-[3px]', c)} />
                ))}
                <span>Больше</span>
              </>
            }
          />
        </div>
      </section>

      <section className="hm-glass rounded-3xl p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-sm font-semibold text-ink">
            Сессии
            <span className="ml-1.5 font-normal text-ink-muted tabular-nums">
              {shown.length}/{filtered.length}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <ChipGroup options={TYPE_FILTERS} value={typeFilter} onChange={setTypeFilter} />
            <span className="hidden h-4 w-px bg-line sm:block" />
            <ChipGroup options={RANGE_FILTERS} value={rangeFilter} onChange={setRangeFilter} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-6 text-center text-sm text-ink-faint">
            Нет сессий в этом фильтре.
          </p>
        ) : (
          <>
            <ul className="mt-4 flex max-h-[26rem] list-none flex-col gap-1.5 overflow-y-auto p-0 pr-1">
              {shown.map((s) => (
                <li
                  key={s.id}
                  className="group flex items-center gap-3 rounded-xl border border-line/50 bg-surface px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-ink">
                        {sessionLabel(s)}
                      </span>
                      <span className="shrink-0 rounded-md bg-sunken px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">
                        {s.mode === 'pomodoro' ? '🍅 Помодоро' : '⏱ Секундомер'}
                      </span>
                    </div>
                    <p className="m-0 mt-0.5 text-xs text-ink-faint">
                      {sessionDateLabel(s.startedAt, todayKey)}
                      {s.pomodorosCompleted > 0 && ` · 🍅 ${s.pomodorosCompleted}`}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-semibold tabular-nums text-accent">
                    {formatClock(s.durationMs)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSession(s.id)}
                    aria-label="Удалить сессию"
                    className="shrink-0 rounded-lg p-1.5 text-ink-faint transition hover:bg-sunken hover:text-danger md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </li>
              ))}
            </ul>
            {filtered.length > RENDER_CAP && (
              <p className="mt-3 text-center text-xs text-ink-faint">
                Показаны последние {RENDER_CAP} из {filtered.length}. Сузь фильтр, чтобы увидеть остальные.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}
