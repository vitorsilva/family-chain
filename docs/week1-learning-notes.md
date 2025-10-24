# Week 1 Learning Notes
## Environment Setup & Blockchain Theory & First Smart Contract

**Week Duration:** 2025-10-21 to 2025-10-24
**Status:** ✅ FULLY COMPLETE (including self-assessment)

---

## Session: 2025-10-21

### Week 1 Progress - Environment Setup and First Smart Contract

**Q10: Starting Week 1 of FamilyChain Course** 🚀 **COURSE START**
- **Context:** Beginning the 30-week FamilyChain blockchain development course
- **Learning Style Documented:** Added teaching approach to CLAUDE.md
  - Hands-on learner (developer background)
  - Self-directed execution (user runs commands, Claude guides)
  - Interactive dialogue (questions welcomed)
  - Using PowerShell on Windows
  - Using VS Code with extensions
  - Active recall for basic commands (sparingly)

**Classes Completed:**

✅ **Class 1.1: Environment Setup**
- Git 2.38.1 ✅
- Node.js v22.14.0 ✅
- npm 11.6.2 ✅
- VS Code extensions configured (Solidity, Hardhat Solidity, Prettier, ESLint)
- Created `.vscode/extensions.json` for project recommendations

✅ **Class 1.2: Blockchain Architecture Theory**
- Learned blockchain fundamentals (blocks, chains, consensus)
- Bitcoin vs Ethereum differences
- Gas mechanism and purpose
- Wallets and cryptographic keys
- Smart contracts vs traditional applications
- DeFi basics (Uniswap, staking, multi-sig, DAOs)
- Testnets vs mainnet
- **User demonstrated strong comprehension** - explained gas, immutability, and Bitcoin vs Ethereum correctly

✅ **Class 1.3: Plan First Smart Contract**
- Created `blockchain/` folder structure
- Initialized npm project
- **Wrote HelloFamily.sol contract independently!**
  - State variables: `greeting`, `owner`
  - Constructor with initial greeting
  - Access control using `require()`
  - `view` function for reading greeting
  - Event emission for `GreetingChanged`
  - Code quality: Production-ready for first contract!

**HelloFamily.sol Code (Written by User):**
```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract HelloFamily {
  string public greeting;
  address public owner;

  event GreetingChanged(string newGreeting, address changedBy);

  constructor(string memory _greeting) {
    greeting = _greeting;
    owner = msg.sender;
  }

  function setGreeting(string memory _greeting) public {
    require(msg.sender == owner, "Only the owner can set the greeting");
    greeting = _greeting;
    emit GreetingChanged(_greeting, msg.sender);
  }

  function greet() public view returns (string memory) {
    return greeting;
  }
}
```

**Technical Issue Encountered:**
- **Problem:** Hardhat 3 Beta has compatibility issues with Node.js 22 on Windows
  - Error: `ERR_DLOPEN_FAILED` when running `npx hardhat compile`
  - Native module (`edr.win32-x64-msvc.node`) failed to load
- **Decision:** Switch to Hardhat 2.22.0 (stable, production-ready)
- **Rationale:**
  - Hardhat 3 is beta (rough edges expected)
  - Learning fundamentals (Hardhat 2 vs 3 differences don't matter)
  - All tutorials/documentation use Hardhat 2
  - Can upgrade to Hardhat 3 later when stable

**Current Status:**
- About to delete `blockchain/` folder and restart with Hardhat 2
- HelloFamily.sol code saved above (will recreate after Hardhat 2 setup)
- Need to close VS Code to release file locks on `node_modules`

**Next Steps (When Resuming):**
1. Delete `blockchain/` folder via File Explorer (VS Code closed)
2. Recreate `blockchain/` folder
3. Initialize npm project
4. Install Hardhat 2.22.0
5. Run `npx hardhat init` (choose TypeScript + Mocha + Ethers.js)
6. Recreate `HelloFamily.sol` contract
7. Compile with `npx hardhat compile`
8. Write tests for HelloFamily
9. Deploy to Sepolia testnet (Week 1 Early Win!)

**Key Learnings:**
- User learns best by doing and asking questions
- Successfully wrote first smart contract independently
- Understood Solidity concepts (state, functions, events, access control)
- Encountered real-world development issue (version compatibility)
- Made pragmatic decision (stable vs bleeding-edge)

---

## Session: 2025-10-22

### Week 1 Completion - Hardhat 3 Success & First Deployment

**Q11: Completing Week 1 with Hardhat 3** 🚀 **WEEK 1 COMPLETE**

**Context:** Resumed Week 1 after previous Hardhat 3 compatibility issues

**Decision: Successfully switched to Hardhat 3**
- **Previous Issue:** Hardhat 3 Beta had native module loading errors on Windows with Node.js 22
- **Resolution:** Issue resolved - Hardhat 3 now works perfectly
- **Key Learning:** Hardhat 3 uses `npx hardhat build` (not `compile`)
- **Root Cause Identified:** User discovered the command difference in documentation

**Hardhat 3 Setup Completed:**
- Installed Hardhat 3 via `npx hardhat --init`
- Chose TypeScript + Mocha testing setup
- Example contracts (Counter.sol) compiled and tested successfully
- Both Solidity tests and Mocha tests working

**HelloFamily.sol Contract (Recreated from memory):**
```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract HelloFamily {
    string public greeting;
    address public owner;

    event GreetingChanged(string newGreeting, address changedBy);

    constructor(string memory _greeting) {
        greeting = _greeting;
        owner = msg.sender;
    }

    function setGreeting(string memory _greeting) public {
        require(msg.sender == owner, "Only owner can set greeting");
        greeting = _greeting;
        emit GreetingChanged(_greeting, msg.sender);
    }
}
```

**Key Improvements Made:**
- Removed redundant getter functions (public variables auto-generate getters)
- Added `address changedBy` to GreetingChanged event for better tracking

**Testing Framework - TypeScript Required:**
- **Discovery:** Tests must be written in TypeScript (.ts), not JavaScript (.js)
- Created `test/HelloFamily.ts` with comprehensive test suite
- All 5 tests passing:
  1. ✅ Should return the correct greeting message
  2. ✅ Owner is set correctly
  3. ✅ Owner can change the greeting
  4. ✅ Non-owner CANNOT change the greeting
  5. ✅ Event is emitted when greeting changes

**Key Testing Concepts Learned:**
- **ethers.getContractFactory()**: Factory pattern for contract deployment
- **HelloFamily.deploy()**: Creates new contract instance on blockchain
- **Hardhat's test blockchain**: Temporary in-memory blockchain for tests
- **await pattern**: All blockchain operations are async (view and transactions)
- **ethers.getSigners()**: Hardhat provides ~20 pre-made test accounts
- **Default signer**: Hardhat uses first signer (account 0) for deployment by default
- **.connect(account)**: Specifies which account calls a function
- **View functions vs Transactions**: Reading is free/fast, writing costs gas/takes time
- **Testing access control**: Using multiple signers to test authorization

**User Understanding Highlights:**
- Connected factory pattern to previous knowledge
- Understood ethers as "bridge between JavaScript and blockchain"
- Grasped async/await necessity for blockchain interactions
- Questioned redundant getters (public variables) - excellent attention to detail
- Debugged test file extension issue independently (.js → .ts)
- Asked security-critical questions about wallet safety

**Deployment to Sepolia Testnet:**

**Deployment Script Created:**
- `scripts/deploy.ts` with deployment logic
- Prints deployed contract address for Etherscan verification

**Wallet Security Setup:**
- Generated new testnet-only wallet via ethers.Wallet.createRandom()
- **Security awareness:** User asked about wallet safety before proceeding
- Explained private key security (never share, can't be changed)
- Created `.env.example` for documentation (professional best practice - user's idea!)
- Added `.env` to `.gitignore` (user proactively secured secrets)

**Hardhat 3 Configuration Variables:**
- **Discovery:** Hardhat 3 uses `configVariable()` instead of dotenv
- **User found solution:** Read Hardhat docs, discovered `keystore` command
- Used `npx hardhat keystore set --dev SEPOLIA_PRIVATE_KEY`
- Used `npx hardhat keystore set --dev --force SEPOLIA_RPC_URL`
- **More secure than .env:** Encrypted storage on local machine
- Deleted `.env` file (not needed with keystore)
- Updated `.env.example` to document keystore approach

**Getting Testnet ETH:**
- Tried Alchemy faucet (requires 0.001 mainnet ETH - blocked)
- Tried Infura faucet (requires MetaMask - deferred for Week 6)
- **Success:** Used Google Cloud POW faucet (proof-of-work)
- Verified receipt on Etherscan transaction explorer
- Checked balance via ethers JSON-RPC provider

**RPC Provider Issues:**
- `rpc.sepolia.org` returned 522 error (server down)
- Switched to `https://ethereum-sepolia-rpc.publicnode.com` (working)

**Deployment Success! 🎉**
- **Contract Address:** `0x21581Db891aAb5cB99d6002Aaa83C6c480960267`
- **Network:** Sepolia Testnet
- **Deployment Command:** `npx hardhat run scripts/deploy.ts --network sepolia`
- **Result:** Live smart contract on public blockchain!
- **Etherscan:** https://sepolia.etherscan.io/address/0x21581Db891aAb5cB99d6002Aaa83C6c480960267

**Contract Verification:**
- Attempted to interact with contract on Etherscan
- **Discovery:** "Read Contract" tab requires verification
- Verification uploads source code to Etherscan for readable interface
- **Decision:** Deferred contract verification to future session

**Week 1 Achievements:**
✅ Development environment setup (Git, Node.js, VS Code, Hardhat 3)
✅ Blockchain theory fundamentals understood
✅ Hardhat 3 project initialized with TypeScript
✅ HelloFamily.sol smart contract written from memory
✅ Comprehensive test suite (5 tests, all passing)
✅ Secure wallet management (keystore approach)
✅ Testnet ETH acquired via POW faucet
✅ Deployed to Sepolia testnet successfully
✅ **Week 1 Early Win Achieved!** 🚀

**Technical Skills Demonstrated:**
- Independent problem-solving (found keystore command in docs)
- Security-conscious development (wallet safety, .gitignore, .env.example)
- Debugging (test file extension, RPC provider issues)
- Reading documentation (Hardhat 3 docs, faucet research)
- Professional best practices (.env.example, source control)
- Active learning (questioning, explaining concepts back)

**Key Technical Decisions:**
1. **Hardhat 3 over Hardhat 2:** Bleeding-edge but now stable
2. **TypeScript for tests:** Required by Hardhat 3 setup
3. **Keystore over .env:** More secure, Hardhat 3 recommended approach
4. **Public RPC provider:** Good for learning, will use Infura/Alchemy later
5. **POW faucet:** Most reliable free option for testnet ETH

**Next Steps (Before Week 2):**
- 📖 **COMPLETE WEEK 1 READING** (User will do this before next session):
  - Bitcoin Book: Chapter 1 (Introduction), Chapter 2 (How Bitcoin Works - Bitcoin Overview)
  - Ethereum Book: Chapter 1 (What Is Ethereum), Chapter 2 (Intro)
  - ⚠️ **REMINDER FOR NEXT SESSION: Ask if reading was completed!**

**Next Steps (Week 2):**
- Install and run Geth (Ethereum client)
- Sync to Sepolia testnet
- Understand node operations and monitoring
- Get more testnet ETH from faucets
- Learn about RPC endpoints and JSON-RPC

**Questions to Explore Later:**
- [ ] How to verify contracts on Etherscan (programmatically)
- [ ] Should we use Infura/Alchemy for production RPC (instead of public nodes)?
- [ ] When to introduce MetaMask (currently planned for Week 6)

**Documentation Updates (Post-Session):**
- **Issue Identified:** Documentation was referencing outdated Hardhat 2.x commands and patterns
- **User Feedback:** "Make sure to always look up the documentation whose version is more similar to the one we are using"
- **Actions Taken:**
  - Updated CLAUDE.md with exact tool versions (Node.js v22.14.0, Hardhat 3.0.8, ethers.js 6.15.0, etc.)
  - Added "Current Project Versions" section with documentation links
  - Fixed all Hardhat commands (`build` not `compile`, `keystore` not `.env`)
  - Updated COURSE_PLAN.md with version requirements and breaking changes
  - Added comprehensive "Tool Versions & Documentation" table
  - Highlighted Hardhat 3 breaking changes with ⚠️ warnings
- **Result:** Documentation now accurately reflects Hardhat 3.0.8 + ethers.js v6 + TypeScript workflow

---

## Session: 2025-10-24

### Week 1 Self-Assessment Completion

**Q12: Completing Week 1 Self-Assessment** ✅ **WEEK 1 FULLY COMPLETE**

**Context:** Completed interactive self-assessment for all Week 1 classes before starting Week 2

**Self-Assessment Results:**

✅ **Class 1.1 (Environment Setup):**
- ✅ Explained Git as distributed version control (vs manual file versioning)
- ✅ Distinguished Node.js (runtime) from npm (package manager)
- ✅ Understood version compatibility importance (especially Hardhat 3 breaking changes)

✅ **Class 1.2 (Blockchain Theory):**
- ✅ Explained blockchain architecture (blocks linked by previous block hash)
- ✅ Understood blocks contain transactions (first = mining reward, others = transfers)
- ✅ Noted UTXOs (Bitcoin) vs accounts (Ethereum) difference
- ✅ Identified key Bitcoin vs Ethereum differences:
  - Bitcoin: Value transfer only
  - Ethereum: Programmable blockchain with EVM and smart contracts
  - Account-based model vs UTXO model
- ✅ Explained gas dual purpose:
  - Economic incentive for miners/validators
  - Security mechanism (prevents infinite loops, DoS attacks)
  - Failed transactions still consume gas (computation happened)
- ✅ Understood private key security (lose key = lose funds forever, no recovery)

✅ **Class 1.3 (First Smart Contract):**
- ⚠️ Initially unsure about constructor (learning moment)
- ✅ After clarification: Constructor runs ONCE at deployment, sets initial state
- ✅ Explained `require()` as guard condition for access control (reverts on failure)
- ✅ Distinguished `view` functions (read-only, free from frontend) from regular functions (modify state, cost gas)
- ✅ Understood events purpose:
  - Frontend notifications (real-time UI updates)
  - Backend monitoring (trigger actions)
  - Cheap logging (vs storage in state)
  - Transaction history (queryable on blockchain)

**Deliverables Verified:**
- ✅ All tools installed (Git 2.38.1, Node.js v22.14.0, npm 11.6.2, VS Code, Hardhat 3.0.8)
- ✅ HelloFamily.sol deployed to Sepolia: `0x21581Db891aAb5cB99d6002Aaa83C6c480960267`
- ✅ All 5 tests passing (deployment, access control, events)
- ✅ Contract address recorded and verified on Etherscan

**Reading Completed:**
- ✅ Bitcoin Book: Chapters 1-2 (completed 2025-10-22)
- ✅ Ethereum Book: Chapters 1-2 (completed 2025-10-22)

**Week 1 Status: FULLY COMPLETE** 🎉
- All classes completed
- All deliverables achieved
- All reading finished
- Self-assessment passed
- Ready for Week 2!

**Key Learning Insights:**
- User has solid understanding of blockchain fundamentals
- Strong conceptual grasp (gas, immutability, consensus)
- Good security awareness (private key importance)
- One minor gap (constructor) immediately clarified
- Interactive self-assessment helped solidify learning

**Next Session:**
- Start Week 2: Running Your First Ethereum Node
- Class 2.1: Installing and Configuring Geth

---

*Last Updated: 2025-10-24*
