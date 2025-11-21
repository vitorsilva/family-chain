
  // blockchain/scripts/week7/query-historical-events.ts
  import { ethers, EventLog } from "ethers";
  import { network } from "hardhat";

  const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

  // Full event signatures
  const FAMILY_WALLET_ABI = [
    "event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
    "event Withdrawn(address indexed member, uint256 amount, uint256 remainingBalance, uint256 timestamp)",
  ];

  async function queryHistoricalEvents() {
    console.log("=== Querying Historical FamilyWallet Events ===\n");

    const connection = await network.connect("sepolia");
    const provider = connection.ethers.provider;

    // Create contract instance (read-only, no signer needed)
    const contract = new ethers.Contract(
      FAMILY_WALLET_ADDRESS,
      FAMILY_WALLET_ABI,
      provider
    );

    // Get current block for context
    const currentBlock = await provider.getBlockNumber();
    console.log("📊 Current Block:", currentBlock);
    console.log("📍 Contract Address:", FAMILY_WALLET_ADDRESS);
    console.log("");

    // Query last 10,000 blocks (~1-2 days on Sepolia)
    const startBlock = Math.max(0, currentBlock - 10000);

    console.log(`🔍 Querying Deposit events from block ${startBlock} to ${currentBlock}...`);     
    console.log("   (Last ~10,000 blocks, approximately 1-2 days)");
    console.log("");

    try {
      const depositEvents = await contract.queryFilter("Deposited", startBlock, currentBlock);    

      console.log(`✅ Found ${depositEvents.length} deposit events`);
      console.log("");

      // Display each event (with type checking)
      depositEvents.forEach((event, index) => {
        if (event instanceof EventLog) {
          console.log(`Deposit #${index + 1}:`);
          console.log(`  Member: ${event.args.member}`);
          console.log(`  Amount: ${ethers.formatEther(event.args.amount)} ETH`);
          console.log(`  New Balance: ${ethers.formatEther(event.args.newBalance)} ETH`);
          console.log(`  Timestamp: ${new Date(Number(event.args.timestamp) *
  1000).toLocaleString()}`);
          console.log(`  Block: ${event.blockNumber}`);
          console.log(`  Tx Hash: ${event.transactionHash}`);
          console.log(`  🔗 Etherscan:
  https://sepolia.etherscan.io/tx/${event.transactionHash}`);
          console.log("");
        }
      });

      // Query all Withdraw events
      console.log("🔍 Querying all Withdraw events...");
      const withdrawEvents = await contract.queryFilter("Withdrawn", startBlock,
  currentBlock);

      console.log(`✅ Found ${withdrawEvents.length} withdraw events`);
      console.log("");

      if (withdrawEvents.length > 0) {
        withdrawEvents.forEach((event, index) => {
          if (event instanceof EventLog) {
            console.log(`Withdraw #${index + 1}:`);
            console.log(`  Member: ${event.args.member}`);
            console.log(`  Amount: ${ethers.formatEther(event.args.amount)} ETH`);
            console.log(`  Remaining: ${ethers.formatEther(event.args.remainingBalance)}
  ETH`);
            console.log(`  Timestamp: ${new Date(Number(event.args.timestamp) *
  1000).toLocaleString()}`);
            console.log(`  Block: ${event.blockNumber}`);
            console.log(`  Tx Hash: ${event.transactionHash}`);
            console.log(`  🔗 Etherscan:
  https://sepolia.etherscan.io/tx/${event.transactionHash}`);
            console.log("");
          }
        });
      } else {
        console.log("  (No withdrawals in this time period)");
        console.log("");
      }

      // Filter events by specific member
      const [signer] = await connection.ethers.getSigners();
      const myAddress = await signer.getAddress();

      console.log(`🔍 Filtering deposits by my address: ${myAddress}`);
      const myDepositFilter = contract.filters.Deposited(myAddress);
      const myDeposits = await contract.queryFilter(myDepositFilter, startBlock,
  currentBlock);

      console.log(`✅ Found ${myDeposits.length} deposits from my address`);
      console.log("");

      console.log("📊 Summary:");
      console.log(`  Total Deposits: ${depositEvents.length}`);
      console.log(`  Total Withdraws: ${withdrawEvents.length}`);
      console.log(`  Total Events: ${depositEvents.length + withdrawEvents.length}`);
      console.log(`  My Deposits: ${myDeposits.length}`);
      console.log("");
      console.log("💡 Note: This only shows events from the last ~10,000 blocks.");
      console.log("   If your deposits are older, they won't appear here.");
    } catch (error: any) {
      console.error("❌ Error querying events:", error.message);
      console.log("\n💡 The error might be due to:");
      console.log("   - Block range still too large for Alchemy free tier");
      console.log("   - Rate limiting");
      console.log("   - Network issues");
    }
  }

  queryHistoricalEvents()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });