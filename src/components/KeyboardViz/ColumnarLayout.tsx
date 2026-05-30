import type { Layout } from '../../types';
import { fingerMap } from '../../utils/fingerMap';
import { Key } from './Key';
import { ThumbCluster } from './ThumbCluster';

const KEY_SIZE = 40;
const GAP = 4;
const UNIT = KEY_SIZE + GAP;

// Vertical offsets per column (in key units, positive = higher up)
const COLUMNAR_OFFSETS = [0.5, 0.25, 0, 0.125, 0.25, 0.25, 0.125, 0, 0.25, 0.5] as const;

const MAX_OFFSET = Math.max(...COLUMNAR_OFFSETS);

interface ColumnarLayoutProps {
  layout: Layout;
  keyHeat?: number[];  // 30-element array matching layout.keys
}

function getKeyFingerIndex(char: string): number {
  return fingerMap[char]?.finger ?? 0;
}

export function ColumnarLayout({ layout, keyHeat }: ColumnarLayoutProps) {
  const keys30 = layout.keys.slice(0, 30);
  const rows: string[][] = [
    [...keys30.slice(0, 10)],
    [...keys30.slice(10, 20)],
    [...keys30.slice(20, 30)],
  ];

  const svgWidth = 10 * UNIT;
  // thumbY: 8px gap below lowest key bottom ((MAX_OFFSET+2)*UNIT + KEY_SIZE)
  const thumbY = Math.ceil((MAX_OFFSET + 2) * UNIT) + KEY_SIZE + 8;
  const svgHeight = thumbY + KEY_SIZE + 8;

  function getY(rowIdx: number, colIdx: number): number {
    const offset = COLUMNAR_OFFSETS[colIdx] ?? 0;
    return (MAX_OFFSET - offset) * UNIT + rowIdx * UNIT;
  }

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      aria-label={`${layout.name} columnar stagger keyboard layout`}
      className="w-full"
    >
      {rows.map((row, rowIdx) =>
        row.map((char, colIdx) => {
          const x = colIdx * UNIT;
          const y = getY(rowIdx, colIdx);
          const isHome = rowIdx === 1;
          const posIdx = rowIdx * 10 + colIdx;
          return (
            <Key
              key={`${rowIdx}-${colIdx}`}
              char={char}
              finger={getKeyFingerIndex(char)}
              x={x}
              y={y}
              width={KEY_SIZE}
              height={KEY_SIZE}
              isHome={isHome}
              heat={keyHeat?.[posIdx] ?? 0}
            />
          );
        })
      )}
      <ThumbCluster svgWidth={svgWidth} y={thumbY} />
    </svg>
  );
}
