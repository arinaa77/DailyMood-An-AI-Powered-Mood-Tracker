// US-4: Mood Trends Dashboard (Issue #5)
'use client';

import { useState, useMemo } from 'react';
import { subDays, format, parseISO } from 'date-fns';
import { useMoodEntries } from '@/hooks/useMoodEntries';
import StatsCards from '@/components/insights/StatsCards';
import MoodBarChart from '@/components/insights/MoodBarChart';
import MilestoneCards from '@/components/insights/MilestoneCards';
import type { DailyMoodSummary } from '@/types';

const RANGES = [
  { label: '7d',  days: 7  },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
] as const;

type RangeDays = (typeof RANGES)[number]['days'];

export default function InsightsPage() {
  const { entries, loading } = useMoodEntries();
  const [range, setRange] = useState<RangeDays>(30);

  const filteredEntries = useMemo(() => {
    const cutoff = subDays(new Date(), range);
    return entries.filter((e) => new Date(e.created_at) >= cutoff);
  }, [entries, range]);

  const chartData = useMemo((): DailyMoodSummary[] => {
    const byDate = new Map<string, number[]>();
    filteredEntries.forEach((e) => {
      const d = e.created_at.slice(0, 10);
      const arr = byDate.get(d) ?? [];
      arr.push(e.mood_score);
      byDate.set(d, arr);
    });
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, scores]) => ({
        date: format(parseISO(date), 'MMM d'),
        mood_score: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
      }));
  }, [filteredEntries]);

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Insights</h1>
          <p className="text-xs text-gray-400 mt-0.5">How you&apos;ve been feeling</p>
        </div>

        {/* Time range toggle — only affects stats + bar chart */}
        <div
          className="flex items-center gap-1 bg-gray-100 rounded-full p-1"
          role="group"
          aria-label="Time range"
        >
          {RANGES.map(({ label, days }) => (
            <button
              key={days}
              type="button"
              onClick={() => setRange(days)}
              aria-pressed={range === days}
              className={[
                'px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
                range === days
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 text-sm">
          Loading…
        </div>
      ) : (
        <>
          <StatsCards entries={filteredEntries} />
          <MoodBarChart data={chartData} />
          <MilestoneCards entries={entries} />
        </>
      )}
    </div>
  );
}
