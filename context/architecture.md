# Architecture

## Stack

| Layer | Tool | Purpose |
|---|---|---|
| UI | React 19 | Functional components + hooks |
| Build | Vite 8 | Dev server, production bundle |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first CSS; tokens in `src/index.css` |
| State | Zustand 5 | Client stores per domain |
| Animation | Framer Motion 12 | Spring-based motion |
| Utilities | clsx | Conditional class names |
| Lint | ESLint 10 | Flat config, React Hooks + Refresh |
| Language | JavaScript (ES modules) | `.js` / `.jsx` throughout |
| Persistence (planned S1) | localStorage → IndexedDB | Offline-first card storage |
| PWA (planned S3) | vite-plugin-pwa + Service Worker | Installable, offline shell |
| Platform APIs (planned S4) | Web Vibration API | Tactile feedback |

No backend server in current architecture — client-side PWA with local persistence first; cloud sync is future scope.

---

## Folder Structure

```
/
├── AGENTS.md
├── context/
│   ├── IDEA.md                 → Product vision (source of truth for features)
│   ├── project-overview.md
│   ├── architecture.md         → This file
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   └── progress-tracker.md
├── docs/superpowers/specs/     → Phase specs and roadmap
├── src/
│   ├── main.jsx                → React entry point
│   ├── App.jsx                 → Root layout (evolving toward UI shell)
│   ├── index.css               → Tailwind + @theme tokens
│   ├── components/             → Presentational React components
│   │   ├── DumpPanel.jsx       →   Module 1: thought dump panel
│   │   ├── Canvas.jsx          →   Canvas with sticky notes
│   │   ├── StickyNote.jsx      →   Draggable editable card
│   │   └── Toast.jsx             →   Global toast (success + undo)
│   ├── store/
│   │   └── useCardsStore.js    →   Cards state + actions
│   ├── lib/
│   │   └── cardUtils.js        →   Pure card helpers (color, position, factory)
│   └── data/
│       └── mockCards.js        →   Demo seed data
├── vite.config.js
├── eslint.config.js
└── package.json
```

**Future structure (by phase):**

```
src/
  components/
    shell/          → Tab bar, center action, onboarding (S2)
    flow/           → Dashboard «Поток» (S2+)
    review/         → Inbox + filter screens (Phase 2)
    kanban/         → Board columns, WIP gate (Phase 3)
    energy/         → Power Management hub (Phase 4)
  store/
    useCardsStore.js
    useEnergyStore.js   → Phase 4
    useShellStore.js    → Navigation, silence week, onboarding (S2)
  lib/
    persistStorage.js   → localStorage adapter (S1)
```

---

## System Boundaries

| Folder | Owns |
|---|---|
| `src/components/` | UI only — renders state, fires store actions, handles local UI state |
| `src/store/` | Domain state and mutations — undo timers, card CRUD, future module state |
| `src/lib/` | Pure functions — no React, no Zustand imports |
| `src/data/` | Mock / seed data — not imported in production persistence path |
| `context/` | Product and engineering docs for AI agents and developers |
| `docs/superpowers/` | Phase specs, implementation plans |

**Rules:**

- Components never mutate card shape directly — always through store actions
- `lib/` never imports from `components/` or `store/`
- Product invariants (atomic cards, WIP limit, pull system) enforced in store + UI together

---

## Data Flow

### Thought dump (current — Module 1)

```
User types in DumpPanel
        ↓
useCardsStore.addCard(text)
        ↓
createCard() in lib/cardUtils.js — id, color, position, rotation
        ↓
Store appends card; Canvas re-renders StickyNote list
        ↓
User drags → moveCard(id, x, y)
User deletes → removeCard(id) → Toast (destructive, 5s undo window)
```

### Persistence (planned S1)

```
App init
        ↓
lib/persistStorage.js reads localStorage
        ↓
Hydrate useCardsStore (mockCards only if storage empty)
        ↓
Every store mutation → debounced write to localStorage
```

### Navigation shell (planned S2)

```
Tab selection in shell store
        ↓
App.jsx renders active module view (Flow / Review / Kanban)
        ↓
Center action / sidebar opens global dump overlay
        ↓
Dump still writes to useCardsStore — same card model
```

### Filter → Kanban (planned Phases 2–3)

```
Raw cards in inbox (canvas / silence week)
        ↓
Filter flow assigns tags, energy cost, mission alignment
        ↓
Accepted cards enter pull queue
        ↓
Kanban columns with WIP=1 on «В работе»
        ↓
Complete → archive; stuck → amber highlight
```

### Power Management (planned Phase 4)

```
useEnergyStore tracks balance presets + sliders
        ↓
Willpower guard reads recent heavy completions + energy level
        ↓
Warns before overload; offers recovery — never blocks without override
```

---

## Card Model

Current shape (from `createCard`):

```js
{
  id,         // crypto.randomUUID()
  text,       // one thought — atomicity invariant
  color,      // { bg, shadow } from STICKY_COLORS
  rotation,   // slight tilt for sticky aesthetic
  x, y,       // canvas position
  createdAt,  // timestamp
}
```

**Future fields (add with corresponding phase):**

| Field | Phase | Purpose |
|---|---|---|
| `wantOrMust` | 2 | «Хочу» / «Должен» filter result |
| `missionStatus` | 2 | In flow / unclear / released |
| `timeInvestment` | 2 | Optional investment tags |
| `energyCost` | 2–4 | light / medium / heavy |
| `column` | 3 | Kanban column id |
| `stuckAt` | 3 | Stagnation detector timestamp |
| `visualMode` | S2 | `sticky` vs `card` (raw vs flow) |

Extend `createCard` and migration in persist layer when adding fields.

---

## Module Map

| Module | IDEA name | Status | Store |
|---|---|---|---|
| 1 | «Чистая голова» | Partial — dump, canvas, undo | `useCardsStore` |
| 2 | «Фильтрация и Осознанность» | Not started | extends cards + filter UI state |
| 3 | «Канбан-поток» | Not started | column state on cards |
| 4 | «Хаб Power Management» | Not started | `useEnergyStore` |

Cross-cutting: S1 persistence, S2 UI shell, S3 PWA, S4 vibration — see [roadmap](../docs/superpowers/specs/2026-06-07-kaizenflow-roadmap.md).

---

## Key References

- Product vision: [IDEA.md](./IDEA.md)
- Dev conventions: [AGENTS.md](../AGENTS.md)
- Dependencies: [code-standards.md](./code-standards.md#dependencies)
- Library patterns: [library-docs.md](./library-docs.md)
- UI shell spec: [2026-06-07-kaizenflow-ui-shell.md](../docs/superpowers/specs/2026-06-07-kaizenflow-ui-shell.md)
- Roadmap: [2026-06-07-kaizenflow-roadmap.md](../docs/superpowers/specs/2026-06-07-kaizenflow-roadmap.md)
