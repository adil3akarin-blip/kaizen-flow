import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { ChevronDown, Play, Search, Settings } from 'lucide-react'
import { useCardsStore } from '../../store/useCardsStore'
import { selectActiveHabits, useHabitsStore } from '../../store/useHabitsStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useTimerStore } from '../../store/useTimerStore'
import { scheduleLabel } from '../../lib/habitUtils'
import Sheet from '../ui/Sheet'

const TABS = [
  { id: 'free', label: 'Свободно' },
  { id: 'task', label: 'Задача' },
  { id: 'habit', label: 'Привычка' },
  { id: 'tags', label: 'Теги' },
]

const DURATION_PRESETS = [15, 25, 45, 60]

function TaskRow({ card, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(card.id)}
      className={clsx(
        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition',
        selected
          ? 'border-accent bg-accent-soft'
          : 'border-line/50 bg-surface hover:border-line-strong',
      )}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: card.color?.bg ?? 'var(--color-line-strong)' }}
      />
      <span className="min-w-0 flex-1 truncate text-sm text-ink">{card.text}</span>
    </button>
  )
}

export default function StartTimerModal({ open, onClose }) {
  const cards = useCardsStore((s) => s.cards)
  const habits = useHabitsStore((s) => s.habits)
  const investmentTags = useSettingsStore((s) => s.investmentTags)
  const focusMinDefault = useSettingsStore((s) => s.pomodoroFocusMin)
  const breakMin = useSettingsStore((s) => s.pomodoroBreakMin)
  const startTimer = useTimerStore((s) => s.startTimer)

  const [tab, setTab] = useState('free')
  const [search, setSearch] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [mode, setMode] = useState('pomodoro')
  const [focusMin, setFocusMin] = useState(focusMinDefault)
  const [customizeOpen, setCustomizeOpen] = useState(false)

  // Reset the draft each time the modal opens (no setState-in-effect).
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setTab('free')
      setSearch('')
      setSelectedTask(null)
      setSelectedHabit(null)
      setSelectedTags([])
      setMode('pomodoro')
      setFocusMin(focusMinDefault)
      setCustomizeOpen(false)
    }
  }

  const activeHabits = selectActiveHabits({ habits })
  const taskCards = useMemo(() => {
    const q = search.trim().toLowerCase()
    const pool = cards.filter(
      (c) => c.status === 'wip' || c.status === 'filtered',
    )
    const filtered = q
      ? pool.filter((c) => c.text.toLowerCase().includes(q))
      : pool
    return {
      wip: filtered.filter((c) => c.status === 'wip'),
      queue: filtered
        .filter((c) => c.status === 'filtered')
        .sort((a, b) => a.createdAt - b.createdAt),
    }
  }, [cards, search])

  const toggleTag = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )

  const canStart =
    tab === 'free' ||
    (tab === 'task' && selectedTask) ||
    (tab === 'habit' && selectedHabit) ||
    (tab === 'tags' && selectedTags.length > 0)

  const summary =
    mode === 'pomodoro' ? `Помодоро · ${focusMin}м` : 'Секундомер'

  const handleStart = () => {
    if (!canStart) return
    let link
    if (tab === 'task') {
      const c = cards.find((x) => x.id === selectedTask)
      link = { type: 'task', cardId: selectedTask, label: c?.text }
    } else if (tab === 'habit') {
      const h = activeHabits.find((x) => x.id === selectedHabit)
      link = { type: 'habit', habitId: selectedHabit, label: h?.title, icon: h?.icon }
    } else if (tab === 'tags') {
      link = { type: 'tags', tags: selectedTags, label: selectedTags.join(', ') }
    } else {
      link = { type: 'free' }
    }

    const opts = { link }
    if (mode === 'pomodoro') {
      opts.focusMs = focusMin * 60000
      opts.breakMs = breakMin * 60000
    }
    startTimer(link.type === 'task' ? selectedTask : null, mode, opts)
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      icon={Play}
      title="Запустить таймер"
      subtitle="Выбери, к чему привязать сессию"
      footer={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:text-ink"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleStart}
            disabled={!canStart}
            className="hm-grad flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-(--shadow-glow) transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <Play className="h-4 w-4" strokeWidth={2.4} fill="currentColor" />
            Запустить
          </button>
        </div>
      }
    >
      <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
        Привязать к
      </p>
      <div className="flex gap-1 rounded-xl bg-sunken p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex-1 rounded-lg py-2 text-xs font-semibold transition',
              tab === t.id
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-[7rem]">
        {tab === 'free' && (
          <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-line-strong px-4 py-8 text-center text-sm text-ink-muted">
            Сессия не будет привязана к задаче или тегам
          </div>
        )}

        {tab === 'task' && (
          <div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" strokeWidth={2} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск задач…"
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint outline-none transition focus:border-line-strong focus:ring-2 focus:ring-accent/30"
              />
            </div>

            {taskCards.wip.length === 0 && taskCards.queue.length === 0 ? (
              <p className="mt-4 text-center text-sm text-ink-faint">
                Нет задач. Разбери мысли во вкладке «Разбор».
              </p>
            ) : (
              <div className="mt-3 flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                {taskCards.wip.length > 0 && (
                  <>
                    <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                      В работе
                    </p>
                    {taskCards.wip.map((c) => (
                      <TaskRow key={c.id} card={c} selected={selectedTask === c.id} onSelect={setSelectedTask} />
                    ))}
                  </>
                )}
                {taskCards.queue.length > 0 && (
                  <>
                    <p className="m-0 mt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                      Очередь {taskCards.queue.length}
                    </p>
                    {taskCards.queue.map((c) => (
                      <TaskRow key={c.id} card={c} selected={selectedTask === c.id} onSelect={setSelectedTask} />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'habit' && (
          <div>
            {activeHabits.length === 0 ? (
              <p className="text-center text-sm text-ink-faint">
                Нет привычек. Добавь их во вкладке «Прогресс».
              </p>
            ) : (
              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
                {activeHabits.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedHabit(h.id)}
                    className={clsx(
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition',
                      selectedHabit === h.id
                        ? 'border-accent bg-accent-soft'
                        : 'border-line/50 bg-surface hover:border-line-strong',
                    )}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                      style={{ backgroundColor: `${h.color}22` }}
                    >
                      {h.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{h.title}</span>
                      <span className="block text-xs text-ink-muted">{scheduleLabel(h)}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'tags' && (
          <div className="flex flex-wrap gap-2">
            {investmentTags.map((tag) => {
              const active = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={clsx(
                    'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
                    active
                      ? 'border-accent bg-accent text-white'
                      : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-line/60">
        <button
          type="button"
          onClick={() => setCustomizeOpen((v) => !v)}
          className="flex w-full items-center gap-2 px-4 py-3 text-left"
        >
          <Settings className="h-4 w-4 text-ink-muted" strokeWidth={2} />
          <span className="text-sm font-medium text-ink">Настроить</span>
          <span className="ml-auto text-sm text-ink-muted">{summary}</span>
          <ChevronDown
            className={clsx('h-4 w-4 text-ink-faint transition-transform', customizeOpen && 'rotate-180')}
            strokeWidth={2}
          />
        </button>

        {customizeOpen && (
          <div className="border-t border-line/60 px-4 py-3">
            <div className="flex gap-1 rounded-xl bg-sunken p-1">
              {[
                { id: 'pomodoro', label: '🍅 Помодоро' },
                { id: 'stopwatch', label: '⏱ Секундомер' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={clsx(
                    'flex-1 rounded-lg py-1.5 text-xs font-semibold transition',
                    mode === m.id ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {mode === 'pomodoro' && (
              <div className="mt-3">
                <p className="m-0 mb-2 text-xs text-ink-muted">Длительность фокуса</p>
                <div className="flex flex-wrap gap-2">
                  {DURATION_PRESETS.map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setFocusMin(min)}
                      className={clsx(
                        'rounded-lg border px-3 py-1.5 text-sm font-semibold transition',
                        focusMin === min
                          ? 'border-accent bg-accent-soft text-accent'
                          : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
                      )}
                    >
                      {min}м
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Sheet>
  )
}
