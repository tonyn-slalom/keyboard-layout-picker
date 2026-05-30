import type { Layout } from '../../types';
import { fingerMap } from '../../utils/fingerMap';
import { charFreqHeat } from '../../utils/fingerUsage';
import { Key } from './Key';
import { ThumbCluster } from './ThumbCluster';

const KEY_SIZE = 40;
const GAP = 4;
const UNIT = KEY_SIZE + GAP;
const CENTER_GAP = UNIT;  // one key-width gap between left and right halves

interface OrthoLayoutProps {
  layout: Layout;
  handHeat?: { leftMult: number; rightMult: number };
  activePositions?: Set<number>;
}

function keyHeat(char: string, mult: number): number {
  return Math.min(1, charFreqHeat(char) * mult);
}

function getKeyFingerIndex(char: string): number {
  return fingerMap[char]?.finger ?? 0;
}

// Default outer keys for layouts that don't specify (matches standard keyboard)
const DEFAULT_OUTER = { topRight: '-', homeLeft: undefined as string | undefined, homeRight: "'", bottomLeft: '\\' };

// x-position for the 12-column grid (cols 0-5 = left, cols 6-11 = right + CENTER_GAP)
function colX(col: number): number {
  return col <= 5 ? col * UNIT : col * UNIT + CENTER_GAP;
}

export function OrthoLayout({ layout, handHeat, activePositions }: OrthoLayoutProps) {
  const lm = handHeat?.leftMult  ?? 1;
  const rm = handHeat?.rightMult ?? 1;
  const keys30 = layout.keys.slice(0, 30);
  const outerKeys = layout.outerKeys ?? {};
  const topRight   = outerKeys.topRight   ?? DEFAULT_OUTER.topRight;
  const homeLeft   = outerKeys.homeLeft   ?? DEFAULT_OUTER.homeLeft;
  const homeRight  = outerKeys.homeRight  ?? DEFAULT_OUTER.homeRight;
  const bottomLeft = outerKeys.bottomLeft ?? DEFAULT_OUTER.bottomLeft;

  // 3 rows × 5 alpha keys per half
  const alphaRows: string[][] = [
    [...keys30.slice(0, 10)],
    [...keys30.slice(10, 20)],
    [...keys30.slice(20, 30)],
  ];

  // Col 0: ⇥ (tab), homeLeft alpha OR ⌃ (ctrl), bottomLeft
  const leftMods  = ['⇥', homeLeft ?? '⌃', bottomLeft];
  // Col 11: topRight, homeRight, ↵ (enter)
  const rightMods = [topRight, homeRight, '↵'];

  // Full 12 cols: [0] + [1–5 left alpha] + CENTER_GAP + [6–10 right alpha] + [11]
  const svgWidth = 12 * UNIT + CENTER_GAP;
  const thumbY = 3 * UNIT + 8;
  const svgHeight = thumbY + KEY_SIZE + 8;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      aria-label={`${layout.name} ortholinear keyboard layout`}
      className="w-full"
    >
      {alphaRows.map((row, rowIdx) => (
        <g key={rowIdx}>
          {/* Col 0: left modifier or outer-left alpha */}
          <Key
            char={leftMods[rowIdx]!}
            finger={getKeyFingerIndex(leftMods[rowIdx]!)}
            x={colX(0)}
            y={rowIdx * UNIT}
            width={KEY_SIZE}
            height={KEY_SIZE}
            isHome={false}
            heat={keyHeat(leftMods[rowIdx]!, lm)}
          />

          {/* Cols 1–5: left alpha keys */}
          {row.slice(0, 5).map((char, i) => (
            <Key
              key={`L${i}`}
              char={char}
              finger={getKeyFingerIndex(char)}
              x={colX(i + 1)}
              y={rowIdx * UNIT}
              width={KEY_SIZE}
              height={KEY_SIZE}
              isHome={rowIdx === 1}
              heat={keyHeat(char, lm)}
              isActive={activePositions?.has(rowIdx * 10 + i)}
            />
          ))}

          {/* Cols 6–10: right alpha keys */}
          {row.slice(5, 10).map((char, i) => (
            <Key
              key={`R${i}`}
              char={char}
              finger={getKeyFingerIndex(char)}
              x={colX(i + 6)}
              y={rowIdx * UNIT}
              width={KEY_SIZE}
              height={KEY_SIZE}
              isHome={rowIdx === 1}
              heat={keyHeat(char, rm)}
              isActive={activePositions?.has(rowIdx * 10 + 5 + i)}
            />
          ))}

          {/* Col 11: right modifier or outer-right alpha */}
          <Key
            char={rightMods[rowIdx]!}
            finger={getKeyFingerIndex(rightMods[rowIdx]!)}
            x={colX(11)}
            y={rowIdx * UNIT}
            width={KEY_SIZE}
            height={KEY_SIZE}
            isHome={false}
            heat={keyHeat(rightMods[rowIdx]!, rm)}
          />
        </g>
      ))}

      <ThumbCluster svgWidth={svgWidth} y={thumbY} thumbKeys={layout.thumbKeys} handHeat={handHeat} />
    </svg>
  );
}
