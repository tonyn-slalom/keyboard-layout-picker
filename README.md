# Keyboard Layout Picker

> Find the keyboard layout that fits *your* fingers — not someone else's benchmark.

A React app that runs a short (~3.5 min) typing test disguised as natural pseudowords, measures your comfort across 12 finger-motion categories, and recommends the top 5 keyboard layouts from a database of 41 optimized layouts.

---

## How It Works

1. **Browse** — explore all 41 layouts with SVG keyboard visualizations (ANSI, ortho, columnar), stats, and a direct link to the Cyanophage playground
2. **Test** — type 101 short sequences (MonkeyType-style, 6 chars each) that invisibly isolate each motion category:

   | Category | What it measures |
   |----------|-----------------|
   | `alt` | Hand alternation comfort |
   | `rollIn` / `rollOut` | Inward and outward finger rolls |
   | `sfbStrong` | Same-finger bigrams on index/middle |
   | `sfbWeak` | Same-finger bigrams on ring/pinky |
   | `lsb` | Lateral stretch bigrams |
   | `scissorsCenter` | Top↔bottom row jumps (center fingers) |
   | `scissorsPinky` | Top↔bottom row jumps (pinky involved) |
   | `redirect` | Direction-reversing same-hand runs |
   | `pinky` | Off-home-row pinky use |
   | `skipBigram` | Same-finger skip bigrams |
   | `thumbAlt` | Thumb cluster alternation |

3. **Results** — a radar chart of your comfort profile + top-5 layout cards with match %, key reasons, and a QWERTY-similarity toggle

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite |
| Styling | Tailwind CSS v4 (dark mode via `class`) |
| Charts | Recharts |
| Routing | React Router v6 |
| Testing | Vitest + React Testing Library |
| Data | Local `src/data/layouts.json` (no API) |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
git clone https://github.com/tonyn-slalom/keyboard-layout-picker.git
cd keyboard-layout-picker
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Other commands

```bash
npm run build      # Production build
npm run preview    # Preview production build locally
npm test           # Run Vitest unit tests (watch mode)
npm run test:run   # Run tests once (CI mode)
```

---

## Project Structure

```
src/
├── context/
│   └── TestResultsContext.tsx      # useReducer — shares test results across pages
├── components/
│   ├── KeyboardViz/                # SVG keyboard (ANSI / ortho / columnar)
│   ├── LayoutBrowser/              # Browse, search, sort, compare layouts
│   │   ├── LayoutBrowser.controller.ts
│   │   ├── LayoutBrowser.tsx
│   │   ├── LayoutCard.tsx
│   │   ├── LayoutDetail.tsx
│   │   └── LayoutComparison.tsx
│   ├── TypingTest/
│   │   ├── TestStream.controller.ts
│   │   ├── TestStream.tsx
│   │   └── WordDisplay.tsx
│   └── Results/
│       ├── RadarChart.tsx
│       └── RecommendationCard.tsx
├── data/
│   └── layouts.json                # 41 layouts with full stats
├── hooks/
│   └── useTimer.ts
├── pages/
│   ├── HomePage.tsx
│   ├── BrowsePage.tsx
│   ├── TestPage.tsx
│   ├── ResultsPage.controller.ts
│   └── ResultsPage.tsx
├── utils/
│   ├── fingerMap.ts                # QWERTY char → finger/hand/row
│   ├── sequences.ts                # 101 test sequences
│   ├── scoring.ts                  # Layout compatibility scoring
│   ├── normalizer.ts               # median(), minMaxNorm()
│   └── qwertySimilarity.ts
├── types.ts                        # Single source of truth for all interfaces
└── __tests__/
    ├── utils/                      # scoring, normalizer, sequences, qwertySimilarity
    └── controllers/                # LayoutBrowser + TestStream controller tests
```

---

## Development Workflow

### Architecture: Controller + View Pattern

Complex components are split into two files:

```
ComponentName.controller.ts   ← useComponentNameController() — all state, hooks, handlers
ComponentName.tsx             ← pure JSX, receives controller output, no business logic
```

This makes the view trivially restyable and the controller testable without mounting.

### Adding a new component

1. Create `ComponentName/` folder
2. If it has ≥2 state pieces: create `ComponentName.controller.ts` first, export `useComponentNameController()`
3. Create `ComponentName.tsx`, import the controller
4. Import all types from `src/types.ts` — never redefine locally
5. Add a test in `src/__tests__/controllers/` if it has a controller

### Adding a new layout

Edit `src/data/layouts.json` — every entry must conform to the `Layout` interface in `src/types.ts`:

```jsonc
{
  "id": "my-layout",
  "name": "My Layout",
  "source": "https://...",
  "cyanophageRef": "my-layout",
  "keys": "qwfpbjluy;arstgmneio'zxcdvkh,./",  // exactly 30 chars, row-major
  "formFactors": ["ansi"],
  "requiresThumbCluster": false,
  "stats": {
    "sfbPct": 0.68,
    "skipBigramPct": 5.4,
    "lsbPct": 1.1,
    "scissorsPct": 0.3,
    "altPct": 37.2,
    "rollInPct": 21.3,
    "rollOutPct": 15.8,
    "redirectPct": 8.1,
    "weakRedirectPct": 2.1,
    "offHomePinkyPct": 2.3
  }
}
```

Stats should be fetched from [cyanophage.github.io](https://cyanophage.github.io).

---

## AI Agent Workflow

This project uses **GitHub Copilot custom agents** in VS Code to assist with each phase of the build. The agents live in `.github/agents/` and are auto-discovered by VS Code Copilot Chat.

### Available Agents

| Agent | File | Purpose |
|-------|------|---------|
| **KLP Builder** | `klp-builder.agent.md` | Orchestrates the full build across all phases; reads `BUILD_STATE.md` to resume from the correct phase |
| **KLP Layout Data** | `klp-data.agent.md` | Populates `layouts.json` for all 41 layouts by fetching stats live from cyanophage.github.io |
| **KLP Sequences** | `klp-sequences.agent.md` | Designs the 101 pseudoword test sequences across 12 motion categories |
| **KLP Components** | `klp-components.agent.md` | Builds all React components and pages using the Controller pattern |
| **KLP Scoring** | `klp-scoring.agent.md` | Implements the scoring engine, normalizers, radar chart, and results page |

### How to use agents in VS Code

1. Open **GitHub Copilot Chat** (`Ctrl/Cmd + Shift + I`)
2. Click the agent picker (the `@` icon or model selector)
3. Select the agent you want (e.g. `KLP Builder`)
4. Type your instruction, e.g.:
   - `"Build Phase 0 — scaffold the project"`
   - `"Populate layouts.json for the first 10 standard layouts"`
   - `"Write the normalizer.ts utility with tests"`

> **Tip**: Always start with `KLP Builder` — it reads `BUILD_STATE.md` and tells you exactly which phase to run next.

### Build State

`.github/BUILD_STATE.md` tracks phase progress. After each phase completes (and `npm run build` passes), the builder agent updates this file. If a session is interrupted, starting a new session and invoking `KLP Builder` will resume from the last completed phase.

---

## Instructions & Conventions

Auto-loaded instructions live in `.github/instructions/` and apply automatically when you edit matching files:

| File | Applies to | What it enforces |
|------|-----------|-----------------|
| `klp-react-conventions.instructions.md` | `src/**/*.{ts,tsx}` | Controller pattern, extracted functions, Tailwind conventions, testing patterns |
| `klp-types.instructions.md` | `src/**/*.{ts,tsx}` | Canonical TypeScript interfaces — import from `src/types.ts`, never redefine |

Project-wide context is in `.github/copilot-instructions.md` (always loaded).

---

## Scripts

| Script | Location | Purpose |
|--------|----------|---------|
| `validate-ts.sh` | `.github/scripts/` | PostToolUse hook — runs `tsc --noEmit` after every `.ts/.tsx` file edit; blocks the agent if TypeScript errors are found |

The validation script is automatically invoked by the `KLP Builder` agent's `PostToolUse` hook. It only runs if `tsconfig.json` exists (i.e. after Phase 0 scaffold). You can also run it manually:

```bash
bash .github/scripts/validate-ts.sh
```

---

## Scoring Algorithm (brief)

1. **Per-category composite score** — for each of 12 motion categories, compute `0.6 × wpmScore + 0.4 × accuracyScore` (median-based, normalized across all categories)
2. **Layout compatibility score** — for each of 41 layouts, multiply user comfort scores against the layout's normalized stats (positive categories rewarded, negative categories penalized)
3. **QWERTY similarity toggle** — optionally blend in `0.2 × QWERTYOverlap` for easier transition
4. **Rank** — top 5 by final score; tie-break by lowest `sfbPct`

See `src/utils/scoring.ts` for the full implementation.

---

## Contributing

1. Branch from `main`: `git checkout -b feat/your-feature`
2. Follow the [Controller pattern](#architecture-controller--view-pattern) for new components
3. All pure utility functions require unit tests in `src/__tests__/utils/`
4. Run `npm test` and `npm run build` before opening a PR
5. PR into `main`
