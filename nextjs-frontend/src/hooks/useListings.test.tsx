import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useListings } from './useListings';

const mockApiGet = vi.hoisted(() => vi.fn());
const mockApiPost = vi.hoisted(() => vi.fn());
const mockApiPut = vi.hoisted(() => vi.fn());
const mockApiDelete = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api', () => ({
  default: { get: mockApiGet, post: mockApiPost, put: mockApiPut, delete: mockApiDelete },
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: Object.assign(
    () => ({ setAuth: vi.fn(), logout: vi.fn() }),
    { getState: () => ({ token: 'test-token' }) },
  ),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useListings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches listings list', async () => {
    const mockData = { data: [{ id: 1, title: 'test' }] };
    mockApiGet.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useListings({ page: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiGet).toHaveBeenCalledWith('/listings', { params: { page: 1 } });
  });

});
