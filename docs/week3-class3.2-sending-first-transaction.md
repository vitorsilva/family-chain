# Week 3, Class 3.2: Sending Your First Transaction
## FamilyChain Course - Learning Guide

---

## 🎯 Overview

**Duration:** 1-2 hours
**Prerequisites:**
- Week 3, Class 3.1 complete (wallet creation via CLI)
- Existing wallet with testnet ETH (~0.05 ETH from Week 2)
- Alchemy RPC configured

**What You'll Learn:**
Now that you understand wallets, it's time to send your first transaction programmatically! You'll learn how transactions work under the hood, estimate gas costs, and send ETH between addresses.

**Why This Matters:**
Every blockchain interaction is a transaction - from sending ETH to calling smart contracts. Understanding transaction parameters, gas mechanics, and transaction lifecycle is fundamental to blockchain development.

---

## 📚 Learning Objectives

By the end of this class, you will be able to:

1. **Send** ETH transactions programmatically using ethers.js v6
2. **Understand** transaction anatomy (to, value, gas, nonce, data)
3. **Estimate** gas costs before sending transactions
4. **Wait for** transaction confirmations
5. **Check** transaction status on Etherscan
6. **Handle** common transaction errors (insufficient funds, gas too low, nonce issues)
7. **Calculate** transaction costs in ETH and USD (concept)

---

## 📖 Key Concepts

### 1. Transaction Anatomy

Every Ethereum transaction has these fields:

| Field | Description | Example |
|-------|-------------|---------|
| **from** | Sender address (your wallet) | `0xB09b...` |
| **to** | Recipient address (or contract) | `0x742d...` |
| **value** | Amount to send (in wei) | `1000000000000000000` (1 ETH) |
| **gasLimit** | Maximum gas you're willing to use | `21000` |
| **gasPrice** (legacy) | Price per gas unit (in wei) | `20000000000` (20 gwei) |
| **maxFeePerGas** (EIP-1559) | Max total fee per gas | `30000000000` (30 gwei) |
| **maxPriorityFeePerGas** (EIP-1559) | Max tip to miner | `2000000000` (2 gwei) |
| **nonce** | Transaction count from sender | `5` |
| **data** | Extra data (for contract calls) | `0x` (empty for simple send) |

**Key Terms:**
- **Wei:** Smallest ETH unit (1 ETH = 10¹⁸ wei)
- **Gwei:** Gas price unit (1 gwei = 10⁹ wei)
- **Gas:** Computational work units
- **Nonce:** Sequence number preventing replay attacks

### 2. Gas Mechanics

**What is Gas?**
Gas measures computational work on Ethereum. More complex operations = more gas.

**Simple ETH Transfer:**
- Gas Limit: **21,000** (fixed for simple sends)
- Gas Price: Varies (network congestion)
- Total Cost: `Gas Limit × Gas Price`

**Example Calculation:**
```
Gas Limit: 21,000
Gas Price: 20 gwei (20,000,000,000 wei)
Total Gas Cost: 21,000 × 20 gwei = 420,000 gwei = 0.00042 ETH
```

**EIP-1559 (Post-London Fork):**
```
Base Fee: 15 gwei (burned)
Priority Fee: 2 gwei (tip to validator)
Max Fee: 30 gwei (your maximum)

Actual Cost = (Base Fee + Priority Fee) × Gas Used
Refund = (Max Fee - Actual Price) × Gas Used
```

### 3. Transaction Lifecycle

```
1. Create Transaction
   ↓
2. Sign Transaction (with private key)
   ↓
3. Send to Network (via provider)
   ↓
4. Pending in Mempool
   ↓
5. Included in Block (mined)
   ↓
6. Confirmations (more blocks on top)
```

**Confirmations:**
- **0 confirmations:** In mempool (not yet in block)
- **1 confirmation:** Included in 1 block
- **6+ confirmations:** Generally considered final (exchanges use this)
- **12+ confirmations:** Very safe (hard to reverse)

### 4. Nonce Management

**What is Nonce?**
A counter of transactions sent from your address. Prevents replay attacks.

**Example:**
```
Transaction 1: nonce = 0
Transaction 2: nonce = 1
Transaction 3: nonce = 2
...
```

**Rules:**
- Nonce must be sequential (can't skip)
- If nonce 2 arrives before nonce 1, it waits (stuck transaction)
- Provider tracks your nonce automatically

**Stuck Transaction:**
If you send a transaction with too-low gas, it gets stuck. Solutions:
1. Send new transaction with same nonce + higher gas (replacement)
2. Wait for it to be dropped (not ideal)

### 5. Transaction Receipts

After a transaction is mined, you get a receipt with:

| Field | Description |
|-------|-------------|
| **transactionHash** | Unique transaction ID |
| **blockNumber** | Block it was included in |
| **gasUsed** | Actual gas consumed |
| **status** | 1 = success, 0 = failed (reverted) |
| **logs** | Events emitted (for contracts) |

---

## 🛠️ Hands-On Activities

### Activity 1: Send ETH Between Your Wallets

**Goal:** Send testnet ETH from your main wallet to a newly created wallet.

**Step 1:** Create `send-transaction.ts`

```typescript
// scripts/week3/send-transaction.ts
import { ethers } from "ethers";
import hre from "hardhat";

async function sendTransaction() {
  console.log("=== Sending Your First Transaction ===\n");

  // Setup provider
  const provider = new ethers.JsonRpcProvider(
    hre.vars.get("ALCHEMY_API_KEY")
  );

  // Load your existing wallet (sender)
  const senderWallet = new ethers.Wallet(
    hre.vars.get("SEPOLIA_PRIVATE_KEY"),
    provider
  );

  // Create a new wallet (recipient)
  const recipientWallet = ethers.Wallet.createRandom();

  console.log("Sender:", senderWallet.address);
  console.log("Recipient:", recipientWallet.address);
  console.log("");

  // Check sender balance
  const balanceBefore = await provider.getBalance(senderWallet.address);
  console.log("Sender balance before:", ethers.formatEther(balanceBefore), "ETH");

  // Amount to send (0.001 ETH = 1,000,000,000,000,000 wei)
  const amountToSend = ethers.parseEther("0.001");
  console.log("Amount to send:", ethers.formatEther(amountToSend), "ETH");
  console.log("");

  // Create transaction
  const tx = await senderWallet.sendTransaction({
    to: recipientWallet.address,
    value: amountToSend,
  });

  console.log("✅ Transaction sent!");
  console.log("Transaction Hash:", tx.hash);
  console.log("View on Etherscan: https://sepolia.etherscan.io/tx/" + tx.hash);
  console.log("");
  console.log("⏳ Waiting for confirmation...");

  // Wait for transaction to be mined
  const receipt = await tx.wait();

  console.log("✅ Transaction confirmed!");
  console.log("Block Number:", receipt?.blockNumber);
  console.log("Gas Used:", receipt?.gasUsed.toString());
  console.log("Status:", receipt?.status === 1 ? "Success" : "Failed");
  console.log("");

  // Check balances after
  const balanceAfter = await provider.getBalance(senderWallet.address);
  const recipientBalance = await provider.getBalance(recipientWallet.address);

  console.log("Sender balance after:", ethers.formatEther(balanceAfter), "ETH");
  console.log("Recipient balance:", ethers.formatEther(recipientBalance), "ETH");
  console.log("");

  // Calculate total cost
  const gasCost = receipt!.gasUsed * receipt!.gasPrice;
  const totalCost = amountToSend + gasCost;
  console.log("Gas Cost:", ethers.formatEther(gasCost), "ETH");
  console.log("Total Cost (amount + gas):", ethers.formatEther(totalCost), "ETH");
}

sendTransaction();
```

**Step 2:** Run the script

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\blockchain
npx tsx scripts/week3/send-transaction.ts
```

**Expected Output:**
```
=== Sending Your First Transaction ===

Sender: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
Recipient: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2

Sender balance before: 0.0503 ETH
Amount to send: 0.001 ETH

✅ Transaction sent!
Transaction Hash: 0xabc123...
View on Etherscan: https://sepolia.etherscan.io/tx/0xabc123...

⏳ Waiting for confirmation...
✅ Transaction confirmed!
Block Number: 9517450
Gas Used: 21000
Status: Success

Sender balance after: 0.04888 ETH
Recipient balance: 0.001 ETH

Gas Cost: 0.00042 ETH
Total Cost (amount + gas): 0.00142 ETH
```

**What Just Happened?**
1. Loaded your existing wallet (with ETH)
2. Created a new recipient wallet
3. Sent 0.001 ETH to the new wallet
4. Waited for transaction to be mined (confirmed)
5. Checked balances and calculated gas cost

**Q: Why did sender lose more than 0.001 ETH?**
A: Because you also paid gas fees! Total cost = amount sent + gas cost.

---

### Activity 2: Estimate Gas Before Sending

**Goal:** Estimate gas cost before sending to avoid surprises.

**Step 1:** Create `estimate-gas.ts`

```typescript
// scripts/week3/estimate-gas.ts
import { ethers } from "ethers";
import hre from "hardhat";

async function estimateGas() {
  console.log("=== Estimating Gas Costs ===\n");

  const provider = new ethers.JsonRpcProvider(
    hre.vars.get("ALCHEMY_API_KEY")
  );

  const senderWallet = new ethers.Wallet(
    hre.vars.get("SEPOLIA_PRIVATE_KEY"),
    provider
  );

  const recipientAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2";
  const amountToSend = ethers.parseEther("0.01");

  console.log("Estimating gas for sending", ethers.formatEther(amountToSend), "ETH");
  console.log("");

  // Estimate gas limit
  const estimatedGas = await provider.estimateGas({
    from: senderWallet.address,
    to: recipientAddress,
    value: amountToSend,
  });

  console.log("Estimated Gas Limit:", estimatedGas.toString());

  // Get current gas prices (EIP-1559)
  const feeData = await provider.getFeeData();

  console.log("");
  console.log("Network Fee Data:");
  console.log("  Max Fee Per Gas:", ethers.formatUnits(feeData.maxFeePerGas || 0n, "gwei"), "gwei");
  console.log("  Max Priority Fee:", ethers.formatUnits(feeData.maxPriorityFeePerGas || 0n, "gwei"), "gwei");

  // Calculate total gas cost
  const gasCostWei = estimatedGas * (feeData.maxFeePerGas || 0n);
  const gasCostEth = ethers.formatEther(gasCostWei);

  console.log("");
  console.log("📊 Cost Breakdown:");
  console.log("  Amount to send:", ethers.formatEther(amountToSend), "ETH");
  console.log("  Estimated gas cost:", gasCostEth, "ETH");
  console.log("  Total cost:", ethers.formatEther(amountToSend + gasCostWei), "ETH");

  // Check if you have enough balance
  const balance = await provider.getBalance(senderWallet.address);
  const totalNeeded = amountToSend + gasCostWei;

  console.log("");
  console.log("💰 Balance Check:");
  console.log("  Your balance:", ethers.formatEther(balance), "ETH");
  console.log("  Total needed:", ethers.formatEther(totalNeeded), "ETH");
  console.log("  Can send?", balance >= totalNeeded ? "✅ YES" : "❌ NO");
}

estimateGas();
```

**Step 2:** Run the script

```powershell
npx tsx scripts/week3/estimate-gas.ts
```

**Expected Output:**
```
=== Estimating Gas Costs ===

Estimating gas for sending 0.01 ETH

Estimated Gas Limit: 21000

Network Fee Data:
  Max Fee Per Gas: 25.5 gwei
  Max Priority Fee: 2.0 gwei

📊 Cost Breakdown:
  Amount to send: 0.01 ETH
  Estimated gas cost: 0.0005355 ETH
  Total cost: 0.0105355 ETH

💰 Balance Check:
  Your balance: 0.0503 ETH
  Total needed: 0.0105355 ETH
  Can send? ✅ YES
```

**What Just Happened?**
- Used `provider.estimateGas()` to simulate transaction
- Fetched current network gas prices with `provider.getFeeData()`
- Calculated total cost (amount + gas)
- Verified you have enough balance

**Q: Why estimate gas?**
A: To avoid failed transactions due to insufficient funds or too-low gas limits.

---

### Activity 3: Check Transaction Status

**Goal:** Query transaction details after sending.

**Step 1:** Create `check-transaction.ts`

```typescript
// scripts/week3/check-transaction.ts
import { ethers } from "ethers";
import hre from "hardhat";

async function checkTransaction() {
  console.log("=== Checking Transaction Status ===\n");

  const provider = new ethers.JsonRpcProvider(
    hre.vars.get("ALCHEMY_API_KEY")
  );

  // Replace with YOUR transaction hash from Activity 1
  const txHash = "0xYOUR_TRANSACTION_HASH_HERE";

  console.log("Transaction Hash:", txHash);
  console.log("");

  // Get transaction details
  const tx = await provider.getTransaction(txHash);

  if (!tx) {
    console.log("❌ Transaction not found!");
    return;
  }

  console.log("📝 Transaction Details:");
  console.log("  From:", tx.from);
  console.log("  To:", tx.to);
  console.log("  Value:", ethers.formatEther(tx.value), "ETH");
  console.log("  Gas Limit:", tx.gasLimit.toString());
  console.log("  Nonce:", tx.nonce);
  console.log("");

  // Get transaction receipt (only available after mining)
  const receipt = await provider.getTransactionReceipt(txHash);

  if (!receipt) {
    console.log("⏳ Transaction pending (not yet mined)");
    return;
  }

  console.log("✅ Transaction Receipt:");
  console.log("  Block Number:", receipt.blockNumber);
  console.log("  Gas Used:", receipt.gasUsed.toString());
  console.log("  Gas Price:", ethers.formatUnits(receipt.gasPrice, "gwei"), "gwei");
  console.log("  Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");
  console.log("");

  // Calculate confirmations
  const currentBlock = await provider.getBlockNumber();
  const confirmations = currentBlock - receipt.blockNumber;

  console.log("🔗 Confirmations:", confirmations);
  console.log("  Safety Level:",
    confirmations >= 12 ? "Very Safe" :
    confirmations >= 6 ? "Safe" :
    confirmations >= 1 ? "Confirmed" :
    "Pending"
  );

  // Calculate actual cost
  const gasCost = receipt.gasUsed * receipt.gasPrice;
  const totalCost = tx.value + gasCost;

  console.log("");
  console.log("💰 Cost Breakdown:");
  console.log("  Amount Sent:", ethers.formatEther(tx.value), "ETH");
  console.log("  Gas Cost:", ethers.formatEther(gasCost), "ETH");
  console.log("  Total Cost:", ethers.formatEther(totalCost), "ETH");
}

checkTransaction();
```

**Step 2:** Update the script with your transaction hash from Activity 1

Replace `0xYOUR_TRANSACTION_HASH_HERE` with the actual hash.

**Step 3:** Run the script

```powershell
npx tsx scripts/week3/check-transaction.ts
```

**Expected Output:**
```
=== Checking Transaction Status ===

Transaction Hash: 0xabc123...

📝 Transaction Details:
  From: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
  To: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2
  Value: 0.001 ETH
  Gas Limit: 21000
  Nonce: 2

✅ Transaction Receipt:
  Block Number: 9517450
  Gas Used: 21000
  Gas Price: 20.0 gwei
  Status: ✅ Success

🔗 Confirmations: 215
  Safety Level: Very Safe

💰 Cost Breakdown:
  Amount Sent: 0.001 ETH
  Gas Cost: 0.00042 ETH
  Total Cost: 0.00142 ETH
```

**What Just Happened?**
- Queried transaction details with `provider.getTransaction()`
- Got transaction receipt with `provider.getTransactionReceipt()`
- Calculated confirmations (current block - tx block)
- Showed cost breakdown

---

### Activity 4: Handle Transaction Errors

**Goal:** Learn to handle common transaction errors gracefully.

**Step 1:** Create `handle-errors.ts`

```typescript
// scripts/week3/handle-errors.ts
import { ethers } from "ethers";
import hre from "hardhat";

async function handleErrors() {
  console.log("=== Handling Transaction Errors ===\n");

  const provider = new ethers.JsonRpcProvider(
    hre.vars.get("ALCHEMY_API_KEY")
  );

  const wallet = new ethers.Wallet(
    hre.vars.get("SEPOLIA_PRIVATE_KEY"),
    provider
  );

  // Test 1: Insufficient Funds
  console.log("Test 1: Insufficient Funds Error");
  try {
    const balance = await provider.getBalance(wallet.address);
    const tooMuch = balance + ethers.parseEther("1"); // More than we have

    const tx = await wallet.sendTransaction({
      to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2",
      value: tooMuch,
    });
    await tx.wait();
  } catch (error: any) {
    console.log("❌ Error caught:", error.shortMessage || error.message);
    console.log("  Reason: You tried to send more ETH than your balance\n");
  }

  // Test 2: Invalid Address
  console.log("Test 2: Invalid Address Error");
  try {
    await wallet.sendTransaction({
      to: "0xinvalid", // Invalid address
      value: ethers.parseEther("0.001"),
    });
  } catch (error: any) {
    console.log("❌ Error caught:", error.shortMessage || error.message);
    console.log("  Reason: The recipient address is not a valid Ethereum address\n");
  }

  // Test 3: Gas Too Low (simulation)
  console.log("Test 3: Gas Estimation");
  try {
    const gasEstimate = await provider.estimateGas({
      from: wallet.address,
      to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2",
      value: ethers.parseEther("0.001"),
    });

    console.log("✅ Gas estimation successful:", gasEstimate.toString());
    console.log("  Tip: Always estimate gas before sending transactions\n");
  } catch (error: any) {
    console.log("❌ Error caught:", error.message);
  }

  // Test 4: Check Nonce
  console.log("Test 4: Understanding Nonce");
  const nonce = await provider.getTransactionCount(wallet.address);
  console.log("✅ Your current nonce:", nonce);
  console.log("  This means you've sent", nonce, "transaction(s) from this wallet");
  console.log("  Your next transaction will use nonce:", nonce);
  console.log("  Nonce prevents replay attacks and ensures transaction ordering\n");

  console.log("💡 Key Takeaways:");
  console.log("  1. Always check balance before sending");
  console.log("  2. Validate addresses before transactions");
  console.log("  3. Estimate gas to avoid failures");
  console.log("  4. Understand nonce for transaction ordering");
}

handleErrors();
```

**Step 2:** Run the script

```powershell
npx tsx scripts/week3/handle-errors.ts
```

**Expected Output:**
```
=== Handling Transaction Errors ===

Test 1: Insufficient Funds Error
❌ Error caught: insufficient funds for intrinsic transaction cost
  Reason: You tried to send more ETH than your balance

Test 2: Invalid Address Error
❌ Error caught: invalid address
  Reason: The recipient address is not a valid Ethereum address

Test 3: Gas Estimation
✅ Gas estimation successful: 21000
  Tip: Always estimate gas before sending transactions

Test 4: Understanding Nonce
✅ Your current nonce: 3
  This means you've sent 3 transaction(s) from this wallet
  Your next transaction will use nonce: 3
  Nonce prevents replay attacks and ensures transaction ordering

💡 Key Takeaways:
  1. Always check balance before sending
  2. Validate addresses before transactions
  3. Estimate gas to avoid failures
  4. Understand nonce for transaction ordering
```

**What Just Happened?**
- Caught "insufficient funds" error (trying to send more than you have)
- Caught "invalid address" error (malformed address)
- Showed how to estimate gas properly
- Explained nonce concept with real data

---

## 📝 Deliverables

By the end of this class, you should have:

- [x] ✅ Sent at least one successful transaction on Sepolia testnet
- [x] ✅ Four working scripts in `blockchain/scripts/week3/`:
  - `send-transaction.ts` (sends ETH)
  - `estimate-gas.ts` (calculates costs)
  - `check-transaction.ts` (queries transaction status)
  - `handle-errors.ts` (error handling)
- [x] ✅ Verified transaction on Etherscan
- [x] ✅ Understanding of gas mechanics and transaction lifecycle
- [x] ✅ Ability to estimate costs before sending

---

## 🐛 Common Issues & Solutions

### Issue 1: "insufficient funds" even though you have ETH

**Error:**
```
Error: insufficient funds for intrinsic transaction cost
```

**Possible Causes:**
1. **Not accounting for gas:** You need balance ≥ (amount + gas cost)
2. **Using wrong wallet:** Check you're using the wallet with ETH

**Solution:**
```typescript
// Check total needed before sending
const balance = await provider.getBalance(wallet.address);
const amountToSend = ethers.parseEther("0.01");
const gasEstimate = await provider.estimateGas({...});
const feeData = await provider.getFeeData();
const totalCost = amountToSend + (gasEstimate * feeData.maxFeePerGas);

if (balance < totalCost) {
  console.log("Not enough balance! Need", ethers.formatEther(totalCost));
}
```

---

### Issue 2: Transaction stuck (pending forever)

**Symptom:** `tx.wait()` never resolves, transaction stays pending.

**Possible Causes:**
1. **Gas price too low:** Network congestion, your gas price is below minimum
2. **Nonce issue:** Previous transaction with lower nonce is stuck

**Solution:**
```typescript
// Option 1: Wait with timeout
const receipt = await tx.wait(1, 60000); // 1 confirmation, 60s timeout

// Option 2: Check if pending
const tx = await provider.getTransaction(txHash);
if (tx && !tx.blockNumber) {
  console.log("Transaction is pending");
}

// Option 3: Replace with higher gas (same nonce)
const newTx = await wallet.sendTransaction({
  to: recipient,
  value: amount,
  nonce: stuckNonce,
  gasPrice: higherGasPrice, // 20% higher
});
```

---

### Issue 3: "nonce too low" error

**Error:**
```
Error: nonce has already been used
```

**Cause:** You tried to use a nonce that was already used in a previous transaction.

**Solution:**
Get the current nonce from the network:
```typescript
const nonce = await provider.getTransactionCount(wallet.address);
const tx = await wallet.sendTransaction({
  to: recipient,
  value: amount,
  nonce: nonce, // Use current nonce
});
```

**Note:** ethers.js handles nonce automatically, so this usually only happens if you manually set nonces.

---

### Issue 4: Transaction shows on Etherscan but receipt is null

**Symptom:** Transaction is on Etherscan, but `getTransactionReceipt()` returns `null`.

**Cause:** Transaction is very recent, indexer hasn't processed it yet.

**Solution:**
Wait a few seconds and try again:
```typescript
let receipt = null;
for (let i = 0; i < 10; i++) {
  receipt = await provider.getTransactionReceipt(txHash);
  if (receipt) break;
  console.log("Waiting for receipt...");
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
}
```

---

## ✅ Self-Assessment Quiz

### 1. What are the main components of an Ethereum transaction?

<details>
<summary>Answer</summary>

**Main transaction fields:**
1. **from** - Sender address (your wallet)
2. **to** - Recipient address (or contract)
3. **value** - Amount to send (in wei)
4. **gasLimit** - Maximum gas willing to use
5. **gasPrice / maxFeePerGas** - Price per gas unit
6. **nonce** - Transaction count from sender (prevents replay)
7. **data** - Extra data (empty for ETH transfers, used for contract calls)

**For EIP-1559 transactions (post-London fork):**
- **maxFeePerGas** - Maximum you'll pay per gas
- **maxPriorityFeePerGas** - Tip for validators

**Signature fields (added by wallet):**
- **v, r, s** - ECDSA signature components
</details>

---

### 2. How do you calculate the total cost of sending 0.01 ETH if gas costs 21,000 units at 20 gwei?

<details>
<summary>Answer</summary>

**Calculation:**
```
Amount to send: 0.01 ETH
Gas limit: 21,000
Gas price: 20 gwei = 0.00000002 ETH

Gas cost = 21,000 × 20 gwei
         = 420,000 gwei
         = 0.00042 ETH

Total cost = Amount + Gas cost
           = 0.01 + 0.00042
           = 0.01042 ETH
```

**In code:**
```typescript
const amount = ethers.parseEther("0.01");
const gasLimit = 21000n;
const gasPrice = ethers.parseUnits("20", "gwei");
const gasCost = gasLimit * gasPrice;
const totalCost = amount + gasCost;

console.log("Total:", ethers.formatEther(totalCost), "ETH");
// Output: "0.01042 ETH"
```
</details>

---

### 3. What is a nonce and why does it matter?

<details>
<summary>Answer</summary>

**Nonce = Number used ONCE**

A nonce is a counter of transactions sent from your address.

**Why it matters:**
1. **Prevents replay attacks** - Same transaction can't be replayed on the network
2. **Ensures ordering** - Transactions must be processed in nonce order
3. **Detects stuck transactions** - If nonce 2 arrives before nonce 1, it waits

**Example:**
```
Your first transaction: nonce = 0
Your second transaction: nonce = 1
Your third transaction: nonce = 2
```

**Rules:**
- Nonce must be sequential (can't skip)
- Network won't process nonce 2 until nonce 1 is confirmed
- Each address has its own nonce counter

**In code:**
```typescript
const nonce = await provider.getTransactionCount(wallet.address);
console.log("Your next transaction will use nonce:", nonce);
```
</details>

---

### 4. What's the difference between `getTransaction()` and `getTransactionReceipt()`?

<details>
<summary>Answer</summary>

**`getTransaction(txHash)`:**
- Returns transaction **details** (what you sent)
- Available immediately after sending
- Includes: from, to, value, gas, nonce, data
- Works for pending transactions

**`getTransactionReceipt(txHash)`:**
- Returns transaction **result** (what happened)
- Only available AFTER transaction is mined
- Includes: blockNumber, gasUsed, status (success/fail), logs
- Returns `null` if transaction is pending

**Example:**
```typescript
// Immediately after sending
const tx = await provider.getTransaction(txHash);
console.log("From:", tx.from); // ✅ Works

const receipt = await provider.getTransactionReceipt(txHash);
console.log("Receipt:", receipt); // null (not mined yet)

// After mining
await tx.wait();
const receipt2 = await provider.getTransactionReceipt(txHash);
console.log("Block:", receipt2.blockNumber); // ✅ Works
console.log("Status:", receipt2.status); // 1 = success
```

**Key difference:** Transaction = what you sent, Receipt = what happened.
</details>

---

### 5. Why estimate gas before sending a transaction?

<details>
<summary>Answer</summary>

**Reasons to estimate gas:**

1. **Avoid insufficient funds errors**
   - Know total cost (amount + gas) before sending
   - Ensure you have enough balance

2. **Prevent "out of gas" failures**
   - Set appropriate gas limit
   - Transactions that run out of gas fail BUT still cost gas

3. **Optimize costs**
   - See current network gas prices
   - Decide if you want to wait for lower fees

4. **Validate transaction will succeed**
   - `estimateGas()` simulates the transaction
   - If simulation fails, actual transaction would fail too

**Example:**
```typescript
// Estimate first
const gasEstimate = await provider.estimateGas({
  from: wallet.address,
  to: recipient,
  value: amount,
});

const feeData = await provider.getFeeData();
const totalCost = amount + (gasEstimate * feeData.maxFeePerGas);

// Check if affordable
if (balance >= totalCost) {
  // Safe to send!
  await wallet.sendTransaction({...});
}
```

**Rule of thumb:** Always estimate gas for important transactions, especially contract interactions (which use more gas than simple sends).
</details>

---

### 6. What does "12 confirmations" mean and why is it important?

<details>
<summary>Answer</summary>

**Confirmations = Number of blocks on top of your transaction's block**

**Example:**
```
Your tx in block 9,517,450
Current block: 9,517,462
Confirmations: 9,517,462 - 9,517,450 = 12
```

**Why it matters:**
- **0 confirmations:** Pending (not in a block yet)
- **1 confirmation:** Included in 1 block (can still be reorganized)
- **6 confirmations:** Generally considered safe (exchanges use this)
- **12+ confirmations:** Very safe (extremely hard to reverse)

**Blockchain reorganizations:**
If two miners find blocks simultaneously, the network temporarily has two competing chains. Eventually one chain becomes longer (more proof-of-work) and wins. The losing blocks are "reorganized" (removed).

**More confirmations = deeper in the chain = harder to reverse**

**In code:**
```typescript
const receipt = await tx.wait(6); // Wait for 6 confirmations
console.log("Transaction is safe!");
```

**For testnet:** 1-2 confirmations is usually enough (low value)
**For mainnet:** 6-12 confirmations for high value (exchanges, payments)
</details>

---

### 7. What happens if you send a transaction with too-low gas price?

<details>
<summary>Answer</summary>

**What happens:**
1. Transaction enters mempool (pending)
2. Miners/validators prioritize higher gas prices
3. Your transaction sits there waiting
4. Eventually:
   - **Option A:** Gas prices drop, your tx gets mined (could take hours/days)
   - **Option B:** Transaction is dropped from mempool (after ~24-48 hours)
   - **Option C:** You replace it with higher gas (same nonce)

**How to fix stuck transaction:**

**Method 1: Speed Up (ethers.js v6)**
```typescript
// Send new transaction with same nonce + higher gas
const stuckNonce = 5; // Nonce of stuck transaction
const newTx = await wallet.sendTransaction({
  to: recipient,
  value: amount,
  nonce: stuckNonce,
  maxFeePerGas: ethers.parseUnits("50", "gwei"), // 50% higher
  maxPriorityFeePerGas: ethers.parseUnits("3", "gwei"),
});
```

**Method 2: Cancel (send 0 ETH to yourself)**
```typescript
await wallet.sendTransaction({
  to: wallet.address, // Send to yourself
  value: 0, // 0 ETH
  nonce: stuckNonce, // Same nonce as stuck tx
  maxFeePerGas: higherGasPrice,
});
```

**Prevention:** Use current network gas prices (from `provider.getFeeData()`) instead of hardcoding gas prices.
</details>

---

## 🎯 Key Takeaways

1. **Transactions have clear anatomy:** from, to, value, gas, nonce, data

2. **Gas = computational cost** - Simple sends use 21,000 gas, contracts use more

3. **Total cost = amount + gas cost** - Always account for gas when checking balance

4. **Nonce ensures ordering** - Sequential counter prevents replay attacks

5. **Always estimate gas first** - Prevents failures and calculates total cost

6. **Confirmations measure safety** - More confirmations = harder to reverse (6+ is standard)

7. **ethers.js v6 makes it easy** - `sendTransaction()`, `wait()`, automatic nonce management

8. **Use try/catch for errors** - Handle insufficient funds, invalid addresses, gas issues gracefully

---

## 🔗 Next Steps

In **Class 3.3: Querying Blockchain Data**, you'll:
- Query account balances and transaction history
- Read blockchain state (blocks, transactions, logs)
- Use Etherscan API for advanced queries
- Build a simple block explorer CLI

**Before Class 3.3:**
- Ensure all 4 scripts from this class work
- Note your transaction hash (you'll query it in 3.3)
- Review how confirmations work

---

## 📚 Reading References

**Bitcoin Book:**
- **Chapter 6:** Transactions (Transaction Structure, Transaction Fees, Transaction Scripts)

**Ethereum Book:**
- **Chapter 6:** Transactions (The Structure of a Transaction, Transaction Gas, Transaction Nonce)
- **Chapter 13:** The Ethereum Virtual Machine (Gas and Fees)

**Key sections:**
- Transaction lifecycle (pending → mined → confirmed)
- Gas mechanics (why computational work costs ETH)
- Nonce and replay protection
- Digital signatures (ECDSA for Ethereum)

---

## 🧑‍🏫 Teaching Notes (For Claude Code)

**Pacing:**
- 4 activities, ~15-20 minutes each
- Activity 1 is most important (actual transaction)
- Wait for user confirmation after each activity

**Common Student Questions:**
1. **"Why did I lose more ETH than I sent?"** → Gas costs!
2. **"What if gas price changes while transaction is pending?"** → You set max, pay actual
3. **"Can I cancel a transaction?"** → Yes, by replacing with same nonce + higher gas

**Error Handling Emphasis:**
- Show Activity 4 carefully - error handling is critical for production
- Emphasize try/catch blocks
- Show how to validate before sending

**Real-World Connection:**
- Compare gas to postal stamp (pay for delivery service)
- Compare nonce to check numbers (sequential, can't skip)
- Compare confirmations to waiting for mail delivery confirmation

**Version-Specific:**
- ✅ Uses ethers.js v6 syntax (`JsonRpcProvider`, `parseEther`, `formatEther`)
- ✅ EIP-1559 gas mechanics (`maxFeePerGas`, `maxPriorityFeePerGas`)
- ❌ NOT ethers v5 (`JsonRpcProvider` was `JsonRpcProvider` in v5, but API changed)

**Safety Reminders:**
- This is testnet ETH (no real value)
- Always estimate gas on mainnet
- Use hardware wallets for mainnet (never private keys in code)

---

*Last Updated: 2025-10-29*
*Course: FamilyChain Blockchain Development*
*Week 3, Class 3.2 of 4*
