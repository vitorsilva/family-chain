// scripts/week3/send-transaction.ts
  import { ethers } from "ethers";
  import { network } from "hardhat";

  async function sendTransaction() {
    console.log("=== Sending Your First Transaction ===\n");

    // Connect to network
    const connection = await network.connect();
    const provider = connection.ethers.provider;

    // Load your existing wallet (sender)
    const [senderWallet] = await connection.ethers.getSigners();

    // Create a new wallet (recipient)
    const recipientWallet = ethers.Wallet.createRandom();

    console.log("Sender:", senderWallet.address);
    console.log("Recipient:", recipientWallet.address);
    console.log("");

    // Check sender balance
    const balanceBefore = await provider.getBalance(senderWallet.address);
    console.log("Sender balance before:", ethers.formatEther(balanceBefore), "ETH");

    // Amount to send (0.001 ETH)
    const amountToSend = ethers.parseEther("0.001");
    console.log("Amount to send:", ethers.formatEther(amountToSend), "ETH");
    console.log("");

    // Create and send transaction
    const tx = await senderWallet.sendTransaction({
      to: recipientWallet.address,
      value: amountToSend,
    });

    console.log("✅ Transaction sent!");
    console.log("Transaction Hash:", tx.hash);
    console.log("View on Etherscan: https://sepolia.etherscan.io/tx/" + tx.hash);
    console.log("");
    console.log("⏳ Waiting for confirmation...");

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    console.log("✅ Transaction confirmed!");
    console.log("Block Number:", receipt?.blockNumber);
    console.log("Gas Used:", receipt?.gasUsed.toString());
    console.log("Status:", receipt?.status === 1 ? "Success" : "Failed");
    console.log("");

    // Check balances after
    const balanceAfter = await provider.getBalance(senderWallet.address);
    const recipientBalance = await provider.getBalance(recipientWallet.address);

    console.log("Sender balance after:", ethers.formatEther(balanceAfter), "ETH");
    console.log("Recipient balance:", ethers.formatEther(recipientBalance), "ETH");
    console.log("");

    // Calculate total cost
    const gasCost = receipt!.gasUsed * receipt!.gasPrice!;
    const totalCost = amountToSend + gasCost;
    console.log("Gas Cost:", ethers.formatEther(gasCost), "ETH");
    console.log("Total Cost (amount + gas):", ethers.formatEther(totalCost), "ETH");
  }

    // At the bottom of the file
  sendTransaction()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });