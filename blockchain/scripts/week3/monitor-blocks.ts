import { network } from "hardhat";
  import { formatEther } from "ethers";

  async function main() {
    const connection = await network.connect();
    const provider = connection.ethers.provider;

    console.log("🔴 Starting real-time block monitor...");
    console.log("Press Ctrl+C to stop\n");

    let lastBlockNumber = await provider.getBlockNumber();
    console.log(`Starting from block ${lastBlockNumber}\n`);

    // Poll for new blocks every 6 seconds
    setInterval(async () => {
      try {
        const currentBlock = await provider.getBlockNumber();

        // Only log when a new block arrives
        if (currentBlock > lastBlockNumber) {
          const block = await provider.getBlock(currentBlock);

          if (block) {
            const utilization = (Number(block.gasUsed) / Number(block.gasLimit)) * 100;
            const baseFee = block.baseFeePerGas
              ? formatEther(block.baseFeePerGas)
              : "N/A";
            const timestamp = new Date(Number(block.timestamp) * 1000).toLocaleTimeString();      

            console.log(`📦 Block ${currentBlock}`);
            console.log(`   ⏰ Time: ${timestamp}`);
            console.log(`   📊 Transactions: ${block.transactions.length}`);
            console.log(`   ⛽ Utilization: ${utilization.toFixed(2)}%`);
            console.log(`   💰 Base Fee: ${baseFee} gwei`);
            console.log("");

            lastBlockNumber = currentBlock;
          }
        }
      } catch (error) {
        console.error("Error fetching block:", error);
      }
    }, 6000); // Check every 6 seconds
  }

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });