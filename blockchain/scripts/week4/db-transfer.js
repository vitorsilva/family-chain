  // File: scripts/db-transfer.js
  import pg from 'pg';
  import dotenv from 'dotenv';

  dotenv.config();

  const { Pool } = pg;

  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'familychain',
    password: process.env.DB_PASSWORD,
    port: 5432,
  });

  /**
   * Transfer funds between two accounts atomically
   * This demonstrates proper database transaction handling
   */
  async function transferFunds(fromAccountId, toAccountId, amount, description) {
    // Get a client from the pool
    const client = await pool.connect();

    try {
      // Start transaction
      await client.query('BEGIN');

      console.log(`\n💸 Processing transfer: ${amount} from account ${fromAccountId} to
  ${toAccountId}`);

      // 1. Check sender's balance (use FOR UPDATE to lock the row)
      const senderResult = await client.query(
        'SELECT balance FROM accounts WHERE id = $1 FOR UPDATE',
        [fromAccountId]
      );

      if (senderResult.rows.length === 0) {
        throw new Error(`Sender account ${fromAccountId} not found`);
      }

      const senderBalance = parseFloat(senderResult.rows[0].balance);
      console.log(`📊 Sender balance: ${senderBalance}`);

      if (senderBalance < amount) {
        throw new Error(`Insufficient funds: ${senderBalance} < ${amount}`);
      }

      // 2. Deduct from sender's balance
      await client.query(
        'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
        [amount, fromAccountId]
      );
      console.log(`✅ Deducted ${amount} from account ${fromAccountId}`);

      // 3. Add to recipient's balance
      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [amount, toAccountId]
      );
      console.log(`✅ Added ${amount} to account ${toAccountId}`);

      // 4. Record the withdrawal transaction
      await client.query(
        'INSERT INTO transactions (account_id, amount, tx_type, description) VALUES ($1, $2, $3, $4)',
        [fromAccountId, -amount, 'transfer', description]
      );

      // 5. Record the deposit transaction
      await client.query(
        'INSERT INTO transactions (account_id, amount, tx_type, description) VALUES ($1, $2, $3, $4)',
        [toAccountId, amount, 'transfer', description]
      );
      console.log('✅ Transactions recorded');

      // Commit transaction
      await client.query('COMMIT');
      console.log('✅ Transfer completed successfully!\n');

    } catch (err) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error('❌ Transfer failed:', err.message);
      console.error('🔄 All changes rolled back\n');
      throw err;
    } finally {
      // Release client back to pool
      client.release();
    }
  }

  /**
   * Display account balances
   */
  async function showBalances() {
    const result = await pool.query(`
      SELECT
        fm.name,
        a.id,
        a.account_type,
        a.balance,
        a.currency
      FROM accounts a
      JOIN family_members fm ON a.member_id = fm.id
      ORDER BY fm.name, a.account_type
    `);

    console.log('💰 Current Account Balances:');
    console.log('─'.repeat(70));
    result.rows.forEach(row => {
      console.log(`Account ${row.id}: ${row.name} (${row.account_type}) - ${row.balance}
  ${row.currency}`);
    });
    console.log('─'.repeat(70));
  }

  async function main() {
    try {
      console.log('🏦 FamilyChain Transfer System\n');

      // Show initial balances
      await showBalances();

      // Transfer 100 from Alice's checking (id=1) to Charlie's savings (id=3)
      await transferFunds(1, 3, 100, 'Allowance payment to Charlie');

      // Show updated balances
      await showBalances();

      // Try an invalid transfer (should fail and rollback)
      console.log('\n🧪 Testing error handling (insufficient funds)...');
      try {
        await transferFunds(3, 1, 10000, 'This should fail');
      } catch (err) {
        console.log('Expected error caught ✅\n');
      }

      // Balances should be unchanged after failed transfer
      await showBalances();

    } catch (err) {
      console.error('Fatal error:', err);
    } finally {
      await pool.end();
    }
  }

  main();