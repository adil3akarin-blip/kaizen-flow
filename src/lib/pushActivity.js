import { safeGetItem, safeSetItem } from './persistStorage'

const LAST_DUMP_KEY = 'kaizenflow-last-dump-at'
const LAST_ACTIVE_KEY = 'kaizenflow-last-active-at'

export function recordLastDump() {
  safeSetItem(LAST_DUMP_KEY, String(Date.now()))
}

export function recordLastActive() {
  safeSetItem(LAST_ACTIVE_KEY, String(Date.now()))
}

export function getLastDumpAt() {
  const raw = safeGetItem(LAST_DUMP_KEY)
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function getLastActiveAt() {
  const raw = safeGetItem(LAST_ACTIVE_KEY)
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}
