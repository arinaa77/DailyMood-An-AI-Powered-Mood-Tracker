// US-1: Mood Selection (Issue #2) · US-2: Notes (Issue #3)
'use client';

import MoodPicker from '@/components/mood/MoodPicker';
import { useMoodEntries } from '@/hooks/useMoodEntries';

export default function LogPage() {
  const { createEntry } = useMoodEntries();

  return (
    <div className="flex justify-center">
      <MoodPicker onSave={createEntry} />
    </div>
  );
}
