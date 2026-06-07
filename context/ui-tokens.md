# UI Tokens

Design tokens for KaizenFlow. All colors, typography, spacing, and component values for this project. Use these exact values throughout the codebase — never hardcode colors or use raw Tailwind palette classes when a project token exists.

**Source of truth in code:** `src/index.css` (`@theme`) · sticky note colors in `src/lib/cardUtils.js`

---

## How to Use

This project uses **Tailwind CSS v4**. All design tokens are defined using the `@theme` directive in `src/index.css`. No `tailwind.config.js` needed for colors.

Tailwind v4 generates utility classes from `@theme` variables:

- `--color-cream` → `bg-cream`, `text-cream`, `border-cream`
- `--color-warm-accent` → `bg-warm-accent`, `text-warm-accent`, `ring-warm-accent`

```jsx
// Correct — generated utilities
className="bg-cream text-warm-text border-cream-dark"

// Correct — dynamic sticky color from data
style={{ backgroundColor: card.color.bg }}

// Never — raw Tailwind palette
className="bg-gray-100 text-gray-800"

// Never — hardcoded hex when token exists
className="bg-[#faf6f0]"
```

---

## index.css — Complete Token Definition

```css
@import 'tailwindcss';
@import '@fontsource/lora/500.css';
@import '@fontsource/lora/600.css';

@theme {
  --color-cream: #faf6f0;
  --color-cream-dark: #f0ebe3;
  --color-warm-text: #3d3830;
  --color-warm-muted: #8a8279;
  --color-warm-accent: #c4956a;
  --color-warm-accent-hover: #b08050;
  --font-sans: 'Segoe UI', system-ui, sans-serif;
  --font-serif: 'Lora', Georgia, 'Times New Roman', serif;
}
```

---

## Color Usage Guide

### Page & Surfaces

| Element | Token / class |
|---|---|
| App background | `bg-cream` |
| Panel / sidebar background | `bg-cream` |
| Card / input surface | `bg-white` |
| Default border | `border-cream-dark` |
| Overlay backdrop | `bg-cream/80 backdrop-blur-[2px]` |

### Typography

| Element | Token |
|---|---|
| Primary text | `text-warm-text` |
| Secondary / hints | `text-warm-muted` |
| Accent emphasis in copy | `text-warm-accent` |
| Placeholder | `placeholder:text-warm-muted/60` |
| Toast on dark bar | `text-white` |

### Accent (Warm Terracotta)

Used for: primary buttons, active counts, focus rings, dump button

| Element | Class |
|---|---|
| Primary button bg | `bg-warm-accent` |
| Primary button hover | `hover:bg-warm-accent-hover` |
| Focus ring | `focus:ring-warm-accent/30` or `ring-warm-accent/40` |
| Accent shadow | `shadow-warm-accent/30` |

### Semantic (planned — add to `@theme` when implementing)

| Purpose | Suggested value | Usage |
|---|---|---|
| Stuck card outline | amber (`ring-amber-400/60`) | Detektor zatorov — not red alarm |
| Success / done | keep warm accent or soft green | «Сделано» feedback |
| Muted / disabled | `opacity-40` + `disabled:cursor-not-allowed` | Disabled buttons |
| Energy mismatch | reduced opacity on card | Pull queue when energy too low |

Add these to `@theme` only when the feature ships — until then use Tailwind amber utilities for stuck state as specified in UI shell spec.

---

## Sticky Note Colors

Not theme tokens — defined in `STICKY_COLORS` (`src/lib/cardUtils.js`):

| Index | Background | Shadow |
|---|---|---|
| 0 | `#FFF9C4` | `#F0E68C` |
| 1 | `#FFCDD2` | `#EF9A9A` |
| 2 | `#B3E5FC` | `#81D4FA` |
| 3 | `#C8E6C9` | `#A5D6A7` |
| 4 | `#E1BEE7` | `#CE93D8` |
| 5 | `#FFE0B2` | `#FFCC80` |

Shadow applied inline in `StickyNote.jsx` — do not move to CSS variables.

---

## Canvas Dot Grid

Not a token — inline style on canvas container:

```
radial-gradient(circle, #e8e0d4 1px, transparent 1px)
background-size: 24px 24px
```

Use **only** in «Неделя тишины» / raw sticky canvas — never on Flow, Kanban, or filter screens.

---

## Typography

| Element | Size | Weight | Color |
|---|---|---|---|
| App title / tab h2 | `font-serif text-2xl` | `font-medium` | `text-warm-text` |
| Section heading (Review silence week) | `font-serif text-xl` | `font-medium` | `text-warm-text` |
| Body / card text | `text-sm`–`text-[15px]` | normal | `text-warm-text` |
| Hints / subtitles | `text-xs`–`text-sm` | normal | `text-warm-muted` |
| Primary button label | `text-sm` | `font-medium` | `text-white` |
| Sticky note text | `text-[14px]` | normal | `text-warm-text` |

Font family: **Segoe UI, system-ui, sans-serif** via `--font-sans` for body. **Lora** via `@fontsource/lora` and `--font-serif` for headings (`font-serif`).

---

## Spacing

| Token | Value | Usage |
|---|---|---|
| `gap-2` | 8px | Button groups, form gaps |
| `gap-3` | 12px | Flow mode dump spacing |
| `gap-4` | 16px | Idle dump layout |
| `px-6` | 24px | Panel horizontal padding |
| `py-5` | 20px | Panel header/content vertical |
| `p-5` | 20px | Dialog padding |
| `rounded-lg` | 8px | Buttons, inputs |
| `rounded-xl` | 12px | Textareas, toasts, dialogs |
| `rounded-full` | pill | Dump button (128×128 circle) |

---

## Component Tokens

### Primary Button

```
bg-warm-accent text-white text-sm font-medium
rounded-lg py-2.5 (or py-2)
hover:bg-warm-accent-hover
disabled:opacity-40 disabled:cursor-not-allowed
```

### Secondary / Ghost Button

```
border border-cream-dark text-warm-muted
rounded-lg py-2.5
hover:bg-cream-dark hover:text-warm-text
```

### Dump Circle Button (idle)

```
h-32 w-32 rounded-full
bg-warm-accent text-lg font-medium text-white
shadow-lg shadow-warm-accent/30
hover:bg-warm-accent-hover
whileHover scale 1.03 · whileTap scale 0.97
```

### Textarea (dump input)

```
w-full resize-none rounded-xl
border border-cream-dark bg-white
px-4 py-3 text-[15px] leading-relaxed text-warm-text
placeholder:text-warm-muted/60
focus:shadow-md focus:ring-2 focus:ring-warm-accent/30
```

### Empty State Card

```
flex max-w-sm flex-col items-center rounded-2xl
border border-cream-dark/50 bg-white px-8 py-10 shadow-sm
icon: Lucide h-8 w-8 text-warm-accent/45 strokeWidth 1.5
title: font-serif text-base font-medium text-warm-text
description: text-sm text-warm-muted
```

### Dialog / Sheet Surface

```
rounded-2xl border border-cream-dark/60 bg-white shadow-xl
overlay backdrop: bg-warm-text/25 backdrop-blur-sm
```

### Undo Toast

```
fixed bottom-8 left-1/2 -translate-x-1/2 z-50
rounded-xl bg-warm-text px-5 py-3 text-sm text-white shadow-xl
Undo link: text-[#FFE0B2] hover:underline
```

### Sticky Note

```
width: 180px (w-[180px])
padding: px-4 py-3
border-radius: rounded-sm (slight paper feel)
text: text-[14px] leading-snug
shadow: dynamic from card.color.shadow (inline)
rotation: from card.rotation (inline, raw only)
edit ring: ring-2 ring-warm-accent/40
```

### Flow Card (planned — post-filter)

```
bg-white border border-cream-dark rounded-xl
no rotation, no dot-grid context
padding px-4 py-3, text-sm
```

---

## Two Visual Modes

| Mode | Where | Texture |
|---|---|---|
| **Raw / silence week** | Canvas, StickyNote | Dot-grid, tilt, STICKY_COLORS |
| **Flow / review / kanban** | All structured screens | Clean digital — cream/white, no grid |
| **Year board** | Retrospective | Slightly warmer accent tone, read-only |

Brand colors stay the same — only density and texture change.

---

## Invariants

- Never use hex in components when a `@theme` token exists
- Sticky colors always from `STICKY_COLORS` — never random hex in components
- Dot-grid only on silence-week canvas
- Stuck cards use amber outline — never red alarm styling
- All user-facing copy in Russian
- Animations via Framer Motion springs — see `StickyNote.jsx` for reference values
