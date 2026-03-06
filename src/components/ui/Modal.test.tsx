import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Modal from './Modal';

const onClose = vi.fn();

function renderModal(open: boolean) {
  return render(
    <Modal open={open} onClose={onClose} title="Test Modal">
      <p>Modal content</p>
    </Modal>,
  );
}

describe('Modal', () => {
  describe('when closed', () => {
    it('renders nothing', () => {
      renderModal(false);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('when open', () => {
    it('renders the dialog with the correct title', () => {
      renderModal(true);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('renders children inside the panel', () => {
      renderModal(true);
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('has aria-modal="true"', () => {
      renderModal(true);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Modal open onClose={onClose} title="Test">
          <p>content</p>
        </Modal>,
      );
      // The backdrop is the absolute-positioned div behind the panel
      const backdrop = document.querySelector('.absolute.inset-0') as HTMLElement;
      await user.click(backdrop);
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onClose when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderModal(true);
      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalled();
    });

    it('does NOT call onClose for non-Escape keys', async () => {
      const user = userEvent.setup();
      onClose.mockReset();
      renderModal(true);
      await user.keyboard('{Enter}');
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
