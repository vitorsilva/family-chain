# Week 7, Class 7.1: Web3.js and Ethers.js Fundamentals
## FamilyChain Course - Learning Guide

---

## 🎯 Overview

**Duration:** 3-4 hours
**Prerequisites:**
- Week 6 complete (frontend DApp with MetaMask integration)
- Understanding of providers and signers from Week 6
- Hardhat 3 setup from Week 1
- PostgreSQL database from Week 4

**What You'll Learn:**
You've used ethers.js in the frontend (Week 6) to connect MetaMask and send transactions. Now you'll learn how to use ethers.js in **backend Node.js scripts** to automate blockchain interactions without MetaMask. You'll understand the difference between frontend (browser) and backend (Node.js) blockchain connections, and when to use each approach.

**Why This Matters:**
Not all blockchain interactions need a user clicking a button! Backend services need to:
- Monitor blockchain events 24/7
- Send automated transactions (allowance distributions, price updates)
- Query blockchain data without a browser
- Sign transactions programmatically (not via MetaMask popup)

This is how Aave, Compound, and Uniswap automate their protocols!

---

## 📚 Learning Objectives

By the end of this class, you will be able to:

1. **Explain** the difference between frontend (BrowserProvider) and backend (JsonRpcProvider) blockchain connections
2. **Create** backend provider connections using Hardhat 3's `network.connect()` pattern
3. **Load** wallet signers from Hardhat keystore (not MetaMask)
4. **Query** blockchain data from backend scripts (balances, blocks, transactions)
5. **Compare** Web3.js vs ethers.js (and understand why ethers.js is the industry standard)
6. **Understand** when to use frontend vs backend blockchain interactions
7. **Set up** environment for Week 7's event listener service

---

## 📖 Key Concepts

### 1. Frontend vs Backend Blockchain Connections

| Aspect | Frontend (Browser) | Backend (Node.js) |
|--------|-------------------|-------------------|
| **Provider** | `BrowserProvider` (connects to MetaMask) | `JsonRpcProvider` (connects to Alchemy/Infura) |
| **Signer** | From MetaMask (user approves each tx) | From private key (automated signing) |
| **User Interaction** | Popup for every transaction | No popups (headless) |
| **Use Cases** | User-triggered actions (deposit, withdraw) | Automated tasks (event listening, price oracles) |
| **Security** | Private key in MetaMask (secure) | Private key in keystore (must protect) |
| **Example** | "Click Deposit → MetaMask popup → Confirm" | "Cron job sends allowance every Monday" |

**Week 6 (Frontend):**
```typescript
// Browser - MetaMask connection
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner(); // User clicks MetaMask popup
```

**Week 7 (Backend):**
```typescript
// Node.js - RPC connection
import { network } from "hardhat";
const connection = await network.connect();
const provider = connection.ethers.provider; // No popups!
```

---

### 2. Hardhat 3 Network Connection Pattern

**CRITICAL:** Hardhat 3 changed how you access providers!

**OLD (Hardhat 2):**
```typescript
import { ethers } from "hardhat"; // ❌ Hardhat 2 pattern
const provider = ethers.provider; // ❌ Doesn't work in Hardhat 3
```

**NEW (Hardhat 3):**
```typescript
import { ethers } from "ethers"; // ✅ Use standalone ethers
import { network } from "hardhat"; // ✅ Import network from Hardhat

const connection = await network.connect(); // ✅ Connect to network
const provider = connection.ethers.provider; // ✅ Get provider
```

**Why the change?**
- Hardhat 3 separates network management from library
- More flexible (can use viem, web3.js, or ethers.js)
- Clearer separation of concerns

---

### 3. Provider Types in ethers.js v6

| Provider Type | Use Case | Example |
|---------------|----------|---------|
| **JsonRpcProvider** | General RPC connection (Alchemy, Infura, local node) | Backend scripts |
| **BrowserProvider** | Browser wallet (MetaMask, Coinbase Wallet) | Frontend DApps |
| **WebSocketProvider** | Real-time event listening (Week 7 Class 7.4) | Event monitoring |
| **FallbackProvider** | Multiple providers with failover | Production apps |

**Creating providers manually:**
```typescript
// Alchemy RPC (what we use)
const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY");

// Local Hardhat node
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// WebSocket (for events)
const provider = new ethers.WebSocketProvider("wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY");
```

**Using Hardhat 3 (recommended for our project):**
```typescript
import { network } from "hardhat";
const connection = await network.connect(); // Uses hardhat.config.ts networks
const provider = connection.ethers.provider; // Already configured!
```

---

### 4. Signers: MetaMask vs Wallet

**Frontend Signer (Week 6):**
```typescript
// User controls private key (in MetaMask)
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner(); // MetaMask popup!
```

**Backend Signer (Week 7):**
```typescript
// Backend controls private key (from keystore)
import { network } from "hardhat";
const connection = await network.connect();
const [signer] = await connection.ethers.getSigners(); // From hardhat keystore!
```

**Security comparison:**

| Approach | Private Key Location | Security Level | Use Case |
|----------|---------------------|----------------|----------|
| MetaMask | Browser extension (encrypted) | ✅ High (user-controlled) | User transactions |
| Hardhat Keystore | Server (encrypted with password) | ⚠️ Medium (server-controlled) | Automated backend |
| Hardhat Keystore --dev | Server (unencrypted) | ❌ Low (dev only!) | Local testing only |
| Private Key in .env | Plain text file | 🔴 NEVER DO THIS | ❌ Never acceptable |

---

### 5. Web3.js vs Ethers.js

Both libraries let you interact with Ethereum, but ethers.js is the modern standard.

| Feature | Web3.js | Ethers.js |
|---------|---------|-----------|
| **Size** | 500KB+ | ~88KB |
| **API Style** | Callback-heavy | Promise/async-await |
| **Maintained by** | ChainSafe (community) | Nomic Foundation |
| **Documentation** | Scattered | Excellent |
| **TypeScript** | Added later | Built-in from start |
| **Industry Adoption** | Older projects | Modern projects (Uniswap, Aave) |
| **Learning Curve** | Steeper | Gentler |

**Example comparison:**

**Web3.js:**
```javascript
const web3 = new Web3(provider);
const balance = await web3.eth.getBalance(address);
const balanceEth = web3.utils.fromWei(balance, 'ether'); // Different utils
```

**Ethers.js:**
```typescript
const provider = new ethers.JsonRpcProvider(rpcUrl);
const balance = await provider.getBalance(address);
const balanceEth = ethers.formatEther(balance); // Cleaner API
```

**Why ethers.js won:**
1. Better documentation
2. TypeScript-first design
3. Smaller bundle size (important for frontend)
4. Cleaner API (formatEther vs utils.fromWei)
5. Strong Hardhat integration

**You can use both!** But ethers.js is recommended for new projects.

---

### 6. Reading vs Writing Blockchain Data

**Reading (View Functions):**
- Free (no gas cost)
- Instant (no transaction needed)
- No signer required (just provider)
- Examples: `getBalance()`, `contract.balanceOf()`, `getBlockNumber()`

**Writing (Transactions):**
- Costs gas (paid by signer)
- Takes time (wait for block confirmation)
- Requires signer (to sign transaction)
- Examples: `sendTransaction()`, `contract.deposit()`, `contract.withdraw()`

**Code pattern:**

```typescript
// READING - Provider only
const provider = connection.ethers.provider;
const balance = await provider.getBalance(address); // Free, instant

const contract = new ethers.Contract(address, abi, provider);
const contractBalance = await contract.getBalance(address); // Free, instant

// WRITING - Signer required
const [signer] = await connection.ethers.getSigners();
const contract = new ethers.Contract(address, abi, signer);
const tx = await contract.deposit({ value: ethers.parseEther("0.1") }); // Costs gas
await tx.wait(); // Wait for confirmation
```

---

## 🛠️ Hands-On Activities

### Activity 1: Backend Provider Setup

**Goal:** Set up backend blockchain connection using Hardhat 3 pattern.

**Step 1:** Create `scripts/week7/` directory

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\blockchain
mkdir scripts\week7
```

**Step 2:** Create `backend-provider.ts`

```typescript
// scripts/week7/backend-provider.ts
import { ethers } from "ethers";
import { network } from "hardhat";

async function testBackendProvider() {
  console.log("=== Backend Provider Setup ===\n");

  // Connect to network (Sepolia via Alchemy)
  const connection = await network.connect();
  const provider = connection.ethers.provider;

  console.log("✅ Provider connected!");
  console.log("Provider type:", provider.constructor.name);
  console.log("");

  // Get network info
  const networkInfo = await provider.getNetwork();
  console.log("📡 Network Information:");
  console.log("  Name:", networkInfo.name);
  console.log("  Chain ID:", networkInfo.chainId.toString());
  console.log("");

  // Get latest block
  const blockNumber = await provider.getBlockNumber();
  console.log("📦 Latest Block:", blockNumber);

  // Get block details
  const block = await provider.getBlock(blockNumber);
  console.log("  Timestamp:", new Date(Number(block!.timestamp) * 1000).toLocaleString());
  console.log("  Transactions:", block!.transactions.length);
  console.log("");

  // Query our wallet balance
  const [signer] = await connection.ethers.getSigners();
  const address = await signer.getAddress();
  const balance = await provider.getBalance(address);

  console.log("💰 Wallet Balance:");
  console.log("  Address:", address);
  console.log("  Balance:", ethers.formatEther(balance), "ETH");
  console.log("");

  console.log("✅ Backend provider working! No MetaMask needed!");
}

testBackendProvider()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Step 3:** Run the script

```powershell
npx tsx scripts/week7/backend-provider.ts
```

**Expected Output:**
```
=== Backend Provider Setup ===

✅ Provider connected!
Provider type: JsonRpcProvider

📡 Network Information:
  Name: sepolia
  Chain ID: 11155111

📦 Latest Block: 7234567
  Timestamp: 11/21/2025, 2:30:45 PM
  Transactions: 12

💰 Wallet Balance:
  Address: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
  Balance: 0.799 ETH

✅ Backend provider working! No MetaMask needed!
```

**What Just Happened?**
- Connected to Sepolia via Alchemy RPC (backend connection)
- No MetaMask involved!
- Queried network info, latest block, and wallet balance
- This is the foundation for all Week 7 backend services

**Q: Where did the provider get the RPC URL?**
A: From `hardhat.config.ts`! The `network.connect()` uses your configured networks.

---

### Activity 2: Compare Frontend vs Backend Providers

**Goal:** Understand the difference between BrowserProvider (Week 6) and JsonRpcProvider (Week 7).

**Step 1:** Create `compare-providers.ts`

```typescript
// scripts/week7/compare-providers.ts
import { ethers } from "ethers";
import { network } from "hardhat";

async function compareProviders() {
  console.log("=== Frontend vs Backend Providers ===\n");

  // BACKEND: JsonRpcProvider (from Hardhat network)
  console.log("🔧 BACKEND (Node.js):");
  const connection = await network.connect();
  const backendProvider = connection.ethers.provider;

  console.log("  Type:", backendProvider.constructor.name);
  console.log("  Purpose: Automated scripts, event listeners, cron jobs");
  console.log("  Signer: From Hardhat keystore (private key)");
  console.log("  User interaction: None (headless)");
  console.log("  Use case: Backend services that run 24/7");
  console.log("");

  // FRONTEND: BrowserProvider (simulated - can't actually use in Node.js)
  console.log("🌐 FRONTEND (Browser):");
  console.log("  Type: BrowserProvider");
  console.log("  Purpose: User-triggered transactions");
  console.log("  Signer: From MetaMask (user controls private key)");
  console.log("  User interaction: MetaMask popup for every transaction");
  console.log("  Use case: DApp UI (deposit, withdraw, swap)");
  console.log("");

  // Show both can read blockchain data
  const blockNumber = await backendProvider.getBlockNumber();
  console.log("✅ Both can read blockchain data:");
  console.log("  Latest block:", blockNumber);
  console.log("");

  // Show signer difference
  console.log("🔐 Signer Differences:");
  console.log("  Backend: const [signer] = await connection.ethers.getSigners();");
  console.log("  Frontend: const signer = await provider.getSigner(); // MetaMask popup");
  console.log("");

  console.log("📊 When to use which:");
  console.log("  ✅ Backend: Event listeners, price oracles, automated allowances");
  console.log("  ✅ Frontend: User deposits, user withdrawals, user swaps");
  console.log("  ✅ Both: Reading balances, querying contract state");
}

compareProviders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Step 2:** Run the script

```powershell
npx tsx scripts/week7/compare-providers.ts
```

**Expected Output:**
```
=== Frontend vs Backend Providers ===

🔧 BACKEND (Node.js):
  Type: JsonRpcProvider
  Purpose: Automated scripts, event listeners, cron jobs
  Signer: From Hardhat keystore (private key)
  User interaction: None (headless)
  Use case: Backend services that run 24/7

🌐 FRONTEND (Browser):
  Type: BrowserProvider
  Purpose: User-triggered transactions
  Signer: From MetaMask (user controls private key)
  User interaction: MetaMask popup for every transaction
  Use case: DApp UI (deposit, withdraw, swap)

✅ Both can read blockchain data:
  Latest block: 7234567

🔐 Signer Differences:
  Backend: const [signer] = await connection.ethers.getSigners();
  Frontend: const signer = await provider.getSigner(); // MetaMask popup

📊 When to use which:
  ✅ Backend: Event listeners, price oracles, automated allowances
  ✅ Frontend: User deposits, user withdrawals, user swaps
  ✅ Both: Reading balances, querying contract state
```

**What Just Happened?**
- Compared backend (JsonRpcProvider) vs frontend (BrowserProvider)
- Both can read blockchain data
- Different signer sources (keystore vs MetaMask)
- Different use cases (automated vs user-triggered)

---

### Activity 3: Backend Wallet Loading

**Goal:** Load wallet signer from Hardhat keystore (not MetaMask).

**Step 1:** Create `load-backend-wallet.ts`

```typescript
// scripts/week7/load-backend-wallet.ts
import { ethers } from "ethers";
import { network } from "hardhat";

async function loadBackendWallet() {
  console.log("=== Loading Backend Wallet ===\n");

  // Connect to network
  const connection = await network.connect();
  const provider = connection.ethers.provider;

  // Load signer from Hardhat keystore
  const [signer] = await connection.ethers.getSigners();
  const address = await signer.getAddress();

  console.log("✅ Wallet loaded from Hardhat keystore!");
  console.log("  Address:", address);
  console.log("");

  // Check balance
  const balance = await provider.getBalance(address);
  console.log("💰 Wallet Balance:", ethers.formatEther(balance), "ETH");
  console.log("");

  // This wallet can sign transactions WITHOUT MetaMask
  console.log("🔐 Wallet Capabilities:");
  console.log("  ✅ Can read blockchain data");
  console.log("  ✅ Can sign transactions programmatically");
  console.log("  ✅ No MetaMask popup needed");
  console.log("  ✅ Can run in background services");
  console.log("");

  // Show how to sign a message (not a transaction)
  const message = "Hello from backend wallet!";
  const signature = await signer.signMessage(message);
  console.log("📝 Message Signing Test:");
  console.log("  Message:", message);
  console.log("  Signature:", signature.substring(0, 20) + "...");
  console.log("");

  // Verify the signature
  const recoveredAddress = ethers.verifyMessage(message, signature);
  console.log("✅ Signature Verification:");
  console.log("  Recovered address:", recoveredAddress);
  console.log("  Matches signer:", recoveredAddress === address ? "YES ✅" : "NO ❌");
  console.log("");

  console.log("⚠️  Security Reminder:");
  console.log("  This wallet's private key is in Hardhat keystore");
  console.log("  For production: Use hardware wallet or cloud KMS");
  console.log("  For development: Hardhat --dev keystore is fine (testnet only!)");
}

loadBackendWallet()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Step 2:** Run the script

```powershell
npx tsx scripts/week7/load-backend-wallet.ts
```

**Expected Output:**
```
=== Loading Backend Wallet ===

✅ Wallet loaded from Hardhat keystore!
  Address: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736

💰 Wallet Balance: 0.799 ETH

🔐 Wallet Capabilities:
  ✅ Can read blockchain data
  ✅ Can sign transactions programmatically
  ✅ No MetaMask popup needed
  ✅ Can run in background services

📝 Message Signing Test:
  Message: Hello from backend wallet!
  Signature: 0x1234567890abcdef...

✅ Signature Verification:
  Recovered address: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
  Matches signer: YES ✅

⚠️  Security Reminder:
  This wallet's private key is in Hardhat keystore
  For production: Use hardware wallet or cloud KMS
  For development: Hardhat --dev keystore is fine (testnet only!)
```

**What Just Happened?**
- Loaded wallet from Hardhat keystore using `getSigners()`
- Signed a message programmatically (no MetaMask!)
- Verified signature to prove signer identity
- This wallet can now send automated transactions

**Q: Where is this private key stored?**
A: In Hardhat's development keystore (unencrypted for dev convenience). For production, you'd use encrypted keystore with password or cloud KMS.

---

### Activity 4: Query Contract from Backend

**Goal:** Read FamilyWallet contract data from backend script.

**Step 1:** Create `query-contract.ts`

```typescript
// scripts/week7/query-contract.ts
import { ethers } from "ethers";
import { network } from "hardhat";
import { FAMILY_WALLET_ADDRESS } from "../../ignition/deployments/chain-11155111/deployed_addresses.json";

// Minimal ABI (just view functions we need)
const FAMILY_WALLET_ABI = [
  "function getBalance(address member) external view returns (uint256)",
  "function isMember(address addr) external view returns (bool)",
  "function owner() external view returns (address)",
];

async function queryContract() {
  console.log("=== Query FamilyWallet from Backend ===\n");

  // Connect to network
  const connection = await network.connect();
  const provider = connection.ethers.provider;

  // Get our wallet address
  const [signer] = await connection.ethers.getSigners();
  const address = await signer.getAddress();

  console.log("📋 Contract Address:", FAMILY_WALLET_ADDRESS);
  console.log("👤 Our Address:", address);
  console.log("");

  // Create contract instance (READ-ONLY - no signer needed)
  const contract = new ethers.Contract(
    FAMILY_WALLET_ADDRESS,
    FAMILY_WALLET_ABI,
    provider // Just provider (read-only)
  );

  // Query contract owner
  const owner = await contract.owner();
  console.log("👑 Contract Owner:", owner);
  console.log("  Are we owner?", owner === address ? "YES ✅" : "NO ❌");
  console.log("");

  // Check if we're a member
  const isMember = await contract.isMember(address);
  console.log("🔐 Member Status:", isMember ? "YES ✅" : "NO ❌");
  console.log("");

  // Get our balance in contract
  const balance = await contract.getBalance(address);
  console.log("💰 Our Balance in Contract:", ethers.formatEther(balance), "ETH");
  console.log("");

  // Get contract's total ETH balance
  const contractBalance = await provider.getBalance(FAMILY_WALLET_ADDRESS);
  console.log("🏦 Contract Total Balance:", ethers.formatEther(contractBalance), "ETH");
  console.log("");

  console.log("✅ All queries completed without MetaMask!");
  console.log("💡 View functions are free - no gas cost!");
}

queryContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Step 2:** Run the script

```powershell
npx tsx scripts/week7/query-contract.ts
```

**Expected Output:**
```
=== Query FamilyWallet from Backend ===

📋 Contract Address: 0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e
👤 Our Address: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736

👑 Contract Owner: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
  Are we owner? YES ✅

🔐 Member Status: YES ✅

💰 Our Balance in Contract: 0.002 ETH

🏦 Contract Total Balance: 0.002 ETH

✅ All queries completed without MetaMask!
💡 View functions are free - no gas cost!
```

**What Just Happened?**
- Created contract instance with provider (read-only)
- Called view functions (`owner()`, `isMember()`, `getBalance()`)
- All queries were free (no gas cost)
- No MetaMask needed!

**Q: Why use minimal ABI instead of full ABI?**
A: Smaller script, faster parsing. Only include functions you actually use.

---

## 📝 Deliverables

By the end of this class, you should have:

- [x] ✅ Four working backend scripts in `blockchain/scripts/week7/`:
  - `backend-provider.ts` (provider setup)
  - `compare-providers.ts` (frontend vs backend comparison)
  - `load-backend-wallet.ts` (keystore wallet loading)
  - `query-contract.ts` (contract queries from backend)
- [x] ✅ Understanding of Hardhat 3 `network.connect()` pattern
- [x] ✅ Ability to load signers from Hardhat keystore
- [x] ✅ Clear mental model of frontend vs backend blockchain connections
- [x] ✅ Knowledge of when to use BrowserProvider vs JsonRpcProvider

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module 'hardhat'"

**Error:**
```
Error: Cannot find module 'hardhat'
```

**Cause:** Running script from wrong directory or Hardhat not installed.

**Solution:**
```powershell
# Ensure you're in blockchain/ directory
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\blockchain

# Verify Hardhat is installed
npx hardhat --version
```

---

### Issue 2: "Provider is undefined"

**Error:**
```
TypeError: Cannot read property 'getBlockNumber' of undefined
```

**Cause:** Forgot to `await network.connect()` before accessing provider.

**Solution:**
```typescript
// ❌ Wrong
const provider = network.connect().ethers.provider; // Missing await!

// ✅ Correct
const connection = await network.connect();
const provider = connection.ethers.provider;
```

---

### Issue 3: "Private key not found in keystore"

**Error:**
```
Error: SEPOLIA_PRIVATE_KEY not found in keystore
```

**Cause:** Running script on network that requires private key not set.

**Solution:**
```powershell
# Check what's in keystore
npx hardhat keystore list --dev

# If empty, set private key
npx hardhat keystore set --dev SEPOLIA_PRIVATE_KEY
```

---

### Issue 4: ethers.js v5 vs v6 confusion

**Error:**
```
Error: provider.getBalance is not a function
```

**Cause:** Using v5 syntax with v6 or vice versa.

**Solution:**
```typescript
// ✅ ethers.js v6 (our version)
import { ethers } from "ethers"; // Standalone import
const balance = await provider.getBalance(address);
const formatted = ethers.formatEther(balance);

// ❌ ethers.js v5 (old)
import { ethers } from "hardhat"; // Bundled with Hardhat 2
const formatted = ethers.utils.formatEther(balance); // utils.formatEther
```

Always check documentation for YOUR version!

---

## ✅ Self-Assessment Quiz

### 1. What's the main difference between BrowserProvider and JsonRpcProvider?

<details>
<summary>Answer</summary>

**BrowserProvider:**
- Used in browser (frontend)
- Connects to MetaMask or other browser wallets
- Requires user interaction (popup for transactions)
- User controls private key
- Example: `new ethers.BrowserProvider(window.ethereum)`

**JsonRpcProvider:**
- Used in Node.js (backend)
- Connects to RPC endpoint (Alchemy, Infura, local node)
- No user interaction (headless)
- Application controls private key
- Example: `new ethers.JsonRpcProvider(rpcUrl)` or `connection.ethers.provider`

**Use BrowserProvider when:** User needs to approve transactions (deposits, swaps)
**Use JsonRpcProvider when:** Backend service runs automatically (event listeners, cron jobs)

**Both can:** Read blockchain data (balances, blocks, transactions)
</details>

---

### 2. How do you get a provider using Hardhat 3's network.connect() pattern?

<details>
<summary>Answer</summary>

```typescript
import { network } from "hardhat";

// Connect to network (uses hardhat.config.ts)
const connection = await network.connect();

// Get provider
const provider = connection.ethers.provider;

// Get signer (from keystore)
const [signer] = await connection.ethers.getSigners();
```

**Key points:**
1. Import `network` from `"hardhat"` (not `ethers`)
2. `await network.connect()` - don't forget await!
3. Access via `connection.ethers.provider`
4. This uses your configured network from `hardhat.config.ts`

**What changed from Hardhat 2:**
- Old: `import { ethers } from "hardhat"; const provider = ethers.provider;`
- New: `import { network } from "hardhat"; const { ethers } = await network.connect();`
</details>

---

### 3. Why is ethers.js preferred over Web3.js for modern projects?

<details>
<summary>Answer</summary>

**Reasons ethers.js is preferred:**

1. **Better documentation** - Clear, comprehensive, well-organized
2. **TypeScript-first** - Built with TS from the start (not added later)
3. **Smaller size** - ~88KB vs 500KB+ (important for frontend)
4. **Cleaner API** - `formatEther()` vs `utils.fromWei()`
5. **Promise-based** - Modern async/await (vs callback-heavy)
6. **Strong ecosystem** - Hardhat, Foundry, Scaffold-ETH use it
7. **Industry adoption** - Uniswap, Aave, Compound, OpenSea all use it
8. **Active maintenance** - Nomic Foundation backing

**Web3.js is still valid!** But for new projects in 2025, ethers.js is the standard.

**You can use both in the same project** if needed (different APIs, same blockchain).
</details>

---

### 4. What's the difference between reading and writing blockchain data?

<details>
<summary>Answer</summary>

**Reading (View Functions):**
- ✅ **Free** - No gas cost
- ✅ **Fast** - Instant response
- ✅ **Provider only** - No signer needed
- ✅ **No confirmation** - No transaction to wait for
- Examples: `getBalance()`, `getBlockNumber()`, `contract.balanceOf()`

**Writing (Transactions):**
- 💰 **Costs gas** - Paid by transaction sender
- ⏳ **Takes time** - Wait for block confirmation (~15-30 seconds)
- 🔐 **Requires signer** - Must sign transaction with private key
- 📋 **Needs confirmation** - Must `await tx.wait()`
- Examples: `sendTransaction()`, `contract.deposit()`, `contract.transfer()`

**Code pattern:**
```typescript
// Reading - Provider
const contract = new ethers.Contract(address, abi, provider);
const balance = await contract.getBalance(addr); // Free, instant

// Writing - Signer
const contract = new ethers.Contract(address, abi, signer);
const tx = await contract.deposit({ value: ethers.parseEther("0.1") });
await tx.wait(); // Costs gas, takes time
```
</details>

---

### 5. Where is the private key stored when using Hardhat's getSigners()?

<details>
<summary>Answer</summary>

**Development (--dev keystore):**
- Location: Hardhat's internal storage (unencrypted)
- Set with: `npx hardhat keystore set --dev SEPOLIA_PRIVATE_KEY`
- Security: ⚠️ Low (plaintext, dev only!)
- Use for: Local development and testnets only

**Production (encrypted keystore):**
- Location: Encrypted keystore file (requires password)
- Set with: `npx hardhat keystore set SEPOLIA_PRIVATE_KEY` (prompts for password)
- Security: ✅ Medium (encrypted with password)
- Use for: Testnets and low-value operations

**Best practices for production:**
1. ✅ **Hardware wallet** (Ledger, Trezor) - Highest security
2. ✅ **Cloud KMS** (AWS KMS, Google Cloud KMS) - Managed security
3. ✅ **Encrypted keystore** with strong password
4. ❌ **NEVER .env files** with private keys (can leak to Git!)
5. ❌ **NEVER hardcoded** in source code

**For our course:**
- Use `--dev` keystore (fine for Sepolia testnet)
- Understand production patterns (implement in Week 29-30)
</details>

---

### 6. What's the Hardhat 3 pattern for loading a signer?

<details>
<summary>Answer</summary>

```typescript
import { network } from "hardhat";

// Connect to network
const connection = await network.connect();

// Get signers (from keystore)
const [signer] = await connection.ethers.getSigners();

// Use signer
const address = await signer.getAddress();
const tx = await signer.sendTransaction({...});
```

**Array destructuring explained:**
```typescript
const [signer] = await connection.ethers.getSigners(); // Get first signer
const [signer1, signer2] = await connection.ethers.getSigners(); // Get two signers
const signers = await connection.ethers.getSigners(); // Get array of all signers
```

**Why multiple signers?**
- Hardhat local node creates 20 signers automatically
- For testing multi-user scenarios
- First signer is usually the "deployer" or "owner"

**What changed from Hardhat 2:**
- Old: `const [signer] = await ethers.getSigners();`
- New: `const { ethers } = await network.connect(); const [signer] = await ethers.getSigners();`
</details>

---

## 🎯 Key Takeaways

1. **Frontend (BrowserProvider)** = User-triggered, MetaMask popups, browser only
2. **Backend (JsonRpcProvider)** = Automated, no popups, Node.js scripts
3. **Hardhat 3 pattern:** `const connection = await network.connect(); const provider = connection.ethers.provider;`
4. **Signers:** MetaMask (frontend) vs Keystore (backend)
5. **ethers.js > Web3.js** for modern projects (smaller, cleaner, better docs)
6. **Reading = free, Writing = costs gas** - always estimate before writing!
7. **View functions don't need signers** - just provider is enough
8. **Both frontend and backend can read** - only difference is for transactions

---

## 🔗 Next Steps

In **Class 7.2: Frontend Contract Interaction Review**, you'll:
- Review Week 6's useFamilyWallet hook patterns
- Understand provider vs signer in frontend context
- Compare frontend (BrowserProvider) vs backend (JsonRpcProvider) code side-by-side
- Prepare for Class 7.3's backend transaction signing

**Before Class 7.2:**
- Ensure all 4 scripts from this class work
- Review `family-wallet-ui/hooks/useFamilyWallet.ts` from Week 6
- Make sure FamilyWallet contract is still deployed
- Have MetaMask connected to Sepolia

---

## 📚 Reading References

**Bitcoin Book:**
- **Chapter 3:** Bitcoin Core - Running a Node (RPC connections)
- **Chapter 6:** Transactions - Transaction Structure

**Ethereum Book:**
- **Chapter 3:** Clients - Running an Ethereum Client
- **Appendix:** Web3.js Tutorial (compare to ethers.js)

**Key sections:**
- RPC interfaces (how providers communicate with nodes)
- JSON-RPC protocol (what providers use under the hood)
- Provider patterns (read vs write operations)

---

## 🧑‍🏫 Teaching Notes (For Claude Code)

**Pacing:**
- 4 activities, ~30-45 minutes each
- Activity 1 is critical (foundation for all backend work)
- Activity 4 connects to Week 6 (show continuity)

**Common Student Questions:**
1. **"Why not just use MetaMask for everything?"** → Can't run 24/7, no automation
2. **"Is Hardhat 3 pattern harder than v2?"** → More explicit, but more flexible
3. **"When do I use Web3.js vs ethers.js?"** → Almost always ethers.js for new projects

**Version-Specific Gotchas:**
- ✅ `import { network } from "hardhat"` (Hardhat 3)
- ✅ `ethers.formatEther()` not `ethers.utils.formatEther` (v6 vs v5)
- ✅ `JsonRpcProvider` not `JsonRpcProvider` (same name, different import)

**Real-World Connection:**
- Show Aave's event listeners (backend services monitoring liquidations)
- Explain Uniswap's price oracles (automated price updates)
- Compare to traditional APIs (backend services that run 24/7)

**Security Emphasis:**
- Hardhat --dev keystore is ONLY for development
- Production needs encrypted keystore or hardware wallet
- Never commit private keys to Git!

**Setup for Next Classes:**
- Class 7.2 reviews frontend patterns (Week 6)
- Class 7.3 builds backend transaction service
- Class 7.4 adds event listening (WebSocket provider)

---

*Last Updated: 2025-11-21*
*Course: FamilyChain Blockchain Development*
*Week 7, Class 7.1 of 4*
