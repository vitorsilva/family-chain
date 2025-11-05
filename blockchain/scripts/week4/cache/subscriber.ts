  import { Redis } from 'ioredis';

  // Create separate client for subscribing
  const subscriber = new Redis();

  async function startSubscriber() {
    // Subscribe to channels
    await subscriber.subscribe('blockchain:transaction', 'blockchain:balance');

    console.log('✅ Subscribed to blockchain events\n');
    console.log('Listening for events... (Press Ctrl+C to stop)\n');

    // Handle messages
    subscriber.on('message', (channel, message) => {
      const data = JSON.parse(message);
      console.log(`📨 Received on ${channel}:`);
      console.log(data);
      console.log();
    });
  }

  startSubscriber();