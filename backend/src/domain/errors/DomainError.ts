export abstract class DomainError extends Error {
  abstract readonly code: string;
  readonly retryable: boolean = false;
  readonly metadata?: Record<string, unknown>;

  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.metadata = metadata;
  }
}
