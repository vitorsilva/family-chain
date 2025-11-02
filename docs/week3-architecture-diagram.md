# Week 3: CLI Blockchain Interactions - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Week 3: CLI Blockchain Interactions           │
│                     (Command Line Scripts)                       │
└─────────────────────────────────────────────────────────────────┘

        Your TypeScript Scripts (12 scripts in scripts/week3/)
        ┌──────────────────────────────────────────────────────┐
        │  create-wallet.ts                                    │
        │  wallet-from-mnemonic.ts                            │
        │  wallet-with-provider.ts                            │
        │  load-existing-wallet.ts                            │
        │  send-transaction.ts                                │
        │  estimate-gas.ts                                    │
        │  check-transaction.ts                               │
        │  handle-errors.ts                                   │
        │  query-balances.ts                                  │
        │  explore-blocks.ts                                  │
        │  transaction-history.ts                             │
        │  monitor-blocks.ts                                  │
        └────────────────┬─────────────────────────────────────┘
                         │
                         │ uses
                         ↓
        ┌────────────────────────────────────────────────────┐
        │         Hardhat 3.0.8 Framework                    │
        │  ┌──────────────────────────────────────────────┐  │
        │  │  import { network } from "hardhat"           │  │
        │  │  const connection = await network.connect()  │  │
        │  └──────────────────────────────────────────────┘  │
        │                                                     │
        │  • Manages network connections                     │
        │  • Provides ethers.js instance                     │
        │  • Loads configuration (hardhat.config.ts)         │
        │  • Manages keystore (PRIVATE_KEY, RPC_URLs)        │
        └────────────────┬───────────────────────────────────┘
                         │
                         │ provides
                         ↓
        ┌────────────────────────────────────────────────────┐
        │         ethers.js v6.15.0 Library                  │
        │                                                     │
        │  Provider (Read-only):                             │
        │  • connection.ethers.provider                      │
        │  • getBalance(), getBlock(), getTransaction()      │
        │  • estimateGas(), getFeeData()                     │
        │                                                     │
        │  Signer (Can sign transactions):                   │
        │  • connection.ethers.getSigners()                  │
        │  • Wallet.createRandom()                           │
        │  • Wallet.fromPhrase(mnemonic)                     │
        │  • new Wallet(privateKey, provider)                │
        │                                                     │
        │  Wallet Components:                                │
        │  • Mnemonic (12 words) → Private Key → Address    │
        └────────┬───────────────────────────┬───────────────┘
                 │                           │
                 │ connects to               │ queries
                 ↓                           ↓
┌────────────────────────────────┐  ┌──────────────────────────┐
│   RPC Providers (Access Layer) │  │  Etherscan API V2        │
│                                 │  │  (Indexer Service)       │
│  Alchemy (Sepolia):             │  │                          │
│  https://eth-sepolia.g.alchemy │  │  api.etherscan.io/v2/api │
│    .com/v2/YOUR_KEY             │  │  ?chainid=11155111       │
│                                 │  │  &module=account         │
│  Alchemy (Mainnet):             │  │  &action=txlist          │
│  https://eth-mainnet.g.alchemy │  │                          │
│    .com/v2/YOUR_KEY             │  │  • Get transaction       │
│                                 │  │    history by address    │
│  Local Hardhat Node:            │  │  • Indexed data          │
│  http://127.0.0.1:8545          │  │  • Works across 60+      │
│  (npx hardhat node)             │  │    networks              │
│                                 │  │                          │
│  • JSON-RPC interface           │  └──────────────────────────┘
│  • Access point to blockchain   │
└────────┬────────────────────────┘
         │
         │ connects to
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Blockchain Networks (The Data)                  │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │ Sepolia Testnet  │  │ Ethereum Mainnet │  │ Local Hardhat │  │
│  │                  │  │                  │  │   Network     │  │
│  │ • Test ETH       │  │ • Real ETH       │  │               │  │
│  │ • 12-sec blocks  │  │ • 12-sec blocks  │  │ • 10k ETH     │  │
│  │ • Free gas       │  │ • Real gas costs │  │ • Instant     │  │
│  │ • Persistent     │  │ • Production     │  │ • Resets      │  │
│  │                  │  │                  │  │               │  │
│  │ Your wallet:     │  │ Base fee:        │  │ 20 accounts   │  │
│  │ 0xB09b...5736    │  │ ~0.28 gwei       │  │ pre-funded    │  │
│  │ 0.80 ETH         │  │ (28M x Sepolia)  │  │               │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
│                                                                   │
│  All networks share same structure:                              │
│  • Blocks (parent hash chain)                                    │
│  • Transactions (nonce, gas, value)                              │
│  • Accounts (address → balance)                                  │
│  • Confirmations (current block - tx block)                      │
└───────────────────────────────────────────────────────────────────┘

                            Data Flow Examples

1. CREATE WALLET (Local, no blockchain):
   Script → ethers.js → Wallet.createRandom()
   → Generates: Mnemonic → Private Key → Address

2. SEND TRANSACTION (Blockchain write):
   Script → Hardhat → ethers.js → Alchemy RPC → Sepolia
   → Transaction mined in block
   → Returns: transaction hash

3. QUERY BALANCE (Blockchain read):
   Script → Hardhat → ethers.js → Alchemy RPC → Sepolia
   → Returns: balance in wei

4. GET TX HISTORY (Indexer query):
   Script → HTTP request → Etherscan API V2
   → Returns: all transactions for address
   (Note: Can't do this via RPC - nodes don't index by address!)

5. MONITOR BLOCKS (Real-time read):
   Script → setInterval → ethers.js → Alchemy RPC → Sepolia
   → Polls every 6 seconds for new blocks

                     Configuration & Security

┌─────────────────────────────────────────────────────────────────┐
│  Hardhat Keystore (Encrypted local storage)                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SEPOLIA_PRIVATE_KEY=[encrypted - never shown in code]    │ │
│  │  SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/... │ │
│  │  MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/... │ │
│  │  ETHERSCAN_API_KEY=YOUR_KEY                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Accessed via: npx hardhat keystore set --dev VARIABLE_NAME     │
│  Used in config: configVariable("VARIABLE_NAME")                │
└──────────────────────────────────────────────────────────────────┘

                         Key Concepts Learned

• Wallet = Mnemonic → Private Key → Address (deterministic)
• Provider = Read-only blockchain access
• Signer = Provider + Private Key (can send transactions)
• Nonce = Sequential transaction counter (prevents replay)
• Gas = Computation cost (21,000 for simple ETH transfer)
• Confirmations = Blocks since transaction (security measure)
• Parent Hash = Links blocks into immutable chain
• Indexers = Services that index blockchain by address (Etherscan)
• Testnet vs Mainnet = 28,000,000x cost difference!
```
