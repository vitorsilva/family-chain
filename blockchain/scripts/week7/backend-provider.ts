  import { ethers } from "ethers";
  import { network } from "hardhat";

  async function testBackendProvider() {
    console.log("=== Backend Provider Setup ===\n");

    // Connect to network (Sepolia via Alchemy)
    const connection = await network.connect();
    const provider = connection.ethers.provider;

    console.log("✅ Provider connected!");
    console.log("Provider type:", provider.constructor.name);
    console.log("");

    // Get network info
    const networkInfo = await provider.getNetwork();
    console.log("📡 Network Information:");
    console.log("  Name:", networkInfo.name);
    console.log("  Chain ID:", networkInfo.chainId.toString());
    console.log("");

    // Get latest block
    const blockNumber = await provider.getBlockNumber();
    console.log("📦 Latest Block:", blockNumber);

    // Get block details
    const block = await provider.getBlock(blockNumber);
    console.log("  Timestamp:", new Date(Number(block!.timestamp) * 1000).toLocaleString());
    console.log("  Transactions:", block!.transactions.length);
    console.log("");

    // Query our wallet balance
    const [signer] = await connection.ethers.getSigners();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);

    console.log("💰 Wallet Balance:");
    console.log("  Address:", address);
    console.log("  Balance:", ethers.formatEther(balance), "ETH");
    console.log("");

    console.log("✅ Backend provider working! No MetaMask needed!");
  }

  testBackendProvider()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });