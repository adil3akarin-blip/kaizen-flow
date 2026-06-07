import { create } from 'zustand'
import { mockCards } from '../data/mockCards'
import { createCard } from '../lib/cardUtils'
import { useToastStore } from './useToastStore'

const onboardingDone = localStorage.getItem('kaizenflow-onboarding') === '1'
const initialCards = onboardingDone
  ? mockCards.map((c) => ({ status: 'raw', ...c }))
  : []

export const useCardsStore = create((set, get) => ({
  cards: initialCards,
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

    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
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

    useToastStore.getState().clearToast()
    set((state) => ({
      cards: [...state.cards, pendingDelete.card],
      pendingDelete: null,
    }))
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
}))
