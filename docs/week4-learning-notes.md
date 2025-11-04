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
