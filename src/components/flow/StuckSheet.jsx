import { useCardsStore } from '../../store/useCardsStore'
import { useAppStore, TABS } from '../../store/useAppStore'
import Sheet from '../ui/Sheet'

export default function StuckSheet({ open, stuckCards, onClose }) {
 const moveKanbanCard = useCardsStore((s) => s.moveKanbanCard)
 const removeCard = useCardsStore((s) => s.removeCard)
 const setTab = useAppStore((s) => s.setTab)

 return (
 <Sheet open={open} onClose={onClose} title="Застрявшие дела">
 <p className="m-0 text-sm text-ink-muted">
 {stuckCards.length}{' '}
 {stuckCards.length === 1 ? 'дело' : 'дела'} без движения больше 5 дней
 </p>

 <ul className="mt-4 flex max-h-48 list-none flex-col gap-2 overflow-y-auto p-0">
 {stuckCards.map((card) => (
 <li
 key={card.id}
 className="rounded-xl border border-line/50 bg-sunken/40 px-3 py-2 text-sm text-ink"
 >
 {card.text}
 </li>
 ))}
 </ul>

 <div className="mt-5 flex flex-col gap-2">
 <button
 type="button"
 onClick={() => {
 setTab(TABS.kanban)
 onClose()
 }}
 className="rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.98]"
 >
 Пересмотреть на канбане
 </button>
 <button
 type="button"
 onClick={() => {
 stuckCards.forEach((c) => moveKanbanCard(c.id, 'next_week'))
 onClose()
 }}
 className="rounded-xl border border-line py-2.5 text-sm text-ink-muted transition hover:border-line-strong hover:bg-sunken/60"
 >
 Перенести на след. неделю
 </button>
 <button
 type="button"
 onClick={() => {
 stuckCards.forEach((c) => removeCard(c.id))
 onClose()
 }}
 className="py-2 text-sm text-ink-muted transition hover:text-ink"
 >
 Отпустить
 </button>
 </div>
 </Sheet>
 )
}
