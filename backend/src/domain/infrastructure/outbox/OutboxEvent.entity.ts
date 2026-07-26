export type OutboxStatus = 'pending' | 'published' | 'failed' | 'dead_letter';

export interface OutboxEventSnapshot {
  id: number;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  eventTypeVersion: number;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  status: OutboxStatus;
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  publishedAt: Date | null;
  createdAt: Date;
}

export class OutboxEvent {
  private constructor(
    public readonly id: number,
    public readonly aggregateType: string,
    public readonly aggregateId: string,
    public readonly eventType: string,
    public readonly eventTypeVersion: number,
    public readonly payload: Record<string, unknown>,
    public readonly metadata: Record<string, unknown>,
    public status: OutboxStatus,
    public retryCount: number,
    public readonly maxRetries: number,
    public lastError: string | null,
    public publishedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    eventTypeVersion?: number;
    payload: Record<string, unknown>;
    metadata: Record<string, unknown>;
  }): OutboxEvent {
    return new OutboxEvent(
      0, props.aggregateType, props.aggregateId, props.eventType,
      props.eventTypeVersion ?? 1, props.payload, props.metadata,
      'pending', 0, 3, null, null, new Date(),
    );
  }

  markPublished(): void {
    this.status = 'published';
    this.publishedAt = new Date();
  }

  markFailed(error: string): void {
    this.retryCount++;
    this.lastError = error;
    this.status = this.retryCount >= this.maxRetries ? 'dead_letter' : 'failed';
  }

  canRetry(): boolean {
    return this.status === 'failed' && this.retryCount < this.maxRetries;
  }
}
