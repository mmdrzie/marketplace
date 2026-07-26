import { ConversationStatus, parseConversationStatus, canTransitionConversation } from '../value-objects/ConversationStatus.js';

export interface ConversationSnapshot {
  id: number;
  listingId: number;
  buyerId: string;
  sellerId: string;
  status: string;
  lastMessageId: number | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
}

export class Conversation {
  private constructor(
    public readonly id: number,
    public readonly listingId: number,
    public readonly buyerId: string,
    public readonly sellerId: string,
    public status: ConversationStatus,
    public lastMessageId: number | null,
    public lastMessageAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
    public version: number,
  ) {}

  static create(props: {
    id: number;
    listingId: number;
    buyerId: string;
    sellerId: string;
  }): Conversation {
    const now = new Date();
    return new Conversation(
      props.id,
      props.listingId,
      props.buyerId,
      props.sellerId,
      ConversationStatus.Active,
      null,
      null,
      now,
      now,
      null,
      1,
    );
  }

  static fromSnapshot(s: ConversationSnapshot): Conversation {
    return new Conversation(
      s.id,
      s.listingId,
      s.buyerId,
      s.sellerId,
      parseConversationStatus(s.status),
      s.lastMessageId,
      s.lastMessageAt ? new Date(s.lastMessageAt) : null,
      new Date(s.createdAt),
      new Date(s.updatedAt),
      s.deletedAt ? new Date(s.deletedAt) : null,
      s.version ?? 1,
    );
  }

  snapshot(): ConversationSnapshot {
    return {
      id: this.id,
      listingId: this.listingId,
      buyerId: this.buyerId,
      sellerId: this.sellerId,
      status: this.status,
      lastMessageId: this.lastMessageId,
      lastMessageAt: this.lastMessageAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      deletedAt: this.deletedAt?.toISOString() ?? null,
      version: this.version,
    };
  }

  incrementVersion(): void {
    this.version++;
  }

  isParticipant(userId: string): boolean {
    return this.buyerId === userId || this.sellerId === userId;
  }

  updateLastMessage(messageId: number): void {
    this.lastMessageId = messageId;
    this.lastMessageAt = new Date();
    this.updatedAt = new Date();
  }

  archive(): void {
    if (!canTransitionConversation(this.status, ConversationStatus.Archived)) {
      throw new Error(`Cannot archive conversation in status: ${this.status}`);
    }
    this.status = ConversationStatus.Archived;
    this.updatedAt = new Date();
  }

  block(): void {
    if (!canTransitionConversation(this.status, ConversationStatus.Blocked)) {
      throw new Error(`Cannot block conversation in status: ${this.status}`);
    }
    this.status = ConversationStatus.Blocked;
    this.updatedAt = new Date();
  }

  unarchive(): void {
    if (!canTransitionConversation(this.status, ConversationStatus.Active)) {
      throw new Error(`Cannot unarchive conversation in status: ${this.status}`);
    }
    this.status = ConversationStatus.Active;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    if (this.deletedAt) throw new Error('Conversation already deleted');
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  isActive(): boolean {
    return this.status === ConversationStatus.Active && this.deletedAt === null;
  }
}
