# Build Plan

## Core Principle

UI first with mock data — verify visually before wiring persistence and complex logic. Every feature must be testable in the browser before moving on. Follow the roadmap: [2026-06-07-kaizenflow-roadmap.md](../docs/superpowers/specs/2026-06-07-kaizenflow-roadmap.md).

Detailed shell spec: [2026-06-07-kaizenflow-ui-shell.md](../docs/superpowers/specs/2026-06-07-kaizenflow-ui-shell.md)

---

## Cross-Cutting (Foundation)

### S1 — Persistence

**Goal:** cards and settings survive reload.

**Logic:**

- `lib/persistStorage.js` — localStorage adapter for cards JSON
- Hydrate `useCardsStore` on app init
- Debounced write on every store mutation
- `mockCards` only when storage is empty
- Later: migrate to IndexedDB if needed

**Done when:** reload restores cards; empty storage shows demo or blank per spec

---

### S2 — UI Shell & Navigation

**Goal:** tab-based navigation; dump becomes global overlay.

**UI:**

- Tab bar: Поток · center dump · Разбор · Канбан
- Desktop sidebar variant
- `DumpOverlay` — bottom sheet (mobile) / modal (desktop)
- Route or view state for active tab
- Onboarding manifest screen

**Logic:**

- Refactor `DumpPanel` → overlay trigger + capture flow
- Remove permanent split-view
- `useShellStore` — active tab, silence week, onboarding flags

**Done when:** user switches modules; dump works from any tab; home = Поток placeholder

---

### S3 — PWA Shell

**Goal:** offline-first, installable.

**Logic:**

- Add `vite-plugin-pwa` (update dependencies list first)
- Web manifest + icons
- Service Worker caches app shell
- Dump works offline (local persistence from S1)

---

### S4 — Tactile Feedback

**Goal:** vibration on key actions.

**Logic:**

- `lib/vibrate.js` — guarded `navigator.vibrate()` helper
- Wire to: successful dump, pull to WIP, «Сделано»
- Silent degrade when API unavailable

---

## Phase 1 — Module «Чистая голова» (completion)

### 01 Dump UI — done

Split-view dump panel with idle → capturing → flow modes.

**UI:** circular «Выгрузить» button, textarea, collapse dialog, session counter

**Logic:** `addCard` on Enter, atomic text trim, focus management

---

### 02 Canvas + StickyNote — done

**UI:** dot-grid canvas, draggable sticky notes, double-click edit, delete with undo toast

**Logic:** `moveCard`, `updateCardText`, `removeCard` + 5s undo window

---

### 03 Persistence — next

Wire S1 to existing store. See cross-cutting S1 above.

---

### 04 Silence Week Mode

**UI:**

- Toggle or onboarding path into silence week
- Canvas as primary Review view; other tabs muted
- «Готов разбирать» CTA

**Logic:**

- `silenceWeek` flag in shell store
- Auto-enable on first launch after manifest
- Exit → mission screen (stub OK initially)

---

## Phase 2 — Module «Фильтрация и Осознанность»

### 05 Review Inbox UI

**UI:** list of raw cards, tap = inline edit, «Разобрать» per card

**Logic:** filter cards where `status === 'raw'`

---

### 06 Filter Pipeline UI

**UI:** fullscreen filter — swipe Want/Must, criterion screens, final three actions

**Logic:** extend card model with `wantMust`, `missionCriteriaResults`, `status`

---

### 07 Mission & Criteria

**UI:** mission input on first «Готов разбирать»; settings for custom criteria (up to 5)

**Logic:** persist `personalMission`, default criterion from mission or fallback

---

### 08 Time Investment + Energy Tags

**UI:** optional horizontal tag scroll + energy chips on filter final screen

**Logic:** `timeInvestment`, `energyCost` on card; skip = null / medium

---

### 09 Result/Effort Calculator (light)

**UI:** two fields + verdict; link from «Тяжёлое» chip

**Logic:** save `resultEffort` on card; «сомневаюсь» suggests release

---

## Phase 3 — Module «Канбан-поток»

### 10 Flow Dashboard UI

**UI:** WIP slot, pull queue, energy snapshot, stuck nudge line

**Logic:** WIP=1 enforced; tap pull; empty states per shell spec

---

### 11 Kanban Day/Week UI

**UI:** columns, mobile move sheet, desktop drag

**Logic:** `kanbanColumn` on card; WIP gate on «В работе»

---

### 12 Stagnation Detector

**Logic:** `stuckSince` timestamp; amber outline after 5 days; nudge on Flow tab

---

### 13 Elephants Retrospective + Year Board

**UI:** 3-screen guided flow; read-only year museum

**Logic:** monthly archive, gentle carry-forward, skip = auto-transfer

---

## Phase 4 — Module «Хаб Power Management»

### 14 Energy Store + Hub UI

**UI:** presets Бодрый/Средне/На нуле + «Точнее» sliders

**Logic:** `useEnergyStore` separate from cards

---

### 15 Willpower Guard

**Logic:** low energy + heavy pull → dialog; 3 heavy completions in ~2h → pause screen; always override

---

### 16 Result/Effort Calculator (full)

Standalone tool in energy hub + integration with filter

---

## Phase 5 — Push & Polish

### 17 Push Notification Settings

**UI:** per-type toggles with preview copy; pre-prompt on first enable

**Logic:** morning dump, stuck nudge, elephants — defaults per shell spec

---

## Build Order (recommended)

1. S1 persistence
2. Phase 1 completion (silence week)
3. S2 UI shell
4. Phase 2 filter
5. Phase 3 kanban + flow
6. S3 PWA + S4 vibration
7. Phase 4 energy
8. Phase 5 push

---

## Feature Count

| Area | Features |
|---|---|
| Cross-cutting S1–S4 | 4 |
| Phase 1 completion | 2 (03–04) |
| Phase 2 | 5 |
| Phase 3 | 4 |
| Phase 4 | 3 |
| Phase 5 | 1 |
| **Remaining** | **15** (+ 2 done in Phase 1) |
