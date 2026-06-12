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
 'rounded-xl border border-line/50 bg-canvas/50 p-4',
 className,
 )}
 >
 <p className="m-0 text-sm font-medium text-ink">
 Оценка сохранена
 </p>
 <p className="mt-2 text-sm leading-relaxed text-ink-muted">
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
 className="rounded-lg border border-line py-2.5 text-sm text-ink hover:bg-sunken"
 >
 Пока не ясно
 </button>
 <button
 type="button"
 onClick={() => {
 onSuggestRelease?.()
 onClose?.()
 }}
 className="rounded-lg border border-line py-2.5 text-sm text-ink-muted hover:bg-sunken"
 >
 Отпустить
 </button>
 <button
 type="button"
 onClick={onClose}
 className="py-2 text-sm text-ink-muted hover:text-ink"
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
 'rounded-xl border border-line/50 bg-canvas/50 p-4',
 className,
 )}
 >
 <p className="m-0 text-sm font-medium text-ink">
 Результат / Затраты
 </p>
 <p className="mt-1 text-xs text-ink-muted">
 Сначала осознание и оценка, потом действие
 </p>

 {activeVerdict && !savedVerdict && (
 <p className="mt-3 text-xs text-ink-muted">
 Вердикт:{' '}
 <span className="font-medium text-ink">
 {getVerdictLabel(activeVerdict)}
 </span>
 </p>
 )}

 <textarea
 value={gain}
 onChange={(e) => setGain(e.target.value)}
 placeholder="Что получу?"
 rows={2}
 className="mt-3 w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/30"
 />
 <textarea
 value={cost}
 onChange={(e) => setCost(e.target.value)}
 placeholder="Что отдам?"
 rows={2}
 className="mt-2 w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/30"
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
 ? 'bg-accent font-medium text-white'
 : 'border border-line text-ink-muted',
 )}
 >
 {v.label}
 </button>
 ))}
 {onClose && (
 <button
 type="button"
 onClick={onClose}
 className="px-3 py-1.5 text-xs text-ink-muted"
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
 'rounded-xl border border-line/50 bg-canvas/30 px-4 py-3',
 className,
 )}
 >
 <p className="m-0 text-xs font-medium text-ink-muted">
 Оценка результата / затрат
 </p>
 {resultEffort.gain && (
 <p className="mt-2 m-0 text-sm text-ink">
 <span className="text-ink-muted">Получу: </span>
 {resultEffort.gain}
 </p>
 )}
 {resultEffort.cost && (
 <p className="mt-1 m-0 text-sm text-ink">
 <span className="text-ink-muted">Отдам: </span>
 {resultEffort.cost}
 </p>
 )}
 <p className="mt-2 m-0 text-sm font-medium text-ink">
 {getVerdictLabel(resultEffort.verdict)}
 </p>
 </div>
 )
}
