  import { ethers, EventLog } from "ethers";
  import { network } from "hardhat";
  import pkg from "pg";
  import dotenv from "dotenv";

  const { Pool } = pkg;

  // Load environment variables
  dotenv.config();

  const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

  const FAMILY_WALLET_ABI = [
    "event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
    "event Withdrawn(address indexed member, uint256 amount, uint256 remainingBalance, uint256 timestamp)",
  ];

  async function storeEventsInDB() {
    console.log("=== Storing Blockchain Events in PostgreSQL ===\n");

    // Connect to PostgreSQL using environment variables
    const pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "familychain",
      user: process.env.DB_USER || "api_service",
      password: process.env.DB_PASSWORD,
    });

    console.log("✅ Connected to PostgreSQL");
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}`);
    console.log("");

    // Connect to blockchain
    const connection = await network.connect("sepolia");
    const provider = connection.ethers.provider;

    const contract = new ethers.Contract(
      FAMILY_WALLET_ADDRESS,
      FAMILY_WALLET_ABI,
      provider
    );

    // Query recent events (last 1000 blocks to avoid rate limits)
    const currentBlock = await provider.getBlockNumber();
    const startBlock = Math.max(0, currentBlock - 1000);

    console.log(`🔍 Querying Deposit events from block ${startBlock} to ${currentBlock}...`);     

    try {
      const events = await contract.queryFilter("Deposited", startBlock, currentBlock);
      console.log(`✅ Found ${events.length} events`);
      console.log("");

      // Store each event in database
      let stored = 0;
      let skipped = 0;

      for (const event of events) {
        if (!(event instanceof EventLog)) continue;

        const member = event.args.member;
        const amount = ethers.formatEther(event.args.amount);
        const newBalance = ethers.formatEther(event.args.newBalance);
        const timestamp = new Date(Number(event.args.timestamp) * 1000);

        console.log(`💾 Processing event from block ${event.blockNumber}...`);

        // Check if event already exists
        const existing = await pool.query(
          "SELECT id FROM transactions WHERE tx_hash = $1",
          [event.transactionHash]
        );

        if (existing.rows.length > 0) {
          console.log("  ⏭️  Event already in database, skipping");
          skipped++;
          continue;
        }

        // Insert transaction
        await pool.query(`
          INSERT INTO transactions (
            amount, currency, tx_hash, tx_type, status,
            event_name, event_data, confirmed_at, description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          amount,
          "ETH",
          event.transactionHash,
          "deposit",
          "confirmed",
          "Deposited",
          JSON.stringify({
            member,
            amount,
            newBalance,
            blockNumber: event.blockNumber,
            timestamp: timestamp.toISOString()
          }),
          timestamp,
          `Deposit from ${member.substring(0, 10)}...`
        ]);

        console.log("  ✅ Event stored!");
        stored++;
      }

      console.log("");
      console.log("📊 Database Summary:");

      // Count transactions
      const countResult = await pool.query(
        "SELECT COUNT(*) FROM transactions WHERE event_name = 'Deposited'"
      );
      console.log(`  Total Deposit events in DB: ${countResult.rows[0].count}`);

      // Sum deposits
      const sumResult = await pool.query(`
        SELECT SUM(amount::numeric) as total
        FROM transactions
        WHERE event_name = 'Deposited' AND currency = 'ETH'
      `);
      console.log(`  Total ETH deposited: ${sumResult.rows[0].total || 0} ETH`);

      console.log("");
      console.log(`✅ Stored ${stored} new events`);
      console.log(`⏭️  Skipped ${skipped} existing events`);

    } catch (error: any) {
      console.error("❌ Error:", error.message);
    } finally {
      await pool.end();
      console.log("");
      console.log("🔌 Database connection closed");
    }
  }

  storeEventsInDB()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
