import { create } from 'zustand'
import { useTimerStore } from './useTimerStore'
import { createCard, generatePosition } from '../lib/cardUtils'
import { sanitizeCardsOnLoad } from '../lib/cardSanitize'
import { selectWipCard } from '../lib/cardSelectors'
import { hapticTap } from '../lib/haptics'
import {
 buildColumnOrderFromCards,
 moveInColumnOrder,
 removeIdFromColumnOrder,
 reorderInColumnOrder,
 syncColumnOrderWithCards,
} from '../lib/kanbanOrderUtils'
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
 return { cards, columnOrder }
 }

 return {
 cards: [],
 columnOrder: buildColumnOrderFromCards([]),
 }
}

const initialState = getInitialCardsState()

function maybeHapticForColumn(columnId) {
 if (columnId === IN_PROGRESS_COLUMN || columnId === DONE_COLUMN) {
 hapticTap()
 }
}

export const useCardsStore = create((set, get) => ({
 cards: initialState.cards,
 columnOrder: initialState.columnOrder,
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
 }
 : c,
 ),
 }))
 hapticTap()
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

 set((state) => ({
 columnOrder: moveInColumnOrder(state.columnOrder, id, columnId, {
 via,
 index,
 }),
 cards: state.cards.map((c) =>
 c.id === id
 ? { ...c, status, kanbanColumn: columnId, stuckSince }
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
 rotation: 0,
 x: position.x,
 y: position.y,
 }
 }),
 }
 })
 },
}))

const debouncedPersistCards = createDebouncedPersist((cards, columnOrder) => {
 saveCardsPersisted(cards, columnOrder)
})

useCardsStore.subscribe((state, prev) => {
 if (
 state.cards !== prev.cards ||
 state.columnOrder !== prev.columnOrder
 ) {
 debouncedPersistCards(state.cards, state.columnOrder)
 }
})
