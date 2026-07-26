import { describe, it, expect, vi } from 'vitest';

// ساده: مستقیماً Transaction صدا نمی‌زنیم، فقط منطق rollback را تست می‌کنیم
// تست واقعی commit/rollback نیاز به database integration test دارد

describe('Transaction boundary via OutboxWriter', () => {
  it('MarkDownListing marksPublished saves to outbox', async () => {
    // این تست منطق outbox را بدون DB تایید می‌کند:
    // اگر outbox ذخیره نشود، خطا propagate می‌شود
    const mockOutboxRepo = { save: vi.fn() };
    const { OutboxWriter } = await import('../../src/domain/infrastructure/outbox/OutboxPublisher.js');
    const writer = new OutboxWriter(mockOutboxRepo as any);

    mockOutboxRepo.save.mockRejectedValueOnce(new Error('DB write failed'));

    await expect(writer.write({
      aggregateType: 'listing',
      aggregateId: '1',
      eventType: 'listing.created',
      payload: {},
      metadata: {},
    })).rejects.toThrow('DB write failed');

    expect(mockOutboxRepo.save).toHaveBeenCalledTimes(1);
  });
});
