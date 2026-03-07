'use client';

// Personal records derived entirely from local entry data
import { useMemo } from 'react';
import { parseISO, isSameDay, subDays, format } from 'date-fns';
import { emojiFromScore, labelFromScore } from '@/lib/moodUtils';
import type { MoodEntry } from '@/types';

interface MilestoneCardsProps {
  entries: MoodEntry[];
}

function computeLongestStreak(entries: MoodEntry[]): number {
  if (!entries.length) return 0;
  const uniqueDates = [...new Set(entries.map((e) => e.created_at.slice(0, 10)))].sort();
  let max = 1;
  let cur = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = parseISO(uniqueDates[i - 1]);
    const curr = parseISO(uniqueDates[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
    cur = diff === 1 ? cur + 1 : 1;
    if (cur > max) max = cur;
  }
  return max;
}

function computeBestMonth(entries: MoodEntry[]): string {
  if (!entries.length) return '—';
  const byMonth = new Map<string, number[]>();
  entries.forEach((e) => {
    const m = e.created_at.slice(0, 7);
    byMonth.set(m, [...(byMonth.get(m) ?? []), e.mood_score]);
  });
  let best = '';
  let bestAvg = 0;
  byMonth.forEach((scores, month) => {
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    if (avg > bestAvg) { bestAvg = avg; best = month; }
  });
  return best ? format(parseISO(`${best}-01`), 'MMM yyyy') : '—';
}

function computeFavoriteMood(entries: MoodEntry[]): number | null {
  if (!entries.length) return null;
  const freq = new Map<number, number>();
  entries.forEach((e) => freq.set(e.mood_score, (freq.get(e.mood_score) ?? 0) + 1));
  return [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function computeCurrentStreak(entries: MoodEntry[]): number {
  let count = 0;
  for (let i = 0; i < 365; i++) {
    const day = subDays(new Date(), i);
    if (!entries.some((e) => isSameDay(parseISO(e.created_at), day))) break;
    count++;
  }
  return count;
}

const MILESTONE_STYLES = [
  { gradient: 'from-sky-400 to-blue-400',   bg: 'bg-sky-50',    border: 'border-sky-100'  },
  { gradient: 'from-cyan-400 to-sky-400',   bg: 'bg-cyan-50',   border: 'border-cyan-100' },
  { gradient: 'from-blue-400 to-sky-300',   bg: 'bg-blue-50',   border: 'border-blue-100' },
  { gradient: 'from-sky-300 to-cyan-300',   bg: 'bg-sky-50',    border: 'border-sky-100'  },
];

export default function MilestoneCards({ entries }: MilestoneCardsProps) {
  const longestStreak = useMemo(() => computeLongestStreak(entries), [entries]);
  const currentStreak = useMemo(() => computeCurrentStreak(entries), [entries]);
  const bestMonth    = useMemo(() => computeBestMonth(entries), [entries]);
  const favScore     = useMemo(() => computeFavoriteMood(entries), [entries]);

  const milestones = [
    {
      icon: '🔥',
      label: 'Longest Streak',
      value: longestStreak ? `${longestStreak} days` : '—',
      sub: currentStreak > 0 ? `${currentStreak} day streak now` : 'Start your streak today',
    },
    {
      icon: '🏆',
      label: 'Best Month',
      value: bestMonth,
      sub: 'Highest average mood',
    },
    {
      icon: favScore ? emojiFromScore(favScore) : '😐',
      label: 'Favorite Mood',
      value: favScore ? labelFromScore(favScore) : '—',
      sub: favScore ? 'Your most logged feeling' : 'Log entries to see',
    },
    {
      icon: '📓',
      label: 'Total Entries',
      value: entries.length > 0 ? `${entries.length}` : '—',
      sub: entries.length === 1 ? '1 day captured' : `${entries.length} days captured`,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-sky-300 via-blue-300 to-cyan-300" />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-400 flex items-center justify-center text-sm shadow-sm"
            aria-hidden="true"
          >
            🏅
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Personal Records</h2>
            <p className="text-xs text-gray-400">Your all-time highlights</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {milestones.map(({ icon, label, value, sub }, i) => {
            const s = MILESTONE_STYLES[i];
            return (
              <div
                key={label}
                className={`rounded-xl border ${s.border} ${s.bg} p-4`}
              >
                <div
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br ${s.gradient} text-base mb-3 shadow-sm`}
                  aria-hidden="true"
                >
                  {icon}
                </div>
                <p className="text-[11px] text-gray-400 font-medium mb-0.5">{label}</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
