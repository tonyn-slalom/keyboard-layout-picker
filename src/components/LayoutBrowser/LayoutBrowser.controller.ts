import { useCallback, useMemo, useState } from 'react';
import type { Layout } from '../../types';

export type SortKey = 'sfbPct' | 'altPct' | 'rollInPct' | 'rollOutPct' | 'redirectPct' | 'lsbPct' | 'matchPct';

export interface LayoutBrowserController {
  filtered: Layout[];
  query: string;
  sortKey: SortKey;
  sortAsc: boolean;
  handleQueryChange: (q: string) => void;
  handleSortChange: (key: SortKey) => void;
}

function filterLayouts(layouts: Layout[], query: string): Layout[] {
  const q = query.toLowerCase().trim();
  if (!q) return layouts;
  return layouts.filter(l => l.name.toLowerCase().includes(q));
}

function sortLayouts(layouts: Layout[], key: SortKey, asc: boolean, matchPcts?: Record<string, number>): Layout[] {
  return [...layouts].sort((a, b) => {
    if (key === 'matchPct') {
      const ma = matchPcts?.[a.id] ?? -1;
      const mb = matchPcts?.[b.id] ?? -1;
      return asc ? ma - mb : mb - ma;
    }
    type StatSortKey = Exclude<SortKey, 'matchPct'>;
    const diff = a.stats[key as StatSortKey] - b.stats[key as StatSortKey];
    return asc ? diff : -diff;
  });
}

export function useLayoutBrowserController(
  layouts: Layout[],
  matchPcts?: Record<string, number>,
): LayoutBrowserController {
  const [query, setQuery] = useState('');
  const defaultSort: SortKey = matchPcts ? 'matchPct' : 'sfbPct';
  const [sortKey, setSortKey] = useState<SortKey>(defaultSort);
  const [sortAsc, setSortAsc] = useState(matchPcts ? false : true);

  const filtered = useMemo(() => {
    const searched = filterLayouts(layouts, query);
    return sortLayouts(searched, sortKey, sortAsc, matchPcts);
  }, [layouts, query, sortKey, sortAsc, matchPcts]);

  const handleQueryChange = useCallback((q: string) => setQuery(q), []);

  const handleSortChange = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortAsc(prev => !prev);
      } else {
        setSortKey(key);
        // Match% sorts descending by default (best first)
        setSortAsc(key !== 'matchPct');
      }
    },
    [sortKey],
  );

  return { filtered, query, sortKey, sortAsc, handleQueryChange, handleSortChange };
}
