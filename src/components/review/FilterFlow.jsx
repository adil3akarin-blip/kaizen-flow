import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Zap } from 'lucide-react'
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
import { LIFE_SPHERES } from '../../lib/labelSets'

const SWIPE_THRESHOLD = 72

function SwipeCard({ children, onSwipeLeft, onSwipeRight, hint }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {hint && <p className="m-0 text-center text-xs text-ink-muted">{hint}</p>}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          if (info.offset.x > SWIPE_THRESHOLD) onSwipeRight()
          else if (info.offset.x < -SWIPE_THRESHOLD) onSwipeLeft()
        }}
        className="w-full cursor-grab rounded-2xl border border-line/60 bg-surface px-6 py-8 shadow-(--shadow-card) active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  )
}

function BigChoiceButton({ icon: Icon, label, description, onClick, colorClass }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex flex-1 flex-col items-center gap-2 rounded-2xl border border-line/60 bg-surface px-4 py-5 shadow-(--shadow-card) transition hover:border-line-strong hover:shadow-md active:scale-[0.98]',
        colorClass,
      )}
    >
      {Icon && <Icon className="h-6 w-6" strokeWidth={1.75} />}
      <span className="text-sm font-medium">{label}</span>
      {description && <span className="text-xs text-ink-muted">{description}</span>}
    </button>
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

  const [step, setStep] = useState(() => (card ? resolveFilterStep(card, criteria) : 0))
  const [draft, setDraft] = useState(() => initialDraft ?? buildFilterDraft({}, criteria))
  const showHint = shouldShowSwipeHint()

  if (!card || card.status !== 'raw' || !initialDraft) return null

  const totalSteps = 1 + criteria.length + 1
  const clampedStep = Math.min(step, totalSteps - 1)
  const displayStep =
    clampedStep > 0 && clampedStep < totalSteps - 1 && !criteria[clampedStep - 1]
      ? totalSteps - 1
      : clampedStep
  const showWantStep = displayStep === 0
  const showFinalStep = displayStep === totalSteps - 1
  const activeCriterion =
    displayStep > 0 && displayStep < totalSteps - 1 ? criteria[displayStep - 1] : null

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
    updateCardFilterFields(cardId, { ...draft })
    const result = commitCardToPull(cardId)
    if (!result.ok) return
    hapticTap()
    onClose()
  }

  const handleUnclear = () => { resetCardFilterProgress(cardId); onClose() }
  const handleRelease = () => { removeCard(cardId); onClose() }

  const progressPct = Math.round(((displayStep + 1) / totalSteps) * 100)

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-canvas md:static md:z-auto md:min-h-0 md:overflow-hidden md:border-l md:border-line/60">
      {/* progress bar */}
      <div className="h-1 w-full bg-line">
        <motion.div
          className="h-full bg-accent rounded-r-full"
          animate={{ width: `${progressPct}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      <header className="flex shrink-0 items-center gap-3 border-b border-line/60 bg-surface/80 px-4 py-4 md:px-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Назад"
          className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-sunken md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-[17px] font-semibold tracking-tight text-ink">
            {showWantStep && 'Хочу или должен?'}
            {activeCriterion && activeCriterion.label}
            {showFinalStep && 'Куда направить?'}
          </h3>
          <p className="mt-0.5 text-xs text-ink-faint">
            Шаг {displayStep + 1} из {totalSteps}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="hidden rounded-xl px-3 py-1.5 text-sm text-ink-muted hover:bg-sunken md:block transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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
              <p className="m-0 text-center text-[16px] leading-relaxed text-ink">{card.text}</p>
            </SwipeCard>
            <div className="flex gap-3">
              <BigChoiceButton
                icon={Zap}
                label="Должен"
                description="Обязательство"
                onClick={() => handleWantMust('must')}
                colorClass="text-ink-muted"
              />
              <BigChoiceButton
                icon={Heart}
                label="Хочу"
                description="Из интереса"
                onClick={() => handleWantMust('want')}
                colorClass="text-accent"
              />
            </div>
            <button
              type="button"
              onClick={() => handleWantMust('unknown')}
              className="mx-auto rounded-lg px-4 py-2.5 text-sm text-ink-faint hover:text-ink-muted transition"
            >
              Не знаю
            </button>
          </div>
        )}

        {activeCriterion && (
          <div className="mx-auto flex w-full max-w-md flex-col gap-6">
            <SwipeCard
              onSwipeLeft={() => handleCriterionAnswer('no')}
              onSwipeRight={() => handleCriterionAnswer('yes')}
            >
              <p className="m-0 text-center text-[16px] leading-relaxed text-ink">{card.text}</p>
            </SwipeCard>
            <div className="flex gap-3">
              <BigChoiceButton label="Нет" onClick={() => handleCriterionAnswer('no')} colorClass="text-ink-muted" />
              <BigChoiceButton label="Да" onClick={() => handleCriterionAnswer('yes')} colorClass="text-accent" />
            </div>
            <button
              type="button"
              onClick={() => handleCriterionAnswer('skip')}
              className="mx-auto rounded-lg px-4 py-2.5 text-sm text-ink-faint hover:text-ink-muted transition"
            >
              Пропустить
            </button>
          </div>
        )}

        {showFinalStep && (
          <div className="mx-auto flex w-full max-w-md flex-col gap-6">
            <StructuredCard card={{ ...card, ...draft }} />

            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Сфера жизни
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {LIFE_SPHERES.map((s) => {
                  const active = draft.sphere === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => patchDraft({ sphere: active ? null : s.id })}
                      className={clsx(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                        !active &&
                          'border-line bg-sunken text-ink-muted hover:text-ink',
                      )}
                      style={
                        active
                          ? { borderColor: `${s.dot}40`, background: s.soft, color: s.text }
                          : undefined
                      }
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: s.dot }}
                      />
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Куда инвестирую время
              </p>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {investmentTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => patchDraft({ timeInvestment: draft.timeInvestment === tag ? null : tag })}
                    className={clsx(
                      'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition',
                      draft.timeInvestment === tag
                        ? 'bg-accent-soft text-accent'
                        : 'bg-sunken text-ink-muted hover:text-ink',
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCommit}
                className="rounded-xl bg-accent py-3 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                В поток
              </button>
              <button
                type="button"
                onClick={handleUnclear}
                className="rounded-xl border border-line py-3 text-sm text-ink-muted transition hover:border-line-strong hover:bg-sunken/60"
              >
                Пока не ясно
              </button>
              <button
                type="button"
                onClick={handleRelease}
                className="py-2 text-sm text-danger transition hover:text-danger/70"
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
            className="-my-1 flex items-center gap-1 py-1 text-sm text-ink-muted hover:text-ink transition"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Назад
          </button>
        </div>
      )}
    </div>
  )
}
