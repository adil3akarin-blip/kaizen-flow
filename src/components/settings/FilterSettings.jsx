import { useState } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { buildFilterCriteria } from '../../lib/filterUtils'

export default function FilterSettings() {
  const personalMission = useSettingsStore((s) => s.personalMission)
  const filterCriteria = useSettingsStore((s) => s.filterCriteria)
  const setPersonalMission = useSettingsStore((s) => s.setPersonalMission)
  const addFilterCriterion = useSettingsStore((s) => s.addFilterCriterion)
  const removeFilterCriterion = useSettingsStore((s) => s.removeFilterCriterion)

  const [missionDraft, setMissionDraft] = useState(personalMission)
  const [missionSaved, setMissionSaved] = useState(false)
  const [newCriterion, setNewCriterion] = useState('')
  const [criterionError, setCriterionError] = useState('')

  const missionDirty = missionDraft.trim() !== personalMission
  const previewCriteria = buildFilterCriteria(personalMission, filterCriteria)
  const atCriterionLimit = filterCriteria.length >= 5

  const handleSaveMission = () => {
    setPersonalMission(missionDraft.trim())
    setMissionSaved(true)
    setTimeout(() => setMissionSaved(false), 2000)
  }

  const handleAddCriterion = () => {
    const ok = addFilterCriterion(newCriterion)
    if (!ok) {
      setCriterionError(
        atCriterionLimit ? 'Не больше 5 критериев' : 'Введите текст критерия',
      )
      return
    }
    setNewCriterion('')
    setCriterionError('')
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-cream-dark/50 bg-white p-4 shadow-sm sm:p-5">
        <p className="m-0 font-serif text-base font-medium text-warm-text">
          Личная миссия
        </p>
        <p className="mt-2 text-sm leading-relaxed text-warm-muted">
          Первый критерий при разборе: «Это про твою миссию?». Без миссии
          спросим: «Стоит ли это моей энергии?»
        </p>

        <textarea
          value={missionDraft}
          onChange={(e) => setMissionDraft(e.target.value)}
          placeholder="Например: здоровье, творчество, семья…"
          rows={3}
          className="mt-4 w-full resize-none rounded-xl border border-cream-dark bg-white px-4 py-3 text-[15px] leading-relaxed text-warm-text placeholder:text-warm-muted/60 outline-none transition-shadow focus:shadow-md focus:ring-2 focus:ring-warm-accent/30"
        />

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveMission}
            disabled={!missionDirty}
            className={clsx(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              missionDirty
                ? 'bg-warm-accent text-white hover:bg-warm-accent-hover'
                : 'cursor-default bg-cream-dark text-warm-muted',
            )}
          >
            Сохранить
          </button>
          {missionSaved && (
            <span className="text-xs text-warm-muted">Сохранено</span>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-cream-dark/50 bg-white p-4 shadow-sm sm:p-5">
        <p className="m-0 font-serif text-base font-medium text-warm-text">
          Свои критерии
        </p>
        <p className="mt-2 text-sm leading-relaxed text-warm-muted">
          Дополнительные вопросы при разборе — по одному на экран. До 5 штук.
        </p>

        {previewCriteria.length > 0 && (
          <p className="mt-3 rounded-lg bg-cream/80 px-3 py-2 text-xs leading-relaxed text-warm-muted">
            Сейчас в фильтре: {previewCriteria.map((c) => c.label).join(' → ')}
          </p>
        )}

        {filterCriteria.length > 0 && (
          <ul className="mt-4 flex list-none flex-col gap-2 p-0">
            {filterCriteria.map((criterion) => (
              <li
                key={criterion.id}
                className="flex items-center gap-2 rounded-xl border border-cream-dark/40 px-3 py-2.5"
              >
                <span className="min-w-0 flex-1 text-sm text-warm-text">
                  {criterion.label}
                </span>
                <button
                  type="button"
                  onClick={() => removeFilterCriterion(criterion.id)}
                  aria-label="Удалить критерий"
                  className="shrink-0 rounded-lg p-1.5 text-warm-muted transition-colors hover:bg-cream-dark hover:text-warm-text"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start">
          <input
            type="text"
            value={newCriterion}
            onChange={(e) => {
              setNewCriterion(e.target.value)
              setCriterionError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddCriterion()
              }
            }}
            disabled={atCriterionLimit}
            placeholder={
              atCriterionLimit ? 'Достигнут лимит' : 'Новый критерий…'
            }
            className="min-w-0 flex-1 rounded-xl border border-cream-dark bg-white px-4 py-2.5 text-sm text-warm-text placeholder:text-warm-muted/60 outline-none transition-shadow focus:shadow-md focus:ring-2 focus:ring-warm-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleAddCriterion}
            disabled={atCriterionLimit}
            className={clsx(
              'shrink-0 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors sm:py-2.5',
              atCriterionLimit
                ? 'cursor-not-allowed border-cream-dark text-warm-muted'
                : 'border-cream-dark text-warm-text hover:bg-cream-dark',
            )}
          >
            Добавить
          </button>
        </div>

        {criterionError && (
          <p className="mt-2 text-xs text-warm-accent">{criterionError}</p>
        )}

        <p className="mt-3 text-xs text-warm-muted">
          {filterCriteria.length} из 5
        </p>
      </section>
    </div>
  )
}
