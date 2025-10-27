# Week 2 - Class 2.2: Node Operations and Monitoring

**Duration:** 3-4 hours (includes sync time)
**Prerequisites:** Class 2.1 completed (Geth and Lighthouse installed)
**Goal:** Run a synced Sepolia node and understand node operations

---

## 📋 Overview

### What You'll Learn

In Class 2.1, you installed Geth and Lighthouse, but they weren't running together yet. In this class, you'll:

- **Start both clients simultaneously** and watch them sync
- **Monitor sync progress** in real-time
- **Understand what data is being downloaded** and where it's stored
- **Query your local node** using JSON-RPC
- **Learn node maintenance** basics (stopping, starting, checking status)

### The Sync Process

When you start your node for the first time, it needs to **sync with the Ethereum network**. This means:

1. **Lighthouse** downloads beacon chain data (consensus layer)
2. **Geth** downloads execution layer data (transactions, state)
3. Both clients communicate via the jwtsecret authentication
4. Your node becomes a full participant in the network

**Sepolia sync time:** ~2-4 hours (depending on internet speed and CPU)

**Why This Matters for FamilyChain:**

Running your own node means:
- You can deploy contracts without relying on third-party RPC providers
- Your family's transaction data stays private
- You understand the infrastructure your DApp runs on
- This is a **key DevOps skill** for blockchain developers

---

## 🎯 Learning Objectives

By the end of this class, you will be able to:

1. ✅ **Start Geth and Lighthouse** simultaneously with correct parameters
2. ✅ **Monitor sync progress** using console output and RPC queries
3. ✅ **Understand blockchain data directories** (what's stored where)
4. ✅ **Query your node** using JSON-RPC via curl/PowerShell
5. ✅ **Check node health** (peer count, sync status, latest block)
6. ✅ **Stop and restart** your node safely
7. ✅ **Understand RPC endpoints** and when to expose them

---

## 📚 Key Concepts

### 1. The Sync Process

Ethereum node synchronization happens in phases:

| Phase | Client | What's Happening | Duration (Sepolia) |
|-------|--------|------------------|---------------------|
| **1. Lighthouse Checkpoint Sync** | Consensus | Downloads recent beacon state from checkpoint URL | 5-10 minutes |
| **2. Lighthouse Backfill** | Consensus | Downloads historical beacon blocks | 30-60 minutes |
| **3. Geth Snap Sync** | Execution | Downloads recent state snapshot | 1-2 hours |
| **4. Geth Historical Blocks** | Execution | Downloads transaction history | 1-2 hours |
| **5. Final Sync** | Both | Catches up to network head | 10-20 minutes |

**Total time: 2-4 hours** for Sepolia (mainnet takes days!)

**Checkpoint sync:** Instead of downloading every block from genesis, Lighthouse starts from a recent trusted checkpoint (much faster!). This is why we use `--checkpoint-sync-url` parameter.

### 2. RPC Endpoints

Your node exposes **RPC endpoints** (Remote Procedure Call) that let applications interact with it.

**Geth RPC Types:**

| RPC Type | Port | Purpose | Should Expose? |
|----------|------|---------|----------------|
| **HTTP RPC** | 8545 | General queries (balances, contract calls) | ✅ Localhost only |
| **WebSocket RPC** | 8546 | Real-time subscriptions (new blocks, events) | ⚠️ Optional |
| **Auth RPC** | 8551 | Authenticated communication with Lighthouse | ❌ Never expose externally! |

**JSON-RPC:** The protocol used to communicate with Ethereum nodes. Example:

```json
{
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": [],
  "id": 1
}
```

**Your node becomes an RPC provider!** Just like `ethereum-sepolia-rpc.publicnode.com` you used in Week 1, but now it's YOUR node at `http://localhost:8545`.

### 3. Data Directory Structure

After syncing, your data directory looks like this:

```
~/ethereum/sepolia/  (or %HOME%\ethereum\sepolia\)
│
├── geth/
│   ├── geth/
│   │   ├── chaindata/     ← Blockchain data (blocks, state)
│   │   ├── lightchaindata/
│   │   ├── nodes/         ← Peer information
│   │   └── LOCK           ← Prevents multiple instances
│   ├── geth.ipc           ← Unix socket for local communication
│   └── keystore/          ← (Empty for now, Week 3)
│
├── lighthouse/
│   ├── beacon/
│   │   ├── chain_db/      ← Beacon chain database
│   │   └── network/       ← P2P networking data
│   └── validator/         ← (Not used for beacon node only)
│
└── jwt/
    └── jwtsecret          ← Shared authentication secret
```

**Disk usage after full Sepolia sync:**
- Geth: ~30-40GB
- Lighthouse: ~5-10GB
- **Total: ~40-50GB**

### 4. Node Peering

Your node connects to other nodes (peers) to:
- Download blockchain data
- Receive new blocks and transactions
- Propagate your transactions to the network

**Healthy peer count:**
- Geth: 20-50 peers
- Lighthouse: 50-100 peers

**If peer count is low (<10), your node might:**
- Sync slowly
- Miss some transactions
- Have trouble propagating your transactions

### 5. Sync Modes

Geth supports multiple sync modes:

| Sync Mode | Description | Time | Disk | Use Case |
|-----------|-------------|------|------|----------|
| **Snap** | Download recent state snapshot first | Hours | ~40GB | **Recommended** ✅ |
| **Full** | Process every transaction from genesis | Days | ~40GB | Not needed for dev |
| **Light** | Minimal data, request from peers | Minutes | ~1GB | Testing only |

We'll use **snap sync** (Geth's default) - fastest way to get a full node.

---

## 🛠️ Hands-On Activities

### Activity 1: Open Two Terminal Windows

**Time:** 2 minutes

You'll need **two separate terminal windows**:
- **Terminal 1:** For Geth (execution client)
- **Terminal 2:** For Lighthouse (consensus client)

**Why two terminals?**
Both clients need to run simultaneously, and you want to see their logs in real-time.

**WSL Ubuntu:**
- Open PowerShell and type `wsl` (Terminal 1)
- Open a second PowerShell window and type `wsl` (Terminal 2)

**Windows Native:**
- Open two PowerShell windows

✅ **Two terminals ready!**

---

### Activity 2: Start Geth (Terminal 1)

**Time:** 5 minutes

**WSL Ubuntu - Terminal 1:**
```bash
geth \
  --sepolia \
  --datadir ~/ethereum/sepolia/geth \
  --authrpc.jwtsecret ~/ethereum/sepolia/jwt/jwtsecret \
  --http \
  --http.addr 127.0.0.1 \
  --http.port 8545 \
  --http.api eth,net,web3 \
  --syncmode snap \
  --gcmode archive
```

**Windows PowerShell - Terminal 1:**
```powershell
geth --sepolia --datadir "$HOME\ethereum\sepolia\geth" --authrpc.jwtsecret "$HOME\ethereum\sepolia\jwt\jwtsecret" --http --http.addr 127.0.0.1 --http.port 8545 --http.api eth,net,web3 --syncmode snap --gcmode archive
```

**Parameter Explanations:**

| Parameter | What It Does |
|-----------|-------------|
| `--sepolia` | Connect to Sepolia testnet |
| `--datadir <path>` | Where to store blockchain data |
| `--authrpc.jwtsecret <path>` | JWT secret for Lighthouse communication |
| `--http` | Enable HTTP RPC server |
| `--http.addr 127.0.0.1` | Only allow localhost connections (security!) |
| `--http.port 8545` | HTTP RPC port (default) |
| `--http.api eth,net,web3` | Which RPC APIs to expose |
| `--syncmode snap` | Use snap sync (fast) |
| `--gcmode archive` | Don't prune old state (keeps more data) |

**Expected Output (first few lines):**
```
INFO [10-27|10:00:00.000] Starting Geth on Sepolia testnet...
INFO [10-27|10:00:00.100] Maximum peer count                       ETH=50 LES=0 total=50
INFO [10-27|10:00:00.200] Smartcard socket not found, disabling    err="stat /run/pcscd/pcscd.comm: no such file or directory"
INFO [10-27|10:00:00.300] Set global gas cap                       cap=50,000,000
INFO [10-27|10:00:00.400] Allocated trie memory caches             clean=154.00MiB dirty=256.00MiB
INFO [10-27|10:00:00.500] Initialising Ethereum protocol           network=11155111 dbversion=<num>
INFO [10-27|10:00:00.600] Loaded JWT secret file                   path=/home/.../jwtsecret crc32=0x...
INFO [10-27|10:00:00.700] Started P2P networking                   self=enode://...@127.0.0.1:30303
INFO [10-27|10:00:00.800] IPC endpoint opened                      url=/home/.../geth.ipc
INFO [10-27|10:00:00.900] HTTP server started                      endpoint=127.0.0.1:8545 auth=false
INFO [10-27|10:00:01.000] WebSocket enabled                        url=ws://127.0.0.1:8551
WARN [10-27|10:00:01.100] Syncing not yet, waiting for consensus client...
```

**Key lines to look for:**
- ✅ `Loaded JWT secret file` - Authentication configured
- ✅ `HTTP server started` - RPC endpoint available at `http://localhost:8545`
- ⚠️ `Syncing not yet, waiting for consensus client` - Expected! Now start Lighthouse.

**Leave this terminal running!** Move to Terminal 2.

---

### Activity 3: Start Lighthouse (Terminal 2)

**Time:** 5 minutes

**WSL Ubuntu - Terminal 2:**
```bash
lighthouse bn \
  --network sepolia \
  --datadir ~/ethereum/sepolia/lighthouse \
  --execution-endpoint http://localhost:8551 \
  --execution-jwt ~/ethereum/sepolia/jwt/jwtsecret \
  --checkpoint-sync-url https://sepolia.beaconstate.ethstaker.cc \
  --http
```

**Windows PowerShell - Terminal 2:**
```powershell
lighthouse bn --network sepolia --datadir "$HOME\ethereum\sepolia\lighthouse" --execution-endpoint http://localhost:8551 --execution-jwt "$HOME\ethereum\sepolia\jwt\jwtsecret" --checkpoint-sync-url https://sepolia.beaconstate.ethstaker.cc --http
```

**Parameter Explanations:**

| Parameter | What It Does |
|-----------|-------------|
| `bn` | Run beacon node (not validator) |
| `--network sepolia` | Connect to Sepolia testnet |
| `--datadir <path>` | Where to store beacon chain data |
| `--execution-endpoint` | Geth's auth RPC URL (port 8551) |
| `--execution-jwt <path>` | JWT secret (same as Geth!) |
| `--checkpoint-sync-url` | Trusted checkpoint for fast sync |
| `--http` | Enable Lighthouse HTTP API (port 5052) |

**Expected Output (first few lines):**
```
Oct 27 10:00:00.000 INFO Lighthouse started                      version: v7.0.0
Oct 27 10:00:00.100 INFO Configured for network                  name: sepolia
Oct 27 10:00:00.200 INFO Data directory initialised              datadir: /home/.../lighthouse
Oct 27 10:00:00.300 INFO Starting checkpoint sync                url: https://sepolia.beaconstate.ethstaker.cc
Oct 27 10:00:01.000 INFO Checkpoint sync started                 remote_slot: 7234567, service: slot_notifier
Oct 27 10:00:02.000 INFO Downloading checkpoint state            downloaded: 25.5 MB, service: beacon
Oct 27 10:00:05.000 INFO Checkpoint sync complete                slot: 7234567, service: beacon
Oct 27 10:00:06.000 INFO Connected to execution endpoint         endpoint: http://localhost:8551
Oct 27 10:00:07.000 INFO Subscribed to head                      service: beacon
```

**Key lines to look for:**
- ✅ `Checkpoint sync complete` - Fast initial sync done!
- ✅ `Connected to execution endpoint` - Lighthouse talking to Geth!
- ✅ `Subscribed to head` - Following latest blocks

**Now watch both terminals!** You should see:

**Terminal 1 (Geth):**
```
INFO [10-27|10:00:07.100] Forkchoice requested sync to new head    number=4,567,890 hash=0x123abc...
INFO [10-27|10:00:07.200] Syncing beacon headers                   downloaded=1024 left=1234567 eta=1h23m45s
```

**Terminal 2 (Lighthouse):**
```
INFO Syncing                                  est_time: 1 hr 23 min, speed: 234.5 slots/sec
```

🎉 **Your node is syncing!**

---

### Activity 4: Monitor Sync Progress

**Time:** 2-4 hours (mostly waiting)

While your node syncs, you'll see continuous log output. Here's what to look for:

**Lighthouse (Terminal 2) - Beacon chain sync:**
```
INFO Syncing      est_time: 1 hr 15 min, speed: 256 slots/sec, peers: 67
INFO Syncing      est_time: 58 min, speed: 289 slots/sec, peers: 72
INFO Syncing      est_time: 32 min, speed: 312 slots/sec, peers: 81
...
INFO Synced       slot: 7234890, peers: 85
```

**Geth (Terminal 1) - Execution layer sync:**
```
INFO [10-27|10:15:23.456] Imported new chain segment               blocks=64 txs=1234 mgas=12.345 elapsed=1.234s mgasps=10.001
INFO [10-27|10:16:45.678] State heal in progress                   accounts=12345@1.23MiB slots=67890@5.67MiB codes=123@1.23MiB pending=45678
INFO [10-27|10:18:12.345] Syncing beacon headers                   downloaded=123456 left=45678 eta=45m32s
...
INFO [10-27|11:30:00.000] Syncing: chain download in progress      synced=99.99%
INFO [10-27|11:32:15.123] Syncing: state heal in progress          synced=100.00%
INFO [10-27|11:33:00.000] Imported new chain segment               blocks=1 txs=45 mgas=1.234 elapsed=123ms mgasps=10.000
```

**Progress indicators:**
- **Lighthouse `est_time`:** Time remaining for beacon chain sync
- **Geth `eta`:** Time remaining for execution layer sync
- **Geth `synced`:** Percentage complete (when it reaches 99%+, you're almost done!)

**Healthy sync signs:**
- ✅ Peer count > 20 (Geth) and > 50 (Lighthouse)
- ✅ `downloaded` numbers increasing
- ✅ No error messages about "failed to connect"
- ✅ `Imported new chain segment` appearing regularly

**Unhealthy sync signs:**
- ❌ Peer count < 10
- ❌ Errors: "Connection refused" or "JWT verification failed"
- ❌ No log output for > 5 minutes
- ❌ `eta` increasing instead of decreasing

**Q: Can I close the terminals while syncing?**
**A:** No! Both Geth and Lighthouse must stay running. If you close them, sync stops. (We'll learn background running in Week 29.)

**Q: Can I use my computer while syncing?**
**A:** Yes! Syncing uses CPU and network but shouldn't freeze your system. You can continue with other work.

---

### Activity 5: Check Sync Status via RPC (While Syncing)

**Time:** 5 minutes

While your node syncs, you can query it using RPC! Open a **third terminal** (keep the other two running).

**Query current block number:**

**WSL Ubuntu:**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Windows PowerShell:**
```powershell
Invoke-WebRequest -Uri http://localhost:8545 -Method POST -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Expected output (while syncing):**
```json
{"jsonrpc":"2.0","id":1,"result":"0x456789"}
```

**The `result` is in hexadecimal!** Convert to decimal:

**WSL Ubuntu:**
```bash
echo $((0x456789))
```

**Windows PowerShell:**
```powershell
[Convert]::ToInt32("456789", 16)
```

**Result:** `4552585` (example block number)

**Check latest Sepolia block on Etherscan:**
Visit https://sepolia.etherscan.io/

Compare your node's block number to Etherscan's latest block:
- If they're close (within 100 blocks), you're almost synced!
- If there's a big gap, you're still syncing (keep waiting)

---

### Activity 6: Query Peer Count

**Time:** 3 minutes

**Geth peer count:**

**WSL Ubuntu:**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}'
```

**Windows PowerShell:**
```powershell
Invoke-WebRequest -Uri http://localhost:8545 -Method POST -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}'
```

**Expected output:**
```json
{"jsonrpc":"2.0","id":1,"result":"0x2a"}
```

**Convert hex to decimal:**
```bash
echo $((0x2a))  # WSL
```
```powershell
[Convert]::ToInt32("2a", 16)  # Windows
```

**Result:** `42` peers connected ✅

**Healthy range:** 20-50 peers for Geth, 50-100 for Lighthouse

---

### Activity 7: Verify Full Sync Complete

**Time:** 5 minutes (after sync finishes)

**How do you know sync is complete?**

**1. Check Geth logs (Terminal 1):**

You should see **new blocks being imported every ~12 seconds**:
```
INFO [10-27|13:45:12.000] Imported new chain segment               blocks=1 txs=23 mgas=1.234 elapsed=56ms
INFO [10-27|13:45:24.000] Imported new chain segment               blocks=1 txs=18 mgas=0.987 elapsed=43ms
INFO [10-27|13:45:36.000] Imported new chain segment               blocks=1 txs=31 mgas=1.567 elapsed=67ms
```

**2. Check Lighthouse logs (Terminal 2):**

You should see:
```
INFO Synced      slot: 7235012, block: 0xabc123..., peers: 78
INFO New block   root: 0xdef456..., slot: 7235013
INFO New block   root: 0x789abc..., slot: 7235014
```

**3. Compare your block number to Etherscan:**

**Query your node:**
```bash
curl -X POST http://localhost:8545 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Check Etherscan:**
https://sepolia.etherscan.io/

**If the difference is < 10 blocks, you're synced!** 🎉

---

### Activity 8: Query Your Synced Node

**Time:** 10 minutes

Now that you're synced, let's run some queries!

**1. Get the latest block:**

**WSL Ubuntu:**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest", false],"id":1}'
```

**Expected output (truncated):**
```json
{
  "jsonrpc":"2.0",
  "id":1,
  "result":{
    "number":"0x6e5012",
    "hash":"0xabc123...",
    "parentHash":"0xdef456...",
    "timestamp":"0x6718a5b4",
    "transactions":["0x789...","0xabc..."],
    "gasUsed":"0x1a2b3c"
  }
}
```

✅ **You just queried YOUR OWN NODE!**

---

**2. Check your wallet balance from Week 1:**

Remember your testnet wallet address from Week 1? Let's check its balance on YOUR node!

**Replace `YOUR_ADDRESS` with your actual address:**

**WSL Ubuntu:**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["YOUR_ADDRESS", "latest"],"id":1}'
```

**Example (with the address from Week 1 learning notes):**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x...(your address)", "latest"],"id":1}'
```

**Expected output:**
```json
{"jsonrpc":"2.0","id":1,"result":"0x16345785d8a0000"}
```

**Convert balance from Wei to ETH:**

**WSL Ubuntu:**
```bash
echo "scale=18; $(echo $((0x16345785d8a0000))) / 1000000000000000000" | bc
```

**Result:** `0.1` ETH (example)

---

**3. Get transaction receipt:**

Remember your contract deployment transaction from Week 1? Let's query it from YOUR node!

**Replace `YOUR_TX_HASH` with your deployment transaction hash:**

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
    "blockNumber":"0x...",
    "contractAddress":"0x21581Db891aAb5cB99d6002Aaa83C6c480960267",
    "status":"0x1",
    "gasUsed":"0x..."
  }
}
```

✅ **Your node has the full transaction history!**

---

### Activity 9: Understanding Data Directory

**Time:** 5 minutes

Let's explore what was downloaded during sync.

**Check disk usage:**

**WSL Ubuntu:**
```bash
du -sh ~/ethereum/sepolia/geth
du -sh ~/ethereum/sepolia/lighthouse
```

**Expected output:**
```
32G     /home/username/ethereum/sepolia/geth
8.5G    /home/username/ethereum/sepolia/lighthouse
```

**Windows PowerShell:**
```powershell
Get-ChildItem "$HOME\ethereum\sepolia\geth" -Recurse | Measure-Object -Property Length -Sum
Get-ChildItem "$HOME\ethereum\sepolia\lighthouse" -Recurse | Measure-Object -Property Length -Sum
```

**List data directory contents:**

**WSL Ubuntu:**
```bash
tree -L 2 ~/ethereum/sepolia/geth
```

**Expected output:**
```
/home/username/ethereum/sepolia/geth
├── geth
│   ├── chaindata/       ← Blockchain data (blocks, state)
│   ├── lightchaindata/
│   ├── nodes/
│   ├── LOCK
│   └── nodekey
└── geth.ipc
```

**The `chaindata/` folder is where all blockchain state lives!**

---

### Activity 10: Stopping Your Node Safely

**Time:** 3 minutes

**To stop your node:**

1. **Go to Terminal 2 (Lighthouse)** and press **Ctrl+C**

**Expected output:**
```
INFO Shutting down...                        reason: SIGINT received
INFO Saved beacon chain to disk
```

2. **Go to Terminal 1 (Geth)** and press **Ctrl+C**

**Expected output:**
```
INFO [10-27|14:00:00.000] Got interrupt, shutting down...
INFO [10-27|14:00:01.000] Writing cached state to disk              block=7,234,567 hash=0xabc123...
INFO [10-27|14:00:02.000] Persisted trie from memory database       nodes=123456 size=12.34MiB
INFO [10-27|14:00:03.000] Blockchain stopped
```

**Always use Ctrl+C, NOT:**
- ❌ Closing the terminal window forcefully
- ❌ Killing the process with `kill -9`
- ❌ Shutting down your computer without stopping Geth first

**Why?** Geth needs to flush state to disk cleanly. Forcing it to stop can corrupt the database!

---

### Activity 11: Restarting Your Node

**Time:** 5 minutes

**To restart, simply run the same commands from Activity 2 and 3.**

**The second time is much faster!**
- No sync needed (you're already synced)
- Geth and Lighthouse just need to catch up to the latest blocks (~30 seconds)

**Restart and verify:**

1. Start Geth (Terminal 1) - same command as Activity 2
2. Start Lighthouse (Terminal 2) - same command as Activity 3
3. Check logs - you should see:

**Geth:**
```
INFO [10-27|14:05:00.000] Imported new chain segment               blocks=12 txs=234 ...
```
(Importing blocks that happened while you were offline)

**Lighthouse:**
```
INFO Synced      slot: 7235123, peers: 67
```

✅ **Node restarted and caught up!**

---

## 📦 Deliverables

After completing this class, you should have:

- [ ] ✅ **Fully synced Sepolia node** (Geth + Lighthouse running together)
- [ ] ✅ **Verified sync status** (block number matches Etherscan within 10 blocks)
- [ ] ✅ **Queried your node via RPC** (eth_blockNumber, eth_getBalance, etc.)
- [ ] ✅ **Understanding of data directories** (what's stored where, disk usage)
- [ ] ✅ **Ability to stop/restart** your node safely
- [ ] ✅ **HTTP RPC endpoint** available at `http://localhost:8545`

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Syncing not progressing" (Stuck at X%)

**Symptoms:**
- Geth or Lighthouse logs show no new activity for > 10 minutes
- `downloaded` counter not increasing
- Peer count is very low (< 5)

**Solutions:**

**1. Check internet connection:**
```bash
ping 8.8.8.8
```

**2. Restart both clients:**
- Ctrl+C on both terminals
- Restart Geth, then Lighthouse

**3. Check firewall:**
- Ensure UDP/TCP port 30303 (Geth P2P) is not blocked
- Ensure UDP port 9000 (Lighthouse P2P) is not blocked

**4. Try different checkpoint sync URL:**
Change Lighthouse parameter:
```
--checkpoint-sync-url https://checkpoint-sync.sepolia.ethpandaops.io
```

---

### Issue 2: "Error: JWT verification failed"

**Cause:** Geth and Lighthouse are using different jwtsecret files

**Solution:**

**1. Verify both are using the same file:**
```bash
# Check Geth parameter
ps aux | grep geth | grep jwtsecret

# Check Lighthouse parameter
ps aux | grep lighthouse | grep execution-jwt
```

**2. If different, stop both and use the same path**

---

### Issue 3: "Error: Connection refused (port 8551)"

**Cause:** Lighthouse trying to connect to Geth, but Geth not running

**Solution:**
1. **Always start Geth FIRST** (Terminal 1)
2. Wait until you see `HTTP server started` in Geth logs
3. **Then start Lighthouse** (Terminal 2)

---

### Issue 4: High CPU/Memory Usage During Sync

**Cause:** Snap sync is CPU and memory intensive

**Solutions:**

**1. Close unnecessary applications** (browsers, etc.)

**2. Limit Geth cache** (if RAM < 16GB):
```bash
geth --cache 2048 ...  # Reduce cache from default 4096 MB to 2048 MB
```

**3. Be patient** - CPU usage drops dramatically after sync completes

---

### Issue 5: "Disk full" or "No space left on device"

**Cause:** Insufficient disk space for blockchain data

**Solutions:**

**1. Check available space:**
```bash
df -h  # WSL
Get-PSDrive C  # Windows
```

**2. Clean up unnecessary files** or **use external drive:**

**Mount external USB drive (if needed):**
```bash
# WSL: external drive usually auto-mounts at /mnt/d, /mnt/e, etc.
sudo mkdir -p /mnt/external
sudo mount /dev/sdb1 /mnt/external

# Move data directory
mv ~/ethereum/sepolia /mnt/external/
ln -s /mnt/external/sepolia ~/ethereum/sepolia
```

---

### Issue 6: Node Crashes or Restarts Spontaneously

**Cause:** Out of memory (OOM) or system instability

**Solutions:**

**1. Check system logs:**
```bash
dmesg | tail -50  # Linux
```

**2. Increase swap space** (if RAM < 16GB):
```bash
# Create 8GB swap file
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**3. Consider cloud instance** (AWS, Digital Ocean, Hetzner) with adequate RAM

---

## ✅ Self-Assessment Quiz

### Question 1: Why must Geth and Lighthouse run simultaneously?

<details>
<summary>Answer</summary>

Since Ethereum moved to **Proof-of-Stake** (The Merge), the protocol is split into two layers:

- **Execution layer (Geth):** Handles transactions, smart contracts, state
- **Consensus layer (Lighthouse):** Handles block proposals, attestations, finality

**Geth cannot sync without Lighthouse providing beacon chain data.** They communicate via authenticated RPC (port 8551) using the shared jwtsecret.

Both must run together for the node to function on Sepolia (or any post-merge network).
</details>

---

### Question 2: What does the RPC endpoint `http://localhost:8545` allow you to do?

<details>
<summary>Answer</summary>

The HTTP RPC endpoint at `http://localhost:8545` allows:

- ✅ Query blockchain data (block numbers, balances, transaction receipts)
- ✅ Send transactions to the network
- ✅ Interact with smart contracts (call functions, read state)
- ✅ Subscribe to events (via WebSocket alternative)

**This is YOUR OWN RPC provider** - no rate limits, no third-party seeing your queries, complete privacy!

In future classes, you'll configure Hardhat to use `http://localhost:8545` instead of public RPC endpoints.
</details>

---

### Question 3: What's the difference between snap sync and full sync?

<details>
<summary>Answer</summary>

| Sync Mode | How It Works | Time | Result |
|-----------|-------------|------|--------|
| **Snap Sync** | Downloads recent state snapshot first, then fills in historical blocks | Hours | Full node |
| **Full Sync** | Processes every transaction from genesis block | Days/Weeks | Full node |

**Snap sync is much faster** because it doesn't recompute state from genesis - it trusts a recent snapshot and verifies from there.

**Both result in a full node** (same capabilities), just different sync strategies.
</details>

---

### Question 4: Why do we only expose RPC on `127.0.0.1` (localhost)?

<details>
<summary>Answer</summary>

Using `--http.addr 127.0.0.1` means:

- ✅ Only YOUR computer can access the RPC endpoint
- ✅ Prevents external attackers from querying your node
- ✅ Prevents unauthorized transaction sending through your node
- ✅ Security best practice

**If you exposed it to `0.0.0.0` (all interfaces):**
- ❌ Anyone on your network could access it
- ❌ If port forwarded, anyone on the internet could access it
- ❌ Attackers could send spam transactions through your node
- ❌ Privacy compromised (anyone sees your queries)

**For production services (Week 29), you'd add authentication/firewall rules if external access needed.**
</details>

---

### Question 5: What does checkpoint sync do?

<details>
<summary>Answer</summary>

**Checkpoint sync** is a fast-sync method for consensus clients (Lighthouse):

Instead of downloading every beacon block from genesis, Lighthouse:
1. Downloads a recent **trusted checkpoint** (recent beacon state)
2. Starts syncing from that checkpoint forward
3. Backfills historical data if needed

**Benefits:**
- ⚡ Much faster (minutes instead of hours for initial sync)
- ✅ Still secure (checkpoint is verified against network consensus)
- ✅ Reduces network load (less historical data downloaded)

**The `--checkpoint-sync-url` parameter provides the trusted checkpoint source** (e.g., `https://sepolia.beaconstate.ethstaker.cc`).
</details>

---

### Question 6: What happens if you kill Geth forcefully (kill -9) instead of Ctrl+C?

<details>
<summary>Answer</summary>

**Forcefully killing Geth can:**
- ❌ Corrupt the database (chaindata)
- ❌ Lose pending state changes in memory
- ❌ Require re-syncing part or all of the blockchain
- ❌ Cause "BAD BLOCK" errors on restart

**Ctrl+C sends SIGINT, which:**
- ✅ Allows Geth to flush cached state to disk
- ✅ Properly closes database connections
- ✅ Writes pending transactions
- ✅ Graceful shutdown (safe)

**Always use Ctrl+C or `geth attach` IPC commands to stop Geth!**
</details>

---

### Question 7: Your node shows 100 peers connected. Is this good or bad?

<details>
<summary>Answer</summary>

**It depends on which client:**

**Geth (execution layer):**
- Default max peers: 50
- Healthy range: 20-50 peers
- **100 peers = impossible** (max is 50 by default)
- You'd need to set `--maxpeers 100` explicitly

**Lighthouse (consensus layer):**
- Default max peers: higher (80-100+)
- Healthy range: 50-100 peers
- **100 peers = excellent!** ✅

**More peers generally means:**
- ✅ Better data redundancy
- ✅ Faster sync and block propagation
- ⚠️ Slightly higher bandwidth/CPU usage

**Fewer peers (<10) means:**
- ⚠️ Slower sync
- ⚠️ Potential data propagation delays
- ❌ Check firewall/network issues if persistently low
</details>

---

## 🎯 Key Takeaways

1. **Ethereum nodes require TWO clients** since The Merge:
   - Execution client (Geth) for transactions/state
   - Consensus client (Lighthouse) for proof-of-stake consensus

2. **Syncing takes time (2-4 hours for Sepolia)**:
   - Checkpoint sync speeds up Lighthouse significantly
   - Snap sync speeds up Geth significantly
   - Be patient and monitor logs for progress

3. **Your node becomes your own RPC provider:**
   - No rate limits
   - Complete privacy
   - Trustless verification

4. **RPC endpoints:**
   - `http://localhost:8545` - HTTP RPC (for queries, transactions)
   - `http://localhost:8551` - Auth RPC (for Lighthouse ↔ Geth communication)

5. **Always stop nodes gracefully:**
   - Ctrl+C (SIGINT) allows proper shutdown
   - Never force-kill (kill -9) Geth

6. **Data directories consume 40-50GB for Sepolia:**
   - Plan for ~800GB for mainnet
   - Use external drives if needed

7. **Healthy node indicators:**
   - 20-50 peers (Geth), 50-100 peers (Lighthouse)
   - New blocks imported every ~12 seconds
   - Block number within 10 of Etherscan

---

## 🔜 Next Steps

**Class 2.3: Getting Testnet ETH**

In the next class, you'll:
- Use multiple Sepolia faucets to get test ETH
- Understand faucet mechanisms (proof-of-work, social media, OAuth)
- Verify ETH received using YOUR node
- Check balances via RPC instead of Etherscan
- Prepare wallets for Week 3

**Before starting Class 2.3:**
- Ensure your node is fully synced
- Keep your node running (you'll use it to verify balances!)
- Have your Week 1 wallet address handy

---

## 👨‍🏫 Teaching Notes for Claude Code

**Pacing:**
- **2-4 hour sync time** means this class spans multiple sessions
- **Start sync early** in the session, continue other work while waiting
- **Don't rush** - syncing can't be accelerated beyond network/hardware limits

**Common Struggles:**
- Impatience during sync (remind: this is real distributed system magic happening!)
- Terminal management (two terminals, keeping them open)
- Understanding hex outputs (teach hex-to-decimal conversion)

**Active Recall Opportunities:**
- "Remember from Week 1 when we used `ethereum-sepolia-rpc.publicnode.com`? Now where is your RPC endpoint?"
- "What do you think would happen if we stopped Geth but kept Lighthouse running?"
- "How can you tell if your node is synced?"

**Encouragement:**
- **Running a full node is a significant achievement!**
- Many blockchain developers never do this - they rely on Infura/Alchemy
- Understanding node operations deeply separates junior from intermediate developers

**Troubleshooting:**
- If sync stalls, check peer count first
- If JWT errors, verify same jwtsecret file path
- If disk full, discuss external drives or cloud options

---

## 📖 Reading References

**Bitcoin Book:**
- **Chapter 3:** Bitcoin Core - Running a Node, Getting Started
  - Node configuration and command-line options
  - Understanding blockchain data directory
  - Node synchronization process

**Ethereum Book:**
- **Chapter 3:** Clients - Running an Ethereum Client
  - Execution and consensus client architecture
  - JSON-RPC endpoints and API
  - Node synchronization strategies

**Additional Reading (Optional):**
- Geth Docs - Command-line Options: https://geth.ethereum.org/docs/fundamentals/command-line-options
- Lighthouse Book - Checkpoint Sync: https://lighthouse-book.sigmaprime.io/checkpoint-sync.html
- Ethereum.org - JSON-RPC API: https://ethereum.org/en/developers/docs/apis/json-rpc/

---

**Estimated Time:** 3-4 hours (includes 2-4 hour sync time)

**Next Class:** [Class 2.3: Getting Testnet ETH](week2-class2.3-testnet-eth.md)

---

*Last Updated: 2025-10-27*
