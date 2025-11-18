# FamilyWallet Gas Optimization Report

**Date:** 2025-11-18
**Contract:** FamilyWallet.sol (Week 5 version)
**Network:** Hardhat Local
**Solidity Version:** 0.8.28

---

## Executive Summary

The FamilyWallet contract was analyzed for gas optimization opportunities. **The contract is already well-optimized** due to design decisions made in Week 5:

- ✅ Custom errors instead of require strings
- ✅ Efficient use of mappings for lookups (O(1) vs O(n))
- ✅ OpenZeppelin libraries (industry-standard gas efficiency)
- ✅ ReentrancyGuard for security without excessive gas overhead

---

## Gas Costs Baseline

| Function | Gas Cost | Context |
|----------|----------|---------|
| **addMember** | 75,596 gas | Adding a new family member (most expensive) |
| **deposit (first)** | 48,334 gas | First deposit (cold storage write) |
| **deposit (second)** | 31,234 gas | Second deposit (warm storage update) |
| **withdraw** | 41,423 gas | Withdrawing ETH |

### Key Finding: Storage Temperature

**Cold vs Warm Storage Writes:**

- First deposit: 48,334 gas (writing to empty slot)
- Second deposit: 31,234 gas (updating existing slot)
- **Difference: 17,100 gas (35% savings on warm writes!)**

This demonstrates that SSTORE costs vary based on storage state.

---

## Storage Layout Analysis

### Current State Variables:

```solidity
mapping(address => bool) public familyMembers;   // Slot 0 (dynamic)
mapping(address => uint256) public balances;     // Slot 1 (dynamic)
address[] private memberList;                    // Slot 2 (length) + dynamic

Optimization Assessment:

✅ Already Optimal - No packing opportunities because:

1. Mappings use dynamic storage slots - Cannot pack with other variables
2. Arrays use dynamic storage slots - Cannot pack with other variables
3. No simple state variables to pack - Only complex types (mappings, arrays)

Storage Packing Rules (For Future Contracts):

| Can Pack? | Example                            | Gas Impact                     |
|-----------|------------------------------------|--------------------------------|
| ✅ YES     | address (20 bytes) + bool (1 byte) | 50% savings (2 slots → 1 slot) |
| ✅ YES     | uint128 + uint128                  | 50% savings (2 slots → 1 slot) |
| ❌ NO      | uint256 + anything                 | Takes full 32-byte slot        |
| ❌ NO      | Mappings                           | Use dynamic slots              |
| ❌ NO      | Arrays                             | Use dynamic slots              |

---
Loop Optimization Pattern (Educational)

Added isMemberInList() function to demonstrate loop caching pattern:

function isMemberInList(address member) external view returns (bool) {
    uint256 length = memberList.length; // ✅ Cache length (1 SLOAD)
    for (uint256 i = 0; i < length; i++) {
        if (memberList[i] == member) return true;
    }
    return false;
}

Pattern Benefits:
- Without caching: memberList.length read every iteration (~2,100 gas × iterations)
- With caching: One SLOAD (2,100 gas) + memory reads (3 gas × iterations)
- Savings (10 iterations): ~21,000 gas → ~2,130 gas = 90% reduction

Note: FamilyWallet already uses the superior pattern:
- ✅ mapping(address => bool) familyMembers - O(1) constant-time lookup
- ❌ Loop through memberList - O(n) linear-time lookup

---
Optimizations Already Applied (Week 5)

1. Custom Errors (Gas-Efficient Error Handling)

error InsufficientBalance(uint256 requested, uint256 available);

// vs old way:
// require(balance >= amount, "Insufficient balance");

Savings: ~50-100 gas per revert (stores 4-byte selector vs full string)

---
2. Mapping-Based Lookups

mapping(address => bool) public familyMembers;

Why optimal:
- O(1) constant-time lookups (~2,100 gas regardless of member count)
- vs O(n) array iteration (2,100 gas × member count)

---
3. OpenZeppelin Security Libraries

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

Why used:
- Battle-tested, gas-optimized implementations
- Ownable: Minimal overhead for access control
- ReentrancyGuard: Prevents reentrancy with single storage slot

---
Cost Analysis (Real-World Scenario)

Assumptions:
- Gas price: 50 gwei
- ETH price: $3,000

Function Costs in USD:

| Function         | Gas    | USD Cost |
|------------------|--------|----------|
| addMember        | 75,596 | $11.34   |
| deposit (first)  | 48,334 | $7.25    |
| deposit (second) | 31,234 | $4.68    |
| withdraw         | 41,423 | $6.21    |

For a family app with 100 members added: 100 × $11.34 = $1,134

This demonstrates why gas optimization matters at scale!

---
Recommendations for Future Contracts

1. Storage Packing

When adding new state variables, pack them efficiently:

// ❌ BAD: 3 storage slots
uint256 totalDeposits;  // 32 bytes
bool isActive;          // 1 byte
address treasury;       // 20 bytes

// ✅ GOOD: 2 storage slots (or 1 if totalDeposits fits in uint128)
address treasury;       // Slot 0: 20 bytes
uint96 someValue;       // Slot 0: 12 bytes (packed!)
bool isActive;          // Slot 1: 1 byte
uint256 totalDeposits;  // Slot 2: 32 bytes

---
2. Calldata for External Functions

When passing strings/arrays to external functions:

// ❌ BAD: Copies calldata → memory
function setName(string memory name) external {
    // Costs extra gas to copy
}

// ✅ GOOD: Uses calldata directly
function setName(string calldata name) external {
    // No copy, saves ~1,000+ gas
}

---
3. Cache Array Lengths in Loops

// ❌ BAD: Reads length every iteration
for (uint256 i = 0; i < array.length; i++) {
    // 2,100 gas per iteration
}

// ✅ GOOD: Cache once
uint256 length = array.length;
for (uint256 i = 0; i < length; i++) {
    // 3 gas per iteration
}

---
4. Continue Using Custom Errors

// ✅ GOOD: Already doing this
error InsufficientBalance(uint256 requested, uint256 available);

if (balance < amount) revert InsufficientBalance(amount, balance);

---
5. Prefer Mappings Over Array Searches

// ✅ GOOD: O(1) lookup (already doing this)
mapping(address => bool) public members;

// ❌ BAD: O(n) lookup (avoid this pattern)
address[] public members;
function isMember(address a) public view returns (bool) {
    for (uint256 i = 0; i < members.length; i++) {
        if (members[i] == a) return true;
    }
    return false;
}

---
Conclusion

FamilyWallet is already well-optimized due to:
1. Custom errors (Week 5 decision)
2. Efficient data structures (mappings over arrays for lookups)
3. OpenZeppelin security libraries (gas-optimized)
4. Clean contract design with minimal state

No optimizations applied in Week 6 because the contract was already following best
practices.

The patterns learned here (storage packing, loop caching, calldata usage) will be
valuable for future, more complex contracts like:
- FamilyAllowance (Week 9-10)
- Multi-sig wallet (Week 19)
- Token contracts (Week 22)

---
Test Command Reference

# Run gas analysis tests
npx hardhat test test/GasAnalysis.test.ts

# Run all tests
npx hardhat test

---
Report Date: 2025-11-18
Analyst: FamilyChain Development Course (Week 6, Class 6.1)

---