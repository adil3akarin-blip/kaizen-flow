import { useEffect, useRef, useState } from 'react'
import {
  DragDropProvider,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { OptimisticSortingPlugin } from '@dnd-kit/dom/sortable'
import { move } from '@dnd-kit/helpers'
import clsx from 'clsx'
import { GripVertical, MoreHorizontal, Plus } from 'lucide-react'
import { useCardsStore } from '../../store/useCardsStore'
import { useBoardsStore } from '../../store/useBoardsStore'
import { selectBoardCards } from '../../lib/cardSelectors'
import { columnIds as getColumnIds } from '../../lib/boardUtils'
import {
  createEmptyBoardOrder,
  findCardBoardColumn,
  selectOrderedCardsInColumn,
  syncBoardOrder,
} from '../../lib/kanbanOrderUtils'
import { useFinePointerDesktop } from '../../lib/useFinePointerDesktop'
import BoardCardSheet from './BoardCardSheet'
import ColumnActionsSheet from './ColumnActionsSheet'

function AddCardRow({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  const commit = () => {
    const value = text.trim()
    if (value) onAdd(value)
    setText('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-left text-xs font-medium text-ink-faint transition hover:bg-sunken/60 hover:text-ink-muted"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
        Добавить карточку
      </button>
    )
  }

  return (
    <textarea
      autoFocus
      rows={2}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          commit()
        }
        if (e.key === 'Escape') {
          setText('')
          setOpen(false)
        }
      }}
      placeholder="Текст карточки…"
      className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-ink shadow-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
    />
  )
}

function ColumnHeader({ column, count, onRename, onOpenMenu }) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(column.label)
  const isDone = column.role === 'done'

  const commit = () => {
    const value = label.trim()
    if (value && value !== column.label) onRename(value)
    else setLabel(column.label)
    setEditing(false)
  }

  return (
    <div className="mb-2.5 flex items-center justify-between gap-2 px-0.5">
      {editing ? (
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setLabel(column.label)
              setEditing(false)
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-accent/40 bg-white px-1.5 py-0.5 text-sm font-semibold text-ink outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex min-w-0 items-center gap-1.5 text-left"
          title="Переименовать колонку"
        >
          <h3 className="m-0 truncate text-sm font-semibold text-ink">{column.label}</h3>
          {isDone && (
            <span className="shrink-0 rounded-full bg-success-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
              ✓
            </span>
          )}
        </button>
      )}

      <div className="flex shrink-0 items-center gap-0.5">
        <span className="rounded-full bg-canvas px-2 py-0.5 text-xs tabular-nums text-ink-muted">
          {count}
        </span>
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Настройки колонки"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition hover:bg-sunken hover:text-ink"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  )
}

function BoardCard({ card, index, group, dragEnabled, onOpen }) {
  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    group,
    disabled: !dragEnabled,
    transition: null,
    plugins: (defaults) => defaults.filter((p) => p !== OptimisticSortingPlugin),
  })

  return (
    <div
      ref={dragEnabled ? ref : undefined}
      className={clsx(
        'group relative rounded-xl border border-line/70 bg-white p-3 shadow-sm transition hover:border-accent/40 hover:shadow-md',
        dragEnabled && 'cursor-grab touch-none active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <button type="button" onClick={() => onOpen(card.id)} className="block w-full pr-5 text-left">
        <p className="m-0 whitespace-pre-wrap break-words text-[13px] leading-snug text-ink">
          {card.text}
        </p>
      </button>
      {dragEnabled && (
        <GripVertical
          className="absolute right-1 top-2.5 h-4 w-4 text-ink-faint/50 opacity-0 transition group-hover:opacity-100"
          strokeWidth={1.6}
        />
      )}
    </div>
  )
}

function Column({ column, cards, dragEnabled, onOpenCard, onAddCard, onRename, onOpenMenu }) {
  const { ref: dropRef, isDropTarget } = useDroppable({ id: column.id, type: 'column' })
  const isDone = column.role === 'done'
  const isEmpty = cards.length === 0

  return (
    <div className="flex w-[min(16rem,82vw)] shrink-0 snap-start flex-col md:w-72">
      <ColumnHeader column={column} count={cards.length} onRename={onRename} onOpenMenu={onOpenMenu} />
      <div
        ref={dropRef}
        className={clsx(
          'flex min-h-32 flex-1 flex-col gap-2 rounded-2xl border p-2 transition-colors md:min-h-48 md:p-2.5',
          isDropTarget && dragEnabled
            ? 'border-accent/40 bg-accent/5'
            : isDone
              ? 'border-success/20 bg-success-soft/40'
              : 'border-line/50 bg-white shadow-sm',
        )}
      >
        {cards.map((card, index) => (
          <BoardCard
            key={card.id}
            card={card}
            index={index}
            group={column.id}
            dragEnabled={dragEnabled}
            onOpen={onOpenCard}
          />
        ))}
        {isEmpty && (
          <p className="m-0 px-2 pt-1 text-center text-[11px] leading-snug text-ink-faint/80">
            {dragEnabled ? 'Перетащи карточку сюда' : 'Пока пусто'}
          </p>
        )}
        <AddCardRow onAdd={(text) => onAddCard(column.id, text)} />
      </div>
    </div>
  )
}

export default function CustomBoardView({ board }) {
  const cards = useCardsStore((s) => s.cards)
  const boardOrders = useCardsStore((s) => s.boardOrders)
  const setBoardOrder = useCardsStore((s) => s.setBoardOrder)
  const addBoardCard = useCardsStore((s) => s.addBoardCard)
  const applyBoardCardColumn = useCardsStore((s) => s.applyBoardCardColumn)
  const reassignColumnCards = useCardsStore((s) => s.reassignColumnCards)
  const syncColumnCardsStatus = useCardsStore((s) => s.syncColumnCardsStatus)

  const addColumn = useBoardsStore((s) => s.addColumn)
  const renameColumn = useBoardsStore((s) => s.renameColumn)
  const setColumnRole = useBoardsStore((s) => s.setColumnRole)
  const deleteColumn = useBoardsStore((s) => s.deleteColumn)

  const dragEnabled = useFinePointerDesktop()
  const snapshotRef = useRef(null)
  const isDraggingRef = useRef(false)
  const [openCardId, setOpenCardId] = useState(null)
  const [menuColumnId, setMenuColumnId] = useState(null)

  const boardCards = selectBoardCards(cards, board.id)
  const colIds = getColumnIds(board)
  const order = boardOrders[board.id] ?? createEmptyBoardOrder(colIds)

  // Keep the per-board order in sync with its columns + cards (skip mid-drag).
  useEffect(() => {
    if (isDraggingRef.current) return
    const state = useCardsStore.getState()
    const current = state.boardOrders[board.id] ?? createEmptyBoardOrder(colIds)
    const synced = syncBoardOrder(
      selectBoardCards(state.cards, board.id),
      current,
      colIds,
    )
    if (JSON.stringify(synced) !== JSON.stringify(current)) {
      setBoardOrder(board.id, synced)
    }
  }, [cards, board.id, colIds, setBoardOrder])

  const handleDragStart = () => {
    isDraggingRef.current = true
    snapshotRef.current = structuredClone(
      useCardsStore.getState().boardOrders[board.id] ?? createEmptyBoardOrder(colIds),
    )
  }

  const handleDragOver = (event) => {
    if (!snapshotRef.current || event.canceled) return
    setBoardOrder(board.id, move(snapshotRef.current, event))
  }

  const handleDragEnd = (event) => {
    isDraggingRef.current = false
    const snapshot = snapshotRef.current
    snapshotRef.current = null
    if (!snapshot) return

    if (event.canceled) {
      setBoardOrder(board.id, snapshot)
      return
    }
    const cardId = event.operation?.source?.id
    if (!cardId) {
      setBoardOrder(board.id, snapshot)
      return
    }
    const movedOrder = move(snapshot, event)
    setBoardOrder(board.id, movedOrder)
    const final = findCardBoardColumn(movedOrder, colIds, cardId)
    if (final) applyBoardCardColumn(String(cardId), final.columnId)
  }

  const handleDeleteColumn = (columnId) => {
    const fallback = board.columns.find((c) => c.id !== columnId)?.id
    if (!fallback) return
    reassignColumnCards(board.id, columnId, fallback)
    deleteColumn(board.id, columnId)
  }

  const openCard = openCardId ? boardCards.find((c) => c.id === openCardId) ?? null : null
  const menuColumn = menuColumnId
    ? board.columns.find((c) => c.id === menuColumnId) ?? null
    : null

  return (
    <>
      <DragDropProvider
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex w-max min-w-full snap-x snap-mandatory items-start gap-3 pb-2 pr-4 sm:gap-4 md:snap-none md:pr-0">
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={selectOrderedCardsInColumn(boardCards, order, column.id)}
              dragEnabled={dragEnabled}
              onOpenCard={setOpenCardId}
              onAddCard={(columnId, text) => addBoardCard(board.id, columnId, text)}
              onRename={(label) => renameColumn(board.id, column.id, label)}
              onOpenMenu={() => setMenuColumnId(column.id)}
            />
          ))}

          <div className="flex w-[min(11rem,60vw)] shrink-0 snap-start flex-col md:w-44">
            <div className="mb-2.5 h-7" />
            <button
              type="button"
              onClick={() => addColumn(board.id)}
              className="flex min-h-32 flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-line-strong/60 text-sm font-medium text-ink-faint transition hover:border-accent/40 hover:bg-accent/[0.03] hover:text-accent md:min-h-48"
            >
              <Plus className="h-5 w-5" strokeWidth={2} />
              Добавить колонку
            </button>
          </div>
        </div>

        <DragOverlay disabled={!dragEnabled}>
          {(source) => {
            const card = boardCards.find((c) => c.id === source.id)
            if (!card) return null
            return (
              <div className="rounded-xl border border-line/70 bg-white p-3 shadow-lg ring-2 ring-accent/30">
                <p className="m-0 whitespace-pre-wrap break-words text-[13px] leading-snug text-ink">
                  {card.text}
                </p>
              </div>
            )
          }}
        </DragOverlay>
      </DragDropProvider>

      <BoardCardSheet
        key={openCard?.id}
        card={openCard}
        board={board}
        open={Boolean(openCard)}
        onClose={() => setOpenCardId(null)}
      />

      <ColumnActionsSheet
        key={menuColumn?.id}
        column={menuColumn}
        canDelete={board.columns.length > 1}
        open={Boolean(menuColumn)}
        onClose={() => setMenuColumnId(null)}
        onRename={(label) => renameColumn(board.id, menuColumn.id, label)}
        onToggleDone={() => {
          setColumnRole(board.id, menuColumn.id, menuColumn.role === 'done' ? 'plain' : 'done')
          syncColumnCardsStatus(board.id, menuColumn.id)
        }}
        onDelete={() => handleDeleteColumn(menuColumn.id)}
      />
    </>
  )
}
