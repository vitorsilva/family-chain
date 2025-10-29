# Week 3, Class 3.4: Hardhat Project Exploration
## FamilyChain Course - Learning Guide

---

## 🎯 Overview

**Duration:** 1-2 hours
**Prerequisites:**
- Week 1 complete (Hardhat installed, HelloFamily contract deployed)
- Week 3, Classes 3.1-3.3 complete
- Basic understanding of TypeScript

**What You'll Learn:**
You've been using Hardhat since Week 1, but now it's time to understand HOW it works! In this class, you'll explore the project structure, understand artifacts and cache, learn about Hardhat tasks, and discover powerful plugins.

**Why This Matters:**
Understanding Hardhat's architecture helps you:
- Debug build issues
- Customize your development workflow
- Use plugins effectively
- Write deployment scripts
- Build production-ready smart contract projects

---

## 📚 Learning Objectives

By the end of this class, you will be able to:

1. **Understand** Hardhat project structure (contracts, test, scripts, ignition)
2. **Explain** what artifacts and cache folders contain
3. **Use** Hardhat built-in tasks (`build`, `test`, `node`, `clean`)
4. **Create** custom Hardhat tasks for automation
5. **Explore** the Hardhat config file and network settings
6. **Use** Hardhat plugins to extend functionality
7. **Debug** common Hardhat errors

---

## 📖 Key Concepts

### 1. Hardhat 3 Project Structure

Your `FamilyChain/blockchain/` folder contains:

```
blockchain/
├── contracts/            # Solidity smart contracts
│   ├── HelloFamily.sol  # Your first contract (Week 1)
│   └── Counter.sol      # Example from Hardhat init
├── test/                 # Contract tests (TypeScript + Mocha + Chai)
│   └── Counter.ts
├── scripts/              # Deployment and utility scripts
│   ├── send-op-tx.ts
│   └── week3/           # Your Week 3 CLI tools
├── ignition/            # Hardhat Ignition deployment modules (NEW in Hardhat 3)
│   └── modules/
│       └── Counter.ts
├── artifacts/           # Compiled contract outputs (auto-generated)
│   └── ...
├── cache/               # Hardhat cache (auto-generated)
│   └── ...
├── hardhat.config.ts    # Hardhat configuration
├── package.json         # Node.js dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

### 2. Key Folders Explained

| Folder | Purpose | Git? |
|--------|---------|------|
| `contracts/` | Solidity source files (.sol) | ✅ Commit |
| `test/` | Test files (.ts) | ✅ Commit |
| `scripts/` | Deployment and utility scripts | ✅ Commit |
| `ignition/` | Ignition deployment modules (Hardhat 3) | ✅ Commit |
| `artifacts/` | Compiled contracts (ABI, bytecode) | ❌ .gitignore |
| `cache/` | Hardhat cache for faster compilation | ❌ .gitignore |
| `node_modules/` | npm dependencies | ❌ .gitignore |

**Why not commit artifacts?**
- Generated files (can be rebuilt)
- Large file sizes
- Changes with every build

### 3. Artifacts Deep Dive

When you run `npx hardhat build`, Hardhat creates:

```
artifacts/
└── contracts/
    └── HelloFamily.sol/
        ├── HelloFamily.json       # ABI + bytecode + metadata
        └── HelloFamily.dbg.json   # Debug info
```

**What's in HelloFamily.json?**
```json
{
  "contractName": "HelloFamily",
  "abi": [...],              // Contract interface (functions, events)
  "bytecode": "0x608060...", // Compiled contract code
  "deployedBytecode": "...", // Runtime code (after deployment)
  "linkReferences": {},      // Library dependencies
  "sourceName": "contracts/HelloFamily.sol",
  "compiler": {
    "version": "0.8.28"
  }
}
```

**Why artifacts matter:**
- **ABI** tells your frontend how to interact with the contract
- **Bytecode** is what gets deployed to blockchain
- **Source name** tracks which .sol file it came from

### 4. Hardhat 3 Key Changes (vs Hardhat 2)

| Feature | Hardhat 2 | Hardhat 3 |
|---------|-----------|-----------|
| **Build command** | `compile` | `build` ⚠️ NEW |
| **Config variables** | `process.env.VAR` | `hre.vars.get("VAR")` ⚠️ NEW |
| **Keystore** | No built-in | `npx hardhat keystore` ⚠️ NEW |
| **Ignition** | Separate plugin | Built-in ⚠️ NEW |
| **Tests** | JavaScript OK | TypeScript preferred ⚠️ NEW |
| **Provider type** | `JsonRpcProvider` | `JsonRpcProvider` (different API in ethers v6) |

**⚠️ CRITICAL:** Most online tutorials use Hardhat 2! Commands may not work.

### 5. Hardhat Runtime Environment (HRE)

When you run Hardhat commands or scripts, you get access to `hre`:

```typescript
import hre from "hardhat";

// Available in hre:
hre.ethers         // ethers.js library
hre.network        // Current network info
hre.config         // Config from hardhat.config.ts
hre.vars           // Keystore variables
hre.artifacts      // Access compiled contracts
hre.run("task")    // Run Hardhat tasks
```

**Why HRE matters:** It's the bridge between your scripts and Hardhat's features.

### 6. Hardhat Plugins

Hardhat is extensible via plugins:

**Already installed (from @nomicfoundation/hardhat-toolbox-mocha-ethers):**
- ✅ `@nomicfoundation/hardhat-ethers` - ethers.js integration
- ✅ `@nomicfoundation/hardhat-verify` - Contract verification on Etherscan
- ✅ `@nomicfoundation/hardhat-ignition-ethers` - Deployment framework
- ✅ `hardhat-gas-reporter` - Gas usage reports in tests
- ✅ `solidity-coverage` - Code coverage

**Popular plugins you'll use later:**
- `hardhat-deploy` - Advanced deployment management
- `@typechain/hardhat` - TypeScript types for contracts
- `hardhat-contract-sizer` - Check contract size limits

---

## 🛠️ Hands-On Activities

### Activity 1: Explore Hardhat Tasks

**Goal:** Learn built-in Hardhat commands.

**Step 1:** See all available tasks

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\blockchain
npx hardhat help
```

**Expected Output:**
```
Hardhat version 3.0.8

Usage: hardhat [GLOBAL OPTIONS] <TASK> [TASK OPTIONS]

GLOBAL OPTIONS:

  --config              A Hardhat config file.
  --help                Shows this message.
  --network             The network to connect to.
  --version             Shows hardhat's version.

AVAILABLE TASKS:

  build                 Builds the project's smart contracts
  check                 Check whatever you need
  clean                 Clears the cache and deletes all artifacts
  compile               (deprecated) Use 'build' instead
  console               Opens a hardhat console
  coverage              Generates a code coverage report for tests
  flatten               Flattens and prints contracts and their dependencies
  help                  Prints this message
  ignition              Manage Ignition deployments
  keystore              Manage configuration variables
  node                  Starts a JSON-RPC server on top of Hardhat Network
  run                   Runs a user-defined script after compiling the project
  test                  Runs mocha tests
  typechain             Generate Typechain typings for compiled contracts
  verify                Verifies contract on Etherscan
```

**Step 2:** Get help for a specific task

```powershell
npx hardhat help build
```

**Expected Output:**
```
Hardhat version 3.0.8

Usage: hardhat [GLOBAL OPTIONS] build [--force] [--quiet]

OPTIONS:

  --force       Compile even if sources haven't changed
  --quiet       Don't print compilation output

build: Builds the project's smart contracts
```

**What Just Happened?**
- `npx hardhat help` shows all available tasks
- `npx hardhat help <task>` shows task-specific options

---

### Activity 2: Build and Clean Cycle

**Goal:** Understand the build process.

**Step 1:** Clean existing build

```powershell
npx hardhat clean
```

**Expected Output:**
```
Clearing cache and artifacts...
```

**Step 2:** Verify artifacts are gone

```powershell
ls artifacts
```

**Expected:** Folder should not exist or be empty.

**Step 3:** Build the project

```powershell
npx hardhat build
```

**Expected Output:**
```
Compiled 3 Solidity files successfully (evm target: paris).
```

**Step 4:** Explore the artifacts folder

```powershell
ls artifacts\contracts
```

**Expected Output:**
```
Directory: C:\...\blockchain\artifacts\contracts

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d----          10/29/2025  3:30 PM                Counter.sol
d----          10/29/2025  3:30 PM                HelloFamily.sol
```

**Step 5:** Look inside an artifact

```powershell
cat artifacts\contracts\HelloFamily.sol\HelloFamily.json
```

**Expected:** Large JSON file with ABI, bytecode, etc.

**What Just Happened?**
- `clean` deletes artifacts and cache
- `build` compiles .sol files into artifacts
- Artifacts folder structure mirrors contracts folder

---

### Activity 3: Understand Hardhat Config

**Goal:** Explore your `hardhat.config.ts`.

**Step 1:** Open `hardhat.config.ts` in VS Code

```powershell
code hardhat.config.ts
```

**Your current config:**
```typescript
import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
};

export default config;
```

**Key sections explained:**

**1. Solidity Compiler:**
```typescript
solidity: {
  profiles: {
    default: {
      version: "0.8.28",  // Compiler version
    },
    production: {
      settings: {
        optimizer: {
          enabled: true,  // Optimize for gas
          runs: 200,      // Optimization aggressiveness
        },
      },
    },
  },
},
```

**2. Networks:**
```typescript
networks: {
  sepolia: {
    type: "http",
    url: configVariable("SEPOLIA_RPC_URL"),     // Alchemy RPC
    accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],  // Your wallet
  },
},
```

**3. Plugins:**
```typescript
plugins: [hardhatToolboxMochaEthersPlugin],
```
This single plugin includes: ethers, verify, ignition, gas-reporter, coverage!

**Q: What's `configVariable()`?**
A: Hardhat 3's secure way to access keystore variables (replaces `process.env` from Hardhat 2).

---

### Activity 4: Run Tests

**Goal:** Understand Hardhat's testing framework.

**Step 1:** Run all tests

```powershell
npx hardhat test
```

**Expected Output:**
```
  Counter
    Deployment
      ✔ Should set the right number (245ms)
      ✔ Should allow incrementing (123ms)

  2 passing (2s)
```

**Step 2:** Run specific test file

```powershell
npx hardhat test test\Counter.ts
```

**Step 3:** Explore a test file

```powershell
code test\Counter.ts
```

**Test structure:**
```typescript
import { expect } from "chai";
import hre from "hardhat";

describe("Counter", function () {
  it("Should set the right number", async function () {
    // Deploy contract
    const Counter = await hre.ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();

    // Test expectation
    expect(await counter.number()).to.equal(0);
  });
});
```

**Testing tools:**
- **Mocha:** Test framework (`describe`, `it`)
- **Chai:** Assertions (`expect().to.equal()`)
- **ethers.js:** Deploy and interact with contracts

---

### Activity 5: Create a Custom Hardhat Task

**Goal:** Automate repetitive commands.

**Step 1:** Create `tasks/accounts.ts`

```powershell
mkdir tasks
code tasks\accounts.ts
```

**Step 2:** Write custom task

```typescript
// tasks/accounts.ts
import { task } from "hardhat/config";

task("accounts", "Prints the list of accounts")
  .addOptionalParam("network", "The network to use")
  .setAction(async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    console.log("Available accounts:");
    for (const account of accounts) {
      const address = await account.getAddress();
      const balance = await hre.ethers.provider.getBalance(address);
      console.log(`  ${address} - ${hre.ethers.formatEther(balance)} ETH`);
    }
  });
```

**Step 3:** Import task in `hardhat.config.ts`

Add this line at the TOP of your `hardhat.config.ts`:
```typescript
import "./tasks/accounts";
```

**Step 4:** Run your custom task

```powershell
npx hardhat accounts --network sepolia
```

**Expected Output:**
```
Available accounts:
  0xB09b5449D8BB84312Fbc4293baf122E0e1875736 - 0.048 ETH
```

**What Just Happened?**
- Created a custom Hardhat task
- Used `hre.ethers` to query accounts
- Task is now available in `npx hardhat help`

**Q: When to create custom tasks?**
A: Automate repetitive workflows (deploy, verify, fund accounts, reset testnet, etc.)

---

### Activity 6: Local Hardhat Network

**Goal:** Understand Hardhat's built-in blockchain.

**Step 1:** Start local node

```powershell
npx hardhat node
```

**Expected Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac097356...

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e...

...
```

**Key features:**
- ✅ Local Ethereum blockchain (instant mining)
- ✅ 20 pre-funded accounts (10,000 ETH each)
- ✅ No gas costs
- ✅ Perfect for testing

**Step 2:** In a NEW terminal, deploy to local network

```powershell
# Open new terminal
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\blockchain
npx hardhat ignition deploy ignition\modules\Counter.ts --network localhost
```

**Expected:** Contract deploys instantly (local node mines immediately)

**Step 3:** Stop local node

Go back to first terminal, press `Ctrl+C`

**What Just Happened?**
- Hardhat node runs a local blockchain
- Instant mining (no waiting)
- Perfect for rapid development and testing

**Q: When to use local node vs Sepolia?**
A:
- **Local:** Fast iteration, testing, debugging
- **Sepolia:** Integration testing, share with others, testnet ETH required

---

## 📝 Deliverables

By the end of this class, you should have:

- [x] ✅ Understanding of Hardhat project structure
- [x] ✅ Knowledge of what artifacts and cache contain
- [x] ✅ Ability to use Hardhat tasks (`build`, `clean`, `test`, `node`)
- [x] ✅ Custom Hardhat task created (`tasks/accounts.ts`)
- [x] ✅ Explored `hardhat.config.ts` and network settings
- [x] ✅ Run tests successfully with `npx hardhat test`
- [x] ✅ Understanding of Hardhat 3 vs Hardhat 2 differences

---

## 🐛 Common Issues & Solutions

### Issue 1: "compile" command not found in Hardhat 3

**Error:**
```
Error HH303: The task 'compile' could not be found. Did you mean 'build'?
```

**Cause:** Hardhat 3 renamed `compile` to `build`.

**Solution:**
```powershell
# Hardhat 3 (correct)
npx hardhat build

# Hardhat 2 (deprecated)
npx hardhat compile
```

---

### Issue 2: Tests fail with "Cannot find module"

**Error:**
```
Error: Cannot find module 'hardhat'
```

**Cause:** Running tests from wrong directory.

**Solution:**
Ensure you're in `blockchain/` folder:
```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\blockchain
npx hardhat test
```

---

### Issue 3: Custom task not appearing

**Symptom:** Created custom task, but `npx hardhat help` doesn't show it.

**Cause:** Forgot to import task in `hardhat.config.ts`.

**Solution:**
Add at top of `hardhat.config.ts`:
```typescript
import "./tasks/accounts";
```

Then verify:
```powershell
npx hardhat help
```
Should see your custom task listed.

---

### Issue 4: Artifacts not updating after code change

**Symptom:** Changed contract, but tests still use old version.

**Cause:** Hardhat cache not detecting changes.

**Solution:**
Force rebuild:
```powershell
npx hardhat clean
npx hardhat build
npx hardhat test
```

---

### Issue 5: "Configuration variable not found"

**Error:**
```
HardhatError: Configuration variable 'SEPOLIA_RPC_URL' was not found
```

**Cause:** Keystore variable not set or wrong name.

**Solution:**
Check keystore:
```powershell
npx hardhat keystore list --dev
```

Set if missing:
```powershell
npx hardhat keystore set --dev SEPOLIA_RPC_URL
```

---

## ✅ Self-Assessment Quiz

### 1. What's the difference between `contracts/` and `artifacts/` folders?

<details>
<summary>Answer</summary>

**`contracts/` folder:**
- Contains Solidity source files (.sol)
- Human-readable code you write
- Committed to Git ✅
- Example: `HelloFamily.sol`

**`artifacts/` folder:**
- Contains compiled contract outputs
- Generated by `npx hardhat build`
- NOT committed to Git ❌
- Contains JSON files with ABI and bytecode

**Relationship:**
```
contracts/HelloFamily.sol
    ↓ (compile)
artifacts/contracts/HelloFamily.sol/HelloFamily.json
```

**Why separate?**
- Source code is what you edit
- Artifacts are build outputs (can be regenerated)
- Artifacts are large and change with every build
</details>

---

### 2. What are the three main components in a contract artifact JSON file?

<details>
<summary>Answer</summary>

**Three main components in HelloFamily.json:**

**1. ABI (Application Binary Interface):**
```json
"abi": [
  {
    "type": "function",
    "name": "getGreeting",
    "inputs": [],
    "outputs": [{"type": "string"}]
  },
  ...
]
```
- Contract interface (functions, events, errors)
- Tells frontend how to call functions
- Used by ethers.js/web3.js

**2. Bytecode:**
```json
"bytecode": "0x608060405234801561001057600080fd5f80fd5b50..."
```
- Compiled contract code (constructor + contract code)
- This is what gets deployed to blockchain
- Hexadecimal format

**3. Deployed Bytecode:**
```json
"deployedBytecode": "0x608060405234801561001057..."
```
- Runtime code (after constructor runs)
- What's stored on blockchain after deployment
- Smaller than bytecode (no constructor)

**Other fields:**
- `contractName`, `sourceName`, `compiler`, `linkReferences`, etc.
</details>

---

### 3. What's the difference between `npx hardhat build` and `npx hardhat compile` in Hardhat 3?

<details>
<summary>Answer</summary>

**In Hardhat 3:**
- ✅ `npx hardhat build` - Correct command
- ⚠️ `npx hardhat compile` - Deprecated (still works, but shows warning)

**Hardhat 2 used `compile`, Hardhat 3 uses `build`**

**Why the change?**
Hardhat 3 expanded the build process to include more than just compilation (type generation, optimizations, etc.), so "build" is more accurate.

**Example:**
```powershell
# Hardhat 3 (preferred)
npx hardhat build

# Hardhat 3 (deprecated, shows warning)
npx hardhat compile

# Output:
# Warning: The 'compile' task is deprecated. Use 'build' instead.
```

**⚠️ Most tutorials use Hardhat 2!** If you see `compile` in tutorials, replace with `build`.
</details>

---

### 4. What does the `hardhat.config.ts` file do?

<details>
<summary>Answer</summary>

**`hardhat.config.ts` configures your Hardhat project:**

**1. Solidity Compiler:**
```typescript
solidity: {
  profiles: {
    default: { version: "0.8.28" },
    production: {
      version: "0.8.28",
      settings: { optimizer: { enabled: true, runs: 200 } }
    }
  }
}
```
- Which compiler version to use
- Optimization settings (gas vs code size tradeoff)

**2. Networks:**
```typescript
networks: {
  sepolia: {
    url: configVariable("SEPOLIA_RPC_URL"),
    accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
  },
  localhost: {
    url: "http://127.0.0.1:8545"
  }
}
```
- RPC endpoints for different networks
- Accounts to use for deployment

**3. Plugins:**
```typescript
plugins: [hardhatToolboxMochaEthersPlugin]
```
- Extensions (ethers.js, verify, coverage, etc.)

**4. Paths (optional):**
```typescript
paths: {
  sources: "./contracts",
  tests: "./test",
  artifacts: "./artifacts"
}
```
- Customize folder structure

**Without hardhat.config.ts:** Hardhat wouldn't know how to compile, which networks to connect to, or which plugins to load.
</details>

---

### 5. How do you run tests for a single contract instead of all tests?

<details>
<summary>Answer</summary>

**Run specific test file:**
```powershell
npx hardhat test test\Counter.ts
```

**Run all tests (default):**
```powershell
npx hardhat test
```

**Run tests matching pattern (using grep):**
```powershell
npx hardhat test --grep "Deployment"
```
This runs only tests with "Deployment" in the description.

**Example:**
```typescript
describe("Counter", function () {
  describe("Deployment", function () {  // ← Will match --grep "Deployment"
    it("Should set the right number", async function () {
      // ...
    });
  });

  describe("Incrementing", function () {  // ← Won't match
    it("Should increment", async function () {
      // ...
    });
  });
});
```

**Why run specific tests?**
- ✅ Faster iteration during development
- ✅ Debug specific failing test
- ✅ Test one feature at a time
</details>

---

### 6. What's the Hardhat Runtime Environment (HRE)?

<details>
<summary>Answer</summary>

**HRE (Hardhat Runtime Environment) = Object available in Hardhat scripts and tasks**

**Access via:**
```typescript
import hre from "hardhat";
```

**What's available in `hre`:**

**1. ethers.js:**
```typescript
const accounts = await hre.ethers.getSigners();
const provider = hre.ethers.provider;
const Contract = await hre.ethers.getContractFactory("HelloFamily");
```

**2. Network info:**
```typescript
console.log("Network:", hre.network.name);  // "sepolia", "localhost", etc.
console.log("Chain ID:", await hre.network.provider.send("eth_chainId"));
```

**3. Config:**
```typescript
console.log("Solidity version:", hre.config.solidity.profiles.default.version);
```

**4. Keystore variables:**
```typescript
const apiKey = hre.vars.get("ALCHEMY_API_KEY");
```

**5. Artifacts:**
```typescript
const artifact = await hre.artifacts.readArtifact("HelloFamily");
console.log(artifact.abi);
```

**6. Run tasks:**
```typescript
await hre.run("build");
await hre.run("test");
```

**Why HRE matters:** It's the bridge between your scripts and Hardhat's functionality. Without it, you can't access ethers.js, config, or deployed contracts.

**In tests, HRE is automatically available** (no need to import).
</details>

---

### 7. When should you use local Hardhat node vs Sepolia testnet?

<details>
<summary>Answer</summary>

**Use Local Hardhat Node when:**
- ✅ Rapid development (instant mining)
- ✅ Testing contract logic
- ✅ No testnet ETH needed
- ✅ Debugging (full control over blockchain state)
- ✅ CI/CD pipelines (automated testing)
- ✅ Gas estimation experiments
- ✅ Private development (not public)

**Advantages:**
- Instant mining (no 12-second wait)
- 10,000 ETH per account (unlimited testing)
- Reset blockchain anytime (`ctrl+C`, restart)
- Full blockchain logs in terminal

**Disadvantages:**
- State resets when stopped
- Not a real network (can't share with others)
- No block explorer (Etherscan)

**Use Sepolia Testnet when:**
- ✅ Integration testing (with real network conditions)
- ✅ Testing with external services (oracles, indexers)
- ✅ Sharing deployment with others
- ✅ Testing MEV, front-running scenarios
- ✅ Verifying contracts on Etherscan
- ✅ Testing UI with MetaMask
- ✅ Simulating production environment

**Advantages:**
- Real network conditions (12-second blocks)
- Persistent state (stays deployed)
- Etherscan integration
- Can share with team/users

**Disadvantages:**
- Need testnet ETH (faucets)
- 12-second block time (slower iteration)
- Public blockchain (anyone can see)

**Typical workflow:**
```
1. Develop on local Hardhat node (fast iteration)
2. Test on local Hardhat node (automated tests)
3. Deploy to Sepolia (integration testing)
4. Verify on Etherscan (contract verification)
5. Test with frontend (MetaMask + Sepolia)
6. Deploy to mainnet (production)
```
</details>

---

## 🎯 Key Takeaways

1. **Hardhat 3 uses `build` not `compile`** - Most tutorials use Hardhat 2 syntax

2. **Project structure:** `contracts/` (source), `test/` (tests), `scripts/` (deployment), `artifacts/` (compiled)

3. **Artifacts contain ABI and bytecode** - Frontend needs ABI to interact with contracts

4. **`hardhat.config.ts` configures everything** - Solidity version, networks, plugins

5. **HRE provides access to ethers.js and Hardhat features** - Import with `import hre from "hardhat"`

6. **Custom tasks automate workflows** - Use `task()` API in `tasks/` folder

7. **Local Hardhat node for fast development** - Sepolia for integration testing

8. **Keystore for secure credentials** - `npx hardhat keystore set --dev VARIABLE`

---

## 🔗 Next Steps

**Week 3 Complete!** 🎉

You've mastered:
- ✅ Wallet creation (Class 3.1)
- ✅ Sending transactions (Class 3.2)
- ✅ Querying blockchain data (Class 3.3)
- ✅ Hardhat project structure (Class 3.4)

**Next:** **Week 4: Database Design & Architecture**
- Class 4.1: PostgreSQL Setup and Schema Design
- Class 4.2: Redis Configuration
- Class 4.3: Data Modeling for Financial Systems
- Class 4.4: Database Security and Encryption

**Before Week 4:**
- Complete Week 3 self-assessment (all 4 classes)
- Read Bitcoin Book Chapter 6 (Transactions)
- Read Ethereum Book Chapter 6 (Transactions)
- Ensure all Week 3 scripts are working

---

## 📚 Reading References

**Bitcoin Book:**
- **Chapter 6:** Transactions (Transaction Structure, Inputs and Outputs)

**Ethereum Book:**
- **Chapter 7:** Smart Contracts and Solidity (Compiling Smart Contracts)
- **Chapter 8:** Smart Contracts and Vyper (Testing Smart Contracts)

**Hardhat Documentation:**
- https://hardhat.org/docs/getting-started (Hardhat 3 specific!)
- https://hardhat.org/hardhat-runner/docs/guides/project-setup
- https://hardhat.org/hardhat-runner/docs/guides/typescript

---

## 🧑‍🏫 Teaching Notes (For Claude Code)

**Pacing:**
- 6 activities, ~10-15 minutes each
- Activity 6 (local node) may take longer if user explores

**Version Warnings:**
- Emphasize Hardhat 3 vs 2 differences
- Warn about tutorials using old syntax
- Show `build` vs `compile` repeatedly

**Key Concepts to Emphasize:**
1. **Artifacts = compiled outputs** (not source code)
2. **HRE = bridge to Hardhat features**
3. **Custom tasks = automation**

**Common Student Mistakes:**
1. Running commands from wrong directory (not in `blockchain/`)
2. Forgetting to import custom tasks in config
3. Confusing `compile` (Hardhat 2) with `build` (Hardhat 3)
4. Not understanding artifacts vs source

**Hands-On Emphasis:**
- User must run ALL activities
- Encourage exploration (run `npx hardhat help` many times)
- Show how to debug (`npx hardhat clean` when in doubt)

**Custom Task Activity:**
- Walk through step-by-step
- Explain task API (`.addParam()`, `.setAction()`)
- Show how it appears in `npx hardhat help`

**Local Node:**
- Emphasize instant mining (vs 12-second Sepolia)
- Show how to stop (Ctrl+C)
- Explain when to use local vs testnet

---

*Last Updated: 2025-10-29*
*Course: FamilyChain Blockchain Development*
*Week 3, Class 3.4 of 4 - WEEK 3 COMPLETE!* 🎉
