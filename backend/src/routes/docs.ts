import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';

const router = new Hono();

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'بازارچه API',
    version: '1.0.0',
    description: 'REST API for the Marketplace platform — heavy machinery listings, tenders, parts, and dealer management',
  },
  servers: [
    { url: '/api/v1', description: 'API v1' },
  ],
  paths: {
    '/auth/register': {
      post: { summary: 'Register new user', tags: ['Auth'], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, password: { type: 'string' } }, required: ['name', 'email', 'phone', 'password'] } } } }, responses: { '201': { description: 'User registered' } } },
    },
    '/auth/login': {
      post: { summary: 'Login', tags: ['Auth'], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } } }, responses: { '200': { description: 'Logged in' } } },
    },
    '/auth/refresh': {
      post: { summary: 'Refresh token', tags: ['Auth'], responses: { '200': { description: 'Token refreshed' } } },
    },
    '/auth/me': {
      get: { summary: 'Get current user', tags: ['Auth'], responses: { '200': { description: 'Current user profile' } } },
    },
    '/categories': {
      get: { summary: 'List all categories', tags: ['Categories'], responses: { '200': { description: 'Category list' } } },
    },
    '/provinces': {
      get: { summary: 'List all provinces', tags: ['Locations'], responses: { '200': { description: 'Province list' } } },
    },
    '/provinces/{slug}/cities': {
      get: { summary: 'List cities by province slug', tags: ['Locations'], parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'City list' } } },
    },
    '/listings': {
      get: { summary: 'List/search listings', tags: ['Listings'], parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }, { name: 'category', in: 'query', schema: { type: 'string' } }, { name: 'province_id', in: 'query', schema: { type: 'string' } }, { name: 'brand', in: 'query', schema: { type: 'string' } }, { name: 'model', in: 'query', schema: { type: 'string' } }, { name: 'sort', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'per_page', in: 'query', schema: { type: 'integer' } }], responses: { '200': { description: 'Paginated listing results' } } },
      post: { summary: 'Create a listing', tags: ['Listings'], responses: { '201': { description: 'Listing created' } } },
    },
    '/listings/{id}': {
      get: { summary: 'Get listing by ID', tags: ['Listings'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Listing detail' } } },
      put: { summary: 'Update listing', tags: ['Listings'], responses: { '200': { description: 'Listing updated' } } },
      delete: { summary: 'Delete listing', tags: ['Listings'], responses: { '200': { description: 'Listing deleted' } } },
    },
    '/search': {
      get: { summary: 'Full-text search', tags: ['Search'], parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }, { name: 'category', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }], responses: { '200': { description: 'Search results' } } },
    },
    '/conversations': {
      get: { summary: 'List conversations', tags: ['Messages'], responses: { '200': { description: 'Conversation list' } } },
      post: { summary: 'Start a conversation', tags: ['Messages'], responses: { '201': { description: 'Conversation created' } } },
    },
    '/notifications': {
      get: { summary: 'List notifications', tags: ['Notifications'], responses: { '200': { description: 'Notification list' } } },
    },
    '/upload/presigned': {
      post: { summary: 'Get presigned upload URL', tags: ['Upload'], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { filename: { type: 'string' }, contentType: { type: 'string' } }, required: ['filename'] } } } }, responses: { '200': { description: 'Upload URL' } } },
    },
    '/payments': {
      get: { summary: 'List payments', tags: ['Payments'], responses: { '200': { description: 'Payment list' } } },
      post: { summary: 'Create payment', tags: ['Payments'], responses: { '201': { description: 'Payment created' } } },
    },
    '/wallet': {
      get: { summary: 'Get wallet info', tags: ['Wallet'], responses: { '200': { description: 'Wallet details' } } },
    },
    '/admin': {
      get: { summary: 'Admin routes', tags: ['Admin'], responses: { '200': { description: 'Admin data' } } },
    },
    '/health': {
      get: { summary: 'Health check', tags: ['System'], responses: { '200': { description: 'OK' } } },
    },
    '/favorites': {
      get: { summary: 'List favorites', tags: ['Favorites'], responses: { '200': { description: 'Favorite list' } } },
      post: { summary: 'Add favorite', tags: ['Favorites'], responses: { '201': { description: 'Added' } } },
      delete: { summary: 'Remove favorite', tags: ['Favorites'], responses: { '200': { description: 'Removed' } } },
    },
    '/tenders': {
      get: { summary: 'List tenders', tags: ['Tenders'], responses: { '200': { description: 'Tender list' } } },
      post: { summary: 'Create tender', tags: ['Tenders'], responses: { '201': { description: 'Tender created' } } },
    },
    '/dealers': {
      get: { summary: 'List public dealers', tags: ['Dealers'], responses: { '200': { description: 'Dealer list' } } },
    },
    '/parts': {
      get: { summary: 'List parts', tags: ['Parts'], responses: { '200': { description: 'Part list' } } },
    },
    '/escrow': {
      get: { summary: 'List escrow deals', tags: ['Escrow'], responses: { '200': { description: 'Deal list' } } },
      post: { summary: 'Create escrow deal', tags: ['Escrow'], responses: { '201': { description: 'Deal created' } } },
    },
    '/email/verify': {
      post: { summary: 'Verify email with code', tags: ['Verification'], responses: { '200': { description: 'Verified' } } },
    },
    '/email/verify/{token}': {
      get: { summary: 'Verify email with token', tags: ['Verification'], parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Verified' } } },
    },
    '/phone/verify': {
      post: { summary: 'Verify phone with OTP', tags: ['Verification'], responses: { '200': { description: 'Verified' } } },
    },
    '/phone/send-code': {
      post: { summary: 'Send phone verification code', tags: ['Verification'], responses: { '200': { description: 'Code sent' } } },
    },
  },
};

router.get('/docs', swaggerUI({ url: '/api/v1/docs/openapi' }));

router.get('/docs/openapi', (c) => c.json(spec));

export { router as docsRouter };
