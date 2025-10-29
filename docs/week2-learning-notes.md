# Week 2 Learning Notes
## Running Your First Ethereum Node

**Week Duration:** 2025-10-29 (in progress)
**Status:** 🔄 Class 2.1 Complete | Class 2.2 & 2.3 Pending

---

## Session: 2025-10-29

### Week 2, Class 2.1: Installing and Configuring Geth - COMPLETE ✅

**Context:** Starting Week 2 after completing Week 1 (environment setup, blockchain theory, first smart contract deployed to Sepolia)

---

#### Installation Environment Decision

**Question: WSL Ubuntu vs Native Windows?**
- **User has:** WSL with Ubuntu 24.04.1 LTS (alongside Docker Desktop)
- **Discovery:** User was initially in Docker Desktop's WSL environment (not Ubuntu)
- **Resolution:** Learned to launch specific Ubuntu distribution: `wsl -d Ubuntu`
- **Decision:** Use WSL Ubuntu (recommended path for easier Ethereum node setup)

**System Specs Verified:**
- ✅ Ubuntu 24.04.1 LTS
- ✅ 278GB free disk space (more than enough for Sepolia ~50GB)
- ✅ Kernel: 5.15.167.4-microsoft-standard-WSL2
- ✅ Low memory usage (3%)

---

#### Geth Installation (Execution Client)

**Installation Method:** Ubuntu PPA (Personal Package Archive)

**Commands executed:**
```bash
sudo apt update
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt update
sudo apt install -y geth
```

**Result:**
- ✅ **Geth v1.16.5-stable** installed successfully
- ✅ Go Version: go1.25.1
- ✅ Architecture: amd64
- ✅ Git Commit: 737ffd1bf0cbee378d0111a5b17ae4724fb2216c

**Verification:**
```bash
geth version
```

---

#### Lighthouse Installation (Consensus Client)

**Installation Method:** Manual download from GitHub releases

**Commands executed:**
```bash
cd ~
wget https://github.com/sigp/lighthouse/releases/download/v6.0.1/lighthouse-v6.0.1-x86_64-unknown-linux-gnu.tar.gz
tar -xzf lighthouse-v6.0.1-x86_64-unknown-linux-gnu.tar.gz
sudo mv lighthouse /usr/local/bin/
rm lighthouse-v6.0.1-x86_64-unknown-linux-gnu.tar.gz
```

**Result:**
- ✅ **Lighthouse v6.0.1-0d90135** installed successfully
- ✅ BLS hardware acceleration: **true**
- ✅ SHA256 hardware acceleration: **true**
- ✅ Profile: maxperf
- ✅ Allocator: jemalloc

**Verification:**
```bash
lighthouse --version
```

---

#### Directory Structure Created

**Commands executed:**
```bash
mkdir -p ~/ethereum/sepolia/geth
mkdir -p ~/ethereum/sepolia/lighthouse
mkdir -p ~/ethereum/sepolia/jwt
```

**Structure:**
```
~/ethereum/sepolia/
├── geth/         (Geth execution data)
├── lighthouse/   (Lighthouse consensus data)
└── jwt/          (JWT secret for authentication)
```

**Verification:**
```bash
ls -la ~/ethereum/sepolia/
```

---

#### JWT Secret Generation

**What is JWT?**
- **JWT = JSON Web Token**
- Shared secret (like a password) enabling authenticated communication between Geth and Lighthouse
- Both clients must use the **exact same JWT secret file** to verify each other

**User Question:** "How will Geth and Lighthouse read the file if only owner can read/write?"
- **Answer:** Geth and Lighthouse run as the user (vitor), so they inherit user's file permissions
- `chmod 600` prevents OTHER users/processes from accessing it, but allows user's processes

**Commands executed:**
```bash
openssl rand -hex 32 > ~/ethereum/sepolia/jwt/jwtsecret
cat ~/ethereum/sepolia/jwt/jwtsecret  # Verify 64-character hex string
chmod 600 ~/ethereum/sepolia/jwt/jwtsecret  # Secure permissions
```

**Result:**
- ✅ JWT secret generated (64-character hex string)
- ✅ Permissions set to 600 (owner read/write only)

---

#### Geth Verification Test

**Command executed:**
```bash
geth --sepolia --datadir ~/ethereum/sepolia/geth --authrpc.jwtsecret ~/ethereum/sepolia/jwt/jwtsecret --http --http.api eth,net,web3 --syncmode snap
```

**Expected Behavior:** ✅ CONFIRMED
- ✅ "Loaded JWT secret file" - JWT found and loaded
- ✅ "HTTP server started endpoint=127.0.0.1:8545" - RPC endpoint ready
- ✅ "Started P2P networking" - Connecting to Ethereum peers
- ✅ "Chain ID: 11155111 (sepolia)" - Correct network
- ⚠️ "Beacon client online, but no consensus updates received" - Expected! (Lighthouse not running)

**User stopped Geth with Ctrl+C** ✅

---

#### Lighthouse Verification Test

**⚠️ CRITICAL ISSUE: Checkpoint Sync URL Problems**

**Attempt 1: ethstaker.cc (from class guide)**
```bash
lighthouse bn --network sepolia --datadir ~/ethereum/sepolia/lighthouse --execution-endpoint http://localhost:8551 --execution-jwt ~/ethereum/sepolia/jwt/jwtsecret --checkpoint-sync-url https://sepolia.beaconstate.ethstaker.cc
```

**Result:** ❌ FAILED
- Error: `dns error: failed to lookup address information: Name or service not known`
- **User's diagnosis:** "URL doesn't exist anymore" (correct!)
- Verified with `curl https://sepolia.beaconstate.ethstaker.cc/` → "Could not resolve host"

**Attempt 2: ethPandaOps (Ethereum Foundation)**
```bash
lighthouse bn --network sepolia --datadir ~/ethereum/sepolia/lighthouse --execution-endpoint http://localhost:8551 --execution-jwt ~/ethereum/sepolia/jwt/jwtsecret --checkpoint-sync-url https://checkpoint-sync.sepolia.ethpandaops.io
```

**Result:** ❌ FAILED
- Error: `InvalidSsz(OffsetSkipsVariableBytes(2737225))`
- Checkpoint data format incompatible with Lighthouse v6.0.1

**Attempt 3: Genesis sync (without checkpoint)**
```bash
lighthouse bn --network sepolia --datadir ~/ethereum/sepolia/lighthouse --execution-endpoint http://localhost:8551 --execution-jwt ~/ethereum/sepolia/jwt/jwtsecret
```

**Result:** ❌ BLOCKED
- Lighthouse refused: "Syncing from genesis is insecure and incompatible with data availability checks"
- Requires either `--checkpoint-sync-url` OR `--allow-insecure-genesis-sync`

**Attempt 4: Allow insecure genesis sync (for verification test only)**
```bash
lighthouse bn --network sepolia --datadir ~/ethereum/sepolia/lighthouse --execution-endpoint http://localhost:8551 --execution-jwt ~/ethereum/sepolia/jwt/jwtsecret --allow-insecure-genesis-sync
```

**Result:** ✅ SUCCESS (for verification purposes)
- ✅ "Lighthouse started version: Lighthouse/v6.0.1-0d90135"
- ✅ "Block production enabled" with JWT path correctly loaded
- ✅ "Beacon chain initialized head_slot: 0"
- ✅ "Libp2p Starting" - P2P networking started
- ✅ "Listening established" on ports 9000 (TCP) and 9001 (QUIC)
- ❌ "Error connecting to eth1 node endpoint" - **EXPECTED!** (Geth not running)
- ❌ "Connection refused (os error 111)" - **PERFECT!** This is what we wanted to see

**User stopped Lighthouse with Ctrl+C** ✅

---

#### Key Technical Concepts Learned

**1. Execution vs Consensus Clients**

**User's insight:** "For resilience?" (correct intuition!)

**Why Ethereum split into two clients:**
1. **Separation of concerns** - Execution logic (smart contracts) separate from consensus logic (proof-of-stake)
2. **Client diversity (resilience!)** - Different teams build different clients; if one has a bug, network doesn't fail
3. **Modularity** - Easier to upgrade one layer without breaking the other

**2. Beacon Chain**

**User question:** "What is a beacon in this context?"

**Answer:**
- **Beacon Chain = Ethereum's proof-of-stake consensus layer**
- Acts as a coordinator/beacon for validators
- "Beacons" (signals) which blocks are valid
- Validators follow the beacon to reach consensus

**Analogy:**
- **Geth (Execution)** = The worker who processes transactions
- **Lighthouse (Beacon)** = The manager who decides which work is valid

**3. Checkpoint Sync**

**User question:** "Why are we referencing an external server for our sync url?"

**Explanation:**
- **Without checkpoint sync:** Sync entire Beacon Chain from genesis (days/week)
- **With checkpoint sync:** Download recent checkpoint, sync forward from there (hours)

**Tradeoff:**
- ✅ Speed (hours vs days)
- ⚠️ Trust checkpoint provider initially
- ✅ After initial sync, node validates all future blocks itself (becomes trustless going forward)

**User's decision:** "I'm comfortable with checkpoint" (pragmatic choice for learning/testnet)

---

#### Issues Encountered & Solutions

**Issue 1: Docker Desktop vs Ubuntu WSL**
- **Problem:** User was in Docker Desktop's internal environment initially
- **Symptom:** `/etc/os-release` showed "Docker Desktop", paths like `/mnt/host/c/...`
- **Solution:** Use `wsl -d Ubuntu` to launch Ubuntu distribution specifically

**Issue 2: Checkpoint Sync URL Doesn't Exist**
- **Problem:** `sepolia.beaconstate.ethstaker.cc` no longer resolves (URL outdated in class guide)
- **User's diagnosis:** Correctly identified as non-existent URL (not connectivity issue)
- **Attempted workaround:** Tried `checkpoint-sync.sepolia.ethpandaops.io` (also failed with SSZ format error)
- **Temporary solution:** Used `--allow-insecure-genesis-sync` for verification test only
- **⚠️ MUST RESOLVE IN CLASS 2.2:** Find working checkpoint sync URL or alternative approach

**Issue 3: Lighthouse Checkpoint SSZ Format Error**
- **Problem:** `InvalidSsz(OffsetSkipsVariableBytes(2737225))` with ethPandaOps checkpoint
- **Possible causes:**
  - Checkpoint data format incompatible with Lighthouse v6.0.1
  - Checkpoint might be for different network or corrupted
  - Lighthouse version might be too old/new for available checkpoints
- **⚠️ TODO FOR CLASS 2.2:**
  - Research working Sepolia checkpoint sync URLs for Lighthouse v6.0.1
  - Consider updating Lighthouse to latest version if needed
  - Check Lighthouse documentation for recommended checkpoint providers

---

#### User Learning & Engagement Highlights

**Strong Conceptual Understanding:**
- ✅ Connected "resilience" to client diversity (blockchain fundamentals)
- ✅ Understood trustless concept (Week 1 callback)
- ✅ Asked about file permissions security (chmod 600 JWT secret)
- ✅ Questioned checkpoint sync tradeoffs (trust vs speed)

**Excellent Debugging Skills:**
- ✅ Diagnosed checkpoint URL as non-existent (not connectivity issue)
- ✅ Verified with `curl` command before trying alternative
- ✅ Good instinct to test basic connectivity (`ping 8.8.8.8`)

**Active Learning:**
- ✅ Asked clarifying questions (JWT, Beacon Chain, checkpoint sync)
- ✅ Understood tradeoffs and made pragmatic decisions
- ✅ Comfortable with temporary workarounds for testing

---

#### Class 2.1 Deliverables - ALL COMPLETE ✅

- [x] ✅ **Geth v1.16.5** installed and verified (`geth version` works)
- [x] ✅ **Lighthouse v6.0.1** installed and verified (`lighthouse --version` works)
- [x] ✅ **Data directories** created (`~/ethereum/sepolia/{geth,lighthouse,jwt}`)
- [x] ✅ **JWT secret** generated and secured (64-char hex, chmod 600)
- [x] ✅ **Test runs successful** (both clients start, load JWT, attempt to communicate)
- [x] ✅ **Understanding** of execution vs consensus clients, Beacon Chain, JWT authentication

---

#### Next Steps for Class 2.2

**⚠️ CRITICAL: Resolve Checkpoint Sync Issue**

**Options to explore:**
1. **Find working Sepolia checkpoint URL for Lighthouse v6.0.1:**
   - Check https://eth-clients.github.io/checkpoint-sync-endpoints/
   - Try other public endpoints (Infura, Alchemy, QuickNode)
   - Consult Lighthouse Discord/GitHub for recommendations

2. **Update Lighthouse to latest version:**
   - Check if v6.0.1 is outdated
   - Latest version might have better checkpoint compatibility

3. **Alternative sync strategies:**
   - Use `--allow-insecure-genesis-sync` temporarily (accept slower sync)
   - Run on mainnet instead (more checkpoint providers available)
   - Use a different consensus client temporarily (Prysm, Teku)

**Class 2.2 Activities:**
- Run Geth and Lighthouse together simultaneously
- Monitor sync progress in real-time
- Understand blockchain data directories
- Query local node via RPC
- Set up basic node maintenance

**Before starting Class 2.2:**
- ✅ All Class 2.1 deliverables complete
- ✅ JWT secret path known: `~/ethereum/sepolia/jwt/jwtsecret`
- ✅ 278GB free disk space confirmed
- ⚠️ Checkpoint sync URL issue documented (needs resolution)

---

#### Commands Summary (For Reference)

**WSL Ubuntu Launch:**
```bash
wsl -d Ubuntu  # Launch Ubuntu distribution specifically
```

**Geth Commands:**
```bash
geth version  # Verify installation
geth --sepolia --datadir ~/ethereum/sepolia/geth --authrpc.jwtsecret ~/ethereum/sepolia/jwt/jwtsecret --http --http.api eth,net,web3 --syncmode snap  # Test run
```

**Lighthouse Commands:**
```bash
lighthouse --version  # Verify installation
lighthouse bn --network sepolia --datadir ~/ethereum/sepolia/lighthouse --execution-endpoint http://localhost:8551 --execution-jwt ~/ethereum/sepolia/jwt/jwtsecret --allow-insecure-genesis-sync  # Test run (temporary workaround)
```

**JWT Management:**
```bash
cat ~/ethereum/sepolia/jwt/jwtsecret  # View JWT secret
chmod 600 ~/ethereum/sepolia/jwt/jwtsecret  # Set secure permissions
```

---

#### Questions to Explore in Class 2.2

- [x] ✅ Which checkpoint sync URL works reliably for Sepolia + Lighthouse v6.0.1? **RESOLVED: v8.0.0-rc.2 needed, not v6.0.1**
- [x] ✅ How long does genesis sync actually take on Sepolia? **N/A - checkpoint sync works with v8.0.0-rc.2**
- [x] ✅ Should we upgrade Lighthouse to a newer version? **YES - upgraded to v8.0.0-rc.2**
- [x] ✅ What's the difference between "snap sync" (Geth) and checkpoint sync (Lighthouse)? **Learned in Class 2.2**
- [x] ✅ How do we know when the node is fully synced? **`eth_syncing` returns `false`**
- [x] ✅ What RPC endpoints can we query once synced? **Explored in Class 2.2**

---

### Week 2, Class 2.2: Node Operations and Monitoring - COMPLETE ✅

**Context:** Continuing from Class 2.1 with both Geth v1.16.5 and Lighthouse v8.0.0-rc.2 installed and checkpoint sync working

**Duration:** ~1.5 hours (2025-10-29, 10:29 AM - 12:07 PM)

---

#### Running Geth and Lighthouse Together

**Terminal Setup:**
- Used Windows Terminal with multiple tabs (Option A)
- Terminal 1: Geth (execution client)
- Terminal 2: Lighthouse (consensus client)
- Terminal 3: Query/management terminal

**User Question:** "When I start a new terminal, doesn't mean I'm starting a new server, right?"
- ✅ Correct understanding: New terminal = new connection to same WSL instance
- Analogy: Same house, different windows

**Geth Startup:**
```bash
geth --sepolia --datadir ~/ethereum/sepolia/geth --authrpc.jwtsecret ~/ethereum/sepolia/jwt/jwtsecret --http --http.api eth,net,web3 --syncmode snap
```

**Results:**
- ✅ JWT secret loaded
- ✅ HTTP server started (127.0.0.1:8545)
- ✅ Authenticated Engine API (127.0.0.1:8551)
- ✅ P2P networking started

**Lighthouse Startup:**
```bash
lighthouse bn --network sepolia --datadir ~/ethereum/sepolia/lighthouse --execution-endpoint http://localhost:8551 --execution-jwt ~/ethereum/sepolia/jwt/jwtsecret --checkpoint-sync-url https://checkpoint-sync.sepolia.ethpandaops.io
```

**Results:**
- ✅ Connected to Geth successfully (no more "connection refused"!)
- ✅ Checkpoint state loaded from disk
- ✅ 7 peers connected initially
- ⚠️ "Unsupported fork" warnings (Osaka fork - expected with v8.0.0-rc.2 + Geth v1.16.5)

---

#### Understanding "Syncing" Concept

**User Question:** "Explain what does it mean to be syncing... I'm a node on the ethereum network? Not quite, right?"

**Key Clarification:**
- ✅ **You ARE a node** (connected to network, 16 peers)
- ✅ Downloading blockchain data
- ✅ Verifying cryptographic proofs
- ❌ **Can't reliably answer queries yet** (data incomplete)
- ❌ **Not a validator** (no 32 ETH stake, not producing blocks)

**Node Types Learned:**
1. **Full Node** (you, when synced) - validates blocks, queries data, no rewards
2. **Archive Node** - stores ALL history (terabytes)
3. **Validator** - full node + 32 ETH stake + validator keys = earns rewards

**Syncing Process:**
```
Checkpoint (started at slot 8,833,248)
    ↓
Downloading blocks forward
    ↓
Geth verifying execution payloads (catching up)
    ↓
Lighthouse ahead (optimistic sync)
    ↓
FULLY SYNCED (goal)
```

---

#### Data Directory Exploration

**Geth Directory Size:**
- Initial: 73GB at ~42% sync
- Projected final: ~100-150GB (Sepolia full node)

**Lighthouse Directory Size:**
- 2.0GB (consensus data)

**Ratio:** Geth uses **36.5× more space** than Lighthouse!

**Why the difference:**
- **Geth (Execution):** Account balances, smart contract storage, transaction history, contract bytecode, receipts
- **Lighthouse (Consensus):** Beacon blocks, attestations, validator votes, finality checkpoints

**Analogy:**
- Geth = Entire company database (all customer data, transactions)
- Lighthouse = Meeting minutes (who voted yes/no)

**Discovery:** `du -sh` can fail on active database (`.sst` files being compacted)
- Solution: `du -sh ~/ethereum/sepolia/geth/ 2>/dev/null` (suppress errors)

---

#### Sync Modes Explained

**Three Geth Sync Modes:**

1. **Full Sync** (slowest)
   - Time: Weeks to months
   - Disk: ~1TB+ (mainnet)
   - Replays EVERY transaction since 2015

2. **Fast Sync** (deprecated)
   - Time: Days
   - Disk: ~500GB
   - Downloads recent state + some history

3. **Snap Sync** (what we're using!)
   - Time: 4-12 hours (Sepolia)
   - Disk: 100-150GB
   - Downloads latest snapshot + forward sync
   - **Like cliff notes + latest updates**

**User insight:** "It's a snapshot synchronization that runs faster" ✅

**Snap Sync Data Stored:**
- ✅ Block headers (all blocks, back to genesis)
- ✅ Block bodies (transactions)
- ✅ Recent state snapshot (current balances, storage)
- ❌ Historical state (can't query old balances)

**Testing:**
```bash
curl eth_getBlockByNumber("0x1")  # Block #1 - SUCCESS!
```
Result: You have block data, but not historical state replay capability.

---

#### Peer Discovery and Networking

**Peer Count Check:**
```bash
curl eth_peerCount → "0x10" (16 peers in hex)
```

**Admin Commands Security:**
```bash
curl admin_peers → Error: "method does not exist/is not available"
```

**Why blocked over HTTP:**
- HTTP can be exposed to network (remote access)
- Admin commands only via IPC (local-only)
- Security principle: Admin operations require "physical" access

**Using IPC (geth attach):**
```bash
geth attach ~/ethereum/sepolia/geth/geth.ipc
> admin.peers.length
16
```

**Key Difference:**
- **HTTP (curl):** JSON-RPC formatting, remote possible, limited APIs, good for scripts
- **IPC (geth attach):** Interactive JavaScript console, local-only, full admin access, great for debugging

---

#### Systemd Services Setup

**Created Service Files:**

**1. Geth Service (`/etc/systemd/system/geth-sepolia.service`):**
```ini
[Unit]
Description=Geth Ethereum Node (Sepolia)
After=network.target

[Service]
Type=simple
User=vitor
ExecStart=/usr/bin/geth --sepolia --datadir /home/vitor/ethereum/sepolia/geth ...
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**User insight:** "`Restart=on-failure` will restart if something happens" ✅

**2. Lighthouse Service (`/etc/systemd/system/lighthouse-sepolia.service`):**
```ini
[Unit]
Description=Lighthouse Beacon Node (Sepolia)
After=network.target
Wants=geth-sepolia.service  # Soft dependency

[Service]
Type=simple
User=vitor
ExecStart=/usr/local/bin/lighthouse bn --network sepolia ...
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**User insight:** "`Wants=geth-sepolia.service` because it depends on it" ✅

**Dependency Types:**
- `Wants=` - Soft dependency (start anyway, wait for Geth)
- `Requires=` - Hard dependency (don't start without it)

**Service Management:**
```bash
sudo systemctl daemon-reload          # Reload service definitions
sudo systemctl start geth-sepolia     # Start service
sudo systemctl status geth-sepolia    # Check status
sudo systemctl enable geth-sepolia    # Auto-start on boot
sudo journalctl -u geth-sepolia -f    # Follow live logs
```

**Benefits:**
- ✅ Auto-start on boot
- ✅ Auto-restart on crash
- ✅ Run in background (no terminal needed)
- ✅ Simple management commands

---

#### Helper Script Creation

**Created `~/ethereum/node-manager.sh`:**
- start/stop/restart commands
- status checks for both nodes
- sync progress (with jq formatting)
- live log viewing
- Help menu

**Made executable:**
```bash
chmod +x ~/ethereum/node-manager.sh
```

**User insight:** "to be executable" ✅ (chmod +x adds execute permission)

**Optional alias setup:**
```bash
echo 'alias nodes="~/ethereum/node-manager.sh"' >> ~/.bashrc
source ~/.bashrc
```

**How it works:**
- `echo ... >> ~/.bashrc` - Appends alias to bash config (doesn't overwrite)
- `source ~/.bashrc` - Reloads config in current session (no new terminal needed)
- `>>` vs `>` - Append vs overwrite

**Result:** Simple commands like `nodes status`, `nodes sync`, `nodes logs-geth`

---

#### Sync Progress Throughout Session

**Progression:**
- Start (10:29): ~36% (3,422,195 / 9,515,090 blocks)
- +5 min: 42% (3,957,446 blocks)
- +10 min: 47% (4,455,186 blocks)
- +20 min: 49% (4,662,569 blocks)
- End (12:07): **~56%** (5,301,214 / 9,515,525 blocks)

**Gained: 20% progress in ~1.5 hours**

**Non-linear sync pattern observed:**
- Early: 6% gain in 10 minutes
- Middle: 5% gain in 5 minutes
- Later: 2% gain in 10 minutes
- Slowing down as expected (recent blocks more complex)

**Disk Usage:**
- Geth: 73GB at 42% sync
- Projected: ~100-150GB when complete

---

#### Technical Concepts Mastered

**1. Execution vs Consensus Split**
- **Why:** Resilience (client diversity), modularity (easier upgrades), separation of concerns
- **Analogy:** Geth (worker processing transactions) + Lighthouse (manager deciding validity)

**2. Optimistic Sync**
- Lighthouse accepts blocks before Geth fully verifies them
- "Head is optimistic" warning = normal during sync
- Once Geth catches up, head becomes "verified"

**3. Checkpoint Sync Benefits**
- Without: Sync from genesis (days/weeks)
- With: Download recent checkpoint + forward sync (hours)
- Tradeoff: Trust checkpoint provider initially, trustless after sync

**4. JWT Authentication**
- Shared secret between Geth and Lighthouse
- Both run as same user (vitor), so both can read JWT file
- `chmod 600` prevents OTHER users/processes from accessing

**5. Blob Data (EIP-4844)**
- Temporary data storage for Layer 2 rollups
- Makes L2s cheaper
- v8.0.0-rc.2 supports it, Geth v1.16.5 doesn't yet
- "Unsupported fork" warnings are non-blocking for learning

---

#### Issues Encountered & Solutions

**Issue 1: Osaka Fork Warnings**
- **Problem:** Recurring "Unsupported fork" errors from both clients
- **Cause:** Lighthouse v8.0.0-rc.2 (Osaka fork support) vs Geth v1.16.5 (no Osaka support)
- **Impact:** None - nodes sync successfully, basic operations work
- **Solution:** Acceptable for learning purposes (Option 1: continue as-is)

**Issue 2: Database File Access During `du` Command**
- **Problem:** `du: cannot access '...038393.sst': No such file or directory`
- **Cause:** Geth actively compacting LevelDB/RocksDB `.sst` files during scan
- **Solution:** `du -sh ~/ethereum/sepolia/geth/ 2>/dev/null` (suppress errors)

---

#### Key User Questions & Insights

**Excellent Questions:**
1. "When I start a new terminal that doesn't mean I'm starting a new server, right?" ✅ Correct understanding
2. "Why will Geth and Lighthouse read the file if only owner can read/write?" (JWT permissions) ✅ Good security thinking
3. "Explain what does it mean to be syncing... I'm a node, not quite right?" ✅ Subtle understanding needed
4. "Because it depends on it" (about `Wants=` directive) ✅ Correct
5. "To be executable" (chmod +x) ✅ Succinct and correct

**Strong Conceptual Understanding:**
- Connected "resilience" to client diversity
- Understood security tradeoffs (checkpoint trust vs speed)
- Grasped IPC vs HTTP security implications
- Recognized non-linear sync progression

---

#### Class 2.2 Deliverables - ALL COMPLETE ✅

- [x] ✅ **Both clients running together** (Geth + Lighthouse communicating via JWT)
- [x] ✅ **Understand syncing concept** (full node, not validator, optimistic sync)
- [x] ✅ **Data directory exploration** (73GB Geth, 2GB Lighthouse, 36.5× ratio)
- [x] ✅ **Sync modes explained** (full, fast, snap - why snap is best for learning)
- [x] ✅ **Node types clarified** (full, archive, validator)
- [x] ✅ **Peer discovery** (16 peers connected)
- [x] ✅ **Security understanding** (HTTP vs IPC, admin commands)
- [x] ✅ **Systemd services created** (auto-start, auto-restart, enabled on boot)
- [x] ✅ **Helper script created** (`node-manager.sh` with alias)
- [x] ✅ **Monitoring commands learned** (journalctl, systemctl status, eth_syncing)

---

#### Next Steps for Class 2.3

**Before starting Class 2.3:**
- ⏳ Wait for full sync (~2-3 more hours from 56%)
- ✅ Check sync status: `nodes sync` or `curl eth_syncing`
- ✅ When result is `false`, node is fully synced

**Class 2.3 Activities:**
- Get Sepolia ETH from faucets
- Verify balance using YOUR node (not Etherscan!)
- Understand testnet vs mainnet ETH
- Learn about faucet strategies

**Commands for when resuming:**
```bash
nodes status           # Check if nodes still running
nodes sync             # Check sync progress
nodes logs-geth        # View recent activity
```

---

#### Software/Tools Installed in Class 2.2

- `jq` (JSON formatter) - via `sudo apt install jq`

---

---

### Session: 2025-10-29 (Afternoon) - WSL Disk Space Issue & Hybrid Approach Decision

**Context:** Geth sync ran out of disk space at ~56%, causing WSL Ubuntu to become unresponsive

---

#### Issue: WSL Out of Disk Space

**What Happened:**
- Geth syncing consumed available disk space in WSL's virtual disk
- WSL Ubuntu became unresponsive (couldn't connect with `wsl -d Ubuntu`)
- Commands `wsl --terminate Ubuntu` and `wsl --shutdown` hung/froze

**Troubleshooting Steps Taken:**

1. **Freed 100GB on Windows C: drive** ✅
   - However, this doesn't directly help WSL's virtual disk (separate file)

2. **Identified WSL processes still running:**
   ```powershell
   Get-Process -Name "*wsl*", "*vmcompute*", "*vmmem*"
   ```
   Found 12 processes: vmcompute, vmmemWSL, wsl (4 instances), wslhost (4 instances), wslrelay, wslservice

3. **Force-killed WSL processes:**
   ```powershell
   Stop-Process -Id 432, 42772, 19884, 26896, 35696, 39444, 2348, 3064, 40068, 40244, 35268, 9840 -Force
   ```
   Successfully stopped most processes, 3 stubborn ones remained initially

4. **Verified WSL stopped cleanly:**
   ```powershell
   wsl --list --verbose
   ```
   Result: Both `docker-desktop` and `Ubuntu` showing `STATE: Stopped` ✅

5. **Attempted to restart WSL:**
   ```powershell
   wsl -d Ubuntu
   ```
   **Error:** `Failed to attach disk 'ext4.vhdx'... ERROR_SHARING_VIOLATION`
   - Virtual disk file still locked by another process
   - File handle not released despite killing processes

**Resolution Strategy:** Physical machine reboot (cleanest way to release file locks)

---

#### Technical Concepts Learned

**1. WSL Virtual Disk Architecture**
- WSL stores Linux filesystem in `ext4.vhdx` (virtual hard disk)
- Location: `C:\Users\USERNAME\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu_...\LocalState\ext4.vhdx`
- Disk space INSIDE WSL is separate from Windows C: drive free space
- Even with 100GB free on C:, WSL's virtual disk can be full

**2. WSL Process Structure**
- `vmcompute` - Manages virtual machine compute resources
- `vmmemWSL` - Virtual machine memory management (71MB working set in our case)
- `wsl` - WSL command instances (multiple can run)
- `wslhost` - Hosts WSL instances
- `wslrelay` - Relays communication between Windows and WSL
- `wslservice` - Core WSL service

**3. File Locking in Windows**
- `ERROR_SHARING_VIOLATION` = file is open/locked by another process
- Can happen even after processes are killed (file handles not released)
- Reboot is most reliable way to release all file locks

**4. Geth Sync Space Requirements (Reminder)**
- Sepolia testnet: ~100-150GB final size
- At 56% sync: Already consuming ~73GB
- Non-linear growth (recent blocks more complex, more state)

---

#### Hybrid Approach Decision

**User's Decision:** Use hybrid strategy for learning efficiency ✅

**Phase 1 (Weeks 2-10): Use Infura/Alchemy**
- ✅ No disk space issues
- ✅ Instant access (no sync wait)
- ✅ Focus on smart contract development (Solidity, Hardhat, testing)
- ✅ Always up-to-date blockchain state
- ❌ Trade-off: Not fully trustless (relying on RPC provider)

**Phase 2 (Week 11+): Return to Local Node**
- When Go event listener needs direct node access
- More disk space available by then
- Better understanding of why local node matters
- Time to troubleshoot properly

**Rationale:**
- **Learning priority:** Smart contracts > infrastructure (for now)
- **Practical constraints:** Disk space, sync time, WSL complications
- **Portfolio value:** Can demonstrate both approaches
- **Educational:** Understanding trade-offs (sovereignty vs convenience)

---

#### Why Run Local Node vs RPC Provider? (Revisited)

**User Question:** "Why do we want Geth and the other one running locally?"

**Reasons for Local Node:**
1. **Self-sovereignty & Trust** - Verify data yourself, no third-party trust
2. **No Limits** - Query any data without rate limits/API keys
3. **Deep Learning** - Understand infrastructure, P2P, consensus
4. **Portfolio Value** - Shows DevOps skills, node operation experience
5. **Course Needs** - Week 11 event listener, Week 25 MEV protection

**Reasons for RPC Provider (Short-Term):**
1. **No Disk Space Issues** - Provider handles storage
2. **Instant Access** - No sync wait (hours/days)
3. **Focus on Development** - More time on smart contracts
4. **Always Updated** - Provider maintains nodes
5. **Lower Complexity** - Fewer moving parts to troubleshoot

**Decision:** RPC provider now, local node later (pragmatic approach)

---

#### Next Steps After Reboot

**Immediate Actions:**
1. ✅ Reboot physical machine (releases ext4.vhdx file lock)
2. ✅ Verify WSL starts: `wsl -d Ubuntu`
3. ✅ Check disk usage: `df -h ~` and `du -sh ~/ethereum/sepolia/geth/`
4. ✅ Delete Geth sync data: `rm -rf ~/ethereum/sepolia/geth/`
   - Frees ~73GB inside WSL virtual disk
   - Keep installation, scripts, and directory structure
5. ✅ Set up Infura account and API key
6. ✅ Test Infura connection with sample RPC call
7. ✅ Continue with Week 2 Class 2.3 (Getting Testnet ETH)

**Files/Tools to Keep:**
- ✅ Geth binary (`/usr/bin/geth`)
- ✅ Lighthouse binary (`/usr/local/bin/lighthouse`)
- ✅ Systemd service files (`/etc/systemd/system/geth-sepolia.service`, `lighthouse-sepolia.service`)
- ✅ Helper script (`~/ethereum/node-manager.sh`)
- ✅ Directory structure (`~/ethereum/sepolia/{geth,lighthouse,jwt}`)
- ✅ JWT secret (`~/ethereum/sepolia/jwt/jwtsecret`)

**Files to Delete:**
- ❌ Geth sync data (`~/ethereum/sepolia/geth/` contents - ~73GB)

**Reason:** Infrastructure is ready for Week 11 when we return to local node

---

#### Week 2 Status

- [x] ✅ **Class 2.1:** Installing and Configuring Geth (COMPLETE)
- [x] ✅ **Class 2.2:** Node Operations and Monitoring (COMPLETE)
- [ ] 🔜 **Class 2.3:** Getting Testnet ETH (PENDING - switching to Infura approach)

**Sync Status:** Abandoned at ~56% due to disk space constraints. Will return to local node in Week 11.

**Current Status:** Awaiting reboot to fix WSL file lock, then switching to Infura/Alchemy for Weeks 2-10.

---

*Last Updated: 2025-10-29 (Afternoon session - pre-reboot)*
