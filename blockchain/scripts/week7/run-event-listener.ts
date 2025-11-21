  import { network } from "hardhat";
  import { EventListenerService } from "../../services/EventListenerService.js";
  import dotenv from "dotenv";

  dotenv.config();

  const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

  const FAMILY_WALLET_ABI = [
    "event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
    "event Withdrawn(address indexed member, uint256 amount, uint256 remainingBalance, uint256 timestamp)",
  ];

  async function runEventListener() {
    console.log("=== FamilyWallet Event Listener Service ===\n");

    // Connect to blockchain
    const connection = await network.connect("sepolia");
    const provider = connection.ethers.provider;

    // Create service
    const service = new EventListenerService({
      contractAddress: FAMILY_WALLET_ADDRESS,
      contractABI: FAMILY_WALLET_ABI,
      eventNames: ["Deposited", "Withdrawn"],
      dbConfig: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME || "familychain",
        user: process.env.DB_USER || "api_service",
        password: process.env.DB_PASSWORD || "",
      }
    });

    // Initialize
    await service.initialize(provider);

    // Start real-time listening
    await service.startListening();
    console.log("");

    // Status update every minute
    setInterval(() => {
      const status = service.getStatus();
      console.log("\n📊 Service Status:", new Date().toLocaleTimeString());
      console.log(`   Running: ${status.isRunning ? "✅" : "❌"}`);
      console.log(`   Contract: ${status.contractAddress}`);
      console.log(`   Events: ${status.eventNames.join(", ")}`);
    }, 60000); // Every 60 seconds

    // Graceful shutdown on Ctrl+C
    process.on("SIGINT", async () => {
      console.log("\n\n🛑 Shutting down gracefully...");
      await service.shutdown();
      process.exit(0);
    });

    console.log("💡 Service running! Press Ctrl+C to stop");
    console.log("💡 Try making deposits to see real-time updates:");
    console.log("   - Frontend: http://localhost:3000");
    console.log("   - Backend: npx tsx scripts/week7/backend-deposit.ts");
  }

  runEventListener()
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });