import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { conversationService } from '../domain/services/conversation.js';
import { auth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../errors.js';

const router = new Hono();

const startSchema = z.object({
  listing_id: z.number().int().positive(),
  message: z.string().min(1).max(2000),
});

const messageSchema = z.object({
  body: z.string().min(1).max(2000),
});

// GET /conversations — user's conversations with last message preview
router.get('/', auth(), async (c) => {
  const conversations = await conversationService.list(c.get('user'));
  return c.json({ success: true, data: conversations });
});

// GET /conversations/unread-count — unread count for badge
router.get('/unread-count', auth(), async (c) => {
  const count = await conversationService.getUnreadCount(c.get('user'));
  return c.json({ success: true, data: { count } });
});

// GET /conversations/:id — full conversation with all messages
router.get('/:id', auth(), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const conversation = await conversationService.getById(id, c.get('user'));
  return c.json({ success: true, data: conversation });
});

// POST /conversations — start new conversation (phone gate)
router.post('/', auth(), rateLimiter('createConversation'), zValidator('json', startSchema), async (c) => {
  const body = c.req.valid('json');
  const conversation = await conversationService.start({
    listing_id: body.listing_id,
    message: body.message,
    user: c.get('user'),
  });
  return c.json({ success: true, data: conversation }, 201);
});

// POST /conversations/:id/messages — add message
router.post('/:id/messages', auth(), rateLimiter('sendMessage'), zValidator('json', messageSchema), async (c) => {
  const conversationId = parseInt(c.req.param('id'), 10);
  const { body } = c.req.valid('json');
  const message = await conversationService.sendMessage({ conversationId, body, user: c.get('user') });
  return c.json({ success: true, data: message }, 201);
});

// PUT /conversations/:id/read — mark all as read
router.put('/:id/read', auth(), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  await conversationService.markRead(id, c.get('user'));
  return c.json({ success: true, data: null });
});

export { router as conversationRouter };
