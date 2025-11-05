import { Redis } from 'ioredis';

// Create Redis cliente
const redis = new Redis({
    host: 'localhost',
    port: 6379, 
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});


// Handle connection events
redis.on('connect', () => {
    console.log('✅ Redis connected');
});

redis.on('error', (err) => {
    console.error('❌ Redis error:', err);
});

// Export client
export default redis;