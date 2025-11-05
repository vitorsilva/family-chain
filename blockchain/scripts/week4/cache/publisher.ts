  import redis from './redis.js';

  // Define allowed event types
  type BlockchainEventType = 'transaction' | 'balance' | 'block';

  /**
   * Publish blockchain event
   */
  async function publishBlockchainEvent(eventType: BlockchainEventType, data: any) {
    const channel = `blockchain:${eventType}`;
    const message = JSON.stringify({
      ...data,
      timestamp: Date.now(),
    });

    const subscriberCount = await redis.publish(channel, message);
    console.log(`📤 Published to ${channel} (${subscriberCount}
  subscribers)`);
  }

  export { publishBlockchainEvent };