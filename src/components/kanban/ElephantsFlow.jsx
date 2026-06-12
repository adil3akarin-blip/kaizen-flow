import { useMemo, useState } from 'react'
import { useCardsStore } from '../../store/useCardsStore'
import { useAppStore } from '../../store/useAppStore'
import { useAchievementsStore } from '../../store/useAchievementsStore'
import { monthKey } from '../../lib/achievementsUtils'
import StructuredCard from '../cards/StructuredCard'

const STEPS = ['done', 'carry', 'elephant']

export default function ElephantsFlow({ onClose, onOpenYear }) {
 const cards = useCardsStore((s) => s.cards)
 const removeCard = useCardsStore((s) => s.removeCard)
 const moveKanbanCard = useCardsStore((s) => s.moveKanbanCard)
 const setElephantsPending = useAppStore((s) => s.setElephantsPending)
 const setElephant = useAchievementsStore((s) => s.setElephant)

 const [stepIndex, setStepIndex] = useState(0)
 const [selectedCarry, setSelectedCarry] = useState(() => new Set())
 const [elephantChoice, setElephantChoice] = useState('')

 const doneCards = useMemo(() => {
 const now = new Date()
 return cards.filter((c) => {
 if (c.status !== 'done') return false
 const ts = c.completedAt ?? c.createdAt
 if (ts == null) return true
 const d = new Date(ts)
 return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
 })
 }, [cards])

 const carryCards = useMemo(
 () =>
 cards.filter(
 (c) =>
 c.status === 'filtered' &&
 c.kanbanColumn !== 'done' &&
 c.kanbanColumn !== 'progress',
 ),
 [cards],
 )

 const step = STEPS[stepIndex]

 const toggleCarry = (id) => {
 setSelectedCarry((prev) => {
 const next = new Set(prev)
 if (next.has(id)) next.delete(id)
 else next.add(id)
 return next
 })
 }

 const finish = () => {
 carryCards.forEach((card) => {
 if (!selectedCarry.has(card.id)) {
 moveKanbanCard(card.id, 'next_week')
 }
 })
 // Save the month's "elephant" so it shows up in the Музей побед.
 const now = new Date()
 setElephant(monthKey(now.getFullYear(), now.getMonth() + 1), elephantChoice)
 setElephantsPending(false)
 onClose()
 }

 return (
 <div className="fixed inset-0 z-50 flex min-h-0 flex-col overflow-hidden bg-canvas">
 <header className="shrink-0 border-b border-line/60 bg-white/40 px-4 py-4 sm:px-6 md:px-8">
 <button
 type="button"
 onClick={onClose}
 className="text-sm text-ink-muted hover:text-ink"
 >
 Позже
 </button>
 <h2 className="m-0 mt-2 text-xl font-semibold tracking-tight text-ink">
 Итоги месяца
 </h2>
 <p className="mt-1 text-sm text-ink-muted">
 Шаг {stepIndex + 1} из {STEPS.length}
 </p>
 </header>

 <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
 {step === 'done' && (
 <>
 <p className="m-0 text-base text-ink">
 Сделано за месяц
 </p>
 <p className="mt-1 text-sm text-ink-muted">
 Не KPI — просто вспомнить, что уже двигается
 </p>
 <ul className="mt-4 flex list-none flex-col gap-2 p-0">
 {doneCards.length > 0 ? (
 doneCards.map((card) => (
 <li key={card.id}>
 <StructuredCard card={card} compact />
 </li>
 ))
 ) : (
 <li className="text-sm text-ink-muted">
 Пока нет завершённых дел в этом месяце
 </li>
 )}
 </ul>
 </>
 )}

 {step === 'carry' && (
 <>
 <p className="m-0 text-base text-ink">
 Что переносим на следующий месяц?
 </p>
 <p className="mt-1 text-sm text-ink-muted">
 Снятые галочки — мягкий перенос; «Отпустить» удалит карточку
 </p>
 <ul className="mt-4 flex list-none flex-col gap-2 p-0">
 {carryCards.map((card) => (
 <li
 key={card.id}
 className="flex items-start gap-3 rounded-xl border border-line/50 bg-white p-3"
 >
 <input
 type="checkbox"
 checked={selectedCarry.has(card.id)}
 onChange={() => toggleCarry(card.id)}
 className="mt-1"
 />
 <div className="min-w-0 flex-1">
 <p className="m-0 text-sm text-ink">{card.text}</p>
 <button
 type="button"
 onClick={() => removeCard(card.id)}
 className="mt-2 text-xs text-ink-muted hover:text-ink"
 >
 Отпустить
 </button>
 </div>
 </li>
 ))}
 {carryCards.length === 0 && (
 <li className="text-sm text-ink-muted">
 Незавершённых дел нет — отлично
 </li>
 )}
 </ul>
 </>
 )}

 {step === 'elephant' && (
 <>
 <p className="m-0 text-base text-ink">
 Слон месяца
 </p>
 <p className="mt-1 text-sm text-ink-muted">
 Одно главное достижение — попадёт в музей побед
 </p>
 <textarea
 value={elephantChoice}
 onChange={(e) => setElephantChoice(e.target.value)}
 placeholder="Что было самым значимым?"
 rows={3}
 className="mt-4 w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none focus:ring-2 focus:ring-accent/30"
 />
 <button
 type="button"
 onClick={onOpenYear}
 className="mt-3 text-sm text-accent hover:underline"
 >
 Открыть музей побед
 </button>
 </>
 )}
 </div>

 <footer className="shrink-0 border-t border-line/60 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 md:px-8 md:pb-4">
 {stepIndex < STEPS.length - 1 ? (
 <button
 type="button"
 onClick={() => {
 if (step === 'done') {
 setSelectedCarry(new Set(carryCards.map((c) => c.id)))
 }
 setStepIndex((i) => i + 1)
 }}
 className="w-full rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent-hover"
 >
 Далее
 </button>
 ) : (
 <button
 type="button"
 onClick={finish}
 className="w-full rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent-hover"
 >
 Завершить
 </button>
 )}
 </footer>
 </div>
 )
}
