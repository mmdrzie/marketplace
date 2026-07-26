import { MessageType, parseMessageType } from '../value-objects/MessageType.js';
import { DeliveryStatus, parseDeliveryStatus, canTransitionDelivery } from '../value-objects/DeliveryStatus.js';

export interface MessageSnapshot {
  id: number;
  conversationId: number;
  senderId: string;
  body: string | null;
  type: string;
  deliveryStatus: string;
  offerId: number | null;
  createdAt: string;
  updatedAt: string;
  readAt: string | null;
  deletedAt: string | null;
  version: number;
}

export class Message {
  private constructor(
    public readonly id: number,
    public readonly conversationId: number,
    public readonly senderId: string,
    public body: string | null,
    public type: MessageType,
    public deliveryStatus: DeliveryStatus,
    public offerId: number | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public readAt: Date | null,
    public deletedAt: Date | null,
    public version: number,
  ) {}

  static create(props: {
    id: number;
    conversationId: number;
    senderId: string;
    body: string | null;
    type?: string;
    offerId?: number | null;
  }): Message {
    const now = new Date();
    return new Message(
      props.id,
      props.conversationId,
      props.senderId,
      props.body,
      parseMessageType(props.type ?? 'text'),
      DeliveryStatus.Sent,
      props.offerId ?? null,
      now,
      now,
      null,
      null,
      1,
    );
  }

  static fromSnapshot(s: MessageSnapshot): Message {
    return new Message(
      s.id,
      s.conversationId,
      s.senderId,
      s.body,
      parseMessageType(s.type),
      parseDeliveryStatus(s.deliveryStatus),
      s.offerId ?? null,
      new Date(s.createdAt),
      new Date(s.updatedAt),
      s.readAt ? new Date(s.readAt) : null,
      s.deletedAt ? new Date(s.deletedAt) : null,
      s.version ?? 1,
    );
  }

  snapshot(): MessageSnapshot {
    return {
      id: this.id,
      conversationId: this.conversationId,
      senderId: this.senderId,
      body: this.body,
      type: this.type,
      deliveryStatus: this.deliveryStatus,
      offerId: this.offerId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      readAt: this.readAt?.toISOString() ?? null,
      deletedAt: this.deletedAt?.toISOString() ?? null,
      version: this.version,
    };
  }

  isSentBy(userId: string): boolean {
    return this.senderId === userId;
  }

  markDelivered(): void {
    if (!canTransitionDelivery(this.deliveryStatus, DeliveryStatus.Delivered)) {
      throw new Error(`Cannot mark delivered from status: ${this.deliveryStatus}`);
    }
    this.deliveryStatus = DeliveryStatus.Delivered;
    this.updatedAt = new Date();
  }

  markRead(): void {
    if (!canTransitionDelivery(this.deliveryStatus, DeliveryStatus.Read)) {
      throw new Error(`Cannot mark read from status: ${this.deliveryStatus}`);
    }
    this.deliveryStatus = DeliveryStatus.Read;
    this.readAt = new Date();
    this.updatedAt = new Date();
  }

  edit(newBody: string): void {
    if (this.deletedAt) throw new Error('Cannot edit deleted message');
    this.body = newBody;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    if (this.deletedAt) throw new Error('Message already deleted');
    this.deletedAt = new Date();
    this.body = '[deleted]';
    this.updatedAt = new Date();
  }

  restore(): void {
    if (!this.deletedAt) throw new Error('Message is not deleted');
    this.deletedAt = null;
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  incrementVersion(): void {
    this.version++;
  }
}
