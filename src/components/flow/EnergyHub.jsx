import clsx from 'clsx'
import { BatteryFull, BatteryLow, BatteryMedium } from 'lucide-react'
import { useEnergyStore } from '../../store/useEnergyStore'
import { hapticTap } from '../../lib/haptics'
import {
  countRecentHeavyCompletions,
} from '../../lib/willpowerGuard'
import {
  ENERGY_AXES,
  ENERGY_PRESETS,
  getAxisNuance,
  getEnergyAdvice,
  RECOVERY_IDEAS,
  shouldShowRecoverySection,
} from '../../lib/energyUtils'

const PRESET_ICONS = {
  brisk: BatteryFull,
  medium: BatteryMedium,
  depleted: BatteryLow,
}

function AxisSlider({ axis, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-warm-muted">
        <span>{axis.leftLabel}</span>
        <span>{axis.rightLabel}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-warm-accent"
      />
    </div>
  )
}

function RecoverySection() {
  return (
    <section className="rounded-2xl border border-warm-accent/20 bg-warm-accent/5 p-5">
      <p className="m-0 font-serif text-base font-medium text-warm-text">
        Восстановление
      </p>
      <p className="mt-1 text-xs text-warm-muted">
        Несколько идей, если ресурс на исходе
      </p>
      <ul className="mt-4 flex list-none flex-col gap-2 p-0">
        {RECOVERY_IDEAS.map((idea) => (
          <li
            key={idea}
            className="rounded-xl border border-cream-dark/50 bg-white px-4 py-3 text-sm text-warm-text"
          >
            {idea}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function EnergyHub({ onBack }) {
  const preset = useEnergyStore((s) => s.preset)
  const axes = useEnergyStore((s) => s.axes)
  const fineTuneOpen = useEnergyStore((s) => s.fineTuneOpen)
  const heavyCompletions = useEnergyStore((s) => s.heavyCompletions)
  const setPreset = useEnergyStore((s) => s.setPreset)
  const setAxis = useEnergyStore((s) => s.setAxis)
  const setFineTuneOpen = useEnergyStore((s) => s.setFineTuneOpen)

  const presetConfig = ENERGY_PRESETS[preset]
  const PresetIcon = PRESET_ICONS[preset] || BatteryMedium
  const advice = getEnergyAdvice(preset)
  const axisNuance = getAxisNuance(preset, axes)
  const recentHeavyCount = countRecentHeavyCompletions(heavyCompletions)
  const showRecovery = shouldShowRecoverySection(preset, recentHeavyCount)

  const handlePresetTap = (presetId) => {
    hapticTap()
    setPreset(presetId)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header
        className={clsx(
          'shrink-0 border-b border-cream-dark/60 px-4 py-4 sm:px-6 md:px-8',
          preset === 'depleted' ? 'bg-warm-accent/5' : 'bg-white/40',
        )}
      >
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-warm-muted hover:text-warm-text"
        >
          ← Поток
        </button>
        <h2 className="m-0 mt-2 font-serif text-xl font-medium text-warm-text">
          Энергия
        </h2>
        <p className="m-0 mt-1 text-sm text-warm-muted">Как ты сейчас?</p>
        <div className="mt-3 flex items-start gap-3">
          <div
            className={clsx(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              preset === 'depleted' ? 'bg-warm-accent/15' : 'bg-cream',
            )}
          >
            <PresetIcon className="h-5 w-5 text-warm-accent" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-sm font-medium text-warm-text">
              {presetConfig.label}
            </p>
            <p className="m-0 mt-0.5 text-sm leading-relaxed text-warm-muted">
              {advice}
            </p>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
        <section>
          <p className="m-0 text-xs font-medium uppercase tracking-wide text-warm-muted">
            Быстрый ввод
          </p>
          <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
            {Object.values(ENERGY_PRESETS).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetTap(p.id)}
                className={clsx(
                  'rounded-xl border px-2 py-3 text-center transition-colors sm:px-3 sm:py-4',
                  preset === p.id
                    ? 'border-warm-accent bg-warm-accent/10 text-warm-text'
                    : 'border-cream-dark/50 bg-white text-warm-muted hover:bg-cream/50',
                )}
              >
                <span className="block text-xs font-medium sm:text-sm">{p.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-cream-dark/50 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="m-0 font-serif text-base font-medium text-warm-text">
              Точнее
            </p>
            <button
              type="button"
              onClick={() => setFineTuneOpen(!fineTuneOpen)}
              className="text-sm text-warm-accent hover:text-warm-accent-hover"
            >
              {fineTuneOpen ? 'Свернуть' : 'Настроить'}
            </button>
          </div>

          {axisNuance && !fineTuneOpen && (
            <p className="mt-2 text-sm text-warm-muted">{axisNuance}</p>
          )}

          {fineTuneOpen && (
            <div className="mt-4 flex flex-col gap-5">
              {ENERGY_AXES.map((axis) => (
                <AxisSlider
                  key={axis.id}
                  axis={axis}
                  value={axes[axis.id] ?? 50}
                  onChange={(v) => setAxis(axis.id, v)}
                />
              ))}
              {axisNuance && (
                <p className="text-sm text-warm-muted">{axisNuance}</p>
              )}
            </div>
          )}
        </section>

        {showRecovery && <RecoverySection />}
      </div>
    </div>
  )
}
