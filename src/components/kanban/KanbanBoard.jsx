import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DragDropProvider,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { OptimisticSortingPlugin } from '@dnd-kit/dom/sortable'
import { move } from '@dnd-kit/helpers'
import { MoreHorizontal } from 'lucide-react'
import clsx from 'clsx'
import { useCardsStore } from '../../store/useCardsStore'
import { useEnergyStore } from '../../store/useEnergyStore'
import { selectKanbanCards, selectWipCard } from '../../lib/cardSelectors'
import {
  columnOrderEquals,
  findCardColumnIndex,
  previewColumnOrderFromDrag,
  resolveDragTargetPosition,
  selectOrderedCardsInColumn,
  syncColumnOrderWithCards,
} from '../../lib/kanbanOrderUtils'
import {
  DAY_COLUMNS,
  IN_PROGRESS_COLUMN,
  WEEK_COLUMNS,
  resolveKanbanColumn,
} from '../../lib/kanbanUtils'
import { useFinePointerDesktop } from '../../lib/useFinePointerDesktop'
import { isCardStuck } from '../../lib/stuckDetector'
import StructuredCard from '../cards/StructuredCard'
import CardEditSheet from '../cards/CardEditSheet'
import MoveCardSheet from './MoveCardSheet'
import WipGateDialog from '../flow/WipGateDialog'

function resolveInitialPosition(snapshot, cardId, kanbanCards) {
  const fromOrder = findCardColumnIndex(snapshot, cardId)
  if (fromOrder) return fromOrder

  const card = kanbanCards.find((item) => item.id === cardId)
  if (!card) return null

  const columnId = resolveKanbanColumn(card)
  const visibleCards = selectOrderedCardsInColumn(
    kanbanCards,
    snapshot,
    columnId,
  )
  const index = visibleCards.findIndex((item) => item.id === cardId)
  if (index === -1) return null

  return { columnId, index }
}

function resolveFinalOrder(snapshot, event, cardId, kanbanCards) {
  const currentOrder = useCardsStore.getState().columnOrder
  const initial = resolveInitialPosition(snapshot, cardId, kanbanCards)
  const previewFinal = findCardColumnIndex(currentOrder, cardId)

  if (
    initial &&
    previewFinal &&
    (initial.columnId !== previewFinal.columnId ||
      initial.index !== previewFinal.index)
  ) {
    return { finalOrder: currentOrder, final: previewFinal, initial }
  }

  const dragTarget = resolveDragTargetPosition(
    event.operation,
    snapshot,
    kanbanCards,
  )
  if (dragTarget) {
    const finalOrder = previewColumnOrderFromDrag(
      snapshot,
      dragTarget.cardId,
      dragTarget.initialGroup,
      dragTarget.initialIndex,
      dragTarget.targetGroup,
      dragTarget.targetIndex,
    )
    const resolvedFinal = findCardColumnIndex(finalOrder, cardId)
    if (
      resolvedFinal &&
      initial &&
      (initial.columnId !== resolvedFinal.columnId ||
        initial.index !== resolvedFinal.index)
    ) {
      return { finalOrder, final: resolvedFinal, initial }
    }
  }

  const movedOrder = move(snapshot, event)
  const movedFinal = findCardColumnIndex(movedOrder, cardId)
  if (
    movedFinal &&
    initial &&
    (initial.columnId !== movedFinal.columnId ||
      initial.index !== movedFinal.index)
  ) {
    return { finalOrder: movedOrder, final: movedFinal, initial }
  }

  return { finalOrder: snapshot, final: initial, initial }
}

function KanbanColumn({ column, cards, dragEnabled, onMoveTap, onEditTap }) {
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: column.id,
    type: 'column',
  })

  return (
    <div className="flex w-[min(16rem,82vw)] shrink-0 snap-start flex-col sm:w-64">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="m-0 font-serif text-sm font-medium text-warm-text">
          {column.label}
        </h3>
        <span className="text-xs text-warm-muted">{cards.length}</span>
      </div>

      <div
        ref={dropRef}
        className={clsx(
          'flex min-h-[200px] flex-col gap-2 rounded-xl border border-cream-dark/40 bg-white/40 p-2 transition-colors',
          isDropTarget &&
            dragEnabled &&
            'border-warm-accent/50 bg-warm-accent/5',
        )}
      >
        {cards.map((card, index) => (
          <KanbanSortableCard
            key={card.id}
            card={card}
            index={index}
            group={column.id}
            dragEnabled={dragEnabled}
            onMoveTap={onMoveTap}
            onEditTap={onEditTap}
          />
        ))}
      </div>
    </div>
  )
}

function KanbanSortableCard({
  card,
  index,
  group,
  dragEnabled,
  onMoveTap,
  onEditTap,
}) {
  const stuck = isCardStuck(card)
  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    group,
    disabled: !dragEnabled,
    transition: null,
    plugins: (defaults) =>
      defaults.filter((plugin) => plugin !== OptimisticSortingPlugin),
  })

  return (
    <div
      ref={dragEnabled ? ref : undefined}
      className={clsx(
        'group relative select-none',
        dragEnabled && 'touch-none',
        stuck && 'rounded-xl ring-2 ring-amber-400/60',
        isDragging && 'opacity-40',
      )}
    >
      {dragEnabled ? (
        <div className="cursor-grab active:cursor-grabbing">
          <StructuredCard card={card} compact />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onMoveTap(card.id)}
          className="w-full text-left"
        >
          <StructuredCard card={card} compact />
        </button>
      )}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onEditTap(card.id)}
        aria-label="Ещё"
        className="absolute right-1 top-1 rounded-lg p-1 text-warm-muted opacity-100 transition-opacity hover:bg-cream-dark md:opacity-0 md:group-hover:opacity-100"
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  )
}

export default function KanbanBoard({ view }) {
  const cards = useCardsStore((s) => s.cards)
  const columnOrder = useCardsStore((s) => s.columnOrder)
  const setColumnOrder = useCardsStore((s) => s.setColumnOrder)
  const moveKanbanCard = useCardsStore((s) => s.moveKanbanCard)
  const completeWip = useCardsStore((s) => s.completeWip)
  const releaseWip = useCardsStore((s) => s.releaseWip)
  const recordHeavyCompletion = useEnergyStore((s) => s.recordHeavyCompletion)

  const dragEnabled = useFinePointerDesktop()
  const snapshotRef = useRef(null)
  const isDraggingRef = useRef(false)
  const dragSuspendRef = useRef(null)
  const [moveCardId, setMoveCardId] = useState(null)
  const [editCardId, setEditCardId] = useState(null)
  const [gateOpen, setGateOpen] = useState(false)
  const [pendingColumn, setPendingColumn] = useState(null)
  const [pendingIndex, setPendingIndex] = useState(null)
  const [pendingVia, setPendingVia] = useState('sheet')

  const columns = view === 'day' ? DAY_COLUMNS : WEEK_COLUMNS
  const kanbanCards = useMemo(() => selectKanbanCards(cards), [cards])

  const moveCard = moveCardId ? cards.find((c) => c.id === moveCardId) : null
  const editCard = editCardId ? cards.find((c) => c.id === editCardId) : null

  useEffect(
    () => () => {
      dragSuspendRef.current?.abort()
    },
    [],
  )

  useEffect(() => {
    if (isDraggingRef.current) return

    const state = useCardsStore.getState()
    const synced = syncColumnOrderWithCards(state.cards, state.columnOrder)
    if (!columnOrderEquals(synced, state.columnOrder)) {
      setColumnOrder(synced)
    }
  }, [cards, setColumnOrder])

  const revertColumnOrderPreview = () => {
    if (snapshotRef.current) {
      setColumnOrder(snapshotRef.current)
      snapshotRef.current = null
    }
  }

  const clearPendingMove = () => {
    setMoveCardId(null)
    setPendingColumn(null)
    setPendingIndex(null)
    setPendingVia('sheet')
  }

  const attemptMove = (cardId, columnId, options = { via: 'sheet' }) => {
    const result = moveKanbanCard(cardId, columnId, options)
    if (!result.ok && result.reason === 'wip-full') {
      setMoveCardId(cardId)
      setPendingColumn(columnId)
      setPendingIndex(options.index ?? null)
      setPendingVia(options.via ?? 'sheet')
      setGateOpen(true)
      return result
    }
    clearPendingMove()
    return result
  }

  const finishPendingMove = () => {
    if (!moveCardId || pendingColumn == null) return

    const options = {
      via: pendingVia,
      ...(typeof pendingIndex === 'number' ? { index: pendingIndex } : {}),
    }
    moveKanbanCard(moveCardId, pendingColumn, options)
    clearPendingMove()
    dragSuspendRef.current?.resume()
    dragSuspendRef.current = null
    snapshotRef.current = null
  }

  const handleGateComplete = () => {
    const wip = selectWipCard(cards)
    if (wip?.energyCost === 'heavy') {
      recordHeavyCompletion(wip.id)
    }
    completeWip()
    setGateOpen(false)
    finishPendingMove()
  }

  const handleGateRelease = () => {
    releaseWip()
    setGateOpen(false)
    finishPendingMove()
  }

  const handleGateCancel = () => {
    setGateOpen(false)
    revertColumnOrderPreview()
    dragSuspendRef.current?.abort()
    dragSuspendRef.current = null
    clearPendingMove()
  }

  const handleDragStart = () => {
    isDraggingRef.current = true
    const state = useCardsStore.getState()
    const synced = syncColumnOrderWithCards(state.cards, state.columnOrder)
    if (!columnOrderEquals(synced, state.columnOrder)) {
      setColumnOrder(synced)
    }
    snapshotRef.current = structuredClone(synced)
  }

  const handleDragOver = (event) => {
    if (!snapshotRef.current || event.canceled) return
    setColumnOrder(move(snapshotRef.current, event))
  }

  const handleDragEnd = (event) => {
    isDraggingRef.current = false
    const snapshot = snapshotRef.current

    if (event.canceled) {
      if (snapshot) setColumnOrder(snapshot)
      snapshotRef.current = null
      return
    }

    const { source } = event.operation
    if (!source?.id || !snapshot) {
      revertColumnOrderPreview()
      return
    }

    const cardId = String(source.id)
    const { finalOrder, final, initial } = resolveFinalOrder(
      snapshot,
      event,
      cardId,
      kanbanCards,
    )

    if (!initial || !final) {
      if (snapshot) setColumnOrder(snapshot)
      snapshotRef.current = null
      return
    }

    if (initial.columnId === final.columnId && initial.index === final.index) {
      setColumnOrder(snapshot)
      snapshotRef.current = null
      return
    }

    if (initial.columnId === final.columnId) {
      setColumnOrder(finalOrder)
      snapshotRef.current = null
      return
    }

    if (final.columnId === IN_PROGRESS_COLUMN) {
      const wip = cards.find((c) => c.status === 'wip')
      if (wip && wip.id !== cardId) {
        setColumnOrder(snapshot)
        const suspended = event.suspend()
        dragSuspendRef.current = suspended
        setMoveCardId(cardId)
        setPendingColumn(final.columnId)
        setPendingIndex(final.index)
        setPendingVia('drag')
        setGateOpen(true)
        return
      }
    }

    setColumnOrder(finalOrder)
    attemptMove(cardId, final.columnId, { via: 'drag', index: final.index })
    snapshotRef.current = null
  }

  if (kanbanCards.length === 0) {
    return null
  }

  return (
    <>
      <DragDropProvider
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className={clsx(
            'flex w-max min-w-full snap-x snap-mandatory gap-3 pb-2 pr-4 sm:gap-4 md:w-full md:snap-none md:pr-0',
            gateOpen && 'invisible',
          )}
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={selectOrderedCardsInColumn(
                kanbanCards,
                columnOrder,
                column.id,
              )}
              dragEnabled={dragEnabled}
              onMoveTap={setMoveCardId}
              onEditTap={setEditCardId}
            />
          ))}
        </div>

        <DragOverlay disabled={!dragEnabled || gateOpen}>
          {(source) => {
            const card = kanbanCards.find((c) => c.id === source.id)
            if (!card) return null
            return (
              <StructuredCard
                card={card}
                compact
                className="scale-[1.02] select-none shadow-lg ring-2 ring-warm-accent/30"
              />
            )
          }}
        </DragOverlay>
      </DragDropProvider>

      <MoveCardSheet
        card={moveCard}
        columns={columns}
        open={Boolean(moveCard) && !gateOpen}
        onClose={clearPendingMove}
        onMove={(columnId) => {
          if (moveCard) attemptMove(moveCard.id, columnId, { via: 'sheet' })
        }}
      />

      <CardEditSheet
        card={editCard}
        open={Boolean(editCard)}
        onClose={() => setEditCardId(null)}
        onMove={
          editCard &&
          ['filtered', 'wip', 'done'].includes(editCard.status)
            ? () => {
                setMoveCardId(editCard.id)
                setEditCardId(null)
              }
            : undefined
        }
      />

      <WipGateDialog
        open={gateOpen}
        onComplete={handleGateComplete}
        onRelease={handleGateRelease}
        onCancel={handleGateCancel}
      />
    </>
  )
}
