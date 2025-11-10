  import { createTransfer, createTransferSP } from './transactions.js';
  import  pool  from './connection.js';

  async function resetDatabase() {
    // Reset to known state
    await pool.query(`
      TRUNCATE TABLE ledger_entries CASCADE;
      TRUNCATE TABLE transactions CASCADE;
    `);

    await pool.query(`
      UPDATE accounts SET balance =
        CASE id
          WHEN 1 THEN 100.00
          WHEN 2 THEN 100.00
          ELSE 0.00
        END;
    `);
  }

  async function benchmarkTransfers() {
    console.log('=== Benchmarking Transfer Methods ===\n');

    // Test 1: Application-level transaction
    console.log('1. Testing Application-Level Transaction...');
    await resetDatabase();

    const iterations = 100;
    const startApp = Date.now();

    for (let i = 0; i < iterations; i++) {
      try {
        await createTransfer(1, 2, 0.01, `Test transfer ${i}`, { iteration: i });
      } catch (err) {
        console.error(`Error at iteration ${i}:`, err);
        break;
      }
    }

    const endApp = Date.now();
    const appTime = endApp - startApp;
    const appAvg = appTime / iterations;

    console.log(`✅ Completed ${iterations} transfers`);
    console.log(`   Total time: ${appTime}ms`);
    console.log(`   Average: ${appAvg.toFixed(2)}ms per transfer`);

    // Verify balances
    const appResult = await pool.query('SELECT balance FROM accounts WHERE id IN (1, 2) ORDER BY id');
    console.log(`   Final balances: Account 1 = ${appResult.rows[0].balance}, Account 2 = ${appResult.rows[1].balance}`);

    // Test 2: Stored procedure
    console.log('\n2. Testing Stored Procedure...');
    await resetDatabase();

    const startSP = Date.now();

    for (let i = 0; i < iterations; i++) {
      try {
        await createTransferSP(1, 2, 0.01, `Test transfer ${i}`, { iteration: i });
      } catch (err) {
        console.error(`Error at iteration ${i}:`, err);
        break;
      }
    }

    const endSP = Date.now();
    const spTime = endSP - startSP;
    const spAvg = spTime / iterations;

    console.log(`✅ Completed ${iterations} transfers`);
    console.log(`   Total time: ${spTime}ms`);
    console.log(`   Average: ${spAvg.toFixed(2)}ms per transfer`);

    // Verify balances
    const spResult = await pool.query('SELECT balance FROM accounts WHERE id IN (1, 2) ORDER BY id');
    console.log(`   Final balances: Account 1 = ${spResult.rows[0].balance}, Account 2 = ${spResult.rows[1].balance}`);

    // Comparison
    console.log('\n=== Performance Comparison ===');
    console.log(`Application-level: ${appTime}ms (${appAvg.toFixed(2)}ms avg)`);
    console.log(`Stored procedure:  ${spTime}ms (${spAvg.toFixed(2)}ms avg)`);

    const speedup = ((appTime - spTime) / appTime * 100).toFixed(1);
    const faster = appTime > spTime ? 'Stored procedure' : 'Application-level';
    const difference = Math.abs(appTime - spTime);

    console.log(`\n🚀 ${faster} is ${speedup}% faster (${difference}ms saved on
  ${iterations} transfers)`);

    process.exit(0);
  }

  benchmarkTransfers().catch(err => {
    console.error('Benchmark failed:', err);
    process.exit(1);
  });