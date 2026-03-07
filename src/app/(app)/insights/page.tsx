// US-4: Mood Trends Dashboard (Issue #5)
'use client';

import { useState, useMemo } from 'react';
import { subDays, format, parseISO } from 'date-fns';
import { useMoodEntries } from '@/hooks/useMoodEntries';
import StatsCards from '@/components/insights/StatsCards';
import MoodBarChart from '@/components/insights/MoodBarChart';
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

  const unlocked = filteredEntries.length >= 5;
  const progress = Math.min(filteredEntries.length / 5, 1);

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Insights</h1>
          <p className="text-xs text-gray-400 mt-0.5">How you&apos;ve been feeling</p>
        </div>

        {/* Time range toggle */}
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

          {/* AI Insights card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-sky-300 via-blue-300 to-cyan-300" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-400 flex items-center justify-center text-sm shadow-sm" aria-hidden="true">
                    ✨
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">AI Insights</h2>
                    <p className="text-xs text-gray-400">Powered by Claude</p>
                  </div>
                </div>
                <span className="text-xs bg-sky-50 text-sky-600 border border-sky-100 px-2.5 py-1 rounded-full font-medium">
                  Coming soon
                </span>
              </div>

              {!unlocked ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Log{' '}
                    <span className="font-semibold text-sky-600">
                      {5 - filteredEntries.length} more{' '}
                      {5 - filteredEntries.length === 1 ? 'entry' : 'entries'}
                    </span>{' '}
                    to unlock your first insight!
                  </p>
                  <div className="space-y-1.5">
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-300 to-blue-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress * 100}%` }}
                        aria-label={`${filteredEntries.length} of 5 entries`}
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-right">
                      {filteredEntries.length} / 5 entries
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 leading-relaxed">
                  AI analysis will appear here once the feature is enabled. Your mood patterns, likely triggers, and weekly trends will surface here.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
