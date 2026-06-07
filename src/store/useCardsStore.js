import { create } from 'zustand'
import { mockCards } from '../data/mockCards'
import { createCard } from '../lib/cardUtils'

const UNDO_TIMEOUT_MS = 5000

export const useCardsStore = create((set, get) => ({
  cards: mockCards,
  pendingDelete: null,
  lastAddedId: null,

  setLastAddedId: (id) => set({ lastAddedId: id }),

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

    const existing = get().pendingDelete
    if (existing?.timeoutId) clearTimeout(existing.timeoutId)

    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
    }))

    const timeoutId = setTimeout(() => {
      set((state) =>
        state.pendingDelete?.card.id === id
          ? { pendingDelete: null }
          : state,
      )
    }, UNDO_TIMEOUT_MS)

    set({ pendingDelete: { card, timeoutId } })
  },

  undoDelete: () => {
    const { pendingDelete } = get()
    if (!pendingDelete) return

    clearTimeout(pendingDelete.timeoutId)
    set((state) => ({
      cards: [...state.cards, pendingDelete.card],
      pendingDelete: null,
    }))
  },

  dismissUndo: () => {
    const { pendingDelete } = get()
    if (pendingDelete?.timeoutId) clearTimeout(pendingDelete.timeoutId)
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
}))
