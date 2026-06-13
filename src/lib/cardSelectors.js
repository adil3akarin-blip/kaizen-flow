export const selectRawCards = (cards) =>
 cards.filter((c) => c.status === 'raw')

export const selectPullQueue = (cards) =>
 cards.filter((c) => c.status === 'filtered')

export const selectWipCard = (cards) =>
 cards.find((c) => c.status === 'wip') ?? null

export const selectKanbanCards = (cards) =>
 cards.filter((c) => ['filtered', 'wip', 'done'].includes(c.status))
