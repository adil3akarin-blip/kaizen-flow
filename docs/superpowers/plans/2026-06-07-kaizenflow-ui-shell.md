# KaizenFlow UI Shell — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Мигрировать KaizenFlow с split-view (`DumpPanel` + `Canvas`) на mobile-first shell (3 вкладки + `DumpOverlay` + center action) и поэтапно реализовать все экраны из [ui-shell spec](../specs/2026-06-07-kaizenflow-ui-shell.md).

**Architecture:** Zustand-сторы по доменам (`useAppStore` — shell/onboarding, `useCardsStore` — карточки, `useEnergyStore` — энергия). Навигация без react-router — `activeTab` в сторе. Чистая логика селекторов карточек в `lib/`. Существующие `DumpPanel` / `Canvas` / `StickyNote` рефакторятся, не переписываются с нуля.

**Tech Stack:** React 19, Vite 8, Tailwind v4, Zustand 5, Framer Motion 12, clsx. Верификация: `npm run lint`, `npm run build`, ручная проверка в браузере (тестового фреймворка нет).

**Spec:** [2026-06-07-kaizenflow-ui-shell.md](../specs/2026-06-07-kaizenflow-ui-shell.md)  
**Roadmap:** [2026-06-07-kaizenflow-roadmap.md](../specs/2026-06-07-kaizenflow-roadmap.md)

---

## File map (целевая структура)

```
src/
  App.jsx                          # AppShell + UndoToast
  components/
    shell/
      AppShell.jsx                 # layout: mobile tab bar / desktop sidebar
      TabBar.jsx                   # Поток · ◉ · Разбор · Канбан
      Sidebar.jsx                  # desktop nav + Выгрузить
      DumpOverlay.jsx              # refactor DumpPanel → overlay
    onboarding/
      ManifestScreen.jsx
      MissionScreen.jsx
    tabs/
      FlowTab.jsx
      ReviewTab.jsx
      KanbanTab.jsx
    review/
      ReviewInbox.jsx
      SilenceCanvas.jsx            # Canvas + dot-grid, silence only
      FilterFlow.jsx               # swipe pipeline
    flow/
      WipSlot.jsx
      PullQueue.jsx
      EnergySnapshot.jsx
    cards/
      StructuredCard.jsx           # flat card for pull/wip/kanban
      CardEditSheet.jsx
    Canvas.jsx                     # deprecated → SilenceCanvas
    DumpPanel.jsx                  # deprecated → DumpOverlay internals
    StickyNote.jsx                 # keep for silence canvas
    UndoToast.jsx
  store/
    useAppStore.js                 # tab, onboarding, silenceWeek, overlayOpen
    useCardsStore.js               # + status, filter fields, persist
    useEnergyStore.js              # phase 6
  lib/
    cardUtils.js                   # + status default raw
    cardSelectors.js               # selectRaw, selectPull, selectWip…
    persistStorage.js              # localStorage adapter
    vibration.js                   # S4 wrapper
```

---

## Phase 0 — S1 Персистентность

**Deliverable:** Карточки и настройки app переживают перезагрузку; mockCards только при пустом хранилище.

### Task 0.1: Storage adapter

**Files:**
- Create: `src/lib/persistStorage.js`

- [ ] **Step 1: Создать adapter**

```js
const STORAGE_KEY = 'kaizenflow-cards-v1'

export function loadCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveCards(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`  
Expected: PASS

### Task 0.2: Extend card model with status

**Files:**
- Modify: `src/lib/cardUtils.js`
- Modify: `src/store/useCardsStore.js`

- [ ] **Step 1: Добавить `status: 'raw'` в `createCard`**

```js
// cardUtils.js — в return createCard:
status: 'raw',
```

- [ ] **Step 2: Инициализация стора из localStorage**

```js
// useCardsStore.js
import { loadCards, saveCards } from '../lib/persistStorage'
import { mockCards } from '../data/mockCards'

const initialCards = loadCards() ?? mockCards

export const useCardsStore = create((set, get) => ({
  cards: initialCards.map((c) => ({ status: 'raw', ...c })),
  // ...
}))
```

- [ ] **Step 3: Подписка на сохранение** (в `main.jsx` или в конце `useCardsStore.js`)

```js
useCardsStore.subscribe((state) => {
  saveCards(state.cards)
})
```

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`  
Browser: добавить карточку → F5 → карточка на месте.

---

## Phase 1 — Shell v1 (S2 foundation)

**Deliverable:** Tab bar + center action + `DumpOverlay` + заглушки трёх вкладок. Split-view удалён. Повторный запуск → «Поток».

### Task 1.1: App store

**Files:**
- Create: `src/store/useAppStore.js`

- [ ] **Step 1: Создать стор**

```js
import { create } from 'zustand'

export const TABS = { flow: 'flow', review: 'review', kanban: 'kanban' }

export const useAppStore = create((set) => ({
  activeTab: TABS.flow,
  dumpOpen: false,
  onboardingComplete: localStorage.getItem('kaizenflow-onboarding') === '1',
  silenceWeek: false,

  setTab: (tab) => set({ activeTab: tab }),
  openDump: () => set({ dumpOpen: true }),
  closeDump: () => set({ dumpOpen: false }),
  completeOnboarding: () => {
    localStorage.setItem('kaizenflow-onboarding', '1')
    set({ onboardingComplete: true, activeTab: TABS.review, silenceWeek: true })
  },
  setSilenceWeek: (v) => set({ silenceWeek: v }),
}))
```

- [ ] **Step 2: Verify** — `npm run lint`

### Task 1.2: TabBar + center action

**Files:**
- Create: `src/components/shell/TabBar.jsx`

- [ ] **Step 1: Реализовать tab bar** (виден только `< md`, класс `md:hidden`)

```jsx
import clsx from 'clsx'
import { TABS, useAppStore } from '../../store/useAppStore'

const NAV_ITEMS = [
  { id: TABS.flow, label: 'Поток' },
  { id: TABS.review, label: 'Разбор' },
  { id: TABS.kanban, label: 'Канбан' },
]

export default function TabBar() {
  const activeTab = useAppStore((s) => s.activeTab)
  const setTab = useAppStore((s) => s.setTab)
  const openDump = useAppStore((s) => s.openDump)
  const silenceWeek = useAppStore((s) => s.silenceWeek)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-end justify-around border-t border-cream-dark bg-cream px-2 pb-[env(safe-area-inset-bottom)] pt-2 md:hidden">
      {NAV_ITEMS.map((item, i) => (
        <div key={item.id} className="flex flex-1 items-center justify-center">
          {i === 1 && (
            <button
              type="button"
              onClick={openDump}
              aria-label="Выгрузить"
              className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-warm-accent text-sm font-medium text-white shadow-lg shadow-warm-accent/30"
            >
              Выгрузить
            </button>
          )}
          {i !== 1 && (
            <button
              type="button"
              onClick={() => setTab(item.id)}
              className={clsx(
                'py-2 text-sm',
                activeTab === item.id ? 'text-warm-text font-medium' : 'text-warm-muted',
                silenceWeek && item.id !== TABS.review && 'opacity-50',
              )}
            >
              {item.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  )
}
```

> **Note:** Раскладка center action между вкладками — уточнить в impl.; допустимо: `[Поток] [◉] [Разбор] [Канбан]` как 4 элемента в одном `flex`.

- [ ] **Step 2: Verify** — mobile viewport в devtools, tab bar виден.

### Task 1.3: Sidebar (desktop)

**Files:**
- Create: `src/components/shell/Sidebar.jsx`

- [ ] **Step 1: Sidebar** (`hidden md:flex`, accent «Выгрузить», 3 вкладки, `Ctrl+Enter` в `useEffect`)

- [ ] **Step 2: Verify** — desktop width ≥768px, sidebar виден, tab bar скрыт.

### Task 1.4: DumpOverlay refactor

**Files:**
- Create: `src/components/shell/DumpOverlay.jsx`
- Modify: `src/components/DumpPanel.jsx` — extract shared form logic or re-export

- [ ] **Step 1: Перенести логику `DumpPanel`** в overlay:
  - props: `open`, `onClose`
  - mobile: `fixed inset-x-0 bottom-0` bottom sheet + backdrop
  - desktop: centered modal (`max-w-md`)
  - режимы `idle / capturing / flow` — без изменений

- [ ] **Step 2: Подключить к `useAppStore`**

```jsx
// AppShell.jsx
const dumpOpen = useAppStore((s) => s.dumpOpen)
const closeDump = useAppStore((s) => s.closeDump)
// ...
<DumpOverlay open={dumpOpen} onClose={closeDump} />
```

- [ ] **Step 3: Verify** — center action / sidebar / Ctrl+Enter открывают overlay; Esc закрывает.

### Task 1.5: Tab placeholders

**Files:**
- Create: `src/components/tabs/FlowTab.jsx`
- Create: `src/components/tabs/ReviewTab.jsx`
- Create: `src/components/tabs/KanbanTab.jsx`

- [ ] **Step 1: Минимальные заглушки** с заголовком вкладки и `pb-24` (padding под tab bar).

- [ ] **Step 2: Verify** — переключение вкладок работает.

### Task 1.6: AppShell + App.jsx

**Files:**
- Create: `src/components/shell/AppShell.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: AppShell**

```jsx
import { useAppStore, TABS } from '../../store/useAppStore'
import TabBar from './TabBar'
import Sidebar from './Sidebar'
import DumpOverlay from './DumpOverlay'
import FlowTab from '../tabs/FlowTab'
import ReviewTab from '../tabs/ReviewTab'
import KanbanTab from '../tabs/KanbanTab'

const TAB_CONTENT = {
  [TABS.flow]: FlowTab,
  [TABS.review]: ReviewTab,
  [TABS.kanban]: KanbanTab,
}

export default function AppShell() {
  const activeTab = useAppStore((s) => s.activeTab)
  const Content = TAB_CONTENT[activeTab]

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <main className="flex flex-1 flex-col pb-24 md:pb-0">
        <Content />
      </main>
      <TabBar />
      <DumpOverlay />
    </div>
  )
}
```

```jsx
// App.jsx
import AppShell from './components/shell/AppShell'
import UndoToast from './components/UndoToast'

export default function App() {
  return (
    <>
      <AppShell />
      <UndoToast />
    </>
  )
}
```

- [ ] **Step 2: Удалить** прямой рендер `DumpPanel` + `Canvas` из `App.jsx`.

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build`  
Browser: shell работает; старый split-view исчез.

---

## Phase 2 — Онбординг + «Неделя тишины»

**Deliverable:** Первый запуск → манифест → «Разбор» в тишине с холстом. Повторный → «Поток».

### Task 2.1: ManifestScreen

**Files:**
- Create: `src/components/onboarding/ManifestScreen.jsx`
- Modify: `src/components/shell/AppShell.jsx`

- [ ] **Step 1: Экран манифеста** (fullscreen, copy из spec, кнопка «Начать» → `completeOnboarding()`).

- [ ] **Step 2: Условный рендер**

```jsx
const onboardingComplete = useAppStore((s) => s.onboardingComplete)
if (!onboardingComplete) return <ManifestScreen />
```

- [ ] **Step 3: Verify** — incognito / `localStorage.clear()` → манифест; после «Начать» → «Разбор», `silenceWeek: true`.

### Task 2.2: SilenceCanvas

**Files:**
- Create: `src/components/review/SilenceCanvas.jsx` (extract from `Canvas.jsx` + dot-grid)
- Modify: `src/components/tabs/ReviewTab.jsx`

- [ ] **Step 1: Холст только для `silenceWeek`** — переиспользовать `StickyNote`, dot-grid background.

- [ ] **Step 2: ReviewTab** — если `silenceWeek` → `SilenceCanvas` + header «Неделя тишины» + кнопка «Готов разбирать» (пока без миссии).

- [ ] **Step 3: DumpOverlay** — при `silenceWeek` новые карточки `status: 'raw'` с x/y на холсте (как сейчас).

- [ ] **Step 4: Verify** — выгрузка в тишине → стикер на холсте; «Поток»/«Канбан» приглушены.

### Task 2.3: MissionScreen

**Files:**
- Create: `src/components/onboarding/MissionScreen.jsx`
- Create: `src/store/useSettingsStore.js` (или поля в `useAppStore`: `personalMission`)

- [ ] **Step 1: «Готов разбирать»** → `MissionScreen` → `setSilenceWeek(false)` → inbox mode.

- [ ] **Step 2: Persist** `personalMission` в localStorage.

- [ ] **Step 3: Verify** — выход из тишины → обычный «Разбор» (inbox placeholder).

---

## Phase 3 — «Разбор»: inbox + фильтр (Фаза 2 roadmap)

**Deliverable:** Inbox с inline edit + кнопка «Разобрать»; полный filter pipeline; стикер → `StructuredCard`.

### Task 3.1: Card selectors

**Files:**
- Create: `src/lib/cardSelectors.js`

- [ ] **Step 1: Чистые селекторы**

```js
export const selectRawCards = (cards) => cards.filter((c) => c.status === 'raw')
export const selectPullQueue = (cards) => cards.filter((c) => c.status === 'filtered')
export const selectWipCard = (cards) => cards.find((c) => c.status === 'wip') ?? null
```

### Task 3.2: StructuredCard

**Files:**
- Create: `src/components/cards/StructuredCard.jsx`

- [ ] **Step 1: Ровная карточка** — без `rotation`, cream/white, опционально chips (`energyCost`, `wantMust`).

### Task 3.3: ReviewInbox

**Files:**
- Create: `src/components/review/ReviewInbox.jsx`

- [ ] **Step 1: Список `raw` карточек** — tap → inline edit (`updateCardText`); кнопка «Разобрать» → открыть `FilterFlow` для `cardId`.

- [ ] **Step 2: Desktop** — inbox слева, `FilterFlow` справа при активной карточке (`md:grid md:grid-cols-2`).

### Task 3.4: FilterFlow pipeline

**Files:**
- Create: `src/components/review/FilterFlow.jsx`
- Modify: `src/store/useCardsStore.js` — `setCardFilterResult`, `moveToPull`, etc.

- [ ] **Step 1: Шаг Хочу/Должен** — swipe (Framer Motion `drag="x"`) + «Не знаю».

- [ ] **Step 2: Критерии миссии** — 1 экран = 1 критерий; дефолт из `personalMission`.

- [ ] **Step 3: Финал** — В поток / Пока не ясно / Отпустить; optional tags + energy chips.

- [ ] **Step 4: «В поток»** → `status: 'filtered'`, `rotation: 0`, clear x/y layout.

- [ ] **Step 5: Verify** — полный pipeline одной карточки; undo на «Отпустить».

### Task 3.5: Filter criteria store

**Files:**
- Modify: `src/store/useSettingsStore.js`

- [ ] **Step 1: `filterCriteria[]`** max 5, `investmentTags[]`, CRUD actions.

---

## Phase 4 — «Поток» dashboard (Фаза 3 partial)

**Deliverable:** WIP + pull + empty states + energy snapshot placeholder + nudge hooks.

### Task 4.1: Store actions for flow

**Files:**
- Modify: `src/store/useCardsStore.js`

- [ ] **Step 1: Actions**

```js
pullToWip: (id) => { /* gate if wip exists */ },
completeWip: () => { /* status → done */ },
discardWip: () => { /* status → discarded + undo */ },
releaseWip: () => { /* wip → filtered */ },
```

### Task 4.2: WipSlot + PullQueue

**Files:**
- Create: `src/components/flow/WipSlot.jsx`
- Create: `src/components/flow/PullQueue.jsx`
- Create: `src/components/cards/CardEditSheet.jsx`

- [ ] **Step 1: WipSlot** — пустой placeholder (Q36), кнопки «Сделано»/«Не актуально», «⋯».

- [ ] **Step 2: PullQueue** — tap = pull, «⋯» = sheet, energy-dimmed cards.

- [ ] **Step 3: FlowTab** — stack mobile; `md:grid-cols-2` desktop (Q31).

- [ ] **Step 4: Verify** — WIP=1 enforced; gate dialog; undo on discard.

### Task 4.3: EnergySnapshot placeholder

**Files:**
- Create: `src/components/flow/EnergySnapshot.jsx`

- [ ] **Step 1: Статичный индикатор + строка** (данные из `useEnergyStore` в Phase 6).

---

## Phase 5 — «Канбан» (Фаза 3)

**Deliverable:** День/неделя, mobile move sheet, desktop drag, WIP-gate, заторы.

### Task 5.1: Kanban store fields

**Files:**
- Modify: `src/lib/cardUtils.js`, `src/store/useCardsStore.js`

- [ ] **Step 1: `kanbanColumn`, `stuckSince`** на карточке; `moveKanbanCard(id, column)`.

### Task 5.2: KanbanTab

**Files:**
- Create: `src/components/kanban/KanbanBoard.jsx`
- Create: `src/components/kanban/MoveCardSheet.jsx`
- Modify: `src/components/tabs/KanbanTab.jsx`

- [ ] **Step 1: Переключатель День · Неделя**.

- [ ] **Step 2: Mobile** — tap → `MoveCardSheet`.

- [ ] **Step 3: Desktop** — HTML5 drag или `@dnd-kit` (решить в impl.; YAGNI — native drag v1).

- [ ] **Step 4: Заторы** — `lib/stuckDetector.js`: ≥5 дней → amber border + nudge в `FlowTab`.

### Task 5.3: Elephants + Year board

**Files:**
- Create: `src/components/kanban/ElephantsFlow.jsx`
- Create: `src/components/kanban/YearBoard.jsx`

- [ ] **Step 1: Guided flow 3 экрана** (Q27).

- [ ] **Step 2: Year board read-only** (Q28).

- [ ] **Step 3: Badge** на KanbanTab при незакрытой ретроспективе.

---

## Phase 6 — Энергия + предохранитель (Фаза 4)

**Deliverable:** `useEnergyStore`, хаб с пресетами, предохранитель, pull-dimming.

### Task 6.1: useEnergyStore

**Files:**
- Create: `src/store/useEnergyStore.js`
- Create: `src/lib/energyUtils.js`

- [ ] **Step 1: Пресеты** `brisk | medium | depleted` + optional axes.

- [ ] **Step 2: `canPullCard(card, energy)`** — dim heavy when depleted.

### Task 6.2: EnergyHub

**Files:**
- Create: `src/components/flow/EnergyHub.jsx`

- [ ] **Step 1: Drill-down** из `EnergySnapshot` — пресеты + «Точнее» + калькулятор standalone.

### Task 6.3: Willpower safeguard

**Files:**
- Create: `src/lib/willpowerGuard.js`
- Create: `src/components/flow/PauseScreen.jsx`

- [ ] **Step 1: Диалог** при depleted + heavy pull.

- [ ] **Step 2: Счётчик** ≥3 heavy completions / 2h → `PauseScreen` с override.

---

## Phase 7 — PWA, тактильность, push (S3 + S4)

**Deliverable:** Service worker, manifest, vibration, notification settings UI.

### Task 7.1: Vibration wrapper

**Files:**
- Create: `src/lib/vibration.js`

- [ ] **Step 1: `vibrateSuccess()`** — `navigator.vibrate?.(10)` silent fail.

- [ ] **Step 2: Подключить** к dump, pull, done, filter commit.

### Task 7.2: PWA shell

**Files:**
- Create: `public/manifest.webmanifest`, `public/icons/`
- Modify: `index.html`, `vite.config.js` (vite-plugin-pwa — добавить зависимость)

- [ ] **Step 1: Manifest + SW** — offline shell; cards из localStorage (уже S1).

### Task 7.3: Notification settings

**Files:**
- Create: `src/components/settings/NotificationSettings.jsx`

- [ ] **Step 1: Toggles** per Q30; pre-prompt; system prompt on first enable (Q33).

- [ ] **Step 2: Push implementation** — отложить backend до выбора (Web Push API + VAPID); v1 может быть in-app badge only.

---

## Spec coverage checklist

| Spec section | Phase |
|--------------|-------|
| Shell & tabs Q1–14 | 1, 4 |
| Onboarding Q15–16 | 2 |
| Filter Q18–24 | 3 |
| Energy hub Q17, Q23 | 6 |
| Energy cost Q25 | 3 |
| Calculator Q26 | 3 (light), 6 (full) |
| Elephants Q27–28 | 5 |
| Stuck detector Q29 | 5 |
| Push Q30, Q33 | 7 |
| Desktop Q31, Q40 | 1, 3, 4 |
| Edit Q32 | 3, 4 |
| Gestures Q34–38 | 4, 5 |
| Center action Q39 | 1 |
| Card model / visual language | 0, 3, 4 |
| Карта жестов | 4, 5 |

**Gaps deferred (v2):** Web Push server, `@dnd-kit` если native drag недостаточен, accessibility duplicate buttons для swipe, auto-suggest top pull ML.

---

## Verification commands (каждая фаза)

```bash
npm run lint
npm run build
npm run dev   # ручная проверка в браузере
```

### Phase 1 manual checklist

- [ ] Mobile: 3 вкладки + center action
- [ ] Desktop: sidebar + Выгрузить + Ctrl+Enter
- [ ] DumpOverlay: idle → capturing → flow
- [ ] Нет split-view

### Final shell checklist

См. [Критерии готовности в spec](../specs/2026-06-07-kaizenflow-ui-shell.md#критерии-готовности-shell).

---

## Recommended execution order

1. **Phase 0** (1 session)
2. **Phase 1** (1–2 sessions) — **START HERE** if persistence done
3. **Phase 2**
4. **Phase 3** (largest — split into 2 sessions)
5. **Phase 4**
6. **Phase 5**
7. **Phase 6**
8. **Phase 7**

**Commits:** один commit на завершённый Task (не на каждый Step), message на английском или русском — как в репо.

---

## Open decisions (resolve during Phase 1)

| Question | Default for v1 |
|----------|----------------|
| Tab bar layout с center action | `[Поток] [◉] [Разбор] [Канбан]` — 4 slots |
| Sidebar collapsed | Expanded with labels |
| `mockCards` после onboarding | Скрыть из pull; только `raw` на холсте тишины |
| Иконки вкладок | Text labels only v1 |
