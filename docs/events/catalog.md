# Event Catalog

| Event | Version | Producer | Consumer | Status |
|---|---|---|---|---|
| `user.registered` | v1 | UserRegistration | — | Active |
| `user.logged_in` | v1 | AuthService | — | Active |
| `email.verified` | v1 | EmailVerification | — | Active |
| `phone.verified` | v1 | PhoneVerification | — | Active |
| `listing.created` | v1 | ListingAggregate | ListingProjection | Active |
| `listing.updated` | v1 | ListingAggregate | ListingProjection | Active |
| `listing.deleted` | v1 | ListingAggregate | ListingProjection | Active |
| `listing.status_changed` | v1 | ListingAggregate | ListingProjection | Active |
| `brand.created` | v1 | VehicleAggregate | — | Active |
| `brand.updated` | v1 | VehicleAggregate | — | Active |
| `model.created` | v1 | VehicleAggregate | — | Active |
| `variant.created` | v1 | VehicleAggregate | — | Active |
| `dealer.verified` | v1 | DealerVerification | — | Active |
| `conversation.started` | v1 | ConversationAggregate | — | Deprecated |
| `message.sent` | v1 | ConversationAggregate | — | Deprecated |
| `account.upgraded` | v1 | AccountUpgrade | — | Active |
| `conversation.started` | v2 | ConversationAggregate | ConversationProjection | Planned |
| `message.sent` | v2 | ConversationAggregate | Realtime/Notification | Planned |
