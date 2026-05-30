import { useCallback, useMemo, useState } from 'react';
import type { ComfortProfile, Layout } from '../types';
import type { SequenceResult } from '../types';
import type { CategoryId } from '../types';
import { computeComfortProfile, rankLayoutsDetailed, defaultComfortProfile, computeIkiStats } from '../utils/scoring';
import type { RankedLayoutDetailed, CategoryIkiStats } from '../utils/scoring';
import type { DecodedUrl } from '../utils/profileUrl';

export interface ResultsPageController {
  // Derived from test results
  testProfile: ComfortProfile;
  ikiStats: CategoryIkiStats[];
  // Active profile (may be manually overridden)
  activeProfile: ComfortProfile;
  isManualMode: boolean;
  topLayouts: RankedLayoutDetailed[];
  qwertyBoost: boolean;
  // Debug
  debugLayoutId: string | null;
  // Handlers
  handleToggleQwertyBoost: () => void;
  handleCategoryChange: (cat: CategoryId, value: number) => void;
  handleResetProfile: () => void;
  handleToggleManualMode: () => void;
  handleToggleDebug: (layoutId: string) => void;
}

function groupResultsByCategory(
  results: SequenceResult[],
): Partial<Record<CategoryId, SequenceResult[]>> {
  const grouped: Partial<Record<CategoryId, SequenceResult[]>> = {};
  for (const r of results) {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category]!.push(r);
  }
  return grouped;
}

export function useResultsPageController(
  results: SequenceResult[],
  allLayouts: Layout[],
  urlSeed?: DecodedUrl | null,
): ResultsPageController {
  const [qwertyBoost, setQwertyBoost] = useState(urlSeed?.qwertyBoost ?? false);
  const [isManualMode, setIsManualMode] = useState(urlSeed != null);
  const [manualProfile, setManualProfile] = useState<ComfortProfile>(
    urlSeed?.profile ?? defaultComfortProfile,
  );
  const [debugLayoutId, setDebugLayoutId] = useState<string | null>(null);

  const testProfile = useMemo(
    () => computeComfortProfile(groupResultsByCategory(results)),
    [results],
  );

  const ikiStats = useMemo(
    () => computeIkiStats(groupResultsByCategory(results)),
    [results],
  );

  const activeProfile = isManualMode ? manualProfile : testProfile;

  const topLayouts = useMemo(
    () => rankLayoutsDetailed(allLayouts, activeProfile, qwertyBoost).slice(0, 5),
    [allLayouts, activeProfile, qwertyBoost],
  );

  const handleToggleQwertyBoost = useCallback(() => setQwertyBoost(p => !p), []);

  const handleToggleManualMode = useCallback(() => {
    setIsManualMode(prev => {
      // When switching to manual mode, seed with the test-derived profile
      if (!prev) setManualProfile({ ...testProfile });
      return !prev;
    });
  }, [testProfile]);

  const handleCategoryChange = useCallback((cat: CategoryId, value: number) => {
    setManualProfile(prev => ({ ...prev, [cat]: Math.max(0, Math.min(1, value)) }));
  }, []);

  const handleResetProfile = useCallback(() => {
    setManualProfile({ ...testProfile });
  }, [testProfile]);

  const handleToggleDebug = useCallback((layoutId: string) => {
    setDebugLayoutId(prev => (prev === layoutId ? null : layoutId));
  }, []);

  return {
    testProfile,
    ikiStats,
    activeProfile,
    isManualMode,
    topLayouts,
    qwertyBoost,
    debugLayoutId,
    handleToggleQwertyBoost,
    handleCategoryChange,
    handleResetProfile,
    handleToggleManualMode,
    handleToggleDebug,
  };
}
