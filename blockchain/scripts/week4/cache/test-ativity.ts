import { addRecentTransaction, getRecentTransactions } from
  './activity-cache.js';

  async function testActivity() {
    try {
      console.log('=== Testing Redis Lists for Activity ===\n');

      // Add some transactions
      console.log('Adding transactions...');
      await addRecentTransaction(1, {
        txHash: '0xabc123',
        amount: '1.5',
        type: 'deposit',
        timestamp: Date.now(),
      });

      await addRecentTransaction(1, {
        txHash: '0xdef456',
        amount: '0.5',
        type: 'withdrawal',
        timestamp: Date.now(),
      });

      await addRecentTransaction(1, {
        txHash: '0xghi789',
        amount: '2.0',
        type: 'transfer',
        timestamp: Date.now(),
      });

      // Get recent transactions
      console.log('\nGetting last 2 transactions:');
      const recent = await getRecentTransactions(1, 2);
      console.log(recent);

      console.log('\n✅ Activity cache test complete!');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error:', err);
      process.exit(1);
    }
  }

  testActivity();