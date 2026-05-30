import { useCallback, useState } from 'react';
import type { Layout } from '../../types';

export interface LayoutDetailController {
  layout: Layout;
  showComparison: boolean;
  handleToggleComparison: () => void;
}

export function useLayoutDetailController(layout: Layout): LayoutDetailController {
  const [showComparison, setShowComparison] = useState(false);

  const handleToggleComparison = useCallback(() => {
    setShowComparison(prev => !prev);
  }, []);

  return { layout, showComparison, handleToggleComparison };
}
