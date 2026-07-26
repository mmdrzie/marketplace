import { components } from './components.js';
import { paths } from './paths.js';

export const openapiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'بازارچه API',
    version: '1.0.0',
    description: 'REST API for the Marketplace platform — heavy machinery listings, tenders, parts, and dealer management\n\nLive at /api/v1/docs',
  },
  servers: [
    { url: '/api/v1', description: 'API v1' },
  ],
  paths,
  components,
};
