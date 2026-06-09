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
import { getKanbanEmptyState } from '../../lib/kanbanEmptyState'
import {
  findLightAlternatives,
} from '../../lib/energyUtils'
import { shouldShowDepletedHeavyDialog } from '../../lib/willpowerGuard'
import StructuredCard from '../cards/StructuredCard'
import CardEditSheet from '../cards/CardEditSheet'
import MoveCardSheet from './MoveCardSheet'
import EnergyGuardDialog from '../flow/EnergyGuardDialog'
import WipGateDialog from '../flow/WipGateDialog'
import { selectOrderedPullQueue } from '../../lib/kanbanOrderUtils'

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

function KanbanColumnEmpty({ copy }) {
  if (!copy) return null

  return (
    <div className="m-auto px-3 py-6 text-center">
      <p className="m-0 text-xs leading-snug text-warm-muted">{copy.primary}</p>
      {copy.dragHint && (
        <p className="m-0 mt-1.5 hidden text-[11px] leading-snug text-warm-muted/75 md:block">
          {copy.dragHint}
        </p>
      )}
    </div>
  )
}

function KanbanColumn({ column, cards, dragEnabled, onMoveTap, onEditTap, view }) {
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: column.id,
    type: 'column',
  })

  const isEmpty = cards.length === 0
  const emptyCopy = isEmpty ? getKanbanEmptyState(column.id, view, dragEnabled) : null
  const isAccentedEmpty = emptyCopy?.accented

  return (
    <div className="flex w-[min(16rem,82vw)] shrink-0 snap-start flex-col md:w-full md:min-w-0 md:shrink">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="m-0 text-sm font-medium text-warm-text">{column.label}</h3>
        <span className="rounded-full bg-cream px-2 py-0.5 text-xs tabular-nums text-warm-muted">
          {cards.length}
        </span>
      </div>

      <div
        ref={dropRef}
        className={clsx(
          'flex min-h-48 flex-1 flex-col gap-2 rounded-2xl border p-2 transition-colors md:min-h-64 md:p-2.5',
          isAccentedEmpty
            ? 'border-dashed border-warm-accent/25 bg-warm-accent/[0.04]'
            : 'border-cream-dark/50 bg-white shadow-sm',
          isDropTarget &&
            dragEnabled &&
            'border-warm-accent/40 bg-warm-accent/5',
        )}
      >
        {emptyCopy && <KanbanColumnEmpty copy={emptyCopy} />}

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
          <StructuredCard card={card} compact className="shadow-none" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onMoveTap(card.id)}
          className="w-full text-left"
        >
          <StructuredCard card={card} compact className="shadow-none" />
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
  const energyPreset = useEnergyStore((s) => s.preset)

  const dragEnabled = useFinePointerDesktop()
  const snapshotRef = useRef(null)
  const isDraggingRef = useRef(false)
  const [dndEpoch, setDndEpoch] = useState(0)
  const [moveCardId, setMoveCardId] = useState(null)
  const [editCardId, setEditCardId] = useState(null)
  const [gateOpen, setGateOpen] = useState(false)
  const [energyGuardOpen, setEnergyGuardOpen] = useState(false)
  const [guardCard, setGuardCard] = useState(null)
  const [pendingColumn, setPendingColumn] = useState(null)
  const [pendingIndex, setPendingIndex] = useState(null)
  const [pendingVia, setPendingVia] = useState('sheet')
  const [pendingMoveAfterGuard, setPendingMoveAfterGuard] = useState(null)

  const columns = view === 'day' ? DAY_COLUMNS : WEEK_COLUMNS
  const kanbanCards = useMemo(() => selectKanbanCards(cards), [cards])
  const pullQueue = useMemo(
    () => selectOrderedPullQueue(cards, columnOrder),
    [cards, columnOrder],
  )

  const liveMoveCard = moveCardId
    ? kanbanCards.find((c) => c.id === moveCardId) ?? null
    : null
  const liveEditCard = editCardId
    ? kanbanCards.find((c) => c.id === editCardId) ?? null
    : null
  const liveGuardCard = guardCard
    ? kanbanCards.find((c) => c.id === guardCard.id) ?? null
    : null
  const wipCard = useMemo(() => selectWipCard(cards), [cards])
  const gateActive = gateOpen && Boolean(wipCard) && Boolean(liveMoveCard)
  const guardActive = energyGuardOpen && Boolean(liveGuardCard)
  const overlayOpen = gateActive || guardActive

  const guardAlternatives = useMemo(
    () =>
      liveGuardCard
        ? findLightAlternatives(pullQueue, liveGuardCard.id)
        : [],
    [liveGuardCard, pullQueue],
  )

  const resetDnd = () => {
    setDndEpoch((epoch) => epoch + 1)
  }

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

  const closeEnergyGuard = () => {
    setEnergyGuardOpen(false)
    setGuardCard(null)
    setPendingMoveAfterGuard(null)
  }

  const executePendingMoveAfterGuard = (move) => {
    const card = useCardsStore
      .getState()
      .cards.find((item) => item.id === move.cardId)
    if (!card || !['filtered', 'wip', 'done'].includes(card.status)) {
      closeEnergyGuard()
      revertColumnOrderPreview()
      resetDnd()
      return
    }

    moveKanbanCard(move.cardId, move.columnId, move.options)
    snapshotRef.current = null
    resetDnd()
  }

  const maybeShowEnergyGuard = (cardId, columnId, options) => {
    if (columnId !== IN_PROGRESS_COLUMN) return false

    const card = useCardsStore.getState().cards.find((c) => c.id === cardId)
    if (!card || !shouldShowDepletedHeavyDialog(energyPreset, card)) {
      return false
    }

    setGuardCard(card)
    setPendingMoveAfterGuard({ cardId, columnId, options })
    setEnergyGuardOpen(true)
    return true
  }

  const attemptMove = (cardId, columnId, options = { via: 'sheet' }) => {
    const card = useCardsStore.getState().cards.find((item) => item.id === cardId)
    if (!card || !['filtered', 'wip', 'done'].includes(card.status)) {
      clearPendingMove()
      return { ok: false, reason: 'not-found' }
    }

    const result = moveKanbanCard(cardId, columnId, options)
    if (result.noop) {
      clearPendingMove()
      return result
    }
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

    const card = useCardsStore
      .getState()
      .cards.find((item) => item.id === moveCardId)
    if (!card || !['filtered', 'wip', 'done'].includes(card.status)) {
      clearPendingMove()
      revertColumnOrderPreview()
      resetDnd()
      return
    }

    const options = {
      via: pendingVia,
      ...(typeof pendingIndex === 'number' ? { index: pendingIndex } : {}),
    }
    const cardId = moveCardId
    const columnId = pendingColumn

    clearPendingMove()

    if (maybeShowEnergyGuard(cardId, columnId, options)) {
      return
    }

    moveKanbanCard(cardId, columnId, options)
    snapshotRef.current = null
    resetDnd()
  }

  const handleGateComplete = () => {
    const wip = selectWipCard(useCardsStore.getState().cards)
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
    clearPendingMove()
    resetDnd()
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
        setMoveCardId(cardId)
        setPendingColumn(final.columnId)
        setPendingIndex(final.index)
        setPendingVia('drag')
        setGateOpen(true)
        snapshotRef.current = null
        return
      }

      const draggedCard = kanbanCards.find((c) => c.id === cardId)
      if (
        draggedCard &&
        shouldShowDepletedHeavyDialog(energyPreset, draggedCard)
      ) {
        setColumnOrder(snapshot)
        setGuardCard(draggedCard)
        setPendingMoveAfterGuard({
          cardId,
          columnId: final.columnId,
          options: { via: 'drag', index: final.index },
        })
        setEnergyGuardOpen(true)
        snapshotRef.current = null
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
        key={dndEpoch}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className={clsx(
            'flex w-max min-w-full snap-x snap-mandatory gap-3 pb-2 pr-4 sm:gap-4 md:w-full md:snap-none md:pr-0',
            view === 'day' ? 'md:grid md:grid-cols-3' : 'md:grid md:grid-cols-4',
          )}
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              view={view}
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

        <DragOverlay disabled={!dragEnabled || overlayOpen}>
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
        card={liveMoveCard}
        columns={columns}
        open={Boolean(liveMoveCard) && !overlayOpen}
        onClose={clearPendingMove}
        onMove={(columnId) => {
          if (!liveMoveCard) return

          if (
            columnId === IN_PROGRESS_COLUMN &&
            maybeShowEnergyGuard(liveMoveCard.id, columnId, { via: 'sheet' })
          ) {
            return
          }

          attemptMove(liveMoveCard.id, columnId, { via: 'sheet' })
        }}
      />

      <CardEditSheet
        card={liveEditCard}
        open={Boolean(liveEditCard)}
        onClose={() => setEditCardId(null)}
        onMove={
          liveEditCard
            ? () => {
                setMoveCardId(liveEditCard.id)
                setEditCardId(null)
              }
            : undefined
        }
      />

      <WipGateDialog
        open={gateActive}
        onComplete={handleGateComplete}
        onRelease={handleGateRelease}
        onCancel={handleGateCancel}
      />

      <EnergyGuardDialog
        open={guardActive}
        card={liveGuardCard}
        alternatives={guardAlternatives}
        onPullAlternative={(id) => {
          closeEnergyGuard()
          attemptMove(id, IN_PROGRESS_COLUMN, { via: 'sheet' })
        }}
        onForcePull={() => {
          const move = pendingMoveAfterGuard
          closeEnergyGuard()
          if (move) executePendingMoveAfterGuard(move)
        }}
        onCancel={() => {
          closeEnergyGuard()
          if (snapshotRef.current) {
            setColumnOrder(snapshotRef.current)
            snapshotRef.current = null
          }
          resetDnd()
        }}
      />
    </>
  )
}
