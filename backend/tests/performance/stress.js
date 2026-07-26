// k6 stress test — run: k6 run tests/performance/stress.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },    // ramp up to 50 users
    { duration: '5m', target: 50 },    // stay at 50
    { duration: '2m', target: 100 },   // ramp to 100
    { duration: '5m', target: 100 },   // stay at 100
    { duration: '2m', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

const SEARCH_TERMS = ['excavator', 'bulldozer', 'crane', 'tractor', 'loader', 'backhoe', 'drill', 'compactor'];

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function () {
  // mix of public endpoints
  const r = Math.random();

  if (r < 0.3) {
    const q = randomPick(SEARCH_TERMS);
    const res = http.get(`${BASE_URL}/search?q=${q}&page=1`);
    check(res, { 'search': (r) => r.status === 200 });
  } else if (r < 0.5) {
    const res = http.get(`${BASE_URL}/listings?page=${Math.floor(Math.random() * 10) + 1}&per_page=20`);
    check(res, { 'listings': (r) => r.status === 200 });
  } else if (r < 0.65) {
    const res = http.get(`${BASE_URL}/categories`);
    check(res, { 'categories': (r) => r.status === 200 });
  } else if (r < 0.8) {
    const res = http.get(`${BASE_URL}/vehicles/brands`);
    check(res, { 'brands': (r) => r.status === 200 });
  } else {
    const res = http.get(`${BASE_URL}/health`);
    check(res, { 'health': (r) => r.status === 200 });
  }

  sleep(Math.random() * 2 + 0.5);
}
