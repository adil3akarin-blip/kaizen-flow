import { useState } from 'react'
import clsx from 'clsx'
import { Check, StickyNote, Trash2 } from 'lucide-react'
import Sheet from '../ui/Sheet'
import { useCardsStore } from '../../store/useCardsStore'

// Parent passes key={card.id} so a fresh card remounts this with its own text —
// no syncing effect needed.
export default function BoardCardSheet({ card, board, open, onClose }) {
  const updateBoardCardText = useCardsStore((s) => s.updateBoardCardText)
  const applyBoardCardColumn = useCardsStore((s) => s.applyBoardCardColumn)
  const removeBoardCard = useCardsStore((s) => s.removeBoardCard)

  const [text, setText] = useState(card?.text ?? '')

  if (!card) return null

  const commitText = () => {
    if (text.trim() && text.trim() !== card.text) updateBoardCardText(card.id, text)
  }

  return (
    <Sheet open={open} onClose={onClose} title="Карточка" icon={StickyNote}>
      <div className="flex flex-col gap-5">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commitText}
          className="w-full resize-none rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
        />

        <div>
          <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Перенести в колонку
          </p>
          <div className="flex flex-col gap-1.5">
            {board.columns.map((column) => {
              const active = column.id === card.kanbanColumn
              return (
                <button
                  key={column.id}
                  type="button"
                  onClick={() => {
                    if (!active) applyBoardCardColumn(card.id, column.id)
                    onClose()
                  }}
                  className={clsx(
                    'flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition',
                    active
                      ? 'border-accent/40 bg-accent-soft text-ink'
                      : 'border-line text-ink-muted hover:border-line-strong hover:bg-sunken/60',
                  )}
                >
                  <span className="flex items-center gap-2">
                    {column.label}
                    {column.role === 'done' && (
                      <Check className="h-3.5 w-3.5 text-success" strokeWidth={3} />
                    )}
                  </span>
                  {active && <Check className="h-4 w-4 text-accent" strokeWidth={2.6} />}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            removeBoardCard(card.id)
            onClose()
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-danger/30 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/10"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
          Удалить карточку
        </button>
      </div>
    </Sheet>
  )
}
