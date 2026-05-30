import type { FingerEntry } from '../types';

// Fingers: 0=LP, 1=LR, 2=LM, 3=LI, 4=LII(inner),
//          5=RII, 6=RI, 7=RM, 8=RR, 9=RP, 10=LThumb, 11=RThumb
//
// Note: finger 11 (RT, hand:'RT') is used by thumb-cluster layouts (e.g. RSTHD)
// where a letter like 'e' sits on the right thumb key.
// It is NOT mapped here because this fingerMap is QWERTY-based (standard keyboard).
// The scoring engine reads each layout's own `thumbKeys` field to handle RT keys.
export const fingerMap: Record<string, FingerEntry> = {
  // Number row (standard QWERTY positions, never remapped)
  '1': { finger: 0, hand: 'L', row: 'top' },
  '2': { finger: 1, hand: 'L', row: 'top' },
  '3': { finger: 2, hand: 'L', row: 'top' },
  '4': { finger: 3, hand: 'L', row: 'top' },
  '5': { finger: 4, hand: 'L', row: 'top' },
  '6': { finger: 5, hand: 'R', row: 'top' },
  '7': { finger: 6, hand: 'R', row: 'top' },
  '8': { finger: 7, hand: 'R', row: 'top' },
  '9': { finger: 8, hand: 'R', row: 'top' },
  '0': { finger: 9, hand: 'R', row: 'top' },

  // Top row
  q: { finger: 0, hand: 'L', row: 'top' },
  w: { finger: 1, hand: 'L', row: 'top' },
  e: { finger: 2, hand: 'L', row: 'top' },
  r: { finger: 3, hand: 'L', row: 'top' },
  t: { finger: 4, hand: 'L', row: 'top' },
  y: { finger: 5, hand: 'R', row: 'top' },
  u: { finger: 6, hand: 'R', row: 'top' },
  i: { finger: 7, hand: 'R', row: 'top' },
  o: { finger: 8, hand: 'R', row: 'top' },
  p: { finger: 9, hand: 'R', row: 'top' },

  // Home row
  a: { finger: 0, hand: 'L', row: 'home' },
  s: { finger: 1, hand: 'L', row: 'home' },
  d: { finger: 2, hand: 'L', row: 'home' },
  f: { finger: 3, hand: 'L', row: 'home' },
  g: { finger: 4, hand: 'L', row: 'home' },
  h: { finger: 5, hand: 'R', row: 'home' },
  j: { finger: 6, hand: 'R', row: 'home' },
  k: { finger: 7, hand: 'R', row: 'home' },
  l: { finger: 8, hand: 'R', row: 'home' },
  ';': { finger: 9, hand: 'R', row: 'home' },

  // Bottom row
  z: { finger: 0, hand: 'L', row: 'bottom' },
  x: { finger: 1, hand: 'L', row: 'bottom' },
  c: { finger: 2, hand: 'L', row: 'bottom' },
  v: { finger: 3, hand: 'L', row: 'bottom' },
  b: { finger: 4, hand: 'L', row: 'bottom' },
  n: { finger: 5, hand: 'R', row: 'bottom' },
  m: { finger: 6, hand: 'R', row: 'bottom' },
  ',': { finger: 7, hand: 'R', row: 'bottom' },
  '.': { finger: 8, hand: 'R', row: 'bottom' },
  '/': { finger: 9, hand: 'R', row: 'bottom' },

  // Thumb
  ' ':    { finger: 10, hand: 'LT', row: 'thumb' },
  // Right thumb: mapped to non-breaking space (U+00A0).
  // Visually appears as a space — sequences simulate thumb-cluster layouts
  // where a letter sits on the right thumb key (e.g. RSTHD 'e' thumb).
  // On a standard keyboard the tester presses space twice (LT then RT).
  '\u00a0': { finger: 11, hand: 'RT', row: 'thumb' },

  // Outer pinky keys (shown in cyanophage display but outside 30-key block)
  '-': { finger: 9, hand: 'R', row: 'top' },     // outer right, row 1
  "'": { finger: 9, hand: 'R', row: 'home' },    // outer right, row 2
  '\\': { finger: 0, hand: 'L', row: 'bottom' }, // outer left, row 3
  '=': { finger: 9, hand: 'R', row: 'top' },     // right of - (some layouts)
  '[': { finger: 9, hand: 'R', row: 'top' },     // Dvorak outer
  ']': { finger: 9, hand: 'R', row: 'top' },     // Dvorak outer
};
