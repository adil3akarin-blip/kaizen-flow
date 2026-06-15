// Pure helpers for the generalized board model. No store / React imports so
// both stores and the renderer can share them without circular deps.

import { generateId } from './id'

export const FLOW_BOARD_ID = 'flow'

export const COLUMN_ROLES = ['queue', 'wip', 'done', 'plain']

export const ROLE_LABELS = {
  queue: 'Очередь',
  wip: 'В работе (WIP)',
  done: 'Сделано',
  plain: 'Обычная',
}

// Column role → denormalized card status. 'plain' columns hold board-only cards
// that stay out of the Kaizen flow (Today / Review / streak).
export function roleToStatus(role) {
  if (role === 'queue') return 'filtered'
  if (role === 'wip') return 'wip'
  if (role === 'done') return 'done'
  return 'board'
}

// The system flow board. Column ids are the historical literals so existing
// cards (whose kanbanColumn references them) migrate without remapping.
export function createDefaultFlowBoard() {
  return {
    id: FLOW_BOARD_ID,
    name: 'Поток',
    system: true,
    columns: [
      { id: 'queue', label: 'Очередь', role: 'queue' },
      { id: 'progress', label: 'В работе', role: 'wip', wipLimit: 1 },
      { id: 'done', label: 'Сделано', role: 'done' },
      { id: 'next_week', label: 'След. неделя', role: 'queue', dayHidden: true },
    ],
  }
}

function sanitizeColumn(column) {
  if (!column || typeof column !== 'object') return null
  const id = typeof column.id === 'string' && column.id ? column.id : generateId()
  const label =
    typeof column.label === 'string' && column.label.trim()
      ? column.label.trim()
      : 'Колонка'
  const role = COLUMN_ROLES.includes(column.role) ? column.role : 'plain'
  const out = { id, label, role }
  if (role === 'wip') out.wipLimit = Number.isFinite(column.wipLimit) ? column.wipLimit : 1
  if (column.dayHidden) out.dayHidden = true
  return out
}

function sanitizeBoard(board) {
  if (!board || typeof board !== 'object') return null
  const id = typeof board.id === 'string' && board.id ? board.id : generateId()
  const name =
    typeof board.name === 'string' && board.name.trim() ? board.name.trim() : 'Доска'
  const columns = Array.isArray(board.columns)
    ? board.columns.map(sanitizeColumn).filter(Boolean)
    : []
  return {
    id,
    name,
    system: Boolean(board.system),
    columns: columns.length ? columns : [{ id: generateId(), label: 'Колонка', role: 'plain' }],
  }
}

export function sanitizeBoards(boards) {
  const list = Array.isArray(boards) ? boards.map(sanitizeBoard).filter(Boolean) : []

  const flowIndex = list.findIndex((b) => b.id === FLOW_BOARD_ID)
  if (flowIndex === -1) {
    return [createDefaultFlowBoard(), ...list]
  }

  // Keep the flow board first and guarantee it still has its core role columns.
  const flow = { ...list[flowIndex], system: true }
  const def = createDefaultFlowBoard()
  for (const role of ['queue', 'wip', 'done']) {
    if (!flow.columns.some((c) => c.role === role)) {
      flow.columns = [...flow.columns, def.columns.find((c) => c.role === role)]
    }
  }
  const rest = list.filter((_, i) => i !== flowIndex)
  return [flow, ...rest]
}

export function getBoard(boards, boardId) {
  return boards.find((b) => b.id === boardId) ?? null
}

export function getActiveBoard(boards, activeBoardId) {
  return getBoard(boards, activeBoardId) ?? boards[0] ?? createDefaultFlowBoard()
}

export function findColumn(board, columnId) {
  return board?.columns.find((c) => c.id === columnId) ?? null
}

export function getColumnRole(board, columnId) {
  return findColumn(board, columnId)?.role ?? 'plain'
}

export function firstColumnId(board) {
  return board?.columns[0]?.id ?? null
}

export function columnIds(board) {
  return (board?.columns ?? []).map((c) => c.id)
}

// Columns to render for a given flow-board view ('day' hides dayHidden columns).
export function visibleColumns(board, view) {
  if (!board) return []
  if (board.id === FLOW_BOARD_ID && view === 'day') {
    return board.columns.filter((c) => !c.dayHidden)
  }
  return board.columns
}

// The id of a board's wip column, if any (single global WIP lives here).
export function wipColumnId(board) {
  return board?.columns.find((c) => c.role === 'wip')?.id ?? null
}

export function firstColumnIdWithRole(board, role) {
  return board?.columns.find((c) => c.role === role)?.id ?? null
}
