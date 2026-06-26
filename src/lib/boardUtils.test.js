import { describe, it, expect } from 'vitest'
import {
  FLOW_BOARD_ID,
  createDefaultFlowBoard,
  roleToStatus,
  sanitizeBoards,
  visibleColumns,
  firstColumnIdWithRole,
} from './boardUtils'
import {
  createEmptyBoardOrder,
  moveInBoardOrder,
  removeFromBoardOrder,
  reorderInBoardOrder,
  syncBoardOrder,
  findCardBoardColumn,
} from './kanbanOrderUtils'

describe('roleToStatus', () => {
  it('maps column roles to card statuses', () => {
    expect(roleToStatus('queue')).toBe('filtered')
    expect(roleToStatus('wip')).toBe('wip')
    expect(roleToStatus('done')).toBe('done')
    expect(roleToStatus('plain')).toBe('board')
    expect(roleToStatus(undefined)).toBe('board')
  })
})

describe('createDefaultFlowBoard', () => {
  it('is the system flow board with stable column ids and roles', () => {
    const board = createDefaultFlowBoard()
    expect(board.id).toBe(FLOW_BOARD_ID)
    expect(board.system).toBe(true)
    expect(board.columns.map((c) => c.id)).toEqual([
      'queue',
      'progress',
      'done',
      'next_week',
    ])
    expect(firstColumnIdWithRole(board, 'wip')).toBe('progress')
    expect(firstColumnIdWithRole(board, 'done')).toBe('done')
  })
})

describe('sanitizeBoards', () => {
  it('seeds the flow board when there is nothing persisted', () => {
    const boards = sanitizeBoards(null)
    expect(boards).toHaveLength(1)
    expect(boards[0].id).toBe(FLOW_BOARD_ID)
  })

  it('prepends a flow board if persisted data lacks one', () => {
    const boards = sanitizeBoards([
      { id: 'x', name: 'Проект', columns: [{ id: 'a', label: 'A', role: 'plain' }] },
    ])
    expect(boards[0].id).toBe(FLOW_BOARD_ID)
    expect(boards.some((b) => b.id === 'x')).toBe(true)
  })

  it('keeps the flow board first and guarantees its core role columns', () => {
    const boards = sanitizeBoards([
      { id: FLOW_BOARD_ID, name: 'Поток', system: true, columns: [
        { id: 'queue', label: 'Очередь', role: 'queue' },
      ] },
    ])
    const flow = boards[0]
    expect(flow.id).toBe(FLOW_BOARD_ID)
    expect(flow.columns.some((c) => c.role === 'wip')).toBe(true)
    expect(flow.columns.some((c) => c.role === 'done')).toBe(true)
  })

  it('drops invalid columns but never leaves a board empty', () => {
    const boards = sanitizeBoards([
      { id: 'y', name: 'Y', columns: [null, 42, { label: 'ok' }] },
    ])
    const y = boards.find((b) => b.id === 'y')
    expect(y.columns.length).toBeGreaterThanOrEqual(1)
  })
})

describe('visibleColumns', () => {
  it('hides dayHidden columns on the flow board in day view', () => {
    const flow = createDefaultFlowBoard()
    const day = visibleColumns(flow, 'day').map((c) => c.id)
    const week = visibleColumns(flow, 'week').map((c) => c.id)
    expect(day).not.toContain('next_week')
    expect(week).toContain('next_week')
  })
})

describe('board order helpers', () => {
  const cols = ['todo', 'doing', 'done']

  it('places cards by their kanbanColumn and appends unknowns to the first', () => {
    const cards = [
      { id: 'a', kanbanColumn: 'doing', createdAt: 1 },
      { id: 'b', kanbanColumn: 'todo', createdAt: 2 },
      { id: 'c', kanbanColumn: 'missing', createdAt: 3 },
    ]
    const order = syncBoardOrder(cards, createEmptyBoardOrder(cols), cols)
    expect(order.doing).toEqual(['a'])
    expect(order.todo).toEqual(['b', 'c'])
  })

  it('moves and reorders within the board order', () => {
    let order = { todo: ['a', 'b'], doing: [], done: [] }
    order = moveInBoardOrder(order, 'a', 'doing', cols)
    expect(order.doing).toEqual(['a'])
    expect(order.todo).toEqual(['b'])

    order = { todo: ['a', 'b', 'c'], doing: [], done: [] }
    order = reorderInBoardOrder(order, 'todo', 0, 2)
    expect(order.todo).toEqual(['b', 'c', 'a'])
  })

  it('removes an id and finds a card column/index', () => {
    const order = { todo: ['a'], doing: ['b', 'c'], done: [] }
    expect(findCardBoardColumn(order, cols, 'c')).toEqual({ columnId: 'doing', index: 1 })
    const removed = removeFromBoardOrder(order, 'b', cols)
    expect(removed.doing).toEqual(['c'])
  })
})
