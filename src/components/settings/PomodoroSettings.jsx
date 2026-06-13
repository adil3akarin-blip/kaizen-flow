import { Timer } from 'lucide-react'
import { useSettingsStore } from '../../store/useSettingsStore'
import SettingsSection from './SettingsSection'

function Stepper({ label, value, suffix, min, max, step, onChange }) {
  const atMin = value <= min
  const atMax = value >= max
  const btn =
    'flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink transition hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
  return (
    <div className="flex items-center justify-between rounded-xl border border-line/50 bg-surface px-4 py-3">
      <span className="text-sm text-ink">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Уменьшить ${label}`}
          disabled={atMin}
          onClick={() => onChange(Math.max(min, value - step))}
          className={btn}
        >
          −
        </button>
        <span className="w-14 text-center text-sm font-semibold tabular-nums text-ink">
          {value} {suffix}
        </span>
        <button
          type="button"
          aria-label={`Увеличить ${label}`}
          disabled={atMax}
          onClick={() => onChange(Math.min(max, value + step))}
          className={btn}
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
    <SettingsSection
      icon={Timer}
      title="Помодоро"
      description="Длительность фокуса и перерыва для таймера в «Сегодня»."
    >
      <div className="flex flex-col gap-2">
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
    </SettingsSection>
  )
}
