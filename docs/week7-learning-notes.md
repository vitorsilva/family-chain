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

*Last Updated: November 21, 2025*
*Next Session: Class 7.2 - Frontend Contract Interaction Review*
