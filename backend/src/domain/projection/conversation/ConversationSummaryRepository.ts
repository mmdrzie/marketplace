export interface ConversationSummaryRow {
  conversationId: number;
  firstMessageAt: string | null;
  lastMessageAt: string | null;
  messageCount: number;
  avgResponseTime: number | null;
  buyerLastSeen: string | null;
  sellerLastSeen: string | null;
  projectionVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummaryRepository {
  upsert(row: ConversationSummaryRow): Promise<void>;
  findById(conversationId: number): Promise<ConversationSummaryRow | null>;
  getProjectionVersion(conversationId: number): Promise<number | null>;
}
