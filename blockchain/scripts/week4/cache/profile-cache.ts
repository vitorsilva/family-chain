 import redis from './redis.js';
  import pool from '../db/connection.js';

  /**
   * Cache user profile as hash
   */
  async function cacheUserProfile(memberId: number) {
    const result = await pool.query(
      'SELECT id, name, email, wallet_address, role FROM family_members WHERE id = $1',
      [memberId]
    );

    const profile = result.rows[0];
    if (!profile) {
      throw new Error(`Member ${memberId} not found`);
    }

    // Store as hash
    const cacheKey = `profile:${memberId}`;
    await redis.hset(cacheKey, {
      id: profile.id.toString(),
      name: profile.name,
      email: profile.email,
      wallet_address: profile.wallet_address || '',
      role: profile.role,
    });

    // Set expiration (5 minutes)
    await redis.expire(cacheKey, 300);

    return profile;
  }

  /**
   * Get user profile from cache
   */
  async function getUserProfile(memberId: number) {
    const cacheKey = `profile:${memberId}`;

    // Try cache first
    const cached = await redis.hgetall(cacheKey);
    if (cached && Object.keys(cached).length > 0) {
      console.log(`Cache HIT for profile:${memberId}`);
      return cached;
    }

    // Cache miss - load from database
    console.log(`Cache MISS for profile:${memberId}`);
    return await cacheUserProfile(memberId);
  }

  export { getUserProfile, cacheUserProfile };