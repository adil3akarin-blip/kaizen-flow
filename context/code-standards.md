# Code Standards

Implementation rules and conventions for KaizenFlow. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

**Also read:** [AGENTS.md](../AGENTS.md) for product invariants, stack overview, and folder layout.

---

## Engineering Mindset

- **Think before implementing** — understand what is being built and why before writing a single line
- **Read context files first** — never assume; verify against `architecture.md`, `IDEA.md`, and the current roadmap spec
- **Scope is sacred** — only build what the current feature requires
- **Every feature must be testable** — if it cannot be verified in the browser after implementation, it is incomplete
- **Clean over clever** — simple readable code preferred over abstractions
- **One thing at a time** — complete one feature fully before touching the next

---

## Language

- **JavaScript only** — `.js` / `.jsx`, no TypeScript
- ES modules (`import` / `export`)
- Use `const` by default — `let` only when reassignment is necessary
- All async code must handle errors — never leave floating promises in event handlers without catch

---

## React 19 + Vite 8

- Functional components with hooks only
- **Default export** for component files — one component per file
- Vite entry: `src/main.jsx` → `src/App.jsx`
- No SSR, no API routes, no server actions — client-side PWA
- Browser APIs (Vibration, localStorage, IndexedDB) are allowed in components and stores when needed
- Run `npm run dev` to verify UI changes; run `npm run lint` before finishing any task

---

## File and Folder Naming

- Component files: `PascalCase.jsx` — `StickyNote.jsx`, `DumpPanel.jsx`
- Store / utility files: `camelCase.js` — `useCardsStore.js`, `cardUtils.js`
- Data files: `camelCase.js` — `mockCards.js`
- One component per file
- No barrel `index.js` exports — import directly from source files

---

## Component Structure

```jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { useCardsStore } from '../store/useCardsStore'

export default function ComponentName({ card, onDelete }) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

- Props destructured in the function signature
- Conditional classes via `clsx` — never manual string concatenation
- No inline styles except dynamic values that Tailwind cannot express (e.g. sticky note rotation, color from data)
- User-facing text in Russian

---

## Zustand Stores

```js
import { create } from 'zustand'

export const useCardsStore = create((set, get) => ({
  cards: [],
  addCard: (text) => { /* ... */ },
}))
```

- One store per domain — `useCardsStore`, future `useEnergyStore`, etc.
- **Selectors: one value per call** — never `useCardsStore((s) => s)` for the whole store
- Mutations live in the store; components call store actions, not direct state writes
- Pure helpers (color pick, position, card factory) belong in `lib/`, not in the store

---

## Styling

- Tailwind CSS v4 via `@tailwindcss/vite`
- Design tokens in `src/index.css` under `@theme` — use generated utilities (`bg-cream`, `text-warm-text`, etc.)
- Never hardcode hex colors in components when a token exists
- Sticky note colors come from `STICKY_COLORS` in `lib/cardUtils.js` — not from theme tokens
- See [ui-tokens.md](./ui-tokens.md) and [ui-rules.md](./ui-rules.md) for visual patterns

---

## Animations

- Framer Motion for transitions — prefer `type: 'spring'` over linear or ease
- Use `AnimatePresence` for mount/unmount (toasts, dialogs, overlays)
- Keep animations subtle — calm product tone, no visual noise

---

## Error Handling

- Never use empty catch blocks
- User-facing errors in Russian, calm tone — no stack traces in UI
- Console errors include context: `[DumpPanel]`, `[useCardsStore]`, etc.

---

## Import Paths

- Relative imports within `src/` — no path alias configured yet
- Keep imports shallow: `../store/useCardsStore`, `../lib/cardUtils`
- Do not import components into `lib/` — `lib/` stays React-free

---

## Comments

- No comments explaining what the code does — code must be self-explanatory
- Comments only for non-obvious why (hidden invariant, workaround)
- Never leave TODO comments in committed code

---

## Dependencies

Never install a new package without a clear reason. Before installing anything check:

1. Does the browser already provide this natively (Web APIs, CSS)?
2. Can we solve it with an existing approved dependency?
3. Is there a simpler solution without adding a package?

### Approved production dependencies

| Package | Purpose |
|---|---|
| `react`, `react-dom` | UI (React 19) |
| `tailwindcss`, `@tailwindcss/vite` | Styling — Tailwind v4, config in CSS via `@theme` |
| `zustand` | Client state management |
| `framer-motion` | Spring-based animations |
| `clsx` | Conditional class names |
| `@fontsource/lora` | Serif headings (Lora 500/600, self-hosted) |
| `lucide-react` | Navigation and empty-state icons (tree-shaken) |
| `@dnd-kit/react` | Kanban drag-and-drop (desktop columns) |
| `@dnd-kit/helpers` | `move()` for multi-column sortable state |
| `postcss`, `autoprefixer` | CSS pipeline for Tailwind |

### Approved dev dependencies

| Package | Purpose |
|---|---|
| `vite`, `@vitejs/plugin-react` | Build tool and dev server |
| `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals` | Linting |
| `@types/react`, `@types/react-dom` | Editor hints only — project code is JavaScript |
| `vite-plugin-pwa` | PWA manifest + Service Worker (offline shell) |

### Planned — install only when starting the corresponding phase

Update this list before adding any of these:

| Package | Phase | Purpose |
|---|---|---|
| Native `localStorage` / `IndexedDB` | S1 persistence | No library required initially |

### Explicitly out of scope for now

Do not install without a spec update and explicit approval:

- Next.js, Remix, or any SSR framework
- UI kit libraries (shadcn/ui, MUI, Radix) — custom minimal UI
- Backend / BaaS clients (Supabase, Firebase, InsForge, etc.)
- Analytics SDKs (PostHog, etc.)
- AI / LLM SDKs
- Router libraries — add only when S2 navigation shell requires it

**Do not install any other packages without updating this list first.**
