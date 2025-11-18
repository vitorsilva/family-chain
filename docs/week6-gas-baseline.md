# FamilyWallet Gas Baseline Report

**Date:** 2025-11-18
**Contract:** FamilyWallet.sol (Week 5 version)
**Network:** Hardhat Local

---

## Gas Costs Summary

| Function | Gas Cost | Notes |
|----------|----------|-------|
| addMember | 75,596 | Most expensive (2 storage writes + array) |
| deposit (first) | 48,334 | Cold storage write |
| deposit (second) | 31,234 | Warm storage update |
| withdraw | 41,423 | Updates balance + transfers ETH |

---

## Gas Cost for addMember

Given:

- Gas used: 75,596 gas
- Gas price: 50 gwei
- ETH price: $3,000

  Step 1: Calculate total gwei cost
  75,596 gas × 50 gwei/gas = 3,779,800 gwei

  Step 2: Convert gwei to ETH
  3,779,800 gwei ÷ 1,000,000,000 = 0.0037798 ETH

  Or with the formula:
  3,779,800 gwei × 0.000000001 = 0.0037798 ETH

  Step 3: Convert ETH to USD
  0.0037798 ETH × $3,000 = $11.34

  ---
  💰 Answer: $11.34 per addMember call!

## Key Findings

1. **Storage write difference:** 17,100 gas between cold and warm writes
2. **Most expensive operation:** addMember (75,596 gas)
3. **Cold vs warm SSTORE:** First write costs ~55% more than update

---

## Test Command

```powershell
npx hardhat test test/GasAnalysis.test.ts

---
