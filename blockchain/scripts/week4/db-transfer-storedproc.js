 // File: scripts/db-transfer-sp.js
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
   * Transfer funds using stored procedure
   * All business logic is in the database - single call!
   */
  async function transferFunds(fromAccountId, toAccountId, amount, description) {
    try {
      console.log(`\n💸 Processing transfer: ${amount} from account ${fromAccountId} to
  ${toAccountId}`);

      // Single database call - all logic happens in PostgreSQL
      const result = await pool.query(
        'SELECT * FROM transfer_funds($1, $2, $3, $4)',
        [fromAccountId, toAccountId, amount, description]
      );

      const transfer = result.rows[0];

      if (transfer.success) {
        console.log('✅', transfer.message);
        console.log(`   Sender: ${transfer.old_balance_from} → ${transfer.new_balance_from}`);    
        console.log(`   Recipient: → ${transfer.new_balance_to}`);
      } else {
        console.log('❌', transfer.message);
      }

      return transfer;
    } catch (err) {
      console.error('❌ Transfer error:', err.message);
      throw err;
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
      console.log('🏦 FamilyChain Transfer System (Stored Procedure Version)\n');

      // Show initial balances
      await showBalances();

      // Transfer 25 from Alice's checking (id=1) to Charlie's savings (id=3)
      await transferFunds(1, 3, 25, 'Allowance payment via stored procedure');

      // Show updated balances
      await showBalances();

      // Test error handling (insufficient funds)
      console.log('\n🧪 Testing error handling...');
      await transferFunds(3, 1, 10000, 'This should fail');

      // Balances should be unchanged
      await showBalances();

    } catch (err) {
      console.error('Fatal error:', err);
    } finally {
      await pool.end();
    }
  }

  main();