
  import { ethers } from "ethers";
  import { network } from "hardhat";

  async function main() {
    console.log("🌐 Connecting wallet to Sepolia testnet...\n");

    // Step 1: Connect to the network (Hardhat 3 requirement!)
    const connection = await network.connect();

    // Step 2: Get provider from the connection
    const provider = connection.ethers.provider;

    // Step 3: Create a wallet (using the mnemonic from earlier)
    const mnemonic = "enemy build tired soup nuclear company dawn garbage unfair gift target seat";
    const wallet = ethers.Wallet.fromPhrase(mnemonic);

    // Step 4: Connect the wallet to the provider
    const connectedWallet = wallet.connect(provider);

    // Now we can query blockchain data!
    console.log("Wallet Address:", connectedWallet.address);

    // Get the balance from the blockchain
    if (!connectedWallet.provider) {
      throw new Error("Provider is not available");
    }
    const balance = await connectedWallet.provider.getBalance(connectedWallet.address);

    console.log("Balance:", ethers.formatEther(balance), "ETH");
    console.log("\n✅ Successfully connected to Sepolia testnet!");
  }

  console.log("About to call main()...");

  main()
    .then(() => {
      console.log("main() completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Caught error:", error);
      process.exit(1);
    });
