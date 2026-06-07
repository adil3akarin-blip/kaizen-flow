import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCardsStore } from '../../store/useCardsStore'
import StructuredCard from './StructuredCard'

export default function CardEditSheet({ card, open, onClose, onMove }) {
  const updateCardText = useCardsStore((s) => s.updateCardText)
  const removeCard = useCardsStore((s) => s.removeCard)
  const returnCardToInbox = useCardsStore((s) => s.returnCardToInbox)
  const releaseWip = useCardsStore((s) => s.releaseWip)

  if (!card) return null

  return (
    <CardEditSheetContent
      key={card.id}
      card={card}
      open={open}
      onClose={onClose}
      onMove={onMove}
      updateCardText={updateCardText}
      removeCard={removeCard}
      returnCardToInbox={returnCardToInbox}
      releaseWip={releaseWip}
    />
  )
}

function CardEditSheetContent({
  card,
  open,
  onClose,
  onMove,
  updateCardText,
  removeCard,
  returnCardToInbox,
  releaseWip,
}) {
  const [text, setText] = useState(card.text)

  const handleSave = () => {
    if (updateCardText(card.id, text)) onClose()
  }

  const handleDelete = () => {
    removeCard(card.id)
    onClose()
  }

  const handleRefilter = () => {
    returnCardToInbox(card.id)
    onClose()
  }

  const handleReleaseWip = () => {
    releaseWip()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-end justify-center md:items-center md:p-6"
        >
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="absolute inset-0 bg-warm-text/25 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-cream-dark/60 bg-white p-6 shadow-xl md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="m-0 font-serif text-lg font-medium text-warm-text">
              Редактировать
            </h3>

            <div className="mt-4">
              <StructuredCard card={card} compact />
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="mt-4 w-full resize-none rounded-xl border border-cream-dark bg-cream/30 px-4 py-3 text-[15px] leading-relaxed text-warm-text outline-none focus:ring-2 focus:ring-warm-accent/30"
            />

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={!text.trim()}
                className="rounded-lg bg-warm-accent py-2.5 text-sm font-medium text-white hover:bg-warm-accent-hover disabled:opacity-40"
              >
                Сохранить
              </button>

              {onMove && (
                <button
                  type="button"
                  onClick={onMove}
                  className="rounded-lg border border-cream-dark py-2.5 text-sm text-warm-text hover:bg-cream-dark"
                >
                  Переместить в…
                </button>
              )}

              {card.status === 'wip' && (
                <button
                  type="button"
                  onClick={handleReleaseWip}
                  className="rounded-lg border border-cream-dark py-2.5 text-sm text-warm-muted hover:bg-cream-dark"
                >
                  Вернуть в очередь
                </button>
              )}

              {(card.status === 'filtered' || card.status === 'wip') && (
                <button
                  type="button"
                  onClick={handleRefilter}
                  className="rounded-lg border border-cream-dark py-2.5 text-sm text-warm-muted hover:bg-cream-dark"
                >
                  Разобрать заново
                </button>
              )}

              <button
                type="button"
                onClick={handleDelete}
                className="py-2 text-sm text-warm-muted hover:text-warm-text"
              >
                Удалить
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
