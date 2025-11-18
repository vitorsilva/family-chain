# Week 6 - Class 6.1: Gas Optimization Techniques

**Duration:** 3-4 hours
**Prerequisites:** Week 5 complete (FamilyWallet deployed and tested)

---

## Overview

Gas is the fuel that powers Ethereum transactions. Every operation costs gas, and users pay for it in ETH. Optimizing gas usage isn't just about saving money—it's about making your contracts accessible and competitive.

In this class, you'll learn practical gas optimization techniques by analyzing and improving your FamilyWallet contract from Week 5.

**Why It Matters:**
- **Cost savings**: A $10 transaction vs. a $1 transaction makes a huge difference to users
- **Competitiveness**: Users choose cheaper alternatives (Uniswap vs competitors)
- **Network congestion**: Efficient contracts help reduce blockchain bloat
- **Professional skill**: Gas optimization is a core competency for blockchain developers

---

## Learning Objectives

By the end of this class, you will be able to:

1. ✅ Explain how gas costs work in Ethereum
2. ✅ Identify the most expensive operations in Solidity
3. ✅ Apply storage packing to reduce costs
4. ✅ Choose between storage, memory, and calldata appropriately
5. ✅ Optimize loops and array operations
6. ✅ Use Hardhat's gas reporter to measure improvements
7. ✅ Generate a gas optimization report comparing before/after

---

## Key Concepts

###

 1. Gas Cost Hierarchy

Not all operations cost the same. Here's the hierarchy from most to least expensive:

| Operation | Approximate Gas Cost | Example |
|-----------|---------------------|---------|
| **SSTORE** (storage write) | ~20,000 gas | `balance = 100;` |
| **SLOAD** (storage read) | ~2,100 gas | `uint256 x = balance;` |
| **MSTORE** (memory write) | ~3 gas | `memory uint256[] array;` |
| **MLOAD** (memory read) | ~3 gas | Reading from memory |
| **CALLDATALOAD** | ~3 gas | Reading function parameters |
| **Arithmetic** | ~3-5 gas | `a + b`, `a * b` |

**Key Insight:** Storage operations are ~6,667x more expensive than memory/calldata!

---

### 2. Storage Layout and Packing

Solidity stores data in 32-byte (256-bit) slots. **Variable packing** means fitting multiple variables into a single slot.

**Before optimization (2 storage slots):**
```solidity
uint256 balance;    // Slot 0: 32 bytes
bool isActive;      // Slot 1: 1 byte (wastes 31 bytes!)
```
**Gas:** 2 SSTORE operations = ~40,000 gas

**After optimization (1 storage slot):**
```solidity
uint128 balance;    // Slot 0: 16 bytes
bool isActive;      // Slot 0: 1 byte (packed!)
```
**Gas:** 1 SSTORE operation = ~20,000 gas (50% savings!)

**Critical Rules:**
1. Variables are packed in the order declared
2. Only works in storage (not memory/calldata)
3. A `uint256` alone takes a full slot (use `uint128` or smaller to pack)
4. `address` (20 bytes) + `bool` (1 byte) = can pack with 11 bytes left
5. Inheritance: Child contract variables can pack with parent's last slot

---

### 3. Storage vs Memory vs Calldata

**Storage:**
- Persistent (saved on blockchain forever)
- Most expensive (~20,000 gas for writes)
- Use for state variables only

**Memory:**
- Temporary (exists only during function execution)
- Cheap (~3 gas for operations)
- Use for function-local complex types (arrays, structs, strings)

**Calldata:**
- Read-only function parameters
- Cheapest (~3 gas, no copying)
- Use for `external` function parameters (strings, arrays)

**Example:**
```solidity
// BAD: Copies calldata to memory unnecessarily
function addMember(string memory name) external {
    // ...
}

// GOOD: Uses calldata directly (no copy, saves ~1,000+ gas)
function addMember(string calldata name) external {
    // ...
}
```

---

### 4. Loop Optimization Patterns

**Problem:** Loops that read storage on every iteration are expensive.

**BAD (reads storage every iteration):**
```solidity
for (uint256 i = 0; i < memberList.length; i++) {
    // SLOAD every iteration: 2,100 gas × iterations
}
```

**GOOD (cache length in memory):**
```solidity
uint256 length = memberList.length; // 1 SLOAD: 2,100 gas
for (uint256 i = 0; i < length; i++) {
    // Memory read: 3 gas × iterations
}
```

**Savings:** For 10 iterations: ~21,000 gas vs. ~30 gas!

---

### 5. Custom Errors vs Require Strings

You already learned this in Week 5, but it's worth reinforcing:

**OLD (expensive):**
```solidity
require(balance >= amount, "Insufficient balance");
// Stores full error string on blockchain
```

**NEW (gas-efficient):**
```solidity
error InsufficientBalance(uint256 requested, uint256 available);
if (balance < amount) revert InsufficientBalance(amount, balance);
// Stores only error signature (4 bytes)
```

**Savings:** ~50-100 gas per error

---

### 6. Short-Circuiting with Early Returns

Exit functions as soon as possible to avoid unnecessary computation.

**BAD:**
```solidity
function withdraw(uint256 amount) external {
    require(amount > 0);
    require(familyMembers[msg.sender]);
    require(balances[msg.sender] >= amount);
    // ... withdrawal logic
}
```

**BETTER (fail fast):**
```solidity
function withdraw(uint256 amount) external {
    if (amount == 0) revert ZeroAmount();
    if (!familyMembers[msg.sender]) revert NotAMember();
    if (balances[msg.sender] < amount) revert InsufficientBalance(...);
    // ... withdrawal logic (only if checks pass)
}
```

---

## Hands-On Activities

### Activity 1: Enable Hardhat 3 Native Gas Statistics

**Goal:** Use Hardhat 3's built-in gas reporting to measure current costs.

**Background:** Hardhat 3 includes native gas statistics—no plugin installation needed! This replaces the old `hardhat-gas-reporter` plugin which doesn't support Hardhat 3.

**Step 1:** Run tests with gas statistics enabled:

```powershell
cd blockchain
npx hardhat test --gas-stats
```

**Expected Output:**
```
  FamilyWallet
    ✓ Should set the right owner (1234ms)
    ✓ Should add a family member (987ms)
    ✓ Should receive and track deposits (1543ms)

  3 passing (5s)

·---------------------------|---------------------------|-------------|-----------------------------·
|    Solc version: 0.8.28   ·  Optimizer enabled: false ·  Runs: 200  ·  Block limit: 30000000 gas  │
·---------------------------|---------------------------|-------------|-----------------------------·
|  Methods                                                                                            │
·························|··········|··········|··········|··········|··············|···············
|  Contract              ·  Method  ·  Min     ·  Max     ·  Avg     ·  # calls     ·  usd (avg)   │
·························|··········|··········|··········|··········|··············|···············
|  FamilyWallet          ·  deposit ·   45234  ·   67891  ·   56562  ·     10       ·       -      │
·························|··········|··········|··········|··········|··············|···············
|  FamilyWallet          ·  withdraw·   29456  ·   41234  ·   35345  ·      5       ·       -      │
·························|··········|··········|··········|··········|··············|···············
```

**What you see:**
- **Min/Max/Avg:** Gas costs for each function call
- **# calls:** How many times each function was called in tests
- **usd (avg):** Would show USD cost if you configured a price feed

**Step 2:** Save the output for later comparison:

```powershell
npx hardhat test --gas-stats > gas-report-before.txt
```

**Step 3:** View the saved report:

```powershell
cat gas-report-before.txt
```

**Key Insight:** This baseline shows your current gas costs. After optimizations, you'll run this again and compare!

---

### Activity 1b: Manual Gas Tracking (Advanced - Optional)

**Goal:** Learn how to track gas for specific transactions in tests.

For more detailed analysis, you can manually measure gas in your test files. This is useful when you want to:
- Track internal function calls (not shown in `--gas-stats`)
- Set gas thresholds as test assertions
- Create custom gas reports

**Step 1:** Create a gas tracking test: `test/GasAnalysis.test.ts`

```typescript
import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-mocha-ethers/network-helpers";
import type { FamilyWallet } from "../typechain-types";

describe("FamilyWallet - Gas Analysis", function () {
  async function deployFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const FamilyWallet = await ethers.getContractFactory("FamilyWallet");
    const wallet = await FamilyWallet.deploy();
    
    // Add addr1 as a member
    await wallet.addMember(addr1.address);
    
    return { wallet, owner, addr1, addr2 };
  }

  it("Should track gas for deposit transaction", async function () {
    const { wallet, addr1 } = await loadFixture(deployFixture);
    
    // Send deposit transaction
    const tx = await wallet.connect(addr1).deposit({
      value: ethers.parseEther("0.1")
    });
    
    // Wait for receipt
    const receipt = await tx.wait();
    
    // Log gas used
    const gasUsed = receipt?.gasUsed ?? 0n;
    console.log(`\n  💰 Deposit gas used: ${gasUsed.toString()}`);
    
    // Optional: Assert gas is below threshold
    expect(gasUsed).to.be.lessThan(60000n, "Deposit should use less than 60k gas");
  });

  it("Should track gas for withdrawal transaction", async function () {
    const { wallet, addr1 } = await loadFixture(deployFixture);
    
    // First deposit
    await wallet.connect(addr1).deposit({ value: ethers.parseEther("0.1") });
    
    // Then withdraw
    const tx = await wallet.connect(addr1).withdraw(ethers.parseEther("0.05"));
    const receipt = await tx.wait();
    
    const gasUsed = receipt?.gasUsed ?? 0n;
    console.log(`\n  💸 Withdraw gas used: ${gasUsed.toString()}`);
    
    expect(gasUsed).to.be.lessThan(50000n, "Withdraw should use less than 50k gas");
  });

  it("Should compare gas: first deposit vs. second deposit", async function () {
    const { wallet, addr1 } = await loadFixture(deployFixture);
    
    // First deposit (writes to empty storage slot)
    const tx1 = await wallet.connect(addr1).deposit({ value: ethers.parseEther("0.1") });
    const receipt1 = await tx1.wait();
    const gas1 = receipt1?.gasUsed ?? 0n;
    
    // Second deposit (updates existing storage slot)
    const tx2 = await wallet.connect(addr1).deposit({ value: ethers.parseEther("0.1") });
    const receipt2 = await tx2.wait();
    const gas2 = receipt2?.gasUsed ?? 0n;
    
    console.log(`\n  📊 Gas Comparison:`);
    console.log(`     First deposit (write new):     ${gas1.toString()} gas`);
    console.log(`     Second deposit (update):       ${gas2.toString()} gas`);
    console.log(`     Difference:                    ${(gas1 - gas2).toString()} gas saved`);
    
    // First write costs more than update (SSTORE cold vs warm)
    expect(gas1).to.be.greaterThan(gas2, "First write should cost more than update");
  });
});
```

**Step 2:** Run the gas analysis tests:

```powershell
npx hardhat test test/GasAnalysis.test.ts
```

**Expected Output:**
```
  FamilyWallet - Gas Analysis
  
  💰 Deposit gas used: 52341
    ✓ Should track gas for deposit transaction (1234ms)
  
  💸 Withdraw gas used: 38456
    ✓ Should track gas for withdrawal transaction (987ms)
  
  📊 Gas Comparison:
     First deposit (write new):     52341 gas
     Second deposit (update):       37234 gas
     Difference:                    15107 gas saved
    ✓ Should compare gas: first deposit vs. second deposit (1543ms)

  3 passing (4s)
```

**Key Insights:**
- **First write costs more:** Writing to empty storage (~20,000 gas) vs. updating (~5,000 gas)
- **Manual tracking shows details:** `--gas-stats` won't show this granularity
- **Test assertions enforce limits:** Prevents gas regressions in CI/CD

---
### Activity 2: Analyze FamilyWallet's Storage Layout

**Goal:** Understand current storage usage and identify optimization opportunities.

**Step 1:** Review your FamilyWallet.sol state variables:

```solidity
// Current layout (from Week 5)
mapping(address => bool) private familyMembers;       // Slot 0 (each entry: 1 slot)
mapping(address => uint256) private balances;         // Slot 1 (each entry: 1 slot)
address[] private memberList;                         // Slot 2 (length) + dynamic slots
```

**Question to think about:** Can these be packed?

**Answer:** No! These are already optimal:
- Mappings don't pack with other variables (they use dynamic slots)
- Arrays also use dynamic storage
- **Optimization target:** Look at structs or simple state variables if you add them

---

### Activity 3: Optimize Loop in `getMembers` (If Applicable)

**Goal:** Cache array length to save gas in loops.

**Current code (check your FamilyWallet.sol):**
```solidity
function getMembers() external view returns (address[] memory) {
    return memberList; // This is already optimal (returns full array)
}
```

**Note:** Since `getMembers` is a `view` function that returns the entire array, there's no loop to optimize here. **But**, let's add a hypothetical function to demonstrate the pattern:

**Add this NEW function to FamilyWallet.sol:**

```solidity
/// @notice Checks if an address is a member (example for loop optimization)
/// @param member Address to check
/// @return exists True if member is in the list
function isMemberInList(address member) external view returns (bool exists) {
    uint256 length = memberList.length; // Cache length (1 SLOAD)
    for (uint256 i = 0; i < length; i++) {
        if (memberList[i] == member) {
            return true;
        }
    }
    return false;
}
```

**Before optimization (if we wrote it badly):**
```solidity
// BAD: Reads memberList.length every iteration
for (uint256 i = 0; i < memberList.length; i++) {
    // SLOAD every time: expensive!
}
```

**After optimization:**
```solidity
// GOOD: Cache once
uint256 length = memberList.length;
for (uint256 i = 0; i < length; i++) {
    // Memory read: cheap!
}
```

**Compile and test:**
```powershell
npx hardhat build
npx hardhat test
```

**Note:** This function duplicates `isMember()` logic. In real code, you'd use the mapping. This is purely educational!

---

### Activity 4: Use Calldata for External Function Strings (Hypothetical)

**Current FamilyWallet doesn't have string parameters**, but let's understand the pattern for future contracts.

**Example: If you had a function like this:**

```solidity
// BAD: Copies string to memory
function setFamilyName(string memory name) external onlyOwner {
    // Costs extra gas to copy calldata → memory
}
```

**Optimization:**
```solidity
// GOOD: Uses calldata directly (no copy)
function setFamilyName(string calldata name) external onlyOwner {
    // Cheaper! No copy operation
}
```

**Rule:** For `external` functions with reference types (strings, arrays, structs), use `calldata` instead of `memory`.

---

### Activity 5: Generate Gas Report and Compare

**Goal:** Re-run tests with gas statistics and compare to Activity 1 baseline.

**Step 1:** If you added `isMemberInList`, run tests with gas statistics:

```powershell
npx hardhat test --gas-stats
```

**Or save to a file for easier comparison:**

```powershell
npx hardhat test --gas-stats > gas-report-after.txt
```

**Step 2:** Compare the reports:

**Baseline (Activity 1) - gas-report-before.txt:**
```
|  FamilyWallet  ·  addMember  ·  56500  avg |
|  FamilyWallet  ·  deposit    ·  40500  avg |
```

**After optimization (Activity 5) - gas-report-after.txt:**
```
|  FamilyWallet  ·  addMember        ·  56500  avg |  (no change - already optimal)
|  FamilyWallet  ·  deposit          ·  40500  avg |  (no change - already optimal)
|  FamilyWallet  ·  isMemberInList   ·  24500  avg |  (new function, loop optimized)
```
### Activity 6: Create a Gas Optimization Report

**Goal:** Document your findings in a structured report.

**Create:** `docs/week6-gas-optimization-report.md`

**Template:**

```markdown
# FamilyWallet Gas Optimization Report

**Date:** [Today's date]
**Contract:** FamilyWallet.sol
**Network:** Sepolia Testnet

---

## Summary

- **Total functions analyzed:** [number]
- **Optimizations applied:** [number]
- **Average gas savings:** [percentage or "contract already optimal"]

---

## Baseline Gas Costs (Before)

| Function | Min Gas | Max Gas | Avg Gas |
|----------|---------|---------|---------|
| addMember | 48,000 | 65,000 | 56,500 |
| deposit | 32,000 | 49,000 | 40,500 |
| withdraw | 28,000 | 45,000 | 36,500 |

---

## Optimizations Applied

### 1. Loop Optimization (isMemberInList)
- **Pattern:** Cached array length before loop
- **Before:** N/A (new function)
- **After:** 24,500 gas avg
- **Savings:** Educational example (not deployed)

### 2. Existing Contract Analysis
- **Storage layout:** Already optimal (mappings and arrays cannot be packed)
- **Custom errors:** Already using custom errors (Week 5)
- **Access control:** Using OpenZeppelin Ownable (gas-efficient)

---

## Final Gas Costs (After)

| Function | Min Gas | Max Gas | Avg Gas | Change |
|----------|---------|---------|---------|--------|
| addMember | 48,000 | 65,000 | 56,500 | No change |
| deposit | 32,000 | 49,000 | 40,500 | No change |
| withdraw | 28,000 | 45,000 | 36,500 | No change |

---

## Recommendations for Future Contracts

1. ✅ **Always cache array lengths** before loops
2. ✅ **Use calldata for external string/array parameters**
3. ✅ **Pack structs** when adding complex data types
4. ✅ **Use uint128 instead of uint256** when values allow it AND you can pack
5. ✅ **Continue using custom errors** (already doing this)

---

## Conclusion

The FamilyWallet contract was already well-optimized from Week 5 due to:
- Custom errors instead of require strings
- Efficient use of mappings and arrays
- OpenZeppelin libraries (industry-standard efficiency)

The patterns learned here will apply to future, more complex contracts.
```

---

## Expected Outputs

By the end of this class, you should have:

1. ✅ Gas report showing current FamilyWallet costs
2. ✅ Understanding of storage vs memory vs calldata
3. ✅ Example `isMemberInList` function demonstrating loop optimization
4. ✅ Gas optimization report document (`docs/week6-gas-optimization-report.md`)
5. ✅ Knowledge of patterns to apply in future contracts

---

## Common Issues & Solutions

### Issue 1: Gas Statistics Not Showing

**Symptoms:** Running `npx hardhat test --gas-stats` doesn't show gas table

**Solution:**
1. **Verify you're using Hardhat 3.0.8+:**
   ```powershell
   npx hardhat --version
   ```
   Should show: `3.0.8` or higher

2. **Check that tests actually call the functions:**
   - Gas statistics only track functions called **directly by tests**
   - Deployment alone doesn't show in gas stats
   - Internal function calls aren't tracked (use manual tracking for those)

3. **Ensure tests are passing:**
   - Failed tests won't show gas statistics
   - Run `npx hardhat test` first to verify tests pass

4. **Try with a specific test file:**
   ```powershell
   npx hardhat test test/FamilyWallet.test.ts --gas-stats
   ```

5. **If still not showing, check your Hardhat config:**
   - Ensure you're using `@nomicfoundation/hardhat-toolbox-mocha-ethers`
   - This includes the gas statistics feature

**Alternative:** Use manual gas tracking (see Activity 1b) for more control.
### Issue 2: "Optimizer Enabled: false" in Report

**Symptoms:** Gas report shows "Optimizer enabled: false"

**Background:** Hardhat 3 default profile has optimizer disabled for faster builds.

**Solution (optional):** Enable optimizer in `hardhat.config.ts`:

```typescript
solidity: {
  version: "0.8.28",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
},
```

**Note:** This will reduce gas costs by ~5-10% but increase compilation time. For testnet, default is fine.

---

### Issue 3: "Why are my gas costs different from the guide?"

**Answer:** Gas costs vary based on:
- Storage state (first write vs update)
- Zero vs non-zero values (SSTORE refunds)
- Call context (internal vs external calls)

**Don't worry** if your numbers differ slightly. Focus on relative changes (before/after optimization).

---

## Self-Assessment Quiz

Test your understanding before moving to Class 6.2.

### Question 1: Storage Cost
**Q:** Why is storage the most expensive operation?
<details>
<summary>Click to reveal answer</summary>

**A:** Storage is permanent data saved to the blockchain forever. Every full node must store it, sync it, and validate it. This permanence and replication across thousands of nodes makes it expensive (~20,000 gas for writes).
</details>

---

### Question 2: Variable Packing
**Q:** Can you pack `uint256` with `bool`? Why or why not?
<details>
<summary>Click to reveal answer</summary>

**A:** No! A `uint256` alone fills an entire 32-byte storage slot. To pack, you need smaller types like `uint128` (16 bytes) + `bool` (1 byte) = 17 bytes (fits in one slot with 15 bytes remaining).
</details>

---

### Question 3: Calldata vs Memory
**Q:** When should you use `calldata` instead of `memory` for function parameters?
<details>
<summary>Click to reveal answer</summary>

**A:** Use `calldata` for `external` function parameters when:
1. The parameter is a reference type (string, array, struct)
2. You don't need to modify it inside the function
3. You want to save gas (no copy from calldata to memory)

**Rule:** `calldata` = read-only external parameters (cheapest).
</details>

---

### Question 4: Loop Optimization
**Q:** What's wrong with `for (uint256 i = 0; i < array.length; i++)`?
<details>
<summary>Click to reveal answer</summary>

**A:** `array.length` is a storage read (SLOAD: ~2,100 gas) executed every iteration! For 10 iterations, that's ~21,000 gas wasted.

**Fix:** Cache length: `uint256 length = array.length;` then use `i < length`.
</details>

---

### Question 5: Gas Reporter
**Q:** What command enables Hardhat's gas reporter?
<details>
<summary>Click to reveal answer</summary>

**A:**
```powershell
$env:REPORT_GAS="true"; npx hardhat test
```

Or permanently add to your shell profile.
</details>

---

### Question 6: Custom Errors
**Q:** Why are custom errors cheaper than `require` with strings?
<details>
<summary>Click to reveal answer</summary>

**A:** Custom errors store only the error selector (4 bytes: keccak256 hash of signature). `require` strings store the full text on-chain. For "Insufficient balance" (19 chars), custom errors save ~50-100 gas per revert.
</details>

---

### Question 7: Real-World Application
**Q:** If a function costs 50,000 gas and gas price is 50 gwei, with ETH at $3,000, how much does it cost in USD?
<details>
<summary>Click to reveal answer</summary>

**A:**
- Gas cost: 50,000 gas × 50 gwei = 2,500,000 gwei = 0.0025 ETH
- USD cost: 0.0025 ETH × $3,000 = **$7.50**

**Optimize to 25,000 gas → $3.75 savings per transaction!**
</details>

---

## Key Takeaways

### Most Important Concepts

1. **Storage is 6,667x more expensive** than memory/calldata
2. **Variable packing only works in storage** (mappings and arrays don't pack)
3. **Cache array lengths** before loops to save thousands of gas
4. **Use calldata for external reference types** (strings, arrays)
5. **Custom errors** beat require strings (Week 5 already taught this)
6. **Gas optimization is continuous** - always profile, measure, improve

### Patterns to Remember

| Pattern | Bad | Good | Savings |
|---------|-----|------|---------|
| **Storage packing** | `uint256 + bool` (2 slots) | `uint128 + bool` (1 slot) | 50% |
| **Loop caching** | `for (i < array.length)` | `uint256 len = array.length; for (i < len)` | ~2,000 gas/iteration |
| **Function params** | `string memory` | `string calldata` | ~1,000+ gas |
| **Error handling** | `require("msg")` | `revert CustomError()` | ~50-100 gas |

---

## Reading Assignments

To deepen your understanding, read the following chapters:

### Bitcoin Book
- **Chapter 6:** Transactions
  - Section: "Transaction Fees" (understand fee markets)
  - Section: "Transaction Inputs and Outputs" (efficiency patterns)

### Ethereum Book
- **Chapter 6:** Transactions
  - Section: "Gas" (comprehensive gas explanation)
  - Section: "Transaction Gas Calculation" (how gas is computed)
- **Chapter 13:** The Ethereum Virtual Machine (EVM)
  - Section: "Gas Costs" (operation-by-operation costs)
  - Section: "Storage and Memory" (architecture understanding)

**Why these chapters?**
- Bitcoin's UTXO model teaches efficiency through necessity
- Ethereum's gas mechanism is the foundation of all optimization
- EVM internals explain why storage is so expensive

---

## Next Steps

**Class 6.2: Contract Security Audit with Slither** (~3-4 hours)
- Install Slither static analyzer
- Run security audit on FamilyWallet
- Understand vulnerability detection
- Generate security report

**Prerequisites for Next Class:**
- ✅ Gas optimization report complete
- ✅ Understanding of FamilyWallet's current structure
- ✅ Python 3.12+ installed (for Slither)

---

**Class 6.1 Complete!** You now understand gas optimization fundamentals and can apply them to any Solidity contract.

**Next:** Security is just as important as efficiency. Let's audit FamilyWallet in Class 6.2!
