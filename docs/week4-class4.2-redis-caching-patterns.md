# Week 4 - Class 4.2: Redis Configuration and Caching Patterns

## 📋 Overview

**Duration:** 3-4 hours
**Prerequisites:** Class 4.1 completed (PostgreSQL setup), understanding of key-value concepts
**Why This Matters:** Redis is the **speed layer** of your application. While PostgreSQL is your source of truth, Redis caches frequently accessed data to deliver sub-millisecond response times. In blockchain applications, this is critical for real-time balance updates and transaction notifications.

In this class, you'll install Redis, learn caching strategies, implement pub/sub for real-time updates, and integrate Redis with your Node.js application.

---

## 🎯 Learning Objectives

By the end of this class, you will be able to:

1. **Install and configure Redis** on Windows
2. **Understand when to use Redis vs PostgreSQL** (caching strategies)
3. **Implement caching patterns** (Cache-Aside, Write-Through, Cache Invalidation)
4. **Use Redis data structures** (Strings, Hashes, Sets, Sorted Sets, Lists)
5. **Connect to Redis from Node.js** using the `ioredis` library
6. **Implement pub/sub** for real-time blockchain event notifications
7. **Set TTL (Time To Live)** for cache expiration
8. **Monitor Redis performance** and debug caching issues

---

## 🔑 Key Concepts

### What is Redis?

**Redis** (Remote Dictionary Server) is an **in-memory data structure store** used as:
- **Cache:** Store frequently accessed data for lightning-fast retrieval
- **Message Broker:** Pub/Sub for real-time notifications
- **Session Store:** User session data
- **Rate Limiter:** Track API request counts
- **Leaderboard:** Sorted sets for rankings

**Key Characteristics:**
- ⚡ **In-memory:** Data stored in RAM = microsecond latency
- 🔑 **Key-Value Store:** Simple model: `key → value`
- 📊 **Rich Data Structures:** Strings, Lists, Sets, Sorted Sets, Hashes, Streams
- 💾 **Optional Persistence:** Can write to disk (but usually used as cache)
- 📡 **Pub/Sub:** Real-time messaging between services

### PostgreSQL vs Redis: When to Use Which?

| Feature | PostgreSQL | Redis |
|---------|-----------|-------|
| **Storage** | Disk (persistent) | RAM (volatile) |
| **Speed** | ~5-50ms per query | ~0.1-1ms per query |
| **Data Structure** | Tables with rows/columns | Key-value with data structures |
| **Queries** | Complex SQL (JOIN, aggregation) | Simple key lookups |
| **Data Integrity** | ACID transactions, constraints | No constraints, eventually consistent |
| **Use Case** | Source of truth | Fast cache layer |
| **Capacity** | Terabytes | Limited by RAM (GBs) |
| **Cost** | Cheaper storage (disk) | Expensive storage (RAM) |

**The Pattern: Redis + PostgreSQL Together**

```
┌──────────────┐
│  Application │
└──────┬───────┘
       │
       │  1. Check cache first
       ▼
┌──────────────┐
│    Redis     │  ← Fast (1ms)
│   (Cache)    │
└──────┬───────┘
       │
       │  2. If miss, query database
       ▼
┌──────────────┐
│  PostgreSQL  │  ← Slower (50ms)
│  (Source of  │
│    Truth)    │
└──────────────┘
```

**Decision Tree:**

- **Use PostgreSQL for:**
  - Data that must persist (family members, transactions)
  - Complex queries (JOINs, aggregations)
  - Data integrity requirements (foreign keys, constraints)

- **Use Redis for:**
  - Frequently accessed data (user balances, recent transactions)
  - Real-time notifications (new transaction alerts)
  - Temporary data (session tokens, rate limiting counters)
  - Leaderboards and rankings

### Caching Strategies

#### 1. Cache-Aside (Lazy Loading)

**Pattern:** Application checks cache first, loads from database on miss, then populates cache.

```javascript
async function getUserBalance(userId) {
  // 1. Try cache first
  const cached = await redis.get(`balance:${userId}`);
  if (cached) {
    console.log('Cache HIT');
    return JSON.parse(cached);
  }

  // 2. Cache miss - load from database
  console.log('Cache MISS');
  const balance = await db.query(
    'SELECT balance FROM accounts WHERE member_id = $1',
    [userId]
  );

  // 3. Store in cache for next time (with 60s expiration)
  await redis.setex(`balance:${userId}`, 60, JSON.stringify(balance));

  return balance;
}
```

**Pros:**
- ✅ Only caches what's actually used
- ✅ Resilient to cache failures (falls back to database)

**Cons:**
- ❌ Initial request is slow (cache miss)
- ❌ Can result in stale data

#### 2. Write-Through Caching

**Pattern:** Application writes to cache and database simultaneously.

```javascript
async function updateBalance(userId, newBalance) {
  // 1. Update database first
  await db.query(
    'UPDATE accounts SET balance = $1 WHERE member_id = $2',
    [newBalance, userId]
  );

  // 2. Update cache immediately
  await redis.setex(`balance:${userId}`, 60, JSON.stringify(newBalance));

  return newBalance;
}
```

**Pros:**
- ✅ Cache is always fresh
- ✅ No stale data

**Cons:**
- ❌ Write latency (two operations)
- ❌ May cache data that's never read

#### 3. Cache Invalidation

**Pattern:** When data changes in database, remove it from cache.

```javascript
async function updateBalance(userId, newBalance) {
  // 1. Update database
  await db.query(
    'UPDATE accounts SET balance = $1 WHERE member_id = $2',
    [newBalance, userId]
  );

  // 2. Invalidate cache (delete the key)
  await redis.del(`balance:${userId}`);
  // Next read will be a cache miss and will load fresh data
}
```

**Pros:**
- ✅ Simple to implement
- ✅ Ensures fresh data on next read

**Cons:**
- ❌ Next read is slower (cache miss)

### Redis Data Types

#### 1. Strings (Key-Value)

The most basic type. Store any text or binary data up to 512MB.

```javascript
// Set a string
await redis.set('user:1:name', 'Alice');

// Get a string
const name = await redis.get('user:1:name');  // "Alice"

// Set with expiration (60 seconds)
await redis.setex('session:abc123', 60, 'user_data');

// Increment a counter
await redis.incr('visitor:count');  // Returns 1, 2, 3, ...
```

**Use cases:** Cache values, session tokens, counters

#### 2. Hashes (Objects)

Store objects as field-value pairs. Perfect for user profiles or account data.

```javascript
// Store user data as hash
await redis.hset('user:1', {
  name: 'Alice',
  email: 'alice@family.com',
  balance: '2.5'
});

// Get specific field
const name = await redis.hget('user:1', 'name');  // "Alice"

// Get all fields
const user = await redis.hgetall('user:1');
// { name: 'Alice', email: 'alice@family.com', balance: '2.5' }

// Increment numeric field
await redis.hincrby('user:1', 'login_count', 1);
```

**Use cases:** User profiles, account data, configuration objects

#### 3. Lists (Ordered Collections)

Ordered lists of strings. Push/pop from both ends.

```javascript
// Add to list (left side)
await redis.lpush('recent:transactions', 'tx1', 'tx2', 'tx3');

// Get range (0 to 9 = first 10 items)
const recent = await redis.lrange('recent:transactions', 0, 9);
// ['tx3', 'tx2', 'tx1']

// Get list length
const count = await redis.llen('recent:transactions');  // 3

// Trim list to keep only last 100
await redis.ltrim('recent:transactions', 0, 99);
```

**Use cases:** Recent activity logs, job queues, timelines

#### 4. Sets (Unique Collections)

Unordered collections of unique strings.

```javascript
// Add members to set
await redis.sadd('active:users', 'user1', 'user2', 'user3');

// Check membership
const isMember = await redis.sismember('active:users', 'user1');  // 1 (true)

// Get all members
const users = await redis.smembers('active:users');  // ['user1', 'user2', 'user3']

// Set operations
await redis.sadd('group:parents', 'user1', 'user2');
await redis.sadd('group:admins', 'user2', 'user4');

// Intersection (members in both sets)
const adminsAndParents = await redis.sinter('group:parents', 'group:admins');
// ['user2']
```

**Use cases:** Tags, unique visitors, following/followers

#### 5. Sorted Sets (Ranked Collections)

Sets with scores. Members are ordered by score.

```javascript
// Add members with scores
await redis.zadd('leaderboard', 100, 'Alice', 85, 'Bob', 92, 'Charlie');

// Get top 3 (highest scores)
const top3 = await redis.zrevrange('leaderboard', 0, 2, 'WITHSCORES');
// ['Alice', '100', 'Charlie', '92', 'Bob', '85']

// Get rank of member (0-indexed, lowest score = 0)
const rank = await redis.zrevrank('leaderboard', 'Charlie');  // 1 (second place)

// Increment score
await redis.zincrby('leaderboard', 10, 'Bob');  // Bob now has 95
```

**Use cases:** Leaderboards, priority queues, time-series data

### Redis Pub/Sub

**Publish-Subscribe** pattern for real-time messaging.

**Publisher (blockchain event listener):**
```javascript
// When a transaction is confirmed
await redis.publish('blockchain:transactions', JSON.stringify({
  txHash: '0xabc123...',
  from: '0x123...',
  to: '0x456...',
  amount: '1.5'
}));
```

**Subscriber (frontend notification service):**
```javascript
// Listen for transaction events
await redis.subscribe('blockchain:transactions');

redis.on('message', (channel, message) => {
  const tx = JSON.parse(message);
  console.log(`New transaction: ${tx.txHash}`);
  // Send push notification to user's device
});
```

**Use cases:** Real-time notifications, event-driven architecture, microservice communication

---

## 🔨 Hands-On Activity

### Step 1: Install Redis on Windows

**Installation Steps:**

```powershell
# Option 1: Using Chocolatey (recommended)
choco install redis

# Option 2: Download from GitHub
# Visit: https://github.com/microsoftarchive/redis/releases
# Download: Redis-x64-3.0.504.msi
# Run installer
```

**Verify Installation:**

```powershell
# Start Redis server
redis-server

# Expected output:
# [PID] Server initialized
# [PID] Ready to accept connections on port 6379
```

**In a new PowerShell window, test Redis:**

```powershell
# Start Redis CLI
redis-cli

# Test basic commands
127.0.0.1:6379> SET test "Hello Redis"
OK
127.0.0.1:6379> GET test
"Hello Redis"
127.0.0.1:6379> DEL test
(integer) 1
127.0.0.1:6379> exit
```

### Step 2: Connect to Redis from Node.js

**Install ioredis:**

```powershell
# In your FamilyChain project root
npm install ioredis
```

**Create Redis connection file:**

Create `src/cache/redis.js`:

```javascript
const Redis = require('ioredis');

// Create Redis client
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Handle connection events
redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

// Export client
module.exports = redis;
```

**Q: What does `retryStrategy` do?**

<details>
<summary>Answer</summary>

**Retry strategy controls reconnection behavior when Redis connection is lost.**

Without retry strategy:
- If Redis goes down, your app crashes

With retry strategy:
- App retries connection with exponential backoff
- `Math.min(times * 50, 2000)` means:
  - 1st retry: 50ms
  - 2nd retry: 100ms
  - 10th retry: 500ms
  - 40th retry: 2000ms (max)
- Resilient to temporary Redis outages

</details>

**Test the connection:**

Create `src/cache/test-redis.js`:

```javascript
const redis = require('./redis');

async function testRedis() {
  try {
    // Test basic operations
    console.log('Testing Redis connection...\n');

    // Strings
    await redis.set('test:key', 'Hello Redis!');
    const value = await redis.get('test:key');
    console.log('✅ GET test:key =', value);

    // Expiration
    await redis.setex('temp:key', 5, 'This expires in 5 seconds');
    const ttl = await redis.ttl('temp:key');
    console.log('✅ TTL for temp:key =', ttl, 'seconds');

    // Counters
    await redis.set('visitors', 0);
    await redis.incr('visitors');
    await redis.incr('visitors');
    const count = await redis.get('visitors');
    console.log('✅ Visitor count =', count);

    // Cleanup
    await redis.del('test:key', 'temp:key', 'visitors');
    console.log('\n✅ All tests passed!');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testRedis();
```

**Run the test:**

```powershell
node src/cache/test-redis.js
```

**Expected output:**
```
✅ Redis connected
Testing Redis connection...

✅ GET test:key = Hello Redis!
✅ TTL for temp:key = 5 seconds
✅ Visitor count = 2

✅ All tests passed!
```

### Step 3: Implement Cache-Aside Pattern

**Create caching helper:**

Create `src/cache/balance-cache.js`:

```javascript
const redis = require('./redis');
const db = require('../db/connection');

const CACHE_TTL = 60; // 60 seconds

/**
 * Get user balance with caching
 */
async function getBalanceWithCache(memberId) {
  const cacheKey = `balance:member:${memberId}`;

  // 1. Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log(`Cache HIT for member ${memberId}`);
    return JSON.parse(cached);
  }

  // 2. Cache miss - query database
  console.log(`Cache MISS for member ${memberId}`);
  const result = await db.query(
    `SELECT a.id, a.account_type, a.balance, a.currency
     FROM accounts a
     WHERE a.member_id = $1`,
    [memberId]
  );

  const accounts = result.rows;

  // 3. Store in cache
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(accounts));

  return accounts;
}

/**
 * Update balance and invalidate cache
 */
async function updateBalanceAndInvalidateCache(accountId, newBalance) {
  // 1. Get account to find member_id
  const result = await db.query(
    'SELECT member_id FROM accounts WHERE id = $1',
    [accountId]
  );

  const memberId = result.rows[0].member_id;

  // 2. Update database
  await db.query(
    'UPDATE accounts SET balance = $1 WHERE id = $2',
    [newBalance, accountId]
  );

  // 3. Invalidate cache
  const cacheKey = `balance:member:${memberId}`;
  await redis.del(cacheKey);
  console.log(`Cache invalidated for member ${memberId}`);

  return { accountId, newBalance, memberId };
}

/**
 * Warm up cache for a member (preload)
 */
async function warmUpCache(memberId) {
  console.log(`Warming up cache for member ${memberId}`);
  return await getBalanceWithCache(memberId);
}

module.exports = {
  getBalanceWithCache,
  updateBalanceAndInvalidateCache,
  warmUpCache,
};
```

**Test caching:**

Create `src/cache/test-caching.js`:

```javascript
const cache = require('./balance-cache');

async function testCaching() {
  try {
    console.log('=== Testing Cache-Aside Pattern ===\n');

    // First call - cache miss
    console.log('1. First call (should be cache miss):');
    const balances1 = await cache.getBalanceWithCache(1);
    console.log('Balances:', balances1);

    // Second call - cache hit
    console.log('\n2. Second call (should be cache hit):');
    const balances2 = await cache.getBalanceWithCache(1);
    console.log('Balances:', balances2);

    // Update balance - invalidates cache
    console.log('\n3. Updating balance:');
    await cache.updateBalanceAndInvalidateCache(1, 3.5);

    // Third call - cache miss again (cache was invalidated)
    console.log('\n4. After update (should be cache miss):');
    const balances3 = await cache.getBalanceWithCache(1);
    console.log('Balances:', balances3);

    console.log('\n✅ Caching test complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testCaching();
```

**Run the test:**

```powershell
node src/cache/test-caching.js
```

**Expected output:**
```
=== Testing Cache-Aside Pattern ===

1. First call (should be cache miss):
Cache MISS for member 1
Balances: [ { id: 1, account_type: 'ethereum_wallet', balance: '2.50', currency: 'ETH' } ]

2. Second call (should be cache hit):
Cache HIT for member 1
Balances: [ { id: 1, account_type: 'ethereum_wallet', balance: '2.50', currency: 'ETH' } ]

3. Updating balance:
Cache invalidated for member 1

4. After update (should be cache miss):
Cache MISS for member 1
Balances: [ { id: 1, account_type: 'ethereum_wallet', balance: '3.50', currency: 'ETH' } ]

✅ Caching test complete!
```

### Step 4: Use Redis Hashes for Complex Objects

**Store user profiles as hashes:**

Create `src/cache/profile-cache.js`:

```javascript
const redis = require('./redis');
const db = require('../db/connection');

/**
 * Cache user profile as hash
 */
async function cacheUserProfile(memberId) {
  const result = await db.query(
    'SELECT id, name, email, wallet_address, role FROM family_members WHERE id = $1',
    [memberId]
  );

  const profile = result.rows[0];
  if (!profile) {
    throw new Error(`Member ${memberId} not found`);
  }

  // Store as hash
  const cacheKey = `profile:${memberId}`;
  await redis.hmset(cacheKey, {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    wallet_address: profile.wallet_address || '',
    role: profile.role,
  });

  // Set expiration
  await redis.expire(cacheKey, 300); // 5 minutes

  return profile;
}

/**
 * Get user profile from cache
 */
async function getUserProfile(memberId) {
  const cacheKey = `profile:${memberId}`;

  // Try cache first
  const cached = await redis.hgetall(cacheKey);
  if (cached && Object.keys(cached).length > 0) {
    console.log(`Cache HIT for profile:${memberId}`);
    return cached;
  }

  // Cache miss - load from database
  console.log(`Cache MISS for profile:${memberId}`);
  return await cacheUserProfile(memberId);
}

/**
 * Update specific profile field
 */
async function updateProfileField(memberId, field, value) {
  // Update database
  await db.query(
    `UPDATE family_members SET ${field} = $1 WHERE id = $2`,
    [value, memberId]
  );

  // Update cache if exists
  const cacheKey = `profile:${memberId}`;
  const exists = await redis.exists(cacheKey);
  if (exists) {
    await redis.hset(cacheKey, field, value);
    console.log(`Cache updated: ${cacheKey}.${field} = ${value}`);
  }
}

module.exports = {
  getUserProfile,
  cacheUserProfile,
  updateProfileField,
};
```

**Test hash caching:**

```javascript
const profile = require('./cache/profile-cache');

async function testHashCache() {
  // Get profile (cache miss)
  const user1 = await profile.getUserProfile(1);
  console.log('User:', user1);

  // Get profile again (cache hit)
  const user2 = await profile.getUserProfile(1);
  console.log('User (cached):', user2);

  // Update a field
  await profile.updateProfileField(1, 'name', 'Alice Updated');
}

testHashCache();
```

### Step 5: Implement Redis Lists for Recent Activity

**Track recent transactions:**

Create `src/cache/activity-cache.js`:

```javascript
const redis = require('./redis');

const MAX_RECENT_ITEMS = 100;

/**
 * Add transaction to recent activity
 */
async function addRecentTransaction(memberId, txData) {
  const key = `activity:${memberId}:recent`;

  // Add to list (left push = newest first)
  await redis.lpush(key, JSON.stringify(txData));

  // Trim to keep only last 100
  await redis.ltrim(key, 0, MAX_RECENT_ITEMS - 1);

  // Set expiration (7 days)
  await redis.expire(key, 7 * 24 * 60 * 60);

  console.log(`Added transaction to ${key}`);
}

/**
 * Get recent transactions
 */
async function getRecentTransactions(memberId, limit = 10) {
  const key = `activity:${memberId}:recent`;

  // Get first N items
  const items = await redis.lrange(key, 0, limit - 1);

  // Parse JSON
  return items.map(item => JSON.parse(item));
}

/**
 * Clear recent activity
 */
async function clearRecentActivity(memberId) {
  const key = `activity:${memberId}:recent`;
  await redis.del(key);
  console.log(`Cleared ${key}`);
}

module.exports = {
  addRecentTransaction,
  getRecentTransactions,
  clearRecentActivity,
};
```

**Test recent activity:**

```javascript
const activity = require('./cache/activity-cache');

async function testActivity() {
  // Add some transactions
  await activity.addRecentTransaction(1, {
    txHash: '0xabc123',
    amount: '1.5',
    type: 'deposit',
    timestamp: Date.now(),
  });

  await activity.addRecentTransaction(1, {
    txHash: '0xdef456',
    amount: '0.5',
    type: 'withdrawal',
    timestamp: Date.now(),
  });

  // Get recent transactions
  const recent = await activity.getRecentTransactions(1, 10);
  console.log('Recent transactions:', recent);
}

testActivity();
```

### Step 6: Implement Pub/Sub for Real-Time Notifications

**Publisher (simulates blockchain event):**

Create `src/cache/publisher.js`:

```javascript
const redis = require('./redis');

/**
 * Publish blockchain event
 */
async function publishBlockchainEvent(eventType, data) {
  const channel = `blockchain:${eventType}`;
  const message = JSON.stringify({
    ...data,
    timestamp: Date.now(),
  });

  const subscriberCount = await redis.publish(channel, message);
  console.log(`Published to ${channel}, ${subscriberCount} subscribers notified`);
}

// Test: Publish a transaction event
async function testPublish() {
  await publishBlockchainEvent('transaction', {
    txHash: '0xabc123...',
    from: '0x123...',
    to: '0x456...',
    amount: '1.5 ETH',
  });

  await publishBlockchainEvent('balance', {
    address: '0x123...',
    balance: '10.5 ETH',
  });

  process.exit(0);
}

testPublish();
```

**Subscriber (listens for events):**

Create `src/cache/subscriber.js`:

```javascript
const Redis = require('ioredis');

// Create separate client for subscribing
const subscriber = new Redis();

async function startSubscriber() {
  // Subscribe to channels
  await subscriber.subscribe('blockchain:transaction', 'blockchain:balance');

  console.log('✅ Subscribed to blockchain events\n');

  // Handle messages
  subscriber.on('message', (channel, message) => {
    const data = JSON.parse(message);
    console.log(`📨 Received on ${channel}:`);
    console.log(data);
    console.log();

    // In a real app, you would:
    // - Send push notification to user
    // - Update UI via WebSocket
    // - Log to database
    // - Trigger other business logic
  });

  console.log('Listening for events... (Press Ctrl+C to stop)\n');
}

startSubscriber();
```

**Test pub/sub:**

```powershell
# Terminal 1: Start subscriber
node src/cache/subscriber.js

# Terminal 2: Publish events
node src/cache/publisher.js
```

**Expected output (Terminal 1):**
```
✅ Subscribed to blockchain events

Listening for events... (Press Ctrl+C to stop)

📨 Received on blockchain:transaction:
{
  txHash: '0xabc123...',
  from: '0x123...',
  to: '0x456...',
  amount: '1.5 ETH',
  timestamp: 1705324800000
}

📨 Received on blockchain:balance:
{
  address: '0x123...',
  balance: '10.5 ETH',
  timestamp: 1705324800000
}
```

### Step 7: Monitor Redis with INFO command

**Check Redis stats:**

```powershell
redis-cli INFO

# Key sections:
# - Memory: used_memory_human, maxmemory
# - Stats: total_commands_processed, keyspace_hits, keyspace_misses
# - Keyspace: db0:keys=10,expires=5

# Check specific section
redis-cli INFO stats

# Check memory usage
redis-cli INFO memory
```

**Monitor real-time commands:**

```powershell
redis-cli MONITOR

# Shows all commands being executed in real-time
# Useful for debugging
```

**Check cache hit rate:**

```powershell
redis-cli INFO stats | findstr "keyspace"

# keyspace_hits: Number of cache hits
# keyspace_misses: Number of cache misses
# Hit rate = hits / (hits + misses)
```

---

## ✅ Expected Outputs

After completing all steps, you should have:

1. **Redis installed and running** on port 6379
2. **Node.js connected** to Redis using `ioredis`
3. **Cache-aside pattern implemented** for balances
4. **Redis hashes** for user profiles
5. **Redis lists** for recent activity
6. **Pub/sub working** between publisher and subscriber
7. **Monitoring tools** (redis-cli INFO, MONITOR)

**Verification Checklist:**

```powershell
# Redis server running
redis-cli PING  # Should return PONG

# Test connection from Node.js
node src/cache/test-redis.js  # Should pass all tests

# Test caching
node src/cache/test-caching.js  # Should show cache hits/misses

# Test pub/sub
# Terminal 1: node src/cache/subscriber.js
# Terminal 2: node src/cache/publisher.js
```

---

## 📦 Deliverables

By the end of this class, you should have:

- [ ] Redis installed and running
- [ ] `src/cache/redis.js` connection file
- [ ] `src/cache/balance-cache.js` with cache-aside pattern
- [ ] `src/cache/profile-cache.js` using hashes
- [ ] `src/cache/activity-cache.js` using lists
- [ ] `src/cache/publisher.js` and `src/cache/subscriber.js` for pub/sub
- [ ] All test files passing
- [ ] Screenshot of redis-cli INFO output
- [ ] Screenshot of pub/sub demo working

---

## ❓ Common Issues & Solutions

### Issue 1: "Cannot connect to Redis"

**Cause:** Redis server not running

**Solution:**
```powershell
# Start Redis server
redis-server

# Or install as Windows service
redis-server --service-install
redis-server --service-start
```

### Issue 2: "MISCONF Redis is configured to save RDB snapshots"

**Cause:** Redis can't write to disk (permissions or full disk)

**Solution:**
```powershell
# Temporary fix (disable disk persistence)
redis-cli CONFIG SET stop-writes-on-bgsave-error no

# Or fix disk space/permissions
```

### Issue 3: Cache hit rate is very low

**Cause:** TTL too short or cache invalidation too aggressive

**Solution:**
```javascript
// Increase TTL
const CACHE_TTL = 300; // 5 minutes instead of 60 seconds

// Or only invalidate specific fields, not entire cache
```

### Issue 4: Memory usage growing indefinitely

**Cause:** Keys without expiration (no TTL set)

**Solution:**
```javascript
// ALWAYS set expiration
await redis.setex('key', 3600, 'value');  // 1 hour

// Or use maxmemory-policy in redis.conf
# maxmemory 256mb
# maxmemory-policy allkeys-lru  // Evict least recently used
```

---

## ✅ Self-Assessment Quiz

### Question 1: When should you use Redis instead of PostgreSQL?

<details>
<summary>Answer</summary>

**Use Redis for:**
- ✅ Frequently accessed data (cache)
- ✅ Real-time notifications (pub/sub)
- ✅ Temporary data (sessions, rate limits)
- ✅ Simple key-value lookups
- ✅ When speed is critical (<1ms latency)

**Use PostgreSQL for:**
- ✅ Data that must persist
- ✅ Complex queries (JOINs, aggregations)
- ✅ Data integrity (constraints, transactions)
- ✅ Source of truth

**Best practice:** Use both together - Redis as cache, PostgreSQL as database.

</details>

### Question 2: Explain the Cache-Aside pattern

<details>
<summary>Answer</summary>

**Cache-Aside (Lazy Loading):**

1. **Check cache first:** Try to get data from Redis
2. **If cache hit:** Return cached data (fast!)
3. **If cache miss:** Query database
4. **Populate cache:** Store result in Redis for next time
5. **Return data:** Send to user

**Code example:**
```javascript
// 1. Try cache
const cached = await redis.get(key);
if (cached) return cached;  // Cache hit

// 2. Cache miss - query database
const data = await db.query(...);

// 3. Populate cache
await redis.setex(key, TTL, data);

// 4. Return
return data;
```

**When to use:** Most common caching pattern, good for read-heavy workloads.

</details>

### Question 3: What's the difference between `set` and `setex`?

<details>
<summary>Answer</summary>

**SET:** Store key-value pair with NO expiration
```javascript
await redis.set('user:1:name', 'Alice');
// Key exists forever (until manually deleted)
```

**SETEX:** Store key-value pair WITH expiration (TTL)
```javascript
await redis.setex('user:1:name', 60, 'Alice');
// Key expires after 60 seconds
```

**Why use SETEX?**
- ✅ Prevents memory leaks (keys auto-deleted)
- ✅ Ensures fresh data (cache refreshes)
- ✅ Required for caching (stale data must expire)

**Best practice:** ALWAYS use SETEX for caches. Never use SET without a good reason.

</details>

### Question 4: Why create a separate Redis client for pub/sub?

<details>
<summary>Answer</summary>

**Redis clients in subscribe mode can't execute other commands.**

**Wrong:**
```javascript
const redis = new Redis();
await redis.subscribe('channel');
await redis.get('key');  // ❌ ERROR: Can't use GET in subscribe mode
```

**Correct:**
```javascript
// Client 1: Normal operations
const redis = new Redis();
await redis.set('key', 'value');

// Client 2: Pub/Sub only
const subscriber = new Redis();
await subscriber.subscribe('channel');
```

**Why?** Redis protocol limitation - subscribed clients enter a special mode where only pub/sub commands work.

</details>

### Question 5: What's a good cache hit rate target?

<details>
<summary>Answer</summary>

**Good cache hit rate: 80-95%**

**Calculate hit rate:**
```
Hit Rate = Hits / (Hits + Misses)

Example:
- Hits: 900
- Misses: 100
- Hit Rate: 900 / (900 + 100) = 90%
```

**Check with Redis:**
```powershell
redis-cli INFO stats | findstr "keyspace"
# keyspace_hits:900
# keyspace_misses:100
```

**If hit rate is low (<50%):**
- ❌ TTL too short (data expires too quickly)
- ❌ Caching wrong data (not frequently accessed)
- ❌ Cache invalidation too aggressive
- ❌ Cache warming needed (preload popular data)

**If hit rate is very high (>99%):**
- ⚠️ Might be caching too much
- ⚠️ Risk of stale data
- ⚠️ Check if cached data is actually changing

</details>

---

## 🎯 Key Takeaways

1. **Redis is in-memory**, making it 50-100x faster than disk-based databases
2. **Use PostgreSQL + Redis together** - database for persistence, cache for speed
3. **Always set TTL** on cached data to prevent memory leaks and stale data
4. **Cache-Aside is the most common pattern** for read-heavy workloads
5. **Invalidate cache** when data changes to ensure consistency
6. **Pub/Sub enables real-time features** without polling the database
7. **Monitor cache hit rate** to optimize performance (target: 80-95%)

---

## 🔜 Next Steps

In **Class 4.3: Data Modeling for Financial Systems**, you'll learn:
- How to handle money with precision
- Transaction history patterns
- Audit logging
- Relating on-chain and off-chain data

**Preparation:**
- Ensure Redis is working correctly
- Think about: "What data in FamilyChain changes frequently?" (cache candidates)
- Review your PostgreSQL schema from Class 4.1

---

## 📚 Reading References

**Bitcoin Book:**
- Chapter 6: Transactions - Understanding data flows (parallels to cache invalidation)
- Chapter 11: Blockchain - Block Structure (understanding immutable vs mutable data)

**Ethereum Book:**
- Chapter 6: Transactions - Real-time transaction processing
- Chapter 13: EVM - State management (cache as ephemeral state)

**Redis Documentation:**
- Data Types: https://redis.io/docs/data-types/
- Pub/Sub: https://redis.io/docs/interact/pubsub/

**ioredis Documentation:**
- Getting Started: https://github.com/redis/ioredis#readme
- API Reference: https://github.com/redis/ioredis/blob/main/API.md

---

## 🎓 Teaching Notes (for Claude Code)

**Interaction Style:**
- Check understanding of why caching is needed before showing how
- Ask user to predict cache hit/miss before running tests
- Wait for user to see performance difference (cached vs uncached)
- Encourage experimentation with different TTL values

**Common Student Struggles:**
- **Concept:** When to cache vs when to query database directly
- **Technical:** Redis not starting as Windows service
- **Pub/Sub:** Understanding why separate client is needed

**Pacing:**
- Step 1-2 (Installation): 20-30 minutes
- Step 3-4 (Caching patterns): 60-90 minutes (core concept)
- Step 5-6 (Lists, Pub/Sub): 45-60 minutes
- Step 7 (Monitoring): 15-20 minutes

**When to Probe Deeper:**
- If user sets long TTL (hours) → Discuss stale data risk
- If user doesn't invalidate cache → Show how stale data causes bugs
- If user uses same client for pub/sub → Explain protocol limitation

**Reinforcement Questions:**
- "We just cached balance with 60s TTL. What happens if user deposits money at second 59?"
- "Why use SETEX instead of SET for caches?"
- "How would you implement rate limiting with Redis?" (hint: INCR with EXPIRE)

---

**Version:** 1.0
**Last Updated:** 2025-01-15
**Previous Class:** [Class 4.1 - PostgreSQL Setup and Schema Design](week4-class4.1-postgresql-setup-schema-design.md)
**Next Class:** [Class 4.3 - Data Modeling for Financial Systems](week4-class4.3-data-modeling.md)
