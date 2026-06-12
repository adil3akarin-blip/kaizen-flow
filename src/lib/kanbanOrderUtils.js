import { isSortable } from '@dnd-kit/dom/sortable'
import { selectKanbanCards } from './cardSelectors'
import {
 DONE_COLUMN,
 IN_PROGRESS_COLUMN,
 resolveKanbanColumn,
} from './kanbanUtils'

const KANBAN_COLUMN_SET = new Set([
 'queue',
 'progress',
 'done',
 'next_week',
])

export const KANBAN_COLUMN_IDS = [
 'queue',
 'progress',
 'done',
 'next_week',
]

export function createEmptyColumnOrder() {
 return {
 queue: [],
 progress: [],
 done: [],
 next_week: [],
 }
}

export function buildColumnOrderFromCards(cards) {
 return syncColumnOrderWithCards(cards, createEmptyColumnOrder())
}

export function columnOrderEquals(a, b) {
 return KANBAN_COLUMN_IDS.every(
 (columnId) =>
 a[columnId].length === b[columnId].length &&
 a[columnId].every((id, index) => id === b[columnId][index]),
 )
}

export function syncColumnOrderWithCards(cards, columnOrder) {
 const kanbanCards = selectKanbanCards(cards)
 const kanbanIds = new Set(kanbanCards.map((card) => card.id))
 const next = createEmptyColumnOrder()
 const placed = new Set()

 for (const columnId of KANBAN_COLUMN_IDS) {
 for (const id of columnOrder[columnId] ?? []) {
 if (!kanbanIds.has(id) || placed.has(id)) continue
 next[columnId].push(id)
 placed.add(id)
 }
 }

 for (const card of [...kanbanCards].sort(
 (a, b) => a.createdAt - b.createdAt,
 )) {
 if (placed.has(card.id)) continue
 const columnId = resolveKanbanColumn(card)
 if (!next[columnId]) continue
 next[columnId].push(card.id)
 placed.add(card.id)
 }

 return next
}

export function removeIdFromColumnOrder(columnOrder, id) {
 const next = createEmptyColumnOrder()
 for (const columnId of KANBAN_COLUMN_IDS) {
 next[columnId] = columnOrder[columnId].filter((itemId) => itemId !== id)
 }
 return next
}

export function resolveInsertIndex(columnId, columnOrder, via, explicitIndex) {
 if (via === 'drag' && typeof explicitIndex === 'number') {
 return explicitIndex
 }

 if (columnId === IN_PROGRESS_COLUMN) return 0
 if (columnId === DONE_COLUMN) return 0
 return columnOrder[columnId]?.length ?? 0
}

export function moveInColumnOrder(columnOrder, cardId, toColumnId, options = {}) {
 const { via = 'sheet', index: explicitIndex } = options
 const next = removeIdFromColumnOrder(columnOrder, cardId)
 const insertAt = resolveInsertIndex(
 toColumnId,
 next,
 via,
 explicitIndex,
 )
 const column = [...(next[toColumnId] ?? [])]
 column.splice(insertAt, 0, cardId)
 next[toColumnId] = column
 return next
}

export function reorderInColumnOrder(columnOrder, columnId, fromIndex, toIndex) {
 const column = [...(columnOrder[columnId] ?? [])]
 if (
 fromIndex < 0 ||
 toIndex < 0 ||
 fromIndex >= column.length ||
 toIndex >= column.length ||
 fromIndex === toIndex
 ) {
 return columnOrder
 }

 const [item] = column.splice(fromIndex, 1)
 column.splice(toIndex, 0, item)

 return {
 ...columnOrder,
 [columnId]: column,
 }
}

export function previewColumnOrderFromDrag(
 snapshot,
 cardId,
 initialGroup,
 initialIndex,
 targetGroup,
 targetIndex,
) {
 const id = String(cardId)
 const next = createEmptyColumnOrder()

 for (const columnId of KANBAN_COLUMN_IDS) {
 next[columnId] = (snapshot[columnId] ?? []).filter((itemId) => itemId !== id)
 }

 const destColumn = [...next[targetGroup]]
 const insertAt = Math.max(0, Math.min(targetIndex, destColumn.length))
 destColumn.splice(insertAt, 0, id)
 next[targetGroup] = destColumn

 return next
}

export function resolveDragTargetPosition(operation, snapshot, cards = null) {
 const { source, target, position } = operation
 if (!source || !target) return null

 let initialGroup = source.initialGroup
 let initialIndex = source.initialIndex

 if (initialGroup == null || initialIndex == null) {
 const fromOrder = findCardColumnIndex(snapshot, source.id)
 if (fromOrder) {
 initialGroup = fromOrder.columnId
 initialIndex = fromOrder.index
 } else if (cards) {
 const card = cards.find((item) => item.id === source.id)
 if (card) {
 initialGroup = resolveKanbanColumn(card)
 initialIndex = snapshot[initialGroup]?.length ?? 0
 }
 }
 }

 if (initialGroup == null || initialIndex == null) return null

 if (isSortable(source) && isSortable(target)) {
 const targetGroup = target.group
 let targetIndex = target.index ?? 0

 if (targetGroup == null) return null

 const targetShape = target.shape
 const pointer = position?.current
 if (targetShape && pointer && initialGroup !== targetGroup) {
 const isBelow = Math.round(pointer.y) > Math.round(targetShape.center.y)
 if (isBelow) targetIndex += 1
 } else if (targetShape && pointer && initialGroup === targetGroup) {
 const isBelow = Math.round(pointer.y) > Math.round(targetShape.center.y)
 const sourceIndex = source.index ?? initialIndex
 if (isBelow && targetIndex >= sourceIndex) {
 targetIndex += 1
 }
 }

 return {
 targetGroup,
 targetIndex,
 cardId: source.id,
 initialGroup,
 initialIndex,
 }
 }

 const columnId = String(target.id)
 if (!KANBAN_COLUMN_SET.has(columnId)) return null

 const withoutCard = snapshot[columnId].filter((itemId) => itemId !== source.id)
 let targetIndex = withoutCard.length
 if (columnId === DONE_COLUMN || columnId === IN_PROGRESS_COLUMN) {
 targetIndex = 0
 }

 return {
 targetGroup: columnId,
 targetIndex,
 cardId: source.id,
 initialGroup,
 initialIndex,
 }
}

export function selectOrderedCardsInColumn(cards, columnOrder, columnId) {
 const byId = new Map(cards.map((card) => [card.id, card]))
 const seen = new Set()

 const ordered = (columnOrder[columnId] ?? [])
 .map((id) => byId.get(id))
 .filter((card) => {
 if (!card || seen.has(card.id)) return false
 seen.add(card.id)
 return true
 })

 for (const card of cards) {
 if (seen.has(card.id)) continue
 if (resolveKanbanColumn(card) !== columnId) continue
 ordered.push(card)
 seen.add(card.id)
 }

 return ordered
}

export function findCardColumnIndex(columnOrder, cardId) {
 const id = String(cardId)
 for (const columnId of KANBAN_COLUMN_IDS) {
 const index = columnOrder[columnId].indexOf(id)
 if (index !== -1) {
 return { columnId, index }
 }
 }
 return null
}

export function selectOrderedPullQueue(cards, columnOrder) {
 return selectOrderedCardsInColumn(cards, columnOrder, 'queue').filter(
 (card) => card.status === 'filtered',
 )
}
