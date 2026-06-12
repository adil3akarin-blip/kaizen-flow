const CARDS_KEY = 'kaizenflow-cards'
const CARDS_BACKUP_KEY = 'kaizenflow-cards-backup'
const ENERGY_KEY = 'kaizenflow-energy'

let quotaToastShown = false

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
    // C5: back up corrupted data before returning null
    try {
      const raw = localStorage.getItem(CARDS_KEY)
      if (raw) localStorage.setItem(CARDS_BACKUP_KEY, raw)
    } catch {
      // ignore backup failure
    }
    return null
  }
}

export function saveCardsPersisted(cards, columnOrder) {
  try {
    localStorage.setItem(CARDS_KEY, JSON.stringify({ cards, columnOrder }))
  } catch {
    // C4: show one-time toast on quota/private-mode failure
    if (!quotaToastShown) {
      quotaToastShown = true
      // Lazy import to avoid circular dep at module load time
      import('./quotaToast').then(({ showQuotaWarning }) => showQuotaWarning())
    }
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
    // quota or private mode — energy is non-critical, degrade silently
  }
}

export function createDebouncedPersist(fn, delayMs = 300) {
  let timeoutId = null

  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delayMs)
  }
}

// C3: cross-tab storage sync
export function initStorageSync(rehydrate) {
  window.addEventListener('storage', (e) => {
    if (e.key === CARDS_KEY && document.hidden) {
      rehydrate()
    }
  })
}
