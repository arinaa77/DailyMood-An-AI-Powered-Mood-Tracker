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

export function CustomTooltip({
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
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3.5 py-2.5 text-xs">
      <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
      <p className="text-gray-500">
        {labelFromScore(score)} · <span className="font-medium text-gray-700">{score}/5</span>
      </p>
    </div>
  );
}

export default function MoodBarChart({ data }: MoodBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-2xl mb-2" aria-hidden="true">📭</p>
        <p className="text-sm text-gray-400">No entries in this range.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Card header */}
      <div className="px-6 pt-5 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Mood Trend</h2>
          <p className="text-xs text-gray-400 mt-0.5">{data.length} days logged</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#22c55e]" />Good</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#eab308]" />Okay</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#ef4444]" />Low</span>
        </div>
      </div>

      <div className="px-2 pb-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
            <Bar dataKey="mood_score" radius={[6, 6, 0, 0]} maxBarSize={32}>
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
    </div>
  );
}
