# Week 1, Class 1.3: Planning Your First Smart Contract
## FamilyChain Course - Learning Guide

---

## 🎯 Overview

**Duration:** 3-4 hours
**Prerequisites:**
- Completed Class 1.1 (environment setup)
- Completed Class 1.2 (blockchain theory)
- Understanding of JavaScript/TypeScript basics

**What You'll Build:**
`HelloFamily.sol` - A simple smart contract that stores a greeting message with owner-only access control.

**Why This Contract?**
It teaches fundamental Solidity concepts you'll use throughout the course:
- State variables
- Constructor
- Functions (public, view)
- Access control
- Events
- Testing patterns
- Deployment workflows

---

## 📚 Learning Objectives

By the end of this class, you will be able to:

1. **Initialize** a Hardhat 3 project with TypeScript
2. **Write** a Solidity smart contract with state and functions
3. **Implement** basic access control (owner-only functions)
4. **Emit** events for tracking state changes
5. **Write** comprehensive tests in TypeScript
6. **Deploy** to Sepolia testnet
7. **Verify** your contract on Etherscan
8. **Understand** the complete development workflow

---

## 📖 Key Concepts

### 1. Hardhat 3 Overview

**What is Hardhat?**
Hardhat is a development framework for Ethereum. It provides:
- Local blockchain for testing
- Solidity compiler
- Testing framework (Mocha + Chai)
- Deployment scripts
- Console for debugging

**⚠️ Hardhat 3 Breaking Changes:**

| Feature | Hardhat 2.x | Hardhat 3.x (We Use This) |
|---------|-------------|---------------------------|
| **Compile command** | `npx hardhat compile` | `npx hardhat build` |
| **Environment variables** | `.env` with dotenv | `npx hardhat keystore` |
| **Test files** | `.js` or `.ts` | Must be `.ts` (TypeScript) |
| **Config variables** | `process.env.VAR` | `configVariable("VAR")` |

**Most tutorials use Hardhat 2!** Always check documentation for v3:
- https://hardhat.org/docs/getting-started

### 2. Solidity Basics

**Solidity File Structure:**
```solidity
// SPDX-License-Identifier: MIT or UNLICENSED
pragma solidity ^0.8.28;

contract ContractName {
    // State variables
    // Events
    // Constructor
    // Functions
}
```

**Key Solidity Concepts:**

| Concept | Explanation | Example |
|---------|-------------|---------|
| **State Variables** | Data stored on blockchain (permanent) | `string public greeting;` |
| **Constructor** | Runs once when contract deployed | `constructor() { owner = msg.sender; }` |
| **Functions** | Actions contract can perform | `function setGreeting() public {}` |
| **Visibility** | Who can call function | `public`, `private`, `internal`, `external` |
| **State Mutability** | Does function change state? | `view` (read-only), `pure` (no state access) |
| **Events** | Log state changes (queryable off-chain) | `event GreetingChanged(string newGreeting);` |
| **Modifiers** | Reusable access control | `modifier onlyOwner() { require(...); _; }` |

**msg.sender:**
Special global variable = address calling the function
```solidity
// If you call this function, msg.sender = your address
function whoAmI() public view returns (address) {
    return msg.sender;
}
```

**require() Statement:**
Validation that reverts transaction if false
```solidity
// Only owner can proceed past this line
require(msg.sender == owner, "Not the owner!");
```

---

## 🛠️ Step-by-Step Implementation

### Step 1: Initialize Hardhat 3 Project (30 minutes)

**1.1: Create Project Folder**

```powershell
# Navigate to your projects directory
cd ~\Documents

# Create FamilyChain folder (if not exists from Class 1.1)
mkdir FamilyChain
cd FamilyChain

# Create blockchain subfolder
mkdir blockchain
cd blockchain
```

**1.2: Initialize npm Project**

```powershell
# Create package.json
npm init -y
```

This creates `package.json`:
```json
{
  "name": "blockchain",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

**1.3: Install Hardhat 3**

```powershell
# Install Hardhat (v3.0.8+)
npm install --save-dev hardhat

# Verify version
npx hardhat --version
```

**Expected output:**
```
3.0.8
```

**1.4: Initialize Hardhat Project**

```powershell
# Start interactive initialization
npx hardhat init
```

**⚠️ IMPORTANT: Choose these options:**
```
? What do you want to do? ›
  Create a JavaScript project
  Create a TypeScript project  ← CHOOSE THIS
  Create a TypeScript project (with Viem)
  Create an empty hardhat.config.js
  Quit

✔ What do you want to do? · Create a TypeScript project
✔ Hardhat project root: · C:\Users\...\blockchain
✔ Do you want to add a .gitignore? (Y/n) · Y
✔ Do you want to install the project's dependencies? (Y/n) · Y
```

**What happens:**
- Installs dependencies (@nomicfoundation/hardhat-toolbox, etc.)
- Creates `hardhat.config.ts`
- Creates `contracts/`, `scripts/`, `test/` folders
- Creates example `Counter.sol` contract
- Creates `.gitignore`

**Expected output:**
```
✅ Project created successfully!

You can now run:
  npx hardhat build
  npx hardhat test
```

**1.5: Test Hardhat Installation**

```powershell
# Build the example Counter.sol contract
npx hardhat build
```

**Expected output:**
```
Building contracts...
Compiled 1 Solidity file successfully (evm target: paris).
```

**Run example tests:**
```powershell
npx hardhat test
```

**Expected output:**
```
  Counter
    ✔ should have initial count of 0
    ✔ should increment count

  2 passing (543ms)
```

**✅ Success Criteria:**
- `npx hardhat build` compiles successfully
- `npx hardhat test` shows 2 passing tests
- Folders exist: `contracts/`, `scripts/`, `test/`, `artifacts/`

---

### Step 2: Write HelloFamily.sol Contract (45 minutes)

**2.1: Create Contract File**

```powershell
# Navigate to contracts folder
cd contracts

# Delete example contract
Remove-Item Counter.sol

# Create HelloFamily.sol
New-Item -Path "HelloFamily.sol" -ItemType File
```

**2.2: Write the Contract**

Open `contracts/HelloFamily.sol` in VS Code:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title HelloFamily
 * @dev Simple contract demonstrating state variables, access control, and events
 */
contract HelloFamily {
    // State variables (stored on blockchain)
    string public greeting;
    address public owner;

    // Events (logged on blockchain, queryable off-chain)
    event GreetingChanged(string newGreeting, address changedBy);

    /**
     * @dev Constructor runs once when contract is deployed
     * @param _greeting Initial greeting message
     */
    constructor(string memory _greeting) {
        greeting = _greeting;
        owner = msg.sender; // Deployer becomes owner
    }

    /**
     * @dev Change the greeting (only owner can call)
     * @param _greeting New greeting message
     */
    function setGreeting(string memory _greeting) public {
        require(msg.sender == owner, "Only owner can set greeting");
        greeting = _greeting;
        emit GreetingChanged(_greeting, msg.sender);
    }

    // Note: greet() function not needed!
    // Public state variables auto-generate getter functions
    // greeting() is automatically available
}
```

**2.3: Understanding the Code**

Let's break down each section:

**License Identifier:**
```solidity
// SPDX-License-Identifier: UNLICENSED
```
- Required by Solidity compiler
- `UNLICENSED` = not open-source
- Alternatives: `MIT`, `GPL-3.0`, etc.

**Pragma:**
```solidity
pragma solidity ^0.8.28;
```
- Specifies compiler version
- `^0.8.28` = version 0.8.28 or compatible newer version
- `0.8.x` has built-in overflow protection (safe math)

**State Variables:**
```solidity
string public greeting;
address public owner;
```
- `string greeting` = stored permanently on blockchain
- `address owner` = Ethereum address (20 bytes)
- `public` = automatically creates getter function
  - You can call `greeting()` and `owner()` from outside

**Events:**
```solidity
event GreetingChanged(string newGreeting, address changedBy);
```
- Events emit logs on blockchain
- Indexed for efficient querying
- Frontend apps can listen to events for real-time updates
- Much cheaper than storing data in state variables

**Constructor:**
```solidity
constructor(string memory _greeting) {
    greeting = _greeting;
    owner = msg.sender;
}
```
- Runs ONCE when contract is deployed
- `memory` = temporary storage (not blockchain storage)
- `msg.sender` = address deploying the contract

**Function:**
```solidity
function setGreeting(string memory _greeting) public {
    require(msg.sender == owner, "Only owner can set greeting");
    greeting = _greeting;
    emit GreetingChanged(_greeting, msg.sender);
}
```
- `public` = anyone can call, but `require` checks ownership
- `require()` = validation, reverts transaction if false
- `emit` = log the event

**Memory vs Storage vs Calldata:**

| Location | Use | Cost | Persists? |
|----------|-----|------|-----------|
| `storage` | State variables | Expensive | Yes (on blockchain) |
| `memory` | Function parameters, local vars | Moderate | No (cleared after function) |
| `calldata` | Read-only function parameters | Cheap | No |

**2.4: Compile the Contract**

```powershell
# Return to blockchain folder
cd ..

# Build contract
npx hardhat build
```

**Expected output:**
```
Building contracts...
Compiled 1 Solidity file successfully (evm target: paris).
```

**If errors occur:**
- Check for typos in Solidity code
- Ensure pragma matches: `^0.8.28`
- Verify file is saved

**What happens when you build:**
1. Hardhat compiles `HelloFamily.sol` to bytecode
2. Creates `artifacts/contracts/HelloFamily.sol/HelloFamily.json`
3. Contains:
   - Bytecode (deployed to blockchain)
   - ABI (Application Binary Interface - how to interact with contract)

**✅ Success Criteria:**
- No compilation errors
- `artifacts/` folder created
- `HelloFamily.json` exists in artifacts

---

### Step 3: Write Tests (60 minutes)

**Why Test?**
- Catch bugs before deploying to mainnet (saves $$$)
- Document how contract should behave
- Ensure changes don't break existing functionality

**3.1: Create Test File**

```powershell
# Delete example test
Remove-Item test\Counter.ts

# Create HelloFamily test
New-Item -Path "test\HelloFamily.test.ts" -ItemType File
```

**⚠️ Important:** Must be `.ts` (TypeScript), not `.js`!

**3.2: Write Comprehensive Tests**

Open `test/HelloFamily.test.ts`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { HelloFamily } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("HelloFamily", function () {
  let helloFamily: HelloFamily;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  // Runs before each test
  beforeEach(async function () {
    // Get test accounts from Hardhat
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract
    const HelloFamilyFactory = await ethers.getContractFactory("HelloFamily");
    helloFamily = await HelloFamilyFactory.deploy("Hello, Family!");
  });

  describe("Deployment", function () {
    it("Should set the correct initial greeting", async function () {
      expect(await helloFamily.greeting()).to.equal("Hello, Family!");
    });

    it("Should set the deployer as owner", async function () {
      expect(await helloFamily.owner()).to.equal(owner.address);
    });
  });

  describe("setGreeting", function () {
    it("Should allow owner to change greeting", async function () {
      await helloFamily.setGreeting("New greeting");
      expect(await helloFamily.greeting()).to.equal("New greeting");
    });

    it("Should emit GreetingChanged event", async function () {
      await expect(helloFamily.setGreeting("New greeting"))
        .to.emit(helloFamily, "GreetingChanged")
        .withArgs("New greeting", owner.address);
    });

    it("Should revert when non-owner tries to change greeting", async function () {
      // addr1 tries to change greeting (should fail)
      await expect(
        helloFamily.connect(addr1).setGreeting("Hacked!")
      ).to.be.revertedWith("Only owner can set greeting");
    });
  });
});
```

**3.3: Understanding the Test Code**

**Imports:**
```typescript
import { expect } from "chai";           // Assertion library
import { ethers } from "hardhat";        // Hardhat's ethers.js wrapper
import { HelloFamily } from "../typechain-types";  // Generated types
```

**Test Signers (Accounts):**
```typescript
[owner, addr1, addr2] = await ethers.getSigners();
```
- Hardhat provides ~20 test accounts with 10,000 ETH each
- `owner` = first account (deploys contract)
- `addr1`, `addr2` = other accounts for testing access control

**Deploy Contract:**
```typescript
const HelloFamilyFactory = await ethers.getContractFactory("HelloFamily");
helloFamily = await HelloFamilyFactory.deploy("Hello, Family!");
```
- `getContractFactory()` = factory for creating contract instances
- `deploy()` = deploys to Hardhat's in-memory blockchain
- Constructor parameter: `"Hello, Family!"`

**Test Structure:**
```typescript
describe("HelloFamily", function () {
  describe("Deployment", function () {
    it("Should set the correct initial greeting", async function () {
      expect(await helloFamily.greeting()).to.equal("Hello, Family!");
    });
  });
});
```
- `describe()` = test suite (group of tests)
- `it()` = individual test
- `expect()` = assertion

**Testing Access Control:**
```typescript
await expect(
  helloFamily.connect(addr1).setGreeting("Hacked!")
).to.be.revertedWith("Only owner can set greeting");
```
- `.connect(addr1)` = call function as `addr1` (not owner)
- `.to.be.revertedWith()` = expect transaction to fail with message

**Testing Events:**
```typescript
await expect(helloFamily.setGreeting("New greeting"))
  .to.emit(helloFamily, "GreetingChanged")
  .withArgs("New greeting", owner.address);
```
- `.to.emit()` = expect event to be emitted
- `.withArgs()` = verify event parameters

**3.4: Run Tests**

```powershell
npx hardhat test
```

**Expected output:**
```
  HelloFamily
    Deployment
      ✔ Should set the correct initial greeting (543ms)
      ✔ Should set the deployer as owner
    setGreeting
      ✔ Should allow owner to change greeting
      ✔ Should emit GreetingChanged event
      ✔ Should revert when non-owner tries to change greeting

  5 passing (1.2s)
```

**If tests fail:**
- Read error message carefully
- Check contract code matches test expectations
- Verify test file is `.ts`, not `.js`
- Ensure contract compiled successfully

**✅ Success Criteria:**
- All 5 tests passing
- Each test completes in <1 second
- No warnings or errors

---

### Step 4: Deployment to Sepolia Testnet (60 minutes)

**4.1: Get Sepolia Testnet ETH**

You need ETH to pay for deployment gas fees.

**Option 1: Google Cloud POW Faucet (Recommended)**
```
1. Go to: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
2. Enter your wallet address
3. Complete proof-of-work puzzle (takes 2-5 minutes)
4. Receive 0.05 ETH
```

**Option 2: Alchemy Faucet**
```
1. Go to: https://sepoliafaucet.com/
2. Requires 0.001 mainnet ETH on your address (prevents spam)
3. Receive 0.5 ETH
```

**Option 3: Infura Faucet**
```
1. Go to: https://www.infura.io/faucet/sepolia
2. Requires MetaMask wallet (we'll set up in Week 6)
3. Receive 0.5 ETH
```

**Verify ETH Receipt:**
```powershell
# Check balance (replace with your address)
node -e "const ethers = require('ethers'); const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com'); provider.getBalance('YOUR_ADDRESS').then(b => console.log(ethers.formatEther(b) + ' ETH'));"
```

**4.2: Create Wallet for Testing**

**⚠️ SECURITY: Never use mainnet wallet for testnet!**

Create a testnet-only wallet:

```powershell
# Generate new wallet
node -e "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey); console.log('Mnemonic:', wallet.mnemonic.phrase);"
```

**Expected output:**
```
Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEB3
Private Key: 0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318
Mnemonic: witch collapse practice feed shame open despair creek road again ice least
```

**⚠️ IMPORTANT:**
1. **Write down mnemonic on paper** (backup)
2. **Never share private key** (like your password + your money)
3. **Only use for testnet** (never put real ETH here)

**4.3: Configure Hardhat with Keystore**

Hardhat 3 uses **encrypted keystore** instead of `.env` files (more secure).

**Set private key:**
```powershell
# Set private key (replace with your generated key)
npx hardhat keystore set --dev SEPOLIA_PRIVATE_KEY
```

**Prompt:**
```
Enter a value: [paste your private key]
```

**Set RPC URL:**
```powershell
# Set Sepolia RPC endpoint
npx hardhat keystore set --dev SEPOLIA_RPC_URL
```

**Prompt:**
```
Enter a value: https://ethereum-sepolia-rpc.publicnode.com
```

**If you need to update later:**
```powershell
# Use --force flag to overwrite
npx hardhat keystore set --dev --force SEPOLIA_PRIVATE_KEY
```

**List stored variables:**
```powershell
npx hardhat keystore list
```

**Expected output:**
```
SEPOLIA_PRIVATE_KEY
SEPOLIA_RPC_URL
```

**4.4: Configure hardhat.config.ts**

Edit `hardhat.config.ts`:

```typescript
import { HardhatUserConfig, configVariable } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")]
    }
  }
};

export default config;
```

**Key changes:**
- Import `configVariable` from "hardhat/config"
- Add `networks.sepolia` configuration
- Use `configVariable()` to read keystore values (NOT `process.env`)

**4.5: Create Deployment Script**

Create `scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying HelloFamily contract...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy contract
  const HelloFamilyFactory = await ethers.getContractFactory("HelloFamily");
  const helloFamily = await HelloFamilyFactory.deploy("Hello, Family!");

  // Wait for deployment to complete
  await helloFamily.waitForDeployment();

  const address = await helloFamily.getAddress();
  console.log("HelloFamily deployed to:", address);
  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network sepolia ${address} "Hello, Family!"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**4.6: Deploy to Sepolia**

```powershell
# Deploy (make sure you have testnet ETH first!)
npx hardhat run scripts/deploy.ts --network sepolia
```

**Expected output:**
```
Deploying HelloFamily contract...
Deploying with account: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEB3
Account balance: 0.05 ETH
HelloFamily deployed to: 0x21581Db891aAb5cB99d6002Aaa83C6c480960267

Verify with:
npx hardhat verify --network sepolia 0x21581Db891aAb5cB99d6002Aaa83C6c480960267 "Hello, Family!"
```

**🎉 Congratulations! Your first smart contract is live on a public blockchain!**

**4.7: View on Etherscan**

Open in browser:
```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

You can see:
- Contract bytecode
- Deployment transaction
- Current state (but can't read easily without verification)

**✅ Success Criteria:**
- Deployment succeeds without errors
- Contract address returned
- Contract visible on Sepolia Etherscan
- ETH balance decreased (gas fees paid)

---

### Step 5: Contract Verification (Optional - 20 minutes)

**Why Verify?**
Verification uploads source code to Etherscan so anyone can:
- Read contract code
- Interact with contract via UI
- Verify it matches the deployed bytecode

**5.1: Get Etherscan API Key**

1. Go to: https://etherscan.io/register
2. Create account
3. Go to: https://etherscan.io/myapikey
4. Create new API key

**5.2: Add API Key to Keystore**

```powershell
npx hardhat keystore set --dev ETHERSCAN_API_KEY
```

Enter your API key when prompted.

**5.3: Update hardhat.config.ts**

Add etherscan configuration:

```typescript
import { HardhatUserConfig, configVariable } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")]
    }
  },
  etherscan: {
    apiKey: configVariable("ETHERSCAN_API_KEY")
  }
};

export default config;
```

**5.4: Verify Contract**

```powershell
# Verify (replace with your contract address and constructor arg)
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS "Hello, Family!"
```

**Expected output:**
```
Successfully verified contract HelloFamily on Etherscan.
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS#code
```

**Now on Etherscan you can:**
- Read Contract tab: Call `greeting()` and `owner()`
- Write Contract tab: Call `setGreeting()` (requires connecting wallet)

---

## 🎯 Deliverables

By completing this class, you should have:

1. ✅ **Hardhat 3 project initialized** with TypeScript
2. ✅ **HelloFamily.sol contract** written and compiled
3. ✅ **5 passing tests** in `HelloFamily.test.ts`
4. ✅ **Deployment script** in `scripts/deploy.ts`
5. ✅ **Testnet wallet** created with private key secured
6. ✅ **Contract deployed to Sepolia** testnet
7. ✅ **Contract address** recorded
8. ✅ **(Optional) Contract verified** on Etherscan

**📁 Project Structure:**
```
blockchain/
├── contracts/
│   └── HelloFamily.sol
├── scripts/
│   └── deploy.ts
├── test/
│   └── HelloFamily.test.ts
├── hardhat.config.ts
├── package.json
└── .gitignore
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Error: Invalid private key"

**Problem:** Private key format incorrect
**Solution:**
- Ensure private key starts with `0x`
- Should be 66 characters (0x + 64 hex digits)
- No spaces or extra characters

### Issue 2: "Insufficient funds for gas"

**Problem:** Not enough testnet ETH
**Solution:**
- Check balance: `npx hardhat console --network sepolia` then `await ethers.provider.getBalance("YOUR_ADDRESS")`
- Get more from faucets
- Deployment costs ~0.001-0.005 ETH

### Issue 3: "Test files must be .ts"

**Problem:** Created test as `.js` file
**Solution:**
- Rename to `.ts`
- Ensure TypeScript types imported

### Issue 4: "Connection refused" during deployment

**Problem:** RPC endpoint down or incorrect
**Solution:**
- Try different RPC: `https://rpc.sepolia.org`
- Or: `https://ethereum-sepolia-rpc.publicnode.com`
- Check https://chainlist.org/ for more options

### Issue 5: "Nonce too low"

**Problem:** Transaction nonce conflict
**Solution:**
```powershell
# Reset account in Hardhat
npx hardhat clean
# Try deployment again
```

---

## ✅ Self-Assessment Quiz

1. **What does the constructor do?**
   <details>
   <summary>Answer</summary>
   Runs once when contract is deployed. Sets initial state (greeting and owner).
   </details>

2. **Why do we use `require()` in setGreeting?**
   <details>
   <summary>Answer</summary>
   To enforce access control. Only the owner can change the greeting. If non-owner calls, transaction reverts.
   </details>

3. **What's the difference between `view` and regular functions?**
   <details>
   <summary>Answer</summary>
   `view` functions only read state (don't modify). They're free to call and don't require transactions.
   </details>

4. **Why emit events?**
   <details>
   <summary>Answer</summary>
   Events log state changes on blockchain. Frontend apps can listen for events. Much cheaper than storing data in state variables.
   </details>

5. **What does `.connect(addr1)` do in tests?**
   <details>
   <summary>Answer</summary>
   Changes who's calling the function. Used to test access control (non-owner trying to call restricted functions).
   </details>

6. **Why use keystore instead of .env?**
   <details>
   <summary>Answer</summary>
   Keystore encrypts secrets on disk. More secure than plaintext .env files. Hardhat 3 recommended approach.
   </details>

---

## 🎓 Key Takeaways

1. **Hardhat 3 uses `build` not `compile`**
2. **Constructor runs once at deployment**
3. **`msg.sender` = address calling function**
4. **`require()` = validation that reverts if false**
5. **Events are cheap, storage is expensive**
6. **Test before deploying to mainnet (saves $$$)**
7. **Testnet first, always**

---

## 📝 Next Steps

**Week 1 Complete! 🎉**

You've achieved the Week 1 Early Win:
- ✅ Written your first smart contract
- ✅ Deployed to public blockchain
- ✅ Contract live on Sepolia testnet

**Before Week 2:**
- [ ] Complete Week 1 reading (Bitcoin Book Ch 1-2, Ethereum Book Ch 1-2)
- [ ] Review these notes
- [ ] Experiment: Try changing greeting text and redeploying
- [ ] Optional: Verify your contract on Etherscan

**In Week 2:**
- Install and run Geth (Ethereum client)
- Sync to Sepolia testnet
- Monitor sync progress
- Understand node operations

---

## 💡 Teaching Notes (for Claude Code)

When helping with this class:

1. **Emphasize testing** - Tests catch bugs before costly mainnet deployment
2. **Security mindset** - Never use mainnet wallet for testnet
3. **Keystore over .env** - Teach secure practices from start
4. **Let user write code** - Don't just copy-paste, understand each line
5. **Celebrate deployment** - First contract is a big milestone!
6. **Troubleshoot patiently** - Deployment issues are common

---

**Class 1.3 Complete! 🚀**

Your first smart contract is live on Ethereum Sepolia testnet. You've completed the full development workflow from writing code to deployment!

**Estimated Time:** 3-4 hours
**Actual Time:** _____ (fill this in when done)

---

*Last Updated: 2025-10-22*
*FamilyChain Course - Week 1, Class 1.3*
