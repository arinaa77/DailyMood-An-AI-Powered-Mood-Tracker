// US-1: Mood Selection (Issue #2) · US-2: Notes (Issue #3)
'use client';

import { useState } from 'react';
import { emojiFromScore, labelFromScore } from '@/lib/moodUtils';

// ----- constants -------------------------------------------------------
const MAX_NOTE_LENGTH = 500;
const LOW_CHAR_THRESHOLD = 50;

/**
 * Mood scores displayed left-to-right: Great → Awful.
 * CLAUDE.md: always drive emoji/labels through moodUtils, never hardcode.
 */
const MOOD_SCORES = [5, 4, 3, 2, 1] as const;
type MoodScore = (typeof MOOD_SCORES)[number];

const NOTE_PLACEHOLDER = "What's on your mind?";

// ----- prop types -------------------------------------------------------
interface MoodPickerProps {
  /** Called when the user confirms the entry. Reset + toast are the caller's responsibility. */
  onSave: (mood: number, note: string) => Promise<void>;
}

// ----- helpers ----------------------------------------------------------
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// ----- component --------------------------------------------------------
export default function MoodPicker({
  onSave,
}: MoodPickerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodScore | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);


  const charsRemaining = MAX_NOTE_LENGTH - note.length;
  const isLowChars = charsRemaining <= LOW_CHAR_THRESHOLD;
  const isSaveDisabled = selectedMood === null || loading;

  function handleNoteChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setNote(e.target.value.slice(0, MAX_NOTE_LENGTH));
  }

  async function handleSave() {
    if (selectedMood === null) return;
    setLoading(true);
    try {
      await onSave(selectedMood, note);
      setSelectedMood(null);
      setNote('');
      // Banner stays until the user picks their next mood
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">

      {/* ── Card ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Gradient top accent stripe */}
          <div className="h-1.5 bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-400" />

          <div className="p-7">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="text-center mb-7">
              <div className="text-3xl mb-2" aria-hidden="true">✨</div>
              <h1 className="text-gray-900 text-2xl font-bold tracking-tight">
                Daily Check-in
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {formatDate(new Date())}
              </p>
            </div>

            {/* ── Mood Picker ─────────────────────────────────────────── */}
            <div className="mb-2">
              <p className="text-gray-600 text-sm font-medium text-center mb-4">
                How are you feeling today?
              </p>
              <div
                role="group"
                aria-label="Select your mood"
                className="flex justify-center gap-2"
              >
                {MOOD_SCORES.map((score) => {
                  const isSelected = selectedMood === score;
                  return (
                    <button
                      key={score}
                      type="button"
                      aria-label={`Select mood: ${labelFromScore(score)}`}
                      aria-pressed={isSelected}
                      onClick={() => { setShowSuccess(false); setSelectedMood(score); }}
                      className={[
                        'flex flex-col items-center justify-center rounded-full',
                        'w-12 h-12 sm:w-16 sm:h-16 min-w-[44px] min-h-[44px]',
                        'transition-all duration-150 ease-in-out',
                        'focus-visible:outline-none focus-visible:ring-2',
                        'focus-visible:ring-violet-500 focus-visible:ring-offset-2',
                        isSelected
                          ? [
                              'ring-2 ring-violet-500 scale-110',
                              'bg-violet-50',
                              'shadow-[0_0_0_4px_rgba(139,92,246,0.15)]',
                            ].join(' ')
                          : 'hover:scale-105 hover:bg-gray-50 hover:ring-1 hover:ring-violet-200',
                      ].join(' ')}
                    >
                      <span className="text-2xl sm:text-3xl leading-none" aria-hidden="true">
                        {emojiFromScore(score)}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-tight select-none">
                        {labelFromScore(score)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feeling indicator — fades in after a mood is picked */}
              <div aria-live="polite" aria-atomic="true" className="h-7 flex items-center justify-center mt-3">
                {selectedMood !== null && (
                  <p className="text-sm text-gray-500">
                    You&apos;re feeling{' '}
                    <span className="font-semibold text-violet-600">
                      {labelFromScore(selectedMood)}
                    </span>{' '}
                    <span aria-hidden="true">{emojiFromScore(selectedMood)}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-5" />

            {/* ── Notes Textarea ──────────────────────────────────────── */}
            <div className="mb-6">
              {/* Visible label + optional badge */}
              <div className="flex items-center gap-2 mb-2">
                <label
                  htmlFor="mood-note"
                  className="text-sm font-medium text-gray-700"
                >
                  Your note
                </label>
                <span className="text-xs text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full font-medium border border-violet-100">
                  optional
                </span>
              </div>
              <textarea
                id="mood-note"
                value={note}
                onChange={handleNoteChange}
                placeholder={NOTE_PLACEHOLDER}
                rows={3}
                maxLength={MAX_NOTE_LENGTH}
                aria-describedby="char-counter"
                className={[
                  'w-full rounded-xl border border-gray-200 p-3',
                  'text-sm text-gray-900 placeholder:text-gray-400 resize-none',
                  'hover:border-gray-300',
                  'focus:outline-none focus-visible:ring-2',
                  'focus-visible:ring-violet-500 focus-visible:ring-offset-1',
                  'transition-all duration-150 ease-in-out',
                ].join(' ')}
              />
              <p
                id="char-counter"
                aria-live="polite"
                aria-atomic="true"
                className={[
                  'text-right text-xs mt-1 transition-colors duration-150',
                  isLowChars ? 'text-red-500 font-medium' : 'text-gray-400',
                ].join(' ')}
              >
                {charsRemaining} remaining
              </p>
            </div>

            {/* ── Save Button ─────────────────────────────────────────── */}
            <button
              type="button"
              disabled={isSaveDisabled}
              aria-busy={loading}
              onClick={handleSave}
              className={[
                'w-full py-3 px-6 rounded-xl font-semibold text-sm',
                'transition-all duration-150 ease-in-out',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-violet-500 focus-visible:ring-offset-2',
                isSaveDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : [
                      'bg-gradient-to-r from-violet-500 to-purple-600',
                      'hover:from-violet-600 hover:to-purple-700',
                      'active:scale-[0.98]',
                      'text-white shadow-md shadow-violet-200',
                    ].join(' '),
              ].join(' ')}
            >
              {loading ? 'Saving…' : 'Save Entry'}
            </button>

            {/* ── Success banner ──────────────────────────────────────── */}
            {/* Fixed height prevents layout shift when the banner appears */}
            <div
              aria-live="assertive"
              aria-atomic="true"
              className="h-10 flex items-center justify-center mt-3"
            >
              {showSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-2 rounded-xl">
                  <span aria-hidden="true">✓</span>
                  Entry saved! Keep showing up for yourself.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Motivational footer tagline */}
        <p className="text-center text-xs text-gray-400 mt-4 select-none">
          Logging takes under 30 seconds. You&apos;ve got this.
        </p>

    </div>
  );
}
