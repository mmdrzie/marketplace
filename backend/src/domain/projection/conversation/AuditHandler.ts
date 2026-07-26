import type { EventEnvelope } from '../../events/EventEnvelope.js';
import type { AuditStore } from '../../infrastructure/audit/AuditStore.js';

export class AuditHandler {
  constructor(
    private readonly auditStore: AuditStore,
  ) {}

  async handle(envelope: EventEnvelope): Promise<void> {
    await this.auditStore.append(envelope);
  }
}
