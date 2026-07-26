import { getDb } from '../../../config/database.js';
import type { ConversationProjectionRow, ConversationProjectionRepository } from '../../projection/conversation/ConversationProjectionRepository.js';

function toInt(v: unknown): number {
  return typeof v === 'string' ? parseInt(v, 10) : v as number;
}

function toIntOrNull(v: unknown): number | null {
  if (v === null) return null;
  return toInt(v);
}

function rowToProjection(row: Record<string, unknown>): ConversationProjectionRow {
  return {
    id: toInt(row.id),
    listingId: toInt(row.listing_id),
    listingSnapshot: typeof row.listing_snapshot === 'string'
      ? JSON.parse(row.listing_snapshot as string)
      : row.listing_snapshot as Record<string, unknown>,
    buyerId: row.buyer_id as string,
    buyerName: row.buyer_name as string,
    buyerAvatar: row.buyer_avatar as string | null,
    sellerId: row.seller_id as string,
    sellerName: row.seller_name as string,
    sellerAvatar: row.seller_avatar as string | null,
    sellerRole: row.seller_role as string | null,
    lastMessageId: toIntOrNull(row.last_message_id),
    lastMessage: row.last_message as string | null,
    lastMessageType: row.last_message_type as string | null,
    lastSenderId: row.last_sender_id as string | null,
    lastActivity: row.last_activity as string | null,
    lifecycle: row.lifecycle as string,
    projectionVersion: toInt(row.projection_version),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export class ConversationProjectionRepositoryImpl implements ConversationProjectionRepository {
  async upsert(row: ConversationProjectionRow): Promise<void> {
    const db = await getDb();
    await db.query(
      `INSERT INTO conversation_projections
       (id, listing_id, listing_snapshot, buyer_id, buyer_name, buyer_avatar,
        seller_id, seller_name, seller_avatar, seller_role,
        last_message_id, last_message, last_message_type, last_sender_id,
        last_activity, lifecycle, projection_version, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW())
       ON CONFLICT (id) DO UPDATE SET
         listing_id = EXCLUDED.listing_id,
         listing_snapshot = EXCLUDED.listing_snapshot,
         buyer_name = EXCLUDED.buyer_name,
         buyer_avatar = EXCLUDED.buyer_avatar,
         seller_name = EXCLUDED.seller_name,
         seller_avatar = EXCLUDED.seller_avatar,
         seller_role = EXCLUDED.seller_role,
         last_message_id = EXCLUDED.last_message_id,
         last_message = EXCLUDED.last_message,
         last_message_type = EXCLUDED.last_message_type,
         last_sender_id = EXCLUDED.last_sender_id,
         last_activity = EXCLUDED.last_activity,
         lifecycle = EXCLUDED.lifecycle,
         projection_version = conversation_projections.projection_version + 1,
         updated_at = NOW()`,
      [
        row.id, row.listingId,
        JSON.stringify(row.listingSnapshot),
        row.buyerId, row.buyerName, row.buyerAvatar,
        row.sellerId, row.sellerName, row.sellerAvatar, row.sellerRole,
        row.lastMessageId, row.lastMessage, row.lastMessageType, row.lastSenderId,
        row.lastActivity, row.lifecycle, row.projectionVersion,
      ],
    );
  }

  async findById(id: number): Promise<ConversationProjectionRow | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM conversation_projections WHERE id = $1',
      [id],
    );
    if (!rows.length) return null;
    return rowToProjection(rows[0] as Record<string, unknown>);
  }

  async findByUser(userId: string, cursor?: number, limit = 50): Promise<ConversationProjectionRow[]> {
    const db = await getDb();
    let query: string;
    const params: unknown[] = [userId, limit];

    if (cursor) {
      query = `SELECT * FROM conversation_projections
               WHERE (buyer_id = $1 OR seller_id = $1)
                 AND id < $3
               ORDER BY updated_at DESC
               LIMIT $2`;
      params.push(cursor);
    } else {
      query = `SELECT * FROM conversation_projections
               WHERE (buyer_id = $1 OR seller_id = $1)
               ORDER BY updated_at DESC
               LIMIT $2`;
    }

    const { rows } = await db.query(query, params);
    return (rows as Record<string, unknown>[]).map(rowToProjection);
  }

  async getProjectionVersion(id: number): Promise<number | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT projection_version FROM conversation_projections WHERE id = $1',
      [id],
    );
    if (!rows.length) return null;
    return toInt((rows[0] as Record<string, unknown>).projection_version);
  }
}
