import { useCallback, useRef, useState } from 'react';

interface UseTimerReturn {
  elapsedMs: number;
  isRunning: boolean;
  start: () => void;
  stop: () => number;
  reset: () => void;
}

export function useTimer(): UseTimerReturn {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (isRunning) return;
    startTimeRef.current = Date.now() - elapsedMs;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - (startTimeRef.current ?? Date.now()));
    }, 50);
  }, [isRunning, elapsedMs]);

  const stop = useCallback((): number => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    return elapsedMs;
  }, [elapsedMs]);

  const reset = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
    setElapsedMs(0);
    setIsRunning(false);
  }, []);

  return { elapsedMs, isRunning, start, stop, reset };
}
