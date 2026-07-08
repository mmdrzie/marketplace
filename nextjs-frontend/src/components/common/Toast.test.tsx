import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastContainer, toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders container without toasts', () => {
    render(<ToastContainer />);
    expect(document.querySelector('.fixed')).toBeInTheDocument();
  });

  it('shows toast when toast() is called', () => {
    render(<ToastContainer />);
    act(() => { toast({ type: 'success', title: 'success title' }); });
    expect(screen.getByText('success title')).toBeInTheDocument();
  });

  it('shows message when provided', () => {
    render(<ToastContainer />);
    act(() => { toast({ type: 'error', title: 'error', message: 'description' }); });
    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('auto-dismisses after default 3500ms', () => {
    render(<ToastContainer />);
    act(() => { toast({ type: 'info', title: 'auto dismiss' }); });
    expect(screen.getByText('auto dismiss')).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(3500); });
    expect(screen.queryByText('auto dismiss')).not.toBeInTheDocument();
  });
});
