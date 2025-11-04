# Week 4 - Class 4.4: Database Security and Encryption

## 📋 Overview

**Duration:** 3-4 hours
**Prerequisites:** Classes 4.1-4.3 completed (PostgreSQL, Redis, Data Modeling)
**Why This Matters:** Your database contains **highly sensitive financial data**: bank IBANs, wallet private keys (later), personal information, transaction history. A single security breach could expose this data, violating GDPR, losing user trust, and potentially leading to financial theft. Security isn't optional - it's foundational.

In this class, you'll learn how to encrypt sensitive data at rest, implement database access control, configure secure connections, set up backup strategies, and follow security best practices for financial applications.

---

## 🎯 Learning Objectives

By the end of this class, you will be able to:

1. **Encrypt sensitive data** using Node.js crypto module (AES-256-GCM)
2. **Implement database role-based access control** (RBAC)
3. **Configure secure PostgreSQL connections** (SSL/TLS)
4. **Handle encryption keys securely** (environment variables, key rotation)
5. **Set up automated database backups** (pg_dump, point-in-time recovery)
6. **Implement connection pooling security** (max connections, timeouts)
7. **Follow GDPR compliance patterns** (data minimization, right to be forgotten)

---

## 🔑 Key Concepts

### Data Encryption: At Rest vs In Transit

**Encryption at rest:** Data stored on disk is encrypted
**Encryption in transit:** Data transmitted over network is encrypted

```
┌──────────────┐                    ┌──────────────┐
│  Application │  ← In Transit →    │  PostgreSQL  │
│              │    (SSL/TLS)       │              │
└──────────────┘                    └──────────────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │     Disk     │
                                    │  (At Rest)   │
                                    └──────────────┘
```

**What needs encryption:**

| Data Type | Encryption Needed | Why |
|-----------|------------------|-----|
| **IBANs, Bank Account Numbers** | ✅ Yes | PSD2 compliance, financial fraud risk |
| **NIFs (Tax IDs)** | ✅ Yes | GDPR, identity theft risk |
| **Email Addresses** | ⚠️  Maybe | GDPR, depends on sensitivity |
| **Names** | ❌ Usually No | Low sensitivity (public in many contexts) |
| **Transaction Amounts** | ❌ No | Need to query/aggregate (can't encrypt) |
| **Wallet Private Keys** | ✅ YES! | Critical - loss = permanent fund loss |

### Symmetric Encryption (AES-256-GCM)

**Symmetric** = Same key for encryption and decryption

**Algorithm:** AES-256-GCM
- **AES:** Advanced Encryption Standard
- **256:** 256-bit key length (very secure)
- **GCM:** Galois/Counter Mode (authenticated encryption)

**Encryption flow:**

```javascript
// Encrypt
plaintext + key → algorithm → ciphertext + authTag

// Decrypt
ciphertext + key + authTag → algorithm → plaintext
```

**Key properties:**
- **Key size:** 32 bytes (256 bits)
- **IV (Initialization Vector):** 16 bytes (random for each encryption)
- **Auth Tag:** 16 bytes (verifies data integrity)

**Q: Why use GCM mode instead of CBC or ECB?**

<details>
<summary>Think about it first</summary>

**GCM (Galois/Counter Mode):**
- ✅ **Authenticated encryption:** Detects tampering
- ✅ **Parallelizable:** Faster than CBC
- ✅ **Secure:** Resistant to padding oracle attacks
- ✅ **Standard:** Recommended by NIST

**CBC (Cipher Block Chaining):**
- ❌ No authentication (need separate HMAC)
- ❌ Vulnerable to padding oracle attacks
- ❌ Sequential (can't parallelize)

**ECB (Electronic Codebook):**
- ❌ NOT SECURE - same plaintext = same ciphertext
- ❌ Patterns visible in encrypted data
- ❌ Never use for real data

**Best practice:** Always use GCM for symmetric encryption.

</details>

### Key Management

**Storage options for encryption keys:**

| Option | Security | Convenience | Use Case |
|--------|----------|-------------|----------|
| **Environment Variables** | Medium | High | Development, small apps |
| **Hardhat Keystore** | High | Medium | Blockchain private keys |
| **AWS KMS / Azure Key Vault** | Very High | Medium | Production, enterprise |
| **Hardware Security Module (HSM)** | Highest | Low | Banking, critical infrastructure |
| **Hardcoded in Code** | ❌ NEVER | High | NEVER DO THIS |

**Environment variable pattern:**

```javascript
// .env file (NEVER commit this!)
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
DATABASE_URL=postgresql://user:pass@localhost:5432/familychain
```

```javascript
// config.js
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
}

module.exports = { ENCRYPTION_KEY };
```

**Key rotation:**
When you need to change encryption keys (annually or after breach):

1. Generate new key
2. Decrypt all data with old key
3. Re-encrypt all data with new key
4. Update environment variable
5. Destroy old key

### Database Access Control (RBAC)

**Principle of Least Privilege:** Give each user/service only the permissions they need.

**PostgreSQL roles:**

```sql
-- Create read-only role
CREATE ROLE app_readonly;
GRANT CONNECT ON DATABASE familychain TO app_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;

-- Create read-write role (no DELETE)
CREATE ROLE app_readwrite;
GRANT CONNECT ON DATABASE familychain TO app_readwrite;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_readwrite;

-- Create admin role (full access)
CREATE ROLE app_admin;
GRANT ALL PRIVILEGES ON DATABASE familychain TO app_admin;

-- Create user with read-only access
CREATE USER analytics_service WITH PASSWORD 'strong_password';
GRANT app_readonly TO analytics_service;
```

**Use case examples:**

| Service | Role | Why |
|---------|------|-----|
| **API Gateway** | app_readwrite | Needs to insert/update, but not delete |
| **Analytics Dashboard** | app_readonly | Only needs to read data |
| **Database Admin** | app_admin | Needs full access for maintenance |
| **Backup Service** | app_readonly | Only needs to read for backups |

### SQL Injection Prevention

**Always use parameterized queries - NEVER string concatenation.**

```javascript
// ❌ VULNERABLE TO SQL INJECTION
const email = "'; DROP TABLE users; --";
const query = `SELECT * FROM users WHERE email = '${email}'`;
await db.query(query);
// Executes: SELECT * FROM users WHERE email = ''; DROP TABLE users; --'

// ✅ SAFE - Parameterized query
const email = "'; DROP TABLE users; --";
await db.query('SELECT * FROM users WHERE email = $1', [email]);
// PostgreSQL treats entire string as data, not SQL
```

**Additional protections:**

1. **Input validation:**
```javascript
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  return email;
}
```

2. **Prepared statements** (cache query plans):
```javascript
const query = {
  name: 'fetch-user',
  text: 'SELECT * FROM users WHERE email = $1',
  values: [email]
};
await db.query(query);
```

### Backup Strategies

**3-2-1 Backup Rule:**
- **3** copies of data
- **2** different storage media
- **1** offsite backup

**PostgreSQL backup methods:**

1. **Logical Backup (pg_dump):**
```bash
# Full database dump
pg_dump -U postgres familychain > backup.sql

# Compressed dump
pg_dump -U postgres -Fc familychain > backup.dump
```

2. **Physical Backup (pg_basebackup):**
```bash
# Full cluster backup
pg_basebackup -D /backup/postgres -Ft -z -P
```

3. **Point-in-Time Recovery (PITR):**
```bash
# Enable WAL archiving in postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
```

**Backup schedule:**
- **Full backup:** Weekly (Sundays)
- **Incremental backup:** Daily
- **WAL archiving:** Continuous
- **Retention:** 30 days

### GDPR Compliance Patterns

**Key GDPR requirements:**

1. **Data Minimization:** Only collect what you need
```sql
-- ❌ Bad: Collecting unnecessary data
CREATE TABLE users (
    full_name VARCHAR(100),
    date_of_birth DATE,
    mother_maiden_name VARCHAR(50),  -- Why do you need this?
    social_security_number VARCHAR(20) -- Extremely sensitive!
);

-- ✅ Good: Only essential data
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(42)
);
```

2. **Right to be Forgotten:**
```javascript
async function deleteUserData(userId) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Anonymize instead of delete (preserve referential integrity)
    await client.query(
      `UPDATE family_members
       SET name = 'Deleted User',
           email = CONCAT('deleted_', id, '@example.com'),
           wallet_address = NULL
       WHERE id = $1`,
      [userId]
    );

    // 2. Delete truly sensitive data
    await client.query('DELETE FROM audit_log WHERE changed_by = $1', [userId]);

    // 3. Keep financial records (legal requirement) but anonymized
    // Transactions remain, but tied to "Deleted User"

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

3. **Data Export (Portability):**
```javascript
async function exportUserData(userId) {
  const profile = await db.query(
    'SELECT * FROM family_members WHERE id = $1',
    [userId]
  );
  const accounts = await db.query(
    'SELECT * FROM accounts WHERE member_id = $1',
    [userId]
  );
  const transactions = await db.query(
    `SELECT t.* FROM transactions t
     JOIN accounts a ON t.from_account_id = a.id OR t.to_account_id = a.id
     WHERE a.member_id = $1`,
    [userId]
  );

  return {
    profile: profile.rows[0],
    accounts: accounts.rows,
    transactions: transactions.rows,
    exportedAt: new Date().toISOString(),
  };
}
```

---

## 🔨 Hands-On Activity

### Step 1: Implement Data Encryption

**Install dependencies:**

```powershell
npm install dotenv
```

**Create encryption utility:**

Create `src/utils/encryption.js`:

```javascript
const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const KEY_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;

// Load encryption key from environment
let ENCRYPTION_KEY;
try {
  ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  if (ENCRYPTION_KEY.length !== KEY_LENGTH) {
    throw new Error(`ENCRYPTION_KEY must be ${KEY_LENGTH} bytes`);
  }
} catch (err) {
  console.error('❌ ENCRYPTION_KEY not configured properly');
  throw err;
}

/**
 * Encrypt data
 * @param {string} plaintext - Data to encrypt
 * @returns {string} - Encrypted data (base64)
 */
function encrypt(plaintext) {
  if (!plaintext) return null;

  // Generate random IV for each encryption
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  // Encrypt
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  // Combine: iv + authTag + encrypted
  const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);

  // Return as base64
  return combined.toString('base64');
}

/**
 * Decrypt data
 * @param {string} encryptedData - Encrypted data (base64)
 * @returns {string} - Decrypted plaintext
 */
function decrypt(encryptedData) {
  if (!encryptedData) return null;

  // Decode from base64
  const combined = Buffer.from(encryptedData, 'base64');

  // Extract iv, authTag, encrypted
  const iv = combined.slice(0, IV_LENGTH);
  const authTag = combined.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.slice(IV_LENGTH + AUTH_TAG_LENGTH);

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Hash data (one-way, for passwords or unique identifiers)
 * @param {string} data - Data to hash
 * @returns {string} - SHA-256 hash (hex)
 */
function hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a random encryption key (for setup)
 * @returns {string} - 32-byte key (hex)
 */
function generateKey() {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

module.exports = {
  encrypt,
  decrypt,
  hash,
  generateKey,
};
```

**Generate encryption key:**

Create `scripts/generate-key.js`:

```javascript
const { generateKey } = require('../src/utils/encryption');

console.log('🔑 Generated Encryption Key:');
console.log(generateKey());
console.log('\n⚠️  Add this to your .env file:');
console.log(`ENCRYPTION_KEY=${generateKey()}`);
console.log('\n⚠️  NEVER commit this key to git!');
```

**Run key generation:**

```powershell
node scripts/generate-key.js
```

**Expected output:**
```
🔑 Generated Encryption Key:
0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

⚠️  Add this to your .env file:
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

⚠️  NEVER commit this key to git!
```

**Create .env file:**

```plaintext
# .env
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/familychain
REDIS_URL=redis://localhost:6379
```

**Add to .gitignore:**

```plaintext
# .gitignore
.env
.env.local
.env.*.local
```

**Test encryption:**

Create `src/utils/test-encryption.js`:

```javascript
require('dotenv').config();
const { encrypt, decrypt, hash } = require('./encryption');

function testEncryption() {
  console.log('=== Testing Encryption ===\n');

  // Test sensitive data
  const iban = 'PT50123456789012345678901';
  const nif = '123456789';

  console.log('Original IBAN:', iban);
  const encryptedIban = encrypt(iban);
  console.log('Encrypted IBAN:', encryptedIban);
  const decryptedIban = decrypt(encryptedIban);
  console.log('Decrypted IBAN:', decryptedIban);
  console.log('Match:', iban === decryptedIban ? '✅' : '❌');

  console.log('\nOriginal NIF:', nif);
  const encryptedNif = encrypt(nif);
  console.log('Encrypted NIF:', encryptedNif);
  const decryptedNif = decrypt(encryptedNif);
  console.log('Decrypted NIF:', decryptedNif);
  console.log('Match:', nif === decryptedNif ? '✅' : '❌');

  // Test hashing (one-way)
  console.log('\n=== Testing Hashing ===\n');
  const password = 'MySecurePassword123!';
  const hashed = hash(password);
  console.log('Password:', password);
  console.log('Hashed:', hashed);
  console.log('Hash length:', hashed.length, 'characters');
  console.log('Same hash:', hash(password) === hashed ? '✅' : '❌');

  // Encryption is different each time (random IV)
  console.log('\n=== Testing Random IV ===\n');
  const enc1 = encrypt('same data');
  const enc2 = encrypt('same data');
  console.log('Same plaintext, different ciphertext:');
  console.log('Encrypted 1:', enc1);
  console.log('Encrypted 2:', enc2);
  console.log('Different:', enc1 !== enc2 ? '✅' : '❌');
  console.log('Both decrypt correctly:', decrypt(enc1) === decrypt(enc2) ? '✅' : '❌');
}

testEncryption();
```

**Run encryption test:**

```powershell
node src/utils/test-encryption.js
```

**Expected output:**
```
=== Testing Encryption ===

Original IBAN: PT50123456789012345678901
Encrypted IBAN: kJ9x2fH... (base64 string)
Decrypted IBAN: PT50123456789012345678901
Match: ✅

Original NIF: 123456789
Encrypted NIF: pQ3w8zG... (base64 string)
Decrypted NIF: 123456789
Match: ✅

=== Testing Hashing ===

Password: MySecurePassword123!
Hashed: 5f4dcc3b5aa765d61d8327deb882cf99
Hash length: 64 characters
Same hash: ✅

=== Testing Random IV ===

Same plaintext, different ciphertext:
Encrypted 1: kJ9x2fH...
Encrypted 2: mN4v7bK...
Different: ✅
Both decrypt correctly: ✅
```

### Step 2: Add Encrypted Fields to Schema

**Update family_members table:**

```sql
-- Add encrypted fields
ALTER TABLE family_members
ADD COLUMN iban_encrypted TEXT,
ADD COLUMN nif_encrypted TEXT;

-- Add index for encrypted lookups (if needed)
CREATE INDEX idx_family_members_nif_encrypted ON family_members(nif_encrypted);
```

**Create helper functions:**

Create `src/db/secure-members.js`:

```javascript
require('dotenv').config();
const db = require('./connection');
const { encrypt, decrypt } = require('../utils/encryption');

/**
 * Create family member with encrypted sensitive data
 */
async function createSecureMember(name, email, walletAddress, role, iban, nif) {
  // Encrypt sensitive fields
  const ibanEncrypted = iban ? encrypt(iban) : null;
  const nifEncrypted = nif ? encrypt(nif) : null;

  const result = await db.query(
    `INSERT INTO family_members (name, email, wallet_address, role, iban_encrypted, nif_encrypted)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, role`,
    [name, email, walletAddress, role, ibanEncrypted, nifEncrypted]
  );

  return result.rows[0];
}

/**
 * Get family member with decrypted sensitive data
 */
async function getSecureMember(memberId) {
  const result = await db.query(
    'SELECT * FROM family_members WHERE id = $1',
    [memberId]
  );

  const member = result.rows[0];
  if (!member) return null;

  // Decrypt sensitive fields
  return {
    ...member,
    iban: member.iban_encrypted ? decrypt(member.iban_encrypted) : null,
    nif: member.nif_encrypted ? decrypt(member.nif_encrypted) : null,
    // Remove encrypted fields from response
    iban_encrypted: undefined,
    nif_encrypted: undefined,
  };
}

/**
 * Update sensitive data
 */
async function updateSensitiveData(memberId, iban, nif) {
  const ibanEncrypted = iban ? encrypt(iban) : null;
  const nifEncrypted = nif ? encrypt(nif) : null;

  await db.query(
    `UPDATE family_members
     SET iban_encrypted = $1, nif_encrypted = $2
     WHERE id = $3`,
    [ibanEncrypted, nifEncrypted, memberId]
  );
}

module.exports = {
  createSecureMember,
  getSecureMember,
  updateSensitiveData,
};
```

**Test secure storage:**

Create `src/db/test-secure-storage.js`:

```javascript
require('dotenv').config();
const { createSecureMember, getSecureMember } = require('./secure-members');

async function testSecureStorage() {
  try {
    console.log('=== Testing Secure Storage ===\n');

    // Create member with encrypted data
    console.log('1. Creating member with encrypted IBAN and NIF:');
    const member = await createSecureMember(
      'Elena Test',
      'elena@test.com',
      '0x9876543210abcdef9876543210abcdef98765432',
      'parent',
      'PT50123456789012345678901',  // IBAN
      '987654321'  // NIF
    );
    console.log('Created member:', member);

    // Retrieve and decrypt
    console.log('\n2. Retrieving member with decrypted data:');
    const retrieved = await getSecureMember(member.id);
    console.log('Retrieved member:', retrieved);

    console.log('\n✅ Secure storage test complete!');
    console.log('⚠️  Check PostgreSQL - IBAN and NIF should be encrypted in database');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testSecureStorage();
```

**Run the test:**

```powershell
node src/db/test-secure-storage.js
```

**Verify encryption in database:**

```sql
-- Check database - should see encrypted values
SELECT id, name, iban_encrypted, nif_encrypted
FROM family_members
WHERE name = 'Elena Test';
```

**Expected output:**
```
 id |    name    |         iban_encrypted          |         nif_encrypted
----+------------+---------------------------------+------------------------------
  5 | Elena Test | kJ9x2fHmN4v7bK... (base64)      | pQ3w8zG... (base64)
```

### Step 3: Implement Database Access Control

**Create roles:**

```sql
-- Connect as postgres superuser
\c familychain postgres

-- 1. Read-only role (for analytics)
CREATE ROLE app_readonly;
GRANT CONNECT ON DATABASE familychain TO app_readonly;
GRANT USAGE ON SCHEMA public TO app_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO app_readonly;

-- 2. Read-write role (for API)
CREATE ROLE app_readwrite;
GRANT CONNECT ON DATABASE familychain TO app_readwrite;
GRANT USAGE ON SCHEMA public TO app_readwrite;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_readwrite;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_readwrite;

-- 3. Admin role (for migrations)
CREATE ROLE app_admin;
GRANT ALL PRIVILEGES ON DATABASE familychain TO app_admin;

-- Create users for each role
CREATE USER api_service WITH PASSWORD 'StrongPassword123!';
GRANT app_readwrite TO api_service;

CREATE USER analytics_service WITH PASSWORD 'AnalyticsPass456!';
GRANT app_readonly TO analytics_service;

CREATE USER migration_service WITH PASSWORD 'MigrationPass789!';
GRANT app_admin TO migration_service;
```

**Test role permissions:**

```powershell
# Test read-only user
psql -U analytics_service -d familychain

# This should work
SELECT * FROM family_members;

# This should fail
INSERT INTO family_members (name, email, role) VALUES ('Test', 'test@test.com', 'child');
# ERROR: permission denied for table family_members
```

### Step 4: Configure Secure Connection Pooling

**Update connection file:**

Update `src/db/connection.js`:

```javascript
const { Pool } = require('pg');
require('dotenv').config();

// Parse DATABASE_URL or use individual params
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'familychain',
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: false,
    };

// Create pool with security settings
const pool = new Pool({
  ...connectionConfig,
  max: 20,                    // Maximum pool size
  idleTimeoutMillis: 30000,   // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Fail fast if can't connect
  statement_timeout: 30000,   // Kill queries after 30s
  query_timeout: 30000,       // Overall query timeout
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // In production, you might want to restart the process
  if (process.env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

// Log pool stats periodically (development only)
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    console.log('Pool stats:', {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
    });
  }, 60000); // Every minute
}

// Export query function
const query = (text, params) => pool.query(text, params);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing pool...');
  await pool.end();
  process.exit(0);
});

module.exports = {
  query,
  pool,
};
```

### Step 5: Implement Automated Backups

**Create backup script:**

Create `scripts/backup-database.sh`:

```bash
#!/bin/bash

# Configuration
DB_NAME="familychain"
DB_USER="postgres"
BACKUP_DIR="/backups/postgres"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup
echo "Starting backup of $DB_NAME..."
pg_dump -U "$DB_USER" -F c -b -v -f "$BACKUP_FILE" "$DB_NAME"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_FILE"

    # Compress backup
    gzip "$BACKUP_FILE"
    echo "Backup compressed: ${BACKUP_FILE}.gz"

    # Delete old backups
    find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "Old backups (>$RETENTION_DAYS days) deleted"
else
    echo "Backup failed!"
    exit 1
fi
```

**PowerShell version** (for Windows):

Create `scripts/backup-database.ps1`:

```powershell
# Configuration
$DB_NAME = "familychain"
$DB_USER = "postgres"
$BACKUP_DIR = "C:\backups\postgres"
$DATE = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\${DB_NAME}_${DATE}.sql"
$RETENTION_DAYS = 30

# Create backup directory
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR
}

# Perform backup
Write-Host "Starting backup of $DB_NAME..."
pg_dump -U $DB_USER -F c -b -v -f $BACKUP_FILE $DB_NAME

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup successful: $BACKUP_FILE"

    # Compress backup
    Compress-Archive -Path $BACKUP_FILE -DestinationPath "${BACKUP_FILE}.zip"
    Remove-Item $BACKUP_FILE
    Write-Host "Backup compressed: ${BACKUP_FILE}.zip"

    # Delete old backups
    Get-ChildItem -Path $BACKUP_DIR -Filter "${DB_NAME}_*.zip" |
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RETENTION_DAYS) } |
        Remove-Item
    Write-Host "Old backups (>$RETENTION_DAYS days) deleted"
} else {
    Write-Host "Backup failed!"
    exit 1
}
```

**Schedule backups (Windows Task Scheduler):**

```powershell
# Create scheduled task to run daily at 2 AM
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\path\to\FamilyChain\scripts\backup-database.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "2:00AM"
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "FamilyChain Database Backup" -Description "Daily backup of FamilyChain database"
```

**Test backup:**

```powershell
.\scripts\backup-database.ps1
```

### Step 6: Implement GDPR Data Export

Create `src/db/gdpr.js`:

```javascript
require('dotenv').config();
const db = require('./connection');
const { getSecureMember } = require('./secure-members');

/**
 * Export all user data (GDPR Right to Portability)
 */
async function exportUserData(memberId) {
  try {
    // 1. Get profile (with decrypted sensitive data)
    const profile = await getSecureMember(memberId);

    // 2. Get accounts
    const accounts = await db.query(
      'SELECT * FROM accounts WHERE member_id = $1',
      [memberId]
    );

    // 3. Get transactions
    const transactions = await db.query(
      `SELECT t.*, le.entry_type, le.balance_before, le.balance_after
       FROM transactions t
       LEFT JOIN ledger_entries le ON t.id = le.transaction_id
       WHERE t.from_account_id IN (SELECT id FROM accounts WHERE member_id = $1)
          OR t.to_account_id IN (SELECT id FROM accounts WHERE member_id = $1)
       ORDER BY t.created_at DESC`,
      [memberId]
    );

    // 4. Get audit logs
    const auditLogs = await db.query(
      'SELECT * FROM audit_log WHERE changed_by = $1 ORDER BY created_at DESC',
      [memberId]
    );

    return {
      exportedAt: new Date().toISOString(),
      profile: profile,
      accounts: accounts.rows,
      transactions: transactions.rows,
      auditLogs: auditLogs.rows,
      notice: 'This export contains all personal data stored in the FamilyChain system.',
    };
  } catch (err) {
    throw new Error(`Failed to export user data: ${err.message}`);
  }
}

/**
 * Anonymize user data (GDPR Right to be Forgotten)
 */
async function anonymizeUserData(memberId) {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Anonymize profile
    await client.query(
      `UPDATE family_members
       SET name = 'Deleted User ' || id,
           email = 'deleted_' || id || '@familychain.local',
           wallet_address = NULL,
           iban_encrypted = NULL,
           nif_encrypted = NULL
       WHERE id = $1`,
      [memberId]
    );

    // 2. Delete audit logs (personal activity)
    await client.query(
      'DELETE FROM audit_log WHERE changed_by = $1',
      [memberId]
    );

    // 3. Note: Keep financial transactions for legal compliance
    // (but they're now linked to "Deleted User")

    await client.query('COMMIT');

    return {
      success: true,
      message: 'User data anonymized successfully',
      note: 'Financial transactions preserved for legal compliance (anonymized)',
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  exportUserData,
  anonymizeUserData,
};
```

**Test GDPR functions:**

```javascript
const { exportUserData, anonymizeUserData } = require('./db/gdpr');

// Export user data
const exported = await exportUserData(1);
console.log(JSON.stringify(exported, null, 2));

// Save to file
const fs = require('fs');
fs.writeFileSync('user_data_export.json', JSON.stringify(exported, null, 2));
```

---

## ✅ Expected Outputs

After completing all steps:

1. **Encryption working** - IBAN and NIF encrypted in database
2. **Decryption working** - Can retrieve and decrypt sensitive data
3. **Database roles created** - Read-only, read-write, admin roles
4. **Secure connection pool** - Max connections, timeouts configured
5. **Backup script working** - Can create database backups
6. **GDPR export working** - Can export all user data to JSON
7. **GDPR anonymization working** - Can anonymize user data

---

## 📦 Deliverables

- [ ] `src/utils/encryption.js` with encrypt/decrypt functions
- [ ] `.env` file with ENCRYPTION_KEY (NOT committed to git)
- [ ] `.gitignore` updated to exclude .env
- [ ] `src/db/secure-members.js` with encrypted field handling
- [ ] PostgreSQL roles created (app_readonly, app_readwrite, app_admin)
- [ ] `scripts/backup-database.ps1` working
- [ ] `src/db/gdpr.js` with export/anonymize functions
- [ ] Screenshot of encrypted data in database
- [ ] Screenshot of GDPR export JSON

---

## ❓ Common Issues & Solutions

### Issue 1: "ENCRYPTION_KEY not configured"

**Cause:** .env file missing or ENCRYPTION_KEY invalid

**Solution:**
```powershell
# Generate new key
node scripts/generate-key.js

# Add to .env file
echo "ENCRYPTION_KEY=..." > .env

# Verify it loads
node -e "require('dotenv').config(); console.log(process.env.ENCRYPTION_KEY)"
```

### Issue 2: "Unsupported state or unable to authenticate data"

**Cause:** Trying to decrypt with wrong key or corrupted data

**Solution:**
```javascript
// Add error handling
function decrypt(encryptedData) {
  try {
    // ... existing decrypt code ...
  } catch (err) {
    throw new Error('Decryption failed - wrong key or corrupted data');
  }
}
```

### Issue 3: "Permission denied for table"

**Cause:** Database user doesn't have required permissions

**Solution:**
```sql
-- Grant missing permissions
GRANT SELECT, INSERT, UPDATE ON family_members TO api_service;
```

### Issue 4: "pg_dump: command not found"

**Cause:** PostgreSQL bin not in PATH

**Solution:**
```powershell
# Add to PATH
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"

# Or use full path in script
& "C:\Program Files\PostgreSQL\18\bin\pg_dump" ...
```

---

## ✅ Self-Assessment Quiz

### Question 1: Why use AES-256-GCM instead of AES-256-CBC?

<details>
<summary>Answer</summary>

**GCM provides authenticated encryption - it detects tampering.**

**GCM (Galois/Counter Mode):**
- ✅ **Authentication:** Produces auth tag that verifies data integrity
- ✅ **Detects tampering:** If data is modified, decryption fails
- ✅ **Parallelizable:** Faster than CBC
- ✅ **Recommended:** NIST standard for authenticated encryption

**CBC (Cipher Block Chaining):**
- ❌ **No authentication:** Can't detect if data was tampered with
- ❌ **Padding oracle attacks:** Vulnerable if not implemented carefully
- ❌ **Sequential:** Can't parallelize encryption/decryption

**Example of tampering detection:**
```javascript
const encrypted = encrypt('Send 100 ETH');
// Attacker modifies encrypted data
const tampered = encrypted.substring(0, encrypted.length - 5) + 'xxxxx';

// GCM detects tampering
decrypt(tampered); // Throws error: "unable to authenticate data"

// CBC would silently decrypt to garbage
```

</details>

### Question 2: What's the difference between encryption and hashing?

<details>
<summary>Answer</summary>

**Encryption is two-way (reversible), hashing is one-way (irreversible).**

| Feature | Encryption | Hashing |
|---------|-----------|---------|
| **Reversible** | ✅ Yes (with key) | ❌ No (one-way) |
| **Key Needed** | ✅ Yes | ❌ No |
| **Output Length** | Variable | Fixed (e.g., 64 chars for SHA-256) |
| **Use Case** | Store sensitive data | Store passwords, create unique IDs |

**Encryption:**
```javascript
const encrypted = encrypt('PT50123...'); // Store in database
const decrypted = decrypt(encrypted);    // Retrieve original value
// Use when you need the original data back
```

**Hashing:**
```javascript
const hashed = hash('MyPassword123');
// Can't get password back from hash
// Use for verification only:
const inputHash = hash(userInput);
if (inputHash === storedHash) {
  console.log('Password correct!');
}
```

**Rule of thumb:**
- **Encrypt:** Things you need to read later (IBANs, private keys)
- **Hash:** Things you only need to verify (passwords, checksums)

</details>

### Question 3: Why store encryption keys in environment variables?

<details>
<summary>Answer</summary>

**Environment variables keep secrets out of code and version control.**

**Problems with hardcoding:**
```javascript
// ❌ NEVER DO THIS
const ENCRYPTION_KEY = '0123456789abcdef...';
// Problems:
// 1. Visible in git history forever
// 2. Same key in dev, staging, production
// 3. Can't rotate without code change
// 4. Visible to anyone with code access
```

**Benefits of environment variables:**
```javascript
// ✅ CORRECT
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
// Benefits:
// 1. Not in git (in .env which is gitignored)
// 2. Different keys per environment
// 3. Easy to rotate (change .env, restart app)
// 4. Requires server access, not just code access
```

**Even better: Use dedicated secret management:**
- **AWS Secrets Manager**
- **Azure Key Vault**
- **HashiCorp Vault**
- **Hardhat Keystore** (for blockchain private keys)

</details>

### Question 4: What's the principle of least privilege?

<details>
<summary>Answer</summary>

**Give each user/service only the minimum permissions they need.**

**Bad (too much privilege):**
```sql
-- Analytics dashboard has FULL access
GRANT ALL PRIVILEGES ON DATABASE familychain TO analytics;
-- Problem: Analytics can delete all data!
```

**Good (least privilege):**
```sql
-- Analytics dashboard has read-only access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics;
-- Can only read data, can't modify anything
```

**Why it matters:**
- **Limits damage from breaches:** If analytics service is compromised, attacker can't delete data
- **Prevents mistakes:** Can't accidentally drop production table
- **Audit compliance:** Shows you follow security best practices
- **Defense in depth:** Multiple layers of protection

**Apply to:**
- **Database roles:** Read-only vs read-write vs admin
- **API endpoints:** User can only access their own data
- **File system:** App can only write to specific directories
- **Cloud IAM:** Each service has minimal AWS/Azure permissions

</details>

### Question 5: What's the 3-2-1 backup rule?

<details>
<summary>Answer</summary>

**3 copies, 2 different media, 1 offsite.**

**3 copies of data:**
- **Primary:** Production database
- **Backup 1:** Daily backup on server
- **Backup 2:** Weekly backup to external drive

**2 different storage media:**
- **Disk:** Primary database + daily backup
- **Cloud:** Weekly backup to AWS S3 / Azure Blob

**1 offsite backup:**
- **Offsite:** Cloud storage (survives datacenter fire/flood)

**Example setup for FamilyChain:**
```
┌─────────────────┐
│  Production DB  │ ← Primary
└────────┬────────┘
         │
         ├──→ Daily backup (local disk) ← Backup 1
         │
         └──→ Weekly backup (AWS S3)    ← Backup 2 + Offsite
```

**Recovery scenarios:**
- **Accidental DELETE:** Restore from daily backup (minutes old)
- **Disk failure:** Restore from weekly cloud backup (days old)
- **Datacenter destroyed:** Restore from offsite cloud backup (safe!)

</details>

---

## 🎯 Key Takeaways

1. **Always encrypt sensitive PII** (IBANs, NIFs, private keys)
2. **Use AES-256-GCM for symmetric encryption** (authenticated)
3. **NEVER commit encryption keys** to version control
4. **Implement least privilege** for database roles
5. **Always use parameterized queries** (prevent SQL injection)
6. **Automate backups** and test restoration regularly
7. **GDPR compliance requires** export and anonymization capabilities

---

## 🔜 Next Steps

**Week 4 Complete! 🎉**

In **Week 5: Smart Contract Foundations - Part 1**, you'll learn:
- Solidity basics and development tools
- Writing the FamilyWallet contract
- Testing smart contracts
- Deploying to testnet

**Preparation:**
- Ensure all Week 4 security measures are in place
- Review your database schema (we'll link it to smart contracts)
- Think about: "What family finance features need smart contracts vs traditional backend?"

---

## 📚 Reading References

**GDPR Compliance:**
- Official GDPR text: https://gdpr-info.eu/
- Data Protection principles: https://ico.org.uk/for-organisations/guide-to-data-protection/

**PostgreSQL Security:**
- Security Best Practices: https://www.postgresql.org/docs/current/sql-grant.html
- pg_dump Documentation: https://www.postgresql.org/docs/current/app-pgdump.html

**Node.js Crypto:**
- Crypto Module: https://nodejs.org/api/crypto.html
- AES-GCM Tutorial: https://nodejs.org/en/knowledge/cryptography/how-to-use-crypto-module/

---

## 🎓 Teaching Notes (for Claude Code)

**Interaction Style:**
- Emphasize security as foundational, not optional
- Show consequences of security failures (real breaches)
- Walk through encryption step-by-step (IV, cipher, auth tag)
- Test GDPR functions with user's own data

**Common Student Struggles:**
- **Concept:** Why encryption doesn't protect against SQL injection (different threats)
- **Technical:** Node.js crypto API complexity
- **Security:** Remembering to add .env to .gitignore (check this!)

**Pacing:**
- Step 1 (Encryption): 60-90 minutes (core security implementation)
- Step 2-3 (Schema, Roles): 30-45 minutes
- Step 4-5 (Pooling, Backups): 30-45 minutes
- Step 6 (GDPR): 30-45 minutes

**When to Probe Deeper:**
- If user suggests storing keys in code → Show git history risk
- If user uses CBC mode → Explain padding oracle attacks
- If user grants too many permissions → Discuss least privilege

**Reinforcement Questions:**
- "We just encrypted the IBAN. Can you verify it's actually encrypted in PostgreSQL?"
- "What would happen if we used the same IV for every encryption?"
- "How would you handle a situation where the encryption key is leaked?"

---

**Version:** 1.0
**Last Updated:** 2025-01-15
**Previous Class:** [Class 4.3 - Data Modeling for Financial Systems](week4-class4.3-data-modeling-financial-systems.md)
**Next Week:** [Week 5 - Smart Contract Foundations](../COURSE_PLAN.md#week-5)
