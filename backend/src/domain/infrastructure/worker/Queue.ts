// Queue abstraction — پیاده‌سازی می‌تواند PgNotify، RabbitMQ، SQS یا InMemory باشد

export interface QueueMessage<T = unknown> {
  id: string;
  type: string;
  data: T;
  timestamp: string;
  retryCount: number;
}

export interface Queue {
  publish<T>(queueName: string, message: QueueMessage<T>): Promise<void>;
  subscribe<T>(queueName: string, handler: (msg: QueueMessage<T>) => Promise<void>): Promise<void>;
  ack(messageId: string): Promise<void>;
  nack(messageId: string, requeue: boolean): Promise<void>;
}

// InMemory Queue (برای توسعه/تست)
export class InMemoryQueue implements Queue {
  private handlers = new Map<string, (msg: QueueMessage) => Promise<void>>();
  private messages: QueueMessage[] = [];

  async publish<T>(queueName: string, message: QueueMessage<T>): Promise<void> {
    this.messages.push(message);
    const handler = this.handlers.get(queueName);
    if (handler) {
      setImmediate(() => handler(message).catch(console.error));
    }
  }

  async subscribe<T>(queueName: string, handler: (msg: QueueMessage<T>) => Promise<void>): Promise<void> {
    this.handlers.set(queueName, handler as (msg: QueueMessage) => Promise<void>);
  }

  async ack(_messageId: string): Promise<void> { /* no-op */ }
  async nack(_messageId: string, _requeue: boolean): Promise<void> { /* no-op */ }
}
