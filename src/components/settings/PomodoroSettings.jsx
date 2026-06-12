import { useSettingsStore } from '../../store/useSettingsStore'

function Stepper({ label, value, suffix, min, max, step, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-line/40 px-4 py-3">
      <span className="text-sm text-ink">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Уменьшить ${label}`}
          onClick={() => onChange(Math.max(min, value - step))}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-ink transition hover:bg-sunken"
        >
          −
        </button>
        <span className="w-14 text-center text-sm font-semibold tabular-nums text-ink">
          {value} {suffix}
        </span>
        <button
          type="button"
          aria-label={`Увеличить ${label}`}
          onClick={() => onChange(Math.min(max, value + step))}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-ink transition hover:bg-sunken"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default function PomodoroSettings() {
  const focusMin = useSettingsStore((s) => s.pomodoroFocusMin)
  const breakMin = useSettingsStore((s) => s.pomodoroBreakMin)
  const setPomodoro = useSettingsStore((s) => s.setPomodoro)

  return (
    <section className="rounded-2xl border border-line/50 bg-white p-4 shadow-sm sm:p-5">
      <p className="m-0 text-base font-medium text-ink">Помодоро</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Длительность фокуса и перерыва для таймера в «Сегодня».
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Stepper
          label="Фокус"
          value={focusMin}
          suffix="мин"
          min={5}
          max={60}
          step={5}
          onChange={(v) => setPomodoro(v, breakMin)}
        />
        <Stepper
          label="Перерыв"
          value={breakMin}
          suffix="мин"
          min={1}
          max={30}
          step={1}
          onChange={(v) => setPomodoro(focusMin, v)}
        />
      </div>
    </section>
  )
}
