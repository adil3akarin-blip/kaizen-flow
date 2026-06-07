import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function WipGateDialog({ open, onComplete, onRelease, onCancel }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end justify-center bg-warm-text/20 px-0 backdrop-blur-sm md:items-center md:px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm rounded-t-2xl border border-cream-dark/60 bg-white p-6 shadow-xl md:rounded-2xl"
          >
            <p className="m-0 font-serif text-base font-medium text-warm-text">
              Сначала завершить или отложить текущее?
            </p>
            <p className="mt-2 text-sm text-warm-muted">
              Одно дело в единицу времени — WIP уже занят.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={onComplete}
                className="rounded-lg bg-warm-accent py-2.5 text-sm font-medium text-white hover:bg-warm-accent-hover"
              >
                Завершить текущее
              </button>
              <button
                type="button"
                onClick={onRelease}
                className="rounded-lg border border-cream-dark py-2.5 text-sm text-warm-muted hover:bg-cream-dark"
              >
                Отложить в очередь
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="py-2 text-sm text-warm-muted hover:text-warm-text"
              >
                Отмена
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
