import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Kanban } from 'lucide-react'
import { useCardsStore } from '../../store/useCardsStore'
import { useAppStore } from '../../store/useAppStore'
import { selectKanbanCards } from '../../lib/cardSelectors'
import TabPageHeader from '../ui/TabPageHeader'
import EmptyState from '../ui/EmptyState'
import KanbanBoard from '../kanban/KanbanBoard'
import ElephantsFlow from '../kanban/ElephantsFlow'
import YearBoard from '../kanban/YearBoard'

export default function KanbanTab() {
  const cards = useCardsStore((s) => s.cards)
  const elephantsPending = useAppStore((s) => s.elephantsPending)

  const [view, setView] = useState('day')
  const [showElephants, setShowElephants] = useState(false)
  const [showYear, setShowYear] = useState(false)

  const kanbanCards = useMemo(() => selectKanbanCards(cards), [cards])

  if (showYear) {
    return <YearBoard onBack={() => setShowYear(false)} />
  }

  if (showElephants) {
    return (
      <ElephantsFlow
        onClose={() => setShowElephants(false)}
        onOpenYear={() => {
          setShowElephants(false)
          setShowYear(true)
        }}
      />
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-cream-dark/60 bg-white/40 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <TabPageHeader
            title="Канбан"
            subtitle="Сам вытягиваешь следующее дело"
          />
          <div className="flex shrink-0 flex-col items-end gap-2">
            {elephantsPending && (
              <button
                type="button"
                onClick={() => setShowElephants(true)}
                className="rounded-full bg-warm-accent/15 px-3 py-1 text-xs font-medium text-warm-accent"
              >
                Слоны →
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowYear(true)}
              className="text-xs text-warm-muted hover:text-warm-text"
            >
              Год
            </button>
          </div>
        </div>

        <div className="mt-4 inline-flex rounded-lg border border-cream-dark/60 bg-white p-1">
          <button
            type="button"
            onClick={() => setView('day')}
            className={clsx(
              'rounded-md px-4 py-1.5 text-sm transition-colors',
              view === 'day'
                ? 'bg-warm-accent text-white'
                : 'text-warm-muted hover:text-warm-text',
            )}
          >
            День
          </button>
          <button
            type="button"
            onClick={() => setView('week')}
            className={clsx(
              'rounded-md px-4 py-1.5 text-sm transition-colors',
              view === 'week'
                ? 'bg-warm-accent text-white'
                : 'text-warm-muted hover:text-warm-text',
            )}
          >
            Неделя
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 py-4">
        {kanbanCards.length > 0 ? (
          <KanbanBoard view={view} />
        ) : (
          <EmptyState
            icon={Kanban}
            title="Канбан появится после разбора"
            description="Сначала разбери мысли во вкладке «Разбор» — потом они попадут в колонки"
          />
        )}
      </div>
    </div>
  )
}
