import { describe, it, expect, vi } from 'vitest';
import { CreateListingUseCase } from '../../src/domain/application/listing/CreateListingUseCase.js';
import { CreateListingCommand } from '../../src/domain/application/listing/commands/CreateListingCommand.js';
import type { ListingRepository } from '../../src/domain/entities/listing/Listing.repository.js';

function mockTxManager() {
  return {
    run: <T>(fn: () => Promise<T>): Promise<T> => fn(),
    begin: async () => ({ commit: async () => {}, rollback: async () => {} }),
  };
}

describe('CreateListingUseCase', () => {
  it('creates listing and returns DTO', async () => {
    const mockRepo: ListingRepository = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      getDetails: vi.fn(),
    };

    const useCase = new CreateListingUseCase(mockRepo, undefined, mockTxManager() as any, { save: vi.fn() } as any);
    const cmd = new CreateListingCommand(
      'user-1', 1, 1, 1, 'Test Car', 'Description', 50000000, 'fixed',
    );

    const dto = await useCase.execute(cmd);

    expect(dto.title).toBe('Test Car');
    expect(dto.price).toBe(50000000);
    expect(dto.status).toBe('draft');
    expect(dto.slug).toBe('test-car');
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('fails when save throws', async () => {
    const mockRepo: ListingRepository = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn().mockRejectedValue(new Error('DB error')),
      delete: vi.fn(),
      getDetails: vi.fn(),
    };

    const useCase = new CreateListingUseCase(mockRepo, undefined, mockTxManager() as any, { save: vi.fn() } as any);
    const cmd = new CreateListingCommand(
      'user-1', 1, 1, 1, 'Test', 'Desc', 1000, 'fixed',
    );

    await expect(useCase.execute(cmd)).rejects.toThrow('DB error');
  });
});
