// US-3: View Entry History (Issue #4)
'use client';

import { format } from 'date-fns';
import { emojiFromScore, labelFromScore } from '@/lib/moodUtils';
import type { MoodEntry } from '@/types';

interface EntryDetailProps {
  entry: MoodEntry | null;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EntryDetail({ entry, onEdit, onDelete }: EntryDetailProps) {
  if (!entry) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-4 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">
            {emojiFromScore(entry.mood_score)}
          </span>
          <div>
            <p className="font-semibold text-gray-900">
              {labelFromScore(entry.mood_score)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {format(new Date(entry.created_at), 'MMMM d, yyyy · h:mm a')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="text-xs text-indigo-600 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-xs text-red-500 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-1"
          >
            Delete
          </button>
        </div>
      </div>

      {entry.note && (
        <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border-t border-gray-100 pt-4">
          {entry.note}
        </p>
      )}

      {!entry.note && (
        <p className="mt-4 text-sm text-gray-400 italic border-t border-gray-100 pt-4">
          No note added.
        </p>
      )}
    </div>
  );
}
