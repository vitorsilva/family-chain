# Week 5 - Class 5.4: Deploying to Testnet

**Duration:** 2-3 hours
**Prerequisites:** Class 5.1-5.3 completed, all tests passing, Sepolia testnet ETH available, Etherscan API key
**Why It Matters:** Deployment is the moment your code goes live. This class teaches you to deploy safely, verify contracts, and interact with them on a public blockchain.

---

## 📋 Learning Objectives

By the end of this class, you will be able to:

1. Configure Hardhat 3 for testnet deployment
2. Securely manage deployment accounts using Hardhat keystore
3. Deploy FamilyWallet contract to Sepolia testnet
4. Verify contract source code on Etherscan
5. Interact with deployed contracts via Etherscan
6. Write deployment scripts with proper error handling
7. Manage and track deployed contract addresses
8. Estimate deployment costs and gas optimization

---

## 🎯 Key Concepts

### 1. Why Deploy to Testnet First?

**Testnet Deployment Benefits:**
- **Free testing** - Testnet ETH has no value
- **Real blockchain** - Same environment as mainnet
- **Public verification** - Others can interact with your contract
- **No risk** - Mistakes don't cost real money
- **Learning opportunity** - Practice deployment flow

**Deployment Progression:**
```
Local (Hardhat) → Testnet (Sepolia) → Mainnet (Production)
     ↓                  ↓                     ↓
  Free, instant     Free, real network    Costs real ETH
  No explorers      Etherscan available   Production ready
```

### 2. Hardhat 3 Network Configuration

**Hardhat 3 Breaking Changes:**
- ⚠️ Use `npx hardhat keystore` instead of `.env` files
- ⚠️ Use `configVariable()` for secrets
- ⚠️ Network config structure changed from Hardhat 2

**Network Types:**

| Network | Type | Purpose | Cost |
|---------|------|---------|------|
| `localhost` | EDR-simulated | Development | Free |
| `hardhat` | In-memory | Testing | Free |
| `sepolia` | HTTP (testnet) | Testing | Free testnet ETH |
| `mainnet` | HTTP (production) | Production | Real ETH |

**Configuration Example:**

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import { configVariable } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")]
    }
  },
  etherscan: {
    apiKey: configVariable("ETHERSCAN_API_KEY")
  }
};

export default config;
```

### 3. Hardhat Keystore (Secure Key Management)

**DON'T:** Store private keys in `.env` files (can be committed to git)

**DO:** Use Hardhat keystore (encrypted, password-protected)

```powershell
# Create encrypted keystore entry
npx hardhat keystore set DEPLOYER_PRIVATE_KEY

# Hardhat prompts for:
# 1. Private key (hidden input)
# 2. Password (to encrypt the key)

# Later use (prompts for password):
npx hardhat run scripts/deploy.ts --network sepolia
```

**Keystore Benefits:**
- ✅ Encrypted with password
- ✅ Never stored in plain text
- ✅ Safe to commit config files
- ✅ Industry standard (similar to MetaMask keystore)

### 4. Gas Optimization for Deployment

**Deployment costs include:**
1. **Contract bytecode** - Larger contracts = higher cost
2. **Constructor execution** - Complex initialization costs more
3. **Storage writes** - Setting initial state variables

**Optimization strategies:**

```solidity
// ❌ EXPENSIVE: Large contract
contract Inefficient {
    string public constant LONG_STRING = "Very long string that increases bytecode size significantly...";
    uint256[100] public largeArray; // Unused storage
}

// ✅ CHEAPER: Optimized contract
contract Efficient {
    bytes32 public constant HASH = keccak256("string"); // Hash instead of string
    // Only declare storage you actually use
}
```

**Hardhat Optimizer:**
```typescript
optimizer: {
  enabled: true,
  runs: 200 // Balance between deployment cost and execution cost
}
```

- **runs: 200** - Optimize for deployment cost (most contracts)
- **runs: 10,000** - Optimize for execution cost (frequently called)

### 5. Contract Verification on Etherscan

**Why verify contracts?**
- ✅ Users can read source code
- ✅ Transparency builds trust
- ✅ Etherscan shows function names (not just hex)
- ✅ Direct interaction via Etherscan UI
- ✅ Security auditors can review

**Verified vs Unverified:**

| Aspect | Unverified | Verified |
|--------|-----------|----------|
| **Source code** | ❌ Hidden | ✅ Public |
| **Function names** | Hex signatures | Human-readable |
| **Etherscan UI** | Limited | Full interaction |
| **Trust** | Low | High |

### 6. Deployment Scripts Best Practices

**Good deployment script:**
```typescript
// ✅ Proper error handling
// ✅ Deployment verification
// ✅ Address logging
// ✅ Transaction receipts
// ✅ Post-deployment checks

async function main() {
  try {
    console.log("Starting deployment...");

    // Deploy
    const wallet = await deploy();

    // Verify
    await verifyDeployment(wallet);

    // Log
    console.log(`Deployed to: ${await wallet.getAddress()}`);

    // Save address
    await saveAddress(await wallet.getAddress());

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}
```

### 7. Interacting with Deployed Contracts

**Three ways to interact:**

1. **Etherscan UI** - Good for testing, one-off transactions
2. **Hardhat scripts** - Good for automation, batch operations
3. **Frontend (Week 7)** - Production user interface

**Example interaction via script:**
```typescript
// Get deployed contract
const wallet = await ethers.getContractAt("FamilyWallet", address);

// Read state
const owner = await wallet.owner();
console.log("Owner:", owner);

// Write state
const tx = await wallet.addMember(memberAddress);
await tx.wait();
console.log("Member added!");
```

### 8. Deployment Cost Estimation

**Typical costs (Sepolia testnet):**
- FamilyWallet deployment: ~0.002-0.005 ETH
- Transaction (addMember): ~0.0001-0.0003 ETH
- Gas price: Varies (5-50 Gwei on testnet)

**Check before deploying:**
```typescript
// Estimate deployment cost
const FamilyWallet = await ethers.getContractFactory("FamilyWallet");
const deployTx = await FamilyWallet.getDeployTransaction(ownerAddress);
const gasEstimate = await ethers.provider.estimateGas(deployTx);
const gasPrice = (await ethers.provider.getFeeData()).gasPrice;
const cost = gasEstimate * gasPrice;

console.log(`Estimated cost: ${ethers.formatEther(cost)} ETH`);
```

---

## 🛠️ Hands-On Activities

### Activity 1: Configure Hardhat for Sepolia (25 minutes)

**Objective:** Set up Hardhat configuration for testnet deployment.

**Step 1:** Get Sepolia RPC URL

Option A: Use Alchemy (recommended)
1. Go to https://www.alchemy.com/
2. Sign up for free account
3. Create new app: Network = "Ethereum", Chain = "Sepolia"
4. Copy HTTPS RPC URL (e.g., `https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY`)

Option B: Use public RPC (less reliable)
- `https://rpc.sepolia.org`
- `https://eth-sepolia.public.blastapi.io`

**Step 2:** Get Etherscan API Key

1. Go to https://etherscan.io/
2. Sign up for free account
3. Go to API Keys section
4. Create new API key
5. Copy the key

**Step 3:** Set up Hardhat keystore

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain

# Store Sepolia RPC URL
npx hardhat keystore set SEPOLIA_RPC_URL
# Enter: https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY
# Enter password to encrypt

# Store deployer private key (from Week 2)
npx hardhat keystore set DEPLOYER_PRIVATE_KEY
# Enter: Your private key (0x...)
# Enter same password

# Store Etherscan API key
npx hardhat keystore set ETHERSCAN_API_KEY
# Enter: Your Etherscan API key
# Enter same password
```

**Step 4:** Update `hardhat.config.ts`

```typescript
import { HardhatUserConfig } from "hardhat/config";
import { configVariable } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: configVariable("ETHERSCAN_API_KEY")
  }
};

export default config;
```

**Step 5:** Verify configuration

```powershell
# Test connection to Sepolia
npx hardhat run --network sepolia scripts/check-balance.ts
```

Create `scripts/check-balance.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Expected Output:**
```
Deployer address: 0x...
Balance: 0.80 ETH
Network: sepolia Chain ID: 11155111
```

### Activity 2: Write Deployment Script (30 minutes)

**Objective:** Create a robust deployment script with error handling and verification.

Create `scripts/deploy-family-wallet.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  console.log("=".repeat(50));
  console.log("FamilyWallet Deployment Script");
  console.log("=".repeat(50));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("\nDeploying with account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    throw new Error("Insufficient balance for deployment");
  }

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Deploying to network:", network.name);
  console.log("Chain ID:", network.chainId);

  // Estimate deployment cost
  const FamilyWallet = await ethers.getContractFactory("FamilyWallet");
  const deployTx = FamilyWallet.getDeployTransaction(deployer.address);
  const gasEstimate = await ethers.provider.estimateGas(deployTx);
  const feeData = await ethers.provider.getFeeData();

  console.log("\n--- Gas Estimation ---");
  console.log("Estimated gas:", gasEstimate.toString());
  console.log("Gas price:", ethers.formatUnits(feeData.gasPrice || 0n, "gwei"), "Gwei");

  const estimatedCost = gasEstimate * (feeData.gasPrice || 0n);
  console.log("Estimated cost:", ethers.formatEther(estimatedCost), "ETH");

  // Confirm deployment
  console.log("\n--- Starting Deployment ---");

  // Deploy contract
  const wallet = await FamilyWallet.deploy(deployer.address);
  console.log("Transaction hash:", wallet.deploymentTransaction()?.hash);
  console.log("Waiting for confirmations...");

  // Wait for deployment
  await wallet.waitForDeployment();
  const contractAddress = await wallet.getAddress();

  console.log("\n✅ Contract deployed successfully!");
  console.log("Contract address:", contractAddress);

  // Get deployment receipt
  const receipt = await wallet.deploymentTransaction()?.wait();
  console.log("Block number:", receipt?.blockNumber);
  console.log("Gas used:", receipt?.gasUsed.toString());
  console.log("Actual cost:", ethers.formatEther(receipt?.fee || 0n), "ETH");

  // Verify deployment
  console.log("\n--- Verifying Deployment ---");

  const owner = await wallet.owner();
  console.log("Owner:", owner);
  console.log("Owner matches deployer:", owner === deployer.address ? "✅" : "❌");

  const memberCount = await wallet.getMemberCount();
  console.log("Initial member count:", memberCount.toString());

  const totalBalance = await wallet.getTotalBalance();
  console.log("Initial balance:", ethers.formatEther(totalBalance), "ETH");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    owner: owner,
    deployer: deployer.address,
    transactionHash: wallet.deploymentTransaction()?.hash,
    blockNumber: receipt?.blockNumber,
    gasUsed: receipt?.gasUsed.toString(),
    deploymentCost: ethers.formatEther(receipt?.fee || 0n),
    timestamp: new Date().toISOString()
  };

  console.log("\n--- Deployment Info ---");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require("fs");
  const path = require("path");

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📝 Deployment info saved to:", filepath);

  // Etherscan link
  if (network.chainId === 11155111n) {
    console.log("\n🔍 View on Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Deployment Complete!");
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
```

**Step 2:** Test deployment on Hardhat network (local)

```powershell
npx hardhat run scripts/deploy-family-wallet.ts
```

**Expected Output:**
```
==================================================
FamilyWallet Deployment Script
==================================================

Deploying with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 10000.0 ETH
Deploying to network: hardhat
Chain ID: 31337

--- Gas Estimation ---
Estimated gas: 1234567
Gas price: 0.0 Gwei
Estimated cost: 0.0 ETH

--- Starting Deployment ---
Transaction hash: 0x...
Waiting for confirmations...

✅ Contract deployed successfully!
Contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
...
```

### Activity 3: Deploy to Sepolia Testnet (20 minutes)

**Objective:** Deploy FamilyWallet to public Sepolia testnet.

**Step 1:** Ensure you have Sepolia ETH

```powershell
npx hardhat run scripts/check-balance.ts --network sepolia
```

If balance is low, get testnet ETH from faucets (Week 2).

**Step 2:** Deploy to Sepolia

```powershell
# Hardhat will prompt for keystore password
npx hardhat run scripts/deploy-family-wallet.ts --network sepolia
```

**Expected Output:**
```
==================================================
FamilyWallet Deployment Script
==================================================

Deploying with account: 0x...
Account balance: 0.80 ETH
Deploying to network: sepolia
Chain ID: 11155111

--- Gas Estimation ---
Estimated gas: 1234567
Gas price: 12.5 Gwei
Estimated cost: 0.0154 ETH

--- Starting Deployment ---
Transaction hash: 0xabc123...
Waiting for confirmations...

✅ Contract deployed successfully!
Contract address: 0x1234567890abcdef1234567890abcdef12345678
Block number: 4567890
Gas used: 1234567
Actual cost: 0.0154 ETH

--- Verifying Deployment ---
Owner: 0x...
Owner matches deployer: ✅
Initial member count: 0
Initial balance: 0.0 ETH

📝 Deployment info saved to: deployments/sepolia-1234567890.json

🔍 View on Etherscan:
https://sepolia.etherscan.io/address/0x1234567890abcdef1234567890abcdef12345678

==================================================
✅ Deployment Complete!
==================================================
```

**Step 3:** View contract on Etherscan

Open the Etherscan URL and verify:
- Contract shows bytecode ✅
- Source code is NOT verified yet (we'll do this next)

### Activity 4: Verify Contract on Etherscan (25 minutes)

**Objective:** Make source code publicly visible on Etherscan.

**Step 1:** Verify using Hardhat

```powershell
# Replace with your actual contract address
npx hardhat verify --network sepolia 0x1234567890abcdef1234567890abcdef12345678 "0xYourDeployerAddress"
```

**Parameters explained:**
- `0x1234...` - Contract address (from deployment)
- `"0xYour..."` - Constructor argument (owner address)

**Expected Output:**
```
Successfully submitted source code for contract
contracts/FamilyWallet.sol:FamilyWallet at 0x1234...
for verification on the block explorer. Waiting for verification result...

Successfully verified contract FamilyWallet on Etherscan.
https://sepolia.etherscan.io/address/0x1234...#code
```

**Step 2:** Verify on Etherscan website

Go to your contract address on Etherscan and check:
- ✅ "Contract" tab shows green checkmark
- ✅ "Read Contract" tab available
- ✅ "Write Contract" tab available
- ✅ Source code visible

**Step 3:** Test "Read Contract" functionality

On Etherscan:
1. Click "Contract" tab
2. Click "Read Contract" sub-tab
3. Try these read functions:
   - `owner()` - Should show your deployer address
   - `getMemberCount()` - Should return 0
   - `getTotalBalance()` - Should return 0

**Step 4:** Test "Write Contract" functionality

1. Click "Write Contract" tab
2. Click "Connect to Web3" → Connect MetaMask
3. Try `addMember()`:
   - Enter a test address (like Alice's address from testing)
   - Click "Write"
   - Confirm transaction in MetaMask
   - Wait for confirmation

4. Go back to "Read Contract"
5. Check `getMemberCount()` - Should now be 1!

### Activity 5: Interact with Deployed Contract via Script (25 minutes)

**Objective:** Programmatically interact with the deployed contract.

Create `scripts/interact-family-wallet.ts`:

```typescript
import { ethers } from "hardhat";

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

async function main() {
  console.log("=".repeat(50));
  console.log("FamilyWallet Interaction Script");
  console.log("=".repeat(50));

  // Get accounts
  const [owner, alice, bob] = await ethers.getSigners();
  console.log("\nOwner:", owner.address);
  console.log("Alice:", alice.address);
  console.log("Bob:", bob.address);

  // Get deployed contract
  const wallet = await ethers.getContractAt("FamilyWallet", CONTRACT_ADDRESS);
  console.log("\nConnected to contract:", await wallet.getAddress());

  // Check initial state
  console.log("\n--- Initial State ---");
  console.log("Owner:", await wallet.owner());
  console.log("Member count:", (await wallet.getMemberCount()).toString());
  console.log("Total balance:", ethers.formatEther(await wallet.getTotalBalance()), "ETH");

  // Add Alice as member
  console.log("\n--- Adding Alice as Member ---");
  const addTx = await wallet.connect(owner).addMember(alice.address);
  console.log("Transaction hash:", addTx.hash);
  await addTx.wait();
  console.log("✅ Alice added!");

  // Verify Alice is member
  const isAliceMember = await wallet.isMember(alice.address);
  console.log("Is Alice a member?", isAliceMember ? "✅" : "❌");

  // Alice deposits
  console.log("\n--- Alice Depositing ---");
  const depositAmount = ethers.parseEther("0.1");
  const depositTx = await wallet.connect(alice).deposit({ value: depositAmount });
  console.log("Transaction hash:", depositTx.hash);
  await depositTx.wait();
  console.log("✅ Deposit successful!");

  // Check balances
  console.log("\n--- Updated Balances ---");
  console.log("Alice's balance:", ethers.formatEther(await wallet.getBalance(alice.address)), "ETH");
  console.log("Total balance:", ethers.formatEther(await wallet.getTotalBalance()), "ETH");

  // Add Bob as member
  console.log("\n--- Adding Bob as Member ---");
  const addBobTx = await wallet.connect(owner).addMember(bob.address);
  await addBobTx.wait();
  console.log("✅ Bob added!");

  // Bob deposits
  console.log("\n--- Bob Depositing ---");
  const bobDepositTx = await wallet.connect(bob).deposit({ value: ethers.parseEther("0.05") });
  await bobDepositTx.wait();
  console.log("✅ Deposit successful!");

  // Final state
  console.log("\n--- Final State ---");
  const members = await wallet.getMembers();
  console.log("Members:", members);
  console.log("Member count:", (await wallet.getMemberCount()).toString());

  for (const member of members) {
    const balance = await wallet.getBalance(member);
    console.log(`  ${member}: ${ethers.formatEther(balance)} ETH`);
  }

  console.log("\nTotal balance:", ethers.formatEther(await wallet.getTotalBalance()), "ETH");

  console.log("\n" + "=".repeat(50));
  console.log("✅ Interaction Complete!");
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });
```

**Run interaction script:**

```powershell
npx hardhat run scripts/interact-family-wallet.ts --network sepolia
```

**Expected Output:**
```
==================================================
FamilyWallet Interaction Script
==================================================

Owner: 0x...
Alice: 0x...
Bob: 0x...

Connected to contract: 0x1234...

--- Initial State ---
Owner: 0x...
Member count: 0
Total balance: 0.0 ETH

--- Adding Alice as Member ---
Transaction hash: 0xabc...
✅ Alice added!
Is Alice a member? ✅

--- Alice Depositing ---
Transaction hash: 0xdef...
✅ Deposit successful!

--- Updated Balances ---
Alice's balance: 0.1 ETH
Total balance: 0.1 ETH

...

✅ Interaction Complete!
```

---

## ✅ Expected Outputs

After completing all activities, you should have:

1. **Configured Hardhat for Sepolia:**
   - ✅ Hardhat keystore set up with encrypted keys
   - ✅ `hardhat.config.ts` configured for Sepolia network
   - ✅ Etherscan API key configured

2. **Deployed FamilyWallet contract:**
   - ✅ Contract deployed to Sepolia testnet
   - ✅ Deployment info saved to `deployments/` directory
   - ✅ Contract visible on Etherscan

3. **Verified contract source code:**
   - ✅ Source code visible on Etherscan
   - ✅ "Read Contract" and "Write Contract" tabs available
   - ✅ Green checkmark on contract page

4. **Interacted with deployed contract:**
   - ✅ Added members via script
   - ✅ Deposited ETH via script
   - ✅ Read state via Etherscan
   - ✅ All transactions confirmed on blockchain

---

## 📦 Deliverables

- [ ] Hardhat configured for Sepolia network
- [ ] FamilyWallet deployed to Sepolia testnet
- [ ] Contract address recorded and saved
- [ ] Contract source code verified on Etherscan
- [ ] Deployment script with error handling
- [ ] Interaction script working
- [ ] At least 2 members added and deposits made
- [ ] All transactions visible on Etherscan

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Insufficient funds for gas"

**Error:**
```
Error: insufficient funds for intrinsic transaction cost
```

**Solution:**
```powershell
# Check your balance
npx hardhat run scripts/check-balance.ts --network sepolia

# Get more testnet ETH from faucets (Week 2 resources):
# - https://www.alchemy.com/faucets/ethereum-sepolia
# - https://sepoliafaucet.com/
# - https://sepolia-faucet.pk910.de/
```

### Issue 2: "Invalid API key" for verification

**Error:**
```
Error: Invalid API key
```

**Solution:**
```powershell
# Verify API key is set correctly
npx hardhat keystore list
# Should show: ETHERSCAN_API_KEY

# If not set, add it:
npx hardhat keystore set ETHERSCAN_API_KEY
# Enter your Etherscan API key

# Try verification again
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "<CONSTRUCTOR_ARG>"
```

### Issue 3: Contract already verified

**Error:**
```
Error: Contract source code already verified
```

**Solution:**
This is actually good! Your contract is already verified. Just visit Etherscan to see it.

### Issue 4: "Replacement transaction underpriced"

**Error:**
```
Error: replacement transaction underpriced
```

**Cause:** Trying to send transaction with same nonce before previous one confirms.

**Solution:**
```powershell
# Wait for previous transaction to confirm
# Check on Etherscan: https://sepolia.etherscan.io/

# Or increase gas price in script:
const feeData = await ethers.provider.getFeeData();
const tx = await wallet.addMember(alice.address, {
  maxFeePerGas: feeData.maxFeePerGas! * 2n,
  maxPriorityFeePerGas: feeData.maxPriorityFeePerGas! * 2n
});
```

### Issue 5: Keystore password prompt not working

**Error:**
Password prompt doesn't appear or hangs.

**Solution:**
```powershell
# Use environment variable for non-interactive mode
$env:HARDHAT_KEYSTORE_PASSWORD = "your-password"
npx hardhat run scripts/deploy-family-wallet.ts --network sepolia

# Or create a .env file with:
# HARDHAT_KEYSTORE_PASSWORD=your-password
```

---

## 🎓 Self-Assessment Quiz

<details>
<summary><strong>Question 1:</strong> Why use Hardhat keystore instead of <code>.env</code> files?</summary>

**Answer:**
Hardhat keystore is **encrypted and password-protected**, making it much more secure.

**Comparison:**

| Aspect | .env File | Hardhat Keystore |
|--------|-----------|------------------|
| **Encryption** | ❌ Plain text | ✅ Encrypted (AES-256) |
| **Password** | ❌ None | ✅ Required |
| **Git safety** | ⚠️ Easy to commit | ✅ Safe (ciphertext only) |
| **Industry standard** | Old practice | ✅ Modern best practice |

**Real-world risk:**
Many hacks happen because developers commit `.env` files to GitHub with private keys. Hackers use bots to scan public repos for private keys and drain accounts within minutes.

**Keystore protects you:**
Even if you commit your keystore file, it's useless without the password.
</details>

<details>
<summary><strong>Question 2:</strong> What does the Solidity optimizer do?</summary>

**Answer:**
The optimizer **reduces contract bytecode size** and **execution costs** by removing redundant code.

**Configuration:**
```typescript
optimizer: {
  enabled: true,
  runs: 200 // How many times functions are expected to be called
}
```

**Runs parameter:**
- **runs: 1** - Optimize for deployment cost (larger bytecode, cheaper execution)
- **runs: 200** - Balanced (default, good for most contracts)
- **runs: 10,000** - Optimize for execution cost (smaller bytecode, expensive deployment)

**Choose based on use case:**
- Library contract called often? High runs
- One-time deployment contract? Low runs
- Typical smart contract? 200 runs (default)

**Trade-off:**
Optimization increases compilation time slightly but saves gas significantly.
</details>

<details>
<summary><strong>Question 3:</strong> Why verify contracts on Etherscan?</summary>

**Answer:**
Contract verification provides **transparency and trust** for users.

**Benefits:**

1. **Source code visibility** - Users can read what the contract does
2. **Security audits** - Auditors can review code
3. **Function names** - Instead of hex signatures, shows readable names
4. **Direct interaction** - Etherscan's "Read/Write Contract" UI
5. **Trust building** - Verified contracts appear more legitimate

**Example:**
```
Unverified:
  Method: 0xa0712d68 (mysterious hex)

Verified:
  Method: mint(address to, uint256 amount) (clear purpose)
```

**Users can:**
- Check for backdoors
- Verify token supply
- See access control
- Understand contract logic
</details>

<details>
<summary><strong>Question 4:</strong> What information should you save after deployment?</summary>

**Answer:**
Save **everything needed to reproduce and interact** with the deployment.

**Critical information:**
```json
{
  "network": "sepolia",
  "chainId": "11155111",
  "contractAddress": "0x123...",
  "deployer": "0xabc...",
  "transactionHash": "0xdef...",
  "blockNumber": "4567890",
  "gasUsed": "1234567",
  "deploymentCost": "0.0154 ETH",
  "timestamp": "2025-01-11T10:00:00Z",
  "constructorArgs": ["0xabc..."],
  "compiler": "0.8.28"
}
```

**Why save this?**
1. **Contract address** - To interact with it later
2. **Transaction hash** - Proof of deployment
3. **Constructor args** - Needed for verification
4. **Deployment cost** - For budgeting future deployments
5. **Timestamp** - For audit trail

**Where to save:**
- `deployments/` directory (in repo, git-tracked)
- Hardhat deployment artifacts
- Team documentation
- Project README
</details>

<details>
<summary><strong>Question 5:</strong> How do you estimate deployment costs before deploying?</summary>

**Answer:**
Use `estimateGas()` to calculate costs **before** sending transactions.

**Calculation:**
```typescript
// 1. Get deployment transaction
const FamilyWallet = await ethers.getContractFactory("FamilyWallet");
const deployTx = FamilyWallet.getDeployTransaction(ownerAddress);

// 2. Estimate gas needed
const gasEstimate = await ethers.provider.estimateGas(deployTx);

// 3. Get current gas price
const feeData = await ethers.provider.getFeeData();
const gasPrice = feeData.gasPrice;

// 4. Calculate cost
const estimatedCost = gasEstimate * gasPrice;
console.log("Cost:", ethers.formatEther(estimatedCost), "ETH");
```

**Example calculation:**
```
Gas needed: 1,234,567 gas
Gas price: 12.5 Gwei
Cost = 1,234,567 × 12.5 = 15,432,087.5 Gwei
    = 0.0154 ETH
    ≈ $40 USD (if ETH = $2,600)
```

**Use this to:**
- Check if you have enough balance
- Decide when to deploy (gas prices fluctuate)
- Budget for deployment costs
- Compare optimization strategies
</details>

<details>
<summary><strong>Question 6:</strong> What's the difference between testnet and mainnet deployment?</summary>

**Answer:**
The **process is identical**, but the **cost and risk** are drastically different.

**Comparison:**

| Aspect | Testnet (Sepolia) | Mainnet |
|--------|-------------------|---------|
| **ETH Cost** | Free (faucet) | Real money |
| **Mistakes** | No financial loss | Costly errors |
| **Speed** | Similar to mainnet | Same |
| **Explorer** | sepolia.etherscan.io | etherscan.io |
| **Purpose** | Testing | Production |
| **Users** | Developers | Real users |

**Deployment process:**
```powershell
# Testnet
npx hardhat run scripts/deploy.ts --network sepolia

# Mainnet (SAME COMMAND, different network!)
npx hardhat run scripts/deploy.ts --network mainnet
```

**Best practice:**
Always deploy to testnet first, verify everything works, THEN deploy to mainnet.

**Cost comparison (FamilyWallet):**
- Testnet: Free testnet ETH
- Mainnet: ~0.015 ETH ≈ $40 USD (at $2,600/ETH)
</details>

<details>
<summary><strong>Question 7:</strong> How do you interact with a deployed contract without writing code?</summary>

**Answer:**
Use **Etherscan's "Read Contract" and "Write Contract" interfaces**.

**Steps:**

**Read Contract (view functions):**
1. Go to contract on Etherscan
2. Click "Contract" tab
3. Click "Read Contract"
4. See all view functions (no gas cost)
5. Click function → See results

**Write Contract (state-changing functions):**
1. Click "Write Contract"
2. Click "Connect to Web3" → Connect MetaMask
3. Fill in function parameters
4. Click "Write" → Confirm in MetaMask
5. Wait for transaction confirmation

**Example: Add a member**
```
Function: addMember
Parameter: member (address) = 0x123...
[Write] button → MetaMask pops up → Confirm
✅ Transaction confirmed!
```

**Benefits:**
- No code needed
- Good for testing
- One-off admin tasks
- Show to non-technical stakeholders

**Limitations:**
- One transaction at a time
- No automation
- Not suitable for bulk operations
</details>

---

## 🎯 Key Takeaways

1. **Always test on testnet first** - Mainnet mistakes cost real money. Testnet is free practice.

2. **Hardhat keystore is essential** - Never use plain text `.env` files for private keys. Always encrypt.

3. **Contract verification builds trust** - Verified contracts are transparent and show you have nothing to hide.

4. **Save deployment information** - Contract address, transaction hash, and deployment details are critical for later.

5. **Estimate costs before deploying** - Use `estimateGas()` to avoid surprise expenses.

6. **Deployment scripts should be robust** - Error handling, logging, and verification prevent deployment failures.

7. **Interaction can happen three ways** - Etherscan UI (testing), scripts (automation), frontend (production).

---

## 📚 Next Steps

**Week 5 Complete! 🎉**

You now have:
- ✅ Understanding of Solidity fundamentals
- ✅ A working FamilyWallet contract
- ✅ Comprehensive test suite (>80% coverage)
- ✅ Deployed and verified contract on Sepolia

**Coming up in Week 6:**
- Gas optimization techniques
- Contract verification automation
- Frontend basics with React
- MetaMask integration
- Reading contract data from UI

**Buffer Week 8 (After Week 7):**
- Review and consolidate Weeks 1-7
- Fix any incomplete deliverables
- Prepare for Phase 2 (advanced features)

---

## 📖 Reading References

**Hardhat Documentation:**
- Deploying: https://hardhat.org/hardhat-runner/docs/guides/deploying
- Networks: https://hardhat.org/hardhat-runner/docs/config#networks-configuration
- Verification: https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify

**Etherscan:**
- Verification Guide: https://docs.etherscan.io/tutorials/verifying-contracts-programmatically
- Contract Interaction: https://docs.etherscan.io/getting-started/viewing-contracts

**Security Resources:**
- Key Management Best Practices: https://consensys.github.io/smart-contract-best-practices/development-recommendations/precautions/
- Deployment Security Checklist: https://github.com/securing/SCSVS

---

## 🧑‍💻 Teaching Notes (for Claude Code)

**Pacing:**
- 30 minutes on concepts
- 2-2.5 hours on deployment activities
- 20 minutes wrap-up and next steps

**Common Student Questions:**
1. **"Can I use the same private key for testnet and mainnet?"** → Yes, but use different keys for security
2. **"Do I need to reverify after redeploying?"** → Yes, each deployment needs verification
3. **"How long does verification take?"** → Usually instant, sometimes 1-2 minutes

**Teaching Emphasis:**
- **Security:** Stress importance of keystore encryption
- **Cost awareness:** Show real gas costs on Etherscan
- **Verification importance:** Explain why unverified contracts are suspicious
- **Best practices:** Emphasize deployment scripts over manual deployment

**Live Demo Tips:**
- Show Etherscan transaction explorer
- Demonstrate MetaMask connection on Etherscan
- Walk through "Read Contract" and "Write Contract" tabs
- Show gas price tracking sites (like ethgasstation.info)

**Common Mistakes:**
- Forgetting to save contract address
- Not waiting for transaction confirmation
- Wrong constructor arguments for verification
- Deploying without sufficient balance

**Connection to Previous Classes:**
- Class 5.1: Using Solidity we learned
- Class 5.2: Deploying contract we built
- Class 5.3: Tests must pass before deployment

**Advanced Topics (if time):**
- Multi-signature deployment for mainnet
- CREATE2 for deterministic addresses
- Proxy patterns for upgradeable contracts (Week 6)
- Deployment via Hardhat Ignition (alternative to scripts)

---

## 🎉 Week 5 Complete!

**Congratulations!** You've completed Week 5 and achieved a major milestone:

**What you built:**
- ✅ Complete understanding of Solidity fundamentals
- ✅ FamilyWallet contract with access control and reentrancy protection
- ✅ 36+ comprehensive tests covering all functionality
- ✅ Deployed and verified contract on public blockchain

**Skills gained:**
- Smart contract development
- Security patterns (OpenZeppelin)
- Testing best practices
- Deployment and verification

**Early Win Achieved:**
You have a **live smart contract** on Sepolia testnet that anyone can interact with! Share the Etherscan link with friends/family to show them your work.

**Portfolio piece:**
This FamilyWallet contract demonstrates junior blockchain developer skills and is portfolio-worthy material.

---

*Course Version: 2.0 (30-week structure)*
*Last Updated: January 2025*
*Part of: FamilyChain Blockchain Development Course*
