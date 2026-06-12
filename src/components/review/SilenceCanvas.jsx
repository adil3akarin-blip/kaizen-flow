import { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useCardsStore } from '../../store/useCardsStore'
import { selectRawCards } from '../../lib/cardSelectors'
import { resolveCanvasContentHeight } from '../../lib/reviewUtils'
import StickyNote from '../StickyNote'

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
 onFilter={onFilter}
 isNew={card.id === newCardId}
 />
 ))}
 </AnimatePresence>

 {rawCards.length === 0 && (
 <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 px-8">
 <p className="text-center text-base text-ink-muted">
 Холст пуст
 </p>
 <p className="text-center text-sm text-ink-muted/80 md:hidden">
 Нажми + внизу — выгрузи первую мысль
 </p>
 <p className="hidden text-center text-sm text-ink-muted/80 md:block">
 Нажми «Выгрузить» слева — выгрузи первую мысль
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 )
}
