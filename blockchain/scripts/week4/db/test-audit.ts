
  import pool from './connection.js';
  import { createTransfer } from './transactions.js';

  async function testAuditLog() {
    try {
      console.log('=== Testing Audit Logging ===\n');

      // Reset database
      console.log('1. Resetting database to clean state...');
      await pool.query('DELETE FROM audit_log');
      await pool.query(`
        TRUNCATE TABLE ledger_entries CASCADE;
        TRUNCATE TABLE transactions CASCADE;
      `);
      await pool.query(`
        UPDATE accounts SET balance =
          CASE id
            WHEN 1 THEN 10.00
            WHEN 2 THEN 5.00
            ELSE 0.00
          END;
      `);

      // Count audit entries from reset
      const resetCount = await pool.query('SELECT COUNT(*) FROM audit_log WHERE table_name = $1', ['accounts']);
      console.log(`   Audit entries after reset: ${resetCount.rows[0].count}\n`);

      // Test 2: Create a transfer (should audit transactions + accounts tables)
      console.log('2. Creating transfer (should create audit entries)...');
      await createTransfer(1, 2, 1.5, 'Test transfer for audit', { test: true });

      // Check audit log
      console.log('\n3. Audit log entries:\n');

      // Accounts changes
      const accountAudits = await pool.query(`
        SELECT
          id,
          record_id,
          action,
          old_values->>'balance' AS old_balance,
          new_values->>'balance' AS new_balance,
          created_at
        FROM audit_log
        WHERE table_name = 'accounts'
        ORDER BY id DESC
        LIMIT 5
      `);

      console.log('   Account Changes:');
      accountAudits.rows.forEach(row => {
        console.log(`   - Account ${row.record_id}: ${row.old_balance} → ${row.new_balance}     
  (${row.action})`);
      });

      // Transaction inserts
      const txAudits = await pool.query(`
        SELECT
          id,
          record_id,
          action,
          new_values->>'amount' AS amount,
          new_values->>'description' AS description,
          created_at
        FROM audit_log
        WHERE table_name = 'transactions'
        ORDER BY id DESC
        LIMIT 5
      `);

      console.log('\n   Transaction Changes:');
      txAudits.rows.forEach(row => {
        console.log(`   - Transaction ${row.record_id}: ${row.amount} ETH -
  "${row.description}" (${row.action})`);
      });

      // Test 3: Query audit trail for specific account
      console.log('\n4. Full audit trail for Account 1:\n');
      const account1Audit = await pool.query(`
        SELECT
          action,
          old_values->>'balance' AS old_balance,
          new_values->>'balance' AS new_balance,
          to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS timestamp
        FROM audit_log
        WHERE table_name = 'accounts' AND record_id = 1
        ORDER BY created_at ASC
      `);

      account1Audit.rows.forEach(row => {
        if (row.action === 'UPDATE') {
          console.log(`   ${row.timestamp}: ${row.old_balance} → ${row.new_balance}`);
        } else if (row.action === 'INSERT') {
          console.log(`   ${row.timestamp}: Created with balance ${row.new_balance}`);
        }
      });

      // Test 4: Demonstrate JSONB querying
      console.log('\n5. Finding large balance changes (>1 ETH):\n');
      const largeChanges = await pool.query(`
        SELECT
          table_name,
          record_id,
          (new_values->>'balance')::NUMERIC - (old_values->>'balance')::NUMERIC AS change,      
          created_at
        FROM audit_log
        WHERE table_name = 'accounts'
          AND action = 'UPDATE'
          AND ABS((new_values->>'balance')::NUMERIC - (old_values->>'balance')::NUMERIC) >      
  1.0
        ORDER BY created_at DESC
      `);

      if (largeChanges.rows.length > 0) {
        largeChanges.rows.forEach(row => {
          console.log(`   Account ${row.record_id}: ${row.change > 0 ? '+' :
  ''}${row.change} ETH`);
        });
      } else {
        console.log('   No large changes found');
      }

      console.log('\n✅ Audit logging test complete!');
      process.exit(0);
    } catch (err) {
      console.error('Error:', err);
      process.exit(1);
    }
  }

  testAuditLog();