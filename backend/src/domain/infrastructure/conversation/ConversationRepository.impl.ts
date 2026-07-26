import { getDb } from '../../../config/database.js';
import { Conversation, ConversationSnapshot } from '../../entities/conversation/Conversation.entity.js';
import type { ConversationRepository } from '../../entities/conversation/Conversation.repository.js';

function toInt(v: unknown): number {
  return typeof v === 'string' ? parseInt(v, 10) : v as number;
}

function toIntOrNull(v: unknown): number | null {
  if (v === null) return null;
  return toInt(v);
}

function rowToConversationSnapshot(row: Record<string, unknown>): ConversationSnapshot {
  return {
    id: toInt(row.id),
    listingId: toInt(row.listing_id),
    buyerId: row.buyer_id as string,
    sellerId: row.seller_id as string,
    status: row.status as string,
    lastMessageId: toIntOrNull(row.last_message_id),
    lastMessageAt: row.last_message_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    deletedAt: row.deleted_at as string | null,
    version: toInt(row.version),
  };
}

export class ConversationRepositoryImpl implements ConversationRepository {
  async findById(id: number): Promise<Conversation | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM conversations WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (!rows.length) return null;
    return Conversation.fromSnapshot(rowToConversationSnapshot(rows[0] as Record<string, unknown>));
  }

  async findByListingAndBuyer(listingId: number, buyerId: string): Promise<Conversation | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM conversations WHERE listing_id = $1 AND buyer_id = $2 AND deleted_at IS NULL',
      [listingId, buyerId],
    );
    if (!rows.length) return null;
    return Conversation.fromSnapshot(rowToConversationSnapshot(rows[0] as Record<string, unknown>));
  }

  async findByListingAndSellerBuyer(listingId: number, buyerId: string, sellerId: string): Promise<Conversation | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM conversations WHERE listing_id = $1 AND buyer_id = $2 AND seller_id = $3 AND deleted_at IS NULL',
      [listingId, buyerId, sellerId],
    );
    if (!rows.length) return null;
    return Conversation.fromSnapshot(rowToConversationSnapshot(rows[0] as Record<string, unknown>));
  }

  async findConversationsByUser(userId: string): Promise<Conversation[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM conversations
       WHERE (buyer_id = $1 OR seller_id = $1) AND deleted_at IS NULL
       ORDER BY COALESCE(last_message_at, created_at) DESC`,
      [userId],
    );
    return (rows as Record<string, unknown>[]).map(rowToConversationSnapshot).map(s => Conversation.fromSnapshot(s));
  }

  async save(conversation: Conversation, expectedVersion: number): Promise<void> {
    const db = await getDb();
    const s = conversation.snapshot();

    if (s.id === 0) {
      const { rows } = await db.query(
        `INSERT INTO conversations (listing_id, buyer_id, seller_id, status, version, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
        [s.listingId, s.buyerId, s.sellerId, s.status, s.version],
      );
      (conversation as any).id = parseInt((rows[0] as Record<string, unknown>).id as string, 10);
    } else {
      const { rowCount } = await db.query(
        `UPDATE conversations
         SET status = $1, last_message_id = $2, last_message_at = $3,
             version = version + 1, updated_at = NOW()
         WHERE id = $4 AND version = $5 AND deleted_at IS NULL`,
        [s.status, s.lastMessageId, s.lastMessageAt, s.id, expectedVersion],
      );
      if ((rowCount ?? 0) === 0) {
        throw new Error(`Conversation ${s.id} version conflict: expected ${expectedVersion}`);
      }
      conversation.incrementVersion();
    }
  }

  async delete(id: number, expectedVersion: number): Promise<void> {
    const db = await getDb();
    const { rowCount } = await db.query(
      `UPDATE conversations
       SET deleted_at = NOW(), updated_at = NOW(), version = version + 1
       WHERE id = $1 AND version = $2 AND deleted_at IS NULL`,
      [id, expectedVersion],
    );
    if ((rowCount ?? 0) === 0) {
      throw new Error(`Conversation ${id} version conflict on delete: expected ${expectedVersion}`);
    }
  }
}
