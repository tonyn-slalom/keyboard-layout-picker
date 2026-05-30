import type { Layout } from '../../types';
import { OrthoLayout } from './OrthoLayout';
import { computeHandBalanceHeat } from '../../utils/fingerUsage';

interface KeyboardVizProps {
  layout: Layout;
  size?: 'sm' | 'md' | 'lg';
  activePositions?: Set<number>;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'max-w-xs',
  md: 'max-w-sm',
  lg: 'max-w-lg',
};

export function KeyboardViz({ layout, size = 'md', activePositions }: KeyboardVizProps) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES['md']!;
  const handHeat = computeHandBalanceHeat(layout);

  return (
    <div className={`${sizeClass} w-full`}>
      <OrthoLayout layout={layout} handHeat={handHeat} activePositions={activePositions} />
    </div>
  );
}
