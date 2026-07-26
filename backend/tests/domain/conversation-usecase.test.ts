import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateConversationUseCase } from '../../src/domain/application/conversation/CreateConversationUseCase.js';
import { SendMessageUseCase } from '../../src/domain/application/conversation/SendMessageUseCase.js';
import { MarkReadUseCase } from '../../src/domain/application/conversation/MarkReadUseCase.js';
import { GetConversationsUseCase } from '../../src/domain/application/conversation/GetConversationsUseCase.js';
import { GetMessagesUseCase } from '../../src/domain/application/conversation/GetMessagesUseCase.js';
import { CreateConversationCommand } from '../../src/domain/application/conversation/commands/CreateConversationCommand.js';
import { SendMessageCommand } from '../../src/domain/application/conversation/commands/SendMessageCommand.js';
import { MarkReadCommand } from '../../src/domain/application/conversation/commands/MarkReadCommand.js';
import { GetConversationsCommand } from '../../src/domain/application/conversation/commands/GetConversationsCommand.js';
import { GetMessagesCommand } from '../../src/domain/application/conversation/commands/GetMessagesCommand.js';
import type { ConversationRepository } from '../../src/domain/entities/conversation/Conversation.repository.js';
import type { MessageRepository } from '../../src/domain/entities/conversation/Message.repository.js';
import type { UnitOfWork } from '../../src/domain/infrastructure/persistence/UnitOfWork.js';
import type { OutboxRepository } from '../../src/domain/infrastructure/outbox/OutboxRepository.js';

function mockUow(
  convRepo: ConversationRepository,
  msgRepo: MessageRepository,
  outboxRepo: OutboxRepository,
): UnitOfWork {
  return {
    execute: <T>(fn: (uow: {
      conversationRepo: ConversationRepository;
      messageRepo: MessageRepository;
      outboxRepo: OutboxRepository;
    }) => Promise<T>): Promise<T> => fn({
      conversationRepo: convRepo,
      messageRepo: msgRepo,
      outboxRepo,
    }),
  };
}

function makeConvRepo(): ConversationRepository {
  return {
    findById: vi.fn(),
    findByListingAndBuyer: vi.fn(),
    findByListingAndSellerBuyer: vi.fn(),
    findConversationsByUser: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };
}

function makeMsgRepo(): MessageRepository {
  return {
    findById: vi.fn(),
    findByConversation: vi.fn(),
    addMessage: vi.fn(),
    save: vi.fn(),
    markRead: vi.fn(),
    getUnreadCount: vi.fn(),
    getUnreadCountForConversation: vi.fn(),
  };
}

function makeOutboxRepo(): OutboxRepository {
  return {
    save: vi.fn(),
    findPending: vi.fn(),
    findFailed: vi.fn(),
    findDeadLetters: vi.fn(),
    updateStatus: vi.fn(),
    deletePublished: vi.fn(),
  };
}

const LISTING_ID = 1;
const BUYER_ID = 'buyer-1';
const SELLER_ID = 'seller-1';
const CONVERSATION_ID = 42;

describe('CreateConversationUseCase', () => {
  let convRepo: ConversationRepository;
  let msgRepo: MessageRepository;
  let outboxRepo: OutboxRepository;
  let useCase: CreateConversationUseCase;

  beforeEach(() => {
    convRepo = makeConvRepo();
    msgRepo = makeMsgRepo();
    outboxRepo = makeOutboxRepo();
    useCase = new CreateConversationUseCase(mockUow(convRepo, msgRepo, outboxRepo));
  });

  it('creates a new conversation', async () => {
    convRepo.findByListingAndSellerBuyer = vi.fn().mockResolvedValue(null);
    convRepo.save = vi.fn().mockImplementation(async (conv: any) => {
      conv.id = CONVERSATION_ID;
    });
    outboxRepo.save = vi.fn().mockResolvedValue(undefined);

    const cmd = new CreateConversationCommand(LISTING_ID, BUYER_ID, SELLER_ID);
    const dto = await useCase.execute(cmd);

    expect(dto.id).toBe(CONVERSATION_ID);
    expect(dto.listingId).toBe(LISTING_ID);
    expect(dto.buyerId).toBe(BUYER_ID);
    expect(dto.sellerId).toBe(SELLER_ID);
    expect(dto.status).toBe('active');
    expect(convRepo.findByListingAndSellerBuyer).toHaveBeenCalledWith(LISTING_ID, BUYER_ID, SELLER_ID);
    expect(convRepo.save).toHaveBeenCalled();
    expect(outboxRepo.save).toHaveBeenCalled();
  });

  it('returns existing conversation if found', async () => {
    const fakeConv = {
      id: CONVERSATION_ID, listingId: LISTING_ID, buyerId: BUYER_ID, sellerId: SELLER_ID,
      snapshot: () => ({
        id: CONVERSATION_ID, listingId: LISTING_ID, buyerId: BUYER_ID, sellerId: SELLER_ID,
        status: 'active', lastMessageId: null, lastMessageAt: null,
        createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
        deletedAt: null, version: 1,
      }),
    } as any;
    convRepo.findByListingAndSellerBuyer = vi.fn().mockResolvedValue(fakeConv);

    const cmd = new CreateConversationCommand(LISTING_ID, BUYER_ID, SELLER_ID);
    const dto = await useCase.execute(cmd);

    expect(dto.id).toBe(CONVERSATION_ID);
    expect(convRepo.save).not.toHaveBeenCalled();
    expect(outboxRepo.save).not.toHaveBeenCalled();
  });
});

describe('SendMessageUseCase', () => {
  let convRepo: ConversationRepository;
  let msgRepo: MessageRepository;
  let outboxRepo: OutboxRepository;
  let useCase: SendMessageUseCase;

  beforeEach(() => {
    convRepo = makeConvRepo();
    msgRepo = makeMsgRepo();
    outboxRepo = makeOutboxRepo();
    useCase = new SendMessageUseCase(mockUow(convRepo, msgRepo, outboxRepo));
  });

  it('sends a message to an active conversation', async () => {
    const fakeConv = {
      id: CONVERSATION_ID, listingId: LISTING_ID, buyerId: BUYER_ID, sellerId: SELLER_ID,
      version: 1,
      isParticipant: vi.fn().mockReturnValue(true),
      isActive: vi.fn().mockReturnValue(true),
      updateLastMessage: vi.fn(),
      snapshot: () => ({
        id: CONVERSATION_ID, listingId: LISTING_ID, buyerId: BUYER_ID, sellerId: SELLER_ID,
        status: 'active', lastMessageId: null, lastMessageAt: null,
        createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
        deletedAt: null, version: 1,
      }),
    } as any;
    convRepo.findById = vi.fn().mockResolvedValue(fakeConv);
    msgRepo.addMessage = vi.fn().mockResolvedValue({
      id: 1,
      conversationId: CONVERSATION_ID,
      senderId: BUYER_ID,
      body: 'Hello',
      type: 'text',
      deliveryStatus: 'sent',
      snapshot: () => ({
        id: 1, conversationId: CONVERSATION_ID, senderId: BUYER_ID, body: 'Hello',
        type: 'text', deliveryStatus: 'sent', createdAt: '2024-01-01T00:00:00Z',
        readAt: null, deletedAt: null,
      }),
    });
    outboxRepo.save = vi.fn().mockResolvedValue(undefined);

    const cmd = new SendMessageCommand(CONVERSATION_ID, BUYER_ID, 'Hello');
    const dto = await useCase.execute(cmd);

    expect(dto.body).toBe('Hello');
    expect(dto.senderId).toBe(BUYER_ID);
    expect(dto.type).toBe('text');
    expect(dto.deliveryStatus).toBe('sent');
    expect(convRepo.findById).toHaveBeenCalledWith(CONVERSATION_ID);
    expect(msgRepo.addMessage).toHaveBeenCalled();
    expect(fakeConv.updateLastMessage).toHaveBeenCalledWith(1);
    expect(convRepo.save).toHaveBeenCalledWith(fakeConv, 1);
    expect(outboxRepo.save).toHaveBeenCalled();
  });

  it('throws if conversation not found', async () => {
    convRepo.findById = vi.fn().mockResolvedValue(null);
    const cmd = new SendMessageCommand(CONVERSATION_ID, BUYER_ID, 'Hello');
    await expect(useCase.execute(cmd)).rejects.toThrow('not found');
  });

  it('throws if sender is not a participant', async () => {
    convRepo.findById = vi.fn().mockResolvedValue({ isParticipant: vi.fn().mockReturnValue(false) } as any);
    const cmd = new SendMessageCommand(CONVERSATION_ID, 'stranger', 'Hello');
    await expect(useCase.execute(cmd)).rejects.toThrow('not a participant');
  });

  it('throws if conversation is not active', async () => {
    convRepo.findById = vi.fn().mockResolvedValue({
      isParticipant: vi.fn().mockReturnValue(true),
      isActive: vi.fn().mockReturnValue(false),
    } as any);
    const cmd = new SendMessageCommand(CONVERSATION_ID, BUYER_ID, 'Hello');
    await expect(useCase.execute(cmd)).rejects.toThrow('not active');
  });
});

describe('MarkReadUseCase', () => {
  let convRepo: ConversationRepository;
  let msgRepo: MessageRepository;
  let outboxRepo: OutboxRepository;
  let useCase: MarkReadUseCase;

  beforeEach(() => {
    convRepo = makeConvRepo();
    msgRepo = makeMsgRepo();
    outboxRepo = makeOutboxRepo();
    useCase = new MarkReadUseCase(mockUow(convRepo, msgRepo, outboxRepo));
  });

  it('marks messages as read', async () => {
    convRepo.findById = vi.fn().mockResolvedValue({ isParticipant: vi.fn().mockReturnValue(true) } as any);

    const cmd = new MarkReadCommand(CONVERSATION_ID, BUYER_ID);
    await useCase.execute(cmd);

    expect(msgRepo.markRead).toHaveBeenCalledWith(CONVERSATION_ID, BUYER_ID);
  });

  it('throws if conversation not found', async () => {
    convRepo.findById = vi.fn().mockResolvedValue(null);
    await expect(useCase.execute(new MarkReadCommand(CONVERSATION_ID, BUYER_ID))).rejects.toThrow('not found');
  });

  it('throws if user is not a participant', async () => {
    convRepo.findById = vi.fn().mockResolvedValue({ isParticipant: vi.fn().mockReturnValue(false) } as any);
    await expect(useCase.execute(new MarkReadCommand(CONVERSATION_ID, 'stranger'))).rejects.toThrow('not a participant');
  });
});

describe('GetConversationsUseCase', () => {
  let convRepo: ConversationRepository;
  let useCase: GetConversationsUseCase;

  beforeEach(() => {
    convRepo = makeConvRepo();
    useCase = new GetConversationsUseCase(convRepo);
  });

  it('returns conversations for user', async () => {
    const fakeConv = {
      snapshot: () => ({
        id: CONVERSATION_ID, listingId: LISTING_ID, buyerId: BUYER_ID, sellerId: SELLER_ID,
        status: 'active', lastMessageId: null, lastMessageAt: null,
        createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
        deletedAt: null, version: 1,
      }),
    } as any;
    convRepo.findConversationsByUser = vi.fn().mockResolvedValue([fakeConv]);

    const dtos = await useCase.execute(new GetConversationsCommand(BUYER_ID));

    expect(dtos).toHaveLength(1);
    expect(dtos[0].id).toBe(CONVERSATION_ID);
  });
});

describe('GetMessagesUseCase', () => {
  let convRepo: ConversationRepository;
  let msgRepo: MessageRepository;
  let useCase: GetMessagesUseCase;

  beforeEach(() => {
    convRepo = makeConvRepo();
    msgRepo = makeMsgRepo();
    useCase = new GetMessagesUseCase(convRepo, msgRepo);
  });

  it('returns messages for conversation participant', async () => {
    convRepo.findById = vi.fn().mockResolvedValue({ isParticipant: vi.fn().mockReturnValue(true) } as any);
    msgRepo.findByConversation = vi.fn().mockResolvedValue({
      messages: [
        { snapshot: () => ({ id: 1, conversationId: CONVERSATION_ID, senderId: BUYER_ID, body: 'Hi', type: 'text', deliveryStatus: 'sent', createdAt: '2024-01-01T00:00:00Z', readAt: null, deletedAt: null }) },
        { snapshot: () => ({ id: 2, conversationId: CONVERSATION_ID, senderId: SELLER_ID, body: 'Hello', type: 'text', deliveryStatus: 'read', createdAt: '2024-01-01T00:00:01Z', readAt: '2024-01-01T00:00:02Z', deletedAt: null }) },
      ],
      nextCursor: null,
      hasMore: false,
    });

    const dtos = await useCase.execute(new GetMessagesCommand(CONVERSATION_ID, BUYER_ID));

    expect(dtos).toHaveLength(2);
    expect(dtos[0].body).toBe('Hi');
    expect(dtos[1].body).toBe('Hello');
    expect(dtos[1].deliveryStatus).toBe('read');
  });

  it('throws if user is not a participant', async () => {
    convRepo.findById = vi.fn().mockResolvedValue({ isParticipant: vi.fn().mockReturnValue(false) } as any);
    await expect(useCase.execute(new GetMessagesCommand(CONVERSATION_ID, 'stranger'))).rejects.toThrow('not a participant');
  });
});
