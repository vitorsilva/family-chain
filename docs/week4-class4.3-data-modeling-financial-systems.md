# Week 4 - Class 4.3: Data Modeling for Financial Systems

## 📋 Overview

**Duration:** 3-4 hours
**Prerequisites:** Class 4.1 and 4.2 completed (PostgreSQL and Redis setup)
**Why This Matters:** Financial systems have unique requirements that differ from typical web applications. Handling money requires **precision**, transaction tracking needs **immutability**, and regulatory compliance demands **audit trails**. Get this wrong, and you lose money or users' trust.

In this class, you'll learn patterns specific to fintech and blockchain applications: handling decimal precision, designing immutable transaction logs, building audit trails, and relating on-chain blockchain data with off-chain database records.

---

## 🎯 Learning Objectives

By the end of this class, you will be able to:

1. **Handle money with precision** using NUMERIC types and avoiding rounding errors
2. **Design immutable transaction logs** that can never be altered
3. **Implement double-entry bookkeeping** principles in database design
4. **Create comprehensive audit trails** for compliance (GDPR, financial regulations)
5. **Model blockchain-database relationships** (on-chain tx_hash ↔ off-chain records)
6. **Handle multi-currency conversions** and exchange rates
7. **Design for data consistency** in distributed systems (eventual consistency patterns)

---

## 🔑 Key Concepts

### Handling Money: The Golden Rules

**Rule #1: Never use FLOAT or DOUBLE for money**

```sql
-- ❌ WRONG: Will cause rounding errors
CREATE TABLE accounts (
    balance FLOAT  -- Can't represent 0.1 exactly!
);

-- ✅ CORRECT: Use NUMERIC with explicit precision
CREATE TABLE accounts (
    balance NUMERIC(20, 8)  -- Exact decimal arithmetic
);
```

**Why FLOAT fails:**
```javascript
// JavaScript demonstration
console.log(0.1 + 0.2);  // 0.30000000000000004 (not 0.3!)
console.log(0.1 + 0.2 === 0.3);  // false

// Over 1000 operations, this compounds:
let balance = 0;
for (let i = 0; i < 1000; i++) {
    balance += 0.01;
}
console.log(balance);  // 9.999999999999831 (lost ~0.17 cents)
```

**Rule #2: Store money as smallest unit (e.g., wei for Ethereum)**

```sql
-- Option 1: Store as wei (integer)
balance_wei BIGINT  -- 1 ETH = 1000000000000000000 wei

-- Option 2: Store as ETH with high precision
balance_eth NUMERIC(20, 18)  -- 18 decimal places for wei precision
```

**Q: Why store as integer (wei) vs decimal (ETH)?**

<details>
<summary>Think about it first</summary>

**Integers:**
- ✅ No precision loss (exact arithmetic)
- ✅ Faster operations (no decimal math)
- ✅ Matches blockchain storage (wei is native)
- ❌ Harder for humans to read (18 zeros!)

**Decimals with high precision:**
- ✅ Human-readable (2.5 ETH vs 2500000000000000000 wei)
- ✅ Still exact with NUMERIC(20, 18)
- ❌ Slightly slower (decimal arithmetic)

**Best practice:** Store as wei for calculations, convert to ETH for display.

</details>

**Rule #3: Use NUMERIC(p, s) where:**
- **p** = total digits (precision)
- **s** = digits after decimal (scale)

```sql
-- For Ethereum (18 decimals)
NUMERIC(28, 18)  -- Up to 9,999,999,999.999999999999999999 ETH

-- For fiat currency (2 decimals)
NUMERIC(15, 2)   -- Up to 9,999,999,999,999.99 (10 trillion)

-- For stablecoins like USDC (6 decimals)
NUMERIC(20, 6)   -- Matches USDC's on-chain precision
```

### Immutable Transaction Logs

**Financial transactions must be immutable** - once recorded, they can never be altered.

**Anti-Pattern: Mutable balance column**
```sql
-- ❌ WRONG: Overwriting balance loses history
UPDATE accounts SET balance = balance + 100 WHERE id = 1;
-- You can't answer: "What was the balance yesterday?"
```

**Pattern: Append-only transaction log**
```sql
-- ✅ CORRECT: Never UPDATE, only INSERT
CREATE TABLE transaction_log (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL,
    amount NUMERIC(20, 8) NOT NULL,
    balance_after NUMERIC(20, 8) NOT NULL,
    tx_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    -- Immutability constraint
    CONSTRAINT no_updates CHECK (id > 0)  -- Symbolic: represents append-only
);

-- Insert a transaction
INSERT INTO transaction_log (account_id, amount, balance_after, tx_type, description)
VALUES (1, 100.00, 2600.00, 'deposit', 'Monthly salary');

-- To get current balance, query the latest record
SELECT balance_after
FROM transaction_log
WHERE account_id = 1
ORDER BY id DESC
LIMIT 1;
```

**Benefits of immutability:**
- ✅ Complete audit trail (every change tracked)
- ✅ Point-in-time queries ("balance on Jan 1st")
- ✅ Easy reconciliation (sum all transactions = current balance)
- ✅ Meets compliance requirements (SOX, GDPR)

### Double-Entry Bookkeeping

**Every transaction affects TWO accounts** (debit and credit).

**Example: Alice sends 10 ETH to Bob**

```sql
-- Transaction 1: Debit Alice's account
INSERT INTO transaction_log (account_id, amount, tx_type, description)
VALUES (1, -10.00, 'transfer_out', 'Transfer to Bob');

-- Transaction 2: Credit Bob's account
INSERT INTO transaction_log (account_id, amount, tx_type, description)
VALUES (2, 10.00, 'transfer_in', 'Transfer from Alice');
```

**Schema for double-entry:**

```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    from_account_id INTEGER,
    to_account_id INTEGER,
    amount NUMERIC(20, 8) NOT NULL CHECK (amount > 0),
    tx_hash VARCHAR(66),  -- Blockchain transaction hash
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ledger_entries (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id),
    account_id INTEGER REFERENCES accounts(id),
    entry_type VARCHAR(10) CHECK (entry_type IN ('debit', 'credit')),
    amount NUMERIC(20, 8) NOT NULL,
    balance_after NUMERIC(20, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Insert a transfer (double-entry):**

```sql
BEGIN;

-- 1. Create transaction record
INSERT INTO transactions (from_account_id, to_account_id, amount, tx_hash, status)
VALUES (1, 2, 10.00, '0xabc123...', 'confirmed')
RETURNING id INTO transaction_id;

-- 2. Debit from_account
INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount, balance_after)
VALUES (transaction_id, 1, 'debit', 10.00, 2590.00);

-- 3. Credit to_account
INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount, balance_after)
VALUES (transaction_id, 2, 'credit', 10.00, 1785.00);

COMMIT;
```

**Validation: Sum of all debits must equal sum of all credits**

```sql
-- This should always equal 0
SELECT
    SUM(CASE WHEN entry_type = 'debit' THEN -amount ELSE amount END) AS net_balance
FROM ledger_entries
WHERE transaction_id = 123;
-- Result: 0.00 (balanced)
```

### Audit Trails

**Every sensitive operation must be logged** for compliance and debugging.

**Audit log schema:**

```sql
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by INTEGER REFERENCES family_members(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Automatic audit logging with triggers:**

```sql
-- Function to log changes
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (
        TG_TABLE_NAME,
        NEW.id,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE row_to_json(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW) END,
        current_setting('app.current_user_id', true)::INTEGER
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to accounts table
CREATE TRIGGER audit_accounts_trigger
AFTER INSERT OR UPDATE OR DELETE ON accounts
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

**Q: Why use JSONB for old_values and new_values?**

<details>
<summary>Answer</summary>

**JSONB stores flexible data** - you don't need to create columns for every field you might audit.

**Example:**
```sql
-- Old values before update
old_values: {"balance": "2600.00", "updated_at": "2025-01-15T10:00:00Z"}

-- New values after update
new_values: {"balance": "2700.00", "updated_at": "2025-01-15T11:00:00Z"}
```

**Benefits:**
- ✅ Works for any table (generic audit log)
- ✅ Query with JSONB operators: `old_values->>'balance'`
- ✅ Stores full record state (complete history)
- ✅ Easy to compare what changed

**Query example:**
```sql
-- Find all balance changes over $1000
SELECT *
FROM audit_log
WHERE table_name = 'accounts'
  AND (new_values->>'balance')::NUMERIC - (old_values->>'balance')::NUMERIC > 1000;
```

</details>

### Blockchain-Database Relationships

**On-chain data (blockchain) ↔ Off-chain data (database)**

```sql
CREATE TABLE blockchain_transactions (
    id SERIAL PRIMARY KEY,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,  -- On-chain identifier
    block_number BIGINT,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount_wei NUMERIC(28, 0) NOT NULL,  -- Store as wei (integer)
    gas_used INTEGER,
    gas_price_gwei NUMERIC(12, 2),
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'failed')),
    confirmations INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP
);

-- Link blockchain tx to internal transaction
CREATE TABLE internal_transactions (
    id SERIAL PRIMARY KEY,
    blockchain_tx_id INTEGER REFERENCES blockchain_transactions(id),
    from_member_id INTEGER REFERENCES family_members(id),
    to_member_id INTEGER REFERENCES family_members(id),
    internal_type VARCHAR(50),  -- 'allowance', 'loan_repayment', etc.
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Why separate tables?**
- **blockchain_transactions:** Raw blockchain data (immutable, matches chain)
- **internal_transactions:** Business logic (family context, not on chain)

**Example: Allowance payment**

```sql
-- On-chain transaction
INSERT INTO blockchain_transactions (tx_hash, from_address, to_address, amount_wei, status)
VALUES ('0xabc123...', '0xALICE...', '0xCHARLIE...', 100000000000000000, 'confirmed');

-- Internal context
INSERT INTO internal_transactions (blockchain_tx_id, from_member_id, to_member_id, internal_type, metadata)
VALUES (1, 1, 3, 'allowance', '{"schedule": "weekly", "week": 4}');
```

**Query: Get all allowances for Charlie**

```sql
SELECT
    bt.tx_hash,
    fm_from.name AS from_name,
    fm_to.name AS to_name,
    bt.amount_wei::NUMERIC / 1e18 AS amount_eth,  -- Convert wei to ETH
    it.metadata->>'schedule' AS schedule,
    bt.confirmed_at
FROM internal_transactions it
JOIN blockchain_transactions bt ON it.blockchain_tx_id = bt.id
JOIN family_members fm_from ON it.from_member_id = fm_from.id
JOIN family_members fm_to ON it.to_member_id = fm_to.id
WHERE it.to_member_id = 3
  AND it.internal_type = 'allowance'
ORDER BY bt.confirmed_at DESC;
```

### Multi-Currency Support

**Storing multiple currencies:**

```sql
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES family_members(id),
    currency VARCHAR(10) NOT NULL,  -- 'ETH', 'USDC', 'EUR', etc.
    balance NUMERIC(28, 18) NOT NULL DEFAULT 0,
    decimals INTEGER NOT NULL DEFAULT 18,  -- For conversion
    UNIQUE (member_id, currency)
);

CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    rate NUMERIC(20, 10) NOT NULL,
    source VARCHAR(50),  -- 'chainlink', 'uniswap', 'coingecko'
    fetched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (from_currency, to_currency, fetched_at)
);
```

**Convert between currencies:**

```sql
-- Insert exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate, source)
VALUES
    ('ETH', 'USD', 2500.00, 'coingecko'),
    ('USDC', 'USD', 1.00, 'fixed'),
    ('USD', 'EUR', 0.85, 'ecb');

-- Convert 2.5 ETH to USD
SELECT
    2.5 * rate AS amount_usd
FROM exchange_rates
WHERE from_currency = 'ETH' AND to_currency = 'USD'
ORDER BY fetched_at DESC
LIMIT 1;
-- Result: 6250.00 USD
```

**Aggregate balance across currencies:**

```sql
-- Get total balance in USD
SELECT
    SUM(a.balance * er.rate) AS total_usd
FROM accounts a
LEFT JOIN LATERAL (
    SELECT rate
    FROM exchange_rates
    WHERE from_currency = a.currency AND to_currency = 'USD'
    ORDER BY fetched_at DESC
    LIMIT 1
) er ON true
WHERE a.member_id = 1;
```

---

## 🔨 Hands-On Activity

### Step 1: Create Enhanced Transaction Schema

**Create the improved schema:**

```sql
-- Connect to familychain database
\c familychain

-- Drop old transactions table (if exists)
DROP TABLE IF EXISTS transactions CASCADE;

-- Create new comprehensive schema
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    from_account_id INTEGER,
    to_account_id INTEGER,
    amount NUMERIC(28, 18) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'ETH',
    tx_hash VARCHAR(66),  -- Blockchain tx hash (nullable for internal-only)
    tx_type VARCHAR(50) NOT NULL,  -- 'deposit', 'withdrawal', 'transfer', 'allowance', etc.
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'reversed')),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    reversed_at TIMESTAMP,
    reversed_by INTEGER,  -- If transaction was reversed
    CONSTRAINT from_or_to_required CHECK (from_account_id IS NOT NULL OR to_account_id IS NOT NULL)
);

-- Ledger entries (double-entry bookkeeping)
CREATE TABLE ledger_entries (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('debit', 'credit')),
    amount NUMERIC(28, 18) NOT NULL,
    balance_before NUMERIC(28, 18) NOT NULL,
    balance_after NUMERIC(28, 18) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Blockchain transactions
CREATE TABLE blockchain_transactions (
    id SERIAL PRIMARY KEY,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount_wei NUMERIC(28, 0) NOT NULL,
    gas_used INTEGER,
    gas_price_gwei NUMERIC(12, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    confirmations INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP
);

-- Exchange rates
CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    rate NUMERIC(20, 10) NOT NULL,
    source VARCHAR(50),
    fetched_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_transactions_from_account ON transactions(from_account_id);
CREATE INDEX idx_transactions_to_account ON transactions(to_account_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_ledger_entries_account ON ledger_entries(account_id);
CREATE INDEX idx_ledger_entries_transaction ON ledger_entries(transaction_id);
CREATE INDEX idx_blockchain_tx_hash ON blockchain_transactions(tx_hash);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
```

### Step 2: Implement Double-Entry Transfer Function

Create `src/db/transactions.js`:

```javascript
const db = require('./connection');

/**
 * Create a transfer transaction with double-entry bookkeeping
 */
async function createTransfer(fromAccountId, toAccountId, amount, description, metadata = {}) {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get current balances
    const fromResult = await client.query(
      'SELECT balance, currency FROM accounts WHERE id = $1 FOR UPDATE',
      [fromAccountId]
    );
    const toResult = await client.query(
      'SELECT balance, currency FROM accounts WHERE id = $1 FOR UPDATE',
      [toAccountId]
    );

    if (!fromResult.rows[0] || !toResult.rows[0]) {
      throw new Error('Account not found');
    }

    const fromBalance = parseFloat(fromResult.rows[0].balance);
    const toBalance = parseFloat(toResult.rows[0].balance);
    const currency = fromResult.rows[0].currency;

    // Validate sufficient balance
    if (fromBalance < amount) {
      throw new Error('Insufficient balance');
    }

    // 2. Create transaction record
    const txResult = await client.query(
      `INSERT INTO transactions (from_account_id, to_account_id, amount, currency, tx_type, status, description, metadata)
       VALUES ($1, $2, $3, $4, 'transfer', 'confirmed', $5, $6)
       RETURNING id, created_at`,
      [fromAccountId, toAccountId, amount, currency, description, JSON.stringify(metadata)]
    );

    const transactionId = txResult.rows[0].id;
    const newFromBalance = fromBalance - amount;
    const newToBalance = toBalance + amount;

    // 3. Create debit ledger entry (from account)
    await client.query(
      `INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount, balance_before, balance_after)
       VALUES ($1, $2, 'debit', $3, $4, $5)`,
      [transactionId, fromAccountId, amount, fromBalance, newFromBalance]
    );

    // 4. Create credit ledger entry (to account)
    await client.query(
      `INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount, balance_before, balance_after)
       VALUES ($1, $2, 'credit', $3, $4, $5)`,
      [transactionId, toAccountId, amount, toBalance, newToBalance]
    );

    // 5. Update account balances
    await client.query(
      'UPDATE accounts SET balance = $1 WHERE id = $2',
      [newFromBalance, fromAccountId]
    );
    await client.query(
      'UPDATE accounts SET balance = $1 WHERE id = $2',
      [newToBalance, toAccountId]
    );

    await client.query('COMMIT');

    return {
      transactionId,
      fromBalance: newFromBalance,
      toBalance: newToBalance,
      timestamp: txResult.rows[0].created_at,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get transaction history for an account
 */
async function getTransactionHistory(accountId, limit = 50) {
  const result = await db.query(
    `SELECT
      t.id,
      t.from_account_id,
      t.to_account_id,
      t.amount,
      t.currency,
      t.tx_type,
      t.status,
      t.description,
      t.created_at,
      le.entry_type,
      le.balance_before,
      le.balance_after
    FROM transactions t
    JOIN ledger_entries le ON t.id = le.transaction_id
    WHERE le.account_id = $1
    ORDER BY t.created_at DESC
    LIMIT $2`,
    [accountId, limit]
  );

  return result.rows;
}

/**
 * Reconcile account balance (verify integrity)
 */
async function reconcileAccountBalance(accountId) {
  // Calculate balance from ledger entries
  const result = await db.query(
    `SELECT
      SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE -amount END) AS calculated_balance
    FROM ledger_entries
    WHERE account_id = $1`,
    [accountId]
  );

  const calculatedBalance = parseFloat(result.rows[0].calculated_balance || 0);

  // Get actual balance
  const accountResult = await db.query(
    'SELECT balance FROM accounts WHERE id = $1',
    [accountId]
  );

  const actualBalance = parseFloat(accountResult.rows[0].balance);

  const isBalanced = Math.abs(calculatedBalance - actualBalance) < 0.00000001;

  return {
    accountId,
    calculatedBalance,
    actualBalance,
    difference: actualBalance - calculatedBalance,
    isBalanced,
  };
}

module.exports = {
  createTransfer,
  getTransactionHistory,
  reconcileAccountBalance,
};
```

### Step 3: Test Double-Entry Transfers

Create `src/db/test-transactions.js`:

```javascript
const transactions = require('./transactions');

async function testTransactions() {
  try {
    console.log('=== Testing Double-Entry Transfers ===\n');

    // Create a transfer
    console.log('1. Creating transfer: Account 1 → Account 2 (0.5 ETH)');
    const transfer = await transactions.createTransfer(
      1,   // from
      2,   // to
      0.5, // amount
      'Test transfer',
      { source: 'manual_test' }
    );
    console.log('Transfer created:', transfer);

    // Get transaction history
    console.log('\n2. Transaction history for account 1:');
    const history1 = await transactions.getTransactionHistory(1, 5);
    console.log(history1);

    console.log('\n3. Transaction history for account 2:');
    const history2 = await transactions.getTransactionHistory(2, 5);
    console.log(history2);

    // Reconcile balances
    console.log('\n4. Reconciling account 1:');
    const reconcile1 = await transactions.reconcileAccountBalance(1);
    console.log(reconcile1);

    console.log('\n5. Reconciling account 2:');
    const reconcile2 = await transactions.reconcileAccountBalance(2);
    console.log(reconcile2);

    if (reconcile1.isBalanced && reconcile2.isBalanced) {
      console.log('\n✅ All balances reconciled correctly!');
    } else {
      console.log('\n❌ Balance mismatch detected!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testTransactions();
```

**Run the test:**

```powershell
node src/db/test-transactions.js
```

**Expected output:**
```
=== Testing Double-Entry Transfers ===

1. Creating transfer: Account 1 → Account 2 (0.5 ETH)
Transfer created: {
  transactionId: 1,
  fromBalance: 2,
  toBalance: 2.25,
  timestamp: 2025-01-15T11:30:45.123Z
}

2. Transaction history for account 1:
[
  {
    id: 1,
    from_account_id: 1,
    to_account_id: 2,
    amount: '0.5',
    entry_type: 'debit',
    balance_before: '2.5',
    balance_after: '2',
    ...
  }
]

...

✅ All balances reconciled correctly!
```

### Step 4: Implement Audit Logging Trigger

**Create audit trigger:**

```sql
-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (table_name, record_id, action, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Attach to accounts table
CREATE TRIGGER audit_accounts
AFTER INSERT OR UPDATE OR DELETE ON accounts
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Attach to transactions table
CREATE TRIGGER audit_transactions
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

**Test audit logging:**

```sql
-- Make a change
UPDATE accounts SET balance = 999.99 WHERE id = 1;

-- Check audit log
SELECT * FROM audit_log WHERE table_name = 'accounts' ORDER BY id DESC LIMIT 1;
```

**Expected output:**
```
 id | table_name | record_id | action | old_values                    | new_values
----+------------+-----------+--------+-------------------------------+----------------------------
  1 | accounts   | 1         | UPDATE | {"balance": "2.5", ...}       | {"balance": "999.99", ...}
```

### Step 5: Link Blockchain Transactions

**Insert blockchain transaction:**

```javascript
const db = require('./db/connection');

async function linkBlockchainTransaction(txHash, fromAddress, toAddress, amountWei) {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert blockchain transaction
    const btResult = await client.query(
      `INSERT INTO blockchain_transactions
       (tx_hash, from_address, to_address, amount_wei, status, confirmations)
       VALUES ($1, $2, $3, $4, 'confirmed', 12)
       RETURNING id`,
      [txHash, fromAddress, toAddress, amountWei]
    );

    const blockchainTxId = btResult.rows[0].id;

    // 2. Find matching accounts
    const fromAccount = await client.query(
      'SELECT id FROM accounts a JOIN family_members fm ON a.member_id = fm.id WHERE fm.wallet_address = $1',
      [fromAddress]
    );

    const toAccount = await client.query(
      'SELECT id FROM accounts a JOIN family_members fm ON a.member_id = fm.id WHERE fm.wallet_address = $1',
      [toAddress]
    );

    if (!fromAccount.rows[0] || !toAccount.rows[0]) {
      throw new Error('Accounts not found for addresses');
    }

    const amountEth = parseFloat(amountWei) / 1e18;

    // 3. Create internal transaction with blockchain link
    await client.query(
      `INSERT INTO transactions
       (from_account_id, to_account_id, amount, currency, tx_type, status, tx_hash, description, metadata)
       VALUES ($1, $2, $3, 'ETH', 'blockchain_transfer', 'confirmed', $4, 'Blockchain transfer', $5)`,
      [
        fromAccount.rows[0].id,
        toAccount.rows[0].id,
        amountEth,
        txHash,
        JSON.stringify({ blockchain_tx_id: blockchainTxId })
      ]
    );

    await client.query('COMMIT');

    return { blockchainTxId, amountEth };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { linkBlockchainTransaction };
```

---

## ✅ Expected Outputs

After completing all steps:

1. **Enhanced transaction schema created** with double-entry bookkeeping
2. **Transfer function working** with atomic updates
3. **Ledger entries balanced** (debits = credits)
4. **Audit logging active** on accounts and transactions tables
5. **Blockchain transactions linked** to internal records
6. **Reconciliation function** verifying data integrity

---

## 📦 Deliverables

- [ ] All new tables created (transactions, ledger_entries, audit_log, blockchain_transactions, exchange_rates)
- [ ] `src/db/transactions.js` with double-entry functions
- [ ] Test showing successful transfers and reconciliation
- [ ] Audit triggers attached to tables
- [ ] Blockchain transaction linking working
- [ ] Screenshot of audit_log entries
- [ ] Screenshot of reconciliation output showing balanced accounts

---

## ❓ Common Issues & Solutions

### Issue 1: "Balance mismatch after reconciliation"

**Cause:** Rounding errors or missing ledger entries

**Solution:**
```sql
-- Find accounts with mismatched balances
SELECT
    a.id,
    a.balance AS actual_balance,
    COALESCE(SUM(CASE WHEN le.entry_type = 'credit' THEN le.amount ELSE -le.amount END), 0) AS calculated_balance
FROM accounts a
LEFT JOIN ledger_entries le ON a.id = le.account_id
GROUP BY a.id, a.balance
HAVING a.balance != COALESCE(SUM(CASE WHEN le.entry_type = 'credit' THEN le.amount ELSE -le.amount END), 0);
```

### Issue 2: "Negative balance after transfer"

**Cause:** Missing balance check or race condition

**Solution:**
```javascript
// Use FOR UPDATE to lock row
const result = await client.query(
  'SELECT balance FROM accounts WHERE id = $1 FOR UPDATE',
  [accountId]
);

// Check balance before proceeding
if (result.rows[0].balance < amount) {
  throw new Error('Insufficient balance');
}
```

### Issue 3: "Audit log not recording changes"

**Cause:** Trigger not attached or disabled

**Solution:**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'audit_accounts';

-- Re-create trigger if missing
CREATE TRIGGER audit_accounts
AFTER INSERT OR UPDATE OR DELETE ON accounts
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

## ✅ Self-Assessment Quiz

### Question 1: Why use double-entry bookkeeping?

<details>
<summary>Answer</summary>

**Double-entry ensures every transaction is balanced.**

Every financial transaction has two sides:
- **Debit:** Money leaving an account
- **Credit:** Money entering an account

**Example: Alice sends 10 ETH to Bob**
- Debit Alice's account: -10 ETH
- Credit Bob's account: +10 ETH
- **Net effect: 0** (money doesn't appear or disappear)

**Benefits:**
- ✅ **Self-auditing:** Sum of all debits = sum of all credits (should always be 0)
- ✅ **Error detection:** If unbalanced, something went wrong
- ✅ **Complete trail:** See both sides of every transaction
- ✅ **Regulatory compliance:** Required for financial audits

**Validation:**
```sql
-- This should always equal 0
SELECT SUM(CASE WHEN entry_type = 'debit' THEN -amount ELSE amount END)
FROM ledger_entries;
```

</details>

### Question 2: What's the difference between immutable and append-only?

<details>
<summary>Answer</summary>

**Immutable = can't change existing records**
**Append-only = can only add new records**

They're related but different:

**Immutable:**
```sql
-- These operations are blocked
UPDATE transactions SET amount = 200 WHERE id = 1;  -- No UPDATEs
DELETE FROM transactions WHERE id = 1;  -- No DELETEs
```

**Append-only:**
```sql
-- Only this operation is allowed
INSERT INTO transactions (amount, ...) VALUES (100, ...);  -- Only INSERTs
```

**Why both matter for finance:**
- **Immutability:** Ensures history can't be rewritten
- **Append-only:** Ensures complete audit trail (nothing deleted)

**Enforcement:**
```sql
-- Revoke UPDATE and DELETE permissions
REVOKE UPDATE, DELETE ON transactions FROM app_user;
GRANT INSERT, SELECT ON transactions TO app_user;
```

</details>

### Question 3: Why store wei as NUMERIC(28, 0) instead of BIGINT?

<details>
<summary>Answer</summary>

**BIGINT isn't large enough for large ETH amounts.**

**BIGINT range:**
- Max: 9,223,372,036,854,775,807
- In ETH: ~9.2 ETH (9,223,372 ETH)

**NUMERIC(28, 0) range:**
- Max: 9,999,999,999,999,999,999,999,999,999
- In ETH: ~10 billion ETH

**Why NUMERIC is better:**
- ✅ Handles large amounts (millions of ETH)
- ✅ Exact precision (no rounding)
- ✅ Consistent with other amounts (NUMERIC everywhere)
- ❌ Slightly slower than BIGINT

**When BIGINT is OK:**
- If you're sure amounts stay under ~9 ETH
- For gas prices, block numbers (won't overflow)

</details>

### Question 4: How do you reverse a transaction?

<details>
<summary>Answer</summary>

**Never DELETE or UPDATE - create a reversing transaction instead.**

**Wrong:**
```sql
-- ❌ DON'T delete or update
DELETE FROM transactions WHERE id = 123;
```

**Correct:**
```javascript
async function reverseTransaction(transactionId, reason) {
  // 1. Get original transaction
  const original = await db.query(
    'SELECT * FROM transactions WHERE id = $1',
    [transactionId]
  );

  // 2. Mark original as reversed
  await db.query(
    'UPDATE transactions SET status = $1, reversed_at = NOW() WHERE id = $2',
    ['reversed', transactionId]
  );

  // 3. Create reversing transaction
  await createTransfer(
    original.to_account_id,   // Swap from/to
    original.from_account_id,
    original.amount,
    `Reversal of transaction ${transactionId}: ${reason}`,
    { reversal_of: transactionId }
  );
}
```

**Why this approach:**
- ✅ Complete audit trail (original + reversal both visible)
- ✅ Preserves history (can see why it was reversed)
- ✅ Balances stay correct (reversing entry balances out)
- ✅ Regulatory compliance (auditors can see everything)

</details>

### Question 5: What's the purpose of `FOR UPDATE` in SELECT queries?

<details>
<summary>Answer</summary>

**`FOR UPDATE` locks rows to prevent race conditions.**

**Without FOR UPDATE (race condition):**
```
Time | User A                  | User B
-----|------------------------|------------------------
T1   | SELECT balance = 100   |
T2   |                        | SELECT balance = 100
T3   | UPDATE balance = 50    | (both see balance 100)
T4   |                        | UPDATE balance = 50
     | Result: Lost update!   | (should be 0, but is 50)
```

**With FOR UPDATE (correct):**
```
Time | User A                  | User B
-----|------------------------|------------------------
T1   | SELECT ... FOR UPDATE  |
     | (locks row)            |
T2   |                        | SELECT ... FOR UPDATE
     |                        | (waits for lock...)
T3   | UPDATE balance = 50    |
     | (releases lock)        |
T4   |                        | (now gets lock, sees 50)
     |                        | UPDATE balance = 0
     | Result: Correct!       |
```

**Usage:**
```javascript
// Lock row for update
const result = await client.query(
  'SELECT balance FROM accounts WHERE id = $1 FOR UPDATE',
  [accountId]
);
// Row is now locked until COMMIT or ROLLBACK
```

**When to use:**
- ✅ Before updating balances
- ✅ Before checking inventory/limits
- ✅ Any time you need "read then update" atomically

</details>

---

## 🎯 Key Takeaways

1. **Always use NUMERIC for money** - FLOAT/DOUBLE cause rounding errors
2. **Immutable transactions are essential** for audit trails and compliance
3. **Double-entry bookkeeping ensures integrity** (debits = credits)
4. **Audit logs must be comprehensive** (track who, what, when, where)
5. **Separate blockchain data from business logic** (on-chain vs off-chain)
6. **Use transactions and row locking** to prevent race conditions
7. **Reconciliation should always pass** (calculated balance = actual balance)

---

## 🔜 Next Steps

In **Class 4.4: Database Security and Encryption**, you'll learn:
- Encrypting sensitive data (IBANs, NIFs, private keys)
- Database access control (roles, permissions)
- Backup strategies
- Connection pooling security

**Preparation:**
- Ensure all transaction tests pass
- Review GDPR requirements (you'll implement data encryption)
- Think about: "What data in FamilyChain is sensitive and must be encrypted?"

---

## 📚 Reading References

**Bitcoin Book:**
- Chapter 6: Transactions - Understanding UTXOs (similar to immutable ledger entries)
- Chapter 11: Blockchain - Immutability concepts

**Ethereum Book:**
- Chapter 6: Transactions - Transaction structure and nonce (preventing replay attacks)
- Chapter 13: EVM - State management and Merkle trees (verification patterns)

**PostgreSQL Documentation:**
- Transactions: https://www.postgresql.org/docs/current/tutorial-transactions.html
- Data Types (NUMERIC): https://www.postgresql.org/docs/current/datatype-numeric.html
- Triggers: https://www.postgresql.org/docs/current/sql-createtrigger.html

---

## 🎓 Teaching Notes (for Claude Code)

**Interaction Style:**
- Emphasize WHY these patterns exist (compliance, audit, integrity)
- Show what happens when patterns are violated (lost money, corrupted balances)
- Walk through double-entry transfers step-by-step
- Have user manually verify balance reconciliation

**Common Student Struggles:**
- **Concept:** Double-entry bookkeeping (not intuitive at first)
- **Technical:** PostgreSQL transactions and row locking
- **SQL:** Complex JOINs across multiple tables

**Pacing:**
- Step 1 (Schema): 30-45 minutes (lots of SQL)
- Step 2-3 (Transfers): 60-90 minutes (core implementation)
- Step 4-5 (Audit, blockchain): 45-60 minutes

**When to Probe Deeper:**
- If user suggests FLOAT for money → Show precision loss demo
- If user skips FOR UPDATE → Demonstrate race condition
- If user wants to UPDATE transactions → Explain immutability importance

**Reinforcement Questions:**
- "We just created a transfer. Can you verify that debits equal credits?"
- "What would happen if we didn't use FOR UPDATE when checking balances?"
- "How would you find all transactions for a specific blockchain tx_hash?"

---

**Version:** 1.0
**Last Updated:** 2025-01-15
**Previous Class:** [Class 4.2 - Redis Configuration and Caching Patterns](week4-class4.2-redis-caching-patterns.md)
**Next Class:** [Class 4.4 - Database Security and Encryption](week4-class4.4-database-security-encryption.md)
