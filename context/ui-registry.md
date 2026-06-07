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

### UndoToast

**File:** `src/components/UndoToast.jsx`  
**Role:** 5-second undo after card delete

**Toast bar:**

```
fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4
rounded-xl bg-warm-text px-5 py-3 text-sm text-white shadow-xl
```

**Undo button:**

```
font-medium text-[#FFE0B2] underline-offset-2 hover:underline
```

**Motion:** spring stiffness 400 damping 28; enter y 24→0, exit y 12

---

### App (root layout)

**File:** `src/App.jsx`  
**Role:** Current split-view shell

```
div: flex h-full min-h-screen
  DumpPanel | Canvas | UndoToast
```

Will be replaced by tab shell + overlay in S2.

---

## Planned Components (not built)

| Component | Phase | Notes |
|---|---|---|
| `DumpOverlay` | S2 | Refactor of DumpPanel — sheet/modal |
| `TabBar` / `Sidebar` | S2 | Navigation chrome |
| `FlowDashboard` | 3 | WIP + pull queue |
| `ReviewInbox` | 2 | Raw card list |
| `FilterPipeline` | 2 | Swipe filter screens |
| `KanbanBoard` | 3 | Day/week columns |
| `EnergyHub` | 4 | Presets + sliders |
| `FlowCard` | 2 | Flat card variant (post-filter) |

Add each to this registry when implemented.
