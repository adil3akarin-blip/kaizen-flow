import { useState } from 'react'
import clsx from 'clsx'
import {
  buildResultEffort,
  getVerdictLabel,
  RESULT_EFFORT_VERDICTS,
  suggestsReconsider,
} from '../../lib/resultEffortUtils'

export default function ResultEffortCalculator({
  value = null,
  onSave,
  onClose,
  showSuggestions = false,
  onSuggestUnclear,
  onSuggestRelease,
  className,
}) {
  const [gain, setGain] = useState(value?.gain || '')
  const [cost, setCost] = useState(value?.cost || '')
  const [savedVerdict, setSavedVerdict] = useState(null)

  const activeVerdict = savedVerdict ?? value?.verdict ?? null
  const showReconsider =
    showSuggestions && savedVerdict && suggestsReconsider(savedVerdict)

  const handleVerdict = (verdict) => {
    const result = buildResultEffort(gain, cost, verdict)
    onSave?.(result)
    setSavedVerdict(verdict)

    if (!showSuggestions || !suggestsReconsider(verdict)) {
      onClose?.()
    }
  }

  if (showReconsider) {
    return (
      <div
        className={clsx(
          'rounded-xl border border-cream-dark/50 bg-cream/50 p-4',
          className,
        )}
      >
        <p className="m-0 font-serif text-sm font-medium text-warm-text">
          Оценка сохранена
        </p>
        <p className="mt-2 text-sm leading-relaxed text-warm-muted">
          {savedVerdict === 'no'
            ? 'Похоже, затраты перевешивают. Может, не сейчас?'
            : 'Выгода неочевидна. Можно отложить без чувства вины.'}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onSuggestUnclear?.()
              onClose?.()
            }}
            className="rounded-lg border border-cream-dark py-2.5 text-sm text-warm-text hover:bg-cream-dark"
          >
            Пока не ясно
          </button>
          <button
            type="button"
            onClick={() => {
              onSuggestRelease?.()
              onClose?.()
            }}
            className="rounded-lg border border-cream-dark py-2.5 text-sm text-warm-muted hover:bg-cream-dark"
          >
            Отпустить
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2 text-sm text-warm-muted hover:text-warm-text"
          >
            Оставить оценку
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'rounded-xl border border-cream-dark/50 bg-cream/50 p-4',
        className,
      )}
    >
      <p className="m-0 font-serif text-sm font-medium text-warm-text">
        Результат / Затраты
      </p>
      <p className="mt-1 text-xs text-warm-muted">
        Сначала осознание и оценка, потом действие
      </p>

      {activeVerdict && !savedVerdict && (
        <p className="mt-3 text-xs text-warm-muted">
          Вердикт:{' '}
          <span className="font-medium text-warm-text">
            {getVerdictLabel(activeVerdict)}
          </span>
        </p>
      )}

      <textarea
        value={gain}
        onChange={(e) => setGain(e.target.value)}
        placeholder="Что получу?"
        rows={2}
        className="mt-3 w-full resize-none rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm text-warm-text outline-none focus:ring-2 focus:ring-warm-accent/30"
      />
      <textarea
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        placeholder="Что отдам?"
        rows={2}
        className="mt-2 w-full resize-none rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm text-warm-text outline-none focus:ring-2 focus:ring-warm-accent/30"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {Object.values(RESULT_EFFORT_VERDICTS).map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => handleVerdict(v.id)}
            className={clsx(
              'rounded-lg px-3 py-1.5 text-xs',
              v.id === 'yes'
                ? 'bg-warm-accent font-medium text-white'
                : 'border border-cream-dark text-warm-muted',
            )}
          >
            {v.label}
          </button>
        ))}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-warm-muted"
          >
            Закрыть
          </button>
        )}
      </div>
    </div>
  )
}

export function ResultEffortSummary({ resultEffort, className }) {
  if (!resultEffort?.verdict) return null

  return (
    <div
      className={clsx(
        'rounded-xl border border-cream-dark/50 bg-cream/30 px-4 py-3',
        className,
      )}
    >
      <p className="m-0 text-xs font-medium text-warm-muted">
        Оценка результата / затрат
      </p>
      {resultEffort.gain && (
        <p className="mt-2 m-0 text-sm text-warm-text">
          <span className="text-warm-muted">Получу: </span>
          {resultEffort.gain}
        </p>
      )}
      {resultEffort.cost && (
        <p className="mt-1 m-0 text-sm text-warm-text">
          <span className="text-warm-muted">Отдам: </span>
          {resultEffort.cost}
        </p>
      )}
      <p className="mt-2 m-0 text-sm font-medium text-warm-text">
        {getVerdictLabel(resultEffort.verdict)}
      </p>
    </div>
  )
}
