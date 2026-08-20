import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal/Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders when open', () => {
    render(<Modal {...defaultProps} />);
    
    expect(screen.getByText('Modal content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  test('renders title when provided', () => {
    render(<Modal {...defaultProps} title="Test Modal" />);
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cerrar modal/i })).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onCloseMock = jest.fn();
    
    render(<Modal {...defaultProps} onClose={onCloseMock} title="Test Modal" />);
    
    const closeButton = screen.getByRole('button', { name: /cerrar modal/i });
    await user.click(closeButton);
    
    expect(onCloseMock).toHaveBeenCalled();
  });

  test('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup();
    const onCloseMock = jest.fn();
    
    render(<Modal {...defaultProps} onClose={onCloseMock} />);
    
    const overlay = screen.getByRole('dialog').parentElement;
    await user.click(overlay!);
    
    expect(onCloseMock).toHaveBeenCalled();
  });

  test('does not close when clicking inside modal', async () => {
    const user = userEvent.setup();
    const onCloseMock = jest.fn();
    
    render(<Modal {...defaultProps} onClose={onCloseMock} />);
    
    const modalContent = screen.getByText('Modal content');
    await user.click(modalContent);
    
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  test('closes on Escape key when enabled', () => {
    const onCloseMock = jest.fn();
    
    render(<Modal {...defaultProps} onClose={onCloseMock} closeOnEscape={true} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onCloseMock).toHaveBeenCalled();
  });

  test('does not close on Escape when disabled', () => {
    const onCloseMock = jest.fn();
    
    render(<Modal {...defaultProps} onClose={onCloseMock} closeOnEscape={false} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  test('applies correct size classes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md');
    
    rerender(<Modal {...defaultProps} size="lg" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-2xl');
    
    rerender(<Modal {...defaultProps} size="full" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-full');
  });

  test('prevents body scroll when open', () => {
    const originalOverflow = document.body.style.overflow;
    
    render(<Modal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
    
    // Cleanup
    document.body.style.overflow = originalOverflow;
  });

  test('restores body scroll when closed', () => {
    const originalOverflow = document.body.style.overflow;
    
    const { rerender } = render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('');
    
    // Cleanup
    document.body.style.overflow = originalOverflow;
  });

  test('has proper ARIA attributes', () => {
    render(<Modal {...defaultProps} title="Test Modal" />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });
});