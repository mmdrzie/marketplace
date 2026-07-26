import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('axios-retry', () => ({
  default: vi.fn(),
  axiosRetry: { isNetworkOrIdempotentRequestError: () => false, exponentialDelay: () => 0 },
}));

vi.mock('@/store/authStore', async () => {
  const actual = await vi.importActual<typeof import('@/store/authStore')>('@/store/authStore');
  return actual;
});

import axios from 'axios';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const mockUser = {
  id: 'u1', name: 'u', email: 'a@b.com', phone: null, avatar: null, city: null,
  role: 'user', status: null, phoneVerified: false, emailVerified: false,
  profile: null, dealer_profile: null, created_at: '',
} as never;

interface AxiosErrorShape {
  isAxiosError: boolean;
  response: { data: Record<string, never>; status: number; statusText: string; headers: Record<string, string>; config: Record<string, unknown> };
  config: Record<string, unknown>;
  message: string;
}

function make401(config: Record<string, unknown>): AxiosErrorShape {
  const err = new Error('Request failed with status code 401') as unknown as AxiosErrorShape;
  err.isAxiosError = true;
  err.response = { data: {}, status: 401, statusText: 'Unauthorized', headers: {}, config };
  err.config = config;
  return err;
}

describe('api 401 interceptor', () => {
  const realAdapter = api.defaults.adapter;
  let postSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    useAuthStore.getState().logout();
    const callCount: Record<string, number> = {};
    api.defaults.adapter = async (config: Record<string, unknown>) => {
      const url = String(config.url || '');
      if (url.includes('/auth/me')) {
        throw make401(config);
      }
      callCount[url] = (callCount[url] ?? 0) + 1;
      if (callCount[url] === 1) {
        throw make401(config);
      }
      return { data: { data: 'ok' }, status: 200, statusText: 'OK', headers: {} as Record<string, string>, config };
    };
    postSpy = vi.spyOn(axios, 'post').mockImplementation(async (url: string) => {
      if (String(url).includes('/auth/refresh')) {
        return { data: { data: { token: 'new-token', refreshToken: 'new-ref' }, token: 'new-token' } };
      }
      throw new Error('unexpected axios.post');
    });
  });

  afterEach(() => {
    api.defaults.adapter = realAdapter;
    postSpy.mockRestore();
  });

  it('attempts token refresh on 401 and retries with the new token', async () => {
    useAuthStore.getState().setAuth('old-token', mockUser, 'old-ref');

    const res = await api.get('/listings');

    expect(res.data.data).toBe('ok');
    expect(useAuthStore.getState().token).toBe('new-token');
    expect(postSpy).toHaveBeenCalled();
  });

  it('skips refresh for whitelisted /auth/me and rejects', async () => {
    useAuthStore.getState().setAuth('old-token', mockUser, 'old-ref');

    await expect(api.get('/auth/me')).rejects.toMatchObject({ response: { status: 401 } });
    expect(useAuthStore.getState().token).toBe('old-token');
    expect(postSpy).not.toHaveBeenCalled();
  });
});
