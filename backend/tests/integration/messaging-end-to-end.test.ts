import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from '../../src/config/database.js';
import { ConversationRepositoryImpl } from '../../src/domain/infrastructure/conversation/ConversationRepository.impl.js';
import { MessageRepositoryImpl } from '../../src/domain/infrastructure/conversation/MessageRepository.impl.js';
import { ConversationProjectionRepositoryImpl } from '../../src/domain/infrastructure/conversation/ConversationProjectionRepository.impl.js';
import { ConversationSummaryRepositoryImpl } from '../../src/domain/infrastructure/conversation/ConversationSummaryRepository.impl.js';
import { Conversation } from '../../src/domain/entities/conversation/Conversation.entity.js';
import { Message } from '../../src/domain/entities/conversation/Message.entity.js';
import { OutboxWorker } from '../../src/domain/infrastructure/outbox/OutboxWorker.js';
import { OutboxRepositoryImpl } from '../../src/domain/infrastructure/outbox/OutboxRepository.impl.js';
import { OutboxWriter } from '../../src/domain/infrastructure/outbox/OutboxPublisher.js';
import type { OutboxRepository } from '../../src/domain/infrastructure/outbox/OutboxRepository.js';

const conversationRepo = new ConversationRepositoryImpl();
const messageRepo = new MessageRepositoryImpl();
const projectionRepo = new ConversationProjectionRepositoryImpl();
const summaryRepo = new ConversationSummaryRepositoryImpl();
const outboxRepo = new OutboxRepositoryImpl();
const outboxWriter = new OutboxWriter(outboxRepo);

let listingId: number;
const BUYER_ID = '00000000-0000-0000-0000-000000000001';
const SELLER_ID = '00000000-0000-0000-0000-000000000002';

beforeAll(async () => {
  const db = await getDb();

  for (const id of [BUYER_ID, SELLER_ID]) {
    await db.query(
      `INSERT INTO users (id, email, name, password_hash, role, status)
       VALUES ($1, $2, $3, 'hash', 'user', 'active')
       ON CONFLICT (id) DO NOTHING`,
      [id, `${id}@test.com`, `User-${id}`],
    );
  }

  const catRes = await db.query('SELECT id FROM categories LIMIT 1');
  const cityRes = await db.query(
    'SELECT c.id as city_id, p.id as province_id FROM cities c JOIN provinces p ON p.id = c.province_id LIMIT 1',
  );

  if (!catRes.rows.length) throw new Error('No categories found — run seeds first');
  if (!cityRes.rows.length) throw new Error('No cities found — run seeds first');

  const categoryId = (catRes.rows[0] as { id: number }).id;
  const cityRow = cityRes.rows[0] as { city_id: number; province_id: number };

  const listingResult = await db.query(
    `INSERT INTO listings (user_id, category_id, province_id, city_id, title, slug, description, price, price_type, status, version)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
    [SELLER_ID, categoryId, cityRow.province_id, cityRow.city_id,
     'E2E Test Listing', 'e2e-test-listing-' + Date.now(), 'Description',
     1000000, 'fixed', 'published', 1],
  );
  listingId = (listingResult.rows[0] as { id: number }).id;
});

afterAll(async () => {
  const db = await getDb();
  await db.query(
    'DELETE FROM conversation_summaries WHERE conversation_id IN (SELECT id FROM conversations WHERE listing_id = $1)',
    [listingId],
  );
  await db.query(
    'DELETE FROM conversation_projections WHERE id IN (SELECT id FROM conversations WHERE listing_id = $1)',
    [listingId],
  );
  await db.query(
    'DELETE FROM outbox_events WHERE aggregate_id IN (SELECT CAST(id AS TEXT) FROM conversations WHERE listing_id = $1)',
    [listingId],
  );
  await db.query(
    'DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE listing_id = $1)',
    [listingId],
  );
  await db.query('DELETE FROM conversations WHERE listing_id = $1', [listingId]);
  await db.query('DELETE FROM listings WHERE id = $1', [listingId]);
  await db.query('DELETE FROM users WHERE id IN ($1, $2)', [BUYER_ID, SELLER_ID]);
  await db.query(
    `DELETE FROM idempotency_keys WHERE key LIKE 'outbox:%'`,
  );
});

describe('Messaging End-to-End Flow', () => {
  let conversationId: number;
  let messageId: number;

  it('Step 1: Creates a conversation and writes to outbox', async () => {
    const conv = Conversation.create({
      id: 0, listingId, buyerId: BUYER_ID, sellerId: SELLER_ID,
    });
    await conversationRepo.save(conv, 1);
    expect(conv.id).toBeGreaterThan(0);
    conversationId = conv.id;

    await outboxWriter.write({
      aggregateType: 'conversation',
      aggregateId: String(conversationId),
      eventType: 'conversation.started',
      payload: {
        conversationId,
        listingId,
        buyerId: BUYER_ID,
        buyerName: 'Test Buyer',
        sellerId: SELLER_ID,
        sellerName: 'Test Seller',
        listingSnapshot: {},
      },
      metadata: { correlationId: `e2e-${conversationId}` },
    });

    const pending = await outboxRepo.findPending(10);
    expect(pending.length).toBeGreaterThanOrEqual(1);
    expect(pending.some(e => e.eventType === 'conversation.started')).toBe(true);
  });

  it('Step 2: OutboxWorker processes conversation event and updates projections', async () => {
    const worker = new OutboxWorker(
      outboxRepo,
      projectionRepo,
      summaryRepo,
      undefined,
      { broadcast: async () => {} } as any,
      999999,
      10,
    );
    await (worker as any).tick();

    const projection = await projectionRepo.findById(conversationId);
    expect(projection).not.toBeNull();
    expect(projection!.id).toBe(conversationId);
    expect(projection!.buyerId).toBe(BUYER_ID);
    expect(projection!.sellerId).toBe(SELLER_ID);
    expect(projection!.lifecycle).toBe('active');

    const summary = await summaryRepo.findById(conversationId);
    expect(summary).not.toBeNull();
    expect(summary!.conversationId).toBe(conversationId);
    expect(summary!.messageCount).toBe(0);
  });

  it('Step 3: Sends a message and writes to outbox', async () => {
    const msg = Message.create({
      id: 0, conversationId, senderId: BUYER_ID, body: 'Hello from E2E test',
    });
    const saved = await messageRepo.addMessage(msg);
    expect(saved.id).toBeGreaterThan(0);
    messageId = saved.id;

    await outboxWriter.write({
      aggregateType: 'message',
      aggregateId: String(messageId),
      eventType: 'message.sent',
      payload: {
        messageId,
        conversationId,
        senderId: BUYER_ID,
        body: 'Hello from E2E test',
        type: 'text',
      },
      metadata: { correlationId: `e2e-msg-${messageId}` },
    });

    const pending = await outboxRepo.findPending(10);
    expect(pending.some(e => e.eventType === 'message.sent')).toBe(true);
  });

  it('Step 4: OutboxWorker processes message event and updates projections', async () => {
    const worker = new OutboxWorker(
      outboxRepo,
      projectionRepo,
      summaryRepo,
      undefined,
      { broadcast: async () => {} } as any,
      999999,
      10,
    );
    await (worker as any).tick();

    const projection = await projectionRepo.findById(conversationId);
    expect(projection).not.toBeNull();
    expect(projection!.lastMessage).toBe('Hello from E2E test');
    expect(projection!.lastSenderId).toBe(BUYER_ID);
    expect(projection!.lastMessageId).toBe(messageId);

    const summary = await summaryRepo.findById(conversationId);
    expect(summary).not.toBeNull();
    expect(summary!.messageCount).toBeGreaterThanOrEqual(1);
    expect(summary!.lastMessageAt).not.toBeNull();
  });

  it('Step 5: Reads messages with cursor pagination', async () => {
    const result = await messageRepo.findByConversation(conversationId);
    expect(result.messages.length).toBeGreaterThanOrEqual(1);
    expect(result.messages.some(m => m.body === 'Hello from E2E test')).toBe(true);

    if (result.hasMore && result.nextCursor) {
      const nextPage = await messageRepo.findByConversation(conversationId, result.nextCursor);
      expect(nextPage.messages.length).toBeGreaterThanOrEqual(0);
    }
  });

  it('Step 6: Reads conversation through projection facade', async () => {
    const projection = await projectionRepo.findById(conversationId);
    expect(projection).not.toBeNull();
    expect(projection!.buyerName).toBe('Test Buyer');
    expect(projection!.sellerName).toBe('Test Seller');

    const summary = await summaryRepo.findById(conversationId);
    expect(summary).not.toBeNull();
    expect(summary!.messageCount).toBeGreaterThanOrEqual(1);

    const unread = await messageRepo.getUnreadCountForConversation(conversationId, SELLER_ID);
    expect(unread).toBeGreaterThanOrEqual(1);
  });

  it('Step 7: Marks messages as read', async () => {
    await messageRepo.markRead(conversationId, SELLER_ID);

    const messages = await messageRepo.findByConversation(conversationId);
    const buyerMsg = messages.messages.find(m => m.senderId === BUYER_ID);
    expect(buyerMsg).toBeDefined();
    expect(buyerMsg!.deliveryStatus).toBe('read');
  });

  it('Step 8: Soft deletes a message', async () => {
    const msg = await messageRepo.findById(messageId);
    expect(msg).not.toBeNull();
    expect(msg!.isDeleted()).toBe(false);
    msg!.softDelete();
    await messageRepo.save(msg!, 1);

    // After soft delete, findById excludes the message (deleted_at IS NULL filter)
    const afterDelete = await messageRepo.findById(messageId);
    expect(afterDelete).toBeNull();

    // Verify it's no longer returned in the conversation query either
    const result = await messageRepo.findByConversation(conversationId);
    expect(result.messages.some(m => m.id === messageId)).toBe(false);
  });
});
