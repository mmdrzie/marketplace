import { getDb } from '../../../config/database.js';
import type { ConversationSummaryRow, ConversationSummaryRepository } from '../../projection/conversation/ConversationSummaryRepository.js';

function toInt(v: unknown): number {
  return typeof v === 'string' ? parseInt(v, 10) : v as number;
}

function toFloatOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  return typeof v === 'string' ? parseFloat(v) : v as number;
}

function rowToSummary(row: Record<string, unknown>): ConversationSummaryRow {
  return {
    conversationId: toInt(row.conversation_id),
    firstMessageAt: row.first_message_at as string | null,
    lastMessageAt: row.last_message_at as string | null,
    messageCount: toInt(row.message_count),
    avgResponseTime: toFloatOrNull(row.avg_response_time),
    buyerLastSeen: row.buyer_last_seen as string | null,
    sellerLastSeen: row.seller_last_seen as string | null,
    projectionVersion: toInt(row.projection_version),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export class ConversationSummaryRepositoryImpl implements ConversationSummaryRepository {
  async upsert(row: ConversationSummaryRow): Promise<void> {
    const db = await getDb();
    await db.query(
      `INSERT INTO conversation_summaries
       (conversation_id, first_message_at, last_message_at, message_count,
        avg_response_time, buyer_last_seen, seller_last_seen, projection_version, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT (conversation_id) DO UPDATE SET
         first_message_at = COALESCE(EXCLUDED.first_message_at, conversation_summaries.first_message_at),
         last_message_at = EXCLUDED.last_message_at,
         message_count = EXCLUDED.message_count,
         avg_response_time = EXCLUDED.avg_response_time,
         buyer_last_seen = EXCLUDED.buyer_last_seen,
         seller_last_seen = EXCLUDED.seller_last_seen,
         projection_version = conversation_summaries.projection_version + 1,
         updated_at = NOW()`,
      [
        row.conversationId, row.firstMessageAt, row.lastMessageAt,
        row.messageCount, row.avgResponseTime,
        row.buyerLastSeen, row.sellerLastSeen, row.projectionVersion,
      ],
    );
  }

  async findById(conversationId: number): Promise<ConversationSummaryRow | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM conversation_summaries WHERE conversation_id = $1',
      [conversationId],
    );
    if (!rows.length) return null;
    return rowToSummary(rows[0] as Record<string, unknown>);
  }

  async getProjectionVersion(conversationId: number): Promise<number | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT projection_version FROM conversation_summaries WHERE conversation_id = $1',
      [conversationId],
    );
    if (!rows.length) return null;
    return toInt((rows[0] as Record<string, unknown>).projection_version);
  }
}
