# Keyboard Layout Picker — React App Plan

> Last updated to reflect all design decisions as of planning phase.
> See `.github/agents/` for agent specs, `.github/instructions/` for code conventions.

## Problem
Build a React app that:
1. Lets users search & browse 41 keyboard layouts (data from cyanophage.github.io, stored locally)
2. Runs a MonkeyType-style typing test (~3.5 min, 101 sequences) to assess finger-motion comfort across **12 categories**
3. Recommends top-5 layouts based on objective speed + accuracy metrics

---

## Tech Stack
- **Vite + React + TypeScript** (strict mode)
- **Tailwind CSS v4** (styling, dark mode via `class`)
- **Recharts** (12-axis radar chart)
- **React Router v6** (pages)
- **Vitest + React Testing Library** (unit tests)
- **Local JSON** for layout data (no external API)

---

## Architecture

### Project Structure
```
src/
  context/TestResultsContext.tsx        ← useReducer — shares results across pages
  data/layouts.json                     ← 41 layouts with full stats
  components/
    KeyboardViz/                        ← Key, AnsiLayout, OrthoLayout, ColumnarLayout, KeyboardViz
    LayoutBrowser/                      ← LayoutBrowser.controller.ts + .tsx, LayoutCard, LayoutDetail, LayoutComparison
    TypingTest/                         ← TestStream.controller.ts + .tsx, WordDisplay
    Results/                            ← RadarChart, RecommendationCard
  utils/
    fingerMap.ts                        ← QWERTY char → {finger, hand, row}
    sequences.ts                        ← 101 test sequences (12 categories × 8 + 5 warmup)
    scoring.ts                          ← composite score + layout compatibility score
    normalizer.ts                       ← median(), minMaxNorm(), normalizeAcrossLayouts()
    qwertySimilarity.ts                 ← key-position overlap vs QWERTY
  hooks/useTimer.ts
  pages/
    HomePage.tsx
    BrowsePage.tsx
    TestPage.tsx
    ResultsPage.controller.ts
    ResultsPage.tsx
  types.ts                              ← single source of truth for all interfaces
  __tests__/utils/                      ← scoring, normalizer, sequences, qwertySimilarity
  __tests__/controllers/               ← LayoutBrowser + TestStream controller tests
```

### Architecture Patterns
- **Controller + View**: complex components split into `Component.controller.ts` (all state/logic, returns typed object) + `Component.tsx` (pure JSX). Required for: `TestStream`, `LayoutBrowser`, `LayoutComparison`, `ResultsPage`, `LayoutDetail`.
- **Context + Reducer**: `TestResultsContext` shares test results from `TestPage` → `ResultsPage`
- **Extracted functions**: no inline logic in JSX `return`; utility functions in `src/utils/`

---

## Layout Database (`layouts.json`)

### Schema (see `src/types.ts` for authoritative interfaces)
```ts
interface LayoutStats {
  // From cyanophage table (authoritative — fetched from table.html)
  sfbPct:            number;  // "sfb" column
  skipBigramPct:     number;  // "sfb 2u" column
  lsbPct:            number;  // "lat stretch" column
  scissorsPct:       number;  // "scissors" column (total)
  pinkyScissorsPct:  number;  // "pinky scissors" column — direct, no estimation
  altPct:            number;  // "trigram alt" column
  rollInPct:         number;  // "roll in" column
  rollOutPct:        number;  // "roll out" column
  redirectPct:       number;  // "tri redirect" column
  weakRedirectPct:   number;  // from playground (not in table); -1 if unavailable
  offHomePinkyPct:   number;  // "pinky off home" column — direct, no estimation
  effort:            number;  // "effort" column (for display/sorting)
  distance:          number;  // "distance" column (for display/sorting)
  thumbAltPct?:      number;  // thumb-cluster layouts only

  // Derived (our cross-check, stored alongside cyanophage values)
  _derivedOffHomePinkyPct?:   number;  // computed from letter frequencies + keymap
  _derivedPinkyScissorsPct?:  number;  // computed from fingerMap analysis
  _dataSource:                'cyanophage' | 'derived' | 'mixed';
  // 'mixed' = |cyanophage - derived| / cyanophage > 20% for any checked stat
  _notes?:                    string;  // discrepancy or data quality notes
}
```

**Why both cyanophage + derived?**
cyanophage uses a fixed English corpus — our derived calculation uses the same approach, giving us a sanity check. If they diverge >20%, the layout's keymap encoding may be wrong or the corpus differs. The scoring engine always uses cyanophage values; derived values are for validation only.

### 41 Layouts
**Standard (30)**: QWERTY, Dvorak, Colemak, Colemak-DH, Graphite, Gallium, Canary, APT v3, Hands Down Neu, Sturdy, Engram, Carbyne, Really?, Whorf, Northstar, Semimak, MTGAP, CTGAP, Recurva, Halmak, Workman, Nerps, Focal, ISRT, IRST, Hyperroll, Pine v1, Pine v4, Beakl19bis, Night

**Thumb Cluster (11)**: Maltron, RSTHD, DSTHK, APTmak, Caster, HD Vibranium, HD Promethium, SNTH, Sunlight, Nordrassil, Enthium

Stats fetched live from [cyanophage.github.io](https://cyanophage.github.io) — never invented.

---

## Typing Test

### 12 Motion Categories
| Category | ID | Positive/Negative | What it isolates |
|----------|----|-------------------|-----------------|
| Hand alternation | `alt` | ✅ positive | Strict L/R key switches |
| Inward roll | `rollIn` | ✅ positive | Same-hand pinky→index runs |
| Outward roll | `rollOut` | ✅ positive | Same-hand index→pinky runs |
| Thumb alternation | `thumbAlt` | ✅ positive | Finger key → space (thumb) |
| SFB strong fingers | `sfbStrong` | ❌ negative | Same-finger bigrams: index/middle |
| SFB weak fingers | `sfbWeak` | ❌ negative | Same-finger bigrams: ring/pinky |
| Lateral stretch | `lsb` | ❌ negative | Index/middle stretch ≥2 cols |
| Scissors (center) | `scissorsCenter` | ❌ negative | Top↔bottom row jump, no pinky |
| Scissors (pinky) | `scissorsPinky` | ❌ negative | Top↔bottom row jump, pinky involved |
| Redirect | `redirect` | ❌ negative | Same-hand direction reversal |
| Off-home pinky | `pinky` | ❌ negative | Pinky on Q, Z, P, / |
| Skip bigram | `skipBigram` | ❌ negative | Same finger, one key skipped (2u) |

**Why sfb and scissors are split**: ring/pinky SFBs are ~2× more disruptive than index SFBs; pinky scissors are a distinct ergonomic burden. This lets the scoring engine weight them independently.

### Sequence Pool
- **101 total**: 12 categories × 8 sequences = **96 scored** + **5 warmup**
- All sequences are **exactly 6 characters** (thumbAlt includes one space)
- All look like **natural pseudowords** — no obvious repeated patterns; user cannot identify the category
- Warmup sequences discarded from scoring

### QWERTY Finger Map
Used on the QWERTY keyboard (test input device) to detect which finger types each key:
```
Fingers: 0=LP, 1=LR, 2=LM, 3=LI, 4=LII(inner), 5=RII, 6=RI, 7=RM, 8=RR, 9=RP, 10=LThumb, 11=RThumb
```

### Test Runner State Machine
```
IDLE → RUNNING → ERROR → RUNNING → COMPLETE
```
- Correct char: advance cursor
- Wrong char: ERROR (word shakes, cursor resets to word start; any key → resume)
- All 101 done: COMPLETE → auto-navigate to /results
- ThumbMode sequences: space is a required character, NOT a word separator

### Test UI (MonkeyType-style)
- 3 rows visible: previous (dim) / current (active cursor) / next (dim)
- Per-char: neutral (untyped) / green (correct) / red (wrong)
- Progress bar: sequences done / 101
- No category labels shown during test

---

## Scoring Algorithm

### Step 1 — Per-Category Composite Score
```
medianWpm   = median(wpm for category's 8 sequences)
medianErrors = median(errorCount for category's 8 sequences)

wpmScore      = minMaxNorm(medianWpm,    min across 12 cats, max across 12 cats)
accuracyScore = 1 - minMaxNorm(medianErrors, min, max)

compositeScore = 0.6 × wpmScore + 0.4 × accuracyScore   ∈ [0, 1]
```
WPM weighted higher because restarts already inflate time cost of errors.

### Step 2 — Layout Compatibility Score
```
layoutScore = (
  // Positive: user comfort × normalized layout stat
  profile.alt       × norm(altPct)
  profile.rollIn    × norm(rollInPct)
  profile.rollOut   × norm(rollOutPct)
  profile.thumbAlt  × norm(thumbAltPct ?? 0)
  // Negative: user intolerance × inverted layout stat
  (1-profile.sfbStrong)      × (1 - norm(sfbPct))             ← same stat as sfbWeak
  (1-profile.sfbWeak)        × (1 - norm(sfbPct))             ← double-weights SFB avoidance
  (1-profile.lsb)            × (1 - norm(lsbPct))
  (1-profile.scissorsCenter) × (1 - norm(scissorsPct - pinkyScissorsPct))  ← center only
  (1-profile.scissorsPinky)  × (1 - norm(pinkyScissorsPct))  ← direct from cyanophage table
  (1-profile.redirect)       × (1 - norm(0.7×redirectPct + 0.3×weakRedirectPct))
  (1-profile.pinky)          × (1 - norm(offHomePinkyPct))   ← direct from cyanophage table
  (1-profile.skipBigram)     × (1 - norm(skipBigramPct))
) / 12
```

### Step 3 — QWERTY Similarity (optional toggle)
```
qwertySimilarity = (keys in same position as QWERTY) / 30
finalScore = qwertyBoost ? 0.8 × layoutScore + 0.2 × qwertySimilarity : layoutScore
```

### Step 4 — Ranking
Top 5 by `finalScore`; tie-break (within 0.01) by lowest `sfbPct`.

---

## App Routes

```
/ (Home)
├── /browse          ← Layout Browser (search, sort, filter)
│   └── /browse/:id  ← Layout Detail (viz + stats + Cyanophage link)
├── /test/run        ← Typing Test Stream → auto-navigates to /results on complete
└── /results         ← Results (12-axis radar + top-5 cards) ← GUARDED: redirects to /test/run if no results
```

---

## Build Phases

| Phase | What | Key output |
|-------|------|-----------|
| 0 | Scaffold + Vitest setup | Vite project, all deps, `src/` skeleton |
| 0.5 | Canonical types | `src/types.ts` |
| 1 | Layout data | `src/data/layouts.json` (41 layouts, stats from cyanophage) |
| 2 | Finger map + sequences | `fingerMap.ts`, `sequences.ts` (101 sequences) |
| 3 | Scoring utils + tests | `scoring.ts`, `normalizer.ts`, `qwertySimilarity.ts` + unit tests |
| 3.5 | Sequence validation tests | `sequences.test.ts` (validates all 101) |
| 4 | Components + controller tests | All components/pages + controller hook tests |
| 5 | Results UI | `RadarChart`, `RecommendationCard`, `ResultsPage` |
| 6 | Routing + polish | `App.tsx`, nav bar, guarded routes, dark mode, homepage |

Phase tracking and resumption: see `.github/BUILD_STATE.md`.

