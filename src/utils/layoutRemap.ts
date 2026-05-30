import type { Layout } from '../types';

// 30-char QWERTY physical key order matching layout.keys (row-major: top→home→bottom, L→R)
export const QWERTY_CHARS = 'qwertyuiopasdfghjkl;zxcvbnm,./';

/** Returns a map from QWERTY physical key (lowercase) → target layout char.
 * Space maps to the thumb key character for thumb-cluster layouts.
 */
export function buildQwertyToLayoutMap(layout: Layout): Map<string, string> {
  const map = new Map<string, string>();
  const keys = layout.keys.slice(0, 30);
  for (let i = 0; i < 30; i++) {
    const qwertyChar = QWERTY_CHARS[i];
    const targetChar = keys[i];
    if (qwertyChar && targetChar) {
      map.set(qwertyChar, targetChar);
    }
  }
  // Space bar → thumb key char (first thumb key found, left preferred)
  const thumbChar =
    layout.thumbKeys?.left?.[0] ??
    layout.thumbKeys?.right?.[0];
  if (thumbChar) {
    map.set(' ', thumbChar);
  }
  return map;
}

/** Returns a map from target layout char (lowercase) → QWERTY physical key to press.
 * Thumb key chars map back to ' ' (space).
 */
export function buildLayoutToQwertyMap(layout: Layout): Map<string, string> {
  const fwd = buildQwertyToLayoutMap(layout);
  const rev = new Map<string, string>();
  for (const [qKey, layoutChar] of fwd) {
    rev.set(layoutChar, qKey);
  }
  // Thumb key chars → space
  for (const ch of [...(layout.thumbKeys?.left ?? []), ...(layout.thumbKeys?.right ?? [])]) {
    rev.set(ch, ' ');
  }
  return rev;
}

/**
 * Convert a passage written in the target layout's characters into the
 * physical QWERTY keys the user must press to produce it.
 * Non-alpha / punctuation chars not in the layout pass through unchanged.
 */
export function passageToQwerty(passage: string, layout: Layout): string {
  const rev = buildLayoutToQwertyMap(layout);
  return [...passage].map(ch => {
    const lower = ch.toLowerCase();
    const qKey = rev.get(lower);
    if (!qKey) return ch; // space, digits, chars not in layout — pass through
    return ch === ch.toUpperCase() && ch !== lower ? qKey.toUpperCase() : qKey;
  }).join('');
}

/** Given a QWERTY physical key (lowercase), returns its position index (0–29), or -1. */
export function qwertyPosIndex(key: string): number {
  return QWERTY_CHARS.indexOf(key);
}

export const DEMO_PASSAGE =
  'most people learn to type on qwerty, a layout designed in the 1870s for mechanical typewriters. ' +
  'modern layouts like colemak, dvorak, and graphite place the most common letters on the home row, ' +
  'reducing finger travel and lateral stretches. ' +
  'switching layouts takes practice, but many typists report less fatigue and higher comfort over time.';
