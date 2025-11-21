# Week 7 Learning Notes
## Web3 Integration - Backend Blockchain Services

**Week Duration:** November 21, 2025 - In Progress
**Focus:** Backend blockchain connections, event listening, and real-time updates

---

## Session 1: Class 7.1 - Web3.js and Ethers.js Fundamentals
**Date:** November 21, 2025
**Duration:** ~1.5 hours
**Status:** ✅ Complete

### 🎯 What We Accomplished

**Activities Completed:**
1. ✅ Backend provider setup with Hardhat 3 `network.connect()` pattern
2. ✅ Compared frontend (BrowserProvider) vs backend (JsonRpcProvider)
3. ✅ Loaded wallet from Hardhat keystore and signed messages programmatically
4. ✅ Queried FamilyWallet contract from backend (no MetaMask!)

**Files Created:**
- `blockchain/scripts/week7/backend-provider.ts` - Provider connection test
- `blockchain/scripts/week7/compare-providers.ts` - Frontend vs backend comparison
- `blockchain/scripts/week7/load-backend-wallet.ts` - Keystore wallet loading with message signing
- `blockchain/scripts/week7/query-contract.ts` - Contract queries from backend

### 💡 Key Insights & Questions

**User Questions:**
1. **Network specification:** "Since we didn't specify the network it loaded the hardhat network, right?"
   - **Answer:** Yes! Learned to use `$env:HARDHAT_NETWORK="sepolia"` or `network.connect("sepolia")`
   - **Better approach:** Specify network in code: `await network.connect("sepolia")`

2. **Contract instantiation:** "We are not creating a new contract, it's more like if we were getting a pointer to the existing contract on the blockchain, right?"
   - **Excellent insight!** Perfect understanding - `new ethers.Contract()` creates a reference/interface, not deploying
   - **Analogy:** Like getting a TV remote for an existing TV (contract already deployed)

**Key Concepts Learned:**
- **Frontend vs Backend providers:** BrowserProvider (MetaMask) vs JsonRpcProvider (RPC endpoint)
- **Hardhat 3 pattern:** `const connection = await network.connect("sepolia"); const provider = connection.ethers.provider;`
- **Signer sources:** MetaMask (frontend, user-controlled) vs Hardhat keystore (backend, automated)
- **Reading vs Writing:** View functions free (no signer needed) vs transactions cost gas (signer required)
- **Message signing:** Backend can sign programmatically without MetaMask popup
- **Security:** Hardhat --dev keystore fine for testnet, production needs hardware wallet/cloud KMS

### 📊 Technical Results

**Backend Provider Test (Sepolia):**
- Network: Sepolia (Chain ID: 11155111)
- Latest block: 9,675,687
- Transactions in block: 1,025
- Wallet address: `0xB09b5449D8BB84312Fbc4293baf122E0e1875736`
- Balance: 0.798009901174002366 ETH

**Message Signing Test:**
- Message: "Hello from backend wallet!"
- Signature: `0xfdb9379d486aa735bf...`
- Verification: ✅ Recovered address matched signer

**FamilyWallet Query Results:**
- Contract: `0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e`
- Owner: `0xB09b5449D8BB84312Fbc4293baf122E0e1875736` ✅
- Member status: YES ✅
- Balance in contract: 0.0019 ETH
- Contract total balance: 0.0019 ETH

### 🔧 Technical Details

**Hardhat 3 Breaking Changes:**
```typescript
// ❌ Old (Hardhat 2)
import { ethers } from "hardhat";
const provider = ethers.provider;

// ✅ New (Hardhat 3)
import { network } from "hardhat";
const connection = await network.connect("sepolia");
const provider = connection.ethers.provider;
```

**Network Specification Methods:**
1. Environment variable: `$env:HARDHAT_NETWORK="sepolia"; npx tsx script.ts`
2. In code: `await network.connect("sepolia")`
3. Hardhat run (doesn't work with tsx): `npx hardhat run script.ts --network sepolia`

**Provider Types:**
- `JsonRpcProvider` - Backend (Alchemy/Infura/local node)
- `BrowserProvider` - Frontend (MetaMask/browser wallets)
- `WebSocketProvider` - Real-time events (coming in Class 7.4)

### ⚠️ Issues Encountered

**Issue 1: Default to local Hardhat network**
- **Problem:** Script connected to local Hardhat network (Chain ID 31337) instead of Sepolia
- **Cause:** No network specified
- **Solution:** Use `$env:HARDHAT_NETWORK="sepolia"` or `network.connect("sepolia")`
- **Best practice:** Specify network explicitly in code for production scripts

### ✅ Self-Assessment Results

**Q1:** When would you use BrowserProvider vs JsonRpcProvider?
- ✅ Correct: BrowserProvider on client side (user transactions), JsonRpcProvider on server side (automated services)

**Q2:** Why don't view functions need a signer?
- ✅ Mostly correct: "Because the blockchain is public"
- **Full answer:** View functions don't modify state, so no transaction needed - they just read data (free and instant)

**Q3:** Security concern with backend signers?
- ✅ Perfect: Use hardware wallets, cloud KMS (AWS/Google), or encrypted keystores. Never .env files or hardcoded keys!

### 📚 Reading Connections

**Bitcoin Book:**
- Chapter 3: Bitcoin Core - RPC connections (how providers communicate)

**Ethereum Book:**
- Chapter 3: Clients - Running an Ethereum Client
- Appendix: Web3.js Tutorial (compared to ethers.js)

**Key concepts reinforced:**
- JSON-RPC protocol (how providers work under the hood)
- Provider patterns (read vs write operations)

### 🎯 Next Steps

**Class 7.2: Frontend Contract Interaction Review**
- Review Week 6 useFamilyWallet hook architecture
- Compare frontend (BrowserProvider) vs backend (JsonRpcProvider) code side-by-side
- Understand complete transaction lifecycle (11 steps)
- Prepare for Class 7.3 backend transaction signing

**Preparation needed:**
- Ensure FamilyWallet contract still deployed: `0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e` ✅
- Review `family-wallet-ui/hooks/useFamilyWallet.ts` from Week 6
- Have MetaMask connected to Sepolia

### 🔑 Key Takeaways

1. **Frontend vs Backend is about automation:** Frontend = user clicks, Backend = automated 24/7
2. **Same ethers.js library, different providers:** BrowserProvider vs JsonRpcProvider
3. **Hardhat 3 requires explicit network connection:** `await network.connect()`
4. **View functions are free and instant:** No signer, no gas, just provider
5. **Backend can sign without popups:** Perfect for automated services (oracles, liquidation bots)
6. **Security matters in production:** Development keystores fine for testnet, production needs proper key management

---

**Total Scripts Created This Class:** 4
**Total Lines of Code:** ~250 lines
**Tests Passed:** All 4 activities completed successfully
**Early Win:** Backend provider querying live Sepolia blockchain and FamilyWallet contract - foundation for Week 7's event listener service! 🎉

---

## Session 2: Class 7.2 - Frontend Contract Interaction Review
**Date:** November 21, 2025
**Duration:** ~1 hour
**Status:** ✅ Complete

### 🎯 What We Accomplished

**Activities Completed:**
1. ✅ Reviewed useFamilyWallet hook architecture from Week 6
2. ✅ Tested complete transaction lifecycle (rejection, success, UI update)
3. ✅ Compared frontend vs backend patterns (conceptual review)
4. ✅ Reviewed common frontend Web3 issues and solutions

**Files Created:**
- None (review class - used existing Week 6 code)

### 💡 Key Insights & Questions

**User Questions:**
1. **getContract needsSigner parameter:** "I don't know why getContract need a signer... wouldn't it depend on the actions we eventually did?"
   - **Perfect understanding!** User correctly reasoned that view functions (balance query) don't need signer, but transactions (deposit) do need signer
   - **Key insight:** `needsSigner` parameter is optimization to avoid unnecessary MetaMask popups for read operations
   - **Pattern:** `getContract(false)` for reads (free), `getContract(true)` for writes (costs gas)

2. **Why refetch after deposit?** "Because deposit affects the balance"
   - ✅ Correct! Blockchain doesn't push updates to frontend
   - **Flow:** Transaction confirmed → refetch data → update state → React re-renders → UI updates
   - **Without refetch:** User would have to manually refresh page to see new balance

3. **Skipping redundant activity:** Recognized `compare-frontend-backend.ts` would be redundant with Class 7.1's `compare-providers.ts` and `query-contract.ts`
   - **Good judgment!** Already understood the concepts from previous activities

**Key Concepts Reviewed:**
- **Provider vs Signer (frontend):** BrowserProvider connects to MetaMask, signer requires user approval
- **getContract pattern:** Conditional signer based on operation type (optimization)
- **Transaction lifecycle:** 11 steps from button click to UI update (~20-40 seconds total)
- **useCallback importance:** Prevents infinite loops when function is useEffect dependency
- **Error handling:** User rejection (code 4001) vs contract revert (on-chain failure)
- **Always refetch after transactions:** Blockchain doesn't push updates to frontend

### 📊 Technical Results

**Transaction Testing (Frontend DApp):**
- ✅ User rejection tested: Friendly error message "Transaction rejected by user"
- ✅ Successful deposit tested: 0.0001 ETH deposited
- ✅ Transaction timing: "Some seconds to be confirmed" (~15-30 seconds typical)
- ✅ UI auto-update: Balance refreshed automatically after confirmation
- ✅ Loading states: Button disabled during transaction ("Depositing...")

**useFamilyWallet Hook Analysis:**
- `fetchContractBalance()` calls `getContract(false)` - No signer needed ✅
- `deposit()` calls `getContract(true)` - Signer required ✅
- `deposit()` calls `fetchContractBalance()` after `tx.wait()` - Refetch to update UI ✅

### 🔧 Technical Details

**Transaction Lifecycle (11 Steps):**
```
1. User clicks "Deposit" button
2. React calls deposit() function
3. Get signer from MetaMask
4. Create contract instance with signer
5. Call contract function
6. MetaMask popup appears
7A. User REJECTS → Error code 4001
7B. User CONFIRMS → Transaction sent
8. Transaction pending in mempool
9. Transaction mined (included in block)
10. Refetch contract data
11. UI updates automatically
```

**Timing Breakdown:**
- Steps 1-6: Instant (< 1 second)
- Step 7: User decision (variable)
- Steps 8-9: Network confirmation (~15-30 seconds on Sepolia)
- Steps 10-11: Instant (< 1 second)

**useFamilyWallet Pattern:**
1. **State** - Track data (`contractBalance`, `isMember`, `isLoading`)
2. **Helpers** - Internal functions (`getContract()`)
3. **Read functions** - Fetch data (no transactions)
4. **Write functions** - Send transactions (user pays gas)
5. **Auto-fetch** - Load data when wallet connects (useEffect)
6. **Return** - Expose state and functions to components

**Frontend vs Backend Comparison:**
| Aspect | Frontend (Week 6) | Backend (Week 7) |
|--------|-------------------|------------------|
| Provider | `new ethers.BrowserProvider(window.ethereum)` | `connection.ethers.provider` |
| Signer | `await provider.getSigner()` (MetaMask) | `await connection.ethers.getSigners()` (keystore) |
| User approval | MetaMask popup for every tx | No popups (automated) |
| Environment | Browser (React, Next.js) | Node.js (TypeScript scripts) |
| Private key | In MetaMask (user controls) | In keystore (app controls) |

### ⚠️ Issues Encountered

**No issues encountered!** Everything worked as expected:
- User rejection handled gracefully
- Successful transactions completed properly
- UI updated automatically after confirmation

### ✅ Self-Assessment Results

**Q1:** Why does getContract() have needsSigner parameter?
- ✅ Perfect: "Wouldn't it depend on the actions we eventually did? If we only wanted to know balance we wouldn't need to sign, but deposit we would certainly need to sign."

**Q2:** When does fetchContractBalance() pass needsSigner: true or false?
- ✅ Correct: `false` (no signer needed for view function)

**Q3:** When does deposit() pass needsSigner: true or false?
- ✅ Correct: `true` (signer required for transaction)

**Q4:** Why does deposit() call fetchContractBalance() after tx.wait()?
- ✅ Correct: "Because deposit affects the balance"

### 📚 Reading Connections

**Bitcoin Book:**
- Chapter 5: Wallets - Wallet Technology (key management)
- Chapter 6: Transactions - Transaction Lifecycle

**Ethereum Book:**
- Chapter 5: Wallets - Wallet Technology
- Chapter 6: Transactions - Transaction Structure, Nonce, Gas
- Chapter 12: DApps - Frontend Integration

**Key concepts reinforced:**
- Wallet connection patterns (MetaMask integration)
- Transaction signing (ECDSA signatures)
- Transaction lifecycle (from click to confirmation)
- UI update patterns (refetch after transaction)

### 🎯 Next Steps

**Class 7.3: Backend Blockchain Service**
- Build backend service that sends transactions WITHOUT MetaMask
- Load wallet from Hardhat keystore
- Create automated backend signer
- Handle nonce management for multiple pending transactions
- Set up foundation for Week 7's event listener service

**Preparation needed:**
- Review Class 7.1 and 7.2 concepts (provider vs signer, transaction lifecycle)
- Ensure Hardhat keystore has SEPOLIA_PRIVATE_KEY set ✅
- Verify FamilyWallet contract has ETH deposited: 0.0019 ETH ✅
- Understand error handling patterns

### 🔑 Key Takeaways

1. **Provider = Read-only, Signer = Can write** (frontend and backend)
2. **getContract(needsSigner) is optimization** - Avoid MetaMask popup for reads
3. **Transaction lifecycle takes ~20-40 seconds** (mostly waiting for block confirmation)
4. **Always refetch after transactions** - Blockchain doesn't push updates
5. **useCallback prevents infinite loops** when function is useEffect dependency
6. **Error handling matters:** User rejection (4001) ≠ Contract revert (on-chain)
7. **Frontend vs Backend:** Same blockchain, different providers (MetaMask vs RPC)

---

**Total Activities Completed:** 2 of 4 (Activities 1-2 completed, Activity 3 skipped as redundant, Activity 4 reviewed conceptually)
**Frontend Tests:** User rejection ✅, Successful transaction ✅, Auto UI update ✅
**Understanding Verified:** useFamilyWallet hook patterns, transaction lifecycle, provider vs signer
**Early Win:** Observed production-grade DApp behavior - exactly how Uniswap/Aave work! 🎉

---

*Last Updated: November 21, 2025*
*Next Session: Class 7.3 - Backend Blockchain Service*
