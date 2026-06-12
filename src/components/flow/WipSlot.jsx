import { useState } from 'react'
import { Check, MoreHorizontal } from 'lucide-react'
import { useCardsStore } from '../../store/useCardsStore'
import { selectWipCard } from '../../lib/cardSelectors'
import StructuredCard from '../cards/StructuredCard'
import CardEditSheet from '../cards/CardEditSheet'
import SectionLabel from '../ui/SectionLabel'
import FocusTimer from '../today/FocusTimer'

export default function WipSlot({ suggestedCard, emptyCta, onPullSuggested }) {
  const cards = useCardsStore((s) => s.cards)
  const completeWip = useCardsStore((s) => s.completeWip)
  const discardWip = useCardsStore((s) => s.discardWip)

  const [editOpen, setEditOpen] = useState(false)

  const wipCard = selectWipCard(cards)

  const handleSuggestedPull = () => {
    if (!suggestedCard) return
    onPullSuggested(suggestedCard.id)
  }

  if (!wipCard) {
    if (emptyCta) {
      return (
        <section>
          <SectionLabel className="text-center">Поток свободен</SectionLabel>
          <button
            type="button"
            onClick={emptyCta.onAction}
            className="mt-4 w-full rounded-2xl border-2 border-dashed border-line-strong px-4 py-5 text-left text-sm text-ink-muted transition hover:border-accent/40 hover:text-ink"
          >
            {emptyCta.message} →{' '}
            <span className="text-accent">{emptyCta.targetLabel}</span>
          </button>
        </section>
      )
    }

    if (suggestedCard) {
      return (
        <section>
          <SectionLabel>Одно дело в единицу времени</SectionLabel>
          <button
            type="button"
            onClick={handleSuggestedPull}
            className="mt-3 w-full text-left transition-opacity hover:opacity-90"
          >
            <StructuredCard card={suggestedCard} className="ring-1 ring-accent/20" />
          </button>
          <button
            type="button"
            onClick={handleSuggestedPull}
            className="hm-grad mt-4 w-full rounded-xl py-3 text-sm font-bold text-white shadow-(--shadow-glow) transition-transform hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Начать
          </button>
        </section>
      )
    }

    return (
      <section>
        <SectionLabel>В работе</SectionLabel>
        <div className="mt-3 flex items-center justify-center rounded-2xl border-2 border-dashed border-line-strong px-4 py-8">
          <p className="text-sm text-ink-faint">Вытяни одно дело из очереди</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <SectionLabel>В работе</SectionLabel>

      <div className="hm-glass hm-accent-line relative mt-3 overflow-hidden rounded-3xl">
        {/* Task header */}
        <div className="relative px-5 pt-5 pb-4">
          <div className="flex items-start gap-3 pr-9">
            <span className="hm-tick mt-1" />
            <StructuredCard
              card={wipCard}
              className="flex-1 border-none bg-transparent p-0 shadow-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            aria-label="Ещё"
            className="absolute right-3 top-4 rounded-xl p-1.5 text-ink-faint transition hover:bg-sunken hover:text-ink"
          >
            <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="h-px bg-line/70" />

        {/* Embedded focus timer */}
        <div className="px-5 py-5">
          <FocusTimer cardId={wipCard.id} embedded />
        </div>

        <div className="h-px bg-line/70" />

        {/* Commit / release */}
        <div className="grid grid-cols-2 gap-3 px-5 py-4">
          <button
            type="button"
            onClick={completeWip}
            className="flex items-center justify-center gap-2 rounded-xl bg-success py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-success/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40"
          >
            <Check className="h-4 w-4" strokeWidth={2.6} />
            Сделано
          </button>
          <button
            type="button"
            onClick={discardWip}
            className="rounded-xl border border-line py-3 text-sm font-medium text-ink-muted transition hover:border-line-strong hover:bg-sunken/60"
          >
            Отпустить
          </button>
        </div>
      </div>

      <CardEditSheet card={wipCard} open={editOpen} onClose={() => setEditOpen(false)} />
    </section>
  )
}
