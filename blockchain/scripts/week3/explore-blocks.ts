 // scripts/week3/explore-blocks.ts
  import { ethers } from "ethers";
  import { network } from "hardhat";

  async function exploreBlocks() {
    console.log("=== Exploring Block Data ===\n");

    // Hardhat 3 pattern: connect to network first
    const connection = await network.connect();
    const provider = connection.ethers.provider;

    // Get latest block
    const latestBlockNumber = await provider.getBlockNumber();
    console.log("Latest Block Number:", latestBlockNumber);
    console.log("");

    // Get block details (without full transactions)
    const block = await provider.getBlock(latestBlockNumber);

    if (!block) {
      console.log("Block not found!");
      return;
    }

    console.log("📦 Block Details:");
    console.log("  Number:", block.number);
    console.log("  Hash:", block.hash);
    console.log("  Parent Hash:", block.parentHash);
    console.log("  Timestamp:", new Date(block.timestamp * 1000).toLocaleString());
    console.log("  Miner/Validator:", block.miner);
    console.log("  Gas Used:", ethers.formatUnits(block.gasUsed, 0));
    console.log("  Gas Limit:", ethers.formatUnits(block.gasLimit, 0));
    console.log("  Base Fee Per Gas:", ethers.formatUnits(block.baseFeePerGas || 0n, "gwei"), "gwei");
    console.log("  Transaction Count:", block.transactions.length);
    console.log("");

    // Calculate block utilization
    const utilization = (Number(block.gasUsed) / Number(block.gasLimit)) * 100;
    console.log("  Block Utilization:", utilization.toFixed(2) + "%");
    console.log("");

    // Show first 5 transaction hashes
    console.log("📝 Transactions in this block:");
    block.transactions.slice(0, 5).forEach((txHash, index) => {
      console.log(`  ${index + 1}. ${txHash}`);
    });

    if (block.transactions.length > 5) {
      console.log(`  ... and ${block.transactions.length - 5} more`);
    }

    console.log("");
    console.log("View on Etherscan: https://sepolia.etherscan.io/block/" + block.number);
  }

  exploreBlocks()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });