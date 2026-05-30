import type { TestStatus } from '../../types';

interface WordDisplayProps {
  text: string;
  currentCharIndex: number;
  status: TestStatus;
}

type CharState = 'correct' | 'wrong' | 'current' | 'untyped';

function getCharState(charIdx: number, currentCharIndex: number, status: TestStatus): CharState {
  if (charIdx < currentCharIndex) return 'correct';
  if (charIdx === currentCharIndex && status === 'error') return 'wrong';
  if (charIdx === currentCharIndex) return 'current';
  return 'untyped';
}

const CHAR_CLASSES: Record<CharState, string> = {
  correct: 'text-green-400',
  wrong:   'text-red-400',
  current: 'text-white',
  untyped: 'text-zinc-500',
};

export function WordDisplay({ text, currentCharIndex, status }: WordDisplayProps) {
  return (
    <span className="font-mono text-2xl tracking-widest" aria-hidden="true">
      {[...text].map((char, idx) => {
        const state = getCharState(idx, currentCharIndex, status);
        const isCurrent = idx === currentCharIndex;
        return (
          <span key={idx} className={`relative ${CHAR_CLASSES[state]}`}>
            {isCurrent && (
              <span className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-white animate-pulse" />
            )}
            {char === ' ' ? '\u00a0' : char}
          </span>
        );
      })}
    </span>
  );
}
