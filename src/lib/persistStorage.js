const CARDS_KEY = 'kaizenflow-cards'
const ENERGY_KEY = 'kaizenflow-energy'

export function loadCardsPersisted() {
  try {
    const raw = localStorage.getItem(CARDS_KEY)
    if (!raw) return null

    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.cards)) return null

    return {
      cards: data.cards,
      columnOrder: data.columnOrder ?? null,
    }
  } catch {
    return null
  }
}

export function saveCardsPersisted(cards, columnOrder) {
  try {
    localStorage.setItem(CARDS_KEY, JSON.stringify({ cards, columnOrder }))
  } catch {
    // quota or private mode — degrade silently
  }
}

export function loadEnergyPersisted() {
  try {
    const raw = localStorage.getItem(ENERGY_KEY)
    if (!raw) return null

    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null

    return data
  } catch {
    return null
  }
}

export function saveEnergyPersisted(data) {
  try {
    localStorage.setItem(ENERGY_KEY, JSON.stringify(data))
  } catch {
    // quota or private mode — degrade silently
  }
}

export function createDebouncedPersist(fn, delayMs = 300) {
  let timeoutId = null

  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delayMs)
  }
}
