# Project Overview

## About the Project

**KaizenFlow: Power & Focus** is a mobile-first PWA that helps users empty their mind, filter what matters, and move through work in a calm continuous flow — without willpower battles.

The product combines two systems:

- **Kaizen** — organizes tasks into a pull-based flow with WIP limits, protecting against chaos
- **Power Management** — monitors and balances energy so the flow stays sustainable

Full product vision: [IDEA.md](./IDEA.md) · Roadmap: [2026-06-07-kaizenflow-roadmap.md](../docs/superpowers/specs/2026-06-07-kaizenflow-roadmap.md)

---

## The Problem It Solves

Anxiety and mental clutter come from holding too many open loops. Traditional todo apps add pressure — deadlines, long lists, guilt over unfinished items.

KaizenFlow inverts this: dump first, plan later. Thoughts become atomic cards. Only what passes conscious filters enters the execution flow. One thing in progress at a time. Energy is tracked so burnout triggers a gentle pause, not a crash.

---

## Modules

| # | Module | Purpose |
|---|---|---|
| 1 | **«Чистая голова»** | Instant thought dump — one card, one thought |
| 2 | **«Фильтрация и Осознанность»** | Want/Must filter, mission alignment, time investment tags |
| 3 | **«Канбан-поток»** | Pull-based kanban with WIP=1, stagnation detection, monthly retrospective |
| 4 | **«Хаб Power Management»** | Energy balance, willpower guard, result/effort calculator |

---

## Screens (target — after S2 shell)

```
Onboarding     → Manifest → Silence week canvas
Поток (home)   → WIP slot + pull queue + energy snapshot
Разбор         → Inbox + filter pipeline; silence week canvas
Канбан         → Day/week board; elephants retrospective → year board
Energy hub     → Drill-down from Поток (not a tab)
Dump overlay   → Global capture (center action / sidebar + Ctrl+Enter)
Settings       → Mission, filter criteria, push toggles
```

**Current (pre-shell):** split-view `DumpPanel` + `Canvas` — Module 1 prototype.

---

## Navigation

Mobile: bottom tab bar — **Поток · ◉ · Разбор · Канбан** (center = dump, not navigation)

Desktop: left sidebar — dump button + three tabs. No permanent split-view after shell.

Details: [2026-06-07-kaizenflow-ui-shell.md](../docs/superpowers/specs/2026-06-07-kaizenflow-ui-shell.md)

---

## Core User Flows

### Thought dump (Module 1 — partial)

1. User taps **«Выгрузить»**
2. Enters capture mode → types one thought → Enter saves
3. Flow mode allows rapid consecutive dumps
4. Card appears on canvas as sticky note — draggable, editable, deletable with undo
5. Collapse with unsaved text → save/discard dialog

### Silence week (Module 1 — planned)

- User dumps freely for days without planning pressure
- Canvas accumulates sticky notes on dot-grid
- «Готов разбирать» → mission screen → inbox + filter

### Filter pipeline (Module 2 — planned)

1. Inbox lists raw cards
2. **«Разобрать»** → swipe Want/Must → mission criteria (one per screen)
3. Final: **В поток · Пока не ясно · Отпустить**
4. Optional: time investment tags, energy cost chips
5. Accepted cards become flat flow cards in pull queue

### Flow / pull (Module 3 — planned)

1. Home screen shows WIP slot (max 1) + pull queue
2. Tap card → pull into WIP (vibration)
3. **«Сделано»** or **«Не актуально»** — both free the slot; undo available
4. Stuck cards highlighted after 5+ days — amber nudge, not alarm

### Power Management (Module 4 — planned)

1. Energy presets: Бодрый · Средне · На нуле
2. Willpower guard warns after heavy actions on low energy — always overridable
3. Result/effort calculator before heavy commitments

---

## Data Architecture

All data is client-side for now (localStorage → IndexedDB). No backend in current scope.

### Card (core entity)

Lives in `useCardsStore`. Created via `createCard()` in `lib/cardUtils.js`.

Current fields: `id`, `text`, `color`, `rotation`, `x`, `y`, `createdAt`

Future fields: `status`, `wantMust`, filter results, `energyCost`, `kanbanColumn`, `stuckSince` — see [architecture.md](./architecture.md)

### User settings (planned)

Separate from cards: `personalMission`, `filterCriteria[]`, `investmentTags[]`, onboarding flags, push preferences

### Energy state (planned)

Separate store: `useEnergyStore` — never mixed with card domain

---

## Features In Scope

- Instant thought dump with atomic cards
- Canvas with draggable sticky notes, edit, delete with undo
- Persistence across sessions (S1)
- UI shell with tab navigation (S2)
- PWA offline shell + installability (S3)
- Tactile feedback via Web Vibration (S4)
- Silence week mode
- Filter pipeline (Want/Must, mission, time investment)
- Flow dashboard with WIP=1 and pull queue
- Kanban day/week with stagnation detector
- Monthly «Elephants» retrospective + year board
- Energy hub with willpower guard
- Result/effort calculator
- Contextual push notifications (opt-in per type)

---

## Features Out of Scope

- Cloud sync / multi-device accounts (future)
- Calendar scheduling / deadline pressure
- Team collaboration
- AI assistants or LLM features
- Payment / subscription
- Native mobile apps (PWA only)
- Forced task ordering — pull system only
- Guilt-based UX or red-alarm warnings
- Auto-pull into WIP — user always chooses

---

## Product Invariants (hard rules)

- **One card = one thought** — atomicity enforced in UI and model
- **WIP limit = 1** — technically enforced in «В работе»
- **Pull, not push** — user pulls next task; app never auto-assigns
- **Undo on delete** — no guilt for releasing tasks
- **Assess before big actions** — result/effort calculator for heavy work
- **Willpower guard** — warn, never jail

---

## Target User

Someone who:

- Feels mental clutter and anxiety from open loops
- Wants to dump thoughts instantly without immediate planning
- Prefers calm, minimal tools over feature-heavy productivity apps
- Responds to kaizen / continuous flow philosophy
- Uses smartphone as primary device; desktop as secondary

---

## Success Criteria

- Dumping a thought feels instant (<1s perceived) even offline
- Cards survive page reload after S1
- WIP limit is impossible to violate in kanban/flow
- Filter flow feels light — skippable steps, no blocking guilt
- UI stays visually calm across all modules
- Willpower guard triggers appropriately without feeling punitive
- PWA installs and launches quickly from home screen
- Russian copy is consistent and warm throughout
