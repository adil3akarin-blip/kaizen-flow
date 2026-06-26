import { create } from 'zustand'
import { useTimerStore } from './useTimerStore'
import { useHabitsStore } from './useHabitsStore'
import { collectActiveDays, computeFlowStreak } from '../lib/streakUtils'
import { createCard, generatePosition } from '../lib/cardUtils'
import { sanitizeCardsOnLoad } from '../lib/cardSanitize'
import { selectWipCard } from '../lib/cardSelectors'
import { hapticTap } from '../lib/haptics'
import {
 buildColumnOrderFromCards,
 createEmptyBoardOrder,
 moveInBoardOrder,
 moveInColumnOrder,
 removeFromBoardOrder,
 removeIdFromColumnOrder,
 reorderInBoardOrder,
 reorderInColumnOrder,
 syncColumnOrderWithCards,
} from '../lib/kanbanOrderUtils'
import { roleToStatus } from '../lib/boardUtils'
import { useBoardsStore } from './useBoardsStore'
import { generateId } from '../lib/id'
import {
 columnToStatus,
 DONE_COLUMN,
 IN_PROGRESS_COLUMN,
 resolveKanbanColumn,
 shouldResetStuckSince,
} from '../lib/kanbanUtils'
import {
 createDebouncedPersist,
 loadCardsPersisted,
 saveCardsPersisted,
} from '../lib/persistStorage'
import { useToastStore } from './useToastStore'

function getInitialCardsState() {
 const persisted = loadCardsPersisted()
 if (persisted) {
 const cards = sanitizeCardsOnLoad(persisted.cards)
 const columnOrder = syncColumnOrderWithCards(
 cards,
 persisted.columnOrder ?? buildColumnOrderFromCards(cards),
 )
 const boardOrders =
 persisted.boardOrders && typeof persisted.boardOrders === 'object'
 ? persisted.boardOrders
 : {}
 return { cards, columnOrder, boardOrders }
 }

 return {
 cards: [],
 columnOrder: buildColumnOrderFromCards([]),
 boardOrders: {},
 }
}

// Look up a custom board's column role / column id list at action time. Read
// via getState() (not import) so the two stores stay free of an import cycle.
function boardColumnRole(boardId, columnId) {
 const board = useBoardsStore.getState().boards.find((b) => b.id === boardId)
 return board?.columns.find((c) => c.id === columnId)?.role ?? 'plain'
}

function boardColumnIds(boardId) {
 const board = useBoardsStore.getState().boards.find((b) => b.id === boardId)
 return (board?.columns ?? []).map((c) => c.id)
}

const initialState = getInitialCardsState()

function maybeHapticForColumn(columnId) {
 if (columnId === IN_PROGRESS_COLUMN || columnId === DONE_COLUMN) {
 hapticTap()
 }
}

function pluralDays(n) {
 const mod10 = n % 10
 const mod100 = n % 100
 if (mod10 === 1 && mod100 !== 11) return 'день'
 if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня'
 return 'дней'
}

// «Момент завершения» — тёплая микро-обратная связь при закрытии дела
// (Progress Principle). Спокойно, без давления: показываем живой поток.
function celebrateCompletion() {
 const activeDays = collectActiveDays(
 useCardsStore.getState().cards,
 useTimerStore.getState().sessions,
 useHabitsStore.getState().log,
 )
 const { streak } = computeFlowStreak(activeDays)
 const message =
 streak > 1
 ? `Готово. Поток держится — ${streak} ${pluralDays(streak)} подряд`
 : 'Готово. Поток начался — так держать!'
 useToastStore.getState().showToast({ variant: 'success', message, key: 'flow-complete' })
}

export const useCardsStore = create((set, get) => ({
 cards: initialState.cards,
 columnOrder: initialState.columnOrder,
 boardOrders: initialState.boardOrders,
 pendingDelete: null,
 lastAddedId: null,

 setLastAddedId: (id) => set({ lastAddedId: id }),

 setColumnOrder: (columnOrder) => set({ columnOrder }),

 addCard: (text) => {
 const trimmed = text.trim()
 if (!trimmed) return null

 const card = createCard(trimmed, get().cards)
 set((state) => ({ cards: [...state.cards, card] }))
 return card
 },

 removeCard: (id) => {
 const card = get().cards.find((c) => c.id === id)
 if (!card) return

 useTimerStore.getState().finalizeForCard(id)

 set((state) => ({
 cards: state.cards.filter((c) => c.id !== id),
 columnOrder: removeIdFromColumnOrder(state.columnOrder, id),
 pendingDelete: { card },
 }))

 useToastStore.getState().showToast({
 variant: 'destructive',
 message: 'Карточка удалена',
 actionLabel: 'Отменить',
 key: 'undo-delete',
 onAction: () => get().undoDelete(),
 onDismiss: () => get().dismissUndo(),
 })
 },

 undoDelete: () => {
 const { pendingDelete } = get()
 if (!pendingDelete) return

 const { card } = pendingDelete
 const currentWip = selectWipCard(get().cards)

 // C1: if the restored card was WIP and WIP slot is now occupied, restore it to queue
 let restoredCard = card
 let targetColumn = ['filtered', 'wip', 'done'].includes(card.status)
 ? resolveKanbanColumn(card)
 : null

 if (card.status === 'wip' && currentWip) {
 restoredCard = { ...card, status: 'filtered', kanbanColumn: 'queue' }
 targetColumn = 'queue'
 }

 useToastStore.getState().clearToast()
 set((state) => {
 let columnOrder = state.columnOrder
 if (targetColumn) {
 columnOrder = moveInColumnOrder(columnOrder, restoredCard.id, targetColumn, {
 via: 'sheet',
 })
 }

 return {
 cards: [...state.cards, restoredCard],
 columnOrder,
 pendingDelete: null,
 }
 })
 },

 dismissUndo: () => {
 set({ pendingDelete: null })
 },

 moveCard: (id, x, y) => {
 set((state) => ({
 cards: state.cards.map((c) =>
 c.id === id ? { ...c, x: Math.max(0, x), y: Math.max(0, y) } : c,
 ),
 }))
 },

 updateCardText: (id, text) => {
 const trimmed = text.trim()
 if (!trimmed) return false

 set((state) => ({
 cards: state.cards.map((c) =>
 c.id === id ? { ...c, text: trimmed } : c,
 ),
 }))
 return true
 },

 updateCardFilterFields: (id, fields) => {
 set((state) => ({
 cards: state.cards.map((c) =>
 c.id === id && c.status === 'raw' ? { ...c, ...fields } : c,
 ),
 }))
 },

 commitCardToPull: (id) => {
 const card = get().cards.find((c) => c.id === id)
 if (!card || card.status !== 'raw') {
 return { ok: false, reason: card ? 'invalid-status' : 'not-found' }
 }

 set((state) => {
 const columnOrder = moveInColumnOrder(state.columnOrder, id, 'queue', {
 via: 'sheet',
 })

 return {
 columnOrder,
 cards: state.cards.map((c) => {
 if (c.id !== id) return c
 const next = {
 ...c,
 status: 'filtered',
 rotation: 0,
 kanbanColumn: 'queue',
 stuckSince: Date.now(),
 }
 delete next.x
 delete next.y
 return next
 }),
 }
 })

 return { ok: true }
 },

 resetCardFilterProgress: (id) => {
 set((state) => ({
 cards: state.cards.map((c) => {
 if (c.id !== id || c.status !== 'raw') return c
 return {
 ...c,
 wantMust: null,
 missionCriteriaResults: [],
 timeInvestment: null,
 sphere: null,
 }
 }),
 }))
 },

 pullToWip: (id) => {
 const wip = selectWipCard(get().cards)
 if (wip) return { ok: false, reason: 'wip-full' }

 const card = get().cards.find((c) => c.id === id)
 if (!card) return { ok: false, reason: 'not-found' }
 if (card.status !== 'filtered') {
 return { ok: false, reason: 'invalid-status' }
 }

 set((state) => ({
 columnOrder: moveInColumnOrder(state.columnOrder, id, IN_PROGRESS_COLUMN, {
 via: 'sheet',
 }),
 cards: state.cards.map((c) =>
 c.id === id
 ? {
 ...c,
 status: 'wip',
 kanbanColumn: IN_PROGRESS_COLUMN,
 stuckSince: Date.now(),
 }
 : c,
 ),
 }))
 hapticTap()
 return { ok: true }
 },

 completeWip: () => {
 const wip = selectWipCard(get().cards)
 if (!wip) return

 useTimerStore.getState().finalizeForCard(wip.id)

 set((state) => ({
 columnOrder: moveInColumnOrder(state.columnOrder, wip.id, DONE_COLUMN, {
 via: 'sheet',
 }),
 cards: state.cards.map((c) =>
 c.id === wip.id
 ? {
 ...c,
 status: 'done',
 kanbanColumn: DONE_COLUMN,
 stuckSince: Date.now(),
 completedAt: Date.now(),
 }
 : c,
 ),
 }))
 hapticTap()
 celebrateCompletion()
 },

 discardWip: () => {
 const wip = selectWipCard(get().cards)
 if (!wip) return
 get().removeCard(wip.id)
 },

 releaseWip: () => {
 const wip = selectWipCard(get().cards)
 if (!wip) return

 useTimerStore.getState().finalizeForCard(wip.id)

 set((state) => ({
 columnOrder: moveInColumnOrder(state.columnOrder, wip.id, 'queue', {
 via: 'sheet',
 }),
 cards: state.cards.map((c) =>
 c.id === wip.id
 ? {
 ...c,
 status: 'filtered',
 kanbanColumn: 'queue',
 stuckSince: Date.now(),
 }
 : c,
 ),
 }))
 },

 moveKanbanCard: (id, columnId, options = {}) => {
 const cards = get().cards
 const card = cards.find((c) => c.id === id)
 if (!card) return { ok: false, reason: 'not-found' }
 if (!['filtered', 'wip', 'done'].includes(card.status)) {
 return { ok: false, reason: 'invalid-status' }
 }

 const fromColumn = resolveKanbanColumn(card)
 const { via = 'sheet', index } = options

 if (fromColumn === columnId && via !== 'drag') {
 return { ok: true, noop: true }
 }

 if (columnId === IN_PROGRESS_COLUMN) {
 const wip = selectWipCard(cards)
 if (wip && wip.id !== id) return { ok: false, reason: 'wip-full' }
 }

 const status = columnToStatus(columnId)
 const stuckSince = shouldResetStuckSince(columnId)
 ? Date.now()
 : card.stuckSince || Date.now()

 if (card.status === 'wip' && columnId !== IN_PROGRESS_COLUMN) {
 useTimerStore.getState().finalizeForCard(id)
 }

 // Stamp/clear completion time as the card enters or leaves the Done column.
 const completedAt =
 columnId === DONE_COLUMN ? card.completedAt ?? Date.now() : undefined

 set((state) => ({
 columnOrder: moveInColumnOrder(state.columnOrder, id, columnId, {
 via,
 index,
 }),
 cards: state.cards.map((c) =>
 c.id === id
 ? { ...c, status, kanbanColumn: columnId, stuckSince, completedAt }
 : c,
 ),
 }))

 if (fromColumn !== columnId) {
 maybeHapticForColumn(columnId)
 }

 return { ok: true }
 },

 reorderKanbanCard: (id, columnId, fromIndex, toIndex) => {
 set((state) => ({
 columnOrder: reorderInColumnOrder(
 state.columnOrder,
 columnId,
 fromIndex,
 toIndex,
 ),
 }))
 return { ok: true }
 },

 returnCardToInbox: (id) => {
 set((state) => {
 const existingRaw = state.cards.filter(
 (c) =>
 c.status === 'raw' &&
 c.id !== id &&
 typeof c.x === 'number' &&
 typeof c.y === 'number',
 )
 const position = generatePosition(existingRaw)

 return {
 columnOrder: removeIdFromColumnOrder(state.columnOrder, id),
 cards: state.cards.map((c) => {
 if (c.id !== id) return c
 return {
 ...c,
 status: 'raw',
 wantMust: null,
 missionCriteriaResults: [],
 timeInvestment: null,
 sphere: null,
 rotation: 0,
 x: position.x,
 y: position.y,
 }
 }),
 }
 })
 },

 // --- Custom boards ------------------------------------------------------

 setBoardOrder: (boardId, order) =>
 set((state) => ({
 boardOrders: { ...state.boardOrders, [boardId]: order },
 })),

 addBoardCard: (boardId, columnId, text) => {
 const trimmed = (text ?? '').trim()
 if (!trimmed) return null

 const status = roleToStatus(boardColumnRole(boardId, columnId))
 const card = {
 id: generateId(),
 text: trimmed,
 boardId,
 kanbanColumn: columnId,
 status,
 createdAt: Date.now(),
 ...(status === 'done' ? { completedAt: Date.now() } : {}),
 }

 set((state) => {
 const colIds = boardColumnIds(boardId)
 const order = state.boardOrders[boardId] ?? createEmptyBoardOrder(colIds)
 return {
 cards: [...state.cards, card],
 boardOrders: {
 ...state.boardOrders,
 [boardId]: moveInBoardOrder(order, card.id, columnId, colIds),
 },
 lastAddedId: card.id,
 }
 })
 return card
 },

 updateBoardCardText: (id, text) => {
 const trimmed = (text ?? '').trim()
 if (!trimmed) return false
 set((state) => ({
 cards: state.cards.map((c) => (c.id === id ? { ...c, text: trimmed } : c)),
 }))
 return true
 },

 moveBoardCard: (boardId, cardId, toColumnId, options = {}) => {
 const card = get().cards.find((c) => c.id === cardId)
 if (!card) return { ok: false, reason: 'not-found' }

 const status = roleToStatus(boardColumnRole(boardId, toColumnId))
 const wasDone = card.status === 'done'
 const colIds = boardColumnIds(boardId)

 set((state) => {
 const order = state.boardOrders[boardId] ?? createEmptyBoardOrder(colIds)
 return {
 cards: state.cards.map((c) =>
 c.id === cardId
 ? {
 ...c,
 kanbanColumn: toColumnId,
 status,
 completedAt:
 status === 'done' ? c.completedAt ?? Date.now() : undefined,
 }
 : c,
 ),
 boardOrders: {
 ...state.boardOrders,
 [boardId]: moveInBoardOrder(order, cardId, toColumnId, colIds, options.index),
 },
 }
 })

 if (status === 'done' && !wasDone) {
 hapticTap()
 celebrateCompletion()
 }
 return { ok: true }
 },

 // Card-only column/status update — used after a drag has already committed the
 // board order (so we don't re-move the order here).
 applyBoardCardColumn: (cardId, columnId) => {
 const card = get().cards.find((c) => c.id === cardId)
 if (!card) return
 const status = roleToStatus(boardColumnRole(card.boardId, columnId))
 const wasDone = card.status === 'done'
 if (card.kanbanColumn === columnId && card.status === status) return
 set((state) => ({
 cards: state.cards.map((c) =>
 c.id === cardId
 ? {
 ...c,
 kanbanColumn: columnId,
 status,
 completedAt: status === 'done' ? c.completedAt ?? Date.now() : undefined,
 }
 : c,
 ),
 }))
 if (status === 'done' && !wasDone) {
 hapticTap()
 celebrateCompletion()
 }
 },

 // Re-derive the status of every card in a column after its role changed
 // (e.g. user toggled a column to/from «Сделано»).
 syncColumnCardsStatus: (boardId, columnId) => {
 const status = roleToStatus(boardColumnRole(boardId, columnId))
 set((state) => ({
 cards: state.cards.map((c) =>
 c.boardId === boardId && c.kanbanColumn === columnId
 ? {
 ...c,
 status,
 completedAt: status === 'done' ? c.completedAt ?? Date.now() : undefined,
 }
 : c,
 ),
 }))
 },

 reorderBoardCard: (boardId, columnId, fromIndex, toIndex) => {
 set((state) => ({
 boardOrders: {
 ...state.boardOrders,
 [boardId]: reorderInBoardOrder(
 state.boardOrders[boardId] ?? {},
 columnId,
 fromIndex,
 toIndex,
 ),
 },
 }))
 },

 removeBoardCard: (id) => {
 const card = get().cards.find((c) => c.id === id)
 if (!card) return
 const boardId = card.boardId
 const colIds = boardColumnIds(boardId)
 set((state) => ({
 cards: state.cards.filter((c) => c.id !== id),
 boardOrders: {
 ...state.boardOrders,
 [boardId]: removeFromBoardOrder(
 state.boardOrders[boardId] ?? createEmptyBoardOrder(colIds),
 id,
 colIds,
 ),
 },
 }))
 },

 // Move every card from one column into another (used when deleting a column).
 // Call BEFORE removing the column from the boards store so both ids resolve.
 reassignColumnCards: (boardId, fromColumnId, toColumnId) => {
 const status = roleToStatus(boardColumnRole(boardId, toColumnId))
 const colIds = boardColumnIds(boardId)
 set((state) => {
 let order = state.boardOrders[boardId] ?? createEmptyBoardOrder(colIds)
 for (const id of [...(order[fromColumnId] ?? [])]) {
 order = moveInBoardOrder(order, id, toColumnId, colIds)
 }
 return {
 cards: state.cards.map((c) =>
 c.boardId === boardId && c.kanbanColumn === fromColumnId
 ? {
 ...c,
 kanbanColumn: toColumnId,
 status,
 completedAt:
 status === 'done' ? c.completedAt ?? Date.now() : undefined,
 }
 : c,
 ),
 boardOrders: { ...state.boardOrders, [boardId]: order },
 }
 })
 },

 deleteBoardCards: (boardId) => {
 set((state) => {
 const boardOrders = { ...state.boardOrders }
 delete boardOrders[boardId]
 return {
 cards: state.cards.filter((c) => c.boardId !== boardId),
 boardOrders,
 }
 })
 },
}))

const debouncedPersistCards = createDebouncedPersist(
 (cards, columnOrder, boardOrders) => {
 saveCardsPersisted(cards, columnOrder, boardOrders)
 },
)

useCardsStore.subscribe((state, prev) => {
 if (
 state.cards !== prev.cards ||
 state.columnOrder !== prev.columnOrder ||
 state.boardOrders !== prev.boardOrders
 ) {
 debouncedPersistCards(state.cards, state.columnOrder, state.boardOrders)
 }
})
