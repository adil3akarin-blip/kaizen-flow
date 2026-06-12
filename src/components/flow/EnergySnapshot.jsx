import clsx from 'clsx'
import { useEnergyStore } from '../../store/useEnergyStore'
import { ENERGY_PRESETS } from '../../lib/energyUtils'

const PRESETS = ['brisk', 'medium', 'depleted']

export default function EnergySnapshot({ onOpenHub }) {
  const preset = useEnergyStore((s) => s.preset)
  const setPreset = useEnergyStore((s) => s.setPreset)
  const config = ENERGY_PRESETS[preset]

  return (
    <div className="rounded-2xl border border-line/60 bg-surface px-4 py-3.5 shadow-(--shadow-card)">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onOpenHub}
          className="min-w-0 flex-1 text-left"
        >
          <p className="m-0 text-xs font-semibold uppercase tracking-wider text-ink-faint">Энергия</p>
          <p className="mt-0.5 text-sm font-medium text-ink">{config.label}</p>
        </button>
      </div>
      <div className="mt-3 flex rounded-xl bg-sunken p-1">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPreset(p)}
            className={clsx(
              'flex-1 rounded-lg py-1.5 text-xs font-medium transition',
              preset === p
                ? 'bg-surface text-ink shadow-sm'
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
