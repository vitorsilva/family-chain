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

*Last Updated: 2025-10-30 (Session end - Class 3.1 complete)*
