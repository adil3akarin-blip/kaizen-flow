import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'

// Bottom sheet on mobile, centered dialog on desktop. Owns the backdrop,
// a header with title + close button, Esc-to-close, scroll, and a11y roles.
export default function Sheet({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  maxWidth = 'max-w-md',
}) {
  const shouldReduce = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const spring = shouldReduce
    ? { duration: 0 }
    : { type: 'spring', stiffness: 400, damping: 30 }

  return createPortal(
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
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
          />

          <motion.div
            initial={shouldReduce ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
            transition={spring}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 flex max-h-[90dvh] w-full ${maxWidth} flex-col rounded-t-3xl border border-line/60 bg-surface shadow-(--shadow-float) md:rounded-2xl`}
          >
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-6 py-4">
              <div className="flex min-w-0 items-center gap-3">
                {Icon && (
                  <span className="hm-grad flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-(--shadow-glow)">
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="m-0 truncate text-[17px] font-semibold text-ink">{title}</h3>
                  {subtitle && (
                    <p className="m-0 mt-0.5 truncate text-xs text-ink-muted">{subtitle}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={onClose}
                className="-mr-1.5 shrink-0 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="overflow-y-auto px-6 py-5">{children}</div>

            {footer && (
              <div className="shrink-0 border-t border-line px-6 py-4">{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
