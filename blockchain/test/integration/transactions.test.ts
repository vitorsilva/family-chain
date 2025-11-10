
  import { expect } from 'chai';
  import { createTransfer, getTransactionHistory, reconcileAccountBalance } from
  '../../scripts/week4/db/transactions.js';
  import  pool  from '../../scripts/week4/db/connection.js';

  describe('Double-Entry Bookkeeping Transactions', function () {
    this.timeout(10000);

    // Test account IDs (assuming these exist from database initialization)
    const ALICE_CHECKING = 1;
    const BOB_SAVINGS = 2;

    // Store initial balances for cleanup
    let aliceInitialBalance: number;
    let bobInitialBalance: number;

    before(async function () {
      // Get initial balances
      const aliceResult = await pool.query('SELECT balance FROM accounts WHERE id = $1',
   [ALICE_CHECKING]);
      const bobResult = await pool.query('SELECT balance FROM accounts WHERE id = $1',
  [BOB_SAVINGS]);

      aliceInitialBalance = parseFloat(aliceResult.rows[0]?.balance || '0');
      bobInitialBalance = parseFloat(bobResult.rows[0]?.balance || '0');
    });

    after(async function () {
      // Close database connection
      await pool.end();
    });

    describe('createTransfer()', function () {

      it('should create a transfer with double-entry ledger entries', async function ()
  {
        const amount = 0.5;

        const transfer = await createTransfer(
          ALICE_CHECKING,
          BOB_SAVINGS,
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
        const aliceBefore = await pool.query('SELECT balance FROM accounts WHERE id =  $1', [ALICE_CHECKING]);
        const bobBefore = await pool.query('SELECT balance FROM accounts WHERE id = $1', [BOB_SAVINGS]);

        const aliceBalanceBefore = parseFloat(aliceBefore.rows[0].balance);
        const bobBalanceBefore = parseFloat(bobBefore.rows[0].balance);

        // Create transfer
        const transfer = await createTransfer(
          ALICE_CHECKING,
          BOB_SAVINGS,
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
          ALICE_CHECKING,
          BOB_SAVINGS,
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
        const creditEntry = ledgerEntries.rows.find((e: any) => e.entry_type ===
  'credit');
        expect(creditEntry).to.exist;
        expect(creditEntry.account_id).to.equal(BOB_SAVINGS);
        expect(parseFloat(creditEntry.amount)).to.equal(amount);

        // Check debit entry
        const debitEntry = ledgerEntries.rows.find((e: any) => e.entry_type ===
  'debit');
        expect(debitEntry).to.exist;
        expect(debitEntry.account_id).to.equal(ALICE_CHECKING);
        expect(parseFloat(debitEntry.amount)).to.equal(amount);
      });

      it('should record balance_before and balance_after in ledger', async function () {
        const amount = 0.1;

        // Get balance before
        const beforeResult = await pool.query('SELECT balance FROM accounts WHERE id = $1', [ALICE_CHECKING]);
        const balanceBefore = parseFloat(beforeResult.rows[0].balance);

        const transfer = await createTransfer(
          ALICE_CHECKING,
          BOB_SAVINGS,
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
        expect(parseFloat(ledgerEntry.rows[0].balance_after)).to.equal(balanceBefore -
  amount);
      });

      it('should throw error for insufficient balance', async function () {
        const hugeAmount = 999999;

        try {
          await createTransfer(
            ALICE_CHECKING,
            BOB_SAVINGS,
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
            BOB_SAVINGS,
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
        const beforeResult = await pool.query('SELECT balance FROM accounts WHERE id = $1', [ALICE_CHECKING]);
        const balanceBefore = parseFloat(beforeResult.rows[0].balance);

        // Try invalid transfer
        try {
          await createTransfer(ALICE_CHECKING, BOB_SAVINGS, 999999, 'Will fail');
        } catch (err) {
          // Expected to fail
        }

        // Verify balance unchanged (rollback worked)
        const afterResult = await pool.query('SELECT balance FROM accounts WHERE id = $1', [ALICE_CHECKING]);
        const balanceAfter = parseFloat(afterResult.rows[0].balance);

        expect(balanceAfter).to.equal(balanceBefore);
      });

      it('should store metadata as JSON', async function () {
        const metadata = { source: 'mocha_test', category: 'allowance', recurring: true
  };

        const transfer = await createTransfer(
          ALICE_CHECKING,
          BOB_SAVINGS,
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
          ALICE_CHECKING,
          BOB_SAVINGS,
          0.75,
          'History test transaction'
        );
        testTransactionId = transfer.transactionId;
      });

      it('should return transaction history for account', async function () {
        const history = await getTransactionHistory(ALICE_CHECKING, 5);

        expect(history).to.be.an('array');
        expect(history.length).to.be.greaterThan(0);
      });

      it('should include ledger entry details', async function () {
        const history = await getTransactionHistory(ALICE_CHECKING, 10);

        const transaction = history[0];
        expect(transaction).to.have.property('entry_type');
        expect(transaction).to.have.property('balance_before');
        expect(transaction).to.have.property('balance_after');
      });

      it('should show debit entry for sender account', async function () {
        const history = await getTransactionHistory(ALICE_CHECKING, 10);

        // Find our test transaction
        const testTx = history.find((tx: any) => tx.id === testTransactionId);

        expect(testTx).to.exist;
        expect(testTx!.entry_type).to.equal('debit');
        expect(testTx!.from_account_id).to.equal(ALICE_CHECKING);
      });

      it('should show credit entry for recipient account', async function () {
        const history = await getTransactionHistory(BOB_SAVINGS, 10);

        // Find our test transaction
        const testTx = history.find((tx: any) => tx.id === testTransactionId);

        expect(testTx).to.exist;
        expect(testTx!.entry_type).to.equal('credit');
        expect(testTx!.to_account_id).to.equal(BOB_SAVINGS);
      });

      it('should respect limit parameter', async function () {
        const limit = 3;
        const history = await getTransactionHistory(ALICE_CHECKING, limit);

        expect(history.length).to.be.at.most(limit);
      });

      it('should return most recent transactions first', async function () {
        const history = await getTransactionHistory(ALICE_CHECKING, 5);

        if (history.length > 1) {
          const first = new Date(history[0].created_at).getTime();
          const second = new Date(history[1].created_at).getTime();

          expect(first).to.be.greaterThanOrEqual(second);
        }
      });
    });

    describe('reconcileAccountBalance()', function () {

      it('should reconcile account balance correctly', async function () {
        const reconciliation = await reconcileAccountBalance(ALICE_CHECKING);

        expect(reconciliation).to.have.property('accountId');
        expect(reconciliation).to.have.property('calculatedBalance');
        expect(reconciliation).to.have.property('actualBalance');
        expect(reconciliation).to.have.property('difference');
        expect(reconciliation).to.have.property('isBalanced');
      });

      it('should show isBalanced=true when balances match', async function () {
        const reconciliation = await reconcileAccountBalance(ALICE_CHECKING);

        expect(reconciliation.isBalanced).to.be.true;
        expect(parseFloat(reconciliation.difference)).to.equal(0);
      });

      it('should calculate balance from ledger entries', async function () {
        const reconciliation = await reconcileAccountBalance(ALICE_CHECKING);

        expect(reconciliation.calculatedBalance).to.be.a('string');
        expect(parseFloat(reconciliation.calculatedBalance)).to.be.a('number');
      });

      it('should work for both sender and recipient accounts', async function () {
        const aliceReconciliation = await reconcileAccountBalance(ALICE_CHECKING);
        const bobReconciliation = await reconcileAccountBalance(BOB_SAVINGS);

        expect(aliceReconciliation.isBalanced).to.be.true;
        expect(bobReconciliation.isBalanced).to.be.true;
      });
    });

    describe('Transaction Integrity', function () {

      it('should maintain accounting equation (debits = credits)', async function () {
        // Get all transactions
        const transactions = await pool.query('SELECT id FROM transactions');

        for (const tx of transactions.rows) {
          const ledgerEntries = await pool.query(
            'SELECT entry_type, amount FROM ledger_entries WHERE transaction_id = $1',
            [tx.id]
          );

          const debits = ledgerEntries.rows
            .filter((e: any) => e.entry_type === 'debit')
            .reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);

          const credits = ledgerEntries.rows
            .filter((e: any) => e.entry_type === 'credit')
            .reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);

          expect(debits).to.equal(credits);
        }
      });
    });
  });