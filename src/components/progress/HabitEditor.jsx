import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { useHabitsStore } from '../../store/useHabitsStore'
import {
  HABIT_COLORS,
  HABIT_ICONS,
  SCHEDULE_TYPES,
  WEEKDAY_LABELS,
} from '../../lib/habitUtils'

const TYPE_SEGMENTS = [
  { id: SCHEDULE_TYPES.daily, label: 'Каждый день' },
  { id: SCHEDULE_TYPES.weekly, label: 'В неделю' },
  { id: SCHEDULE_TYPES.weekdays, label: 'Дни' },
]

export default function HabitEditor({ open, habit, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <HabitEditorContent key={habit?.id ?? 'new'} habit={habit} onClose={onClose} />
      )}
    </AnimatePresence>
  )
}

function HabitEditorContent({ habit, onClose }) {
  const addHabit = useHabitsStore((s) => s.addHabit)
  const updateHabit = useHabitsStore((s) => s.updateHabit)
  const deleteHabit = useHabitsStore((s) => s.deleteHabit)

  const isEdit = Boolean(habit)
  const [title, setTitle] = useState(habit?.title ?? '')
  const [icon, setIcon] = useState(habit?.icon ?? HABIT_ICONS[0])
  const [color, setColor] = useState(habit?.color ?? HABIT_COLORS[0])
  const [type, setType] = useState(habit?.schedule?.type ?? SCHEDULE_TYPES.daily)
  const [timesPerWeek, setTimesPerWeek] = useState(habit?.schedule?.timesPerWeek ?? 3)
  const [weekdays, setWeekdays] = useState(habit?.schedule?.weekdays ?? [0, 1, 2, 3, 4])

  const buildSchedule = () => {
    if (type === SCHEDULE_TYPES.weekly) return { type, timesPerWeek }
    if (type === SCHEDULE_TYPES.weekdays) return { type, weekdays }
    return { type: SCHEDULE_TYPES.daily }
  }

  const handleSave = () => {
    if (!title.trim()) return
    const payload = { title, icon, color, schedule: buildSchedule() }
    if (isEdit) updateHabit(habit.id, payload)
    else addHabit(payload)
    onClose()
  }

  const handleDelete = () => {
    if (isEdit) deleteHabit(habit.id)
    onClose()
  }

  const toggleWeekday = (d) => {
    setWeekdays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-end justify-center md:items-center md:p-6"
    >
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-line/60 bg-white p-6 shadow-xl md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="m-0 text-lg font-semibold text-ink">
          {isEdit ? 'Привычка' : 'Новая привычка'}
        </h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название привычки"
          className="mt-4 w-full rounded-xl border border-line bg-canvas/30 px-4 py-3 text-[15px] text-ink outline-none focus:ring-2 focus:ring-accent/30"
          autoFocus
        />

        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-faint">Иконка</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {HABIT_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition',
                icon === ic ? 'border-accent bg-accent-soft' : 'border-line hover:bg-sunken',
              )}
            >
              {ic}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-faint">Цвет</p>
        <div className="mt-2 flex gap-2">
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Цвет ${c}`}
              className={clsx(
                'h-7 w-7 rounded-full transition',
                color === c ? 'ring-2 ring-offset-2 ring-ink/40' : '',
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-faint">Расписание</p>
        <div className="mt-2 flex rounded-xl bg-sunken p-1">
          {TYPE_SEGMENTS.map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setType(seg.id)}
              className={clsx(
                'flex-1 rounded-lg py-1.5 text-xs font-medium transition',
                type === seg.id ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
              )}
            >
              {seg.label}
            </button>
          ))}
        </div>

        {type === SCHEDULE_TYPES.weekly && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-line/60 px-4 py-2.5">
            <span className="text-sm text-ink">Раз в неделю</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTimesPerWeek((n) => Math.max(1, n - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-ink hover:bg-sunken"
              >
                −
              </button>
              <span className="w-4 text-center text-sm font-semibold tabular-nums text-ink">{timesPerWeek}</span>
              <button
                type="button"
                onClick={() => setTimesPerWeek((n) => Math.min(7, n + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-ink hover:bg-sunken"
              >
                +
              </button>
            </div>
          </div>
        )}

        {type === SCHEDULE_TYPES.weekdays && (
          <div className="mt-3 flex gap-1.5">
            {WEEKDAY_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleWeekday(i)}
                className={clsx(
                  'flex-1 rounded-lg border py-2 text-xs font-medium transition',
                  weekdays.includes(i)
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line text-ink-muted hover:bg-sunken',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="hm-grad rounded-xl py-2.5 text-sm font-bold text-white shadow-(--shadow-glow) transition disabled:opacity-40"
          >
            {isEdit ? 'Сохранить' : 'Создать'}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="py-2 text-sm text-danger transition hover:text-danger/70"
            >
              Удалить привычку
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
