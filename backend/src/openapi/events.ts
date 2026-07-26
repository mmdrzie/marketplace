export const eventApiSpec = {
  asyncapi: '2.6.0',
  info: {
    title: 'بازارچه Event API',
    version: '1.0.0',
    description: 'AsyncAPI spec for event-driven architecture — domain events, integration events, outbox pattern',
  },
  channels: {
    'listing.created': {
      subscribe: {
        summary: 'Emitted when a new listing is created',
        message: {
          payload: {
            type: 'object',
            properties: {
              eventId: { type: 'string', format: 'uuid' },
              eventType: { type: 'string', enum: ['listing.created'] },
              aggregateId: { type: 'string', format: 'uuid' },
              aggregateType: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              version: { type: 'integer' },
              data: {
                type: 'object',
                properties: {
                  listingId: { type: 'string', format: 'uuid' },
                  userId: { type: 'string', format: 'uuid' },
                  title: { type: 'string' },
                  price: { type: 'number' },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    'listing.updated': {
      subscribe: {
        summary: 'Emitted when listing details change',
        message: {
          payload: {
            type: 'object',
            properties: {
              eventId: { type: 'string', format: 'uuid' },
              eventType: { type: 'string', enum: ['listing.updated'] },
              aggregateId: { type: 'string', format: 'uuid' },
              timestamp: { type: 'string', format: 'date-time' },
              version: { type: 'integer' },
              data: {
                type: 'object',
                properties: {
                  listingId: { type: 'string', format: 'uuid' },
                  changes: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    'listing.status_changed': {
      subscribe: {
        summary: 'Emitted when listing status transitions (submit/approve/reject/sold)',
        message: {
          payload: {
            type: 'object',
            properties: {
              eventId: { type: 'string', format: 'uuid' },
              eventType: { type: 'string', enum: ['listing.status_changed'] },
              aggregateId: { type: 'string', format: 'uuid' },
              timestamp: { type: 'string', format: 'date-time' },
              version: { type: 'integer' },
              data: {
                type: 'object',
                properties: {
                  listingId: { type: 'string', format: 'uuid' },
                  fromStatus: { type: 'string' },
                  toStatus: { type: 'string' },
                  reason: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    'listing.deleted': {
      subscribe: {
        summary: 'Emitted when a listing is deleted',
        message: {
          payload: {
            type: 'object',
            properties: {
              eventId: { type: 'string', format: 'uuid' },
              eventType: { type: 'string', enum: ['listing.deleted'] },
              aggregateId: { type: 'string', format: 'uuid' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  },
};
