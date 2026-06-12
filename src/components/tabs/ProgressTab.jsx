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

          <div className="mt-6 flex rounded-xl bg-sunken p-1">
            {SEGMENTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSegment(s.id)}
                className={clsx(
                  'flex-1 rounded-lg py-1.5 text-sm font-medium transition',
                  segment === s.id
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink',
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
