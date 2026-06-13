# Library Docs

Project-specific usage patterns for every third-party library in KaizenFlow. Read the relevant section before implementing any feature that touches these libraries.

**Product context:** [IDEA.md](./IDEA.md) · **Conventions:** [AGENTS.md](../AGENTS.md) · **Approved list:** [code-standards.md](./code-standards.md#dependencies)

---

## Before Using Any Library

1. **Check AGENTS.md** — stack overview and conventions
2. **Check if an MCP server is configured** for that library (if applicable)
3. **Read this file** for project-specific patterns that override general knowledge

Order of authority:

```
MCP server (if available) → AGENTS.md → This file → General training knowledge
```

Never rely on training data alone for library APIs — verify against installed versions in `package.json`.

---

## React 19

**Used for:** all UI components in `src/components/`, root layout in `src/App.jsx`

### Conventions

- Functional components only, with hooks
- Default export per component file
- Selectors from Zustand — one field/action per hook call
- User-facing copy in Russian

```jsx
import { useState, useEffect, useRef } from 'react'

export default function Example({ card, onMove }) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  return (/* JSX */)
}
```

**Rules:**

- No class components
- No default props objects — use default parameters in destructuring
- Prefer controlled inputs for editable card text
- Event handlers on sticky notes must distinguish drag vs click (see `StickyNote.jsx`)

---

## Vite 8

**Used for:** dev server, production build, plugin pipeline

### Config

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### Commands

```bash
npm run dev      # local dev server
npm run build    # production bundle → dist/
npm run preview  # serve dist/ locally
npm run lint     # ESLint — run before finishing tasks
```

**Rules:**

- No path aliases until explicitly added to `vite.config.js`
- Static assets in `src/assets/` or `public/`
- PWA plugin (`vite-plugin-pwa`) — only when S3 phase starts; update dependencies list first
- Environment variables: `import.meta.env.VITE_*` — prefix required for client exposure

---

## Tailwind CSS v4

**Used for:** all layout and styling

### Token setup

Tokens live in `src/index.css`:

```css
@import 'tailwindcss';

@theme {
  --color-cream: #faf6f0;
  --color-cream-dark: #f0ebe3;
  --color-warm-text: #3d3830;
  --color-warm-muted: #8a8279;
  --color-warm-accent: #c4956a;
  --color-warm-accent-hover: #b08050;
  --font-sans: 'Segoe UI', system-ui, sans-serif;
}
```

Tailwind generates utilities from `@theme`:

```jsx
// Correct
className="bg-cream text-warm-text border-cream-dark"

// Never — raw Tailwind palette
className="bg-gray-100 text-gray-800"

// Never — hardcoded hex when token exists
className="bg-[#faf6f0]"
```

**Rules:**

- No `tailwind.config.js` for colors — `@theme` in CSS is the source of truth
- Sticky note background colors are data-driven from `STICKY_COLORS`, not theme tokens
- Mobile-first responsive classes; desktop is graceful extension (see UI shell spec)
- `@tailwindcss/vite` plugin handles PostCSS — do not add separate PostCSS config unless needed

---

## Zustand 5

**Used for:** all client state — currently `src/store/useCardsStore.js`

### Store pattern

```js
import { create } from 'zustand'

export const useCardsStore = create((set, get) => ({
  cards: [],
  addCard: (text) => {
    const trimmed = text.trim()
    if (!trimmed) return null
    // ...
  },
}))
```

### Component usage

```jsx
// Correct — one selector per line
const cards = useCardsStore((s) => s.cards)
const addCard = useCardsStore((s) => s.addCard)

// Never — subscribes to entire store
const store = useCardsStore()
```

**Rules:**

- New domains get new stores (`useEnergyStore`, etc.) — do not overload `useCardsStore`
- Side effects (timers for undo) live in store actions, cleared on undo/dismiss
- Persistence (S1): hydrate store on init from `localStorage` / IndexedDB — adapter in `lib/`, not inside components
- Card model fields for future modules (filter tags, kanban column, energy cost) extend `createCard` and store actions together

---

## Framer Motion 12

**Used for:** card animations, dump panel transitions, undo toast, dialogs

### Spring defaults (project tone)

```jsx
import { motion, AnimatePresence } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 8 }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
/>
```

### AnimatePresence

Wrap conditionally mounted UI (toasts, collapse dialog, mode switches):

```jsx
<AnimatePresence>
  {pendingDelete && (
    <motion.div key="undo-toast" exit={{ opacity: 0 }} />
  )}
</AnimatePresence>
```

**Rules:**

- Prefer springs over `duration` / `ease` for interactive UI
- Do not animate layout properties that fight drag logic on sticky notes
- Keep motion subtle — calm, tactile, not flashy
- `layout` prop only when needed; test with drag on canvas

---

## @dnd-kit/react

**Used for:** Kanban board drag-and-drop between columns (`KanbanBoard.jsx`)

**Package:** `@dnd-kit/react` v0.4 — React adapter over `@dnd-kit/dom`. Do not use legacy `@dnd-kit/core` / `@dnd-kit/sortable` packages.

### Kanban pattern

```jsx
import {
  DragDropProvider,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/react'
import { useSortable, isSortable } from '@dnd-kit/react/sortable'
import { useFinePointerDesktop } from '../lib/useFinePointerDesktop'

function Board() {
  const snapshotRef = useRef(null)
  const dragEnabled = useFinePointerDesktop()

  return (
    <DragDropProvider
      onDragStart={() => {
        snapshotRef.current = structuredClone(columnOrder)
      }}
      onDragOver={(event) => {
        if (!snapshotRef.current || event.canceled) return
        setColumnOrder(move(snapshotRef.current, event))
      }}
      onDragEnd={handleDragEnd}
    >
      {columns.map((column) => (
        <KanbanColumn key={column.id} column={column} dragEnabled={dragEnabled} />
      ))}
      <DragOverlay disabled={!dragEnabled}>
        {(source) => (
          <StructuredCard
            card={findCard(source.id)}
            compact
            className="scale-[1.02] shadow-lg ring-2 ring-warm-accent/30"
          />
        )}
      </DragOverlay>
    </DragDropProvider>
  )
}

function KanbanColumn({ column, dragEnabled }) {
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    type: 'column',
    accept: SORTABLE_TYPE,
  })
  // cards from columnOrder + selectOrderedCardsInColumn
}

function KanbanSortableCard({ card, index, group, dragEnabled }) {
  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    group,
    disabled: !dragEnabled,
  })
}
```

### Drag end handler

```js
const handleDragEnd = (event) => {
  if (event.canceled) return
  const { source } = event.operation
  if (!source || !isSortable(source)) return

  const { group, index, initialGroup, initialIndex } = source.sortable
  if (group === initialGroup && index === initialIndex) return

  if (group === initialGroup) {
    reorderKanbanCard(source.id, group, initialIndex, index)
    return
  }

  if (group === 'progress' && wipFull) {
    dragSuspendRef.current = event.suspend()
    openWipGate(/* pending move */)
    return
  }

  moveKanbanCard(source.id, group, { via: 'drag', index })
}
```

### Column order (store)

```js
columnOrder: {
  queue: ['id-a', 'id-b'],
  progress: ['id-c'],
  done: ['id-d'],
  next_week: [],
}
```

Render order: `selectOrderedCardsInColumn(cards, columnOrder, columnId)`. Mutations go through store actions — never splice `columnOrder` in components.

**Rules:**

- **Fine-pointer desktop only** — `useFinePointerDesktop()` = `(min-width: 768px) and (hover: hover) and (pointer: fine)`; touch uses `MoveCardSheet`
- **Multi-column state** — `move(snapshot, event)` from `@dnd-kit/helpers` on `onDragOver`; snapshot taken on `onDragStart`
- **Disable OptimisticSortingPlugin** — React renders from `columnOrder`; DOM optimistic moves fight React reconciliation
- **Sortable multi-column** — `useSortable` with `group` = column id; within-column reorder desktop only
- **Cross-column insert** — drag: drop index; sheet: append queue/next_week, prepend done, slot progress
- **WIP gate + suspend** — `event.suspend()` on blocked drag to progress; `resume()` after gate, `abort()` on cancel
- **Haptics** — `hapticTap()` on move to «В работе» / «Сделано» (any path); guard degrades on desktop
- **A11y** — `MoveCardSheet` via «⋯» → `CardEditSheet` «Переместить в…» on all platforms
- **DragOverlay** — scale + shadow + accent ring; **no rotation** on kanban cards
- **StickyNote canvas** — keep custom pointer drag; do not migrate canvas to dnd-kit

---

## clsx

**Used for:** conditional and merged class names

```jsx
import clsx from 'clsx'

className={clsx(
  'rounded-lg px-4 py-2 text-sm',
  isActive && 'bg-warm-accent text-white',
  isDisabled && 'pointer-events-none opacity-50',
  className,
)}
```

**Rules:**

- Always use `clsx` for conditional classes — no template literal concatenation
- Forward `className` prop on reusable components when applicable

---

## ESLint 10

**Config:** `eslint.config.js` (flat config)

```bash
npm run lint
```

**Rules enforced:**

- Recommended JS rules (`@eslint/js`)
- React Hooks rules (`eslint-plugin-react-hooks`)
- React Refresh / Vite HMR (`eslint-plugin-react-refresh`)
- Browser globals via `globals`

**Rules:**

- Fix all lint errors before marking a task complete
- Do not disable rules without a documented reason in code review

---

## Browser APIs (no package)

These are part of the product spec — use native APIs, no dependency:

| API | Phase | Usage |
|---|---|---|
| `crypto.randomUUID()` | current | Card IDs in `createCard` |
| `navigator.vibrate()` | S4 | Tactile feedback on dump success, move to done |
| `localStorage` | S1 | First persistence layer for cards / onboarding flags |
| `IndexedDB` | S1+ | Heavier local data if localStorage limits hit |
| Service Worker | S3 | Offline shell via `vite-plugin-pwa` (installed) |

**Vibration pattern:**

```js
if (typeof navigator !== 'undefined' && navigator.vibrate) {
  navigator.vibrate(10)
}
```

Always guard — degrades silently when API unavailable.

---

## Planned libraries (not installed yet)

Do not import these until the phase starts and `code-standards.md` dependencies list is updated:

| Library | Phase | Notes |
|---|---|---|
| Router (TBD) | S2 | Only if tab shell needs client routing — evaluate native approach first |

**Installed:**

| Library | Scope | Notes |
|---|---|---|
| `@dnd-kit/react` | Kanban only | Desktop column drag; mobile uses MoveCardSheet |
| `vite-plugin-pwa` | PWA shell | Workbox precache; SW registered in prod via `main.jsx` |
