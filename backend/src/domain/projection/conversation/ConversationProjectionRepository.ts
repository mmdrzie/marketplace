export interface ConversationProjectionRow {
  id: number;
  listingId: number;
  listingSnapshot: Record<string, unknown>;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string | null;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string | null;
  sellerRole: string | null;
  lastMessageId: number | null;
  lastMessage: string | null;
  lastMessageType: string | null;
  lastSenderId: string | null;
  lastActivity: string | null;
  lifecycle: string;
  projectionVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationProjectionRepository {
  upsert(row: ConversationProjectionRow): Promise<void>;
  findById(id: number): Promise<ConversationProjectionRow | null>;
  findByUser(userId: string, cursor?: number, limit?: number): Promise<ConversationProjectionRow[]>;
  getProjectionVersion(id: number): Promise<number | null>;
}
