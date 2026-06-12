import { useState } from 'react'
import clsx from 'clsx'
import TabPageHeader from '../ui/TabPageHeader'
import PageContainer from '../ui/PageContainer'
import HabitsView from '../progress/HabitsView'
import TimeStatsView from '../progress/TimeStatsView'

const SEGMENTS = [
  { id: 'habits', label: 'Привычки' },
  { id: 'time', label: 'Время' },
]

export default function ProgressTab() {
  const [segment, setSegment] = useState('habits')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto py-4 sm:py-6 md:py-8">
        <PageContainer>
          <TabPageHeader eyebrow="Динамика" title="Прогресс" />

          <div
            className="mt-6 flex gap-1 rounded-2xl border border-line bg-glass-strong p-1 shadow-(--shadow-card)"
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
                  'flex-1 rounded-xl py-2 text-sm font-semibold transition',
                  segment === s.id
                    ? 'hm-grad text-white shadow-(--shadow-glow)'
                    : 'text-ink-muted hover:bg-sunken/60 hover:text-ink',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {segment === 'habits' ? <HabitsView /> : <TimeStatsView />}
        </PageContainer>
      </div>
    </div>
  )
}
