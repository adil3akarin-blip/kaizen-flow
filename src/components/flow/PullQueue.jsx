import { useEffect, useMemo, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import clsx from 'clsx'
import { useCardsStore } from '../../store/useCardsStore'
import { useEnergyStore } from '../../store/useEnergyStore'
import { selectWipCard } from '../../lib/cardSelectors'
import { selectOrderedPullQueue } from '../../lib/kanbanOrderUtils'
import {
 findLightAlternatives,
 isCardEnergyDimmed,
} from '../../lib/energyUtils'
import { shouldShowDepletedHeavyDialog } from '../../lib/willpowerGuard'
import CardEditSheet from '../cards/CardEditSheet'
import SectionLabel from '../ui/SectionLabel'
import { PanelList, PanelRow } from '../ui/PanelList'
import WipGateDialog from './WipGateDialog'
import EnergyGuardDialog from './EnergyGuardDialog'

const WANT_LABELS = {
 want: 'Хочу',
 must: 'Должен',
 unknown: 'Не знаю',
}

const ENERGY_LABELS = {
 light: 'Лёгкое',
 medium: 'Среднее',
 heavy: 'Тяжёлое',
}

const ENERGY_CHIP_COLORS = {
 light: 'bg-success-soft text-success',
 medium: 'bg-sunken text-ink-muted',
 heavy: 'bg-warn-soft text-warn',
}

function EnergyChip({ energyCost }) {
 if (!energyCost) return null
 const label = ENERGY_LABELS[energyCost]
 const colorClass = ENERGY_CHIP_COLORS[energyCost] ?? 'bg-sunken text-ink-muted'
 return (
 <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
 ⚡ {label}
 </span>
 )
}

function QueueChips({ card }) {
 const chips = []
 if (card.wantMust) chips.push({ key: 'want', label: WANT_LABELS[card.wantMust], color: 'bg-sunken text-ink-muted' })
 if (card.timeInvestment) chips.push({ key: 'time', label: card.timeInvestment, color: 'bg-sunken text-ink-muted' })

 if (chips.length === 0 && !card.energyCost) return null

 return (
 <div className="mt-1.5 flex flex-wrap gap-1">
 <EnergyChip energyCost={card.energyCost} />
 {chips.map(({ key, label, color }) => (
 <span key={key} className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
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
 const energyPreset = useEnergyStore((s) => s.preset)
 const recordHeavyCompletion = useEnergyStore((s) => s.recordHeavyCompletion)

 const [editCardId, setEditCardId] = useState(null)
 const [gateOpen, setGateOpen] = useState(false)
 const [pendingPullId, setPendingPullId] = useState(null)
 const [guardOpen, setGuardOpen] = useState(false)
 const [guardCard, setGuardCard] = useState(null)

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

 const guardAlternatives = useMemo(
 () => (guardCard ? findLightAlternatives(pullQueue, guardCard.id) : []),
 [guardCard, pullQueue],
 )

 const editCard = editCardId
 ? cards.find((c) => c.id === editCardId)
 : null

 const liveGuardCard = guardCard
 ? cards.find((c) => c.id === guardCard.id) ?? null
 : null

 const wipCard = selectWipCard(cards)
 const gateActive = gateOpen && Boolean(wipCard)
 const guardActive = guardOpen && Boolean(liveGuardCard)

 useEffect(() => {
 onGateOpenChange?.(gateActive || guardActive)
 }, [gateActive, guardActive, onGateOpenChange])

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
 const card = useCardsStore.getState().cards.find((c) => c.id === id)
 if (!card || card.status !== 'filtered') {
 setPendingPullId(null)
 return
 }

 if (shouldShowDepletedHeavyDialog(energyPreset, card)) {
 setGuardCard(card)
 setGuardOpen(true)
 return
 }

 if (executePull(id)) {
 setPendingPullId(null)
 }
 }

 const attemptPull = (card) => {
 if (shouldShowDepletedHeavyDialog(energyPreset, card)) {
 setGuardCard(card)
 setGuardOpen(true)
 return
 }
 executePull(card.id)
 }

 const closeGuard = () => {
 setGuardOpen(false)
 setGuardCard(null)
 setPendingPullId(null)
 }

 const handleGuardPullAlternative = (id) => {
 setGuardOpen(false)
 setGuardCard(null)
 setPendingPullId(null)
 executePull(id)
 }

 const handleGuardForcePull = (id) => {
 setGuardOpen(false)
 setGuardCard(null)
 setPendingPullId(null)
 executePull(id)
 }

 const handleGateComplete = () => {
 const wip = selectWipCard(useCardsStore.getState().cards)
 if (wip?.energyCost === 'heavy') {
 recordHeavyCompletion(wip.id)
 }
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
 <section>
 <SectionLabel suffix={visibleQueue.length}>Очередь</SectionLabel>

 <div className="mt-3 flex flex-col gap-2">
 {visibleQueue.map((card) => {
 const dimmed = isCardEnergyDimmed(card, energyPreset)

 return (
 <div
 key={card.id}
 className={clsx(
 'group relative flex items-start gap-3 rounded-2xl border border-line/60 bg-surface px-4 py-3.5 shadow-(--shadow-card) transition',
 dimmed ? 'opacity-50' : 'hover:border-line-strong cursor-pointer',
 )}
 onClick={() => !dimmed && attemptPull(card)}
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
 )
 })}
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

 <EnergyGuardDialog
 open={guardActive}
 card={liveGuardCard}
 alternatives={guardAlternatives}
 onPullAlternative={handleGuardPullAlternative}
 onForcePull={handleGuardForcePull}
 onCancel={closeGuard}
 />
 </section>
 )
}
