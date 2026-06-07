import { useMemo, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { useCardsStore } from '../../store/useCardsStore'
import { useEnergyStore } from '../../store/useEnergyStore'
import { selectWipCard } from '../../lib/cardSelectors'
import { selectOrderedPullQueue } from '../../lib/kanbanOrderUtils'
import { findLightAlternatives } from '../../lib/energyUtils'
import { shouldShowDepletedHeavyDialog } from '../../lib/willpowerGuard'
import StructuredCard from '../cards/StructuredCard'
import CardEditSheet from '../cards/CardEditSheet'
import EnergyGuardDialog from './EnergyGuardDialog'

export default function WipSlot({ suggestedCard, onPullSuggested, onGuardOpenChange }) {
  const cards = useCardsStore((s) => s.cards)
  const columnOrder = useCardsStore((s) => s.columnOrder)
  const completeWip = useCardsStore((s) => s.completeWip)
  const discardWip = useCardsStore((s) => s.discardWip)
  const recordHeavyCompletion = useEnergyStore((s) => s.recordHeavyCompletion)
  const energyPreset = useEnergyStore((s) => s.preset)

  const [editOpen, setEditOpen] = useState(false)
  const [guardOpen, setGuardOpen] = useState(false)

  const pullQueue = useMemo(
    () => selectOrderedPullQueue(cards, columnOrder),
    [cards, columnOrder],
  )

  const guardAlternatives = useMemo(
    () =>
      suggestedCard
        ? findLightAlternatives(pullQueue, suggestedCard.id)
        : [],
    [suggestedCard, pullQueue],
  )

  const wipCard = selectWipCard(cards)

  const handleComplete = () => {
    if (wipCard?.energyCost === 'heavy') {
      recordHeavyCompletion(wipCard.id)
    }
    completeWip()
  }

  const handleSuggestedPull = () => {
    if (!suggestedCard) return
    if (shouldShowDepletedHeavyDialog(energyPreset, suggestedCard)) {
      setGuardOpen(true)
      onGuardOpenChange?.(true)
      return
    }
    onPullSuggested(suggestedCard.id)
  }

  const closeGuard = () => {
    setGuardOpen(false)
    onGuardOpenChange?.(false)
  }

  if (!wipCard) {
    return (
      <>
        <section className="rounded-2xl border border-dashed border-cream-dark/80 bg-white/50 px-5 py-8">
          <p className="m-0 text-center font-serif text-base font-medium text-warm-text">
            Одно дело в единицу времени
          </p>
          {suggestedCard && (
            <button
              type="button"
              onClick={handleSuggestedPull}
              className="mt-4 w-full rounded-xl border border-cream-dark/50 bg-cream/50 px-4 py-3 text-left transition-colors hover:bg-cream-dark/40"
            >
              <p className="m-0 text-xs text-warm-muted">Можно начать с:</p>
              <p className="mt-1 text-sm text-warm-text">{suggestedCard.text}</p>
            </button>
          )}
        </section>

        <EnergyGuardDialog
          open={guardOpen}
          card={suggestedCard}
          alternatives={guardAlternatives}
          onPullAlternative={(id) => {
            closeGuard()
            onPullSuggested(id)
          }}
          onForcePull={() => {
            closeGuard()
            onPullSuggested(suggestedCard.id)
          }}
          onCancel={closeGuard}
        />
      </>
    )
  }

  return (
    <section>
      <div className="relative">
        <StructuredCard card={wipCard} className="px-5 py-5 text-base" />
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          aria-label="Ещё"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-warm-muted hover:bg-cream-dark"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleComplete}
          className="rounded-lg bg-warm-accent py-3 text-sm font-medium text-white hover:bg-warm-accent-hover"
        >
          Сделано
        </button>
        <button
          type="button"
          onClick={discardWip}
          className="rounded-lg border border-cream-dark py-3 text-sm text-warm-muted hover:bg-cream-dark"
        >
          Не актуально
        </button>
      </div>

      <CardEditSheet
        card={wipCard}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </section>
  )
}
