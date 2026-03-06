'use client';

// US-4: Mood Trends Dashboard (Issue #5)
import { emojiFromScore, labelFromScore } from '@/lib/moodUtils';
import type { MoodEntry } from '@/types';

interface StatsCardsProps {
  entries: MoodEntry[];
}

export default function StatsCards({ entries }: StatsCardsProps) {
  if (entries.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {['Average Mood', 'Top Mood', 'Entries'].map((label) => (
          <div key={label} className="bg-white rounded-2xl shadow-md p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-gray-300 text-lg">—</p>
          </div>
        ))}
      </div>
    );
  }

  const avg = entries.reduce((sum, e) => sum + e.mood_score, 0) / entries.length;

  // Find most common mood score
  const freq = new Map<number, number>();
  entries.forEach((e) => freq.set(e.mood_score, (freq.get(e.mood_score) ?? 0) + 1));
  const topScore = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl shadow-md p-4 text-center">
        <p className="text-xs text-gray-400 mb-1">Average Mood</p>
        <p className="text-2xl font-bold text-gray-900">{avg.toFixed(1)}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 text-center">
        <p className="text-xs text-gray-400 mb-1">Top Mood</p>
        <p className="text-2xl" aria-hidden="true">{emojiFromScore(topScore)}</p>
        <p className="text-xs text-gray-600 mt-0.5">{labelFromScore(topScore)}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 text-center">
        <p className="text-xs text-gray-400 mb-1">Entries</p>
        <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
      </div>
    </div>
  );
}
