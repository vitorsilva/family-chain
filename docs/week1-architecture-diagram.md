# FamilyChain Week 1 - Tools & Frameworks Architecture

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         DEVELOPMENT ENVIRONMENT                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                              YOUR COMPUTER                                   │
│                                                                              │
│  ┌────────────┐                                                             │
│  │  VS Code   │  ← You write code here                                      │
│  │  (Editor)  │                                                             │
│  └──────┬─────┘                                                             │
│         │                                                                    │
│         ├──────────┬──────────────┬──────────────┐                          │
│         ▼          ▼              ▼              ▼                          │
│  ┌──────────┐ ┌─────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ .sol     │ │  .ts    │  │ .json    │  │  .md     │                     │
│  │ Contract │ │ Tests/  │  │ Config   │  │  Docs    │                     │
│  │  Files   │ │ Scripts │  │  Files   │  │          │                     │
│  └──────────┘ └─────────┘  └──────────┘  └──────────┘                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
         │              │              │
         │              │              │
         ▼              ▼              ▼
╔════════════════════════════════════════════════════════════════════════════╗
║                            RUNTIME LAYER                                    ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                             ║
║  ┌──────────────────────────────────────────────────────────────┐         ║
║  │                      Node.js v22.14.0                         │         ║
║  │              (JavaScript/TypeScript Runtime)                  │         ║
║  └───────────────────────────┬──────────────────────────────────┘         ║
║                              │                                             ║
║                              ▼                                             ║
║  ┌──────────────────────────────────────────────────────────────┐         ║
║  │                     npm (Package Manager)                     │         ║
║  │                         v11.6.2                               │         ║
║  └───────────────────────────┬──────────────────────────────────┘         ║
║                              │                                             ║
║              ┌───────────────┼───────────────┐                            ║
║              │               │               │                            ║
║              ▼               ▼               ▼                            ║
║  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                     ║
║  │   Hardhat    │ │  ethers.js   │ │  TypeScript  │                     ║
║  │    3.0.8     │ │   v6.15.0    │ │    ~5.8.0    │                     ║
║  │ (Framework)  │ │  (Web3 Lib)  │ │  (Language)  │                     ║
║  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘                     ║
║         │                │                │                               ║
╚═════════┼════════════════┼════════════════┼═══════════════════════════════╝
          │                │                │
          └────────────────┼────────────────┘
                           │
                           ▼
╔════════════════════════════════════════════════════════════════════════════╗
║                       HARDHAT FRAMEWORK (Core Tool)                         ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                             ║
║   ┌─────────────────────────────────────────────────────────────┐         ║
║   │                    hardhat.config.ts                         │         ║
║   │  • Network configuration (localhost, sepolia, mainnet)       │         ║
║   │  • Solidity compiler settings (version, optimization)        │         ║
║   │  • Plugin configuration (ethers, verify, etc.)               │         ║
║   └──────────────────────────┬──────────────────────────────────┘         ║
║                              │                                             ║
║           ┌──────────────────┼──────────────────┐                         ║
║           │                  │                  │                         ║
║           ▼                  ▼                  ▼                         ║
║  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐               ║
║  │   npx hardhat  │ │  npx hardhat   │ │  npx hardhat   │               ║
║  │     build      │ │      test      │ │      run       │               ║
║  │                │ │                │ │   scripts/     │               ║
║  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘               ║
║          │                  │                  │                         ║
║          ▼                  ▼                  ▼                         ║
║  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐               ║
║  │  Solidity      │ │  Run Tests     │ │ Deploy Scripts │               ║
║  │  Compiler      │ │  (Mocha/Chai)  │ │  (TypeScript)  │               ║
║  │  (solc)        │ │                │ │                │               ║
║  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘               ║
║          │                  │                  │                         ║
║          ▼                  │                  │                         ║
║  ┌────────────────┐         │                  │                         ║
║  │   Artifacts    │         │                  │                         ║
║  │   • ABI        │         │                  │                         ║
║  │   • Bytecode   │◄────────┴──────────────────┘                         ║
║  └────────┬───────┘                                                       ║
║           │                                                               ║
╚═══════════┼═══════════════════════════════════════════════════════════════╝
            │
            ▼
╔════════════════════════════════════════════════════════════════════════════╗
║                        BLOCKCHAIN NETWORKS                                  ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                             ║
║  LOCAL (Development)                                                        ║
║  ┌──────────────────────────────────────────────────────────────┐         ║
║  │              Hardhat Network (In-Memory)                      │         ║
║  │  • Runs automatically during testing                          │         ║
║  │  • Instant mining, no gas costs                               │         ║
║  │  • 20 pre-funded test accounts                                │         ║
║  │  • Resets after each test                                     │         ║
║  │  • URL: http://localhost:8545                                 │         ║
║  └──────────────────────────────────────────────────────────────┘         ║
║                              ▲                                             ║
║                              │                                             ║
║                          Uses ethers.js                                    ║
║                              │                                             ║
║  ════════════════════════════┼═══════════════════════════════════         ║
║                              │                                             ║
║  PUBLIC (Testnet)            │                                             ║
║  ┌───────────────────────────┴──────────────────────────────────┐         ║
║  │                    Sepolia Testnet                            │         ║
║  │  • Public Ethereum testnet                                    │         ║
║  │  • Free test ETH from faucets                                 │         ║
║  │  • Persistent (doesn't reset)                                 │         ║
║  │  • Accessible by anyone                                       │         ║
║  │  • Connect via: Infura or Alchemy (RPC providers)            │         ║
║  └───────────────────────────────────────────────────────────────┘         ║
║                              ▲                                             ║
║                              │                                             ║
║                    ┌─────────┴─────────┐                                  ║
║                    │                   │                                  ║
║           ┌────────▼────────┐  ┌───────▼────────┐                        ║
║           │   Infura API    │  │  Alchemy API   │                        ║
║           │  (RPC Provider) │  │ (RPC Provider) │                        ║
║           │  • API Key req. │  │ • API Key req. │                        ║
║           └─────────────────┘  └────────────────┘                        ║
║                                                                             ║
╚════════════════════════════════════════════════════════════════════════════╝
                              ▲
                              │
                   Connects via ethers.js
                              │
╔════════════════════════════════════════════════════════════════════════════╗
║                          USER INTERACTION LAYER                             ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                             ║
║  ┌──────────────────────────────────────────────────────────────┐         ║
║  │                        MetaMask                               │         ║
║  │             (Browser Wallet Extension)                        │         ║
║  │  • Store private keys                                         │         ║
║  │  • Sign transactions                                          │         ║
║  │  • Connect to networks (Sepolia, Mainnet)                     │         ║
║  │  • Interact with DApps                                        │         ║
║  └───────────────────────────┬──────────────────────────────────┘         ║
║                              │                                             ║
║                              ▼                                             ║
║  ┌──────────────────────────────────────────────────────────────┐         ║
║  │                       Etherscan                               │         ║
║  │              (Blockchain Explorer)                            │         ║
║  │  • View transactions                                          │         ║
║  │  • Verify contracts                                           │         ║
║  │  • Read contract state                                        │         ║
║  │  • Get test ETH from faucet                                   │         ║
║  └──────────────────────────────────────────────────────────────┘         ║
║                                                                             ║
╚════════════════════════════════════════════════════════════════════════════╝


╔════════════════════════════════════════════════════════════════════════════╗
║                         DATA FLOW EXAMPLE                                   ║
║                   "Deploy HelloFamily Contract"                             ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                             ║
║  1. VS Code ──────────────► Write HelloFamily.sol                          ║
║                                                                             ║
║  2. Terminal ─────────────► npx hardhat build                              ║
║                                                                             ║
║  3. Hardhat ──────────────► Compile with Solidity compiler                 ║
║                                                                             ║
║  4. Output ───────────────► artifacts/HelloFamily.json                     ║
║                              • ABI (interface)                              ║
║                              • Bytecode (compiled code)                     ║
║                                                                             ║
║  5. Terminal ─────────────► npx hardhat run scripts/deploy.ts \            ║
║                              --network sepolia                              ║
║                                                                             ║
║  6. Deploy Script ────────► Uses ethers.js to:                             ║
║                              • Read private key from keystore               ║
║                              • Create transaction with bytecode             ║
║                              • Sign transaction                             ║
║                                                                             ║
║  7. ethers.js ────────────► Send transaction via Infura                    ║
║                              to Sepolia network                             ║
║                                                                             ║
║  8. Sepolia Network ──────► Mine transaction, deploy contract              ║
║                                                                             ║
║  9. Console Output ───────► "Contract deployed to: 0xABC123..."            ║
║                                                                             ║
║ 10. Etherscan ────────────► View contract at sepolia.etherscan.io          ║
║                                                                             ║
║ 11. MetaMask ─────────────► Users can interact with contract               ║
║                                                                             ║
╚════════════════════════════════════════════════════════════════════════════╝


╔════════════════════════════════════════════════════════════════════════════╗
║                        VERSION CONTROL & DOCS                               ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                             ║
║  ┌──────────────────────────────────────────────────────────────┐         ║
║  │                           Git                                 │         ║
║  │  • Track code changes                                         │         ║
║  │  • Branch management                                          │         ║
║  │  • Commit history                                             │         ║
║  └──────────────────────────────────────────────────────────────┘         ║
║                              │                                             ║
║                              ▼                                             ║
║  ┌──────────────────────────────────────────────────────────────┐         ║
║  │                         GitHub                                │         ║
║  │  • Remote repository                                          │         ║
║  │  • Collaboration                                              │         ║
║  │  • Portfolio showcase                                         │         ║
║  └──────────────────────────────────────────────────────────────┘         ║
║                                                                             ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## Key Relationships

### **Core Dependencies**
```
Node.js
  └── npm
       ├── Hardhat ───┬──► Solidity Compiler
       │              ├──► ethers.js
       │              └──► TypeScript Compiler
       │
       ├── ethers.js ──► Connects to blockchain networks
       │
       └── TypeScript ──► Compiles .ts files to JavaScript
```

### **Development Workflow**
```
Write Code (VS Code)
  ↓
Build (Hardhat + Solidity Compiler)
  ↓
Test (Hardhat Network + ethers.js)
  ↓
Deploy (Hardhat + ethers.js + Infura)
  ↓
Verify (Etherscan)
  ↓
Interact (MetaMask + Frontend)
```

### **Network Access**
```
Your Script/Test
  ↓
ethers.js library
  ↓
  ├──► Hardhat Network (localhost:8545)
  │     • No internet needed
  │     • Instant
  │
  └──► Sepolia Testnet
        ↓
        via Infura/Alchemy API
        • Internet required
        • Real network latency
```

---

## Tool Categories

| Category | Tools | Purpose |
|----------|-------|---------|
| **Editor** | VS Code | Write code |
| **Runtime** | Node.js, npm | Execute JavaScript/TypeScript |
| **Framework** | Hardhat | Smart contract development |
| **Library** | ethers.js | Interact with Ethereum |
| **Language** | Solidity, TypeScript | Write contracts and scripts |
| **Network (Local)** | Hardhat Network | Testing |
| **Network (Public)** | Sepolia, Infura, Alchemy | Deployment |
| **Wallet** | MetaMask | User interactions |
| **Explorer** | Etherscan | View blockchain data |
| **Version Control** | Git, GitHub | Track changes |

---

## Quick Reference

### **When to Use What**

**Daily Development:**
- Editor: VS Code
- Runtime: Node.js
- Framework: Hardhat
- Network: Hardhat Network (local)
- Commands: `npx hardhat build`, `npx hardhat test`

**Deploying to Testnet:**
- Network: Sepolia
- RPC Provider: Infura or Alchemy
- Wallet: MetaMask (for private key)
- Explorer: Etherscan (verify deployment)
- Command: `npx hardhat run scripts/deploy.ts --network sepolia`

**User Testing:**
- Wallet: MetaMask (connect to Sepolia)
- Explorer: Etherscan (view transactions)
- Faucet: Get test ETH from Sepolia faucet

---

## Learning Path

This diagram represents the Week 1 learning journey:

1. **Class 1.1:** Set up VS Code, Node.js, npm, Git
2. **Class 1.2:** Understand blockchain theory (networks, transactions)
3. **Class 1.3:** Write first contract (HelloFamily.sol)
   - Install Hardhat
   - Configure hardhat.config.ts
   - Build with Solidity compiler
   - Test with Hardhat Network + ethers.js
   - Deploy to Sepolia via Infura
   - Verify on Etherscan
   - Interact via MetaMask

By the end of Week 1, you understand how all these tools fit together!
