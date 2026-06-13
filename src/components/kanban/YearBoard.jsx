import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { ArrowLeft, Trophy } from 'lucide-react'
import { useCardsStore } from '../../store/useCardsStore'
import { useAchievementsStore } from '../../store/useAchievementsStore'
import { selectYearAchievements } from '../../lib/achievementsUtils'
import StructuredCard from '../cards/StructuredCard'

export default function YearBoard({ onBack }) {
  const cards = useCardsStore((s) => s.cards)
  const elephants = useAchievementsStore((s) => s.elephants)
  const [selectedMonth, setSelectedMonth] = useState(null)

  const year = new Date().getFullYear()
  const months = useMemo(
    () => selectYearAchievements(cards, elephants, year),
    [cards, elephants, year],
  )

  const totalWins = useMemo(
    () => months.reduce((sum, m) => sum + m.doneCount, 0),
    [months],
  )

  const monthData = selectedMonth
    ? months.find((m) => m.month === selectedMonth)
    : null

  // ─── Month detail ───────────────────────────────────────────────
  if (monthData) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 px-4 py-4 sm:px-6 md:px-8">
          <button
            type="button"
            onClick={() => setSelectedMonth(null)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Музей побед
          </button>
          <h3 className="hm-title m-0 mt-3 text-2xl">
            {monthData.label}{' '}
            <span className="text-ink-faint">{year}</span>
          </h3>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-6 md:px-8">
          <div className="mx-auto w-full max-w-[640px]">
            {monthData.elephant && (
              <div className="hm-glass hm-accent-line relative mb-6 overflow-hidden rounded-2xl px-5 py-4">
                <p className="hm-eyebrow m-0">Слон месяца</p>
                <p className="m-0 mt-2 text-lg font-semibold leading-snug text-ink">
                  🐘 {monthData.elephant}
                </p>
              </div>
            )}

            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Сделано за месяц{' '}
              <span className="text-ink-muted">{monthData.doneCount}</span>
            </p>

            {monthData.done.length > 0 ? (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {monthData.done.map((card) => (
                  <li key={card.id}>
                    <StructuredCard card={card} compact />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-line-strong px-5 py-8 text-center text-sm text-ink-faint">
                Пока нет завершённых дел за этот месяц
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── Year grid ──────────────────────────────────────────────────
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 px-4 py-4 sm:px-6 md:px-8">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Канбан
          </button>
        )}
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="hm-eyebrow mb-2">За год</p>
            <h3 className="hm-title m-0 text-[28px]">Музей побед</h3>
            <p className="mt-1.5 text-sm text-ink-muted">
              Что уже получилось — по месяцам
            </p>
          </div>
          <div className="hm-glass hidden shrink-0 items-center gap-2.5 rounded-2xl px-4 py-2.5 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Trophy className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="leading-tight">
              <p className="m-0 text-lg font-bold tabular-nums text-ink">{totalWins}</p>
              <p className="m-0 text-[11px] text-ink-faint">за {year}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-6 md:px-8">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
          {months.map((month) => {
            const empty = month.doneCount === 0 && !month.elephant
            return (
              <button
                key={month.month}
                type="button"
                disabled={empty}
                onClick={() => setSelectedMonth(month.month)}
                className={clsx(
                  'flex min-h-[104px] flex-col rounded-2xl border px-4 py-3.5 text-left transition',
                  month.elephant
                    ? 'border-accent/30 bg-accent-soft hover:-translate-y-0.5 hover:shadow-(--shadow-card)'
                    : empty
                      ? 'cursor-default border-line/60 bg-surface/50'
                      : 'hm-glass hover:-translate-y-0.5 hover:shadow-(--shadow-float)',
                  month.isCurrent && 'ring-2 ring-accent/40',
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="m-0 text-sm font-semibold text-ink">{month.label}</p>
                  {month.doneCount > 0 && (
                    <span
                      className={clsx(
                        'rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
                        month.elephant
                          ? 'bg-accent/15 text-accent'
                          : 'bg-sunken text-ink-muted',
                      )}
                    >
                      {month.doneCount}
                    </span>
                  )}
                </div>

                {month.elephant ? (
                  <p className="mt-2 line-clamp-3 text-xs leading-snug text-ink">
                    🐘 {month.elephant}
                  </p>
                ) : (
                  <p className="mt-auto pt-2 text-xs text-ink-faint">
                    {month.doneCount > 0 ? 'сделано' : 'Пусто'}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
