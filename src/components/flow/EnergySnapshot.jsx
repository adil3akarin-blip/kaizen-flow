import clsx from 'clsx'
import { useEnergyStore } from '../../store/useEnergyStore'
import { ENERGY_PRESETS } from '../../lib/energyUtils'

const PRESETS = ['brisk', 'medium', 'depleted']

export default function EnergySnapshot({ onOpenHub }) {
  const preset = useEnergyStore((s) => s.preset)
  const setPreset = useEnergyStore((s) => s.setPreset)
  const config = ENERGY_PRESETS[preset]

  return (
    <div className="hm-glass hm-accent-line relative overflow-hidden rounded-2xl px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onOpenHub}
          className="min-w-0 flex-1 text-left"
        >
          <p className="hm-eyebrow m-0">Энергия</p>
          <p className="mt-1 text-sm font-semibold text-ink">{config.label}</p>
        </button>
      </div>
      <div className="mt-3 flex gap-1 rounded-xl border border-line bg-glass-strong p-1">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPreset(p)}
            className={clsx(
              'flex-1 rounded-lg py-1.5 text-xs font-bold transition',
              preset === p
                ? 'hm-grad text-white shadow-(--shadow-glow)'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {ENERGY_PRESETS[p].label}
          </button>
        ))}
      </div>
    </div>
  )
}
