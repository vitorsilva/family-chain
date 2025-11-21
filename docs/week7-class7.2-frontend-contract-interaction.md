# Week 7, Class 7.2: Frontend Contract Interaction Review
## FamilyChain Course - Learning Guide

---

## 🎯 Overview

**Duration:** 2-3 hours
**Prerequisites:**
- Week 6 complete (Next.js DApp with contract interactions)
- Week 7, Class 7.1 complete (backend provider fundamentals)
- FamilyWallet contract deployed and verified

**What You'll Learn:**
You built a frontend DApp in Week 6 with MetaMask integration and contract interactions. Now you'll review those patterns in depth, understand the transaction lifecycle, and compare frontend vs backend approaches. This class consolidates your Week 6 knowledge and prepares you for Week 7's backend service development.

**Why This Matters:**
Before building backend services (Class 7.3), you need to deeply understand how frontend interactions work. Many developers copy-paste code without understanding WHY. This review ensures you understand provider vs signer, transaction states, error handling, and React patterns - knowledge that transfers to backend development.

---

## 📚 Learning Objectives

By the end of this class, you will be able to:

1. **Explain** the provider vs signer pattern in frontend context (BrowserProvider)
2. **Understand** the complete transaction lifecycle from button click to UI update
3. **Analyze** the useFamilyWallet custom hook architecture
4. **Compare** frontend (MetaMask) vs backend (keystore) transaction signing
5. **Handle** transaction states (pending, success, error, rejected)
6. **Debug** common frontend Web3 issues (wrong network, MetaMask locked, insufficient funds)
7. **Prepare** for backend service development in Class 7.3

---

## 📖 Key Concepts

### 1. Week 6 Architecture Review

**What we built in Week 6:**

```
User Browser
│
├── Next.js Frontend (family-wallet-ui/)
│   ├── Components
│   │   ├── ConnectWalletButton.tsx (wallet connection)
│   │   ├── WalletInfo.tsx (balance display)
│   │   └── FamilyWalletActions.tsx (deposit/withdraw UI)
│   ├── Hooks
│   │   └── useFamilyWallet.ts (contract logic) ⭐ KEY
│   ├── Store
│   │   └── useWalletStore.ts (Zustand state)
│   └── Lib
│       └── contracts/FamilyWallet.ts (ABI + address)
│
├── MetaMask Extension
│   └── Private Key (user-controlled) 🔐
│
└── Ethereum Sepolia Testnet
    └── FamilyWallet Contract
```

**Key components:**
- **useWalletStore** - Manages connection state (address, balance, chainId)
- **useFamilyWallet** - Handles contract interactions (deposit, withdraw, queries)
- **MetaMask** - User's wallet (browser extension)
- **BrowserProvider** - ethers.js provider that connects to MetaMask

---

### 2. Provider vs Signer (Frontend Edition)

**In the frontend (Week 6):**

```typescript
// PROVIDER: Read-only blockchain access
const provider = new ethers.BrowserProvider(window.ethereum);

// SIGNER: Can sign transactions (requires user approval)
const signer = await provider.getSigner(); // MetaMask popup!
```

**Two contract patterns:**

```typescript
// READ-ONLY: View functions (free, no gas)
const contractReadOnly = new ethers.Contract(
  FAMILY_WALLET_ADDRESS,
  FAMILY_WALLET_ABI,
  provider // Just provider
);
const balance = await contractReadOnly.getBalance(address); // No MetaMask popup

// READ-WRITE: Transactions (costs gas, user approves)
const contractWithSigner = new ethers.Contract(
  FAMILY_WALLET_ADDRESS,
  FAMILY_WALLET_ABI,
  signer // Signer from MetaMask
);
const tx = await contractWithSigner.deposit({ value: ethers.parseEther("0.1") }); // MetaMask popup!
await tx.wait(); // Wait for confirmation
```

**Key difference:**
- Provider = "Look but don't touch" (read blockchain)
- Signer = "I can modify the blockchain" (send transactions)

---

### 3. Transaction Lifecycle in Frontend

**From button click to UI update:**

```
1. User clicks "Deposit" button
   ↓
2. React calls deposit() function (useFamilyWallet hook)
   ↓
3. Get signer from MetaMask
   const signer = await provider.getSigner();
   ↓
4. Create contract instance with signer
   const contract = new ethers.Contract(address, abi, signer);
   ↓
5. Call contract function
   const tx = await contract.deposit({ value: amount });
   ↓
6. MetaMask popup appears
   → User sees: Gas estimate, total cost, Confirm/Reject buttons
   ↓
7A. User REJECTS → Throw error (code 4001)
   OR
7B. User CONFIRMS → Transaction sent to network
   ↓
8. Transaction pending in mempool
   tx.hash exists, but receipt is null
   ↓
9. Transaction mined (included in block)
   const receipt = await tx.wait();
   ↓
10. Refetch contract data
    await fetchContractBalance();
   ↓
11. UI updates automatically (React re-renders)
    User sees new balance!
```

**Timing:**
- Step 1-6: Instant (< 1 second)
- Step 7: User decision (could take minutes if they hesitate!)
- Step 8-9: Network confirmation (~15-30 seconds on Sepolia)
- Step 10-11: Instant (< 1 second)

**Total: ~20-40 seconds** for a successful deposit (mostly waiting for block confirmation)

---

### 4. useFamilyWallet Hook Architecture

**The hook's job:**

```typescript
export function useFamilyWallet() {
  // STATE (what the UI needs)
  const [contractBalance, setContractBalance] = useState<string>('0');
  const [isMember, setIsMember] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // HELPERS (internal functions)
  const getContract = async (needsSigner: boolean) => {
    // Returns contract instance (with or without signer)
  };

  // READ FUNCTIONS (view functions, free)
  const fetchContractBalance = async () => {
    const contract = await getContract(false); // No signer needed
    const balance = await contract.getBalance(address);
    setContractBalance(ethers.formatEther(balance));
  };

  // WRITE FUNCTIONS (transactions, cost gas)
  const deposit = async (amount: string) => {
    const contract = await getContract(true); // Signer needed!
    const tx = await contract.deposit({ value: ethers.parseEther(amount) });
    await tx.wait(); // Wait for confirmation
    await fetchContractBalance(); // Refresh data
  };

  // AUTO-FETCH on connect
  useEffect(() => {
    if (isConnected && address) {
      fetchContractBalance();
      fetchMemberStatus();
    }
  }, [isConnected, address]);

  // RETURN (what components can use)
  return {
    contractBalance,
    isMember,
    isLoading,
    deposit,
    withdraw,
    refetch,
  };
}
```

**Pattern:**
1. **State** - Track data components need
2. **Helpers** - Internal functions (getContract)
3. **Read functions** - Fetch data (no transactions)
4. **Write functions** - Send transactions (user pays gas)
5. **Auto-fetch** - Load data when wallet connects (useEffect)
6. **Return** - Expose state and functions to components

---

### 5. Frontend vs Backend Comparison

| Aspect | Frontend (Week 6) | Backend (Week 7) |
|--------|-------------------|------------------|
| **Provider** | `new ethers.BrowserProvider(window.ethereum)` | `connection.ethers.provider` |
| **Signer** | `await provider.getSigner()` (MetaMask) | `await connection.ethers.getSigners()` (keystore) |
| **User approval** | MetaMask popup for every tx | No popups (automated) |
| **Environment** | Browser (React, Next.js) | Node.js (TypeScript scripts) |
| **State management** | React hooks (useState, useEffect) | Variables, database |
| **Error handling** | User rejection (code 4001) | Network errors, gas errors |
| **Transaction source** | User-triggered (button click) | Code-triggered (cron job, event) |
| **Private key** | In MetaMask (user controls) | In keystore (app controls) |
| **UI updates** | Automatic (React re-render) | Manual (database update) |

**Code comparison:**

```typescript
// FRONTEND (Week 6)
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner(); // User approves
const contract = new ethers.Contract(address, abi, signer);
const tx = await contract.deposit({ value: ethers.parseEther("0.1") });
// → MetaMask popup appears!

// BACKEND (Week 7)
const connection = await network.connect();
const [signer] = await connection.ethers.getSigners(); // From keystore
const contract = new ethers.Contract(address, abi, signer);
const tx = await contract.deposit({ value: ethers.parseEther("0.1") });
// → No popup, runs automatically!
```

**Both do the same thing** (deposit 0.1 ETH), but frontend needs user approval!

---

### 6. Transaction Error States

**Common errors in frontend:**

| Error | Cause | User sees | How to handle |
|-------|-------|-----------|---------------|
| **ACTION_REJECTED** (code 4001) | User clicked "Reject" in MetaMask | "Transaction rejected by user" | Allow retry, don't auto-retry |
| **Insufficient funds** | Not enough ETH for gas + amount | "Insufficient funds" | Show required amount |
| **InsufficientBalance** (revert) | Contract balance < withdrawal | "Insufficient balance in contract" | Show available balance |
| **Wrong network** | User on Mainnet, app expects Sepolia | "Please switch to Sepolia" | Prompt network switch |
| **MetaMask locked** | User hasn't unlocked MetaMask | "Please unlock MetaMask" | Prompt unlock |
| **Gas too low** | User set gas limit too low | "Transaction failed (out of gas)" | Suggest higher gas |

**Error handling pattern:**

```typescript
try {
  const tx = await contract.deposit({ value: amount });
  await tx.wait();
  alert('Success!');
} catch (error: unknown) {
  if (error && typeof error === 'object' && 'code' in error) {
    const errorCode = (error as { code: string | number }).code;

    if (errorCode === 'ACTION_REJECTED' || errorCode === 4001) {
      alert('Transaction rejected by user');
    } else if (error && typeof error === 'object' && 'message' in error) {
      const msg = (error as { message: string }).message;

      if (msg.includes('InsufficientBalance')) {
        alert('Insufficient balance in contract');
      } else {
        alert('Transaction failed: ' + msg);
      }
    }
  }
}
```

---

## 🛠️ Hands-On Activities

### Activity 1: Review useFamilyWallet Hook

**Goal:** Understand the architecture of your Week 6 custom hook.

**Step 1:** Read the hook file

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\family-wallet-ui
code hooks\useFamilyWallet.ts
```

**Step 2:** Answer these questions (test your understanding)

1. **Q: Why does `getContract()` have a `needsSigner` parameter?**
   <details>
   <summary>Answer</summary>

   Because view functions (read-only) don't need a signer, but transactions (write) do.

   - `needsSigner: false` → Provider only → Free queries
   - `needsSigner: true` → Signer required → Costs gas, MetaMask popup

   This optimization avoids unnecessary MetaMask popups for read operations!
   </details>

2. **Q: Why wrap `fetchContractBalance` with `useCallback`?**
   <details>
   <summary>Answer</summary>

   To prevent infinite loops in `useEffect`!

   Without `useCallback`, the function recreates on every render, causing:
   ```
   Render → fetchContractBalance changes → useEffect runs →
   setState → Render → fetchContractBalance changes → ∞
   ```

   With `useCallback`, function only recreates when dependencies (`[address, isConnected]`) change.
   </details>

3. **Q: Why does `deposit()` call `fetchContractBalance()` after `tx.wait()`?**
   <details>
   <summary>Answer</summary>

   To update the UI with the new balance!

   Flow:
   1. User deposits 0.1 ETH
   2. `tx.wait()` waits for confirmation
   3. `fetchContractBalance()` queries new balance
   4. `setContractBalance()` triggers React re-render
   5. UI shows updated balance

   Without this, user would have to refresh the page to see new balance!
   </details>

4. **Q: Why check `error.code === 4001`?**
   <details>
   <summary>Answer</summary>

   That's MetaMask's error code for "user rejected transaction."

   - Code 4001 = User clicked "Reject" button
   - Code ACTION_REJECTED = Same thing (ethers.js error name)

   We handle this separately because it's not an error - it's user choice! Don't want to show scary error messages for normal user behavior.
   </details>

**Step 3:** Find these patterns in the code

- [ ] Where is `BrowserProvider` created?
- [ ] Where is `getSigner()` called?
- [ ] How many times is `new ethers.Contract()` called?
- [ ] What triggers `useEffect` to run?
- [ ] Where is error handling done?

---

### Activity 2: Test Transaction States

**Goal:** Observe all transaction states in action.

**Step 1:** Start your frontend

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\family-wallet-ui
npm run dev
```

Navigate to `http://localhost:3000`

**Step 2:** Test User Rejection

1. Connect MetaMask
2. Click "Deposit"
3. Enter 0.001 ETH
4. Click "Deposit ETH"
5. **In MetaMask popup: Click "Reject"**
6. Observe error message: "Transaction rejected by user"

**Step 3:** Test Successful Transaction

1. Click "Deposit" again
2. Enter 0.001 ETH
3. Click "Deposit ETH"
4. **In MetaMask popup: Click "Confirm"**
5. Observe:
   - Loading state (button disabled, "Depositing...")
   - Wait for confirmation (~15-30 seconds)
   - Success alert
   - Balance updates automatically

**Step 4:** Test Insufficient Balance (Withdrawal)

1. Note your current balance (e.g., 0.002 ETH)
2. Try to withdraw MORE than you have (e.g., 0.01 ETH)
3. Click "Withdraw ETH"
4. Confirm in MetaMask
5. Observe:
   - Transaction gets mined
   - But reverts (contract rejects it)
   - Error: "Insufficient balance in contract"

**Step 5:** Open browser console (F12) during transaction

Watch console.log outputs:
```
Transaction sent: 0xabc123...
Transaction confirmed: 0xabc123...
```

**What you learned:**
- Saw all transaction states (pending, confirmed, rejected, reverted)
- Understood timing (instant popup, ~30 sec confirmation)
- Observed UI updates after confirmation

---

### Activity 3: Compare Frontend vs Backend Code

**Goal:** See the same operation (query balance) in both contexts.

**Step 1:** Frontend code (from useFamilyWallet.ts)

```typescript
// FRONTEND (Browser)
const provider = new ethers.BrowserProvider(window.ethereum);
const contract = new ethers.Contract(
  FAMILY_WALLET_ADDRESS,
  FAMILY_WALLET_ABI,
  provider
);
const balance = await contract.getBalance(address);
```

**Step 2:** Create equivalent backend script

```typescript
// scripts/week7/compare-frontend-backend.ts
import { ethers } from "ethers";
import { network } from "hardhat";

const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";
const FAMILY_WALLET_ABI = [
  "function getBalance(address member) external view returns (uint256)",
];

async function compareFrontendBackend() {
  console.log("=== Frontend vs Backend: Same Operation ===\n");

  // BACKEND (Node.js)
  console.log("🔧 BACKEND approach:");
  const connection = await network.connect();
  const provider = connection.ethers.provider;
  const [signer] = await connection.ethers.getSigners();
  const address = await signer.getAddress();

  const contract = new ethers.Contract(
    FAMILY_WALLET_ADDRESS,
    FAMILY_WALLET_ABI,
    provider
  );

  const balance = await contract.getBalance(address);
  console.log("  Address:", address);
  console.log("  Balance:", ethers.formatEther(balance), "ETH");
  console.log("  Provider type:", provider.constructor.name);
  console.log("  Environment: Node.js");
  console.log("  Popup? No");
  console.log("");

  // FRONTEND (simulated explanation)
  console.log("🌐 FRONTEND approach (how Week 6 code works):");
  console.log("  Same contract address:", FAMILY_WALLET_ADDRESS);
  console.log("  Same ABI");
  console.log("  Same getBalance() function");
  console.log("  Provider type: BrowserProvider");
  console.log("  Environment: Browser (React)");
  console.log("  Popup? No (view function)");
  console.log("");

  console.log("🎯 Key Takeaway:");
  console.log("  Both read the SAME blockchain data");
  console.log("  Difference is WHERE they run and HOW they connect");
  console.log("  Frontend: User's browser, MetaMask provider");
  console.log("  Backend: Server, Alchemy RPC provider");
}

compareFrontendBackend()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Step 3:** Run the backend version

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain\blockchain
npx tsx scripts/week7/compare-frontend-backend.ts
```

**Expected Output:**
```
=== Frontend vs Backend: Same Operation ===

🔧 BACKEND approach:
  Address: 0xB09b5449D8BB84312Fbc4293baf122E0e1875736
  Balance: 0.002 ETH
  Provider type: JsonRpcProvider
  Environment: Node.js
  Popup? No

🌐 FRONTEND approach (how Week 6 code works):
  Same contract address: 0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e
  Same ABI
  Same getBalance() function
  Provider type: BrowserProvider
  Environment: Browser (React)
  Popup? No (view function)

🎯 Key Takeaway:
  Both read the SAME blockchain data
  Difference is WHERE they run and HOW they connect
  Frontend: User's browser, MetaMask provider
  Backend: Server, Alchemy RPC provider
```

**What you learned:**
- Same operation, different providers
- Both access identical blockchain data
- Provider type changes based on environment
- View functions don't trigger popups in either case

---

### Activity 4: Debug Common Frontend Issues

**Goal:** Learn to troubleshoot Web3 frontend problems.

**Scenario 1: Wrong Network**

User connects MetaMask on Ethereum Mainnet, but app expects Sepolia.

**Detection code (add to useWalletStore.ts):**
```typescript
const expectedChainId = "0xaa36a7"; // Sepolia
if (chainId !== expectedChainId) {
  console.warn("Wrong network! Expected Sepolia, got:", chainId);
}
```

**Solution:** Prompt user to switch networks
```typescript
// Request network switch
await window.ethereum!.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0xaa36a7' }], // Sepolia
});
```

---

**Scenario 2: MetaMask Locked**

User's MetaMask is locked (not unlocked with password).

**Detection:**
```typescript
const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
if (accounts.length === 0) {
  console.warn("MetaMask locked or not connected");
}
```

**Solution:** Request connection (triggers MetaMask unlock)
```typescript
await window.ethereum!.request({ method: 'eth_requestAccounts' });
```

---

**Scenario 3: MetaMask Not Installed**

User doesn't have MetaMask installed.

**Detection:**
```typescript
if (typeof window.ethereum === 'undefined') {
  alert('Please install MetaMask!');
  window.open('https://metamask.io/download/', '_blank');
}
```

---

**Scenario 4: Insufficient ETH for Gas**

User tries to deposit all their ETH, leaving nothing for gas.

**Detection:**
```typescript
const balance = await provider.getBalance(address);
const amountToDeposit = ethers.parseEther("0.1");

// Estimate gas cost
const gasEstimate = await contract.deposit.estimateGas({
  value: amountToDeposit,
});
const feeData = await provider.getFeeData();
const gasCost = gasEstimate * (feeData.maxFeePerGas || 0n);

if (balance < amountToDeposit + gasCost) {
  alert('Insufficient balance for deposit + gas!');
}
```

---

## 📝 Deliverables

By the end of this class, you should have:

- [x] ✅ Deep understanding of useFamilyWallet hook architecture
- [x] ✅ Ability to explain provider vs signer in frontend context
- [x] ✅ Knowledge of complete transaction lifecycle
- [x] ✅ Tested all transaction states (rejected, successful, reverted)
- [x] ✅ One backend comparison script: `compare-frontend-backend.ts`
- [x] ✅ Understanding of common frontend Web3 issues
- [x] ✅ Prepared for Class 7.3 (backend transaction service)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot read property 'ethereum' of undefined"

**Error:**
```
TypeError: Cannot read property 'ethereum' of undefined
```

**Cause:** Accessing `window.ethereum` in Node.js (backend) or before window loads.

**Solution:**
```typescript
// Frontend: Check if in browser
if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  const provider = new ethers.BrowserProvider(window.ethereum);
}

// Or use 'use client' directive in Next.js
'use client'; // Top of file
```

---

### Issue 2: MetaMask popup doesn't appear

**Possible causes:**
1. MetaMask popup blocker (check browser settings)
2. Already pending transaction
3. MetaMask locked
4. Wrong network selected

**Debug:**
```typescript
console.log('MetaMask installed?', typeof window.ethereum !== 'undefined');
console.log('MetaMask unlocked?', (await window.ethereum.request({ method: 'eth_accounts' })).length > 0);
console.log('Current chain:', await window.ethereum.request({ method: 'eth_chainId' }));
```

---

### Issue 3: Transaction confirmed but UI doesn't update

**Cause:** Forgot to refetch data after transaction.

**Solution:**
```typescript
const tx = await contract.deposit({ value: amount });
await tx.wait(); // ✅ Wait for confirmation
await fetchContractBalance(); // ✅ Refetch data
// React will re-render with new balance
```

---

### Issue 4: useEffect infinite loop

**Error:**
```
Warning: Maximum update depth exceeded
```

**Cause:** Function dependency in useEffect changes every render.

**Solution:**
```typescript
// ❌ Wrong
useEffect(() => {
  const fetch = async () => { ... };
  fetch();
}, [address]); // fetch recreates every render!

// ✅ Correct
const fetch = useCallback(async () => { ... }, [address]);
useEffect(() => {
  fetch();
}, [fetch]); // fetch only changes when address changes
```

---

## ✅ Self-Assessment Quiz

### 1. What's the difference between provider-only and signer contract instances?

<details>
<summary>Answer</summary>

**Provider-only contract:**
```typescript
const contract = new ethers.Contract(address, abi, provider);
```
- Can only call view functions (read-only)
- Free (no gas cost)
- No MetaMask popup
- Examples: `getBalance()`, `isMember()`, `balanceOf()`

**Signer contract:**
```typescript
const signer = await provider.getSigner();
const contract = new ethers.Contract(address, abi, signer);
```
- Can call both view functions AND transactions
- Transactions cost gas
- MetaMask popup for transactions
- Examples: `deposit()`, `withdraw()`, `transfer()`

**Best practice:** Use provider-only for view functions to avoid unnecessary signer requests.
</details>

---

### 2. Walk through the complete transaction lifecycle from user clicking "Deposit" to seeing updated balance.

<details>
<summary>Answer</summary>

**Complete flow:**

1. **User clicks "Deposit" button**
   - React event handler calls `deposit("0.1")`

2. **Get signer from MetaMask**
   - `const signer = await provider.getSigner()`
   - MetaMask might prompt if not already connected

3. **Create contract instance with signer**
   - `const contract = new ethers.Contract(address, abi, signer)`

4. **Call contract function**
   - `const tx = await contract.deposit({ value: ethers.parseEther("0.1") })`

5. **MetaMask popup appears**
   - Shows gas estimate, total cost
   - User sees "Confirm" and "Reject" buttons

6A. **User REJECTS**
    - Throws error with code 4001
    - Catch error, show "Transaction rejected" message
    - Stop here

6B. **User CONFIRMS**
    - Transaction signed and sent to network
    - Get transaction object (has .hash)

7. **Transaction pending**
   - In mempool, waiting to be mined
   - `tx.hash` exists, but `receipt` is null

8. **Wait for confirmation**
   - `await tx.wait()`
   - Blocks code execution until mined (~15-30 seconds)

9. **Transaction mined**
   - Included in a block
   - `receipt` now available (blockNumber, gasUsed, status)

10. **Refetch contract data**
    - `await fetchContractBalance()`
    - Queries new balance from contract

11. **Update state**
    - `setContractBalance(newBalance)`

12. **React re-renders**
    - Component sees new balance
    - UI updates automatically

**Total time:** ~20-40 seconds (most time is waiting for block confirmation)
</details>

---

### 3. Why does useFamilyWallet use useCallback for fetch functions?

<details>
<summary>Answer</summary>

**Problem without useCallback:**

```typescript
// Function recreates on EVERY render
const fetchBalance = async () => { ... };

useEffect(() => {
  fetchBalance();
}, [fetchBalance]); // fetchBalance changes → useEffect runs → setState → render → fetchBalance changes → ∞
```

**Infinite loop!**

**Solution with useCallback:**

```typescript
// Function only recreates when dependencies change
const fetchBalance = useCallback(async () => { ... }, [address, isConnected]);

useEffect(() => {
  fetchBalance();
}, [fetchBalance]); // fetchBalance only changes when address or isConnected changes
```

**Result:**
- Function reference stays stable
- useEffect only runs when truly needed
- No infinite loops!

**When to use useCallback:**
- Function is a dependency in useEffect
- Function is passed as prop to child component
- Function is expensive to recreate
</details>

---

### 4. How do you handle MetaMask user rejection vs contract revert?

<details>
<summary>Answer</summary>

**Two different error types:**

**1. User Rejection (MetaMask):**
```typescript
catch (error: unknown) {
  if (error && typeof error === 'object' && 'code' in error) {
    const errorCode = (error as { code: string | number }).code;
    if (errorCode === 'ACTION_REJECTED' || errorCode === 4001) {
      // User clicked "Reject" in MetaMask
      alert('Transaction rejected by user');
      // This is NOT an error - user choice!
      return;
    }
  }
}
```

**2. Contract Revert (On-Chain):**
```typescript
catch (error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: string }).message;
    if (msg.includes('InsufficientBalance')) {
      // Contract reverted with custom error
      alert('Insufficient balance in contract');
      // This IS an error - contract logic prevented transaction
    }
  }
}
```

**Key differences:**

| Type | When | Gas cost | Error code | User action |
|------|------|----------|------------|-------------|
| User Rejection | Before transaction sent | ❌ Free | 4001 | User clicked "Reject" |
| Contract Revert | After transaction mined | ✅ Paid gas! | No specific code | Contract logic failed |

**User rejection:** Transaction never reaches blockchain (free)
**Contract revert:** Transaction mined but failed (still costs gas!)
</details>

---

### 5. What's the difference between frontend BrowserProvider and backend JsonRpcProvider?

<details>
<summary>Answer</summary>

**BrowserProvider (Frontend):**
```typescript
import { ethers } from "ethers";
const provider = new ethers.BrowserProvider(window.ethereum);
```
- Connects to MetaMask (browser extension)
- Requires user approval for transactions
- User controls private key
- Runs in browser (React, Next.js)
- Example use: DApp UI

**JsonRpcProvider (Backend):**
```typescript
import { ethers } from "ethers";
import { network } from "hardhat";
const connection = await network.connect();
const provider = connection.ethers.provider;
```
- Connects to RPC endpoint (Alchemy, Infura)
- No user approval needed (automated)
- App controls private key
- Runs in Node.js (scripts, servers)
- Example use: Event listeners, cron jobs

**Same blockchain data, different sources!**

Both can:
- ✅ Read balances
- ✅ Query transactions
- ✅ Call view functions

Only difference for transactions:
- BrowserProvider: User approves via MetaMask popup
- JsonRpcProvider: App signs automatically (no popup)
</details>

---

## 🎯 Key Takeaways

1. **Provider = Read-only**, Signer = Can write (frontend and backend)
2. **Transaction lifecycle:** Button → Signer → Contract call → MetaMask → Pending → Mined → Refetch → UI update
3. **useFamilyWallet pattern:** State + Helpers + Read + Write + Auto-fetch + Return
4. **useCallback prevents infinite loops** when function is useEffect dependency
5. **Error handling:** User rejection (4001) ≠ Contract revert (on-chain failure)
6. **Frontend vs Backend:** Same blockchain, different providers (MetaMask vs RPC)
7. **Always refetch after transactions** to update UI with latest data

---

## 🔗 Next Steps

In **Class 7.3: Backend Blockchain Service**, you'll:
- Build a backend service that sends transactions without MetaMask
- Load wallet from Hardhat keystore
- Create automated backend signer
- Handle nonce management for multiple transactions
- Set up foundation for Week 7's event listener

**Before Class 7.3:**
- Review this class's concepts (provider vs signer, transaction lifecycle)
- Ensure Hardhat keystore has SEPOLIA_PRIVATE_KEY set
- Verify FamilyWallet contract has some ETH deposited
- Understand error handling patterns

---

## 📚 Reading References

**Bitcoin Book:**
- **Chapter 5:** Wallets - Wallet Technology (key management)
- **Chapter 6:** Transactions - Transaction Lifecycle

**Ethereum Book:**
- **Chapter 5:** Wallets - Wallet Technology
- **Chapter 6:** Transactions - Transaction Structure, Nonce, Gas
- **Chapter 12:** DApps - Frontend Integration

**Key sections:**
- Wallet connection patterns (MetaMask integration)
- Transaction signing (ECDSA signatures)
- Nonce management (preventing replay attacks)
- Gas estimation (avoiding failed transactions)

---

## 🧑‍🏫 Teaching Notes (For Claude Code)

**Pacing:**
- 4 activities, ~20-40 minutes each
- Activity 1 is review (check understanding)
- Activity 2 is hands-on (test real DApp)
- Activity 3 bridges to backend (Week 7.3 prep)
- Activity 4 is troubleshooting (practical skills)

**Common Student Questions:**
1. **"Why useCallback? Seems complicated."** → Prevents infinite loops in useEffect
2. **"Do I always need refetch after tx?"** → Yes, blockchain doesn't push updates to you
3. **"Backend seems simpler, why use frontend?"** → Users need control over their keys!

**Teaching Emphasis:**
- Review, don't re-teach (assume Week 6 knowledge)
- Focus on WHY not WHAT (understanding over memorization)
- Bridge to Week 7.3 (show continuity)

**Real-World Connection:**
- Uniswap uses same patterns (BrowserProvider, MetaMask, useEffect refetch)
- Aave's frontend architecture (similar hook structure)
- OpenSea's transaction flow (popup → pending → confirmed → UI update)

**Week 6 Callback:**
- "Remember when we built this? Now you understand WHY!"
- "This pattern is production-ready - same as Uniswap!"

---

*Last Updated: 2025-11-21*
*Course: FamilyChain Blockchain Development*
*Week 7, Class 7.2 of 4*
