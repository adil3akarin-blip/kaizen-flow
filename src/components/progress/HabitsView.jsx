import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Plus } from 'lucide-react'
import { selectActiveHabits, useHabitsStore } from '../../store/useHabitsStore'
import {
  completionStats,
  computeStreak,
  recentWeeks,
  scheduleLabel,
} from '../../lib/habitUtils'
import HabitEditor from './HabitEditor'

const ROW_LABELS = ['Пн', '', 'Ср', '', 'Пт', '', '']
const HEATMAP_WEEKS = 30

function Heatmap({ habit, log }) {
  const weeks = useMemo(
    () => recentWeeks(habit, log, HEATMAP_WEEKS),
    [habit, log],
  )

  return (
    <div className="flex w-full gap-1.5">
      {/* Weekday labels */}
      <div
        className="grid shrink-0 gap-[3px]"
        style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}
      >
        {ROW_LABELS.map((label, i) => (
          <span
            key={i}
            className="flex items-center text-[9px] leading-none text-ink-faint"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Week columns (Mon→Sun), stretched to fill width */}
      <div
        className="grid flex-1 gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${HEATMAP_WEEKS}, minmax(0, 1fr))`,
          gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
          gridAutoFlow: 'column',
        }}
      >
        {weeks.flat().map((d) => (
          <span
            key={d.key}
            title={d.key}
            className={clsx(
              'aspect-square w-full rounded-[3px]',
              d.future
                ? 'bg-transparent'
                : d.done
                  ? ''
                  : d.scheduled
                    ? 'bg-sunken ring-1 ring-inset ring-line-strong/30'
                    : 'bg-line/25',
            )}
            style={d.done ? { backgroundColor: habit.color } : undefined}
          />
        ))}
      </div>
    </div>
  )
}

export default function HabitsView() {
  const habits = useHabitsStore((s) => s.habits)
  const log = useHabitsStore((s) => s.log)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const active = useMemo(() => selectActiveHabits({ habits }), [habits])

  const openNew = () => {
    setEditing(null)
    setEditorOpen(true)
  }
  const openEdit = (habit) => {
    setEditing(habit)
    setEditorOpen(true)
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={openNew}
        className="hm-grad flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-(--shadow-glow) transition-transform hover:-translate-y-0.5"
      >
        <Plus className="h-4 w-4" strokeWidth={2.4} />
        Новая привычка
      </button>

      {active.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-faint">
          Пока нет привычек. Добавь первую — и она появится в «Сегодня».
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {active.map((habit) => {
            const streak = computeStreak(habit, log)
            const stats = completionStats(habit, log, 30)
            const rate =
              stats.scheduled > 0
                ? Math.round((stats.done / stats.scheduled) * 100)
                : 0
            return (
              <button
                key={habit.id}
                type="button"
                onClick={() => openEdit(habit)}
                className="hm-glass rounded-2xl px-4 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-(--shadow-float)"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{ backgroundColor: `${habit.color}22` }}
                  >
                    {habit.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-sm font-semibold text-ink">{habit.title}</p>
                    <p className="m-0 text-xs text-ink-muted">{scheduleLabel(habit)}</p>
                  </div>
                  {streak > 0 && (
                    <span
                      className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                      style={{
                        backgroundColor: `${habit.color}1f`,
                        color: habit.color,
                      }}
                    >
                      🔥 {streak}
                    </span>
                  )}
                  <div className="shrink-0 text-right leading-tight">
                    <p className="m-0 text-lg font-bold tabular-nums text-ink">{rate}%</p>
                    <p className="m-0 text-[11px] text-ink-faint">
                      {stats.done}/{stats.scheduled} мес.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Heatmap habit={habit} log={log} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      <HabitEditor open={editorOpen} habit={editing} onClose={() => setEditorOpen(false)} />
    </div>
  )
}
