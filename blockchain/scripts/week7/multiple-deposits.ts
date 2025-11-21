  import { ethers } from "ethers";
  import { network } from "hardhat";

  const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";
  const FAMILY_WALLET_ABI = [
    "function deposit() public payable",
  ];

  async function multipleDeposits() {
    console.log("=== Sending Multiple Deposits (Nonce Management) ===\n");

    const connection = await network.connect("sepolia");
    const provider = connection.ethers.provider;
    const [signer] = await connection.ethers.getSigners();
    const address = await signer.getAddress();

    const contract = new ethers.Contract(
      FAMILY_WALLET_ADDRESS,
      FAMILY_WALLET_ABI,
      signer
    );

    // Get current nonce
    let nonce = await provider.getTransactionCount(address);
    console.log("📊 Current nonce:", nonce);
    console.log("");

    // Send 3 deposits with manual nonce management
    const deposits = [
      ethers.parseEther("0.0001"),
      ethers.parseEther("0.0001"),
      ethers.parseEther("0.0001"),
    ];

    const txPromises = [];

    for (let i = 0; i < deposits.length; i++) {
      console.log(`📤 Sending deposit ${i + 1}:`, ethers.formatEther(deposits[i]), "ETH");        
      console.log(`  Using nonce: ${nonce + i}`);

      // Send with explicit nonce
      const tx = contract.deposit({
        value: deposits[i],
        nonce: nonce + i // Manual nonce increment
      });

      txPromises.push(tx);
    }

    console.log("");
    console.log("⏳ Waiting for all transactions to be sent...");

    // Wait for all to be sent
    const txs = await Promise.all(txPromises);

    console.log("✅ All transactions sent!");
    txs.forEach((tx, i) => {
      console.log(`  TX ${i + 1}:`, tx.hash);
    });
    console.log("");

    // Wait for all confirmations
    console.log("⏳ Waiting for confirmations...");
    const receipts = await Promise.all(txs.map(tx => tx.wait()));

    console.log("✅ All transactions confirmed!");
    console.log("");

    // Show results
    receipts.forEach((receipt, i) => {
      console.log(`Transaction ${i + 1}:`);
      console.log(`  Status: ${receipt?.status === 1 ? "✅ Success" : "❌ Failed"}`);
      console.log(`  Block: ${receipt?.blockNumber}`);
      console.log(`  Gas used: ${receipt?.gasUsed.toString()}`);
      console.log("");
    });

    console.log("🎉 Multiple deposits completed!");
    console.log("💡 Key lesson: Manual nonce management allows parallel transactions");
  }

  multipleDeposits()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });