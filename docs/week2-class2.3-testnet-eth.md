# Week 2 - Class 2.3: Getting Testnet ETH

**Duration:** 1-2 hours
**Prerequisites:** Classes 2.1 and 2.2 completed (node installed and synced)
**Goal:** Obtain testnet ETH from multiple faucets and verify balances using your node

---

## 📋 Overview

### Why Do You Need Testnet ETH?

Testnet ETH is **free cryptocurrency** used on test networks like Sepolia. You need it to:

- **Deploy smart contracts** (Week 3+) - costs gas
- **Send transactions** (Week 3) - costs gas
- **Interact with contracts** (Week 5+) - costs gas
- **Test your DApp** without spending real money

**Testnet ETH has NO real-world value:**
- ✅ Can't be sold for real money
- ✅ Safe to experiment with
- ✅ Free from faucets
- ✅ Identical behavior to mainnet ETH

### What Are Faucets?

**Faucets** are services that give away free testnet ETH. They use various mechanisms to prevent abuse:

| Faucet Type | Verification Method | Amount | Frequency |
|-------------|---------------------|--------|-----------|
| **Proof-of-Work** | Solve computational puzzle | 0.05-1 ETH | 24 hours |
| **Social Media** | Twitter/GitHub account | 0.1-0.5 ETH | 24 hours |
| **OAuth** | Google/GitHub login | 0.1-1 ETH | 24 hours |
| **Wallet-based** | Mainnet ETH requirement | 0.5-1 ETH | 24 hours |

**Why anti-abuse mechanisms?**
- Prevents bots from draining faucets
- Ensures testnet ETH distributed fairly
- Reduces spam

### What You'll Accomplish

By the end of this class, you'll have:
- ✅ Multiple testnet wallets with ETH
- ✅ Experience using different faucet types
- ✅ Ability to verify balances using YOUR node
- ✅ Understanding of testnet vs mainnet differences
- ✅ Backup faucet options if one fails

---

## 🎯 Learning Objectives

By the end of this class, you will be able to:

1. ✅ **Identify available Sepolia faucets** and their requirements
2. ✅ **Request testnet ETH** from multiple sources
3. ✅ **Verify transactions** using Etherscan AND your local node
4. ✅ **Check balances via RPC** instead of block explorers
5. ✅ **Understand faucet rate limits** and plan accordingly
6. ✅ **Troubleshoot failed faucet requests** (common issues)
7. ✅ **Manage multiple testnet wallets** for different purposes

---

## 📚 Key Concepts

### 1. Testnet Economics

**Why is testnet ETH free?**
- No miners/validators earning revenue (no real economic value)
- Validators run nodes voluntarily or for testing
- Purpose is testing, not value transfer
- Prevents barrier to entry for developers

**Can testnet ETH become valuable?**
- No! Testnets can be reset at any time
- No exchanges accept testnet ETH
- Infinite supply (faucets give it away freely)

### 2. Faucet Rate Limiting

Most faucets implement rate limits:

**Common limits:**
- 0.1-1 ETH per request
- 24-hour cooldown between requests
- IP address tracking
- Account-based limits (social media, wallet)

**Why rate limits?**
- Prevent abuse (bots draining faucets)
- Fair distribution across developers
- Reduce operational costs (faucet operators pay for testnet ETH too!)

**Strategy:** Use multiple faucets to accumulate ETH faster

### 3. Wallet Address vs Transaction Hash

Understanding the difference:

| Concept | Format | Purpose | Example |
|---------|--------|---------|---------|
| **Wallet Address** | `0x` + 40 hex characters | Identifies your account | `0x1234...5678` |
| **Transaction Hash** | `0x` + 64 hex characters | Identifies a specific transaction | `0xabcd...ef01` |

**Wallet address:** Where ETH is sent TO (your account)
**Transaction hash:** Proof that a transaction happened (receipt)

### 4. Etherscan vs Your Node

Two ways to verify balances:

| Method | Pros | Cons |
|--------|------|------|
| **Etherscan** | ✅ Easy web interface<br>✅ Transaction history<br>✅ No setup | ❌ Third-party<br>❌ Privacy concerns<br>❌ Rate limits |
| **Your Node** | ✅ Complete privacy<br>✅ No rate limits<br>✅ Trustless | ❌ Need node running<br>❌ Command-line only<br>❌ Less visual |

**Best practice:** Use BOTH:
- Etherscan for visual confirmation and transaction history
- Your node for programmatic queries (Week 3+)

---

## 🛠️ Hands-On Activities

### Activity 1: Review Your Wallet from Week 1

**Time:** 3 minutes

In Week 1, you created a testnet wallet and received some ETH from the Google Cloud POW faucet.

**1. Find your wallet address:**

Check your Week 1 deployment script or `docs/week1-learning-notes.md`.

**From learning notes, your deployment was to:**
```
Contract: 0x21581Db891aAb5cB99d6002Aaa83C6c480960267
```

**But what was YOUR WALLET ADDRESS that deployed it?**

**To find it, check your Hardhat keystore:**

**WSL Ubuntu:**
```bash
npx hardhat keystore list
```

**Expected output:**
```
SEPOLIA_PRIVATE_KEY (set in development keystore)
```

**You don't want to expose the private key, but you need the ADDRESS.**

**Alternative: Check the deployment transaction on Etherscan:**
- Go to: https://sepolia.etherscan.io/address/0x21581Db891aAb5cB99d6002Aaa83C6c480960267
- Click on the "Contract Creation" transaction
- Look for "From:" field - that's YOUR wallet address!

**Write down your wallet address for this activity.**

---

### Activity 2: Check Current Balance (Using Your Node)

**Time:** 5 minutes

**Before requesting more ETH, check what you already have.**

**Ensure your node is running** (from Class 2.2):
- Terminal 1: Geth running
- Terminal 2: Lighthouse running

**Query your balance:**

**Replace `YOUR_ADDRESS` with your actual wallet address:**

**WSL Ubuntu:**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["YOUR_ADDRESS", "latest"],"id":1}'
```

**Windows PowerShell:**
```powershell
$address = "YOUR_ADDRESS"
$body = @{jsonrpc="2.0"; method="eth_getBalance"; params=@($address, "latest"); id=1} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8545 -Method POST -Body $body -ContentType "application/json"
```

**Expected output:**
```json
{"jsonrpc":"2.0","id":1,"result":"0x16345785d8a0000"}
```

**Convert from Wei to ETH:**

The result is in **Wei** (1 ETH = 10^18 Wei).

**WSL Ubuntu:**
```bash
python3 -c "print(int('0x16345785d8a0000', 16) / 10**18)"
```

**Windows PowerShell:**
```powershell
[Convert]::ToInt64("16345785d8a0000", 16) / 1000000000000000000
```

**Expected result:**
```
0.1
```
(You have 0.1 ETH from Week 1)

✅ **Balance verified using YOUR node!**

---

### Activity 3: Set Up Additional Wallets (Optional but Recommended)

**Time:** 10 minutes

**Why multiple wallets?**
- Different wallets for different testing purposes
- Backup if one wallet runs low
- Practice managing multiple accounts

**Create a new wallet using ethers.js:**

**1. Create a simple Node.js script:**

**WSL Ubuntu / Windows (same):**

Navigate to your blockchain directory:
```bash
cd ~/FamilyChain/blockchain  # WSL
cd $HOME\FamilyChain\blockchain  # Windows
```

**Create `create-wallet.js`:**
```javascript
const { ethers } = require("ethers");

// Generate new random wallet
const wallet = ethers.Wallet.createRandom();

console.log("=== NEW TESTNET WALLET ===");
console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("Mnemonic:", wallet.mnemonic.phrase);
console.log("\n⚠️ NEVER share these on mainnet! Testnet only!");
console.log("⚠️ Save these in a secure location (password manager, etc.)");
```

**2. Run the script:**
```bash
node create-wallet.js
```

**Expected output:**
```
=== NEW TESTNET WALLET ===
Address: 0xABCDEF1234567890ABCDEF1234567890ABCDEF12
Private Key: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
Mnemonic: word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12
⚠️ NEVER share these on mainnet! Testnet only!
```

**3. Save this information securely:**
- Address: Use for faucets
- Private Key: Import to Hardhat keystore (Week 3)
- Mnemonic: Backup recovery phrase

**Create 2-3 wallets** and save their addresses. You'll use them for faucet requests.

✅ **Multiple wallets created!**

---

### Activity 4: Faucet Strategy - Maximize Your ETH

**Time:** 5 minutes

**Plan your faucet strategy:**

**Available Sepolia Faucets (2025):**

| Faucet | Requirement | Amount | Cooldown | URL |
|--------|-------------|--------|----------|-----|
| **Google Cloud POW** | Solve puzzle | 0.05 ETH | None | https://cloud.google.com/application/web3/faucet/ethereum/sepolia |
| **Alchemy** | Account + MetaMask | 0.5 ETH | 24 hours | https://sepoliafaucet.com/ |
| **Infura** | Account | 0.5 ETH | 24 hours | https://www.infura.io/faucet/sepolia |
| **QuickNode** | GitHub/Twitter | 0.1 ETH | 24 hours | https://faucet.quicknode.com/ethereum/sepolia |
| **Chainlink** | GitHub | 0.1 ETH | 24 hours | https://faucets.chain.link/sepolia |
| **Ethereum Ecosystem** | Various | 0.05-0.25 ETH | 24 hours | https://sepolia-faucet.pk910.de/ |

**Recommended approach:**
1. **Start with Google Cloud POW** (no account needed, can repeat)
2. **Create accounts** on Alchemy and Infura (major providers you'll use later)
3. **Use social media faucets** (QuickNode, Chainlink) if you have GitHub/Twitter
4. **Spread requests across multiple wallets** (3 wallets × 5 faucets = 15 requests!)

**Goal:** Accumulate 2-5 ETH across your wallets for Week 3+ activities

---

### Activity 5: Google Cloud POW Faucet (Repeat from Week 1)

**Time:** 10 minutes

You used this in Week 1, but you can use it again!

**1. Visit the faucet:**
https://cloud.google.com/application/web3/faucet/ethereum/sepolia

**2. Enter your wallet address:**
- Use a NEW wallet address (not the one from Week 1)
- Or use the same one if you want to accumulate more

**3. Solve the proof-of-work puzzle:**
- Click "Get ETH"
- Wait for puzzle to complete (1-3 minutes)
- You'll see "Transaction submitted"

**4. Note the transaction hash:**
```
Transaction: 0xabcdef1234567890...
```

**5. Verify on Etherscan:**
https://sepolia.etherscan.io/tx/0xYOUR_TX_HASH

**6. Wait for confirmation (1-2 minutes):**
- "Pending" → "Success"
- ETH arrives in your wallet!

**7. Verify using YOUR node:**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["YOUR_ADDRESS", "latest"],"id":1}'
```

✅ **0.05 ETH received!**

**Repeat for other wallet addresses if desired.**

---

### Activity 6: Alchemy Faucet (Account Required)

**Time:** 15 minutes (includes account creation)

Alchemy is a major Ethereum infrastructure provider. You'll use their RPC endpoints in later weeks, so creating an account now is useful.

**1. Create Alchemy account:**
- Go to: https://www.alchemy.com/
- Click "Sign Up" (free tier)
- Use your email or GitHub account

**2. Visit Alchemy Sepolia faucet:**
https://sepoliafaucet.com/

**3. Log in with your Alchemy account**

**4. Enter your wallet address:**
- Paste one of your Sepolia addresses

**5. Complete verification:**
- Some faucets require MetaMask connected
- Or GitHub account verification
- Follow the on-screen instructions

**6. Request testnet ETH:**
- Click "Send Me ETH"
- Wait for transaction submission

**7. Verify transaction:**
- Check the transaction hash on Etherscan
- Verify balance using your node (Activity 2 method)

**Expected amount:** 0.5 ETH

✅ **0.5 ETH received from Alchemy!**

**Note: 24-hour cooldown** before you can request again from Alchemy.

---

### Activity 7: Infura Faucet (Account Required)

**Time:** 10 minutes

Infura is another major provider (alternative to Alchemy).

**1. Create Infura account:**
- Go to: https://www.infura.io/
- Sign up (free tier)

**2. Visit Infura Sepolia faucet:**
https://www.infura.io/faucet/sepolia

**3. Log in with Infura credentials**

**4. Enter wallet address and request ETH:**
- Follow similar process to Alchemy
- Click "Receive ETH"

**5. Verify transaction**

**Expected amount:** 0.5 ETH

✅ **0.5 ETH received from Infura!**

---

### Activity 8: QuickNode Faucet (GitHub/Twitter)

**Time:** 10 minutes

**1. Visit QuickNode faucet:**
https://faucet.quicknode.com/ethereum/sepolia

**2. Connect with GitHub or Twitter:**
- Click "Sign in with GitHub" (recommended)
- Authorize the application

**3. Enter your wallet address**

**4. Complete any additional verification:**
- Tweet about the faucet (optional for extra ETH)
- Follow on Twitter

**5. Request testnet ETH**

**Expected amount:** 0.1-0.25 ETH

✅ **ETH received from QuickNode!**

---

### Activity 9: Chainlink Faucet (GitHub Required)

**Time:** 10 minutes

Chainlink faucet is reliable and well-maintained.

**1. Visit Chainlink faucet:**
https://faucets.chain.link/sepolia

**2. Connect GitHub account**

**3. Enter wallet address**

**4. Complete reCAPTCHA**

**5. Request 0.1 ETH**

**6. Verify transaction**

✅ **0.1 ETH received from Chainlink!**

---

### Activity 10: Verify All Balances Using Your Node

**Time:** 15 minutes

Now that you've requested from multiple faucets, verify ALL your wallets.

**Create a balance-checking script:**

**File: `check-balances.js`**
```javascript
const { ethers } = require("ethers");

// Connect to YOUR local node
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// List of your wallet addresses
const addresses = [
  "0xYOUR_ADDRESS_1",
  "0xYOUR_ADDRESS_2",
  "0xYOUR_ADDRESS_3"
];

async function checkBalances() {
  console.log("=== SEPOLIA TESTNET BALANCES ===\n");

  let totalBalance = 0n;

  for (const address of addresses) {
    const balance = await provider.getBalance(address);
    const ethBalance = ethers.formatEther(balance);

    console.log(`Address: ${address}`);
    console.log(`Balance: ${ethBalance} ETH`);
    console.log("---");

    totalBalance += balance;
  }

  console.log(`\nTotal Balance: ${ethers.formatEther(totalBalance)} ETH`);
  console.log("\n✅ All balances verified using YOUR local node!");
}

checkBalances().catch(console.error);
```

**Run the script:**
```bash
node check-balances.js
```

**Expected output:**
```
=== SEPOLIA TESTNET BALANCES ===

Address: 0x1234...5678
Balance: 0.6 ETH
---
Address: 0xABCD...EF01
Balance: 0.5 ETH
---
Address: 0x9876...5432
Balance: 0.15 ETH
---

Total Balance: 1.25 ETH

✅ All balances verified using YOUR local node!
```

✅ **All wallets funded and verified!**

---

### Activity 11: Understanding Transaction Confirmations

**Time:** 10 minutes

When you request from a faucet, the transaction goes through several stages:

**Transaction Lifecycle:**

| Stage | Status | Description | Time |
|-------|--------|-------------|------|
| **1. Submitted** | Pending | Transaction sent to network | Instant |
| **2. In Mempool** | Pending | Waiting to be included in block | 0-30 seconds |
| **3. Included in Block** | Confirmed (1 confirmation) | Mined in a block | ~12 seconds |
| **4. Finalized** | Confirmed (64+ confirmations) | Considered irreversible | ~13 minutes |

**Check transaction status using YOUR node:**

**Query transaction receipt:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["YOUR_TX_HASH"],"id":1}'
```

**Expected output:**
```json
{
  "jsonrpc":"2.0",
  "id":1,
  "result":{
    "blockNumber":"0x6e5123",
    "status":"0x1",
    "from":"0xFAUCET_ADDRESS",
    "to":"0xYOUR_ADDRESS",
    "gasUsed":"0x5208",
    "logs":[]
  }
}
```

**Key fields:**
- `status: "0x1"` - Success (0x0 = failed)
- `blockNumber` - Which block included this transaction
- `gasUsed` - How much gas was consumed

**Check current block number:**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Calculate confirmations:**
```
Confirmations = Current Block - Transaction Block Number
```

**Example:**
- Transaction in block: `0x6e5123` (7234851 decimal)
- Current block: `0x6e51a3` (7234979 decimal)
- Confirmations: 7234979 - 7234851 = **128 confirmations** ✅ Finalized!

---

## 📦 Deliverables

After completing this class, you should have:

- [ ] ✅ **2-5 Sepolia ETH** across multiple wallets
- [ ] ✅ **Multiple wallet addresses** created and funded
- [ ] ✅ **Verified balances** using YOUR local node (not just Etherscan)
- [ ] ✅ **Transaction receipts** saved (tx hashes for each faucet request)
- [ ] ✅ **Understanding of faucet mechanisms** (POW, social, OAuth)
- [ ] ✅ **Experience with Alchemy and Infura** accounts (will use in future weeks)

---

## ⚠️ Common Issues & Solutions

### Issue 1: Faucet Request Failed - "Try again in 24 hours"

**Cause:** You (or someone on your network) already used this faucet recently

**Solutions:**

**1. Try a different faucet** from the list in Activity 4

**2. Use a different wallet address:**
- Same IP address, different wallet = allowed by most faucets

**3. Wait 24 hours:**
- Set a calendar reminder
- Request again tomorrow

**4. Use mobile hotspot:**
- Different IP address might bypass rate limit
- (Use sparingly - mobile data costs!)

---

### Issue 2: Transaction Pending Forever (> 30 minutes)

**Cause:** Network congestion or low gas price

**Check transaction on Etherscan:**
```
https://sepolia.etherscan.io/tx/YOUR_TX_HASH
```

**If shows "Pending":**
- Sepolia occasionally has slow blocks
- Usually resolves within an hour

**If shows "Failed":**
- Faucet ran out of ETH (rare)
- Try a different faucet

**If doesn't exist:**
- Transaction never submitted
- Faucet error - try again

---

### Issue 3: Balance Shows 0 ETH on Node, But Etherscan Shows Balance

**Cause:** Your node not fully synced

**Solution:**

**1. Check sync status:**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}'
```

**If returns `{"jsonrpc":"2.0","id":1,"result":false}`:**
- Node is synced ✅

**If returns sync progress:**
- Node still syncing, wait for completion

**2. Compare block numbers:**
```bash
# Your node's block
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Compare to Etherscan: https://sepolia.etherscan.io/
```

**If your node is behind:**
- Wait for sync to complete (Class 2.2)

---

### Issue 4: Faucet Requires Mainnet ETH (Can't Fulfill)

**Cause:** Some faucets require you to hold real ETH on mainnet (anti-bot measure)

**Solutions:**

**1. Skip that faucet** - plenty of others available

**2. Use POW faucets instead:**
- Google Cloud POW faucet (no requirements)
- pk910 POW faucet (no requirements)

**3. Ask in Discord/Telegram:**
- Ethereum community servers often have members willing to send testnet ETH
- Be polite, explain you're learning blockchain development

---

### Issue 5: MetaMask Required, But I Don't Have It Yet

**Cause:** Some faucets (Alchemy) require MetaMask to verify wallet ownership

**Solutions:**

**1. Install MetaMask temporarily** (Week 6 we'll use it anyway):
- Browser extension: https://metamask.io/
- Add Sepolia network
- Import your wallet using private key
- Use faucet, then remove if desired

**2. Use faucets that don't require MetaMask:**
- Google Cloud POW
- Infura (just needs Infura account)
- Chainlink (just needs GitHub)

---

### Issue 6: All Faucets Rate-Limited - Need ETH Now!

**Cause:** Used all faucets, need more ETH immediately

**Solutions:**

**1. Create NEW wallet addresses:**
- Same IP, different addresses = often allowed

**2. Use POW faucets repeatedly:**
- Google Cloud POW has no cooldown
- Can request multiple times per day

**3. Ask in community channels:**
- Reddit r/ethdev
- Ethereum Discord servers
- StackExchange Ethereum
- Provide your address, politely ask for testnet ETH

**4. Bridge from other testnets (advanced, skip for now):**
- Some services allow testnet-to-testnet bridging
- Not needed at your stage

---

## ✅ Self-Assessment Quiz

### Question 1: Why is testnet ETH free?

<details>
<summary>Answer</summary>

Testnet ETH is free because:

- ✅ **No real economic value** - can't be sold or exchanged for real money
- ✅ **Testnets can be reset** - all balances wiped if needed
- ✅ **Purpose is testing** - developers need to experiment without financial risk
- ✅ **Infinite supply** - faucets give away ETH freely
- ✅ **No miners/validators earning revenue** - run voluntarily for testing

Testnet ETH behaves EXACTLY like mainnet ETH technically, but has zero real-world value. This allows developers to test smart contracts, transactions, and DApps safely before deploying to mainnet (where mistakes cost real money).
</details>

---

### Question 2: What's the difference between a wallet address and a transaction hash?

<details>
<summary>Answer</summary>

| Concept | Format | Purpose |
|---------|--------|---------|
| **Wallet Address** | `0x` + 40 hex chars (20 bytes) | Identifies an account (destination for ETH) |
| **Transaction Hash** | `0x` + 64 hex chars (32 bytes) | Identifies a specific transaction (receipt) |

**Example:**
- Wallet: `0x1234567890123456789012345678901234567890` (40 chars)
- Tx Hash: `0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd` (64 chars)

**Wallet address** = permanent identifier for your account (like a bank account number)
**Transaction hash** = one-time proof that a specific transaction occurred (like a bank receipt)
</details>

---

### Question 3: How do faucets prevent bots from draining them?

<details>
<summary>Answer</summary>

Faucets use multiple anti-abuse mechanisms:

**1. Rate limiting:**
- IP address tracking (24-hour cooldowns)
- Wallet address limits (once per day per address)

**2. Identity verification:**
- Social media accounts (GitHub, Twitter)
- OAuth login (Google, GitHub)
- MetaMask wallet connection

**3. Proof-of-Work:**
- Computational puzzles that take time to solve
- Expensive for bots to run at scale

**4. Mainnet ETH requirements:**
- Require small amount of real ETH on mainnet
- Proves you're a real developer, not a bot

**5. CAPTCHA:**
- Human verification challenges
- Difficult for bots to automate

**6. Whitelisting:**
- Manual approval for large requests
- Community reputation systems

Without these measures, bots would drain faucets instantly, leaving nothing for legitimate developers!
</details>

---

### Question 4: Why use multiple wallet addresses instead of accumulating all ETH in one?

<details>
<summary>Answer</summary>

**Benefits of multiple wallets:**

**1. Bypass rate limits:**
- Same IP + different address = often allowed
- Can request from same faucet multiple times

**2. Organization:**
- Wallet 1: Contract deployment
- Wallet 2: Testing transactions
- Wallet 3: User interactions

**3. Security:**
- If one private key compromised (testnet), others safe
- Practice for mainnet multi-wallet management

**4. Testing multi-user scenarios:**
- Simulate different family members (Week 8+ multi-sig)
- Test allowance distributions (Week 9)

**5. Avoid running out of ETH:**
- If one wallet drains, switch to backup
- Always have ETH available for testing

**In production (mainnet), you'd also use multiple wallets for:**
- Hot wallet (small amounts, frequent use)
- Cold wallet (large amounts, secure storage)
- Contract admin wallet (deployment only)
</details>

---

### Question 5: What does "64 confirmations" mean?

<details>
<summary>Answer</summary>

**Confirmations** = number of blocks mined AFTER the block containing your transaction.

**Example:**
- Your transaction in block 1000
- Current block is 1064
- Confirmations = 1064 - 1000 = **64 confirmations**

**Why it matters:**

| Confirmations | Status | Description |
|---------------|--------|-------------|
| **0** | Pending | Transaction in mempool, not yet in a block |
| **1** | Included | Transaction in latest block, but could be reorganized |
| **6** | Reasonably safe | Unlikely to be reorganized (Bitcoin standard) |
| **32** | Very safe | Ethereum "finalization" threshold (on PoS) |
| **64+** | Finalized | Practically impossible to reorganize |

**On Ethereum Proof-of-Stake (Sepolia):**
- 32 slots (blocks) = 1 epoch
- 2 epochs = finality
- **64 confirmations = 2 epochs = finalized** ✅

**For testnet ETH from faucets:**
- 1-2 confirmations sufficient (no risk)
- For large mainnet transactions: wait for 32-64+ confirmations
</details>

---

### Question 6: How can you verify ETH arrived WITHOUT using Etherscan?

<details>
<summary>Answer</summary>

**Use YOUR local node via JSON-RPC!**

**Method 1: Check balance:**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["YOUR_ADDRESS","latest"],"id":1}'
```

**Method 2: Get transaction receipt:**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["TX_HASH"],"id":1}'
```

**Method 3: Use ethers.js script:**
```javascript
const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const balance = await provider.getBalance("YOUR_ADDRESS");
console.log(ethers.formatEther(balance), "ETH");
```

**Benefits of using your node:**
- ✅ Complete privacy (no third-party)
- ✅ No rate limits
- ✅ Trustless (you verify directly)
- ✅ Programmatic (can automate)

**Etherscan is still useful for:**
- Visual transaction history
- Quick checks without command line
- Exploring unknown contracts/addresses
</details>

---

### Question 7: If a faucet transaction fails, do you lose the ETH?

<details>
<summary>Answer</summary>

**No!**

If a faucet transaction **fails**, the ETH never left the faucet's wallet.

**Transaction statuses:**

**"Pending":**
- ETH not yet transferred
- Transaction in mempool, waiting to be mined
- Eventually becomes "Success" or "Failed"

**"Success" (status: 0x1):**
- ETH successfully transferred to your address ✅
- You received the funds

**"Failed" (status: 0x0):**
- Transaction included in block but reverted
- ETH **returns to faucet** (you don't receive it)
- **You don't lose anything** (you never had it)

**"Dropped/Replaced":**
- Transaction removed from mempool
- Never mined
- **No ETH movement occurred**

**Note:** Failed transactions on testnet are harmless. On mainnet, you'd still pay gas fees even if the transaction fails (you pay for computation, not success).
</details>

---

## 🎯 Key Takeaways

1. **Testnet ETH is free** and has no real-world value:
   - Safe to experiment with
   - Can't be sold or exchanged
   - Distributed via faucets

2. **Multiple faucets exist** with different requirements:
   - POW faucets (no account needed)
   - Social media faucets (GitHub, Twitter)
   - Provider faucets (Alchemy, Infura accounts)

3. **Use multiple wallet addresses** to maximize ETH:
   - Bypass rate limits
   - Organize funds by purpose
   - Practice multi-wallet management

4. **Verify balances using YOUR node**:
   - Complete privacy (no Etherscan)
   - Trustless verification
   - Programmatic queries via JSON-RPC

5. **Transaction confirmations matter**:
   - 1+ confirmations = included in block
   - 32+ confirmations = reasonably safe
   - 64+ confirmations = finalized (Ethereum PoS)

6. **Faucets have rate limits** (typically 24 hours):
   - Plan ahead if you need large amounts
   - Use multiple faucets simultaneously
   - Create accounts on providers early (Alchemy, Infura)

7. **Community resources** available if faucets fail:
   - Reddit r/ethdev
   - Discord/Telegram Ethereum communities
   - Politely ask for testnet ETH

---

## 🔜 Next Steps

**Week 2 Complete! 🎉**

You now have:
- ✅ Running Sepolia node (Geth + Lighthouse)
- ✅ Multiple wallets funded with testnet ETH
- ✅ Experience querying your node via RPC
- ✅ Understanding of blockchain node operations

**Before Week 3:**
- Complete Week 2 self-assessment (check all quiz answers)
- Ensure node stays synced (run periodically)
- Keep wallet addresses and balances organized
- Read assigned book chapters (below)

**Week 3 Preview:**

You'll learn to:
- Create wallets via command line (not just random generation)
- Send transactions between addresses
- Query blockchain data programmatically
- Export Hardhat project in depth

**Reading for Week 2:**
- Bitcoin Book: Chapter 3 (Bitcoin Core - Running a Node)
- Ethereum Book: Chapter 3 (Clients - Running an Ethereum Client)

---

## 👨‍🏫 Teaching Notes for Claude Code

**Pacing:**
- This class involves waiting for faucet transactions (1-5 minutes each)
- Use waiting time to explain concepts or work on other activities
- Don't rush through all faucets - pick 2-3 if time-limited

**Common Struggles:**
- Faucet rate limits frustration (emphasize: this is normal, use multiple faucets)
- Confusion between address and transaction hash (use visual examples)
- Impatience waiting for confirmations (explain: this is how blockchains work!)

**Active Recall Opportunities:**
- "Remember from Week 1 when you used the POW faucet? Why is it free?"
- "In Class 2.2, we queried the node via RPC. What command checks balance?"
- "What's the difference between Etherscan and your local node for checking balances?"

**Encouragement:**
- Getting testnet ETH from multiple sources is a rite of passage for blockchain devs!
- Many beginners struggle with faucets - troubleshooting is valuable practice
- You're building real devops skills (account management, API usage, RPC queries)

**Troubleshooting:**
- If ALL faucets fail: offer to search for community faucet alternatives
- If MetaMask required but not yet installed: defer to Week 6 or install early
- If impatient: remind that mainnet transactions take same time (12 seconds per block)

---

## 📖 Reading References

**Bitcoin Book:**
- **Chapter 3:** Bitcoin Core - Running a Node
  - (Review from Class 2.1-2.2)
  - Understanding testnet concepts
  - Faucets and testnet coins

**Ethereum Book:**
- **Chapter 3:** Clients - Running an Ethereum Client
  - (Review from Class 2.1-2.2)
  - Testnet usage and faucets
  - JSON-RPC queries

**Additional Reading (Optional):**
- Ethereum Testnet Guide: https://ethereum.org/en/developers/docs/networks/#testnets
- Sepolia Faucet List: https://github.com/ethereum/testnets/blob/master/sepolia/faucets.md

---

**Estimated Time:** 1-2 hours (includes faucet request waiting time)

**Next Week:** [Week 3: Command Line Blockchain Interactions](../COURSE_PLAN.md#week-3)

---

*Last Updated: 2025-10-27*
