# Week 3, Class 3.3: Querying Blockchain Data
## FamilyChain Course - Learning Guide

---

## 🎯 Overview

**Duration:** 1-2 hours
**Prerequisites:**
- Week 3, Classes 3.1-3.2 complete
- Understanding of wallets and transactions
- Alchemy RPC configured

**What You'll Learn:**
The blockchain is a public database - anyone can read it! In this class, you'll learn how to query blockchain data programmatically: balances, blocks, transaction history, and more. You'll build CLI tools that fetch real blockchain data.

**Why This Matters:**
Reading blockchain state is fundamental to DApp development. Your family finance platform will need to:
- Check account balances
- Monitor transactions
- Verify allowance distributions
- Display transaction history

---

## 📚 Learning Objectives

By the end of this class, you will be able to:

1. **Query** account balances (ETH and tokens)
2. **Fetch** block data (headers, transactions, timestamps)
3. **Retrieve** transaction history for an address
4. **Decode** transaction data and logs
5. **Monitor** blockchain state in real-time
6. **Use** Etherscan for verification and debugging
7. **Build** simple CLI tools for blockchain queries

---

## 📖 Key Concepts

### 1. The Blockchain as a Public Database

**Everything is public:**
- ✅ All transactions (from, to, value, data)
- ✅ All account balances
- ✅ All smart contract code
- ✅ All smart contract storage
- ❌ Private keys (these are secret!)

**Transparency benefits:**
- Audit trails (follow the money)
- Trustless verification (don't trust, verify)
- DApp frontends can query directly

### 2. RPC Methods for Querying Data

| Method | Purpose | Example |
|--------|---------|---------|
| `eth_blockNumber` | Get latest block number | `9517450` |
| `eth_getBalance` | Get ETH balance of address | `50344326688343376` (wei) |
| `eth_getTransactionCount` | Get nonce (tx count) | `5` |
| `eth_getBlockByNumber` | Get block details | Block data object |
| `eth_getTransactionByHash` | Get transaction details | Transaction object |
| `eth_getTransactionReceipt` | Get transaction result | Receipt object |
| `eth_getLogs` | Get event logs (filtered) | Array of log objects |
| `eth_call` | Call contract (read-only) | Contract return value |

**ethers.js v6 wrappers:**
- `provider.getBlockNumber()`
- `provider.getBalance(address)`
- `provider.getTransaction(hash)`
- `provider.getBlock(number)`
- `provider.getLogs(filter)`

### 3. Block Structure

Every block contains:

```typescript
{
  number: 9517450,                    // Block number
  hash: "0xabc123...",                // Block hash
  parentHash: "0xdef456...",          // Previous block hash
  timestamp: 1698765432,              // Unix timestamp
  miner: "0x789...",                  // Validator address
  transactions: [...],                // Array of tx hashes
  gasUsed: 12500000n,                 // Total gas used in block
  gasLimit: 30000000n,                // Max gas allowed
  baseFeePerGas: 15000000000n,        // Base fee (EIP-1559)
}
```

**Key points:**
- Blocks are linked (parentHash → hash → next block's parentHash)
- Average block time: ~12 seconds on Ethereum
- Each block can contain multiple transactions

### 4. Transaction History

**Problem:** Ethereum doesn't have a native "get all transactions for address" RPC method.

**Solutions:**
1. **Scan blocks** (slow, not practical)
2. **Use indexer** (Etherscan API, Alchemy, The Graph)
3. **Listen to events** (for contract interactions)

**For this class:** We'll use Etherscan API (free, requires API key)

### 5. Logs and Events

Smart contracts emit events:
```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```

**Querying logs:**
```typescript
const logs = await provider.getLogs({
  address: contractAddress,  // Filter by contract
  fromBlock: 9000000,        // Start block
  toBlock: 9500000,          // End block
  topics: [eventSignature],  // Filter by event
});
```

**Uses:**
- Track token transfers
- Monitor contract state changes
- Build transaction history

---

## 🛠️ Hands-On Activities

### Activity 1: Query Account Balances

**Goal:** Check ETH balances for multiple addresses.

**Step 1:** Create `query-balances.ts`

```typescript
// scripts/week3/query-balances.ts
import { ethers } from "ethers";
import hre from "hardhat";

async function queryBalances() {
  console.log("=== Querying Account Balances ===\n");

  const provider = new ethers.JsonRpcProvider(
    hre.vars.get("ALCHEMY_API_KEY")
  );

  // Addresses to check
  const addresses = [
    {
      name: "Your Wallet",
      address: "0xB09b5449D8BB84312Fbc4293baf122E0e1875736", // Your address
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

queryBalances();
```

**Step 2:** Run the script

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\blockchain
npx tsx scripts/week3/query-balances.ts
```

**Expected Output:**
```
=== Querying Account Balances ===

Your Wallet:
  Address: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
  Balance: 0.048 ETH
  Balance (wei): 48000000000000000

Vitalik Buterin:
  Address: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
  Balance: 0.0 ETH
  Balance (wei): 0

Ethereum Foundation:
  Address: 0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe
  Balance: 0.0 ETH
  Balance (wei): 0

Current Block Number: 9517890
View on Etherscan: https://sepolia.etherscan.io/blocks
```

**What Just Happened?**
- Queried balances for multiple addresses using `provider.getBalance()`
- Converted wei to ETH using `ethers.formatEther()`
- Got current block number

**Q: Why do Vitalik and Ethereum Foundation have 0 balance on Sepolia?**
A: This is testnet! Their balances are on mainnet, not Sepolia testnet.

---

### Activity 2: Explore Block Data

**Goal:** Fetch and display block information.

**Step 1:** Create `explore-blocks.ts`

```typescript
// scripts/week3/explore-blocks.ts
import { ethers } from "ethers";
import hre from "hardhat";

async function exploreBlocks() {
  console.log("=== Exploring Block Data ===\n");

  const provider = new ethers.JsonRpcProvider(
    hre.vars.get("ALCHEMY_API_KEY")
  );

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

exploreBlocks();
```

**Step 2:** Run the script

```powershell
npx tsx scripts/week3/explore-blocks.ts
```

**Expected Output:**
```
=== Exploring Block Data ===

Latest Block Number: 9517890

📦 Block Details:
  Number: 9517890
  Hash: 0xabc123...
  Parent Hash: 0xdef456...
  Timestamp: 10/29/2025, 3:45:00 PM
  Miner/Validator: 0x789...
  Gas Used: 12487623
  Gas Limit: 30000000
  Base Fee Per Gas: 15.5 gwei
  Transaction Count: 127

  Block Utilization: 41.63%

📝 Transactions in this block:
  1. 0x1a2b3c...
  2. 0x4d5e6f...
  3. 0x7a8b9c...
  4. 0x0d1e2f...
  5. 0x3a4b5c...
  ... and 122 more

View on Etherscan: https://sepolia.etherscan.io/block/9517890
```

**What Just Happened?**
- Fetched latest block number with `provider.getBlockNumber()`
- Got block details with `provider.getBlock(number)`
- Converted timestamp to human-readable date
- Calculated block utilization (gasUsed / gasLimit)
- Showed transaction hashes in the block

**Q: What's the difference between `getBlock()` with and without transactions?**
A:
- `getBlock(number)` returns just tx hashes (fast)
- `getBlock(number, true)` returns full tx objects (slower, more data)

---

### Activity 3: Get Transaction History (Using Etherscan API)

**Goal:** Fetch transaction history for your wallet address.

**Step 1:** Get Etherscan API Key

1. Go to https://etherscan.io/register (create account)
2. Go to https://etherscan.io/myapikey
3. Create a new API key (free tier)
4. Store it in Hardhat keystore:

```powershell
npx hardhat keystore set --dev ETHERSCAN_API_KEY
# Paste your API key when prompted
```

**Step 2:** Create `transaction-history.ts`

```typescript
// scripts/week3/transaction-history.ts
import { ethers } from "ethers";
import hre from "hardhat";

async function getTransactionHistory() {
  console.log("=== Transaction History ===\n");

  const provider = new ethers.JsonRpcProvider(
    hre.vars.get("ALCHEMY_API_KEY")
  );

  // Your wallet address
  const address = "0xB09b5449D8BB84312Fbc4293baf122E0e1875736";

  console.log("Wallet Address:", address);
  console.log("");

  // Get transaction count (nonce)
  const txCount = await provider.getTransactionCount(address);
  console.log("Total Transactions Sent:", txCount);
  console.log("");

  // NOTE: To get FULL transaction history (sent + received),
  // you need an indexer like Etherscan API or Alchemy's enhanced APIs.
  // Native RPC doesn't support "get all transactions for address"

  console.log("📌 To see full transaction history:");
  console.log("  Etherscan: https://sepolia.etherscan.io/address/" + address);
  console.log("");

  // Alternative: Use Etherscan API
  console.log("Using Etherscan API for full history...");
  console.log("");

  try {
    const etherscanApiKey = hre.vars.get("ETHERSCAN_API_KEY");
    const etherscanUrl = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanApiKey}`;

    const response = await fetch(etherscanUrl);
    const data = await response.json();

    if (data.status === "1" && data.result.length > 0) {
      console.log(`📝 Recent Transactions (showing first 5 of ${data.result.length}):\n`);

      data.result.slice(0, 5).forEach((tx: any, index: number) => {
        const valueInEth = ethers.formatEther(tx.value);
        const date = new Date(parseInt(tx.timeStamp) * 1000).toLocaleString();
        const type = tx.from.toLowerCase() === address.toLowerCase() ? "SENT" : "RECEIVED";

        console.log(`${index + 1}. ${type} ${valueInEth} ETH`);
        console.log(`   Hash: ${tx.hash}`);
        console.log(`   ${type === "SENT" ? "To" : "From"}: ${type === "SENT" ? tx.to : tx.from}`);
        console.log(`   Block: ${tx.blockNumber}`);
        console.log(`   Date: ${date}`);
        console.log(`   Gas Used: ${tx.gasUsed}`);
        console.log("");
      });

      // Calculate total ETH sent
      const totalSent = data.result
        .filter((tx: any) => tx.from.toLowerCase() === address.toLowerCase())
        .reduce((sum: bigint, tx: any) => sum + BigInt(tx.value), 0n);

      console.log("💰 Total ETH Sent:", ethers.formatEther(totalSent), "ETH");
    } else {
      console.log("No transactions found or Etherscan API error");
      console.log("Response:", data.message);
    }
  } catch (error: any) {
    console.log("❌ Error fetching from Etherscan API");
    console.log("Make sure you've set ETHERSCAN_API_KEY in keystore:");
    console.log("  npx hardhat keystore set --dev ETHERSCAN_API_KEY");
  }
}

getTransactionHistory();
```

**Step 3:** Run the script

```powershell
npx tsx scripts/week3/transaction-history.ts
```

**Expected Output:**
```
=== Transaction History ===

Wallet Address: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736

Total Transactions Sent: 3

📌 To see full transaction history:
  Etherscan: https://sepolia.etherscan.io/address/0xB09b5449D8BB84312Fbc4293baf122E0e1875736

Using Etherscan API for full history...

📝 Recent Transactions (showing first 5 of 3):

1. SENT 0.001 ETH
   Hash: 0xabc123...
   To: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2
   Block: 9517450
   Date: 10/29/2025, 2:30:15 PM
   Gas Used: 21000

2. SENT 0.0 ETH
   Hash: 0xdef456...
   To: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   Block: 9515230
   Date: 10/27/2025, 10:15:42 AM
   Gas Used: 123456

3. RECEIVED 0.05 ETH
   Hash: 0x789abc...
   From: 0xFaucet...
   Block: 9510000
   Date: 10/25/2025, 5:20:10 PM
   Gas Used: 21000

💰 Total ETH Sent: 0.001 ETH
```

**What Just Happened?**
- Used `provider.getTransactionCount()` for sent transactions
- Used Etherscan API to get full transaction history (sent + received)
- Parsed and displayed transaction details
- Calculated total ETH sent

**Q: Why can't we get transaction history with just RPC?**
A: Ethereum nodes index by block/tx hash, not by address. You need an indexer (Etherscan, Alchemy, The Graph) to query "all transactions for address X".

---

### Activity 4: Monitor Real-Time Blockchain State

**Goal:** Watch new blocks arrive in real-time.

**Step 1:** Create `monitor-blocks.ts`

```typescript
// scripts/week3/monitor-blocks.ts
import { ethers } from "ethers";
import hre from "hardhat";

async function monitorBlocks() {
  console.log("=== Monitoring Blockchain (Real-Time) ===\n");
  console.log("Watching for new blocks... (Press Ctrl+C to stop)\n");

  const provider = new ethers.JsonRpcProvider(
    hre.vars.get("ALCHEMY_API_KEY")
  );

  // Listen for new blocks
  provider.on("block", async (blockNumber) => {
    const block = await provider.getBlock(blockNumber);

    if (!block) return;

    const timestamp = new Date(block.timestamp * 1000).toLocaleTimeString();
    const gasUsed = ethers.formatUnits(block.gasUsed, 0);
    const baseFee = ethers.formatUnits(block.baseFeePerGas || 0n, "gwei");

    console.log(`📦 Block ${blockNumber}`);
    console.log(`   Time: ${timestamp}`);
    console.log(`   Transactions: ${block.transactions.length}`);
    console.log(`   Gas Used: ${gasUsed}`);
    console.log(`   Base Fee: ${baseFee} gwei`);
    console.log(`   Hash: ${block.hash}`);
    console.log("");
  });

  // Keep script running
  await new Promise(() => {}); // Run forever (until Ctrl+C)
}

monitorBlocks();
```

**Step 2:** Run the script

```powershell
npx tsx scripts/week3/monitor-blocks.ts
```

**Expected Output (updates every ~12 seconds):**
```
=== Monitoring Blockchain (Real-Time) ===

Watching for new blocks... (Press Ctrl+C to stop)

📦 Block 9517890
   Time: 3:45:12 PM
   Transactions: 127
   Gas Used: 12487623
   Base Fee: 15.5 gwei
   Hash: 0xabc123...

📦 Block 9517891
   Time: 3:45:24 PM
   Transactions: 143
   Gas Used: 14200156
   Base Fee: 16.2 gwei
   Hash: 0xdef456...

📦 Block 9517892
   Time: 3:45:36 PM
   Transactions: 98
   Gas Used: 9823147
   Base Fee: 14.8 gwei
   Hash: 0x789abc...

...
```

**What Just Happened?**
- Used `provider.on("block", callback)` to listen for new blocks
- Displayed block details as they arrive
- Runs continuously until you press Ctrl+C

**Q: How fast do blocks arrive?**
A: Ethereum (including Sepolia) targets ~12-second block time. After The Merge, blocks are very consistent.

**To Stop:** Press `Ctrl+C` in PowerShell

---

## 📝 Deliverables

By the end of this class, you should have:

- [x] ✅ Four working scripts in `blockchain/scripts/week3/`:
  - `query-balances.ts` (check account balances)
  - `explore-blocks.ts` (fetch block data)
  - `transaction-history.ts` (get transaction history via Etherscan API)
  - `monitor-blocks.ts` (watch blocks in real-time)
- [x] ✅ Etherscan API key stored in Hardhat keystore
- [x] ✅ Understanding of blockchain as a public database
- [x] ✅ Ability to query balances, blocks, and transactions
- [x] ✅ Understanding of indexers (Etherscan, Alchemy) vs native RPC

---

## 🐛 Common Issues & Solutions

### Issue 1: Etherscan API returns "NOTOK" status

**Error:**
```json
{ "status": "0", "message": "NOTOK", "result": "Max rate limit reached" }
```

**Cause:** Free Etherscan API has rate limits (5 requests/second).

**Solution:**
Add delays between requests:
```typescript
await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
```

---

### Issue 2: `provider.on("block")` not firing

**Symptom:** Monitor script runs but no blocks appear.

**Possible Causes:**
1. **WebSocket needed:** Some providers require WebSocket, not HTTP
2. **Provider doesn't support subscriptions**

**Solution:**
Check if your Alchemy endpoint supports subscriptions. HTTP endpoints work, but WebSocket is better for real-time:
```typescript
// For real-time subscriptions, use WebSocket
const provider = new ethers.WebSocketProvider(
  "wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
);
```

For this class, HTTP with polling works fine (ethers.js handles it).

---

### Issue 3: "Invalid API Key" from Etherscan

**Error:**
```
{ "status": "0", "message": "NOTOK", "result": "Invalid API Key" }
```

**Solution:**
1. Verify you created an Etherscan account and API key
2. Make sure you're using the SEPOLIA Etherscan API: `api-sepolia.etherscan.io`
3. Check keystore:
```powershell
npx hardhat keystore list --dev
```
4. Update if needed:
```powershell
npx hardhat keystore set --dev --force ETHERSCAN_API_KEY
```

---

### Issue 4: Block data is `null`

**Symptom:** `provider.getBlock(number)` returns `null`.

**Possible Causes:**
1. **Block number doesn't exist yet** (future block)
2. **Very recent block** (not yet propagated to all nodes)

**Solution:**
```typescript
const block = await provider.getBlock(blockNumber);
if (!block) {
  console.log("Block not found or not available yet");
  return;
}
```

---

## ✅ Self-Assessment Quiz

### 1. What information can you query from the blockchain without needing private keys?

<details>
<summary>Answer</summary>

**You can query (public data):**
- ✅ Account balances (`eth_getBalance`)
- ✅ Transaction history (via indexer)
- ✅ Block data (headers, transactions, gas)
- ✅ Smart contract code
- ✅ Smart contract state (public variables)
- ✅ Event logs
- ✅ Transaction receipts (status, gas used)

**You CANNOT query (private data):**
- ❌ Private keys (these never touch the blockchain)
- ❌ Private contract variables (only readable by contract)
- ❌ Off-chain data (unless stored on-chain)

**Key point:** Everything on-chain is public. Privacy comes from encryption or off-chain storage.
</details>

---

### 2. What's the difference between `getTransaction()` and querying Etherscan API for transactions?

<details>
<summary>Answer</summary>

**`provider.getTransaction(hash)`:**
- Gets a SPECIFIC transaction by hash
- You must know the transaction hash
- Direct RPC call (fast)
- Works without external services

**Etherscan API `txlist`:**
- Gets ALL transactions for an address
- Don't need to know transaction hashes
- Uses indexer (Etherscan scanned all blocks)
- Requires API key and external service

**Example:**
```typescript
// Native RPC (need tx hash)
const tx = await provider.getTransaction("0xabc123...");

// Etherscan API (get all for address)
fetch(`https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=0x...`)
```

**Why the difference?** Ethereum nodes index by block/tx hash, not by address. Indexers like Etherscan scan all blocks and create address indexes.
</details>

---

### 3. How do you convert wei to ETH and vice versa?

<details>
<summary>Answer</summary>

**Wei → ETH (ethers.js v6):**
```typescript
const weiBalance = await provider.getBalance(address);
const ethBalance = ethers.formatEther(weiBalance);
console.log(ethBalance); // "0.05"
```

**ETH → Wei:**
```typescript
const ethAmount = "0.01";
const weiAmount = ethers.parseEther(ethAmount);
console.log(weiAmount); // 10000000000000000n
```

**Manual calculation:**
```
1 ETH = 1,000,000,000,000,000,000 wei (10^18)

Wei → ETH: divide by 10^18
ETH → Wei: multiply by 10^18
```

**Other units:**
```typescript
ethers.formatUnits(value, "gwei"); // Wei → Gwei
ethers.parseUnits("20", "gwei");   // Gwei → Wei
```
</details>

---

### 4. What is block utilization and why does it matter?

<details>
<summary>Answer</summary>

**Block Utilization = (Gas Used / Gas Limit) × 100%**

**Example:**
```
Gas Used: 12,500,000
Gas Limit: 30,000,000
Utilization: (12,500,000 / 30,000,000) × 100% = 41.67%
```

**Why it matters:**

**Low utilization (< 50%):**
- ✅ Network not congested
- ✅ Lower gas prices
- ✅ Transactions confirm quickly

**High utilization (> 90%):**
- ⚠️ Network congested
- ⚠️ Higher gas prices
- ⚠️ Slower confirmations
- ⚠️ Some transactions might not fit in next block

**Use case:** Check utilization before sending transactions. If network is congested, wait or pay higher gas.
</details>

---

### 5. How do you listen for new blocks in real-time?

<details>
<summary>Answer</summary>

**Using ethers.js v6 event listener:**

```typescript
const provider = new ethers.JsonRpcProvider(rpcUrl);

// Listen for new blocks
provider.on("block", (blockNumber) => {
  console.log("New block:", blockNumber);
});
```

**More detailed example:**
```typescript
provider.on("block", async (blockNumber) => {
  const block = await provider.getBlock(blockNumber);
  console.log("Block", blockNumber);
  console.log("  Transactions:", block.transactions.length);
  console.log("  Gas Used:", block.gasUsed);
});
```

**Other events you can listen to:**
- `"block"` - New block
- `"pending"` - New pending transaction (not all providers support)
- Filter events - Contract-specific events

**WebSocket for better real-time:**
```typescript
const provider = new ethers.WebSocketProvider(
  "wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
);
```

**To stop listening:**
```typescript
provider.removeAllListeners("block");
```
</details>

---

### 6. Why do we need indexers like Etherscan or The Graph?

<details>
<summary>Answer</summary>

**Problem:** Ethereum nodes don't natively support:
- "Get all transactions for address X"
- "Get all token transfers for address X"
- "Get all contracts deployed by address X"
- "Search transactions by criteria"

**Why not?** Nodes index by:
- Block number → Block data
- Transaction hash → Transaction data
- NOT by address → transactions

**Solution: Indexers**

**What indexers do:**
1. Scan every block (from genesis to latest)
2. Parse all transactions and logs
3. Build custom indexes (by address, by contract, by token, etc.)
4. Provide APIs for querying

**Examples:**
- **Etherscan:** Web UI + API for blockchain data
- **The Graph:** Decentralized indexing protocol (GraphQL)
- **Alchemy Enhanced APIs:** Transaction history, NFT APIs, etc.

**When to use:**
- ✅ Transaction history for an address
- ✅ Token balances and transfers
- ✅ Contract events filtered by address
- ✅ Advanced queries (time ranges, filters)

**When NOT needed:**
- ❌ Getting balance of ONE address (use `eth_getBalance`)
- ❌ Fetching ONE transaction by hash (use `eth_getTransactionByHash`)
- ❌ Getting latest block number (use `eth_blockNumber`)
</details>

---

### 7. What's in a block's `transactions` field?

<details>
<summary>Answer</summary>

**Depends on how you call `getBlock()`:**

**Option 1: Transaction hashes only (default)**
```typescript
const block = await provider.getBlock(9517890);
console.log(block.transactions);
// ["0xabc123...", "0xdef456...", "0x789abc..."]
```

**Returns:** Array of transaction hash strings

**Option 2: Full transaction objects**
```typescript
const block = await provider.getBlock(9517890, true);
console.log(block.prefetchedTransactions);
// [{ from, to, value, hash, ... }, { ... }, ...]
```

**Returns:** Array of full transaction objects

**When to use each:**

**Hashes only (faster, less data):**
- ✅ Counting transactions in block
- ✅ Showing list of transaction IDs
- ✅ Checking if specific tx is in block

**Full objects (slower, more data):**
- ✅ Analyzing transaction details without additional requests
- ✅ Computing statistics (avg value, total gas, etc.)
- ✅ Filtering transactions by criteria

**Example:**
```typescript
// Fast: Just count
const block = await provider.getBlock(123456);
console.log("Tx count:", block.transactions.length);

// Detailed: Analyze all
const blockWithTxs = await provider.getBlock(123456, true);
const totalValue = blockWithTxs.prefetchedTransactions
  .reduce((sum, tx) => sum + tx.value, 0n);
```
</details>

---

## 🎯 Key Takeaways

1. **Blockchain is a public database** - Anyone can read balances, transactions, blocks

2. **ethers.js provides easy query methods** - `getBalance()`, `getBlock()`, `getTransaction()`

3. **Indexers are needed for advanced queries** - Etherscan API, Alchemy, The Graph

4. **Native RPC limitations** - Can't get "all transactions for address" without indexer

5. **Real-time monitoring** - Use `provider.on("block")` to watch blockchain live

6. **Wei ↔ ETH conversion** - `formatEther()` and `parseEther()`

7. **Block structure** - Contains number, hash, timestamp, transactions, gas data

---

## 🔗 Next Steps

In **Class 3.4: Hardhat Project Exploration**, you'll:
- Understand Hardhat project structure
- Explore artifacts and cache folders
- Learn about Hardhat tasks and plugins
- Build contracts with `npx hardhat build`

**Before Class 3.4:**
- Ensure all 4 scripts from this class work
- Review your Hardhat project from Week 1
- Check that `HelloFamily.sol` contract still compiles

---

## 📚 Reading References

**Bitcoin Book:**
- **Chapter 7:** The Blockchain (Introduction, Structure of a Block, Block Header)
- **Chapter 8:** Mining and Consensus (Block Validation)

**Ethereum Book:**
- **Chapter 7:** Transactions and Messages (Transaction Structure, Transaction Propagation)
- **Chapter 13:** The Ethereum Virtual Machine (Ethereum State, Account State)

**Key sections:**
- Block structure and linking (parent hash → hash chain)
- Transaction lifecycle (mempool → block → confirmations)
- State (account balances, nonces, contract storage)
- Public vs private data on blockchain

---

## 🧑‍🏫 Teaching Notes (For Claude Code)

**Pacing:**
- 4 activities, ~15 minutes each
- Activity 3 requires Etherscan API key (help user set up)
- Activity 4 runs indefinitely (explain Ctrl+C to stop)

**Common Questions:**
1. **"Why can't I get transaction history with just RPC?"** → Explain indexing limitations
2. **"Is everything on blockchain public?"** → Yes, except private keys
3. **"How do DApps show my transaction history?"** → They use indexers (Etherscan, The Graph)

**Etherscan API Setup:**
- Help user create account and get API key
- Explain free tier limits (5 req/sec)
- Show how to store in Hardhat keystore

**Real-Time Monitoring:**
- Explain block time (~12 seconds)
- Show how to stop script (Ctrl+C)
- Optional: Mention WebSocket for better real-time

**Version-Specific:**
- ✅ ethers.js v6 syntax (`JsonRpcProvider`, `formatEther`)
- ✅ Fetch API (Node.js 18+ has native fetch)
- ❌ NOT ethers v5 (different provider syntax)

**Hands-On Emphasis:**
- User must run ALL scripts
- Encourage exploring Etherscan manually
- Compare script output to Etherscan UI

---

*Last Updated: 2025-10-29*
*Course: FamilyChain Blockchain Development*
*Week 3, Class 3.3 of 4*
