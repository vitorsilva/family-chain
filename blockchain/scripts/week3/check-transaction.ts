// scripts/week3/check-transaction.ts
  import { ethers } from "ethers";
  import { network } from "hardhat";

  async function checkTransaction() {
    console.log("=== Checking Transaction Status ===\n");

    const connection = await network.connect();
    const provider = connection.ethers.provider;

    // Replace with YOUR transaction hash from Activity 1
    const txHash = "0x85324acc9e53f71dc1649839db5b33e620eadbdb295f5cc949443c7f084042fa";

    console.log("Transaction Hash:", txHash);
    console.log("");

    // Get transaction details (what you sent)
    const tx = await provider.getTransaction(txHash);

    if (!tx) {
      console.log("❌ Transaction not found!");
      return;
    }

    console.log("📝 Transaction Details:");
    console.log("  From:", tx.from);
    console.log("  To:", tx.to);
    console.log("  Value:", ethers.formatEther(tx.value), "ETH");
    console.log("  Gas Limit:", tx.gasLimit.toString());
    console.log("  Nonce:", tx.nonce);
    console.log("");

    // Get transaction receipt (what happened)
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      console.log("⏳ Transaction pending (not yet mined)");
      return;
    }

    console.log("✅ Transaction Receipt:");
    console.log("  Block Number:", receipt.blockNumber);
    console.log("  Gas Used:", receipt.gasUsed.toString());
    console.log("  Gas Price:", ethers.formatUnits(receipt.gasPrice, "gwei"), "gwei");
    console.log("  Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");
    console.log("");

    // Calculate confirmations
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;

    console.log("🔗 Confirmations:", confirmations);
    console.log("  Current Block:", currentBlock);
    console.log("  Transaction Block:", receipt.blockNumber);
    console.log("  Safety Level:",
      confirmations >= 12 ? "Very Safe" :
      confirmations >= 6 ? "Safe" :
      confirmations >= 1 ? "Confirmed" :
      "Pending"
    );

    // Calculate actual cost
    const gasCost = receipt.gasUsed * receipt.gasPrice;
    const totalCost = tx.value + gasCost;

    console.log("");
    console.log("💰 Cost Breakdown:");
    console.log("  Amount Sent:", ethers.formatEther(tx.value), "ETH");
    console.log("  Gas Cost:", ethers.formatEther(gasCost), "ETH");
    console.log("  Total Cost:", ethers.formatEther(totalCost), "ETH");
  }

  checkTransaction()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });