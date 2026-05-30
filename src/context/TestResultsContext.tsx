import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { SequenceResult } from '../types';

// ─── State & Actions ─────────────────────────────────────────────────────────

interface TestResultsState {
  results: SequenceResult[];
  completedAt: number | null;
}

type TestResultsAction =
  | { type: 'SET_RESULTS'; results: SequenceResult[] }
  | { type: 'CLEAR_RESULTS' };

function testResultsReducer(
  _state: TestResultsState,
  action: TestResultsAction,
): TestResultsState {
  switch (action.type) {
    case 'SET_RESULTS':
      return { results: action.results, completedAt: Date.now() };
    case 'CLEAR_RESULTS':
      return { results: [], completedAt: null };
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface TestResultsContextValue {
  state: TestResultsState;
  dispatch: React.Dispatch<TestResultsAction>;
}

const TestResultsContext = createContext<TestResultsContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface TestResultsProviderProps {
  children: ReactNode;
}

export function TestResultsProvider({ children }: TestResultsProviderProps) {
  const [state, dispatch] = useReducer(testResultsReducer, {
    results: [],
    completedAt: null,
  });

  return (
    <TestResultsContext.Provider value={{ state, dispatch }}>
      {children}
    </TestResultsContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTestResults(): TestResultsContextValue {
  const ctx = useContext(TestResultsContext);
  if (!ctx) {
    throw new Error('useTestResults must be used within a TestResultsProvider');
  }
  return ctx;
}
