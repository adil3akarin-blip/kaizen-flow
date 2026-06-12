import { localDateKey } from './timerUtils'

export const SCHEDULE_TYPES = {
  daily: 'daily',
  weekly: 'weekly',
  weekdays: 'weekdays',
}

// Mon=0 … Sun=6 ordering for the weekday picker.
export const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export const HABIT_COLORS = ['#E8833A', '#5B8DEF', '#3FB984', '#A878E0', '#E0566F', '#E0A93F']
export const HABIT_ICONS = ['💪', '📚', '🧘', '💧', '🏃', '✍️', '🌙', '🎯', '🍎', '🧹']

function jsDayToMonIndex(date) {
  return (date.getDay() + 6) % 7 // Mon=0 … Sun=6
}

function shiftDays(date, delta) {
  const d = new Date(date)
  d.setDate(d.getDate() + delta)
  return d
}

export function mondayOf(date) {
  return shiftDays(date, -jsDayToMonIndex(date))
}

// Is the habit eligible on this calendar day (ignoring completion)?
export function isScheduledOn(habit, date) {
  const s = habit.schedule
  if (!s || s.type === SCHEDULE_TYPES.daily) return true
  if (s.type === SCHEDULE_TYPES.weekdays) {
    return (s.weekdays ?? []).includes(jsDayToMonIndex(date))
  }
  // weekly: any day is eligible (flexible target)
  return true
}

function doneSet(log, habitId) {
  return new Set(log[habitId] ?? [])
}

export function isDoneOn(log, habitId, dateKey) {
  return (log[habitId] ?? []).includes(dateKey)
}

export function completionsInWeek(log, habitId, weekStartDate) {
  const done = doneSet(log, habitId)
  let count = 0
  for (let i = 0; i < 7; i++) {
    if (done.has(localDateKey(shiftDays(weekStartDate, i)))) count++
  }
  return count
}

// Habits to surface in "Today": scheduled today and not over their weekly cap.
export function isDueToday(habit, log, now = Date.now()) {
  const today = new Date(now)
  if (!isScheduledOn(habit, today)) return false
  if (habit.schedule?.type === SCHEDULE_TYPES.weekly) {
    const target = habit.schedule.timesPerWeek ?? 1
    const doneThisWeek = completionsInWeek(log, habit.id, mondayOf(today))
    const todayKey = localDateKey(now)
    // still due if target not yet met, or already done today (so it shows checked)
    return doneThisWeek < target || isDoneOn(log, habit.id, todayKey)
  }
  return true
}

export function computeStreak(habit, log, now = Date.now()) {
  const done = doneSet(log, habit.id)
  const today = new Date(now)

  if (habit.schedule?.type === SCHEDULE_TYPES.weekly) {
    const target = habit.schedule.timesPerWeek ?? 1
    let streak = 0
    let weekStart = mondayOf(today)
    // Current week only counts once it has met the target.
    if (completionsInWeek(log, habit.id, weekStart) < target) {
      weekStart = shiftDays(weekStart, -7)
    }
    while (completionsInWeek(log, habit.id, weekStart) >= target) {
      streak++
      weekStart = shiftDays(weekStart, -7)
    }
    return streak
  }

  // daily / weekdays: walk back over scheduled days.
  let streak = 0
  let cursor = new Date(today)
  // Don't penalize for "not done yet today" — start from the latest done-or-past day.
  if (isScheduledOn(habit, cursor) && !done.has(localDateKey(cursor))) {
    cursor = shiftDays(cursor, -1)
  }
  // Guard against runaway loops.
  for (let i = 0; i < 1000; i++) {
    if (!isScheduledOn(habit, cursor)) {
      cursor = shiftDays(cursor, -1)
      continue
    }
    if (done.has(localDateKey(cursor))) {
      streak++
      cursor = shiftDays(cursor, -1)
    } else {
      break
    }
  }
  return streak
}

export function scheduleLabel(habit) {
  const s = habit.schedule
  if (!s || s.type === SCHEDULE_TYPES.daily) return 'Каждый день'
  if (s.type === SCHEDULE_TYPES.weekly) {
    const n = s.timesPerWeek ?? 1
    return `${n}× в неделю`
  }
  const days = (s.weekdays ?? []).slice().sort((a, b) => a - b)
  if (days.length === 0) return 'Без расписания'
  if (days.length === 7) return 'Каждый день'
  return days.map((d) => WEEKDAY_LABELS[d]).join(', ')
}

// Last `count` days (oldest first) for the completion heatmap.
export function recentDays(habit, log, count = 35, now = Date.now()) {
  const done = doneSet(log, habit.id)
  const today = new Date(now)
  const out = []
  for (let i = count - 1; i >= 0; i--) {
    const date = shiftDays(today, -i)
    const key = localDateKey(date.getTime())
    out.push({
      key,
      done: done.has(key),
      scheduled: isScheduledOn(habit, date),
    })
  }
  return out
}
