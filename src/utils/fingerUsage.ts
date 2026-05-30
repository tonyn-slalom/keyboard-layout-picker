import type { Layout } from '../types';

// English letter + common punctuation frequencies (Oxford English Corpus)
// Space (~13%) is the most frequently typed character in English prose.
const ENGLISH_CHAR_FREQ: Record<string, number> = {
  ' ': 13.00,
  e: 12.70, t: 9.06, a: 8.17, o: 7.51, i: 6.97,
  n: 6.75, s: 6.33, h: 6.09, r: 5.99, d: 4.25,
  l: 4.03, c: 2.78, u: 2.76, m: 2.41, w: 2.36,
  f: 2.23, g: 2.02, y: 1.97, p: 1.93, b: 1.49,
  v: 0.98, k: 0.77, j: 0.15, x: 0.15, q: 0.10,
  z: 0.07,
  ',': 0.61, '.': 0.65, "'": 0.60, ';': 0.08,
  '-': 0.30, '/': 0.05, '=': 0.03, '\\': 0.02,
  // Digits (from general English text corpus)
  '1': 1.00, '2': 0.65, '3': 0.45, '4': 0.35, '5': 0.55,
  '6': 0.40, '7': 0.40, '8': 0.50, '9': 0.50, '0': 0.55,
};

// Char frequencies derived from the 96 scored test sequences (570 chars)
// Reflects the test's emphasis on specific motion patterns:
// - Pinky keys (z,q,p,;) overrepresented — pinky & scissorsPinky categories
// - j, k overrepresented — redirect / skipBigram patterns
// - Space included for thumbAlt sequences
export const SEQUENCE_CHAR_FREQ: Record<string, number> = {
  n: 8.9, s: 7.9, a: 7.2, e: 6.8, d: 5.6,
  t: 5.4, r: 5.3, f: 4.6, u: 4.6, l: 4.6,
  o: 4.0, i: 3.3, h: 3.3, k: 2.8, j: 2.8,
  p: 2.8, z: 2.6, w: 1.8, y: 1.8, ' ': 1.8,
  v: 1.6, q: 1.6, g: 1.4, c: 1.4, x: 1.2,
  m: 1.1, b: 1.1, ';': 0.9, '/': 0.9,
  '.': 0.5, ',': 0.5,
};

export { ENGLISH_CHAR_FREQ };

/**
 * Returns per-hand multipliers for the hand-balance heatmap.
 * Formula: heat = charFreq/maxFreq × (1 + (handPct − 0.5) / 0.5)
 *               = charFreq/maxFreq × 2 × handPct
 * At 50/50 the multiplier is 1.0 (neutral). The dominant hand scales above 1;
 * the lighter hand scales below 1. Final heat is clamped to [0, 1] at render.
 */
export function computeHandBalanceHeat(
  layout: Layout,
  charFreq?: Record<string, number>,
): { leftMult: number; rightMult: number } {
  const freq = charFreq ?? ENGLISH_CHAR_FREQ;
  let leftLoad = 0;
  let rightLoad = 0;

  // 30 alpha keys: col index (pos % 10) 0-4 = left hand, 5-9 = right hand
  for (let i = 0; i < 30; i++) {
    const f = freq[layout.keys[i]!.toLowerCase()] ?? 0;
    if (i % 10 < 5) leftLoad += f;
    else rightLoad += f;
  }

  // Outer column keys
  const outer = layout.outerKeys ?? {};
  const topRight   = outer.topRight   ?? '-';
  const homeLeft   = outer.homeLeft;
  const homeRight  = outer.homeRight  ?? "'";
  const bottomLeft = outer.bottomLeft ?? '\\';
  rightLoad += freq[topRight.toLowerCase()]   ?? 0;
  rightLoad += freq[homeRight.toLowerCase()]  ?? 0;
  leftLoad  += freq[bottomLeft.toLowerCase()] ?? 0;
  if (homeLeft) leftLoad += freq[homeLeft.toLowerCase()] ?? 0;

  // Space is always typed; on left thumb for thumb=r layouts, otherwise right thumb
  if (layout.thumbKeys?.right?.length) {
    leftLoad  += freq[' '] ?? 0;
  } else {
    rightLoad += freq[' '] ?? 0;
  }
  // Thumb alpha keys only for layouts with a physical thumb cluster
  if (layout.requiresThumbCluster) {
    for (const ch of layout.thumbKeys?.left  ?? []) leftLoad  += freq[ch.toLowerCase()] ?? 0;
    for (const ch of layout.thumbKeys?.right ?? []) rightLoad += freq[ch.toLowerCase()] ?? 0;
  }

  const total = leftLoad + rightLoad;
  if (total === 0) return { leftMult: 1, rightMult: 1 };
  // multiplier = 2 × handPct  (= 1.0 at 50%, scales linearly above/below)
  return {
    leftMult:  2 * (leftLoad  / total),
    rightMult: 2 * (rightLoad / total),
  };
}

/** Normalised frequency heat for a single character [0, 1]. */
export function charFreqHeat(char: string, charFreq?: Record<string, number>): number {
  const freq = charFreq ?? ENGLISH_CHAR_FREQ;
  const maxFreq = Math.max(...Object.values(freq));
  return (freq[char.toLowerCase()] ?? 0) / maxFreq;
}

// The 30 key positions are row-major (top→home→bottom, L→R).
// Position index % 10 gives the finger group:
//   0=LP, 1=LR, 2=LM, 3=LI, 4=LII(inner), 5=RII, 6=RI, 7=RM, 8=RR, 9=RP
// For display we merge 3+4 → left index, 5+6 → right index.

export interface FingerGroup {
  id: string;
  label: string;       // short label e.g. "L. Pinky"
  hand: 'L' | 'R';
  pct: number;         // 0–100
  posIndices: number[]; // which mod-10 indices belong here (empty for thumbs)
}

const FINGER_GROUPS: Omit<FingerGroup, 'pct'>[] = [
  { id: 'lp', label: 'L. Pinky',  hand: 'L', posIndices: [0] },
  { id: 'lr', label: 'L. Ring',   hand: 'L', posIndices: [1] },
  { id: 'lm', label: 'L. Middle', hand: 'L', posIndices: [2] },
  { id: 'li', label: 'L. Index',  hand: 'L', posIndices: [3, 4] },
  { id: 'lt', label: 'L. Thumb',  hand: 'L', posIndices: [] },
  { id: 'rt', label: 'R. Thumb',  hand: 'R', posIndices: [] },
  { id: 'ri', label: 'R. Index',  hand: 'R', posIndices: [5, 6] },
  { id: 'rm', label: 'R. Middle', hand: 'R', posIndices: [7] },
  { id: 'rr', label: 'R. Ring',   hand: 'R', posIndices: [8] },
  { id: 'rp', label: 'R. Pinky',  hand: 'R', posIndices: [9] },
];

export function computeFingerUsage(layout: Layout, charFreq?: Record<string, number>): FingerGroup[] {
  const freq = charFreq ?? ENGLISH_CHAR_FREQ;
  const keys = layout.keys;

  // raw[0–9]: mod-10 finger groups for 30 alpha keys
  // raw[10]: left thumb, raw[11]: right thumb
  const raw: number[] = new Array(12).fill(0);

  for (let pos = 0; pos < Math.min(30, keys.length); pos++) {
    raw[pos % 10]! += freq[keys[pos]!.toLowerCase()] ?? 0;
  }

  // Space is always typed; on right thumb by default, left thumb for thumb=r layouts
  if (layout.thumbKeys?.right?.length) {
    raw[10]! += freq[' '] ?? 0;  // thumb=r: space on left
  } else {
    raw[11]! += freq[' '] ?? 0;  // default: space on right
  }
  // Thumb alpha keys only apply to layouts with a physical thumb cluster
  if (layout.requiresThumbCluster) {
    for (const ch of layout.thumbKeys?.left ?? []) {
      raw[10]! += freq[ch.toLowerCase()] ?? 0;
    }
    for (const ch of layout.thumbKeys?.right ?? []) {
      raw[11]! += freq[ch.toLowerCase()] ?? 0;
    }
  }

  const total = raw.reduce((s, v) => s + v, 0);
  if (total === 0) return FINGER_GROUPS.map(g => ({ ...g, pct: 0 }));

  return FINGER_GROUPS.map(g => {
    if (g.id === 'lt') return { ...g, pct: (raw[10]! / total) * 100 };
    if (g.id === 'rt') return { ...g, pct: (raw[11]! / total) * 100 };
    return { ...g, pct: g.posIndices.reduce((s, i) => s + (raw[i] ?? 0), 0) / total * 100 };
  });
}

export function computeHandBalance(groups: FingerGroup[]): { left: number; right: number } {
  const left  = groups.filter(g => g.hand === 'L').reduce((s, g) => s + g.pct, 0);
  const right = groups.filter(g => g.hand === 'R').reduce((s, g) => s + g.pct, 0);
  return { left, right };
}

/**
 * Returns a heat array for an arbitrary key string (absolute normalization).
 * Used for 40-key layouts where the full string is `'1234567890' + layout.keys`.
 */
export function computeKeyHeatForString(
  keys: string,
  charFreq?: Record<string, number>,
): number[] {
  const freq = charFreq ?? ENGLISH_CHAR_FREQ;
  const maxFreq = Math.max(...Object.values(freq));
  return Array.from({ length: keys.length }, (_, i) => {
    const f = freq[keys[i]!.toLowerCase()] ?? 0;
    return f / maxFreq;
  });
}

/**
 * Returns a 30-element array of normalized heat values [0, 1] for each key
 * position (row-major: top→home→bottom, L→R), based on character frequencies.
 * Normalizes against the global max frequency so the same character always
 * gets the same heat value regardless of which layout it appears in.
 */
export function computeKeyHeat(layout: Layout, charFreq?: Record<string, number>): number[] {
  return computeKeyHeatForString(layout.keys, charFreq);
}
