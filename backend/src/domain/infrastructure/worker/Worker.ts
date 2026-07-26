// Worker: processes queue messages with retry, DLQ, and checkpoint

import type { Queue, QueueMessage } from './Queue.js';

export interface WorkerHandler<T = unknown> {
  handle(msg: QueueMessage<T>): Promise<void>;
  onDeadLetter?(msg: QueueMessage<T>, error: Error): Promise<void>;
}

export interface CheckpointStore {
  save(workerName: string, offset: string): Promise<void>;
  load(workerName: string): Promise<string | null>;
}

export class InMemoryCheckpointStore implements CheckpointStore {
  private store = new Map<string, string>();

  async save(workerName: string, offset: string): Promise<void> {
    this.store.set(workerName, offset);
  }

  async load(workerName: string): Promise<string | null> {
    return this.store.get(workerName) ?? null;
  }
}

export class Worker {
  private running = false;
  private maxRetries = 3;

  constructor(
    private readonly name: string,
    private readonly queue: Queue,
    private readonly handler: WorkerHandler,
    private readonly checkpointStore: CheckpointStore = new InMemoryCheckpointStore(),
  ) {}

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    console.log(`[worker] ${this.name} started`);

    await this.queue.subscribe(this.name, async (msg) => {
      try {
        await this.handler.handle(msg);
        // ذخیره checkpoint قبل از ack: اگر بین checkpoint و ack کرش کند،
        // replay از checkpoint ادامه می‌دهد و پیام دوباره پردازش می‌شود
        await this.checkpointStore.save(this.name, msg.id);
        await this.queue.ack(msg.id);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error(`[worker] ${this.name} error processing ${msg.id}:`, error.message);

        if (msg.retryCount >= this.maxRetries) {
          if (this.handler.onDeadLetter) {
            await this.handler.onDeadLetter(msg, error);
          }
          await this.queue.ack(msg.id); // remove from queue, send to DLQ
        } else {
          await this.queue.nack(msg.id, true); // requeue
        }
      }
    });
  }

  stop(): void {
    this.running = false;
    console.log(`[worker] ${this.name} stopped`);
  }
}
