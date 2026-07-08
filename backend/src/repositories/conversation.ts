import { getDb } from '../config/database';

export interface ConversationRow {
  id: number;
  listing_id: number;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  created_at: string;
}

export interface MessageRow {
  id: number;
  conversation_id: number;
  sender_id: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export class ConversationRepository {
  async findByUser(userId: string) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT c.*,
              l.title as listing_title, l.slug as listing_slug, l.primary_image as listing_image,
              u.name as other_name, u.avatar as other_avatar,
              (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND is_read = false) as unread_count
       FROM conversations c
       JOIN listings l ON l.id = c.listing_id
       JOIN users u ON u.id = CASE WHEN c.buyer_id = $1 THEN c.seller_id ELSE c.buyer_id END
       WHERE c.buyer_id = $1 OR c.seller_id = $1
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
      [userId],
    );
    return rows as (ConversationRow & {
      listing_title: string; listing_slug: string; listing_image: string | null;
      other_name: string; other_avatar: string | null;
      last_message: string | null; unread_count: string;
    })[];
  }

  async findById(id: number) {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM conversations WHERE id = $1',
      [id],
    );
    return rows[0] as ConversationRow | undefined;
  }

  async findByListingAndBuyer(listingId: number, buyerId: string) {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM conversations WHERE listing_id = $1 AND buyer_id = $2',
      [listingId, buyerId],
    );
    return rows[0] as ConversationRow | undefined;
  }

  async findMessages(conversationId: number) {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId],
    );
    return rows as MessageRow[];
  }

  async create(data: { listing_id: number; buyer_id: string; seller_id: string }) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO conversations (listing_id, buyer_id, seller_id) VALUES ($1, $2, $3) RETURNING *`,
      [data.listing_id, data.buyer_id, data.seller_id],
    );
    return rows[0] as ConversationRow;
  }

  async addMessage(conversationId: number, senderId: string, body: string) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1, $2, $3) RETURNING *`,
      [conversationId, senderId, body],
    );
    await db.query(
      'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
      [conversationId],
    );
    return rows[0] as MessageRow;
  }

  async markRead(conversationId: number, userId: string) {
    const db = await getDb();
    await db.query(
      `UPDATE messages SET is_read = true, read_at = NOW()
       WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false`,
      [conversationId, userId],
    );
  }

  async getUnreadCount(userId: string) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT COUNT(*) as count FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE (c.buyer_id = $1 OR c.seller_id = $1)
         AND m.sender_id != $1
         AND m.is_read = false`,
      [userId],
    );
    return parseInt((rows[0] as { count: string }).count, 10);
  }
}

export const conversationRepo = new ConversationRepository();
