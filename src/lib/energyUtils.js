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

export function getPresetAxisDefaults(preset) {
  return PRESET_AXIS_DEFAULTS[preset] || PRESET_AXIS_DEFAULTS.medium
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
