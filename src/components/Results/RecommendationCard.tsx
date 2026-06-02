import type { RankedLayout } from '../../types';
import { KeyboardViz } from '../KeyboardViz/KeyboardViz';
import { FingerUsageChart } from '../FingerUsage/FingerUsageChart';

interface RecommendationCardProps {
  ranked: RankedLayout;
  rank: number;
}

function getMatchBadgeColor(pct: number): string {
  if (pct >= 75) return 'bg-green-600 text-white';
  if (pct >= 50) return 'bg-yellow-500 text-white';
  return 'bg-red-500 text-white';
}

export function RecommendationCard({ ranked, rank }: RecommendationCardProps) {
  const { layout, matchPct, topReasons } = ranked;
  const badgeColor = getMatchBadgeColor(matchPct);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
            #{rank}
          </span>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {layout.name}
            </h3>
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
        <span
          className={`px-3 py-1 rounded-full text-sm font-bold ${badgeColor}`}
          aria-label={`Match: ${matchPct}%`}
        >
          {matchPct}%
        </span>
      </div>

      <div className="flex-1">
        <KeyboardViz layout={layout} size="sm" />
      </div>

      <FingerUsageChart layout={layout} />

      <ul className="space-y-1">
        {topReasons.map((reason, i) => (
          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <span className="text-green-500">✓</span>
            {reason}
          </li>
        ))}
      </ul>

      <div className="flex gap-2 flex-wrap">
        <a
          href={`../browse/${layout.id}`}
          aria-label={`View full stats for ${layout.name}`}
          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          View full stats
        </a>
        <a
          href={`https://cyanophage.github.io/playground.html#${layout.cyanophageRef}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${layout.name} in Cyanophage playground`}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cyanophage ↗
        </a>
      </div>
    </div>
  );
}
