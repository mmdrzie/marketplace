import { getDb } from '../../../config/database.js';
import { OutboxRepositoryImpl } from './OutboxRepository.impl.js';
import type { OutboxRepository } from './OutboxRepository.js';
import { ConversationProjectionRepositoryImpl } from '../conversation/ConversationProjectionRepository.impl.js';
import { ConversationSummaryRepositoryImpl } from '../conversation/ConversationSummaryRepository.impl.js';
import type { ConversationProjectionRepository } from '../../projection/conversation/ConversationProjectionRepository.js';
import type { ConversationSummaryRepository } from '../../projection/conversation/ConversationSummaryRepository.js';
import type { AuditStore } from '../audit/AuditStore.js';
import { RealtimeBroadcaster, realtimeBroadcaster } from '../realtime/RealtimeBroadcaster.js';
import { ConversationEvents, MessageEvents } from '../../events/EventTypes.js';
import type { IdempotencyRepository } from '../idempotency/Idempotency.repository.js';
import { IdempotencyRepositoryImpl } from '../idempotency/IdempotencyRepository.impl.js';
import type { ListingProjectionRepository } from '../../projection/listing/ListingProjection.js';
import { ListingProjectionRepositoryImpl } from '../../projection/listing/ListingProjection.repository.impl.js';
import type { VehicleProjectionRepository } from '../../projection/vehicle/VehicleProjection.js';
import { VehicleProjectionRepositoryImpl } from '../../projection/vehicle/VehicleProjection.repository.impl.js';

type ProcessedEvent = {
  channel: string;
  event: string;
  payload: Record<string, unknown>;
};

interface ConversationStartedPayload {
  conversationId: number;
  listingId: number;
  buyerId: string;
  buyerName?: string;
  buyerAvatar?: string | null;
  sellerId: string;
  sellerName?: string;
  sellerAvatar?: string | null;
  sellerRole?: string | null;
  listingSnapshot: Record<string, unknown>;
}

interface MessageSentPayload {
  messageId: number;
  conversationId: number;
  senderId: string;
  body: string | null;
  type: string;
}

export class OutboxWorker {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly outboxRepo: OutboxRepository = new OutboxRepositoryImpl(),
    private readonly projectionRepo: ConversationProjectionRepository = new ConversationProjectionRepositoryImpl(),
    private readonly summaryRepo: ConversationSummaryRepository = new ConversationSummaryRepositoryImpl(),
    private readonly auditStore?: AuditStore,
    private readonly broadcaster: RealtimeBroadcaster = realtimeBroadcaster,
    private readonly pollIntervalMs: number = 2000,
    private readonly batchSize: number = 10,
    private readonly idempotencyRepo: IdempotencyRepository = new IdempotencyRepositoryImpl(),
    private readonly listingProjectionRepo: ListingProjectionRepository = new ListingProjectionRepositoryImpl(),
    private readonly vehicleProjectionRepo: VehicleProjectionRepository = new VehicleProjectionRepositoryImpl(),
  ) {}

  start(): void {
    if (this.intervalId) return;
    console.log(`[outbox-worker] starting (poll every ${this.pollIntervalMs}ms)`);
    this.intervalId = setInterval(() => this.tick(), this.pollIntervalMs);
    this.tick();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[outbox-worker] stopped');
    }
  }

  private async tick(): Promise<void> {
    try {
      const pending = await this.outboxRepo.findPending(this.batchSize);
      if (pending.length === 0) return;

      const realtimeEvents: ProcessedEvent[] = [];

      for (const event of pending) {
        try {
          if (await this.isDuplicate(event.id, event.eventType)) {
            event.markPublished();
            await this.outboxRepo.updateStatus(event);
            continue;
          }

          const result = await this.route(event.eventType, event.payload);

          if (result) {
            realtimeEvents.push(result);
          }

          await this.recordIdempotency(event.id, event.eventType);

          event.markPublished();
          await this.outboxRepo.updateStatus(event);

          await this.auditStore?.write({
            eventType: event.eventType,
            aggregateType: event.aggregateType,
            aggregateId: event.aggregateId,
            payload: event.payload,
            status: 'processed',
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          event.markFailed(msg);
          await this.outboxRepo.updateStatus(event);
          console.error(`[outbox-worker] failed to process event ${event.id} (${event.eventType}):`, msg);
        }
      }

      if (realtimeEvents.length > 0) {
        await this.broadcaster.broadcast(realtimeEvents);
      }
    } catch (err) {
      console.error('[outbox-worker] tick error:', err);
    }
  }

  private async route(
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<ProcessedEvent | null> {
    switch (eventType) {
      case 'conversation.started':
      case ConversationEvents.started:
        return this.handleConversationStarted(payload as unknown as ConversationStartedPayload);

      case 'message.sent':
      case MessageEvents.sent:
        return this.handleMessageSent(payload as unknown as MessageSentPayload);

      case 'conversation.archived':
      case ConversationEvents.archived:
      case 'conversation.blocked':
      case ConversationEvents.blocked:
      case 'conversation.locked':
      case ConversationEvents.locked:
      case 'conversation.deleted':
      case ConversationEvents.deleted:
        return this.handleConversationLifecycle(eventType, payload);

      case 'message.delivered':
      case MessageEvents.delivered:
      case 'message.read':
      case MessageEvents.read:
        return this.handleMessageStatus(eventType, payload);

      case 'message.edited':
      case MessageEvents.edited:
        return this.handleMessageEdited(payload);

      case 'message.deleted':
      case MessageEvents.deleted:
        return this.handleMessageDeleted(payload);

      case 'listing.created':
      case 'listing.updated':
      case 'listing.submitted':
      case 'listing.approved':
      case 'listing.rejected':
      case 'listing.sold':
      case 'listing.renewed':
        return this.handleListingEvent(eventType, payload);

      case 'listing.deleted':
        return this.handleListingDeleted(payload);

      case 'brand.created':
      case 'model.created':
      case 'variant.created':
        return this.handleVehicleEvent(eventType, payload);

      default:
        console.warn(`[outbox-worker] unhandled event type: ${eventType}`);
        return null;
    }
  }

  private async handleConversationStarted(
    payload: ConversationStartedPayload,
  ): Promise<ProcessedEvent | null> {
    await this.projectionRepo.upsert({
      id: payload.conversationId,
      listingId: payload.listingId,
      listingSnapshot: payload.listingSnapshot,
      buyerId: payload.buyerId,
      buyerName: payload.buyerName ?? '',
      buyerAvatar: payload.buyerAvatar ?? null,
      sellerId: payload.sellerId,
      sellerName: payload.sellerName ?? '',
      sellerAvatar: payload.sellerAvatar ?? null,
      sellerRole: payload.sellerRole ?? null,
      lastMessageId: null,
      lastMessage: null,
      lastMessageType: null,
      lastSenderId: null,
      lastActivity: null,
      lifecycle: 'active',
      projectionVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.summaryRepo.upsert({
      conversationId: payload.conversationId,
      firstMessageAt: null,
      lastMessageAt: null,
      messageCount: 0,
      avgResponseTime: null,
      buyerLastSeen: null,
      sellerLastSeen: null,
      projectionVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      channel: `conversation:${payload.conversationId}`,
      event: 'conversation.started',
      payload: payload as unknown as Record<string, unknown>,
    };
  }

  private async handleMessageSent(
    payload: MessageSentPayload,
  ): Promise<ProcessedEvent | null> {
    const existing = await this.projectionRepo.findById(payload.conversationId);

    await this.projectionRepo.upsert({
      id: payload.conversationId,
      listingId: existing?.listingId ?? 0,
      listingSnapshot: existing?.listingSnapshot ?? {},
      buyerId: existing?.buyerId ?? '',
      buyerName: existing?.buyerName ?? '',
      buyerAvatar: existing?.buyerAvatar ?? null,
      sellerId: existing?.sellerId ?? '',
      sellerName: existing?.sellerName ?? '',
      sellerAvatar: existing?.sellerAvatar ?? null,
      sellerRole: existing?.sellerRole ?? null,
      lastMessageId: payload.messageId,
      lastMessage: payload.body,
      lastMessageType: payload.type,
      lastSenderId: payload.senderId,
      lastActivity: new Date().toISOString(),
      lifecycle: existing?.lifecycle ?? 'active',
      projectionVersion: (existing?.projectionVersion ?? 0) + 1,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.summaryRepo.upsert({
      conversationId: payload.conversationId,
      firstMessageAt: null,
      lastMessageAt: new Date().toISOString(),
      messageCount: 1,
      avgResponseTime: null,
      buyerLastSeen: null,
      sellerLastSeen: null,
      projectionVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      channel: `conversation:${payload.conversationId}`,
      event: 'message.sent',
      payload: payload as unknown as Record<string, unknown>,
    };
  }

  private async handleConversationLifecycle(
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<ProcessedEvent | null> {
    const lifecycle = eventType.replace('conversation.', '').replace('.v1', '');
    const existing = await this.projectionRepo.findById(payload.conversationId as number);

    await this.projectionRepo.upsert({
      id: payload.conversationId as number,
      listingId: existing?.listingId ?? 0,
      listingSnapshot: existing?.listingSnapshot ?? {},
      buyerId: existing?.buyerId ?? '',
      buyerName: existing?.buyerName ?? '',
      buyerAvatar: existing?.buyerAvatar ?? null,
      sellerId: existing?.sellerId ?? '',
      sellerName: existing?.sellerName ?? '',
      sellerAvatar: existing?.sellerAvatar ?? null,
      sellerRole: existing?.sellerRole ?? null,
      lastMessageId: existing?.lastMessageId ?? null,
      lastMessage: existing?.lastMessage ?? null,
      lastMessageType: existing?.lastMessageType ?? null,
      lastSenderId: existing?.lastSenderId ?? null,
      lastActivity: new Date().toISOString(),
      lifecycle,
      projectionVersion: (existing?.projectionVersion ?? 0) + 1,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      channel: `conversation:${payload.conversationId}`,
      event: eventType,
      payload,
    };
  }

  private async handleMessageStatus(
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<ProcessedEvent | null> {
    return {
      channel: `conversation:${payload.conversationId}`,
      event: eventType,
      payload,
    };
  }

  private async handleMessageEdited(
    payload: Record<string, unknown>,
  ): Promise<ProcessedEvent | null> {
    const existing = await this.projectionRepo.findById(payload.conversationId as number);
    await this.projectionRepo.upsert({
      id: payload.conversationId as number,
      listingId: existing?.listingId ?? 0,
      listingSnapshot: existing?.listingSnapshot ?? {},
      buyerId: existing?.buyerId ?? '',
      buyerName: existing?.buyerName ?? '',
      buyerAvatar: existing?.buyerAvatar ?? null,
      sellerId: existing?.sellerId ?? '',
      sellerName: existing?.sellerName ?? '',
      sellerAvatar: existing?.sellerAvatar ?? null,
      sellerRole: existing?.sellerRole ?? null,
      lastMessageId: payload.messageId as number,
      lastMessage: payload.body as string,
      lastMessageType: null,
      lastSenderId: null,
      lastActivity: new Date().toISOString(),
      lifecycle: existing?.lifecycle ?? 'active',
      projectionVersion: (existing?.projectionVersion ?? 0) + 1,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      channel: `conversation:${payload.conversationId}`,
      event: 'message.edited',
      payload,
    };
  }

  private async handleMessageDeleted(
    payload: Record<string, unknown>,
  ): Promise<ProcessedEvent | null> {
    return {
      channel: `conversation:${payload.conversationId}`,
      event: 'message.deleted',
      payload,
    };
  }

  private async handleListingEvent(
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<ProcessedEvent | null> {
    const listingId = payload.listingId as number;
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT
        l.id, l.slug, l.title, l.description, l.price, l.price_type, l.status,
        l.is_featured, l.views, l.primary_image, l.published_at, l.created_at,
        l.category_id, c.name as category_name,
        l.province_id, p.name as province_name,
        l.city_id, ct.name as city_name,
        l.user_id, u.name as user_name, u.phone as user_phone,
        d.name as dealer_name, d.phone as dealer_phone,
        l.vehicle_variant_id, b.name as brand_name, vm.name as model_name, vv.name as variant_name
      FROM listings l
      LEFT JOIN categories c ON c.id = l.category_id
      LEFT JOIN provinces p ON p.id = l.province_id
      LEFT JOIN cities ct ON ct.id = l.city_id
      LEFT JOIN users u ON u.id = l.user_id
      LEFT JOIN dealer_profiles d ON d.user_id = l.user_id
      LEFT JOIN vehicle_variants vv ON vv.id = l.vehicle_variant_id
      LEFT JOIN vehicle_models vm ON vm.id = vv.model_id
      LEFT JOIN brands b ON b.id = vm.brand_id
      WHERE l.id = $1
    `, [listingId]);

    if (!rows.length) return null;
    const r = rows[0] as Record<string, unknown>;
    await this.listingProjectionRepo.upsert({
      id: r.id as number, slug: r.slug as string, title: r.title as string,
      description: r.description as string, price: r.price as number,
      priceType: r.price_type as string, status: r.status as string,
      isFeatured: r.is_featured as boolean, views: r.views as number,
      primaryImage: r.primary_image as string | null,
      categoryId: r.category_id as number, categoryName: r.category_name as string | null,
      provinceId: r.province_id as number | null, provinceName: r.province_name as string | null,
      cityId: r.city_id as number | null, cityName: r.city_name as string | null,
      userId: r.user_id as string, userName: r.user_name as string | null,
      userPhone: r.user_phone as string | null,
      dealerName: r.dealer_name as string | null, dealerPhone: r.dealer_phone as string | null,
      vehicleVariantId: r.vehicle_variant_id as number | null,
      brandName: r.brand_name as string | null, modelName: r.model_name as string | null,
      variantName: r.variant_name as string | null,
      publishedAt: r.published_at as string | null, createdAt: r.created_at as string,
    });

    return {
      channel: `listing:${listingId}`,
      event: eventType.replace('.', ':'),
      payload,
    };
  }

  private async handleListingDeleted(
    payload: Record<string, unknown>,
  ): Promise<ProcessedEvent | null> {
    const listingId = payload.listingId as number;
    await this.listingProjectionRepo.remove(listingId);
    return {
      channel: `listing:${listingId}`,
      event: 'listing:deleted',
      payload,
    };
  }

  private async handleVehicleEvent(
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<ProcessedEvent | null> {
    const db = await getDb();

    if (eventType === 'brand.created') {
      const brandId = payload.brandId as number;
      const { rows } = await db.query(`
        SELECT id, name, name_en, slug, logo FROM brands WHERE id = $1
      `, [brandId]);
      if (!rows.length) return null;
      const r = rows[0] as Record<string, unknown>;
      await this.vehicleProjectionRepo.upsert({
        brandId: r.id as number, brandName: r.name as string,
        brandNameEn: r.name_en as string | null, brandSlug: r.slug as string,
        brandLogo: r.logo as string | null,
        modelId: 0, modelName: '', modelSlug: '',
        modelYearFrom: null, modelYearTo: null,
        variantId: null, variantName: null, variantSlug: null,
      });
    } else if (eventType === 'model.created') {
      const modelId = payload.modelId as number;
      const { rows } = await db.query(`
        SELECT vm.id as model_id, vm.name as model_name, vm.slug as model_slug,
          vm.year_from, vm.year_to, vm.brand_id,
          b.id as brand_id, b.name as brand_name, b.name_en as brand_name_en,
          b.slug as brand_slug, b.logo as brand_logo
        FROM vehicle_models vm
        JOIN brands b ON b.id = vm.brand_id
        WHERE vm.id = $1
      `, [modelId]);
      if (!rows.length) return null;
      const r = rows[0] as Record<string, unknown>;
      await this.vehicleProjectionRepo.upsert({
        brandId: r.brand_id as number, brandName: r.brand_name as string,
        brandNameEn: r.brand_name_en as string | null, brandSlug: r.brand_slug as string,
        brandLogo: r.brand_logo as string | null,
        modelId: r.model_id as number, modelName: r.model_name as string,
        modelSlug: r.model_slug as string,
        modelYearFrom: r.year_from as number | null,
        modelYearTo: r.year_to as number | null,
        variantId: null, variantName: null, variantSlug: null,
      });
    } else if (eventType === 'variant.created') {
      const variantId = payload.variantId as number;
      const { rows } = await db.query(`
        SELECT vv.id as variant_id, vv.name as variant_name, vv.slug as variant_slug,
          vm.id as model_id, vm.name as model_name, vm.slug as model_slug,
          vm.year_from, vm.year_to,
          b.id as brand_id, b.name as brand_name, b.name_en as brand_name_en,
          b.slug as brand_slug, b.logo as brand_logo
        FROM vehicle_variants vv
        JOIN vehicle_models vm ON vm.id = vv.model_id
        JOIN brands b ON b.id = vm.brand_id
        WHERE vv.id = $1
      `, [variantId]);
      if (!rows.length) return null;
      const r = rows[0] as Record<string, unknown>;
      await this.vehicleProjectionRepo.upsert({
        brandId: r.brand_id as number, brandName: r.brand_name as string,
        brandNameEn: r.brand_name_en as string | null, brandSlug: r.brand_slug as string,
        brandLogo: r.brand_logo as string | null,
        modelId: r.model_id as number, modelName: r.model_name as string,
        modelSlug: r.model_slug as string,
        modelYearFrom: r.year_from as number | null,
        modelYearTo: r.year_to as number | null,
        variantId: r.variant_id as number | null,
        variantName: r.variant_name as string | null,
        variantSlug: r.variant_slug as string | null,
      });
    }

    return {
      channel: 'vehicle',
      event: eventType.replace('.', ':'),
      payload,
    };
  }

  private async isDuplicate(eventId: number, eventType: string): Promise<boolean> {
    try {
      return await this.idempotencyRepo.isProcessed(`outbox:${eventType}:${eventId}`);
    } catch {
      return false;
    }
  }

  private async recordIdempotency(eventId: number, eventType: string): Promise<void> {
    try {
      await this.idempotencyRepo.markProcessed(`outbox:${eventType}:${eventId}`, { processed: true });
    } catch (err) {
      console.error(`[outbox-worker] failed to record idempotency key:`, err);
    }
  }
}
