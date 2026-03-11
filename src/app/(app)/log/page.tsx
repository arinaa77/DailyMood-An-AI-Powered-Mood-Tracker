// US-1: Mood Selection (Issue #2) · US-2: Notes (Issue #3)
'use client';

import { useMemo } from 'react';
import { subDays, format, isSameDay, parseISO } from 'date-fns';
import MoodPicker from '@/components/mood/MoodPicker';
import { useMoodEntries } from '@/hooks/useMoodEntries';
import { emojiFromScore, labelFromScore } from '@/lib/moodUtils';

function lastNDays(n: number): Date[] {
  return Array.from({ length: n }, (_, i) => subDays(new Date(), n - 1 - i));
}

export default function LogPage() {
  const { entries, createEntry } = useMoodEntries();

  const week = useMemo(() => lastNDays(7), []);

  const weekEntries = useMemo(() =>
    week.map((day) => ({
      day,
      entry: entries.find((e) => isSameDay(parseISO(e.created_at), day)) ?? null,
    })),
  [week, entries]);

  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const day = subDays(new Date(), i);
      if (!entries.some((e) => isSameDay(parseISO(e.created_at), day))) break;
      count++;
    }
    return count;
  }, [entries]);

  const hasLoggedToday = entries.some((e) =>
    isSameDay(parseISO(e.created_at), new Date()),
  );

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] lg:items-start gap-6">

      {/* ── Left: MoodPicker ──────────────────────────────────────────── */}
      <MoodPicker onSave={createEntry} />

      {/* ── Right: Stats sidebar ─────────────────────────────────────── */}
      <div className="lg:sticky lg:top-6 space-y-3">

        {/* Today + This week — unified card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden">

          {/* Header row: date on left, status pill on right */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Today</p>
              <p className="text-sm font-semibold text-gray-800">
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
            </div>
            {hasLoggedToday ? (
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap shrink-0">
                <span aria-hidden="true">✓</span> Done
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sky-500 bg-sky-50 border border-sky-100 rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap shrink-0">
                <span aria-hidden="true">·</span> Pending
              </span>
            )}
          </div>

          <div className="border-t border-gray-100 mb-4" />

          {/* This week */}
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">This week</p>
          <div className="flex justify-between gap-1">
            {weekEntries.map(({ day, entry }) => (
              <div key={day.toISOString()} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[10px] text-gray-400 font-medium">
                  {format(day, 'EEE')[0]}
                </span>
                <div
                  className={[
                    'w-9 h-9 rounded-xl flex items-center justify-center',
                    isSameDay(day, new Date()) ? 'ring-2 ring-sky-400 ring-offset-1' : '',
                    entry ? 'bg-sky-50' : 'bg-gray-50',
                  ].join(' ')}
                  title={entry
                    ? `${format(day, 'MMM d')}: ${labelFromScore(entry.mood_score)}`
                    : format(day, 'MMM d')}
                >
                  {entry
                    ? <span className="text-base" aria-hidden="true">{emojiFromScore(entry.mood_score)}</span>
                    : <span className="w-1.5 h-1.5 rounded-full bg-gray-200 block" aria-hidden="true" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak + total */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-2" aria-hidden="true">🔥</div>
            <p className="text-xl font-bold text-gray-900 leading-none">{streak}</p>
            <p className="text-[11px] text-gray-400 mt-1">day streak</p>
          </div>
          <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl border border-sky-100 p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center mx-auto mb-2" aria-hidden="true">📓</div>
            <p className="text-xl font-bold text-gray-900 leading-none">{entries.length}</p>
            <p className="text-[11px] text-gray-400 mt-1">total entries</p>
          </div>
        </div>

      </div>
    </div>
  );
}
