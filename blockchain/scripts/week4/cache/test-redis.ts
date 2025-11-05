import redis from './redis.js';

async function testRedis() {

    try {
      console.log('Testing Redis connection...\n');

      // Test 1: Set a value
      await redis.set('test:key', 'Hello from Node.js!');
      console.log('✅ SET test:key');

      // Test 2: Get the value
      const value = await redis.get('test:key');
      console.log('✅ GET test:key =', value);

      // Test 3: Delete the key
      await redis.del('test:key');
      console.log('✅ DEL test:key');

      console.log('\n✅ All tests passed!');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error:', err);
      process.exit(1);
    }

}

testRedis();
