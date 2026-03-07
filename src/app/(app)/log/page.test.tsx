// Integration test — LogPage sidebar + MoodPicker wiring
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { format, subDays } from 'date-fns';
import type { MoodEntry } from '@/types';

// ── Mocks ──────────────────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/log',
}));

const mockCreateEntry = vi.fn();
const mockEntries: MoodEntry[] = [];

vi.mock('@/hooks/useMoodEntries', () => ({
  useMoodEntries: () => ({
    entries: mockEntries,
    loading: false,
    error: null,
    createEntry: mockCreateEntry,
  }),
}));

// Import after mocks
import LogPage from './page';

function makeEntry(id: string, score: number, daysAgo: number): MoodEntry {
  return {
    id,
    user_id: 'u1',
    mood_score: score,
    note: '',
    created_at: subDays(new Date(), daysAgo).toISOString(),
  };
}

describe('LogPage (integration)', () => {
  beforeEach(() => {
    mockEntries.length = 0;
    mockCreateEntry.mockReset();
  });

  // ── MoodPicker presence ──────────────────────────────────────────────────
  it('renders the Daily Check-in card', () => {
    render(<LogPage />);
    expect(screen.getByText('Daily Check-in')).toBeInTheDocument();
  });

  it('renders all 5 mood buttons', () => {
    render(<LogPage />);
    for (const label of ['Great', 'Good', 'Okay', 'Bad', 'Awful']) {
      expect(
        screen.getByRole('button', { name: `Select mood: ${label}` }),
      ).toBeInTheDocument();
    }
  });

  // ── Sidebar: today status ────────────────────────────────────────────────
  it("shows today's date in the sidebar", () => {
    render(<LogPage />);
    // Date appears in both the sidebar and the MoodPicker header
    const matches = screen.getAllByText(format(new Date(), 'EEEE, MMMM d'));
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Not logged yet" when no entry exists for today', () => {
    render(<LogPage />);
    expect(screen.getByText('Not logged yet')).toBeInTheDocument();
  });

  it('shows "Entry logged today" when today has an entry', () => {
    mockEntries.push(makeEntry('1', 4, 0));
    render(<LogPage />);
    expect(screen.getByText('Entry logged today')).toBeInTheDocument();
  });

  // ── Sidebar: weekly strip ────────────────────────────────────────────────
  it('renders the "This week" section', () => {
    render(<LogPage />);
    expect(screen.getByText('This week')).toBeInTheDocument();
  });

  // ── Sidebar: streak + totals ─────────────────────────────────────────────
  it('shows the streak label', () => {
    render(<LogPage />);
    expect(screen.getByText('day streak')).toBeInTheDocument();
  });

  it('shows streak of 0 when there are no entries', () => {
    render(<LogPage />);
    // Both cards show 0
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(1);
  });

  it('shows total entries count', () => {
    render(<LogPage />);
    expect(screen.getByText('total entries')).toBeInTheDocument();
  });

  it('reflects the correct total when entries are present', () => {
    mockEntries.push(makeEntry('1', 5, 2), makeEntry('2', 4, 1));
    render(<LogPage />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
