import { useMemo, useState } from 'react';
import type { CategoryId, Layout } from '../types';
import layoutsData from '../data/layouts.json';
import { LayoutBrowser } from '../components/LayoutBrowser/LayoutBrowser';
import {
  CATEGORY_IDS,
  POSITIVE_CATEGORIES,
  defaultComfortProfile,
  rankLayoutsDetailed,
} from '../utils/scoring';

const layouts = layoutsData as Layout[];

const CATEGORY_LABELS: Record<CategoryId, string> = {
  alt:            'Alt',
  rollIn:         'Roll-in',
  rollOut:        'Roll-out',
  thumbAlt:       'Thumb Alt',
  sfbStrong:      'SFB Strong',
  sfbWeak:        'SFB Weak',
  lsb:            'LSB',
  scissorsCenter: 'Scissors (center)',
  scissorsPinky:  'Scissors (pinky)',
  redirect:       'Redirect',
  pinky:          'Pinky off-home',
  skipBigram:     'Skip Bigram',
};

const positives = CATEGORY_IDS.filter(c => POSITIVE_CATEGORIES.has(c));
const negatives = CATEGORY_IDS.filter(c => !POSITIVE_CATEGORIES.has(c));

export default function BrowsePage() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(defaultComfortProfile);

  const matchPcts = useMemo(
    () =>
      profileOpen
        ? Object.fromEntries(
            rankLayoutsDetailed(layouts, profile, false).map(r => [r.layout.id, r.matchPct]),
          )
        : undefined,
    [profileOpen, profile],
  );

  function handleSliderChange(cat: CategoryId, value: number) {
    setProfile(prev => ({ ...prev, [cat]: Math.max(0, Math.min(1, value)) }));
  }

  function handleReset() {
    setProfile(defaultComfortProfile());
  }

  function renderSlider(cat: CategoryId) {
    const value = profile[cat];
    return (
      <div key={cat} className="flex items-center gap-3">
        <label
          htmlFor={`browse-slider-${cat}`}
          className="w-36 text-xs text-gray-400 shrink-0"
        >
          {CATEGORY_LABELS[cat]}
        </label>
        <input
          id={`browse-slider-${cat}`}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={e => handleSliderChange(cat, parseFloat(e.target.value))}
          aria-label={`${CATEGORY_LABELS[cat]} comfort score`}
          className="flex-1 accent-blue-500"
        />
        <span className="w-8 text-right text-xs font-mono text-gray-400">
          {(value * 100).toFixed(0)}%
        </span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Keyboard Layouts
          </h1>
          <button
            onClick={() => setProfileOpen(p => !p)}
            aria-expanded={profileOpen}
            aria-controls="comfort-profile-panel"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              profileOpen
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {profileOpen ? '▲' : '▼'} Comfort Profile
            {profileOpen && <span className="ml-1 text-xs opacity-75">showing match %</span>}
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {layouts.length} layouts — click any card to see full stats
        </p>

        {profileOpen && (
          <div
            id="comfort-profile-panel"
            className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Set your comfort profile to see match % on each layout
              </h2>
              <button
                onClick={handleReset}
                aria-label="Reset profile to defaults"
                className="text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
              <div>
                <p className="text-xs font-semibold text-green-500 mb-2 uppercase tracking-wide">
                  Positive (higher = you like it)
                </p>
                {positives.map(renderSlider)}
              </div>
              <div>
                <p className="text-xs font-semibold text-red-400 mb-2 uppercase tracking-wide">
                  Negative (higher = you tolerate it)
                </p>
                {negatives.map(renderSlider)}
              </div>
            </div>
          </div>
        )}

        <LayoutBrowser layouts={layouts} matchPcts={matchPcts} />
      </div>
    </main>
  );
}

