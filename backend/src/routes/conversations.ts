import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { auth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../errors.js';
import { getDb } from '../config/database.js';
import { CreateConversationUseCase } from '../domain/application/conversation/CreateConversationUseCase.js';
import { SendMessageUseCase } from '../domain/application/conversation/SendMessageUseCase.js';
import { MarkReadUseCase } from '../domain/application/conversation/MarkReadUseCase.js';
import { GetConversationsUseCase } from '../domain/application/conversation/GetConversationsUseCase.js';
import { GetMessagesUseCase } from '../domain/application/conversation/GetMessagesUseCase.js';
import { CreateConversationCommand } from '../domain/application/conversation/commands/CreateConversationCommand.js';
import { SendMessageCommand } from '../domain/application/conversation/commands/SendMessageCommand.js';
import { MarkReadCommand } from '../domain/application/conversation/commands/MarkReadCommand.js';
import { GetConversationsCommand } from '../domain/application/conversation/commands/GetConversationsCommand.js';
import { GetMessagesCommand } from '../domain/application/conversation/commands/GetMessagesCommand.js';
import { ConversationRepositoryImpl } from '../domain/infrastructure/conversation/ConversationRepository.impl.js';
import { MessageRepositoryImpl } from '../domain/infrastructure/conversation/MessageRepository.impl.js';
import { UnitOfWorkImpl } from '../domain/infrastructure/persistence/UnitOfWork.impl.js';

const router = new Hono();
const convRepo = new ConversationRepositoryImpl();
const msgRepo = new MessageRepositoryImpl();
const uow = new UnitOfWorkImpl();

const createConversation = new CreateConversationUseCase(uow);
const sendMessage = new SendMessageUseCase(uow);
const markRead = new MarkReadUseCase(uow);
const getConversations = new GetConversationsUseCase(convRepo);
const getMessages = new GetMessagesUseCase(convRepo, msgRepo);

const startSchema = z.object({
  listing_id: z.number().int().positive(),
  message: z.string().min(1).max(2000),
});

const messageSchema = z.object({
  body: z.string().min(1).max(2000),
});

async function findDetailedById(id: number) {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT c.*,
            l.title as listing_title, l.slug as listing_slug, l.primary_image as listing_image,
            buyer.name as buyer_name, buyer.avatar as buyer_avatar,
            seller.name as seller_name, seller.avatar as seller_avatar
     FROM conversations c
     JOIN listings l ON l.id = c.listing_id
     JOIN users buyer ON buyer.id = c.buyer_id
     JOIN users seller ON seller.id = c.seller_id
     WHERE c.id = $1`,
    [id],
  );
  return rows[0] as Record<string, unknown> | undefined;
}

async function findConversationsByUser(userId: string) {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT c.*,
            l.title as listing_title, l.slug as listing_slug, l.primary_image as listing_image,
            buyer.name as buyer_name, buyer.avatar as buyer_avatar,
            seller.name as seller_name, seller.avatar as seller_avatar,
            m.body as last_message,
            COALESCE(u.unread_count, 0) as unread_count
     FROM conversations c
     JOIN listings l ON l.id = c.listing_id
     JOIN users buyer ON buyer.id = c.buyer_id
     JOIN users seller ON seller.id = c.seller_id
     LEFT JOIN LATERAL (
       SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
     ) m ON true
     LEFT JOIN (
       SELECT conversation_id, COUNT(*) as unread_count
       FROM messages
       WHERE sender_id != $1 AND delivery_status != 'read'
       GROUP BY conversation_id
     ) u ON u.conversation_id = c.id
     WHERE c.deleted_at IS NULL AND (c.buyer_id = $1 OR c.seller_id = $1)
     ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
    [userId],
  );
  return rows as Record<string, unknown>[];
}

// GET /conversations — user's conversations with last message preview
router.get('/', auth(), async (c) => {
  const user = c.get('user');
  const conversations = await findConversationsByUser(user.id);
  return c.json({ success: true, data: conversations });
});

// GET /conversations/unread-count — unread count for badge
router.get('/unread-count', auth(), async (c) => {
  const user = c.get('user');
  const count = await msgRepo.getUnreadCount(user.id);
  return c.json({ success: true, data: { count } });
});

// GET /conversations/:id — full conversation with all messages
router.get('/:id', auth(), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const user = c.get('user');

  const row = await findDetailedById(id);
  if (!row) throw AppError.notFound('Conversation not found');
  if (row.buyer_id !== user.id && row.seller_id !== user.id) {
    throw AppError.forbidden('You are not a participant in this conversation');
  }

  const result = await msgRepo.findByConversation(id);
  const full = { ...row, messages: result.messages.map(m => m.snapshot()) };
  return c.json({ success: true, data: full });
});

// POST /conversations — start new conversation with first message
router.post('/', auth(), rateLimiter('conversation:create'), zValidator('json', startSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  const db = await getDb();
  const listing = (await db.query('SELECT * FROM listings WHERE id = $1', [body.listing_id])).rows[0] as Record<string, unknown> | undefined;
  if (!listing) throw AppError.notFound('Listing not found');
  if (listing.user_id === user.id) {
    throw AppError.validation('You cannot start a conversation with yourself');
  }

  const dto = await createConversation.execute(
    new CreateConversationCommand(body.listing_id, user.id, listing.user_id as string),
  );

  await sendMessage.execute(
    new SendMessageCommand(dto.id, user.id, body.message),
  );

  const row = await findDetailedById(dto.id);
  const msgs = await msgRepo.findByConversation(dto.id);
  const result = { ...row, messages: msgs.messages.map(m => m.snapshot()) };
  return c.json({ success: true, data: result }, 201);
});

// POST /conversations/:id/messages — add message
router.post('/:id/messages', auth(), rateLimiter('sendMessage'), zValidator('json', messageSchema), async (c) => {
  const conversationId = parseInt(c.req.param('id'), 10);
  const user = c.get('user');
  const { body } = c.req.valid('json');

  const dto = await sendMessage.execute(new SendMessageCommand(conversationId, user.id, body));
  return c.json({ success: true, data: dto }, 201);
});

// PUT /conversations/:id/read — mark all as read
router.put('/:id/read', auth(), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const user = c.get('user');
  await markRead.execute(new MarkReadCommand(id, user.id));
  return c.json({ success: true, data: null });
});

export { router as conversationRouter };
