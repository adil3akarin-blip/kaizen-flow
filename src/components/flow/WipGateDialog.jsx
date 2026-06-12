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
 className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/20 px-0 backdrop-blur-sm md:items-center md:px-6"
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="w-full max-w-sm rounded-t-2xl border border-line/60 bg-white p-6 shadow-xl md:rounded-2xl"
 >
 <p className="m-0 text-base font-medium text-ink">
 Сначала завершить или отложить текущее?
 </p>
 <p className="mt-2 text-sm text-ink-muted">
 Одно дело в единицу времени — WIP уже занят.
 </p>
 <div className="mt-5 flex flex-col gap-2">
 <button
 type="button"
 onClick={onComplete}
 className="rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
 >
 Завершить текущее
 </button>
 <button
 type="button"
 onClick={onRelease}
 className="rounded-lg border border-line py-2.5 text-sm text-ink-muted hover:bg-sunken"
 >
 Отложить в очередь
 </button>
 <button
 type="button"
 onClick={onCancel}
 className="py-2 text-sm text-ink-muted hover:text-ink"
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
