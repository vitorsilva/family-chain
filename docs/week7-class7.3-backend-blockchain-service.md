# Week 7, Class 7.3: Backend Blockchain Service
## FamilyChain Course - Learning Guide

---

## 🎯 Overview

**Duration:** 4-5 hours
**Prerequisites:**
- Week 7 Class 7.1 complete (backend provider setup)
- Understanding of Hardhat 3 `network.connect()` pattern
- FamilyWallet contract deployed to Sepolia (0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e)
- Hardhat keystore configured with SEPOLIA_PRIVATE_KEY

**What You'll Learn:**
In Class 7.1, you learned to READ blockchain data from backend scripts. Now you'll learn to WRITE - sending transactions programmatically without MetaMask! You'll build a backend service that can deposit ETH to FamilyWallet, handle nonce conflicts, and create reusable blockchain service modules.

**Why This Matters:**
Backend transaction signing is the foundation for:
- Automated allowance distributions (Week 9-10)
- Price oracle updates (Week 12)
- Smart contract migrations
- Scheduled transactions (cron jobs)
- Any blockchain operation that needs to run without human intervention

This is how DeFi protocols like Aave automate liquidations and Chainlink updates price feeds!

---

## 📚 Learning Objectives

By the end of this class, you will be able to:

1. **Load** wallet signers from Hardhat keystore using `hre.vars.get()`
2. **Send** transactions programmatically from backend scripts (deposit to FamilyWallet)
3. **Handle** nonce conflicts when sending multiple pending transactions
4. **Estimate** gas costs before sending transactions to avoid failures
5. **Wait** for transaction confirmations and handle errors gracefully
6. **Create** reusable blockchain service modules for clean architecture
7. **Understand** the difference between development and production key management

---

## 📖 Key Concepts

### 1. Backend Transaction Signing Flow

**Frontend (Week 6):**
```
User clicks "Deposit" → MetaMask popup → User approves → Transaction sent
```

**Backend (Week 7):**
```
Script runs → Load signer from keystore → Sign transaction → Send to network
```

**No human intervention!** The backend service:
- Loads private key from encrypted keystore
- Signs transactions programmatically
- Submits to blockchain via RPC provider
- Waits for confirmation
- Handles errors automatically

---

### 2. Loading Signers from Hardhat Keystore

**Two keystore modes:**

| Mode | Command | Encryption | Use Case |
|------|---------|------------|----------|
| **--dev** | `npx hardhat keystore set --dev KEY_NAME` | None (plaintext) | Local development, testnets |
| **Production** | `npx hardhat keystore set KEY_NAME` | Password-protected | Production, mainnet |

**How to access keystore variables:**

```typescript
import { network } from "hardhat";

// Connect to network
const connection = await network.connect();

// Get signers (from keystore)
const [signer] = await connection.ethers.getSigners();

// Or access raw keystore value
import hre from "hardhat";
const privateKey = hre.vars.get("SEPOLIA_PRIVATE_KEY");
```

**Current setup (from CLAUDE.md):**
- Using `--dev` keystore (unencrypted)
- Variable name: `SEPOLIA_PRIVATE_KEY`
- Fine for Sepolia testnet
- Production would require password protection

---

### 3. Transaction Nonce Management

**What is a nonce?**
- Sequential transaction counter for each address
- Prevents replay attacks
- Must increment by 1 for each transaction

**Example:**
```
Address 0xABC... transaction history:
- Nonce 0: First transaction ever
- Nonce 1: Second transaction
- Nonce 2: Third transaction
- Nonce 3: Next pending transaction
```

**Nonce conflicts occur when:**
```typescript
// Problem: Both use same nonce!
const tx1 = await signer.sendTransaction({...}); // Nonce 5
const tx2 = await signer.sendTransaction({...}); // Also nonce 5! ❌
```

**Solution: Wait for confirmation**
```typescript
// ✅ Correct: Wait between transactions
const tx1 = await signer.sendTransaction({...}); // Nonce 5
await tx1.wait(); // Wait for confirmation
const tx2 = await signer.sendTransaction({...}); // Now nonce 6 ✅
```

**Or: Manually specify nonces**
```typescript
let nonce = await provider.getTransactionCount(address);
const tx1 = await signer.sendTransaction({..., nonce: nonce++});
const tx2 = await signer.sendTransaction({..., nonce: nonce++});
```

---

### 4. Gas Estimation

**Always estimate gas before sending!**

```typescript
// Estimate gas for transaction
const gasEstimate = await contract.deposit.estimateGas({
  value: ethers.parseEther("0.1")
});

console.log("Estimated gas:", gasEstimate.toString());

// Add 20% buffer for safety
const gasLimit = gasEstimate * 120n / 100n;

// Send with custom gas limit
const tx = await contract.deposit({
  value: ethers.parseEther("0.1"),
  gasLimit
});
```

**Why estimate?**
- Avoids "out of gas" errors
- Prevents wasted gas on failed transactions
- Allows cost calculation before committing

**Gas cost formula:**
```
Total Cost = Gas Used × Gas Price + Transaction Value
```

---

### 5. Transaction Confirmation Patterns

**Three confirmation patterns:**

**1. Fire-and-forget (risky):**
```typescript
await contract.deposit({ value: ethers.parseEther("0.1") });
// ❌ Don't know if it succeeded!
```

**2. Wait for receipt (recommended):**
```typescript
const tx = await contract.deposit({ value: ethers.parseEther("0.1") });
const receipt = await tx.wait(); // Wait for confirmation
if (receipt.status === 1) {
  console.log("✅ Transaction successful!");
} else {
  console.log("❌ Transaction failed!");
}
```

**3. Wait for multiple confirmations (safest):**
```typescript
const tx = await contract.deposit({ value: ethers.parseEther("0.1") });
const receipt = await tx.wait(3); // Wait for 3 confirmations
// Now very unlikely to be reversed
```

**Confirmation safety levels:**
| Confirmations | Safety | Use Case |
|---------------|--------|----------|
| 0 | Pending | Not safe to trust |
| 1 | Confirmed | Small amounts, testnets |
| 3-6 | Safe | Medium amounts, most DApps |
| 12+ | Very Safe | Large amounts, exchanges |

---

### 6. Reusable Service Architecture

**Good architecture separates concerns:**

```
blockchain/
├── services/
│   └── blockchainService.ts  ← Reusable service class
├── scripts/
│   └── week7/
│       └── deposit-backend.ts ← Script uses service
```

**Service class pattern:**
```typescript
export class BlockchainService {
  private provider: ethers.Provider;
  private signer: ethers.Signer;

  async initialize() { ... }
  async getBalance(address: string) { ... }
  async sendTransaction(...) { ... }
  async getContract(address: string, abi: any) { ... }
}
```

**Benefits:**
- ✅ Reusable across scripts
- ✅ Easy to test (mock the service)
- ✅ Centralized error handling
- ✅ Consistent configuration

---

## 🛠️ Hands-On Activities

### Activity 1: Backend Deposit to FamilyWallet

**Goal:** Send a deposit transaction from backend script.

**Step 1:** Create `backend-deposit.ts`

```typescript
// scripts/week7/backend-deposit.ts
import { ethers } from "ethers";
import { network } from "hardhat";

// FamilyWallet contract address (Sepolia)
const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

// Minimal ABI (just deposit function and event)
const FAMILY_WALLET_ABI = [
  "function deposit() public payable",
  "event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
];

async function backendDeposit() {
  console.log("=== Backend Deposit to FamilyWallet ===\n");

  // Connect to network
  const connection = await network.connect();
  const provider = connection.ethers.provider;

  // Load signer from Hardhat keystore
  const [signer] = await connection.ethers.getSigners();
  const address = await signer.getAddress();

  console.log("👤 Signer Address:", address);
  console.log("");

  // Check balance before
  const balanceBefore = await provider.getBalance(address);
  console.log("💰 Wallet Balance Before:", ethers.formatEther(balanceBefore), "ETH");
  console.log("");

  // Create contract instance with SIGNER (not just provider)
  const contract = new ethers.Contract(
    FAMILY_WALLET_ADDRESS,
    FAMILY_WALLET_ABI,
    signer // ✅ Signer required for writing!
  );

  // Deposit amount
  const depositAmount = ethers.parseEther("0.001"); // 0.001 ETH
  console.log("📤 Depositing:", ethers.formatEther(depositAmount), "ETH");
  console.log("");

  // Estimate gas first
  console.log("⛽ Estimating gas...");
  const gasEstimate = await contract.deposit.estimateGas({
    value: depositAmount
  });
  console.log("  Estimated gas:", gasEstimate.toString());

  // Add 20% buffer
  const gasLimit = gasEstimate * 120n / 100n;
  console.log("  Gas limit (with buffer):", gasLimit.toString());
  console.log("");

  // Send transaction
  console.log("📝 Sending transaction...");
  const tx = await contract.deposit({
    value: depositAmount,
    gasLimit
  });

  console.log("  Transaction hash:", tx.hash);
  console.log("  Waiting for confirmation...");
  console.log("");

  // Wait for confirmation
  const receipt = await tx.wait();

  if (receipt.status === 1) {
    console.log("✅ Transaction confirmed!");
    console.log("  Block number:", receipt.blockNumber);
    console.log("  Gas used:", receipt.gasUsed.toString());
    console.log("  Gas price:", ethers.formatUnits(receipt.gasPrice, "gwei"), "gwei");
    console.log("");

    // Calculate cost
    const gasCost = receipt.gasUsed * receipt.gasPrice;
    const totalCost = depositAmount + gasCost;
    console.log("💸 Cost Breakdown:");
    console.log("  Deposit amount:", ethers.formatEther(depositAmount), "ETH");
    console.log("  Gas cost:", ethers.formatEther(gasCost), "ETH");
    console.log("  Total cost:", ethers.formatEther(totalCost), "ETH");
    console.log("");

    // Check balance after
    const balanceAfter = await provider.getBalance(address);
    console.log("💰 Wallet Balance After:", ethers.formatEther(balanceAfter), "ETH");
    console.log("  Difference:", ethers.formatEther(balanceBefore - balanceAfter), "ETH");
    console.log("");

    // Parse event from receipt
    const depositEvent = receipt.logs
      .map(log => {
        try {
          return contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          });
        } catch {
          return null;
        }
      })
      .find(event => event?.name === "Deposited");

    if (depositEvent) {
      console.log("📋 Event Data:");
      console.log("  Member:", depositEvent.args.member);
      console.log("  Amount:", ethers.formatEther(depositEvent.args.amount), "ETH");
      console.log("  New Balance:", ethers.formatEther(depositEvent.args.newBalance), "ETH");
      console.log("  Timestamp:", new Date(Number(depositEvent.args.timestamp) * 1000).toLocaleString());
    }

    console.log("");
    console.log("🎉 Backend deposit successful!");
    console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
  } else {
    console.log("❌ Transaction failed!");
  }
}

backendDeposit()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
```

**Step 2:** Run the script

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\blockchain
npx tsx scripts/week7/backend-deposit.ts
```

**Expected Output:**
```
=== Backend Deposit to FamilyWallet ===

👤 Signer Address: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736

💰 Wallet Balance Before: 0.799 ETH

📤 Depositing: 0.001 ETH

⛽ Estimating gas...
  Estimated gas: 48334
  Gas limit (with buffer): 58000

📝 Sending transaction...
  Transaction hash: 0x1234567890abcdef...
  Waiting for confirmation...

✅ Transaction confirmed!
  Block number: 7234890
  Gas used: 48334
  Gas price: 2.5 gwei

💸 Cost Breakdown:
  Deposit amount: 0.001 ETH
  Gas cost: 0.000120835 ETH
  Total cost: 0.001120835 ETH

💰 Wallet Balance After: 0.797879165 ETH
  Difference: 0.001120835 ETH

📋 Event Data:
  Member: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
  Amount: 0.001 ETH
  New Balance: 0.003 ETH
  Timestamp: 11/21/2025, 3:45:23 PM

🎉 Backend deposit successful!
🔗 View on Etherscan: https://sepolia.etherscan.io/tx/0x1234567890abcdef...
```

**What Just Happened?**
- ✅ Loaded signer from Hardhat keystore (no MetaMask!)
- ✅ Estimated gas before sending
- ✅ Sent transaction programmatically
- ✅ Waited for confirmation
- ✅ Parsed event data from receipt
- ✅ This is exactly how DeFi protocols automate transactions!

---

### Activity 2: Handle Nonce Conflicts

**Goal:** Send multiple transactions and handle nonce conflicts.

**Step 1:** Create `multiple-deposits.ts`

```typescript
// scripts/week7/multiple-deposits.ts
import { ethers } from "ethers";
import { network } from "hardhat";

const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";
const FAMILY_WALLET_ABI = [
  "function deposit() public payable",
];

async function multipleDeposits() {
  console.log("=== Sending Multiple Deposits (Nonce Management) ===\n");

  const connection = await network.connect();
  const provider = connection.ethers.provider;
  const [signer] = await connection.ethers.getSigners();
  const address = await signer.getAddress();

  const contract = new ethers.Contract(
    FAMILY_WALLET_ADDRESS,
    FAMILY_WALLET_ABI,
    signer
  );

  // Get current nonce
  let nonce = await provider.getTransactionCount(address);
  console.log("📊 Current nonce:", nonce);
  console.log("");

  // Send 3 deposits with manual nonce management
  const deposits = [
    ethers.parseEther("0.0001"),
    ethers.parseEther("0.0002"),
    ethers.parseEther("0.0003"),
  ];

  const txPromises = [];

  for (let i = 0; i < deposits.length; i++) {
    console.log(`📤 Sending deposit ${i + 1}:`, ethers.formatEther(deposits[i]), "ETH");
    console.log(`  Using nonce: ${nonce + i}`);

    // Send with explicit nonce
    const tx = contract.deposit({
      value: deposits[i],
      nonce: nonce + i // Manual nonce increment
    });

    txPromises.push(tx);
  }

  console.log("");
  console.log("⏳ Waiting for all transactions to be sent...");

  // Wait for all to be sent
  const txs = await Promise.all(txPromises);

  console.log("✅ All transactions sent!");
  txs.forEach((tx, i) => {
    console.log(`  TX ${i + 1}:`, tx.hash);
  });
  console.log("");

  // Wait for all confirmations
  console.log("⏳ Waiting for confirmations...");
  const receipts = await Promise.all(txs.map(tx => tx.wait()));

  console.log("✅ All transactions confirmed!");
  console.log("");

  // Show results
  receipts.forEach((receipt, i) => {
    console.log(`Transaction ${i + 1}:`);
    console.log(`  Status: ${receipt.status === 1 ? "✅ Success" : "❌ Failed"}`);
    console.log(`  Block: ${receipt.blockNumber}`);
    console.log(`  Gas used: ${receipt.gasUsed.toString()}`);
    console.log("");
  });

  console.log("🎉 Multiple deposits completed!");
  console.log("💡 Key lesson: Manual nonce management allows parallel transactions");
}

multipleDeposits()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
```

**Step 2:** Run the script

```powershell
npx tsx scripts/week7/multiple-deposits.ts
```

**Expected Output:**
```
=== Sending Multiple Deposits (Nonce Management) ===

📊 Current nonce: 15

📤 Sending deposit 1: 0.0001 ETH
  Using nonce: 15
📤 Sending deposit 2: 0.0002 ETH
  Using nonce: 16
📤 Sending deposit 3: 0.0003 ETH
  Using nonce: 17

⏳ Waiting for all transactions to be sent...
✅ All transactions sent!
  TX 1: 0xabc123...
  TX 2: 0xdef456...
  TX 3: 0x789ghi...

⏳ Waiting for confirmations...
✅ All transactions confirmed!

Transaction 1:
  Status: ✅ Success
  Block: 7234891
  Gas used: 48334

Transaction 2:
  Status: ✅ Success
  Block: 7234892
  Gas used: 31234

Transaction 3:
  Status: ✅ Success
  Block: 7234893
  Gas used: 31234

🎉 Multiple deposits completed!
💡 Key lesson: Manual nonce management allows parallel transactions
```

**What Just Happened?**
- ✅ Sent 3 transactions in parallel (not sequentially!)
- ✅ Managed nonces manually to avoid conflicts
- ✅ All 3 confirmed successfully
- ✅ This pattern is used by high-throughput DeFi bots

---

### Activity 3: Reusable Blockchain Service Module

**Goal:** Create a reusable service class for clean architecture.

**Step 1:** Create `services/` directory

```powershell
mkdir blockchain\services
```

**Step 2:** Create `blockchainService.ts`

```typescript
// services/blockchainService.ts
import { ethers } from "ethers";
import { network } from "hardhat";

/**
 * Reusable blockchain service for backend operations
 */
export class BlockchainService {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private address: string | null = null;

  /**
   * Initialize the service (must call before using)
   */
  async initialize(): Promise<void> {
    const connection = await network.connect();
    this.provider = connection.ethers.provider;

    const [signer] = await connection.ethers.getSigners();
    this.signer = signer;
    this.address = await signer.getAddress();
  }

  /**
   * Get wallet address
   */
  getAddress(): string {
    if (!this.address) throw new Error("Service not initialized");
    return this.address;
  }

  /**
   * Get provider
   */
  getProvider(): ethers.Provider {
    if (!this.provider) throw new Error("Service not initialized");
    return this.provider;
  }

  /**
   * Get signer
   */
  getSigner(): ethers.Signer {
    if (!this.signer) throw new Error("Service not initialized");
    return this.signer;
  }

  /**
   * Get balance of an address
   */
  async getBalance(address: string): Promise<bigint> {
    const provider = this.getProvider();
    return await provider.getBalance(address);
  }

  /**
   * Get contract instance (read-only)
   */
  getContractReadOnly(address: string, abi: any): ethers.Contract {
    const provider = this.getProvider();
    return new ethers.Contract(address, abi, provider);
  }

  /**
   * Get contract instance (with signer for writing)
   */
  getContract(address: string, abi: any): ethers.Contract {
    const signer = this.getSigner();
    return new ethers.Contract(address, abi, signer);
  }

  /**
   * Send a transaction with gas estimation
   */
  async sendTransaction(
    contract: ethers.Contract,
    method: string,
    args: any[] = [],
    overrides: any = {}
  ): Promise<ethers.TransactionReceipt> {
    // Estimate gas
    const gasEstimate = await contract[method].estimateGas(...args, overrides);

    // Add 20% buffer
    const gasLimit = gasEstimate * 120n / 100n;

    // Send transaction
    const tx = await contract[method](...args, { ...overrides, gasLimit });

    // Wait for confirmation
    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      throw new Error(`Transaction failed: ${tx.hash}`);
    }

    return receipt;
  }

  /**
   * Get current nonce
   */
  async getNonce(): Promise<number> {
    const provider = this.getProvider();
    const address = this.getAddress();
    return await provider.getTransactionCount(address);
  }

  /**
   * Wait for transaction with retries
   */
  async waitForTransaction(
    txHash: string,
    confirmations: number = 1,
    timeout: number = 60000
  ): Promise<ethers.TransactionReceipt | null> {
    const provider = this.getProvider();
    return await provider.waitForTransaction(txHash, confirmations, timeout);
  }
}
```

**Step 3:** Create script using the service

```typescript
// scripts/week7/use-service.ts
import { ethers } from "ethers";
import { BlockchainService } from "../services/blockchainService";

const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";
const FAMILY_WALLET_ABI = [
  "function deposit() public payable",
  "function getBalance(address member) external view returns (uint256)",
];

async function useBlockchainService() {
  console.log("=== Using Blockchain Service ===\n");

  // Initialize service
  const service = new BlockchainService();
  await service.initialize();

  const address = service.getAddress();
  console.log("👤 Wallet Address:", address);
  console.log("");

  // Check ETH balance
  const ethBalance = await service.getBalance(address);
  console.log("💰 ETH Balance:", ethers.formatEther(ethBalance), "ETH");
  console.log("");

  // Get contract
  const contract = service.getContract(FAMILY_WALLET_ADDRESS, FAMILY_WALLET_ABI);

  // Check contract balance
  const contractBalance = await contract.getBalance(address);
  console.log("🏦 FamilyWallet Balance:", ethers.formatEther(contractBalance), "ETH");
  console.log("");

  // Send deposit using service helper
  const depositAmount = ethers.parseEther("0.0005");
  console.log("📤 Depositing:", ethers.formatEther(depositAmount), "ETH");

  const receipt = await service.sendTransaction(
    contract,
    "deposit",
    [],
    { value: depositAmount }
  );

  console.log("✅ Transaction confirmed!");
  console.log("  Hash:", receipt.hash);
  console.log("  Block:", receipt.blockNumber);
  console.log("  Gas used:", receipt.gasUsed.toString());
  console.log("");

  // Check updated balance
  const newBalance = await contract.getBalance(address);
  console.log("💰 New FamilyWallet Balance:", ethers.formatEther(newBalance), "ETH");
  console.log("");

  console.log("🎉 Service-based transaction successful!");
  console.log("💡 This pattern makes backend scripts much cleaner!");
}

useBlockchainService()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
```

**Step 4:** Run the script

```powershell
npx tsx scripts/week7/use-service.ts
```

**Expected Output:**
```
=== Using Blockchain Service ===

👤 Wallet Address: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736

💰 ETH Balance: 0.797 ETH

🏦 FamilyWallet Balance: 0.003 ETH

📤 Depositing: 0.0005 ETH
✅ Transaction confirmed!
  Hash: 0x9876543...
  Block: 7234900
  Gas used: 31234

💰 New FamilyWallet Balance: 0.0035 ETH

🎉 Service-based transaction successful!
💡 This pattern makes backend scripts much cleaner!
```

**What Just Happened?**
- ✅ Created reusable `BlockchainService` class
- ✅ Centralized provider/signer management
- ✅ Helper methods for common operations
- ✅ Cleaner scripts (no repetitive setup code)
- ✅ Easy to test (can mock the service)

---

## 📝 Deliverables

By the end of this class, you should have:

- [x] ✅ Backend script that deposits ETH to FamilyWallet (`backend-deposit.ts`)
- [x] ✅ Script demonstrating nonce management (`multiple-deposits.ts`)
- [x] ✅ Reusable `BlockchainService` class (`services/blockchainService.ts`)
- [x] ✅ Script using the service (`use-service.ts`)
- [x] ✅ Understanding of gas estimation and transaction confirmation
- [x] ✅ At least one successful backend transaction on Sepolia
- [x] ✅ Clear mental model of backend transaction flow

---

## 🐛 Common Issues & Solutions

### Issue 1: "Insufficient funds for gas"

**Error:**
```
Error: insufficient funds for gas * price + value
```

**Cause:** Wallet doesn't have enough ETH for gas + deposit amount.

**Solution:**
```powershell
# Check balance
npx tsx scripts/week7/backend-provider.ts

# If low, get more from faucet:
# https://sepoliafaucet.com
# https://www.alchemy.com/faucets/ethereum-sepolia
```

---

### Issue 2: "Nonce too low"

**Error:**
```
Error: nonce has already been used
```

**Cause:** Trying to send transaction with a nonce that's already been used.

**Solution:**
```typescript
// Let ethers.js manage nonce automatically
const tx = await contract.deposit({ value: amount });
// Don't specify nonce unless you're managing it manually!

// Or get fresh nonce
const nonce = await provider.getTransactionCount(address, "pending");
```

---

### Issue 3: "Transaction failed" (status = 0)

**Error:**
```
Transaction failed with status 0
```

**Cause:** Contract reverted (e.g., not a member, insufficient balance).

**Solution:**
```typescript
// Check if you're a member first
const isMember = await contract.isMember(address);
if (!isMember) {
  console.log("❌ Not a member! Add yourself first.");
  return;
}

// Then send transaction
```

---

### Issue 4: "Replacement transaction underpriced"

**Error:**
```
Error: replacement transaction underpriced
```

**Cause:** Trying to replace pending transaction with same nonce but lower gas price.

**Solution:**
```typescript
// Wait for pending transaction to confirm
await tx.wait();

// Or send replacement with higher gas price
const tx2 = await contract.deposit({
  value: amount,
  nonce: samNonce,
  gasPrice: higherGasPrice // At least 10% higher
});
```

---

### Issue 5: "Contract method not found"

**Error:**
```
Error: contract.deposit is not a function
```

**Cause:** ABI doesn't include the function or typo in function name.

**Solution:**
```typescript
// Check ABI includes function
const ABI = [
  "function deposit() public payable", // ✅ Correct
  // "function depositt() public payable", // ❌ Typo!
];

// Check contract instance has signer (for writing)
const contract = new ethers.Contract(address, ABI, signer); // ✅ Signer
// const contract = new ethers.Contract(address, ABI, provider); // ❌ Can't write
```

---

## ✅ Self-Assessment Quiz

### 1. What's the difference between using provider vs signer when creating a contract instance?

<details>
<summary>Answer</summary>

**Provider (Read-only):**
```typescript
const contract = new ethers.Contract(address, abi, provider);
// ✅ Can call view functions (free)
// ❌ Cannot send transactions
```

**Signer (Read + Write):**
```typescript
const contract = new ethers.Contract(address, abi, signer);
// ✅ Can call view functions (free)
// ✅ Can send transactions (costs gas)
```

**Use provider when:**
- Only reading blockchain data
- Querying balances, contract state
- No need to send transactions

**Use signer when:**
- Need to send transactions
- Modify contract state
- Transfer ETH or tokens

**Example:**
```typescript
// Backend script needs both
const provider = connection.ethers.provider;
const [signer] = await connection.ethers.getSigners();

// Read-only queries
const readContract = new ethers.Contract(address, abi, provider);
const balance = await readContract.getBalance(addr); // Free

// Write transactions
const writeContract = new ethers.Contract(address, abi, signer);
const tx = await writeContract.deposit({ value: amount }); // Costs gas
```

</details>

---

### 2. How do you handle sending multiple transactions without nonce conflicts?

<details>
<summary>Answer</summary>

**Three approaches:**

**1. Sequential (wait between):**
```typescript
// ✅ Safest but slowest
const tx1 = await contract.deposit({ value: amount1 });
await tx1.wait(); // Wait for confirmation
const tx2 = await contract.deposit({ value: amount2 });
await tx2.wait();
```

**2. Manual nonce management:**
```typescript
// ✅ Fast (parallel) but requires careful management
let nonce = await provider.getTransactionCount(address);

const tx1 = await contract.deposit({ value: amount1, nonce: nonce++ });
const tx2 = await contract.deposit({ value: amount2, nonce: nonce++ });
const tx3 = await contract.deposit({ value: amount3, nonce: nonce++ });

// Wait for all
await Promise.all([tx1.wait(), tx2.wait(), tx3.wait()]);
```

**3. Using "pending" nonce:**
```typescript
// ✅ Handles pending transactions
const nonce = await provider.getTransactionCount(address, "pending");
const tx = await contract.deposit({ value: amount, nonce });
```

**Key points:**
- Nonce must increment by 1 for each transaction
- "pending" includes unconfirmed transactions
- Manual management allows parallel transactions
- Automatic management is safer for beginners

**Common mistakes:**
```typescript
// ❌ Both use same nonce (conflict!)
const tx1 = await contract.deposit({ value: amount1 });
const tx2 = await contract.deposit({ value: amount2 });
// Second one might fail with "nonce too low"

// ✅ Wait or manage manually
```

</details>

---

### 3. Why should you estimate gas before sending transactions?

<details>
<summary>Answer</summary>

**Reasons to estimate gas:**

**1. Avoid "out of gas" errors:**
```typescript
// ❌ No estimation - might fail
const tx = await contract.deposit({ value: amount });

// ✅ Estimate first
const gasEstimate = await contract.deposit.estimateGas({ value: amount });
const gasLimit = gasEstimate * 120n / 100n; // Add buffer
const tx = await contract.deposit({ value: amount, gasLimit });
```

**2. Calculate cost before committing:**
```typescript
const gasEstimate = await contract.deposit.estimateGas({ value: amount });
const gasPrice = await provider.getFeeData().then(data => data.gasPrice);
const gasCost = gasEstimate * gasPrice;
const totalCost = amount + gasCost;

console.log("Total cost:", ethers.formatEther(totalCost), "ETH");
// User can decide if acceptable
```

**3. Detect failures early:**
```typescript
try {
  const gasEstimate = await contract.withdraw.estimateGas(amount);
} catch (error) {
  console.log("❌ Transaction would fail:", error.message);
  // e.g., "InsufficientBalance", "NotAMember"
  return; // Don't waste gas sending doomed transaction
}
```

**4. Optimize gas usage:**
```typescript
// Compare different approaches
const gasA = await contract.methodA.estimateGas(...);
const gasB = await contract.methodB.estimateGas(...);
// Use cheaper method
```

**Gas estimation formula:**
```
Estimated Gas = Amount of computation required
Gas Limit = Estimated Gas × 1.2 (buffer)
Gas Cost = Gas Limit × Gas Price
Total Cost = Transaction Value + Gas Cost
```

**When estimation fails:**
- Transaction would revert (contract error)
- Insufficient funds
- Invalid parameters
- Not authorized

This saves you from wasting real ETH on failed transactions!

</details>

---

### 4. What's the difference between --dev and production Hardhat keystore?

<details>
<summary>Answer</summary>

**Development Keystore (--dev):**

```powershell
# Set variable
npx hardhat keystore set --dev SEPOLIA_PRIVATE_KEY
```

**Characteristics:**
- ⚠️ **Unencrypted** (stored in plaintext)
- No password required
- Fast and convenient
- **Only use for:**
  - Local development
  - Testnets (Sepolia, Goerli)
  - Test wallets with minimal funds

**Production Keystore:**

```powershell
# Set variable (prompts for password)
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
# Enter password: ********
```

**Characteristics:**
- ✅ **Encrypted** with password
- Requires password to access
- Slower but secure
- **Use for:**
  - Mainnet deployments
  - Production services
  - Wallets with real funds

**Access in code:**
```typescript
// Both accessed the same way
import hre from "hardhat";
const privateKey = hre.vars.get("SEPOLIA_PRIVATE_KEY");

// Or via getSigners()
const [signer] = await connection.ethers.getSigners();
```

**Security comparison:**

| Approach | Security | Speed | Use Case |
|----------|----------|-------|----------|
| --dev keystore | ⚠️ Low | Fast | Development |
| Encrypted keystore | ✅ Medium | Slow | Production |
| Hardware wallet | ✅✅ High | Medium | Large funds |
| Cloud KMS | ✅✅ High | Medium | Production services |
| .env files | 🔴 NEVER | N/A | ❌ Never use |

**Best practices:**
- ✅ Use --dev for course (Sepolia testnet)
- ✅ Never commit private keys to Git
- ✅ Use hardware wallet for mainnet
- ✅ Rotate keys if compromised
- ❌ Never use .env files for private keys

</details>

---

### 5. How do you wait for transaction confirmations and why?

<details>
<summary>Answer</summary>

**Basic confirmation:**
```typescript
const tx = await contract.deposit({ value: amount });
const receipt = await tx.wait(); // Wait for 1 confirmation

if (receipt.status === 1) {
  console.log("✅ Success!");
} else {
  console.log("❌ Failed!");
}
```

**Multiple confirmations:**
```typescript
const tx = await contract.deposit({ value: amount });
const receipt = await tx.wait(3); // Wait for 3 confirmations
// Now very unlikely to be reversed
```

**With timeout:**
```typescript
const tx = await contract.deposit({ value: amount });
try {
  const receipt = await provider.waitForTransaction(
    tx.hash,
    3, // confirmations
    60000 // 60 second timeout
  );
} catch (error) {
  console.log("❌ Timeout or failed");
}
```

**Why wait for confirmations?**

**1 confirmation:**
- Transaction included in a block
- ✅ Good for: Testnets, small amounts
- ⚠️ Risk: Could be reversed in chain reorganization

**3-6 confirmations:**
- Transaction in block + 2-5 more blocks on top
- ✅ Good for: Most DApps, medium amounts
- ✅ Much harder to reverse

**12+ confirmations:**
- Transaction very deep in chain
- ✅ Good for: Exchanges, large amounts, high-value NFTs
- ✅ Extremely unlikely to reverse

**Confirmation levels:**

| Confirmations | Time (Sepolia) | Safety | Use Case |
|---------------|----------------|--------|----------|
| 0 (pending) | 0s | ❌ Not safe | Don't trust |
| 1 | ~15s | ⚠️ Ok | Testnets, small |
| 3 | ~45s | ✅ Good | Most DApps |
| 6 | ~90s | ✅✅ Safe | Medium amounts |
| 12 | ~3min | ✅✅✅ Very safe | Exchanges |

**What happens if you don't wait:**
```typescript
// ❌ Fire-and-forget (dangerous!)
await contract.deposit({ value: amount });
console.log("Done!"); // But is it really?
// Could fail, could be pending, you don't know!

// ✅ Wait for confirmation
const tx = await contract.deposit({ value: amount });
await tx.wait();
console.log("Actually done!"); // Now you know
```

**Accessing receipt data:**
```typescript
const receipt = await tx.wait();
console.log("Block:", receipt.blockNumber);
console.log("Gas used:", receipt.gasUsed);
console.log("Status:", receipt.status); // 1 = success, 0 = failed
console.log("Logs:", receipt.logs); // Events emitted
```

Always wait for at least 1 confirmation before considering transaction complete!

</details>

---

### 6. What are the benefits of creating a reusable BlockchainService class?

<details>
<summary>Answer</summary>

**Benefits of service class architecture:**

**1. Code reusability:**
```typescript
// ❌ Without service - repetitive
// Script 1
const connection = await network.connect();
const provider = connection.ethers.provider;
const [signer] = await connection.ethers.getSigners();
const contract = new ethers.Contract(address, abi, signer);

// Script 2 - same setup again! 😫
const connection = await network.connect();
const provider = connection.ethers.provider;
// ...

// ✅ With service - reuse
const service = new BlockchainService();
await service.initialize();
const contract = service.getContract(address, abi);
```

**2. Centralized error handling:**
```typescript
class BlockchainService {
  async sendTransaction(...) {
    try {
      const gasEstimate = await contract[method].estimateGas(...);
      const gasLimit = gasEstimate * 120n / 100n;
      const tx = await contract[method](..., { gasLimit });
      const receipt = await tx.wait();

      if (receipt.status !== 1) {
        throw new Error(`Transaction failed: ${tx.hash}`);
      }

      return receipt;
    } catch (error) {
      // Centralized error handling
      console.error("Transaction error:", error);
      throw error;
    }
  }
}
```

**3. Easy testing:**
```typescript
// Mock the service in tests
class MockBlockchainService extends BlockchainService {
  async sendTransaction(...) {
    return { status: 1, hash: "0xmock..." };
  }
}

// Test your script without hitting blockchain
```

**4. Configuration management:**
```typescript
class BlockchainService {
  private defaultGasBuffer = 120n; // 20% buffer
  private defaultConfirmations = 1;

  async sendTransaction(..., confirmations = this.defaultConfirmations) {
    // Use consistent settings across all scripts
  }
}
```

**5. Cleaner scripts:**
```typescript
// ❌ Without service (messy)
async function main() {
  const connection = await network.connect();
  const provider = connection.ethers.provider;
  const [signer] = await connection.ethers.getSigners();
  const address = await signer.getAddress();
  const balance = await provider.getBalance(address);
  const contract = new ethers.Contract(addr, abi, signer);
  const gasEstimate = await contract.deposit.estimateGas({ value });
  const gasLimit = gasEstimate * 120n / 100n;
  const tx = await contract.deposit({ value, gasLimit });
  await tx.wait();
  // Actual logic buried in boilerplate 😫
}

// ✅ With service (clean)
async function main() {
  const service = new BlockchainService();
  await service.initialize();

  const contract = service.getContract(address, abi);
  await service.sendTransaction(contract, "deposit", [], { value });
  // Clear and focused! 🎉
}
```

**6. Easier upgrades:**
```typescript
// Change implementation in one place
class BlockchainService {
  // Upgrade from ethers v6 to v7
  // Or add retry logic
  // Or switch to different RPC
  // All scripts benefit automatically!
}
```

**Real-world pattern:**
Most production DApps use service architecture:
- Aave: `ProtocolService`
- Uniswap: `SwapService`, `PoolService`
- Your project: `BlockchainService`, `EventService`, `PriceOracleService`

</details>

---

## 🎯 Key Takeaways

1. **Backend signers load from keystore** - No MetaMask, programmatic signing
2. **Always estimate gas** before sending to avoid failures and calculate costs
3. **Wait for confirmations** - `await tx.wait()` is required to know if transaction succeeded
4. **Manage nonces carefully** - Sequential (wait) or manual (parallel)
5. **Service architecture is cleaner** - Reusable, testable, maintainable
6. **Use --dev keystore for development** - Production needs encrypted keystore
7. **Transaction = value + gas cost** - Always account for both when estimating
8. **Events in receipts** - Parse `receipt.logs` to get emitted event data

---

## 🔗 Next Steps

In **Class 7.4: Event Listening and Real-time Updates**, you'll:
- Listen to past FamilyWallet events using `queryFilter()`
- Set up real-time event listeners with `contract.on()`
- Store events in PostgreSQL database (Week 4 schema)
- Create background event listener service
- Optional: Use WebSocket provider for push-based updates

**Before Class 7.4:**
- Ensure all 3 scripts from this class work
- Have at least 2-3 deposits in FamilyWallet (creates events to query)
- Review PostgreSQL schema from Week 4 (transactions table)
- Familiarize with the `Deposited` and `Withdrawn` events in FamilyWallet.sol

---

## 📚 Reading References

**Bitcoin Book:**
- **Chapter 6:** Transactions - Transaction Structure, Transaction Outputs
- **Chapter 7:** Authorization and Authentication - Digital Signatures

**Ethereum Book:**
- **Chapter 6:** Transactions - Digital Signatures, Transaction Propagation
- **Chapter 7:** Smart Contracts - Contract Calls, Gas Considerations

**Key sections:**
- Digital signature process (how signers work)
- Transaction lifecycle (from signing to confirmation)
- Gas mechanics (estimation and limits)
- Nonce management (transaction ordering)

---

## 🧑‍🏫 Teaching Notes (For Claude Code)

**Pacing:**
- 3 activities, ~60-90 minutes each
- Activity 1 is critical (first backend transaction)
- Activity 2 demonstrates real-world nonce challenges
- Activity 3 sets up good practices for rest of course

**Common Student Questions:**
1. **"Why not just use MetaMask for everything?"** → Can't automate, no 24/7 services
2. **"Is keystore secure enough?"** → Yes for testnets, production needs hardware wallet
3. **"Why does gas estimation add 20% buffer?"** → Gas usage can vary slightly, buffer prevents failures

**Version-Specific Gotchas:**
- ✅ `connection.ethers.getSigners()` (Hardhat 3)
- ✅ `estimateGas()` returns bigint (v6), math needs `120n` not `120`
- ✅ Parse events from `receipt.logs` (v6 changed event structure)

**Real-World Connection:**
- Aave liquidation bots (monitor positions, send transactions automatically)
- Chainlink oracles (update prices on schedule)
- Uniswap LP rebalancing (automated portfolio management)

**Security Emphasis:**
- --dev keystore is ONLY for development
- Production mainnet requires encrypted keystore or hardware wallet
- Never commit keystore or private keys to Git
- Always verify transaction before sending on mainnet

**Setup for Next Class:**
- Class 7.4 builds event listener service
- Uses BlockchainService from this class
- Stores events in PostgreSQL (Week 4 schema)
- Real-time monitoring with `contract.on()`

**Troubleshooting Tips:**
- If gas errors: Check Sepolia faucet for more ETH
- If nonce errors: Let ethers manage nonce automatically (don't specify)
- If transaction fails: Estimate gas first to catch reverts early
- If timeout: Sepolia can be slow, increase timeout or check block explorer

---

*Last Updated: 2025-11-21*
*Course: FamilyChain Blockchain Development*
*Week 7, Class 7.3 of 4*
