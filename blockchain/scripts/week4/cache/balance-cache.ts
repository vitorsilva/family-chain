import redis from './redis.js';
import pool from '../db/connection.js';

const CACHE_TTL = 60; // 60 seconds

/**
 * Get user balance with caching
 */
async function getBalanceWithCache(memberId: number) {
    const cacheKey = `balance:member:${memberId}`;

    // 1. Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache HIT for member ${memberId}`);
      return JSON.parse(cached);
    }

    // 2. Cache miss - query database
    console.log(`Cache MISS for member ${memberId}`);
    const result = await pool.query(
      `SELECT a.id, a.account_type, a.balance, a.currency
       FROM accounts a
       WHERE a.member_id = $1`,
      [memberId]
    );

    const accounts = result.rows;

    // 3. Store in cache (expires in 60 seconds)
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(accounts));

    return accounts;
  }

  export { getBalanceWithCache };