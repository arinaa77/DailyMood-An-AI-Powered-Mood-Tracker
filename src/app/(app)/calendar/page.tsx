// US-3: View Entry History (Issue #4) · US-6: Edit and Delete (Issue #7)
'use client';

import { useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { useMoodEntries } from '@/hooks/useMoodEntries';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import EntryDetail from '@/components/calendar/EntryDetail';
import Modal from '@/components/ui/Modal';
import { emojiFromScore, labelFromScore } from '@/lib/moodUtils';
import type { MoodEntry } from '@/types';

const MAX_NOTE_LENGTH = 500;
const MOOD_SCORES = [5, 4, 3, 2, 1] as const;

export default function CalendarPage() {
  const { entries, loading, updateEntry, deleteEntry } = useMoodEntries();
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Edit state
  const [editEntry, setEditEntry] = useState<MoodEntry | null>(null);
  const [editMood, setEditMood] = useState<number | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<MoodEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Find all entries for the selected date
  const selectedEntries = selectedDate
    ? entries.filter((e) => isSameDay(new Date(e.created_at), selectedDate))
    : [];

  function prevMonth() {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    setSelectedDate(null);
  }

  function nextMonth() {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
    setSelectedDate(null);
  }

  function openEdit(entry: MoodEntry) {
    setEditEntry(entry);
    setEditMood(entry.mood_score);
    setEditNote(entry.note);
  }

  async function handleEditSave() {
    if (!editEntry || editMood === null) return;
    setEditLoading(true);
    try {
      await updateEntry(editEntry.id, editMood, editNote);
      setEditEntry(null);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteEntry(deleteTarget.id);
      setDeleteTarget(null);
      // Only clear selected date if this was the last entry for that day
      const remainingForDay = entries.filter(
        (e) => e.id !== deleteTarget.id && selectedDate && isSameDay(new Date(e.created_at), selectedDate)
      );
      if (remainingForDay.length === 0) setSelectedDate(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Previous month"
          className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-700 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          ‹
        </button>
        <span className="text-base font-semibold text-gray-700">
          {format(month, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Next month"
          className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-700 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          ›
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center text-gray-400 text-sm">
          Loading…
        </div>
      ) : (
        <CalendarGrid
          entries={entries}
          month={month}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      )}

      {/* Empty state */}
      {!loading && entries.filter(
        (e) => format(parseISO(e.created_at), 'yyyy-MM') === format(month, 'yyyy-MM'),
      ).length === 0 && (
        <p className="text-center text-sm text-gray-400 mt-6">
          No entries this month. Start logging to see your history.
        </p>
      )}

      {/* Entry detail panel */}
      {selectedDate && selectedEntries.length === 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6 mt-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <p className="text-sm text-gray-400 italic text-center">No mood logged for this day.</p>
        </div>
      )}
      {selectedEntries.map((entry) => (
        <EntryDetail
          key={entry.id}
          entry={entry}
          onEdit={() => openEdit(entry)}
          onDelete={() => setDeleteTarget(entry)}
        />
      ))}

      {/* Edit modal */}
      <Modal
        open={editEntry !== null}
        onClose={() => setEditEntry(null)}
        title="Edit Entry"
      >
        <div className="space-y-5">
          {/* Mood picker */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Mood</p>
            <div role="group" aria-label="Select your mood" className="flex gap-2">
              {MOOD_SCORES.map((score) => {
                const isSelected = editMood === score;
                return (
                  <button
                    key={score}
                    type="button"
                    aria-label={`Select mood: ${labelFromScore(score)}`}
                    aria-pressed={isSelected}
                    onClick={() => setEditMood(score)}
                    className={[
                      'flex flex-col items-center justify-center rounded-full',
                      'w-12 h-12 min-w-[44px] min-h-[44px]',
                      'transition-all duration-150 focus-visible:outline-none',
                      'focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
                      isSelected
                        ? 'ring-2 ring-sky-500 scale-110 bg-sky-50 shadow-[0_0_0_4px_rgba(99,102,241,0.15)]'
                        : 'hover:scale-105 hover:bg-gray-50 hover:ring-1 hover:ring-sky-200',
                    ].join(' ')}
                  >
                    <span className="text-2xl leading-none" aria-hidden="true">
                      {emojiFromScore(score)}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                      {labelFromScore(score)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="edit-note" className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              id="edit-note"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
              rows={3}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1"
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {MAX_NOTE_LENGTH - editNote.length} remaining
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setEditEntry(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEditSave}
              disabled={editMood === null || editLoading}
              className="flex-1 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-400 text-sm font-medium text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editLoading ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Entry"
      >
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this entry? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-medium text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </>
  );
}
