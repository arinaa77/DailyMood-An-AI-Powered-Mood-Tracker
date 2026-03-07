'use client';

// US-4: Mood Trends Dashboard (Issue #5)
import { emojiFromScore, labelFromScore } from '@/lib/moodUtils';
import type { MoodEntry } from '@/types';

interface StatsCardsProps {
  entries: MoodEntry[];
}

const CARD_STYLES = [
  { accent: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-600' },
  { accent: 'from-pink-400 to-rose-500',     bg: 'bg-pink-50',   text: 'text-pink-600'   },
  { accent: 'from-indigo-400 to-blue-500',   bg: 'bg-indigo-50', text: 'text-indigo-600' },
];

const CARD_LABELS = ['Average Mood', 'Top Mood', 'Entries'];

export default function StatsCards({ entries }: StatsCardsProps) {
  if (entries.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {CARD_LABELS.map((label, i) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br ${CARD_STYLES[i].accent} mb-3`} aria-hidden="true">
              <span className="text-white text-xs font-bold">·</span>
            </div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-xl font-bold text-gray-200">—</p>
          </div>
        ))}
      </div>
    );
  }

  const avg = entries.reduce((sum, e) => sum + e.mood_score, 0) / entries.length;

  const freq = new Map<number, number>();
  entries.forEach((e) => freq.set(e.mood_score, (freq.get(e.mood_score) ?? 0) + 1));
  const topScore = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];

  const cards = [
    {
      label: 'Average Mood',
      value: <span className="text-2xl font-bold text-gray-900">{avg.toFixed(1)}</span>,
      icon: '📈',
    },
    {
      label: 'Top Mood',
      value: (
        <div>
          <span className="text-2xl" aria-hidden="true">{emojiFromScore(topScore)}</span>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">{labelFromScore(topScore)}</p>
        </div>
      ),
      icon: '🏆',
    },
    {
      label: 'Entries',
      value: <span className="text-2xl font-bold text-gray-900">{entries.length}</span>,
      icon: '📝',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {cards.map(({ label, value, icon }, i) => (
        <div
          key={label}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-150"
        >
          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br ${CARD_STYLES[i].accent} mb-3 text-sm shadow-sm`} aria-hidden="true">
            {icon}
          </div>
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          {value}
        </div>
      ))}
    </div>
  );
}
