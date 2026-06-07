# UI Rules

Concise rules for building KaizenFlow UI. Read [ui-tokens.md](./ui-tokens.md) for exact values and [2026-06-07-kaizenflow-ui-shell.md](../docs/superpowers/specs/2026-06-07-kaizenflow-ui-shell.md) for screen-level behavior.

---

## Product Tone

- **Ultra-minimal, calm, fast** — no visual noise, no pressure
- **Russian** for all user-facing text
- **Suggest, don't command** — soft copy, optional actions, undo on destructive steps
- **Mobile-first PWA** — desktop is graceful extension, not a separate design

---

## Font

**Body:** system stack via `@theme`: `'Segoe UI', system-ui, sans-serif` — `font-sans` / body default.

**Headings & brand:** Lora serif via `@fontsource/lora` — `font-serif` on app title, tab h2, overlay titles.

Apply through `body { font-family: var(--font-sans) }` in `index.css`. Import Lora weights in `index.css`.

---

## Layout

### Current (pre-shell)

Split-view: `DumpPanel` (360px) + `Canvas` — temporary until S2 UI shell ships.

### Target (S2+)

- **Mobile:** one tab at a time; bottom tab bar with center dump action
- **Desktop:** sidebar (dump + tabs) + main content; no permanent split-view
- **Breakpoint:** 768px (`md:`) for mobile vs desktop patterns
- Full viewport height: `h-full min-h-screen` on root layout

---

## Navigation (target)

Three tabs: **Поток · Разбор · Канбан**

- Home screen = **Поток** (WIP + pull queue)
- Energy hub = drill-down from Поток, not a tab
- Global dump = center action (mobile) or sidebar button + Ctrl+Enter (desktop)
- No floating FAB

Active tab: white pill + `border-l-2 border-warm-accent` (sidebar) or accent icon + dot (mobile tab bar). Lucide icons in nav only.

---

## Two Visual Modes

### Raw / «Неделя тишины»

- `StickyNote` on dot-grid canvas
- Tilted cards, paper colors from `STICKY_COLORS`
- Double-click to edit on canvas
- Drag to reposition

### Flow / Review / Kanban

- Flat white/cream cards, no rotation
- No dot-grid background
- Tap → sheet edit (except inbox: tap = inline edit)
- Structured layout, not free-form canvas

Never show sticky aesthetic on filtered/queued cards.

---

## Buttons

**Primary** — one main action per screen section:

```
bg-warm-accent text-white rounded-lg font-medium
hover:bg-warm-accent-hover
disabled:opacity-40
```

**Secondary** — cancel, dismiss:

```
border border-cream-dark text-warm-muted
hover:bg-cream-dark
```

**Destructive** — always paired with undo toast, never guilt copy.

Equal weight for WIP actions: **«Сделано»** (accent) and **«Не актуально»** (muted).

---

## Forms & Inputs

- Textareas for thought dump — not single-line inputs
- Enter = save (dump); Shift+Enter = new line
- Escape = cancel / collapse with unsaved-text dialog
- Focus ring: `ring-warm-accent/30` — subtle, not harsh
- Placeholder copy: calm questions («Что крутится в голове?»)

---

## Cards & Lists

### Inbox (Review)

- Vertical list, chronological
- Tap = inline text edit
- «Разобрать» button per card → fullscreen filter

### Pull queue (Flow)

- Tap = pull to WIP
- «⋯» = edit sheet
- Energy-incompatible cards: lowered opacity, still visible

### WIP slot

- Max **1** card — hard product invariant
- Empty slot: dashed border + «Одно дело в единицу времени»
- Two completion buttons under card

### Kanban

- Mobile: tap → «Переместить в…» sheet
- Desktop: drag between columns
- WIP gate blocks second card in «В работе»

---

## Empty States

Every screen that can be empty needs one. Keep minimal:

- Short muted text (`text-warm-muted`)
- White card surface: `bg-white rounded-2xl shadow-sm border border-cream-dark/50`
- One optional muted Lucide icon above title — never stack multiple CTAs
- Examples: «Холст пуст», «Поток свободен», «N мыслей ждут разбора»

Priority when multiple nudges apply: unprocessed thoughts first.

---

## Feedback & Motion

- **Framer Motion** springs for enter/exit — see existing components
- **Web Vibration** on: successful dump, pull to WIP, «Сделано» (when API available)
- New card animation: fly-in from dump panel direction
- **Toast** (`Toast.jsx` + `useToastStore`): success (light card + accent stripe, 4s) and destructive/undo (dark bar, 5s); replace on rapid saves with counter

---

## Filter UX (Phase 2)

- Swipe right = «Хочу», left = «Должен»
- One criterion per screen
- Three final actions: **В поток · Пока не ясно · Отпустить**
- «Отпустить» → undo toast
- Optional tags/chips — skippable, never blocking

---

## Stuck / Warning States

- Stuck cards: **amber outline** — not red
- Willpower guard: dialog with recovery suggestions + always «Всё равно продолжу»
- No guilt language anywhere

---

## Overlays

| Context | Mobile | Desktop |
|---|---|---|
| Dump | Bottom sheet | Centered modal |
| Edit card | Bottom sheet | Sheet or modal |
| Collapse with unsaved text | In-panel dialog | Same |

Backdrop: `bg-warm-text/25 backdrop-blur-sm` · Panel: `bg-white shadow-xl rounded-2xl`

---

## Do Nots

- Never use Tailwind default palette (`gray-*`, `purple-*`) — use project tokens
- Never add dot-grid outside silence-week canvas
- Never show sticky rotation on flow/kanban cards
- Never use red for non-critical states — amber for stagnation
- Never block user without override on willpower guard
- Never use long-press as primary action (except desktop kanban drag)
- Never show raw errors — calm Russian messages only
- Never return to permanent 360px split-view after shell ships

---

## Tailwind v4 Note

Tokens in `src/index.css` via `@theme` — no color config file. Add new tokens there first, then use generated utilities.
