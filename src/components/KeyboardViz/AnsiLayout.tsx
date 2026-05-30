import type { Layout } from '../../types';
import { fingerMap } from '../../utils/fingerMap';
import { Key } from './Key';
import { ThumbCluster } from './ThumbCluster';

const KEY_SIZE = 40;
const GAP = 4;
const UNIT = KEY_SIZE + GAP;

// ANSI row stagger offsets (in key units) for Q, A, Z rows
const ROW_OFFSETS = [0.5, 0.25, 0];

interface AnsiLayoutProps {
  layout: Layout;
  keyHeat?: number[];  // 30-element array matching layout.keys
}

function getKeyFingerIndex(char: string): number {
  return fingerMap[char]?.finger ?? 0;
}

export function AnsiLayout({ layout, keyHeat }: AnsiLayoutProps) {
  const keys30 = layout.keys.slice(0, 30);
  const allRows: string[][] = [
    [...keys30.slice(0, 10)],  // row 0: Q row
    [...keys30.slice(10, 20)], // row 1: A row (home)
    [...keys30.slice(20, 30)], // row 2: Z row
  ];

  const svgWidth = 10 * UNIT + 2 * ROW_OFFSETS[0]! * UNIT;
  // thumbY: 8px gap below Z row bottom (2*UNIT + KEY_SIZE)
  const thumbY = 2 * UNIT + KEY_SIZE + 8;
  const svgHeight = thumbY + KEY_SIZE + 8;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      aria-label={`${layout.name} ANSI keyboard layout`}
      className="w-full"
    >
      {allRows.map((row, rowIdx) => {
        const xOffset = ROW_OFFSETS[rowIdx]! * UNIT;
        return row.map((char, colIdx) => {
          const x = xOffset + colIdx * UNIT;
          const y = rowIdx * UNIT;
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
        });
      })}      <ThumbCluster svgWidth={svgWidth} y={thumbY} />    </svg>
  );
}
