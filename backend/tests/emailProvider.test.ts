import { describe, it, expect, vi } from 'vitest';
import { ConsoleEmailProvider } from '../src/services/email/providers/console';
import { NoopEmailProvider } from '../src/services/email/providers/noop';

describe('EmailProvider', () => {
  it('ConsoleEmailProvider logs and resolves', async () => {
    const provider = new ConsoleEmailProvider();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await provider.send({ to: 'test@test.com', subject: 'Test', body: 'Hello' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('NoopEmailProvider does nothing', async () => {
    const provider = new NoopEmailProvider();
    await expect(provider.send({ to: 'test@test.com', subject: 'Test', body: 'Hello' })).resolves.toBeUndefined();
  });
});
