# UI Rules — Modern Calm

Concise rules for building KaizenFlow UI. Read [ui-tokens.md](./ui-tokens.md) for exact values.

---

## Product Tone

- **Ultra-minimal, calm, fast** — no visual noise, no pressure
- **Russian** for all user-facing text
- **Suggest, don't command** — soft copy, optional actions, undo on destructive steps
- **Mobile-first PWA** — desktop is graceful extension, not a separate design

---

## Font

**One font: Inter Variable** via `@fontsource-variable/inter`.
- Body default: `font-sans` → `'Inter Variable', 'Segoe UI', system-ui, sans-serif`
- No serif ever. Never use `font-serif`.
- Headings: `font-semibold tracking-tight`

---

## Layout

- **Mobile:** bottom tab bar (64px, surface/90 backdrop-blur), FAB raised above bar
- **Desktop:** sidebar (240px) + main content
- **Breakpoint:** `md:` (768px) for mobile vs desktop patterns
- Full viewport height: `h-full` on root layout

---

## Navigation

Four tabs: **Поток · Разбор · Канбан · Ещё**

- Home screen = **Поток**
- Active tab (mobile): icon + label `text-accent`, top pill `bg-accent-soft`
- Active item (sidebar): `bg-accent-soft text-accent rounded-xl`
- FAB: 56px, `bg-accent shadow-(--shadow-float)`, `active:scale-95`

---

## Two Visual Modes

### Raw / «Неделя тишины»
- `StickyNote` on dot-grid canvas (`#dcdce2`, 24px)
- Tilted cards, muted paper colors from `STICKY_COLORS` (`rounded-lg`)
- Double-click to edit; drag to reposition
- `line-clamp-5` on text

### Flow / Review / Kanban
- `bg-surface rounded-2xl border border-line/60 shadow-(--shadow-card)` cards
- No rotation, no dot-grid
- Tap → sheet edit or inline edit
- Structured layout, not free-form canvas

Never show sticky aesthetic on filtered/queued cards.

---

## Buttons

**Primary** — one main action per section:
```
bg-accent text-white text-sm font-medium rounded-xl px-4 py-2.5
hover:bg-accent-hover active:scale-[0.98] transition
disabled:opacity-40 focus-visible:ring-2 ring-accent/40
```

**Secondary** — cancel, dismiss:
```
bg-surface border border-line text-ink-muted rounded-xl
hover:border-line-strong hover:bg-sunken/60 transition
```

**Ghost-danger** — destructive, always paired with undo:
```
text-danger hover:text-danger/70 transition (no border/bg)
```

WIP completion: **«Сделано»** (`bg-success text-white`) + **«Отпустить»** (secondary).

---

## Forms & Inputs

- Textareas for dump — not single-line inputs
- `e.isComposing` guard on Enter handlers (IME)
- Enter = save; Shift+Enter = new line
- Esc = cancel / collapse with unsaved-text dialog
- Focus ring: `focus-visible:ring-2 ring-accent/40`
- Placeholder: calm questions («Что крутится в голове?»)
- Keyboard hints desktop-only (`useFinePointerDesktop`)

---

## Cards & Lists

### Inbox (Review)
- `bg-surface rounded-2xl border border-line/60 shadow-(--shadow-card)` cards
- Left color strip `w-1 bg-[card.color.bg]`
- «Разобрать» chip: `bg-accent-soft text-accent`
- `line-clamp-2` on card text in lists

### Pull queue (Flow)
- Same card recipe as Inbox
- Energy chip: light=`success`, medium=`ink-muted`, heavy=`warn`
- Energy-incompatible cards: `opacity-50`, not clickable

### WIP slot
- Max **1** card — hard product invariant
- Active: hero card `shadow-card`, «Сделано» (`bg-success`) + «Отпустить» (secondary)
- Empty: `border-2 border-dashed border-line-strong rounded-2xl`

### Kanban
- Mobile: tap → «Переместить в…» sheet
- Desktop: drag between columns; drop zone `ring-2 ring-accent/40`
- Stuck cards: left strip `bg-warn` + chip «N дней» — not whole card warn

---

## Segmented Controls

Used for: Канбан views, ReviewViewToggle, FilterFlow criteria answers, EnergySnapshot:
```
container: bg-sunken rounded-xl p-1
active: bg-surface rounded-lg shadow-sm font-medium text-ink
inactive: text-ink-muted hover:text-ink
```

---

## Empty States

Every screen that can be empty must have one with a CTA action button:
```
icon: h-12 w-12 rounded-full bg-sunken
title: font-semibold text-ink
description: text-sm text-ink-muted
action: primary button (e.g. «Выгрузить мысль», «Перейти в Разбор»)
```

---

## Dialogs & Sheets

- Mobile: `rounded-t-3xl`; desktop: `rounded-2xl`
- `shadow-(--shadow-float)` on surface
- Backdrop: `bg-ink/30 backdrop-blur-sm`
- Always: icon glyph in `bg-sunken` circle, primary = safe action, override = ghost
- Focus trap + Esc; focus returns to trigger on close

---

## Accessibility

- `aria-label` on FAB, tab-bar icons, X buttons
- `focus-visible:ring-2 ring-accent/40 outline-none` on all interactive elements
- `useReducedMotion()` to disable looping animations
- Contrast: `ink-muted` on `canvas` ≥ 4.5:1 ✓ (5.2:1)

---

## Invariants

- Single theme — no dark mode variants
- Never hex when a token exists
- Sticky colors always from `STICKY_COLORS`
- Dot-grid only on silence-week canvas
- Stuck state uses `warn` tokens — never red/destructive
- WIP = 1 is a hard invariant, enforced in store
- All copy in Russian
