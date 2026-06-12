import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import clsx from 'clsx'
import { Zap } from 'lucide-react'
import StructuredCard from '../cards/StructuredCard'

const TITLE_ID = 'energy-guard-title'

function trapFocus(e) {
  if (e.key !== 'Tab') return
  const focusable = e.currentTarget.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
    e.preventDefault()
    ;(e.shiftKey ? last : first).focus()
  }
}

export default function EnergyGuardDialog({
  open,
  card,
  alternatives,
  onPullAlternative,
  onForcePull,
  onCancel,
}) {
  const shouldReduce = useReducedMotion()
  const spring = shouldReduce
    ? { duration: 0 }
    : { type: 'spring', stiffness: 400, damping: 30 }

  return createPortal(
    <AnimatePresence>
      {open && card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={TITLE_ID}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/30 px-0 backdrop-blur-sm md:items-center md:px-6"
        >
          <motion.div
            initial={shouldReduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={spring}
            onKeyDown={trapFocus}
            className="w-full max-w-sm rounded-t-3xl border border-line/60 bg-surface p-6 shadow-(--shadow-float) md:rounded-2xl"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-warn-soft">
              <Zap className="h-5 w-5 text-warn" strokeWidth={1.75} />
            </div>
            <p id={TITLE_ID} className="m-0 text-[17px] font-semibold text-ink">
              Ресурс на исходе
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              Это дело тяжёлое. Может, начать с чего-то полегче?
            </p>

            <div className="mt-4 rounded-xl border border-line/50 bg-sunken/60 p-3 opacity-60">
              <StructuredCard card={card} compact />
            </div>

            {alternatives.length > 0 && (
              <div className="mt-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  Лёгкие альтернативы
                </p>
                <ul className="mt-2 flex list-none flex-col gap-2 p-0">
                  {alternatives.map((alt) => (
                    <li key={alt.id}>
                      <button
                        type="button"
                        onClick={() => onPullAlternative(alt.id)}
                        className="w-full rounded-2xl border border-line/60 bg-surface text-left shadow-(--shadow-card) transition hover:border-line-strong"
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
                  autoFocus
                  onClick={() => onForcePull(card.id)}
                  className="rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.98]"
                >
                  Всё равно продолжу
                </button>
              )}
              <button
                type="button"
                autoFocus={alternatives.length > 0}
                onClick={onCancel}
                className={clsx(
                  'text-sm text-ink-faint transition hover:text-ink-muted',
                  alternatives.length > 0 ? 'py-2 mt-1' : 'py-2',
                )}
              >
                {alternatives.length > 0 ? 'Отмена' : 'Передумал'}
              </button>
              {alternatives.length > 0 && (
                <button
                  type="button"
                  onClick={() => onForcePull(card.id)}
                  className="py-1 text-sm text-ink-faint transition hover:text-ink-muted"
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
