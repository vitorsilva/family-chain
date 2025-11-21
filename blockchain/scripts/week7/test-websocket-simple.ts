  import { ethers, WebSocketProvider } from "ethers";

  const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

  const FAMILY_WALLET_ABI = [
    "event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
  ];

  async function testWebSocket() {
    console.log("=== Simple WebSocket Test ===\n");

    const wsUrl = process.argv[2];

    if (!wsUrl) {
      console.error("❌ WebSocket URL required!");
      console.log("\nUsage:");
      console.log("  npx tsx scripts/week7/test-websocket-simple.ts wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY");
      process.exit(1);
    }

    if (!wsUrl.startsWith("wss://")) {
      console.error("❌ URL must start with wss:// (not https://)");
      console.log("\n💡 Convert your HTTP URL:");
      console.log(`   ${wsUrl.replace("https://", "wss://")}`);
      process.exit(1);
    }

    console.log("🔌 Connecting to WebSocket...");
    const provider = new WebSocketProvider(wsUrl);

    provider.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
    });

    await provider.ready;
    console.log("✅ WebSocket connected!\n");

    const contract = new ethers.Contract(
      FAMILY_WALLET_ADDRESS,
      FAMILY_WALLET_ABI,
      provider
    );

    console.log("📡 Setting up event listener...");

    // Simple direct listener
    contract.on("Deposited", (member, amount, newBalance, timestamp, event) => {
      console.log("\n🎉 EVENT DETECTED!");
      console.log("  Callback triggered at:", new Date().toLocaleTimeString());
      console.log("  Member:", member);
      console.log("  Amount:", ethers.formatEther(amount), "ETH");
      console.log("  Event object type:", typeof event);
      console.log("  Event:", event);
    });

    console.log("✅ Listener active!\n");
    console.log("💡 Make a deposit now and watch for instant detection...");
    console.log("   Backend: npx tsx scripts/week7/backend-deposit.ts");

    // Keep alive with heartbeat
    setInterval(() => {
      console.log(`💓 Still listening... ${new Date().toLocaleTimeString()}`);
    }, 30000);

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n\n🛑 Shutting down...");
      contract.removeAllListeners();
      provider.destroy();
      process.exit(0);
    });
  }

  testWebSocket().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });