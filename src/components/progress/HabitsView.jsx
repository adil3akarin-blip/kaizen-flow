import { useState } from 'react'
import clsx from 'clsx'
import { Check, Plus } from 'lucide-react'
import { selectActiveHabits, useHabitsStore } from '../../store/useHabitsStore'
import {
  computeStreak,
  isDoneOn,
  isScheduledOn,
  scheduleLabel,
} from '../../lib/habitUtils'
import {
  buildHeatmapColumns,
  buildMonthLabels,
  buildYearColumns,
} from '../../lib/heatmapUtils'
import { useTodayKey } from '../../lib/useTodayKey'
import HabitEditor from './HabitEditor'
import ContributionHeatmap from './ContributionHeatmap'

function HabitCard({ habit, log, now, todayKey, onToggleToday, onEdit }) {
  const thisYear = new Date(now).getFullYear()
  const [range, setRange] = useState('365')

  const ranges = [
    { id: '365', label: '365д' },
    { id: String(thisYear), label: String(thisYear) },
    { id: String(thisYear - 1), label: String(thisYear - 1) },
  ]

  const columns =
    range === '365'
      ? buildHeatmapColumns(now, 53)
      : buildYearColumns(Number(range), now)
  const monthLabels = buildMonthLabels(columns)

  const streak = computeStreak(habit, log)
  const total = log[habit.id]?.length ?? 0
  const doneToday = isDoneOn(log, habit.id, todayKey)

  const cellFor = (cell) => {
    if (cell.future || cell.outside) return { className: 'bg-transparent' }
    if (isDoneOn(log, habit.id, cell.key)) {
      return { className: '', style: { backgroundColor: habit.color }, title: cell.key }
    }
    const scheduled = isScheduledOn(habit, cell.date)
    return {
      className: scheduled
        ? 'bg-sunken ring-1 ring-inset ring-line-strong/30'
        : 'bg-line/20',
      title: cell.key,
    }
  }

  return (
    <section className="hm-glass rounded-3xl p-5">
      <header className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggleToday}
          aria-pressed={doneToday}
          aria-label={doneToday ? 'Снять отметку за сегодня' : 'Отметить за сегодня'}
          title={
            doneToday
              ? 'Выполнено сегодня — нажми, чтобы снять'
              : 'Отметить выполненной сегодня'
          }
          className={clsx(
            'group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl transition',
            doneToday ? 'text-white' : 'hover:brightness-95',
          )}
          style={{
            backgroundColor: doneToday ? habit.color : `${habit.color}22`,
          }}
        >
          {doneToday ? (
            <Check className="h-5 w-5" strokeWidth={3} />
          ) : (
            <>
              <span className="transition group-hover:opacity-0">{habit.icon}</span>
              <Check
                className="absolute h-5 w-5 opacity-0 transition group-hover:opacity-100"
                strokeWidth={3}
                style={{ color: habit.color }}
              />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => onEdit(habit)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="m-0 truncate text-[15px] font-semibold text-ink">{habit.title}</p>
          <p className="m-0 text-xs text-ink-muted">{scheduleLabel(habit)}</p>
        </button>

        <div className="flex shrink-0 items-center gap-3">
          {streak > 0 && (
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums"
              style={{ backgroundColor: `${habit.color}1f`, color: habit.color }}
            >
              🔥 {streak}
            </span>
          )}
          <div className="text-right leading-tight">
            <p className="m-0 text-lg font-bold tabular-nums text-ink">{total}</p>
            <p className="m-0 text-[11px] text-ink-faint">дней</p>
          </div>
        </div>
      </header>

      <div className="mt-4 flex items-center gap-1">
        {ranges.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className={clsx(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              range === r.id
                ? 'bg-sunken text-ink'
                : 'text-ink-faint hover:text-ink-muted',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <ContributionHeatmap
          columns={columns}
          monthLabels={monthLabels}
          cellFor={cellFor}
          legend={
            <>
              <span>Не вып.</span>
              <span className="h-2.5 w-2.5 rounded-[3px] bg-sunken ring-1 ring-inset ring-line-strong/30" />
              <span
                className="h-2.5 w-2.5 rounded-[3px]"
                style={{ backgroundColor: habit.color }}
              />
              <span>Вып.</span>
            </>
          }
        />
      </div>
    </section>
  )
}

export default function HabitsView() {
  const habits = useHabitsStore((s) => s.habits)
  const log = useHabitsStore((s) => s.log)
  const toggleHabitDone = useHabitsStore((s) => s.toggleHabitDone)

  // Live "today" so a card left open overnight marks the right day.
  const todayKey = useTodayKey()
  const [now] = useState(() => Date.now())
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const active = selectActiveHabits({ habits })

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
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-sm font-semibold text-ink">
          Твои привычки
          {active.length > 0 && (
            <span className="ml-1.5 font-normal text-ink-muted">{active.length}</span>
          )}
        </p>
        <button
          type="button"
          onClick={openNew}
          className="hm-grad flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-(--shadow-glow) transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          Новая привычка
        </button>
      </div>

      {active.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-faint">
          Пока нет привычек. Добавь первую — и она появится в «Сегодня».
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {active.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              log={log}
              now={now}
              todayKey={todayKey}
              onToggleToday={() => toggleHabitDone(habit.id, todayKey)}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      <HabitEditor open={editorOpen} habit={editing} onClose={() => setEditorOpen(false)} />
    </div>
  )
}
