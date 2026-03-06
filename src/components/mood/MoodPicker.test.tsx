// US-1: Mood Selection (Issue #2) · US-2: Notes (Issue #3)
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MoodPicker from './MoodPicker';

// Mood labels as the component renders them via labelFromScore()
const MOOD_LABELS = ['Great', 'Good', 'Okay', 'Bad', 'Awful'] as const;

// ── Shared mock ──────────────────────────────────────────────────────────────
const mockOnSave = vi.fn<[number, string], Promise<void>>();

beforeEach(() => {
  mockOnSave.mockResolvedValue(undefined);
});

afterEach(() => {
  mockOnSave.mockReset();
});

// ── Test suites ──────────────────────────────────────────────────────────────

describe('MoodPicker (log entry form)', () => {

  // ── 1. Initial render ──────────────────────────────────────────────────────
  describe('initial render', () => {
    it('renders all 5 mood buttons', () => {
      render(<MoodPicker onSave={mockOnSave} />);

      MOOD_LABELS.forEach((label) => {
        expect(
          screen.getByRole('button', { name: `Select mood: ${label}` }),
        ).toBeInTheDocument();
      });
    });

    it('all mood buttons start un-pressed', () => {
      render(<MoodPicker onSave={mockOnSave} />);

      MOOD_LABELS.forEach((label) => {
        expect(
          screen.getByRole('button', { name: `Select mood: ${label}` }),
        ).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('save button is disabled before any mood is selected', () => {
      render(<MoodPicker onSave={mockOnSave} />);

      expect(screen.getByRole('button', { name: /Save Entry/i })).toBeDisabled();
    });

    it('renders the notes textarea associated with its label', () => {
      render(<MoodPicker onSave={mockOnSave} />);

      // getByLabelText finds the textarea via the <label htmlFor="mood-note">
      expect(screen.getByLabelText(/Your note/i)).toBeInTheDocument();
    });

    it('shows 500 characters remaining on load', () => {
      render(<MoodPicker onSave={mockOnSave} />);

      expect(screen.getByText('500 remaining')).toBeInTheDocument();
    });

    it('does not show the feeling indicator before a mood is picked', () => {
      render(<MoodPicker onSave={mockOnSave} />);

      expect(screen.queryByText(/You're feeling/i)).not.toBeInTheDocument();
    });

    it('does not show the success banner on load', () => {
      render(<MoodPicker onSave={mockOnSave} />);

      expect(screen.queryByText(/Entry saved!/i)).not.toBeInTheDocument();
    });
  });

  // ── 2. Mood selection ──────────────────────────────────────────────────────
  describe('mood selection', () => {
    it('marks the clicked button as aria-pressed="true"', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: 'Select mood: Great' }));

      expect(
        screen.getByRole('button', { name: 'Select mood: Great' }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    it('deselects the previous mood when a new one is picked', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: 'Select mood: Great' }));
      await user.click(screen.getByRole('button', { name: 'Select mood: Okay' }));

      expect(
        screen.getByRole('button', { name: 'Select mood: Great' }),
      ).toHaveAttribute('aria-pressed', 'false');
      expect(
        screen.getByRole('button', { name: 'Select mood: Okay' }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows the feeling indicator after a mood is selected', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: 'Select mood: Good' }));

      // The <p> inside the aria-live region has combined text "You're feeling Good 🙂"
      const indicator = screen.getByText(/You're feeling/i);
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveTextContent('Good');
    });

    it('updates the feeling indicator when switching moods', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: 'Select mood: Great' }));
      await user.click(screen.getByRole('button', { name: 'Select mood: Bad' }));

      expect(screen.getByText(/You're feeling/i)).toHaveTextContent('Bad');
    });

    it('enables the save button once a mood is selected', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: 'Select mood: Awful' }));

      expect(screen.getByRole('button', { name: /Save Entry/i })).toBeEnabled();
    });
  });

  // ── 3. Notes textarea ──────────────────────────────────────────────────────
  describe('notes textarea', () => {
    it('decrements the character counter as the user types', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      await user.type(screen.getByLabelText(/Your note/i), 'Hello');

      expect(screen.getByText('495 remaining')).toBeInTheDocument();
    });

    it('turns the counter red at exactly 50 characters remaining (≤ threshold)', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      // 450 typed → 50 remaining, which equals LOW_CHAR_THRESHOLD (50) → red
      await user.type(screen.getByLabelText(/Your note/i), 'a'.repeat(450));

      expect(screen.getByText('50 remaining')).toHaveClass('text-red-500');
    });

    it('keeps the counter its default colour at 51 characters remaining (> threshold)', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      // 449 typed → 51 remaining → still neutral
      await user.type(screen.getByLabelText(/Your note/i), 'a'.repeat(449));

      expect(screen.getByText('51 remaining')).not.toHaveClass('text-red-500');
    });

    it('caps input at 500 characters and shows 0 remaining', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      const textarea = screen.getByLabelText(/Your note/i) as HTMLTextAreaElement;
      await user.type(textarea, 'a'.repeat(510));

      // Slice in onChange caps the value
      expect(textarea.value).toHaveLength(500);
      expect(screen.getByText('0 remaining')).toBeInTheDocument();
    });
  });

  // ── 4. Saving an entry ─────────────────────────────────────────────────────
  describe('saving an entry', () => {
    it('calls onSave with the selected mood score and note text', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: 'Select mood: Great' }));
      await user.type(screen.getByLabelText(/Your note/i), 'Had a great day!');
      await user.click(screen.getByRole('button', { name: /Save Entry/i }));

      // score 5 = Great
      expect(mockOnSave).toHaveBeenCalledOnce();
      expect(mockOnSave).toHaveBeenCalledWith(5, 'Had a great day!');
    });

    it('passes an empty string when the note textarea is left blank', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: 'Select mood: Bad' }));
      await user.click(screen.getByRole('button', { name: /Save Entry/i }));

      // score 2 = Bad
      expect(mockOnSave).toHaveBeenCalledWith(2, '');
    });

    it('resets the form (mood, note, counter, save button) after a successful save', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: 'Select mood: Great' }));
      await user.type(screen.getByLabelText(/Your note/i), 'Feeling great!');
      await user.click(screen.getByRole('button', { name: /Save Entry/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Select mood: Great' }),
        ).toHaveAttribute('aria-pressed', 'false');
      });

      const textarea = screen.getByLabelText(/Your note/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
      expect(screen.getByText('500 remaining')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Save Entry/i })).toBeDisabled();
    });

    it('shows "Saving…" and disables the save button while the request is in flight', async () => {
      let resolveOnSave!: () => void;
      const slowOnSave = vi.fn(
        () => new Promise<void>((resolve) => { resolveOnSave = resolve; }),
      );

      const user = userEvent.setup();
      render(<MoodPicker onSave={slowOnSave} />);

      await user.click(screen.getByRole('button', { name: 'Select mood: Okay' }));

      // Fire the save but don't await — we want to inspect the mid-flight state
      void user.click(screen.getByRole('button', { name: /Save Entry/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Saving/i })).toBeDisabled();
      });

      // Settle the promise — button should recover
      resolveOnSave();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save Entry/i })).toBeInTheDocument();
      });
    });

    it('shows the success banner after a successful save', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: 'Select mood: Okay' }));
      await user.click(screen.getByRole('button', { name: /Save Entry/i }));

      await waitFor(() => {
        expect(screen.getByText(/Entry saved!/i)).toBeInTheDocument();
      });
    });

    it('dismisses the success banner when the user clicks a mood button to start a new entry', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: 'Select mood: Okay' }));
      await user.click(screen.getByRole('button', { name: /Save Entry/i }));

      await waitFor(() => {
        expect(screen.getByText(/Entry saved!/i)).toBeInTheDocument();
      });

      // User picks their next mood — banner should disappear
      await user.click(screen.getByRole('button', { name: 'Select mood: Good' }));

      expect(screen.queryByText(/Entry saved!/i)).not.toBeInTheDocument();
    });

    it('does not call onSave when save button is clicked without a mood selected', async () => {
      const user = userEvent.setup();
      render(<MoodPicker onSave={mockOnSave} />);

      // Button is disabled — userEvent will not fire the click on a disabled element
      await user.click(screen.getByRole('button', { name: /Save Entry/i }));

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });
});
