# UI Tokens — Modern Calm

Design tokens for KaizenFlow. Source of truth: `src/index.css` (`@theme`) · sticky colors in `src/lib/cardUtils.js`.

---

## How to Use

Tailwind CSS v4 — all tokens in `@theme` in `src/index.css`. No `tailwind.config.js` needed for colors.

```jsx
// Correct
className="bg-canvas text-ink border-line"
className="bg-accent text-white"

// Dynamic sticky color
style={{ backgroundColor: card.color.bg }}

// Never — raw Tailwind palette
className="bg-gray-100 text-gray-800"
```

---

## Token Reference

```css
@theme {
  /* surfaces */
  --color-canvas: #f6f6f8;        /* app background */
  --color-surface: #ffffff;       /* cards, panels, sheets */
  --color-sunken: #efeff3;        /* segmented controls, chip backgrounds */
  --color-line: #e7e7ec;          /* borders */
  --color-line-strong: #d9d9e0;   /* borders at hover/focus */

  /* text */
  --color-ink: #1b1b22;
  --color-ink-muted: #6e6e7a;
  --color-ink-faint: #9c9ca8;

  /* accent — calm indigo */
  --color-accent: #5b5bd6;
  --color-accent-hover: #4a4ac4;
  --color-accent-soft: #ededfb;   /* chip backgrounds, active tab pill */

  /* semantic */
  --color-success: #2e9e6b;
  --color-success-soft: #e5f5ec;
  --color-warn: #d97a1a;          /* stuck detector — amber, not red */
  --color-warn-soft: #fbf0df;
  --color-danger: #d6455b;        /* delete only */

  --font-sans: 'Inter Variable', 'Segoe UI', system-ui, sans-serif;

  --shadow-card: 0 1px 2px rgb(27 27 34 / 0.05), 0 4px 12px rgb(27 27 34 / 0.06);
  --shadow-float: 0 4px 8px rgb(27 27 34 / 0.08), 0 12px 32px rgb(27 27 34 / 0.12);
}
```

---

## Color Usage Guide

### Surfaces

| Element | Class |
|---|---|
| App background | `bg-canvas` |
| Card / panel / sheet | `bg-surface` |
| Segmented control bg, chip bg | `bg-sunken` |
| Default border | `border-line` |
| Hover/focus border | `border-line-strong` |
| Overlay backdrop | `bg-ink/30 backdrop-blur-sm` |

### Typography

| Element | Class |
|---|---|
| Primary text | `text-ink` |
| Secondary / hints | `text-ink-muted` |
| Placeholder / faint | `text-ink-faint` |
| Accent emphasis | `text-accent` |

### Accent (Calm Indigo)

| Element | Class |
|---|---|
| Primary button bg | `bg-accent` |
| Primary button hover | `hover:bg-accent-hover` |
| Active tab / chip bg | `bg-accent-soft text-accent` |
| Focus ring | `focus-visible:ring-2 ring-accent/40` |

---

## Sticky Note Colors

Defined in `STICKY_COLORS` (`src/lib/cardUtils.js`):

| Index | Background | Shadow |
|---|---|---|
| 0 | `#FBF3D5` | `#E8DCAA` |
| 1 | `#FBE4E7` | `#EFC3CA` |
| 2 | `#DFEBFA` | `#BCD4F0` |
| 3 | `#E2F2E5` | `#BFDFC7` |
| 4 | `#EFE6F7` | `#D8C4EA` |
| 5 | `#FCE9DC` | `#F0CDB4` |

---

## Canvas Dot Grid

Inline style on canvas container. Only on «Неделя тишины»:

```
radial-gradient(circle, #dcdce2 1px, transparent 1px)
background-size: 24px 24px
```

---

## Typography

| Element | Classes |
|---|---|
| Tab / page title | `text-[22px] font-semibold tracking-tight text-ink` |
| Section heading | `text-xs font-semibold uppercase tracking-wider text-ink-faint` |
| Body / card text | `text-[15px] text-ink leading-relaxed` |
| Subtitle | `text-sm text-ink-muted` |
| Primary button | `text-sm font-medium text-white` |
| Sticky note | `text-[14px] text-ink` |

Font: **Inter Variable** via `@fontsource-variable/inter`. One font, no serif.

---

## Component Recipes

### Primary Button
```
bg-accent text-white text-sm font-medium rounded-xl px-4 py-2.5
hover:bg-accent-hover active:scale-[0.98] transition
disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 ring-accent/40
```

### Secondary Button
```
bg-surface border border-line text-ink rounded-xl px-4 py-2.5
hover:border-line-strong hover:bg-sunken/60 transition
```

### Ghost / Danger Text
```
ghost: text-ink-muted hover:text-ink
danger: text-danger hover:text-danger/70
```

### Card
```
bg-surface rounded-2xl border border-line/60 shadow-(--shadow-card)
```

### Sheet / Dialog
```
mobile: rounded-t-3xl  desktop: rounded-2xl
bg-surface border border-line/60 shadow-(--shadow-float)
backdrop: bg-ink/30 backdrop-blur-sm
```

### Segmented Control
```
container: bg-sunken rounded-xl p-1
active segment: bg-surface rounded-lg shadow-sm font-medium text-ink
inactive: text-ink-muted hover:text-ink
```

### Chip
```
default: bg-sunken text-ink-muted rounded-full px-3 py-1 text-xs font-medium
selected: bg-accent-soft text-accent
```

### Toast
```
bg-ink text-white rounded-xl shadow-(--shadow-float)
undo link: text-accent-soft (approx #c7c7f5)
```

### Empty State
```
icon: h-12 w-12 rounded-full bg-sunken with icon h-6 w-6 text-ink-faint
title: text-base font-semibold text-ink
description: text-sm text-ink-muted
action button: primary button recipe
```

---

## Invariants

- Never hex in components when a `@theme` token exists
- Sticky colors always from `STICKY_COLORS`
- Dot-grid only on silence-week canvas
- Stuck cards: left strip `bg-warn` + chip «N дней» — not whole card warn color
- One font: Inter Variable — no serif ever
- All user-facing copy in Russian
- Animations via Framer Motion; `useReducedMotion()` on any looping animation
