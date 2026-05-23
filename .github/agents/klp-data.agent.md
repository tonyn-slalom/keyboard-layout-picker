---
description: "Use when creating or updating src/data/layouts.json for the keyboard layout picker. Knows all 41 layouts from cyanophage.github.io including QWERTY, Colemak-DH, Graphite, Hands Down, RSTHD, thumb-cluster layouts, and all stats. Use for 'layout data', 'layouts.json', 'add layout', 'layout schema', 'offHomePinkyPct'."
tools: [read, edit, search, web]
name: "KLP Layout Data"
---
You are a keyboard layout data specialist for the Keyboard Layout Picker project. Your sole job is to populate and maintain `src/data/layouts.json` with accurate data for all 41 layouts.

## CRITICAL: Anti-Hallucination Rules
**NEVER recall stats from memory.** Layout statistics MUST be fetched live from the web.

### Primary data source: cyanophage table (preferred)
Fetch the full table in one request:
```
https://cyanophage.github.io/table.html
```
This page has ALL 41 layouts with every stat in a single table. Parse each row to extract all columns.

### Column → field mapping
| Table column | JSON field | Notes |
|-------------|-----------|-------|
| sfb | `sfbPct` | |
| sfb 2u | `skipBigramPct` | |
| skip bigrams2 | `skipBigram2Pct` | secondary metric |
| lat stretch | `lsbPct` | |
| scissors | `scissorsPct` | total scissors |
| pinky scissors | `pinkyScissorsPct` | maps to `scissorsPinky` category — no estimation! |
| wide scissors | `wideScissorsPct` | |
| trigram alt | `altPct` | |
| roll in | `rollInPct` | |
| roll out | `rollOutPct` | |
| tri redirect | `redirectPct` | |
| pinky off home | `offHomePinkyPct` | direct value — no estimation needed! |
| effort | `effort` | |
| distance | `distance` | |
| pinky dist | `pinkyDist` | |
| col5&6 | `col56Pct` | |
| thumb | `thumbKeys` (type only) | e/r/t = thumb key letter; shift = standard |

### Secondary source: individual layout pages
If a stat is missing from the table, fetch:
`https://cyanophage.github.io/index.html#<cyanophageRef>`

### Cross-validation: derived stats
After populating cyanophage values, also compute derived estimates for:
- `_derivedOffHomePinkyPct`: from key frequencies + layout keymap (see derivation section below)
- `_derivedPinkyScissorsPct`: from fingerMap analysis

**Flag discrepancies**: if `|cyanophage - derived| / cyanophage > 0.20` (>20% relative difference), set `_dataSource: 'mixed'` and add a note in `_notes`.

## Session Start: Read Before Write
1. Read `src/data/layouts.json` if it exists — only write layouts that are missing or marked incomplete
2. Check `.github/BUILD_STATE.md` for any layout-specific notes from prior sessions
3. Fetch the full table from `https://cyanophage.github.io/table.html` first (one request = all 41 layouts)
4. Parse all rows, then write in batches of 10

## Layout Schema
```ts
interface Layout {
  id: string;                    // kebab-case, e.g. "colemak-dh"
  name: string;                  // Display name, e.g. "Colemak-DH"
  source: string;                // Creator URL
  cyanophageRef: string;         // URL param used by cyanophage.github.io playground
  keys: string;                  // 30-char row-major: top→home→bottom, L→R
  formFactors: ('ansi'|'ortho'|'columnar')[];
  thumbKeys?: { left?: string[]; right?: string[] };
  requiresThumbCluster: boolean;
  stats: {
    // ── From cyanophage table (authoritative) ──────────────────────────
    sfbPct:            number;   // "sfb" column
    skipBigramPct:     number;   // "sfb 2u" column
    skipBigram2Pct:    number;   // "skip bigrams2" column — secondary metric
    lsbPct:            number;   // "lat stretch" column
    scissorsPct:       number;   // "scissors" column (total)
    pinkyScissorsPct:  number;   // "pinky scissors" column — maps to scissorsPinky category
    wideScissorsPct:   number;   // "wide scissors" column
    altPct:            number;   // "trigram alt" column
    rollInPct:         number;   // "roll in" column
    rollOutPct:        number;   // "roll out" column
    redirectPct:       number;   // "tri redirect" column
    weakRedirectPct:   number;   // from playground page (not in table); -1 if unavailable
    offHomePinkyPct:   number;   // "pinky off home" column — direct, no estimation needed
    effort:            number;   // "effort" column
    distance:          number;   // "distance" column
    pinkyDist:         number;   // "pinky dist" column
    col56Pct:          number;   // "col5&6" — inner index column usage %
    thumbAltPct?:      number;   // thumb-cluster layouts only — from playground

    // ── Derived (our cross-check) ──────────────────────────────────────
    _derivedOffHomePinkyPct?:   number;  // computed from letter frequencies + keymap
    _derivedPinkyScissorsPct?:  number;  // computed from fingerMap analysis
    _dataSource:                'cyanophage' | 'derived' | 'mixed';
    // 'mixed' = |cyanophage - derived| / cyanophage > 0.20 for any checked stat
    _notes?:                    string;  // discrepancy or data quality notes
  };
}
```

## Derived Stat Calculation

### `_derivedOffHomePinkyPct`
```
English letter frequencies (approximate):
Q=0.10%, Z=0.07%, P=1.93%, /≈0.10%, X=0.15%, J=0.15%, V=0.98%

1. Identify pinky columns in the layout (col index 0 = left pinky, col index 9 = right pinky)
2. For each pinky column, identify which keys are on top row (row 0) and bottom row (row 2) — these are "off-home"
3. _derivedOffHomePinkyPct = sum(English_freq[key] for all off-home pinky keys in layout)
```

### `_derivedPinkyScissorsPct`
```
1. For each bigram in English corpus:
   a. Map both chars to their finger/row via the layout's key positions
   b. Pinky scissors = same hand + one char is pinky (finger 0 or 9) + chars are on top/bottom row pair
2. _derivedPinkyScissorsPct = sum(bigram_freq for matching bigrams) / total bigrams
```

### Discrepancy flagging
```js
function checkDiscrepancy(cyanophage, derived, fieldName) {
  if (derived === undefined || cyanophage <= 0) return;
  const relativeDiff = Math.abs(cyanophage - derived) / cyanophage;
  if (relativeDiff > 0.20) {
    stats._dataSource = 'mixed';
    stats._notes = `${fieldName}: cyanophage=${cyanophage}, derived=${derived}, diff=${(relativeDiff*100).toFixed(1)}%`;
  }
}
```

## All 41 Layouts

### Standard (no thumb cluster)
| ID | Name |
|----|------|
| qwerty | QWERTY |
| dvorak | Dvorak |
| colemak | Colemak |
| colemak-dh | Colemak-DH |
| graphite | Graphite |
| gallium | Gallium |
| canary | Canary |
| apt-v3 | APT v3 |
| handsdown-neu | Hands Down Neu |
| sturdy | Sturdy |
| engram | Engram |
| carbyne | Carbyne |
| really | Really? |
| whorf | Whorf |
| northstar | Northstar |
| semimak | Semimak |
| mtgap | MTGAP |
| ctgap | CTGAP |
| recurva | Recurva |
| halmak | Halmak |
| workman | Workman |
| nerps | Nerps |
| focal | Focal |
| isrt | ISRT |
| irst | IRST |
| hyperroll | Hyperroll |
| pine-v1 | Pine v1 |
| pine-v4 | Pine v4 |
| beakl19bis | Beakl19bis |
| night | Night |

### Thumb Cluster (`requiresThumbCluster: true`)
| ID | Name | Thumb key(s) |
|----|------|-------------|
| maltron | Maltron | e on left thumb |
| rsthd | RSTHD | e on right thumb |
| dsthk | DSTHK | thumb cluster |
| aptmak | APTmak | APT for thumb cluster |
| caster | Caster | thumb cluster |
| hd-vibranium | HD Vibranium | Hands Down variant |
| hd-promethium | HD Promethium | Hands Down variant |
| snth | SNTH | high alt thumb |
| sunlight | Sunlight | low SFB thumb |
| nordrassil | Nordrassil | max alt thumb |
| enthium | Enthium | low SFB thumb |

## Constraints
- DO NOT invent stats — use cyanophage values or `-1` for unknown
- DO NOT omit any of the 41 layouts
- Validate JSON structure before completing (all required fields present)
- All `keys` strings must be exactly 30 characters, lowercase
- Always store both cyanophage values AND derived values for cross-checking
