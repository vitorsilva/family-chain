 import { ethers, EventLog } from "ethers";
  import { network } from "hardhat";

  const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

  const FAMILY_WALLET_ABI = [
    "event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
    "event Withdrawn(address indexed member, uint256 amount, uint256 remainingBalance, uint256 timestamp)",
  ];

  async function queryHistoricalEventsDebug() {
    console.log("=== Historical Events Query - Debug Mode ===\n");

    const connection = await network.connect("sepolia");
    const provider = connection.ethers.provider;

    const contract = new ethers.Contract(
      FAMILY_WALLET_ADDRESS,
      FAMILY_WALLET_ABI,
      provider
    );

    const currentBlock = await provider.getBlockNumber();
    console.log("📊 Current Block:", currentBlock);
    console.log("📍 Contract Address:", FAMILY_WALLET_ADDRESS);
    console.log("");

    // Strategy 1: Try very small range first (100 blocks)
    console.log("🧪 Test 1: Query last 100 blocks");
    console.log("─────────────────────────────────────");
    try {
      const startBlock1 = currentBlock - 100;
      console.log(`Range: ${startBlock1} → ${currentBlock} (100 blocks)`);

      const start1 = Date.now();
      const events1 = await contract.queryFilter("Deposited", startBlock1,
  currentBlock);
      const elapsed1 = Date.now() - start1;

      console.log(`✅ Success! Found ${events1.length} events in ${elapsed1}ms`);
      console.log("");
    } catch (error: any) {
      console.error(`❌ Failed: ${error.message}`);
      console.log("   Error code:", error.code);
      console.log("   Error details:", JSON.stringify(error, null, 2));
      console.log("");
    }

    // Strategy 2: Try 1,000 blocks
    console.log("🧪 Test 2: Query last 1,000 blocks");
    console.log("─────────────────────────────────────");
    try {
      const startBlock2 = currentBlock - 1000;
      console.log(`Range: ${startBlock2} → ${currentBlock} (1,000 blocks)`);

      const start2 = Date.now();
      const events2 = await contract.queryFilter("Deposited", startBlock2,
  currentBlock);
      const elapsed2 = Date.now() - start2;

      console.log(`✅ Success! Found ${events2.length} events in ${elapsed2}ms`);
      console.log("");
    } catch (error: any) {
      console.error(`❌ Failed: ${error.message}`);
      console.log("   Error code:", error.code);
      console.log("");
    }

    // Strategy 3: Try 5,000 blocks
    console.log("🧪 Test 3: Query last 5,000 blocks");
    console.log("─────────────────────────────────────");
    try {
      const startBlock3 = currentBlock - 5000;
      console.log(`Range: ${startBlock3} → ${currentBlock} (5,000 blocks)`);

      const start3 = Date.now();
      const events3 = await contract.queryFilter("Deposited", startBlock3,
  currentBlock);
      const elapsed3 = Date.now() - start3;

      console.log(`✅ Success! Found ${events3.length} events in ${elapsed3}ms`);
      console.log("");
    } catch (error: any) {
      console.error(`❌ Failed: ${error.message}`);
      console.log("   Error code:", error.code);
      console.log("");
    }

    // Strategy 4: Try with specific block range where we KNOW events exist
    console.log("🧪 Test 4: Query specific block with known event");
    console.log("─────────────────────────────────────");
    try {
      // Use the block from our recent successful deposit
      const knownBlock = 9676734; // From verify-latest-event.ts
      console.log(`Range: ${knownBlock} → ${knownBlock + 10} (10 blocks around known        
  event)`);

      const start4 = Date.now();
      const events4 = await contract.queryFilter("Deposited", knownBlock, knownBlock +      
  10);
      const elapsed4 = Date.now() - start4;

      console.log(`✅ Success! Found ${events4.length} events in ${elapsed4}ms`);

      if (events4.length > 0) {
        events4.forEach((event) => {
          if (event instanceof EventLog) {
            console.log(`   Event found at block ${event.blockNumber}:`);
            console.log(`   - Member: ${event.args.member}`);
            console.log(`   - Amount: ${ethers.formatEther(event.args.amount)} ETH`);       
            console.log(`   - Tx: ${event.transactionHash}`);
          }
        });
      }
      console.log("");
    } catch (error: any) {
      console.error(`❌ Failed: ${error.message}`);
      console.log("   Error code:", error.code);
      console.log("");
    }

    // Strategy 5: Check provider connection details
    console.log("🧪 Test 5: Provider Information");
    console.log("─────────────────────────────────────");
    try {
      const network = await provider.getNetwork();
      console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
      console.log(`Current block: ${currentBlock}`);

      // Check if this is Alchemy
      const providerUrl = (provider as any)._getConnection?.url || "Unknown";
      console.log(`Provider URL: ${providerUrl}`);
      console.log("");
    } catch (error: any) {
      console.error(`❌ Failed: ${error.message}`);
      console.log("");
    }

    // Strategy 6: Try getLogs directly (lower-level API)
    console.log("🧪 Test 6: Using getLogs (lower-level API)");
    console.log("─────────────────────────────────────");
    try {
      const startBlock6 = currentBlock - 1000;
      console.log(`Range: ${startBlock6} → ${currentBlock} (1,000 blocks)`);

      // Create filter manually
      const depositedTopic = ethers.id("Deposited(address,uint256,uint256,uint256)");       

      const start6 = Date.now();
      const logs = await provider.getLogs({
        address: FAMILY_WALLET_ADDRESS,
        topics: [depositedTopic],
        fromBlock: startBlock6,
        toBlock: currentBlock
      });
      const elapsed6 = Date.now() - start6;

      console.log(`✅ Success! Found ${logs.length} logs in ${elapsed6}ms`);
      console.log("");
    } catch (error: any) {
      console.error(`❌ Failed: ${error.message}`);
      console.log("   Error code:", error.code);
      console.log("   Error info:", error.info);
      console.log("");
    }

    console.log("📊 Debug Summary:");
    console.log("─────────────────────────────────────");
    console.log("If all tests failed: Provider rate limiting or network issue");
    console.log("If only large ranges failed: Block range limit (reduce size or use pagination)");
    console.log("If Test 4 failed: Contract address or event signature might be wrong");    
    console.log("If Test 6 worked but others didn't: queryFilter has issues, use getLogs instead");
  }

  queryHistoricalEventsDebug()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });