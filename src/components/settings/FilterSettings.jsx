import { useState } from 'react'
import clsx from 'clsx'
import { SlidersHorizontal, Target, X } from 'lucide-react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { buildFilterCriteria } from '../../lib/filterUtils'
import SettingsSection from './SettingsSection'

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
 <>
 <SettingsSection
 icon={Target}
 title="Личная миссия"
 description="Первый критерий при разборе: «Это про твою миссию?». Без миссии спросим: «Стоит ли это моей энергии?»"
 >
 <textarea
 value={missionDraft}
 onChange={(e) => setMissionDraft(e.target.value)}
 placeholder="Например: здоровье, творчество, семья…"
 rows={3}
 className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint outline-none transition focus:border-line-strong focus:ring-2 focus:ring-accent/30"
 />

 <div className="mt-3 flex items-center gap-3">
 <button
 type="button"
 onClick={handleSaveMission}
 disabled={!missionDirty}
 className={clsx(
 'rounded-xl px-4 py-2 text-sm font-medium transition',
 missionDirty
 ? 'bg-accent text-white hover:bg-accent-hover active:scale-[0.98]'
 : 'cursor-default bg-sunken text-ink-muted',
 )}
 >
 Сохранить
 </button>
 {missionSaved && (
 <span className="text-xs text-success">Сохранено</span>
 )}
 </div>
 </SettingsSection>

 <SettingsSection
 icon={SlidersHorizontal}
 title="Свои критерии"
 description="Дополнительные вопросы при разборе — по одному на экран. До 5 штук."
 >
 {previewCriteria.length > 0 && (
 <p className="rounded-lg bg-sunken/60 px-3 py-2 text-xs leading-relaxed text-ink-muted">
 Сейчас в фильтре: {previewCriteria.map((c) => c.label).join(' → ')}
 </p>
 )}

 {filterCriteria.length > 0 && (
 <ul className="mt-3 flex list-none flex-col gap-2 p-0">
 {filterCriteria.map((criterion) => (
 <li
 key={criterion.id}
 className="flex items-center gap-2 rounded-xl border border-line/50 bg-surface px-3 py-2.5"
 >
 <span className="min-w-0 flex-1 text-sm text-ink">
 {criterion.label}
 </span>
 <button
 type="button"
 onClick={() => removeFilterCriterion(criterion.id)}
 aria-label="Удалить критерий"
 className="shrink-0 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
 >
 <X className="h-4 w-4" strokeWidth={1.75} />
 </button>
 </li>
 ))}
 </ul>
 )}

 <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start">
 <input
 type="text"
 value={newCriterion}
 onChange={(e) => {
 setNewCriterion(e.target.value)
 setCriterionError('')
 }}
 onKeyDown={(e) => {
 if (e.isComposing) return
 if (e.key === 'Enter') {
 e.preventDefault()
 handleAddCriterion()
 }
 }}
 disabled={atCriterionLimit}
 placeholder={atCriterionLimit ? 'Достигнут лимит' : 'Новый критерий…'}
 className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition focus:border-line-strong focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
 />
 <button
 type="button"
 onClick={handleAddCriterion}
 disabled={atCriterionLimit}
 className={clsx(
 'shrink-0 rounded-xl border px-4 py-2.5 text-sm font-medium transition',
 atCriterionLimit
 ? 'cursor-not-allowed border-line text-ink-muted'
 : 'border-line text-ink hover:border-line-strong hover:bg-sunken/60',
 )}
 >
 Добавить
 </button>
 </div>

 {criterionError && (
 <p className="mt-2 text-xs text-accent">{criterionError}</p>
 )}

 <p className="mt-3 text-xs text-ink-muted">{filterCriteria.length} из 5</p>
 </SettingsSection>
 </>
 )
}
