import { useCallback, useEffect, useRef, useState } from 'react';
import type { Sequence, SequenceResult, TestStatus } from '../../types';
import { useTimer } from '../../hooks/useTimer';

export interface TestStreamController {
  currentIndex: number;
  currentCharIndex: number;
  awaitingSpace: boolean;
  status: TestStatus;
  results: SequenceResult[];
  prevSequence: Sequence | null;
  currentSequence: Sequence | null;
  nextSequence: Sequence | null;
  progressPct: number;
  handleKeyDown: (e: KeyboardEvent) => void;
}

export function useTestStreamController(
  sequences: Sequence[],
  onComplete: (results: SequenceResult[]) => void,
): TestStreamController {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [awaitingSpace, setAwaitingSpace] = useState(false);
  const [status, setStatus] = useState<TestStatus>('idle');
  const [results, setResults] = useState<SequenceResult[]>([]);
  const [_errorCount, setErrorCount] = useState(0);

  const timer = useTimer();
  const resultsRef = useRef<SequenceResult[]>([]);
  const errorCountRef = useRef(0);
  const pendingElapsedRef = useRef(0);
  const keypressTimesRef = useRef<number[]>([]);

  const scoredSequences = sequences.filter(s => !s.isWarmup);
  const allSequences = sequences;

  const currentSequence = allSequences[currentIndex] ?? null;
  const prevSequence = currentIndex > 0 ? (allSequences[currentIndex - 1] ?? null) : null;
  const nextSequence = allSequences[currentIndex + 1] ?? null;

  const totalScored = scoredSequences.length;
  const completedScored = results.filter(r => {
    const seq = sequences.find(s => s.id === r.sequenceId);
    return seq && !seq.isWarmup;
  }).length;
  const progressPct = totalScored > 0 ? (completedScored / totalScored) * 100 : 0;

  const advanceSequence = useCallback(
    (durationMs: number, errors: number) => {
      if (!currentSequence) return;

      const wpm = currentSequence.text.replace(/\s/g, '').length / 5 / (durationMs / 60000);
      const times = keypressTimesRef.current;
      const t0 = times[0] ?? 0;
      const keyTimestamps = times.map(t => Math.round(t - t0));
      const keyIntervals = times.slice(1).map((t, i) => t - times[i]!);
      keypressTimesRef.current = [];
      const result: SequenceResult = {
        sequenceId: currentSequence.id,
        category: currentSequence.category,
        wpm: Math.round(wpm * 10) / 10,
        errorCount: errors,
        durationMs,
        keyIntervals,
        keyTimestamps,
      };

      const newResults = [...resultsRef.current, result];
      resultsRef.current = newResults;
      setResults(newResults);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= allSequences.length) {
        setStatus('complete');
        onComplete(newResults.filter(r => {
          const seq = sequences.find(s => s.id === r.sequenceId);
          return seq && !seq.isWarmup;
        }));
      } else {
        setCurrentIndex(nextIndex);
        setCurrentCharIndex(0);
        setAwaitingSpace(false);
        errorCountRef.current = 0;
        setErrorCount(0);
        timer.reset();
        setStatus('running');
      }
    },
    [currentIndex, currentSequence, awaitingSpace, allSequences, onComplete, sequences, timer],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!currentSequence) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const typedChar = e.key;
      let nextExpectedIndex = currentCharIndex;
      let waitingForSpace = awaitingSpace;

      if (status === 'idle') {
        setStatus('running');
        timer.start();
        // Do not return here: the first key should also be evaluated as input.
      }

      if (status === 'error') {
        setStatus('running');
        timer.start();
        setCurrentCharIndex(0);
        setAwaitingSpace(false);
        keypressTimesRef.current = [];
        errorCountRef.current += 1;
        setErrorCount(prev => prev + 1);
        nextExpectedIndex = 0;
        waitingForSpace = false;
      }

      if (status !== 'running' && status !== 'idle' && status !== 'error') return;

      if (timer.elapsedMs === 0) timer.start();

      // Waiting for the inter-word space
      if (waitingForSpace) {
        if (typedChar === ' ') {
          advanceSequence(pendingElapsedRef.current, errorCountRef.current);
        }
        // Any other key is ignored while awaiting space
        return;
      }

      const expectedChar = currentSequence.text[nextExpectedIndex];
      if (typedChar === expectedChar) {
        keypressTimesRef.current.push(performance.now());
        const nextCharIndex = nextExpectedIndex + 1;
        if (nextCharIndex >= currentSequence.text.length) {
          const elapsed = timer.stop();
          // If this is the last sequence, finish immediately
          if (currentIndex === allSequences.length - 1) {
            advanceSequence(elapsed, errorCountRef.current);
          } else {
            // Park the caret on the space; wait for the user to press space
            pendingElapsedRef.current = elapsed;
            setCurrentCharIndex(nextCharIndex); // points past last alpha → space in flat stream
            setAwaitingSpace(true);
          }
        } else {
          setCurrentCharIndex(nextCharIndex);
        }
      } else {
        setStatus('error');
      }
    },
    [currentSequence, status, currentCharIndex, timer, advanceSequence],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    currentIndex,
    currentCharIndex,
    awaitingSpace,
    status,
    results,
    prevSequence,
    currentSequence,
    nextSequence,
    progressPct,
    handleKeyDown,
  };
}


