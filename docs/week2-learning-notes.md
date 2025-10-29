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

- [ ] Which checkpoint sync URL works reliably for Sepolia + Lighthouse v6.0.1?
- [ ] How long does genesis sync actually take on Sepolia? (if we can't fix checkpoint sync)
- [ ] Should we upgrade Lighthouse to a newer version?
- [ ] What's the difference between "snap sync" (Geth) and checkpoint sync (Lighthouse)?
- [ ] How do we know when the node is fully synced?
- [ ] What RPC endpoints can we query once synced?

---

*Last Updated: 2025-10-29*
