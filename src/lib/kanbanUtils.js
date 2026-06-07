export const DAY_COLUMNS = [
  { id: 'queue', label: 'Очередь' },
  { id: 'progress', label: 'В работе' },
  { id: 'done', label: 'Сделано' },
]

export const WEEK_COLUMNS = [
  { id: 'queue', label: 'На неделе' },
  { id: 'progress', label: 'В работе' },
  { id: 'done', label: 'Сделано' },
  { id: 'next_week', label: 'След. неделя' },
]

export const IN_PROGRESS_COLUMN = 'progress'
export const DONE_COLUMN = 'done'

const KANBAN_STATUSES = new Set(['filtered', 'wip', 'done'])

export function isKanbanCard(card) {
  return KANBAN_STATUSES.has(card.status)
}

export function resolveKanbanColumn(card) {
  if (card.kanbanColumn) return card.kanbanColumn
  if (card.status === 'wip') return IN_PROGRESS_COLUMN
  if (card.status === 'done') return DONE_COLUMN
  return 'queue'
}

export function columnToStatus(columnId) {
  if (columnId === IN_PROGRESS_COLUMN) return 'wip'
  if (columnId === DONE_COLUMN) return 'done'
  return 'filtered'
}

export function selectCardsInColumn(cards, columnId) {
  return cards.filter(
    (c) => isKanbanCard(c) && resolveKanbanColumn(c) === columnId,
  )
}

export function shouldResetStuckSince(columnId) {
  return columnId === IN_PROGRESS_COLUMN || columnId === DONE_COLUMN
}
