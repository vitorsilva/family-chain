# Week 7, Class 7.4: Event Listening and Real-time Updates
## FamilyChain Course - Learning Guide

---

## 🎯 Overview

**Duration:** 5-6 hours
**Prerequisites:**
- Week 7 Class 7.3 complete (backend transaction service)
- PostgreSQL database from Week 4
- FamilyWallet contract with event history (at least 2-3 deposits/withdraws)
- `BlockchainService` class from Class 7.3

**What You'll Learn:**
Smart contracts emit EVENTS when important things happen (deposits, withdraws, transfers). In this class, you'll learn to LISTEN to these events - both historical (what happened in the past) and real-time (what's happening now). You'll store events in PostgreSQL and build a background service that monitors the blockchain 24/7.

**Why This Matters:**
Event listening is the backbone of DeFi indexing:
- Aave tracks all borrows/repays to calculate interest
- Uniswap monitors swaps to update pool data
- OpenSea indexes all NFT transfers for marketplace
- Your FamilyWallet will track all deposits/withdraws for analytics

Without event listeners, you'd have to query the blockchain constantly (expensive and slow)!

---

## 📚 Learning Objectives

By the end of this class, you will be able to:

1. **Query** historical events using `contract.queryFilter()`
2. **Listen** to real-time events with `contract.on()`
3. **Parse** event data from logs and receipts
4. **Store** blockchain events in PostgreSQL database
5. **Create** a background event listener service that runs continuously
6. **Understand** WebSocket vs HTTP providers for event listening
7. **Handle** chain reorganizations and missed events gracefully

---

## 📖 Key Concepts

### 1. Smart Contract Events

**What are events?**
- Logs emitted by smart contracts during transactions
- Stored permanently on the blockchain
- Cheap to emit (much cheaper than storage)
- Cannot be accessed from other contracts (only off-chain)

**FamilyWallet events:**
```solidity
event Deposited(
    address indexed member,
    uint256 amount,
    uint256 newBalance,
    uint256 timestamp
);

event Withdrawn(
    address indexed member,
    uint256 amount,
    uint256 remainingBalance,
    uint256 timestamp
);
```

**`indexed` keyword:**
- Makes parameter searchable/filterable
- Maximum 3 indexed parameters per event
- Can filter events by indexed values

**Example:**
```typescript
// Get all deposits by specific member
const filter = contract.filters.Deposited("0x123..."); // Filter by member
const events = await contract.queryFilter(filter);
```

---

### 2. Event Listening Patterns

**Two main patterns:**

**Historical (Past Events):**
```typescript
// Query past events (block 0 to latest)
const events = await contract.queryFilter("Deposited");

// Query specific block range
const events = await contract.queryFilter("Deposited", 7000000, 7100000);
```

**Real-time (Live Events):**
```typescript
// Listen for new events as they happen
contract.on("Deposited", (member, amount, newBalance, timestamp, event) => {
  console.log(`${member} deposited ${amount}`);
});
```

**When to use which:**

| Pattern | Use Case | Performance |
|---------|----------|-------------|
| **queryFilter()** | Backfill historical data, analytics, data migration | One-time cost |
| **on()** | Real-time monitoring, live dashboards, alerts | Continuous listening |
| **Both** | Initial backfill + ongoing monitoring (most common!) | Best of both |

---

### 3. Event Data Structure

**ethers.js v6 event structure:**

```typescript
// From contract.on() callback
contract.on("Deposited", (member, amount, newBalance, timestamp, event) => {
  // Positional arguments (in order from event definition)
  console.log("Member:", member);
  console.log("Amount:", amount);
  console.log("New Balance:", newBalance);
  console.log("Timestamp:", timestamp);

  // Full event object
  console.log("Event log:", event.log);
  console.log("Block number:", event.log.blockNumber);
  console.log("Transaction hash:", event.log.transactionHash);
});

// From queryFilter() result
const events = await contract.queryFilter("Deposited");
events.forEach(event => {
  console.log("Event name:", event.eventName); // "Deposited"
  console.log("Args:", event.args); // { member, amount, newBalance, timestamp }
  console.log("Block:", event.blockNumber);
  console.log("Tx hash:", event.transactionHash);
});
```

**Key properties:**
- `event.args` - Event parameters
- `event.blockNumber` - Block where event occurred
- `event.transactionHash` - Transaction that emitted event
- `event.log` - Full raw log data

---

### 4. WebSocket vs HTTP Providers

**HTTP (JsonRpcProvider):**
```typescript
// Polling-based (checks periodically)
const provider = new ethers.JsonRpcProvider(httpUrl);
// Queries blockchain every ~few seconds
```

**WebSocket (WebSocketProvider):**
```typescript
// Push-based (server notifies you)
const provider = new ethers.WebSocketProvider(wsUrl);
// Blockchain pushes new events instantly
```

**Comparison:**

| Feature | HTTP (Polling) | WebSocket (Push) |
|---------|----------------|------------------|
| **Latency** | 5-15 seconds | ~1-3 seconds |
| **Efficiency** | More requests | Fewer requests |
| **Reliability** | More stable | Can disconnect |
| **Cost** | More RPC calls | Fewer RPC calls |
| **Use case** | Batch processing | Real-time alerts |

**Alchemy URLs:**
```
HTTP:      https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
WebSocket: wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

**For production:**
- Use WebSocket for real-time events
- Implement reconnection logic (WebSockets can disconnect)
- Fallback to HTTP if WebSocket unavailable

---

### 5. Chain Reorganizations (Reorgs)

**What is a reorg?**
- When blockchain "rewrites" recent history
- Happens when a longer chain is discovered
- Events in reorged blocks are removed/reordered

**Example:**
```
Original chain:
Block 100 → Block 101 (your event here) → Block 102

After reorg:
Block 100 → Block 101' (different) → Block 102' → Block 103'
                ↑ Your event might be gone or in different block!
```

**How to handle:**
```typescript
// Wait for multiple confirmations
const receipt = await tx.wait(3); // Wait for 3 blocks
// After 3 confirmations, very unlikely to be reorged

// Store block hash with event
await db.insertEvent({
  blockNumber: event.blockNumber,
  blockHash: event.log.blockHash, // Can detect reorgs
  txHash: event.transactionHash,
  // ... event data
});

// Periodically check for reorgs
const currentBlock = await provider.getBlock(storedBlockNumber);
if (currentBlock.hash !== storedBlockHash) {
  // Reorg detected! Re-query events
}
```

**For most applications:**
- Reorgs are rare on Ethereum mainnet (< 0.01%)
- More common on testnets
- Usually only affect last 1-2 blocks
- Waiting for 3-6 confirmations prevents issues

---

### 6. Database Schema for Events

**Week 4 schema (transactions table):**
```sql
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(account_id),
    transaction_type VARCHAR(20) NOT NULL,
    amount NUMERIC(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    blockchain_hash VARCHAR(66), -- Transaction hash
    block_number BIGINT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Additional fields for events:**
```sql
ALTER TABLE transactions ADD COLUMN event_name VARCHAR(50);
ALTER TABLE transactions ADD COLUMN event_data JSONB;
ALTER TABLE transactions ADD COLUMN confirmed_at TIMESTAMP;
```

**Example insert:**
```typescript
await db.query(`
  INSERT INTO transactions (
    account_id, transaction_type, amount, currency,
    blockchain_hash, block_number, event_name, event_data, status
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
`, [
  accountId, "deposit", amount, "ETH",
  txHash, blockNumber, "Deposited", JSON.stringify(eventData), "confirmed"
]);
```

---

## 🛠️ Hands-On Activities

### Activity 1: Query Historical Events

**Goal:** Fetch all past Deposit events from FamilyWallet.

**Step 1:** Create `query-historical-events.ts`

```typescript
// scripts/week7/query-historical-events.ts
import { ethers } from "ethers";
import { network } from "hardhat";

const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

// Full event signatures
const FAMILY_WALLET_ABI = [
  "event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
  "event Withdrawn(address indexed member, uint256 amount, uint256 remainingBalance, uint256 timestamp)",
];

async function queryHistoricalEvents() {
  console.log("=== Querying Historical FamilyWallet Events ===\n");

  const connection = await network.connect();
  const provider = connection.ethers.provider;

  // Create contract instance (read-only, no signer needed)
  const contract = new ethers.Contract(
    FAMILY_WALLET_ADDRESS,
    FAMILY_WALLET_ABI,
    provider
  );

  // Get current block for context
  const currentBlock = await provider.getBlockNumber();
  console.log("📊 Current Block:", currentBlock);
  console.log("");

  // Query all Deposit events (from block 0 to latest)
  console.log("🔍 Querying all Deposit events...");
  const depositEvents = await contract.queryFilter("Deposited");

  console.log(`✅ Found ${depositEvents.length} deposit events`);
  console.log("");

  // Display each event
  depositEvents.forEach((event, index) => {
    console.log(`Deposit #${index + 1}:`);
    console.log(`  Member: ${event.args.member}`);
    console.log(`  Amount: ${ethers.formatEther(event.args.amount)} ETH`);
    console.log(`  New Balance: ${ethers.formatEther(event.args.newBalance)} ETH`);
    console.log(`  Timestamp: ${new Date(Number(event.args.timestamp) * 1000).toLocaleString()}`);
    console.log(`  Block: ${event.blockNumber}`);
    console.log(`  Tx Hash: ${event.transactionHash}`);
    console.log("");
  });

  // Query all Withdraw events
  console.log("🔍 Querying all Withdraw events...");
  const withdrawEvents = await contract.queryFilter("Withdrawn");

  console.log(`✅ Found ${withdrawEvents.length} withdraw events`);
  console.log("");

  withdrawEvents.forEach((event, index) => {
    console.log(`Withdraw #${index + 1}:`);
    console.log(`  Member: ${event.args.member}`);
    console.log(`  Amount: ${ethers.formatEther(event.args.amount)} ETH`);
    console.log(`  Remaining: ${ethers.formatEther(event.args.remainingBalance)} ETH`);
    console.log(`  Timestamp: ${new Date(Number(event.args.timestamp) * 1000).toLocaleString()}`);
    console.log(`  Block: ${event.blockNumber}`);
    console.log(`  Tx Hash: ${event.transactionHash}`);
    console.log("");
  });

  // Filter events by specific member
  const [signer] = await connection.ethers.getSigners();
  const myAddress = await signer.getAddress();

  console.log(`🔍 Querying events for my address: ${myAddress}`);
  const myDepositFilter = contract.filters.Deposited(myAddress);
  const myDeposits = await contract.queryFilter(myDepositFilter);

  console.log(`✅ Found ${myDeposits.length} deposits from my address`);
  console.log("");

  // Query recent events (last 1000 blocks)
  const fromBlock = Math.max(0, currentBlock - 1000);
  console.log(`🔍 Querying events from last 1000 blocks (${fromBlock} to ${currentBlock})`);

  const recentEvents = await contract.queryFilter("Deposited", fromBlock, currentBlock);
  console.log(`✅ Found ${recentEvents.length} recent deposit events`);
  console.log("");

  console.log("📊 Summary:");
  console.log(`  Total Deposits: ${depositEvents.length}`);
  console.log(`  Total Withdraws: ${withdrawEvents.length}`);
  console.log(`  Total Events: ${depositEvents.length + withdrawEvents.length}`);
  console.log(`  My Deposits: ${myDeposits.length}`);
}

queryHistoricalEvents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
```

**Step 2:** Run the script

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\blockchain
npx tsx scripts/week7/query-historical-events.ts
```

**Expected Output:**
```
=== Querying Historical FamilyWallet Events ===

📊 Current Block: 7235000

🔍 Querying all Deposit events...
✅ Found 5 deposit events

Deposit #1:
  Member: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
  Amount: 0.001 ETH
  New Balance: 0.001 ETH
  Timestamp: 11/20/2025, 2:30:45 PM
  Block: 7234500
  Tx Hash: 0xabc123...

Deposit #2:
  Member: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
  Amount: 0.001 ETH
  New Balance: 0.002 ETH
  Timestamp: 11/21/2025, 10:15:20 AM
  Block: 7234700
  Tx Hash: 0xdef456...

[... more events ...]

🔍 Querying all Withdraw events...
✅ Found 0 withdraw events

🔍 Querying events for my address: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
✅ Found 5 deposits from my address

🔍 Querying events from last 1000 blocks (7234000 to 7235000)
✅ Found 3 recent deposit events

📊 Summary:
  Total Deposits: 5
  Total Withdraws: 0
  Total Events: 5
  My Deposits: 5
```

**What Just Happened?**
- ✅ Queried ALL historical Deposit events (from block 0)
- ✅ Filtered events by specific member address
- ✅ Queried events in specific block range
- ✅ Parsed event data (member, amount, balance, timestamp)
- ✅ This is how indexers (like The Graph) work!

---

### Activity 2: Real-time Event Listening

**Goal:** Listen to new events as they happen in real-time.

**Step 1:** Create `listen-realtime-events.ts`

```typescript
// scripts/week7/listen-realtime-events.ts
import { ethers } from "ethers";
import { network } from "hardhat";

const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

const FAMILY_WALLET_ABI = [
  "event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
  "event Withdrawn(address indexed member, uint256 amount, uint256 remainingBalance, uint256 timestamp)",
];

async function listenRealtimeEvents() {
  console.log("=== Real-time Event Listener ===\n");

  const connection = await network.connect();
  const provider = connection.ethers.provider;

  const contract = new ethers.Contract(
    FAMILY_WALLET_ADDRESS,
    FAMILY_WALLET_ABI,
    provider
  );

  console.log("📡 Listening for FamilyWallet events...");
  console.log("Contract:", FAMILY_WALLET_ADDRESS);
  console.log("Press Ctrl+C to stop");
  console.log("");

  // Listen for Deposit events
  contract.on("Deposited", (member, amount, newBalance, timestamp, event) => {
    console.log("💰 NEW DEPOSIT DETECTED!");
    console.log("  Member:", member);
    console.log("  Amount:", ethers.formatEther(amount), "ETH");
    console.log("  New Balance:", ethers.formatEther(newBalance), "ETH");
    console.log("  Timestamp:", new Date(Number(timestamp) * 1000).toLocaleString());
    console.log("  Block:", event.log.blockNumber);
    console.log("  Tx Hash:", event.log.transactionHash);
    console.log("  🔗 Etherscan:", `https://sepolia.etherscan.io/tx/${event.log.transactionHash}`);
    console.log("");
  });

  // Listen for Withdraw events
  contract.on("Withdrawn", (member, amount, remainingBalance, timestamp, event) => {
    console.log("💸 NEW WITHDRAWAL DETECTED!");
    console.log("  Member:", member);
    console.log("  Amount:", ethers.formatEther(amount), "ETH");
    console.log("  Remaining:", ethers.formatEther(remainingBalance), "ETH");
    console.log("  Timestamp:", new Date(Number(timestamp) * 1000).toLocaleString());
    console.log("  Block:", event.log.blockNumber);
    console.log("  Tx Hash:", event.log.transactionHash);
    console.log("  🔗 Etherscan:", `https://sepolia.etherscan.io/tx/${event.log.transactionHash}`);
    console.log("");
  });

  // Listen for ANY event (wildcard)
  contract.on("*", (event) => {
    console.log("📋 Event detected:", event.log.topics[0]); // Event signature
  });

  // Keep script running
  console.log("✅ Listener started!");
  console.log("💡 Try making a deposit in your frontend or another script...");
  console.log("");

  // Heartbeat to show it's running
  setInterval(() => {
    console.log("💓 Listener active...", new Date().toLocaleTimeString());
  }, 30000); // Every 30 seconds
}

listenRealtimeEvents()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
```

**Step 2:** Run the listener

```powershell
npx tsx scripts/week7/listen-realtime-events.ts
```

**Expected Output:**
```
=== Real-time Event Listener ===

📡 Listening for FamilyWallet events...
Contract: 0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e
Press Ctrl+C to stop

✅ Listener started!
💡 Try making a deposit in your frontend or another script...

💓 Listener active... 3:45:23 PM

[... waiting for events ...]

💰 NEW DEPOSIT DETECTED!
  Member: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
  Amount: 0.001 ETH
  New Balance: 0.006 ETH
  Timestamp: 11/21/2025, 3:46:30 PM
  Block: 7235100
  Tx Hash: 0x9876543...
  🔗 Etherscan: https://sepolia.etherscan.io/tx/0x9876543...

💓 Listener active... 3:46:53 PM
```

**Step 3:** Test the listener

In another terminal, trigger a deposit:

```powershell
# Terminal 2
npx tsx scripts/week7/backend-deposit.ts
```

Watch Terminal 1 - you'll see the event appear in real-time!

**What Just Happened?**
- ✅ Set up real-time event listener
- ✅ Detected new events as transactions confirm
- ✅ Parsed event data and displayed
- ✅ This runs continuously until you stop it
- ✅ This is how DeFi frontends show live updates!

---

### Activity 3: Store Events in PostgreSQL

**Goal:** Save blockchain events to database for analytics.

**Step 1:** Update PostgreSQL schema

```sql
-- Add event tracking columns if not present
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS event_name VARCHAR(50);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS event_data JSONB;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;
```

**Step 2:** Create `store-events-db.ts`

```typescript
// scripts/week7/store-events-db.ts
import { ethers } from "ethers";
import { network } from "hardhat";
import pkg from "pg";
const { Client } = pkg;

const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

const FAMILY_WALLET_ABI = [
  "event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
];

async function storeEventsInDB() {
  console.log("=== Storing Events in PostgreSQL ===\n");

  // Connect to PostgreSQL
  const db = new Client({
    host: "localhost",
    port: 5432,
    database: "family_chain",
    user: "family_chain_admin",
    password: "your_password_here", // Replace with actual password
  });

  await db.connect();
  console.log("✅ Connected to PostgreSQL");
  console.log("");

  // Connect to blockchain
  const connection = await network.connect();
  const provider = connection.ethers.provider;

  const contract = new ethers.Contract(
    FAMILY_WALLET_ADDRESS,
    FAMILY_WALLET_ABI,
    provider
  );

  // Query historical events
  console.log("🔍 Querying historical Deposit events...");
  const events = await contract.queryFilter("Deposited");
  console.log(`✅ Found ${events.length} events`);
  console.log("");

  // Store each event in database
  for (const event of events) {
    const member = event.args.member;
    const amount = ethers.formatEther(event.args.amount);
    const newBalance = ethers.formatEther(event.args.newBalance);
    const timestamp = new Date(Number(event.args.timestamp) * 1000);

    console.log(`💾 Storing event from block ${event.blockNumber}...`);

    // Check if event already exists
    const existing = await db.query(
      "SELECT * FROM transactions WHERE blockchain_hash = $1",
      [event.transactionHash]
    );

    if (existing.rows.length > 0) {
      console.log("  ⏭️  Event already in database, skipping");
      continue;
    }

    // Get account_id for member (simplified - assumes account exists)
    const accountResult = await db.query(
      "SELECT account_id FROM accounts WHERE wallet_address = $1",
      [member.toLowerCase()]
    );

    if (accountResult.rows.length === 0) {
      console.log(`  ⚠️  No account found for ${member}, skipping`);
      continue;
    }

    const accountId = accountResult.rows[0].account_id;

    // Insert transaction
    await db.query(`
      INSERT INTO transactions (
        account_id, transaction_type, amount, currency,
        blockchain_hash, block_number, event_name, event_data,
        status, confirmed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      accountId,
      "deposit",
      amount,
      "ETH",
      event.transactionHash,
      event.blockNumber,
      "Deposited",
      JSON.stringify({
        member,
        amount,
        newBalance,
        timestamp: timestamp.toISOString()
      }),
      "confirmed",
      timestamp
    ]);

    console.log("  ✅ Event stored!");
  }

  console.log("");
  console.log("📊 Database Summary:");

  // Count transactions
  const countResult = await db.query(
    "SELECT COUNT(*) FROM transactions WHERE event_name = 'Deposited'"
  );
  console.log(`  Total Deposit events in DB: ${countResult.rows[0].count}`);

  // Sum deposits
  const sumResult = await db.query(`
    SELECT SUM(amount::numeric) as total
    FROM transactions
    WHERE event_name = 'Deposited' AND currency = 'ETH'
  `);
  console.log(`  Total ETH deposited: ${sumResult.rows[0].total} ETH`);

  await db.end();
  console.log("");
  console.log("🎉 Events successfully stored in database!");
}

storeEventsInDB()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
```

**Step 3:** Run the script

```powershell
npx tsx scripts/week7/store-events-db.ts
```

**Expected Output:**
```
=== Storing Events in PostgreSQL ===

✅ Connected to PostgreSQL

🔍 Querying historical Deposit events...
✅ Found 5 events

💾 Storing event from block 7234500...
  ✅ Event stored!
💾 Storing event from block 7234700...
  ✅ Event stored!
💾 Storing event from block 7234800...
  ⏭️  Event already in database, skipping
💾 Storing event from block 7234900...
  ✅ Event stored!
💾 Storing event from block 7235000...
  ✅ Event stored!

📊 Database Summary:
  Total Deposit events in DB: 5
  Total ETH deposited: 0.005 ETH

🎉 Events successfully stored in database!
```

**What Just Happened?**
- ✅ Queried historical events from blockchain
- ✅ Stored each event in PostgreSQL
- ✅ Avoided duplicates (checked blockchain_hash)
- ✅ Linked to existing accounts table
- ✅ Now you can query events with SQL!
- ✅ This is the foundation for analytics dashboards

---

### Activity 4: Background Event Listener Service

**Goal:** Create a service that runs 24/7 monitoring blockchain events.

**Step 1:** Create `eventListenerService.ts`

```typescript
// services/eventListenerService.ts
import { ethers } from "ethers";
import pkg from "pg";
const { Client } = pkg;

export interface EventListenerConfig {
  contractAddress: string;
  contractABI: any[];
  eventNames: string[];
  dbConfig: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
}

export class EventListenerService {
  private provider: ethers.Provider | null = null;
  private contract: ethers.Contract | null = null;
  private db: Client | null = null;
  private config: EventListenerConfig;
  private isRunning = false;

  constructor(config: EventListenerConfig) {
    this.config = config;
  }

  /**
   * Initialize the service
   */
  async initialize(provider: ethers.Provider): Promise<void> {
    this.provider = provider;

    // Create contract instance
    this.contract = new ethers.Contract(
      this.config.contractAddress,
      this.config.contractABI,
      provider
    );

    // Connect to database
    this.db = new Client(this.config.dbConfig);
    await this.db.connect();

    console.log("✅ Event Listener Service initialized");
  }

  /**
   * Backfill historical events
   */
  async backfillEvents(fromBlock: number = 0): Promise<number> {
    if (!this.contract) throw new Error("Service not initialized");

    console.log(`🔍 Backfilling events from block ${fromBlock}...`);

    let totalStored = 0;

    for (const eventName of this.config.eventNames) {
      const events = await this.contract.queryFilter(eventName, fromBlock);
      console.log(`  Found ${events.length} ${eventName} events`);

      for (const event of events) {
        await this.storeEvent(event);
        totalStored++;
      }
    }

    console.log(`✅ Backfill complete: ${totalStored} events stored`);
    return totalStored;
  }

  /**
   * Start real-time event listening
   */
  async startListening(): Promise<void> {
    if (!this.contract) throw new Error("Service not initialized");
    if (this.isRunning) throw new Error("Already listening");

    this.isRunning = true;
    console.log("📡 Starting real-time event listener...");

    // Listen to each event type
    for (const eventName of this.config.eventNames) {
      this.contract.on(eventName, async (...args) => {
        // Last argument is the event object
        const event = args[args.length - 1];

        console.log(`💡 New ${eventName} event detected!`);
        console.log(`  Block: ${event.log.blockNumber}`);
        console.log(`  Tx: ${event.log.transactionHash}`);

        await this.storeEvent(event);
      });

      console.log(`  ✅ Listening for ${eventName}`);
    }

    console.log("✅ Real-time listener active!");
  }

  /**
   * Stop listening
   */
  async stopListening(): Promise<void> {
    if (!this.contract) return;
    if (!this.isRunning) return;

    console.log("🛑 Stopping event listener...");

    // Remove all listeners
    this.contract.removeAllListeners();

    this.isRunning = false;
    console.log("✅ Listener stopped");
  }

  /**
   * Store event in database
   */
  private async storeEvent(event: any): Promise<void> {
    if (!this.db) throw new Error("Database not connected");

    try {
      // Check if already stored
      const existing = await this.db.query(
        "SELECT * FROM transactions WHERE blockchain_hash = $1",
        [event.transactionHash]
      );

      if (existing.rows.length > 0) {
        console.log("  ⏭️  Event already in database");
        return;
      }

      // Parse event data (example for Deposited event)
      const member = event.args.member;
      const amount = ethers.formatEther(event.args.amount);
      const timestamp = new Date(Number(event.args.timestamp) * 1000);

      // Get account_id
      const accountResult = await this.db.query(
        "SELECT account_id FROM accounts WHERE wallet_address = $1",
        [member.toLowerCase()]
      );

      if (accountResult.rows.length === 0) {
        console.log(`  ⚠️  No account found for ${member}`);
        return;
      }

      const accountId = accountResult.rows[0].account_id;

      // Insert transaction
      await this.db.query(`
        INSERT INTO transactions (
          account_id, transaction_type, amount, currency,
          blockchain_hash, block_number, event_name, event_data,
          status, confirmed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        accountId,
        event.eventName === "Deposited" ? "deposit" : "withdraw",
        amount,
        "ETH",
        event.transactionHash,
        event.blockNumber,
        event.eventName,
        JSON.stringify(event.args),
        "confirmed",
        timestamp
      ]);

      console.log("  ✅ Event stored in database");
    } catch (error) {
      console.error("  ❌ Error storing event:", error);
    }
  }

  /**
   * Get service status
   */
  getStatus(): { isRunning: boolean; contractAddress: string; eventNames: string[] } {
    return {
      isRunning: this.isRunning,
      contractAddress: this.config.contractAddress,
      eventNames: this.config.eventNames
    };
  }

  /**
   * Cleanup
   */
  async shutdown(): Promise<void> {
    await this.stopListening();
    if (this.db) {
      await this.db.end();
      console.log("✅ Database connection closed");
    }
  }
}
```

**Step 2:** Create script using the service

```typescript
// scripts/week7/run-event-listener.ts
import { network } from "hardhat";
import { EventListenerService } from "../services/eventListenerService";

const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

const FAMILY_WALLET_ABI = [
  "event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
  "event Withdrawn(address indexed member, uint256 amount, uint256 remainingBalance, uint256 timestamp)",
];

async function runEventListener() {
  console.log("=== FamilyWallet Event Listener Service ===\n");

  // Connect to blockchain
  const connection = await network.connect();
  const provider = connection.ethers.provider;

  // Create service
  const service = new EventListenerService({
    contractAddress: FAMILY_WALLET_ADDRESS,
    contractABI: FAMILY_WALLET_ABI,
    eventNames: ["Deposited", "Withdrawn"],
    dbConfig: {
      host: "localhost",
      port: 5432,
      database: "family_chain",
      user: "family_chain_admin",
      password: "your_password_here", // Replace with actual
    }
  });

  // Initialize
  await service.initialize(provider);
  console.log("");

  // Backfill historical events (optional)
  const currentBlock = await provider.getBlockNumber();
  const startBlock = Math.max(0, currentBlock - 10000); // Last 10k blocks
  await service.backfillEvents(startBlock);
  console.log("");

  // Start real-time listening
  await service.startListening();
  console.log("");

  // Status update every minute
  setInterval(() => {
    const status = service.getStatus();
    console.log("📊 Service Status:", new Date().toLocaleTimeString());
    console.log(`  Running: ${status.isRunning ? "✅" : "❌"}`);
    console.log(`  Contract: ${status.contractAddress}`);
    console.log(`  Events: ${status.eventNames.join(", ")}`);
    console.log("");
  }, 60000); // Every 60 seconds

  // Graceful shutdown on Ctrl+C
  process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await service.shutdown();
    process.exit(0);
  });

  console.log("💡 Service running! Press Ctrl+C to stop");
  console.log("💡 Try making deposits in frontend to see real-time updates");
}

runEventListener()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
```

**Step 3:** Run the service

```powershell
npx tsx scripts/week7/run-event-listener.ts
```

**Expected Output:**
```
=== FamilyWallet Event Listener Service ===

✅ Event Listener Service initialized

🔍 Backfilling events from block 7225000...
  Found 3 Deposited events
  Found 0 Withdrawn events
  ✅ Event stored in database
  ✅ Event stored in database
  ⏭️  Event already in database
✅ Backfill complete: 2 events stored

📡 Starting real-time event listener...
  ✅ Listening for Deposited
  ✅ Listening for Withdrawn
✅ Real-time listener active!

💡 Service running! Press Ctrl+C to stop
💡 Try making deposits in frontend to see real-time updates

📊 Service Status: 3:50:30 PM
  Running: ✅
  Contract: 0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e
  Events: Deposited, Withdrawn

💡 New Deposited event detected!
  Block: 7235200
  Tx: 0xabc789...
  ✅ Event stored in database
```

**What Just Happened?**
- ✅ Created production-ready event listener service
- ✅ Backfilled historical events on startup
- ✅ Real-time monitoring for new events
- ✅ Automatic database storage
- ✅ Graceful shutdown handling
- ✅ This pattern is used by ALL DeFi indexers!

---

## 📝 Deliverables

By the end of this class, you should have:

- [x] ✅ Script to query historical events (`query-historical-events.ts`)
- [x] ✅ Real-time event listener script (`listen-realtime-events.ts`)
- [x] ✅ Database integration script (`store-events-db.ts`)
- [x] ✅ Reusable `EventListenerService` class
- [x] ✅ Background service that monitors blockchain 24/7
- [x] ✅ Events stored in PostgreSQL for analytics
- [x] ✅ Understanding of historical vs real-time patterns

---

## 🐛 Common Issues & Solutions

### Issue 1: "No events found" when querying

**Cause:** Contract hasn't emitted any events yet or wrong address.

**Solution:**
```typescript
// Verify contract address
console.log("Contract:", FAMILY_WALLET_ADDRESS);

// Make a deposit first to create events
npx tsx scripts/week7/backend-deposit.ts

// Then query again
npx tsx scripts/week7/query-historical-events.ts
```

---

### Issue 2: Event listener doesn't detect new events

**Cause:** Provider not polling or WebSocket disconnected.

**Solution:**
```typescript
// Check provider is polling
const provider = connection.ethers.provider;
console.log("Provider:", provider.constructor.name); // Should be JsonRpcProvider

// Increase polling interval if needed (default is ~4 seconds)
// Note: ethers.js v6 handles this automatically

// Or use WebSocket provider for instant updates
const wsProvider = new ethers.WebSocketProvider(
  "wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
);
```

---

### Issue 3: Database connection errors

**Cause:** PostgreSQL not running or wrong credentials.

**Solution:**
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# Start if not running
Start-Service postgresql-x64-18

# Test connection
psql -U family_chain_admin -d family_chain -c "SELECT 1"

# Verify credentials in script match database
```

---

### Issue 4: Duplicate events in database

**Cause:** Not checking for existing events before inserting.

**Solution:**
```typescript
// Always check first
const existing = await db.query(
  "SELECT * FROM transactions WHERE blockchain_hash = $1",
  [event.transactionHash]
);

if (existing.rows.length > 0) {
  console.log("Event already stored, skipping");
  return;
}

// Or use UNIQUE constraint on blockchain_hash
ALTER TABLE transactions ADD CONSTRAINT unique_blockchain_hash
  UNIQUE (blockchain_hash);
```

---

### Issue 5: "Cannot read property 'args' of undefined"

**Cause:** Event parsing error or wrong event structure.

**Solution:**
```typescript
// Check event structure
console.log("Event:", event);
console.log("Event name:", event.eventName);
console.log("Args:", event.args);

// Verify ABI matches contract
const ABI = [
  "event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
  // Must match EXACTLY what's in contract
];

// Parse carefully
if (event.args && event.args.member) {
  const member = event.args.member;
  // ...
}
```

---

## ✅ Self-Assessment Quiz

### 1. What's the difference between queryFilter() and contract.on()?

<details>
<summary>Answer</summary>

**queryFilter() - Historical Events:**
```typescript
// Query past events (already happened)
const events = await contract.queryFilter("Deposited");

// Characteristics:
// - Returns array of past events
// - One-time query (not continuous)
// - Can specify block range
// - Good for backfilling data
// - Returns immediately

// Example: Get all deposits from last month
const fromBlock = currentBlock - (30 * 24 * 60 * 60 / 12); // ~30 days
const events = await contract.queryFilter("Deposited", fromBlock);
```

**contract.on() - Real-time Events:**
```typescript
// Listen for future events (as they happen)
contract.on("Deposited", (member, amount, newBalance, timestamp, event) => {
  console.log("New deposit!");
});

// Characteristics:
// - Callback function (not array)
// - Continuous listening
// - No block range (always "now forward")
// - Good for real-time monitoring
// - Runs until stopped
```

**When to use:**

| Scenario | Use |
|----------|-----|
| Initial data load | queryFilter() |
| Analytics/reporting | queryFilter() |
| Live dashboard | contract.on() |
| Real-time alerts | contract.on() |
| Both (common!) | queryFilter() then contract.on() |

**Combined pattern:**
```typescript
// 1. Backfill historical
const historical = await contract.queryFilter("Deposited");
historical.forEach(event => storeInDB(event));

// 2. Then listen for new
contract.on("Deposited", (member, amount, newBalance, timestamp, event) => {
  storeInDB(event);
});
```

This is how The Graph, Dune Analytics, and all blockchain indexers work!

</details>

---

### 2. How do you filter events by specific parameters?

<details>
<summary>Answer</summary>

**Using contract.filters:**

```typescript
// Event definition (reminder)
event Deposited(
  address indexed member,    // Can filter!
  uint256 amount,           // Cannot filter (not indexed)
  uint256 newBalance,       // Cannot filter
  uint256 timestamp         // Cannot filter
)

// Filter by specific member
const memberAddress = "0x123...";
const filter = contract.filters.Deposited(memberAddress);
const events = await contract.queryFilter(filter);

// Filter by null (any member)
const allDeposits = contract.filters.Deposited(null);
const events = await contract.queryFilter(allDeposits);

// Listen with filter
contract.on(filter, (member, amount, newBalance, timestamp, event) => {
  // Only events from specific member
});
```

**Multiple filters:**
```typescript
// Event with multiple indexed params
event Transfer(
  address indexed from,
  address indexed to,
  uint256 amount
)

// Filter by from only
const fromFilter = contract.filters.Transfer("0xABC...", null);

// Filter by to only
const toFilter = contract.filters.Transfer(null, "0xDEF...");

// Filter by both
const specificTransfer = contract.filters.Transfer("0xABC...", "0xDEF...");
```

**Block range filtering:**
```typescript
// Last 1000 blocks
const currentBlock = await provider.getBlockNumber();
const events = await contract.queryFilter(
  "Deposited",
  currentBlock - 1000,
  currentBlock
);

// Specific block range
const events = await contract.queryFilter(
  "Deposited",
  7000000, // From block
  7100000  // To block
);

// Combine with parameter filter
const filter = contract.filters.Deposited("0x123...");
const events = await contract.queryFilter(filter, 7000000, 7100000);
```

**Important:**
- ✅ **Can filter:** `indexed` parameters
- ❌ **Cannot filter:** Non-indexed parameters
- Maximum 3 indexed parameters per event
- Filtering is done by blockchain (efficient)
- Non-indexed filtering requires client-side filtering (slow)

**Client-side filtering:**
```typescript
// Get all events
const allEvents = await contract.queryFilter("Deposited");

// Filter by non-indexed amount (slow!)
const largeDeposits = allEvents.filter(event => {
  return ethers.parseEther("0.01") < event.args.amount;
});
```

</details>

---

### 3. Why store events in PostgreSQL instead of querying blockchain each time?

<details>
<summary>Answer</summary>

**Reasons to store events in database:**

**1. Speed:**
```typescript
// ❌ Query blockchain (slow: ~500ms - 2s)
const events = await contract.queryFilter("Deposited");

// ✅ Query database (fast: ~5-50ms)
const events = await db.query("SELECT * FROM transactions WHERE event_name = 'Deposited'");
```

**2. Complex queries:**
```sql
-- ❌ Impossible on blockchain
SELECT member, COUNT(*), SUM(amount)
FROM transactions
WHERE event_name = 'Deposited'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY member
HAVING COUNT(*) > 5
ORDER BY SUM(amount) DESC;

-- On blockchain, you'd have to:
-- 1. Fetch ALL events
-- 2. Filter in JavaScript
-- 3. Aggregate in JavaScript
-- Very slow and wasteful!
```

**3. Relational data:**
```sql
-- Join with other tables
SELECT t.*, fm.name, fm.role
FROM transactions t
JOIN accounts a ON t.account_id = a.account_id
JOIN family_members fm ON a.family_member_id = fm.family_member_id
WHERE t.event_name = 'Deposited';

-- Blockchain has no concept of joins!
```

**4. Analytics:**
```sql
-- Time-series analytics
SELECT DATE(confirmed_at), SUM(amount)
FROM transactions
WHERE event_name = 'Deposited'
GROUP BY DATE(confirmed_at);

-- Trend analysis, forecasting, etc.
```

**5. Cost:**
```
Blockchain query: RPC call (counts toward rate limit)
Database query: Local (free, unlimited)

For 1000 users × 100 queries/day:
- Blockchain: 100,000 RPC calls/day (may exceed free tier)
- Database: Unlimited queries (no RPC cost)
```

**6. Offline access:**
```
Database: Works even if blockchain RPC is down
Blockchain: Dependent on RPC provider uptime
```

**7. Historical changes:**
```sql
-- Track how data changed over time
SELECT * FROM transactions WHERE account_id = 123 ORDER BY created_at;

-- Blockchain only has "current state" - no history
```

**Pattern:**
```
Blockchain = Source of Truth (immutable, authoritative)
Database = Fast Access Layer (indexed, queryable, relational)

1. Listen to blockchain events (canonical source)
2. Store in database (fast queries)
3. Serve from database (user-facing)
4. Verify against blockchain if dispute (trust but verify)
```

**This is exactly what Etherscan, Dune Analytics, The Graph do!**

</details>

---

### 4. What's the difference between WebSocket and HTTP providers for events?

<details>
<summary>Answer</summary>

**HTTP Provider (JsonRpcProvider):**

```typescript
const provider = new ethers.JsonRpcProvider(
  "https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
);

// How it works:
// - Polls blockchain every ~4 seconds
// - Asks: "Any new events?"
// - Blockchain responds with events or "no"
// - Repeats forever
```

**Characteristics:**
- ⏱️ **Latency:** 4-15 seconds
- 🔄 **Method:** Polling (repeated requests)
- 📊 **Efficiency:** More RPC calls
- 🔒 **Reliability:** More stable (HTTP is stateless)
- 💰 **Cost:** Higher (more requests)

**WebSocket Provider:**

```typescript
const provider = new ethers.WebSocketProvider(
  "wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
);

// How it works:
// - Opens persistent connection
// - Subscribes to events
// - Blockchain PUSHES events when they happen
// - No polling needed
```

**Characteristics:**
- ⏱️ **Latency:** 1-3 seconds (faster!)
- 🔄 **Method:** Push (server notifies)
- 📊 **Efficiency:** Fewer RPC calls
- ⚠️ **Reliability:** Can disconnect (need reconnect logic)
- 💰 **Cost:** Lower (fewer requests)

**Comparison table:**

| Feature | HTTP | WebSocket |
|---------|------|-----------|
| Speed | Slower (polling delay) | Faster (instant push) |
| RPC usage | ~15 requests/min | ~1 subscription |
| Connection | Stateless | Stateful |
| Disconnects | Rare | Can happen |
| Reconnect logic | Not needed | Required |
| Use case | Batch/analytics | Real-time alerts |

**Code example:**

```typescript
// HTTP - Simple but slower
const httpProvider = new ethers.JsonRpcProvider(httpUrl);
contract.on("Deposited", (member, amount) => {
  // Triggered ~4-15 seconds after tx confirmation
});

// WebSocket - Faster but needs reconnect
const wsProvider = new ethers.WebSocketProvider(wsUrl);

wsProvider.on("error", () => {
  console.log("WebSocket error, reconnecting...");
  // Reconnect logic here
});

contract.on("Deposited", (member, amount) => {
  // Triggered ~1-3 seconds after tx confirmation
});
```

**Production pattern:**
```typescript
// Primary: WebSocket (fast)
let provider = new ethers.WebSocketProvider(wsUrl);

// Fallback: HTTP (reliable)
provider.on("error", async () => {
  console.log("WebSocket failed, falling back to HTTP");
  provider = new ethers.JsonRpcProvider(httpUrl);
  // Re-attach listeners
});
```

**When to use:**
- ✅ **Development:** HTTP (simpler, stable)
- ✅ **Production real-time:** WebSocket (faster, cheaper)
- ✅ **Production batch:** HTTP (more reliable)
- ✅ **Best:** WebSocket with HTTP fallback

</details>

---

### 5. How do you handle blockchain reorganizations (reorgs)?

<details>
<summary>Answer</summary>

**What is a reorg?**
```
Original chain:
Block 100 → Block 101 (has your event) → Block 102

Reorg happens (longer chain found):
Block 100 → Block 101' (different!) → Block 102' → Block 103'
                ↑
          Your event might be gone or moved!
```

**Why reorgs happen:**
- Two miners find blocks simultaneously
- Network temporarily splits
- Longer chain eventually wins
- Recent blocks get "reorganized"

**Reorg statistics:**
- Mainnet: Very rare (<0.01% of blocks)
- Testnets: More common (~0.1% of blocks)
- Usually only affects last 1-2 blocks
- After 6 confirmations: Extremely unlikely
- After 12 confirmations: Practically impossible

**Prevention: Wait for confirmations**

```typescript
// ❌ Don't trust immediately
const tx = await contract.deposit({ value: amount });
// Event might get reorged!

// ✅ Wait for confirmations
const receipt = await tx.wait(3); // Wait for 3 confirmations
// After 3 blocks on top, very unlikely to reorg
```

**Detection: Store block hash**

```typescript
// Store event with block hash
await db.query(`
  INSERT INTO transactions (
    blockchain_hash, block_number, block_hash, event_data
  ) VALUES ($1, $2, $3, $4)
`, [
  event.transactionHash,
  event.blockNumber,
  event.log.blockHash, // ✅ Store this!
  JSON.stringify(event.args)
]);

// Periodically verify (e.g., every 100 blocks)
const storedBlockHash = await db.query(
  "SELECT block_hash FROM transactions WHERE block_number = $1",
  [blockNumber]
);

const currentBlock = await provider.getBlock(blockNumber);

if (currentBlock.hash !== storedBlockHash) {
  console.log("🔄 Reorg detected at block", blockNumber);
  // Re-query events for that block
  const events = await contract.queryFilter("Deposited", blockNumber, blockNumber);
  // Update database
}
```

**Handling: Re-query affected blocks**

```typescript
async function handleReorg(fromBlock: number, toBlock: number) {
  console.log(`🔄 Handling reorg for blocks ${fromBlock}-${toBlock}`);

  // 1. Mark old events as invalid
  await db.query(`
    UPDATE transactions
    SET status = 'reorged'
    WHERE block_number >= $1 AND block_number <= $2
  `, [fromBlock, toBlock]);

  // 2. Re-query blockchain for those blocks
  const events = await contract.queryFilter("Deposited", fromBlock, toBlock);

  // 3. Re-insert events with new block hashes
  for (const event of events) {
    await storeEvent(event);
  }

  console.log(`✅ Reorg handled: ${events.length} events re-indexed`);
}
```

**Best practices:**

**1. Wait for confirmations:**
```typescript
// For critical data (payments, transfers)
await tx.wait(6); // 6 confirmations ≈ 72 seconds

// For less critical (notifications)
await tx.wait(3); // 3 confirmations ≈ 36 seconds
```

**2. Store metadata:**
```sql
CREATE TABLE transactions (
  -- ...
  block_number BIGINT,
  block_hash VARCHAR(66), -- ✅ Can detect reorgs
  confirmations INTEGER,  -- ✅ Track safety level
  status VARCHAR(20)      -- ✅ 'pending', 'confirmed', 'reorged'
);
```

**3. Periodic verification:**
```typescript
// Every hour, check last 100 blocks for reorgs
setInterval(async () => {
  const currentBlock = await provider.getBlockNumber();
  const checkFrom = currentBlock - 100;

  for (let block = checkFrom; block <= currentBlock; block++) {
    await verifyBlock(block);
  }
}, 3600000); // 1 hour
```

**4. User communication:**
```
Status: Pending (0 confirmations) ⏳
Status: Confirming (1-2 confirmations) ⏳
Status: Confirmed (3+ confirmations) ✅
Status: Finalized (12+ confirmations) ✅✅
```

**For FamilyChain:**
- Wait 3 confirmations for deposits
- Wait 6 confirmations for withdrawals
- Store block hashes in database
- Re-query if hash mismatch detected
- Mark status: pending → confirming → confirmed

</details>

---

### 6. How does the EventListenerService handle both historical and real-time events?

<details>
<summary>Answer</summary>

**Two-phase approach:**

**Phase 1: Backfill (Historical)**
```typescript
async backfillEvents(fromBlock: number = 0): Promise<number> {
  // Query all past events
  const events = await contract.queryFilter("Deposited", fromBlock);

  // Store each in database
  for (const event of events) {
    await this.storeEvent(event);
  }

  return events.length;
}
```

**Phase 2: Listen (Real-time)**
```typescript
async startListening(): Promise<void> {
  // Set up continuous listener
  contract.on("Deposited", async (member, amount, newBalance, timestamp, event) => {
    // Store new events as they happen
    await this.storeEvent(event);
  });
}
```

**Complete workflow:**

```typescript
// 1. Initialize service
const service = new EventListenerService(config);
await service.initialize(provider);

// 2. Backfill historical events (one-time)
const currentBlock = await provider.getBlockNumber();
const startBlock = currentBlock - 10000; // Last 10k blocks
await service.backfillEvents(startBlock);
// Database now has all events from blocks 7225000-7235000

// 3. Start real-time listening (continuous)
await service.startListening();
// Service now monitors for new events

// Result: Complete event history + ongoing updates
```

**Why this pattern?**

**Without backfill:**
```
Database: Empty
Blockchain: 1000 events
Problem: Missing historical data!
```

**Without real-time:**
```
Database: 1000 events (at time of query)
Blockchain: 1005 events (5 new)
Problem: Database stale, missing new events!
```

**With both:**
```
Database: 1000 events (backfilled) + 5 events (real-time) = 1005 events ✅
Blockchain: 1005 events ✅
Perfect sync!
```

**Smart backfill (avoid duplicates):**
```typescript
async backfillEvents(fromBlock?: number): Promise<number> {
  // Check database for latest block
  const result = await db.query(
    "SELECT MAX(block_number) as max_block FROM transactions"
  );

  const lastStoredBlock = result.rows[0].max_block || 0;

  // Only backfill from where we left off
  const startBlock = fromBlock || (lastStoredBlock + 1);

  const events = await contract.queryFilter("Deposited", startBlock);

  for (const event of events) {
    // Duplicate check inside storeEvent()
    await this.storeEvent(event);
  }

  return events.length;
}
```

**Duplicate prevention:**
```typescript
private async storeEvent(event: any): Promise<void> {
  // Check if already stored
  const existing = await db.query(
    "SELECT * FROM transactions WHERE blockchain_hash = $1",
    [event.transactionHash]
  );

  if (existing.rows.length > 0) {
    console.log("Event already stored, skipping");
    return; // Don't insert duplicate
  }

  // Insert new event
  await db.query("INSERT INTO transactions ...");
}
```

**Production optimizations:**

**1. Chunked backfill (avoid timeouts):**
```typescript
async backfillEvents(fromBlock: number, toBlock: number): Promise<number> {
  const chunkSize = 1000; // Process 1000 blocks at a time
  let total = 0;

  for (let start = fromBlock; start <= toBlock; start += chunkSize) {
    const end = Math.min(start + chunkSize, toBlock);
    const events = await contract.queryFilter("Deposited", start, end);

    for (const event of events) {
      await this.storeEvent(event);
    }

    total += events.length;
    console.log(`Processed blocks ${start}-${end}: ${events.length} events`);
  }

  return total;
}
```

**2. Parallel processing:**
```typescript
// Store events in batches
const batchSize = 100;
for (let i = 0; i < events.length; i += batchSize) {
  const batch = events.slice(i, i + batchSize);
  await Promise.all(batch.map(event => this.storeEvent(event)));
}
```

**3. Restart resilience:**
```typescript
// On service restart:
// 1. Check last stored block
const lastBlock = await getLastStoredBlock();

// 2. Backfill gap
const currentBlock = await provider.getBlockNumber();
await backfillEvents(lastBlock + 1, currentBlock);

// 3. Resume real-time listening
await startListening();
// No events lost!
```

**This pattern powers:**
- The Graph (subgraphs)
- Dune Analytics
- Etherscan
- All blockchain indexers

</details>

---

## 🎯 Key Takeaways

1. **Events are cheap logs** - Much cheaper than storage, perfect for history
2. **Two patterns:** queryFilter() for history, on() for real-time
3. **indexed parameters are filterable** - Maximum 3 per event
4. **Store events in PostgreSQL** - Fast queries, relational joins, analytics
5. **WebSocket faster than HTTP** - But needs reconnect logic
6. **Wait for confirmations** - 3+ confirmations prevent reorg issues
7. **Backfill + Listen pattern** - Complete history + ongoing updates
8. **Duplicate checks essential** - Prevent same event stored twice

---

## 🔗 Next Steps

**Week 7 Complete!** You've now built:
- ✅ Backend blockchain connections (Class 7.1)
- ✅ Frontend DApp integration (Class 7.2 review)
- ✅ Backend transaction service (Class 7.3)
- ✅ Event listening and real-time updates (Class 7.4)

**Next: Week 8 - Buffer Week (Integration & Review)**
- Consolidate Weeks 1-7 learning
- Integrate all components (frontend + backend + database + blockchain)
- Fix any incomplete deliverables
- Prepare for Phase 2 (Core Platform)

**Before Week 8:**
- Ensure EventListenerService runs successfully
- Have events stored in PostgreSQL
- Review all Week 7 scripts
- Test full flow: deposit from frontend → event detected → stored in database

---

## 📚 Reading References

**Bitcoin Book:**
- **Chapter 6:** Transactions - Transaction Structure, Outputs and Inputs
- **Chapter 11:** Blockchain - Merkle Trees, Blockchain Forks

**Ethereum Book:**
- **Chapter 6:** Transactions - Transaction Structure, Digital Signatures
- **Chapter 7:** Smart Contracts - Events and Logs
- **Chapter 13:** EVM - Execution, Logs and Events

**Key sections:**
- Event logs and topics (how filtering works)
- Bloom filters (efficient event searching)
- Chain reorganizations (reorgs)
- Transaction lifecycle (from submission to finality)

---

## 🧑‍🏫 Teaching Notes (For Claude Code)

**Pacing:**
- 4 activities, ~60-90 minutes each
- Activity 1 is foundation (queryFilter)
- Activity 2 demonstrates real-time monitoring
- Activity 3 connects to Week 4 database
- Activity 4 ties everything together

**Common Student Questions:**
1. **"Why not just query blockchain each time?"** → Speed, cost, complex queries impossible
2. **"What if I miss events while service is down?"** → Backfill from last stored block on restart
3. **"Do I need WebSocket?"** → No, HTTP polling works fine for most use cases

**Version-Specific Gotchas:**
- ✅ `event.args` (v6) not `event.returnValues` (web3.js)
- ✅ `contract.queryFilter()` (v6) not `getPastEvents()` (v5)
- ✅ Event callback: last param is event object (v6)

**Real-World Connection:**
- The Graph: Subgraphs use exact same pattern (backfill + listen)
- Dune Analytics: Indexes ALL Ethereum events this way
- Etherscan: Real-time transaction feed uses event listeners
- Aave/Compound: Monitor liquidation events for bots

**Security Emphasis:**
- Always wait for confirmations (3+ recommended)
- Store block hashes to detect reorgs
- Validate event data before storing
- Handle database errors gracefully

**Setup for Next Week:**
- Week 8 is buffer week (integration time)
- Review all Phase 1 material
- Ensure all services working together
- Prepare for Phase 2 (Allowance system)

**Performance Tips:**
- Chunk large backfills (1000 blocks at a time)
- Use database transactions for batch inserts
- Add indexes on blockchain_hash and block_number
- Monitor RPC usage (stay within free tier limits)

---

*Last Updated: 2025-11-21*
*Course: FamilyChain Blockchain Development*
*Week 7, Class 7.4 of 4*
