import { selectCardsInColumn } from './kanbanUtils'

export const FLOW_EMPTY_ACTIONS = {
  review: 'review',
  kanban: 'kanban',
  dump: 'dump',
}

function pluralizeThoughts(count) {
  if (count === 1) return '1 мысль ждёт разбора'
  if (count < 5) return `${count} мысли ждут разбора`
  return `${count} мыслей ждут разбора`
}

function pluralizeDeferred(count) {
  if (count === 1) return '1 дело отложено'
  if (count < 5) return `${count} дела отложено`
  return `${count} дел отложено`
}

export function selectNextWeekCount(cards) {
  return selectCardsInColumn(cards, 'next_week').length
}

export function resolveFlowEmptyCta({ rawCount, nextWeekCount }) {
  if (rawCount > 0) {
    return {
      action: FLOW_EMPTY_ACTIONS.review,
      message: pluralizeThoughts(rawCount),
      targetLabel: 'Разбор',
    }
  }

  if (nextWeekCount > 0) {
    return {
      action: FLOW_EMPTY_ACTIONS.kanban,
      message: pluralizeDeferred(nextWeekCount),
      targetLabel: 'Канбан',
    }
  }

  return {
    action: FLOW_EMPTY_ACTIONS.dump,
    message: 'Выгрузи первую мысль',
    targetLabel: 'Выгрузить',
  }
}
