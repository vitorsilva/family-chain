 import { ethers } from "ethers";
  import { network } from "hardhat";

  async function compareProviders() {
    console.log("=== Frontend vs Backend Providers ===\n");

    // BACKEND: JsonRpcProvider (from Hardhat network)
    console.log("🔧 BACKEND (Node.js):");
    const connection = await network.connect("sepolia");
    const backendProvider = connection.ethers.provider;

    console.log("  Type:", backendProvider.constructor.name);
    console.log("  Purpose: Automated scripts, event listeners, cron jobs");
    console.log("  Signer: From Hardhat keystore (private key)");
    console.log("  User interaction: None (headless)");
    console.log("  Use case: Backend services that run 24/7");
    console.log("");

    // FRONTEND: BrowserProvider (simulated - can't actually use in Node.js)
    console.log("🌐 FRONTEND (Browser):");
    console.log("  Type: BrowserProvider");
    console.log("  Purpose: User-triggered transactions");
    console.log("  Signer: From MetaMask (user controls private key)");
    console.log("  User interaction: MetaMask popup for every transaction");
    console.log("  Use case: DApp UI (deposit, withdraw, swap)");
    console.log("");

    // Show both can read blockchain data
    const blockNumber = await backendProvider.getBlockNumber();
    console.log("✅ Both can read blockchain data:");
    console.log("  Latest block:", blockNumber);
    console.log("");

    // Show signer difference
    console.log("🔐 Signer Differences:");
    console.log("  Backend: const [signer] = await connection.ethers.getSigners();");
    console.log("  Frontend: const signer = await provider.getSigner(); // MetaMask popup");
    console.log("");

    console.log("📊 When to use which:");
    console.log("  ✅ Backend: Event listeners, price oracles, automated allowances");
    console.log("  ✅ Frontend: User deposits, user withdrawals, user swaps");
    console.log("  ✅ Both: Reading balances, querying contract state");
  }

  compareProviders()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });