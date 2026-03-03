import fetch from 'node-fetch';
import mongoose from 'mongoose';
import Listing from './src/models/Listing.js';
import User from './src/models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const API_URL = 'http://localhost:3000/api';
const URI = process.env.MONGODB_URL;

async function checkIndexPerformance() {
  console.log('\n=== INDEX SAFETY ASSERTION ===');
  // Check low-match query
  const res = await Listing.find({ $text: { $search: 'UniqueKeyword123' } })
    .explain('executionStats');
  
  const stage = res.queryPlanner?.winningPlan?.stage || res[0]?.queryPlanner?.winningPlan?.stage;
  console.log('Query Stage:', stage);
  if (stage === 'COLLSCAN') {
    throw new Error('CRITICAL: COLLSCAN detected on text search operations.');
  } else {
    console.log('✅ Index IXSCAN/TEXT successfully utilized. No full table scans.');
  }
}

async function runAdversarialTests() {
  await mongoose.connect(URI);
  console.log('Connected to Atlas for direct validation.');
  await checkIndexPerformance();

  console.log('\n=== API ADVERSARIAL TESTING ===');
  
  // Create test user
  const uRes = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user1@bicyclel.nl', password: 'Password123!' })
  });
  const cookie = uRes.headers.raw()['set-cookie'];

  // 1. Pagination Abuse
  console.log('\n1. Testing Pagination Boundaries (-1 skip, Infinity limit)');
  const p1 = await fetch(`${API_URL}/listings?page=-1&limit=5000`);
  const d1 = await p1.json();
  console.log('Negative Page Output Success:', d1.success, d1.msg);
  
  const p2 = await fetch(`${API_URL}/listings?page=1&limit=5000`);
  const d2 = await p2.json();
  console.log('Over-limit Request Result - Documents returned:', Array.isArray(d2.result) ? d2.result.length : 'Blocked');
  
  // 2. NoSQL Injection
  console.log('\n2. Testing NoSQL injection vectors');
  const sqRes = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: { "$gt": "" }, password: 'Password123!' })
  });
  const sqJSON = await sqRes.json();
  console.log('NoSQL Inject Blocked:', sqRes.status === 400 || !sqJSON.success);

  // 3. Unauthorized Admin Access
  console.log('\n3. Testing Role Escalation & Unauthorized Admin Data');
  const aRes = await fetch(`${API_URL}/admin/stats`, {
    headers: { 'Cookie': cookie }
  });
  console.log('Admin route protected from norm user:', aRes.status === 403 || aRes.status === 401);

  // 4. Rate Bursting (100 parallel requests)
  console.log('\n4. Testing Concurrency & Rate Limiting (100 parallel)');
  const burstStartTime = Date.now();
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(fetch(`${API_URL}/listings?limit=5`));
  }
  const results = await Promise.all(promises);
  console.log('Burst time (ms):', Date.now() - burstStartTime);
  console.log('Burst result codes:', results.map(r => r.status).slice(0, 5), '...', results.map(r => r.status).slice(-5));
  let isRateLimited = results.some(r => r.status === 429);
  console.log('Did rate limiter trigger?:', isRateLimited);

  await mongoose.disconnect();
  process.exit();
}

runAdversarialTests().catch(console.error);
