# Week 3 Learning Notes
## Command Line Blockchain Interactions

**Week Duration:** 2025-10-30 (in progress)
**Status:** 🔄 Class 3.1 Complete | Classes 3.2-3.4 Pending

---

## Session: 2025-10-30

### Week 3, Class 3.1: Creating Wallets via CLI - COMPLETE ✅

**Context:** Starting Week 3 after completing Week 2 (Running Ethereum Node, hybrid RPC approach with Alchemy)

**Duration:** ~1.5 hours

---

#### Pre-Class: Reading Confirmation

**Week 2 Reading Completed:** ✅
- Bitcoin Book: Chapter 3 (Bitcoin Core - Running a Node)
- Ethereum Book: Chapter 3 (Clients - Running an Ethereum Client)

---

#### Understanding Check: Private Keys

**User's understanding of private keys:**
- ✅ Private key encrypts messages
- ✅ Public key derived from private key
- ✅ Public key decrypts messages encrypted with private key
- ✅ Private key should be kept hidden/secret

**Refinement provided:**
- In Ethereum, private keys primarily used for **signing transactions** (not encrypting messages)
- Flow: Private Key → Public Key → Address
- Private key proves ownership and authorizes transactions

---

#### Activity 1: Generate Random Wallet

**File created:** `scripts/week3/create-wallet.ts`

**Key concepts learned:**
- `ethers.Wallet.createRandom()` generates new wallet locally (no blockchain connection needed)
- Every wallet has 3 components:
  - **Mnemonic Phrase** (12 words) - Human-readable backup
  - **Private Key** (64 hex characters) - The actual secret derived from mnemonic
  - **Address** (40 hex characters) - Public account number

**Sample output:**
```
Address: 0x0575DECc2A985F62FF3699dbe1C18d264B9580B9
Private Key: 0x5e81cc318f8873dcb31d7af250348c7e3030170ebedfd574814e89bc84c7dbc6
Mnemonic: enemy build tired soup nuclear company dawn garbage unfair gift target seat
```

**User insight:** Can't reverse engineer private key from address (one-way cryptography)

---

#### Activity 2: Recover Wallet from Mnemonic

**File created:** `scripts/week3/wallet-from-mnemonic.ts`

**Key concept demonstrated:**
- Same mnemonic phrase → Same private key → Same address (deterministic)
- This is how wallet recovery works in MetaMask and other wallets
- **Proof:** Recreated exact same wallet from 12-word phrase

**HD Wallets concept introduced:**
- One mnemonic can generate infinite addresses (Account 1, 2, 3...)
- Hierarchical Deterministic (HD) wallet pattern
- MetaMask uses this for multiple accounts from single backup

---

#### Activity 3: Connect Wallet to Blockchain

**File created:** `scripts/week3/wallet-with-provider.ts`

**Major challenge:** Hardhat 3 API differences from Hardhat 2

**Issues encountered:**

1. **First attempt:** `hre.vars.get()` doesn't exist in Hardhat 3
2. **Second attempt:** `ethers.provider` (from "hardhat" import) doesn't exist
3. **Third attempt:** `hre.network.config.url` - property doesn't exist on NetworkManager
4. **Fourth attempt:** `vars` not exported from "hardhat" module
5. **Fifth attempt:** `vars` not exported from "hardhat/config" module
6. **Sixth attempt:** `configVariable()` returns ConfigurationVariable type (not string)

**Final solution (after web research):**
```typescript
import { network } from "hardhat";

const connection = await network.connect();
const provider = connection.ethers.provider;
```

**Hardhat 3 key change:**
- **Must explicitly connect to network:** `await network.connect()`
- Provider accessed via `connection.ethers.provider`
- Very different from Hardhat 2's `hre.ethers.provider`

**Successful output:**
```
Wallet Address: 0x0575DECc2A985F62FF3699dbe1C18d264B9580B9
Balance: 0.0 ETH
✅ Successfully connected to Sepolia testnet!
```

**Important clarification: Sepolia vs Alchemy**

**User question:** "How do Sepolia and Alchemy compare? Is Alchemy a type of Sepolia network?"

**Answer provided:**
- **Sepolia** = The blockchain network (Ethereum testnet)
- **Alchemy** = RPC service provider (access point to Sepolia)
- **Analogy:** Sepolia = Internet, Alchemy = ISP

**Relationship:**
```
Your Code
    ↓
Alchemy's API (https://eth-sepolia.g.alchemy.com/v2/...)
    ↓
Alchemy's Sepolia Node (they run Geth/Lighthouse)
    ↓
Sepolia Testnet (the actual blockchain)
```

**Configuration update:**
- Updated `SEPOLIA_RPC_URL` keystore variable to use Alchemy endpoint
- Command: `npx hardhat keystore set --dev --force SEPOLIA_RPC_URL`
- Value: `https://eth-sepolia.g.alchemy.com/v2/McWU4Kx-usN9BdeUinsTO`

---

#### Activity 4: Load Existing Wallet

**File created:** `scripts/week3/load-existing-wallet.ts`

**Challenge:** How to access keystore variables in Hardhat 3 scripts?

**Attempted approaches:**
1. `vars.get()` from "hardhat" - ❌ Not exported
2. `vars.get()` from "hardhat/config" - ❌ Not exported
3. `configVariable()` - ❌ Returns wrong type (ConfigurationVariable, not string)

**Final solution:** Use Hardhat's built-in signers
```typescript
const [signer] = await connection.ethers.getSigners();
```

**Why this works:**
- `getSigners()` loads accounts from `hardhat.config.ts`
- Config already has `accounts: [configVariable("SEPOLIA_PRIVATE_KEY")]`
- Hardhat automatically resolves private key and creates signer

**Successful output:**
```
Wallet Address: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
Balance: 0.80103561848228488 SepoliaETH
✅ This is your REAL wallet with actual testnet ETH!
```

**Discovery:** Balance increased from ~0.05 ETH to 0.80 ETH (user must have used faucet)

---

#### Key User Question: Multiple Wallets/Connections

**User insight:** "In Hardhat 3 you're supposed to always assume you're using things from configuration, but that seems strange. What if I wanted to have 2 different wallets or connections?"

**Answer provided:**

**Option 1: Multiple configured accounts**
```typescript
const [account1, account2, account3] = await connection.ethers.getSigners();
```

**Option 2: Create wallets dynamically**
```typescript
const randomWallet = ethers.Wallet.createRandom().connect(provider);
const wallet2 = ethers.Wallet.fromPhrase("mnemonic").connect(provider);
const wallet3 = new ethers.Wallet("0xPRIVATE_KEY", provider);
```

**Option 3: Multiple network connections**
```typescript
const sepoliaConnection = await network.connect();
const mainnetConnection = await network.connect({ network: "mainnet" });
```

**Design philosophy:**
- Config-based = Convenient for common cases
- Manual creation = Flexible when needed
- **Best practice:** Use `getSigners()` for main accounts, create additional wallets dynamically when needed

---

#### Technical Concepts Learned

**1. Wallet Components**
- **Mnemonic** (12 words) → Human-readable backup
- **Private Key** (256-bit number) → The actual secret
- **Address** (derived from public key) → Public account identifier

**2. Deterministic Wallet Recovery**
- Same mnemonic always produces same private key/address
- BIP-39 standard for mnemonic → seed conversion
- Used by all major wallets (MetaMask, Ledger, etc.)

**3. HD Wallets (Hierarchical Deterministic)**
- One mnemonic can generate infinite addresses
- Each address at different derivation path
- Enables "Account 1", "Account 2", etc. from single backup

**4. Local vs Blockchain Operations**
- **Local (no connection needed):** Wallet creation, key derivation
- **Blockchain query needed:** Balance checks, transaction history, sending transactions

**5. Hardhat 3 Network Connection Pattern**
```typescript
import { network } from "hardhat";
const connection = await network.connect();
const provider = connection.ethers.provider;
```

**6. Provider vs Signer**
- **Provider:** Read-only connection to blockchain (queries)
- **Signer:** Provider + private key (can sign transactions)

---

#### Issues Encountered & Solutions

**Issue 1: Hardhat 3 API Documentation Confusion**
- **Problem:** Multiple attempts using incorrect Hardhat 2 patterns
- **Root cause:** Hardhat 3 has significant API changes
- **Learning:** Always verify documentation version before implementation
- **User feedback:** "Be sure to always look in the correct version of the documentation first to avoid these errors"

**Issue 2: Accessing Configuration Variables in Scripts**
- **Problem:** `vars.get()` not available in Hardhat 3 scripts
- **Attempted solutions:** Import from "hardhat", "hardhat/config", use `configVariable()`
- **Final solution:** Use `getSigners()` which auto-loads configured accounts
- **Rationale:** Hardhat 3 encourages config-based approach for main accounts

**Issue 3: Understanding Sepolia vs Alchemy Relationship**
- **Problem:** User unsure if Alchemy is "a type of Sepolia network"
- **Clarification:** Sepolia = blockchain network, Alchemy = RPC provider (access layer)
- **Analogy:** Internet vs ISP relationship
- **Resolution:** Clear understanding of network vs access provider

---

#### User Learning & Engagement Highlights

**Excellent Questions:**
1. "Where is .then and .catch defined? Are those JavaScript keywords? This relates to chaining, right?" ✅ Promise methods
2. "We are using npx because we just want to run the script?" ✅ Correct understanding
3. "Tell me about the ethers import. Is it official? Are there others?" ✅ Exploring alternatives
4. "When I ran this did Hardhat connect to Ethereum or testnet?" ✅ Understanding connection timing
5. "Should I use my previous wallet that had 0.05 ETH?" ✅ Practical thinking
6. "How do Sepolia and Alchemy compare? Is Alchemy a type of Sepolia?" ✅ Clarifying architecture
7. "What if I wanted to have 2 different wallets or connections?" ✅ Questioning design limitations

**Strong Technical Understanding:**
- Understood Promise chaining and async/await patterns
- Questioned ethers.js vs web3.js alternatives
- Recognized when blockchain connection happens (vs local operations)
- Caught documentation version issues immediately
- Pushed back when solutions seemed overly restrictive

**Professional Best Practices:**
- Asked for documentation URLs to verify independently
- Insisted on checking correct Hardhat 3 documentation
- Questioned design decisions (config-based approach)
- Verified understanding before moving forward

---

#### Hardhat 3 Key Learnings (Critical for Future Classes)

**Network Connection (NEW in Hardhat 3):**
```typescript
import { network } from "hardhat";
const connection = await network.connect();
const provider = connection.ethers.provider;
```

**Getting Signers:**
```typescript
const [signer] = await connection.ethers.getSigners();
// Auto-loads accounts from hardhat.config.ts
```

**Configuration Variables:**
- **In config file:** `configVariable("KEY_NAME")`
- **In scripts:** Access via `getSigners()` (for accounts) or environment
- **NOT available:** `vars.get()` pattern from Hardhat 2

**Provider Access:**
- **Hardhat 2:** `hre.ethers.provider`
- **Hardhat 3:** `connection.ethers.provider` (after `await network.connect()`)

---

#### Class 3.1 Deliverables - ALL COMPLETE ✅

- [x] ✅ **4 TypeScript scripts created** (`create-wallet.ts`, `wallet-from-mnemonic.ts`, `wallet-with-provider.ts`, `load-existing-wallet.ts`)
- [x] ✅ **Understanding of wallet components** (mnemonic, private key, address)
- [x] ✅ **Wallet recovery demonstrated** (same mnemonic → same wallet)
- [x] ✅ **Blockchain connection established** (via Alchemy RPC)
- [x] ✅ **Real wallet loaded** (0xB09b... with 0.80 SepoliaETH)
- [x] ✅ **Hardhat 3 patterns learned** (`network.connect()`, `getSigners()`)
- [x] ✅ **Promise/async patterns understood** (`.then()/.catch()` chaining)
- [x] ✅ **ethers.js vs web3.js comparison** (chose ethers for modern API)

---

#### Files Created This Session

**Scripts:**
- `scripts/week3/create-wallet.ts` - Random wallet generation
- `scripts/week3/wallet-from-mnemonic.ts` - Wallet recovery demonstration
- `scripts/week3/wallet-with-provider.ts` - Blockchain connection
- `scripts/week3/load-existing-wallet.ts` - Load configured wallet

**Configuration updates:**
- Updated `SEPOLIA_RPC_URL` keystore variable to use Alchemy endpoint

---

#### Next Steps for Class 3.2

**Before starting Class 3.2:**
- ✅ All Class 3.1 deliverables complete
- ✅ Real wallet loaded (0xB09b... with 0.80 ETH)
- ✅ Hardhat 3 network connection pattern understood
- ✅ Alchemy RPC working

**Class 3.2 Preview: Sending Your First Transaction**
- Build on wallet knowledge from Class 3.1
- Learn transaction anatomy (to, value, gas, nonce)
- Send ETH programmatically
- Estimate gas costs
- Handle transaction errors
- Monitor transaction status

**Class 3.2 Activities:**
- Send ETH between accounts
- Estimate gas before sending
- Check transaction status on Etherscan
- Handle common transaction errors (insufficient funds, gas too low, nonce issues)

**Expected outcome:** Send real SepoliaETH via CLI script! 💸

---

#### Commands Reference (Class 3.1)

**Run scripts:**
```powershell
npx hardhat run scripts/week3/SCRIPT_NAME.ts --network sepolia
```

**Update keystore variables:**
```powershell
npx hardhat keystore set --dev --force VARIABLE_NAME
```

**List keystore variables:**
```powershell
npx hardhat keystore list --dev
```

---

#### Questions to Explore in Class 3.2

- [ ] What is a transaction nonce and why does it matter?
- [ ] How is gas price determined?
- [ ] What happens if gas limit is too low?
- [ ] How do I know when a transaction is confirmed?
- [ ] Can I cancel a pending transaction?

---

**Class 3.1 Status:** ✅ **COMPLETE**

**Total Time Invested:** ~1.5 hours
- Setup and Activity 1: ~15 minutes
- Activity 2: ~10 minutes
- Activity 3 (with Hardhat 3 debugging): ~45 minutes
- Activity 4: ~20 minutes

**Key Takeaway:** Always verify documentation version before implementation! Hardhat 3 has significant API changes from Hardhat 2.

---

## Session: 2025-10-31

### Week 3, Class 3.2: Sending Your First Transaction - COMPLETE ✅

**Duration:** ~2 hours

**Context:** Continuing from Class 3.1 (wallet creation). Learning to send transactions, estimate gas, check status, and handle errors.

---

#### Pre-Class: MCP Tools Integration

**CLAUDE.md Updated with MCP Guidelines:**
- Added comprehensive MCP tools usage section
- context7 MCP for documentation lookup
- chrome-devtools MCP for frontend debugging (Week 6+)
- playwright MCP for E2E testing (Week 27)
- Updated "Preparing Classes" section with step-by-step MCP workflow
- Added "Troubleshooting with MCPs" section

**Key additions:**
- Always query version-specific documentation
- Use context7 BEFORE teaching new library/tool
- Proactive documentation checking prevents errors

---

#### Activity 1: Send ETH Between Wallets

**Initial confusion: Local vs Sepolia network**

**Issue encountered:**
- Script ran successfully but used **local Hardhat network** instead of Sepolia
- Clues: Address `0xf39Fd...` (Hardhat's default), 10,000 ETH balance, Block #1, instant confirmation

**Root cause:** Using `npx tsx` instead of `npx hardhat run`
- `tsx` doesn't understand `--network` flag
- Hardhat runner required for network selection

**Solution:**
```powershell
npx hardhat run scripts/week3/send-transaction.ts --network sepolia
```

**Successful transaction:**
- **Hash:** `0x85324acc9e53f71dc1649839db5b33e620eadbdb295f5cc949443c7f084042fa`
- **From:** 0xB09b...5736 (real wallet)
- **To:** 0x310a9...30B5 (random wallet)
- **Amount:** 0.001 ETH
- **Block:** 9,531,070
- **Gas Used:** 21,000
- **Gas Cost:** 0.0000315 ETH (~1.5 gwei)
- **Total Cost:** 0.001031500... ETH

**Key learning:**
- Gas is real - always adds to transaction cost
- 21,000 gas is fixed for simple ETH transfers
- Transaction confirmed in ~15-30 seconds on Sepolia
- Funds sent to random wallet are effectively "lost" (no private key)

---

#### Activity 2: Estimate Gas Before Sending

**Script created:** `scripts/week3/estimate-gas.ts`

**Key concepts demonstrated:**
- `provider.estimateGas()` - Simulates transaction, returns gas units needed
- `provider.getFeeData()` - Gets current network gas prices (EIP-1559)
- Total cost calculation: `amount + (gasLimit × gasPrice)`
- Balance check before sending

**Execution results:**
- Estimated Gas Limit: 21,000 (as expected)
- Gas Price: **0.001 gwei** (extremely low!)
- Total Cost: 0.010000021 ETH (to send 0.01 ETH)

**Gas price comparison:**
- Activity 1 (sent): 1.5 gwei
- Activity 2 (estimated): 0.001 gwei
- **1,500x difference in ~30 minutes!** (typical testnet volatility)

**User insight:** Understanding why gas estimation matters:
1. Know total cost before sending
2. Avoid insufficient funds errors
3. Monitor network conditions (postpone if gas is high)
4. Validate transaction will succeed

---

#### Activity 3: Check Transaction Status

**Script created:** `scripts/week3/check-transaction.ts`

**Key concepts:**
- `getTransaction(hash)` - Returns what you **sent** (from, to, value, gas limit, nonce)
- `getTransactionReceipt(hash)` - Returns what **happened** (block number, gas used, status, logs)
- Confirmations = current block - transaction block

**Execution results:**
- Transaction Hash: 0x85324acc... (from Activity 1)
- Nonce: 1 (this was the 2nd transaction from the wallet)
- Block Number: 9,531,070
- **Confirmations: 174** (Very Safe!)
- Current Block: 9,531,244
- Time passed: ~174 blocks × 12 sec = ~35 minutes

**User question about block numbers:**
"Why does receipt have a block number? Is it different from transaction block number?"

**Answer:** They're the **same** block number!
- `tx.blockNumber` = where transaction was mined
- `receipt.blockNumber` = same block (where execution results are recorded)
- Both refer to block 9,531,070
- Different objects (Transaction vs Receipt), same block reference

**Analogy provided:** Order (transaction) vs Receipt (result) - both reference same delivery address

**Confirmations concept:**
- 1 confirmation: Included in 1 block
- 6 confirmations: Generally safe (exchanges use this)
- 12+ confirmations: Very safe
- 174 confirmations: Extremely safe (practically irreversible)

---

#### Activity 4: Handle Transaction Errors

**Script created:** `scripts/week3/handle-errors.ts`

**Tests performed:**
1. **Insufficient funds** - Caught "bad address checksum" (ethers.js validates address first!)
2. **Invalid address** - Caught "ENS resolution requires a provider" (ethers tried to resolve as ENS name)
3. **Gas estimation** - ✅ Successful (21,000 gas)
4. **Nonce check** - Current nonce: 2 (confirms 2 transactions sent total)

**Unexpected error messages (different from guide):**
- Test 1: Got "bad address checksum" instead of "insufficient funds"
  - **Why:** ethers.js validates address format BEFORE checking balance
  - **This is good:** Catches address errors early

- Test 2: Got "ENS resolution requires a provider" instead of "invalid address"
  - **Why:** ethers.js tried to resolve "0xinvalid" as ENS name
  - **Still caught:** Error handling worked correctly

**Key concept:** `try/catch` blocks protect code from crashing when errors occur

**Transaction history confirmed:**
- Nonce 0: First transaction (before Class 3.2)
- Nonce 1: Activity 1 transaction (0x85324acc...)
- Nonce 2: Next transaction will use this

---

#### Class 3.2 Deliverables - ALL COMPLETE ✅

- [x] 4 working scripts: `send-transaction.ts`, `estimate-gas.ts`, `check-transaction.ts`, `handle-errors.ts`
- [x] Sent successful transaction on Sepolia (0x85324acc...)
- [x] Transaction verified on Etherscan (174 confirmations)
- [x] Understanding of gas mechanics (21,000 gas, variable prices)
- [x] Understanding of transaction lifecycle (pending → mined → confirmed)
- [x] Understanding of nonce (sequential counter: 0, 1, 2...)
- [x] Understanding of confirmations (depth in blockchain)

---

### Week 3, Class 3.3: Querying Blockchain Data - IN PROGRESS 🔄

**Duration so far:** ~15 minutes

**Context:** Learning to query blockchain as a public database - balances, blocks, transactions, real-time monitoring.

---

#### Activity 1: Query Account Balances - COMPLETE ✅

**Script created:** `scripts/week3/query-balances.ts`

**Hardhat 3 Pattern Correction:**
- **Initial mistake:** Used `hre.vars.get("ALCHEMY_API_KEY")` (Hardhat 2 syntax)
- **User caught it:** "that feels hardhat 2 to me and not hardhat 3"
- **Corrected pattern:**
  ```typescript
  import { network } from "hardhat";
  const connection = await network.connect();
  const provider = connection.ethers.provider;
  ```

**Key concept:** `await network.connect()` automatically uses network config from `hardhat.config.ts` (including RPC URL via `configVariable()`)

**Execution results (Sepolia testnet):**
- Your Wallet (0xB09b...5736): 0.80000411 ETH
- Vitalik Buterin: 34.3 ETH
- Ethereum Foundation: 4.5 ETH
- Current Block: 9,531,360

**User question:** "but these are balances on sepolia testnet, right?"

**Answer:** Yes! These are testnet balances (no real value)
- Testnet ETH = play money
- Mainnet balances are very different:
  - Vitalik: ~3,700+ ETH ($7+ million)
  - Ethereum Foundation: ~300,000+ ETH ($600+ million)

**Key concept learned:** Blockchain is a **public database** - anyone can query any address balance without needing private keys!

---

#### Activity 2: Explore Block Data - COMPLETE ✅

**Script created:** `scripts/week3/explore-blocks.ts`

**Key concepts learned:**
- Blocks are "pages in the ledger" containing transactions and metadata
- **Parent Hash** creates the blockchain "chain" (cryptographic pointer to previous block)
- Block utilization = (gasUsed / gasLimit) × 100%
- High utilization indicates network congestion

**Execution results (Block 9,531,512):**
- **Block Utilization:** 73.29% (fairly busy testnet)
- **Gas Used:** 43,971,524 / 60,000,000 limit
- **Base Fee:** 0.000000011 gwei (testnet is essentially free)
- **Transaction Count:** 72 transactions
- **Timestamp:** 31/10/2025, 17:27:00 (just created!)

**User insights:**
1. **Parent hash creates immutability:** Changing any past block breaks the entire chain
2. **Block utilization → gas fees:** High utilization = high demand = higher prices (on mainnet)
3. **Block numbers increase over time:** ~12 seconds per block on Ethereum
4. **Time calculation:** 152 blocks × 12 sec ≈ 30 minutes elapsed since Activity 1

**Key learning:** Block structure is fundamental to blockchain immutability and security!

---

#### Activity 3: Get Transaction History - COMPLETE ✅

**Script created:** `scripts/week3/transaction-history.ts`

**Challenge encountered: Etherscan API V2 Migration**

**Issue:** Got error "You are using a deprecated V1 endpoint, switch to Etherscan API V2"

**User's excellent instinct:** "please look into their documentation first at https://docs.etherscan.io/introduction"

**Solution found via documentation research:**
- **V1 (deprecated):** `https://api.etherscan.io/api?action=balance&apikey=KEY`
- **V2 (current):** `https://api.etherscan.io/v2/api?chainid=1&action=balance&apikey=KEY`
- **Key change:** Add `chainid` parameter to specify network
- **Sepolia Chain ID:** 11155111

**Final working endpoint:**
```
https://api.etherscan.io/v2/api?chainid=11155111&module=account&action=txlist&address=ADDRESS&startblock=0&endblock=99999999&sort=desc&apikey=KEY
```

**Execution results - Transaction History Analysis:**

1. **SENT 0.001 ETH** (Block 9,531,070)
   - Hash: 0x85324acc... (from Class 3.2, Activity 1!)
   - Gas: 21,000 (standard ETH transfer)

2. **RECEIVED 0.75103619 ETH** (Block 9,466,216)
   - Faucet funding

3. **SENT 0.0 ETH with no recipient** (Block 9,465,609) 🤔
   - Gas: 571,512 (MUCH higher than 21,000!)
   - **Identified as:** Smart contract deployment!
   - This was the HelloFamily contract from Week 1, Class 1.3!

4. **RECEIVED 0.05 ETH** (Block 9,465,373)
   - Initial faucet funding

**Key discoveries:**
- **Why no recipient?** Contract deployments don't have a "To" address
- **Why 0.0 ETH?** Constructor didn't require ETH payment
- **Why high gas?** Deploying bytecode costs much more than transferring ETH
- **Date correlation:** Oct 22 matches Week 1 contract deployment

**Important concept learned:**
- **Native RPC limitation:** Can't query "all transactions for an address"
- **Ethereum nodes index by:** Block number and transaction hash (NOT by address)
- **Solution:** Use indexer services (Etherscan, Alchemy, The Graph)

**Why indexers are needed:**
- Getting all transactions for an address would require scanning EVERY block since genesis
- Indexers maintain address-based databases for efficient queries

**User learning highlights:**
- Insisted on checking official documentation before implementing
- Identified the mysterious "0.0 ETH" transaction pattern
- Understood parent hash → immutability connection
- Connected block utilization to gas pricing economics

---

#### Activity 4: Monitor Real-Time Blockchain - COMPLETE ✅

**Script created:** `scripts/week3/monitor-blocks.ts`

**Key concepts:**
- **Polling pattern:** Check for new blocks every 6 seconds
- **Real-time updates:** Watch blocks arrive every ~12 seconds
- **Block timing:** Proof of Stake = fixed 12-second schedule
- **setInterval():** JavaScript timer for repeated execution

**Execution results (Sepolia):**
- Blocks arriving exactly 12 seconds apart (18:38:00 → 18:38:12 → 18:38:24...)
- Transaction count varying: 72-155 per block
- Utilization: 13-45% (plenty of space)
- Base fee stable: ~0.00000001 gwei (essentially free)

**Bug discovered and fixed:**
- **Issue:** Used `formatEther()` instead of `formatUnits(value, "gwei")`
- **Impact:** Base fees displayed in ETH units instead of gwei (confusing!)
- **Fix:** Changed to `formatUnits(block.baseFeePerGas, "gwei")`
- **Result:** Readable gwei values

**Mainnet comparison added:**
- User configured mainnet network in `hardhat.config.ts`
- Added `MAINNET_RPC_URL` to keystore (Alchemy)
- Ran monitor on both networks side-by-side

**Mainnet vs Sepolia comparison:**

| Metric | Sepolia (Testnet) | Mainnet (Real) |
|--------|-------------------|----------------|
| Base Fee | 0.00000001 gwei | 0.28 gwei |
| Difference | 1x | **28,000,000x higher!** |
| Utilization | 15-40% | 20-68% |
| Cost per transfer | ~$0.000000021 | ~$0.012 (1 cent) |
| ETH Value | $0 (play money) | Real value |

**Real-world cost calculation:**
```
Simple ETH transfer on mainnet:
21,000 gas × 0.28 gwei = 5,880 gwei = 0.00000588 ETH
At $2,000/ETH: ~$0.012 (about 1 cent)

During busy times (100 gwei):
21,000 gas × 100 gwei = ~$4.20 per transaction!
```

**Key insights:**
- Mainnet currently very quiet (0.28 gwei is cheap!)
- During NFT mints/crashes: 100-300 gwei (200-1000x more expensive)
- Always test on Sepolia first (free, safe, debuggable)
- Deploy to mainnet when: code tested, gas optimized, network quiet

**User learning highlights:**
- Fixed formatEther bug independently
- Successfully configured mainnet network
- Understood dramatic cost difference (28M times!)
- Grasped economic implications of gas prices

---

#### Class 3.3 Deliverables - ALL COMPLETE ✅

- [x] 4 working scripts created
- [x] Query any address balance (public blockchain database)
- [x] Explore block structure (parent hash chain, utilization)
- [x] Get transaction history via Etherscan API V2
- [x] Monitor real-time blockchain (Sepolia + Mainnet)
- [x] Fixed formatEther → formatUnits bug
- [x] Configured mainnet network
- [x] Understanding of testnet vs mainnet economics

---

### Files Created This Session

**Class 3.2 Scripts:**
- `scripts/week3/send-transaction.ts` - Send ETH between wallets
- `scripts/week3/estimate-gas.ts` - Calculate transaction costs before sending
- `scripts/week3/check-transaction.ts` - Query transaction details and confirmations
- `scripts/week3/handle-errors.ts` - Error handling patterns

**Class 3.3 Scripts:**
- `scripts/week3/query-balances.ts` - Query account balances
- `scripts/week3/explore-blocks.ts` - Fetch and analyze block data
- `scripts/week3/transaction-history.ts` - Get full transaction history via Etherscan API V2
- `scripts/week3/monitor-blocks.ts` - Real-time blockchain monitoring (Sepolia + Mainnet)

**Configuration:**
- Updated `hardhat.config.ts` with mainnet network configuration
- Added `MAINNET_RPC_URL` to Hardhat keystore

**Documentation:**
- Updated `CLAUDE.md` with comprehensive MCP tools usage guidelines

---

### Key Technical Learnings

**Hardhat 3 Patterns:**
1. Use `npx hardhat run` with `--network` flag (NOT `npx tsx`)
2. Use `await network.connect()` for provider access
3. Use `connection.ethers.getSigners()` for configured accounts
4. Provider auto-configured from `hardhat.config.ts`

**Transaction Mechanics:**
- Total cost = amount + (gas units × gas price)
- Simple ETH transfers = exactly 21,000 gas
- Gas prices fluctuate (saw 1.5 gwei → 0.001 gwei in 30 min)
- Confirmations = current block - transaction block
- Nonce = sequential transaction counter per address

**Error Handling:**
- ethers.js validates addresses before balance checks
- Always use `try/catch` for transaction operations
- Estimation simulates transaction (catches failures before sending)

**Blockchain Querying:**
- Everything is public except private keys
- `provider.getBalance()` works for ANY address
- Testnet vs mainnet balances are completely separate

**Block Structure:**
- Parent hash creates blockchain "chain" (cryptographic pointer)
- Changing any block breaks all subsequent blocks (immutability!)
- Block utilization = gasUsed / gasLimit (indicates network congestion)
- Blocks created every ~12 seconds on Ethereum

**Transaction Types:**
- ETH transfer: 21,000 gas, has "To" address, transfers value
- Contract deployment: Variable gas (500k+), no "To" address, 0 ETH value

**Etherscan API V2:**
- New unified endpoint: `https://api.etherscan.io/v2/api`
- Requires `chainid` parameter (Sepolia = 11155111)
- One API key works across 60+ supported networks
- Indexers needed because RPC can't query "all txs for address"

---

### Questions Explored

1. **JavaScript object nesting:** Understanding `connection.ethers.provider`
   - `connection` has property `ethers`
   - `ethers` has property `provider`
   - Like `car.engine.horsepower`

2. **Transaction vs Receipt block numbers:** Both reference same block
   - Transaction = what you sent
   - Receipt = what happened
   - Same block, different purposes

3. **Gas estimation purpose:** Know cost before sending, avoid failures, check network conditions

4. **Testnet vs Mainnet:** Completely separate networks with different balances

5. **Parent hash and immutability:** How does changing one block affect the chain?
   - Changes block hash → breaks next block's parent hash reference
   - Would need to recalculate all subsequent blocks
   - While recalculating, network adds even more blocks
   - This is the core of blockchain security!

6. **Block utilization and gas:** Why monitor block utilization?
   - High utilization = network congestion = higher gas prices
   - Important for timing transactions to save money
   - On testnet: utilization doesn't affect price (no economic value)
   - On mainnet: crucial for cost optimization

7. **Mysterious 0.0 ETH transaction:** Why no recipient and high gas?
   - Identified as smart contract deployment
   - No "To" address = contract creation
   - 0 ETH = constructor didn't require payment
   - High gas = deploying bytecode costs more than transfers

8. **Why can't RPC get transaction history?**
   - Nodes index by block/hash, not by address
   - Would require scanning all blocks since genesis
   - Indexers (Etherscan, Alchemy) solve this problem

---

### User Learning Strengths Observed

- **Excellent version awareness:** Caught Hardhat 2 vs 3 syntax differences immediately
- **Asks for concept explanations:** "explain the concepts, not just the code"
- **Connects learning:** Gas estimation → postponing transactions if prices high
- **Questions underlying mechanisms:** Block numbers, nonce, why estimate gas, parent hash
- **Verifies understanding:** "but these are balances on sepolia testnet, right?"
- **Documentation-first approach:** "please look into their documentation first" (Etherscan API)
- **Pattern recognition:** Identified contract deployment from gas usage and missing recipient
- **Deep conceptual understanding:** Connected parent hash to immutability, block utilization to economics

---

**Total Time Invested (Week 3 so far):** ~5 hours
- Class 3.1: ~1.5 hours (4 activities - wallet creation, recovery, connection)
- Class 3.2: ~2 hours (4 activities - send, estimate, check, errors)
- Class 3.3: ~1.5 hours (4 activities - balances, blocks, transaction history, real-time monitoring + mainnet setup)

**Class 3.1 Status:** ✅ **FULLY COMPLETE**
**Class 3.2 Status:** ✅ **FULLY COMPLETE**
**Class 3.3 Status:** ✅ **FULLY COMPLETE** (All 4 activities + bonus mainnet configuration)
**Class 3.4 Status:** 🔜 **PENDING** (Hardhat Project Exploration - guide prepared, ready to start)

---

### Session Break (2025-10-31)

**Paused at:** End of Class 3.3 (all activities complete)

**Next when resuming:**
- Class 3.4: Hardhat Project Exploration (~1-2 hours)
- Week 3 self-assessment quiz
- Week 3 reading (Bitcoin Ch 4-6, Ethereum Ch 4-6)

**Ready for next session:**
- ✅ All Week 3 scripts working (8 scripts total)
- ✅ Mainnet and Sepolia both configured
- ✅ Understanding of blockchain as public database
- ✅ Real-time monitoring capability
- ✅ Transaction sending and querying patterns mastered

---

*Last Updated: 2025-10-31 (Session break - Classes 3.1-3.3 FULLY COMPLETE, Class 3.4 pending)*
