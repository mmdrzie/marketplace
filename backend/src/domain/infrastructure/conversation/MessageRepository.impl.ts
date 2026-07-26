import { getDb } from '../../../config/database.js';
import { Message, MessageSnapshot } from '../../entities/conversation/Message.entity.js';
import type { MessageRepository, MessageCursorResult } from '../../entities/conversation/Message.repository.js';

function toInt(v: unknown): number {
  return typeof v === 'string' ? parseInt(v, 10) : v as number;
}

function toIntOrNull(v: unknown): number | null {
  if (v === null) return null;
  return toInt(v);
}

function rowToMessageSnapshot(row: Record<string, unknown>): MessageSnapshot {
  return {
    id: toInt(row.id),
    conversationId: toInt(row.conversation_id),
    senderId: row.sender_id as string,
    body: row.body as string | null,
    type: row.type as string,
    deliveryStatus: row.delivery_status as string,
    offerId: toIntOrNull(row.offer_id),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string ?? row.created_at as string,
    readAt: row.read_at as string | null,
    deletedAt: row.deleted_at as string | null,
    version: toInt(row.version),
  };
}

export class MessageRepositoryImpl implements MessageRepository {
  async findById(id: number): Promise<Message | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM messages WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (!rows.length) return null;
    return Message.fromSnapshot(rowToMessageSnapshot(rows[0] as Record<string, unknown>));
  }

  async findByConversation(
    conversationId: number,
    cursor?: number,
    limit = 50,
    before = true,
  ): Promise<MessageCursorResult> {
    const db = await getDb();
    const dir = before ? 'DESC' : 'ASC';
    const cmp = before ? '<' : '>';
    const order = before ? 'DESC' : 'ASC';

    let query: string;
    const params: unknown[] = [conversationId, limit + 1];

    if (cursor) {
      query = `SELECT * FROM messages
               WHERE conversation_id = $1 AND deleted_at IS NULL AND id ${cmp} $3
               ORDER BY created_at ${order}, id ${order} LIMIT $2`;
      params.push(cursor);
    } else {
      query = `SELECT * FROM messages
               WHERE conversation_id = $1 AND deleted_at IS NULL
               ORDER BY created_at ${order}, id ${order} LIMIT $2`;
    }

    const { rows } = await db.query(query, params);
    const typedRows = rows as Record<string, unknown>[];
    const hasMore = typedRows.length > limit;

    const messages = typedRows.slice(0, limit).map(r => Message.fromSnapshot(rowToMessageSnapshot(r)));
    const lastId = messages.length > 0 ? messages[messages.length - 1].id : null;

    if (before) {
      messages.reverse();
    }

    return {
      messages,
      nextCursor: hasMore ? lastId : null,
      hasMore,
    };
  }

  async addMessage(message: Message): Promise<Message> {
    const db = await getDb();
    const s = message.snapshot();

    const { rows } = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, body, type, delivery_status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [s.conversationId, s.senderId, s.body, s.type, s.deliveryStatus],
    );

    return Message.fromSnapshot(rowToMessageSnapshot(rows[0] as Record<string, unknown>));
  }

  async save(message: Message, expectedVersion: number): Promise<void> {
    const db = await getDb();
    const s = message.snapshot();

    const { rowCount } = await db.query(
      `UPDATE messages
       SET body = $1, delivery_status = $2, read_at = $3, deleted_at = $4,
           updated_at = NOW(), version = version + 1
       WHERE id = $5 AND version = $6 AND deleted_at IS NULL`,
      [s.body, s.deliveryStatus, s.readAt, s.deletedAt, s.id, expectedVersion],
    );
    if ((rowCount ?? 0) === 0) {
      throw new Error(`Message ${s.id} version conflict: expected ${expectedVersion}`);
    }
  }

  async markRead(conversationId: number, userId: string): Promise<void> {
    const db = await getDb();
    await db.query(
      `UPDATE messages
       SET delivery_status = 'read', read_at = NOW()
       WHERE conversation_id = $1 AND sender_id != $2 AND delivery_status != 'read' AND deleted_at IS NULL`,
      [conversationId, userId],
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT COUNT(*) as count FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE (c.buyer_id = $1 OR c.seller_id = $1)
         AND m.sender_id != $1
         AND m.delivery_status != 'read'
         AND m.deleted_at IS NULL
         AND c.deleted_at IS NULL`,
      [userId],
    );
    return parseInt((rows[0] as { count: string }).count, 10);
  }

  async getUnreadCountForConversation(conversationId: number, userId: string): Promise<number> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT COUNT(*) as count FROM messages
       WHERE conversation_id = $1
         AND sender_id != $2
         AND delivery_status != 'read'
         AND deleted_at IS NULL`,
      [conversationId, userId],
    );
    return parseInt((rows[0] as { count: string }).count, 10);
  }
}
