---
description: "Use when writing or reading TypeScript types, interfaces, or enums for the keyboard layout picker. Contains the single source of truth for all shared types: Layout, Sequence, SequenceResult, FingerEntry, CategoryId, TestState. Use for 'types', 'interfaces', 'Layout type', 'SequenceResult', 'CategoryId'."
applyTo: "src/**/*.{ts,tsx}"
---
# Canonical TypeScript Interfaces

> These are the single source of truth. All agents and all files MUST use exactly these types.
> File: `src/types.ts` — import from here, never redefine locally.

```ts
// ─── Fingers & Keys ─────────────────────────────────────────────────────────

export type Hand = 'L' | 'R' | 'LT' | 'RT';
export type Row  = 'top' | 'home' | 'bottom' | 'thumb';

// finger index: 0=LP, 1=LR, 2=LM, 3=LI, 4=LII(inner),
//               5=RII, 6=RI, 7=RM, 8=RR, 9=RP, 10=LThumb, 11=RThumb
export interface FingerEntry {
  finger: number;
  hand:   Hand;
  row:    Row;
}

// ─── Layouts ─────────────────────────────────────────────────────────────────

export interface LayoutStats {
  sfbPct:          number;
  skipBigramPct:   number;
  lsbPct:          number;
  scissorsPct:     number;
  altPct:          number;
  rollInPct:       number;
  rollOutPct:      number;
  redirectPct:     number;
  weakRedirectPct: number;
  offHomePinkyPct: number;
  thumbAltPct?:    number; // thumb-cluster layouts only
}

export interface Layout {
  id:                   string;             // kebab-case  e.g. "colemak-dh"
  name:                 string;             // Display     e.g. "Colemak-DH"
  source:               string;             // Creator URL
  cyanophageRef:        string;             // URL param for cyanophage playground
  keys:                 string;             // 30-char row-major (top→home→bottom, L→R)
  formFactors:          FormFactor[];
  thumbKeys?:           { left?: string[]; right?: string[] };
  stats:                LayoutStats;
  requiresThumbCluster: boolean;
}

export type FormFactor = 'ansi' | 'ortho' | 'columnar';

// ─── Typing Test ─────────────────────────────────────────────────────────────

// 12 categories (sfb and scissors split by finger strength)
// Positive (higher = user prefers): alt, rollIn, rollOut, thumbAlt
// Negative (higher = user dislikes): sfbStrong, sfbWeak, lsb, scissorsCenter, scissorsPinky, redirect, pinky, skipBigram
export type CategoryId =
  | 'alt'
  | 'rollIn'
  | 'rollOut'
  | 'thumbAlt'
  | 'sfbStrong'       // index + middle finger SFBs
  | 'sfbWeak'         // ring + pinky finger SFBs
  | 'lsb'
  | 'scissorsCenter'  // scissors not involving pinky
  | 'scissorsPinky'   // scissors where pinky is the top or bottom key
  | 'redirect'
  | 'pinky'
  | 'skipBigram';

export interface Sequence {
  id:         string;       // e.g. "alt-01"
  category:   CategoryId;
  text:       string;       // exactly 6 chars (thumbAlt includes one space)
  isWarmup:   boolean;
  thumbMode:  boolean;      // true only for thumbAlt (space is a required char, not separator)
}

export interface SequenceResult {
  sequenceId:  string;
  category:    CategoryId;
  wpm:         number;      // words-per-minute for this 6-char sequence
  errorCount:  number;      // total restarts on this sequence
  durationMs:  number;      // wall-clock time from first keypress to last correct char
}

// ─── Test State Machine ──────────────────────────────────────────────────────

export type TestStatus = 'idle' | 'running' | 'error' | 'complete';

export interface TestState {
  sequences:        Sequence[];
  currentIndex:     number;
  currentCharIndex: number;
  status:           TestStatus;
  results:          SequenceResult[];
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

// Map of CategoryId → composite score in [0, 1]
export type ComfortProfile = Record<CategoryId, number>;

export interface RankedLayout {
  layout:       Layout;
  score:        number;           // final score in [0, 1]
  matchPct:     number;           // score * 100, rounded to 1 decimal
  topReasons:   string[];         // top 3 differentiating stat descriptions
}
```
