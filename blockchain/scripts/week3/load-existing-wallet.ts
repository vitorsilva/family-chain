import { ethers } from "ethers";
  import { network } from "hardhat";

  async function main() {
    console.log("🔑 Loading your existing wallet from Hardhat...\n");

    // Connect to network
    //  npx hardhat run scripts/week3/load-existing-wallet.ts
    //const connection = await network.connect({ network: "sepolia" });
    //  npx hardhat run scripts/week3/load-existing-wallet.ts --network sepolia
    const connection = await network.connect();

    // Get signers - Hardhat automatically loads accounts from config!
    const [signer] = await connection.ethers.getSigners();

    // This signer is already connected to the provider
    console.log("Wallet Address:", signer.address);

    if (!signer.provider) {
      throw new Error("Provider not available");
    }

    const balance = await signer.provider.getBalance(signer.address);

    console.log("Balance:", ethers.formatEther(balance), "SepoliaETH");
    console.log("\n✅ This is your REAL wallet with actual testnet ETH!");      
  }

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });