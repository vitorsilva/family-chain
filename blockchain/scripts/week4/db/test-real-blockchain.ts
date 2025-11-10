  import { network } from 'hardhat';
  import pool from './connection.js';
  import { linkBlockchainTransaction, getBlockchainTransactionDetails } from
  './transactions.js';

  async function testRealBlockchainLink() {
    try {
      console.log('=== Testing with REAL Sepolia Transaction ===\n');

      // ✅ Explicitly connect to Sepolia network
      console.log('Connecting to Sepolia network...');
      const connection = await network.connect({ network: 'sepolia' });
      const provider = connection.ethers.provider;

      // Verify we're on Sepolia
      const networkInfo = await provider.getNetwork();
      console.log(`✅ Connected to: ${networkInfo.name} (Chain ID: ${networkInfo.chainId})`);

      if (networkInfo.chainId !== 11155111n) {
        console.error('❌ Not connected to Sepolia! Chain ID should be 11155111');
        process.exit(1);
      }

      // Your real transaction from Week 3!
      const txHash = '0x85324acc9e53f71dc1649839db5b33e620eadbdb295f5cc949443c7f084042fa';     

      console.log('\n1. Fetching transaction from Sepolia blockchain...');
      console.log(`   TX Hash: ${txHash}\n`);

      // Fetch transaction details
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!tx || !receipt) {
        console.error('❌ Transaction not found on blockchain');
        console.error('   Make sure you are connected to Sepolia testnet');
        process.exit(1);
      }

      console.log('   ✅ Transaction found on blockchain!');
      console.log(`   From: ${tx.from}`);
      console.log(`   To: ${tx.to}`);
      console.log(`   Value: ${connection.ethers.formatEther(tx.value)} ETH`);
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
      console.log(`   Gas Price: ${connection.ethers.formatUnits(tx.gasPrice || 0n,
  'gwei')} gwei`);

      const currentBlock = await provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;
      console.log(`   Confirmations: ${confirmations}`);

      // Check if already exists in database
      console.log('\n2. Checking if transaction already exists in database...');
      const existing = await pool.query(
        'SELECT id FROM blockchain_transactions WHERE tx_hash = $1',
        [txHash]
      );

      if (existing.rows.length > 0) {
        console.log('   ⚠️  Transaction already in database (ID: ' + existing.rows[0].id +     
  ')');
        console.log('   Skipping insert, fetching details...\n');
      } else {
        console.log('   Transaction not in database yet, linking...\n');

        // Link to database
        const linked = await linkBlockchainTransaction(
          txHash,
          tx.from,
          tx.to || '0x0000000000000000000000000000000000000000',
          tx.value.toString(),
          receipt.blockNumber,
          Number(receipt.gasUsed),
          connection.ethers.formatUnits(tx.gasPrice || 0n, 'gwei')
        );

        console.log('   ✅ Linked to database!');
        console.log(`   Blockchain TX ID: ${linked.blockchainTxId}`);
        console.log(`   Internal TX ID: ${linked.internalTxId || 'None (recipient not in family)'}`);
        console.log(`   Amount: ${linked.amountEth} ETH\n`);
      }

      // Fetch full details
      console.log('3. Fetching linked transaction details...\n');
      const details = await getBlockchainTransactionDetails(txHash);

      if (details) {
        console.log('   📊 Complete Transaction Record:');
        console.log('   ================================');
        console.log(`   Blockchain TX ID: ${details.blockchain_tx_id}`);
        console.log(`   Hash: ${details.tx_hash}`);
        console.log(`   Block: ${details.block_number}`);
        console.log(`   From Address: ${details.from_address}`);
        console.log(`   To Address: ${details.to_address}`);
        console.log(`   Amount (wei): ${details.amount_wei}`);
        console.log(`   Amount (ETH): ${BigInt(details.amount_wei) / BigInt(1e18)}`);
        console.log(`   Gas Used: ${details.gas_used}`);
        console.log(`   Gas Price: ${details.gas_price_gwei} gwei`);
        console.log(`   Confirmations: ${details.confirmations}`);
        console.log(`   Stored At: ${details.blockchain_created_at}`);

        if (details.internal_tx_id) {
          console.log('\n   📝 Internal Transaction:');
          console.log(`   Internal TX ID: ${details.internal_tx_id}`);
          console.log(`   From: ${details.from_name}`);
          console.log(`   To: ${details.to_name}`);
          console.log(`   Type: ${details.tx_type}`);
          console.log(`   Description: ${details.description}`);
        } else {
          console.log('\n   ℹ️  No internal transaction (recipient address not in family_members)');
        }
      }

      // Show how to verify on Etherscan
      console.log('\n4. Verification:');
      console.log(`   🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${txHash}`);       
      console.log(`   🔗 Database has permanent record with ${confirmations}
  confirmations`);

      console.log('\n✅ Real blockchain integration test complete!');
      console.log('   Your database now has verifiable proof from Sepolia blockchain!');       

      process.exit(0);
    } catch (err) {
      console.error('Error:', err);
      process.exit(1);
    }
  }

  testRealBlockchainLink();