import { localDateKey } from './timerUtils'

const MONTHS_SHORT = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
]

function jsDayToMon(date) {
  return (date.getDay() + 6) % 7 // Mon=0 … Sun=6
}

function shiftDays(date, delta) {
  const d = new Date(date)
  d.setDate(d.getDate() + delta)
  return d
}

function mondayOf(date) {
  return shiftDays(date, -jsDayToMon(date))
}

// Week columns (oldest→newest), each 7 cells {key, date, future}, ending on
// the week containing `endDate` (default: today).
export function buildHeatmapColumns(now, weeks, endDate) {
  const end = endDate ? new Date(endDate) : new Date(now)
  const todayKey = localDateKey(now)
  const start = shiftDays(mondayOf(end), -(weeks - 1) * 7)

  const cols = []
  for (let w = 0; w < weeks; w++) {
    const days = []
    for (let d = 0; d < 7; d++) {
      const date = shiftDays(start, w * 7 + d)
      const key = localDateKey(date.getTime())
      days.push({ key, date, future: key > todayKey })
    }
    cols.push(days)
  }
  return cols
}

// Columns spanning a calendar year (future days flagged; current year caps at today).
export function buildYearColumns(year, now) {
  const start = mondayOf(new Date(year, 0, 1))
  const lastMonday = mondayOf(new Date(year, 11, 31))
  const todayKey = localDateKey(now)
  const weeks = Math.round((lastMonday - start) / (7 * 86400000)) + 1

  const cols = []
  for (let w = 0; w < weeks; w++) {
    const days = []
    for (let d = 0; d < 7; d++) {
      const date = shiftDays(start, w * 7 + d)
      const key = localDateKey(date.getTime())
      days.push({
        key,
        date,
        future: key > todayKey,
        outside: date.getFullYear() !== year,
      })
    }
    cols.push(days)
  }
  return cols
}

// Month boundary labels: one entry the first time each month appears in the columns.
export function buildMonthLabels(columns) {
  const labels = []
  let prev = -1
  columns.forEach((col, i) => {
    const m = col[0].date.getMonth()
    if (m !== prev) {
      labels.push({ label: MONTHS_SHORT[m], col: i })
      prev = m
    }
  })
  return labels
}
