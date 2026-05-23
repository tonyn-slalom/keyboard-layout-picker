---
description: "Use when writing React, TypeScript, or Tailwind code for the keyboard layout picker. Covers component conventions, type patterns, Tailwind dark mode, and SVG keyboard rendering rules."
applyTo: "src/**/*.{ts,tsx}"
---
# KLP React/TypeScript Conventions

## Code Organization — Functions over Inline
- **Extract functions early**: if a block of logic is more than 3–4 lines or used more than once, pull it into a named function
- **No inline logic in JSX**: conditional rendering, data transforms, and calculations must be extracted to named variables or functions above the `return`
- **No anonymous inline functions for business logic**: `onClick={() => doComplexThing()}` is fine; `onClick={() => { /* 10 lines */ }}` is not — extract a named handler
- **Utility functions live in `src/utils/`**, not inside components
- **Custom hooks for stateful logic**: any `useState` + `useEffect` combo beyond trivial cases → extract to `src/hooks/`

```ts
// ❌ Bad — inline logic in JSX
<div>{layouts.filter(l => !l.requiresThumbCluster).sort((a,b) => a.stats.sfbPct - b.stats.sfbPct).map(l => <Card key={l.id} layout={l} />)}</div>

// ✅ Good — extracted
const standardLayouts = filterStandardLayouts(layouts);
const sortedBySfb = sortByStat(standardLayouts, 'sfbPct');
return <div>{sortedBySfb.map(l => <Card key={l.id} layout={l} />)}</div>;
```

## Architecture Patterns

### Controller Pattern (primary pattern for complex components)
Split components with non-trivial logic into two files:
- `MyComponent.controller.ts` — all state, hooks, derived values, handlers; returns a typed object
- `MyComponent.tsx` — pure presentation; receives controller output, no business logic

```ts
// LayoutBrowser.controller.ts
export interface LayoutBrowserController {
  filtered: Layout[];
  query: string;
  sortKey: SortKey;
  handleQueryChange: (q: string) => void;
  handleSortChange: (key: SortKey) => void;
}

export function useLayoutBrowserController(layouts: Layout[]): LayoutBrowserController {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('sfbPct');

  const filtered = useMemo(() => filterAndSort(layouts, query, sortKey), [layouts, query, sortKey]);

  const handleQueryChange = useCallback((q: string) => setQuery(q), []);
  const handleSortChange = useCallback((key: SortKey) => setSortKey(key), []);

  return { filtered, query, sortKey, handleQueryChange, handleSortChange };
}

// LayoutBrowser.tsx
export function LayoutBrowser({ layouts }: LayoutBrowserProps) {
  const ctrl = useLayoutBrowserController(layouts);
  return ( /* pure JSX using ctrl.* — no logic here */ );
}
```

**When to use the Controller pattern:**
- Component has ≥2 pieces of state
- Component has event handlers with non-trivial logic
- Component derives computed values from props/state

**When to use a plain custom hook instead:**
- Logic is reusable across multiple components (e.g. `useTimer`, `useMediaQuery`)
- Logic is simple enough that a controller file would be overkill

**When to use Context + Reducer:**
- State must be shared across pages (e.g. test results flowing from TestPage → ResultsPage)
- Use `src/context/TestResultsContext.tsx` with `useReducer`

### File naming
- `ComponentName.controller.ts` — controller hook (no JSX)
- `ComponentName.tsx` — view (imports controller, returns JSX)
- `useXxx.ts` in `src/hooks/` — reusable hooks not tied to a single component

### Components where Controller pattern is required
`TestStream`, `LayoutBrowser`, `LayoutComparison`, `ResultsPage`, `LayoutDetail`



## TypeScript
- Strict mode; no `any`
- Use `as const` for static lookup objects (fingerColors, columnarOffsets)
- Discriminated unions for state machines (test status: `'idle'|'running'|'error'|'complete'`)
- Pure functions for all scoring/normalization logic — no side effects

## Tailwind
- Dark mode via `class` strategy (`dark:` variants required on all colored elements)
- No inline `style={}` except for SVG geometry (x, y, width, height)
- Finger colors: use `fill-*` classes, not hex values
- Extract repeated class strings to a named `const` rather than duplicating

## SVG Keyboards
- Always use `viewBox`, never fixed pixel width
- Home row keys get `ring-2 ring-white/40` to distinguish them
- Thumb keys rendered below bottom row
- Key geometry calculations (x, y, width offsets) in a dedicated `getKeyPosition()` helper

## Routing
- React Router v6 with `createBrowserRouter`
- `/results` is a guarded route — redirect to `/test/run` if no results in state

