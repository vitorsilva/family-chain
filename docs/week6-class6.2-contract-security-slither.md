# Week 6 - Class 6.2: Contract Security Audit with Slither

**Duration:** 3-4 hours
**Prerequisites:** Week 5 complete (FamilyWallet deployed), Class 6.1 complete (gas optimization)

---

## Overview

Security is paramount in smart contract development. Unlike traditional software where bugs can be patched, smart contracts are immutable once deployed. A security vulnerability can lead to catastrophic loss of funds.

**The DAO Hack (2016):** A reentrancy vulnerability led to $50 million stolen. This single bug nearly killed Ethereum and led to the controversial hard fork creating Ethereum Classic.

In this class, you'll learn to use **Slither**, a Python-based static analyzer that scans Solidity code for over 92 types of vulnerabilities automatically.

**Why Slither?**
- ✅ **Fast**: Scans a 500-line contract in ~30 seconds
- ✅ **Comprehensive**: 92+ vulnerability detectors
- ✅ **Actionable**: Clear severity ratings (High/Medium/Low/Informational)
- ✅ **Gas optimization**: Also finds gas savings opportunities
- ✅ **CI/CD ready**: Integrates into GitHub Actions (Week 29)

---

## Learning Objectives

By the end of this class, you will be able to:

1. ✅ Install and configure Slither static analyzer
2. ✅ Run security audits on Solidity contracts
3. ✅ Interpret Slither reports (severity levels, detector types)
4. ✅ Distinguish false positives from real vulnerabilities
5. ✅ Fix identified security issues
6. ✅ Generate security audit reports for your contracts
7. ✅ Understand common smart contract vulnerabilities

---

## Key Concepts

### 1. Static Analysis vs Dynamic Analysis

**Static Analysis** (Slither):
- Analyzes code without executing it
- Fast (seconds to minutes)
- Finds patterns and potential issues
- Good at: Access control, reentrancy patterns, bad practices
- Limitation: May miss runtime-specific issues

**Dynamic Analysis** (Mythril):
- Executes code symbolically
- Slow (minutes to hours)
- Explores execution paths
- Good at: Complex vulnerabilities, integer overflows in logic
- Limitation: Slower, more false positives

**For this course:** We focus on Slither (practical, fast, CI/CD-friendly). Mythril is complementary but optional.

---

### 2. Vulnerability Severity Levels

Slither classifies findings into four severity levels:

| Severity | Impact | Action Required | Example |
|----------|--------|-----------------|---------|
| **High** | Critical - potential loss of funds | Fix immediately | Reentrancy, unprotected ether withdrawal |
| **Medium** | Important - security or correctness issues | Fix before production | Incorrect access control, state variable shadowing |
| **Low** | Minor - best practices, code quality | Fix when possible | Missing zero-address checks, unused variables |
| **Informational** | Code quality, optimization | Review and consider | Naming conventions, gas optimizations |

---

### 3. Common Vulnerability Categories

**Slither detects 92+ vulnerabilities. Here are the most important:**

#### A. Reentrancy
**Problem:** External call allows attacker to re-enter your function before state updates complete.

**Example:**
```solidity
// VULNERABLE
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    (bool success, ) = msg.sender.call{value: amount}("");  // External call FIRST
    require(success);
    balances[msg.sender] -= amount;  // State update AFTER (too late!)
}
```

**Attacker's contract:**
```solidity
receive() external payable {
    // Re-enter withdraw() before balance is updated!
    VulnerableContract(msg.sender).withdraw(1 ether);
}
```

**Fix:** Checks-Effects-Interactions + ReentrancyGuard (you already did this in Week 5!).

---

#### B. Access Control Issues
**Problem:** Functions that should be restricted are publicly callable.

**Example:**
```solidity
// VULNERABLE
function setOwner(address newOwner) external {
    owner = newOwner; // Anyone can change owner!
}
```

**Fix:** Add access modifiers:
```solidity
function setOwner(address newOwner) external onlyOwner {
    owner = newOwner;
}
```

---

#### C. Integer Overflow/Underflow
**Problem:** In Solidity < 0.8.0, arithmetic could wrap around.

**Example (Solidity 0.7):**
```solidity
uint256 balance = 0;
balance -= 1; // Wraps to 2^256 - 1 (huge number!)
```

**Good news:** Solidity 0.8.0+ has built-in overflow protection (reverts automatically).

**Your contracts:** Use 0.8.28, so this is handled! Slither won't flag it.

---

#### D. Unprotected Ether Withdrawal
**Problem:** Functions that send Ether without proper access control.

**Example:**
```solidity
// VULNERABLE
function withdraw(uint256 amount) external {
    payable(msg.sender).transfer(amount); // Anyone can drain!
}
```

**Fix:** Restrict to authorized users:
```solidity
function withdraw(uint256 amount) external onlyOwner nonReentrant {
    // Check balances, etc.
}
```

---

#### E. Uninitialized Storage Pointers
**Problem:** Using `storage` pointer without initialization.

**Example:**
```solidity
// VULNERABLE (Solidity < 0.5.0)
struct Data { uint256 value; }
function badFunction() external {
    Data storage data; // Uninitialized! Points to slot 0
    data.value = 100; // Corrupts storage slot 0!
}
```

**Good news:** Solidity 0.8.28 prevents this (compilation error).

---

### 4. False Positives

**Not all Slither findings are real issues.** You must analyze each one:

**Common false positives:**
1. **Low-level calls**: Slither flags all `.call()`, but if you're using OpenZeppelin's guards, it's safe
2. **Timestamp dependence**: Flagged for block.timestamp usage, but acceptable for non-critical timing
3. **Assembly usage**: Flagged in OpenZeppelin libraries (library devs know what they're doing)

**Your job:** Review each finding, determine if it's a real issue, and document your reasoning.

---

## Hands-On Activities

### Activity 1: Install Python 3.12+ and Slither

**Goal:** Set up Slither for smart contract analysis.

**Step 1:** Check if Python is installed:

```powershell
python --version
```

**Expected output:** `Python 3.12.x` or higher

**If not installed:**
1. Download from: https://www.python.org/downloads/
2. Choose "Python 3.12.x" (latest stable)
3. **Important:** Check "Add Python to PATH" during installation
4. Restart PowerShell after installation

---

**Step 2:** Verify pip (Python package manager):

```powershell
pip --version
```

**Expected output:** `pip 24.x from...`

---

**Step 3:** Install Slither:

```powershell
pip install slither-analyzer
```

**Expected output:**
```
Collecting slither-analyzer
  Downloading slither_analyzer-X.X.X-py3-none-any.whl
...
Successfully installed slither-analyzer-X.X.X
```

---

**Step 4:** Verify Slither installation:

```powershell
slither --version
```

**Expected output:** `0.10.x` or similar

---

**Step 5:** Install solc-select (Solidity version manager):

```powershell
pip install solc-select
```

**Step 6:** Install Solidity 0.8.28 (your project version):

```powershell
solc-select install 0.8.28
solc-select use 0.8.28
```

**Verify:**
```powershell
solc --version
```

**Expected output:** `solc, the solidity compiler commandline interface Version: 0.8.28+...`

---

### Activity 2: Run Slither on FamilyWallet

**Goal:** Perform your first automated security audit.

**Step 1:** Navigate to your project root:

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain
```

**Step 2:** Run Slither on FamilyWallet:

```powershell
slither contracts/FamilyWallet.sol
```

**What happens:**
1. Slither compiles your contract
2. Analyzes the bytecode and AST
3. Runs 92+ detectors
4. Generates a report

**Expected output (example):**
```
Compiling contracts...
Analyzing contracts...

FamilyWallet analyzed (3 contracts, 82 detectors)

Reference: https://github.com/crytic/slither/wiki/Detector-Documentation

INFO:Detectors:
FamilyWallet.withdraw(uint256) (contracts/FamilyWallet.sol#45-55) sends eth to arbitrary user
        Dangerous calls:
        - (success,None) = msg.sender.call{value: amount}() (contracts/FamilyWallet.sol#52)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#functions-that-send-ether-to-arbitrary-destinations
INFO:Detectors:
Reentrancy in FamilyWallet.withdraw(uint256) (contracts/FamilyWallet.sol#45-55):
        External calls:
        - (success,None) = msg.sender.call{value: amount}() (contracts/FamilyWallet.sol#52)
        State variables written after the call(s):
        - balances[msg.sender] -= amount (contracts/FamilyWallet.sol#53)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#reentrancy-vulnerabilities

INFO:Slither:contracts/FamilyWallet.sol analyzed (3 contracts with 82 detectors), 2 result(s) found
```

---

**Step 3:** Save the report:

```powershell
slither contracts/FamilyWallet.sol --json slither-report.json
```

This creates a machine-readable report for documentation.

---

### Activity 3: Analyze Slither Findings

**Goal:** Understand each finding and determine if it's a real issue.

**Finding 1: "sends eth to arbitrary user"**

**Severity:** Informational/Low

**Explanation:** Slither flags any `.call{value}()` as potentially dangerous because in general, sending ETH to arbitrary addresses can be risky.

**Your code:**
```solidity
function withdraw(uint256 amount) external nonReentrant {
    if (!familyMembers[msg.sender]) revert NotAMember();
    if (balances[msg.sender] < amount) revert InsufficientBalance(...);

    balances[msg.sender] -= amount;  // CEI: Effects BEFORE interaction
    (bool success, ) = msg.sender.call{value: amount}("");  // Interaction LAST
    if (!success) revert WithdrawFailed();
}
```

**Analysis:**
- ✅ Checks-Effects-Interactions pattern followed
- ✅ `nonReentrant` guard present
- ✅ Sends only to `msg.sender` (not arbitrary address)
- ✅ Balance checked before sending

**Verdict:** **False positive** - This is secure. Document in report.

---

**Finding 2: "Reentrancy vulnerability"**

**Severity:** Medium (Slither doesn't know about your guards)

**Explanation:** Slither sees:
1. External call: `msg.sender.call{value: amount}()`
2. State change after call: `balances[msg.sender] -= amount`

**Wait, didn't we do CEI?** Let's check the actual code...

**Your ACTUAL code from Week 5:**
```solidity
balances[msg.sender] -= amount;  // State update FIRST
(bool success, ) = msg.sender.call{value: amount}("");  // External call AFTER
```

**Analysis:**
- ✅ State updated BEFORE external call (CEI pattern)
- ✅ `nonReentrant` modifier present (OpenZeppelin guard)
- ✅ Double protection (defense-in-depth)

**Why Slither flags it:** Slither's detector might not recognize OpenZeppelin's `nonReentrant` modifier fully, or you have a different code order in a function.

**Verdict:** **False positive** IF you followed Week 5 correctly. If not, **fix the order**.

---

**Finding 3: Potential findings from OpenZeppelin imports**

Slither may flag things in `Ownable.sol` or `ReentrancyGuard.sol` like:
- Assembly usage
- Low-level calls
- Timestamp dependence

**Verdict:** **Ignore OpenZeppelin internal findings** - these are audited libraries used by thousands of projects.

---

### Activity 4: Fix Any Real Issues (If Found)

**Goal:** Address legitimate vulnerabilities.

**Scenario 1:** If you find incorrect CEI order:

**Before (WRONG):**
```solidity
(bool success, ) = msg.sender.call{value: amount}("");  // External call FIRST
require(success);
balances[msg.sender] -= amount;  // State update AFTER (vulnerable!)
```

**After (CORRECT):**
```solidity
balances[msg.sender] -= amount;  // State update FIRST
(bool success, ) = msg.sender.call{value: amount}("");  // External call AFTER
if (!success) revert WithdrawFailed();
```

**Rebuild and retest:**
```powershell
npx hardhat build
npx hardhat test
```

---

**Scenario 2:** If you find missing access control:

**Before (WRONG):**
```solidity
function emergencyWithdraw() external {
    // Anyone can call this!
}
```

**After (CORRECT):**
```solidity
function emergencyWithdraw() external onlyOwner {
    // Only owner can call
}
```

---

### Activity 5: Run Additional Slither Detectors

**Goal:** Explore Slither's other features.

**Generate inheritance graph:**

```powershell
slither contracts/FamilyWallet.sol --print inheritance-graph
```

**Output:** Creates a `.dot` file showing contract inheritance (FamilyWallet → Ownable, ReentrancyGuard)

**View it online:** Upload the `.dot` file to https://dreampuf.github.io/GraphvizOnline/

---

**Find unused state variables:**

```powershell
slither contracts/FamilyWallet.sol --detect unused-state
```

**Expected output:** (hopefully) "No unused state variables found"

---

**Check for naming convention violations:**

```powershell
slither contracts/FamilyWallet.sol --detect naming-convention
```

**Common findings:**
- Constants should be UPPER_CASE
- Private variables should start with underscore: `_balance`
- Events should be PascalCase (you already did this!)

---

### Activity 6: Create Security Audit Report

**Goal:** Document your security analysis.

**Create:** `docs/week6-security-audit-report.md`

**Template:**

```markdown
# FamilyWallet Security Audit Report

**Date:** [Today's date]
**Auditor:** [Your name]
**Tool:** Slither 0.10.x
**Contract:** FamilyWallet.sol (version from Week 5)
**Deployed Address:** 0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e (Sepolia)

---

## Executive Summary

- **Total findings:** [number]
- **High severity:** [number]
- **Medium severity:** [number]
- **Low severity:** [number]
- **Informational:** [number]
- **False positives:** [number]

**Overall assessment:** [PASS / NEEDS FIXES / FAIL]

---

## Detailed Findings

### Finding 1: Sends ETH to Arbitrary User

**Severity:** Informational
**Detector:** `arbitrary-send-eth`
**Location:** `FamilyWallet.sol:52` (withdraw function)

**Description:**
Slither flagged the `.call{value: amount}()` operation as potentially sending ETH to arbitrary addresses.

**Code:**
```solidity
(bool success, ) = msg.sender.call{value: amount}("");
```

**Analysis:**
- ✅ Sends only to `msg.sender` (not arbitrary)
- ✅ Balance checked before sending
- ✅ CEI pattern followed
- ✅ `nonReentrant` guard present

**Verdict:** False positive - No action required.

---

### Finding 2: Reentrancy Pattern Detected

**Severity:** Medium (flagged by tool, but mitigated)
**Detector:** `reentrancy-eth`
**Location:** `FamilyWallet.sol:45-55` (withdraw function)

**Description:**
Slither detected external call followed by state changes (or vice versa).

**Code:**
```solidity
balances[msg.sender] -= amount;  // State update
(bool success, ) = msg.sender.call{value: amount}("");  // External call
```

**Analysis:**
- ✅ Checks-Effects-Interactions pattern correctly applied
- ✅ OpenZeppelin `nonReentrant` modifier present
- ✅ Double protection (CEI + guard)

**Verdict:** False positive - ReentrancyGuard provides sufficient protection.

---

### Finding 3: [Add more findings if any]

[Continue documenting each finding...]

---

## OpenZeppelin Imports

The following findings are in inherited OpenZeppelin contracts and are **not actionable**:

- `Ownable.sol`: Low-level calls (library internals, audited)
- `ReentrancyGuard.sol`: Assembly usage (optimized implementation, audited)

These are industry-standard libraries used by thousands of projects.

---

## Recommendations

### Immediate Actions (None Required)
[List if any HIGH/MEDIUM issues need fixing]

### Future Improvements
1. ✅ **Add NatSpec comments** for all public/external functions
2. ✅ **Consider upgradeability** if contract needs future updates (Week 25+)
3. ✅ **Add event emissions** for all state changes (already doing this)

---

## Conclusion

The FamilyWallet contract demonstrates secure development practices:
- ✅ Checks-Effects-Interactions pattern applied consistently
- ✅ OpenZeppelin security libraries used (Ownable, ReentrancyGuard)
- ✅ Custom errors for gas efficiency
- ✅ Input validation on all functions

**No high-severity vulnerabilities found.** The contract is suitable for testnet deployment. Before mainnet, consider:
- Professional third-party audit
- Extended testing period
- Bug bounty program

---

## Slither Report (Raw)

[Attach full Slither JSON output]

```json
[Content of slither-report.json]
```

---

**Audit completed:** [Date]
**Signed:** [Your name]
```

---

## Expected Outputs

By the end of this class, you should have:

1. ✅ Slither installed and working
2. ✅ Security scan completed on FamilyWallet
3. ✅ Slither report (text and JSON formats)
4. ✅ Security audit document (`docs/week6-security-audit-report.md`)
5. ✅ Understanding of common vulnerabilities
6. ✅ Ability to distinguish real issues from false positives

---

## Common Issues & Solutions

### Issue 1: "slither: command not found"

**Symptoms:** PowerShell doesn't recognize `slither` command

**Solution:**
1. Restart PowerShell after pip install
2. Check Python Scripts folder is in PATH:
   ```powershell
   $env:PATH
   ```
   Should include: `C:\Users\[YourName]\AppData\Local\Programs\Python\Python312\Scripts`
3. If missing, add manually or reinstall Python with "Add to PATH" checked

---

### Issue 2: "ModuleNotFoundError: No module named 'slither'"

**Symptoms:** Import error when running Slither

**Solution:**
```powershell
pip install --upgrade slither-analyzer
```

---

### Issue 3: Solc version mismatch

**Symptoms:** "Error: Source file requires different compiler version"

**Solution:**
```powershell
solc-select use 0.8.28
```

Then re-run Slither.

---

### Issue 4: Too many false positives from dependencies

**Symptoms:** 50+ findings, mostly in OpenZeppelin files

**Solution:** Filter results to only your contracts:

```powershell
slither contracts/FamilyWallet.sol --filter-paths "node_modules|@openzeppelin"
```

This excludes OpenZeppelin library internals from the report.

---

## Self-Assessment Quiz

### Question 1: Static vs Dynamic
**Q:** What's the difference between static analysis (Slither) and dynamic analysis (Mythril)?
<details>
<summary>Click to reveal answer</summary>

**A:**
- **Static analysis** (Slither): Analyzes code without executing it. Fast (~30 seconds), pattern-based, good for common issues.
- **Dynamic analysis** (Mythril): Symbolically executes code, exploring paths. Slow (~5+ minutes), finds complex logic bugs.

**Use Slither for:** CI/CD, quick audits, development feedback.
**Use Mythril for:** Deep security audits before mainnet deployment.
</details>

---

### Question 2: Severity Levels
**Q:** What does "High severity" mean in Slither reports?
<details>
<summary>Click to reveal answer</summary>

**A:** High severity = Critical vulnerability that could lead to **loss of funds** or **complete contract compromise**. Examples:
- Unprotected ether withdrawal
- Reentrancy without guards
- Incorrect access control on fund transfers

**Action:** Fix immediately before any deployment.
</details>

---

### Question 3: Reentrancy Protection
**Q:** What are the TWO defenses against reentrancy attacks?
<details>
<summary>Click to reveal answer</summary>

**A:**
1. **Checks-Effects-Interactions** pattern: Update state BEFORE external calls
2. **ReentrancyGuard** modifier: Uses a lock to prevent re-entry

**Best practice:** Use BOTH for defense-in-depth (Week 5 approach).
</details>

---

### Question 4: False Positives
**Q:** Why does Slither flag OpenZeppelin's ReentrancyGuard internal code?
<details>
<summary>Click to reveal answer</summary>

**A:** Slither detects patterns (assembly, low-level calls) that CAN be dangerous. It doesn't "trust" any code, even audited libraries. OpenZeppelin's internals use optimized assembly for gas efficiency, which Slither flags.

**Action:** Ignore findings in `node_modules/@openzeppelin` - these are audited libraries.
</details>

---

### Question 5: CEI Pattern
**Q:** In the Checks-Effects-Interactions pattern, which comes first: external call or state update?
<details>
<summary>Click to reveal answer</summary>

**A:** **State update comes FIRST**, external call comes LAST.

**Correct order:**
1. **Checks:** Validate inputs and conditions
2. **Effects:** Update state variables
3. **Interactions:** Call external contracts

**Why:** If external call is first, attacker can re-enter before state updates.
</details>

---

### Question 6: Integer Overflow
**Q:** Can integer overflow happen in Solidity 0.8.28?
<details>
<summary>Click to reveal answer</summary>

**A:** No! Solidity 0.8.0+ has built-in overflow protection. Arithmetic operations automatically revert on overflow/underflow.

**Pre-0.8.0:** Required SafeMath library.
**Post-0.8.0:** Built-in protection (reverts automatically).
</details>

---

### Question 7: Slither Output
**Q:** What command generates a JSON report for programmatic analysis?
<details>
<summary>Click to reveal answer</summary>

**A:**
```powershell
slither contracts/FamilyWallet.sol --json slither-report.json
```

This creates a machine-readable report useful for CI/CD integration.
</details>

---

## Key Takeaways

### Most Important Concepts

1. **Static analysis is fast and practical** for continuous security checks
2. **Reentrancy is the most common vulnerability** - always use CEI + guards
3. **False positives are common** - you must analyze each finding
4. **Solidity 0.8.0+ prevents integer overflow** automatically
5. **OpenZeppelin libraries are audited** - ignore their internal findings
6. **Security is continuous** - run Slither on every contract change

### Security Checklist for Every Contract

Before deploying ANY contract:

- [ ] Run Slither and review all findings
- [ ] Verify Checks-Effects-Interactions pattern
- [ ] Confirm `nonReentrant` on functions with external calls
- [ ] Check access control on privileged functions
- [ ] Validate all inputs (zero addresses, zero amounts)
- [ ] Emit events for all state changes
- [ ] Use custom errors for gas efficiency
- [ ] Test with comprehensive test suite (Week 5)
- [ ] Consider professional audit before mainnet

---

## Reading Assignments

To deepen your security understanding, read:

### Bitcoin Book
- **Chapter 5:** Wallets
  - Section: "Wallet Technology" (key management security)
- **Chapter 13:** Security
  - Section: "Security Best Practices" (defense-in-depth)
  - Section: "Cold Storage" (protecting funds)

### Ethereum Book
- **Chapter 9:** Smart Contract Security
  - Section: "Security Best Practices" (comprehensive security guide)
  - Section: "Common Vulnerabilities" (reentrancy, overflow, access control)
  - Section: "Security Tools and Practices" (Slither, Mythril, formal verification)
- **Chapter 7:** Smart Contracts and Solidity
  - Section: "Security Considerations" (Solidity-specific risks)

**Why these chapters?**
- Bitcoin's security model teaches cold storage and key management
- Ethereum Chapter 9 is the **definitive guide** to smart contract security
- Understanding vulnerabilities at the language level (Chapter 7) prevents them

---

## Complementary Tools (Optional)

While we focus on Slither, here are other tools to explore later:

| Tool | Purpose | Speed | Best For |
|------|---------|-------|----------|
| **Slither** | Static analysis | Fast (30s) | CI/CD, development |
| **Mythril** | Symbolic execution | Slow (5+ min) | Deep audits |
| **Manticore** | Dynamic analysis | Very slow | Complex bugs |
| **Echidna** | Fuzzing | Medium | Property testing |
| **Certora** | Formal verification | Slow | Critical contracts |

**For this course:** Slither is sufficient. Week 27 covers mutation testing (another testing dimension).

---

## Next Steps

**Class 6.3: Next.js + MetaMask Setup** (~4-5 hours)
- Create Next.js 15 project with TypeScript
- Configure Tailwind CSS
- Install MetaMask browser extension
- Connect wallet from React UI
- Display wallet address and balance

**Prerequisites for Next Class:**
- ✅ Security audit report complete
- ✅ FamilyWallet confirmed secure
- ✅ Browser with MetaMask extension (install in Class 6.3)

---

**Class 6.2 Complete!** You can now run automated security audits and understand vulnerability reports.

**Next:** Time to build a frontend! Let's create a React UI that connects to MetaMask and interacts with your FamilyWallet contract.
