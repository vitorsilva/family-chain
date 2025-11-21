import { ethers } from "ethers";
  import { network } from "hardhat";

  async function loadBackendWallet() {
    console.log("=== Loading Backend Wallet ===\n");

    // Connect to network
    const connection = await network.connect("sepolia");
    const provider = connection.ethers.provider;

    // Load signer from Hardhat keystore
    const [signer] = await connection.ethers.getSigners();
    const address = await signer.getAddress();

    console.log("✅ Wallet loaded from Hardhat keystore!");
    console.log("  Address:", address);
    console.log("");

    // Check balance
    const balance = await provider.getBalance(address);
    console.log("💰 Wallet Balance:", ethers.formatEther(balance), "ETH");
    console.log("");

    // This wallet can sign transactions WITHOUT MetaMask
    console.log("🔐 Wallet Capabilities:");
    console.log("  ✅ Can read blockchain data");
    console.log("  ✅ Can sign transactions programmatically");
    console.log("  ✅ No MetaMask popup needed");
    console.log("  ✅ Can run in background services");
    console.log("");

    // Show how to sign a message (not a transaction)
    const message = "Hello from backend wallet!";
    const signature = await signer.signMessage(message);
    console.log("📝 Message Signing Test:");
    console.log("  Message:", message);
    console.log("  Signature:", signature.substring(0, 20) + "...");
    console.log("");

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    console.log("✅ Signature Verification:");
    console.log("  Recovered address:", recoveredAddress);
    console.log("  Matches signer:", recoveredAddress === address ? "YES ✅" : "NO ❌");
    console.log("");

    console.log("⚠️  Security Reminder:");
    console.log("  This wallet's private key is in Hardhat keystore");
    console.log("  For production: Use hardware wallet or cloud KMS");
    console.log("  For development: Hardhat --dev keystore is fine (testnet only!)");
  }

  loadBackendWallet()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });