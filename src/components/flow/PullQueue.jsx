import { useEffect, useMemo, useState } from 'react'
import { ListTodo, MoreHorizontal } from 'lucide-react'
import { useCardsStore } from '../../store/useCardsStore'
import { selectWipCard } from '../../lib/cardSelectors'
import { selectOrderedPullQueue } from '../../lib/kanbanOrderUtils'
import CardEditSheet from '../cards/CardEditSheet'
import WidgetCard from '../ui/WidgetCard'
import WipGateDialog from './WipGateDialog'

const WANT_LABELS = {
 want: 'Хочу',
 must: 'Должен',
 unknown: 'Не знаю',
}

function QueueChips({ card }) {
 const chips = []
 if (card.wantMust) chips.push({ key: 'want', label: WANT_LABELS[card.wantMust] })
 if (card.timeInvestment) chips.push({ key: 'time', label: card.timeInvestment })

 if (chips.length === 0) return null

 return (
 <div className="mt-1.5 flex flex-wrap gap-1">
 {chips.map(({ key, label }) => (
 <span key={key} className="rounded-full bg-sunken px-2 py-0.5 text-xs font-medium text-ink-muted">
 {label}
 </span>
 ))}
 </div>
 )
}

export default function PullQueue({ excludeCardId, onGateOpenChange }) {
 const cards = useCardsStore((s) => s.cards)
 const columnOrder = useCardsStore((s) => s.columnOrder)
 const pullToWip = useCardsStore((s) => s.pullToWip)
 const completeWip = useCardsStore((s) => s.completeWip)
 const releaseWip = useCardsStore((s) => s.releaseWip)

 const [editCardId, setEditCardId] = useState(null)
 const [gateOpen, setGateOpen] = useState(false)
 const [pendingPullId, setPendingPullId] = useState(null)

 const pullQueue = useMemo(
 () => selectOrderedPullQueue(cards, columnOrder),
 [cards, columnOrder],
 )

 const visibleQueue = useMemo(
 () =>
 excludeCardId
 ? pullQueue.filter((card) => card.id !== excludeCardId)
 : pullQueue,
 [pullQueue, excludeCardId],
 )

 const editCard = editCardId
 ? cards.find((c) => c.id === editCardId)
 : null

 const wipCard = selectWipCard(cards)
 const gateActive = gateOpen && Boolean(wipCard)

 useEffect(() => {
 onGateOpenChange?.(gateActive)
 }, [gateActive, onGateOpenChange])

 const executePull = (id) => {
 const card = useCardsStore.getState().cards.find((c) => c.id === id)
 if (!card || card.status !== 'filtered') {
 setPendingPullId(null)
 return false
 }

 const result = pullToWip(id)
 if (!result.ok && result.reason === 'wip-full') {
 setPendingPullId(id)
 setGateOpen(true)
 return false
 }
 if (result.ok) {
 setGateOpen(false)
 setPendingPullId(null)
 }
 return result.ok
 }

 const flushPendingPull = (id) => {
 executePull(id)
 }

 const handleGateComplete = () => {
 completeWip()
 setGateOpen(false)
 if (pendingPullId) {
 flushPendingPull(pendingPullId)
 }
 }

 const handleGateRelease = () => {
 releaseWip()
 setGateOpen(false)
 if (pendingPullId) {
 flushPendingPull(pendingPullId)
 }
 }

 if (visibleQueue.length === 0) {
 return null
 }

 return (
 <WidgetCard icon={ListTodo} title="Очередь" meta={visibleQueue.length}>
 <div className="flex flex-col gap-2">
 {visibleQueue.map((card) => (
 <div
 key={card.id}
 className="group relative flex cursor-pointer items-start gap-3 rounded-2xl border border-line/60 bg-surface px-4 py-3.5 shadow-(--shadow-card) transition hover:border-line-strong"
 onClick={() => executePull(card.id)}
 >
 <div className="min-w-0 flex-1">
 <p className="m-0 text-sm leading-snug text-ink line-clamp-2">{card.text}</p>
 <QueueChips card={card} />
 </div>
 <button
 type="button"
 onClick={(e) => { e.stopPropagation(); setEditCardId(card.id) }}
 aria-label="Ещё"
 className="shrink-0 rounded-xl p-1.5 text-ink-faint hover:bg-sunken transition"
 >
 <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
 </button>
 </div>
 ))}
 </div>

 <CardEditSheet
 card={editCard}
 open={Boolean(editCard)}
 onClose={() => setEditCardId(null)}
 />

 <WipGateDialog
 open={gateActive}
 onComplete={handleGateComplete}
 onRelease={handleGateRelease}
 onCancel={() => {
 setGateOpen(false)
 setPendingPullId(null)
 }}
 />
 </WidgetCard>
 )
}
