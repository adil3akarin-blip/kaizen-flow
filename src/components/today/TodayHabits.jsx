import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Check, Plus } from 'lucide-react'
import { selectActiveHabits, useHabitsStore } from '../../store/useHabitsStore'
import { useAppStore, TABS } from '../../store/useAppStore'
import { computeStreak, isDoneOn, isDueToday } from '../../lib/habitUtils'
import { localDateKey } from '../../lib/timerUtils'
import SectionLabel from '../ui/SectionLabel'

export default function TodayHabits() {
  const habits = useHabitsStore((s) => s.habits)
  const log = useHabitsStore((s) => s.log)
  const toggleHabitDone = useHabitsStore((s) => s.toggleHabitDone)
  const setTab = useAppStore((s) => s.setTab)

  const [todayKey] = useState(() => localDateKey(Date.now()))
  const active = useMemo(
    () => selectActiveHabits({ habits }),
    [habits],
  )
  const due = useMemo(
    () => active.filter((h) => isDueToday(h, log)),
    [active, log],
  )

  const doneCount = due.filter((h) => isDoneOn(log, h.id, todayKey)).length

  if (active.length === 0) {
    return (
      <section>
        <SectionLabel>Привычки</SectionLabel>
        <button
          type="button"
          onClick={() => setTab(TABS.progress)}
          className="mt-3 flex w-full items-center gap-2 rounded-2xl border-2 border-dashed border-line-strong px-4 py-4 text-left text-sm text-ink-muted transition hover:border-accent/40 hover:text-ink"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2} />
          Добавить первую привычку
        </button>
      </section>
    )
  }

  if (due.length === 0) {
    return (
      <section>
        <SectionLabel>Привычки сегодня</SectionLabel>
        <p className="mt-3 rounded-2xl border border-line/60 bg-surface px-4 py-3 text-sm text-ink-muted shadow-(--shadow-card)">
          На сегодня всё закрыто 🎉
        </p>
      </section>
    )
  }

  return (
    <section>
      <SectionLabel suffix={`${doneCount}/${due.length}`}>Привычки сегодня</SectionLabel>
      <div className="mt-3 flex flex-col gap-2">
        {due.map((habit) => {
          const done = isDoneOn(log, habit.id, todayKey)
          const streak = computeStreak(habit, log)
          return (
            <button
              key={habit.id}
              type="button"
              onClick={() => toggleHabitDone(habit.id)}
              className={clsx(
                'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left shadow-(--shadow-card) transition',
                done
                  ? 'border-success/30 bg-success-soft/50'
                  : 'border-line/60 bg-surface hover:border-line-strong',
              )}
            >
              <span
                className={clsx(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition',
                  done ? 'border-success bg-success text-white' : 'border-line-strong text-transparent',
                )}
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              <span className="text-base">{habit.icon}</span>
              <span
                className={clsx(
                  'min-w-0 flex-1 truncate text-sm',
                  done ? 'text-ink-muted line-through' : 'text-ink',
                )}
              >
                {habit.title}
              </span>
              {streak > 0 && (
                <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 text-xs font-medium text-ink-muted">
                  🔥 {streak}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
