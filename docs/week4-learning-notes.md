# Week 4 Learning Notes

## Session 1: Class 4.1 - PostgreSQL Setup and Schema Design (2025-01-04)

### 📋 Session Overview
**Duration:** ~4 hours
**Status:** ✅ Class 4.1 COMPLETE (Self-assessment passed 7/7)

### ✅ Accomplishments

#### PostgreSQL Installation & Configuration
- Installed PostgreSQL 18.x on Windows (updated from guide's PostgreSQL 16 reference)
- Verified installation and service running correctly
- Configured pgAdmin 4 (available but chose to use psql for learning)
- Created `familychain` database

#### Database Schema Design
Created 3 tables with proper relationships:

1. **family_members** (4 sample records)
   - Primary key: `id SERIAL`
   - Unique constraints on `email`, `wallet_address`
   - CHECK constraint on `role` (parent, child, guardian)
   - Auto-timestamp with `created_at`

2. **accounts** (4 sample records)
   - Foreign key to `family_members(id)` with `ON DELETE CASCADE`
   - Used `NUMERIC(20, 8)` for balance (financial precision)
   - CHECK constraint on `account_type` (savings, checking, crypto)
   - Multi-currency support

3. **transactions** (5 sample records)
   - Foreign key to `accounts(id)` with `ON DELETE CASCADE`
   - `tx_hash CHAR(66)` for blockchain transaction hashes
   - `NUMERIC(20, 8)` for amounts
   - CHECK constraint on `tx_type` (deposit, withdrawal, transfer, allowance)

#### SQL Skills Demonstrated
- ✅ INSERT with multiple VALUES
- ✅ SELECT with WHERE, ORDER BY
- ✅ Complex 3-table JOINs (family_members → accounts → transactions)
- ✅ LEFT JOIN for including records without matches
- ✅ Aggregate functions: COUNT, SUM, GROUP BY, COALESCE
- ✅ Subqueries and calculated fields

#### Node.js Integration
- Installed `pg` (node-postgres) library
- Installed `dotenv` for environment variable management
- Created `.env` file for `DB_PASSWORD` (not committed to git)
- Implemented connection pooling with `Pool` class
- Created test script: `scripts/db-test.js` (ES modules)

#### Advanced Database Patterns

**1. Application-level transactions (first approach):**
- `scripts/db-transfer.js` - Implemented fund transfer with explicit transaction management
- Used `BEGIN`, `COMMIT`, `ROLLBACK`
- Demonstrated row-level locking with `FOR UPDATE`
- Proper error handling with try/catch/finally

**2. Stored procedures (refactored approach):**
- Created PostgreSQL function: `transfer_funds()`
- All business logic moved to database layer
- Implicit transaction handling (automatic BEGIN/COMMIT/ROLLBACK)
- Single database call from Node.js
- `scripts/db-transfer-sp.js` - Clean application code

#### Key Insights & Decisions

**1. PostgreSQL Version:**
- User installing PostgreSQL 18.x (not 16 as in original guides)
- Updated all Week 4 guides to reference PostgreSQL 18
- Updated CLAUDE.md "Current Project Versions" section
- Verified full compatibility with node-postgres library

**2. Security Best Practices:**
- ✅ Used `.env` for database password (not Hardhat keystore for standalone scripts)
- ✅ Parameterized queries ($1, $2) to prevent SQL injection
- ✅ Never hardcode credentials in source files

**3. Production Architecture Insights:**
- **User's excellent question:** "Why make so many database calls? Mix logic and data access?"
- **Solution:** Implemented stored procedures for business logic
- **Benefits:** Single network round-trip, logic near data, ACID guarantees
- **Trade-offs discussed:** Development complexity vs performance/integrity

**4. Transaction Management:**
- **User's excellent observation:** "Does the function have implicit transactions?"
- **Deep dive:** FUNCTION vs PROCEDURE differences
- **Verified:** Automatic rollback on errors (tested with forced exceptions)
- **Conclusion:** Implicit transactions perfect for atomic operations

**5. Foreign Key Constraints:**
- **User's production instinct:** "I don't use DELETE CASCADE in production"
- **Reasoning:** Risk of cascading deletions through entire schema
- **Alternative:** Use `ON DELETE RESTRICT` for financial data
- **When CASCADE is okay:** Non-critical or truly owned data

### 🎓 Self-Assessment Results

**Score: 7/7 (100%) ✅**

Strong answers on:
- NUMERIC vs FLOAT (rounding errors in financial systems)
- Foreign key constraints (referential integrity)
- SQL injection prevention (`1 OR 1=1` example)
- JOIN vs LEFT JOIN (NULL behavior understood)
- Implicit transactions in FUNCTIONs
- ON DELETE CASCADE (production risks identified)
- Connection pooling (connection setup cost)

**Standout insights:**
- Cautious approach to DELETE CASCADE (mature database thinking)
- Recognized mixing data access and business logic as anti-pattern
- Asked about stored procedures proactively
- Deep understanding of transaction mechanics

### 📂 Files Created/Modified

**Created:**
- `scripts/db-test.js` - Basic database connection test
- `scripts/db-transfer.js` - Application-level transaction handling
- `scripts/db-transfer-sp.js` - Stored procedure caller (clean version)
- `.env` - Database credentials (not committed)
- PostgreSQL function: `transfer_funds()` in database

**Modified:**
- `docs/week4-class4.1-postgresql-setup-schema-design.md` - Version 16 → 18
- `docs/week4-class4.4-database-security-encryption.md` - Version 16 → 18
- `CLAUDE.md` - Updated "Current Project Versions" section
- `package.json` - Added `pg` and `dotenv` dependencies

**Database Objects:**
- Database: `familychain`
- Tables: `family_members`, `accounts`, `transactions`
- Function: `transfer_funds(p_from_account_id, p_to_account_id, p_amount, p_description)`

### 💡 Key Learnings

**Technical:**
1. **NUMERIC is mandatory for money** - FLOAT causes accumulating rounding errors
2. **Foreign keys enforce data integrity** - Database prevents invalid relationships
3. **Parameterized queries prevent SQL injection** - Always use $1, $2 placeholders
4. **Connection pooling is essential** - New connections are expensive (20-100ms overhead)
5. **Stored procedures reduce network calls** - Single call vs 5+ queries
6. **PostgreSQL functions have implicit transactions** - Perfect for atomic operations

**Architectural:**
1. **Separate data logic from business logic** - Stored procedures for critical operations
2. **Use ON DELETE RESTRICT in production** - Prevent accidental cascade deletions
3. **Cache balances, transactions are source of truth** - Discovered balance vs calculated balance
4. **Test error scenarios** - Verified rollback behavior with forced errors

**Tools:**
1. **psql is excellent for learning** - Direct interaction builds SQL understanding
2. **pgAdmin available but not needed yet** - CLI-first approach
3. **dotenv for environment variables** - Industry standard for Node.js apps
4. **ES modules in Hardhat project** - Consistent with existing codebase

### 🔄 Next Steps

**Class 4.2: Redis Configuration and Caching Patterns**
- Install Redis on Windows (Chocolatey or GitHub release)
- Understand caching strategies (Cache-Aside, Write-Through, Write-Behind)
- Implement Redis data structures (Strings, Hashes, Sets, Sorted Sets)
- Connect Node.js with `ioredis` library
- Implement pub/sub for real-time blockchain events
- Set TTL (Time To Live) for cache expiration

**Preparation:**
- Review `docs/week4-class4.2-redis-caching-patterns.md`
- Ensure Windows package manager available (Chocolatey)

### 📊 Progress Tracking

**Week 4 Status:**
- ✅ Class 4.1: PostgreSQL Setup and Schema Design (COMPLETE)
- 🔜 Class 4.2: Redis Configuration and Caching Patterns
- 🔜 Class 4.3: Data Modeling for Financial Systems
- 🔜 Class 4.4: Database Security and Encryption

**Overall Course Progress:**
- Week 1: ✅ Complete (3 classes)
- Week 2: ✅ Complete (3 classes)
- Week 3: ✅ Complete (4 classes)
- Week 4: 🔄 In Progress (1/4 classes complete)

---

**Session End:** 2025-01-04
**Next Session:** Class 4.2 - Redis Configuration

---

## Session 2: Class 4.2 - Redis Configuration and Caching Patterns (2025-01-05)

### 📋 Session Overview
**Duration:** ~3.5 hours
**Status:** ✅ Class 4.2 COMPLETE (Self-assessment passed 5/5)

### ✅ Accomplishments

#### Redis Installation & Configuration (Docker Approach)
- Installed Redis using Docker (better than native Windows installation)
- Container name: `redis-familychain` (user's excellent naming choice)
- Port mapping: 6379:6379
- Verified installation with `docker exec -it redis-familychain redis-cli`
- Tested basic commands: PING, SET, GET, DEL

**Why Docker is better:**
- ✅ No Windows-specific issues
- ✅ Isolated environment
- ✅ Easy cleanup
- ✅ Production-like setup
- ✅ Simple start/stop

#### Node.js Integration (TypeScript)
- Installed `ioredis` library
- Installed `@types/pg` for TypeScript definitions
- Created `src/cache/redis.ts` connection module
- Created `src/db/connection.ts` database module
- All files in TypeScript for consistency

**Important TypeScript learnings:**
- Import fix: `import { Redis } from 'ioredis'` (not `import Redis`)
- Import extensions: Use `.js` in imports even for `.ts` files (compiles to `.js` at runtime)
- Docker flags: `-it` = `-i` (interactive) + `-t` (TTY/terminal)

#### Cache-Aside Pattern Implementation
- Created `src/cache/balance-cache.ts`
- Implemented lazy loading pattern:
  1. Check Redis cache first
  2. If cache MISS → Query PostgreSQL
  3. Store result in Redis with 60s TTL
  4. Return data
- **Performance gain:** 50-100x faster on cache hits!

#### Redis Data Structures Implemented

**1. Strings (Key-Value):**
- Basic caching with `SET`, `GET`, `SETEX`
- Used for balance caching
- Always use `SETEX` (with expiration) to prevent memory leaks

**2. Hashes (Objects):**
- Created `src/cache/profile-cache.ts`
- Used `HSET`, `HGETALL` for user profiles
- Store multiple fields under one key
- Update individual fields without rewriting entire object
- **Performance:** 108x faster on cache hit! 🚀

**3. Lists (Ordered Collections):**
- Created `src/cache/activity-cache.ts`
- Used `LPUSH`, `LRANGE`, `LTRIM` for recent transactions
- Newest items first (LPUSH adds to left/beginning)
- Auto-trim to keep only last 100 items
- 7-day expiration on entire list

**Key insight on Lists:**
- Good for immutable data (transaction history, logs, chat messages)
- Not ideal for mutable data (order status, task completion)
- For mutable data: Use Redis Hashes or cache invalidation

**4. Pub/Sub (Real-Time Messaging):**
- Created `src/cache/publisher.ts` and `src/cache/subscriber.ts`
- Implemented TypeScript union type for event types: `'transaction' | 'balance' | 'block'`
- Channels created automatically on first publish/subscribe
- Separate Redis client for subscriber (protocol limitation)
- Tested with two terminals (publisher + subscriber)

#### Key Concepts Learned

**Redis vs PostgreSQL:**
| Feature | PostgreSQL | Redis |
|---------|-----------|-------|
| Storage | Disk (persistent) | RAM (volatile) |
| Speed | ~5-50ms | ~0.1-1ms (50-100x faster!) |
| Use for | Source of truth, complex queries | Cache, real-time notifications |
| Data loss | Never (ACID) | On restart (unless persistence enabled) |

**Caching Strategies:**
1. **Cache-Aside (Lazy Loading)** - Implemented ✅
   - Check cache → If miss, query DB → Store in cache
   - Pros: Only cache what's used, resilient
   - Cons: First request slow

2. **Write-Through** - Discussed
   - Update DB + cache simultaneously
   - Pros: Cache always fresh
   - Cons: Write latency

3. **Cache Invalidation** - Discussed
   - Delete cache key when data changes
   - Pros: Simple, ensures fresh data
   - Cons: Next read is slow

**TTL (Time To Live):**
- Always set expiration on cached data
- Prevents memory leaks
- Forces cache refresh for fresh data
- Expiration is KEY-level (not item-level in lists/hashes)

**Pub/Sub Pattern:**
- Publisher sends messages to channel
- Subscribers receive messages in real-time
- No polling needed
- Separate client required (subscribed clients can only do pub/sub)

#### Performance Measurements

**Balance Cache Test:**
- First call (DB): ~50ms
- Second call (Redis): ~1ms
- **Speedup: 50x**

**Profile Cache Test:**
- First call (DB): ~108ms
- Second call (Redis): ~1ms
- **Speedup: 108x** 🚀

#### User Questions & Insights

**Excellent questions asked:**
1. **"What does `-it` parameter stand for? Internal tool?"**
   - Learned: `-i` (interactive) + `-t` (TTY)
   - Docker flag combination

2. **"We have `redis.ts` not `redis.js`, why import with `.js`?"**
   - Learned: TypeScript compiles `.ts` → `.js`, imports reference output files
   - TypeScript resolves `.js` imports to `.ts` source during development

3. **"Where do I create `src/cache`? In project or Redis container?"**
   - Confirmed: In FamilyChain project (Windows), not inside container
   - Architecture: Project code connects to containerized Redis

4. **"Why install `@types/pg` again? Already have `pg` installed."**
   - Learned: JavaScript vs TypeScript difference
   - `.js` files don't need types, `.ts` files do

5. **"Remind me of `...` syntax in JSON.stringify"**
   - Spread operator: Copies all properties from object
   - `{ ...data, timestamp }` = copy data + add timestamp

6. **"Is it a list of transactions or only one?"**
   - Clarified: LPUSH adds ONE item to a LIST
   - Multiple calls build the list

7. **"Does expiration expire the whole list or only a row?"**
   - KEY-level expiration (entire list deleted)
   - Can't expire individual items
   - Each `addRecentTransaction` resets expiration (extends life)

8. **"But this is only useful if the list is immutable... like order status would change"**
   - Excellent insight! ✅
   - Redis Lists best for immutable data
   - For mutable data: Use Hashes or cache invalidation

9. **"Maybe `eventType` could be a union type instead of string"**
   - Great suggestion! Implemented TypeScript union type
   - Prevents typos, enforces valid event types

10. **"How can I see the size of the database?"**
    - `INFO memory` for memory usage
    - `DBSIZE` for key count

### 🎓 Self-Assessment Results

**Score: 5/5 (100%) ✅**

**Q1: When should you use Redis instead of PostgreSQL?**
- User answer: "When we need speed... immutable data... loses everything on restart... can't handle complex queries"
- Clarified: Redis works for both mutable AND immutable (with proper invalidation)
- Final understanding: ✅ Speed, temporary OK, simple lookups

**Q2: Explain Cache-Aside pattern**
- User answer: "First try Redis, if miss go to PostgreSQL, then add to Redis"
- Perfect explanation! ✅

**Q3: Difference between SET and SETEX?**
- User answer: "SET just sets key, SETEX includes expiration"
- Correctly identified: Without expiration → memory leak ✅

**Q4: Why separate client for pub/sub?**
- User answer: "By design, can't publish and subscribe at same time"
- Clarified: Subscribed clients can ONLY do pub/sub (protocol limitation) ✅

**Q5: Good cache hit rate target?**
- User answer: "At least 50%"
- Refined: Industry standard 80-95% (user was conservative but understood concept) ✅

### 📂 Files Created

**Core Modules:**
- `src/cache/redis.ts` - Redis connection (with retry strategy)
- `src/db/connection.ts` - PostgreSQL connection pool
- `src/cache/balance-cache.ts` - Cache-Aside pattern for balances
- `src/cache/profile-cache.ts` - Redis Hashes for user profiles
- `src/cache/activity-cache.ts` - Redis Lists for recent transactions
- `src/cache/publisher.ts` - Pub/Sub publisher (with TypeScript union type)
- `src/cache/subscriber.ts` - Pub/Sub subscriber (separate client)

**Test Files:**
- `src/cache/test-redis.ts` - Basic Redis connection test
- `src/db/test-connection.ts` - PostgreSQL connection test
- `src/cache/test-caching.ts` - Cache-Aside pattern demonstration
- `src/cache/test-profiles.ts` - Profile cache with timing (108x speedup!)
- `src/cache/test-activity.ts` - Redis Lists demonstration
- `src/cache/test-publisher.ts` - Pub/Sub publisher test

**Docker:**
- Redis container: `redis-familychain` (running on port 6379)

**Dependencies Added:**
- `ioredis` - Redis client for Node.js
- `@types/pg` - TypeScript definitions for pg library

### 💡 Key Learnings

**Technical:**
1. **Docker is superior for Redis** - Consistent, isolated, easy cleanup
2. **Cache-Aside = most common pattern** - Check cache → DB on miss → populate cache
3. **Always use SETEX for caches** - Prevents memory leaks and stale data
4. **TTL is key-level** - Expires entire key (list, hash, string), not individual items
5. **Pub/Sub needs separate client** - Subscribed clients enter special mode
6. **Spread operator (`...`)** - Copies object properties efficiently
7. **TypeScript imports use `.js`** - References output files, not source files
8. **Redis Lists for immutable data** - Transaction history, logs (not order status)
9. **Redis Hashes for objects** - Update individual fields, memory efficient

**Architectural:**
1. **Redis + PostgreSQL together** - PostgreSQL = truth, Redis = speed layer
2. **Cache hit rate target: 80-95%** - Below 50% means cache not helping
3. **Union types for event types** - Type safety, prevents typos
4. **Channels auto-created** - No setup needed for pub/sub
5. **In-memory = 50-100x faster** - Measured real performance gains

**Performance:**
- Balance cache: 50x faster
- Profile cache: 108x faster
- Response time: 50ms → 1ms

### 🔄 Next Steps

**Class 4.3: Data Modeling for Financial Systems**
- Design schema for on-chain + off-chain data
- Handle money with precision (NUMERIC types)
- Transaction history patterns
- Audit logging for financial systems
- Relating blockchain transactions to database records

**Preparation:**
- Review `docs/week4-class4.3-data-modeling.md`
- Think about: "What data lives on-chain vs off-chain?"

### 📊 Progress Tracking

**Week 4 Status:**
- ✅ Class 4.1: PostgreSQL Setup and Schema Design (COMPLETE)
- ✅ Class 4.2: Redis Configuration and Caching Patterns (COMPLETE)
- 🔜 Class 4.3: Data Modeling for Financial Systems
- 🔜 Class 4.4: Database Security and Encryption

**Overall Course Progress:**
- Week 1: ✅ Complete (3 classes)
- Week 2: ✅ Complete (3 classes)
- Week 3: ✅ Complete (4 classes)
- Week 4: 🔄 In Progress (2/4 classes complete)

---

**Session End:** 2025-01-05
**Next Session:** Class 4.3 - Data Modeling for Financial Systems
