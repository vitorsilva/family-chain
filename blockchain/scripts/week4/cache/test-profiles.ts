  import { getUserProfile } from './profile-cache.js';

  async function testProfiles() {
    try {
      console.log('=== Testing Redis Hashes for Profiles ===\n');

      // First call - cache miss
      console.log('1. Get Alice profile (cache miss):');
      const start1 = Date.now();
      const alice1 = await getUserProfile(1);
      const elapsed1 = Date.now() - start1;
      console.log(alice1);
      console.log(`⏱️  Time: ${elapsed1}ms`);

      // Second call - cache hit
      console.log('\n2. Get Alice profile again (cache hit):');
      const start2 = Date.now();
      const alice2 = await getUserProfile(1);
      const elapsed2 = Date.now() - start2;
      console.log(alice2);
      console.log(`⏱️  Time: ${elapsed2}ms`);

      // Show speedup
      console.log(`\n🚀 Cache was ${elapsed1 / elapsed2}x faster!`);

      console.log('\n✅ Profile cache test complete!');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error:', err);
      process.exit(1);
    }
  }

  testProfiles();