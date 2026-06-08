import { useState } from 'react'
import clsx from 'clsx'
import { mockMonthAchievements, mockYearMonths } from '../../data/mockYearBoard'

export default function YearBoard({ onBack }) {
  const [selectedMonth, setSelectedMonth] = useState(null)

  const monthData = selectedMonth
    ? mockYearMonths.find((m) => m.month === selectedMonth)
    : null
  const achievements = selectedMonth
    ? mockMonthAchievements[selectedMonth] || []
    : []

  if (selectedMonth && monthData) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-cream-dark/60 bg-white/40 px-4 py-4 sm:px-6 md:px-8">
          <button
            type="button"
            onClick={() => setSelectedMonth(null)}
            className="text-sm text-warm-muted hover:text-warm-text"
          >
            ← Музей побед
          </button>
          <h3 className="m-0 mt-2 font-serif text-xl font-medium text-warm-text">
            {monthData.label}
          </h3>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
          {monthData.elephant && (
            <div className="mb-6 rounded-2xl border border-warm-accent/20 bg-warm-accent/5 px-5 py-4">
              <p className="m-0 text-xs font-medium text-warm-accent">
                Слон месяца
              </p>
              <p className="mt-1 font-serif text-base text-warm-text">
                {monthData.elephant}
              </p>
            </div>
          )}

          {achievements.length > 0 ? (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {achievements.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-cream-dark/50 bg-white px-4 py-3 text-sm text-warm-text shadow-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-warm-muted">
              Пока нет записей за этот месяц
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-cream-dark/60 bg-white/40 px-4 py-4 sm:px-6 md:px-8">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-warm-muted hover:text-warm-text"
          >
            ← Канбан
          </button>
        )}
        <h3 className="m-0 mt-2 text-xl font-semibold tracking-tight text-warm-text">
          Музей побед
        </h3>
        <p className="mt-1 text-sm text-warm-muted">
          Что уже получилось — по месяцам
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto px-4 py-4 sm:gap-3 sm:px-6 sm:py-6 md:grid-cols-3 md:px-8">
        {mockYearMonths.map((month) => (
          <button
            key={month.month}
            type="button"
            onClick={() => setSelectedMonth(month.month)}
            className={clsx(
              'rounded-2xl border px-4 py-4 text-left transition-colors hover:bg-white',
              month.elephant
                ? 'border-warm-accent/25 bg-warm-accent/5'
                : 'border-cream-dark/50 bg-white/60',
            )}
          >
            <p className="m-0 font-serif text-sm font-medium text-warm-text">
              {month.label}
            </p>
            {month.elephant ? (
              <p className="mt-2 line-clamp-2 text-xs text-warm-muted">
                🐘 {month.elephant}
              </p>
            ) : (
              <p className="mt-2 text-xs text-warm-muted">
                {month.doneCount > 0
                  ? `${month.doneCount} сделано`
                  : 'Пусто'}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
