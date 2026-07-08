import { describe, it, expect, vi } from 'vitest';
import { ConsoleSmsProvider } from '../src/services/sms/providers/console';

describe('SmsProvider', () => {
  it('ConsoleSmsProvider logs and resolves', async () => {
    const provider = new ConsoleSmsProvider();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await provider.send({ to: '+989120000000', message: 'Your code is 123456' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
