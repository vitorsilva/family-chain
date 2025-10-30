import { ethers } from "ethers";

async function main() {
    console.log("🔐 Generating a wallet from a mnemonic phrase...\n");

  // Use the SAME mnemonic from the previous script
    const mnemonic = "enemy build tired soup nuclear company dawn garbage unfair gift target seat";

    // Recover the wallet
    const wallet = ethers.Wallet.fromPhrase(mnemonic);

    // Display wallet information
    console.log("Address:", wallet.address);
    console.log("Private Key:", wallet.privateKey);
    console.log("Mnemonic Phrase:", wallet.mnemonic?.phrase);

    console.log("\n✅ Wallet successfully recovered!");
    console.log("Notice: Same mnemonic = Same private key = Same address");
    console.log("\n⚠️  NEVER share your private key or mnemonic with anyone!");
}

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });