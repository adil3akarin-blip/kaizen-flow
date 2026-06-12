import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCardsStore } from '../../store/useCardsStore'
import { useTimerStore } from '../../store/useTimerStore'
import { cardTotalMs, formatClock, formatDuration, localDateKey, sessionsForCard } from '../../lib/timerUtils'
import StructuredCard from './StructuredCard'

function formatSessionDate(ts) {
  const d = new Date(ts)
  const today = localDateKey(Date.now())
  if (localDateKey(ts) === today) {
    return `Сегодня ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function TimerHistory({ cardId }) {
  const sessions = useTimerStore((s) => s.sessions)
  const cardSessions = sessionsForCard(sessions, cardId)
  if (cardSessions.length === 0) return null

  const total = cardTotalMs(sessions, cardId)

  return (
    <div className="mt-4 rounded-xl border border-line/60 bg-canvas/40 px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="m-0 text-xs font-semibold uppercase tracking-wider text-ink-faint">
          Время на задаче
        </p>
        <p className="m-0 text-sm font-semibold tabular-nums text-ink">
          {formatDuration(total)}
        </p>
      </div>
      <ul className="mt-2 flex list-none flex-col gap-1 p-0">
        {cardSessions.slice(0, 6).map((s) => (
          <li key={s.id} className="flex items-center justify-between text-xs text-ink-muted">
            <span>
              {formatSessionDate(s.startedAt)}
              {s.pomodorosCompleted > 0 && ` · 🍅 ${s.pomodorosCompleted}`}
            </span>
            <span className="tabular-nums">{formatClock(s.durationMs)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CardEditSheet({ card, open, onClose, onMove }) {
 const updateCardText = useCardsStore((s) => s.updateCardText)
 const removeCard = useCardsStore((s) => s.removeCard)
 const returnCardToInbox = useCardsStore((s) => s.returnCardToInbox)
 const releaseWip = useCardsStore((s) => s.releaseWip)

 if (!card) return null

 return (
 <CardEditSheetContent
 key={card.id}
 card={card}
 open={open}
 onClose={onClose}
 onMove={onMove}
 updateCardText={updateCardText}
 removeCard={removeCard}
 returnCardToInbox={returnCardToInbox}
 releaseWip={releaseWip}
 />
 )
}

function CardEditSheetContent({
 card,
 open,
 onClose,
 onMove,
 updateCardText,
 removeCard,
 returnCardToInbox,
 releaseWip,
}) {
 const [text, setText] = useState(card.text)

 const handleSave = () => {
 if (updateCardText(card.id, text)) onClose()
 }

 const handleDelete = () => {
 removeCard(card.id)
 onClose()
 }

 const handleRefilter = () => {
 returnCardToInbox(card.id)
 onClose()
 }

 const handleReleaseWip = () => {
 releaseWip()
 onClose()
 }

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
 transition={{ type: 'spring', stiffness: 400, damping: 30 }}
 className="relative z-10 w-full max-w-md rounded-t-2xl border border-line/60 bg-white p-6 shadow-xl md:rounded-2xl"
 onClick={(e) => e.stopPropagation()}
 >
 <h3 className="m-0 text-lg font-medium text-ink">
 Редактировать
 </h3>

 <div className="mt-4">
 <StructuredCard card={card} compact />
 </div>

 <TimerHistory cardId={card.id} />

 <textarea
 value={text}
 onChange={(e) => setText(e.target.value)}
 rows={3}
 className="mt-4 w-full resize-none rounded-xl border border-line bg-canvas/30 px-4 py-3 text-[15px] leading-relaxed text-ink outline-none focus:ring-2 focus:ring-accent/30"
 />

 <div className="mt-4 flex flex-col gap-2">
 <button
 type="button"
 onClick={handleSave}
 disabled={!text.trim()}
 className="rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40"
 >
 Сохранить
 </button>

 {onMove && (
 <button
 type="button"
 onClick={onMove}
 className="rounded-lg border border-line py-2.5 text-sm text-ink hover:bg-sunken"
 >
 Переместить в…
 </button>
 )}

 {card.status === 'wip' && (
 <button
 type="button"
 onClick={handleReleaseWip}
 className="rounded-lg border border-line py-2.5 text-sm text-ink-muted hover:bg-sunken"
 >
 Вернуть в очередь
 </button>
 )}

 {(card.status === 'filtered' || card.status === 'wip') && (
 <button
 type="button"
 onClick={handleRefilter}
 className="rounded-lg border border-line py-2.5 text-sm text-ink-muted hover:bg-sunken"
 >
 Разобрать заново
 </button>
 )}

 <button
 type="button"
 onClick={handleDelete}
 className="py-2 text-sm text-ink-muted hover:text-ink"
 >
 Удалить
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 )
}
