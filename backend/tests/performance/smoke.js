// k6 smoke test — run: k6 run tests/performance/smoke.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    errors: ['rate<0.05'], // <5% errors
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

export default function () {
  // Homepage / health
  let res = http.get(`${BASE_URL}/health`);
  check(res, { 'health ok': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  // Public listings
  res = http.get(`${BASE_URL}/listings?page=1&per_page=10`);
  check(res, { 'listings ok': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  // Categories
  res = http.get(`${BASE_URL}/categories`);
  check(res, { 'categories ok': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  // Provinces
  res = http.get(`${BASE_URL}/provinces`);
  check(res, { 'provinces ok': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  // Vehicle brands
  res = http.get(`${BASE_URL}/vehicles/brands`);
  check(res, { 'brands ok': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  // Search
  res = http.get(`${BASE_URL}/search?q=excavator`);
  check(res, { 'search ok': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  sleep(1);
}
