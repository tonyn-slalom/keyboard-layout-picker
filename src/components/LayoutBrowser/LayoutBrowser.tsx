import { useMemo } from 'react';
import type { CategoryId, Layout } from '../../types';
import { useLayoutBrowserController, type SortKey } from './LayoutBrowser.controller';
import { LayoutCard } from './LayoutCard';
import { defaultComfortProfile, rankLayoutsDetailed } from '../../utils/scoring';

interface LayoutHighlight {
  label: string;
  value: string;
}

const CATEGORY_LABELS: Record<CategoryId, string> = {
  alt: 'Alt',
  rollIn: 'Roll-in',
  rollOut: 'Roll-out',
  thumbAlt: 'Thumb Alt',
  sfbStrong: 'SFB Strong',
  sfbWeak: 'SFB Weak',
  lsb: 'LSB',
  scissorsCenter: 'Scissors C',
  scissorsPinky: 'Scissors P',
  redirect: 'Redirect',
  pinky: 'Pinky',
  skipBigram: 'Skip Bigram',
};

const CATEGORY_DECIMALS: Record<CategoryId, number> = {
  alt: 1,
  rollIn: 1,
  rollOut: 1,
  thumbAlt: 1,
  sfbStrong: 2,
  sfbWeak: 2,
  lsb: 2,
  scissorsCenter: 2,
  scissorsPinky: 2,
  redirect: 1,
  pinky: 1,
  skipBigram: 2,
};

function formatCategoryValue(category: CategoryId, rawStat: number): string {
  const decimals = CATEGORY_DECIMALS[category];
  return `${rawStat.toFixed(decimals)}%`;
}

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'sfbPct',      label: 'SFB%' },
  { key: 'altPct',      label: 'Alt%' },
  { key: 'rollInPct',   label: 'Roll-in%' },
  { key: 'rollOutPct',  label: 'Roll-out%' },
  { key: 'redirectPct', label: 'Redirect%' },
  { key: 'lsbPct',      label: 'LSB%' },
  { key: 'matchPct',    label: 'Match%' },
];

interface LayoutBrowserProps {
  layouts: Layout[];
  matchPcts?: Record<string, number>;
}

export function LayoutBrowser({ layouts, matchPcts }: LayoutBrowserProps) {
  const ctrl = useLayoutBrowserController(layouts, matchPcts);
  const layoutHighlightsById = useMemo(
    () => new Map<string, LayoutHighlight[]>(
      rankLayoutsDetailed(layouts, defaultComfortProfile(), false).map(ranked => [
        ranked.layout.id,
        ranked.breakdown
          .filter(item => item.rawStat > 0)
          .slice(0, 3)
          .map(item => ({
            label: CATEGORY_LABELS[item.category],
            value: formatCategoryValue(item.category, item.rawStat),
          })),
      ]),
    ),
    [layouts],
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search layouts…"
          value={ctrl.query}
          onChange={e => ctrl.handleQueryChange(e.target.value)}
          aria-label="Search layouts"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sort options">
          {SORT_OPTIONS.map(({ key, label }) => {
            const isActive = ctrl.sortKey === key;
            return (
              <button
                key={key}
                onClick={() => ctrl.handleSortChange(key)}
                aria-label={`Sort by ${label}`}
                aria-pressed={isActive}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {label} {isActive ? (ctrl.sortAsc ? '↑' : '↓') : ''}
              </button>
            );
          })}
        </div>
      </div>

      {ctrl.filtered.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          No layouts match &ldquo;{ctrl.query}&rdquo;
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ctrl.filtered.map(layout => (
            <LayoutCard
              key={layout.id}
              layout={layout}
              matchPct={matchPcts?.[layout.id]}
              highlights={layoutHighlightsById.get(layout.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
