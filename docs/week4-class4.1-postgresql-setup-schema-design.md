# Week 4 - Class 4.1: PostgreSQL Setup and Schema Design

## 📋 Overview

**Duration:** 3-4 hours
**Prerequisites:** Week 1-3 completed, basic SQL knowledge helpful but not required
**Why This Matters:** PostgreSQL is the backbone of your family finance platform. It will store all critical data: family members, accounts, transactions, and allowance schedules. Learning proper schema design now prevents major problems later.

In this class, you'll install PostgreSQL, learn how to design a database schema for financial data, and create your first tables. By the end, you'll understand how to model complex relationships and set up a production-quality database.

---

## 🎯 Learning Objectives

By the end of this class, you will be able to:

1. **Install and configure PostgreSQL** on Windows with pgAdmin for database management
2. **Design a database schema** that models family members, accounts, and transactions
3. **Create tables with proper data types** including handling money with precision
4. **Define relationships** between tables using foreign keys
5. **Write basic SQL queries** to insert and retrieve data
6. **Connect to PostgreSQL from Node.js** using the `pg` library
7. **Understand constraints** (PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK)

---

## 🔑 Key Concepts

### What is PostgreSQL?

**PostgreSQL** (often called "Postgres") is a powerful, open-source **relational database management system (RDBMS)**. Think of it as:

- **A structured filing cabinet:** Everything has a specific place and relationships
- **ACID compliant:** Guarantees data integrity (Atomicity, Consistency, Isolation, Durability)
- **Battle-tested:** Used by companies like Apple, Spotify, Instagram for critical data

**Why PostgreSQL for FamilyChain?**
- ✅ **JSON support:** Store flexible data like transaction metadata
- ✅ **Strong data types:** Perfect for financial precision (NUMERIC for money)
- ✅ **ACID transactions:** Critical for financial systems
- ✅ **Open source:** No licensing costs
- ✅ **Great Node.js support:** The `pg` library is robust and well-maintained

### Database Schema Design

A **schema** is the blueprint of your database - it defines:
- **Tables:** Entities (family_members, accounts, transactions)
- **Columns:** Attributes (name, balance, amount)
- **Data Types:** How data is stored (TEXT, INTEGER, NUMERIC, TIMESTAMP)
- **Relationships:** How tables connect (foreign keys)
- **Constraints:** Rules that enforce data integrity

**FamilyChain Schema Overview:**

```
┌─────────────────┐
│ family_members  │
│ ─────────────── │
│ id (PK)         │
│ name            │
│ email           │
│ wallet_address  │
│ role            │
│ created_at      │
└─────────┬───────┘
          │
          │ 1:N (one-to-many)
          │
┌─────────▼───────┐         ┌─────────────────┐
│ accounts        │         │ transactions    │
│ ─────────────── │         │ ─────────────── │
│ id (PK)         │         │ id (PK)         │
│ member_id (FK)  │◄────────│ account_id (FK) │
│ account_type    │         │ tx_hash         │
│ balance         │         │ amount          │
│ currency        │         │ tx_type         │
│ created_at      │         │ created_at      │
└─────────────────┘         └─────────────────┘
```

**Relationships:**
- One family member can have **many accounts** (savings, checking, crypto wallet)
- One account can have **many transactions** (deposits, withdrawals)

### PostgreSQL Data Types for Financial Systems

| Data Type | Use Case | Example |
|-----------|----------|---------|
| **SERIAL** | Auto-incrementing ID | `id SERIAL PRIMARY KEY` |
| **VARCHAR(n)** | Text with max length | `name VARCHAR(100)` |
| **TEXT** | Unlimited text | `description TEXT` |
| **NUMERIC(p,s)** | Precise decimals (money!) | `NUMERIC(20,8)` = 20 digits, 8 after decimal |
| **TIMESTAMP** | Date + time | `created_at TIMESTAMP DEFAULT NOW()` |
| **BOOLEAN** | True/false | `is_active BOOLEAN DEFAULT true` |
| **JSONB** | JSON data (flexible) | `metadata JSONB` |

**⚠️ CRITICAL: Never use FLOAT or DOUBLE for money!**
```sql
-- ❌ WRONG: Rounding errors will lose money
balance FLOAT

-- ✅ CORRECT: Exact precision
balance NUMERIC(20, 8)  -- Up to 12 digits before decimal, 8 after
```

**Why NUMERIC(20, 8)?**
- **20 total digits:** Can store up to 999,999,999,999.99999999
- **8 decimal places:** Handles crypto precision (like wei for Ethereum)
- **No rounding errors:** Financial calculations stay exact

### Primary Keys and Foreign Keys

**Primary Key (PK):**
- **Uniquely identifies** each row in a table
- Cannot be NULL
- Usually an auto-incrementing integer (`SERIAL`)

```sql
CREATE TABLE family_members (
    id SERIAL PRIMARY KEY,  -- Auto-increments: 1, 2, 3, ...
    name VARCHAR(100) NOT NULL
);
```

**Foreign Key (FK):**
- **Links two tables** together
- References a primary key in another table
- Enforces referential integrity (can't reference a non-existent row)

```sql
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES family_members(id),  -- FK to family_members
    balance NUMERIC(20, 8) DEFAULT 0
);
```

**Referential Integrity Example:**
```sql
-- ✅ Valid: member_id 1 exists
INSERT INTO accounts (member_id, balance) VALUES (1, 100.50);

-- ❌ Error: member_id 999 doesn't exist
INSERT INTO accounts (member_id, balance) VALUES (999, 100.50);
-- ERROR: violates foreign key constraint
```

### Constraints

Constraints enforce data rules:

| Constraint | Purpose | Example |
|------------|---------|---------|
| **PRIMARY KEY** | Unique identifier | `id SERIAL PRIMARY KEY` |
| **FOREIGN KEY** | Link to another table | `REFERENCES family_members(id)` |
| **NOT NULL** | Field must have a value | `name VARCHAR(100) NOT NULL` |
| **UNIQUE** | No duplicates allowed | `email VARCHAR(255) UNIQUE` |
| **CHECK** | Custom validation | `CHECK (balance >= 0)` |
| **DEFAULT** | Default value if not provided | `created_at TIMESTAMP DEFAULT NOW()` |

---

## 🔨 Hands-On Activity

### Step 1: Install PostgreSQL on Windows

**Q: Why install PostgreSQL locally instead of using a cloud service?**

<details>
<summary>Think about it first, then expand</summary>

Learning with a local database gives you:
- Full control over configuration
- No costs or limits
- Works offline
- Better understanding of how databases work
- Production skills (you'll deploy to cloud later)

</details>

**Installation Commands:**

```powershell
# Download PostgreSQL installer from official website
# Visit: https://www.postgresql.org/download/windows/

# Run the installer (recommended version: PostgreSQL 16.x)
# During installation, note down your postgres user password!

# After installation, verify it's working:
psql --version

# Expected output:
# psql (PostgreSQL) 16.x
```

**Installation Steps (detailed):**

1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer
3. **Important settings:**
   - Port: `5432` (default)
   - Locale: `English, United States`
   - Password: Choose a strong password and **write it down**
4. Install pgAdmin 4 (included with installer)
5. Install Stack Builder components (optional, can skip for now)

**Verify Installation:**

```powershell
# Check PostgreSQL service is running
Get-Service -Name postgresql*

# Expected output:
# Status: Running

# Connect to PostgreSQL using psql
psql -U postgres

# You should see the PostgreSQL prompt:
# postgres=#
```

### Step 2: Create the FamilyChain Database

**Q: Why create a separate database instead of using the default postgres database?**

<details>
<summary>Think about it first</summary>

Separating projects into different databases:
- **Isolation:** Data from different projects don't mix
- **Security:** Different access controls per database
- **Organization:** Clear separation of concerns
- **Production best practice:** One database per application

</details>

**Using psql (command line):**

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE familychain;

# List databases to verify
\l

# Connect to the new database
\c familychain

# You should now see:
# familychain=#
```

**Using pgAdmin (GUI):**

1. Open pgAdmin 4
2. Right-click "Databases" → "Create" → "Database"
3. Database name: `familychain`
4. Owner: `postgres`
5. Click "Save"

### Step 3: Design the Schema

Before writing any SQL, let's plan our tables.

**Tables we need for Week 4:**

1. **family_members:** Who is in the family
2. **accounts:** Their financial accounts (crypto wallets, bank accounts)
3. **transactions:** All money movements

**Schema Design Document:**

```
TABLE: family_members
-------------------------------
id               SERIAL PRIMARY KEY
name             VARCHAR(100) NOT NULL
email            VARCHAR(255) UNIQUE NOT NULL
wallet_address   VARCHAR(42)
role             VARCHAR(20) CHECK (role IN ('parent', 'child', 'admin'))
created_at       TIMESTAMP DEFAULT NOW()

TABLE: accounts
-------------------------------
id               SERIAL PRIMARY KEY
member_id        INTEGER REFERENCES family_members(id) ON DELETE CASCADE
account_type     VARCHAR(50) NOT NULL
balance          NUMERIC(20, 8) DEFAULT 0
currency         VARCHAR(10) DEFAULT 'ETH'
created_at       TIMESTAMP DEFAULT NOW()

TABLE: transactions
-------------------------------
id               SERIAL PRIMARY KEY
account_id       INTEGER REFERENCES accounts(id) ON DELETE CASCADE
tx_hash          VARCHAR(66)
amount           NUMERIC(20, 8) NOT NULL
tx_type          VARCHAR(50) NOT NULL
description      TEXT
metadata         JSONB
created_at       TIMESTAMP DEFAULT NOW()
```

### Step 4: Create the Tables

**Create family_members table:**

```sql
CREATE TABLE family_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(42),
    role VARCHAR(20) CHECK (role IN ('parent', 'child', 'admin')),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Explanation:**
- `SERIAL PRIMARY KEY`: Auto-increment ID starting at 1
- `NOT NULL`: Name and email are required
- `UNIQUE`: Each email can only be used once
- `VARCHAR(42)`: Ethereum addresses are 42 characters (0x + 40 hex chars)
- `CHECK (role IN ...)`: Role must be one of these values
- `TIMESTAMP DEFAULT NOW()`: Automatically sets creation time

**Q: Why VARCHAR(42) for wallet_address instead of TEXT?**

<details>
<summary>Answer</summary>

Ethereum addresses are exactly 42 characters (e.g., `0x1234...abcd`). Using VARCHAR(42):
- **Enforces format:** Can't accidentally store invalid addresses
- **Better performance:** Fixed-length fields are faster to query
- **Clear intent:** Documents the expected data format
- **Index efficiency:** Smaller indexes = faster lookups

</details>

**Create accounts table:**

```sql
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES family_members(id) ON DELETE CASCADE,
    account_type VARCHAR(50) NOT NULL,
    balance NUMERIC(20, 8) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'ETH',
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Explanation:**
- `REFERENCES family_members(id)`: Foreign key to family_members
- `ON DELETE CASCADE`: If a family member is deleted, delete their accounts too
- `NUMERIC(20, 8)`: Precise decimal for balances
- `DEFAULT 0`: New accounts start with zero balance
- `DEFAULT 'ETH'`: Assume Ethereum unless specified

**Create transactions table:**

```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    tx_hash VARCHAR(66),
    amount NUMERIC(20, 8) NOT NULL,
    tx_type VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Explanation:**
- `tx_hash VARCHAR(66)`: Ethereum transaction hashes are 66 characters (0x + 64 hex)
- `JSONB`: Stores flexible JSON data (e.g., `{"gas_used": 21000, "from": "0x..."}`)
- `TEXT`: Unlimited length for descriptions
- `NOT NULL on amount and tx_type`: These are required fields

**Run all CREATE TABLE statements in psql:**

```powershell
# In psql (connected to familychain database)
familychain=# -- Paste the CREATE TABLE statements above

# Verify tables were created
\dt

# Expected output:
#             List of relations
# Schema |      Name       | Type  |  Owner
#--------+-----------------+-------+----------
# public | accounts        | table | postgres
# public | family_members  | table | postgres
# public | transactions    | table | postgres
```

### Step 5: Insert Sample Data

**Insert family members:**

```sql
INSERT INTO family_members (name, email, wallet_address, role)
VALUES
    ('Alice Parent', 'alice@family.com', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1', 'parent'),
    ('Bob Parent', 'bob@family.com', '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', 'parent'),
    ('Charlie Child', 'charlie@family.com', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', 'child');

-- Verify insertion
SELECT * FROM family_members;
```

**Expected output:**
```
 id |      name       |       email        |                wallet_address                | role   |         created_at
----+-----------------+--------------------+---------------------------------------------+--------+----------------------------
  1 | Alice Parent    | alice@family.com   | 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1 | parent | 2025-01-15 10:30:45.123456
  2 | Bob Parent      | bob@family.com     | 0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82 | parent | 2025-01-15 10:30:45.123456
  3 | Charlie Child   | charlie@family.com | 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984 | child  | 2025-01-15 10:30:45.123456
```

**Insert accounts:**

```sql
INSERT INTO accounts (member_id, account_type, balance, currency)
VALUES
    (1, 'ethereum_wallet', 2.5, 'ETH'),
    (2, 'ethereum_wallet', 1.75, 'ETH'),
    (3, 'allowance_wallet', 0.1, 'ETH');

-- Verify insertion
SELECT a.id, fm.name, a.account_type, a.balance, a.currency
FROM accounts a
JOIN family_members fm ON a.member_id = fm.id;
```

**Q: What does `JOIN` do in this query?**

<details>
<summary>Answer</summary>

`JOIN` combines data from two tables based on a relationship. Here:
- We're joining `accounts` with `family_members`
- `ON a.member_id = fm.id` means "match accounts to family members by ID"
- Result: We see account details along with the owner's name

Without JOIN, we'd only see `member_id` numbers, not names.

</details>

**Expected output:**
```
 id |      name      |   account_type    | balance | currency
----+----------------+-------------------+---------+----------
  1 | Alice Parent   | ethereum_wallet   | 2.50    | ETH
  2 | Bob Parent     | ethereum_wallet   | 1.75    | ETH
  3 | Charlie Child  | allowance_wallet  | 0.10    | ETH
```

**Insert transactions:**

```sql
INSERT INTO transactions (account_id, tx_hash, amount, tx_type, description, metadata)
VALUES
    (1, '0xabc123...', 1.0, 'deposit', 'Initial funding', '{"source": "coinbase"}'),
    (3, '0xdef456...', 0.1, 'allowance', 'Weekly allowance', '{"from_account_id": 1}');

-- Verify insertion
SELECT t.id, fm.name AS member, a.account_type, t.amount, t.tx_type, t.description
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN family_members fm ON a.member_id = fm.id;
```

**Expected output:**
```
 id |     member     |   account_type   | amount | tx_type   |    description
----+----------------+------------------+--------+-----------+-------------------
  1 | Alice Parent   | ethereum_wallet  | 1.00   | deposit   | Initial funding
  2 | Charlie Child  | allowance_wallet | 0.10   | allowance | Weekly allowance
```

### Step 6: Connect to PostgreSQL from Node.js

Now let's connect your Node.js application to PostgreSQL.

**Install the pg library:**

```powershell
# In your FamilyChain project root
npm install pg
```

**Expected output:**
```
added 16 packages in 3s
```

**Create a database connection file:**

Create `src/db/connection.js`:

```javascript
const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'familychain',
  password: 'your_password_here',  // ⚠️ Replace with your actual password
  port: 5432,
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export a query function
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool,
};
```

**Q: Why use a Pool instead of creating a new connection for each query?**

<details>
<summary>Answer</summary>

**Connection pooling** reuses database connections:
- **Performance:** Creating connections is slow (100-200ms each)
- **Resource efficiency:** Limited connections available
- **Production standard:** Handles hundreds of requests without creating hundreds of connections
- **Automatic management:** Pool handles connection lifecycle

Without pooling, your app would slow down significantly under load.

</details>

**Test the connection:**

Create `src/db/test-connection.js`:

```javascript
const db = require('./connection');

async function testConnection() {
  try {
    // Simple query to test connection
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('Current time from database:', result.rows[0].now);

    // Query family members
    const members = await db.query('SELECT * FROM family_members');
    console.log('\n📋 Family Members:');
    console.log(members.rows);

    // Close the pool
    await db.pool.end();
  } catch (err) {
    console.error('❌ Database connection error:', err);
  }
}

testConnection();
```

**Run the test:**

```powershell
node src/db/test-connection.js
```

**Expected output:**
```
✅ Database connected successfully!
Current time from database: 2025-01-15T10:45:30.123Z

📋 Family Members:
[
  {
    id: 1,
    name: 'Alice Parent',
    email: 'alice@family.com',
    wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    role: 'parent',
    created_at: 2025-01-15T10:30:45.123Z
  },
  ...
]
```

### Step 7: Write Database Helper Functions

Create `src/db/members.js`:

```javascript
const db = require('./connection');

/**
 * Get all family members
 */
async function getAllMembers() {
  const result = await db.query('SELECT * FROM family_members ORDER BY id');
  return result.rows;
}

/**
 * Get member by ID
 */
async function getMemberById(id) {
  const result = await db.query(
    'SELECT * FROM family_members WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

/**
 * Create a new family member
 */
async function createMember(name, email, walletAddress, role) {
  const result = await db.query(
    `INSERT INTO family_members (name, email, wallet_address, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, walletAddress, role]
  );
  return result.rows[0];
}

/**
 * Get all accounts for a member
 */
async function getMemberAccounts(memberId) {
  const result = await db.query(
    `SELECT a.*, fm.name AS member_name
     FROM accounts a
     JOIN family_members fm ON a.member_id = fm.id
     WHERE a.member_id = $1`,
    [memberId]
  );
  return result.rows;
}

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  getMemberAccounts,
};
```

**Q: What does `$1, $2, $3` mean in the SQL queries?**

<details>
<summary>Answer</summary>

These are **parameterized query placeholders**:
- `$1` = first parameter in the array
- `$2` = second parameter
- etc.

**Why use them instead of string concatenation?**
- **Security:** Prevents SQL injection attacks
- **Performance:** PostgreSQL can cache query plans
- **Type safety:** Library handles proper escaping

❌ NEVER do this:
```javascript
// VULNERABLE TO SQL INJECTION!
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

✅ ALWAYS do this:
```javascript
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);
```

</details>

**Test your helper functions:**

Create `src/db/test-helpers.js`:

```javascript
const members = require('./members');

async function testHelpers() {
  try {
    // Get all members
    console.log('📋 All Members:');
    const allMembers = await members.getAllMembers();
    console.log(allMembers);

    // Get specific member
    console.log('\n👤 Member ID 1:');
    const member = await members.getMemberById(1);
    console.log(member);

    // Get member's accounts
    console.log('\n💰 Accounts for Member ID 1:');
    const accounts = await members.getMemberAccounts(1);
    console.log(accounts);

    // Create a new member
    console.log('\n➕ Creating new member:');
    const newMember = await members.createMember(
      'Dana Child',
      'dana@family.com',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      'child'
    );
    console.log('Created:', newMember);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testHelpers();
```

**Run the test:**

```powershell
node src/db/test-helpers.js
```

---

## ✅ Expected Outputs

After completing all steps, you should have:

1. **PostgreSQL installed and running** on your machine
2. **familychain database created** with 3 tables:
   - `family_members`
   - `accounts`
   - `transactions`
3. **Sample data inserted** (3 family members, 3 accounts, 2 transactions)
4. **Node.js connected** to PostgreSQL using the `pg` library
5. **Helper functions working** to query and insert data

**Verification Checklist:**

```powershell
# In psql
\c familychain
\dt  # Should show 3 tables
SELECT COUNT(*) FROM family_members;  # Should return 3 or 4
SELECT COUNT(*) FROM accounts;  # Should return 3
SELECT COUNT(*) FROM transactions;  # Should return 2

# In Node.js
node src/db/test-connection.js  # Should show success message
node src/db/test-helpers.js  # Should show all queries working
```

---

## 📦 Deliverables

By the end of this class, you should have:

- [ ] PostgreSQL installed and running on port 5432
- [ ] `familychain` database created
- [ ] All three tables created with proper schema
- [ ] Sample data inserted into all tables
- [ ] `src/db/connection.js` file with connection pool
- [ ] `src/db/members.js` file with helper functions
- [ ] Both test files running successfully
- [ ] Screenshot of pgAdmin showing your tables
- [ ] Screenshot of Node.js test output

---

## ❓ Common Issues & Solutions

### Issue 1: "psql: command not found"

**Cause:** PostgreSQL bin folder not in PATH

**Solution:**
```powershell
# Add to system PATH (Windows):
# Control Panel → System → Advanced → Environment Variables
# Add: C:\Program Files\PostgreSQL\16\bin
```

### Issue 2: "connection refused on port 5432"

**Cause:** PostgreSQL service not running

**Solution:**
```powershell
# Check service status
Get-Service -Name postgresql*

# Start service if stopped
Start-Service postgresql-x64-16  # Version number may vary
```

### Issue 3: "password authentication failed for user postgres"

**Cause:** Incorrect password

**Solution:**
- Use the password you set during installation
- If forgotten, you'll need to reset via pg_hba.conf (ask for help)

### Issue 4: "relation 'family_members' does not exist"

**Cause:** Tables not created or connected to wrong database

**Solution:**
```powershell
# Verify you're in the correct database
\c familychain
\dt  # List tables

# If no tables, run CREATE TABLE statements again
```

### Issue 5: "violates foreign key constraint"

**Cause:** Trying to insert an account with a non-existent member_id

**Solution:**
```sql
-- Check which member IDs exist
SELECT id, name FROM family_members;

-- Use one of those IDs when creating accounts
```

---

## ✅ Self-Assessment Quiz

Test your understanding before moving to Class 4.2:

### Question 1: Why do we use NUMERIC(20, 8) for money instead of FLOAT?

<details>
<summary>Answer</summary>

**NUMERIC(20, 8) is exact, FLOAT is approximate.**

- FLOAT uses binary floating-point, which can't represent 0.1 exactly
- This causes rounding errors: `0.1 + 0.2 = 0.30000000000000004` in FLOAT
- For financial data, losing even a fraction of a cent is unacceptable
- NUMERIC stores exact decimal values with no rounding errors

**Example:**
```sql
-- ❌ FLOAT loses precision
SELECT 0.1::FLOAT + 0.2::FLOAT;  -- Result: 0.30000000000000004

-- ✅ NUMERIC is exact
SELECT 0.1::NUMERIC + 0.2::NUMERIC;  -- Result: 0.3
```

</details>

### Question 2: What does `ON DELETE CASCADE` do in a foreign key?

<details>
<summary>Answer</summary>

**Automatically deletes child records when parent is deleted.**

Without CASCADE:
```sql
-- ❌ This fails if accounts exist for the member
DELETE FROM family_members WHERE id = 1;
-- ERROR: violates foreign key constraint
```

With CASCADE:
```sql
-- ✅ Deletes the member AND all their accounts
DELETE FROM family_members WHERE id = 1;
-- Success: Member and all their accounts deleted
```

**Use cases:**
- When child records have no meaning without parent (accounts without owners)
- **Be careful:** It's a powerful operation that can delete lots of data

**Alternatives:**
- `ON DELETE SET NULL`: Set foreign key to NULL instead of deleting
- `ON DELETE RESTRICT`: Prevent deletion if children exist (default)

</details>

### Question 3: What's the difference between VARCHAR(n) and TEXT?

<details>
<summary>Answer</summary>

**VARCHAR(n) has a maximum length, TEXT is unlimited.**

| Type | Max Length | When to Use |
|------|-----------|-------------|
| `VARCHAR(100)` | 100 characters | Known length limits (names, emails, addresses) |
| `TEXT` | Unlimited | Unknown length (descriptions, notes, blog posts) |

**Performance:**
- For most queries, no difference
- VARCHAR can enforce length constraints (prevents bugs)
- TEXT can cause issues if you accidentally store huge strings

**Best practice:**
- Use VARCHAR when you know the max length
- Use TEXT when content is truly variable or long

</details>

### Question 4: Why use a connection pool in Node.js?

<details>
<summary>Answer</summary>

**Connection pooling reuses database connections for better performance.**

**Without pooling:**
```javascript
// Each query creates a new connection
const client = new Client();
await client.connect();  // 100-200ms!
await client.query('SELECT...');
await client.end();
```

**With pooling:**
```javascript
// Reuses existing connections
await pool.query('SELECT...');  // <1ms if connection exists
```

**Benefits:**
- **Speed:** Reusing connections is 100x faster than creating new ones
- **Resource efficiency:** Database has limited connection slots
- **Scalability:** Handle 1000s of requests with 20 connections
- **Production standard:** All serious apps use connection pooling

</details>

### Question 5: What's SQL injection and how do parameterized queries prevent it?

<details>
<summary>Answer</summary>

**SQL injection is when attackers manipulate queries by injecting malicious SQL.**

**Vulnerable code:**
```javascript
// ❌ NEVER DO THIS
const email = "'; DROP TABLE family_members; --";
const query = `SELECT * FROM users WHERE email = '${email}'`;
// Resulting SQL:
// SELECT * FROM users WHERE email = ''; DROP TABLE family_members; --'
// This deletes your entire table!
```

**Safe code:**
```javascript
// ✅ ALWAYS USE PARAMETERIZED QUERIES
const email = "'; DROP TABLE family_members; --";
await db.query('SELECT * FROM users WHERE email = $1', [email]);
// PostgreSQL treats the entire string as data, not SQL
// No injection possible!
```

**How parameterized queries work:**
1. Database receives query template: `SELECT * FROM users WHERE email = $1`
2. Database prepares execution plan
3. Database safely substitutes parameters as **data**, not code
4. No matter what the parameter contains, it can't execute SQL

**Rule:** Never concatenate user input into SQL queries. Always use `$1, $2, ...` placeholders.

</details>

### Question 6: What's the purpose of indexes in PostgreSQL?

<details>
<summary>Answer</summary>

**Indexes speed up queries by creating a sorted lookup structure.**

**Without index:**
```sql
-- PostgreSQL scans every row (slow for large tables)
SELECT * FROM transactions WHERE tx_hash = '0xabc...';
-- For 1 million rows: ~500ms
```

**With index:**
```sql
CREATE INDEX idx_tx_hash ON transactions(tx_hash);
SELECT * FROM transactions WHERE tx_hash = '0xabc...';
-- For 1 million rows: ~5ms (100x faster!)
```

**How indexes work:**
- Think of a book index: instead of reading every page, you look up the term and jump to the right page
- PostgreSQL automatically creates indexes on PRIMARY KEY and UNIQUE columns
- You manually create indexes on columns you query frequently

**Trade-offs:**
- ✅ **Faster reads:** Queries using indexed columns are much faster
- ❌ **Slower writes:** Each INSERT/UPDATE must update indexes
- ❌ **More disk space:** Indexes store additional data

**When to add indexes:**
- Columns in WHERE clauses (e.g., `WHERE email = '...'`)
- Columns in JOIN conditions (e.g., `ON a.member_id = fm.id`)
- Columns in ORDER BY (e.g., `ORDER BY created_at DESC`)

</details>

---

## 🎯 Key Takeaways

1. **PostgreSQL is ACID-compliant**, making it perfect for financial data
2. **Always use NUMERIC for money** - never FLOAT or DOUBLE
3. **Foreign keys enforce referential integrity** - can't create orphaned records
4. **Connection pooling is essential** for production performance
5. **Parameterized queries prevent SQL injection** - never concatenate user input
6. **Schema design matters** - think through relationships before coding
7. **Constraints enforce data quality** - use NOT NULL, CHECK, UNIQUE liberally

---

## 🔜 Next Steps

In **Class 4.2: Redis Configuration and Caching Patterns**, you'll learn:
- How Redis complements PostgreSQL
- Caching strategies to speed up database queries
- Real-time pub/sub for blockchain events
- When to use Redis vs PostgreSQL

**Preparation:**
- Ensure all PostgreSQL queries in this class work correctly
- Review your schema design - we'll build on it
- Think about: "Which data do we query most often?" (candidates for caching)

---

## 📚 Reading References

**Bitcoin Book:**
- Chapter 6: Transactions - Transaction Inputs and Outputs, Transaction Chains (understand financial data flows)
- Chapter 11: Blockchain - Block Structure (parallels to database structure)

**Ethereum Book:**
- Chapter 6: Transactions - Structure, Data Payload (how blockchain stores data)
- Chapter 13: EVM - Ethereum State, Account State (state management concepts)

**PostgreSQL Documentation:**
- Data Types: https://www.postgresql.org/docs/current/datatype.html
- Constraints: https://www.postgresql.org/docs/current/ddl-constraints.html

**node-postgres Documentation:**
- Pooling: https://node-postgres.com/features/pooling
- Queries: https://node-postgres.com/features/queries

---

## 🎓 Teaching Notes (for Claude Code)

**Interaction Style:**
- Check understanding after each major concept (Primary Keys, Foreign Keys, Data Types)
- Ask user to explain WHY before showing HOW (e.g., "Why NUMERIC instead of FLOAT?")
- Wait for user to run each command and report back before proceeding
- If errors occur, guide troubleshooting rather than giving answers immediately

**Common Student Struggles:**
- **Concept:** Foreign keys and relationships (use diagrams and real-world analogies)
- **Technical:** PostgreSQL installation on Windows (PATH issues)
- **SQL:** JOIN syntax (show progression: simple SELECT → SELECT with WHERE → JOIN)

**Pacing:**
- Step 1-2 (Installation): 30-45 minutes (wait for downloads)
- Step 3-5 (Schema and Data): 60-90 minutes (this is the meat of the lesson)
- Step 6-7 (Node.js): 45-60 minutes (easier if user is comfortable with JavaScript)

**When to Probe Deeper:**
- If user uses FLOAT for money → Explain precision loss with examples
- If user skips constraints → Show what bad data looks like without them
- If user concatenates SQL → Demonstrate SQL injection vulnerability

**Reinforcement Questions:**
- "You just created a foreign key. What happens if you try to insert an account with member_id = 999?"
- "We used VARCHAR(42) for wallet addresses. Why not VARCHAR(100) or TEXT?"
- "What would happen if we didn't use a connection pool and had 1000 users hitting the API?"

---

**Version:** 1.0
**Last Updated:** 2025-01-15
**Next Class:** [Class 4.2 - Redis Configuration and Caching Patterns](week4-class4.2-redis-caching.md)
