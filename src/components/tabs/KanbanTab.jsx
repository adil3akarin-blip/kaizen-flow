import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Kanban } from 'lucide-react'
import { useCardsStore } from '../../store/useCardsStore'
import { useAppStore, TABS } from '../../store/useAppStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { selectKanbanCards } from '../../lib/cardSelectors'
import { selectNextWeekCount } from '../../lib/flowEmptyState'
import { safeGetItem, safeRemoveItem } from '../../lib/persistStorage'
import TabPageHeader from '../ui/TabPageHeader'
import PageContainer from '../ui/PageContainer'
import EmptyState from '../ui/EmptyState'
import KanbanBoard from '../kanban/KanbanBoard'
import ElephantsFlow from '../kanban/ElephantsFlow'
import YearBoard from '../kanban/YearBoard'

const VIEW_OPTIONS = [
  { id: 'day', label: 'День' },
  { id: 'week', label: 'Неделя' },
  { id: 'museum', label: 'Музей' },
]

export default function KanbanTab() {
  const cards = useCardsStore((s) => s.cards)
  const elephantsPending = useAppStore((s) => s.elephantsPending)
  const elephantsPrefEnabled = useSettingsStore((s) => s.notificationPrefs.elephants)
  const setTab = useAppStore((s) => s.setTab)

  const [view, setView] = useState('day')
  const [showElephants, setShowElephants] = useState(() => {
    if (safeGetItem('kaizenflow-open-elephants') === '1') {
      safeRemoveItem('kaizenflow-open-elephants')
      return true
    }
    return false
  })

  const kanbanCards = useMemo(() => selectKanbanCards(cards), [cards])
  const nextWeekCount = useMemo(() => selectNextWeekCount(cards), [cards])

  if (showElephants) {
    return (
      <ElephantsFlow
        onClose={() => setShowElephants(false)}
        onOpenYear={() => { setShowElephants(false); setView('museum') }}
      />
    )
  }

  if (view === 'museum') {
    return <YearBoard onBack={() => setView('day')} />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto py-4 sm:py-6 md:py-8">
        <PageContainer size="kanban" className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <TabPageHeader
              eyebrow="Карта года"
              title="Канбан"
              subtitle="Сам вытягиваешь следующее дело"
            />

            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
              <div
                className="inline-flex gap-1 rounded-xl border border-line bg-glass-strong p-1"
                role="tablist"
                aria-label="Вид канбана"
              >
                {VIEW_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={view === option.id}
                    onClick={() => setView(option.id)}
                    className={clsx(
                      'rounded-lg px-3 py-1.5 text-sm font-semibold transition',
                      view === option.id
                        ? 'hm-grad text-white shadow-(--shadow-glow)'
                        : 'text-ink-muted hover:text-ink',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {elephantsPending && elephantsPrefEnabled && (
                <button
                  type="button"
                  onClick={() => setShowElephants(true)}
                  className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-accent hover:text-white"
                >
                  Итоги месяца
                </button>
              )}
            </div>
          </div>

          {view === 'day' && nextWeekCount > 0 && (
            <button
              type="button"
              onClick={() => setView('week')}
              className="mt-4 w-full rounded-xl border border-dashed border-accent/30 bg-accent/[0.04] px-4 py-3 text-left text-sm text-ink-muted transition-colors hover:bg-accent/[0.08]"
            >
              {nextWeekCount === 1
                ? '1 дело отложено на след. неделю'
                : nextWeekCount < 5
                  ? `${nextWeekCount} дела отложено на след. неделю`
                  : `${nextWeekCount} дел отложено на след. неделю`}
              {' — '}
              <span className="text-accent">смотреть в виде «Неделя»</span>
            </button>
          )}

          <div className="mt-6 min-h-0 flex-1 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] md:overflow-x-visible">
            {kanbanCards.length > 0 ? (
              <KanbanBoard view={view} />
            ) : (
              <EmptyState
                icon={Kanban}
                title="Канбан появится после разбора"
                description="Сначала разбери мысли во вкладке «Разбор» — потом они попадут в колонки"
                action={{ label: 'Перейти в Разбор', onClick: () => setTab(TABS.review) }}
              />
            )}
          </div>
        </PageContainer>
      </div>
    </div>
  )
}
