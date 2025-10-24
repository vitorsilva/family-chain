# FamilyChain Development Course
## Blockchain + Banking Integration Learning Project

---

## 🎯 Course Overview

**FamilyChain** is a hands-on blockchain development course where you'll build a real-world family finance platform that bridges traditional Portuguese banking (via PSD2 Open Banking APIs) with blockchain technology.

This isn't just a tutorial - it's a complete full-stack project that will take you from blockchain basics to production-ready deployment, covering every skill required for professional blockchain/fintech development.

### What You're Building

A decentralized family finance platform with features like:
- Automated crypto allowances for kids
- Multi-signature family savings pools
- Cross-border remittance with stablecoins
- Token-based reward systems
- Smart contract loans with automatic repayment
- Integration with Portuguese banks (CGD, Millennium BCP, Santander)
- DAO-style family governance for expenses

---

## 📋 Prerequisites

### Required Knowledge
- **Intermediate JavaScript/TypeScript proficiency** (async/await, promises, OOP concepts)
- Familiarity with command line/terminal
- Git basics
- Understanding of Node.js ecosystem (npm/yarn)

### Recommended (but you'll learn along the way)
- REST API concepts
- Database basics
- Docker fundamentals
- React basics

### What You'll Need
- Computer with 16GB+ RAM (for running blockchain nodes)
- Windows/Mac/Linux
- ~100GB free disk space
- Internet connection
- GitHub account

---

## 📖 Learning Guides

This course includes **comprehensive, hands-on learning guides** for each week's classes. These guides are created **at the end of each week** to document what was learned and serve as reference material.

**📚 [View All Learning Guides](docs/README.md)** - Master index with complete list

### What's Included in Each Guide:
- ✅ Clear learning objectives and key concepts
- ✅ Step-by-step hands-on activities (PowerShell commands for Windows)
- ✅ Expected outputs so you know if you're on track
- ✅ Troubleshooting for common issues
- ✅ Self-assessment quizzes with answers
- ✅ References to Bitcoin Book and Ethereum Book chapters
- ✅ Teaching notes for Claude Code guidance

**When to Use Learning Guides:**
- **During the week:** Work interactively with Claude Code, ask questions
- **After the week:** Review the guide to consolidate learning
- **For reference:** Return to guides when you need to refresh concepts

**Currently Available:**
- ✅ Week 1 (Classes 1.1, 1.2, 1.3) - Environment, Theory, First Contract
- ✅ Week 27 (Class 27.1) - Mutation Testing
- 🔜 Additional guides created as you progress through the course

---

## 🎓 Learning Outcomes

By completing this course, you will be able to:

### Blockchain Skills
✅ Set up and run blockchain nodes (Geth)
✅ Write, test, and deploy Solidity smart contracts
✅ Integrate applications with Ethereum and other EVM chains
✅ Implement multi-signature wallets and DAO governance
✅ Build token economies (ERC-20) with staking mechanisms
✅ Deploy to multiple chains (Ethereum, Polygon)
✅ Implement MEV protection and slippage safeguards
✅ Handle gas optimization and transaction management across chains

### Optional Advanced Skills (Post-Course)
✅ Create liquidity pools and understand AMM (Automated Market Maker) mechanics
✅ Build cross-chain bridges for token transfers
✅ Implement advanced GraphQL and WebSocket servers

### Backend Development
✅ Build microservices in **Node.js/TypeScript**, **Go**, and **Python**
✅ Design and implement PostgreSQL database schemas
✅ Use Redis for caching and pub/sub patterns
✅ Create RESTful APIs and basic GraphQL endpoints
✅ Implement authentication and authorization systems

### Banking/Fintech Integration
✅ Integrate with PSD2 Open Banking APIs
✅ Handle OAuth2 authentication flows
✅ Implement SEPA payment initiation
✅ Build GDPR-compliant financial systems
✅ Navigate Portuguese banking regulations (Banco de Portugal, AT)

### DevOps & Production
✅ Containerize applications with Docker
✅ Set up CI/CD pipelines with GitHub Actions
✅ Implement comprehensive testing (unit, integration, e2e)
✅ Monitor systems with Grafana and ELK stack
✅ Deploy to production environments

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────┐
│   Family Dashboard (React/Next.js)  │
│  "Unified family finance view"      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      API Gateway (Node.js/TS)       │
│  "Routes & authentication"          │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
┌───────▼──────┐  ┌──▼──────────────┐
│  PSD2 Bridge │  │  Blockchain     │
│  Service     │  │  Service        │
│  (Node.js)   │  │  (Node.js/Go)   │
├──────────────┤  ├─────────────────┤
│ • CGD API    │  │ • Smart         │
│ • BCP API    │  │   Contracts     │
│ • Santander  │  │ • Web3.js       │
│ • Payment    │  │ • Event         │
│   Initiation │  │   Listeners     │
└──────┬───────┘  └────────┬────────┘
       │                    │
       │  ┌────────────┐   │
       └──► PostgreSQL ◄───┘
          │  + Redis   │
          └────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼──────────┐  ┌──────▼────────┐
│ Portuguese   │  │  Blockchain   │
│ Banks        │  │  Networks     │
│ (PSD2 APIs)  │  │  (Geth/etc)   │
└──────────────┘  └───────────────┘
```

---

## 📚 Module Breakdown (30 Weeks)

### **PHASE 1: BLOCKCHAIN FOUNDATION** (Weeks 1-8)

#### Week 1: Environment Setup & Blockchain Theory
**Duration:** 1 week
**Goal:** Set up development environment and understand blockchain fundamentals

- **Class 1.1:** Minimal Development Environment Setup
  - Install Git and create GitHub account
  - Set up VS Code with essential extensions (Solidity, Hardhat Solidity, Prettier, ESLint)
  - Install Node.js v22.14.0+ (needed for blockchain CLI interactions)
  - Install Hardhat 3.0.8+ via `npx hardhat --init`
  - Basic terminal/command line navigation (PowerShell on Windows)

  **Version Requirements:**
  - Node.js: v22.14.0 or higher
  - npm: 11.6.2 or higher
  - Hardhat: 3.0.8 or higher ⚠️ **NOT Hardhat 2.x**

  **Important:** Hardhat 3 has breaking changes from 2.x - use `build` not `compile`, keystore not .env

- **Class 1.2:** Introduction to Blockchain Architecture
  - How blockchains work (blocks, chains, consensus)
  - Ethereum vs Bitcoin differences
  - Understanding gas, transactions, wallets
  - Introduction to DeFi and DEXs (Uniswap, SushiSwap concepts)
  - Smart contracts vs traditional applications

- **Class 1.3:** Planning Your First Smart Contract
  - Smart contract basics (what they are, how they work)
  - Solidity overview
  - Introduction to Hardhat
  - Understanding testnets

**Reading:**
- Bitcoin Book: Chapter 1 (Introduction), Chapter 2 (How Bitcoin Works - Bitcoin Overview)
- Ethereum Book: Chapter 1 (What Is Ethereum), Chapter 2 (Intro)

**Deliverable:** Development environment ready + blockchain concept understanding

**Early Win:** Deploy a "Hello Family" smart contract to testnet by end of week

**Learning Guides:**
- 📖 [Class 1.1: Environment Setup](docs/week1-class1.1-environment-setup.md)
- 📖 [Class 1.2: Blockchain Theory](docs/week1-class1.2-blockchain-theory.md)
- 📖 [Class 1.3: First Smart Contract](docs/week1-class1.3-first-smart-contract.md)

**Week 1 Completion Checklist:**

Before moving to Week 2, complete the self-assessment:

- [ ] **Class 1.1 Quiz:** Complete all questions in Environment Setup guide
  - Can you explain what Git is and why you need it?
  - What's the difference between Node.js and npm?
  - Why does version compatibility matter?

- [ ] **Class 1.2 Quiz:** Complete all questions in Blockchain Theory guide
  - Can you explain how blockchains work in your own words?
  - What's the difference between Bitcoin and Ethereum?
  - Why does gas exist on Ethereum?
  - What happens if you lose your private key?

- [ ] **Class 1.3 Quiz:** Complete all questions in First Smart Contract guide
  - What does the constructor do?
  - Why do we use `require()` in setGreeting?
  - What's the difference between `view` and regular functions?
  - Why emit events?

- [ ] **Deliverables Verified:**
  - ✅ All tools installed and verified
  - ✅ HelloFamily.sol deployed to Sepolia
  - ✅ All 5 tests passing
  - ✅ Contract address recorded

- [ ] **Reading Completed:**
  - ✅ Bitcoin Book: Chapters 1-2
  - ✅ Ethereum Book: Chapters 1-2

**If you can answer all self-assessment questions confidently, you're ready for Week 2!**

---

#### Week 2: Running Your First Ethereum Node
**Duration:** 1 week
**Goal:** Run and interact with an Ethereum node

- **Class 2.1:** Installing and Configuring Geth
  - **SETUP:** Install Geth (Ethereum client)
  - Understanding node types (full, light, archive)
  - Configuring for Sepolia testnet
  - Starting your first sync

- **Class 2.2:** Node Operations and Monitoring
  - Monitoring sync progress
  - Understanding the blockchain data directory
  - Basic node maintenance
  - RPC endpoints and JSON-RPC

- **Class 2.3:** Getting Testnet ETH
  - Using Sepolia faucets
  - Understanding testnet vs mainnet
  - Checking balances via Etherscan

**Reading:**
- Bitcoin Book: Chapter 3 (Bitcoin Core - Running a Node, Getting Started)
- Ethereum Book: Chapter 3 (Clients - Running an Ethereum Client)

**Deliverable:** Running Geth node synced to Sepolia testnet

**Early Win:** Successfully receive testnet ETH and view it on Etherscan

---

#### Week 3: Command Line Blockchain Interactions
**Duration:** 1 week
**Goal:** Interact with blockchain via command line and deploy first contract

- **Class 3.1:** Creating Wallets via CLI
  - Generate wallet addresses
  - Understanding private keys and mnemonics
  - Wallet security basics
  - Storing keys safely

- **Class 3.2:** Sending Your First Transaction
  - Send testnet ETH between addresses
  - Understanding transaction parameters
  - Gas estimation
  - Checking transaction status

- **Class 3.3:** Querying Blockchain Data
  - Reading blockchain state
  - Checking balances
  - Transaction history
  - Block explorers

- **Class 3.4:** Hardhat Project Exploration
  - Hardhat project structure overview (already installed in Week 1)
  - Understanding artifacts and cache folders
  - Build your first contract with `npx hardhat build`
  - Introduction to Hardhat tasks and plugins

**Reading:**
- Bitcoin Book: Chapter 4 (Keys - Private and Public Keys)
- Bitcoin Book: Chapter 5 (Wallets - HD Wallets, Mnemonic Codes)
- Ethereum Book: Chapter 4 (Keys and Addresses - Public Key Cryptography)
- Ethereum Book: Chapter 5 (Wallets - Wallet Technology, Nondeterministic and Deterministic Wallets)

**Deliverable:** Command-line wallet operations + Hardhat project initialized

**Early Win:** Send a transaction from command line and see it confirmed

---

#### Week 4: Database Design & Architecture
**Duration:** 1 week
**Goal:** Design database schema for family finance system

- **Class 4.1:** PostgreSQL Setup and Schema Design
  - **SETUP:** Install PostgreSQL and pgAdmin
  - Design family members table
  - Design accounts and transactions tables
  - Create your first database and tables

- **Class 4.2:** Redis Configuration and Caching Patterns
  - **SETUP:** Install Redis and Redis CLI
  - Caching strategies for blockchain data
  - Pub/sub for real-time updates
  - Testing Redis connections with Node.js

- **Class 4.3:** Data Modeling for Financial Systems
  - Handling money (decimal precision)
  - Transaction history patterns
  - Audit logging
  - Relating on-chain and off-chain data

- **Class 4.4:** Database Security and Encryption
  - Encrypting sensitive data (IBANs, NIFs)
  - Database access control
  - Backup strategies
  - Connection pooling

**Reading:**
- Bitcoin Book: Chapter 6 (Transactions - Transaction Inputs and Outputs, Transaction Chains)
- Bitcoin Book: Chapter 11 (Blockchain - Block Structure)
- Ethereum Book: Chapter 6 (Transactions - Structure, Data Payload)
- Ethereum Book: Chapter 13 (EVM - Ethereum State, Account State)

**Deliverable:** Complete database schema with sample data

---

#### Week 5: Smart Contract Foundations - Part 1
**Duration:** 1 week
**Goal:** Write and test your first smart contracts

- **Class 5.1:** Solidity Basics and Development Tools
  - Solidity syntax and structure
  - Data types and variables
  - Functions and modifiers
  - Events and logging

- **Class 5.2:** Writing the Family Wallet Contract
  - Simple wallet contract
  - Receiving and sending ETH
  - Access control patterns
  - Owner permissions

- **Class 5.3:** Testing Smart Contracts
  - Writing tests with Hardhat
  - Test-driven development
  - Coverage tools
  - Testing edge cases

- **Class 5.4:** Deploying to Testnet
  - Deploy to Sepolia testnet using Hardhat
  - Environment configuration
  - Managing deployment scripts
  - Tracking deployed addresses

**Reading:**
- Bitcoin Book: Chapter 7 (Authorization and Authentication - Scripts)
- Ethereum Book: Chapter 7 (Smart Contracts and Solidity - Introduction, Data Types, Functions)

**Deliverable:** Basic Family Wallet contract deployed to testnet

**Early Win:** Deploy your first real smart contract and interact with it

---

#### Week 6: Smart Contract Foundations - Part 2 + Frontend Basics
**Duration:** 1 week
**Goal:** Advanced contract features and build first UI

- **Class 6.1:** Gas Optimization Techniques
  - Understanding gas costs
  - Storage vs memory
  - Optimization patterns
  - Gas profiling tools

- **Class 6.2:** Contract Verification & Security Basics
  - Verify contract on Etherscan
  - Basic security patterns
  - Common vulnerabilities overview
  - Using OpenZeppelin libraries

- **Class 6.3:** React Setup for Web3
  - **SETUP:** Install Create React App or Next.js
  - React fundamentals review
  - Project structure
  - Setting up Tailwind CSS or Material-UI

- **Class 6.4:** MetaMask Integration
  - Install and configure MetaMask
  - Connecting wallet to frontend
  - Reading wallet address
  - Detecting network changes

**Reading:**
- Bitcoin Book: Chapter 9 (Fees - Transaction Fee Estimation)
- Ethereum Book: Chapter 9 (Smart Contract Security - Security Best Practices, Common Vulnerabilities)

**Deliverable:** Smart contract + basic React app showing wallet connection

**Early Win:** See your wallet balance in a UI you built!

---

#### Week 7: Web3 Integration
**Duration:** 1 week
**Goal:** Connect Node.js backend and frontend to blockchain

- **Class 7.1:** Web3.js and Ethers.js Fundamentals
  - Understanding Web3 libraries
  - Connecting to blockchain nodes
  - Reading blockchain data
  - Choosing between Web3.js and Ethers.js

- **Class 7.2:** Frontend Contract Interaction
  - Call contract functions from React
  - Handle transaction confirmations
  - Display contract data in UI
  - Error handling and user feedback

- **Class 7.3:** Backend Blockchain Service
  - Building a Node.js service
  - Environment configuration
  - Managing private keys securely
  - Transaction management

- **Class 7.4:** Event Listening and Real-time Updates
  - Listening to smart contract events
  - Processing blockchain events
  - Storing event data in PostgreSQL
  - Real-time UI updates

**Reading:**
- Ethereum Book: Appendix (Web3.js Tutorial)

**Deliverable:** Full-stack app (React + Node.js + Smart Contract) with live blockchain data

**Early Win:** Click a button in your UI and see a blockchain transaction execute!

---

#### Week 8: BUFFER WEEK - Integration & Review
**Duration:** 1 week
**Goal:** Consolidate learning, catch up, and integrate everything

- **Activities:**
  - Review and refactor code from Weeks 1-7
  - Fix any incomplete deliverables
  - Ensure all tests are passing
  - Document your progress
  - Experiment with features you found interesting
  - Prepare for Phase 2

**Deliverable:** Fully integrated Phase 1 codebase with documentation

**Phase 1 Self-Assessment Review:**

Use this buffer week to review all self-assessment quizzes from Weeks 1-7:

- [ ] **Week 1:** Environment, blockchain theory, first smart contract
- [ ] **Week 2:** Ethereum node operations, testnet interactions
- [ ] **Week 3:** Wallets, transactions, blockchain queries
- [ ] **Week 4:** Database design, PostgreSQL, Redis
- [ ] **Week 5:** Smart contract foundations (Part 1)
- [ ] **Week 6:** Gas optimization, security basics, frontend
- [ ] **Week 7:** Web3 integration, event listening

**Comprehension Check:**
- Can you explain Phase 1 concepts to someone else?
- Have you completed all Phase 1 reading assignments?
- Are all Phase 1 deliverables working?

**If any concepts are unclear, this is the week to clarify them before Phase 2!**

---

### **PHASE 2: CORE PLATFORM** (Weeks 9-16)

#### Week 9: Allowance System - Smart Contract
**Duration:** 1 week
**Goal:** Implement automated allowance distribution contract

- **Class 9.1:** Allowance Smart Contract Design
  - Designing the allowance contract
  - Time-locked token distribution
  - Parent and child roles
  - Multiple family members management

- **Class 9.2:** Automated Distribution Logic
  - Time-based allowance releases
  - Scheduled transactions
  - Handling missed distributions
  - Withdrawal mechanisms

- **Class 9.3:** Contract Testing and Edge Cases
  - Writing comprehensive tests
  - Testing time-based logic
  - Edge case handling (zero amounts, invalid recipients)
  - Gas optimization for batch distributions

- **Class 9.4:** Deployment and Verification
  - Deploy to testnet
  - Verify on Etherscan
  - Test with real wallet interactions
  - Document contract interface

**Deliverable:** Working allowance smart contract on testnet

---

#### Week 10: Allowance Dashboard
**Duration:** 1 week
**Goal:** Build UI and API for allowance management

- **Class 10.1:** REST API for Allowance Management
  - Building Express API endpoints
  - Setting up allowance schedules
  - Querying allowance history
  - Input validation

- **Class 10.2:** Allowance Dashboard UI
  - Create allowance management interface
  - Display allowance schedules
  - Show distribution history
  - Parent controls and kid views

- **Class 10.3:** Connecting API to Smart Contracts
  - Backend contract interaction
  - Transaction signing from backend
  - Event monitoring for distributions
  - Database logging

- **Class 10.4:** Notifications and Alerts
  - Email/notification system for distributions
  - Real-time alerts in UI
  - Transaction confirmation UX
  - Error handling and retries

**Deliverable:** Complete allowance system (contract + API + UI)

**Early Win:** Set up an actual allowance and watch it distribute automatically!

---

#### Week 11: Go Fundamentals for Blockchain
**Duration:** 1 week
**Goal:** Learn Go and start building high-performance services

- **Class 11.1:** Go Language Basics
  - **SETUP:** Install Go and configure GOPATH
  - Go syntax basics and project structure
  - Goroutines and channels
  - Error handling in Go

- **Class 11.2:** Go for Blockchain Development
  - Working with blockchain libraries in Go
  - go-ethereum (geth) library
  - Connecting to Ethereum nodes
  - Reading blockchain data with Go

- **Class 11.3:** Building Your First Go Service
  - Project structure best practices
  - Configuration management
  - Logging in Go
  - Basic HTTP server in Go

- **Class 11.4:** Testing in Go
  - Unit testing with Go's testing package
  - Table-driven tests
  - Mocking external dependencies
  - Benchmarking

**Deliverable:** Basic Go service that can read blockchain data

---

#### Week 12: Go Event Listener Service
**Duration:** 1 week
**Goal:** Build high-performance blockchain event monitoring

- **Class 12.1:** Event Listener Architecture
  - Understanding blockchain events
  - Filter and subscription patterns
  - Handling blockchain reorganizations
  - Cursor-based event processing

- **Class 12.2:** Building the Event Listener
  - Listening to contract events at scale
  - Processing events efficiently
  - Updating PostgreSQL from events
  - Error recovery and retry logic

- **Class 12.3:** Price Oracle Service in Go
  - Fetching crypto prices from DEXs (Uniswap, SushiSwap, Curve)
  - Understanding liquidity pools and reserves
  - Aggregating price data from multiple sources
  - Caching in Redis

- **Class 12.4:** Service Deployment and Monitoring
  - Running Go services as daemons
  - Health check endpoints
  - Performance monitoring
  - Logging and debugging

**Deliverable:** Go-based event listener and price oracle service

---

#### Week 13: API Gateway Development
**Duration:** 1 week
**Goal:** Build complete API gateway for the platform

- **Class 13.1:** RESTful API Design with Express
  - Setting up Express server
  - Designing API endpoints
  - Request validation and error handling
  - API documentation with Swagger

- **Class 13.2:** Authentication and Authorization
  - JWT-based authentication
  - User registration and login
  - Role-based access control (parent vs child)
  - Session management with Redis

- **Class 13.3:** API Gateway Patterns
  - Rate limiting and throttling
  - API key management
  - CORS and security headers
  - Request/response logging

- **Class 13.4:** GraphQL Basics (Optional)
  - Introduction to GraphQL
  - Setting up Apollo Server
  - Simple schema for family data
  - Basic resolvers

**Deliverable:** Complete API gateway with authentication

---

#### Week 14: BUFFER WEEK - Service Integration
**Duration:** 1 week
**Goal:** Integrate all services and ensure they work together

- **Activities:**
  - Connect Go services to main API
  - Ensure event listener updates are reflected in API
  - Test price oracle integration
  - Refactor and optimize
  - Write integration tests
  - Document API endpoints

**Deliverable:** Fully integrated microservices architecture

**Phase 2 (Part 1) Self-Assessment Review:**

Use this buffer week to review all self-assessment quizzes from Weeks 9-13:

- [ ] **Week 9:** Allowance smart contract
- [ ] **Week 10:** Allowance dashboard and UI
- [ ] **Week 11:** Go fundamentals for blockchain
- [ ] **Week 12:** Go event listener and price oracle
- [ ] **Week 13:** API gateway development

**Comprehension Check:**
- Can you explain how the microservices architecture works?
- Do you understand Go's role in the system?
- Can you trace a transaction from frontend to blockchain?

**If any concepts are unclear, this is the week to clarify them before PSD2 integration!**

---

#### Week 15: Portuguese Banking Integration - Setup
**Duration:** 1 week
**Goal:** Connect to Portuguese banking APIs via PSD2

- **Class 15.1:** Understanding PSD2 and Open Banking
  - What is PSD2 and why it exists
  - AISP vs PISP roles
  - The consent model
  - **SETUP:** Register for Portuguese bank sandbox access (CGD, BCP, or Santander)

- **Class 15.2:** OAuth2 and Banking Authentication
  - OAuth2 flow explained
  - Handling certificates and eIDAS
  - Building the authentication flow
  - Testing with sandbox

- **Class 15.3:** PSD2 Service Architecture
  - Service design for banking integration
  - Storing and refreshing tokens
  - Consent management
  - Error handling for bank APIs

- **Class 15.4:** Security and Compliance Basics
  - Encrypting banking credentials
  - GDPR compliance considerations
  - Audit logging for financial data
  - Secure token storage

**Deliverable:** Working PSD2 authentication with sandbox bank

---

#### Week 16: PSD2 Implementation
**Duration:** 1 week
**Goal:** Implement account reading and payment initiation

- **Class 16.1:** Account Information Service (Reading Bank Data)
  - Fetching account balances
  - Reading transaction history
  - Parsing bank transaction data
  - Storing in PostgreSQL

- **Class 16.2:** Displaying Bank + Crypto Balances
  - Unified dashboard showing both
  - Currency conversion
  - Balance aggregation
  - Real-time sync

- **Class 16.3:** Payment Initiation Service
  - Triggering SEPA payments from smart contract approvals
  - Payment confirmation flow
  - Handling payment status
  - Reconciliation

- **Class 16.4:** GDPR Compliance Implementation
  - Data minimization
  - User consent management
  - Right to be forgotten
  - Data export functionality

**Deliverable:** Working PSD2 integration with sandbox bank + unified balance view

**Early Win:** See your real bank balance alongside your crypto wallet!

---

### **PHASE 3: ADVANCED FEATURES** (Weeks 17-24)

#### Week 17: Python Fundamentals for Analytics
**Duration:** 1 week
**Goal:** Learn Python and set up analytics environment

- **Class 17.1:** Python Setup and Basics
  - **SETUP:** Install Python and pip
  - Set up virtual environments (venv)
  - Python syntax fundamentals
  - Working with data structures

- **Class 17.2:** Python for Financial Calculations
  - Install essential libraries (pandas, numpy, web3.py)
  - Reading data from PostgreSQL
  - Basic data analysis
  - Financial calculations

- **Class 17.3:** Web3.py Integration
  - Connecting to blockchain with Python
  - Reading contract data
  - Transaction analysis
  - Event parsing

- **Class 17.4:** Building Python Services
  - Flask/FastAPI basics
  - Service architecture
  - API endpoints in Python
  - Integration with main backend

**Deliverable:** Python service connected to database and blockchain

---

#### Week 18: Banking Analytics Features
**Duration:** 1 week
**Goal:** Build data analysis features using Python

- **Class 18.1:** Round-up Savings from Bank Transactions
  - Fetching bank transactions via PSD2
  - Calculating round-ups
  - Auto-converting to crypto
  - Scheduling automated transfers

- **Class 18.2:** Spending Pattern Analysis
  - Analyzing family spending from bank data
  - Categorizing transactions
  - Generating insights with pandas
  - Data visualization basics

- **Class 18.3:** Savings Optimizer
  - Predicting cash flow
  - Recommending optimal savings amounts
  - Automated savings triggers
  - ML basics for pattern recognition

- **Class 18.4:** Reporting and Dashboards
  - Generating financial reports
  - Monthly summaries
  - Trend analysis
  - Exporting to PDF/CSV

**Deliverable:** Python analytics service with automated savings features

---

#### Week 19: Multi-Signature Wallet Implementation
**Duration:** 1 week
**Goal:** Implement family multi-sig wallet

- **Class 19.1:** Understanding Multi-Signature Patterns
  - m-of-n signature requirements
  - Multi-sig use cases
  - Gnosis Safe overview (optional integration)
  - Security considerations

- **Class 19.2:** Building the Multi-Sig Contract
  - Implementing m-of-n signatures
  - Transaction proposal system
  - Signature collection
  - Execution logic

- **Class 19.3:** Multi-Sig Testing and Security
  - Comprehensive test coverage
  - Security audit checklist
  - Edge cases (conflicting proposals, expired proposals)
  - Gas optimization

- **Class 19.4:** Multi-Sig UI
  - Proposal creation interface
  - Signature collection UI
  - Transaction history
  - Approval workflow

**Reading:**
- Bitcoin Book: Chapter 8 (Signatures - Multi-signature Scripts)
- Ethereum Book: Chapter 7 (Smart Contracts - Advanced Solidity Concepts)

**Deliverable:** Working multi-sig wallet with UI

---

#### Week 20: Family Governance & DAO
**Duration:** 1 week
**Goal:** Implement DAO voting for family decisions

- **Class 20.1:** DAO Voting Mechanism
  - Proposal creation system
  - Voting logic in smart contracts
  - Time-locked execution
  - Quorum requirements

- **Class 20.2:** Family Savings Pot Contract
  - Shared family fund contract
  - Contribution tracking
  - Withdrawal approval system
  - Interest/rewards distribution

- **Class 20.3:** Governance Dashboard
  - UI for creating proposals
  - Voting interface
  - Proposal history and status
  - Notifications for votes needed

- **Class 20.4:** Integrating PSD2 Payment Initiation
  - DAO approval triggers bank payments
  - Connecting governance to SEPA payments
  - Audit trail
  - Multi-step approval flow

**Reading:**
- Ethereum Book: Chapter 12 (DApps - Decentralized Applications Architecture)

**Deliverable:** DAO governance system with PSD2 payment execution

---

#### Week 21: BUFFER WEEK - Advanced Features Integration
**Duration:** 1 week
**Goal:** Integrate Python, multi-sig, and governance features

- **Activities:**
  - Connect all Phase 3 components
  - Test end-to-end workflows
  - Optimize performance
  - Fix bugs and edge cases
  - Refactor and document
  - Integration testing

**Deliverable:** Fully integrated advanced features

**Phase 3 (Part 1) Self-Assessment Review:**

Use this buffer week to review all self-assessment quizzes from Weeks 17-20:

- [ ] **Week 17:** Python fundamentals for analytics
- [ ] **Week 18:** Banking analytics features
- [ ] **Week 19:** Multi-signature wallet implementation
- [ ] **Week 20:** Family governance DAO

**Comprehension Check:**
- Can you explain how Python analytics work with blockchain data?
- Do you understand multi-sig patterns and security benefits?
- Can you explain DAO governance and voting mechanisms?
- Can you trace the flow from DAO vote to bank payment?

**If any concepts are unclear, this is the week to clarify them before token economy!**

---

#### Week 22: Token Economy & Rewards
**Duration:** 1 week
**Goal:** Create family token with rewards system

- **Class 22.1:** ERC-20 Token Creation (FamilyToken)
  - Understanding token standards
  - Implementing ERC-20
  - Minting and burning mechanics
  - Supply management

- **Class 22.2:** Staking and Reward Mechanisms
  - Time-locked staking contracts
  - Reward calculation logic
  - Compound interest implementation
  - Staking UI

- **Class 22.3:** Educational Gamification
  - Token rewards for family achievements
  - Point system
  - Redemption mechanisms
  - Teaching kids about tokens

- **Class 22.4:** Token Dashboard
  - Token balance display
  - Staking interface
  - Reward history
  - Token transfer UI

**Reading:**
- Ethereum Book: Chapter 10 (Tokens - ERC20 Token Standard, Token Standards)
- Ethereum Book: Appendix (EIP/ERC Standards)

**Deliverable:** FamilyToken with staking and rewards

---

#### Week 23: Multi-Chain Deployment
**Duration:** 1 week
**Goal:** Deploy to Ethereum and Polygon

- **Class 23.1:** Understanding Layer 2 Solutions
  - What are Layer 2s and why they exist
  - Polygon architecture overview
  - Comparing Ethereum vs Polygon (fees, speed)
  - Bridge mechanisms overview

- **Class 23.2:** Deploying to Polygon
  - Polygon network configuration
  - Deploying contracts to Polygon Mumbai testnet
  - Verify contract on Polygonscan
  - Gas optimization for L2

- **Class 23.3:** Multi-Chain Wallet Management
  - Managing wallets across chains
  - Switching networks in MetaMask
  - Tracking balances on multiple chains
  - Database schema for multi-chain

- **Class 23.4:** Multi-Chain Frontend
  - Network detection and switching
  - Displaying balances from multiple chains
  - Transaction submission per chain
  - User experience considerations

**Reading:**
- Bitcoin Book: Chapter 10 (Network - Network Discovery, Full Nodes vs SPV Nodes)
- Bitcoin Book: Chapter 11 (Blockchain - Merkle Trees, Blockchain Forks)
- Ethereum Book: Chapter 14 (Consensus - Proof of Work, Proof of Stake)

**Deliverable:** Contracts deployed on Ethereum and Polygon with multi-chain UI

---

#### Week 24: Stablecoin & Cross-Border Transfers
**Duration:** 1 week
**Goal:** Enable international family transfers with stablecoins

- **Class 24.1:** Stablecoin Integration (USDC, USDT)
  - Understanding stablecoin mechanisms
  - Integrating with existing stablecoin contracts
  - Token approvals and allowances
  - Swap mechanisms

- **Class 24.2:** Exchange Rate Oracle Development
  - Real-time exchange rate fetching
  - Multi-currency support (EUR, USD, GBP)
  - Rate caching and updates
  - Displaying rates in UI

- **Class 24.3:** International Transfer System
  - Complete cross-border transfer flow
  - EUR → Crypto → Crypto → Local currency
  - Fee calculation
  - Transfer tracking

- **Class 24.4:** Transfer Dashboard
  - International transfer interface
  - Exchange rate display
  - Transfer history
  - Recipient management

**Reading:**
- Ethereum Book: Chapter 11 (Oracles - Oracle Use Cases, Oracle Patterns)

**Deliverable:** Working cross-border transfer system with stablecoins

---

### **PHASE 4: PRODUCTION** (Weeks 25-30)

#### Week 25: Lending & Credit System
**Duration:** 1 week
**Goal:** Build smart contract loan system

- **Class 25.1:** Loan Smart Contract Architecture
  - Understanding DeFi lending (Aave, Compound models)
  - Collateralized vs uncollateralized loans
  - Interest rate models
  - Building the family loan contract

- **Class 25.2:** Automated Repayment Logic
  - Time-based repayment schedules
  - Automatic deductions from allowances
  - Handling late payments and penalties
  - Grace periods

- **Class 25.3:** Credit Score Calculation
  - On-chain credit history
  - Reputation systems
  - Dynamic interest rates based on history
  - Credit score algorithm

- **Class 25.4:** Loan Dashboard
  - Loan request interface
  - Approval workflow
  - Repayment tracking
  - Credit history display

**Deliverable:** DeFi-inspired family loan system with automatic repayment

---

#### Week 26: Security & Auditing
**Duration:** 1 week
**Goal:** Secure all components and audit

- **Class 26.1:** Smart Contract Security Patterns
  - Reentrancy guards and prevention
  - Access control and role-based permissions
  - Integer overflow/underflow protection
  - Using OpenZeppelin security libraries

- **Class 26.2:** DeFi-Specific Security
  - Front-running and sandwich attack prevention
  - MEV (Maximal Extractable Value) protection strategies
  - Slippage protection in token swaps
  - Oracle manipulation prevention
  - Transaction simulation before execution

- **Class 26.3:** Web Application Security
  - API security best practices
  - Rate limiting and DDoS protection
  - SQL injection prevention
  - XSS and CSRF protection
  - Secure authentication patterns

- **Class 26.4:** Security Audit Tools & Practices
  - Smart contract audit tools (Slither, Mythril)
  - Running security scans
  - Manual code review checklist
  - Introduction to mutation testing (validates test quality - deep dive in Week 27)
  - Penetration testing basics

**Reading:**
- Bitcoin Book: Chapter 13 (Security - Best Practices, Security Principles)
- Bitcoin Book: Chapter 12 (Mining - Consensus Attacks, Security and Consensus)
- Ethereum Book: Chapter 9 (Smart Contract Security - Security Best Practices, Vulnerabilities)
- Ethereum Book: Appendix (Development Tools - Testing, Security Analysis Tools)

**Deliverable:** Security audit report + fixes + MEV protection

---

#### Week 27: Testing Strategies
**Duration:** 1 week
**Goal:** Comprehensive test coverage across all components

- **Class 27.1:** Unit Testing Across Languages + Mutation Testing (Extended: 4-5 hours)
  - JavaScript/TypeScript testing (Jest, Mocha)
  - Go testing patterns
  - Python testing (pytest)
  - Smart contract testing (Hardhat)
  - **Mutation Testing for Solidity:**
    - Understanding test quality vs code coverage
    - What is mutation testing? (testing your tests)
    - Manual mutation exercise with weak vs strong tests
    - Installing mutation testing tools (Gambit recommended)
    - Running mutation tests on FamilyAllowance contract
    - Interpreting mutation reports and scores
    - Common mutation operators (arithmetic, relational, logical, require deletions)
    - Identifying and fixing surviving mutants
    - Full project mutation analysis with automated reporting
    - Target mutation score: 80%+ for critical contracts
    - Integration into development workflow

- **Class 27.2:** Integration Testing
  - Testing microservices together
  - Database integration tests
  - API integration tests
  - Cross-service workflows

- **Class 27.3:** E2E Testing with Bank Sandboxes
  - Testing complete user flows
  - PSD2 sandbox integration tests
  - Frontend E2E tests (Cypress/Playwright)
  - Blockchain transaction testing

- **Class 27.4:** Load Testing and Performance
  - Stress testing APIs
  - Database query optimization
  - Identifying bottlenecks
  - Performance monitoring setup

**Deliverable:** Test suite with >80% code coverage + mutation test reports with >80% mutation score for critical contracts (FamilyWallet, FamilySavingsPot, FamilyLoan)

**Learning Guides:**
- 📖 [Class 27.1: Unit Testing + Mutation Testing](docs/week27-class27.1-mutation-testing.md)

**Week 27 Completion Checklist:**

Before moving to Week 28, complete the self-assessment:

- [ ] **Class 27.1 Quiz:** Complete all questions in Mutation Testing guide
  - What's the difference between code coverage and mutation score?
  - What does a "surviving mutant" indicate?
  - Name three common mutation operators for Solidity
  - Why might a test have 100% coverage but catch zero bugs?
  - What's a reasonable mutation score target for critical financial contracts?

- [ ] **Deliverables Verified:**
  - ✅ Mutation testing tool installed (Gambit)
  - ✅ Mutation reports generated for all contracts
  - ✅ Average mutation score >80% for critical contracts
  - ✅ Improved test suites documented

- [ ] **Test Suite Quality:**
  - ✅ FamilyWallet mutation score >80%
  - ✅ FamilySavingsPot mutation score >80%
  - ✅ FamilyLoan mutation score >80%

**If you can answer all self-assessment questions confidently, you're ready for Week 28!**

---

#### Week 28: BUFFER WEEK - Production Preparation
**Duration:** 1 week
**Goal:** Final polishing and preparation for deployment

- **Activities:**
  - Fix all failing tests
  - Complete documentation
  - Security hardening
  - Performance optimization
  - Code cleanup and refactoring
  - Prepare deployment scripts

**Deliverable:** Production-ready codebase

**Phase 4 Pre-Production Self-Assessment Review:**

Use this buffer week to review all self-assessment quizzes from Weeks 25-27:

- [ ] **Week 25:** Lending and credit system
- [ ] **Week 26:** Security and auditing
- [ ] **Week 27:** Testing strategies (including mutation testing)

**Final Comprehension Check:**
- Can you explain all major components of the FamilyChain system?
- Do you understand security patterns and potential vulnerabilities?
- Can you articulate testing strategies and quality metrics?
- Are you confident explaining this project in technical interviews?

**Production Readiness:**
- [ ] All tests passing (>80% coverage, >80% mutation score)
- [ ] Security audit completed with fixes applied
- [ ] Documentation complete
- [ ] Performance optimization done
- [ ] Ready for deployment

**If any concepts are unclear, this is the LAST week to clarify them before production!**

---

#### Week 29: DevOps & Deployment
**Duration:** 1 week
**Goal:** Containerize and deploy the platform

- **Class 29.1:** Docker Containerization
  - **SETUP:** Install Docker Desktop
  - Dockerfile basics
  - Containerizing Node.js, Go, and Python services
  - Docker Compose for multi-service setup

- **Class 29.2:** CI/CD Pipeline with GitHub Actions
  - Setting up GitHub Actions
  - Automated testing on push
  - Automated deployment
  - Environment management

- **Class 29.3:** Deployment to Cloud
  - Cloud provider options (AWS, GCP, Azure)
  - Setting up production environment
  - Database deployment
  - SSL/TLS configuration

- **Class 29.4:** Monitoring with Grafana and Logging
  - **SETUP:** Install Grafana (via Docker)
  - Setting up monitoring dashboards
  - Application logging (Winston, logrus)
  - Alert configuration

**Deliverable:** Deployed containerized application with CI/CD

---

#### Week 30: Portuguese Market Deployment & Portfolio
**Duration:** 1 week
**Goal:** Production compliance and portfolio preparation

- **Class 30.1:** Banco de Portugal Compliance
  - Regulatory requirements overview
  - Large transaction reporting (>€10,000)
  - Monthly reporting procedures
  - Compliance documentation

- **Class 30.2:** AT (Tax Authority) Integration
  - Crypto gains reporting for IRS
  - Tax calculation helpers
  - User tax documentation export
  - Compliance with Portuguese tax law

- **Class 30.3:** Production Banking APIs
  - Moving from sandbox to production PSD2 APIs
  - Production credentials and certificates
  - Final testing with real banks
  - Rollback procedures

- **Class 30.4:** Portfolio Preparation & Documentation
  - Technical documentation and API specs
  - README and setup guides
  - Architecture diagrams
  - Creating portfolio case study
  - Video demo creation
  - GitHub repository polish

**Deliverable:** Production-ready compliance + portfolio-worthy project

---

## 🔧 Optional Advanced Modules (Post-Course or Parallel Study)

### Optional Module A: Liquidity Pools & AMM Mechanics
**When to do:** After Week 22 (Token Economy)

- Understanding Automated Market Makers (Uniswap model)
- Creating a simple liquidity pool for FamilyToken
- Constant product formula (x * y = k)
- Providing liquidity and earning fees
- Building a simple exchange interface

### Optional Module B: Cross-Chain Bridge Implementation
**When to do:** After Week 23 (Multi-Chain Deployment)

- Understanding bridge architecture in depth
- Lock-and-mint bridge pattern
- Building a simple token bridge
- Cross-chain message passing
- Security considerations for bridges

### Optional Module C: Advanced GraphQL & WebSockets
**When to do:** After Week 13 (API Gateway)

- Advanced GraphQL schemas
- Subscriptions for real-time updates
- WebSocket server implementation (Socket.io)
- Real-time balance updates
- Push notifications for transactions

### Optional Module D: Full Frontend Polish
**When to do:** Throughout or after Week 30

- Advanced React patterns
- State management (Redux/Zustand)
- Mobile responsive design optimization
- Progressive Web App features
- Accessibility improvements

---

## 📅 Recommended Timeline

### Standard Track (Recommended)
- **Duration:** 30 weeks (~7.5 months)
- **Commitment:** 15-20 hours/week
- **Best for:** Working professionals with programming experience
- **Includes:** All core modules + 4 buffer weeks

### Intensive Track
- **Duration:** 30 weeks (~7.5 months)
- **Commitment:** 30-40 hours/week
- **Best for:** Full-time learners or career transitioners
- **Includes:** Core modules + optional advanced modules in parallel

### Extended Track
- **Duration:** 40 weeks (~10 months)
- **Commitment:** 10-15 hours/week
- **Best for:** Part-time learners balancing other commitments
- **Includes:** All core modules with extra time for each

---

## 🎯 Milestones & Checkpoints

### Milestone 1 (Week 8): Blockchain Foundation Complete
✅ Running Ethereum node (Geth)
✅ Database schema created (PostgreSQL + Redis)
✅ Smart contracts deployed to testnet
✅ Basic React app connected to blockchain
✅ Full-stack integration working

### Milestone 2 (Week 16): Core Platform + Banking Integration
✅ Allowance system operational (contract + UI)
✅ Go event listener and price oracle running
✅ API gateway serving requests
✅ PSD2 banking integration complete with sandbox
✅ Unified bank + crypto dashboard

### Milestone 3 (Week 24): Advanced DeFi Features
✅ Python analytics service operational
✅ Multi-sig wallet and DAO governance working
✅ Token economy with staking implemented
✅ Multi-chain deployment (Ethereum + Polygon)
✅ Cross-border transfers with stablecoins functional

### Milestone 4 (Week 30): Production Ready
✅ Lending system complete
✅ Security audit passed and fixes applied
✅ Comprehensive test coverage (>80% code coverage + >80% mutation score)
✅ Deployed to production with CI/CD
✅ Portuguese compliance documentation complete
✅ Portfolio-ready project

---

## 📖 Resources Needed

### Installation Philosophy: Just-In-Time Setup
**Don't install everything upfront!** Each week tells you exactly what to install when you need it. This approach:
- Reduces initial overwhelm
- Helps you understand WHY you need each tool
- Saves disk space
- Makes troubleshooting easier

### Software Installation Timeline

**Week 1:**
- Git
- VS Code (with Solidity, Hardhat Solidity, Prettier, ESLint extensions)
- Node.js v22.14.0+
- npm 11.6.2+
- Hardhat 3.0.8+ (via `npx hardhat --init`)

**Week 2:**
- Geth (Ethereum client)

**Week 3:**
- (Hardhat already installed in Week 1)

**Week 4:**
- PostgreSQL, Redis

**Week 6:**
- Create React App or Next.js

**Week 11:**
- Go

**Week 15:**
- PSD2 sandbox credentials (start registration early - can take time!)

**Week 17:**
- Python

**Week 27:**
- Gambit (mutation testing for Solidity) - requires Rust/Cargo

**Week 29:**
- Docker

### Tool Versions & Documentation (Updated Week 1)

**⚠️ IMPORTANT: Version Matters!**
This course uses specific versions with breaking changes from older tutorials. Always check documentation for YOUR version!

**Current Project Versions:**
| Tool | Version | Documentation | Notes |
|------|---------|--------------|-------|
| Node.js | v22.14.0+ | https://nodejs.org/docs/latest-v22.x/api/ | LTS version |
| npm | 11.6.2+ | https://docs.npmjs.com/ | Included with Node.js |
| Hardhat | 3.0.8+ | https://hardhat.org/docs/getting-started | ⚠️ v3 has breaking changes from v2! |
| ethers.js | 6.15.0 | https://docs.ethers.org/v6/ | ⚠️ v6 API different from v5 |
| Solidity | ^0.8.28 | https://docs.soliditylang.org/en/v0.8.28/ | Latest stable |
| TypeScript | ~5.8.0 | https://www.typescriptlang.org/docs/ | Required for Hardhat 3 tests |
| Mocha | 11.7.4 | https://mochajs.org/ | Test framework |
| Chai | 5.3.3 | https://www.chaijs.com/ | Assertion library |

**Critical Hardhat 3 Breaking Changes:**
- ⚠️ **Build command:** `npx hardhat build` (NOT `compile`)
- ⚠️ **Config secrets:** Use `npx hardhat keystore` (NOT `.env` files)
- ⚠️ **Test files:** Must be TypeScript `.ts` (NOT `.js`)
- ⚠️ **Config variables:** Use `configVariable()` (NOT `dotenv`)

**Why These Versions Matter:**
- Most online tutorials use Hardhat 2.x - commands won't work!
- ethers.js v5 and v6 have different APIs - code examples may break
- Hardhat 3 requires TypeScript for tests - JavaScript won't run

### Free Documentation Resources
- Node.js (official docs - v22.x): https://nodejs.org/docs/latest-v22.x/api/
- Hardhat 3 (official docs): https://hardhat.org/docs/getting-started
- ethers.js v6 (official docs): https://docs.ethers.org/v6/
- Solidity (official docs): https://docs.soliditylang.org/en/v0.8.28/
- TypeScript (official handbook): https://www.typescriptlang.org/docs/
- PostgreSQL, Redis documentation
- Ethereum.org tutorials
- React documentation
- Portuguese bank sandbox access (free registration)
- Bitcoin Book (included in `/assets/bitcoinbook-develop/`)
- Ethereum Book (included in `/assets/ethereumbook-develop/`)

### Paid/Optional Resources
- Ethereum testnet ETH (from faucets - FREE)
- Cloud hosting for deployment (~$10-50/month for basic tier)
- Domain name (~$10/year)
- Infura/Alchemy API (free tier available, paid for production)

---

## 💡 Tips for Success

1. **Follow the Schedule** - The 30-week timeline is realistic; don't rush it
2. **Use Buffer Weeks** - They're essential for consolidation and catching up
3. **Build in Public** - Share progress on GitHub, Twitter, LinkedIn
4. **Test with Real Family** - Actually use allowances and savings features
5. **Document Everything** - Your future self and employers will thank you
6. **Join Communities** - Ethereum dev Discord, r/ethdev, Portuguese fintech groups
7. **Don't Skip Testing** - Write tests as you go, not at the end
8. **Focus on Use Cases** - When stuck, remember: "Would this help my family?"
9. **Leverage Claude Code** - Use Claude Code (your "hybrid cohort") for help, debugging, and code reviews
10. **Take Breaks** - This is a marathon, not a sprint

---

## 🚀 What Makes This Project Portfolio-Worthy

This project demonstrates:
- **Full-stack mastery** across 4 programming languages (JavaScript/TypeScript, Solidity, Go, Python)
- **Real-world problem solving** (family finance is relatable)
- **Cutting-edge tech** (blockchain + Open Banking is rare combo)
- **DeFi expertise** (tokens, staking, multi-chain deployment, MEV protection)
- **Multi-chain deployment** (Ethereum + Layer 2 solutions)
- **Production-ready code** (comprehensive testing with mutation testing, CI/CD, monitoring)
- **EU market knowledge** (PSD2, GDPR compliance)
- **Junior blockchain developer skills** ready for the job market

Employers will see you can:
- Learn complex systems independently
- Build complete solutions end-to-end
- Navigate regulatory requirements
- Deploy production-grade applications
- Work across multiple technology stacks

---

## 📝 Next Steps

1. **Star this repo** and set it as public
2. **Create a learning log** - Track weekly progress (use `docs/weekN-learning-notes.md`)
3. **Start Week 1** - Environment setup and blockchain theory
4. **Join communities** - Find study buddies in blockchain developer communities
5. **Share your journey** - Blog/tweet about what you're building

---

## 🤝 Contributing to the Course

As you progress, you can improve this course by:
- Adding code examples you found helpful
- Creating video walkthroughs
- Writing blog posts about challenges you solved
- Helping others in discussions
- Submitting issues/PRs with improvements

---

## 📄 License

This course plan is open-source and available for anyone to use for learning purposes.

---

**Ready to start? Head to Week 1 and let's build something amazing!**

*Course Version: 2.0 (30-week structure)*
*Last Updated: January 2025*
