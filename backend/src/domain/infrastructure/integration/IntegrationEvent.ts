// Integration Event types — برای مصرف‌کنندگان خارجی
// هر رویداد حداقل اطلاعات لازم برای پردازش توسط سرویس‌های دیگر را دارد.

export interface IntegrationEvent<T> {
  eventType: string;
  eventTypeVersion: number;
  payloadVersion: number;
  correlationId: string;
  causationId: string | null;
  timestamp: string;
  data: T;
}

// ── Listing Integration Events ──

export interface ListingCreatedIntegrationData {
  listingId: number;
  userId: string;
  title: string;
  price: number;
  priceType: string;
  categoryId: number;
  slug: string;
}

export interface ListingUpdatedIntegrationData {
  listingId: number;
  userId: string;
  changes: string[];
}

export interface ListingDeletedIntegrationData {
  listingId: number;
  userId: string;
}

export interface ListingStatusChangedIntegrationData {
  listingId: number;
  userId: string;
  oldStatus: string;
  newStatus: string;
}

// ── User Integration Events ──

export interface UserRegisteredIntegrationData {
  userId: string;
  email: string;
  name: string;
}

// ── Vehicle Integration Events ──

export interface BrandCreatedIntegrationData {
  brandId: number;
  name: string;
}

export interface ModelCreatedIntegrationData {
  modelId: number;
  brandId: number;
  name: string;
}
