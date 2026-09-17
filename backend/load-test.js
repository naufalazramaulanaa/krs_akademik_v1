import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp-up ke 50 concurrent users
    { duration: '30s', target: 200 }, // Load konstan 200 concurrent users
    { duration: '10s', target: 0 },   // Ramp-down ke 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<20'], // 95% request harus selesai di bawah 20 ms
  },
};

export default function () {
  const BASE_URL = 'http://host.docker.internal:8000/api/enrollments';

  // 1. Test Endpoint Full-Text Search (Meilisearch Engine)
  const searchRes = http.get(`${BASE_URL}?search=Mahasiswa%20100&per_page=25`);
  check(searchRes, {
    'Search status 200': (r) => r.status === 200,
    'Search latency < 15ms': (r) => r.timings.duration < 15,
  });

  // 2. Test Endpoint Filtering Direct DB Index (PostgreSQL B-Tree)
  const filterRes = http.get(`${BASE_URL}?status=APPROVED&academic_year=2023/2024&per_page=25`);
  check(filterRes, {
    'Filter status 200': (r) => r.status === 200,
    'Filter latency < 10ms': (r) => r.timings.duration < 10,
  });

  sleep(0.1);
}