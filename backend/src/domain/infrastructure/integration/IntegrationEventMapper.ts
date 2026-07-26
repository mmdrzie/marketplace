import type {
  IntegrationEvent,
  ListingCreatedIntegrationData,
  ListingUpdatedIntegrationData,
  ListingDeletedIntegrationData,
  ListingStatusChangedIntegrationData,
  UserRegisteredIntegrationData,
  BrandCreatedIntegrationData,
  ModelCreatedIntegrationData,
} from './IntegrationEvent.js';
import type { OutboxWriter } from '../outbox/OutboxPublisher.js';

let counter = 0;
function nextCorrelationId(): string {
  return `int_${Date.now()}_${++counter}`;
}

export class IntegrationEventMapper {
  constructor(private readonly outboxWriter: OutboxWriter) {}

  async listingCreated(data: {
    listingId: number; userId: string; title: string;
    price: number; priceType: string; categoryId: number; slug: string;
  }): Promise<void> {
    const evt: IntegrationEvent<ListingCreatedIntegrationData> = {
      eventType: 'listing.created', eventTypeVersion: 1, payloadVersion: 1,
      correlationId: nextCorrelationId(), causationId: null,
      timestamp: new Date().toISOString(),
      data,
    };
    await this.outboxWriter.write({
      aggregateType: 'listing',
      aggregateId: String(data.listingId),
      eventType: 'integration.listing.created',
      payload: evt as unknown as Record<string, unknown>,
      metadata: { correlationId: evt.correlationId },
    });
  }

  async listingUpdated(data: ListingUpdatedIntegrationData): Promise<void> {
    const evt: IntegrationEvent<ListingUpdatedIntegrationData> = {
      eventType: 'listing.updated', eventTypeVersion: 1, payloadVersion: 1,
      correlationId: nextCorrelationId(), causationId: null,
      timestamp: new Date().toISOString(), data,
    };
    await this.outboxWriter.write({
      aggregateType: 'listing', aggregateId: String(data.listingId),
      eventType: 'integration.listing.updated',
      payload: evt as unknown as Record<string, unknown>,
      metadata: { correlationId: evt.correlationId },
    });
  }

  async listingDeleted(data: ListingDeletedIntegrationData): Promise<void> {
    const evt: IntegrationEvent<ListingDeletedIntegrationData> = {
      eventType: 'listing.deleted', eventTypeVersion: 1, payloadVersion: 1,
      correlationId: nextCorrelationId(), causationId: null,
      timestamp: new Date().toISOString(), data,
    };
    await this.outboxWriter.write({
      aggregateType: 'listing', aggregateId: String(data.listingId),
      eventType: 'integration.listing.deleted',
      payload: evt as unknown as Record<string, unknown>,
      metadata: { correlationId: evt.correlationId },
    });
  }

  async listingStatusChanged(data: ListingStatusChangedIntegrationData): Promise<void> {
    const evt: IntegrationEvent<ListingStatusChangedIntegrationData> = {
      eventType: 'listing.status_changed', eventTypeVersion: 1, payloadVersion: 1,
      correlationId: nextCorrelationId(), causationId: null,
      timestamp: new Date().toISOString(), data,
    };
    await this.outboxWriter.write({
      aggregateType: 'listing', aggregateId: String(data.listingId),
      eventType: 'integration.listing.status_changed',
      payload: evt as unknown as Record<string, unknown>,
      metadata: { correlationId: evt.correlationId },
    });
  }

  async userRegistered(data: UserRegisteredIntegrationData): Promise<void> {
    const evt: IntegrationEvent<UserRegisteredIntegrationData> = {
      eventType: 'user.registered', eventTypeVersion: 1, payloadVersion: 1,
      correlationId: nextCorrelationId(), causationId: null,
      timestamp: new Date().toISOString(), data,
    };
    await this.outboxWriter.write({
      aggregateType: 'user', aggregateId: data.userId,
      eventType: 'integration.user.registered',
      payload: evt as unknown as Record<string, unknown>,
      metadata: { correlationId: evt.correlationId },
    });
  }

  async brandCreated(data: BrandCreatedIntegrationData): Promise<void> {
    const evt: IntegrationEvent<BrandCreatedIntegrationData> = {
      eventType: 'brand.created', eventTypeVersion: 1, payloadVersion: 1,
      correlationId: nextCorrelationId(), causationId: null,
      timestamp: new Date().toISOString(), data,
    };
    await this.outboxWriter.write({
      aggregateType: 'brand', aggregateId: String(data.brandId),
      eventType: 'integration.brand.created',
      payload: evt as unknown as Record<string, unknown>,
      metadata: { correlationId: evt.correlationId },
    });
  }

  async modelCreated(data: ModelCreatedIntegrationData): Promise<void> {
    const evt: IntegrationEvent<ModelCreatedIntegrationData> = {
      eventType: 'model.created', eventTypeVersion: 1, payloadVersion: 1,
      correlationId: nextCorrelationId(), causationId: null,
      timestamp: new Date().toISOString(), data,
    };
    await this.outboxWriter.write({
      aggregateType: 'model', aggregateId: String(data.modelId),
      eventType: 'integration.model.created',
      payload: evt as unknown as Record<string, unknown>,
      metadata: { correlationId: evt.correlationId },
    });
  }
}
