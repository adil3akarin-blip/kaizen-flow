import { create } from 'zustand'
import {
  createDebouncedPersist,
  loadJsonPersisted,
  saveJsonPersisted,
} from '../lib/persistStorage'
import { generateId } from '../lib/id'
import {
  FLOW_BOARD_ID,
  createDefaultFlowBoard,
  sanitizeBoards,
} from '../lib/boardUtils'

const BOARDS_KEY = 'kaizenflow-boards'
const COLUMN_ROLES = new Set(['queue', 'wip', 'done', 'plain'])

function loadInitial() {
  const persisted = loadJsonPersisted(BOARDS_KEY)
  const boards = sanitizeBoards(persisted?.boards)
  const activeBoardId =
    typeof persisted?.activeBoardId === 'string' &&
    boards.some((b) => b.id === persisted.activeBoardId)
      ? persisted.activeBoardId
      : FLOW_BOARD_ID
  return { boards, activeBoardId }
}

const initial = loadInitial()

export const useBoardsStore = create((set, get) => ({
  boards: initial.boards,
  activeBoardId: initial.activeBoardId,

  setActiveBoard: (boardId) => {
    if (!get().boards.some((b) => b.id === boardId)) return
    set({ activeBoardId: boardId })
  },

  addBoard: (name) => {
    const trimmed = (name ?? '').trim() || 'Новая доска'
    const board = {
      id: generateId(),
      name: trimmed,
      system: false,
      columns: [
        { id: generateId(), label: 'Сделать', role: 'plain' },
        { id: generateId(), label: 'В работе', role: 'plain' },
        { id: generateId(), label: 'Готово', role: 'plain' },
      ],
    }
    set((state) => ({ boards: [...state.boards, board], activeBoardId: board.id }))
    return board
  },

  renameBoard: (boardId, name) => {
    const trimmed = (name ?? '').trim()
    if (!trimmed) return
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === boardId ? { ...b, name: trimmed } : b,
      ),
    }))
  },

  // Deletion of a board's cards is handled by the caller (cards store) so the
  // two stores stay decoupled; here we only drop the board itself.
  deleteBoard: (boardId) => {
    const board = get().boards.find((b) => b.id === boardId)
    if (!board || board.system) return
    set((state) => {
      const boards = state.boards.filter((b) => b.id !== boardId)
      const activeBoardId =
        state.activeBoardId === boardId ? FLOW_BOARD_ID : state.activeBoardId
      return { boards, activeBoardId }
    })
  },

  addColumn: (boardId, label = 'Новая колонка') => {
    const column = { id: generateId(), label: label.trim() || 'Новая колонка', role: 'plain' }
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === boardId ? { ...b, columns: [...b.columns, column] } : b,
      ),
    }))
    return column
  },

  renameColumn: (boardId, columnId, label) => {
    const trimmed = (label ?? '').trim()
    if (!trimmed) return
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === boardId
          ? {
              ...b,
              columns: b.columns.map((c) =>
                c.id === columnId ? { ...c, label: trimmed } : c,
              ),
            }
          : b,
      ),
    }))
  },

  setColumnRole: (boardId, columnId, role) => {
    if (!COLUMN_ROLES.has(role)) return
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === boardId
          ? {
              ...b,
              columns: b.columns.map((c) =>
                c.id === columnId
                  ? { ...c, role, ...(role === 'wip' ? { wipLimit: 1 } : {}) }
                  : c,
              ),
            }
          : b,
      ),
    }))
  },

  // Returns the column ids removed so the caller can reassign their cards.
  deleteColumn: (boardId, columnId) => {
    const board = get().boards.find((b) => b.id === boardId)
    if (!board || board.columns.length <= 1) return null
    const column = board.columns.find((c) => c.id === columnId)
    if (!column) return null
    // Protect the flow engine's core role columns from deletion.
    if (board.system && ['queue', 'wip', 'done'].includes(column.role)) {
      const sameRole = board.columns.filter((c) => c.role === column.role)
      if (sameRole.length <= 1) return null
    }
    const fallbackId = board.columns.find((c) => c.id !== columnId)?.id ?? null
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === boardId
          ? { ...b, columns: b.columns.filter((c) => c.id !== columnId) }
          : b,
      ),
    }))
    return { fallbackColumnId: fallbackId }
  },

  reorderColumns: (boardId, fromIndex, toIndex) => {
    set((state) => ({
      boards: state.boards.map((b) => {
        if (b.id !== boardId) return b
        const columns = [...b.columns]
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= columns.length ||
          toIndex >= columns.length
        ) {
          return b
        }
        const [moved] = columns.splice(fromIndex, 1)
        columns.splice(toIndex, 0, moved)
        return { ...b, columns }
      }),
    }))
  },
}))

const debouncedPersist = createDebouncedPersist((boards, activeBoardId) => {
  saveJsonPersisted(BOARDS_KEY, { boards, activeBoardId })
})

useBoardsStore.subscribe((state, prev) => {
  if (state.boards !== prev.boards || state.activeBoardId !== prev.activeBoardId) {
    debouncedPersist(state.boards, state.activeBoardId)
  }
})

export { FLOW_BOARD_ID, createDefaultFlowBoard }
