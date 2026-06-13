import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '../store/useToastStore'

export default function Toast() {
 const toast = useToastStore((s) => s.toast)
 const dismissToast = useToastStore((s) => s.dismissToast)

 const handleAction = () => {
 toast?.onAction?.()
 }

 return (
 <AnimatePresence>
 {toast && (
 <motion.div
 key={toast.id}
 initial={{ opacity: 0, y: 24 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 12 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className={clsx(
 'fixed bottom-[calc(7.25rem+env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-4 rounded-xl px-5 py-3 text-sm shadow-xl md:bottom-8',
 toast.variant === 'destructive'
 ? 'bg-ink text-white'
 : 'border border-line/60 border-l-4 border-l-accent bg-white text-ink',
 )}
 >
 <span className="leading-snug">{toast.message}</span>
 {toast.actionLabel && (
 <button
 type="button"
 onClick={handleAction}
 className={clsx(
 'shrink-0 font-medium underline-offset-2 hover:underline',
 toast.variant === 'destructive'
 ? 'text-[#FFE0B2]'
 : 'text-accent',
 )}
 >
 {toast.actionLabel}
 </button>
 )}
 {!toast.actionLabel && (
 <button
 type="button"
 aria-label="Закрыть"
 onClick={dismissToast}
 className="shrink-0 text-ink-muted hover:text-ink"
 >
 ×
 </button>
 )}
 </motion.div>
 )}
 </AnimatePresence>
 )
}
