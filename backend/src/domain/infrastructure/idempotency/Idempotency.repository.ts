export interface IdempotencyRepository {
  isProcessed(idempotencyKey: string): Promise<boolean>;
  markProcessed(idempotencyKey: string, response?: unknown): Promise<void>;
  getResponse(idempotencyKey: string): Promise<unknown | null>;
}
