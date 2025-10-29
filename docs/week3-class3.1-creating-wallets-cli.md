# Week 3, Class 3.1: Creating Wallets via CLI
## FamilyChain Course - Learning Guide

---

## 🎯 Overview

**Duration:** 1-2 hours
**Prerequisites:**
- Week 1 complete (Node.js, Hardhat 3.0.8 installed)
- Week 2 complete (Alchemy RPC configured)
- Basic understanding of blockchain (from Week 1)

**What You'll Learn:**
In this class, you'll learn how wallets are created programmatically using ethers.js v6. You already have a wallet from Week 1, but now you'll understand HOW it was created and learn to generate new wallets via command line.

**Why This Matters:**
Understanding wallet creation is fundamental to blockchain development. You'll need to create wallets for testing, for users in your dApp, and for managing multiple accounts in your family finance platform.

---

## 📚 Learning Objectives

By the end of this class, you will be able to:

1. **Create** new Ethereum wallets programmatically using ethers.js v6
2. **Understand** the relationship between private keys, public keys, and addresses
3. **Generate and use** mnemonic phrases (12-24 word seed phrases)
4. **Derive** multiple wallets from a single mnemonic (HD wallets)
5. **Store** private keys securely using Hardhat 3's keystore
6. **Differentiate** between random wallets and HD (Hierarchical Deterministic) wallets
7. **Explain** wallet security best practices

---

## 📖 Key Concepts

### 1. Wallet Components

Every Ethereum wallet has three key components:

| Component | Example | Purpose |
|-----------|---------|---------|
| **Private Key** | `0x1a2b3c...` (64 hex chars) | Signs transactions, proves ownership - **NEVER SHARE** |
| **Public Key** | `0x04a1b2...` (130 hex chars) | Derived from private key, used to generate address |
| **Address** | `0xB09b...` (40 hex chars) | Public identifier, like a bank account number |

**Flow:**
```
Private Key → Public Key → Address
(secret)      (derived)    (public)
```

**Key Point:** You can derive public key and address from private key, but NEVER the reverse! This is what makes blockchain secure.

### 2. Mnemonic Phrases (Seed Phrases)

**What is a mnemonic?**
A 12 or 24-word phrase that represents your private key in human-readable form.

**Example:**
```
witch collapse practice feed shame open despair creek road again ice least
```

**Why use mnemonics?**
- ✅ Easier to write down (words vs 64 random hex characters)
- ✅ Can generate multiple wallets from one mnemonic (HD wallets)
- ✅ Industry standard (BIP-39)
- ✅ Compatible across wallets (MetaMask, Ledger, etc.)

### 3. HD Wallets (Hierarchical Deterministic)

**Problem:** Managing 10 different private keys is hard.

**Solution:** HD wallets derive unlimited addresses from one mnemonic.

**Derivation Path:**
```
m/44'/60'/0'/0/0  ← First address
m/44'/60'/0'/0/1  ← Second address
m/44'/60'/0'/0/2  ← Third address
...
```

- `44'` = BIP-44 standard
- `60'` = Ethereum coin type
- `0'/0/` = Account and change
- `0, 1, 2...` = Address index

**MetaMask uses HD wallets** - that's why you can create multiple accounts from one seed phrase!

### 4. Random vs HD Wallets

**Random Wallet:**
- Generate private key from random bytes
- One key = one address
- Simple, but hard to manage many wallets

**HD Wallet:**
- Generate from mnemonic
- One mnemonic = infinite addresses
- Easier to back up and manage

### 5. Security Best Practices

| ✅ DO | ❌ DON'T |
|-------|----------|
| Use Hardhat keystore for dev | Store keys in code |
| Use hardware wallets for mainnet | Share private keys |
| Back up mnemonics offline (paper) | Store mnemonics in cloud |
| Use different wallets for testing vs real funds | Take screenshots of keys |
| Generate keys with cryptographic randomness | Use predictable keys like "0x123..." |

---

## 🛠️ Hands-On Activities

### Activity 1: Create a Simple Random Wallet

**Location:** `C:\Users\vitor410rodrigues\source\repos\FamilyChain\blockchain\`

**Step 1:** Create a new script directory

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\blockchain
mkdir scripts\week3
cd scripts\week3
```

**Step 2:** Create `create-wallet.ts`

Create a file named `create-wallet.ts` with this content:

```typescript
// scripts/week3/create-wallet.ts
import { ethers } from "ethers";

async function createRandomWallet() {
  console.log("=== Creating Random Wallet ===\n");

  // Create a random wallet
  const wallet = ethers.Wallet.createRandom();

  console.log("Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
  console.log("\n⚠️ WARNING: Never share your private key!\n");

  // Show the mnemonic if available
  if (wallet.mnemonic) {
    console.log("Mnemonic Phrase:");
    console.log(wallet.mnemonic.phrase);
    console.log("\nDerivation Path:", wallet.mnemonic.path);
  }
}

createRandomWallet();
```

**Step 3:** Run the script

```powershell
npx tsx scripts/week3/create-wallet.ts
```

**Expected Output:**
```
=== Creating Random Wallet ===

Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2
Private Key: 0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b
⚠️ WARNING: Never share your private key!

Mnemonic Phrase:
witch collapse practice feed shame open despair creek road again ice least

Derivation Path: m/44'/60'/0'/0/0
```

**What Just Happened?**
- `ethers.Wallet.createRandom()` generated a new wallet with cryptographic randomness
- The wallet has a private key, address, AND a mnemonic phrase
- Each time you run this, you get a different wallet

**Q: Why does a "random" wallet have a mnemonic?**
A: ethers.js v6's `createRandom()` actually creates an HD wallet under the hood! It generates a mnemonic and derives the first address (index 0).

---

### Activity 2: Create Wallet from Mnemonic

**Step 1:** Create `wallet-from-mnemonic.ts`

```typescript
// scripts/week3/wallet-from-mnemonic.ts
import { ethers } from "ethers";

async function walletFromMnemonic() {
  // EXAMPLE mnemonic (DO NOT USE FOR REAL FUNDS!)
  const mnemonic = "test test test test test test test test test test test junk";

  console.log("=== Creating Wallet from Mnemonic ===\n");
  console.log("Mnemonic:", mnemonic);
  console.log("");

  // Derive first 3 addresses
  for (let i = 0; i < 3; i++) {
    const path = `m/44'/60'/0'/0/${i}`;
    const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, path);

    console.log(`Address ${i} (${path}):`);
    console.log("  Address:", wallet.address);
    console.log("  Private Key:", wallet.privateKey.slice(0, 10) + "...");
    console.log("");
  }

  console.log("💡 Notice: Same mnemonic, different paths = different addresses!");
}

walletFromMnemonic();
```

**Step 2:** Run the script

```powershell
npx tsx scripts/week3/wallet-from-mnemonic.ts
```

**Expected Output:**
```
=== Creating Wallet from Mnemonic ===

Mnemonic: test test test test test test test test test test test junk

Address 0 (m/44'/60'/0'/0/0):
  Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  Private Key: 0xac097356...

Address 1 (m/44'/60'/0'/0/1):
  Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
  Private Key: 0x59c6995e...

Address 2 (m/44'/60'/0'/0/2):
  Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
  Private Key: 0x5de4111a...

💡 Notice: Same mnemonic, different paths = different addresses!
```

**What Just Happened?**
- Used `ethers.HDNodeWallet.fromPhrase()` to derive wallets from a mnemonic
- Changed the derivation path (`/0`, `/1`, `/2`) to get different addresses
- Same mnemonic generates infinite addresses deterministically

**Q: Can you go backwards from address to mnemonic?**
A: **NO!** That would break cryptography. You can only derive forwards (mnemonic → addresses).

---

### Activity 3: Connect Wallet to Alchemy Provider

**Step 1:** Create `wallet-with-provider.ts`

```typescript
// scripts/week3/wallet-with-provider.ts
import { ethers } from "ethers";
import hre from "hardhat";

async function walletWithProvider() {
  console.log("=== Connecting Wallet to Alchemy ===\n");

  // Get Alchemy provider from Hardhat config
  const provider = new ethers.JsonRpcProvider(
    hre.vars.get("ALCHEMY_API_KEY")
  );

  // Create a random wallet
  const wallet = ethers.Wallet.createRandom();
  console.log("New Wallet Address:", wallet.address);

  // Connect wallet to provider (needed to send transactions)
  const connectedWallet = wallet.connect(provider);

  // Check balance (will be 0 for new wallet)
  const balance = await connectedWallet.provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  // Get latest block number
  const blockNumber = await connectedWallet.provider.getBlockNumber();
  console.log("Latest Block:", blockNumber);

  console.log("\n✅ Wallet successfully connected to Sepolia via Alchemy!");
}

walletWithProvider();
```

**Step 2:** Run the script

```powershell
npx tsx scripts/week3/wallet-with-provider.ts
```

**Expected Output:**
```
=== Connecting Wallet to Alchemy ===

New Wallet Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2
Balance: 0.0 ETH
Latest Block: 9517234

✅ Wallet successfully connected to Sepolia via Alchemy!
```

**What Just Happened?**
- Created a wallet (local - just keys)
- Connected it to Alchemy provider (network access)
- Queried blockchain data (balance, block number)

**Key Concept:**
- **Wallet without provider** = Can sign, but can't send transactions
- **Wallet with provider** = Can sign AND send to blockchain

---

### Activity 4: Load Your Existing Wallet from Hardhat Keystore

**Step 1:** Create `load-existing-wallet.ts`

```typescript
// scripts/week3/load-existing-wallet.ts
import { ethers } from "ethers";
import hre from "hardhat";

async function loadExistingWallet() {
  console.log("=== Loading Your Wallet from Hardhat Keystore ===\n");

  // Get provider from Hardhat config
  const provider = new ethers.JsonRpcProvider(
    hre.vars.get("ALCHEMY_API_KEY")
  );

  // Get private key from Hardhat keystore
  const privateKey = hre.vars.get("SEPOLIA_PRIVATE_KEY");

  // Create wallet from private key
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Address:", wallet.address);

  // Check balance
  const balance = await wallet.provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "SepoliaETH");

  // Get transaction count (nonce)
  const txCount = await wallet.provider.getTransactionCount(wallet.address);
  console.log("Transaction Count:", txCount);

  console.log("\n✅ This is your wallet from Week 1!");
}

loadExistingWallet();
```

**Step 2:** Run the script

```powershell
npx tsx scripts/week3/load-existing-wallet.ts
```

**Expected Output:**
```
=== Loading Your Wallet from Hardhat Keystore ===

Address: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
Balance: 0.0503 SepoliaETH
Transaction Count: 2

✅ This is your wallet from Week 1!
```

**What Just Happened?**
- Loaded your existing private key from Hardhat's secure keystore
- Created a wallet object from that key
- Checked your actual balance and transaction history

**Security Note:** Your private key never appears in the output because we used `hre.vars.get()` which reads from the encrypted keystore.

---

## 📝 Deliverables

By the end of this class, you should have:

- [x] ✅ Created at least 3 wallets using different methods (random, mnemonic, from private key)
- [x] ✅ Four working scripts in `blockchain/scripts/week3/`:
  - `create-wallet.ts`
  - `wallet-from-mnemonic.ts`
  - `wallet-with-provider.ts`
  - `load-existing-wallet.ts`
- [x] ✅ Understanding of private key → public key → address flow
- [x] ✅ Understanding of HD wallets and derivation paths
- [x] ✅ Ability to connect wallets to blockchain providers

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module 'tsx'"

**Error:**
```
'tsx' is not recognized as an internal or external command
```

**Solution:**
Install tsx globally or use it via npx:
```powershell
npm install -g tsx
# OR
npx tsx scripts/week3/create-wallet.ts
```

---

### Issue 2: "Cannot find name 'hre'"

**Error:**
```
Cannot find name 'hre'. Did you mean 'URL'?
```

**Solution:**
Add the import at the top of your script:
```typescript
import hre from "hardhat";
```

---

### Issue 3: "Configuration variable 'ALCHEMY_API_KEY' not found"

**Error:**
```
HardhatError: Configuration variable 'ALCHEMY_API_KEY' was not found
```

**Solution:**
You haven't set the Alchemy API key in Hardhat keystore. Run:
```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\blockchain
npx hardhat keystore set --dev ALCHEMY_API_KEY
# Paste your full Alchemy URL when prompted
```

---

### Issue 4: Script runs but shows 0.0 ETH balance for existing wallet

**Problem:**
Your `load-existing-wallet.ts` shows 0 ETH even though you have testnet ETH.

**Solution:**
Check that you're using the correct RPC URL:
```powershell
npx hardhat keystore list --dev
```
Verify `ALCHEMY_API_KEY` and `SEPOLIA_RPC_URL` are both set.

If using `ALCHEMY_API_KEY`, make sure it's the full URL:
```
https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

---

## ✅ Self-Assessment Quiz

Test your understanding before moving to Class 3.2:

### 1. What is the relationship between private key, public key, and address?

<details>
<summary>Answer</summary>

**Flow:** Private Key → Public Key → Address

- **Private Key** is secret, generated with cryptographic randomness
- **Public Key** is derived from private key using elliptic curve cryptography (ECDSA)
- **Address** is derived from public key by taking Keccak-256 hash and using last 20 bytes

You can go forwards (private → public → address) but NEVER backwards (address → private).
</details>

---

### 2. What is a mnemonic phrase and why use it instead of a private key?

<details>
<summary>Answer</summary>

A **mnemonic phrase** is a 12 or 24-word representation of a private key using the BIP-39 standard.

**Why use mnemonics:**
- ✅ Human-readable (easier to write down than 64 hex characters)
- ✅ Can derive multiple wallets (HD wallets)
- ✅ Industry standard (works across MetaMask, Ledger, etc.)
- ✅ Includes checksum (detects typos)

**Example:**
```
witch collapse practice feed shame open despair creek road again ice least
```
</details>

---

### 3. What does the derivation path `m/44'/60'/0'/0/5` mean?

<details>
<summary>Answer</summary>

This is an HD wallet derivation path:

- `m/` = Master key (from mnemonic)
- `44'` = BIP-44 standard
- `60'` = Ethereum coin type (Bitcoin is 0, Ethereum is 60)
- `0'` = Account index (first account)
- `0` = Change (0 = external, 1 = internal change addresses)
- `5` = Address index (6th address, since 0-indexed)

**Result:** This path generates the **6th Ethereum address** from the mnemonic.

**MetaMask uses paths like this:**
- Account 1: `m/44'/60'/0'/0/0`
- Account 2: `m/44'/60'/0'/0/1`
- Account 3: `m/44'/60'/0'/0/2`
</details>

---

### 4. What's the difference between `ethers.Wallet.createRandom()` and `new ethers.Wallet(privateKey)`?

<details>
<summary>Answer</summary>

**`ethers.Wallet.createRandom()`:**
- Generates a NEW wallet with cryptographic randomness
- Includes mnemonic phrase (HD wallet)
- Use when: Creating wallets for users, testing, etc.

**`new ethers.Wallet(privateKey)`:**
- Loads EXISTING wallet from a known private key
- No mnemonic (unless you save it separately)
- Use when: Loading your own wallet, importing existing keys

**Example:**
```typescript
// Create new wallet
const newWallet = ethers.Wallet.createRandom();

// Load existing wallet
const existingWallet = new ethers.Wallet("0x1a2b3c...");
```
</details>

---

### 5. Why do you need to connect a wallet to a provider?

<details>
<summary>Answer</summary>

**Wallet without provider:**
- Can sign messages and transactions
- CANNOT send transactions to blockchain
- CANNOT query blockchain data

**Wallet with provider:**
- Can sign AND send transactions
- Can query balances, blocks, contracts
- Has network access

**How to connect:**
```typescript
const provider = new ethers.JsonRpcProvider("https://...");
const wallet = new ethers.Wallet(privateKey, provider);
// OR
const connectedWallet = wallet.connect(provider);
```

**Analogy:**
- Wallet = Your signature
- Provider = The post office (sends your signed documents to the network)
</details>

---

### 6. Where should you store private keys for development vs production?

<details>
<summary>Answer</summary>

**Development (Testnet):**
- ✅ Hardhat keystore (`npx hardhat keystore set --dev`)
- ✅ Environment variables (with `.env` in `.gitignore`)
- ❌ Never commit to Git

**Production (Mainnet):**
- ✅ Hardware wallets (Ledger, Trezor)
- ✅ Encrypted cloud key management (AWS KMS, Google Cloud KMS)
- ✅ Multi-signature wallets (Gnosis Safe)
- ❌ Never store in code, logs, or unencrypted files
- ❌ Never store on servers without encryption

**Best Practice:**
Use Hardhat keystore for dev, hardware wallets for real funds.
</details>

---

### 7. Can you recover a wallet if you lose the private key but have the address?

<details>
<summary>Answer</summary>

**NO!**

If you lose the private key (or mnemonic), the wallet is **permanently lost**.

The address is public information - anyone can see it on Etherscan. But without the private key, you cannot:
- Sign transactions
- Move funds
- Prove ownership

**This is why backup is critical:**
- ✅ Write down mnemonic on paper (offline)
- ✅ Store in multiple secure locations
- ✅ Consider metal backup plates (fire/water resistant)
- ❌ Don't store in email, cloud, or screenshots

**"Not your keys, not your crypto"** - This is why!
</details>

---

## 🎯 Key Takeaways

1. **Wallets have three components:** Private key (secret), public key (derived), address (public identifier)

2. **Mnemonic phrases** are human-readable representations of private keys (BIP-39 standard)

3. **HD wallets** derive unlimited addresses from one mnemonic using derivation paths

4. **ethers.js v6** makes wallet creation easy with `Wallet.createRandom()` and `HDNodeWallet.fromPhrase()`

5. **Wallets need providers** to interact with the blockchain (sign locally, send via provider)

6. **Security is critical:** Never share private keys, use Hardhat keystore for dev, hardware wallets for mainnet

7. **No recovery without private key:** Lost keys = lost funds permanently

---

## 🔗 Next Steps

In **Class 3.2: Sending Your First Transaction**, you'll:
- Send ETH between addresses
- Understand transaction parameters (gas, nonce, data)
- Estimate gas costs
- Check transaction status on Etherscan

**Before Class 3.2:**
- Ensure all 4 scripts are working
- Keep your wallet address handy (you'll use it next)
- Review transaction concepts from Week 1, Class 1.2

---

## 📚 Reading References

To deepen your understanding, read these chapters (do this AFTER completing the hands-on activities):

**Bitcoin Book:**
- **Chapter 4:** Keys and Addresses (Private and Public Keys, Elliptic Curve Cryptography)
- **Chapter 5:** Wallets (Wallet Technology, HD Wallets, Mnemonic Codes - BIP-39)

**Ethereum Book:**
- **Chapter 4:** Cryptography (Keys and Addresses, Ethereum Addresses)
- **Chapter 5:** Wallets (Wallet Technology, Mnemonic Words - BIP-39)

**Key sections to focus on:**
- Private/public key cryptography (ECDSA for Ethereum)
- HD wallet derivation (BIP-32, BIP-44)
- Mnemonic generation (BIP-39)
- Address generation (Keccak-256 for Ethereum vs SHA-256/RIPEMD-160 for Bitcoin)

---

## 🧑‍🏫 Teaching Notes (For Claude Code)

**Pacing:**
- This class has 4 activities - do them sequentially
- Wait for user to complete each script before moving to next
- Ask "Ready for Activity 2?" after each completion

**Common Confusion Points:**
1. **Mnemonic vs Private Key:** Explain mnemonic is just a human-readable encoding
2. **Derivation Paths:** Show visual diagram if user struggles with `m/44'/60'/0'/0/X` notation
3. **Provider Connection:** Emphasize wallet = keys, provider = network access

**Questions to Ask:**
- "Why do you think MetaMask asks for a seed phrase when you create a wallet?"
- "If you change the last number in the derivation path from 0 to 1, what changes?"
- "What would happen if you tried to send a transaction without connecting a provider?"

**Version-Specific Notes:**
- ✅ This class uses **ethers.js v6** syntax
- ✅ Uses Hardhat 3's `hre.vars.get()` for keystore access
- ❌ Old tutorials use ethers v5 (different syntax!)
- ❌ Hardhat 2 used `process.env` instead of `hre.vars.get()`

**Hands-On Emphasis:**
- User must RUN all 4 scripts themselves
- Claude provides code, user creates files and executes
- Wait for user to share output before explaining

---

*Last Updated: 2025-10-29*
*Course: FamilyChain Blockchain Development*
*Week 3, Class 3.1 of 4*
