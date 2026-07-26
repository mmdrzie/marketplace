import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from '../../src/config/database.js';
import { ConversationRepositoryImpl } from '../../src/domain/infrastructure/conversation/ConversationRepository.impl.js';
import { MessageRepositoryImpl } from '../../src/domain/infrastructure/conversation/MessageRepository.impl.js';
import { Conversation } from '../../src/domain/entities/conversation/Conversation.entity.js';
import { Message } from '../../src/domain/entities/conversation/Message.entity.js';

const conversationRepo = new ConversationRepositoryImpl();
const messageRepo = new MessageRepositoryImpl();
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
    [SELLER_ID, categoryId, cityRow.province_id, cityRow.city_id, 'Test Listing for Chat', 'test-listing-chat-' + Date.now(), 'Description', 1000000, 'fixed', 'published', 1],
  );
  listingId = (listingResult.rows[0] as { id: number }).id;
});

afterAll(async () => {
  const db = await getDb();
  await db.query('DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE listing_id = $1)', [listingId]);
  await db.query('DELETE FROM conversations WHERE listing_id = $1', [listingId]);
  await db.query('DELETE FROM listings WHERE id = $1', [listingId]);
  await db.query('DELETE FROM users WHERE id IN ($1, $2)', [BUYER_ID, SELLER_ID]);
});

describe('ConversationRepositoryImpl', () => {
  let conversationId: number;

  it('saves a new conversation', async () => {
    const conv = Conversation.create({ id: 0, listingId, buyerId: BUYER_ID, sellerId: SELLER_ID });
    await conversationRepo.save(conv, 1);
    expect(conv.id).toBeGreaterThan(0);
    conversationId = conv.id;
  });

  it('finds conversation by id', async () => {
    const found = await conversationRepo.findById(conversationId);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(conversationId);
    expect(found!.buyerId).toBe(BUYER_ID);
    expect(found!.sellerId).toBe(SELLER_ID);
    expect(found!.isActive()).toBe(true);
  });

  it('finds conversation by listing and buyer', async () => {
    const found = await conversationRepo.findByListingAndBuyer(listingId, BUYER_ID);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(conversationId);
  });

  it('findByListingAndSellerBuyer returns correct conversation', async () => {
    const found = await conversationRepo.findByListingAndSellerBuyer(listingId, BUYER_ID, SELLER_ID);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(conversationId);
  });

  it('returns null for non-existent conversation', async () => {
    const found = await conversationRepo.findById(999999);
    expect(found).toBeNull();
  });

  it('finds conversations by user', async () => {
    const convs = await conversationRepo.findConversationsByUser(BUYER_ID);
    expect(convs.length).toBeGreaterThanOrEqual(1);
    expect(convs.some(c => c.id === conversationId)).toBe(true);
  });

  it('adds a message to the conversation', async () => {
    const msg = Message.create({ id: 0, conversationId, senderId: BUYER_ID, body: 'Hello from test' });
    const saved = await messageRepo.addMessage(msg);
    expect(saved.id).toBeGreaterThan(0);
    expect(saved.body).toBe('Hello from test');
    expect(saved.conversationId).toBe(conversationId);
  });

  it('finds messages with pagination', async () => {
    const result = await messageRepo.findByConversation(conversationId);
    expect(result.messages.length).toBeGreaterThanOrEqual(1);
    expect(result.messages.some(m => m.body === 'Hello from test')).toBe(true);
  });

  it('finds messages with cursor pagination', async () => {
    const first = await messageRepo.findByConversation(conversationId, undefined, 1);
    expect(first.messages.length).toBe(1);

    if (first.nextCursor) {
      const next = await messageRepo.findByConversation(conversationId, first.nextCursor, 1);
      expect(next.messages.length).toBeGreaterThanOrEqual(0);
    }
  });

  it('marks messages as read', async () => {
    await messageRepo.markRead(conversationId, SELLER_ID);

    const result = await messageRepo.findByConversation(conversationId);
    const buyerMsg = result.messages.find(m => m.senderId === BUYER_ID);
    expect(buyerMsg).toBeDefined();
    expect(buyerMsg!.deliveryStatus).toBe('read');
    expect(buyerMsg!.readAt).toBeTruthy();
  });

  it('gets unread count for user', async () => {
    const count = await messageRepo.getUnreadCount(SELLER_ID);
    expect(typeof count).toBe('number');
    expect(count).toBe(0);
  });

  it('saves conversation updates (status change)', async () => {
    const conv = await conversationRepo.findById(conversationId);
    expect(conv).not.toBeNull();
    conv!.archive();
    await conversationRepo.save(conv!, 1);

    const archived = await conversationRepo.findById(conversationId);
    expect(archived).not.toBeNull();
    expect(archived!.status).toBe('archived');
  });

  it('soft deletes a conversation', async () => {
    const conv = await conversationRepo.findById(conversationId);
    expect(conv).not.toBeNull();
    await conversationRepo.delete(conversationId, conv!.version);
    const found = await conversationRepo.findById(conversationId);
    expect(found).toBeNull();
  });

  it('does not find deleted conversations in user list', async () => {
    const convs = await conversationRepo.findConversationsByUser(BUYER_ID);
    expect(convs.some(c => c.id === conversationId)).toBe(false);
  });
});
