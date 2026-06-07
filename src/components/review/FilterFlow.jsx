import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft } from 'lucide-react'
import clsx from 'clsx'
import { useCardsStore } from '../../store/useCardsStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { hapticTap } from '../../lib/haptics'
import {
  buildFilterCriteria,
  incrementFilterHintCount,
  shouldShowSwipeHint,
} from '../../lib/filterUtils'
import StructuredCard from '../cards/StructuredCard'

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
        <p className="m-0 text-center text-xs text-warm-muted">{hint}</p>
      )}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          if (info.offset.x > SWIPE_THRESHOLD) onSwipeRight()
          else if (info.offset.x < -SWIPE_THRESHOLD) onSwipeLeft()
        }}
        className="w-full cursor-grab rounded-xl border border-cream-dark/50 bg-white px-6 py-8 shadow-sm active:cursor-grabbing"
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
        className="rounded-lg border border-cream-dark px-4 py-2 text-sm text-warm-muted hover:bg-cream-dark"
      >
        ← {leftLabel}
      </button>
      {centerLabel && onCenter && (
        <button
          type="button"
          onClick={onCenter}
          className="rounded-lg px-4 py-2 text-sm text-warm-muted hover:bg-cream-dark"
        >
          {centerLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onRight}
        className="rounded-lg border border-cream-dark px-4 py-2 text-sm text-warm-muted hover:bg-cream-dark"
      >
        {rightLabel} →
      </button>
    </div>
  )
}

function CalculatorPanel({ card, onUpdate, onClose }) {
  const [gain, setGain] = useState(card.resultEffort?.gain || '')
  const [cost, setCost] = useState(card.resultEffort?.cost || '')

  const saveVerdict = (verdict) => {
    onUpdate({
      resultEffort: {
        gain: gain.trim(),
        cost: cost.trim(),
        verdict,
      },
    })
    onClose()
  }

  return (
    <div className="mt-4 rounded-xl border border-cream-dark/50 bg-cream/50 p-4">
      <p className="m-0 font-serif text-sm font-medium text-warm-text">
        Результат / Затраты
      </p>
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
        <button
          type="button"
          onClick={() => saveVerdict('yes')}
          className="rounded-lg bg-warm-accent px-3 py-1.5 text-xs font-medium text-white"
        >
          Да, стоит
        </button>
        <button
          type="button"
          onClick={() => saveVerdict('maybe')}
          className="rounded-lg border border-cream-dark px-3 py-1.5 text-xs text-warm-muted"
        >
          Сомневаюсь
        </button>
        <button
          type="button"
          onClick={() => saveVerdict('no')}
          className="rounded-lg border border-cream-dark px-3 py-1.5 text-xs text-warm-muted"
        >
          Нет
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-xs text-warm-muted"
        >
          Закрыть
        </button>
      </div>
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

  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState({
    wantMust: card?.wantMust ?? null,
    missionCriteriaResults: card?.missionCriteriaResults ?? [],
    timeInvestment: card?.timeInvestment ?? null,
    energyCost: card?.energyCost ?? null,
    resultEffort: card?.resultEffort ?? null,
  })
  const [showCalculator, setShowCalculator] = useState(false)
  const showHint = shouldShowSwipeHint()

  if (!card) return null

  const totalSteps = 1 + criteria.length + 1
  const isWantStep = step === 0
  const isFinalStep = step === totalSteps - 1
  const criterionIndex = step - 1
  const currentCriterion = !isWantStep && !isFinalStep ? criteria[criterionIndex] : null

  const patchDraft = (fields) => {
    setDraft((prev) => ({ ...prev, ...fields }))
    updateCardFilterFields(cardId, fields)
  }

  const handleWantMust = (value) => {
    patchDraft({ wantMust: value })
    incrementFilterHintCount()
    setStep(1)
  }

  const handleCriterionAnswer = (answer) => {
    const results = [...draft.missionCriteriaResults]
    const existing = results.findIndex((r) => r.criterionId === currentCriterion.id)
    const entry = { criterionId: currentCriterion.id, answer }

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
    commitCardToPull(cardId)
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
    <div className="fixed inset-0 z-30 flex flex-col bg-cream md:static md:z-auto md:min-h-0 md:overflow-hidden md:border-l md:border-cream-dark/60">
      <header className="flex shrink-0 items-center gap-3 border-b border-cream-dark/60 bg-white/40 px-4 py-4 md:px-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Назад"
          className="rounded-lg p-2 text-warm-muted hover:bg-cream-dark md:hidden"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="m-0 font-serif text-lg font-medium text-warm-text">
            {isWantStep && 'Хочу или должен?'}
            {currentCriterion && currentCriterion.label}
            {isFinalStep && 'Куда направить?'}
          </h3>
          <p className="mt-0.5 text-xs text-warm-muted">
            Шаг {step + 1} из {totalSteps}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="hidden rounded-lg px-3 py-1.5 text-sm text-warm-muted hover:bg-cream-dark md:block"
        >
          Закрыть
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
        {isWantStep && (
          <div className="mx-auto flex w-full max-w-md flex-col gap-6">
            <SwipeCard
              hint={showHint ? '← Должен · Хочу →' : null}
              onSwipeLeft={() => handleWantMust('must')}
              onSwipeRight={() => handleWantMust('want')}
            >
              <p className="m-0 text-center font-serif text-base leading-relaxed text-warm-text">
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

        {currentCriterion && (
          <div className="mx-auto flex w-full max-w-md flex-col gap-6">
            <SwipeCard
              onSwipeLeft={() => handleCriterionAnswer('no')}
              onSwipeRight={() => handleCriterionAnswer('yes')}
            >
              <p className="m-0 text-center font-serif text-base leading-relaxed text-warm-text">
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

        {isFinalStep && (
          <div className="mx-auto flex w-full max-w-md flex-col gap-6">
            <StructuredCard
              card={{ ...card, ...draft, energyCost: draft.energyCost || 'medium' }}
            />

            <div>
              <p className="m-0 text-xs font-medium text-warm-muted">
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
                        ? 'bg-warm-accent text-white'
                        : 'border border-cream-dark bg-white text-warm-muted hover:bg-cream-dark',
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="m-0 text-xs font-medium text-warm-muted">
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
                        ? 'bg-warm-accent text-white'
                        : 'border border-cream-dark bg-white text-warm-muted hover:bg-cream-dark',
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
                  className="mt-2 text-xs text-warm-accent hover:underline"
                >
                  Оценить результат / затраты
                </button>
              )}
              {showCalculator && (
                <CalculatorPanel
                  card={{ ...card, ...draft }}
                  onUpdate={patchDraft}
                  onClose={() => setShowCalculator(false)}
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCommit}
                className="rounded-lg bg-warm-accent py-3 text-sm font-medium text-white hover:bg-warm-accent-hover"
              >
                В поток
              </button>
              <button
                type="button"
                onClick={handleUnclear}
                className="rounded-lg border border-cream-dark py-3 text-sm text-warm-muted hover:bg-cream-dark"
              >
                Пока не ясно
              </button>
              <button
                type="button"
                onClick={handleRelease}
                className="py-2 text-sm text-warm-muted hover:text-warm-text"
              >
                Отпустить
              </button>
            </div>
          </div>
        )}
      </div>

      {!isFinalStep && step > 0 && (
        <div className="shrink-0 border-t border-cream-dark/60 px-4 py-3 sm:px-6 md:px-8">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="flex items-center gap-1 text-sm text-warm-muted hover:text-warm-text"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            Назад
          </button>
        </div>
      )}
    </div>
  )
}
