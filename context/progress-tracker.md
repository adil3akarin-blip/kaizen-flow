# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

**Roadmap:** [2026-06-07-kaizenflow-roadmap.md](../docs/superpowers/specs/2026-06-07-kaizenflow-roadmap.md)

---

## Current Status

**Phase:** Workflow v2 ✅ (таймеры + привычки, «Энергия» удалена)  
**Last completed:** Workflow v2 (фазы 1–5) — Поток→Сегодня, таймер задач, трекер привычек, Прогресс/Время  
**Spec:** [2026-06-13-kaizenflow-workflow-v2-timers-habits.md](../docs/superpowers/specs/2026-06-13-kaizenflow-workflow-v2-timers-habits.md)  
**Предыдущее:** Редизайн «Modern Calm» → далее перешли на Hermes (светлая, оранжевый акцент + glass)

---

## Progress

### Cross-Cutting

- [x] S1 Persistence (localStorage → IndexedDB)
- [x] S2 UI Shell & Navigation (foundation — placeholders, shell chrome)
- [x] S3 PWA Shell
- [x] S4 Tactile Feedback (Web Vibration)

### Phase 1 — «Чистая голова»

- [x] 01 Dump UI (`DumpPanel` — idle / capturing / flow)
- [x] 02 Canvas + StickyNote (drag, edit, delete)
- [x] 03 Persistence
- [x] 04 Silence Week Mode (onboarding + canvas + mission exit)

### Phase 2 — «Фильтрация и Осознанность»

- [x] 05 Review Inbox UI
- [x] 06 Filter Pipeline UI
- [x] 07 Mission & Criteria
- [x] 08 Time Investment + Energy Tags (filter UI; tag customization post-MVP)
- [x] 09 Result/Effort Calculator (light)

### Phase 3 — «Канбан-поток»

- [x] 10 Flow Dashboard UI
- [x] 11 Kanban Day/Week UI
- [x] 12 Stagnation Detector
- [x] 13 Elephants Retrospective + Year Board

### Phase 4 — «Хаб Power Management» — ❌ УДАЛЁН в Workflow v2

- ~~14 Energy Store + Hub UI~~ — удалён (абстрактный self-report заменён данными таймера)
- ~~15 Willpower Guard~~ — удалён (экран паузы, предохранитель воли)
- ~~16 Result/Effort Calculator~~ — удалён

### Phase 5 — Push & Polish

- [x] 17 Push Notification Settings

### Редизайн «Modern Calm» (2026-06-12)

- [x] A — Design tokens: canvas/surface/sunken/line/ink/accent/warn/success + Inter Variable font
- [x] B1 — TabBar: backdrop-blur nav, accent-soft active pill, 56px FAB
- [x] B2 — DumpOverlay: direct-open textarea, session counter, multiline paste split (C6)
- [x] B3 — ManifestScreen: full-screen, Framer Motion stagger
- [x] B4 — SilenceCanvas: dot-grid #dcdce2, ghost empty state
- [x] B5 — ReviewInbox + FilterFlow: card rows, progress bar, BigChoiceButton
- [x] B6 — EnergySnapshot: compact segmented preset control
- [x] B7 — KanbanTab: Museum view in segmented control
- [x] B8 — WipSlot, PullQueue, Dialogs, PauseScreen, SettingsScreen
- [x] B9 — PWA manifest theme #f6f6f8, cleanupOutdatedCaches
- [x] C1–C11 — Edge cases: undo WIP, no mockCards, cross-tab sync, quota toast, JSON backup,
       multiline split, IME guards, line-clamp, stuck delta guard, accessibility (focus trap, reduced-motion)

### Workflow v2 — таймеры, привычки, удаление «Энергии» (2026-06-13)

**Spec:** [2026-06-13-kaizenflow-workflow-v2-timers-habits.md](../docs/superpowers/specs/2026-06-13-kaizenflow-workflow-v2-timers-habits.md)

- [x] Ф1 — Удаление Power Management (стор/хаб/предохранитель/пауза/калькулятор) + реструктуризация вкладок:
      `Поток → Сегодня`, добавлена `Прогресс`; настройки → шестерёнка хедера (`TabPageHeader`)
- [x] Ф2 — Таймер задач (`useTimerStore`, `timerUtils`): секундомер + Помодоро, один активный таймер (WIP),
      сессии фокус-времени, `FocusTimer` в WIP-герое, история в `CardEditSheet`; финализация централизована в `useCardsStore`
- [x] Ф3 — Трекер привычек (`useHabitsStore`, `habitUtils`): расписания daily/weekly/weekdays, стрики, хитмэп;
      `TodayHabits` (чек-лист дня), `HabitsView` + `HabitEditor` в «Прогресс»
- [x] Ф4 — «Прогресс → Время» (`TimeStatsView`, `MiniBarChart`): граф фокуса по дням 7/30, помидоры, сессии;
      `DailySummary` на «Сегодня» (итог дня + nudge паузы ≥90 мин)
- [x] Ф5 — Настройки Помодоро (длительности фокуса/перерыва), инициализация на старте; обновление документации

**Новые сторы:** `useTimerStore`, `useHabitsStore`. **Новые ключи localStorage:** `kaizenflow-timer`, `kaizenflow-habits`, `kaizenflow-pomodoro`. **Миграция:** `cardSanitize` дропает legacy `energyCost`/`resultEffort`.

---

## Decisions Made During Build

- **Stack:** React 19 + Vite 8 + Tailwind v4 + Zustand 5 + Framer Motion — no TypeScript, no backend for v1
- **Split-view is temporary** — target is tab shell + global dump overlay (see UI shell spec)
- **Card colors** from `STICKY_COLORS` in `lib/cardUtils.js`, not theme tokens
- **Undo delete** — 5s window via store timer pattern in `useCardsStore`
- **Context files** migrated from JobPilot template to KaizenFlow (2026-06-07)

---

## Notes

- Demo data in `mockCards.js` — replace with persisted storage in S1
- `DumpPanel` deprecated — logic moved to `DumpOverlay`; `Canvas` returns in Phase 2 as `SilenceCanvas`
- S1 Persistence deferred until page designs approved on mock data
- UI shell spec has 40 agreed design decisions — reference before building navigation
