import { useState } from 'react'
import { Check, MoreHorizontal, Zap } from 'lucide-react'
import { useCardsStore } from '../../store/useCardsStore'
import { selectWipCard } from '../../lib/cardSelectors'
import StructuredCard from '../cards/StructuredCard'
import CardEditSheet from '../cards/CardEditSheet'
import WidgetCard from '../ui/WidgetCard'
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
        <WidgetCard icon={Zap} title="Поток свободен">
          <button
            type="button"
            onClick={emptyCta.onAction}
            className="w-full rounded-2xl border-2 border-dashed border-line-strong px-4 py-5 text-left text-sm text-ink-muted transition hover:border-accent/40 hover:text-ink"
          >
            {emptyCta.message} →{' '}
            <span className="text-accent">{emptyCta.targetLabel}</span>
          </button>
        </WidgetCard>
      )
    }

    if (suggestedCard) {
      return (
        <WidgetCard icon={Zap} title="Следующее дело">
          <button
            type="button"
            onClick={handleSuggestedPull}
            className="w-full text-left transition-opacity hover:opacity-90"
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
        </WidgetCard>
      )
    }

    return (
      <WidgetCard icon={Zap} title="В работе">
        <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-line-strong px-4 py-8">
          <p className="m-0 text-sm text-ink-faint">Вытяни одно дело из очереди</p>
        </div>
      </WidgetCard>
    )
  }

  return (
    <WidgetCard
      icon={Zap}
      title="В работе"
      className="hm-accent-line relative overflow-hidden"
    >
      <div className="flex flex-col gap-4">
        <div className="relative flex items-start gap-3 pr-9">
          <span className="hm-tick mt-1" />
          <StructuredCard
            card={wipCard}
            className="flex-1 border-none bg-transparent p-0 shadow-none"
          />
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            aria-label="Ещё"
            className="absolute right-0 top-0 rounded-xl p-1.5 text-ink-faint transition hover:bg-sunken hover:text-ink"
          >
            <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="rounded-2xl bg-sunken/40 p-4">
          <FocusTimer cardId={wipCard.id} embedded />
        </div>

        <div className="grid grid-cols-2 gap-3">
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
    </WidgetCard>
  )
}
