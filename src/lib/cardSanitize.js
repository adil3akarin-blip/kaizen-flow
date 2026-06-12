import {
 generatePosition,
 pickRandomColor,
 randomRotation,
} from './cardUtils'
import { DONE_COLUMN, IN_PROGRESS_COLUMN } from './kanbanUtils'

const VALID_STATUSES = new Set(['raw', 'filtered', 'wip', 'done'])
const VALID_KANBAN_COLUMNS = new Set([
 'queue',
 IN_PROGRESS_COLUMN,
 DONE_COLUMN,
 'next_week',
])

function hasCanvasPosition(card) {
 return (
 typeof card.x === 'number' &&
 typeof card.y === 'number' &&
 !Number.isNaN(card.x) &&
 !Number.isNaN(card.y)
 )
}

export function sanitizeCardsOnLoad(cards) {
 let wipKept = false

 const normalized = cards.map((card) => {
 let next = { ...card }

 // Soft migration: drop removed Power Management fields from older data.
 delete next.energyCost
 delete next.resultEffort

 if (!VALID_STATUSES.has(next.status)) {
 next.status = 'raw'
 }

 if (next.status === 'raw') {
 delete next.kanbanColumn
 delete next.stuckSince
 }

 if (next.status === 'wip') {
 if (wipKept) {
 next = {
 ...next,
 status: 'filtered',
 kanbanColumn: 'queue',
 }
 } else {
 wipKept = true
 next.kanbanColumn = IN_PROGRESS_COLUMN
 }
 }

 if (next.status === 'filtered') {
 if (
 !next.kanbanColumn ||
 !VALID_KANBAN_COLUMNS.has(next.kanbanColumn) ||
 next.kanbanColumn === IN_PROGRESS_COLUMN
 ) {
 next.kanbanColumn = 'queue'
 }
 }

 if (next.status === 'done') {
 next.kanbanColumn = DONE_COLUMN
 }

 return next
 })

 return normalized.map((card) => {
 if (card.status !== 'raw') return card

 let next = { ...card }

 if (!next.color?.bg) {
 next.color = pickRandomColor()
 }
 if (typeof next.rotation !== 'number' || Number.isNaN(next.rotation)) {
 next.rotation = randomRotation()
 }
 if (!hasCanvasPosition(next)) {
 const placed = normalized.filter(
 (c) => c.status === 'raw' && c.id !== card.id && hasCanvasPosition(c),
 )
 const position = generatePosition(placed)
 next.x = position.x
 next.y = position.y
 } else {
 next.x = Math.max(0, next.x)
 next.y = Math.max(0, next.y)
 }

 return next
 })
}
