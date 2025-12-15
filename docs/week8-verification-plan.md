# Week 8: Verification & Consolidation Plan

**Purpose:** Verify all FamilyChain components work correctly on new computer after migration.

**Duration:** Buffer week (flexible based on issues found)

**Status:** Complete (2025-12-15)

---

## Table of Contents

1. [Critical: Hardhat Keystore Migration](#1-critical-hardhat-keystore-migration)
2. [Environment Verification](#2-environment-verification)
3. [Week 1-3 Components](#3-week-1-3-components)
4. [Week 4: Database Infrastructure](#4-week-4-database-infrastructure)
5. [Week 5: Smart Contracts](#5-week-5-smart-contracts)
6. [Week 6: Frontend & Security](#6-week-6-frontend--security)
7. [Week 7: Event Listeners](#7-week-7-event-listeners)
8. [Verification Checklist Summary](#8-verification-checklist-summary)
9. [Troubleshooting Guide](#9-troubleshooting-guide)

---

## 1. Critical: Hardhat Keystore Migration

### Problem Statement

Hardhat 3 uses an encrypted keystore to store sensitive configuration variables. These secrets are encrypted and stored locally on the **old computer**. Without migrating these, Sepolia deployment and verification will not work.

### Secrets to Migrate

Based on `hardhat.config.ts`, the following secrets need to be transferred:

| Secret Name | Purpose | Required For |
|-------------|---------|--------------|
| `SEPOLIA_RPC_URL` | Alchemy/Infura RPC endpoint | Sepolia network access |
| `SEPOLIA_PRIVATE_KEY` | Wallet private key for deployments | Contract deployment & transactions |
| `ALCHEMY_API_KEY` | Alchemy API authentication | RPC provider access |
| `ETHERSCAN_API_KEY` | Contract verification | `npx hardhat verify` |
| `MAINNET_RPC_URL` | Mainnet RPC (read-only) | Mainnet data queries |
| `DB_PASSWORD` | PostgreSQL password | Database connections |

### Migration Steps

**On OLD Computer:**

```powershell
# Navigate to blockchain directory
cd C:\Users\[OLD_USER]\source\repos\family-chain\blockchain

# Export each secret (one at a time)
npx hardhat keystore get --dev SEPOLIA_RPC_URL
npx hardhat keystore get --dev SEPOLIA_PRIVATE_KEY
npx hardhat keystore get --dev ALCHEMY_API_KEY
npx hardhat keystore get --dev ETHERSCAN_API_KEY
npx hardhat keystore get --dev MAINNET_RPC_URL
npx hardhat keystore get --dev DB_PASSWORD
```

**IMPORTANT:** Save these values securely (password manager, encrypted note). Never commit them to git.

**On NEW Computer:**

```powershell
# Navigate to blockchain directory
cd C:\Users\omeue\source\repos\family-chain\blockchain

# Import each secret
npx hardhat keystore set --dev SEPOLIA_RPC_URL
# Enter value when prompted

npx hardhat keystore set --dev SEPOLIA_PRIVATE_KEY
npx hardhat keystore set --dev ALCHEMY_API_KEY
npx hardhat keystore set --dev ETHERSCAN_API_KEY
npx hardhat keystore set --dev MAINNET_RPC_URL
npx hardhat keystore set --dev DB_PASSWORD
```

### Verification

```powershell
# List all stored secrets
npx hardhat keystore list --dev

# Expected output should show all 6 secrets
```

### Important Notes About Hardhat 3 Commands

**CLI Commands (verified correct):**
```powershell
npx hardhat keystore set --dev <KEY>      # Set a new value
npx hardhat keystore get --dev <KEY>      # Retrieve a value
npx hardhat keystore list --dev           # List all stored keys
npx hardhat keystore set --dev --force <KEY>  # Update existing value
```

**Accessing secrets in scripts (Hardhat 3 pattern):**
```typescript
// CORRECT - Use network.connect() + getSigners()
import { network } from "hardhat";

const connection = await network.connect();
const [signer] = await connection.ethers.getSigners();  // Loads from keystore
const provider = connection.ethers.provider;
```

**WARNING:** Some class guides mention `hre.vars.get("KEY")` - this does NOT work in Hardhat 3! Use the `getSigners()` pattern above instead.

**Reference:** [Hardhat Configuration Variables Documentation](https://hardhat.org/docs/learn-more/configuration-variables)

### Alternative: Recreate Keys

If old computer is inaccessible, you'll need to:

1. **SEPOLIA_RPC_URL**: Create new Alchemy/Infura project at https://dashboard.alchemy.com
2. **SEPOLIA_PRIVATE_KEY**: Export from MetaMask (same wallet used for deployments)
3. **ALCHEMY_API_KEY**: Same as step 1
4. **ETHERSCAN_API_KEY**: Create at https://etherscan.io/myapikey
5. **MAINNET_RPC_URL**: Same Alchemy project can provide this
6. **DB_PASSWORD**: Set new password during PostgreSQL setup

---

## 2. Environment Verification

### Required Software

| Software | Required Version | Check Command |
|----------|-----------------|---------------|
| Node.js | v22.14.0+ | `node --version` |
| npm | 11.6.2+ | `npm --version` |
| Git | Latest | `git --version` |
| PostgreSQL | 18.x | `psql --version` |
| Docker | Latest | `docker --version` |
| VS Code | Latest | `code --version` |

### VS Code Extensions

Verify these extensions are installed:
- [ ] Solidity (Juan Blanco)
- [ ] ESLint
- [ ] Prettier
- [ ] GitLens
- [ ] Thunder Client (or similar REST client)
- [ ] PostgreSQL (optional, for DB management)

### Node.js Dependencies

```powershell
# From project root
cd C:\Users\omeue\source\repos\family-chain\blockchain

# Clean install dependencies
rm -r node_modules -ErrorAction SilentlyContinue
npm install

# Verify Hardhat works
npx hardhat --version
# Expected: 3.0.8 or higher
```

---

## 3. Week 1-3 Components

### Week 1: Environment & First Contract

**Files to Verify:**
- `blockchain/contracts/HelloFamily.sol`
- `blockchain/test/HelloFamily.test.ts`
- `blockchain/ignition/modules/HelloFamily.ts`

**Verification Steps:**

```powershell
# Build contracts
npx hardhat build

# Expected: Compilation successful, artifacts in artifacts/

# Run HelloFamily tests
npx hardhat test test/HelloFamily.test.ts

# Expected: All tests pass
```

### Week 2: Node Infrastructure

**Original Setup:** Geth + Lighthouse in WSL (resource-intensive, switched to Alchemy)

**Current Setup:** Alchemy RPC for Sepolia access

**Verification:** Will be tested as part of Keystore Migration (Section 1)

### Week 3: CLI Scripts

**Location:** `blockchain/scripts/`

**Scripts to Verify (12 total):**

| Script | Purpose | Test Command |
|--------|---------|--------------|
| `check-balance.ts` | Check wallet ETH balance | Requires keystore |
| `deploy-familywallet.ts` | Deploy FamilyWallet contract | Requires keystore |
| `deposit-funds.ts` | Deposit to FamilyWallet | Requires keystore |
| `query-events.ts` | Query contract events | Requires keystore |
| `test-alchemy.ts` | Test Alchemy connection | Requires keystore |
| `ws-listener.ts` | WebSocket event listener | Requires keystore |
| Others | Various utilities | Check individually |

**Note:** Most scripts require Hardhat keystore to be configured first.

---

## 4. Week 4: Database Infrastructure

### PostgreSQL Setup

**Database:** `familychain`
**Port:** 5432

**Verification Steps:**

```powershell
# Check PostgreSQL service status
Get-Service -Name "postgresql*"

# If not installed, install PostgreSQL 18
# Download from: https://www.postgresql.org/download/windows/

# Connect to database
psql -U postgres -d familychain

# If connection fails, may need to:
# 1. Start PostgreSQL service
# 2. Create database: CREATE DATABASE familychain;
# 3. Run schema setup scripts
```

**Database Schema Verification:**

```sql
-- Connect to familychain database
\c familychain

-- Check tables exist (9 expected)
\dt

-- Expected tables:
-- accounts, transactions, ledger_entries, categories,
-- budgets, family_members, audit_log, encrypted_data, settings

-- Check roles exist (3 expected)
SELECT rolname FROM pg_roles WHERE rolname LIKE 'app_%';

-- Expected: app_readonly, app_readwrite, app_admin

-- Check users exist (3 expected)
SELECT usename FROM pg_user WHERE usename LIKE 'app_%';
```

**If Schema Missing:**

The schema files should be in `blockchain/sql/` or similar. If missing, we'll need to recreate from Week 4 learning notes.

### Redis Setup

**Container Name:** `redis-familychain`
**Port:** 6379

**Verification Steps:**

```powershell
# Check if Docker is running
docker ps

# Check if Redis container exists
docker ps -a | Select-String "redis"

# If container exists but stopped:
docker start redis-familychain

# If container doesn't exist, create it:
docker run -d --name redis-familychain -p 6379:6379 redis:latest

# Test Redis connection
docker exec -it redis-familychain redis-cli ping
# Expected: PONG
```

### Database Tests (62 tests)

**Test Categories:**
- Unit tests: Encryption, data validation
- Integration tests: Transactions, GDPR, RBAC

```powershell
# Run all database tests
npm run test:unit
npm run test:integration

# Or run specific test suites
npm run test:encryption
npm run test:transactions
npm run test:gdpr
npm run test:rbac
```

**Expected Results:**
- All 62 tests should pass
- If tests fail due to DB connection, check DB_PASSWORD in keystore

---

## 5. Week 5: Smart Contracts

### FamilyWallet Contract

**Location:** `blockchain/contracts/FamilyWallet.sol`

**Deployed Address (Sepolia):** `0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e`

**Features:**
- Owner management
- Deposits (receive ETH)
- Withdrawals (owner only)
- Balance tracking
- Event emission (Deposited, Withdrawn)

### Contract Tests (19 tests)

```powershell
# Build contracts first
npx hardhat build

# Run FamilyWallet tests
npx hardhat test test/FamilyWallet.test.ts

# Expected: 19 tests pass
```

### Sepolia Deployment Verification

**Requires:** Hardhat keystore configured (Section 1)

```powershell
# Verify contract on Etherscan (if not already verified)
npx hardhat verify --network sepolia 0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e

# Check contract balance
npx hardhat run scripts/check-balance.ts --network sepolia
```

**Manual Verification:**
- Visit: https://sepolia.etherscan.io/address/0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e
- Confirm contract is visible and verified

---

## 6. Week 6: Frontend & Security

### Next.js Frontend

**Location:** `family-wallet-ui/`

**Tech Stack:**
- Next.js 16 with Turbopack
- Zustand for state management
- ethers.js v6 for Web3
- TailwindCSS for styling

**Verification Steps:**

```powershell
# Navigate to frontend directory
cd C:\Users\omeue\source\repos\family-chain\family-wallet-ui

# Install dependencies
npm install

# Start development server
npm run dev

# Expected: Server starts on http://localhost:3000
```

**Manual Testing:**
1. Open http://localhost:3000 in browser
2. Verify MetaMask connection button works
3. Connect MetaMask (switch to Sepolia network)
4. Verify wallet address displays
5. Check contract balance displays
6. Test deposit/withdrawal forms (if implemented)

### MetaMask Integration

**Requirements:**
- MetaMask browser extension installed
- Sepolia network configured
- Test ETH in wallet (from faucet if needed)

**Sepolia Faucets:**
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### Slither Security Audit

**Note:** Slither requires Python and solc-select

```powershell
# Check if Slither is installed
slither --version

# If not installed:
pip install slither-analyzer
pip install solc-select

# Install Solidity compiler
solc-select install 0.8.28
solc-select use 0.8.28

# Run Slither analysis
cd C:\Users\omeue\source\repos\family-chain\blockchain
slither contracts/FamilyWallet.sol

# Review findings (should match Week 6 audit results)
```

---

## 7. Week 7: Event Listeners

### WebSocket Event Listener

**Location:** `blockchain/scripts/ws-listener.ts` (or similar)

**Features:**
- Real-time event detection (1-2 second latency)
- Deposit and Withdrawal event handling
- Database storage of events

**Verification Steps:**

```powershell
# Requires: Keystore configured, Database running

# Start the WebSocket listener
npx ts-node scripts/ws-listener.ts

# In another terminal, trigger a transaction on Sepolia
# (deposit or withdrawal to FamilyWallet)

# Expected: Event detected within 1-2 seconds
```

### BlockchainService

Check for `BlockchainService` class that handles:
- Provider connections
- Event subscriptions
- Database integration

---

## 8. Verification Checklist Summary

### Phase 1: Critical Setup (Do First)

- [ ] **1.1** Migrate Hardhat keystore secrets from old computer
- [ ] **1.2** Verify Node.js v22.14.0+ installed
- [ ] **1.3** Verify npm 11.6.2+ installed
- [ ] **1.4** Run `npm install` in blockchain directory
- [ ] **1.5** Verify `npx hardhat --version` shows 3.0.8+

### Phase 2: Database Infrastructure

- [ ] **2.1** PostgreSQL 18 installed and running
- [ ] **2.2** `familychain` database exists
- [ ] **2.3** All 9 tables present
- [ ] **2.4** All 3 roles configured (app_readonly, app_readwrite, app_admin)
- [ ] **2.5** Docker installed and running
- [ ] **2.6** Redis container running (`redis-familychain`)
- [ ] **2.7** Redis ping test successful

### Phase 3: Smart Contract Tests

- [ ] **3.1** `npx hardhat build` completes successfully
- [ ] **3.2** HelloFamily tests pass
- [ ] **3.3** FamilyWallet tests pass (19 tests)
- [ ] **3.4** All 62 database tests pass

### Phase 4: Sepolia Network

- [ ] **4.1** Keystore `SEPOLIA_RPC_URL` configured
- [ ] **4.2** Keystore `SEPOLIA_PRIVATE_KEY` configured
- [ ] **4.3** Can connect to Sepolia via Alchemy
- [ ] **4.4** FamilyWallet contract accessible at deployed address
- [ ] **4.5** Contract verified on Etherscan

### Phase 5: Frontend

- [ ] **5.1** `npm install` in family-wallet-ui directory
- [ ] **5.2** `npm run dev` starts without errors
- [ ] **5.3** MetaMask connects successfully
- [ ] **5.4** Wallet address displays correctly
- [ ] **5.5** Contract balance displays correctly

### Phase 6: Event Listeners (Optional - Advanced)

- [ ] **6.1** WebSocket listener starts without errors
- [ ] **6.2** Events detected within 1-2 seconds
- [ ] **6.3** Events stored in database

---

## 9. Troubleshooting Guide

### Issue: "Cannot find module" errors

**Solution:**
```powershell
rm -r node_modules -ErrorAction SilentlyContinue
rm package-lock.json -ErrorAction SilentlyContinue
npm install
```

### Issue: Hardhat keystore empty

**Solution:** Follow Section 1 migration steps

### Issue: PostgreSQL connection refused

**Solutions:**
1. Start PostgreSQL service: `Start-Service postgresql*`
2. Check port 5432 is not blocked
3. Verify pg_hba.conf allows local connections

### Issue: Redis container not found

**Solution:**
```powershell
docker run -d --name redis-familychain -p 6379:6379 redis:latest
```

### Issue: MetaMask not connecting

**Solutions:**
1. Ensure MetaMask is installed
2. Switch to Sepolia network in MetaMask
3. Clear browser cache and retry
4. Check console for specific errors

### Issue: Contract tests fail

**Solutions:**
1. Run `npx hardhat clean`
2. Run `npx hardhat build`
3. Check Solidity version matches (0.8.28)
4. Verify OpenZeppelin dependencies installed

### Issue: Slither not found

**Solution:**
```powershell
pip install slither-analyzer solc-select
solc-select install 0.8.28
solc-select use 0.8.28
```

---

## Execution Order Recommendation

1. **Day 1:** Keystore migration + Environment setup
2. **Day 2:** Database infrastructure (PostgreSQL + Redis)
3. **Day 3:** Smart contract tests (local)
4. **Day 4:** Sepolia network verification
5. **Day 5:** Frontend verification + Event listeners

This order ensures dependencies are resolved before attempting dependent components.

---

## Notes for Session

- User has access to old computer for keystore migration
- FamilyWallet deployed at: `0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e`
- 62 database tests + 19 contract tests to verify
- Frontend uses Next.js 16 with Turbopack

---

*Document created: Week 8 Buffer Week - Verification & Consolidation*
*FamilyChain Learning Project*
