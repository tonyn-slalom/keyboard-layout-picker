import { memo } from 'react';
import type { Layout } from '../../types';
import { KeyboardViz } from '../KeyboardViz/KeyboardViz';
import { appPath } from '../../utils/appPath';

interface LayoutHighlight {
  label: string;
  value: string;
}

interface LayoutCardProps {
  layout: Layout;
  matchPct?: number;
  highlights?: LayoutHighlight[];
}

function badgeClass(pct: number): string {
  if (pct >= 75) return 'bg-green-500/20 text-green-400';
  if (pct >= 50) return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-red-500/20 text-red-400';
}

function LayoutCardInner({ layout, matchPct, highlights }: LayoutCardProps) {
  const displayHighlights = highlights ?? [];

  return (
    <a
      href={appPath(`/browse/${layout.id}`)}
      className="block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md transition-shadow"
      aria-label={`View details for ${layout.name}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {layout.name}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {matchPct !== undefined && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${badgeClass(matchPct)}`}>
              {matchPct.toFixed(1)}%
            </span>
          )}
          {layout.requiresThumbCluster && (
            <span
              className="text-lg"
              title="Optimized for keyboards with thumb cluster keys"
              aria-label="Requires thumb cluster"
            >
              👍
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <KeyboardViz layout={layout} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
        {displayHighlights.map(highlight => (
          <div key={highlight.label} className="text-center">
            <div className="font-medium text-gray-900 dark:text-gray-200">
              {highlight.value}
            </div>
            <div>{highlight.label}</div>
          </div>
        ))}
      </div>
    </a>
  );
}

export const LayoutCard = memo(LayoutCardInner);
