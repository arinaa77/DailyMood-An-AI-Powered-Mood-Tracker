'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MoodEntry } from '@/types';

export function useMoodEntries() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error: fetchError } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setEntries(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntries();
  }, [fetchEntries]);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('mood_entries_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mood_entries' },
        () => { fetchEntries(); },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchEntries]);

  async function createEntry(mood_score: number, note: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error: insertError } = await supabase
      .from('mood_entries')
      .insert({ user_id: user.id, mood_score, note });

    if (insertError) throw new Error(insertError.message);
    await fetchEntries();
  }

  async function updateEntry(id: string, mood_score: number, note: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error: updateError } = await supabase
      .from('mood_entries')
      .update({ mood_score, note })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) throw new Error(updateError.message);
    await fetchEntries();
  }

  async function deleteEntry(id: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error: deleteError } = await supabase
      .from('mood_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) throw new Error(deleteError.message);
    await fetchEntries();
  }

  return { entries, loading, error, createEntry, updateEntry, deleteEntry };
}
