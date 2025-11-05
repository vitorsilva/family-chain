 import { getBalanceWithCache } from './balance-cache.js';

  async function testCaching() {
    try {
      console.log('=== Testing Cache-Aside Pattern ===\n');

      // First call - should be cache miss
      console.log('1. First call (should be cache miss):');
      const balances1 = await getBalanceWithCache(1);
      console.log('Balances:', balances1);

      // Second call - should be cache hit
      console.log('\n2. Second call (should be cache hit):');
      const balances2 = await getBalanceWithCache(1);
      console.log('Balances:', balances2);

      // Third call - different member (cache miss)
      console.log('\n3. Different member (should be cache miss):');
      const balances3 = await getBalanceWithCache(2);
      console.log('Balances:', balances3);

      console.log('\n✅ Caching test complete!');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error:', err);
      process.exit(1);
    }
  }

  testCaching();