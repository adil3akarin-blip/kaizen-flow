import clsx from 'clsx'
import { resolveKanbanColumn } from '../../lib/kanbanUtils'
import Sheet from '../ui/Sheet'

export default function MoveCardSheet({ card, columns, open, onClose, onMove }) {
 if (!card) return null

 const currentColumnId = resolveKanbanColumn(card)

 return (
 <Sheet open={open} onClose={onClose} title="Переместить в…">
 <p className="m-0 line-clamp-2 text-sm text-ink-muted">{card.text}</p>

 <div className="mt-4 flex flex-col gap-2">
 {columns.map((col) => {
 const isCurrent = col.id === currentColumnId
 return (
 <button
 key={col.id}
 type="button"
 disabled={isCurrent}
 onClick={() => onMove(col.id)}
 className={clsx(
 'rounded-xl border px-4 py-3 text-left text-sm transition-colors',
 isCurrent
 ? 'cursor-default border-line/60 bg-sunken/50 text-ink-muted'
 : 'border-line text-ink hover:border-line-strong hover:bg-sunken/60',
 )}
 >
 {col.label}
 {isCurrent && (
 <span className="ml-2 text-xs text-ink-muted">(сейчас)</span>
 )}
 </button>
 )
 })}
 </div>
 </Sheet>
 )
}
