import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { resolveKanbanColumn } from '../../lib/kanbanUtils'

export default function MoveCardSheet({ card, columns, open, onClose, onMove }) {
 if (!card) return null

 const currentColumnId = resolveKanbanColumn(card)

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
 className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
 />

 <motion.div
 initial={{ opacity: 0, y: 40 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 40 }}
 className="relative z-10 w-full max-w-md rounded-t-2xl border border-line/60 bg-white p-6 shadow-xl md:rounded-2xl"
 onClick={(e) => e.stopPropagation()}
 >
 <h3 className="m-0 text-lg font-medium text-ink">
 Переместить в…
 </h3>
 <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
 {card.text}
 </p>

 <div className="mt-4 flex flex-col gap-2">
 {columns.map((col) => {
 const isCurrent = col.id === currentColumnId
 return (
 <button
 key={col.id}
 type="button"
 disabled={isCurrent}
 onClick={() => onMove(col.id)}
 className={clsx(
 'rounded-lg border px-4 py-3 text-left text-sm transition-colors',
 isCurrent
 ? 'cursor-default border-line/60 bg-canvas/40 text-ink-muted'
 : 'border-line text-ink hover:bg-sunken',
 )}
 >
 {col.label}
 {isCurrent && (
 <span className="ml-2 text-xs text-ink-muted">
 (сейчас)
 </span>
 )}
 </button>
 )
 })}
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 )
}
