import type { ConversationProjectionRow, ConversationProjectionRepository } from './ConversationProjectionRepository.js';
import type { ConversationSummaryRow, ConversationSummaryRepository } from './ConversationSummaryRepository.js';

export interface ConversationReadDto {
  projection: ConversationProjectionRow;
  summary: ConversationSummaryRow | null;
}

export interface ConversationListDto {
  projections: ConversationProjectionRow[];
  summaries: Map<number, ConversationSummaryRow>;
  cursor: number | null;
  hasMore: boolean;
}

/**
 * Facade over projection read repositories.
 * Domain services query this — never the raw repositories.
 */
export interface ConversationReadRepository {
  findById(id: number): Promise<ConversationReadDto | null>;
  findByUser(userId: string, cursor?: number, limit?: number): Promise<ConversationListDto>;
  getUnreadCount(userId: string): Promise<number>;
  getUnreadCountForConversation(conversationId: number, userId: string): Promise<number>;
}

export class ConversationReadRepositoryFacade implements ConversationReadRepository {
  constructor(
    private readonly projectionRepo: ConversationProjectionRepository,
    private readonly summaryRepo: ConversationSummaryRepository,
  ) {}

  async findById(id: number): Promise<ConversationReadDto | null> {
    const projection = await this.projectionRepo.findById(id);
    if (!projection) return null;
    const summary = await this.summaryRepo.findById(id);
    return { projection, summary };
  }

  async findByUser(userId: string, cursor?: number, limit?: number): Promise<ConversationListDto> {
    const projections = await this.projectionRepo.findByUser(userId, cursor, limit);
    const summaryEntries = await Promise.all(
      projections.map((p) => this.summaryRepo.findById(p.id)),
    );
    const summaries = new Map<number, ConversationSummaryRow>();
    for (let i = 0; i < projections.length; i++) {
      if (summaryEntries[i]) {
        summaries.set(projections[i].id, summaryEntries[i]!);
      }
    }
    const hasMore = projections.length === (limit ?? 50);
    const nextCursor = hasMore ? projections[projections.length - 1]?.id ?? null : null;
    return { projections, summaries, cursor: nextCursor, hasMore };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const projections = await this.projectionRepo.findByUser(userId);
    return projections.filter(
      (p) =>
        p.lastSenderId !== userId &&
        (!p.lastActivity || new Date(p.lastActivity) > new Date(0)),
    ).length;
  }

  async getUnreadCountForConversation(conversationId: number, userId: string): Promise<number> {
    const projection = await this.projectionRepo.findById(conversationId);
    if (!projection) return 0;
    if (projection.lastSenderId === userId) return 0;
    return projection.lastMessageId ? 1 : 0;
  }
}
