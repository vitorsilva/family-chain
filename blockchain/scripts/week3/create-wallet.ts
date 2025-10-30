import { ethers } from "ethers";

async function main() {
    console.log("🔐 Generating a new random wallet...\n");

  // Create a random wallet
  const wallet = ethers.Wallet.createRandom();

    // Display wallet information
    console.log("Address:", wallet.address);
    console.log("Private Key:", wallet.privateKey);
    console.log("Mnemonic Phrase:", wallet.mnemonic?.phrase);

    console.log("\n⚠️  NEVER share your private key or mnemonic with anyone!"); 
}

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });