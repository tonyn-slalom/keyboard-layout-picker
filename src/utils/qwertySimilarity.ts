const QWERTY_KEYS = 'qwertyuiopasdfghjkl;zxcvbnm,./';

/**
 * Returns a [0, 1] score representing how many keys in the given layout
 * are in the same position as QWERTY. 1.0 = identical to QWERTY.
 */
export function qwertySimilarity(layoutKeys: string): number {
  const len = Math.min(layoutKeys.length, QWERTY_KEYS.length);
  let matches = 0;
  for (let i = 0; i < len; i++) {
    if (layoutKeys[i] === QWERTY_KEYS[i]) matches++;
  }
  return matches / 30;
}
