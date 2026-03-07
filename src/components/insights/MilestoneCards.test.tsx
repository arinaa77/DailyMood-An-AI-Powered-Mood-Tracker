import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { subDays } from 'date-fns';
import MilestoneCards from './MilestoneCards';
import type { MoodEntry } from '@/types';

function makeEntry(id: string, score: number, daysAgo: number): MoodEntry {
  return {
    id,
    user_id: 'u1',
    mood_score: score,
    note: '',
    created_at: subDays(new Date(), daysAgo).toISOString(),
  };
}

describe('MilestoneCards', () => {
  describe('empty state', () => {
    it('renders all four milestone labels', () => {
      render(<MilestoneCards entries={[]} />);
      expect(screen.getByText('Longest Streak')).toBeInTheDocument();
      expect(screen.getByText('Best Month')).toBeInTheDocument();
      expect(screen.getByText('Favorite Mood')).toBeInTheDocument();
      expect(screen.getByText('Total Entries')).toBeInTheDocument();
    });

    it('shows em-dashes for all values when no entries', () => {
      render(<MilestoneCards entries={[]} />);
      // Longest streak, Best month, Favorite mood all show —
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
    });

    it('prompts to start a streak', () => {
      render(<MilestoneCards entries={[]} />);
      expect(screen.getByText('Start your streak today')).toBeInTheDocument();
    });
  });

  describe('with entries', () => {
    it('shows the correct total entry count', () => {
      const entries = [makeEntry('1', 4, 2), makeEntry('2', 3, 1), makeEntry('3', 5, 0)];
      render(<MilestoneCards entries={entries} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('calculates the longest streak correctly', () => {
      // 3 consecutive days ending today
      const entries = [makeEntry('1', 4, 2), makeEntry('2', 3, 1), makeEntry('3', 5, 0)];
      render(<MilestoneCards entries={entries} />);
      expect(screen.getByText('3 days')).toBeInTheDocument();
    });

    it('shows the current streak as a subtitle', () => {
      const entries = [makeEntry('1', 4, 1), makeEntry('2', 5, 0)];
      render(<MilestoneCards entries={entries} />);
      expect(screen.getByText('2 day streak now')).toBeInTheDocument();
    });

    it('shows "Start your streak today" when streak is broken', () => {
      // Entry 5 days ago — no current streak
      const entries = [makeEntry('1', 4, 5)];
      render(<MilestoneCards entries={entries} />);
      expect(screen.getByText('Start your streak today')).toBeInTheDocument();
    });

    it('shows the most frequent mood as the favorite', () => {
      // Score 5 appears twice, score 3 once → Great wins
      const entries = [makeEntry('1', 5, 2), makeEntry('2', 5, 1), makeEntry('3', 3, 0)];
      render(<MilestoneCards entries={entries} />);
      expect(screen.getByText('Great')).toBeInTheDocument();
    });

    it('shows the Personal Records heading', () => {
      render(<MilestoneCards entries={[makeEntry('1', 4, 0)]} />);
      expect(screen.getByText('Personal Records')).toBeInTheDocument();
    });
  });
});
