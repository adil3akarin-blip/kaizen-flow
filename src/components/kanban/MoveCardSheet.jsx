import { AnimatePresence, motion } from 'framer-motion'

export default function MoveCardSheet({ card, columns, open, onClose, onMove }) {
  if (!card) return null

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
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-cream-dark/60 bg-white p-6 shadow-xl md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="m-0 font-serif text-lg font-medium text-warm-text">
              Переместить в…
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-warm-muted">
              {card.text}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {columns.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => onMove(col.id)}
                  className="rounded-lg border border-cream-dark px-4 py-3 text-left text-sm text-warm-text transition-colors hover:bg-cream-dark"
                >
                  {col.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
