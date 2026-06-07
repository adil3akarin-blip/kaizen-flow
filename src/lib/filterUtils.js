export const DEFAULT_INVESTMENT_TAGS = [
  'Здоровье',
  'Работа',
  'Отношения',
  'Творчество',
  'Отдых',
  'Обучение',
]

const FILTER_HINT_KEY = 'kaizenflow-filter-count'

export function buildFilterCriteria(personalMission, customCriteria = []) {
  const primary = personalMission?.trim()
    ? { id: 'mission', label: `Это про «${personalMission.trim()}»?` }
    : { id: 'energy-fallback', label: 'Стоит ли это моей энергии?' }

  return [primary, ...customCriteria.slice(0, 5)]
}

export function shouldShowSwipeHint() {
  const count = Number.parseInt(localStorage.getItem(FILTER_HINT_KEY) || '0', 10)
  return count < 3
}

export function incrementFilterHintCount() {
  const count = Number.parseInt(localStorage.getItem(FILTER_HINT_KEY) || '0', 10)
  localStorage.setItem(FILTER_HINT_KEY, String(count + 1))
}
