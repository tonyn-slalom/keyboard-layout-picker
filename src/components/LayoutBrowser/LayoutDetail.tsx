import type { Layout } from '../../types';
import { KeyboardViz } from '../KeyboardViz/KeyboardViz';
import { FingerUsageChart } from '../FingerUsage/FingerUsageChart';
import { TryoutPanel } from '../Tryout/TryoutPanel';

interface LayoutDetailProps {
  layout: Layout;
  allLayouts: Layout[];
}

const STAT_ROWS: Array<{ label: string; key: keyof Layout['stats']; isGoodLow?: boolean }> = [
  { label: 'SFB %',           key: 'sfbPct',          isGoodLow: true },
  { label: 'Skip Bigram %',   key: 'skipBigramPct',   isGoodLow: true },
  { label: 'LSB %',           key: 'lsbPct',          isGoodLow: true },
  { label: 'Scissors %',      key: 'scissorsPct',     isGoodLow: true },
  { label: 'Pinky Scissors %',key: 'pinkyScissorsPct',isGoodLow: true },
  { label: 'Alt %',           key: 'altPct' },
  { label: 'Roll-in %',       key: 'rollInPct' },
  { label: 'Roll-out %',      key: 'rollOutPct' },
  { label: 'Redirect %',      key: 'redirectPct',     isGoodLow: true },
  { label: 'Pinky Off-home %',key: 'offHomePinkyPct', isGoodLow: true },
  { label: 'Effort',          key: 'effort',          isGoodLow: true },
  { label: 'Distance',        key: 'distance',        isGoodLow: true },
];

function formatStat(value: number | undefined): string {
  if (value === undefined || value === -1) return '—';
  return value % 1 === 0 ? value.toString() : value.toFixed(2);
}

export function LayoutDetail({ layout }: LayoutDetailProps) {

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {layout.name}
        </h2>
        {layout.requiresThumbCluster && (
          <span
            className="text-2xl"
            title="Optimized for keyboards with thumb cluster keys"
            aria-label="Requires thumb cluster"
          >
            🦾
          </span>
        )}
      </div>

      <div className="mb-6">
        <KeyboardViz layout={layout} size="lg" />
      </div>

      <div className="mb-6 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <FingerUsageChart layout={layout} />
      </div>

      <table className="w-full text-sm border-collapse mb-6">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Stat</th>
            <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {STAT_ROWS.map(({ label, key }) => (
            <tr
              key={key}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="py-2 text-gray-700 dark:text-gray-300">{label}</td>
              <td className="py-2 text-right font-mono text-gray-900 dark:text-gray-100">
                {formatStat(layout.stats[key] as number | undefined)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-wrap gap-3">
        <a
          href={`https://cyanophage.github.io/playground.html#${layout.cyanophageRef}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${layout.name} in Cyanophage playground`}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Open in Cyanophage ↗
        </a>
        {layout.source && (
          <a
            href={layout.source}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View source for ${layout.name}`}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Source ↗
          </a>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Try it out
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Press keys on your QWERTY keyboard — each keystroke is remapped to its {layout.name} equivalent so you can feel where the letters sit.
        </p>
        <TryoutPanel layout={layout} />
      </div>
    </div>
  );
}
