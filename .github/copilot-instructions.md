# Keyboard Layout Picker — Project Instructions

## Stack
- **Vite + React + TypeScript** (strict mode)
- **Tailwind CSS** for styling — no inline styles, no CSS modules
- **Recharts** for radar/stat charts
- **React Router v6** for routing
- **Vitest + React Testing Library** for unit tests
- **No external data fetching** — all layout data is local JSON

## Project Structure
```
src/
  context/TestResultsContext.tsx        ← useReducer global state for test results
  data/layouts.json
  components/
    KeyboardViz/                        ← Key, AnsiLayout, OrthoLayout, ColumnarLayout, KeyboardViz
    LayoutBrowser/                      ← LayoutBrowser.controller.ts + LayoutBrowser.tsx + LayoutCard, LayoutDetail, LayoutComparison
    TypingTest/                         ← TestStream.controller.ts + TestStream.tsx + WordDisplay
    Results/                            ← RadarChart, RecommendationCard
  utils/fingerMap.ts  sequences.ts  scoring.ts  normalizer.ts  qwertySimilarity.ts
  hooks/useTimer.ts
  pages/HomePage.tsx  BrowsePage.tsx  TestPage.tsx  ResultsPage.controller.ts  ResultsPage.tsx
  types.ts
  App.tsx  main.tsx
src/__tests__/utils/                    ← scoring, normalizer, qwertySimilarity, sequences tests
src/__tests__/controllers/             ← controller hook tests (renderHook)
```

## Conventions
- Functional components only, no class components
- All component props typed with explicit `interface` (no `type` aliases for props)
- Named exports everywhere (no default exports except page components)
- Tailwind dark mode via `class` strategy — all UI supports dark mode
- `fingerMap` keys use lowercase characters
- Layout `keys` field = 30-char row-major string: top→home→bottom, L→R

## Code Style — Functions over Inline
- Extract any logic block > 3 lines into a named function
- No inline logic in JSX `return` — extract to named variables/functions above `return`
- Business logic handlers extracted to named functions, not anonymous inline arrows
- Utility functions in `src/utils/`, stateful logic in `src/hooks/`
- Pure functions for all scoring/normalization — no side effects

## Architecture Pattern — Controller + View
- Complex components (≥2 state pieces or non-trivial handlers) use the Controller pattern:
  - `Component.controller.ts` — `useComponentController()` hook returns typed object with all state/handlers
  - `Component.tsx` — pure JSX, calls `useComponentController()`, no business logic
- Required for: `TestStream`, `LayoutBrowser`, `LayoutComparison`, `ResultsPage`, `LayoutDetail`
- Global cross-page state (test results) via `Context + useReducer` in `src/context/`

## Key Domain Types
```ts
// Finger indices: 0=LP, 1=LR, 2=LM, 3=LI, 4=LII, 5=RII, 6=RI, 7=RM, 8=RR, 9=RP, 10=LThumb, 11=RThumb
// Hand: 'L' | 'R' | 'LT' | 'RT'
// Row: 'top' | 'home' | 'bottom' | 'thumb'
// CategoryId: 'alt'|'rollIn'|'rollOut'|'sfb'|'lsb'|'scissors'|'redirect'|'pinky'|'skipBigram'|'thumbAlt'
```

## Layout Recommendation Logic
- **12 categories**: sfb and scissors split by finger strength for higher accuracy
- Positive: `alt`, `rollIn`, `rollOut`, `thumbAlt`
- Negative: `sfbStrong` (index/middle), `sfbWeak` (ring/pinky), `lsb`, `scissorsCenter`, `scissorsPinky`, `redirect`, `pinky`, `skipBigram`
- Per-category score = 0.6×wpmScore + 0.4×accuracyScore (median-based, normalized across all 12)
- layoutScore = sum of (user_score × normalized_stat) for positive, (1-user_score) × (1-norm_stat) for negative
- sfb stat maps to average of sfbStrong+sfbWeak user scores weighted by finger frequency; scissors maps similarly
- Tie-break by lowest sfbPct; QWERTY similarity toggle (0.8×layout + 0.2×similarity)
- Test pool: 96 scored (12×8) + 5 warmup = 101 sequences total (~3.5 min)
