export const selectRawCards = (cards) =>
 cards.filter((c) => c.status === 'raw')

export const selectPullQueue = (cards) =>
 cards.filter((c) => c.status === 'filtered')

export const selectWipCard = (cards) =>
 cards.find((c) => c.status === 'wip') ?? null

export const selectKanbanCards = (cards) =>
 cards.filter((c) => ['filtered', 'wip', 'done'].includes(c.status))

// The flow board's cards (status-driven engine), gated to the flow board so
// that done cards living on a custom board don't leak into the flow columns.
export const selectFlowBoardCards = (cards) =>
 cards.filter(
 (c) =>
 (c.boardId ?? 'flow') === 'flow' &&
 ['filtered', 'wip', 'done'].includes(c.status),
 )

// All cards belonging to a specific custom board (any status).
export const selectBoardCards = (cards, boardId) =>
 cards.filter((c) => c.boardId === boardId)
