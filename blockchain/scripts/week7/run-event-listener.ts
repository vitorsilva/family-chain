  import { WebSocketProvider } from "ethers";
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

    // Get WebSocket URL from command line
    const wsUrl = process.argv[2];

    if (!wsUrl) {
      console.error("❌ WebSocket URL required!");
      console.log("\nUsage:");
      console.log("  npx tsx scripts/week7/run-event-listener.ts wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY");
      console.log("\n💡 Convert your HTTP URL to WebSocket:");
      console.log("  https:// → wss://");
      process.exit(1);
    }

    // Create WebSocket provider for instant event detection
    console.log("🔌 Connecting to WebSocket...");
    const provider = new WebSocketProvider(wsUrl);
    await provider.ready;
    console.log("✅ WebSocket connected!\n");

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

    // Handle WebSocket errors
    provider.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
    });

    // Graceful shutdown on Ctrl+C
    process.on("SIGINT", async () => {
      console.log("\n\n🛑 Shutting down gracefully...");
      await service.shutdown();
      provider.destroy();
      process.exit(0);
    });

    console.log("💡 Service running! Press Ctrl+C to stop");
    console.log("💡 Try making deposits to see real-time updates:");
    console.log("   Backend: npx tsx scripts/week7/backend-deposit.ts");
  }

  runEventListener()
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });