import { pool }  from './connection.js';
  import {
    linkBlockchainTransaction,
    getBlockchainTransactionDetails,
    getBlockchainTransactionsForMember
  } from './transactions.js';

  async function testBlockchainLink() {
    try {
      console.log('=== Testing Blockchain Transaction Linking ===\n');

      // Get family members with their wallet addresses
      const members = await pool.query('SELECT id, name, wallet_address FROM family_members ORDER BY id');
      console.log('Family members:');
      members.rows.forEach(m => {
        console.log(`  ${m.name}: ${m.wallet_address}`);
      });

      if (members.rows.length < 2) {
        console.log('\n⚠️  Need at least 2 family members with wallet addresses');
        process.exit(1);
      }

      const alice = members.rows[0];
      const bob = members.rows[1];

      console.log('\n1. Simulating blockchain transaction: Alice → Bob (0.5 ETH)');

      // Simulate a real blockchain transaction
      const mockTxHash = '0x' + Math.random().toString(16).substring(2, 66).padEnd(64, '0');      
      const amountWei = '500000000000000000'; // 0.5 ETH in wei
      const blockNumber = 9500000;
      const gasUsed = 21000;
      const gasPriceGwei = '1.5';

      console.log(`   TX Hash: ${mockTxHash}`);
      console.log(`   Block: ${blockNumber}`);
      console.log(`   Gas: ${gasUsed} @ ${gasPriceGwei} gwei`);

      const linked = await linkBlockchainTransaction(
        mockTxHash,
        alice.wallet_address,
        bob.wallet_address,
        amountWei,
        blockNumber,
        gasUsed,
        gasPriceGwei
      );

      console.log(`\n   ✅ Blockchain TX ID: ${linked.blockchainTxId}`);
      console.log(`   ✅ Internal TX ID: ${linked.internalTxId || 'None (accounts not linked)'}`);
      console.log(`   ✅ Amount: ${linked.amountEth} ETH`);

      // Test 2: Get transaction details
      console.log('\n2. Fetching transaction details...\n');
      const details = await getBlockchainTransactionDetails(mockTxHash);

      if (details) {
        console.log('   Blockchain Data:');
        console.log(`     Hash: ${details.tx_hash}`);
        console.log(`     Block: ${details.block_number}`);
        console.log(`     From: ${details.from_address}`);
        console.log(`     To: ${details.to_address}`);
        console.log(`     Amount: ${BigInt(details.amount_wei) / BigInt(1e18)} ETH`);
        console.log(`     Gas: ${details.gas_used} @ ${details.gas_price_gwei} gwei`);
        console.log(`     Confirmations: ${details.confirmations}`);

        if (details.internal_tx_id) {
          console.log('\n   Internal Data:');
          console.log(`     From: ${details.from_name}`);
          console.log(`     To: ${details.to_name}`);
          console.log(`     Type: ${details.tx_type}`);
          console.log(`     Description: ${details.description}`);
        } else {
          console.log('\n   ⚠️  No internal transaction linked (addresses not in system)');       
        }
      }

      // Test 3: Get all blockchain transactions for Alice
      console.log(`\n3. All blockchain transactions for ${alice.name}:\n`);
      const aliceTransactions = await getBlockchainTransactionsForMember(alice.name, 5);

      if (aliceTransactions.length > 0) {
        aliceTransactions.forEach((tx, idx) => {
          console.log(`   ${idx + 1}. ${tx.direction.toUpperCase()} ${tx.amount_eth} ETH`);       
          console.log(`      ${tx.direction === 'sent' ? 'To' : 'From'}: ${tx.counterparty || 'Unknown'}`);
          console.log(`      Block: ${tx.block_number}`);
          console.log(`      Type: ${tx.tx_type || 'N/A'}`);
          console.log(`      TX: ${tx.tx_hash}`);
          console.log('');
        });
      } else {
        console.log('   No blockchain transactions found');
      }

      // Test 4: Demonstrate querying with blockchain proof
      console.log('4. Query: All confirmed transfers with blockchain proof\n');
      const provenTransfers = await pool.query(`
        SELECT
          t.id,
          fm_from.name AS from_name,
          fm_to.name AS to_name,
          t.amount,
          t.description,
          bt.tx_hash,
          bt.block_number,
          bt.confirmations
        FROM transactions t
        JOIN blockchain_transactions bt ON t.tx_hash = bt.tx_hash
        JOIN accounts a_from ON t.from_account_id = a_from.id
        JOIN accounts a_to ON t.to_account_id = a_to.id
        JOIN family_members fm_from ON a_from.member_id = fm_from.id
        JOIN family_members fm_to ON a_to.member_id = fm_to.id
        WHERE bt.confirmations >= 12
        ORDER BY bt.block_number DESC
        LIMIT 5
      `);

      if (provenTransfers.rows.length > 0) {
        provenTransfers.rows.forEach(tx => {
          console.log(`   ${tx.from_name} → ${tx.to_name}: ${tx.amount} ETH`);
          console.log(`     Description: ${tx.description}`);
          console.log(`     Proof: Block ${tx.block_number} (${tx.confirmations} confirmations)`);
          console.log(`     TX: ${tx.tx_hash.substring(0, 20)}...`);
          console.log('');
        });
      } else {
        console.log('   No proven transfers found yet');
      }

      console.log('✅ Blockchain linking test complete!');
      process.exit(0);
    } catch (err) {
      console.error('Error:', err);
      process.exit(1);
    }
  }

  testBlockchainLink();