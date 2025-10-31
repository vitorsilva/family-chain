// scripts/week3/query-balances.ts
  import { ethers } from "ethers";
  import { network } from "hardhat";

  async function queryBalances() {
    console.log("=== Querying Account Balances ===\n");

    // Connect to configured network (uses SEPOLIA_RPC_URL from config)
    const connection = await network.connect();
    const provider = connection.ethers.provider;

    // Addresses to check
    const addresses = [
      {
        name: "Your Wallet",
        address: "0xB09b5449D8BB84312Fbc4293baf122E0e1875736", // YOUR address
      },
      {
        name: "Vitalik Buterin",
        address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      },
      {
        name: "Ethereum Foundation",
        address: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
      },
    ];

    for (const entry of addresses) {
      const balance = await provider.getBalance(entry.address);
      const balanceInEth = ethers.formatEther(balance);

      console.log(`${entry.name}:`);
      console.log(`  Address: ${entry.address}`);
      console.log(`  Balance: ${balanceInEth} ETH`);
      console.log(`  Balance (wei): ${balance.toString()}`);
      console.log("");
    }

    // Get current block number
    const blockNumber = await provider.getBlockNumber();
    console.log("Current Block Number:", blockNumber);
    console.log("View on Etherscan: https://sepolia.etherscan.io/blocks");
  }

  queryBalances()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });