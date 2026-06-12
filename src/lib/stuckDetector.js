import { DONE_COLUMN, IN_PROGRESS_COLUMN, resolveKanbanColumn } from './kanbanUtils'

const STUCK_THRESHOLD_MS = 5 * 24 * 60 * 60 * 1000
const STUCK_EXEMPT = new Set([IN_PROGRESS_COLUMN, DONE_COLUMN])

export function isCardStuck(card) {
 const column = resolveKanbanColumn(card)
 if (STUCK_EXEMPT.has(column)) return false
 if (!card.stuckSince) return false
 return Date.now() - card.stuckSince >= STUCK_THRESHOLD_MS
}

export function selectStuckCards(cards) {
 return cards.filter(isCardStuck)
}
