  import { ethers } from "ethers";
  import { network } from "hardhat";

  // Your FamilyWallet contract address from Week 5
  const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

  // Minimal ABI (just view functions we need)
  const FAMILY_WALLET_ABI = [
    "function getBalance(address member) external view returns (uint256)",
    "function isMember(address addr) external view returns (bool)",
    "function owner() external view returns (address)",
  ];

  async function queryContract() {
    console.log("=== Query FamilyWallet from Backend ===\n");

    // Connect to network
    const connection = await network.connect("sepolia");
    const provider = connection.ethers.provider;

    // Get our wallet address
    const [signer] = await connection.ethers.getSigners();
    const address = await signer.getAddress();

    console.log("📋 Contract Address:", FAMILY_WALLET_ADDRESS);
    console.log("👤 Our Address:", address);
    console.log("");

    // Create contract instance (READ-ONLY - no signer needed)
    const contract = new ethers.Contract(
      FAMILY_WALLET_ADDRESS,
      FAMILY_WALLET_ABI,
      provider // Just provider (read-only)
    );

    // Query contract owner
    const owner = await contract.owner();
    console.log("👑 Contract Owner:", owner);
    console.log("  Are we owner?", owner === address ? "YES ✅" : "NO ❌");
    console.log("");

    // Check if we're a member
    const isMember = await contract.isMember(address);
    console.log("🔐 Member Status:", isMember ? "YES ✅" : "NO ❌");
    console.log("");

    // Get our balance in contract
    const balance = await contract.getBalance(address);
    console.log("💰 Our Balance in Contract:", ethers.formatEther(balance), "ETH");    
    console.log("");

    // Get contract's total ETH balance
    const contractBalance = await provider.getBalance(FAMILY_WALLET_ADDRESS);
    console.log("🏦 Contract Total Balance:", ethers.formatEther(contractBalance), "ETH");
    console.log("");

    console.log("✅ All queries completed without MetaMask!");
    console.log("💡 View functions are free - no gas cost!");
  }

  queryContract()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });