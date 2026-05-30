import type { Layout } from '../../types';
import { computeFingerUsage, computeHandBalance, SEQUENCE_CHAR_FREQ } from '../../utils/fingerUsage';

/** Maps a normalized value [0, 1] to a CSS hsl color along the blue→cyan→green→yellow→red heatmap. */
function heatmapColor(t: number): string {
  // hue: 240 (blue) → 0 (red), saturation 90%, lightness 55%
  const hue = Math.round((1 - t) * 240);
  return `hsl(${hue}, 90%, 55%)`;
}

interface FingerUsageChartProps {
  layout: Layout;
  basis?: 'english' | 'sequences';
}

export function FingerUsageChart({ layout, basis = 'english' }: FingerUsageChartProps) {
  const charFreq = basis === 'sequences' ? SEQUENCE_CHAR_FREQ : undefined;
  const groups = computeFingerUsage(layout, charFreq);
  const { left, right } = computeHandBalance(groups);
  const leftGroups  = groups.filter(g => g.hand === 'L' && g.id !== 'lt');
  const rightGroups = groups.filter(g => g.hand === 'R' && g.id !== 'rt');
  const thumbGroups = groups.filter(g => g.id === 'lt' || g.id === 'rt');

  const maxPct = Math.max(...groups.map(g => g.pct));

  function renderFingerBar(g: typeof groups[0]) {
    const t = maxPct > 0 ? g.pct / maxPct : 0;
    const color = heatmapColor(t);
    return (
      <div key={g.id} className="flex flex-col items-center gap-1 flex-1">
        <span className="text-xs font-mono text-gray-400 dark:text-gray-500 tabular-nums">
          {g.pct.toFixed(1)}%
        </span>
        <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded-sm flex items-end overflow-hidden">
          <div
            style={{ height: `${Math.max(2, (g.pct / maxPct) * 100)}%`, backgroundColor: color }}
            className="w-full rounded-sm transition-all duration-300"
            role="img"
            aria-label={`${g.label}: ${g.pct.toFixed(1)}%`}
          />
        </div>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight">
          {g.label.replace('L. ', '').replace('R. ', '')}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Finger Usage
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {basis === 'sequences' ? 'based on test sequences' : 'based on English frequency'}
          </span>
        </div>
        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>
            Left <span className="font-semibold text-gray-700 dark:text-gray-200">{left.toFixed(1)}%</span>
          </span>
          <span>
            Right <span className="font-semibold text-gray-700 dark:text-gray-200">{right.toFixed(1)}%</span>
          </span>
        </div>
      </div>

      <div className="flex gap-1 items-end">
        {leftGroups.map(renderFingerBar)}
        <div className="w-px shrink-0 self-stretch bg-gray-200 dark:bg-gray-700 mx-0.5" aria-hidden />
        {thumbGroups.map(renderFingerBar)}
        <div className="w-px shrink-0 self-stretch bg-gray-200 dark:bg-gray-700 mx-0.5" aria-hidden />
        {rightGroups.map(renderFingerBar)}
      </div>

      <div className="mt-1 flex items-center text-xs text-gray-400 dark:text-gray-500">
        <span className="flex-1 text-center pr-5">← Left hand</span>
        <span className="flex-1 text-center pl-5">Right hand →</span>
      </div>
    </div>
  );
}
