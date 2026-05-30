import { useNavigate } from 'react-router-dom';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { SequenceResult } from '../../types';
import { sequences } from '../../utils/sequences';
import { useTestStreamController } from './TestStream.controller';
import { useTestResults } from '../../context/TestResultsContext';

// Distance from the left edge of the stream container where the caret is pinned
const CARET_X = 200;

type CharState = 'correct' | 'wrong' | 'current' | 'untyped';

const CHAR_CLASSES: Record<CharState, string> = {
  correct: 'text-green-400',
  wrong:   'text-red-500',
  current: 'text-white',
  untyped: 'text-zinc-500',
};

function buildFlatStream(seqs: typeof sequences): { flat: string; seqStarts: number[] } {
  const seqStarts: number[] = [];
  const parts: string[] = [];
  let pos = 0;
  for (let i = 0; i < seqs.length; i++) {
    seqStarts.push(pos);
    parts.push(seqs[i]!.text);
    pos += seqs[i]!.text.length;
    if (i < seqs.length - 1) {
      parts.push(' ');
      pos += 1;
    }
  }
  return { flat: parts.join(''), seqStarts };
}

export function TestStream() {
  const navigate = useNavigate();
  const { dispatch } = useTestResults();

  function handleComplete(results: SequenceResult[]) {
    dispatch({ type: 'SET_RESULTS', results });
    navigate('/results');
  }

  const ctrl = useTestStreamController(sequences, handleComplete);

  const { flat, seqStarts } = useMemo(() => buildFlatStream(sequences), []);
  // When awaitingSpace, currentCharIndex === seq.text.length, which lands exactly on the space in the flat stream
  const globalCharIdx = (seqStarts[ctrl.currentIndex] ?? 0) + ctrl.currentCharIndex;

  const innerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!currentRef.current || !innerRef.current) return;
    const charLeft = currentRef.current.offsetLeft;
    innerRef.current.style.transform = `translateX(${CARET_X - charLeft}px)`;
  }, [globalCharIdx]);

  useEffect(() => {
    if (ctrl.status === 'complete') navigate('/results');
  }, [ctrl.status, navigate]);

  const chars = useMemo(() => [...flat], [flat]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      {/* Progress bar */}
      <div className="w-full max-w-3xl mb-10">
        <div className="flex justify-between text-xs text-zinc-500 mb-1">
          <span>Progress</span>
          <span>{Math.round(ctrl.progressPct)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${ctrl.progressPct}%` }}
          />
        </div>
      </div>

      {/* Stream marquee */}
      <div
        className="w-full max-w-3xl overflow-hidden relative"
        style={{ height: '3rem' }}
        aria-live="polite"
        aria-label="Typing stream"
      >
        {/* Fade-out gradients on each edge */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />

        <div
          ref={innerRef}
          className="whitespace-nowrap transition-transform duration-75 ease-out"
          style={{ willChange: 'transform' }}
        >
          <span className="font-mono text-2xl tracking-widest">
            {chars.map((char, idx) => {
              let state: CharState;
              if (idx < globalCharIdx) state = 'correct';
              else if (idx === globalCharIdx && ctrl.status === 'error') state = 'wrong';
              else if (idx === globalCharIdx) state = 'current';
              else state = 'untyped';

              const isCurrent = idx === globalCharIdx;
              return (
                <span
                  key={idx}
                  ref={isCurrent ? currentRef : undefined}
                  className={`relative ${CHAR_CLASSES[state]}`}
                >
                  {isCurrent && (
                    <span className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-white animate-pulse" />
                  )}
                  {char === ' ' ? '\u00a0' : char}
                </span>
              );
            })}
          </span>
        </div>
      </div>

      <div className="mt-8 h-5">
        {ctrl.status === 'idle' && (
          <p className="text-zinc-500 text-sm animate-pulse">Start typing to begin\u2026</p>
        )}
        {ctrl.status === 'error' && (
          <p className="text-red-400 text-sm">Press any key to retry this sequence</p>
        )}
      </div>
    </div>
  );
}
