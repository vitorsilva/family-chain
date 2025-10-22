# Mutation Testing for Solidity - Learning Objectives
## Week 27, Class 27.1 (Extended)

---

## 🎯 Overview

**Duration:** 2-3 hours (within Week 27, Class 27.1)
**Prerequisites:**
- Completed Weeks 1-26 (all smart contracts deployed)
- Existing test suites for FamilyWallet, FamilyAllowance, Multi-sig, DAO, Token, Loan contracts
- Understanding of unit testing concepts
- Hardhat testing experience

**Why Mutation Testing Matters:**
After writing hundreds of tests, you need to answer: "Are my tests actually catching bugs, or just passing because they're checking the wrong things?" Mutation testing validates your test quality by intentionally breaking your code and checking if your tests catch it.

---

## 📚 Learning Objectives

By the end of this section, you will be able to:

1. **Explain** what mutation testing is and why it's critical for smart contract security
2. **Identify** the difference between code coverage and mutation score
3. **Install and configure** mutation testing tools for Solidity (Gambit or vertigo-rs)
4. **Run** mutation tests on existing smart contracts
5. **Interpret** mutation test reports and identify surviving mutants
6. **Improve** test suites based on mutation testing results
7. **Evaluate** the cost/benefit tradeoff of mutation testing in your development workflow

---

## 📖 Key Concepts

### 1. What is Mutation Testing?

**The Problem:**
```solidity
// Your contract
function transfer(address to, uint256 amount) public {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    balances[msg.sender] -= amount;
    balances[to] += amount;
}

// Your test (BAD TEST - but has 100% coverage!)
function testTransfer() public {
    familyWallet.transfer(alice, 100);
    // Oops - forgot to check balances changed!
}
```

You have 100% code coverage, but your test doesn't actually verify anything useful.

**The Solution:**
Mutation testing introduces small bugs (mutations) into your code:

```solidity
// Mutation 1: Change >= to >
require(balances[msg.sender] > amount, "Insufficient balance");

// Mutation 2: Change -= to +=
balances[msg.sender] += amount;

// Mutation 3: Remove line
// balances[to] += amount;
```

If your tests still pass with these mutations, they're not testing properly!

### 2. Common Mutation Operators for Solidity

| Mutation Type | Example | What It Tests |
|--------------|---------|---------------|
| **Arithmetic Operator Replacement** | `+` → `-`, `*` → `/` | Calculation correctness |
| **Relational Operator Replacement** | `>=` → `>`, `==` → `!=` | Boundary conditions |
| **Logical Operator Replacement** | `&&` → `\|\|`, `!` → remove | Logic flow |
| **Assignment Operator Replacement** | `+=` → `-=`, `=` → remove | State changes |
| **Require/Assert Deletion** | Remove `require()` statements | Guard validations |
| **Literal Replacement** | `100` → `101`, `0` → `1` | Magic numbers |
| **Function Call Deletion** | Remove function calls | Side effects |
| **Unary Operator Insertion** | `x` → `-x`, `x` → `!x` | Sign and boolean logic |

### 3. Key Metrics

**Mutation Score = (Killed Mutants / Total Mutants) × 100**

- **Killed Mutant:** Test fails when mutation is introduced (GOOD - your test caught the bug!)
- **Survived Mutant:** Test passes despite mutation (BAD - your test missed the bug!)
- **Equivalent Mutant:** Mutation doesn't change behavior (ignore these)

**Target Mutation Score:** 80-95% for critical smart contracts

### 4. Code Coverage vs Mutation Score

```
Code Coverage: "Did my tests execute this line?"
Mutation Score: "Did my tests verify this line works correctly?"
```

You can have 100% code coverage with 20% mutation score!

---

## 🛠️ Tools

### Primary Tool: Gambit (Recommended)

**Why Gambit:**
- Maintained by Certora (security auditing company)
- Supports latest Solidity versions
- Good documentation
- Active development

**Installation:**
```powershell
# Install Gambit
cargo install --git https://github.com/Certora/gambit

# Verify installation
gambit --version
```

### Alternative: vertigo-rs

**Why vertigo-rs:**
- Rust-based (fast performance)
- Good for large codebases
- Simpler configuration

**Installation:**
```powershell
cargo install vertigo
```

---

## 🎓 Hands-On Learning Activities

### Activity 1: Understanding Mutations (30 mins)

**Step 1:** Create a deliberately weak test

Create `test/MutationExample.test.ts`:
```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Weak Test Example", function () {
  it("should allow transfer (WEAK TEST)", async function () {
    const [owner, alice] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("FamilyToken");
    const token = await Token.deploy();

    // This test only checks it doesn't revert
    // It doesn't verify balances changed!
    await token.transfer(alice.address, 100);
    // MISSING: balance assertions
  });
});
```

**Step 2:** Run regular tests
```powershell
npx hardhat test test/MutationExample.test.ts
```
Result: ✅ Test passes (100% coverage but useless!)

**Step 3:** Manually mutate the contract
Edit `FamilyToken.sol` and comment out the balance update:
```solidity
function transfer(address to, uint256 amount) public returns (bool) {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    // balances[msg.sender] -= amount;  // MUTATION: commented out
    // balances[to] += amount;           // MUTATION: commented out
    return true;
}
```

**Step 4:** Run tests again
```powershell
npx hardhat test test/MutationExample.test.ts
```
Result: ✅ Test still passes (proves test is weak!)

**Step 5:** Fix the test
```typescript
it("should allow transfer (STRONG TEST)", async function () {
  const [owner, alice] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("FamilyToken");
  const token = await Token.deploy();

  const ownerInitial = await token.balanceOf(owner.address);
  const aliceInitial = await token.balanceOf(alice.address);

  await token.transfer(alice.address, 100);

  // NOW we verify state changes
  expect(await token.balanceOf(owner.address)).to.equal(ownerInitial - 100n);
  expect(await token.balanceOf(alice.address)).to.equal(aliceInitial + 100n);
});
```

**Step 6:** Revert mutation and test again
Result: ✅ Test passes with correct code, ❌ fails with mutation

**Key Takeaway:** You just manually did what mutation testing automates!

---

### Activity 2: Run Gambit on FamilyAllowance (60 mins)

**Step 1:** Generate mutants for FamilyAllowance contract

```powershell
# Navigate to contracts directory
cd contracts

# Generate mutants (creates mutants in .gambit_out/)
gambit mutate --filename FamilyAllowance.sol --json gambit_results.json
```

**Step 2:** Review generated mutants

```powershell
# View mutants summary
gambit summary --json gambit_results.json
```

Example output:
```
Generated 45 mutants:
- 12 arithmetic operator replacements
- 8 relational operator replacements
- 15 require statement deletions
- 10 assignment operator replacements
```

**Step 3:** Inspect specific mutants

Open `.gambit_out/1_FamilyAllowance.sol` to see first mutation:
```solidity
// Original
require(amount > 0, "Amount must be positive");

// Mutant 1
require(amount >= 0, "Amount must be positive");
// ^ Changed > to >=
```

**Step 4:** Run tests against each mutant

```powershell
# Run your test suite against all mutants
# This tests each mutation one at a time
npx hardhat test --mutant 1
npx hardhat test --mutant 2
# ... (Gambit can automate this)
```

**Step 5:** Analyze results

Create `scripts/analyze-mutations.ts`:
```typescript
import * as fs from 'fs';

const results = JSON.parse(fs.readFileSync('gambit_results.json', 'utf-8'));

let killed = 0;
let survived = 0;

results.mutants.forEach((mutant: any) => {
  if (mutant.status === 'killed') {
    killed++;
  } else if (mutant.status === 'survived') {
    survived++;
    console.log(`⚠️  SURVIVED: ${mutant.description}`);
    console.log(`   Location: ${mutant.line}`);
    console.log(`   Original: ${mutant.original}`);
    console.log(`   Mutated:  ${mutant.mutated}\n`);
  }
});

const score = (killed / (killed + survived)) * 100;
console.log(`\n📊 Mutation Score: ${score.toFixed(1)}%`);
console.log(`✅ Killed: ${killed}`);
console.log(`❌ Survived: ${survived}`);
```

**Step 6:** Fix tests to kill surviving mutants

Example surviving mutant:
```
⚠️  SURVIVED: Changed >= to >
   Location: FamilyAllowance.sol:45
   Original: require(balance >= amount, "Insufficient balance");
   Mutated:  require(balance > amount, "Insufficient balance");
```

Add test to kill this mutant:
```typescript
it("should allow withdrawal of exact balance", async function () {
  // This test specifically checks the boundary condition
  await allowance.setBalance(child.address, 100);

  // Should succeed with EXACTLY the balance (tests >=, not >)
  await expect(allowance.connect(child).withdraw(100))
    .to.not.be.reverted;

  expect(await allowance.balanceOf(child.address)).to.equal(0);
});
```

---

### Activity 3: Full Project Mutation Analysis (90 mins)

**Step 1:** Run mutation testing on all critical contracts

```powershell
# Create mutation test script
New-Item -Path "scripts/mutation-test-all.ps1" -ItemType File
```

```powershell
# scripts/mutation-test-all.ps1
$contracts = @(
    "FamilyWallet",
    "FamilyAllowance",
    "FamilySavingsPot",
    "FamilyToken",
    "FamilyLoan"
)

foreach ($contract in $contracts) {
    Write-Host "`n🧬 Mutating $contract..." -ForegroundColor Cyan
    gambit mutate --filename "contracts/$contract.sol" --json "results/$contract-mutations.json"

    Write-Host "🧪 Running tests against mutants..." -ForegroundColor Yellow
    # Run tests and capture results
    npx hardhat test "test/$contract.test.ts" --mutants "results/$contract-mutations.json"
}

Write-Host "`n📊 Generating final report..." -ForegroundColor Green
node scripts/mutation-report.js
```

**Step 2:** Create consolidated report

```typescript
// scripts/mutation-report.ts
import * as fs from 'fs';
import * as path from 'path';

interface MutationResult {
  contract: string;
  totalMutants: number;
  killed: number;
  survived: number;
  score: number;
}

const resultsDir = './results';
const results: MutationResult[] = [];

// Read all mutation result files
fs.readdirSync(resultsDir)
  .filter(file => file.endsWith('-mutations.json'))
  .forEach(file => {
    const data = JSON.parse(
      fs.readFileSync(path.join(resultsDir, file), 'utf-8')
    );

    const killed = data.mutants.filter((m: any) => m.status === 'killed').length;
    const survived = data.mutants.filter((m: any) => m.status === 'survived').length;
    const total = killed + survived;

    results.push({
      contract: file.replace('-mutations.json', ''),
      totalMutants: total,
      killed,
      survived,
      score: total > 0 ? (killed / total) * 100 : 0
    });
  });

// Sort by score (lowest first - needs most work)
results.sort((a, b) => a.score - b.score);

console.log('\n📊 MUTATION TESTING REPORT\n');
console.log('Contract                  Score    Killed  Survived  Total');
console.log('─'.repeat(65));

results.forEach(r => {
  const scoreColor = r.score >= 80 ? '✅' : r.score >= 60 ? '⚠️ ' : '❌';
  console.log(
    `${r.contract.padEnd(24)} ${scoreColor} ${r.score.toFixed(1).padStart(5)}%  ` +
    `${r.killed.toString().padStart(6)}  ${r.survived.toString().padStart(8)}  ${r.totalMutants.toString().padStart(5)}`
  );
});

const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
console.log('─'.repeat(65));
console.log(`Average Mutation Score: ${avgScore.toFixed(1)}%`);

if (avgScore >= 80) {
  console.log('\n🎉 Excellent test quality! Your tests are catching most bugs.');
} else if (avgScore >= 60) {
  console.log('\n⚠️  Good start, but improve tests for contracts below 80%.');
} else {
  console.log('\n❌ Test quality needs improvement. Focus on surviving mutants.');
}
```

**Step 3:** Run the full analysis

```powershell
.\scripts\mutation-test-all.ps1
```

Expected output:
```
📊 MUTATION TESTING REPORT

Contract                  Score    Killed  Survived  Total
─────────────────────────────────────────────────────────────────
FamilyLoan               ❌ 45.2%      19        23       42
FamilyAllowance          ⚠️  67.8%      40        19       59
FamilyWallet             ⚠️  72.5%      29        11       40
FamilyToken              ✅ 85.3%      52         9       61
FamilySavingsPot         ✅ 91.2%      31         3       34
─────────────────────────────────────────────────────────────────
Average Mutation Score: 72.4%

⚠️  Good start, but improve tests for contracts below 80%.
```

---

### Activity 4: Improve FamilyLoan Tests (60 mins)

Based on the report above, `FamilyLoan` needs the most work (45.2% score).

**Step 1:** Identify surviving mutants

```powershell
# View detailed mutants for FamilyLoan
gambit summary --json results/FamilyLoan-mutations.json --survived-only
```

Output:
```
Surviving Mutants:

1. Line 78: Changed >= to >
   require(repaymentAmount >= installment);

2. Line 92: Removed line
   loan.totalRepaid += amount;

3. Line 105: Changed && to ||
   if (isPaid && !isOverdue) {

... (20 more)
```

**Step 2:** Write tests to kill each surviving mutant

```typescript
describe("FamilyLoan - Mutation Test Improvements", function () {

  // Kills mutant #1 (>= to >)
  it("should allow repayment of exact installment amount", async function () {
    await loan.borrow(1000);
    const installment = await loan.getInstallmentAmount();

    // Exact amount should work (tests >=, not >)
    await expect(loan.repay(installment)).to.not.be.reverted;
  });

  // Kills mutant #2 (removed totalRepaid += amount)
  it("should track total repaid amount correctly", async function () {
    await loan.borrow(1000);

    const initialRepaid = await loan.totalRepaid();
    await loan.repay(100);
    const afterRepaid = await loan.totalRepaid();

    // Verify totalRepaid actually increased
    expect(afterRepaid).to.equal(initialRepaid + 100n);
  });

  // Kills mutant #3 (&& to ||)
  it("should only apply bonus when BOTH paid and not overdue", async function () {
    await loan.borrow(1000);

    // Case 1: Paid but overdue - no bonus
    await time.increase(365 * 24 * 60 * 60); // 1 year
    await loan.repay(1000);
    expect(await loan.hasBonus()).to.be.false;

    // Case 2: Not paid but not overdue - no bonus
    await loan.borrow(1000);
    expect(await loan.hasBonus()).to.be.false;

    // Case 3: Paid and not overdue - YES bonus
    await loan.borrow(1000);
    await loan.repay(1000);
    expect(await loan.hasBonus()).to.be.true;
  });
});
```

**Step 3:** Run mutation tests again

```powershell
gambit mutate --filename contracts/FamilyLoan.sol --json results/FamilyLoan-mutations.json
npx hardhat test test/FamilyLoan.test.ts
```

New score: 78.6% (improved from 45.2%!)

**Step 4:** Repeat for remaining mutants until score > 80%

---

## 📊 Interpreting Results

### Good Mutation Score (80-95%)
```
✅ Your tests are high quality
✅ Tests verify state changes, not just execution
✅ Boundary conditions are tested
✅ Edge cases are covered
```

### Low Mutation Score (<60%)
```
❌ Tests may just check "doesn't revert"
❌ Missing assertions on state changes
❌ Boundary conditions not tested
❌ Logic branches not fully verified
```

### Common Surviving Mutant Patterns

| Pattern | Likely Issue | Fix |
|---------|--------------|-----|
| Boundary operators survive (`>=` → `>`) | Missing boundary tests | Add tests with exact values |
| Assignment mutations survive (`+=` → `-=`) | Not checking state changes | Add balance/state assertions |
| Require deletions survive | Not testing require statements | Add tests expecting reverts |
| Logical operators survive (`&&` → `\|\|`) | Not testing all combinations | Add tests for each boolean case |

---

## 🎯 Deliverables

By completing this section, you should have:

1. ✅ **Mutation testing tool installed** (Gambit or vertigo-rs)
2. ✅ **Mutation reports for all contracts** (JSON files in `results/`)
3. ✅ **Consolidated mutation score report** (average score across all contracts)
4. ✅ **Improved test suites** (target: >80% mutation score for critical contracts)
5. ✅ **Documentation** of mutation testing process in `docs/testing-strategy.md`

### Success Criteria

**Minimum (Pass):**
- [ ] Ran mutation testing on at least 3 contracts
- [ ] Generated mutation reports
- [ ] Identified surviving mutants
- [ ] Average mutation score: >60%

**Target (Good):**
- [ ] Ran mutation testing on all critical contracts
- [ ] Improved tests to kill most surviving mutants
- [ ] Average mutation score: >75%
- [ ] Documented process

**Stretch (Excellent):**
- [ ] Average mutation score: >85%
- [ ] Automated mutation testing in CI/CD (Week 29)
- [ ] Created mutation testing guidelines for future contracts
- [ ] Zero surviving mutants in FamilyWallet and FamilySavingsPot (most critical)

---

## ⏱️ Time Management

Within Week 27, Class 27.1 (3-4 hours total):

```
Hour 1: Introduction & Manual Mutations
  - 00:00-00:15: Concept explanation
  - 00:15-00:45: Activity 1 (manual mutations)
  - 00:45-01:00: Q&A and break

Hour 2: Tool Setup & First Run
  - 01:00-01:15: Install Gambit
  - 01:15-02:00: Activity 2 (FamilyAllowance mutations)

Hour 3: Full Analysis
  - 02:00-03:00: Activity 3 (all contracts)

Hour 4: Improvements
  - 03:00-04:00: Activity 4 (improve weak tests)
```

**Note:** Mutation testing is computationally expensive. Initial runs may take 10-30 minutes depending on contract size and test suite.

---

## 🔗 Integration with Rest of Course

### Week 26 (Security & Auditing)
- Mention mutation testing as a security validation tool
- "Next week, you'll learn how to test your tests"

### Week 27 (This Section)
- Deep dive into mutation testing
- Practical application to all contracts

### Week 29 (DevOps)
- Optional: Add mutation testing to CI/CD pipeline
- Run on every PR, require minimum mutation score

### Post-Course
- Include mutation scores in portfolio documentation
- Demonstrates testing rigor to employers

---

## 💡 Teaching Tips (for Claude Code)

When helping with this section:

1. **Start with the "why"** - Show weak test example first
2. **Manual before automated** - Activity 1 builds intuition
3. **One contract at a time** - Don't overwhelm with all contracts
4. **Celebrate improvements** - "You improved from 45% to 78%!"
5. **Acknowledge slowness** - "This will take 15 mins to run, grab coffee"
6. **Focus on patterns** - Teach how to recognize common surviving mutants
7. **Practical tradeoffs** - Not every project needs 95% mutation score

---

## 🚨 Common Pitfalls

### Pitfall 1: Chasing 100% Score
**Problem:** Trying to kill every mutant, including equivalent ones
**Solution:** 80-90% is excellent. Some mutants are equivalent or not worth testing.

### Pitfall 2: Slow Test Suites
**Problem:** Mutation testing multiplies test runtime by number of mutants
**Solution:** Run mutation tests weekly, not on every commit. Optimize test suite.

### Pitfall 3: Testing Implementation, Not Behavior
**Problem:** Writing tests that just verify mutation was applied
**Solution:** Focus on testing contract behavior from user perspective.

### Pitfall 4: Ignoring Equivalent Mutants
**Problem:** Wasting time trying to kill mutants that don't change behavior
**Solution:** Learn to identify equivalent mutants and mark them as such.

---

## 📚 Additional Reading

- [Mutation Testing Overview](https://en.wikipedia.org/wiki/Mutation_testing)
- [Gambit Documentation](https://github.com/Certora/gambit)
- [Certora: Mutation Testing for Solidity](https://www.certora.com/)
- [PITest: Mutation Testing in Java](https://pitest.org/) (different language, same concepts)
- [Research: Evaluating Test Quality](https://arxiv.org/abs/2102.12206)

---

## ✅ Self-Assessment Quiz

After completing this section, you should be able to answer:

1. What's the difference between code coverage and mutation score?
2. What does a "surviving mutant" indicate?
3. Name three common mutation operators for Solidity.
4. Why might a test have 100% coverage but catch zero bugs?
5. What's a reasonable mutation score target for critical financial contracts?
6. How would you prioritize which surviving mutants to address first?

**Answers in next message if needed!**

---

## 🎓 Course Integration Summary

**Add to Week 27, Class 27.1:**

```markdown
- **Class 27.1:** Unit Testing Across Languages (Extended to 4 hours)
  - JavaScript/TypeScript testing (Jest, Mocha)
  - Go testing patterns
  - Python testing (pytest)
  - Smart contract testing (Hardhat)
  - **NEW: Mutation Testing for Solidity**
    - Understanding test quality vs coverage
    - Installing mutation testing tools (Gambit)
    - Running mutation tests on existing contracts
    - Interpreting mutation reports and scores
    - Improving tests to kill surviving mutants
    - Integration into development workflow

**Deliverable:** Mutation test reports for all contracts with >80% average score
```

**Optional mention in Week 26, Class 26.4:**
```markdown
- Security Audit Tools & Practices
  - Smart contract audit tools (Slither, Mythril)
  - Manual code review checklist
  - **Brief intro:** Mutation testing (validates test quality - details in Week 27)
  - Penetration testing basics
```

---

Ready to add this to your course! Would you like me to also create a template for the mutation testing report or help integrate this into the COURSE_PLAN.md file?
