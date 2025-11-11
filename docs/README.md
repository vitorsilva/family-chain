# FamilyChain Learning Guides
## Master Index

---

## 📚 About These Learning Guides

This directory contains **comprehensive, hands-on learning guides** for the FamilyChain blockchain development course. Each guide follows a consistent structure designed for **self-directed learning with Claude Code as your hybrid cohort**.

### Guide Structure

Each learning guide includes:
- **Learning Objectives** - Clear, measurable outcomes
- **Key Concepts** - Detailed explanations with examples and tables
- **Hands-On Activities** - Step-by-step instructions with PowerShell commands
- **Expected Outputs** - What you should see when commands work correctly
- **Deliverables** - Clear success criteria for completion
- **Common Issues & Solutions** - Troubleshooting guide
- **Self-Assessment Quizzes** - Test your understanding (with answers)
- **Key Takeaways** - Summary of essential concepts
- **Next Steps** - What comes next in the course
- **Teaching Notes** - Instructions for Claude Code on how to guide effectively

### When to Use These Guides

**Learning guides are created at the END of each week** after you've completed the work. They serve as:
- ✅ **Reference material** for future review
- ✅ **Documentation** of what you learned
- ✅ **Teaching material** if sharing the course with others
- ✅ **Portfolio artifact** demonstrating your documentation skills

**During the week:** Work with Claude Code interactively, ask questions, explore
**After the week:** Consolidate learning by creating/reviewing the guide

---

## 📂 File Naming Convention

All learning guides follow this consistent naming pattern:

```
weekXX-classX.X-topic-name.md
```

**Examples:**
- `week1-class1.1-environment-setup.md`
- `week1-class1.2-blockchain-theory.md`
- `week27-class27.1-mutation-testing.md`

**Why this structure?**
- Sorts chronologically in file explorers
- Easy to find specific week/class
- Clear topic identification
- Consistent with course plan structure

---

## 📖 Available Learning Guides

### Phase 1: Blockchain Foundation (Weeks 1-8)

#### Week 1: Environment Setup & Blockchain Theory

| Class | Guide | Duration | Status |
|-------|-------|----------|--------|
| **1.1** | [Environment Setup](week1-class1.1-environment-setup.md) | 1-2 hours | ✅ Complete |
| **1.2** | [Blockchain Theory](week1-class1.2-blockchain-theory.md) | 2-3 hours | ✅ Complete |
| **1.3** | [First Smart Contract](week1-class1.3-first-smart-contract.md) | 3-4 hours | ✅ Complete |

**Week 1 Learning Outcomes:**
- ✅ Development environment configured (Git, Node.js, VS Code, Hardhat 3)
- ✅ Understanding of blockchain fundamentals (blocks, chains, consensus)
- ✅ Bitcoin vs Ethereum differences
- ✅ Gas mechanism and wallet security
- ✅ First smart contract written (HelloFamily.sol)
- ✅ Comprehensive tests written and passing
- ✅ Contract deployed to Sepolia testnet
- ✅ **Early Win:** Live smart contract on public blockchain!

**Reading References (Week 1):**
- Bitcoin Book: Chapter 1 (Introduction), Chapter 2 (How Bitcoin Works)
- Ethereum Book: Chapter 1 (What Is Ethereum), Chapter 2 (Intro)

---

#### Week 2: Running Your First Ethereum Node

| Class | Guide | Duration | Status |
|-------|-------|----------|--------|
| **2.1** | [Installing and Configuring Geth](week2-class2.1-installing-geth.md) | 2-3 hours | ✅ Complete |
| **2.2** | [Node Operations and Monitoring](week2-class2.2-node-operations.md) | 3-4 hours | ✅ Complete |
| **2.3** | [Getting Testnet ETH](week2-class2.3-testnet-eth.md) | 1-2 hours | ✅ Complete |

**Week 2 Learning Outcomes:**
- ✅ Understanding execution clients (Geth) vs consensus clients (Lighthouse)
- ✅ Installing Geth v1.16.5 and Lighthouse v8.0.0-rc.2 (WSL Ubuntu)
- ✅ Configuring JWT authentication between clients
- ✅ Hybrid approach: RPC provider (Alchemy) for development, local node ready for Week 11+
- ✅ Systemd services and helper scripts created
- ✅ Understanding sync modes, node types, peer discovery
- ✅ Wallet balance verified (0.80 SepoliaETH)
- ✅ **Early Win:** Infrastructure ready for both development approaches!

**Reading References (Week 2):**
- Bitcoin Book: Chapter 3 (Bitcoin Core - Running a Node)
- Ethereum Book: Chapter 3 (Clients - Running an Ethereum Client)

---

#### Week 3: Command Line Blockchain Interactions

| Class | Guide | Duration | Status |
|-------|-------|----------|--------|
| **3.1** | [Creating Wallets via CLI](week3-class3.1-creating-wallets-cli.md) | 1-2 hours | ✅ Complete |
| **3.2** | [Sending Your First Transaction](week3-class3.2-sending-first-transaction.md) | 2 hours | ✅ Complete |
| **3.3** | [Querying Blockchain Data](week3-class3.3-querying-blockchain-data.md) | 1-2 hours | ✅ Complete |
| **3.4** | [Hardhat Project Exploration](week3-class3.4-hardhat-project-exploration.md) | 1-2 hours | ✅ Complete |

**Week 3 Learning Outcomes (ALL COMPLETE):**
- ✅ Create wallets programmatically (random, mnemonic, HD derivation)
- ✅ Hardhat 3 network connection patterns (`network.connect()`, `getSigners()`)
- ✅ Understanding wallet components (mnemonic, private key, address)
- ✅ Wallet recovery and HD wallet concepts
- ✅ Send ETH transactions via CLI with gas estimation
- ✅ Estimate gas costs before sending transactions
- ✅ Check transaction status and confirmations
- ✅ Handle transaction errors gracefully
- ✅ Query account balances from blockchain
- ✅ Explore block data (headers, transactions, utilization, parent hash)
- ✅ Get transaction history using Etherscan API V2
- ✅ Identify transaction types (ETH transfers vs contract deployments)
- ✅ Understand blockchain immutability via parent hash chain
- ✅ Monitor blockchain in real-time (polling pattern)
- ✅ Configure and compare mainnet vs testnet (28M times cost difference!)
- ✅ Understand Hardhat 3 project structure (contracts, artifacts, tests, scripts)
- ✅ Master Hardhat tasks (build, clean, test, node)
- ✅ Understand artifacts (ABI + bytecode in JSON)
- ✅ Run both Solidity and Mocha tests (10 tests passing)
- ✅ Start and use local Hardhat blockchain (instant mining, 10,000 ETH accounts)
- ✅ **Early Win:** Send ETH programmatically! (0x85324acc...)
- ✅ **Bonus:** Fixed formatEther bug, configured mainnet monitoring, verified docs with MCP tools

**Reading References (Week 3):**
- Bitcoin Book: Chapter 4 (Keys), Chapter 5 (Wallets), Chapter 6 (Transactions)
- Ethereum Book: Chapter 4 (Keys and Addresses), Chapter 5 (Wallets), Chapter 6 (Transactions)

---

#### Week 4: Database Design & Architecture

| Class | Guide | Duration | Status |
|-------|-------|----------|--------|
| **4.1** | PostgreSQL Setup and Schema Design | 2-3 hours | ✅ Complete |
| **4.2** | Redis Configuration and Caching Patterns | 1-2 hours | ✅ Complete |
| **4.3** | Data Modeling for Financial Systems | 3-4 hours | ✅ Complete |
| **4.4** | Database Security and Encryption | 3-4 hours | ✅ Complete |

**Week 4 Learning Outcomes (ALL COMPLETE):**
- ✅ PostgreSQL 18 setup with schema design (family_members, accounts)
- ✅ Redis caching with Docker (50-108x speedup!)
- ✅ Double-entry bookkeeping with ledger_entries
- ✅ Stored procedures (55% faster than application-level)
- ✅ Audit logging with JSONB and triggers
- ✅ **Real Sepolia blockchain integration** (linked actual transaction!)
- ✅ NUMERIC precision for financial data
- ✅ Row locking (FOR UPDATE) to prevent race conditions
- ✅ AES-256-GCM encryption for sensitive PII (IBANs, NIFs)
- ✅ Role-Based Access Control (RBAC) with 3 database roles
- ✅ GDPR compliance (Right to Portability + Right to Erasure)
- ✅ Automated backup system with retention policy
- ✅ 62 comprehensive tests (100% pass rate)

**Reading References (Week 4):**
- Bitcoin Book: Chapter 6 (Transactions), Chapter 11 (Blockchain)
- Ethereum Book: Chapter 6 (Transactions), Chapter 13 (EVM)

---

#### Weeks 5-8

🔜 **Learning guides will be created after completing each week**

---

### Phase 2: Core Platform (Weeks 9-16)

🔜 **Learning guides will be created after completing each week**

---

### Phase 3: Advanced Features (Weeks 17-24)

🔜 **Learning guides will be created after completing each week**

---

### Phase 4: Production (Weeks 25-30)

#### Week 27: Testing Strategies

| Class | Guide | Duration | Status |
|-------|-------|----------|--------|
| **27.1** | [Unit Testing + Mutation Testing](week27-class27.1-mutation-testing.md) | 4-5 hours | ✅ Complete |

**Week 27 Class 27.1 Learning Outcomes:**
- ✅ Understanding test quality vs code coverage
- ✅ Manual mutation exercises (weak vs strong tests)
- ✅ Installing Gambit mutation testing tool
- ✅ Running mutation tests on contracts
- ✅ Interpreting mutation reports and scores
- ✅ Fixing surviving mutants
- ✅ Target: >80% mutation score for critical contracts

---

## 📋 Guide Statistics

| Metric | Count |
|--------|-------|
| **Total Guides Created** | 7 |
| **Guides Remaining** | ~77 (estimated based on 30-week course) |
| **Total Words (Current)** | ~50,000 words |
| **Average Guide Length** | ~7,000 words |

---

## 🎓 How to Use These Guides

### For Self-Learning:

1. **Before Starting a Week:**
   - Read the course plan section for that week
   - Review learning objectives
   - Ensure prerequisites completed

2. **During the Week:**
   - Work with Claude Code interactively
   - Follow the class activities
   - Ask questions as they arise
   - Complete hands-on exercises

3. **After Completing a Week:**
   - Review the learning guide
   - Complete self-assessment quizzes
   - Verify all deliverables achieved
   - Document your own insights in `docs/weekN-learning-notes.md`

### For Claude Code (Teaching):

When guiding the user through classes:

1. **Reference the learning guide** for structure and key concepts
2. **Follow teaching notes** for pacing and emphasis
3. **Use hands-on activities** as the primary learning method
4. **Check understanding** with self-assessment questions
5. **Adapt pacing** based on user's learning style (as documented in CLAUDE.md)

### For Sharing/Teaching Others:

Each guide is:
- ✅ **Self-contained** - Can be followed independently
- ✅ **Hands-on focused** - Learning by doing
- ✅ **Thoroughly tested** - Based on actual completion experience
- ✅ **Troubleshooting included** - Common issues documented
- ✅ **Assessment included** - Self-checks for understanding

---

## 📚 Reading Material References

All learning guides reference chapters from:

1. **Bitcoin Book** (`/assets/bitcoinbook-develop/`)
   - Blockchain fundamentals
   - Transactions and keys
   - Network architecture
   - Security principles

2. **Ethereum Book** (`/assets/ethereumbook-develop/`)
   - Ethereum-specific concepts
   - Smart contracts and Solidity
   - DApp development
   - Security best practices

**How to read:**
- Guides list relevant chapters at the end
- Read **before or during** each week
- Focus on sections mentioned in learning objectives
- Bitcoin book provides foundational concepts
- Ethereum book provides practical implementation details

**Reading Strategy:**
```
Week Start → Skim assigned chapters (big picture)
    ↓
During Week → Deep read as concepts appear in activities
    ↓
Week End → Review chapters to consolidate understanding
```

---

## 🔄 Guide Creation Process

### Timeline:
```
Week N (Monday-Friday): Complete the work
    ↓
Weekend: Review what was learned
    ↓
Week N+1 (Start): Create learning guide for Week N
    ↓
Result: Guide reflects actual experience, not theory
```

### Why Create Guides After Completion?

1. **Authentic content** - Based on real experience, not assumptions
2. **Troubleshooting** - Documents actual issues encountered
3. **Best practices** - Captures what worked well
4. **Accurate timing** - Real durations, not estimates
5. **Teaching insights** - What was confusing? What needs emphasis?

### Guide Creation Checklist:

When creating a new learning guide:

- [ ] Follow `weekXX-classX.X-topic-name.md` naming convention
- [ ] Include all standard sections (objectives, concepts, activities, etc.)
- [ ] Reference relevant Bitcoin/Ethereum book chapters
- [ ] Include PowerShell commands with expected outputs (Windows-first)
- [ ] Document troubleshooting for issues encountered
- [ ] Write self-assessment questions with answers
- [ ] Add to this master index
- [ ] Update COURSE_PLAN.md with learning guide link
- [ ] Update `docs/weekN-learning-notes.md` with session insights

---

## 🎯 Success Metrics

A learning guide is considered **complete** when it includes:

✅ **Clear learning objectives** (3-7 measurable outcomes)
✅ **Key concepts explained** (with examples and analogies)
✅ **Hands-on activities** (step-by-step with commands)
✅ **Expected outputs** (so learner knows if correct)
✅ **Deliverables** (clear success criteria)
✅ **Troubleshooting** (common issues + solutions)
✅ **Self-assessment** (5-10 questions with answers)
✅ **Book references** (relevant chapters from Bitcoin/Ethereum books)
✅ **Time estimates** (based on actual completion time)
✅ **Teaching notes** (for Claude Code guidance)

---

## 📝 Contributing to Learning Guides

As you progress through the course:

1. **Document challenges** in `docs/weekN-learning-notes.md`
2. **Note time taken** for each activity
3. **Save error messages** you encountered
4. **Record what worked** vs what didn't
5. **Capture insights** for future learners

These notes become the foundation for creating comprehensive learning guides.

---

## 🔗 Related Documentation

- **[COURSE_PLAN.md](../COURSE_PLAN.md)** - Complete 30-week course structure
- **[CLAUDE.md](../CLAUDE.md)** - Project overview and teaching approach
- **[Bitcoin Book](../assets/bitcoinbook-develop/)** - Blockchain fundamentals
- **[Ethereum Book](../assets/ethereumbook-develop/)** - Ethereum development

---

## 📧 Feedback & Improvements

As you use these guides:
- Note unclear sections in `docs/weekN-learning-notes.md`
- Suggest improvements for future iterations
- Document additional troubleshooting tips discovered
- Share insights with others learning blockchain development

---

**Last Updated:** 2025-01-10 (Week 4 Complete!)
**Course Progress:** Week 1 ✅ | Week 2 ✅ | Week 3 ✅ | Week 4 ✅ COMPLETE | Week 5 🔜 Next
**Total Learning Guides:** 11 of ~80 planned (Week 1: 3, Week 2: 4, Week 3: 4)
**Self-Assessment:** Week 4 - 10/10 (100%) ✅

---

*These learning guides are part of the FamilyChain blockchain development course - a 30-week hands-on journey building a production-ready decentralized family finance platform.*
