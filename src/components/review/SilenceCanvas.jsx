import { useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useCardsStore } from '../../store/useCardsStore'
import { selectRawCards } from '../../lib/cardSelectors'
import StickyNote from '../StickyNote'

export default function SilenceCanvas() {
  const cards = useCardsStore((s) => s.cards)
  const removeCard = useCardsStore((s) => s.removeCard)
  const moveCard = useCardsStore((s) => s.moveCard)
  const updateCardText = useCardsStore((s) => s.updateCardText)
  const newCardId = useCardsStore((s) => s.lastAddedId)

  const rawCards = useMemo(() => selectRawCards(cards), [cards])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1 overflow-auto">
        <div
          className="relative min-h-full min-w-full md:min-w-[720px]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #e8e0d4 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <AnimatePresence>
            {rawCards.map((card) => (
              <StickyNote
                key={card.id}
                card={card}
                onDelete={removeCard}
                onMove={moveCard}
                onUpdate={updateCardText}
                isNew={card.id === newCardId}
              />
            ))}
          </AnimatePresence>

          {rawCards.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8">
              <p className="text-center text-base text-warm-muted">
                Холст пуст
              </p>
              <p className="text-center text-sm text-warm-muted/80">
                Нажми + внизу — выгрузи первую мысль
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
