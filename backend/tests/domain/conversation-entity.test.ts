import { describe, it, expect } from 'vitest';
import { Conversation } from '../../src/domain/entities/conversation/Conversation.entity.js';
import { Message } from '../../src/domain/entities/conversation/Message.entity.js';
import { ConversationStatus } from '../../src/domain/entities/value-objects/ConversationStatus.js';
import { DeliveryStatus } from '../../src/domain/entities/value-objects/DeliveryStatus.js';
import { MessageType } from '../../src/domain/entities/value-objects/MessageType.js';

describe('Conversation', () => {
  const now = new Date();

  function makeSnapshot(overrides: Partial<ReturnType<Conversation['snapshot']>> = {}) {
    return {
      id: 1,
      listingId: 100,
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      status: 'active',
      lastMessageId: null,
      lastMessageAt: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      deletedAt: null,
      version: 1,
      ...overrides,
    };
  }

  describe('create', () => {
    it('creates a new active conversation', () => {
      const conv = Conversation.create({ id: 0, listingId: 100, buyerId: 'buyer-1', sellerId: 'seller-1' });
      expect(conv.status).toBe(ConversationStatus.Active);
      expect(conv.isParticipant('buyer-1')).toBe(true);
      expect(conv.isParticipant('seller-1')).toBe(true);
      expect(conv.isParticipant('other')).toBe(false);
      expect(conv.isActive()).toBe(true);
    });
  });

  describe('fromSnapshot / snapshot', () => {
    it('round-trips correctly', () => {
      const s = makeSnapshot();
      const conv = Conversation.fromSnapshot(s);
      expect(conv.snapshot()).toEqual(s);
    });
  });

  describe('isParticipant', () => {
    it('returns true for buyer and seller', () => {
      const conv = Conversation.fromSnapshot(makeSnapshot());
      expect(conv.isParticipant('buyer-1')).toBe(true);
      expect(conv.isParticipant('seller-1')).toBe(true);
      expect(conv.isParticipant('other')).toBe(false);
    });
  });

  describe('updateLastMessage', () => {
    it('updates lastMessageId and lastMessageAt', () => {
      const conv = Conversation.fromSnapshot(makeSnapshot());
      conv.updateLastMessage(42);
      expect(conv.lastMessageId).toBe(42);
      expect(conv.lastMessageAt).toBeInstanceOf(Date);
    });
  });

  describe('archive / unarchive', () => {
    it('archives and unarchives', () => {
      const conv = Conversation.fromSnapshot(makeSnapshot());
      conv.archive();
      expect(conv.status).toBe(ConversationStatus.Archived);
      conv.unarchive();
      expect(conv.status).toBe(ConversationStatus.Active);
    });

    it('throws when archiving already archived', () => {
      const conv = Conversation.fromSnapshot(makeSnapshot({ status: 'archived' }));
      expect(() => conv.archive()).toThrow();
    });
  });

  describe('block', () => {
    it('blocks the conversation', () => {
      const conv = Conversation.fromSnapshot(makeSnapshot());
      conv.block();
      expect(conv.status).toBe(ConversationStatus.Blocked);
    });
  });

  describe('softDelete', () => {
    it('marks as deleted', () => {
      const conv = Conversation.fromSnapshot(makeSnapshot());
      conv.softDelete();
      expect(conv.deletedAt).toBeInstanceOf(Date);
      expect(conv.isActive()).toBe(false);
    });

    it('throws when already deleted', () => {
      const conv = Conversation.fromSnapshot(makeSnapshot({ deletedAt: now.toISOString() }));
      expect(() => conv.softDelete()).toThrow();
    });
  });
});

describe('Message', () => {
  function makeSnapshot(overrides: Partial<ReturnType<Message['snapshot']>> = {}) {
    return {
      id: 1,
      conversationId: 1,
      senderId: 'buyer-1',
      body: 'Hello',
      type: 'text',
      deliveryStatus: 'sent',
      offerId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readAt: null,
      deletedAt: null,
      version: 1,
      ...overrides,
    };
  }

  describe('create', () => {
    it('creates a text message with sent status', () => {
      const msg = Message.create({ id: 0, conversationId: 1, senderId: 'user-1', body: 'Hello' });
      expect(msg.body).toBe('Hello');
      expect(msg.type).toBe(MessageType.Text);
      expect(msg.deliveryStatus).toBe(DeliveryStatus.Sent);
      expect(msg.isSentBy('user-1')).toBe(true);
      expect(msg.isDeleted()).toBe(false);
    });

    it('creates an image message', () => {
      const msg = Message.create({ id: 0, conversationId: 1, senderId: 'user-1', body: null, type: 'image' });
      expect(msg.body).toBeNull();
      expect(msg.type).toBe(MessageType.Image);
    });
  });

  describe('fromSnapshot / snapshot', () => {
    it('round-trips correctly', () => {
      const s = makeSnapshot();
      const msg = Message.fromSnapshot(s);
      expect(msg.snapshot()).toEqual(s);
    });
  });

  describe('markDelivered', () => {
    it('transitions from sent to delivered', () => {
      const msg = Message.fromSnapshot(makeSnapshot());
      msg.markDelivered();
      expect(msg.deliveryStatus).toBe(DeliveryStatus.Delivered);
    });

    it('throws when marking delivered from read', () => {
      const msg = Message.fromSnapshot(makeSnapshot({ deliveryStatus: 'read' }));
      expect(() => msg.markDelivered()).toThrow();
    });
  });

  describe('markRead', () => {
    it('transitions from delivered to read', () => {
      const msg = Message.fromSnapshot(makeSnapshot({ deliveryStatus: 'delivered' }));
      msg.markRead();
      expect(msg.deliveryStatus).toBe(DeliveryStatus.Read);
      expect(msg.readAt).toBeInstanceOf(Date);
    });
  });

  describe('softDelete', () => {
    it('marks as deleted', () => {
      const msg = Message.fromSnapshot(makeSnapshot());
      msg.softDelete();
      expect(msg.isDeleted()).toBe(true);
    });

    it('throws when already deleted', () => {
      const msg = Message.fromSnapshot(makeSnapshot({ deletedAt: new Date().toISOString() }));
      expect(() => msg.softDelete()).toThrow();
    });
  });
});
