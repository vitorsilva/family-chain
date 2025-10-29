# FamilyChain Week 2 - Ethereum Node Architecture

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ETHEREUM NODE ARCHITECTURE                                ║
║                        Geth + Lighthouse                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝


┌──────────────────────────────────────────────────────────────────────────────┐
│                         ETHEREUM NETWORK (Public)                            │
│                                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                   │
│  │   Mainnet    │   │   Sepolia    │   │   Holesky    │                   │
│  │  (Production)│   │  (Testnet)   │   │  (Testnet)   │                   │
│  └──────────────┘   └──────────────┘   └──────────────┘                   │
│                                                                              │
│  • Thousands of nodes worldwide                                             │
│  • Decentralized consensus                                                  │
│  • Proof of Stake (PoS)                                                     │
│                                                                              │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │
                    P2P Network (TCP/UDP ports)
                                │
┌───────────────────────────────▼──────────────────────────────────────────────┐
│                          YOUR ETHEREUM NODE                                  │
│                         (Running on your computer)                           │
│                                                                              │
│  ╔════════════════════════════════════════════════════════════════════════╗ │
│  ║               CONSENSUS LAYER (Proof of Stake)                         ║ │
│  ╠════════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                        ║ │
│  ║  ┌────────────────────────────────────────────────────────┐          ║ │
│  ║  │              Lighthouse (Consensus Client)             │          ║ │
│  ║  │                                                         │          ║ │
│  ║  │  Responsibilities:                                      │          ║ │
│  ║  │  • Block proposals and attestations                    │          ║ │
│  ║  │  • Validator management                                │          ║ │
│  ║  │  • Fork choice (which chain is canonical)              │          ║ │
│  ║  │  • Finality tracking                                   │          ║ │
│  ║  │  • P2P gossip (blocks, attestations)                   │          ║ │
│  ║  └────────────────────────────────────────────────────────┘          ║ │
│  ║                              │                                        ║ │
│  ║                        Engine API                                     ║ │
│  ║                    (JSON-RPC over HTTP)                               ║ │
│  ║                   JWT Authentication                                  ║ │
│  ║                              │                                        ║ │
│  ╚══════════════════════════════┼═══════════════════════════════════════════╝ │
│                                 │                                            │
│  ╔══════════════════════════════▼═══════════════════════════════════════════╗ │
│  ║                 EXECUTION LAYER (Transaction Processing)               ║ │
│  ╠════════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                        ║ │
│  ║  ┌────────────────────────────────────────────────────────┐          ║ │
│  ║  │                Geth (Execution Client)                 │          ║ │
│  ║  │                  (go-ethereum)                         │          ║ │
│  ║  │                                                         │          ║ │
│  ║  │  Responsibilities:                                      │          ║ │
│  ║  │  • Execute transactions (EVM)                          │          ║ │
│  ║  │  • Maintain state (accounts, balances, contracts)      │          ║ │
│  ║  │  • Transaction pool (mempool)                          │          ║ │
│  ║  │  • Block execution and validation                      │          ║ │
│  ║  │  • Provide RPC API for applications                    │          ║ │
│  ║  └────────────────────────────────────────────────────────┘          ║ │
│  ║                              │                                        ║ │
│  ╚══════════════════════════════┼═══════════════════════════════════════════╝ │
│                                 │                                            │
└─────────────────────────────────┼────────────────────────────────────────────┘
                                  │
                        RPC API Endpoints
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
            ▼                     ▼                     ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Your DApp/      │   │   Hardhat        │   │   MetaMask       │
│  Smart Contracts │   │   (via ethers.js)│   │   (Wallet)       │
└──────────────────┘   └──────────────────┘   └──────────────────┘


═══════════════════════════════════════════════════════════════════════════════

                         DATA STORAGE ARCHITECTURE

═══════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────┐
│                           ./data/ Directory                                  │
│                      (Your node's data storage)                              │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                          ./data/geth/                                  │ │
│  │                   (Execution Layer Storage)                            │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  chaindata/          ← Blockchain data (blocks, transactions)         │ │
│  │  ├── ancient/        ← Old blocks (archived)                          │ │
│  │  └── ...             ← Recent state data                              │ │
│  │                                                                        │ │
│  │  lightchaindata/     ← Light sync data (if using --syncmode light)    │ │
│  │                                                                        │ │
│  │  keystore/           ← Encrypted account private keys                 │ │
│  │                                                                        │ │
│  │  geth.ipc            ← IPC endpoint for local connections             │ │
│  │                                                                        │ │
│  │  nodekey             ← Node's P2P identity                            │ │
│  │                                                                        │ │
│  │  Size: 200GB - 1TB+ (depends on sync mode)                            │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      ./data/lighthouse/                                │ │
│  │                  (Consensus Layer Storage)                             │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  beacon/             ← Beacon chain database                          │ │
│  │  ├── chain_db/       ← Beacon blocks and states                       │ │
│  │  └── freezer_db/     ← Historical beacon data                         │ │
│  │                                                                        │ │
│  │  validators/         ← Validator keys (if running validator)          │ │
│  │                                                                        │ │
│  │  network/            ← P2P discovery data                             │ │
│  │                                                                        │ │
│  │  Size: 50GB - 200GB                                                   │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        jwt.hex                                         │ │
│  │         (Shared secret for Engine API authentication)                 │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

                        NETWORK COMMUNICATION

═══════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────┐
│                            GETH (Execution Layer)                            │
│                                                                              │
│  P2P Network:                                                                │
│  • Port 30303 (TCP/UDP)  ← Peer-to-peer discovery and sync                  │
│  • Gossip protocol       ← Share transactions and blocks                     │
│  • Discovery protocol    ← Find other nodes (Kademlia DHT)                   │
│                                                                              │
│  RPC Endpoints (Your Applications):                                          │
│  • HTTP:  localhost:8545  ← JSON-RPC API (web3, ethers.js)                  │
│  • WS:    localhost:8546  ← WebSocket (real-time subscriptions)             │
│  • IPC:   geth.ipc        ← Inter-Process Communication (fastest)           │
│                                                                              │
│  Engine API (Lighthouse):                                                    │
│  • HTTP:  localhost:8551  ← Authenticated JSON-RPC for consensus            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                         LIGHTHOUSE (Consensus Layer)                         │
│                                                                              │
│  P2P Network:                                                                │
│  • Port 9000 (TCP/UDP)   ← Peer-to-peer beacon chain sync                   │
│  • Gossip protocol       ← Attestations, blocks, aggregations               │
│                                                                              │
│  HTTP API:                                                                   │
│  • Port 5052             ← Beacon Node API (monitoring, queries)            │
│                                                                              │
│  Metrics:                                                                    │
│  • Port 5054             ← Prometheus metrics (monitoring)                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

                            SYNC MODES

═══════════════════════════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────────────────────────────┐
│                            GETH SYNC MODES                                 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  SNAP (Default - Recommended):                                            │
│  • Downloads state snapshots + recent blocks                              │
│  • Fast: 4-6 hours on good hardware                                       │
│  • Disk: ~800GB (full archive)                                            │
│  • Use: --syncmode snap                                                   │
│  • Best for: Most use cases                                               │
│                                                                            │
│  FULL:                                                                     │
│  • Downloads all blocks and executes all transactions                     │
│  • Slow: Days to weeks                                                    │
│  • Disk: ~800GB+                                                          │
│  • Use: --syncmode full                                                   │
│  • Best for: Archival nodes, full verification                            │
│                                                                            │
│  LIGHT (Being deprecated):                                                │
│  • Downloads only headers, requests data as needed                        │
│  • Fast: Minutes                                                          │
│  • Disk: <1GB                                                             │
│  • Use: --syncmode light                                                  │
│  • Limitation: Fewer peers support light clients                          │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                        LIGHTHOUSE SYNC MODES                               │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  CHECKPOINT SYNC (Recommended):                                           │
│  • Start from recent finalized checkpoint                                 │
│  • Fast: 5-15 minutes                                                     │
│  • Requires trusted checkpoint source                                     │
│  • Use: --checkpoint-sync-url https://...                                 │
│  • Best for: Quick setup, testnet development                             │
│                                                                            │
│  GENESIS SYNC:                                                            │
│  • Sync from genesis block (slot 0)                                       │
│  • Slow: Several hours                                                    │
│  • No external trust needed                                               │
│  • Best for: Maximum trustlessness                                        │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

                        COMMON OPERATIONS FLOW

═══════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────┐
│                 "User sends transaction via MetaMask"                        │
└──────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   MetaMask (Wallet)     │
                    │   • Signs transaction   │
                    │   • Broadcasts via RPC  │
                    └───────────┬─────────────┘
                                │
                                ▼
        ┌──────────────────────────────────────────────┐
        │         HTTP RPC: localhost:8545             │
        │         (Your Geth node)                     │
        └───────────────────┬──────────────────────────┘
                            │
                            ▼
        ┌────────────────────────────────────────────────────┐
        │              Geth Execution Client                 │
        │  1. Validate transaction (signature, nonce, gas)   │
        │  2. Add to mempool (transaction pool)              │
        │  3. Gossip to other peers via P2P                  │
        └───────────────────┬────────────────────────────────┘
                            │
                            ▼
        ┌────────────────────────────────────────────────────┐
        │        Wait for block proposal...                  │
        │    (Validator proposes block with your tx)         │
        └───────────────────┬────────────────────────────────┘
                            │
                            ▼
        ┌────────────────────────────────────────────────────┐
        │         Lighthouse Consensus Client                │
        │  1. Receive new beacon block via P2P               │
        │  2. Validate beacon block attestations             │
        │  3. Send execution payload to Geth via Engine API  │
        └───────────────────┬────────────────────────────────┘
                            │
                            ▼
        ┌────────────────────────────────────────────────────┐
        │              Geth Execution Client                 │
        │  1. Execute transactions in block (EVM)            │
        │  2. Update state (account balances, storage)       │
        │  3. Return execution result to Lighthouse          │
        │  4. Store block in chaindata/                      │
        └───────────────────┬────────────────────────────────┘
                            │
                            ▼
        ┌────────────────────────────────────────────────────┐
        │         Lighthouse Consensus Client                │
        │  1. Attest to block validity                       │
        │  2. Update fork choice (canonical chain)           │
        │  3. After 2 epochs: Block finalized ✓              │
        └────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

                         KEY COMMANDS REFERENCE

═══════════════════════════════════════════════════════════════════════════════

STARTING GETH (Execution Layer):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Sepolia Testnet (Recommended for learning)
geth \
  --sepolia \
  --datadir ./data/geth \
  --http \
  --http.api eth,net,web3,txpool \
  --http.addr 0.0.0.0 \
  --http.port 8545 \
  --authrpc.addr localhost \
  --authrpc.port 8551 \
  --authrpc.jwtsecret ./data/jwt.hex

# Mainnet (Production - requires ~800GB disk space)
geth \
  --datadir ./data/geth \
  --http \
  --http.api eth,net,web3 \
  --authrpc.jwtsecret ./data/jwt.hex

STARTING LIGHTHOUSE (Consensus Layer):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Sepolia Testnet (Checkpoint sync - fast!)
lighthouse bn \
  --network sepolia \
  --datadir ./data/lighthouse \
  --execution-endpoint http://localhost:8551 \
  --execution-jwt ./data/jwt.hex \
  --checkpoint-sync-url https://sepolia.beaconstate.info \
  --http

# Mainnet (Checkpoint sync)
lighthouse bn \
  --network mainnet \
  --datadir ./data/lighthouse \
  --execution-endpoint http://localhost:8551 \
  --execution-jwt ./data/jwt.hex \
  --checkpoint-sync-url https://beaconstate.info \
  --http

MONITORING & DEBUGGING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Check Geth sync status
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
  http://localhost:8545

# Check current block number
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545

# Check peer count
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  http://localhost:8545

# Check Lighthouse sync status
curl http://localhost:5052/eth/v1/node/syncing

# View Lighthouse metrics (Prometheus format)
curl http://localhost:5054/metrics

# Attach to Geth console
geth attach ./data/geth/geth.ipc


═══════════════════════════════════════════════════════════════════════════════

                        WHY RUN YOUR OWN NODE?

═══════════════════════════════════════════════════════════════════════════════

✅ ADVANTAGES:
  • Full trustlessness - Verify all transactions yourself
  • No rate limits - Unlike Infura/Alchemy free tiers
  • Privacy - Your transactions aren't tracked by third parties
  • Network resilience - Contribute to Ethereum decentralization
  • Cost savings - No API fees for high-volume apps
  • Local development - Test against real network conditions
  • Portfolio value - Demonstrates infrastructure knowledge

❌ CHALLENGES:
  • Hardware requirements - 1TB+ SSD, 16GB+ RAM recommended
  • Sync time - Hours to days depending on mode
  • Maintenance - Keep client software updated
  • Bandwidth - Initial sync uses 100GB+ data
  • Uptime - Need to keep node running to stay synced

🎯 BEST FOR:
  • Production applications with high traffic
  • Learning blockchain infrastructure deeply
  • Contributing to network decentralization
  • Privacy-sensitive applications
  • Development with realistic latency/conditions


═══════════════════════════════════════════════════════════════════════════════

                        WEEK 2 LEARNING OBJECTIVES

═══════════════════════════════════════════════════════════════════════════════

By the end of Week 2, you should understand:

1. **Ethereum's Two-Layer Architecture**
   - Execution layer (Geth) handles transactions and state
   - Consensus layer (Lighthouse) handles PoS consensus and finality
   - Engine API connects them with JWT authentication

2. **Node Operations**
   - How to install and configure Geth + Lighthouse
   - Different sync modes and when to use each
   - Monitoring sync progress and node health
   - Connecting applications to your local node

3. **Network Communication**
   - P2P protocols for peer discovery and sync
   - RPC endpoints for application interaction
   - Difference between IPC, HTTP, and WebSocket

4. **Data Storage**
   - Where blockchain data is stored on disk
   - How much space different sync modes require
   - What each directory contains

5. **Practical Skills**
   - Run a Sepolia testnet node
   - Connect Hardhat to your local node instead of Infura
   - Monitor node status with RPC calls
   - Debug common sync issues

This knowledge differentiates you from developers who only use hosted RPC providers!
```

## Architecture Comparison

| Aspect | Week 1 (Hardhat Network) | Week 2 (Your Node) | Public RPC (Infura) |
|--------|--------------------------|-------------------|---------------------|
| **Location** | In-memory (your RAM) | On-disk (your SSD) | Remote (their servers) |
| **Persistence** | Resets on restart | Persistent | Persistent |
| **Network** | Isolated (localhost) | Connected to Ethereum | Connected to Ethereum |
| **Sync Required** | No | Yes (hours/days) | No (already synced) |
| **Disk Space** | <1MB | 200GB-1TB | 0 (their disk) |
| **Rate Limits** | None | None | Yes (free tier) |
| **Trustlessness** | N/A (test data) | Full (you verify) | Partial (trust provider) |
| **Best For** | Testing contracts | Production + Learning | Quick prototyping |

## Connection Hierarchy

```
Your Application (Hardhat, MetaMask, etc.)
  │
  ├─► Week 1: Hardhat Network (localhost, ephemeral)
  │   ↓
  │   In-memory blockchain (for testing)
  │
  ├─► Week 2: Your Geth Node (localhost, persistent)
  │   ↓
  │   Connected to real Ethereum network
  │   ↓
  │   Geth (Execution) ←─Engine API─→ Lighthouse (Consensus)
  │   ↓                                ↓
  │   Local disk                       P2P Network
  │   (./data/geth)                    (Other Ethereum nodes)
  │
  └─► Alternative: Public RPC (Infura/Alchemy)
      ↓
      Their node infrastructure
      ↓
      Same Ethereum network
```

## Key Takeaway

**Week 1:** You learned to *use* blockchain tools (Hardhat Network for testing)

**Week 2:** You learn how blockchain *actually works* (running a real Ethereum node)

This infrastructure knowledge is what separates junior devs from mid-level blockchain engineers in job interviews!
