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
 : { id: 'value-fallback', label: 'Это приближает меня к цели?' }

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

export function sanitizeCriteriaResults(results = [], criteria = []) {
 const validIds = new Set(criteria.map((c) => c.id))
 return results.filter((r) => validIds.has(r.criterionId))
}

export function buildFilterDraft(card, criteria) {
 const missionCriteriaResults = sanitizeCriteriaResults(
 card.missionCriteriaResults ?? [],
 criteria,
 )

 return {
 wantMust: card.wantMust ?? null,
 missionCriteriaResults,
 timeInvestment: card.timeInvestment ?? null,
 }
}

export function resolveFilterStep(card, criteria) {
 if (!card?.wantMust) return 0

 const totalSteps = 1 + criteria.length + 1
 const results = sanitizeCriteriaResults(card.missionCriteriaResults ?? [], criteria)

 for (let i = 0; i < criteria.length; i++) {
 const answered = results.some((r) => r.criterionId === criteria[i].id)
 if (!answered) return i + 1
 }

 return totalSteps - 1
}
