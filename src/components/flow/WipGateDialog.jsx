import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GitMerge } from 'lucide-react'

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
          className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/30 px-0 backdrop-blur-sm md:items-center md:px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-full max-w-sm rounded-t-3xl border border-line/60 bg-surface p-6 shadow-(--shadow-float) md:rounded-2xl"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-sunken">
              <GitMerge className="h-5 w-5 text-ink-muted" strokeWidth={1.75} />
            </div>
            <p className="m-0 text-[17px] font-semibold text-ink">
              В работе уже есть дело
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              Одно дело в единицу времени. Завершить или отложить текущее?
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={onComplete}
                className="rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Завершить текущее
              </button>
              <button
                type="button"
                onClick={onRelease}
                className="rounded-xl border border-line py-2.5 text-sm text-ink-muted transition hover:border-line-strong hover:bg-sunken/60"
              >
                Отложить в очередь
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="py-2 text-sm text-ink-faint transition hover:text-ink-muted"
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
