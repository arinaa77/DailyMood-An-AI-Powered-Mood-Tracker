// US-4: Mood Trends Dashboard (Issue #5)
'use client';

import { useState, useMemo } from 'react';
import { subDays, format, parseISO } from 'date-fns';
import { useMoodEntries } from '@/hooks/useMoodEntries';
import StatsCards from '@/components/insights/StatsCards';
import MoodBarChart from '@/components/insights/MoodBarChart';
import type { DailyMoodSummary } from '@/types';

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
] as const;

type RangeDays = (typeof RANGES)[number]['days'];

export default function InsightsPage() {
  const { entries, loading } = useMoodEntries();
  const [range, setRange] = useState<RangeDays>(30);

  const filteredEntries = useMemo(() => {
    const cutoff = subDays(new Date(), range);
    return entries.filter((e) => new Date(e.created_at) >= cutoff);
  }, [entries, range]);

  // Aggregate to one score per day (average if multiple, but we only allow one entry/day)
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
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Insights</h1>

      {/* Time range toggle */}
      <div className="flex gap-2" role="group" aria-label="Time range">
        {RANGES.map(({ label, days }) => (
          <button
            key={days}
            type="button"
            onClick={() => setRange(days)}
            aria-pressed={range === days}
            className={[
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              range === days
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-gray-600 hover:text-gray-900 shadow-sm border border-gray-200',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center text-gray-400 text-sm">
          Loading…
        </div>
      ) : (
        <>
          <StatsCards entries={filteredEntries} />
          <MoodBarChart data={chartData} />

          {/* AI Insights placeholder — locked until US-5 is implemented */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-3">
              <span aria-hidden="true">✨</span>
              <h2 className="font-semibold text-gray-900">AI Insights</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                Coming soon
              </span>
            </div>
            {filteredEntries.length < 5 ? (
              <div>
                <p className="text-sm text-gray-500 mb-3">
                  Log {5 - filteredEntries.length} more{' '}
                  {5 - filteredEntries.length === 1 ? 'entry' : 'entries'} to unlock insights!
                </p>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-indigo-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(filteredEntries.length / 5) * 100}%` }}
                    aria-label={`${filteredEntries.length} of 5 entries`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{filteredEntries.length} / 5 entries</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                AI analysis will appear here once the feature is enabled.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
