// scripts/week3/estimate-gas.ts
  import { ethers } from "ethers";
  import { network } from "hardhat";

  async function estimateGas() {
    console.log("=== Estimating Gas Costs ===\n");

    const connection = await network.connect();
    const provider = connection.ethers.provider;
    const [senderWallet] = await connection.ethers.getSigners();

    // Let's say you want to send 0.01 ETH to this address
    const recipientAddress = "0x310a9DaB3c4B9406d6629E66a4b1D737e01C30B5";
    const amountToSend = ethers.parseEther("0.01");

    console.log("Estimating gas for sending", ethers.formatEther(amountToSend), "ETH");
    console.log("");

    // Step 1: Estimate gas limit
    const estimatedGas = await provider.estimateGas({
      from: senderWallet.address,
      to: recipientAddress,
      value: amountToSend,
    });

    console.log("Estimated Gas Limit:", estimatedGas.toString());

    // Step 2: Get current network gas prices (EIP-1559)
    const feeData = await provider.getFeeData();

    console.log("");
    console.log("Network Fee Data:");
    console.log("  Max Fee Per Gas:", ethers.formatUnits(feeData.maxFeePerGas || 0n, "gwei"),     
  "gwei");
    console.log("  Max Priority Fee:", ethers.formatUnits(feeData.maxPriorityFeePerGas || 0n,     
  "gwei"), "gwei");

    // Step 3: Calculate total gas cost
    const gasCostWei = estimatedGas * (feeData.maxFeePerGas || 0n);
    const gasCostEth = ethers.formatEther(gasCostWei);

    console.log("");
    console.log("📊 Cost Breakdown:");
    console.log("  Amount to send:", ethers.formatEther(amountToSend), "ETH");
    console.log("  Estimated gas cost:", gasCostEth, "ETH");
    console.log("  Total cost:", ethers.formatEther(amountToSend + gasCostWei), "ETH");

    // Step 4: Check if you have enough balance
    const balance = await provider.getBalance(senderWallet.address);
    const totalNeeded = amountToSend + gasCostWei;

    console.log("");
    console.log("💰 Balance Check:");
    console.log("  Your balance:", ethers.formatEther(balance), "ETH");
    console.log("  Total needed:", ethers.formatEther(totalNeeded), "ETH");
    console.log("  Can send?", balance >= totalNeeded ? "✅ YES" : "❌ NO (insufficient funds)");

    if (balance < totalNeeded) {
      const shortfall = totalNeeded - balance;
      console.log("  You need", ethers.formatEther(shortfall), "more ETH");
    }
  }

  estimateGas()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
