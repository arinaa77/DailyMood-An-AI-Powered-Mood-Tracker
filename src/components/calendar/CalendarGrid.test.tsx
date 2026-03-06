import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CalendarGrid from './CalendarGrid';
import type { MoodEntry } from '@/types';

// Fixed month: March 2026 (March 1 is a Sunday — grid starts on Mar 1)
const MARCH_2026 = new Date(2026, 2, 1);

function makeEntry(date: string, score: number): MoodEntry {
  return {
    id: date,
    user_id: 'u1',
    mood_score: score,
    note: '',
    created_at: `${date}T12:00:00.000Z`,
  };
}

describe('CalendarGrid', () => {
  it('renders the month and year heading', () => {
    render(
      <CalendarGrid
        entries={[]}
        month={MARCH_2026}
        selectedDate={null}
        onDateSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('renders all 7 weekday header labels', () => {
    render(
      <CalendarGrid entries={[]} month={MARCH_2026} selectedDate={null} onDateSelect={vi.fn()} />,
    );
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('renders a button for each day in the month', () => {
    render(
      <CalendarGrid entries={[]} month={MARCH_2026} selectedDate={null} onDateSelect={vi.fn()} />,
    );
    // March 1 is accessible by aria-label
    expect(screen.getByRole('button', { name: 'March 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'March 31' })).toBeInTheDocument();
  });

  it('shows an emoji in the aria-label for a date that has an entry', () => {
    const entries = [makeEntry('2026-03-05', 5)];
    render(
      <CalendarGrid
        entries={entries}
        month={MARCH_2026}
        selectedDate={null}
        onDateSelect={vi.fn()}
      />,
    );
    // aria-label contains the emoji for score 5 (😄)
    expect(screen.getByRole('button', { name: /March 5.*😄/ })).toBeInTheDocument();
  });

  it('calls onDateSelect with the clicked date', async () => {
    const user = userEvent.setup();
    const onDateSelect = vi.fn();
    render(
      <CalendarGrid
        entries={[]}
        month={MARCH_2026}
        selectedDate={null}
        onDateSelect={onDateSelect}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'March 10' }));
    expect(onDateSelect).toHaveBeenCalledOnce();
    const called = onDateSelect.mock.calls[0][0] as Date;
    expect(called.getFullYear()).toBe(2026);
    expect(called.getMonth()).toBe(2); // March = 2
    expect(called.getDate()).toBe(10);
  });

  it('marks the selected date as aria-pressed="true"', () => {
    const selected = new Date(2026, 2, 15);
    render(
      <CalendarGrid
        entries={[]}
        month={MARCH_2026}
        selectedDate={selected}
        onDateSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'March 15' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('shows an entry count badge when the month has entries', () => {
    const entries = [
      makeEntry('2026-03-01', 4),
      makeEntry('2026-03-02', 3),
    ];
    render(
      <CalendarGrid
        entries={entries}
        month={MARCH_2026}
        selectedDate={null}
        onDateSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('2 entries')).toBeInTheDocument();
  });

  it('shows "1 entry" (singular) for a single entry', () => {
    render(
      <CalendarGrid
        entries={[makeEntry('2026-03-10', 5)]}
        month={MARCH_2026}
        selectedDate={null}
        onDateSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('1 entry')).toBeInTheDocument();
  });

  it('does not show entry badge when month has no entries', () => {
    render(
      <CalendarGrid entries={[]} month={MARCH_2026} selectedDate={null} onDateSelect={vi.fn()} />,
    );
    expect(screen.queryByText(/entr/i)).not.toBeInTheDocument();
  });

  it('disables out-of-month day buttons', () => {
    render(
      <CalendarGrid entries={[]} month={MARCH_2026} selectedDate={null} onDateSelect={vi.fn()} />,
    );
    // April 1 appears in the grid but is outside March
    const apr1 = screen.getByRole('button', { name: 'April 1' });
    expect(apr1).toBeDisabled();
  });
});
