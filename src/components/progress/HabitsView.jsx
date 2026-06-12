import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Plus } from 'lucide-react'
import { selectActiveHabits, useHabitsStore } from '../../store/useHabitsStore'
import { computeStreak, recentDays, scheduleLabel } from '../../lib/habitUtils'
import HabitEditor from './HabitEditor'

function Heatmap({ habit, log }) {
  const days = useMemo(() => recentDays(habit, log, 35), [habit, log])
  return (
    <div className="mt-2 grid grid-flow-col grid-rows-7 gap-1">
      {days.map((d) => (
        <span
          key={d.key}
          title={d.key}
          className={clsx(
            'h-2.5 w-2.5 rounded-sm',
            d.done ? '' : d.scheduled ? 'bg-sunken' : 'bg-line/40',
          )}
          style={d.done ? { backgroundColor: habit.color } : undefined}
        />
      ))}
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
            return (
              <button
                key={habit.id}
                type="button"
                onClick={() => openEdit(habit)}
                className="rounded-2xl border border-line/60 bg-surface px-4 py-3.5 text-left shadow-(--shadow-card) transition hover:border-line-strong"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{ backgroundColor: `${habit.color}22` }}
                  >
                    {habit.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-sm font-medium text-ink">{habit.title}</p>
                    <p className="m-0 text-xs text-ink-muted">{scheduleLabel(habit)}</p>
                  </div>
                  {streak > 0 && (
                    <span className="shrink-0 rounded-full bg-sunken px-2.5 py-1 text-xs font-semibold text-ink-muted">
                      🔥 {streak}
                    </span>
                  )}
                </div>
                <Heatmap habit={habit} log={log} />
              </button>
            )
          })}
        </div>
      )}

      <HabitEditor open={editorOpen} habit={editing} onClose={() => setEditorOpen(false)} />
    </div>
  )
}
