import { AnimatePresence } from 'framer-motion'
import { useCardsStore } from '../store/useCardsStore'
import StickyNote from './StickyNote'

export default function Canvas() {
  const cards = useCardsStore((s) => s.cards)
  const removeCard = useCardsStore((s) => s.removeCard)
  const moveCard = useCardsStore((s) => s.moveCard)
  const newCardId = useCardsStore((s) => s.lastAddedId)

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-cream">
      <header className="flex items-center justify-between border-b border-cream-dark px-8 py-5">
        <div>
          <h2 className="m-0 text-lg font-medium text-warm-text">Холст</h2>
          <p className="mt-1 text-sm text-warm-muted">
            {cards.length}{' '}
            {cards.length === 1
              ? 'мысль'
              : cards.length < 5
                ? 'мысли'
                : 'мыслей'}{' '}
            — перетаскивай, чтобы раздвинуть
          </p>
        </div>
      </header>

      <div className="relative flex-1 overflow-auto">
        <div
          className="relative min-h-full min-w-[720px]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #e8e0d4 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <AnimatePresence>
            {cards.map((card) => (
              <StickyNote
                key={card.id}
                card={card}
                onDelete={removeCard}
                onMove={moveCard}
                isNew={card.id === newCardId}
              />
            ))}
          </AnimatePresence>

          {cards.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-base text-warm-muted">
                Холст пуст — выгрузи первую мысль слева
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
