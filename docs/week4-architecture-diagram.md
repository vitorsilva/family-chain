# Week 4: Database & Caching Architecture - Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                Week 4: Database & Caching Architecture                 │
│         (PostgreSQL 18 + Redis + TypeScript Integration)              │
└───────────────────────────────────────────────────────────────────────┘

        Your TypeScript Application (Node.js)
        ┌───────────────────────────────────────────────────────────┐
        │  Scripts (scripts/week4/)                                 │
        │  • db-test.js - Connection testing                        │
        │  • db-transfer.js - Application-level transactions        │
        │  • db-transfer-sp.js - Stored procedure calls             │
        │  • test-gdpr-export.ts - GDPR compliance                  │
        │  • backup-database.ps1 - Automated backups                │
        │                                                            │
        │  Modules (src/)                                            │
        │  • db/connection.ts - Connection pools (3 roles)          │
        │  • db/transactions.ts - Double-entry bookkeeping          │
        │  • cache/redis.ts - Redis connection                      │
        │  • cache/balance-cache.ts - Cache-Aside pattern           │
        │  • cache/profile-cache.ts - Redis Hashes                  │
        │  • cache/activity-cache.ts - Redis Lists                  │
        │  • cache/publisher.ts - Pub/Sub publisher                 │
        │  • cache/subscriber.ts - Pub/Sub subscriber               │
        │  • utils/encryption.ts - AES-256-GCM encryption           │
        └────────────┬──────────────────────────────┬───────────────┘
                     │                              │
                     │ uses (3 connection pools)    │ uses
                     ↓                              ↓
┌─────────────────────────────────────┐  ┌──────────────────────────────┐
│  PostgreSQL 18.x                    │  │  Redis (Docker Container)    │
│  (Persistent, Disk-based)           │  │  (In-memory, Volatile)       │
│                                      │  │                              │
│  Connection Pools:                  │  │  Port: 6379                  │
│  ┌────────────────────────────────┐ │  │  Container: redis-familychain│
│  │ api_service (app_readwrite)    │ │  │                              │
│  │ • SELECT, INSERT, UPDATE,      │ │  │  Data Structures:            │
│  │   DELETE                        │ │  │  • Strings (Key-Value)       │
│  │ • Normal operations             │ │  │  • Hashes (Objects)          │
│  │ • Port: 5432                    │ │  │  • Lists (Ordered)           │
│  └────────────────────────────────┘ │  │  • Pub/Sub (Messaging)       │
│  ┌────────────────────────────────┐ │  │                              │
│  │ migration_service (app_admin)  │ │  │  Caching Strategies:         │
│  │ • ALL PRIVILEGES               │ │  │  • Cache-Aside (Lazy Load)   │
│  │ • CREATE TABLE, DROP, DDL      │ │  │  • TTL: 60s-300s             │
│  │ • Test setup/teardown          │ │  │  • Memory management         │
│  └────────────────────────────────┘ │  │                              │
│  ┌────────────────────────────────┐ │  │  Performance:                │
│  │ analytics_service (app_readonly│ │  │  • 50-108x faster than       │
│  │ • SELECT only                  │ │  │    PostgreSQL                │
│  │ • Reports, analytics           │ │  │  • ~1ms vs ~50-100ms         │
│  │ • No write access              │ │  └──────────────────────────────┘
│  └────────────────────────────────┘ │
│                                      │
│  Database: familychain               │
│  ┌────────────────────────────────┐ │
│  │ Tables (9):                    │ │
│  │ • family_members (user data)   │ │
│  │ • accounts (balances)          │ │
│  │ • transactions (immutable)     │ │
│  │ • ledger_entries (double-entry)│ │
│  │ • audit_log (JSONB tracking)   │ │
│  │ • blockchain_transactions      │ │
│  │ • exchange_rates               │ │
│  │ • +2 more                      │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ Stored Procedures:             │ │
│  │ • create_transfer_transaction()│ │
│  │   - 55% faster than app-level  │ │
│  │   - Single DB call             │ │
│  │   - Implicit transactions      │ │
│  │ • transfer_funds()             │ │
│  │ • audit_trigger_func()         │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ Triggers:                      │ │
│  │ • audit_accounts               │ │
│  │ • audit_transactions           │ │
│  │   - Captures INSERT/UPDATE/    │ │
│  │     DELETE                      │ │
│  │   - Stores old/new values      │ │
│  │     as JSONB                    │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ Indexes (8 for performance):   │ │
│  │ • idx_transactions_account_id  │ │
│  │ • idx_ledger_entries_tx_id     │ │
│  │ • idx_blockchain_tx_hash       │ │
│  │ • +5 more                      │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘

                  Data Flow Patterns

1. CACHE-ASIDE PATTERN (Balance Query):
   Application → Check Redis Cache
   ├─ Cache HIT: Return balance (1ms) ✅ 50x faster
   └─ Cache MISS:
      → Query PostgreSQL (50ms)
      → Store in Redis with 60s TTL
      → Return balance

2. WRITE-THROUGH PATTERN (Balance Update):
   Application → Update PostgreSQL (source of truth)
   → Invalidate Redis cache key
   → Next read will repopulate cache

3. DOUBLE-ENTRY BOOKKEEPING (Transfer):
   Application → createTransferSP()
   → PostgreSQL: create_transfer_transaction()
      ├─ BEGIN (implicit)
      ├─ Lock sender/receiver accounts (FOR UPDATE)
      ├─ Check sufficient balance
      ├─ INSERT transaction record
      ├─ INSERT debit ledger_entry (sender: money out)
      ├─ INSERT credit ledger_entry (receiver: money in)
      ├─ UPDATE sender balance (subtract)
      ├─ UPDATE receiver balance (add)
      └─ COMMIT (implicit)
   → Returns: transaction_id
   → Performance: 1ms per transfer (100 transfers = 100ms)

4. PUB/SUB PATTERN (Real-Time Notifications):
   Publisher → Redis channel ("transaction", "balance", "block")
   → Subscribers receive event immediately
   → Separate Redis client required (protocol limitation)
   → No polling needed

5. BLOCKCHAIN LINKING (On-chain + Off-chain):
   Application → linkBlockchainTransaction()
   ├─ Fetch tx from Sepolia via Alchemy
   ├─ Verify sender/receiver are family members
   ├─ INSERT into blockchain_transactions
   │  • tx_hash (0x8532...)
   │  • block_number (9,531,070)
   │  • amount_wei (1000000000000000 = 0.001 ETH)
   │  • gas_used
   │  • confirmations (68,451+)
   └─ INSERT into transactions (internal record)
      • Links to blockchain_transactions
      • Includes family context

6. GDPR EXPORT (Right to Portability):
   Application → exportUserData(user_id)
   → PostgreSQL:
      ├─ SELECT from family_members (decrypt IBAN, NIF)
      ├─ SELECT all accounts
      ├─ SELECT all transactions (sender OR receiver)
      └─ SELECT audit_log entries
   → Compile into JSON with metadata
   → Return complete user data package

7. GDPR ERASURE (Right to Be Forgotten):
   Application → anonymizeUser(user_id)
   → PostgreSQL:
      ├─ UPDATE family_members
      │  SET name = 'Deleted User 123'
      │      email = NULL
      │      iban_encrypted = NULL
      │      nif_encrypted = NULL
      ├─ Preserve transactions (audit trail requirement)
      └─ Cannot use ON DELETE CASCADE (financial data)

               Security & Encryption Architecture

┌───────────────────────────────────────────────────────────────────┐
│  Encryption Layer (src/utils/encryption.ts)                       │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  AES-256-GCM (Authenticated Encryption)                      │ │
│  │  • Algorithm: AES-256-GCM                                    │ │
│  │  • Key: 256-bit (from ENCRYPTION_KEY env var)               │ │
│  │  • IV: Random 16 bytes per encryption                       │ │
│  │  • Auth Tag: Detects tampering                              │ │
│  │  • Format: iv:encrypted:authTag (base64)                    │ │
│  │                                                              │ │
│  │  Functions:                                                  │ │
│  │  • encrypt(plaintext) → encrypted string                    │ │
│  │  • decrypt(encrypted) → plaintext                           │ │
│  │  • hashPassword(password) → bcrypt hash                     │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Encrypted Fields:                                                │
│  • family_members.iban_encrypted (banking IBAN)                  │
│  • family_members.nif_encrypted (tax ID)                         │
│  • NOT encrypted: email, name, wallet_address (public)           │
│                                                                    │
│  Why AES-256-GCM?                                                 │
│  • GCM = Galois/Counter Mode                                     │
│  • Authenticated encryption (integrity + confidentiality)        │
│  • Detects tampering (auth tag verification)                    │
│  • CBC vulnerable to padding oracle attacks                     │
└────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│  Role-Based Access Control (RBAC) - Principle of Least Privilege │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  app_readonly (analytics_service)                           │ │
│  │  • SELECT only                                              │ │
│  │  • Can view all data                                        │ │
│  │  • Cannot write (INSERT/UPDATE/DELETE)                      │ │
│  │  • Cannot do DDL (CREATE/DROP)                              │ │
│  │  • Use case: Reports, dashboards                            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  app_readwrite (api_service)                                │ │
│  │  • SELECT, INSERT, UPDATE, DELETE                           │ │
│  │  • Normal application operations                            │ │
│  │  • Cannot do DDL (CREATE/DROP)                              │ │
│  │  • Use case: API endpoints, transfers                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  app_admin (migration_service)                              │ │
│  │  • ALL PRIVILEGES                                           │ │
│  │  • CREATE TABLE, DROP, ALTER                                │ │
│  │  • Schema migrations                                         │ │
│  │  • Use case: Deployments, test setup                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Security Principle:                                              │
│  • Separate pools for separate roles                             │
│  • Compromised API ≠ full database access                        │
│  • Limits blast radius of security breach                        │
└────────────────────────────────────────────────────────────────────┘

               Financial Data Modeling Principles

┌───────────────────────────────────────────────────────────────────┐
│  1. NUMERIC TYPES (Never use FLOAT for money!)                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Why FLOAT fails:                                           │ │
│  │  • 0.1 + 0.2 = 0.30000000000000004 (binary fractions)      │ │
│  │  • 1000 operations = lose ~$0.17                            │ │
│  │  • Accumulating rounding errors                             │ │
│  │                                                              │ │
│  │  Use NUMERIC instead:                                       │ │
│  │  • NUMERIC(28, 18) for ETH (18 decimals)                   │ │
│  │  • NUMERIC(20, 8) for general money                        │ │
│  │  • Exact decimal arithmetic                                │ │
│  │  • No rounding errors                                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│  2. DOUBLE-ENTRY BOOKKEEPING (Self-auditing system)              │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Every transfer creates 2 ledger entries:                   │ │
│  │                                                              │ │
│  │  Transfer: Alice → Bob, 0.001 ETH                           │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │ Ledger Entry 1 (Debit - Alice)                         │ │ │
│  │  │ • entry_type: 'debit' (money OUT)                      │ │ │
│  │  │ • account_id: Alice's account                          │ │ │
│  │  │ • amount: 0.001                                        │ │ │
│  │  │ • balance_before: 0.80                                 │ │ │
│  │  │ • balance_after: 0.799                                 │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │ Ledger Entry 2 (Credit - Bob)                          │ │ │
│  │  │ • entry_type: 'credit' (money IN)                      │ │ │
│  │  │ • account_id: Bob's account                            │ │ │
│  │  │ • amount: 0.001                                        │ │ │
│  │  │ • balance_before: 0.00                                 │ │ │
│  │  │ • balance_after: 0.001                                 │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                                                              │ │
│  │  Verification:                                              │ │
│  │  SUM(debits) = SUM(credits) = 0 (self-auditing)            │ │
│  │  Complete audit trail (see both sides)                     │ │
│  │  Required for regulatory compliance                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│  3. IMMUTABILITY (Never delete transactions!)                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Problem: Accidentally sent +10 ETH                         │ │
│  │  ❌ WRONG: DELETE or UPDATE transaction                     │ │
│  │  ✅ CORRECT: Create reversing transaction                   │ │
│  │                                                              │ │
│  │  Original:   +10 ETH (tx_id: 1, reversed_by: 2)            │ │
│  │  Reversal:   -10 ETH (tx_id: 2)                            │ │
│  │                                                              │ │
│  │  Result: Complete history preserved (audit requirement)     │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│  4. ROW LOCKING (Prevent race conditions)                         │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  SELECT ... FOR UPDATE                                      │ │
│  │  • Locks row until COMMIT                                   │ │
│  │  • Prevents TOCTOU (Time-Of-Check to Time-Of-Use)          │ │
│  │  • Lock held for ~1-5ms                                     │ │
│  │                                                              │ │
│  │  Example:                                                    │ │
│  │  Thread A: SELECT balance ... FOR UPDATE (balance = $100)  │ │
│  │  Thread B: SELECT balance ... FOR UPDATE (WAITS)           │ │
│  │  Thread A: UPDATE balance = $50 (transfer $50)             │ │
│  │  Thread A: COMMIT (releases lock)                           │ │
│  │  Thread B: Gets lock, sees updated balance ($50)           │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

               Performance Measurements

┌───────────────────────────────────────────────────────────────────┐
│  Redis Cache Performance:                                         │
│  • Balance cache: 50x faster (50ms → 1ms)                        │
│  • Profile cache: 108x faster (108ms → 1ms)                      │
│  • Cache hit rate target: 80-95%                                 │
│                                                                    │
│  Stored Procedure Performance:                                    │
│  • Application-level: 222ms for 100 transfers (2.22ms each)     │
│  • Stored procedure: 100ms for 100 transfers (1.00ms each)      │
│  • 55% faster with stored procedures! 🚀                         │
│                                                                    │
│  PostgreSQL vs Redis:                                             │
│  • PostgreSQL: 5-50ms (disk-based, persistent)                   │
│  • Redis: 0.1-1ms (in-memory, volatile)                          │
│  • Use PostgreSQL for: Source of truth, complex queries          │
│  • Use Redis for: Cache, real-time notifications                 │
└────────────────────────────────────────────────────────────────────┘

            Configuration & Credentials (.env)

┌───────────────────────────────────────────────────────────────────┐
│  Database Credentials (NOT committed to git!)                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  DB_USER=postgres                                           │ │
│  │  DB_PASSWORD=[your password]                                │ │
│  │  DB_HOST=localhost                                          │ │
│  │  DB_PORT=5432                                               │ │
│  │  DB_NAME=familychain                                        │ │
│  │                                                              │ │
│  │  DB_ADMIN_USER=migration_service                            │ │
│  │  DB_ADMIN_PASSWORD=[password]                               │ │
│  │                                                              │ │
│  │  DB_READONLY_USER=analytics_service                         │ │
│  │  DB_READONLY_PASSWORD=[password]                            │ │
│  │                                                              │ │
│  │  ENCRYPTION_KEY=[32-byte base64 key]                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

                    Key Concepts Learned

• PostgreSQL = Source of truth (persistent, ACID guarantees)
• Redis = Speed layer (50-108x faster, in-memory)
• NUMERIC types mandatory for financial data (no FLOAT!)
• Double-entry bookkeeping = self-auditing system
• Immutability = never delete transactions, create reversals
• Row locking (FOR UPDATE) = prevents race conditions
• Stored procedures = 55% faster (1 network call vs 8+)
• AES-256-GCM = authenticated encryption (integrity + confidentiality)
• RBAC = least privilege (separate pools for separate roles)
• TTL = prevents memory leaks and stale data
• JSONB = flexible audit logs (works for any table)
• Cache-Aside = most common caching pattern (lazy loading)
• Pub/Sub = real-time messaging (separate client required)
• ON DELETE RESTRICT > CASCADE (for financial data)
• GDPR compliance = anonymization (not deletion) for financial records

                    Testing Coverage

Unit Tests (16):
• encryption.test.ts
  - Encryption/decryption
  - Tampering detection
  - Empty string handling
  - Null handling
  - Password hashing

Integration Tests (46):
• gdpr.test.ts (14 tests)
  - Right to Portability (export)
  - Right to Erasure (anonymization)
  - Idempotency
  - Data verification

• transactions.test.ts (18 tests)
  - Double-entry bookkeeping
  - Ledger entry validation
  - Balance reconciliation
  - Insufficient funds handling
  - Concurrent transfers

• rbac.test.ts (14 tests)
  - Readonly permissions
  - Readwrite permissions
  - Admin permissions
  - Denied operations

Total: 62 tests, 100% pass rate ✅

                Real-World Integration

Linked Real Sepolia Transaction:
• TX Hash: 0x85324acc9e53f71dc1649839db5b33e620eadbdb295f5cc949443c7f084042fa
• From: Alice Johnson (0xB09b...5736)
• To: Bob Johnson (0x310a...C30B5)
• Amount: 0.001 ETH
• Block: 9,531,070
• Confirmations: 68,451+ (extremely secure!)
• Stored in both blockchain_transactions AND transactions tables
• Complete audit trail: blockchain proof + family context
```
