# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

**Tokens:** [ui-tokens.md](./ui-tokens.md) · **Rules:** [ui-rules.md](./ui-rules.md)

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes and motion patterns
3. If no — build following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### DumpPanel

**File:** `src/components/DumpPanel.jsx`  
**Role:** Module 1 thought dump — sidebar panel (temporary; becomes overlay in S2)

**Layout:**

```
aside: relative flex w-[360px] shrink-0 flex-col border-r border-cream-dark bg-cream
header: border-b border-cream-dark px-6 py-5
content: flex flex-col px-6 (centered in idle, top-aligned in flow)
```

**Idle dump button:**

```
motion.button: h-32 w-32 rounded-full bg-warm-accent text-lg font-medium text-white
  shadow-lg shadow-warm-accent/30 hover:bg-warm-accent-hover
  whileHover scale 1.03 · whileTap scale 0.97
```

**Textarea (DumpTextarea):**

```
w-full resize-none rounded-xl border border-cream-dark bg-white px-4 py-3
text-[15px] leading-relaxed text-warm-text placeholder:text-warm-muted/60
focus:shadow-md focus:ring-2 focus:ring-warm-accent/30
```

**Primary action button:**

```
flex-1 rounded-lg bg-warm-accent py-2.5 text-sm font-medium text-white
hover:bg-warm-accent-hover disabled:opacity-40 disabled:cursor-not-allowed
```

**Secondary button:**

```
rounded-lg border border-cream-dark px-4 py-2.5 text-sm text-warm-muted hover:bg-cream-dark
```

**CollapseDialog overlay:**

```
backdrop: absolute inset-0 z-10 flex items-center justify-center bg-cream/80 px-6 backdrop-blur-[2px]
dialog: w-full rounded-xl border border-cream-dark bg-white p-5 shadow-lg
```

**Motion:** `AnimatePresence mode="wait"` between idle/capturing/flow; opacity + scale transitions ~0.2s

---

### Canvas

**File:** `src/components/Canvas.jsx`  
**Role:** Dot-grid canvas container for sticky notes

**Layout:**

```
section: relative flex flex-1 flex-col overflow-hidden bg-cream
header: border-b border-cream-dark px-8 py-5
scroll area: relative flex-1 overflow-auto
canvas: relative min-h-full min-w-[720px] + dot-grid inline style
```

**Dot grid (silence week only — do not reuse elsewhere):**

```js
backgroundImage: 'radial-gradient(circle, #e8e0d4 1px, transparent 1px)'
backgroundSize: '24px 24px'
```

**Empty state:**

```
absolute inset-0 flex items-center justify-center
text-base text-warm-muted
```

---

### StickyNote

**File:** `src/components/StickyNote.jsx`  
**Role:** Draggable editable sticky card (raw / silence week mode)

**Container:**

```
absolute w-[180px]
style: left, top, rotate from card; z-index 50 when dragging/editing
```

**Note surface:**

```
relative rounded-sm px-4 py-3 shadow-md
cursor-grab / cursor-grabbing
ring-2 ring-warm-accent/40 when editing
backgroundColor + boxShadow from card.color (inline)
```

**Edit/delete buttons (hover reveal):**

```
absolute -left-2/-right-2 -top-2 h-6 w-6 rounded-full
bg-warm-text/80 text-xs text-white opacity-0 group-hover:opacity-100
```

**Text:**

```
text-[14px] leading-snug text-warm-text
```

**Motion:**

```
initial (new): opacity 0, x -220, y 10, scale 0.82
animate: spring stiffness 280 damping 24
drag: scale 1.02
exit: opacity 0 scale 0.85 duration 0.15
```

**Interaction:** pointer events for drag; DRAG_THRESHOLD = 5px; double-click to edit

---

### Toast

**File:** `src/components/Toast.jsx` · **Store:** `useToastStore.js`

**Success (dump save):**

```
fixed bottom-28 md:bottom-8 z-50
border border-cream-dark/60 border-l-4 border-l-warm-accent bg-white shadow-xl
text-sm text-warm-text · action text-warm-accent · 4s auto-dismiss · replace on rapid save
```

**Destructive (undo delete):**

```
bg-warm-text text-white rounded-xl shadow-xl
action text-[#FFE0B2] · 5s · onDismiss clears pendingDelete
```

**Motion:** spring stiffness 400 damping 28; enter y 24→0

---

### UndoToast

**Removed** — merged into `Toast.jsx` (destructive variant).

---

### App (root layout)

**File:** `src/App.jsx`  
**Role:** Tab shell + global undo toast

```
AppShell | Toast
```

---

### AppShell

**File:** `src/components/shell/AppShell.jsx`  
**Role:** Root layout — sidebar (desktop) + active tab + tab bar (mobile) + dump overlay

```
div: flex min-h-screen bg-cream
  Sidebar | main.flex-1.pb-24.md:pb-0 | TabBar | DumpOverlay
```

---

### TabBar

**File:** `src/components/shell/TabBar.jsx`  
**Role:** Mobile bottom navigation — 3 tabs + FAB above bar

```
FAB: fixed bottom-[calc(3.75rem+safe-area)] center, h-14 w-14 rounded-full
  bg-warm-accent ring-4 ring-cream shadow-lg shadow-warm-accent/30
  Lucide Plus icon

nav: fixed bottom-0 border-t bg-cream/95 backdrop-blur-sm
  3 equal tabs: Lucide icon + label + accent dot when active
```

---

### Sidebar

**File:** `src/components/shell/Sidebar.jsx`  
**Role:** Desktop navigation + dump trigger + Ctrl+Enter shortcut

```
aside: hidden md:flex w-60 shrink-0 flex-col border-r border-cream-dark bg-cream
brand: font-serif text-xl
```

**Dump button:**

```
w-full rounded-lg bg-warm-accent py-2.5 + Lucide Plus
hover:bg-warm-accent-hover shadow-sm shadow-warm-accent/20
```

**Nav item:**

```
flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2.5
active: border-warm-accent bg-white font-medium shadow-sm + accent icon
inactive: border-transparent text-warm-muted hover:bg-white/60
Lucide: Workflow (Поток), Inbox (Разбор), Kanban (Канбан)
```

---

### EmptyState

**File:** `src/components/ui/EmptyState.jsx`  
**Role:** Shared placeholder card for tab empty states

```
white card: rounded-2xl border border-cream-dark/50 bg-white shadow-sm
optional Lucide icon text-warm-accent/45
title: font-serif text-base font-medium
```

---

### TabPageHeader

**File:** `src/components/ui/TabPageHeader.jsx`  
**Role:** Serif tab title + muted subtitle

```
h2: font-serif text-2xl font-medium tracking-tight
subtitle: text-sm text-warm-muted mt-1.5
```

---

### DumpOverlay

**File:** `src/components/shell/DumpOverlay.jsx`  
**Role:** Global thought dump — bottom sheet (mobile) / centered modal (desktop)

**Backdrop:**

```
fixed inset-0 z-30 bg-warm-text/25 backdrop-blur-sm
```

**Panel:**

```
relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-cream-dark/60
mobile: rounded-t-2xl (items-end)
desktop: centered (md:items-center md:p-6)
header h2: font-serif
```

**Modes:** idle → capturing → flow (same logic as former DumpPanel)

**Close:** backdrop / Esc / «Закрыть» — collapse dialog if unsaved text

---

### FlowTab

**File:** `src/components/tabs/FlowTab.jsx`  
**Role:** Home dashboard — WIP + pull queue + energy + hints

```
layout: mobile order WIP → Pull → Energy/nudges; md:grid-cols-2 — left: WipSlot + PullQueue; right: EnergySnapshot + FlowHint + StuckNudge
header: title only «Поток» (no subtitle)
empty: WipSlot shows «Поток свободен» + priority CTA (lib/flowEmptyState.js); FlowHint hidden
FlowHint: text link row (warm-muted → accent «Разбор»); shown only when pull queue non-empty
PullQueue: excludeCardId = suggestedCard?.id (hero dedupe)
```

---

### WipSlot

**File:** `src/components/flow/WipSlot.jsx`  
**Role:** Hero WIP zone — active card, recommendation, or empty CTA

```
shell: WipHeroShell — rounded-2xl px-5 py-6; accent states: bg-warm-accent/5 ring-1 ring-warm-accent/15; empty: bg-white/50 only
labels: font-serif base medium — «Сейчас в работе» (filled) · «Одно дело в единицу времени» (queue-ready) · «Поток свободен» (empty)
queue-ready: StructuredCard ring-warm-accent/20 + tap + full-width «Начать» (both pull)
filled: StructuredCard + «Сделано» / «Не актуально» + ⋯ → CardEditSheet
flow-empty: centered label + CTA card (raw → Разбор · next_week → Канбан · else → Выгрузить)
```

---

### PullQueue

**File:** `src/components/flow/PullQueue.jsx`  
**Role:** Secondary queue list — tap pull, ⋯ edit, WIP gate dialog

```
excludeCardId: skip hero-promoted card; hide section when visible list empty
no highlight ring — hero handles call-to-action
dimmed: opacity-45 for heavy cards when energy depleted
```

---

### WipGateDialog

**File:** `src/components/flow/WipGateDialog.jsx`  
**Role:** WIP-full gate — завершить / отложить / отмена

---

### CardEditSheet

**File:** `src/components/cards/CardEditSheet.jsx`  
**Role:** Bottom sheet edit — text, вернуть в очередь, разобрать заново, удалить

---

### EnergySnapshot

**File:** `src/components/flow/EnergySnapshot.jsx`  
**Role:** Compact energy indicator on Flow tab — tap opens EnergyHub

```
label: «Энергия» (xs muted) above preset name
preset icons: BatteryFull (brisk) · BatteryMedium (medium) · BatteryLow (depleted)
depleted: border-warm-accent/20 bg-warm-accent/5
advice: from energyUtils.getEnergyAdvice
```

---

### EnergyHub

**File:** `src/components/flow/EnergyHub.jsx`  
**Role:** Drill-down from Flow — presets, fine-tune sliders, recovery

```
header: ← Поток · «Как ты сейчас?» · battery icon + preset label + getEnergyAdvice
        depleted header: bg-warm-accent/5
presets: 3-col grid — Бодрый · Средне · На нуле; hapticTap on tap; highlight syncs with axes
fine-tune: 2 axes (workRest, tensionRelaxation); axes → derivePresetFromAxes (60/40 weighted)
axis nuance: getAxisNuance inside «Точнее» block (deviation >20 from preset defaults)
recovery: when depleted OR ≥2 heavy completions — RECOVERY_IDEAS list (warm-accent tint)
standalone calculator: ResultEffortCalculator section; persists in useEnergyStore
order: presets → fine-tune → recovery (if) → calculator
```

---

### ResultEffortCalculator

**File:** `src/components/flow/ResultEffortCalculator.jsx`  
**Role:** Shared «Результат / Затраты» — filter (card-bound) + EnergyHub (standalone)

```
fields: «Что получу?» · «Что отдам?» · verdict yes/maybe/no
filter mode: showSuggestions → maybe/no → «Пока не ясно» / «Отпустить» / «Оставить оценку»
standalone: saves to useEnergyStore.standaloneResultEffort (localStorage)
ResultEffortSummary: read-only block for CardEditSheet + hub
```

---

### EnergyGuardDialog

**File:** `src/components/flow/EnergyGuardDialog.jsx`  
**Role:** Willpower guard — depleted + heavy pull → light alternatives + force continue

```
copy: «Похоже, ресурс на исходе»
portal modal; bottom sheet on mobile
always: «Всё равно взять это дело» override
```

---

### PauseScreen

**File:** `src/components/flow/PauseScreen.jsx`  
**Role:** Full-screen pause after ≥3 heavy completions in ~2h

```
recovery ideas list (static)
CTA: «Открыть хаб энергии» · «Всё равно продолжу»
```

---

### TabBar

**File:** `src/components/shell/TabBar.jsx`  
**Role:** Mobile bottom nav — 4 tabs + center dump FAB

```
tabs: Поток · Разбор · Канбан · Ещё (settings)
FAB: center above tab bar
silence week: only Разбор + Ещё active
```

---

### SettingsScreen

**File:** `src/components/settings/SettingsScreen.jsx`  
**Role:** Settings tab — header + NotificationSettings

```
layout: tab content inside shell · max-w-lg centered content
access: TabBar «Ещё» (mobile) · Sidebar «Настройки» (desktop)
back: ← Назад on md+ only
```

---

### NotificationSettings

**File:** `src/components/settings/NotificationSettings.jsx`  
**Role:** Push type toggles + pre-prompt on first enable (Q30, Q33)

```
section title: «Что можем напомнить»
row: label + when + example · full-width tap · ToggleSwitch h-7 w-12
types: morning · stuck · elephants · inactive · energy
pre-prompt: bottom sheet on mobile, centered dialog on sm+
```

---

### KanbanTab

**File:** `src/components/tabs/KanbanTab.jsx`  
**Role:** Kanban — day/week toggle, KanbanBoard, Elephants badge, Year drill-down

```
toggle: inline-flex rounded-lg border p-1 — День · Неделя
badge: «Слоны →» when elephantsPending
```

---

### KanbanBoard

**File:** `src/components/kanban/KanbanBoard.jsx`  
**Role:** Horizontal sortable columns — touch: tap→MoveCardSheet; fine-pointer desktop: dnd-kit drag; ⋯→edit/move

```
columns: day 3 / week 4 (queue, progress, done, next_week)
order: columnOrder in useCardsStore
stuck: ring-2 ring-amber-400/60
WIP gate + drag suspend on progress conflict
overlay: scale + shadow + accent ring (no rotation)
```

---

### MoveCardSheet

**File:** `src/components/kanban/MoveCardSheet.jsx`  
**Role:** Mobile column picker bottom sheet

---

### ElephantsFlow

**File:** `src/components/kanban/ElephantsFlow.jsx`  
**Role:** 3-step monthly retrospective — done / carry / elephant

---

### YearBoard

**File:** `src/components/kanban/YearBoard.jsx`  
**Role:** Read-only 12-month «музей побед» with month drill-down

---

### StuckNudge / StuckSheet

**Files:** `src/components/flow/StuckNudge.jsx`, `StuckSheet.jsx`  
**Role:** Flow tab nudge for cards stuck ≥5 days; actions: kanban / next week / release

```
nudge: text row — AlertCircle amber + text-amber-700/90; no card chrome
```

---

### ReviewTab

**File:** `src/components/tabs/ReviewTab.jsx`  
**Role:** «Разбор» — silence week canvas OR inbox placeholder

**Silence week header:**

```
border-b bg-white/40 px-6 py-4
title: font-serif «Неделя тишины» + secondary button bg-white shadow-sm
```

**Inbox mode:** `ReviewInbox` + `FilterFlow` (see below)

---

### ReviewInbox

**File:** `src/components/review/ReviewInbox.jsx`  
**Role:** Chronological list of `raw` cards — tap inline edit, «Разобрать», ⋯ delete

```
card: rounded-xl border border-cream-dark/50 bg-white shadow-sm p-4
edit: ring-2 ring-warm-accent/20
«Разобрать»: rounded-lg bg-warm-accent text-xs font-medium
```

---

### FilterFlow

**File:** `src/components/review/FilterFlow.jsx`  
**Role:** Full filter pipeline — swipe steps + final commit

```
mobile: fixed inset-0 z-30 bg-cream
desktop: md:static md:border-l md:grid-cols-2 right panel
steps: Хочу/Должен → criteria (1 screen each) → final (tags + energy + actions)
swipe: motion drag x, threshold 72px + duplicate buttons
final actions: В поток · Пока не ясно · Отпустить
```

---

### StructuredCard

**File:** `src/components/cards/StructuredCard.jsx`  
**Role:** Flat post-filter card — white, no rotation, optional chips

```
rounded-xl border border-cream-dark/50 bg-white shadow-sm px-4 py-3
chips: rounded-full bg-cream text-xs text-warm-muted
```

---

### ManifestScreen

**File:** `src/components/onboarding/ManifestScreen.jsx`  
**Role:** First-run fullscreen manifest — philosophy copy + «Начать»

```
flex min-h-screen items-center justify-center bg-cream px-8
card: rounded-2xl border border-cream-dark/50 bg-white px-8 py-10 shadow-sm
title: font-serif text-2xl font-medium
```

---

### MissionScreen

**File:** `src/components/onboarding/MissionScreen.jsx`  
**Role:** Personal mission capture on silence week exit

```
fixed inset-0 z-40 flex items-center justify-center bg-warm-text/25 backdrop-blur-sm
card: rounded-2xl border border-cream-dark/60 bg-white p-6 shadow-xl
h2: font-serif text-xl
```

---

### SilenceCanvas

**File:** `src/components/review/SilenceCanvas.jsx`  
**Role:** Dot-grid canvas for raw cards in silence week (reuses StickyNote)

```
flex-1 overflow-auto
dot-grid: radial-gradient #e8e0d4 1px, 24px grid (same as Canvas.jsx)
filters: cards where status === 'raw'
empty: «Нажми ◉ внизу — выгрузи первую мысль»
```

---

## Planned Components (not built)

| Component | Phase | Notes |
|---|---|---|
| `EnergyHub` | 6 | Presets + sliders + recovery |

Add each to this registry when implemented.
