import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import EntryDetail from './EntryDetail';
import type { MoodEntry } from '@/types';

const ENTRY: MoodEntry = {
  id: 'entry-1',
  user_id: 'user-1',
  mood_score: 5,
  note: 'Had a wonderful day!',
  created_at: '2026-03-05T14:30:00.000Z',
};

const ENTRY_NO_NOTE: MoodEntry = { ...ENTRY, id: 'entry-2', note: '' };

describe('EntryDetail', () => {
  it('renders nothing when entry is null', () => {
    const { container } = render(
      <EntryDetail entry={null} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  describe('with an entry', () => {
    it('displays the mood label', () => {
      render(<EntryDetail entry={ENTRY} onEdit={vi.fn()} onDelete={vi.fn()} />);
      expect(screen.getByText('Great')).toBeInTheDocument();
    });

    it('displays the note text', () => {
      render(<EntryDetail entry={ENTRY} onEdit={vi.fn()} onDelete={vi.fn()} />);
      expect(screen.getByText('Had a wonderful day!')).toBeInTheDocument();
    });

    it('shows "No note added." when note is empty', () => {
      render(<EntryDetail entry={ENTRY_NO_NOTE} onEdit={vi.fn()} onDelete={vi.fn()} />);
      expect(screen.getByText('No note added.')).toBeInTheDocument();
    });

    it('does NOT show "No note added." when note exists', () => {
      render(<EntryDetail entry={ENTRY} onEdit={vi.fn()} onDelete={vi.fn()} />);
      expect(screen.queryByText('No note added.')).not.toBeInTheDocument();
    });

    it('renders an Edit button', () => {
      render(<EntryDetail entry={ENTRY} onEdit={vi.fn()} onDelete={vi.fn()} />);
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });

    it('renders a Delete button', () => {
      render(<EntryDetail entry={ENTRY} onEdit={vi.fn()} onDelete={vi.fn()} />);
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });

    it('calls onEdit when Edit is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<EntryDetail entry={ENTRY} onEdit={onEdit} onDelete={vi.fn()} />);
      await user.click(screen.getByRole('button', { name: /Edit/i }));
      expect(onEdit).toHaveBeenCalledOnce();
    });

    it('calls onDelete when Delete is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<EntryDetail entry={ENTRY} onEdit={vi.fn()} onDelete={onDelete} />);
      await user.click(screen.getByRole('button', { name: /Delete/i }));
      expect(onDelete).toHaveBeenCalledOnce();
    });

    it('displays a formatted timestamp', () => {
      render(<EntryDetail entry={ENTRY} onEdit={vi.fn()} onDelete={vi.fn()} />);
      // Should contain the month and year
      expect(screen.getByText(/March 5, 2026/)).toBeInTheDocument();
    });
  });
});
