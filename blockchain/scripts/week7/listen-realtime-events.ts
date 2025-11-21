  import { ethers, EventLog } from "ethers";
  import { network } from "hardhat";

  const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

  const FAMILY_WALLET_ABI = [
    "event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
    "event Withdrawn(address indexed member, uint256 amount, uint256 remainingBalance, uint256 timestamp)",
  ];

  async function listenRealtimeEvents() {
    console.log("=== Real-time Event Listener ===\n");

    const connection = await network.connect("sepolia");
    const provider = connection.ethers.provider;

    const contract = new ethers.Contract(
      FAMILY_WALLET_ADDRESS,
      FAMILY_WALLET_ABI,
      provider
    );

    console.log("📡 Listening for FamilyWallet events...");
    console.log("Contract:", FAMILY_WALLET_ADDRESS);
    console.log("Network: Sepolia");
    console.log("Press Ctrl+C to stop");
    console.log("");

    // Listen for Deposit events
    contract.on("Deposited", (member, amount, newBalance, timestamp, event) => {
      console.log("💰 NEW DEPOSIT DETECTED!");
      console.log("  Member:", member);
      console.log("  Amount:", ethers.formatEther(amount), "ETH");
      console.log("  New Balance:", ethers.formatEther(newBalance), "ETH");
      console.log("  Timestamp:", new Date(Number(timestamp) * 1000).toLocaleString());

      // Type guard for event.log access
      if (event instanceof EventLog) {
        console.log("  Block:", event.blockNumber);
        console.log("  Tx Hash:", event.transactionHash);
        console.log("  🔗 Etherscan:",
  `https://sepolia.etherscan.io/tx/${event.transactionHash}`);
      }
      console.log("");
    });

    // Listen for Withdraw events
    contract.on("Withdrawn", (member, amount, remainingBalance, timestamp, event) => {
      console.log("💸 NEW WITHDRAWAL DETECTED!");
      console.log("  Member:", member);
      console.log("  Amount:", ethers.formatEther(amount), "ETH");
      console.log("  Remaining:", ethers.formatEther(remainingBalance), "ETH");
      console.log("  Timestamp:", new Date(Number(timestamp) * 1000).toLocaleString());

      if (event instanceof EventLog) {
        console.log("  Block:", event.blockNumber);
        console.log("  Tx Hash:", event.transactionHash);
        console.log("  🔗 Etherscan:",
  `https://sepolia.etherscan.io/tx/${event.transactionHash}`);
      }
      console.log("");
    });

    // Keep script running
    console.log("✅ Listener started!");
    console.log("💡 Try making a deposit:");
    console.log("   - Open your frontend (localhost:3000)");
    console.log("   - OR run: npx tsx scripts/week7/backend-deposit.ts");
    console.log("");

    // Heartbeat to show it's running
    setInterval(() => {
      const now = new Date().toLocaleTimeString();
      console.log(`💓 Listener active... ${now}`);
    }, 30000); // Every 30 seconds
  }

  listenRealtimeEvents()
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });