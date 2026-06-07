export const RESULT_EFFORT_VERDICTS = {
  yes: { id: 'yes', label: 'Да, стоит' },
  maybe: { id: 'maybe', label: 'Сомневаюсь' },
  no: { id: 'no', label: 'Нет, не сейчас' },
}

export function getVerdictLabel(verdict) {
  return RESULT_EFFORT_VERDICTS[verdict]?.label ?? null
}

export function suggestsReconsider(verdict) {
  return verdict === 'maybe' || verdict === 'no'
}

export function buildResultEffort(gain, cost, verdict) {
  return {
    gain: gain.trim(),
    cost: cost.trim(),
    verdict,
    evaluatedAt: Date.now(),
  }
}

export function hasResultEffort(value) {
  return Boolean(value?.verdict)
}
