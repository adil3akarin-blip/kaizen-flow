import clsx from 'clsx'
import { BatteryFull, BatteryLow, BatteryMedium } from 'lucide-react'
import { useEnergyStore } from '../../store/useEnergyStore'
import { ENERGY_PRESETS, getEnergyAdvice } from '../../lib/energyUtils'

const PRESET_ICONS = {
  brisk: BatteryFull,
  medium: BatteryMedium,
  depleted: BatteryLow,
}

export default function EnergySnapshot({ onOpenHub }) {
  const preset = useEnergyStore((s) => s.preset)
  const config = ENERGY_PRESETS[preset]
  const Icon = PRESET_ICONS[preset] || BatteryMedium
  const advice = getEnergyAdvice(preset)

  return (
    <button
      type="button"
      onClick={onOpenHub}
      className={clsx(
        'flex w-full items-center gap-3 rounded-2xl border border-cream-dark/50 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:bg-cream/50',
        preset === 'depleted' && 'border-warm-accent/20 bg-warm-accent/5',
      )}
    >
      <div
        className={clsx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          preset === 'depleted' ? 'bg-warm-accent/15' : 'bg-cream',
        )}
      >
        <Icon
          className={clsx(
            'h-5 w-5',
            preset === 'depleted' ? 'text-warm-accent' : 'text-warm-accent',
          )}
          strokeWidth={1.5}
        />
      </div>
      <div className="min-w-0">
        <p className="m-0 text-sm font-medium text-warm-text">{config.label}</p>
        <p className="mt-0.5 truncate text-xs text-warm-muted">{advice}</p>
      </div>
    </button>
  )
}
