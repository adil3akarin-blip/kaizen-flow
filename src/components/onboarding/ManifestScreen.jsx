import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'

export default function ManifestScreen() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="flex w-full max-w-md flex-col items-center rounded-2xl border border-cream-dark/50 bg-white px-8 py-10 text-center shadow-sm"
      >
        <h1 className="m-0 font-serif text-2xl font-medium tracking-tight text-warm-text">
          KaizenFlow
        </h1>
        <p className="mt-1 text-sm text-warm-muted">Power & Focus</p>

        <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-warm-text/90">
          <p className="m-0">
            Освободи голову — выгрузи всё, что крутится. Планирование подождёт.
          </p>
          <p className="m-0">
            Сначала тишина, потом разбор. Без давления и бесконечных списков.
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={completeOnboarding}
          className="mt-10 rounded-xl bg-warm-accent px-10 py-3 text-base font-medium text-white shadow-lg shadow-warm-accent/25 transition-colors hover:bg-warm-accent-hover"
        >
          Начать
        </motion.button>
      </motion.div>
    </div>
  )
}
