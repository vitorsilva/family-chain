// scripts/week3/handle-errors.ts
  import { ethers } from "ethers";
  import { network } from "hardhat";

  async function handleErrors() {
    console.log("=== Handling Transaction Errors ===\n");

    const connection = await network.connect();
    const provider = connection.ethers.provider;
    const [wallet] = await connection.ethers.getSigners();

    // Test 1: Insufficient Funds
    console.log("Test 1: Insufficient Funds Error");
    try {
      const balance = await provider.getBalance(wallet.address);
      const tooMuch = balance + ethers.parseEther("1"); // More than we have

      const tx = await wallet.sendTransaction({
        to: "0x310a9DaB3c4B9406d6629E66a4b1D737e01C30B5",
        value: tooMuch,
      });
      await tx.wait();
    } catch (error: any) {
      console.log("❌ Error caught:", error.shortMessage || error.message);
      console.log("  Reason: You tried to send more ETH than your balance\n");
    }

    // Test 2: Invalid Address
    console.log("Test 2: Invalid Address Error");
    try {
      await wallet.sendTransaction({ to: "0xinvalid", // Invalid address
        value: ethers.parseEther("0.001"),
      });
    } catch (error: any) {
      console.log("❌ Error caught:", error.shortMessage || error.message);
      console.log("  Reason: The recipient address is not a validEthereum address\n");
    }

    // Test 3: Gas Estimation
    console.log("Test 3: Gas Estimation");
    try {
      const gasEstimate = await provider.estimateGas({
        from: wallet.address,
        to: "0x310a9DaB3c4B9406d6629E66a4b1D737e01C30B5",
        value: ethers.parseEther("0.001"),
      });

      console.log("✅ Gas estimation successful:", gasEstimate.toString());
      console.log("  Tip: Always estimate gas before sending transactions\n");
    } catch (error: any) {
      console.log("❌ Error caught:", error.message);
    }

    // Test 4: Check Nonce
    console.log("Test 4: Understanding Nonce");
    const nonce = await provider.getTransactionCount(wallet.address);      
    console.log("✅ Your current nonce:", nonce);
    console.log("  This means you've sent", nonce, "transaction(s) from this wallet");
    console.log("  Your next transaction will use nonce:", nonce);
    console.log("  Nonce prevents replay attacks and ensures transaction ordering\n");

    console.log("💡 Key Takeaways:");
    console.log("  1. Always check balance before sending");
    console.log("  2. Validate addresses before transactions");
    console.log("  3. Estimate gas to avoid failures");
    console.log("  4. Understand nonce for transaction ordering");
  }

  handleErrors()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });