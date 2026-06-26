import { useState } from 'react'
import clsx from 'clsx'
import TabPageHeader from '../ui/TabPageHeader'
import PageContainer from '../ui/PageContainer'
import HabitsView from '../progress/HabitsView'
import TimeStatsView from '../progress/TimeStatsView'
import SphereBalance from '../progress/SphereBalance'

const SEGMENTS = [
  { id: 'habits', label: 'Привычки' },
  { id: 'balance', label: 'Баланс' },
  { id: 'time', label: 'Время' },
]

export default function ProgressTab() {
  const [segment, setSegment] = useState('habits')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto pt-4 pb-24 sm:pt-6 md:pt-8 md:pb-8">
        <PageContainer size="wide">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabPageHeader eyebrow="Динамика" title="Прогресс" />

            <div
              className="flex gap-1 rounded-2xl border border-line bg-glass-strong p-1 shadow-(--shadow-card) sm:shrink-0"
              role="tablist"
              aria-label="Раздел прогресса"
            >
              {SEGMENTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={segment === s.id}
                  onClick={() => setSegment(s.id)}
                  className={clsx(
                    'flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition sm:flex-none',
                    segment === s.id
                      ? 'hm-grad text-white shadow-(--shadow-glow)'
                      : 'text-ink-muted hover:bg-sunken/60 hover:text-ink',
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {segment === 'habits' && <HabitsView />}
          {segment === 'balance' && <SphereBalance />}
          {segment === 'time' && <TimeStatsView />}
        </PageContainer>
      </div>
    </div>
  )
}
