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

function QueueChips({ card }) {
  const chips = []
  if (card.wantMust) chips.push(WANT_LABELS[card.wantMust])
  if (card.energyCost && card.energyCost !== 'medium') {
    chips.push(ENERGY_LABELS[card.energyCost])
  }
  if (card.timeInvestment) chips.push(card.timeInvestment)

  if (chips.length === 0) return null

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {chips.map((label) => (
        <span
          key={label}
          className="rounded-full bg-cream px-2 py-0.5 text-xs text-warm-muted"
        >
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

  useEffect(() => {
    onGateOpenChange?.(gateOpen || guardOpen)
  }, [gateOpen, guardOpen, onGateOpenChange])

  const executePull = (id) => {
    const result = pullToWip(id)
    if (!result.ok && result.reason === 'wip-full') {
      setPendingPullId(id)
      setGateOpen(true)
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
  }

  const handleGuardPullAlternative = (id) => {
    closeGuard()
    executePull(id)
  }

  const handleGuardForcePull = (id) => {
    closeGuard()
    executePull(id)
  }

  const handleGateComplete = () => {
    const wip = selectWipCard(cards)
    if (wip?.energyCost === 'heavy') {
      recordHeavyCompletion(wip.id)
    }
    completeWip()
    setGateOpen(false)
    if (pendingPullId) {
      executePull(pendingPullId)
      setPendingPullId(null)
    }
  }

  const handleGateRelease = () => {
    releaseWip()
    setGateOpen(false)
    if (pendingPullId) {
      executePull(pendingPullId)
      setPendingPullId(null)
    }
  }

  if (visibleQueue.length === 0) {
    return null
  }

  return (
    <section>
      <SectionLabel suffix={visibleQueue.length}>Очередь</SectionLabel>

      <PanelList className="mt-3">
        {visibleQueue.map((card, index) => {
          const dimmed = isCardEnergyDimmed(card, energyPreset)
          const isLast = index === visibleQueue.length - 1

          return (
            <div key={card.id} className="relative">
              <PanelRow
                onClick={() => attemptPull(card)}
                isLast={isLast}
                className={clsx('pr-10', dimmed && 'opacity-45')}
              >
                <div className="min-w-0 flex-1">
                  <p className="m-0 break-words text-sm leading-snug text-warm-text">
                    {card.text}
                  </p>
                  <QueueChips card={card} />
                </div>
              </PanelRow>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditCardId(card.id)
                }}
                aria-label="Ещё"
                className="absolute right-3 top-3.5 rounded-lg p-1.5 text-warm-muted hover:bg-cream-dark"
              >
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          )
        })}
      </PanelList>

      <CardEditSheet
        card={editCard}
        open={Boolean(editCard)}
        onClose={() => setEditCardId(null)}
      />

      <WipGateDialog
        open={gateOpen}
        onComplete={handleGateComplete}
        onRelease={handleGateRelease}
        onCancel={() => {
          setGateOpen(false)
          setPendingPullId(null)
        }}
      />

      <EnergyGuardDialog
        open={guardOpen}
        card={guardCard}
        alternatives={guardAlternatives}
        onPullAlternative={handleGuardPullAlternative}
        onForcePull={handleGuardForcePull}
        onCancel={closeGuard}
      />
    </section>
  )
}
