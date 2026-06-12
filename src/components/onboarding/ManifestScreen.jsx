import { motion } from 'framer-motion'
import { Waves, BrainCircuit, Layers, Zap } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const MANIFEST = [
  { icon: BrainCircuit, text: 'Освободи голову — выгрузи всё, что крутится.' },
  { icon: Layers, text: 'Сначала тишина, потом разбор. Без давления.' },
  { icon: Zap, text: 'Один фокус в работе — никаких бесконечных списков.' },
]

export default function ManifestScreen() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="flex w-full max-w-sm flex-col items-center text-center"
      >
        <div className="hm-grad mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-(--shadow-glow)">
          <Waves className="h-8 w-8" strokeWidth={1.9} />
        </div>

        <p className="hm-eyebrow mb-3">Power & Focus</p>
        <h1 className="hm-title m-0 text-4xl">KaizenFlow</h1>
        <p className="mt-2 text-sm text-ink-muted">Осознанная работа с потоком мыслей</p>

        <ul className="mt-10 w-full space-y-4 text-left">
          {MANIFEST.map(({ icon: Icon, text }, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 300, damping: 28 }}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent-soft">
                <Icon className="h-4 w-4 text-accent" strokeWidth={1.9} />
              </span>
              <p className="m-0 text-[15px] leading-relaxed text-ink">{text}</p>
            </motion.li>
          ))}
        </ul>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={completeOnboarding}
          className="hm-grad mt-10 w-full rounded-xl py-3 text-sm font-bold text-white shadow-(--shadow-glow) transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Начать
        </motion.button>
      </motion.div>
    </div>
  )
}
