import { useMemo, useState } from 'react'
import clsx from 'clsx'
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

function HeroLabel({ children, className }) {
  return (
    <p
      className={clsx(
        'm-0 font-serif text-base font-medium text-warm-text',
        className,
      )}
    >
      {children}
    </p>
  )
}

function WipHeroShell({ accent = false, className, children }) {
  return (
    <section
      className={clsx(
        'rounded-2xl px-5 py-6',
        accent
          ? 'bg-warm-accent/5 ring-1 ring-warm-accent/15'
          : 'bg-white/50',
        className,
      )}
    >
      {children}
    </section>
  )
}

export default function WipSlot({
  suggestedCard,
  emptyCta,
  onPullSuggested,
  onGuardOpenChange,
}) {
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

  const guardDialog = (
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
  )

  if (!wipCard) {
    if (emptyCta) {
      return (
        <WipHeroShell className="py-8">
          <HeroLabel className="text-center">Поток свободен</HeroLabel>
          <button
            type="button"
            onClick={emptyCta.onAction}
            className="mt-4 w-full rounded-xl border border-cream-dark/50 bg-white px-4 py-3 text-left text-sm text-warm-muted shadow-sm transition-colors hover:bg-cream/50"
          >
            {emptyCta.message} →{' '}
            <span className="text-warm-accent">{emptyCta.targetLabel}</span>
          </button>
        </WipHeroShell>
      )
    }

    if (suggestedCard) {
      return (
        <>
          <WipHeroShell accent>
            <HeroLabel>Одно дело в единицу времени</HeroLabel>
            <button
              type="button"
              onClick={handleSuggestedPull}
              className="mt-4 w-full text-left transition-opacity hover:opacity-90"
            >
              <StructuredCard
                card={suggestedCard}
                className="ring-1 ring-warm-accent/20"
              />
            </button>
            <button
              type="button"
              onClick={handleSuggestedPull}
              className="mt-4 w-full rounded-lg bg-warm-accent py-3 text-sm font-medium text-white hover:bg-warm-accent-hover"
            >
              Начать
            </button>
          </WipHeroShell>
          {guardDialog}
        </>
      )
    }

    return null
  }

  return (
    <WipHeroShell accent>
      <HeroLabel>Сейчас в работе</HeroLabel>

      <div className="relative mt-4">
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
    </WipHeroShell>
  )
}
