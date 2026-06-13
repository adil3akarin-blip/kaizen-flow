import { useState } from 'react'
import { useCardsStore } from '../../store/useCardsStore'
import { useTimerStore } from '../../store/useTimerStore'
import { cardTotalMs, formatClock, formatDuration, localDateKey, sessionsForCard } from '../../lib/timerUtils'
import Sheet from '../ui/Sheet'
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
 <Sheet open={open} onClose={onClose} title="Редактировать">
 <StructuredCard card={card} compact />

 <TimerHistory cardId={card.id} />

 <textarea
 value={text}
 onChange={(e) => setText(e.target.value)}
 rows={3}
 className="mt-4 w-full resize-none rounded-xl border border-line bg-sunken/30 px-4 py-3 text-[15px] leading-relaxed text-ink outline-none focus:ring-2 focus:ring-accent/30"
 />

 <div className="mt-4 flex flex-col gap-2">
 <button
 type="button"
 onClick={handleSave}
 disabled={!text.trim()}
 className="rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-40"
 >
 Сохранить
 </button>

 {onMove && (
 <button
 type="button"
 onClick={onMove}
 className="rounded-xl border border-line py-2.5 text-sm text-ink transition hover:border-line-strong hover:bg-sunken/60"
 >
 Переместить в…
 </button>
 )}

 {card.status === 'wip' && (
 <button
 type="button"
 onClick={handleReleaseWip}
 className="rounded-xl border border-line py-2.5 text-sm text-ink-muted transition hover:border-line-strong hover:bg-sunken/60"
 >
 Вернуть в очередь
 </button>
 )}

 {(card.status === 'filtered' || card.status === 'wip') && (
 <button
 type="button"
 onClick={handleRefilter}
 className="rounded-xl border border-line py-2.5 text-sm text-ink-muted transition hover:border-line-strong hover:bg-sunken/60"
 >
 Разобрать заново
 </button>
 )}

 <button
 type="button"
 onClick={handleDelete}
 className="py-2 text-sm text-ink-muted transition hover:text-ink"
 >
 Удалить
 </button>
 </div>
 </Sheet>
 )
}
