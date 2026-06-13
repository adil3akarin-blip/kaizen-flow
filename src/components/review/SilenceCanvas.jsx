import { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useCardsStore } from '../../store/useCardsStore'
import { selectRawCards } from '../../lib/cardSelectors'
import { resolveCanvasContentHeight } from '../../lib/reviewUtils'
import { STICKY_COLORS } from '../../lib/cardUtils'
import StickyNote from '../StickyNote'

const GHOST_CARDS = [
  { id: 'ghost-0', text: 'Позвонить врачу насчёт результатов', x: 48, y: 56, rotation: -3, color: STICKY_COLORS[0] },
  { id: 'ghost-1', text: 'Доделать презентацию для команды', x: 260, y: 100, rotation: 2, color: STICKY_COLORS[2] },
  { id: 'ghost-2', text: 'Купить подарок на день рождения', x: 150, y: 220, rotation: -1.5, color: STICKY_COLORS[4] },
]

export default function SilenceCanvas({ onFilter }) {
  const cards = useCardsStore((s) => s.cards)
  const removeCard = useCardsStore((s) => s.removeCard)
  const moveCard = useCardsStore((s) => s.moveCard)
  const updateCardText = useCardsStore((s) => s.updateCardText)
  const newCardId = useCardsStore((s) => s.lastAddedId)
  const scrollRef = useRef(null)

  const rawCards = useMemo(() => selectRawCards(cards), [cards])
  const contentHeight = useMemo(
    () => resolveCanvasContentHeight(rawCards),
    [rawCards],
  )

  useEffect(() => {
    if (!newCardId) return
    const cardEl = scrollRef.current?.querySelector(
      `[data-card-id="${newCardId}"]`,
    )
    cardEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [newCardId])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-auto">
        <div
          className="relative min-h-full min-w-full md:min-w-[720px]"
          style={{
            minHeight: contentHeight,
            backgroundImage:
              'radial-gradient(circle, #dcdce2 1px, transparent 1px)',
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
                onFilter={onFilter}
                isNew={card.id === newCardId}
              />
            ))}
          </AnimatePresence>

          {rawCards.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              {GHOST_CARDS.map((ghost) => (
                <div
                  key={ghost.id}
                  className="absolute w-[160px] opacity-20"
                  style={{
                    left: ghost.x,
                    top: ghost.y,
                    rotate: `${ghost.rotation}deg`,
                  }}
                >
                  <div
                    className="rounded-lg px-4 py-3"
                    style={{ backgroundColor: ghost.color.bg }}
                  >
                    <p className="m-0 text-[13px] leading-snug text-ink">{ghost.text}</p>
                  </div>
                </div>
              ))}
              <p className="mt-auto mb-8 text-center text-sm text-ink-muted">
                Нажми + — выгрузи первую мысль
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
