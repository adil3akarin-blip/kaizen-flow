const EMPTY_COPY = {
  queue: {
    day: {
      primary: 'Сюда попадают дела после разбора',
      dragHint: 'или перетащи сюда',
    },
    week: {
      primary: 'Дела, которые держишь на эту неделю',
      dragHint: 'или перетащи сюда',
    },
  },
  progress: {
    primary: 'Одно дело в единицу времени',
    dragHint: 'Вытяни из очереди — или перетащи',
  },
  done: {
    primary: 'Завершённые дела окажутся здесь',
  },
  next_week: {
    primary: 'Сюда можно отложить на потом',
  },
}

export function getKanbanEmptyState(columnId, view, dragEnabled) {
  if (columnId === 'queue') {
    const copy = EMPTY_COPY.queue[view]
    return {
      primary: copy.primary,
      dragHint: dragEnabled ? copy.dragHint : null,
      accented: false,
    }
  }

  if (columnId === 'progress') {
    return {
      primary: EMPTY_COPY.progress.primary,
      dragHint: dragEnabled ? EMPTY_COPY.progress.dragHint : null,
      accented: true,
    }
  }

  if (columnId === 'done') {
    return {
      primary: EMPTY_COPY.done.primary,
      dragHint: null,
      accented: false,
    }
  }

  if (columnId === 'next_week') {
    return {
      primary: EMPTY_COPY.next_week.primary,
      dragHint: null,
      accented: false,
    }
  }

  return null
}
