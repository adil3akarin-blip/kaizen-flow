import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { initStorageSync, loadCardsPersisted } from './lib/persistStorage'
import { sanitizeCardsOnLoad } from './lib/cardSanitize'
import { buildColumnOrderFromCards, syncColumnOrderWithCards } from './lib/kanbanOrderUtils'
import { useCardsStore } from './store/useCardsStore'

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
 navigator.serviceWorker.getRegistrations().then((regs) => {
 regs.forEach((r) => r.unregister())
 })
}

if (import.meta.env.PROD) {
 registerSW({ immediate: true })
}

// C3: sync state when another tab writes to localStorage while this tab is hidden
initStorageSync(() => {
  const persisted = loadCardsPersisted()
  if (!persisted) return
  const cards = sanitizeCardsOnLoad(persisted.cards)
  const columnOrder = syncColumnOrderWithCards(
    cards,
    persisted.columnOrder ?? buildColumnOrderFromCards(cards),
  )
  useCardsStore.setState({ cards, columnOrder })
})

createRoot(document.getElementById('root')).render(
 <StrictMode>
 <App />
 </StrictMode>,
)
