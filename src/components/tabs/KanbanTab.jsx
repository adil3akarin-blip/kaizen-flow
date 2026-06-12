import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Kanban } from 'lucide-react'
import { useCardsStore } from '../../store/useCardsStore'
import { useAppStore } from '../../store/useAppStore'
import { selectKanbanCards } from '../../lib/cardSelectors'
import { selectNextWeekCount } from '../../lib/flowEmptyState'
import TabPageHeader from '../ui/TabPageHeader'
import PageContainer from '../ui/PageContainer'
import EmptyState from '../ui/EmptyState'
import KanbanBoard from '../kanban/KanbanBoard'
import ElephantsFlow from '../kanban/ElephantsFlow'
import YearBoard from '../kanban/YearBoard'

const VIEW_OPTIONS = [
 { id: 'day', label: 'День' },
 { id: 'week', label: 'Неделя' },
]

export default function KanbanTab() {
 const cards = useCardsStore((s) => s.cards)
 const elephantsPending = useAppStore((s) => s.elephantsPending)

 const [view, setView] = useState('day')
 const [showElephants, setShowElephants] = useState(false)
 const [showYear, setShowYear] = useState(false)

 const kanbanCards = useMemo(() => selectKanbanCards(cards), [cards])
 const nextWeekCount = useMemo(() => selectNextWeekCount(cards), [cards])

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
 <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
 <div className="min-h-0 flex-1 overflow-y-auto py-4 sm:py-6 md:py-8">
 <PageContainer size="kanban" className="flex min-h-0 flex-1 flex-col">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <TabPageHeader
 title="Канбан"
 subtitle="Сам вытягиваешь следующее дело"
 />

 <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
 <div
 className="inline-flex rounded-lg border border-line/50 bg-canvas/40 p-0.5"
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
 'rounded-md px-3 py-1.5 text-sm transition-colors',
 view === option.id
 ? 'bg-white font-medium text-ink shadow-sm'
 : 'text-ink-muted hover:text-ink',
 )}
 >
 {option.label}
 </button>
 ))}
 </div>

 <button
 type="button"
 onClick={() => setShowYear(true)}
 className="rounded-lg px-2.5 py-1.5 text-xs text-ink-muted transition-colors hover:bg-sunken/60 hover:text-ink"
 >
 Музей побед
 </button>

 {elephantsPending && (
 <button
 type="button"
 onClick={() => setShowElephants(true)}
 className="rounded-full bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent"
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
 />
 )}
 </div>
 </PageContainer>
 </div>
 </div>
 )
}
