import { AnimatePresence, motion } from 'framer-motion'
import { useCardsStore } from '../../store/useCardsStore'
import { useAppStore, TABS } from '../../store/useAppStore'

export default function StuckSheet({ open, stuckCards, onClose }) {
 const moveKanbanCard = useCardsStore((s) => s.moveKanbanCard)
 const removeCard = useCardsStore((s) => s.removeCard)
 const setTab = useAppStore((s) => s.setTab)

 return (
 <AnimatePresence>
 {open && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-40 flex items-end justify-center md:items-center md:p-6"
 >
 <button
 type="button"
 aria-label="Закрыть"
 onClick={onClose}
 className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
 />

 <motion.div
 initial={{ opacity: 0, y: 40 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 40 }}
 className="relative z-10 w-full max-w-md rounded-t-2xl border border-line/60 bg-white p-6 shadow-xl md:rounded-2xl"
 onClick={(e) => e.stopPropagation()}
 >
 <h3 className="m-0 text-lg font-medium text-ink">
 Застрявшие дела
 </h3>
 <p className="mt-2 text-sm text-ink-muted">
 {stuckCards.length}{' '}
 {stuckCards.length === 1 ? 'дело' : 'дела'} без движения больше
 5 дней
 </p>

 <ul className="mt-4 flex max-h-48 list-none flex-col gap-2 overflow-y-auto p-0">
 {stuckCards.map((card) => (
 <li
 key={card.id}
 className="rounded-lg border border-line/50 bg-canvas/30 px-3 py-2 text-sm text-ink"
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
 className="rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
 >
 Пересмотреть на канбане
 </button>
 <button
 type="button"
 onClick={() => {
 stuckCards.forEach((c) => moveKanbanCard(c.id, 'next_week'))
 onClose()
 }}
 className="rounded-lg border border-line py-2.5 text-sm text-ink-muted hover:bg-sunken"
 >
 Перенести на след. неделю
 </button>
 <button
 type="button"
 onClick={() => {
 stuckCards.forEach((c) => removeCard(c.id))
 onClose()
 }}
 className="py-2 text-sm text-ink-muted hover:text-ink"
 >
 Отпустить
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 )
}
