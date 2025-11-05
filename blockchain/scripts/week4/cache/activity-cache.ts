 import redis from './redis.js';

  const MAX_RECENT_ITEMS = 100;

  /**
   * Add transaction to recent activity
   */
  async function addRecentTransaction(memberId: number, txData: any) {       
    const key = `activity:${memberId}:recent`;

    // Add to list (newest first)
    await redis.lpush(key, JSON.stringify(txData));

    // Keep only last 100
    await redis.ltrim(key, 0, MAX_RECENT_ITEMS - 1);

    // Set expiration (7 days)
    await redis.expire(key, 7 * 24 * 60 * 60);

    console.log(`Added transaction to ${key}`);
  }

  /**
   * Get recent transactions
   */
  async function getRecentTransactions(memberId: number, limit: number =     
  10) {
    const key = `activity:${memberId}:recent`;

    // Get first N items
    const items = await redis.lrange(key, 0, limit - 1);

    // Parse JSON
    return items.map(item => JSON.parse(item));
  }

  export { addRecentTransaction, getRecentTransactions };