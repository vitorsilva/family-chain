  import  pool  from './connection.js';
  import type { PoolClient } from 'pg';

  // Type definitions
  interface TransferResult {
    transactionId: number;
    fromBalance: string;
    toBalance: string;
    timestamp: Date;
  }

  interface TransactionHistoryItem {
    id: number;
    from_account_id: number | null;
    to_account_id: number | null;
    amount: string;
    currency: string;
    tx_type: string;
    status: string;
    description: string | null;
    created_at: Date;
    entry_type: 'debit' | 'credit';
    balance_before: string;
    balance_after: string;
  }

  interface ReconciliationResult {
    accountId: number;
    calculatedBalance: string;
    actualBalance: string;
    difference: string;
    isBalanced: boolean;
  }

  /**
   * Create a transfer transaction with double-entry bookkeeping
   */
  export async function createTransfer(
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<TransferResult> {
    const client: PoolClient = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Get current balances with row locking
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
        throw new Error(`Insufficient balance. Available: ${fromBalance}, Required: ${amount}`);
      }

      // 2. Create transaction record
      const txResult = await client.query(
        `INSERT INTO transactions (from_account_id, to_account_id, amount, currency, tx_type, status,    
   description, metadata)
         VALUES ($1, $2, $3, $4, 'transfer', 'confirmed', $5, $6)
         RETURNING id, created_at`,
        [fromAccountId, toAccountId, amount, currency, description, JSON.stringify(metadata)]
      );

      const transactionId = txResult.rows[0].id;
      const timestamp = txResult.rows[0].created_at;
      const newFromBalance = fromBalance - amount;
      const newToBalance = toBalance + amount;

      // 3. Create debit ledger entry (from account)
      await client.query(
        `INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount, balance_before,     
  balance_after)
         VALUES ($1, $2, 'debit', $3, $4, $5)`,
        [transactionId, fromAccountId, amount, fromBalance, newFromBalance]
      );

      // 4. Create credit ledger entry (to account)
      await client.query(
        `INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount, balance_before,     
  balance_after)
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
        fromBalance: newFromBalance.toString(),
        toBalance: newToBalance.toString(),
        timestamp,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Create a transfer using stored procedure (single database call)
   */
  export async function createTransferSP(
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<TransferResult> {
    const result = await pool.query(
      `SELECT * FROM create_transfer_transaction($1, $2, $3, $4, $5)`,
      [fromAccountId, toAccountId, amount, description, JSON.stringify(metadata)]
    );

    if (!result.rows[0]) {
      throw new Error('Transfer failed');
    }

    return {
      transactionId: result.rows[0].transaction_id,
      fromBalance: result.rows[0].from_balance,
      toBalance: result.rows[0].to_balance,
      timestamp: result.rows[0].tx_timestamp,
    };
  }

  /**
   * Get transaction history for an account
   */
  export async function getTransactionHistory(
    accountId: number,
    limit: number = 50
  ): Promise<TransactionHistoryItem[]> {
    const result = await pool.query(
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
  export async function reconcileAccountBalance(accountId: number): Promise<ReconciliationResult> {      
    // Calculate balance from ledger entries
    const result = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE -amount END), 0) AS
  calculated_balance
      FROM ledger_entries
      WHERE account_id = $1`,
      [accountId]
    );

    const calculatedBalance = parseFloat(result.rows[0].calculated_balance || '0');

    // Get actual balance
    const accountResult = await pool.query(
      'SELECT balance FROM accounts WHERE id = $1',
      [accountId]
    );

    if (!accountResult.rows[0]) {
      throw new Error(`Account ${accountId} not found`);
    }

    const actualBalance = parseFloat(accountResult.rows[0].balance);
    const difference = actualBalance - calculatedBalance;
    const isBalanced = Math.abs(difference) < 0.00000001; // Allow tiny floating point difference

    return {
      accountId,
      calculatedBalance: calculatedBalance.toFixed(8),
      actualBalance: actualBalance.toFixed(8),
      difference: difference.toFixed(8),
      isBalanced,
    };
  }