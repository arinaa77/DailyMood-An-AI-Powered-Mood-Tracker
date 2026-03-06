// US-4: Mood Trends Dashboard (Issue #5)
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { colorFromScore, labelFromScore } from '@/lib/moodUtils';
import type { DailyMoodSummary } from '@/types';

interface MoodBarChartProps {
  data: DailyMoodSummary[];
}

interface TooltipPayload {
  value: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="text-gray-600 mt-0.5">
        Score: {score} — {labelFromScore(score)}
      </p>
    </div>
  );
}

export default function MoodBarChart({ data }: MoodBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-400 text-sm">
        No entries in this range.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
          <Bar dataKey="mood_score" radius={[4, 4, 0, 0]} maxBarSize={32}>
            {data.map((entry) => (
              <Cell
                key={entry.date}
                fill={colorFromScore(entry.mood_score)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
