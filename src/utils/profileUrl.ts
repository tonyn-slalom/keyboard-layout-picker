/**
 * Encode/decode a ComfortProfile + qwertyBoost flag to/from URL search params.
 *
 * Short param keys (to keep URLs readable):
 *   al=alt  ri=rollIn  ro=rollOut  ta=thumbAlt
 *   ss=sfbStrong  sw=sfbWeak  lb=lsb
 *   sc=scissorsCenter  sp=scissorsPinky
 *   rd=redirect  pk=pinky  sb=skipBigram
 *   qb=qwertyBoost (0|1)
 *   xa=exclude alpha-thumb layouts (0|1)
 */
import type { CategoryId, ComfortProfile } from '../types';

const PARAM_KEY: Record<CategoryId, string> = {
  alt:            'al',
  rollIn:         'ri',
  rollOut:        'ro',
  thumbAlt:       'ta',
  sfbStrong:      'ss',
  sfbWeak:        'sw',
  lsb:            'lb',
  scissorsCenter: 'sc',
  scissorsPinky:  'sp',
  redirect:       'rd',
  pinky:          'pk',
  skipBigram:     'sb',
};

const PARAM_TO_CATEGORY = Object.fromEntries(
  Object.entries(PARAM_KEY).map(([cat, key]) => [key, cat as CategoryId]),
) as Record<string, CategoryId>;

export function encodeProfile(
  profile: ComfortProfile,
  qwertyBoost: boolean,
  excludeAlphaThumbLayouts: boolean,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [cat, key] of Object.entries(PARAM_KEY)) {
    params.set(key, (profile[cat as CategoryId] ?? 0).toFixed(2));
  }
  params.set('qb', qwertyBoost ? '1' : '0');
  params.set('xa', excludeAlphaThumbLayouts ? '1' : '0');
  return params;
}

export interface DecodedUrl {
  profile: ComfortProfile;
  qwertyBoost: boolean;
  excludeAlphaThumbLayouts: boolean;
}

export function decodeProfile(params: URLSearchParams): DecodedUrl | null {
  // Only decode if at least one known param is present
  const hasProfile = Object.values(PARAM_KEY).some(k => params.has(k));
  if (!hasProfile) return null;

  const profile: Partial<Record<CategoryId, number>> = {};
  for (const [key, cat] of Object.entries(PARAM_TO_CATEGORY)) {
    const raw = params.get(key);
    const val = raw !== null ? parseFloat(raw) : null;
    profile[cat] = val !== null && !isNaN(val) ? Math.max(0, Math.min(1, val)) : 0.5;
  }

  return {
    profile: profile as ComfortProfile,
    qwertyBoost: params.get('qb') === '1',
    excludeAlphaThumbLayouts: params.get('xa') === '1',
  };
}
