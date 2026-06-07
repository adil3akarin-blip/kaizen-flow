export const ENERGY_PRESETS = {
  brisk: {
    id: 'brisk',
    label: 'Бодрый',
    advice: 'Отличное время для сложного дела',
  },
  medium: {
    id: 'medium',
    label: 'Средне',
    advice: 'Хорошее время для одного дела из очереди',
  },
  depleted: {
    id: 'depleted',
    label: 'На нуле',
    advice: 'Лучше взять что-то лёгкое или передохнуть',
  },
}

export const ENERGY_AXES = [
  {
    id: 'workRest',
    leftLabel: 'Отдых',
    rightLabel: 'Работа',
  },
  {
    id: 'tensionRelaxation',
    leftLabel: 'Расслабление',
    rightLabel: 'Напряжение',
  },
]

const PRESET_AXIS_DEFAULTS = {
  brisk: { workRest: 75, tensionRelaxation: 60 },
  medium: { workRest: 50, tensionRelaxation: 50 },
  depleted: { workRest: 25, tensionRelaxation: 30 },
}

export const RECOVERY_IDEAS = [
  'Прогулка без телефона',
  '10 минут тишины',
  'Чай и ничего не делать',
  'Лёгкое дело из очереди',
]

const AXIS_NUANCE_THRESHOLD = 20
const PRESET_THRESHOLDS = { depleted: 35, brisk: 65 }
const AXIS_WEIGHTS = { workRest: 0.6, tensionRelaxation: 0.4 }

export function getPresetAxisDefaults(preset) {
  return PRESET_AXIS_DEFAULTS[preset] || PRESET_AXIS_DEFAULTS.medium
}

export function derivePresetFromAxes(axes) {
  const workRest = axes.workRest ?? 50
  const tensionRelaxation = axes.tensionRelaxation ?? 50
  const weighted =
    workRest * AXIS_WEIGHTS.workRest +
    tensionRelaxation * AXIS_WEIGHTS.tensionRelaxation

  if (weighted < PRESET_THRESHOLDS.depleted) return 'depleted'
  if (weighted > PRESET_THRESHOLDS.brisk) return 'brisk'
  return 'medium'
}

export function getAxisNuance(preset, axes) {
  const defaults = getPresetAxisDefaults(preset)
  const workRest = axes.workRest ?? 50
  const tensionRelaxation = axes.tensionRelaxation ?? 50

  if (workRest < defaults.workRest - AXIS_NUANCE_THRESHOLD) {
    return 'Тело просит отдыха'
  }
  if (tensionRelaxation > defaults.tensionRelaxation + AXIS_NUANCE_THRESHOLD) {
    return 'Много напряжения — не разгоняйся'
  }
  if (workRest > defaults.workRest + AXIS_NUANCE_THRESHOLD) {
    return 'Есть запас на дело'
  }
  if (tensionRelaxation < defaults.tensionRelaxation - AXIS_NUANCE_THRESHOLD) {
    return 'Расслаблен — хорошо для лёгких дел'
  }
  return null
}

export function shouldShowRecoverySection(preset, recentHeavyCount) {
  return preset === 'depleted' || recentHeavyCount >= 2
}

export function getEnergyAdvice(preset) {
  return ENERGY_PRESETS[preset]?.advice ?? ENERGY_PRESETS.medium.advice
}

export function isCardEnergyDimmed(card, energyLevel = 'medium') {
  if (energyLevel !== 'depleted') return false
  return card.energyCost === 'heavy'
}

export function canPullCard(card, energyLevel = 'medium') {
  if (energyLevel !== 'depleted') return true
  return card.energyCost !== 'heavy'
}

export function findLightAlternatives(cards, excludeId) {
  return cards.filter(
    (c) => c.id !== excludeId && c.energyCost === 'light',
  )
}
