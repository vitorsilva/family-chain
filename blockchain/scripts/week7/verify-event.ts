  import { ethers } from "ethers";
  import { network } from "hardhat";

  const TX_HASH = "0xd9ce53f05e300c95c57ad17127de9f377e3dc49eb653b0a28cb5f2d4be796294";

  async function verifyEvent() {
    console.log("=== Verifying Transaction Event ===\n");

    const connection = await network.connect("sepolia");
    const provider = connection.ethers.provider;

    // Get transaction receipt
    console.log("📋 Fetching receipt for:", TX_HASH);
    const receipt = await provider.getTransactionReceipt(TX_HASH);

    if (!receipt) {
      console.log("❌ Receipt not found");
      return;
    }

    console.log("\n✅ Transaction Receipt:");
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Status: ${receipt.status === 1 ? "Success ✅" : "Failed ❌"}`);
    console.log(`   Total Logs: ${receipt.logs.length}`);
    console.log("");

    // Parse logs
    const FAMILY_WALLET_ABI = [
      "event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
    ];

    const iface = new ethers.Interface(FAMILY_WALLET_ABI);

    let foundDeposit = false;

    receipt.logs.forEach((log, index) => {
      try {
        const parsed = iface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });

        if (parsed) {
          foundDeposit = true;
          console.log(`✅ Found Deposited Event!`);
          console.log(`   Member: ${parsed.args.member}`);
          console.log(`   Amount: ${ethers.formatEther(parsed.args.amount)} ETH`);
          console.log(`   New Balance: ${ethers.formatEther(parsed.args.newBalance)} ETH`);       
          console.log(`   Timestamp: ${new Date(Number(parsed.args.timestamp) *
  1000).toLocaleString()}`);
          console.log("");
        }
      } catch (e) {
        // Not a Deposited event, skip
      }
    });

    if (!foundDeposit) {
      console.log("❌ No Deposited event found in transaction logs");
    }
  }

  verifyEvent()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });