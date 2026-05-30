import { Navigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { CategoryId, Layout } from '../types';
import layoutsData from '../data/layouts.json';
import { useTestResults } from '../context/TestResultsContext';
import { useResultsPageController } from './ResultsPage.controller';
import { RadarChart } from '../components/Results/RadarChart';
import { RecommendationCard } from '../components/Results/RecommendationCard';
import { CATEGORY_IDS, POSITIVE_CATEGORIES } from '../utils/scoring';
import type { RankedLayoutDetailed, ScoringBreakdown, CategoryIkiStats } from '../utils/scoring';
import { encodeProfile, decodeProfile } from '../utils/profileUrl';

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

const CATEGORY_DESCRIPTIONS: Record<CategoryId, string> = {
  alt:            'Alternation — consecutive bigrams typed on opposite hands. High alt = balanced hand usage.',
  rollIn:         'Roll-in — 3+ keys on the same hand moving from pinky toward index (inward roll). Generally fast and comfortable.',
  rollOut:        'Roll-out — 3+ keys on the same hand moving from index toward pinky (outward roll). Slightly less comfortable than roll-in.',
  thumbAlt:       'Thumb alternation — a finger key immediately followed or preceded by a thumb key (space or alpha on thumb cluster). Unique to thumb-cluster layouts.',
  sfbStrong:      'Same-finger bigram (strong fingers) — two consecutive keys typed by the same index or middle finger. Causes strain and slows typing.',
  sfbWeak:        'Same-finger bigram (weak fingers) — two consecutive keys typed by the same ring or pinky finger. More fatiguing than SFB on strong fingers.',
  lsb:            'Lateral stretch bigram — index or middle finger reaches ≥2 columns sideways to hit the next key. Causes horizontal hand movement.',
  scissorsCenter: 'Scissors (center fingers) — a top-row and bottom-row key typed consecutively by adjacent non-pinky fingers on the same hand, requiring a large vertical stretch.',
  scissorsPinky:  'Scissors (pinky) — a top-row and bottom-row key typed consecutively where one end is the pinky, the most vulnerable finger for vertical stretch.',
  redirect:       'Redirect — a same-hand run of 3+ keys that reverses direction mid-sequence (e.g. inward then outward). Disrupts typing rhythm.',
  pinky:          'Pinky off-home — frequency of off-home-row keypresses assigned to the weakest finger. High values increase fatigue.',
  skipBigram:     'Skip bigram (SFS) — the same finger is used for two keys with exactly one key in between. Less disruptive than SFB but still slightly awkward.',
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="relative inline-flex items-center cursor-help"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className="absolute left-0 top-full mt-1 z-50 w-64 rounded-lg bg-gray-900 dark:bg-gray-700 text-gray-100 text-xs px-3 py-2 shadow-lg border border-gray-700 dark:border-gray-600 pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}

// ─── Debug breakdown table ────────────────────────────────────────────────────

interface DebugPanelProps {
  ranked: RankedLayoutDetailed;
  qwertyBoost: boolean;
}

function DebugPanel({ ranked, qwertyBoost }: DebugPanelProps) {
  const { breakdown, compatScore, qwertySim, score } = ranked;

  function barWidth(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  function rowColor(b: ScoringBreakdown): string {
    if (b.contribution > 0.06) return 'bg-green-900/30';
    if (b.contribution < 0.02) return 'bg-red-900/20';
    return '';
  }

  return (
    <div className="mt-3 rounded-lg border border-gray-700 bg-gray-900 p-4 text-xs font-mono">
      <div className="flex gap-6 mb-3 text-gray-400">
        <span>Compat score: <span className="text-white">{compatScore.toFixed(4)}</span></span>
        <span>QWERTY sim: <span className="text-white">{(qwertySim * 100).toFixed(1)}%</span></span>
        {qwertyBoost && (
          <span>Final (0.8c+0.2q): <span className="text-white">{score.toFixed(4)}</span></span>
        )}
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-gray-500 border-b border-gray-700">
            <th className="text-left py-1 pr-2">Category</th>
            <th className="text-center py-1 px-2">Dir</th>
            <th className="text-right py-1 px-2">User score</th>
            <th className="text-right py-1 px-2">Raw stat</th>
            <th className="text-right py-1 px-2">Norm stat</th>
            <th className="text-right py-1 pl-2">Contribution</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map(b => (
            <tr key={b.category} className={`border-b border-gray-800 ${rowColor(b)}`}>
              <td className="py-1 pr-2 text-gray-300"><Tooltip text={CATEGORY_DESCRIPTIONS[b.category]}><span>{CATEGORY_LABELS[b.category]}</span></Tooltip></td>
              <td className="py-1 px-2 text-center">
                <span className={b.direction === 'positive' ? 'text-green-400' : 'text-red-400'}>
                  {b.direction === 'positive' ? '▲' : '▼'}
                </span>
              </td>
              <td className="py-1 px-2 text-right">
                <span className="text-blue-300">{(b.userScore * 100).toFixed(0)}%</span>
              </td>
              <td className="py-1 px-2 text-right text-gray-400">
                {b.rawStat.toFixed(2)}
              </td>
              <td className="py-1 px-2 text-right">
                <div className="flex items-center gap-1 justify-end">
                  <div className="w-16 bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: barWidth(b.normalizedStat) }}
                    />
                  </div>
                  <span className="text-gray-400 w-8">{(b.normalizedStat * 100).toFixed(0)}%</span>
                </div>
              </td>
              <td className="py-1 pl-2 text-right">
                <span className={b.contribution > 0.06 ? 'text-green-400 font-bold' : 'text-gray-300'}>
                  {b.contribution.toFixed(4)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="text-gray-400 border-t border-gray-600">
            <td colSpan={5} className="pt-2 text-right pr-2">Total (/12) =</td>
            <td className="pt-2 pl-2 text-right text-white font-bold">
              {compatScore.toFixed(4)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Profile editor ───────────────────────────────────────────────────────────

interface ProfileEditorProps {
  activeProfile: Record<CategoryId, number>;
  testProfile: Record<CategoryId, number>;
  isEditable: boolean;
  hasTestData: boolean;
  onCategoryChange: (cat: CategoryId, value: number) => void;
  onReset: () => void;
}

function ProfileEditor({ activeProfile, isEditable, hasTestData, onCategoryChange, onReset }: Omit<ProfileEditorProps, 'testProfile'> & { testProfile?: Record<CategoryId, number> }) {
  const positives = CATEGORY_IDS.filter(c => POSITIVE_CATEGORIES.has(c));
  const negatives = CATEGORY_IDS.filter(c => !POSITIVE_CATEGORIES.has(c));

  function renderRow(cat: CategoryId) {
    const value = activeProfile[cat];
    const isDefault = !hasTestData;
    return (
      <div key={cat} className="flex items-center gap-3">
        <label
          htmlFor={`slider-${cat}`}
          className="w-36 text-xs text-gray-400 dark:text-gray-500 shrink-0"
        >
          <Tooltip text={CATEGORY_DESCRIPTIONS[cat]}>
            <span>{CATEGORY_LABELS[cat]}</span>
          </Tooltip>
        </label>
        {isEditable ? (
          <input
            id={`slider-${cat}`}
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={value}
            onChange={e => onCategoryChange(cat, parseFloat(e.target.value))}
            aria-label={`${CATEGORY_LABELS[cat]} comfort score`}
            className="flex-1 accent-blue-500"
          />
        ) : (
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${isDefault ? 'bg-gray-400 dark:bg-gray-500' : POSITIVE_CATEGORIES.has(cat) ? 'bg-green-500' : 'bg-red-400'}`}
              style={{ width: `${Math.round(value * 100)}%` }}
            />
          </div>
        )}
        <span className="w-10" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Comfort Profile
          {isEditable && (
            <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
              manual
            </span>
          )}
        </h2>
        {isEditable && (
          <button
            onClick={onReset}
            aria-label="Reset profile to test-derived values"
            className="text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Reset to test
          </button>
        )}
      </div>
      {isEditable && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Grey values are test-derived. Yellow = manually changed.
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
        <div>
          <p className="text-xs font-semibold text-green-500 mb-2 uppercase tracking-wide">
            Positive (higher = you like it)
          </p>
          {positives.map(renderRow)}
        </div>
        <div>
          <p className="text-xs font-semibold text-red-400 mb-2 uppercase tracking-wide">
            Negative (higher = you tolerate it)
          </p>
          {negatives.map(renderRow)}
        </div>
      </div>
    </div>
  );
}

// ─── IKI stats table ──────────────────────────────────────────────────────────

interface IkiStatsTableProps {
  stats: CategoryIkiStats[];
}

function IkiStatsTable({ stats }: IkiStatsTableProps) {
  const maxIki = Math.max(...stats.map(s => s.trimmedIki), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        Keystroke Timing
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Per-category inter-keystroke interval (ms). Lower = faster flow. Consistency = 1 − CV.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-1 pr-3 font-medium">Category</th>
              <th className="text-right py-1 px-3 font-medium">
                <Tooltip text="Trimmed median inter-keystroke interval in milliseconds. The slowest 10% of keypresses are excluded to reduce the effect of hesitations. Lower = faster, more natural flow.">
                  <span>IKI (ms)</span>
                </Tooltip>
              </th>
              <th className="py-1 px-3 font-medium w-40">
                <Tooltip text="Visual representation of IKI. The longest bar is the slowest category — shorter bars mean faster flow for that motion type.">
                  <span>Speed</span>
                </Tooltip>
              </th>
              <th className="text-right py-1 px-3 font-medium">
                <Tooltip text="How rhythmically even your keypresses were: 1 − (standard deviation ÷ mean). Green ≥70% means steady rhythm; red below 50% means inconsistent timing, often a sign the motion feels unnatural.">
                  <span>Consistency</span>
                </Tooltip>
              </th>
              <th className="text-right py-1 pl-3 font-medium">
                <Tooltip text="Total number of sequence restarts in this category. A low IKI paired with high errors means you were rushing and making mistakes — accuracy matters as much as speed.">
                  <span>Errors</span>
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => {
              const isPositive = POSITIVE_CATEGORIES.has(s.category);
              const barPct = s.trimmedIki > 0 ? Math.round((s.trimmedIki / maxIki) * 100) : 0;
              const consistency = Math.max(0, Math.round((1 - s.cv) * 100));
              const noData = s.sampleCount === 0;
              return (
                <tr key={s.category} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-1.5 pr-3">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-0.5 ${isPositive ? 'bg-green-500' : 'bg-red-400'}`} />
                    <Tooltip text={CATEGORY_DESCRIPTIONS[s.category]}>
                      <span className="text-gray-700 dark:text-gray-300">
                        {CATEGORY_LABELS[s.category]}
                      </span>
                    </Tooltip>
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono text-gray-600 dark:text-gray-400">
                    {noData ? '—' : `${s.trimmedIki.toFixed(0)}`}
                  </td>
                  <td className="py-1.5 px-3">
                    {noData ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono">
                    {noData ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <span className={consistency >= 70 ? 'text-green-600 dark:text-green-400' : consistency >= 50 ? 'text-gray-600 dark:text-gray-300' : 'text-red-500 dark:text-red-400'}>
                        {consistency}%
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 pl-3 text-right font-mono">
                    {noData ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <span className={s.errors === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                        {s.errors}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { state } = useTestResults();
  const [searchParams] = useSearchParams();
  const urlSeed = decodeProfile(searchParams);

  if (state.results.length === 0 && urlSeed === null) {
    return <Navigate to="/test" replace />;
  }

  return <ResultsPageInner urlSeed={urlSeed} />;
}

interface ResultsPageInnerProps {
  urlSeed: ReturnType<typeof decodeProfile>;
}

function ResultsPageInner({ urlSeed }: ResultsPageInnerProps) {
  const { state } = useTestResults();
  const [, setSearchParams] = useSearchParams();
  const ctrl = useResultsPageController(state.results, layouts, urlSeed);

  // Keep URL in sync with current active profile
  useEffect(() => {
    setSearchParams(
      encodeProfile(ctrl.activeProfile, ctrl.qwertyBoost, ctrl.excludeAlphaThumbLayouts),
      { replace: true },
    );
  }, [ctrl.activeProfile, ctrl.qwertyBoost, ctrl.excludeAlphaThumbLayouts, setSearchParams]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Your Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {urlSeed && state.results.length === 0
              ? 'Viewing shared results. '
              : 'Based on your typing test, here are your top layout matches. '}
            <button
              onClick={() => {
                const url = `${window.location.origin}${window.location.pathname}${window.location.search}`;
                navigator.clipboard.writeText(url).catch(() => {});
              }}
              className="text-sm text-blue-500 hover:underline"
              aria-label="Copy shareable link to clipboard"
            >
              Copy link
            </button>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Radar chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Comfort Radar
            </h2>
            <RadarChart profile={ctrl.activeProfile} />
          </div>

          {/* Options panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Ranking Options
            </h2>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ctrl.qwertyBoost}
                onChange={ctrl.handleToggleQwertyBoost}
                aria-label="Prioritize easy transition from QWERTY"
                className="mt-1 w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Prioritize QWERTY transition</span>
                <br />
                Boosts layouts with more keys in familiar positions (20% weight).
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ctrl.isManualMode}
                onChange={ctrl.handleToggleManualMode}
                aria-label="Manually edit comfort profile"
                className="mt-1 w-4 h-4 accent-yellow-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Manual profile override</span>
                <br />
                Edit sliders below to see how different preferences change results.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ctrl.excludeAlphaThumbLayouts}
                onChange={ctrl.handleToggleExcludeAlphaThumbLayouts}
                aria-label="Exclude alpha-thumb layouts from ranking"
                className="mt-1 w-4 h-4 accent-cyan-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Exclude alpha-thumb layouts</span>
                <br />
                Hides layouts that require thumb-cluster alpha keys from recommendations.
              </span>
            </label>
          </div>
        </div>

        {/* Profile editor */}
        <ProfileEditor
          activeProfile={ctrl.activeProfile}
          testProfile={ctrl.testProfile}
          isEditable={ctrl.isManualMode}
          hasTestData={state.results.length > 0}
          onCategoryChange={ctrl.handleCategoryChange}
          onReset={ctrl.handleResetProfile}
        />

        {/* IKI stats (only when test results exist) */}
        {state.results.length > 0 && (
          <IkiStatsTable stats={ctrl.ikiStats} />
        )}

        {/* Top 5 recommendations */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Top Recommendations
          </h2>
          <div className="space-y-4">
            {ctrl.topLayouts.map((ranked, i) => (
              <div key={ranked.layout.id}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <RecommendationCard ranked={ranked} rank={i + 1} />
                  </div>
                  <button
                    onClick={() => ctrl.handleToggleDebug(ranked.layout.id)}
                    aria-label={`${ctrl.debugLayoutId === ranked.layout.id ? 'Hide' : 'Show'} scoring debug for ${ranked.layout.name}`}
                    className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      ctrl.debugLayoutId === ranked.layout.id
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {ctrl.debugLayoutId === ranked.layout.id ? '▲ Hide debug' : '▼ Debug'}
                  </button>
                </div>
                {ctrl.debugLayoutId === ranked.layout.id && (
                  <DebugPanel ranked={ranked} qwertyBoost={ctrl.qwertyBoost} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

