import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft } from 'lucide-react'
import clsx from 'clsx'
import { useCardsStore } from '../../store/useCardsStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { hapticTap } from '../../lib/haptics'
import {
 buildFilterCriteria,
 buildFilterDraft,
 incrementFilterHintCount,
 resolveFilterStep,
 sanitizeCriteriaResults,
 shouldShowSwipeHint,
} from '../../lib/filterUtils'
import StructuredCard from '../cards/StructuredCard'
import ResultEffortCalculator from '../flow/ResultEffortCalculator'

const SWIPE_THRESHOLD = 72

const ENERGY_OPTIONS = [
 { id: 'light', label: 'Лёгкое' },
 { id: 'medium', label: 'Среднее' },
 { id: 'heavy', label: 'Тяжёлое' },
]

function SwipeCard({ children, onSwipeLeft, onSwipeRight, hint }) {
 return (
 <div className="flex flex-col items-center gap-4">
 {hint && (
 <p className="m-0 text-center text-xs text-ink-muted">{hint}</p>
 )}
 <motion.div
 drag="x"
 dragConstraints={{ left: 0, right: 0 }}
 dragElastic={0.15}
 onDragEnd={(_, info) => {
 if (info.offset.x > SWIPE_THRESHOLD) onSwipeRight()
 else if (info.offset.x < -SWIPE_THRESHOLD) onSwipeLeft()
 }}
 className="w-full cursor-grab rounded-xl border border-line/50 bg-white px-6 py-8 shadow-sm active:cursor-grabbing"
 >
 {children}
 </motion.div>
 </div>
 )
}

function SwipeButtons({ leftLabel, rightLabel, onLeft, onRight, centerLabel, onCenter }) {
 return (
 <div className="flex flex-wrap items-center justify-center gap-2">
 <button
 type="button"
 onClick={onLeft}
 className="rounded-lg border border-line px-4 py-2 text-sm text-ink-muted hover:bg-sunken"
 >
 ← {leftLabel}
 </button>
 {centerLabel && onCenter && (
 <button
 type="button"
 onClick={onCenter}
 className="rounded-lg px-4 py-2 text-sm text-ink-muted hover:bg-sunken"
 >
 {centerLabel}
 </button>
 )}
 <button
 type="button"
 onClick={onRight}
 className="rounded-lg border border-line px-4 py-2 text-sm text-ink-muted hover:bg-sunken"
 >
 {rightLabel} →
 </button>
 </div>
 )
}

export default function FilterFlow({ cardId, onClose }) {
 const card = useCardsStore((s) => s.cards.find((c) => c.id === cardId))
 const updateCardFilterFields = useCardsStore((s) => s.updateCardFilterFields)
 const commitCardToPull = useCardsStore((s) => s.commitCardToPull)
 const resetCardFilterProgress = useCardsStore((s) => s.resetCardFilterProgress)
 const removeCard = useCardsStore((s) => s.removeCard)

 const personalMission = useSettingsStore((s) => s.personalMission)
 const filterCriteria = useSettingsStore((s) => s.filterCriteria)
 const investmentTags = useSettingsStore((s) => s.investmentTags)

 const criteria = useMemo(
 () => buildFilterCriteria(personalMission, filterCriteria),
 [personalMission, filterCriteria],
 )

 const initialDraft = useMemo(
 () => (card ? buildFilterDraft(card, criteria) : null),
 [card, criteria],
 )

 const [step, setStep] = useState(() =>
 card ? resolveFilterStep(card, criteria) : 0,
 )
 const [draft, setDraft] = useState(() => initialDraft ?? buildFilterDraft({}, criteria))
 const [showCalculator, setShowCalculator] = useState(false)
 const showHint = shouldShowSwipeHint()

 if (!card || card.status !== 'raw' || !initialDraft) return null

 const totalSteps = 1 + criteria.length + 1
 const clampedStep = Math.min(step, totalSteps - 1)
 const displayStep =
 clampedStep > 0 &&
 clampedStep < totalSteps - 1 &&
 !criteria[clampedStep - 1]
 ? totalSteps - 1
 : clampedStep
 const showWantStep = displayStep === 0
 const showFinalStep = displayStep === totalSteps - 1
 const activeCriterion =
 displayStep > 0 && displayStep < totalSteps - 1
 ? criteria[displayStep - 1]
 : null

 const patchDraft = (fields) => {
 const nextFields = { ...fields }
 if (nextFields.missionCriteriaResults) {
 nextFields.missionCriteriaResults = sanitizeCriteriaResults(
 nextFields.missionCriteriaResults,
 criteria,
 )
 }

 setDraft((prev) => ({ ...prev, ...nextFields }))
 updateCardFilterFields(cardId, nextFields)
 }

 const handleWantMust = (value) => {
 patchDraft({ wantMust: value })
 incrementFilterHintCount()
 setStep(1)
 }

 const handleCriterionAnswer = (answer) => {
 const results = [...draft.missionCriteriaResults]
 const existing = results.findIndex((r) => r.criterionId === activeCriterion.id)
 const entry = { criterionId: activeCriterion.id, answer }

 if (existing >= 0) results[existing] = entry
 else results.push(entry)

 patchDraft({ missionCriteriaResults: results })
 setStep((s) => s + 1)
 }

 const handleCommit = () => {
 updateCardFilterFields(cardId, {
 ...draft,
 energyCost: draft.energyCost || 'medium',
 })
 const result = commitCardToPull(cardId)
 if (!result.ok) return
 hapticTap()
 onClose()
 }

 const handleUnclear = () => {
 resetCardFilterProgress(cardId)
 onClose()
 }

 const handleRelease = () => {
 removeCard(cardId)
 onClose()
 }

 return (
 <div className="fixed inset-0 z-30 flex flex-col bg-canvas md:static md:z-auto md:min-h-0 md:overflow-hidden md:border-l md:border-line/60">
 <header className="flex shrink-0 items-center gap-3 border-b border-line/60 bg-white/40 px-4 py-4 md:px-6">
 <button
 type="button"
 onClick={onClose}
 aria-label="Назад"
 className="rounded-lg p-2 text-ink-muted hover:bg-sunken md:hidden"
 >
 <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
 </button>
 <div className="min-w-0 flex-1">
 <h3 className="m-0 text-lg font-medium text-ink">
 {showWantStep && 'Хочу или должен?'}
 {activeCriterion && activeCriterion.label}
 {showFinalStep && 'Куда направить?'}
 </h3>
 <p className="mt-0.5 text-xs text-ink-muted">
 Шаг {displayStep + 1} из {totalSteps}
 </p>
 </div>
 <button
 type="button"
 onClick={onClose}
 className="hidden rounded-lg px-3 py-1.5 text-sm text-ink-muted hover:bg-sunken md:block"
 >
 Закрыть
 </button>
 </header>

 <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
 {showWantStep && (
 <div className="mx-auto flex w-full max-w-md flex-col gap-6">
 <SwipeCard
 hint={showHint ? '← Должен · Хочу →' : null}
 onSwipeLeft={() => handleWantMust('must')}
 onSwipeRight={() => handleWantMust('want')}
 >
 <p className="m-0 text-center text-base leading-relaxed text-ink">
 {card.text}
 </p>
 </SwipeCard>
 <SwipeButtons
 leftLabel="Должен"
 rightLabel="Хочу"
 onLeft={() => handleWantMust('must')}
 onRight={() => handleWantMust('want')}
 centerLabel="Не знаю"
 onCenter={() => handleWantMust('unknown')}
 />
 </div>
 )}

 {activeCriterion && (
 <div className="mx-auto flex w-full max-w-md flex-col gap-6">
 <SwipeCard
 onSwipeLeft={() => handleCriterionAnswer('no')}
 onSwipeRight={() => handleCriterionAnswer('yes')}
 >
 <p className="m-0 text-center text-base leading-relaxed text-ink">
 {card.text}
 </p>
 </SwipeCard>
 <SwipeButtons
 leftLabel="Нет"
 rightLabel="Да"
 onLeft={() => handleCriterionAnswer('no')}
 onRight={() => handleCriterionAnswer('yes')}
 centerLabel="Пропустить"
 onCenter={() => handleCriterionAnswer('skip')}
 />
 </div>
 )}

 {showFinalStep && (
 <div className="mx-auto flex w-full max-w-md flex-col gap-6">
 <StructuredCard
 card={{ ...card, ...draft, energyCost: draft.energyCost || 'medium' }}
 />

 <div>
 <p className="m-0 text-xs font-medium text-ink-muted">
 Куда инвестирую время (необязательно)
 </p>
 <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
 {investmentTags.map((tag) => (
 <button
 key={tag}
 type="button"
 onClick={() =>
 patchDraft({
 timeInvestment:
 draft.timeInvestment === tag ? null : tag,
 })
 }
 className={clsx(
 'shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors',
 draft.timeInvestment === tag
 ? 'bg-accent text-white'
 : 'border border-line bg-white text-ink-muted hover:bg-sunken',
 )}
 >
 {tag}
 </button>
 ))}
 </div>
 </div>

 <div>
 <p className="m-0 text-xs font-medium text-ink-muted">
 Энергозатратность (необязательно)
 </p>
 <div className="mt-2 flex flex-wrap gap-2">
 {ENERGY_OPTIONS.map((opt) => (
 <button
 key={opt.id}
 type="button"
 onClick={() =>
 patchDraft({
 energyCost:
 draft.energyCost === opt.id ? null : opt.id,
 })
 }
 className={clsx(
 'rounded-full px-3 py-1.5 text-xs transition-colors',
 (draft.energyCost || 'medium') === opt.id
 ? 'bg-accent text-white'
 : 'border border-line bg-white text-ink-muted hover:bg-sunken',
 )}
 >
 {opt.label}
 </button>
 ))}
 </div>
 {draft.energyCost === 'heavy' && (
 <button
 type="button"
 onClick={() => setShowCalculator((v) => !v)}
 className="mt-2 text-xs text-accent hover:underline"
 >
 Оценить результат / затраты
 </button>
 )}
 {showCalculator && (
 <ResultEffortCalculator
 value={draft.resultEffort}
 onSave={(resultEffort) => patchDraft({ resultEffort })}
 onClose={() => setShowCalculator(false)}
 showSuggestions
 onSuggestUnclear={handleUnclear}
 onSuggestRelease={handleRelease}
 className="mt-4"
 />
 )}
 </div>

 <div className="flex flex-col gap-2">
 <button
 type="button"
 onClick={handleCommit}
 className="rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent-hover"
 >
 В поток
 </button>
 <button
 type="button"
 onClick={handleUnclear}
 className="rounded-lg border border-line py-3 text-sm text-ink-muted hover:bg-sunken"
 >
 Пока не ясно
 </button>
 <button
 type="button"
 onClick={handleRelease}
 className="py-2 text-sm text-ink-muted hover:text-ink"
 >
 Отпустить
 </button>
 </div>
 </div>
 )}
 </div>

 {!showFinalStep && displayStep > 0 && (
 <div className="shrink-0 border-t border-line/60 px-4 py-3 sm:px-6 md:px-8">
 <button
 type="button"
 onClick={() => setStep((s) => Math.max(0, s - 1))}
 className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
 >
 <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
 Назад
 </button>
 </div>
 )}
 </div>
 )
}
