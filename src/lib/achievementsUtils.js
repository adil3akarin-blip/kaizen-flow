// Builds the "Музей побед" data from real cards + saved monthly elephants.

export const MONTH_LABELS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

export function monthKey(year, month) {
  return `${year}-${month}`
}

// Completion timestamp for a done card, with fallbacks for older data.
function completedTime(card) {
  return card.completedAt ?? card.createdAt ?? null
}

// One entry per calendar month of `year`, newest activity surfaced via counts.
export function selectYearAchievements(cards, elephants, year = new Date().getFullYear()) {
  const doneByMonth = Array.from({ length: 12 }, () => [])

  for (const card of cards) {
    if (card.status !== 'done') continue
    const ts = completedTime(card)
    if (ts == null) continue
    const d = new Date(ts)
    if (d.getFullYear() !== year) continue
    doneByMonth[d.getMonth()].push(card)
  }

  return MONTH_LABELS.map((label, i) => {
    const month = i + 1
    const done = doneByMonth[i].sort(
      (a, b) => (completedTime(b) ?? 0) - (completedTime(a) ?? 0),
    )
    return {
      month,
      label,
      elephant: elephants?.[monthKey(year, month)] ?? null,
      doneCount: done.length,
      done,
      isCurrent: month === new Date().getMonth() + 1 && year === new Date().getFullYear(),
    }
  })
}
