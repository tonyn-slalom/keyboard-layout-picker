# Keyboard Layout Picker — React App Plan

## Problem
Build a React app that:
1. Lets users search & browse keyboard layouts (data from cyanophage.github.io, stored locally)
2. Runs a MonkeyType-style typing test (QWERTY baseline) to assess finger-motion comfort
3. Recommends top-5 layouts based on the user's test results

---

## Tech Stack
- **Vite + React + TypeScript**
- **Tailwind CSS** (styling)
- **Recharts** (radar chart, stat charts)
- **React Router v6** (pages)
- **Local JSON** for layout data (no external API)

---

## Detailed Architecture

```
src/
  data/
    layouts.json              ← ~25 layouts with keys + stats
  components/
    KeyboardViz/
      KeyboardViz.tsx         ← dispatcher: picks form factor
      AnsiLayout.tsx          ← ANSI stagger key positions
      OrthoLayout.tsx         ← ortholinear grid
      ColumnarLayout.tsx      ← columnar-stagger (Dactyl/Kyria style)
      Key.tsx                 ← single SVG key element
    LayoutBrowser/
      LayoutBrowser.tsx       ← search + sort + list
      LayoutCard.tsx          ← compact card in browser
      LayoutDetail.tsx        ← expanded: viz + stats + Cyanophage link
      LayoutComparison.tsx    ← side-by-side stat table + overlay radar
    TypingTest/
      TestStream.tsx          ← MonkeyType-style word stream UI
      WordDisplay.tsx         ← current word with per-letter highlight
    RatingScreen/
      RatingScreen.tsx        ← post-test: rate all 8 categories at once
      CategoryPreview.tsx     ← shows 2 example sequences per category
    Results/
      RadarChart.tsx          ← comfort profile spider chart (Recharts)
      RecommendationCard.tsx  ← top-5 layout cards
  utils/
    fingerMap.ts              ← QWERTY: key → {finger, hand, row}
    sequences.ts              ← sequence pool per category + metadata
    validateSequence.ts       ← checks each sequence isolates one motion type (≥70% purity)
    scoring.ts                ← compositeScore + layoutScoring
    normalizer.ts             ← min-max normalization + median helpers
    qwertySimilarity.ts       ← computes key-position overlap with QWERTY
  hooks/
    useTypingTest.ts          ← test state machine
    useTimer.ts               ← per-word elapsed-ms tracking
  pages/
    HomePage.tsx
    BrowsePage.tsx
    TestPage.tsx
    ResultsPage.tsx
  App.tsx
  main.tsx
```

---

## Phase 1 — Layout Database (`layouts.json`)

### Full Schema Per Layout
```ts
interface Layout {
  id: string;                   // "colemak-dh"
  name: string;                 // "Colemak-DH"
  source: string;               // URL to creator page
  cyanophageRef: string;        // URL param string used by Cyanophage playground
  keys: string;                 // 30-char row-major string: top→home→bottom row, L→R
                                // e.g. "qwfpbjluy;arstgmneio'zxcdvkh,./"
  formFactors: ('ansi'|'ortho'|'columnar')[];  // which form factors make sense
  thumbKeys?: {                 // present only for thumb-cluster layouts
    left?: string[];            // characters on left thumb key(s), e.g. ["e"]
    right?: string[];           // characters on right thumb key(s), e.g. [" "]
  };
  stats: {
    sfbPct: number;             // same-finger bigrams %
    skipBigramPct: number;      // skip bigrams (2u) %
    lsbPct: number;             // lateral stretch bigrams %
    scissorsPct: number;        // scissors %
    altPct: number;             // hand alternation % (includes thumb alternation for thumb layouts)
    rollInPct: number;          // inward rolls %
    rollOutPct: number;         // outward rolls %
    redirectPct: number;        // redirects %
    weakRedirectPct: number;    // weak redirects %
    offHomePinkyPct: number;    // estimated pinky-off-home-row usage %
    thumbAltPct?: number;       // % of keystrokes involving thumb key (thumb layouts only)
  };
  requiresThumbCluster: boolean; // true for Hands Down, RSTHD, etc.
}
```

### All 41 Layouts (exact match to cyanophage.github.io)

Standard layouts (no thumb cluster):
| Layout | ID | Notes |
|--------|----|-------|
| QWERTY | `qwerty` | Baseline |
| Dvorak | `dvorak` | Classic alt |
| Colemak | `colemak` | Popular alt |
| Colemak-DH | `colemak-dh` | Most popular modern alt |
| Graphite | `graphite` | Low SFB, high alt |
| Gallium | `gallium` | Low SFB |
| Canary | `canary` | High rolls |
| APT v3 | `aptV3` | Low redirect |
| Hands Down Neu | `handsdown-neu` | Columnar-optimized |
| Sturdy | `sturdy` | Balanced |
| Engram | `engram` | Comfort-focused |
| Carbyne | `carbyne` | Low LSB |
| Really? | `really?` | High rolls |
| Whorf | `whorf` | Low SFB |
| Northstar | `northstar` | High alt |
| Semimak | `semimak` | Low redirect |
| MTGAP | `mtgap` | Max alt |
| CTGAP | `ctgap` | Balanced |
| Recurva | `recurva` | Roll-focused |
| Halmak | `halmak` | High alt |
| Workman | `workman` | QWERTY-like improvement |
| Nerps | `nerps` | Low SFB+LSB |
| Focal | `focal` | High alt |
| ISRT | `isrt` | Balanced redirect |
| IRST | `irst` | ISRT variant |
| Hyperroll | `hyperroll` | Max rolls |
| Pine v1 | `pine-v1` | High roll |
| Pine v4 | `pine-v4` | High roll variant |
| Beakl19bis | `beakl19bis` | High alt |
| Night | `night` | High alt |

Thumb cluster layouts (`requiresThumbCluster: true`):
| Layout | ID | Notes |
|--------|----|-------|
| Maltron | `maltron` | Classic ergonomic, `e` on thumb |
| RSTHD | `rsthd` | `e` on thumb |
| DSTHK | `dsthk` | Low SFB, thumb cluster |
| APTmak | `aptmak` | APT for thumb cluster |
| Caster | `caster` | Low effort, thumb cluster |
| HD Vibranium | `hd-vibranium` | Hands Down variant |
| HD Promethium | `hd-promethium` | Hands Down variant |
| SNTH | `snth` | High alt, thumb cluster |
| Sunlight | `sunlight` | Low SFB, thumb cluster |
| Nordrassil | `nordrassil` | Max alt, thumb cluster |
| Enthium | `enthium` | Low SFB, thumb cluster |

### `offHomePinkyPct` Derivation
Since Cyanophage doesn't surface this directly, estimate it per layout:
- Identify which keys fall on pinky columns (col 0 and col 9 in the 10-col layout)
- For each layout, top-row and bottom-row pinky keys have an estimated frequency (from a standard English frequency corpus stored inline)
- `offHomePinkyPct` = sum of frequencies of non-home pinky keys / total keystrokes

---

## Phase 2 — Layout Browser

### Search & Sort
- Fuzzy name search (filter as-you-type)
- Sort buttons: SFB%, LSB%, Effort, Alt%, Rolls%, Redirects%
- Sort direction toggle (asc/desc)

### Keyboard SVG Visualizer (`KeyboardViz`)

#### Form Factors (toggle button on each layout view)
| Form Factor | Description |
|-------------|-------------|
| **ANSI** | Standard row-stagger. Row 1: 0.5u left offset, Row 2: 0.25u left offset, Row 3: none |
| **Ortholinear** | 3 rows × 10 cols, perfect grid, no stagger |
| **Columnar-stagger** | Each column has a vertical offset (simulates Kyria/Dactyl ergonomic boards) |

Column vertical offsets for columnar-stagger (in key units, relative to home row):
- Pinky: +0.5 (up)
- Ring: +0.25
- Middle: 0 (baseline)
- Index: +0.125
- Inner index: +0.25

#### Key coloring
- 12 colors: one per finger (LP, LR, LM, LI, LII, RII, RI, RM, RR, RP) + **left thumb** + **right thumb**
- Thumb keys rendered as a wide key below the bottom row in all form factors
- Left thumb half = left thumb color, right thumb half = right thumb color
- For thumb-cluster layouts: show one or two discrete thumb keys instead of a spacebar
- Badge: layouts with `requiresThumbCluster: true` show a 🦾 badge and tooltip: "Optimized for keyboards with thumb cluster keys"
- Home row keys have a subtle border glow to distinguish them
- Hovered key: highlight with tooltip showing character + finger name

#### Key Display
- Default: show character label
- Option: show character + finger number overlay

### Comparison Mode (`LayoutComparison`)
Activated by "Compare" button when a layout is open → select a second layout.
- **Side-by-side stat table**: all stats from both layouts, diff column (+/- highlighted red/green)
- **Overlay radar chart**: two semitransparent polygons on same radar axes

---

## Phase 3 — Typing Test

### QWERTY Finger Map (`fingerMap.ts`)
```ts
// fingerMap[key] = { finger: 0-11, hand: 'L'|'R'|'LT'|'RT', row: 'top'|'home'|'bottom'|'thumb' }
// Fingers: 0=LP, 1=LR, 2=LM, 3=LI, 4=LII (inner), 5=RII, 6=RI, 7=RM, 8=RR, 9=RP
//          10=LThumb, 11=RThumb
const fingerMap = {
  q:{finger:0,hand:'L',row:'top'},  w:{finger:1,hand:'L',row:'top'},
  e:{finger:2,hand:'L',row:'top'},  r:{finger:3,hand:'L',row:'top'},
  t:{finger:4,hand:'L',row:'top'},  y:{finger:5,hand:'R',row:'top'},
  u:{finger:6,hand:'R',row:'top'},  i:{finger:7,hand:'R',row:'top'},
  o:{finger:8,hand:'R',row:'top'},  p:{finger:9,hand:'R',row:'top'},
  a:{finger:0,hand:'L',row:'home'}, s:{finger:1,hand:'L',row:'home'},
  d:{finger:2,hand:'L',row:'home'}, f:{finger:3,hand:'L',row:'home'},
  g:{finger:4,hand:'L',row:'home'}, h:{finger:5,hand:'R',row:'home'},
  j:{finger:6,hand:'R',row:'home'}, k:{finger:7,hand:'R',row:'home'},
  l:{finger:8,hand:'R',row:'home'}, ';':{finger:9,hand:'R',row:'home'},
  z:{finger:0,hand:'L',row:'bot'},  x:{finger:1,hand:'L',row:'bot'},
  c:{finger:2,hand:'L',row:'bot'},  v:{finger:3,hand:'L',row:'bot'},
  b:{finger:4,hand:'L',row:'bot'},  n:{finger:5,hand:'R',row:'bot'},
  m:{finger:6,hand:'R',row:'bot'},  ',':{finger:7,hand:'R',row:'bot'},
  '.':{finger:8,hand:'R',row:'bot'},'/':{finger:9,hand:'R',row:'bot'},
  // Spacebar — left half = left thumb, right half = right thumb
  // In test sequences, space always means "thumb key press"
  // Left/right thumb cannot be validated; colored differently in viz
  ' ':{finger:10,hand:'LT',row:'thumb'}, // proxy; shown as both thumbs in viz
}
```

### Test Categories & Sequence Design

Each category has **8 sequences of equal length (6 chars each)**. The full pool (85 sequences including 5 warm-up) is **shuffled randomly** before the test begins. No category labels shown — to the user it simply looks like typing a stream of short words.

**ALL sequences are pseudowords** — they look like plausible natural text, never like obvious repeated patterns. The target motion type is embedded invisibly so the user types naturally without being primed to expect difficulty.

**Warm-up**: 5 sequences at the start are discarded from scoring. Drawn from mixed categories so warm-up doesn't tip off any specific pattern.

| Category | ID | What it isolates | Example pseudowords |
|----------|----|-----------------|---------------------|
| Hand Alternation | `alt` | Strict L/R/L/R key switches | `turish`, `yofend`, `sulaim` |
| Inward Roll | `rollIn` | Same hand pinky→index runs | `asdfry`, `uioplk` |
| Outward Roll | `rollOut` | Same hand index→pinky runs | `fdsaql`, `lkjuio` |
| SFBs | `sfb` | Same finger, different rows | `derede`, `lormed`, `ceboce` |
| LSBs | `lsb` | Lateral index/middle stretch | `finded`, `brinte`, `himnet` |
| Scissors | `scissors` | High-low row jump same hand | `girvel`, `nimcev`, `bimode` |
| Redirects | `redirect` | Same-hand direction reversal | `swords`, `oldfer`, `forsel` |
| Off-Home Pinky | `pinky` | Pinky on top/bottom rows | `quaple`, `zandop`, `prozen` |
| Skip Bigrams | `skipBigram` | Same finger, one key apart (2u) | `carven`, `nervid`, `curves` |
| Thumb Alternation | `thumbAlt` | Finger key → space (thumb) alternation | `do it`, `he ran` |

10 categories × 8 sequences = **80 scored sequences** + 5 warm-up = **85 total**.

> **Thumb sequences**: space is used mid-sequence as a thumb key press. Thumb sequences look like short two-word phrases (e.g. `do it`, `he ran`) — natural feeling, 6 chars including the space. The test runner must NOT treat embedded spaces as word separators.

#### Sequence Design Rules
- **All sequences are exactly 6 characters** — ensures WPM is directly comparable across categories
- **All look like plausible text** — no obvious `ababab` patterns; a user should not be able to identify the category being tested by looking at the sequence
- **Alt**: strictly alternates hands every key; constructed from common vowel/consonant pairs that naturally alternate (e.g. `t`=left, `u`=right, `r`=left, `i`=right)
- **InRoll**: natural-sounding runs where finger order is pinky→index on one hand (e.g. `asdf` for left hand)
- **OutRoll**: natural-sounding runs where finger order is index→pinky (e.g. `fdsa`)
- **SFB**: pseudoword containing the target same-finger bigram 2–3 times, surrounded by alternating-hand filler so it doesn't look repetitive (e.g. `derede` contains `de`+`ed` SFBs)
- **LSB**: pseudoword with the lateral-stretch bigram embedded naturally (e.g. `finded` contains `in` stretch)
- **Scissors**: pseudoword where the high/low row jump occurs at least twice (e.g. `girvel` has `ve`/`gi` scissor pairs)
- **Redirect**: pseudoword whose same-hand run changes direction at least once (e.g. `swords` = s→w→o left hand reversal)
- **Pinky**: pseudoword with 3+ characters on pinky columns Q/Z (left) or P/;/' (right), filler from other fingers
- **SkipBigram**: pseudoword using words like `carve`, `curve`, `nerve` where the skip pair (`r_v`, `r_n`) appears naturally
- **ThumbAlt**: short two-word phrase where the word boundary (space) acts as the thumb key; surrounding letters should ideally be on opposite hands from the space

#### Sequence Validation (`validateSequence.ts`)
Each sequence must pass automated checks before inclusion:
- Contains exactly 6 characters, all in the QWERTY fingerMap
- **Looks natural**: no more than 2 consecutive identical characters, no obvious `xyxyxy` patterns
- Primary motion type accounts for ≥60% of bigrams in the sequence (relaxed slightly to allow natural-looking pseudowords)
- No accidental SFBs in non-SFB sequences
- No accidental scissors in non-scissors sequences
- Cross-contamination score logged for debugging

### Test Runner State Machine (`useTypingTest.ts`)

```
IDLE ──[start]──► RUNNING
RUNNING ──[correct char]──► RUNNING (advance cursor)
RUNNING ──[wrong char]──► ERROR (flash red, reset word to start)
ERROR ──[any key]──► RUNNING (restart current word)
RUNNING ──[word complete]──► RUNNING (advance to next word, log time+errors)
RUNNING ──[all words done]──► COMPLETE
COMPLETE ──[view results]──► (navigate to /results)
```

### Test Runner UI (`TestStream.tsx`)
- 3 rows of sequences visible (MonkeyType layout):
  - Previous line (dimmed)
  - Current line (active, cursor visible)
  - Next line (dimmed)
- Per-letter colors: neutral (untyped), green (correct), red (wrong)
- On error: word shakes/flashes red, cursor resets to word start
- Progress bar: `sequences completed / total sequences`
- No category labels shown during test (so user isn't primed)

### Metrics Logged Per Sequence
```ts
interface SequenceResult {
  sequenceId: string;
  categoryId: CategoryId;
  sequence: string;
  isWarmup: boolean;          // if true, excluded from scoring
  completionMs: number;       // wall-clock ms from word start to word end
  charCount: number;          // always 6; used to verify WPM calculation
  errorCount: number;         // number of times word was reset
  wpm: number;                // (charCount/5) / (completionMs/60000)
}
```

---

## Phase 4 — Scoring & Recommendation Engine

### Per-Category Composite Score
Fully objective — speed and accuracy only. No subjective rating.
Uses **median** (not mean) to be robust against outlier attempts.

```
// Per category, compute median over 8 sequences (warm-ups excluded)

medianWpm_cat      = median(wpm values for category)
medianErrors_cat   = median(errorCount values for category)

// Normalize 0–1 using min-max across all 9 categories
wpmScore_cat      = (medianWpm_cat - minMedianWpm) / (maxMedianWpm - minMedianWpm)
accuracyScore_cat = 1 - (medianErrors_cat - minErrors) / (maxErrors - minErrors)

// Edge case: if all categories have equal wpm/errors, scores default to 0.5

compositeScore_cat = 0.6 × wpmScore_cat + 0.4 × accuracyScore_cat
```

WPM weighted slightly higher because restarts cost time, so slow WPM already captures most of the error penalty.

### Layout Compatibility Score
```
// Category → Layout stat mapping:
//   Positive categories (higher user score → favor higher stat):
//     alt         → altPct
//     rollIn      → rollInPct
//     rollOut     → rollOutPct
//   Negative categories (lower user score → favor lower stat):
//     sfb         → sfbPct
//     lsb         → lsbPct
//     scissors    → scissorsPct
//     redirect    → redirectPct  (weighted: 0.7 × redirect + 0.3 × weakRedirect)
//     pinky       → offHomePinkyPct
//     skipBigram  → skipBigramPct

// Normalize each stat across all ~25 layouts (0–1)

layoutScore(layout) =
  // Positive: user comfort × normalized stat
  + profile.alt         × norm(layout.altPct)
  + profile.rollIn      × norm(layout.rollInPct)
  + profile.rollOut     × norm(layout.rollOutPct)
  // Negative: user intolerance × inverted normalized stat
  + (1-profile.sfb)        × (1 - norm(layout.sfbPct))
  + (1-profile.lsb)        × (1 - norm(layout.lsbPct))
  + (1-profile.scissors)   × (1 - norm(layout.scissorsPct))
  + (1-profile.redirect)   × (1 - norm(0.7×layout.redirectPct + 0.3×layout.weakRedirectPct))
  + (1-profile.pinky)      × (1 - norm(layout.offHomePinkyPct))
  + (1-profile.skipBigram) × (1 - norm(layout.skipBigramPct))
  // Thumb alternation (only meaningful for thumb-cluster layouts)
  // For non-thumb layouts: thumbAltPct = 0, so this term contributes based purely on user thumbAlt score
  + profile.thumbAlt      × norm(layout.thumbAltPct ?? 0)
```

Scores are divided by 10 to normalize to 0–1, displayed as match %.

**Tie-breaking**: layouts within 1% of each other are ranked by lowest `sfbPct` — the most universally agreed-upon ergonomic metric.

**QWERTY similarity score** (optional user toggle: "Prioritize easy transition"):
- Computed as: (keys shared in same position vs QWERTY) / 30
- When toggle is ON: `finalScore = 0.8 × layoutScore + 0.2 × qwertySimilarity`
- Helps users who want incremental improvement over a full remap

### Top-5 Recommendation Cards
Each card shows:
- Layout name + keyboard form factor badge
- Match % (large, colored)
- Top 3 reasons (e.g. "Low SFBs: 0.68%", "High alternation: 37.7%", "No scissors: 0.4%")
- Keyboard mini-viz (small, finger-colored)
- "View full stats" → opens Layout Detail
- "Open in Cyanophage" → external link

---

## Phase 5 — Results Page

### Comfort Profile Radar (`RadarChart.tsx`)
- 8 axes, one per category
- Single polygon filled with user's composite scores
- Axes labeled with category name + score value
- Tooltip on hover per axis

### Comparison (from Results page)
- "Compare layouts" button on any recommendation card → opens `LayoutComparison`
- Side-by-side: stat table with diff column (green = better, red = worse vs baseline)
- Overlay radar: two semitransparent polygons, legend below

---

## Phase 6 — App Flow

```
/ (Home)
├── /browse          ← Layout Browser
│   └── /browse/:id  ← Layout Detail (viz + stats)
├── /test/run        ← Typing Test Stream (completes → auto-navigate to /results)
└── /results         ← Results (radar + top-5 cards, guarded route)
```

Navigation: top nav bar with Home / Browse / Take the Test links.
Results page is only accessible after completing the test (guarded route — redirects to /test/run if no results in state).

---

## Todos

1. `project-setup` — Scaffold Vite + React + TypeScript + Tailwind
2. `layout-data` — Curate layouts.json with ~27 layouts; add thumbKeys, requiresThumbCluster, thumbAltPct fields
3. `layout-browser` — Search/sort UI + keyboard SVG (3 form factors + thumb key row); 🦾 badge for thumb layouts
4. `sequence-design` — 10 categories × 8 sequences = 80 scored + 5 warm-up = 85 total; thumbAlt uses embedded spaces; all sequences 6 chars; validate purity
5. `test-runner` — thumbMode flag per sequence; space = character not word separator in thumbMode; state machine IDLE→RUNNING→ERROR→COMPLETE
6. `scoring` — 10-category median-based scoring; thumbAlt positive category; tie-break by SFB%; QWERTY similarity toggle
7. `results-ui` — 10-axis radar chart + top-5 cards + QWERTY similarity toggle
8. `polish` — Navigation, responsive layout, animations, dark mode
