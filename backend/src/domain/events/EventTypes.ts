// ============================================================
// ONLY SOURCE OF TRUTH — Marketplace Domain Events
//
// Owner: Architecture Team
// Breaking change: new constant only (e.g. `.v2`)
// Modification: Architecture Review required
//
// DO NOT create new event registry files.
// New event? Add it here.
// Breaking change? Add new `.v2` constant, keep `.v1` marked
// with `@deprecated` until zero consumers remain.
// ============================================================

// ── Listing Events ──
export const ListingEvents = {
  created:       'listing.created.v1',
  updated:       'listing.updated.v1',
  deleted:       'listing.deleted.v1',
  sold:          'listing.sold.v1',
  approved:      'listing.approved.v1',
  rejected:      'listing.rejected.v1',
  submitted:     'listing.submitted.v1',
  renewed:       'listing.renewed.v1',
  statusChanged: 'listing.status_changed.v1',
} as const;

// ── Conversation Events ──
export const ConversationEvents = {
  started:   'conversation.started.v1',
  archived:  'conversation.archived.v1',
  blocked:   'conversation.blocked.v1',
  locked:    'conversation.locked.v1',
  deleted:   'conversation.deleted.v1',
} as const;

// ── Message Events ──
export const MessageEvents = {
  sent:      'message.sent.v1',
  delivered: 'message.delivered.v1',
  read:      'message.read.v1',
  edited:    'message.edited.v1',
  deleted:   'message.deleted.v1',
} as const;

// ── User Events ──
export const UserEvents = {
  registered:    'user.registered.v1',
  loggedIn:      'user.logged_in.v1',
  emailVerified: 'email.verified.v1',
  phoneVerified: 'phone.verified.v1',
  accountUpgraded: 'account.upgraded.v1',
} as const;

// ── Brand Events ──
export const BrandEvents = {
  created: 'brand.created.v1',
  updated: 'brand.updated.v1',
} as const;

// ── Model Events ──
export const ModelEvents = {
  created: 'model.created.v1',
} as const;

// ── Variant Events ──
export const VariantEvents = {
  created: 'variant.created.v1',
} as const;

// ── Dealer Events ──
export const DealerEvents = {
  verified: 'dealer.verified.v1',
} as const;

// ── Notification Events ──
export const NotificationEvents = {
  created: 'notification.created.v1',
} as const;

// ── Integration Events (external consumers) ──
export const IntegrationEvents = {
  orderCreated: 'integration.order.created.v1',
} as const;

// ── Internal Projection Events (consumer-only, never published externally) ──
export const ProjectionEvents = {
  listingUpdated:      '__projection.listing.updated.v1',
  conversationUpdated: '__projection.conversation.updated.v1',
} as const;
