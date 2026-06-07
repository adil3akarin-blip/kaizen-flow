import { useState } from 'react'
import clsx from 'clsx'
import { useEnergyStore } from '../../store/useEnergyStore'
import {
  ENERGY_AXES,
  ENERGY_PRESETS,
} from '../../lib/energyUtils'

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

function StandaloneCalculator() {
  const [open, setOpen] = useState(false)
  const [gain, setGain] = useState('')
  const [cost, setCost] = useState('')
  const [verdict, setVerdict] = useState(null)

  const handleVerdict = (v) => {
    setVerdict(v)
    setOpen(false)
  }

  const verdictLabels = {
    yes: 'Да, стоит',
    maybe: 'Сомневаюсь',
    no: 'Нет, не сейчас',
  }

  return (
    <section className="rounded-2xl border border-cream-dark/50 bg-white p-5 shadow-sm">
      <p className="m-0 font-serif text-base font-medium text-warm-text">
        Результат / Затраты
      </p>
      <p className="mt-1 text-xs text-warm-muted">
        Сначала оценка, потом действие
      </p>

      {verdict && !open && (
        <p className="mt-3 text-sm text-warm-text">
          Вердикт:{' '}
          <span className="font-medium">{verdictLabels[verdict]}</span>
        </p>
      )}

      {open ? (
        <div className="mt-4">
          <textarea
            value={gain}
            onChange={(e) => setGain(e.target.value)}
            placeholder="Что получу?"
            rows={2}
            className="w-full resize-none rounded-lg border border-cream-dark bg-cream/30 px-3 py-2 text-sm text-warm-text outline-none focus:ring-2 focus:ring-warm-accent/30"
          />
          <textarea
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Что отдам?"
            rows={2}
            className="mt-2 w-full resize-none rounded-lg border border-cream-dark bg-cream/30 px-3 py-2 text-sm text-warm-text outline-none focus:ring-2 focus:ring-warm-accent/30"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleVerdict('yes')}
              className="rounded-lg bg-warm-accent px-3 py-1.5 text-xs font-medium text-white"
            >
              Да, стоит
            </button>
            <button
              type="button"
              onClick={() => handleVerdict('maybe')}
              className="rounded-lg border border-cream-dark px-3 py-1.5 text-xs text-warm-muted"
            >
              Сомневаюсь
            </button>
            <button
              type="button"
              onClick={() => handleVerdict('no')}
              className="rounded-lg border border-cream-dark px-3 py-1.5 text-xs text-warm-muted"
            >
              Нет, не сейчас
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-lg border border-cream-dark px-4 py-2 text-sm text-warm-muted hover:bg-cream-dark"
        >
          {verdict ? 'Пересчитать' : 'Открыть калькулятор'}
        </button>
      )}
    </section>
  )
}

export default function EnergyHub({ onBack }) {
  const preset = useEnergyStore((s) => s.preset)
  const axes = useEnergyStore((s) => s.axes)
  const fineTuneOpen = useEnergyStore((s) => s.fineTuneOpen)
  const setPreset = useEnergyStore((s) => s.setPreset)
  const setAxis = useEnergyStore((s) => s.setAxis)
  const setFineTuneOpen = useEnergyStore((s) => s.setFineTuneOpen)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-cream-dark/60 bg-white/40 px-6 py-4">
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
        <p className="m-0 mt-1 text-sm text-warm-muted">
          Как ты сейчас?
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
        <section>
          <p className="m-0 text-xs font-medium uppercase tracking-wide text-warm-muted">
            Быстрый ввод
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {Object.values(ENERGY_PRESETS).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={clsx(
                  'rounded-xl border px-3 py-4 text-center transition-colors',
                  preset === p.id
                    ? 'border-warm-accent bg-warm-accent/10 text-warm-text'
                    : 'border-cream-dark/50 bg-white text-warm-muted hover:bg-cream/50',
                )}
              >
                <span className="block text-sm font-medium">{p.label}</span>
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
            </div>
          )}
        </section>

        <StandaloneCalculator />
      </div>
    </div>
  )
}
