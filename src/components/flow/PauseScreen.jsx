import { motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import { RECOVERY_IDEAS } from '../../lib/energyUtils'

export default function PauseScreen({ onOpenHub, onContinue }) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-canvas overflow-y-auto px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <motion.div
          animate={reducedMotion ? {} : { scale: [1, 1.12, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft"
        >
          <div className="h-10 w-10 rounded-full bg-accent/40" />
        </motion.div>

        <p className="m-0 text-2xl font-semibold tracking-tight text-ink">
          Похоже, ресурс на исходе
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Три тяжёлых дела за последние пару часов — воля не бесконечна.
          Хочешь передышку?
        </p>

        <ul className="mt-8 flex list-none flex-col gap-2 p-0 text-left">
          {RECOVERY_IDEAS.map((idea) => (
            <li
              key={idea}
              className="rounded-2xl border border-line/60 bg-surface px-4 py-3 text-sm text-ink shadow-(--shadow-card)"
            >
              {idea}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-2">
          <button
            type="button"
            onClick={onOpenHub}
            className="rounded-xl bg-accent py-3 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Открыть хаб энергии
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-xl border border-line py-3 text-sm text-ink-muted transition hover:border-line-strong hover:bg-sunken/60"
          >
            Всё равно продолжу
          </button>
        </div>
      </div>
    </div>
  )
}
