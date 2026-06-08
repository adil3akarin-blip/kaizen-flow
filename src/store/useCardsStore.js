import { create } from 'zustand'
import { mockCards } from '../data/mockCards'
import { mockPullCards } from '../data/mockPullCards'
import { createCard } from '../lib/cardUtils'
import { selectWipCard } from '../lib/cardSelectors'
import { hapticTap } from '../lib/haptics'
import {
  buildColumnOrderFromCards,
  moveInColumnOrder,
  removeIdFromColumnOrder,
  reorderInColumnOrder,
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
    return {
      cards: persisted.cards,
      columnOrder:
        persisted.columnOrder ?? buildColumnOrderFromCards(persisted.cards),
    }
  }

  const onboardingDone = localStorage.getItem('kaizenflow-onboarding') === '1'
  const cards = onboardingDone
    ? [
        ...mockCards.map((c) => ({ status: 'raw', ...c })),
        ...mockPullCards,
      ]
    : []

  return {
    cards,
    columnOrder: buildColumnOrderFromCards(cards),
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
    const isKanban = ['filtered', 'wip', 'done'].includes(card.status)
    const columnId = isKanban ? resolveKanbanColumn(card) : null

    useToastStore.getState().clearToast()
    set((state) => {
      let columnOrder = state.columnOrder
      if (columnId) {
        columnOrder = moveInColumnOrder(columnOrder, card.id, columnId, {
          via: 'sheet',
        })
      }

      return {
        cards: [...state.cards, card],
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
        c.id === id ? { ...c, ...fields } : c,
      ),
    }))
  },

  commitCardToPull: (id) => {
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
            energyCost: c.energyCost || 'medium',
            kanbanColumn: 'queue',
            stuckSince: Date.now(),
          }
          delete next.x
          delete next.y
          return next
        }),
      }
    })
  },

  resetCardFilterProgress: (id) => {
    set((state) => ({
      cards: state.cards.map((c) => {
        if (c.id !== id) return c
        return {
          ...c,
          wantMust: null,
          missionCriteriaResults: [],
          timeInvestment: null,
          energyCost: null,
          resultEffort: null,
        }
      }),
    }))
  },

  pullToWip: (id) => {
    const wip = selectWipCard(get().cards)
    if (wip) return { ok: false, reason: 'wip-full' }

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
    if (!card) return { ok: false }

    const fromColumn = resolveKanbanColumn(card)
    const { via = 'sheet', index } = options

    if (columnId === IN_PROGRESS_COLUMN) {
      const wip = selectWipCard(cards)
      if (wip && wip.id !== id) return { ok: false, reason: 'wip-full' }
    }

    const status = columnToStatus(columnId)
    const stuckSince = shouldResetStuckSince(columnId)
      ? Date.now()
      : card.stuckSince || Date.now()

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
    set((state) => ({
      columnOrder: removeIdFromColumnOrder(state.columnOrder, id),
      cards: state.cards.map((c) => {
        if (c.id !== id) return c
        const next = {
          ...c,
          status: 'raw',
          wantMust: null,
          missionCriteriaResults: [],
          timeInvestment: null,
          energyCost: null,
          resultEffort: null,
          rotation: 0,
        }
        delete next.x
        delete next.y
        return next
      }),
    }))
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
