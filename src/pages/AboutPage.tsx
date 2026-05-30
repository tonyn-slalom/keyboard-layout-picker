import { Link } from 'react-router-dom';
import { sequences } from '../utils/sequences';
import type { CategoryId } from '../types';

interface DetailSection {
  heading: string;
  body: string;
}

interface CategoryDetail {
  id: CategoryId;
  name: string;
  type: 'Positive signal' | 'Negative signal';
  description: string;
}

const PROCESS_STEPS: DetailSection[] = [
  {
    heading: '1) Learn your typing behavior',
    body: 'KLP runs a short sequence-based test that captures how comfortably and accurately you type different movement patterns. The goal is to understand your preferences, not to produce a generic speed ranking.',
  },
  {
    heading: '2) Build your comfort profile',
    body: 'Your per-sequence speed and accuracy are blended into category scores. This creates a personal comfort profile that represents what your hands naturally like or dislike when typing.',
  },
  {
    heading: '3) Compare profile to layout stats',
    body: 'Each candidate layout has measured ergonomic stats. KLP maps your category scores against those stats and computes a compatibility score for every layout.',
  },
  {
    heading: '4) Explain the top matches',
    body: 'Results show match percentage, radar profile, and reason summaries. Instead of a black-box pick, KLP explains why a layout appears near the top.',
  },
];

const CATEGORY_DETAILS: CategoryDetail[] = [
  {
    id: 'alt',
    name: 'Alternation (alt)',
    type: 'Positive signal',
    description:
      'Frequent left-right hand alternation can feel rhythmic and stable. Higher score means you generally perform better when motion alternates between hands.',
  },
  {
    id: 'rollIn',
    name: 'Inward rolls (rollIn)',
    type: 'Positive signal',
    description:
      'Inward rolls are patterns where finger travel moves toward the index fingers. Many typists find these fluid. Higher score means you benefit from them.',
  },
  {
    id: 'rollOut',
    name: 'Outward rolls (rollOut)',
    type: 'Positive signal',
    description:
      'Outward rolls move away from index fingers. Some typists still prefer them when cadence is smooth. Higher score means these patterns are comfortable for you.',
  },
  {
    id: 'thumbAlt',
    name: 'Thumb alternation (thumbAlt)',
    type: 'Positive signal',
    description:
      'Measures how naturally you alternate with thumb-driven spacing patterns. This helps evaluate layouts that rely more on thumb clusters or split keyboard usage.',
  },
  {
    id: 'sfbStrong',
    name: 'Same-finger bigrams strong (sfbStrong)',
    type: 'Negative signal',
    description:
      'Tracks same-finger bigrams on stronger fingers (index and middle). Higher score means you are more sensitive to this friction and layouts with fewer such pairs should rank higher.',
  },
  {
    id: 'sfbWeak',
    name: 'Same-finger bigrams weak (sfbWeak)',
    type: 'Negative signal',
    description:
      'Tracks same-finger bigrams on weaker fingers (ring and pinky). This usually has higher comfort impact. Higher score indicates stronger dislike of these patterns.',
  },
  {
    id: 'lsb',
    name: 'Lateral stretch bigrams (lsb)',
    type: 'Negative signal',
    description:
      'Captures side-stretch motions that can feel unstable at speed. Higher score means layouts with lower lateral stretch frequency should be preferred.',
  },
  {
    id: 'scissorsCenter',
    name: 'Scissors center (scissorsCenter)',
    type: 'Negative signal',
    description:
      'Scissor motions between non-pinky fingers can interrupt flow. Higher score indicates your profile penalizes layouts with frequent center scissors.',
  },
  {
    id: 'scissorsPinky',
    name: 'Scissors pinky (scissorsPinky)',
    type: 'Negative signal',
    description:
      'Pinky scissors are often more fatiguing than center scissors. Higher score means this pattern is more disruptive for you and should be minimized.',
  },
  {
    id: 'redirect',
    name: 'Redirects (redirect)',
    type: 'Negative signal',
    description:
      'Redirects are trigrams where motion reverses direction. Higher score means you lose comfort in these abrupt transitions and benefit from layouts that reduce them.',
  },
  {
    id: 'pinky',
    name: 'Pinky load (pinky)',
    type: 'Negative signal',
    description:
      'Represents tolerance for pinky-heavy work. Higher score means you prefer layouts that offload pinky strain and reduce extended pinky travel.',
  },
  {
    id: 'skipBigram',
    name: 'Skip bigrams (skipBigram)',
    type: 'Negative signal',
    description:
      'Skip bigrams represent longer or less direct movement jumps. Higher score indicates stronger penalty toward layouts with elevated skip bigram rates.',
  },
];

const LAYOUT_DATA_NOTES: string[] = [
  'Layout stats are sourced from curated ergonomic references and mapped into a common schema for fair comparison.',
  'KLP stores multiple movement metrics including SFB, LSB, scissors, alternation, rolls, redirects, skip bigrams, and pinky/off-home indicators.',
  'Layouts can include ANSI, ortholinear, and columnar form factors, with optional thumb-cluster metadata where available.',
  'Recommendations are local and deterministic from your captured test results and layout stat values.',
];

const FAQ: DetailSection[] = [
  {
    heading: 'Does KLP tell me the universally best layout?',
    body: 'No. KLP is intentionally personal. The highest-ranked layout is the one that best matches your measured movement preferences, not an absolute global winner.',
  },
  {
    heading: 'How long is the test and why is it short?',
    body: 'The test is designed to be quick enough to complete in one sitting while still sampling enough motion patterns to produce a stable recommendation profile.',
  },
  {
    heading: 'Can I still use KLP if I am new to non-QWERTY layouts?',
    body: 'Yes. KLP is useful for beginners because it highlights ergonomic tendencies and lets you compare trade-offs before investing time into retraining.',
  },
  {
    heading: 'Do I need to share data or create an account?',
    body: 'No account is required for core usage. The app is focused on local interaction and immediate feedback rather than profile collection.',
  },
];

const CATEGORY_SEQUENCE_MAP: Record<CategoryId, string[]> = {
  alt: [],
  rollIn: [],
  rollOut: [],
  thumbAlt: [],
  sfbStrong: [],
  sfbWeak: [],
  lsb: [],
  scissorsCenter: [],
  scissorsPinky: [],
  redirect: [],
  pinky: [],
  skipBigram: [],
};

for (const sequence of sequences) {
  if (sequence.isWarmup) {
    continue;
  }
  CATEGORY_SEQUENCE_MAP[sequence.category].push(sequence.text);
}

function getSequenceTooltip(categoryId: CategoryId) {
  const categorySequences = CATEGORY_SEQUENCE_MAP[categoryId];
  return `Scored test sequences (${categorySequences.length}): ${categorySequences.join(', ')}`;
}

function renderTypeBadge(type: CategoryDetail['type']) {
  const baseClass = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold';
  const positiveClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300';
  const negativeClass = 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300';

  const badgeClass = type === 'Positive signal' ? `${baseClass} ${positiveClass}` : `${baseClass} ${negativeClass}`;

  return <span className={badgeClass}>{type}</span>;
}

function renderSequenceTooltip(categoryId: CategoryId, categoryName: string) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={`Show test sequences used for ${categoryName}`}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300 text-xs font-bold text-cyan-700 transition-colors hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-cyan-700 dark:text-cyan-300 dark:hover:bg-cyan-950/40"
      >
        i
      </button>
      <div className="pointer-events-none absolute right-0 top-9 z-10 w-80 rounded-xl border border-gray-200 bg-white p-3 text-xs leading-5 text-gray-700 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        {getSequenceTooltip(categoryId)}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 via-cyan-50 to-white p-8 shadow-sm dark:border-gray-800 dark:from-blue-950/60 dark:via-cyan-950/40 dark:to-gray-900">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            About Keyboard Layout Picker
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Learn how KLP works, what it measures, and how to use results with confidence
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-7 text-gray-700 dark:text-gray-300 sm:text-lg">
            Keyboard Layout Picker (KLP) is a decision-support tool for typists exploring alternative keyboard layouts.
            It combines a focused typing test with layout ergonomics data so you can discover layouts that match
            your movement comfort profile, not just someone else&apos;s leaderboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/test"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Start the test
            </Link>
            <Link
              to="/browse"
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Browse layouts
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What this site is for</h2>
        <p className="mt-3 text-base leading-7 text-gray-700 dark:text-gray-300">
          KLP helps you answer one practical question: <strong>which layout is most likely to feel good for your hands over time?</strong>
          Instead of relying on generic rankings, it measures how you respond to specific movement categories,
          then compares that profile against structured layout statistics.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Who should use KLP</h3>
            <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
              Curious QWERTY users, ergonomic keyboard enthusiasts, split/columnar users, and anyone trying
              to reduce finger strain while keeping realistic expectations about retraining effort.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">What KLP does not do</h3>
            <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
              It does not guarantee injury prevention, instant speed gains, or a universal best layout.
              It gives evidence-backed guidance so you can choose a starting point with fewer blind spots.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How recommendations are produced</h2>
        <div className="mt-6 space-y-4">
          {PROCESS_STEPS.map(step => (
            <article key={step.heading} className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{step.heading}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Movement categories KLP evaluates</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-gray-700 dark:text-gray-300">
          Categories are grouped into positive signals (more is generally better for your profile) and negative signals
          (higher sensitivity means you prefer layouts that minimize those patterns).
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {CATEGORY_DETAILS.map(category => (
            <article key={category.name} className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                <div className="flex items-center gap-2">
                  {renderTypeBadge(category.type)}
                  {renderSequenceTooltip(category.id, category.name)}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">{category.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Layout data and methodology notes</h2>
        <div className="mt-6 rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
          <ul className="space-y-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
            {LAYOUT_DATA_NOTES.map(note => (
              <li key={note} className="flex gap-3">
                <span aria-hidden className="mt-1 h-2 w-2 rounded-full bg-cyan-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy and user expectations</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Local-first usage model</h3>
            <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
              KLP is designed for immediate in-browser analysis flow: take test, review recommendations,
              and compare layouts without requiring account onboarding.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Interpretation guidance</h3>
            <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
              Use top matches as a shortlist, not a final verdict. Real-world adaptation includes muscle memory,
              language frequency, keyboard hardware, and your willingness to retrain.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently asked questions</h2>
        <div className="mt-6 space-y-4">
          {FAQ.map(item => (
            <article key={item.heading} className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{item.heading}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}