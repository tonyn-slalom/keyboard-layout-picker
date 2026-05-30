import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import type { ComfortProfile } from '../../types';

interface RadarChartProps {
  profile: ComfortProfile;
}

const CATEGORY_LABELS: Record<string, string> = {
  alt:            'Alt',
  rollIn:         'Roll-in',
  rollOut:        'Roll-out',
  thumbAlt:       'Thumb Alt',
  sfbStrong:      'SFB Strong',
  sfbWeak:        'SFB Weak',
  lsb:            'LSB',
  scissorsCenter: 'Scissors',
  scissorsPinky:  'Sciss. Pinky',
  redirect:       'Redirect',
  pinky:          'Pinky',
  skipBigram:     'Skip Bigram',
};

export function RadarChart({ profile }: RadarChartProps) {
  const data = Object.entries(profile).map(([key, value]) => ({
    subject: CATEGORY_LABELS[key] ?? key,
    score: Math.round(value * 100),
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
        />
        <Radar
          name="Comfort"
          dataKey="score"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.35}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
