const CARDS_KEY = 'kaizenflow-cards'
const CARDS_BACKUP_KEY = 'kaizenflow-cards-backup'

let quotaToastShown = false

// Raw localStorage access can throw (storage disabled, private mode) —
// these helpers degrade to null / no-op so module init never crashes the app.
export function safeGetItem(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // quota / private mode — degrade silently
  }
}

export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function loadCardsPersisted() {
  try {
    const raw = localStorage.getItem(CARDS_KEY)
    if (!raw) return null

    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.cards)) return null

    return {
      cards: data.cards,
      columnOrder: data.columnOrder ?? null,
      boardOrders: data.boardOrders ?? null,
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

export function saveCardsPersisted(cards, columnOrder, boardOrders) {
  try {
    localStorage.setItem(
      CARDS_KEY,
      JSON.stringify({ cards, columnOrder, boardOrders }),
    )
  } catch {
    // C4: show one-time toast on quota/private-mode failure
    if (!quotaToastShown) {
      quotaToastShown = true
      // Lazy import to avoid circular dep at module load time
      import('./quotaToast').then(({ showQuotaWarning }) => showQuotaWarning())
    }
  }
}

// Generic JSON persistence for non-critical local stores (timer, habits).
// Reads degrade to null; writes degrade silently (quota / private mode).
export function loadJsonPersisted(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null

    return data
  } catch {
    return null
  }
}

export function saveJsonPersisted(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // non-critical store — degrade silently
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
