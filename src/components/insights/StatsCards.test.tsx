import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatsCards from './StatsCards';
import type { MoodEntry } from '@/types';

function makeEntry(id: string, score: number): MoodEntry {
  return { id, user_id: 'u1', mood_score: score, note: '', created_at: '2026-03-01T12:00:00Z' };
}

describe('StatsCards', () => {
  describe('empty state', () => {
    it('renders three cards with dashes when entries is empty', () => {
      render(<StatsCards entries={[]} />);
      expect(screen.getByText('Average Mood')).toBeInTheDocument();
      expect(screen.getByText('Top Mood')).toBeInTheDocument();
      expect(screen.getByText('Entries')).toBeInTheDocument();
      expect(screen.getAllByText('—')).toHaveLength(3);
    });
  });

  describe('with entries', () => {
    const entries = [
      makeEntry('1', 5),
      makeEntry('2', 5),
      makeEntry('3', 3),
    ];

    it('shows the correct entry count', () => {
      render(<StatsCards entries={entries} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows the correct average mood (one decimal)', () => {
      // (5 + 5 + 3) / 3 = 4.3
      render(<StatsCards entries={entries} />);
      expect(screen.getByText('4.3')).toBeInTheDocument();
    });

    it('shows the most common mood label', () => {
      // Score 5 appears twice → top mood = "Great"
      render(<StatsCards entries={entries} />);
      expect(screen.getByText('Great')).toBeInTheDocument();
    });

    it('shows average of 1.0 for all-awful entries', () => {
      render(<StatsCards entries={[makeEntry('x', 1), makeEntry('y', 1)]} />);
      expect(screen.getByText('1.0')).toBeInTheDocument();
    });

    it('shows average of 5.0 for all-great entries', () => {
      render(<StatsCards entries={[makeEntry('a', 5), makeEntry('b', 5)]} />);
      expect(screen.getByText('5.0')).toBeInTheDocument();
    });
  });
});
