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
import StructuredCard from '../cards/StructuredCard'
import CardEditSheet from '../cards/CardEditSheet'
import WipGateDialog from './WipGateDialog'
import EnergyGuardDialog from './EnergyGuardDialog'

export default function PullQueue({ highlighted = false, onGateOpenChange }) {
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

  if (pullQueue.length === 0) {
    return null
  }

  return (
    <section
      className={clsx(
        'rounded-2xl transition-colors',
        highlighted && 'bg-warm-accent/5 ring-1 ring-warm-accent/15',
      )}
    >
      <h3 className="m-0 px-1 font-serif text-base font-medium text-warm-text">
        Очередь
        <span className="ml-2 text-sm font-normal text-warm-muted">
          {pullQueue.length}
        </span>
      </h3>

      <ul className="mt-3 flex list-none flex-col gap-2 p-0">
        {pullQueue.map((card) => {
          const dimmed = isCardEnergyDimmed(card, energyPreset)

          return (
            <li key={card.id} className="relative">
              <button
                type="button"
                onClick={() => attemptPull(card)}
                className={clsx(
                  'w-full text-left transition-opacity',
                  dimmed && 'opacity-45',
                )}
              >
                <StructuredCard card={card} compact />
              </button>
              <button
                type="button"
                onClick={() => setEditCardId(card.id)}
                aria-label="Ещё"
                className="absolute right-2 top-2 rounded-lg p-1.5 text-warm-muted hover:bg-cream-dark"
              >
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </li>
          )
        })}
      </ul>

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
