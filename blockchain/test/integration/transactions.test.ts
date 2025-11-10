
  import { expect } from 'chai';
  import { createTransfer, getTransactionHistory, reconcileAccountBalance } from
  '../../scripts/week4/db/transactions.js';
  import  { pool, adminPool }  from '../../scripts/week4/db/connection.js';

describe('Double-Entry Bookkeeping Transactions', function () {
    this.timeout(10000);

    // Test account IDs
    let testAccountFrom: number;
    let testAccountTo: number;

  before(async function () {
    // Create test accounts with initial balances
    console.log('\n📝 Setting up test accounts...');

    const client = await adminPool.connect();
    try {
      await client.query('BEGIN');

      // Create "from" account with 1000 ETH
      const fromResult = await client.query(
        `INSERT INTO accounts (member_id, account_type, balance,
   currency)
         VALUES (1, 'checking', 1000, 'ETH')
         RETURNING id`,
      );
      testAccountFrom = fromResult.rows[0].id;

      // Create "to" account with 100 ETH
      const toResult = await client.query(
        `INSERT INTO accounts (member_id, account_type, balance,
   currency)
         VALUES (2, 'savings', 100, 'ETH')
         RETURNING id`,
      );
      testAccountTo = toResult.rows[0].id;

      // Create initial deposit transactions (so ledger entries exist) 
      const fromTxResult = await client.query(
        `INSERT INTO transactions (from_account_id,
  to_account_id, amount, currency, tx_type, status, description)
         VALUES (NULL, $1, 1000, 'ETH', 'deposit', 'confirmed',
  'Initial test balance')
         RETURNING id`,
        [testAccountFrom]
      );
      const fromTxId = fromTxResult.rows[0].id;

      const toTxResult = await client.query(
        `INSERT INTO transactions (from_account_id,
  to_account_id, amount, currency, tx_type, status, description)
         VALUES (NULL, $1, 100, 'ETH', 'deposit', 'confirmed',
  'Initial test balance')
         RETURNING id`,
        [testAccountTo]
      );
      const toTxId = toTxResult.rows[0].id;

      // Create ledger entries for initial balances (credit entries = money in)
      await client.query(
        `INSERT INTO ledger_entries (transaction_id, account_id,
   entry_type, amount, balance_before, balance_after)
         VALUES ($1, $2, 'credit', 1000, 0, 1000)`,
        [fromTxId, testAccountFrom]
      );

      await client.query(
        `INSERT INTO ledger_entries (transaction_id, account_id,
   entry_type, amount, balance_before, balance_after)
         VALUES ($1, $2, 'credit', 100, 0, 100)`,
        [toTxId, testAccountTo]
      );

      await client.query('COMMIT');

      console.log(`✅ Test accounts created: ${testAccountFrom}
  (checking, 1000 ETH), ${testAccountTo} (savings, 100 ETH)`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });

    after(async function () {
      // Clean up test accounts and related data
      console.log('\n🧹 Cleaning up test data...');

      // Delete ledger entries first (foreign key constraint)
      await adminPool.query(
        `DELETE FROM ledger_entries
         WHERE account_id IN ($1, $2)`,
        [testAccountFrom, testAccountTo]
      );

      // Delete transactions
      await adminPool.query(
        `DELETE FROM transactions
         WHERE from_account_id IN ($1, $2)
            OR to_account_id IN ($1, $2)`,
        [testAccountFrom, testAccountTo]
      );

      // Delete test accounts
      await adminPool.query(
        'DELETE FROM accounts WHERE id IN ($1, $2)',
        [testAccountFrom, testAccountTo]
      );

      console.log('✅ Test data cleaned up');

      // Close database connection (this test runs last alphabetically)
      await pool.end();
    });

  describe('createTransfer()', function () {

    it('should create a transfer with double-entry ledger entries', async function () { 
      const amount = 0.5;

      const transfer = await createTransfer(
        testAccountFrom,  // ← Changed
        testAccountTo,    // ← Changed
        amount,
        'Test transfer',
        { source: 'mocha_test' }
      );

      expect(transfer).to.have.property('transactionId');
      expect(transfer).to.have.property('fromBalance');
      expect(transfer).to.have.property('toBalance');
      expect(transfer).to.have.property('timestamp');
    });

    it('should update account balances correctly', async function () {
      const amount = 1.0;

      // Get balances before
      const aliceBefore = await pool.query('SELECT balance FROM accounts WHERE id = $1', [testAccountFrom]);  // ← Changed
      const bobBefore = await pool.query('SELECT balance FROM accounts WHERE id = $1', [testAccountTo]);      // ← Changed

      const aliceBalanceBefore = parseFloat(aliceBefore.rows[0].balance);
      const bobBalanceBefore = parseFloat(bobBefore.rows[0].balance);

      // Create transfer
      const transfer = await createTransfer(
        testAccountFrom,  // ← Changed
        testAccountTo,    // ← Changed
        amount,
        'Balance update test'
      );

      // Verify balances changed correctly
      expect(parseFloat(transfer.fromBalance)).to.equal(aliceBalanceBefore - amount);   
      expect(parseFloat(transfer.toBalance)).to.equal(bobBalanceBefore + amount);       
    });

    it('should create both debit and credit ledger entries', async function () {        
      const amount = 0.25;

      const transfer = await createTransfer(
        testAccountFrom,  // ← Changed
        testAccountTo,    // ← Changed
        amount,
        'Ledger entry test'
      );

      // Verify ledger entries exist
      const ledgerEntries = await pool.query(
        'SELECT * FROM ledger_entries WHERE transaction_id = $1 ORDER BY entry_type',   
        [transfer.transactionId]
      );

      expect(ledgerEntries.rows).to.have.length(2);

      // Check credit entry
      const creditEntry = ledgerEntries.rows.find((e: any) => e.entry_type === 'credit');
      expect(creditEntry).to.exist;
      expect(creditEntry.account_id).to.equal(testAccountTo);  // ← Changed
      expect(parseFloat(creditEntry.amount)).to.equal(amount);

      // Check debit entry
      const debitEntry = ledgerEntries.rows.find((e: any) => e.entry_type === 'debit'); 
      expect(debitEntry).to.exist;
      expect(debitEntry.account_id).to.equal(testAccountFrom);  // ← Changed
      expect(parseFloat(debitEntry.amount)).to.equal(amount);
    });

    it('should record balance_before and balance_after in ledger', async function () {  
      const amount = 0.1;

      // Get balance before
      const beforeResult = await pool.query('SELECT balance FROM accounts WHERE id = $1', [testAccountFrom]);  // ← Changed
      const balanceBefore = parseFloat(beforeResult.rows[0].balance);

      const transfer = await createTransfer(
        testAccountFrom,  // ← Changed
        testAccountTo,    // ← Changed
        amount,
        'Balance tracking test'
      );

      // Check debit ledger entry
      const ledgerEntry = await pool.query(
        `SELECT * FROM ledger_entries
         WHERE transaction_id = $1 AND entry_type = 'debit'`,
        [transfer.transactionId]
      );

      expect(parseFloat(ledgerEntry.rows[0].balance_before)).to.equal(balanceBefore);   
      expect(parseFloat(ledgerEntry.rows[0].balance_after)).to.equal(balanceBefore - amount);
    });

    it('should throw error for insufficient balance', async function () {
      const hugeAmount = 999999;

      try {
        await createTransfer(
          testAccountFrom,  // ← Changed
          testAccountTo,    // ← Changed
          hugeAmount,
          'Should fail - insufficient funds'
        );
        expect.fail('Should have thrown error');
      } catch (err) {
        expect(err).to.be.an('error');
        expect((err as Error).message).to.include('Insufficient balance');
      }
    });

    it('should throw error for non-existent account', async function () {
      const nonExistentAccount = 999999;

      try {
        await createTransfer(
          nonExistentAccount,
          testAccountTo,  // ← Changed
          1.0,
          'Should fail - account not found'
        );
        expect.fail('Should have thrown error');
      } catch (err) {
        expect(err).to.be.an('error');
        expect((err as Error).message).to.include('Account not found');
      }
    });

    it('should rollback on error (atomicity)', async function () {
      // Get balance before
      const beforeResult = await pool.query('SELECT balance FROM accounts WHERE id = $1', [testAccountFrom]);  // ← Changed
      const balanceBefore = parseFloat(beforeResult.rows[0].balance);

      // Try invalid transfer
      try {
        await createTransfer(testAccountFrom, testAccountTo, 999999, 'Will fail');  // ← Changed
      } catch (err) {
        // Expected to fail
      }

      // Verify balance unchanged (rollback worked)
      const afterResult = await pool.query('SELECT balance FROM accounts WHERE id = $1', [testAccountFrom]);  // ← Changed
      const balanceAfter = parseFloat(afterResult.rows[0].balance);

      expect(balanceAfter).to.equal(balanceBefore);
    });

    it('should store metadata as JSON', async function () {
      const metadata = { source: 'mocha_test', category: 'allowance', recurring: true };

      const transfer = await createTransfer(
        testAccountFrom,  // ← Changed
        testAccountTo,    // ← Changed
        0.5,
        'Metadata test',
        metadata
      );

      // Verify metadata stored
      const txResult = await pool.query(
        'SELECT metadata FROM transactions WHERE id = $1',
        [transfer.transactionId]
      );

      const storedMetadata = txResult.rows[0].metadata;
      expect(storedMetadata).to.deep.equal(metadata);
    });
  });

  describe('getTransactionHistory()', function () {

    let testTransactionId: number;

    before(async function () {
      // Create a test transaction
      const transfer = await createTransfer(
        testAccountFrom,  // ← Changed
        testAccountTo,    // ← Changed
        0.75,
        'History test transaction'
      );
      testTransactionId = transfer.transactionId;
    });

    it('should return transaction history for account', async function () {
      const history = await getTransactionHistory(testAccountFrom, 5);  // ← Changed    

      expect(history).to.be.an('array');
      expect(history.length).to.be.greaterThan(0);
    });

    it('should include ledger entry details', async function () {
      const history = await getTransactionHistory(testAccountFrom, 10);  // ← Changed   

      const transaction = history[0];
      expect(transaction).to.have.property('entry_type');
      expect(transaction).to.have.property('balance_before');
      expect(transaction).to.have.property('balance_after');
    });

    it('should show debit entry for sender account', async function () {
      const history = await getTransactionHistory(testAccountFrom, 10);  // ← Changed   

      // Find our test transaction
      const testTx = history.find((tx: any) => tx.id === testTransactionId);

      expect(testTx).to.exist;
      expect(testTx!.entry_type).to.equal('debit');
      expect(testTx!.from_account_id).to.equal(testAccountFrom);  // ← Changed
    });

    it('should show credit entry for recipient account', async function () {
      const history = await getTransactionHistory(testAccountTo, 10);  // ← Changed     

      // Find our test transaction
      const testTx = history.find((tx: any) => tx.id === testTransactionId);

      expect(testTx).to.exist;
      expect(testTx!.entry_type).to.equal('credit');
      expect(testTx!.to_account_id).to.equal(testAccountTo);  // ← Changed
    });

    it('should respect limit parameter', async function () {
      const limit = 3;
      const history = await getTransactionHistory(testAccountFrom, limit);  // ← Changed

      expect(history.length).to.be.at.most(limit);
    });

    it('should return most recent transactions first', async function () {
      const history = await getTransactionHistory(testAccountFrom, 5);  // ← Changed    

      if (history.length > 1) {
        const first = new Date(history[0].created_at).getTime();
        const second = new Date(history[1].created_at).getTime();

        expect(first).to.be.greaterThanOrEqual(second);
      }
    });
  });

  describe('reconcileAccountBalance()', function () {

    it('should reconcile account balance correctly', async function () {
      const reconciliation = await reconcileAccountBalance(testAccountFrom);  // ← Changed

      expect(reconciliation).to.have.property('accountId');
      expect(reconciliation).to.have.property('calculatedBalance');
      expect(reconciliation).to.have.property('actualBalance');
      expect(reconciliation).to.have.property('difference');
      expect(reconciliation).to.have.property('isBalanced');
    });

    it('should show isBalanced=true when balances match', async function () {
      const reconciliation = await reconcileAccountBalance(testAccountFrom);  // ← Changed

      // Debug output
      if (!reconciliation.isBalanced) {
        console.log('\n⚠️  Balance mismatch detected:');
        console.log('  Account ID:', reconciliation.accountId);
        console.log('  Calculated:', reconciliation.calculatedBalance);
        console.log('  Actual:', reconciliation.actualBalance);
        console.log('  Difference:', reconciliation.difference);
      }

      expect(reconciliation.isBalanced).to.be.true;
      expect(parseFloat(reconciliation.difference)).to.equal(0);
    });

    it('should calculate balance from ledger entries', async function () {
      const reconciliation = await reconcileAccountBalance(testAccountFrom);  // ← Changed

      expect(reconciliation.calculatedBalance).to.be.a('string');
      expect(parseFloat(reconciliation.calculatedBalance)).to.be.a('number');
    });

    it('should work for both sender and recipient accounts', async function () {        
      const aliceReconciliation = await reconcileAccountBalance(testAccountFrom);  // ← Changed
      const bobReconciliation = await reconcileAccountBalance(testAccountTo);      // ← Changed

      // Debug output
      if (!aliceReconciliation.isBalanced) {
        console.log('\n⚠️  Test account FROM balance mismatch:');
        console.log('  Calculated:', aliceReconciliation.calculatedBalance);
        console.log('  Actual:', aliceReconciliation.actualBalance);
        console.log('  Difference:', aliceReconciliation.difference);
      }

      if (!bobReconciliation.isBalanced) {
        console.log('\n⚠️  Test account TO balance mismatch:');
        console.log('  Calculated:', bobReconciliation.calculatedBalance);
        console.log('  Actual:', bobReconciliation.actualBalance);
        console.log('  Difference:', bobReconciliation.difference);
      }

      expect(aliceReconciliation.isBalanced).to.be.true;
      expect(bobReconciliation.isBalanced).to.be.true;
    });
  });
});
