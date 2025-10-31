// scripts/week3/transaction-history.ts
  import { ethers } from "ethers";
  import { network } from "hardhat";

  async function getTransactionHistory() {
    console.log("=== Transaction History ===\n");

    // Hardhat 3 pattern
    const connection = await network.connect();
    const provider = connection.ethers.provider;

    // Your wallet address
    const address = "0xB09b5449D8BB84312Fbc4293baf122E0e1875736";

    console.log("Wallet Address:", address);
    console.log("");

    // Get transaction count (nonce) - only counts SENT transactions       
    const txCount = await provider.getTransactionCount(address);
    console.log("Total Transactions Sent (nonce):", txCount);
    console.log("");

    // NOTE: Native RPC can't get full history (sent + received)
    // We need an indexer like Etherscan

    console.log("📌 Etherscan Explorer:");
    console.log("  https://sepolia.etherscan.io/address/" + address);      
    console.log("");

    // Use Etherscan API for full history
    console.log("Fetching full transaction history via Etherscan API...");
    console.log("");

    try {
      // Build Etherscan API URL
      const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "";

      // For Hardhat 3, we need to get the API key differently
      // Since we stored it in keystore, we'll need to access it
      // For now, let's use a simpler approach with environment variable

      const apiKey = etherscanApiKey;
      const etherscanUrl = `https://api.etherscan.io/v2/api?chainid=11155111&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;

      const response = await fetch(etherscanUrl);
      const data : any = await response.json();

      if (data.status === "1" && data.result.length > 0) {
        console.log(`📝 Recent Transactions (showing first 5 of
  ${data.result.length}):\n`);

        data.result.slice(0, 5).forEach((tx: any, index: number) => {      
          const valueInEth = ethers.formatEther(tx.value);
          const date = new Date(parseInt(tx.timeStamp) *
  1000).toLocaleString();
          const type = tx.from.toLowerCase() === address.toLowerCase()     
  ? "SENT" : "RECEIVED";

          console.log(`${index + 1}. ${type} ${valueInEth} ETH`);
          console.log(`   Hash: ${tx.hash}`);
          console.log(`   ${type === "SENT" ? "To" : "From"}: ${type       
  === "SENT" ? tx.to : tx.from}`);
          console.log(`   Block: ${tx.blockNumber}`);
          console.log(`   Date: ${date}`);
          console.log(`   Gas Used: ${tx.gasUsed}`);
          console.log("");
        });

        // Calculate total ETH sent
        const totalSent = data.result
          .filter((tx: any) => tx.from.toLowerCase() ===
  address.toLowerCase())
          .reduce((sum: bigint, tx: any) => sum + BigInt(tx.value),        
  0n);

        console.log("💰 Total ETH Sent:",
  ethers.formatEther(totalSent), "ETH");
      } else {
        console.log("❌ No transactions found or Etherscan API error");    
        console.log("Response:", data.message);
        console.log("\nMake sure your ETHERSCAN_API_KEY is set correctly.");
      }
    } catch (error: any) {
      console.log("❌ Error fetching from Etherscan API");
      console.log("Error:", error.message);
      console.log("\nMake sure your ETHERSCAN_API_KEY is set correctly.");
    }
  }

  getTransactionHistory()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });