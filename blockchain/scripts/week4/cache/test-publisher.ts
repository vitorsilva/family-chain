  import { publishBlockchainEvent } from './publisher.js';

  async function testPublish() {
    console.log('Publishing blockchain events...\n');

    await publishBlockchainEvent('transaction', {
      txHash: '0xabc123...',
      from: '0x123...',
      to: '0x456...',
      amount: '1.5 ETH',
    });

    await publishBlockchainEvent('balance', {
      address: '0x123...',
      balance: '10.5 ETH',
    });

    console.log('\n✅ Events published!');
    process.exit(0);
  }

  testPublish();