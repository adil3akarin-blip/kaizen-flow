import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import StructuredCard from '../cards/StructuredCard'

export default function EnergyGuardDialog({
 open,
 card,
 alternatives,
 onPullAlternative,
 onForcePull,
 onCancel,
}) {
 return createPortal(
 <AnimatePresence>
 {open && card && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 role="dialog"
 aria-modal="true"
 className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/20 px-0 backdrop-blur-sm md:items-center md:px-6"
 >
 <motion.div
 initial={{ opacity: 0, y: 24 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 24 }}
 className="w-full max-w-sm rounded-t-2xl border border-line/60 bg-white p-6 shadow-xl md:rounded-2xl"
 >
 <p className="m-0 text-base font-medium text-ink">
 Похоже, ресурс на исходе
 </p>
 <p className="mt-2 text-sm text-ink-muted">
 Это дело тяжёлое. Может, начать с чего-то полегче?
 </p>

 <div className="mt-4 rounded-xl border border-line/50 bg-canvas/30 p-3 opacity-60">
 <StructuredCard card={card} compact />
 </div>

 {alternatives.length > 0 && (
 <div className="mt-4">
 <p className="m-0 text-xs font-medium text-ink-muted">
 Лёгкие альтернативы
 </p>
 <ul className="mt-2 flex list-none flex-col gap-2 p-0">
 {alternatives.map((alt) => (
 <li key={alt.id}>
 <button
 type="button"
 onClick={() => onPullAlternative(alt.id)}
 className="w-full rounded-xl border border-line/50 bg-white text-left transition-colors hover:bg-canvas/50"
 >
 <StructuredCard card={alt} compact />
 </button>
 </li>
 ))}
 </ul>
 </div>
 )}

 <div className="mt-5 flex flex-col gap-2">
 {alternatives.length === 0 && (
 <button
 type="button"
 onClick={() => onForcePull(card.id)}
 className="rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
 >
 Всё равно продолжу
 </button>
 )}
 <button
 type="button"
 onClick={onCancel}
 className={clsx(
 'py-2 text-sm text-ink-muted hover:text-ink',
 alternatives.length > 0 && 'mt-1',
 )}
 >
 {alternatives.length > 0 ? 'Отмена' : 'Передумал'}
 </button>
 {alternatives.length > 0 && (
 <button
 type="button"
 onClick={() => onForcePull(card.id)}
 className="py-2 text-sm text-ink-muted hover:text-ink"
 >
 Всё равно взять это дело
 </button>
 )}
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>,
 document.body,
 )
}
