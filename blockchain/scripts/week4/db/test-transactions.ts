  import { createTransfer, getTransactionHistory, reconcileAccountBalance } from './transactions.js';    

  async function testTransactions() {
    try {
      console.log('=== Testing Double-Entry Transfers ===\n');

      // Create a transfer
      console.log('1. Creating transfer: Account 1 → Account 2 (0.5 ETH)');
      const transfer = await createTransfer(
        1,   // from
        2,   // to
        0.5, // amount
        'Test transfer',
        { source: 'manual_test' }
      );
      console.log('Transfer created:', transfer);

      // Get transaction history
      console.log('\n2. Transaction history for account 1:');
      const history1 = await getTransactionHistory(1, 5);
      console.log(history1);

      console.log('\n3. Transaction history for account 2:');
      const history2 = await getTransactionHistory(2, 5);
      console.log(history2);

      // Reconcile balances
      console.log('\n4. Reconciling account 1:');
      const reconcile1 = await reconcileAccountBalance(1);
      console.log(reconcile1);

      console.log('\n5. Reconciling account 2:');
      const reconcile2 = await reconcileAccountBalance(2);
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