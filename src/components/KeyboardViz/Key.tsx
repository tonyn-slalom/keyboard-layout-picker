import { useState } from 'react';

const FINGER_NAMES = [
  'LP', 'LR', 'LM', 'LI', 'LII',
  'RII', 'RI', 'RM', 'RR', 'RP',
  'LThumb', 'RThumb',
] as const;

export const FINGER_COLORS = [
  'fill-pink-400',    // 0 = LP
  'fill-orange-400',  // 1 = LR
  'fill-yellow-400',  // 2 = LM
  'fill-green-400',   // 3 = LI
  'fill-teal-400',    // 4 = LII
  'fill-cyan-400',    // 5 = RII
  'fill-blue-400',    // 6 = RI
  'fill-violet-400',  // 7 = RM
  'fill-purple-400',  // 8 = RR
  'fill-rose-400',    // 9 = RP
  'fill-amber-200',   // 10 = LThumb
  'fill-amber-200',   // 11 = RThumb
] as const;

interface KeyProps {
  char: string;
  finger: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  isHome?: boolean;
  heat: number;      // 0–1 absolute heatmap value
  isActive?: boolean; // true when the key is currently pressed (tryout mode)
}

function heatFill(t: number): string {
  // white (low) → light peach → orange → deep red (high)
  // Matches cyanophage-style: character frequency drives color absolutely
  if (t < 0.01) return 'hsl(0, 0%, 93%)';
  const hue = Math.round(30 - t * 30);   // 30 (orange) → 0 (red)
  const sat = Math.round(75 + t * 25);   // 75% → 100%
  const lit = Math.round(90 - t * 45);   // 90% (light) → 45% (saturated)
  return `hsl(${hue}, ${sat}%, ${lit}%)`;
}

export function Key({ char, finger, x, y, width = 40, height = 40, isHome = false, heat, isActive = false }: KeyProps) {
  const [hovered, setHovered] = useState(false);
  const fingerName = FINGER_NAMES[finger] ?? 'Unknown';
  const fillColor = isActive ? 'hsl(217, 91%, 60%)' : heatFill(heat);

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="img"
      aria-label={`${char} — ${fingerName}`}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        className="stroke-gray-700 dark:stroke-gray-900 stroke-1"
        style={{ fill: fillColor, opacity: isActive ? 1 : 0.85 }}
      />
      {isHome && (
        <rect
          x={x + 3}
          y={y + 3}
          width={width - 6}
          height={height - 6}
          rx={2}
          className="fill-none stroke-gray-500/40 stroke-1"
        />
      )}
      <text
        x={x + width / 2}
        y={y + height / 2 + 5}
        textAnchor="middle"
        fontSize={14}
        className="fill-gray-900 dark:fill-gray-100 font-mono select-none pointer-events-none"
      >
        {char === ' ' ? '⎵' : char}
      </text>
      {hovered && (
        <g>
          <rect
            x={x}
            y={y - 28}
            width={64}
            height={22}
            rx={3}
            className="fill-gray-800 dark:fill-gray-700"
          />
          <text
            x={x + 32}
            y={y - 12}
            textAnchor="middle"
            fontSize={11}
            className="fill-white select-none pointer-events-none"
          >
            {char === ' ' ? 'SPC' : char} — {fingerName}
          </text>
        </g>
      )}
    </g>
  );
}
