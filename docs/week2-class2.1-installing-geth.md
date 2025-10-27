# Week 2 - Class 2.1: Installing and Configuring Geth

**Duration:** 2-3 hours
**Prerequisites:** Week 1 completed (development environment setup, blockchain fundamentals)
**Goal:** Install Geth and Lighthouse consensus client, understand node types, and prepare for Sepolia testnet sync

---

## 📋 Overview

### Why Run Your Own Ethereum Node?

In Week 1, you deployed a smart contract using a public RPC endpoint (`ethereum-sepolia-rpc.publicnode.com`). While convenient, **relying on third-party RPC providers has limitations:**

| Public RPC Endpoints | Your Own Node |
|---------------------|---------------|
| ❌ Rate limits (requests/minute) | ✅ Unlimited requests |
| ❌ No privacy (provider sees all queries) | ✅ Complete privacy |
| ❌ Centralization (single point of failure) | ✅ Decentralization (you verify data) |
| ❌ Trust required (provider could lie) | ✅ Trustless (you verify every block) |
| ❌ May go offline | ✅ Under your control |

**Running your own node means:**
- You become part of the Ethereum network infrastructure
- You verify transactions and blocks yourself (trustless)
- You contribute to network decentralization
- You learn how blockchain networks actually work

### What You'll Install

Since Ethereum transitioned to **Proof-of-Stake** (The Merge, September 2022), running an Ethereum node requires **TWO components:**

1. **Execution Client (Geth)** - Handles transactions, state, EVM execution, your smart contracts
2. **Consensus Client (Lighthouse)** - Handles proof-of-stake consensus, validators, block proposals

**Important:** Geth **cannot sync without** a consensus client on proof-of-stake networks like Sepolia!

```
┌─────────────────────────────────────┐
│     Your Computer                   │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Lighthouse (Consensus)       │  │
│  │  • Beacon chain               │  │
│  │  • Proof-of-stake consensus   │  │
│  └────────────┬─────────────────┘  │
│               │ JWT Auth            │
│               │ (jwtsecret file)    │
│  ┌────────────▼─────────────────┐  │
│  │  Geth (Execution)             │  │
│  │  • Transactions               │  │
│  │  • Smart contracts            │  │
│  │  • EVM                        │  │
│  │  • Your RPC endpoint          │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
              │
              ▼
      Ethereum Network
```

### Why This Matters for FamilyChain

Your family finance platform will interact with smart contracts frequently. Running your own node ensures:
- **Reliability:** No rate limits when distributing allowances or checking balances
- **Privacy:** Family financial data doesn't go through third-party providers
- **Learning:** Deep understanding of how decentralized systems work
- **Portfolio value:** "Operated Ethereum node infrastructure" is a resume skill

---

## 🎯 Learning Objectives

By the end of this class, you will be able to:

1. ✅ **Explain the difference** between execution clients (Geth) and consensus clients (Lighthouse)
2. ✅ **Install Geth** v1.16+ and Lighthouse v7.0+ on your system
3. ✅ **Configure jwtsecret** authentication for client communication
4. ✅ **Understand node types** (full, light, archive) and choose appropriately
5. ✅ **Prepare your system** for Sepolia testnet synchronization
6. ✅ **Verify installation** by running both clients in test mode

---

## 📚 Key Concepts

### 1. Execution Clients vs Consensus Clients

After The Merge (Ethereum's transition from Proof-of-Work to Proof-of-Stake), the Ethereum protocol was split into two layers:

| Layer | Client Type | Responsibility | Our Choice |
|-------|-------------|----------------|------------|
| **Execution Layer** | Execution client | Transaction processing, smart contracts, EVM, state management | **Geth** (Go Ethereum) |
| **Consensus Layer** | Consensus client | Block proposals, attestations, finality, proof-of-stake | **Lighthouse** (Rust) |

**Why both?**
- **Separation of concerns:** Execution logic separate from consensus logic
- **Client diversity:** Different teams can build execution or consensus clients independently
- **Upgrades:** Easier to upgrade one layer without affecting the other

**Available Clients:**

**Execution Clients:**
- Geth (Go) - Most popular, official Go implementation
- Nethermind (C#) - High performance
- Besu (Java) - Enterprise-focused
- Erigon (Go) - Optimized for archive nodes
- Reth (Rust) - New, performance-focused

**Consensus Clients:**
- Lighthouse (Rust) - Fast, memory-efficient, beginner-friendly ✅ Our choice
- Prysm (Go) - Popular, good documentation
- Teku (Java) - Enterprise-focused
- Nimbus (Nim) - Lightweight, low resource usage
- Lodestar (TypeScript) - Good for developers

**We're using Geth + Lighthouse because:**
- Geth is the most widely used and documented execution client
- Lighthouse is beginner-friendly with excellent documentation
- Both have strong Windows support (and WSL Ubuntu)
- Active development and community support

### 2. Node Types

| Node Type | Description | Disk Space | Sync Time | Use Case |
|-----------|-------------|------------|-----------|----------|
| **Full Node** | Stores recent state (~128 blocks), prunes old state | ~800GB (mainnet), ~50GB (Sepolia) | Days (mainnet), Hours (Sepolia) | **Recommended for development** ✅ |
| **Light Node** | Doesn't store state, requests from full nodes | ~1GB | Minutes | Quick testing only |
| **Archive Node** | Stores ALL historical state since genesis | ~12TB+ (mainnet), ~500GB (Sepolia) | Weeks | Block explorers, analytics |

**For Sepolia testnet development, we'll use a Full Node:**
- ✅ Fast enough sync (a few hours)
- ✅ Reasonable disk space (~50GB)
- ✅ Can query recent state directly
- ✅ Suitable for smart contract development

### 3. JWT Authentication Between Clients

Geth and Lighthouse communicate via **authenticated RPC** using a shared secret (JWT token).

**What is JWT?**
- **JWT** = JSON Web Token
- A secret string that both Geth and Lighthouse know
- Prevents unauthorized access to your node's RPC endpoints
- Stored in a file called `jwtsecret`

**How it works:**
1. You create a `jwtsecret` file with a random hex string (64 characters)
2. Geth starts with `--authrpc.jwtsecret /path/to/jwtsecret`
3. Lighthouse starts with `--execution-jwt /path/to/jwtsecret` (same file!)
4. Both clients can now communicate securely

### 4. Sepolia Testnet Configuration

**Sepolia** is one of Ethereum's primary test networks:

| Property | Value |
|----------|-------|
| **Network ID** | 11155111 |
| **Consensus** | Proof-of-Stake (post-Merge) |
| **Purpose** | Application testing (stable, long-term testnet) |
| **Faucets** | Multiple available (Google Cloud, Alchemy, Infura) |
| **Block time** | ~12 seconds |
| **Lifespan** | Long-term (replaces deprecated Goerli, Ropsten) |

**Why Sepolia?**
- ✅ Long-term support (won't be deprecated soon)
- ✅ Stable testnet for application development
- ✅ Post-merge (proof-of-stake) like mainnet
- ✅ Active faucets for free test ETH

**Alternatives (we won't use these, but good to know):**
- **Goerli** - Being phased out (deprecated)
- **Holesky** - Validator/staking testing (larger, not for app dev)
- **Mainnet** - Real ETH, production use (NOT for learning!)

---

## 🛠️ Hands-On Activities

### Installation Path: WSL Ubuntu vs Native Windows

You mentioned you have **WSL with Ubuntu**. This is excellent! Here are your options:

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **WSL Ubuntu** | ✅ Easier consensus client setup<br>✅ Better documented<br>✅ Unix-style paths<br>✅ Familiar if you know Linux | ❌ Need to learn WSL file paths<br>❌ Slightly more complexity | **Recommended for Week 2** ✅ |
| **Native Windows** | ✅ No WSL needed<br>✅ Native PowerShell | ❌ Lighthouse Windows setup less documented<br>❌ Longer paths | Alternative if WSL issues |

**Decision point:** For this class, I'll provide **both WSL Ubuntu and Windows instructions**. Choose what feels more comfortable.

---

### Activity 1: Check System Requirements

**Time:** 5 minutes

Before installing, verify your system meets the requirements:

**Minimum Requirements:**
- **CPU:** Quad-core (AMD Ryzen, Intel Broadwell, ARMv8 or newer)
- **RAM:** 16GB (8GB minimum, but may struggle)
- **Disk Space:** At least 100GB free (Sepolia full node ~50GB)
- **Internet:** Reliable connection (will download blockchain data)

**PowerShell command to check disk space:**
```powershell
Get-PSDrive C | Select-Object Used,Free
```

**Expected output:**
```
        Used (GB)            Free (GB)
        ---------            ---------
        123.45               234.56
```

✅ **If you have 100GB+ free, proceed!**

---

### Activity 2: Choose Your Installation Path

**Time:** 2 minutes

**Question for you:** Do you want to use:
- **Option A:** WSL Ubuntu (recommended, easier)
- **Option B:** Native Windows PowerShell

**For this guide, I'll provide BOTH. Pick one and follow those instructions.**

---

## 🐧 Installation Path A: WSL Ubuntu (Recommended)

### Activity 3A: Verify WSL Ubuntu Setup

**Time:** 5 minutes

**1. Open PowerShell and start WSL:**
```powershell
wsl
```

**Expected output:**
```
username@HOSTNAME:~$
```

**2. Check Ubuntu version:**
```bash
lsb_release -a
```

**Expected output:**
```
Distributor ID: Ubuntu
Description:    Ubuntu 22.04.x LTS
Release:        22.04
Codename:       jammy
```

✅ **Ubuntu 20.04+ is fine. Proceed!**

**3. Update package lists:**
```bash
sudo apt update
```

---

### Activity 4A: Install Geth on WSL Ubuntu

**Time:** 10 minutes

**1. Add Ethereum PPA repository:**
```bash
sudo add-apt-repository -y ppa:ethereum/ethereum
```

**Expected output:**
```
Repository: 'deb [...] ethereum/ubuntu jammy main'
[...]
```

**2. Update package lists again:**
```bash
sudo apt update
```

**3. Install Geth:**
```bash
sudo apt install -y geth
```

**Expected output:**
```
Reading package lists... Done
Building dependency tree... Done
[...]
Setting up geth (1.16.x-x) ...
```

**4. Verify Geth installation:**
```bash
geth version
```

**Expected output:**
```
Geth
Version: 1.16.x-stable
Architecture: amd64
Go Version: go1.23.x
[...]
```

✅ **Geth installed successfully!**

---

### Activity 5A: Install Lighthouse on WSL Ubuntu

**Time:** 10 minutes

**1. Download Lighthouse binary:**

Go to https://github.com/sigp/lighthouse/releases and find the latest release (v7.0.0+).

For Ubuntu, download the `lighthouse-v7.x.x-x86_64-unknown-linux-gnu.tar.gz` file.

**Using wget (replace X.X.X with latest version):**
```bash
cd ~
wget https://github.com/sigp/lighthouse/releases/download/v7.0.0/lighthouse-v7.0.0-x86_64-unknown-linux-gnu.tar.gz
```

**2. Extract the archive:**
```bash
tar -xzf lighthouse-v7.0.0-x86_64-unknown-linux-gnu.tar.gz
```

**Expected output:**
```
(files extracted silently)
```

**3. Move to /usr/local/bin:**
```bash
sudo mv lighthouse /usr/local/bin/
```

**4. Verify Lighthouse installation:**
```bash
lighthouse --version
```

**Expected output:**
```
Lighthouse v7.0.0-xxxxxxx
BLS library: blst-portable
SHA256 hardware acceleration: true
Allocator: jemalloc
[...]
```

✅ **Lighthouse installed successfully!**

**5. Clean up downloaded archive:**
```bash
rm lighthouse-v7.0.0-x86_64-unknown-linux-gnu.tar.gz
```

---

### Activity 6A: Create Data Directories (WSL)

**Time:** 5 minutes

**1. Create directory structure:**
```bash
mkdir -p ~/ethereum/sepolia/geth
mkdir -p ~/ethereum/sepolia/lighthouse
mkdir -p ~/ethereum/sepolia/jwt
```

**2. Verify directories created:**
```bash
ls -la ~/ethereum/sepolia/
```

**Expected output:**
```
drwxr-xr-x  5 username username 4096 Oct 27 10:00 .
drwxr-xr-x  3 username username 4096 Oct 27 10:00 ..
drwxr-xr-x  2 username username 4096 Oct 27 10:00 geth
drwxr-xr-x  2 username username 4096 Oct 27 10:00 jwt
drwxr-xr-x  2 username username 4096 Oct 27 10:00 lighthouse
```

✅ **Directories ready!**

---

### Activity 7A: Generate JWT Secret (WSL)

**Time:** 3 minutes

**1. Generate random JWT secret:**
```bash
openssl rand -hex 32 > ~/ethereum/sepolia/jwt/jwtsecret
```

**2. Verify JWT secret created:**
```bash
cat ~/ethereum/sepolia/jwt/jwtsecret
```

**Expected output:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```
(Your hex string will be different - this is correct!)

**3. Set proper permissions:**
```bash
chmod 600 ~/ethereum/sepolia/jwt/jwtsecret
```

✅ **JWT secret generated securely!**

---

## 🪟 Installation Path B: Native Windows

### Activity 3B: Install Geth on Windows

**Time:** 10 minutes

**1. Download Geth for Windows:**

Visit: https://geth.ethereum.org/downloads

Download: **Geth for Windows (amd64)** - look for `geth-windows-amd64-1.16.x-xxxxxxxx.exe`

**2. Run the installer:**
- Double-click the downloaded `.exe`
- Click "Next" through the wizard
- Choose default installation path: `C:\Program Files\Geth\`
- ✅ Check "Add Geth to PATH" (important!)
- Click "Install"

**3. Verify installation:**

Open **PowerShell** and run:
```powershell
geth version
```

**Expected output:**
```
Geth
Version: 1.16.x-stable
Architecture: amd64
Go Version: go1.23.x
[...]
```

✅ **Geth installed successfully!**

---

### Activity 4B: Install Lighthouse on Windows

**Time:** 15 minutes

**1. Download Lighthouse for Windows:**

Visit: https://github.com/sigp/lighthouse/releases

Download: **lighthouse-v7.x.x-x86_64-windows.zip**

**2. Extract the ZIP file:**
- Right-click → "Extract All"
- Extract to: `C:\Program Files\Lighthouse\`

**3. Add Lighthouse to PATH:**

Open **PowerShell as Administrator** and run:
```powershell
$env:Path += ";C:\Program Files\Lighthouse"
[System.Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)
```

**4. Restart PowerShell** (to reload PATH), then verify:
```powershell
lighthouse --version
```

**Expected output:**
```
Lighthouse v7.0.0-xxxxxxx
BLS library: blst-portable
[...]
```

✅ **Lighthouse installed successfully!**

---

### Activity 5B: Create Data Directories (Windows)

**Time:** 5 minutes

**PowerShell commands:**
```powershell
New-Item -ItemType Directory -Path "$HOME\ethereum\sepolia\geth" -Force
New-Item -ItemType Directory -Path "$HOME\ethereum\sepolia\lighthouse" -Force
New-Item -ItemType Directory -Path "$HOME\ethereum\sepolia\jwt" -Force
```

**Expected output:**
```
    Directory: C:\Users\YourUsername\ethereum\sepolia

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----        10/27/2025  10:00 AM                geth
d-----        10/27/2025  10:00 AM                jwt
d-----        10/27/2025  10:00 AM                lighthouse
```

✅ **Directories created!**

---

### Activity 6B: Generate JWT Secret (Windows)

**Time:** 5 minutes

**1. Generate random JWT secret:**

PowerShell doesn't have `openssl` by default. Use this alternative:

```powershell
$jwtSecret = -join ((0..31) | ForEach-Object { "{0:x2}" -f (Get-Random -Maximum 256) })
$jwtSecret | Out-File -FilePath "$HOME\ethereum\sepolia\jwt\jwtsecret" -NoNewline -Encoding ASCII
```

**2. Verify JWT secret created:**
```powershell
Get-Content "$HOME\ethereum\sepolia\jwt\jwtsecret"
```

**Expected output:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

✅ **JWT secret generated!**

---

## ✅ Verification: Test Installation

### Activity 8: Verify Geth Can Start (Test Mode)

**Time:** 3 minutes

**WSL Ubuntu:**
```bash
geth --sepolia --datadir ~/ethereum/sepolia/geth --authrpc.jwtsecret ~/ethereum/sepolia/jwt/jwtsecret --http --http.api eth,net,web3 --syncmode snap
```

**Windows PowerShell:**
```powershell
geth --sepolia --datadir "$HOME\ethereum\sepolia\geth" --authrpc.jwtsecret "$HOME\ethereum\sepolia\jwt\jwtsecret" --http --http.api eth,net,web3 --syncmode snap
```

**Expected output (first few lines):**
```
INFO [10-27|10:00:00.000] Starting Geth on Sepolia testnet...
INFO [10-27|10:00:00.100] Maximum peer count                       ETH=50 total=50
INFO [10-27|10:00:00.200] Set global gas cap                       cap=50,000,000
INFO [10-27|10:00:00.300] Loaded JWT secret file                   path=/home/.../jwtsecret
INFO [10-27|10:00:00.400] Started P2P networking                   self=enode://...
WARN [10-27|10:00:00.500] Syncing not yet, waiting for consensus client...
```

**⚠️ Important:** You'll see `WARN - waiting for consensus client`. This is **expected!** Geth won't sync without Lighthouse running.

**Press Ctrl+C to stop Geth for now.**

✅ **Geth starts correctly and loads JWT secret!**

---

### Activity 9: Verify Lighthouse Can Start (Test Mode)

**Time:** 3 minutes

**WSL Ubuntu:**
```bash
lighthouse bn --network sepolia --datadir ~/ethereum/sepolia/lighthouse --execution-endpoint http://localhost:8551 --execution-jwt ~/ethereum/sepolia/jwt/jwtsecret --checkpoint-sync-url https://sepolia.beaconstate.ethstaker.cc
```

**Windows PowerShell:**
```powershell
lighthouse bn --network sepolia --datadir "$HOME\ethereum\sepolia\lighthouse" --execution-endpoint http://localhost:8551 --execution-jwt "$HOME\ethereum\sepolia\jwt\jwtsecret" --checkpoint-sync-url https://sepolia.beaconstate.ethstaker.cc
```

**Expected output (first few lines):**
```
Oct 27 10:00:00.000 INFO Lighthouse started                      version: v7.0.0
Oct 27 10:00:00.100 INFO Configured for network                  name: sepolia
Oct 27 10:00:00.200 INFO Starting checkpoint sync                url: https://sepolia.beaconstate.ethstaker.cc
```

**You'll likely see an error:**
```
ERROR Failed to connect to execution endpoint    error: Connection refused (os error 111)
```

**This is expected!** Lighthouse can't connect because Geth isn't running. We'll run both together in Class 2.2.

**Press Ctrl+C to stop Lighthouse.**

✅ **Lighthouse starts correctly and finds JWT secret!**

---

## 📦 Deliverables

After completing this class, you should have:

- [ ] ✅ **Geth v1.16+** installed and verified (`geth version` works)
- [ ] ✅ **Lighthouse v7.0+** installed and verified (`lighthouse --version` works)
- [ ] ✅ **Data directories** created (`~/ethereum/sepolia/` or `%HOME%\ethereum\sepolia\`)
- [ ] ✅ **JWT secret** generated and secured (`jwtsecret` file exists)
- [ ] ✅ **Test runs successful** (Geth and Lighthouse start without fatal errors)
- [ ] ✅ **Understanding** of execution vs consensus clients

---

## ⚠️ Common Issues & Solutions

### Issue 1: "geth: command not found" (After Installation)

**Cause:** PATH not updated or terminal not restarted

**Solution (WSL Ubuntu):**
```bash
which geth
```
If empty, reinstall with `sudo apt install geth`

**Solution (Windows):**
Close PowerShell completely and reopen. If still not working:
```powershell
$env:Path
```
Check if `C:\Program Files\Geth\` is in the output. If not, re-run the PATH update from Activity 4B.

---

### Issue 2: "Permission denied" When Creating Directories (WSL)

**Cause:** Trying to create directories in protected locations

**Solution:**
Don't use `sudo` when creating directories in your home folder (`~`). Use:
```bash
mkdir -p ~/ethereum/sepolia/geth
```

---

### Issue 3: "lighthouse: command not found" (After Installation)

**Cause (WSL):** Binary not in `/usr/local/bin/` or not executable

**Solution:**
```bash
sudo chmod +x /usr/local/bin/lighthouse
which lighthouse
```

**Cause (Windows):** Lighthouse not in PATH

**Solution:** Re-run Activity 4B step 3 to add to PATH, then restart PowerShell.

---

### Issue 4: Disk Space Warning During Installation

**Cause:** Less than 100GB free disk space

**Solution:**
- Clean up unnecessary files (Downloads, temp files)
- Use `cleanmgr` on Windows or `sudo apt autoremove` on Ubuntu
- Consider using an external SSD (minimum 128GB, USB 3.0+)

---

### Issue 5: Geth Shows "Fatal: Failed to write genesis block"

**Cause:** Corrupted data directory from previous attempt

**Solution:**
Delete the data directory and recreate:

**WSL:**
```bash
rm -rf ~/ethereum/sepolia/geth
mkdir ~/ethereum/sepolia/geth
```

**Windows:**
```powershell
Remove-Item -Recurse -Force "$HOME\ethereum\sepolia\geth"
New-Item -ItemType Directory -Path "$HOME\ethereum\sepolia\geth"
```

Then retry Activity 8.

---

### Issue 6: WSL Can't Access Internet

**Cause:** WSL networking not configured properly

**Solution:**
Test internet access:
```bash
ping 8.8.8.8
```

If it fails, restart WSL:
```powershell
wsl --shutdown
wsl
```

---

## ✅ Self-Assessment Quiz

Test your understanding before moving to Class 2.2:

### Question 1: Why do we need BOTH Geth and Lighthouse?

<details>
<summary>Answer</summary>

After Ethereum's transition to Proof-of-Stake (The Merge), the protocol split into two layers:

- **Execution Layer (Geth):** Handles transactions, smart contracts, EVM, and state
- **Consensus Layer (Lighthouse):** Handles block proposals, attestations, and proof-of-stake consensus

Geth cannot sync without a consensus client because Sepolia uses proof-of-stake. They communicate via authenticated RPC (using the jwtsecret file).
</details>

---

### Question 2: What is the purpose of the jwtsecret file?

<details>
<summary>Answer</summary>

The `jwtsecret` file contains a shared secret (JWT token) that enables **authenticated communication** between Geth and Lighthouse.

- Both clients must use the **same jwtsecret file**
- It prevents unauthorized access to the node's RPC endpoints
- It's a security measure to ensure only your consensus client can talk to your execution client
</details>

---

### Question 3: What's the difference between a full node and an archive node?

<details>
<summary>Answer</summary>

| Node Type | Description | Disk Space |
|-----------|-------------|------------|
| **Full Node** | Stores recent state (~128 blocks), prunes old state | ~800GB mainnet, ~50GB Sepolia |
| **Archive Node** | Stores ALL historical state since genesis block | ~12TB+ mainnet, ~500GB+ Sepolia |

**Full nodes are sufficient for development** because they store recent state and can query current balances, contract data, etc. Archive nodes are needed for block explorers or analytics that query very old historical state.
</details>

---

### Question 4: Why Sepolia instead of mainnet?

<details>
<summary>Answer</summary>

**Sepolia is a testnet**, which means:
- ✅ Free test ETH from faucets (no real money needed)
- ✅ Safe to experiment and make mistakes
- ✅ Faster sync (less historical data)
- ✅ Smaller disk space requirements
- ✅ Identical behavior to mainnet (proof-of-stake)

**Mainnet** uses real ETH with real value - not appropriate for learning!
</details>

---

### Question 5: What does `--syncmode snap` do?

<details>
<summary>Answer</summary>

`--syncmode snap` is Geth's default and recommended sync mode:

- **Snap sync** (snapshot sync) downloads a recent state snapshot first, then fills in transaction history
- Much faster than "full sync" which processes every transaction since genesis
- Results in a full node (not an archive node)
- Typically takes hours instead of days for Sepolia

**Alternative modes:**
- `full`: Processes every transaction from genesis (very slow)
- `light`: Minimal data, requests from full nodes (not recommended for development)
</details>

---

### Question 6: Why did we see "waiting for consensus client" when testing Geth alone?

<details>
<summary>Answer</summary>

Geth showed `WARN - waiting for consensus client` because:

- Sepolia uses **proof-of-stake consensus**
- Geth (execution client) cannot sync without a consensus client providing beacon chain data
- Lighthouse (consensus client) was not running yet
- Both must run **simultaneously** for the node to sync

This is expected behavior and confirms Geth is configured correctly! We'll run both together in Class 2.2.
</details>

---

### Question 7: What would happen if you used different jwtsecret files for Geth and Lighthouse?

<details>
<summary>Answer</summary>

**They wouldn't be able to communicate!**

- Geth would reject Lighthouse's authentication attempts
- Lighthouse would fail to connect to Geth's RPC endpoint
- You'd see errors like "JWT verification failed" or "connection refused"
- The node would not sync

**Both clients MUST use the exact same jwtsecret file** for authenticated communication to work.
</details>

---

## 🎯 Key Takeaways

After completing this class, remember these essential points:

1. **Ethereum nodes now require TWO components:**
   - Execution client (Geth) - handles transactions and smart contracts
   - Consensus client (Lighthouse) - handles proof-of-stake consensus

2. **Both clients must share a jwtsecret file** for authenticated communication

3. **Node types matter for your use case:**
   - Full node: Perfect for development (reasonable disk space, fast sync)
   - Archive node: Only needed for historical queries (huge disk space)

4. **Sepolia is the primary testnet** for application development (long-term support, post-merge)

5. **Running your own node provides:**
   - Privacy (no third-party sees your queries)
   - Reliability (no rate limits)
   - Trustlessness (you verify all data)
   - Decentralization (you contribute to network health)

6. **WSL Ubuntu is often easier** than native Windows for blockchain node setup (better documentation, Unix-style tools)

---

## 🔜 Next Steps

**Class 2.2: Node Operations and Monitoring**

In the next class, you'll:
- Run Geth and Lighthouse together simultaneously
- Monitor sync progress in real-time
- Understand blockchain data directories
- Learn about RPC endpoints and JSON-RPC
- Query your local node for blockchain data
- Set up basic node maintenance

**Before starting Class 2.2:**
- Ensure all deliverables above are complete
- Keep your JWT secret path handy (you'll need it!)
- Make sure you have ~100GB free disk space
- Be prepared for a 2-4 hour sync process (Sepolia)

---

## 👨‍🏫 Teaching Notes for Claude Code

**Pacing:**
- This class is installation-heavy - expect questions about paths, permissions, commands
- **DO NOT run commands for the user** - provide commands and wait for user to execute
- Break each activity into small steps; confirm each step before moving forward

**Common Struggles:**
- WSL vs Windows path confusion (`~` vs `$HOME` vs `C:\Users\...`)
- Understanding why TWO clients are needed (explain The Merge context)
- JWT secret concept (use analogy: "shared password between Geth and Lighthouse")

**Active Recall Opportunities:**
- "Do you remember from Week 1 what a testnet is? How is Sepolia different?"
- "We used an RPC endpoint in Week 1 - what were the downsides?"
- "Why do you think Ethereum split into execution and consensus layers?"

**Troubleshooting:**
- If user has installation issues, check PATH first
- If disk space is tight, discuss options (external drive, cloud instance)
- WSL networking issues can be tricky - `wsl --shutdown` often helps

**Encouragement:**
- Installing a full Ethereum node is a significant achievement!
- Many developers never run their own node - this is valuable hands-on experience
- Troubleshooting installation issues is real-world DevOps practice

---

## 📖 Reading References

**Bitcoin Book:**
- **Chapter 3:** Bitcoin Core - Running a Node, Getting Started
  - Concepts about running full nodes apply to Ethereum
  - Node selection and configuration principles
  - Blockchain data directory structure

**Ethereum Book:**
- **Chapter 3:** Clients - Running an Ethereum Client
  - Ethereum-specific client types (execution and consensus)
  - Client diversity importance
  - Network requirements and configuration

**Additional Reading (Optional):**
- Geth documentation: https://geth.ethereum.org/docs
- Lighthouse Book: https://lighthouse-book.sigmaprime.io/
- Ethereum.org - Run a Node: https://ethereum.org/en/developers/docs/nodes-and-clients/run-a-node/

---

**Estimated Time:** 2-3 hours (installation + verification)

**Next Class:** [Class 2.2: Node Operations and Monitoring](week2-class2.2-node-operations.md)

---

*Last Updated: 2025-10-27*
