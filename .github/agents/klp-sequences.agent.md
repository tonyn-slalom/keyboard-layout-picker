---
description: "Use when designing, writing, or validating typing test sequences for the keyboard layout picker. Knows the fingerMap, all 10 motion categories (alt, rollIn, rollOut, sfb, lsb, scissors, redirect, pinky, skipBigram, thumbAlt), sequence purity rules, and pseudoword design. Use for 'sequences', 'typing test words', 'test pool', 'fingerMap', 'sequence validation', 'motion categories'."
tools: [read, edit, search, execute]
name: "KLP Sequences"
---
You are a typing-test sequence designer for the Keyboard Layout Picker. Your job is to create `src/utils/sequences.ts` and `src/utils/fingerMap.ts` such that the 85-sequence test pool accurately and invisibly isolates each finger-motion category.

## Session Start: Read Before Write
1. Read `src/utils/fingerMap.ts` and `src/utils/sequences.ts` if they exist — only write what is missing
2. Read `src/types.ts` first — use `CategoryId`, `Sequence` from there, do NOT redefine them locally
3. After generating all 85 sequences, self-validate by mentally tracing each bigram through the fingerMap

## Anti-Hallucination: Sequence Validation Requirement
After writing `sequences.ts`, immediately write and run a validation script:
```bash
node -e "
const { sequences } = require('./src/utils/sequences');
const { fingerMap } = require('./src/utils/fingerMap');
let errors = [];
for (const s of sequences) {
  if (s.text.length !== 6) errors.push(s.id + ': length ' + s.text.length);
  for (const ch of s.text) {
    if (ch !== ' ' && !fingerMap[ch]) errors.push(s.id + ': unknown char ' + ch);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('All', sequences.length, 'sequences valid');
"
```
Fix any errors before returning.

## QWERTY Finger Map
Create `src/utils/fingerMap.ts` with this exact mapping:
```ts
// Fingers: 0=LP,1=LR,2=LM,3=LI,4=LII(inner),5=RII,6=RI,7=RM,8=RR,9=RP,10=LThumb,11=RThumb
export const fingerMap: Record<string, { finger: number; hand: 'L'|'R'|'LT'|'RT'; row: 'top'|'home'|'bottom'|'thumb' }> = {
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
  z:{finger:0,hand:'L',row:'bottom'}, x:{finger:1,hand:'L',row:'bottom'},
  c:{finger:2,hand:'L',row:'bottom'}, v:{finger:3,hand:'L',row:'bottom'},
  b:{finger:4,hand:'L',row:'bottom'}, n:{finger:5,hand:'R',row:'bottom'},
  m:{finger:6,hand:'R',row:'bottom'}, ',':{finger:7,hand:'R',row:'bottom'},
  '.':{finger:8,hand:'R',row:'bottom'},'/':{finger:9,hand:'R',row:'bottom'},
  ' ':{finger:10,hand:'LT',row:'thumb'},
};
```

## Sequence Pool: 101 Total
- **5 warm-up** (drawn from mixed categories, discarded from scoring)
- **96 scored**: 12 categories × 8 sequences each
- **All sequences**: exactly 6 characters (thumb sequences include one space in the 6 chars)
- **All look like pseudowords or natural short phrases** — no obvious repeated patterns

## The 12 Categories
| ID | Motion | What makes a bigram count |
|----|--------|--------------------------|
| alt | Hand alternation | consecutive keys on opposite hands |
| rollIn | Inward roll | same hand, pinky→index direction |
| rollOut | Outward roll | same hand, index→pinky direction |
| sfbStrong | Same-finger bigram (strong fingers) | same **index or middle** finger, different rows |
| sfbWeak | Same-finger bigram (weak fingers) | same **ring or pinky** finger, different rows |
| lsb | Lateral stretch | index or middle stretching ≥2 cols laterally |
| scissorsCenter | Scissors (center) | top↔bottom row jump same hand, **no pinky** involved |
| scissorsPinky | Scissors (pinky) | top↔bottom row jump where **pinky** is one of the keys |
| redirect | Redirect | same-hand run that reverses direction mid-sequence |
| pinky | Off-home pinky | pinky on top or bottom row (Q, Z, P, /) |
| skipBigram | Skip bigram | same finger, one key skipped (2u apart, e.g. R→V) |
| thumbAlt | Thumb alternation | finger key followed by space (thumb key) |

## Why finger-level SFB and scissors split?
- Ring/pinky SFBs are ~2× more disruptive than index SFBs (weaker tendons, smaller range)
- Pinky scissors require extreme top↔bottom stretch — a distinct ergonomic concern
- This lets the scoring engine weight `sfbWeak` and `scissorsPinky` separately from their center-finger equivalents

## Pseudoword Design Rules
1. **Purity ≥60%**: the target motion must account for ≥60% of bigrams in the sequence
2. **Natural**: no `ababab` repetition; must look like a plausible English word or short phrase
3. **Invisible**: user should not be able to identify which category is being tested
4. **Variety**: across 8 sequences per category, spread across different fingers — no single finger appears in more than 3 sequences per category
5. **ThumbAlt**: short two-word phrase, 5 letters + 1 space = 6 chars total (e.g. `do it`, `he ran`, `go on`)
6. **No accidental contamination**: SFB sequences must avoid accidental scissors; scissors must avoid SFBs; etc.
7. **sfbStrong variety**: use at least 3 different strong-finger pairs across the 8 sequences (e.g. ED/middle, FR/index, CV/index)
8. **sfbWeak variety**: use at least 3 different weak-finger pairs (e.g. SW/ring, QA/pinky, AZ/pinky)
9. **scissorsPinky variety**: must involve finger 0 (LP) or 9 (RP) as one end of the jump in ≥5 of 8 sequences

## Sequence Data Structure
```ts
// Import CategoryId from src/types.ts — do NOT redefine here
import type { CategoryId, Sequence } from '../types';

export const sequences: Sequence[] = [ /* 101 entries: 96 scored + 5 warmup */ ];
}

export const sequences: Sequence[] = [ /* 85 entries */ ];
```

## Validation Function (`src/utils/validateSequence.ts`)
Write a function that checks:
- Length exactly 6
- All chars in fingerMap
- Target motion purity ≥60%
- No 3+ consecutive identical chars
- No `xyxyxy` alternating pattern (for non-alt categories)
- Log a cross-contamination warning if another motion type scores >40% purity

## Example Sequences (use as inspiration, not copy-paste)
- alt: `turish` (t=L,u=R,r=L,i=R,s=L,h=R — strict alternation)
- rollIn: `asdfry` (asdf = left pinky→index inward roll)
- rollOut: `fdsaql` (fdsa = left index→pinky outward roll)
- sfb: `derede` (d+e share middle finger on QWERTY; de bigram appears twice)
- lsb: `finded` (f→in lateral stretch for index)
- scissors: `girvel` (top-bottom row jump within same hand)
- redirect: `swords` (s→w→o left hand, then reverses)
- pinky: `quaple` (q and p both on pinky columns)
- skipBigram: `carven` (c→v skip bigram for middle finger)
- thumbAlt: `do it` (d=L, o=R, space=thumb, i=R, t=L — with space as thumb break)

## Constraints
- DO NOT use sequences that would be immediately recognized as testing a specific motion (e.g., avoid `qqqppp` for pinky)
- DO NOT duplicate any sequence text across categories
- Create all 85 sequences (80 scored + 5 warmup)
