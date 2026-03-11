// US-3: View Entry History (Issue #4)
'use client';

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  parseISO,
} from 'date-fns';
import { emojiFromScore } from '@/lib/moodUtils';
import type { MoodEntry } from '@/types';

interface CalendarGridProps {
  entries: MoodEntry[];
  month: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({
  entries,
  month,
  selectedDate,
  onDateSelect,
}: CalendarGridProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Build a map of date-string → entry for O(1) lookup
  const entryByDate = new Map<string, MoodEntry>();
  entries.forEach((entry) => {
    const dateKey = format(parseISO(entry.created_at), 'yyyy-MM-dd');
    // Keep the most recent entry per day (entries are sorted newest-first)
    if (!entryByDate.has(dateKey)) {
      entryByDate.set(dateKey, entry);
    }
  });

  const monthEntryCount = entries.filter(
    (e) => format(parseISO(e.created_at), 'yyyy-MM') === format(month, 'yyyy-MM'),
  ).length;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {format(month, 'MMMM yyyy')}
        </h2>
        {monthEntryCount > 0 && (
          <span className="text-xs bg-sky-100 text-sky-700 font-medium px-2.5 py-1 rounded-full">
            {monthEntryCount} {monthEntryCount === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>

      {/* Weekday header row */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-gray-400 py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const entry = entryByDate.get(dateKey);
          const isCurrentMonth = isSameMonth(day, month);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isTodayDay = isToday(day);

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => isCurrentMonth && onDateSelect(day)}
              disabled={!isCurrentMonth}
              aria-label={
                entry
                  ? `${format(day, 'MMMM d')}: ${emojiFromScore(entry.mood_score)}`
                  : format(day, 'MMMM d')
              }
              aria-pressed={isSelected}
              className={[
                'relative flex flex-col items-center justify-center rounded-xl',
                'w-full aspect-square text-xs transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
                !isCurrentMonth
                  ? 'opacity-20 cursor-default'
                  : isSelected
                  ? 'bg-sky-500 text-white shadow-md'
                  : isTodayDay
                  ? 'bg-sky-100 text-sky-700 font-semibold'
                  : 'hover:bg-gray-50 text-gray-700',
              ].join(' ')}
            >
              <span className={entry ? 'text-[10px]' : 'text-xs font-medium'}>
                {format(day, 'd')}
              </span>
              {entry && (
                <span className="text-base leading-none" aria-hidden="true">
                  {emojiFromScore(entry.mood_score)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
