import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthGate } from './AuthGate';

const mockUseAuthStore = vi.hoisted(() => vi.fn());

vi.mock('@/store/authStore', () => ({
  useAuthStore: mockUseAuthStore,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('AuthGate', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false });
  });

  it('renders children when authenticated', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: true });
    render(<AuthGate><div>protected content</div></AuthGate>);
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });

  it('shows login prompt when unauthenticated', () => {
    render(<AuthGate>hidden</AuthGate>);
    expect(screen.getByText('ورود به حساب کاربری')).toBeInTheDocument();
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
  });

  it('shows minimal variant when minimal prop is set', () => {
    render(<AuthGate minimal>hidden</AuthGate>);
    expect(screen.getByText('ورود به حساب')).toBeInTheDocument();
    expect(screen.queryByText('ورود به حساب کاربری')).not.toBeInTheDocument();
  });

  it('uses custom message when provided', () => {
    render(<AuthGate message="متن دلخواه">hidden</AuthGate>);
    expect(screen.getByText('متن دلخواه')).toBeInTheDocument();
  });
});
