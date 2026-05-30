import { Key } from './Key';
import { charFreqHeat } from '../../utils/fingerUsage';

const KEY_SIZE = 40;
const GAP = 4;
const UNIT = KEY_SIZE + GAP;

// Gap between left and right thumb pairs — matches the center gap in OrthoLayout
const PAIR_GAP = UNIT;

// Build the 4 thumb slots given optional layout-specific thumb keys.
// Slot layout: [L0, L1] | [R0, R1]
// thumb=l (leftAlpha set):  [alpha, ⇧] | [⌫, ⎵]   — space on right
// thumb=r (rightAlpha set): [⎵, ⇧]   | [alpha, ⌫] — space on left
// no thumb cluster:         [⇧, fn]   | [⌫, ⎵]   — space on right
function buildSlots(thumbKeys?: { left?: string[]; right?: string[] }): Array<{ char: string; finger: number }> {
  const leftAlpha  = thumbKeys?.left?.[0];
  const rightAlpha = thumbKeys?.right?.[0];
  if (rightAlpha) {
    // thumb=r: space is on left thumb, alpha on right
    return [
      { char: '⎵',       finger: 10 },  // L0 — space
      { char: '⇧',       finger: 10 },  // L1
      { char: rightAlpha, finger: 11 },  // R0 — alpha
      { char: '⌫',       finger: 11 },  // R1
    ];
  }
  if (leftAlpha) {
    // thumb=l: alpha on left, space on right
    return [
      { char: leftAlpha, finger: 10 },  // L0 — alpha
      { char: '⇧',       finger: 10 },  // L1
      { char: '⌫',       finger: 11 },  // R0
      { char: '⎵',       finger: 11 },  // R1 — space
    ];
  }
  // no thumb cluster
  return [
    { char: '⇧',  finger: 10 },  // L0
    { char: 'fn', finger: 10 },  // L1
    { char: '⌫',  finger: 11 },  // R0
    { char: '⎵',  finger: 11 },  // R1 — space
  ];
}

interface ThumbClusterProps {
  svgWidth: number;
  y: number;
  thumbKeys?: { left?: string[]; right?: string[] };
  handHeat?: { leftMult: number; rightMult: number };
}

export function ThumbCluster({ svgWidth, y, thumbKeys, handHeat }: ThumbClusterProps) {
  const slots = buildSlots(thumbKeys);
  const totalWidth = 4 * UNIT + PAIR_GAP;
  const startX = (svgWidth - totalWidth) / 2;

  function slotHeat(finger: number, char: string): number {
    const rawChar = char === '⎵' ? ' ' : char;
    const mult = handHeat ? (finger === 10 ? handHeat.leftMult : handHeat.rightMult) : 1;
    return Math.min(1, charFreqHeat(rawChar) * mult);
  }

  return (
    <g>
      {slots.map(({ char, finger }, i) => {
        const x = i < 2 ? startX + i * UNIT : startX + i * UNIT + PAIR_GAP;
        return (
          <Key
            key={i}
            char={char}
            finger={finger}
            x={x}
            y={y}
            width={KEY_SIZE}
            height={KEY_SIZE}
            isHome={false}
            heat={slotHeat(finger, char)}
          />
        );
      })}
    </g>
  );
}

