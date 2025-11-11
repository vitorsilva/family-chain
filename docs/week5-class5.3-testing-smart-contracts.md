# Week 5 - Class 5.3: Testing Smart Contracts

**Duration:** 3-4 hours
**Prerequisites:** Class 5.1-5.2 completed, FamilyWallet contract written, understanding of Mocha/Chai basics
**Why It Matters:** Untested smart contracts are dangerous - once deployed, they're immutable. Comprehensive testing catches bugs before they cost real money. This class teaches you to write production-quality tests.

---

## 📋 Learning Objectives

By the end of this class, you will be able to:

1. Write comprehensive tests using Hardhat 3 + Mocha + Chai
2. Use TypeScript for type-safe smart contract tests
3. Test contract deployment and initialization
4. Test access control and permissions
5. Simulate attacks (reentrancy, unauthorized access)
6. Use fixtures for efficient test setup
7. Test events and event parameters
8. Achieve >80% code coverage
9. Debug failing tests effectively

---

## 🎯 Key Concepts

### 1. Test-Driven Development (TDD) for Smart Contracts

**Why TDD matters for blockchain:**
- Smart contracts are **immutable** after deployment
- Bugs can cost millions (see DAO hack, Parity wallet freeze)
- Gas costs make fixes expensive
- No rollbacks - every transaction is permanent

**TDD Cycle:**
```
1. Write failing test → 2. Write minimal code → 3. Test passes → 4. Refactor → Repeat
```

**Testing Pyramid for Smart Contracts:**
```
           ┌───────────────┐
           │  E2E Tests    │ (Frontend + Contract + Chain)
           └───────────────┘
        ┌─────────────────────┐
        │  Integration Tests  │ (Multiple Contracts)
        └─────────────────────┘
    ┌───────────────────────────────┐
    │      Unit Tests               │ (Individual Functions)
    └───────────────────────────────┘
```

**Focus for Week 5:** Unit tests with some integration (contract interactions)

### 2. Hardhat 3 Testing Stack

**Components:**

| Tool | Purpose | File Type |
|------|---------|-----------|
| **Hardhat** | Testing framework & local blockchain | .ts config |
| **Mocha** | Test runner (`describe`, `it`) | .test.ts |
| **Chai** | Assertion library (`expect`, `assert`) | .test.ts |
| **ethers.js v6** | Contract interaction | .test.ts |
| **TypeChain** | TypeScript contract types | Generated |

**Hardhat 3 Requirements:**
- ⚠️ Test files **must** be TypeScript (`.test.ts` or `.spec.ts`)
- JavaScript test files no longer supported
- Import from `hardhat` (not `@nomicfoundation/hardhat-toolbox`)

### 3. Test File Structure

**Standard structure:**

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import type { FamilyWallet } from "../typechain-types";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FamilyWallet", function () {
  // Test fixture - runs once, reused for efficiency
  async function deployFixture() {
    const [owner, alice, bob, carol] = await ethers.getSigners();
    const FamilyWallet = await ethers.getContractFactory("FamilyWallet");
    const wallet = await FamilyWallet.deploy(owner.address);
    return { wallet, owner, alice, bob, carol };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { wallet, owner } = await loadFixture(deployFixture);
      expect(await wallet.owner()).to.equal(owner.address);
    });
  });

  describe("Member Management", function () {
    // More tests here
  });
});
```

### 4. Chai Matchers for Ethereum

Hardhat extends Chai with blockchain-specific matchers:

```typescript
// Address equality
expect(await wallet.owner()).to.equal(owner.address);

// Balance changes
await expect(wallet.deposit({ value: ethers.parseEther("1.0") }))
  .to.changeEtherBalance(alice, ethers.parseEther("-1.0"));

// Event emission
await expect(wallet.deposit({ value: 100 }))
  .to.emit(wallet, "Deposited")
  .withArgs(alice.address, 100, 100, anyValue);

// Revert with specific message
await expect(wallet.connect(bob).addMember(carol.address))
  .to.be.revertedWith("Not authorized");

// Revert with custom error
await expect(wallet.withdraw(1000))
  .to.be.revertedWithCustomError(wallet, "InsufficientBalance");
```

### 5. Fixtures for Efficient Testing

**Without fixture (slow):**
```typescript
beforeEach(async function () {
  // Deploys contract before EVERY test (expensive!)
  [owner, alice] = await ethers.getSigners();
  const FamilyWallet = await ethers.getContractFactory("FamilyWallet");
  wallet = await FamilyWallet.deploy(owner.address);
});
```

**With fixture (fast):**
```typescript
async function deployFixture() {
  // Deploys once, Hardhat snapshots state
  [owner, alice] = await ethers.getSigners();
  const FamilyWallet = await ethers.getContractFactory("FamilyWallet");
  const wallet = await FamilyWallet.deploy(owner.address);
  return { wallet, owner, alice };
}

it("Test 1", async function () {
  const { wallet, owner, alice } = await loadFixture(deployFixture);
  // Each test gets fresh snapshot - no interference
});
```

**Benefits:**
- 10-100x faster test execution
- Tests run in parallel safely
- No test interference (each gets clean state)

### 6. Testing Events

**Events are critical for:**
- Frontend notifications
- Database synchronization (Week 4 integration)
- Audit trails
- Transaction receipts

**Testing event emission:**

```typescript
// Test that event is emitted
await expect(wallet.deposit({ value: 100 }))
  .to.emit(wallet, "Deposited");

// Test event parameters (exact match)
await expect(wallet.deposit({ value: 100 }))
  .to.emit(wallet, "Deposited")
  .withArgs(alice.address, 100, 100, anyValue); // anyValue for timestamp

// Test multiple events
await expect(wallet.transfer(bob.address, 50))
  .to.emit(wallet, "Withdrawn")
  .and.to.emit(wallet, "Deposited");

// Access event args from receipt
const tx = await wallet.deposit({ value: 100 });
const receipt = await tx.wait();
const event = receipt.logs[0]; // First event
// Parse event data...
```

### 7. Testing Access Control

**Critical test cases:**
- ✅ Owner can perform admin actions
- ✅ Non-owner cannot perform admin actions
- ✅ Proper error messages on unauthorized access
- ✅ Owner transfer works correctly

```typescript
describe("Access Control", function () {
  it("Owner can add members", async function () {
    const { wallet, owner, alice } = await loadFixture(deployFixture);
    await expect(wallet.connect(owner).addMember(alice.address))
      .to.not.be.reverted;
  });

  it("Non-owner cannot add members", async function () {
    const { wallet, alice, bob } = await loadFixture(deployFixture);
    await expect(wallet.connect(alice).addMember(bob.address))
      .to.be.revertedWithCustomError(wallet, "OwnableUnauthorizedAccount");
  });
});
```

### 8. Testing Edge Cases

**Common edge cases to test:**

```typescript
// Zero values
await expect(wallet.withdraw(0))
  .to.be.revertedWithCustomError(wallet, "ZeroAmount");

// Zero address
await expect(wallet.addMember(ethers.ZeroAddress))
  .to.be.revertedWithCustomError(wallet, "ZeroAddress");

// Insufficient balance
await expect(wallet.withdraw(ethers.parseEther("100")))
  .to.be.revertedWithCustomError(wallet, "InsufficientBalance");

// Duplicate operations
await wallet.addMember(alice.address);
await expect(wallet.addMember(alice.address))
  .to.be.revertedWithCustomError(wallet, "AlreadyAMember");

// Overflow/underflow (Solidity 0.8+ has built-in checks)
const max = ethers.MaxUint256;
// Test arithmetic operations near limits
```

---

## 🛠️ Hands-On Activities

### Activity 1: Set Up Test Environment (15 minutes)

**Objective:** Create test file structure and verify Hardhat 3 testing works.

**Step 1:** Create test directory and file

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain

# Create test file
New-Item -Path "test\FamilyWallet.test.ts" -ItemType File -Force
```

**Step 2:** Write basic test structure

Open `test/FamilyWallet.test.ts`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import type { FamilyWallet } from "../typechain-types";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FamilyWallet", function () {
  // Deployment fixture
  async function deployFamilyWalletFixture() {
    // Get test accounts (Hardhat provides 20 accounts with 10,000 ETH each)
    const [owner, alice, bob, carol]: SignerWithAddress[] = await ethers.getSigners();

    // Deploy contract
    const FamilyWallet = await ethers.getContractFactory("FamilyWallet");
    const wallet: FamilyWallet = await FamilyWallet.deploy(owner.address);

    return { wallet, owner, alice, bob, carol };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { wallet, owner } = await loadFixture(deployFamilyWalletFixture);
      expect(await wallet.owner()).to.equal(owner.address);
    });

    it("Should start with zero members", async function () {
      const { wallet } = await loadFixture(deployFamilyWalletFixture);
      expect(await wallet.getMemberCount()).to.equal(0);
    });

    it("Should start with zero balance", async function () {
      const { wallet } = await loadFixture(deployFamilyWalletFixture);
      expect(await wallet.getTotalBalance()).to.equal(0);
    });
  });
});
```

**Step 3:** Run tests

```powershell
npx hardhat test
```

**Expected Output:**
```
  FamilyWallet
    Deployment
      ✔ Should set the right owner (XXXms)
      ✔ Should start with zero members (XXms)
      ✔ Should start with zero balance (XXms)

  3 passing (Xs)
```

### Activity 2: Test Member Management (30 minutes)

**Objective:** Test add/remove member functionality and access control.

Add these tests to `test/FamilyWallet.test.ts`:

```typescript
  describe("Member Management", function () {
    describe("Adding Members", function () {
      it("Owner can add a member", async function () {
        const { wallet, owner, alice } = await loadFixture(deployFamilyWalletFixture);

        await expect(wallet.connect(owner).addMember(alice.address))
          .to.emit(wallet, "MemberAdded")
          .withArgs(alice.address, anyValue); // anyValue for timestamp

        expect(await wallet.isMember(alice.address)).to.be.true;
        expect(await wallet.getMemberCount()).to.equal(1);
      });

      it("Non-owner cannot add members", async function () {
        const { wallet, alice, bob } = await loadFixture(deployFamilyWalletFixture);

        await expect(wallet.connect(alice).addMember(bob.address))
          .to.be.revertedWithCustomError(wallet, "OwnableUnauthorizedAccount")
          .withArgs(alice.address);
      });

      it("Cannot add zero address", async function () {
        const { wallet, owner } = await loadFixture(deployFamilyWalletFixture);

        await expect(wallet.connect(owner).addMember(ethers.ZeroAddress))
          .to.be.revertedWithCustomError(wallet, "ZeroAddress");
      });

      it("Cannot add owner as member", async function () {
        const { wallet, owner } = await loadFixture(deployFamilyWalletFixture);

        await expect(wallet.connect(owner).addMember(owner.address))
          .to.be.revertedWithCustomError(wallet, "CannotRemoveOwner");
      });

      it("Cannot add duplicate member", async function () {
        const { wallet, owner, alice } = await loadFixture(deployFamilyWalletFixture);

        await wallet.connect(owner).addMember(alice.address);

        await expect(wallet.connect(owner).addMember(alice.address))
          .to.be.revertedWithCustomError(wallet, "AlreadyAMember");
      });

      it("Can add multiple members", async function () {
        const { wallet, owner, alice, bob, carol } = await loadFixture(deployFamilyWalletFixture);

        await wallet.connect(owner).addMember(alice.address);
        await wallet.connect(owner).addMember(bob.address);
        await wallet.connect(owner).addMember(carol.address);

        expect(await wallet.getMemberCount()).to.equal(3);

        const members = await wallet.getMembers();
        expect(members).to.have.lengthOf(3);
        expect(members).to.include(alice.address);
        expect(members).to.include(bob.address);
        expect(members).to.include(carol.address);
      });
    });

    describe("Removing Members", function () {
      it("Owner can remove a member", async function () {
        const { wallet, owner, alice } = await loadFixture(deployFamilyWalletFixture);

        await wallet.connect(owner).addMember(alice.address);
        expect(await wallet.isMember(alice.address)).to.be.true;

        await expect(wallet.connect(owner).removeMember(alice.address))
          .to.emit(wallet, "MemberRemoved")
          .withArgs(alice.address, anyValue);

        expect(await wallet.isMember(alice.address)).to.be.false;
        expect(await wallet.getMemberCount()).to.equal(0);
      });

      it("Non-owner cannot remove members", async function () {
        const { wallet, owner, alice, bob } = await loadFixture(deployFamilyWalletFixture);

        await wallet.connect(owner).addMember(alice.address);

        await expect(wallet.connect(bob).removeMember(alice.address))
          .to.be.revertedWithCustomError(wallet, "OwnableUnauthorizedAccount");
      });

      it("Cannot remove non-member", async function () {
        const { wallet, owner, alice } = await loadFixture(deployFamilyWalletFixture);

        await expect(wallet.connect(owner).removeMember(alice.address))
          .to.be.revertedWithCustomError(wallet, "NotAMember");
      });

      it("Cannot remove owner", async function () {
        const { wallet, owner } = await loadFixture(deployFamilyWalletFixture);

        await expect(wallet.connect(owner).removeMember(owner.address))
          .to.be.revertedWithCustomError(wallet, "CannotRemoveOwner");
      });

      it("Member's balance remains after removal", async function () {
        const { wallet, owner, alice } = await loadFixture(deployFamilyWalletFixture);

        await wallet.connect(owner).addMember(alice.address);
        await wallet.connect(alice).deposit({ value: ethers.parseEther("1.0") });

        const balanceBefore = await wallet.getBalance(alice.address);
        await wallet.connect(owner).removeMember(alice.address);
        const balanceAfter = await wallet.getBalance(alice.address);

        expect(balanceAfter).to.equal(balanceBefore);
      });
    });
  });
```

**Import helper at the top:**
```typescript
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
```

**Run tests:**

```powershell
npx hardhat test
```

**Expected Output:**
```
  FamilyWallet
    Deployment
      ✔ Should set the right owner
      ✔ Should start with zero members
      ✔ Should start with zero balance
    Member Management
      Adding Members
        ✔ Owner can add a member
        ✔ Non-owner cannot add members
        ✔ Cannot add zero address
        ✔ Cannot add owner as member
        ✔ Cannot add duplicate member
        ✔ Can add multiple members
      Removing Members
        ✔ Owner can remove a member
        ✔ Non-owner cannot remove members
        ✔ Cannot remove non-member
        ✔ Cannot remove owner
        ✔ Member's balance remains after removal

  14 passing (Xs)
```

### Activity 3: Test Deposit Functionality (25 minutes)

**Objective:** Test Ether deposit functionality and balance tracking.

Add these tests:

```typescript
  describe("Deposits", function () {
    it("Member can deposit Ether", async function () {
      const { wallet, owner, alice } = await loadFixture(deployFamilyWalletFixture);

      await wallet.connect(owner).addMember(alice.address);

      const depositAmount = ethers.parseEther("1.0");

      await expect(wallet.connect(alice).deposit({ value: depositAmount }))
        .to.emit(wallet, "Deposited")
        .withArgs(alice.address, depositAmount, depositAmount, anyValue);

      expect(await wallet.getBalance(alice.address)).to.equal(depositAmount);
      expect(await wallet.getTotalBalance()).to.equal(depositAmount);
    });

    it("Owner can deposit Ether", async function () {
      const { wallet, owner } = await loadFixture(deployFamilyWalletFixture);

      const depositAmount = ethers.parseEther("2.0");

      await expect(wallet.connect(owner).deposit({ value: depositAmount }))
        .to.emit(wallet, "Deposited")
        .withArgs(owner.address, depositAmount, depositAmount, anyValue);

      expect(await wallet.getBalance(owner.address)).to.equal(depositAmount);
    });

    it("Non-member cannot deposit", async function () {
      const { wallet, alice } = await loadFixture(deployFamilyWalletFixture);

      await expect(wallet.connect(alice).deposit({ value: ethers.parseEther("1.0") }))
        .to.be.revertedWithCustomError(wallet, "NotAMember");
    });

    it("Cannot deposit zero Ether", async function () {
      const { wallet, owner, alice } = await loadFixture(deployFamilyWalletFixture);

      await wallet.connect(owner).addMember(alice.address);

      await expect(wallet.connect(alice).deposit({ value: 0 }))
        .to.be.revertedWithCustomError(wallet, "ZeroAmount");
    });

    it("Multiple deposits accumulate correctly", async function () {
      const { wallet, owner, alice } = await loadFixture(deployFamilyWalletFixture);

      await wallet.connect(owner).addMember(alice.address);

      const amount1 = ethers.parseEther("1.0");
      const amount2 = ethers.parseEther("0.5");
      const amount3 = ethers.parseEther("2.3");

      await wallet.connect(alice).deposit({ value: amount1 });
      await wallet.connect(alice).deposit({ value: amount2 });
      await wallet.connect(alice).deposit({ value: amount3 });

      const expectedTotal = amount1 + amount2 + amount3;
      expect(await wallet.getBalance(alice.address)).to.equal(expectedTotal);
    });

    it("Balances are tracked independently per member", async function () {
      const { wallet, owner, alice, bob } = await loadFixture(deployFamilyWalletFixture);

      await wallet.connect(owner).addMember(alice.address);
      await wallet.connect(owner).addMember(bob.address);

      const aliceAmount = ethers.parseEther("1.0");
      const bobAmount = ethers.parseEther("2.0");

      await wallet.connect(alice).deposit({ value: aliceAmount });
      await wallet.connect(bob).deposit({ value: bobAmount });

      expect(await wallet.getBalance(alice.address)).to.equal(aliceAmount);
      expect(await wallet.getBalance(bob.address)).to.equal(bobAmount);
      expect(await wallet.getTotalBalance()).to.equal(aliceAmount + bobAmount);
    });

    it("Deposit via receive() function works", async function () {
      const { wallet, owner, alice } = await loadFixture(deployFamilyWalletFixture);

      await wallet.connect(owner).addMember(alice.address);

      const depositAmount = ethers.parseEther("1.0");

      // Send Ether directly (triggers receive())
      await expect(alice.sendTransaction({
        to: await wallet.getAddress(),
        value: depositAmount
      }))
        .to.emit(wallet, "Deposited")
        .withArgs(alice.address, depositAmount, depositAmount, anyValue);

      expect(await wallet.getBalance(alice.address)).to.equal(depositAmount);
    });
  });
```

**Run tests:**

```powershell
npx hardhat test
```

### Activity 4: Test Withdrawal Functionality (30 minutes)

**Objective:** Test withdrawal logic, balance updates, and access control.

Add these tests:

```typescript
  describe("Withdrawals", function () {
    // Helper fixture with pre-deposited funds
    async function deployWithBalances() {
      const { wallet, owner, alice, bob, carol } = await deployFamilyWalletFixture();

      await wallet.connect(owner).addMember(alice.address);
      await wallet.connect(owner).addMember(bob.address);

      await wallet.connect(alice).deposit({ value: ethers.parseEther("5.0") });
      await wallet.connect(bob).deposit({ value: ethers.parseEther("3.0") });

      return { wallet, owner, alice, bob, carol };
    }

    describe("Regular Withdrawal", function () {
      it("Member can withdraw their balance", async function () {
        const { wallet, alice } = await loadFixture(deployWithBalances);

        const withdrawAmount = ethers.parseEther("2.0");
        const initialBalance = await wallet.getBalance(alice.address);

        await expect(wallet.connect(alice).withdraw(withdrawAmount))
          .to.emit(wallet, "Withdrawn")
          .withArgs(alice.address, withdrawAmount, initialBalance - withdrawAmount, anyValue)
          .and.to.changeEtherBalance(alice, withdrawAmount);

        expect(await wallet.getBalance(alice.address)).to.equal(initialBalance - withdrawAmount);
      });

      it("Member can withdraw all their balance", async function () {
        const { wallet, alice } = await loadFixture(deployWithBalances);

        const balance = await wallet.getBalance(alice.address);

        await expect(wallet.connect(alice).withdrawAll())
          .to.emit(wallet, "Withdrawn")
          .withArgs(alice.address, balance, 0, anyValue)
          .and.to.changeEtherBalance(alice, balance);

        expect(await wallet.getBalance(alice.address)).to.equal(0);
      });

      it("Cannot withdraw zero amount", async function () {
        const { wallet, alice } = await loadFixture(deployWithBalances);

        await expect(wallet.connect(alice).withdraw(0))
          .to.be.revertedWithCustomError(wallet, "ZeroAmount");
      });

      it("Cannot withdraw more than balance", async function () {
        const { wallet, alice } = await loadFixture(deployWithBalances);

        const balance = await wallet.getBalance(alice.address);
        const excessAmount = balance + ethers.parseEther("1.0");

        await expect(wallet.connect(alice).withdraw(excessAmount))
          .to.be.revertedWithCustomError(wallet, "InsufficientBalance");
      });

      it("Non-member cannot withdraw", async function () {
        const { wallet, carol } = await loadFixture(deployWithBalances);

        await expect(wallet.connect(carol).withdraw(ethers.parseEther("1.0")))
          .to.be.revertedWithCustomError(wallet, "NotAMember");
      });

      it("Member cannot withdraw another member's balance", async function () {
        const { wallet, alice, bob } = await loadFixture(deployWithBalances);

        const bobBalance = await wallet.getBalance(bob.address);

        // Alice tries to withdraw Bob's amount (should fail because she only has 5 ETH)
        await expect(wallet.connect(alice).withdraw(bobBalance + ethers.parseEther("1.0")))
          .to.be.revertedWithCustomError(wallet, "InsufficientBalance");
      });
    });

    describe("Owner Withdrawal", function () {
      it("Owner can withdraw from any member's balance", async function () {
        const { wallet, owner, alice } = await loadFixture(deployWithBalances);

        const withdrawAmount = ethers.parseEther("2.0");
        const aliceBalanceBefore = await wallet.getBalance(alice.address);

        await expect(wallet.connect(owner).ownerWithdraw(alice.address, withdrawAmount))
          .to.emit(wallet, "Withdrawn")
          .withArgs(alice.address, withdrawAmount, aliceBalanceBefore - withdrawAmount, anyValue)
          .and.to.changeEtherBalance(owner, withdrawAmount);

        expect(await wallet.getBalance(alice.address)).to.equal(aliceBalanceBefore - withdrawAmount);
      });

      it("Non-owner cannot use ownerWithdraw", async function () {
        const { wallet, alice, bob } = await loadFixture(deployWithBalances);

        await expect(wallet.connect(alice).ownerWithdraw(bob.address, ethers.parseEther("1.0")))
          .to.be.revertedWithCustomError(wallet, "OwnableUnauthorizedAccount");
      });

      it("Owner cannot withdraw more than member's balance", async function () {
        const { wallet, owner, alice } = await loadFixture(deployWithBalances);

        const aliceBalance = await wallet.getBalance(alice.address);
        const excessAmount = aliceBalance + ethers.parseEther("1.0");

        await expect(wallet.connect(owner).ownerWithdraw(alice.address, excessAmount))
          .to.be.revertedWithCustomError(wallet, "InsufficientBalance");
      });
    });

    describe("Emergency Withdrawal", function () {
      it("Owner can emergency withdraw all funds", async function () {
        const { wallet, owner } = await loadFixture(deployWithBalances);

        const totalBalance = await wallet.getTotalBalance();

        await expect(wallet.connect(owner).emergencyWithdraw())
          .to.changeEtherBalance(owner, totalBalance);

        expect(await wallet.getTotalBalance()).to.equal(0);
      });

      it("Non-owner cannot emergency withdraw", async function () {
        const { wallet, alice } = await loadFixture(deployWithBalances);

        await expect(wallet.connect(alice).emergencyWithdraw())
          .to.be.revertedWithCustomError(wallet, "OwnableUnauthorizedAccount");
      });

      it("Member balances remain recorded after emergency withdrawal", async function () {
        const { wallet, owner, alice } = await loadFixture(deployWithBalances);

        const aliceBalanceBefore = await wallet.getBalance(alice.address);

        await wallet.connect(owner).emergencyWithdraw();

        // Balance mapping still records the amount
        expect(await wallet.getBalance(alice.address)).to.equal(aliceBalanceBefore);

        // But contract has no funds
        expect(await wallet.getTotalBalance()).to.equal(0);
      });
    });
  });
```

**Run tests:**

```powershell
npx hardhat test
```

### Activity 5: Test Reentrancy Protection (35 minutes)

**Objective:** Simulate a reentrancy attack and verify protection works.

**Step 1:** Create attacker contract

Create `contracts/ReentrancyAttacker.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./FamilyWallet.sol";

/**
 * @title ReentrancyAttacker
 * @notice Malicious contract attempting reentrancy attack
 * @dev Used only for testing - demonstrates why ReentrancyGuard is needed
 */
contract ReentrancyAttacker {
    FamilyWallet public target;
    uint256 public attackCount;
    uint256 public maxAttacks = 3;

    constructor(address _target) {
        target = FamilyWallet(payable(_target));
    }

    // Deposit some funds first
    function deposit() public payable {
        target.deposit{value: msg.value}();
    }

    // Attempt the attack
    function attack() public {
        attackCount = 0;
        target.withdraw(1 ether);
    }

    // Fallback receives withdrawn Ether and tries to re-enter
    receive() external payable {
        attackCount++;

        // Try to withdraw again (reentrancy!)
        if (attackCount < maxAttacks && address(target).balance >= 1 ether) {
            target.withdraw(1 ether);
        }
    }

    // Check if attack succeeded
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
```

**Step 2:** Add reentrancy tests

Add to `test/FamilyWallet.test.ts`:

```typescript
  describe("Security", function () {
    describe("Reentrancy Protection", function () {
      it("Should prevent reentrancy attacks", async function () {
        const { wallet, owner, alice } = await loadFixture(deployFamilyWalletFixture);

        // Deploy attacker contract
        const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
        const attacker = await ReentrancyAttacker.deploy(await wallet.getAddress());

        // Add attacker as member and fund it
        await wallet.connect(owner).addMember(await attacker.getAddress());
        await attacker.deposit({ value: ethers.parseEther("3.0") });

        // Fund the wallet with more Ether (so there's enough for reentrancy)
        await wallet.connect(owner).deposit({ value: ethers.parseEther("10.0") });

        // Attempt the attack - should fail due to ReentrancyGuard
        await expect(attacker.attack())
          .to.be.revertedWith("No reentrancy");

        // Verify attacker didn't steal funds
        expect(await attacker.getBalance()).to.equal(0);
      });

      it("Normal withdrawal still works after reentrancy attempt", async function () {
        const { wallet, owner, alice } = await loadFixture(deployFamilyWalletFixture);

        // Deploy attacker
        const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
        const attacker = await ReentrancyAttacker.deploy(await wallet.getAddress());

        await wallet.connect(owner).addMember(await attacker.getAddress());
        await attacker.deposit({ value: ethers.parseEther("3.0") });
        await wallet.connect(owner).deposit({ value: ethers.parseEther("10.0") });

        // Attack fails
        await expect(attacker.attack()).to.be.reverted;

        // But legitimate withdrawal works
        await wallet.connect(owner).addMember(alice.address);
        await wallet.connect(alice).deposit({ value: ethers.parseEther("1.0") });

        await expect(wallet.connect(alice).withdraw(ethers.parseEther("0.5")))
          .to.not.be.reverted;
      });
    });
  });
```

**Step 3:** Compile and test

```powershell
npx hardhat build
npx hardhat test
```

**Expected:** Reentrancy attack should fail, normal operations should work.

---

## ✅ Expected Outputs

After completing all activities, you should have:

1. **Comprehensive test suite with 30+ tests:**
   - ✅ Deployment tests (3)
   - ✅ Member management tests (13)
   - ✅ Deposit tests (7)
   - ✅ Withdrawal tests (11)
   - ✅ Security tests (2)

2. **Test execution results:**
   ```
   FamilyWallet
     Deployment
       ✔ Should set the right owner
       ✔ Should start with zero members
       ✔ Should start with zero balance
     Member Management
       Adding Members
         ✔ Owner can add a member
         ✔ Non-owner cannot add members
         ...
     Deposits
       ✔ Member can deposit Ether
       ...
     Withdrawals
       ✔ Member can withdraw their balance
       ...
     Security
       ✔ Should prevent reentrancy attacks
       ...

   36 passing (Xs)
   ```

3. **Code coverage > 80%** (check with `npx hardhat coverage`)

---

## 📦 Deliverables

- [ ] Complete test file (`test/FamilyWallet.test.ts`) with 30+ tests
- [ ] All tests passing
- [ ] Tests cover happy paths and edge cases
- [ ] Event emission tests included
- [ ] Access control tests verify permissions
- [ ] Reentrancy attack simulation included
- [ ] Test fixtures used for efficiency
- [ ] TypeScript types used correctly
- [ ] Code coverage >80%

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Cannot find module 'typechain-types'"

**Error:**
```
Error: Cannot find module '../typechain-types'
```

**Solution:**
```powershell
# Generate TypeChain types
npx hardhat build

# Verify types generated
ls typechain-types
```

### Issue 2: Tests timeout

**Error:**
```
Error: Timeout of 2000ms exceeded
```

**Solution:**
```typescript
// Increase timeout for slow tests
describe("Slow test suite", function () {
  this.timeout(10000); // 10 seconds

  it("Slow test", async function () {
    // ...
  });
});
```

Or in `hardhat.config.ts`:
```typescript
export default {
  mocha: {
    timeout: 20000 // 20 seconds
  }
};
```

### Issue 3: Custom error not recognized

**Error:**
```
AssertionError: Expected transaction to be reverted with custom error 'ZeroAmount'
```

**Solution:**
Verify error is defined in contract and matches exactly:

```solidity
// Contract
error ZeroAmount();

// Test
await expect(wallet.withdraw(0))
  .to.be.revertedWithCustomError(wallet, "ZeroAmount"); // Must match exactly
```

### Issue 4: Event parameters don't match

**Error:**
```
AssertionError: Expected event "Deposited" with args [...]
```

**Solution:**
```typescript
// Use anyValue for dynamic values like timestamps
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

await expect(tx)
  .to.emit(wallet, "Deposited")
  .withArgs(alice.address, amount, newBalance, anyValue); // anyValue for timestamp
```

### Issue 5: BigInt comparison fails

**Error:**
```
AssertionError: Expected 1000000000000000000 to equal 1000000000000000000
```

**Solution:**
```typescript
// Don't compare BigInt with ===
const amount = ethers.parseEther("1.0");
expect(balance === amount); // ❌ May fail

// Use Chai's equal
expect(balance).to.equal(amount); // ✅ Correct
```

---

## 🎓 Self-Assessment Quiz

<details>
<summary><strong>Question 1:</strong> Why use fixtures instead of <code>beforeEach()</code>?</summary>

**Answer:**
Fixtures are **10-100x faster** because they use Hardhat's snapshot feature.

**With beforeEach (slow):**
```typescript
beforeEach(async function () {
  // Deploys NEW contract for EVERY test
  wallet = await FamilyWallet.deploy(owner.address);
});
```

**With fixture (fast):**
```typescript
async function deployFixture() {
  wallet = await FamilyWallet.deploy(owner.address);
  return { wallet };
}

it("Test", async function () {
  // Loads snapshot (instant)
  const { wallet } = await loadFixture(deployFixture);
});
```

**How it works:**
1. First time: Actually deploys contract, saves blockchain snapshot
2. Subsequent tests: Reverts to snapshot (instant)
3. Each test gets clean state without redeployment

**Benefit:** Test suite that took 5 minutes now takes 30 seconds.
</details>

<details>
<summary><strong>Question 2:</strong> What does <code>.to.changeEtherBalance()</code> test?</summary>

**Answer:**
Tests that an address's Ether balance changes by a specific amount.

**Usage:**
```typescript
await expect(wallet.connect(alice).withdraw(ethers.parseEther("1.0")))
  .to.changeEtherBalance(alice, ethers.parseEther("1.0")); // Alice gains 1 ETH

// Can also test negative changes
await expect(wallet.connect(alice).deposit({ value: ethers.parseEther("1.0") }))
  .to.changeEtherBalance(alice, ethers.parseEther("-1.0")); // Alice loses 1 ETH
```

**What it checks:**
1. Records Alice's balance before transaction
2. Executes transaction
3. Records Alice's balance after transaction
4. Verifies: `balanceAfter - balanceBefore == expectedChange`

**Note:** Accounts for gas costs automatically.
</details>

<details>
<summary><strong>Question 3:</strong> How do you test custom errors with parameters?</summary>

**Answer:**
Use `.revertedWithCustomError()` and optionally `.withArgs()`.

**Example:**
```solidity
// Contract
error InsufficientBalance(uint256 requested, uint256 available);

function withdraw(uint256 amount) public {
    if (amount > balances[msg.sender]) {
        revert InsufficientBalance(amount, balances[msg.sender]);
    }
}
```

```typescript
// Test
await expect(wallet.withdraw(ethers.parseEther("100")))
  .to.be.revertedWithCustomError(wallet, "InsufficientBalance")
  .withArgs(ethers.parseEther("100"), actualBalance);
```

**Benefits over string errors:**
- More gas efficient
- Type-safe parameters
- Better debugging (can see actual values)
</details>

<details>
<summary><strong>Question 4:</strong> Why test event emission?</summary>

**Answer:**
Events are critical for **off-chain systems** that depend on blockchain data.

**Use cases:**
1. **Frontend notifications:** "Your deposit was successful"
2. **Database sync:** Update PostgreSQL when events occur (Week 4 integration)
3. **Analytics:** Track transaction patterns
4. **Audit trails:** Permanent record of all actions
5. **The Graph:** Subgraphs use events for indexing

**Example from Week 4:**
```typescript
// Event emitted
emit Deposited(msg.sender, amount, newBalance, block.timestamp);

// Backend listener (Week 7)
wallet.on("Deposited", async (member, amount, newBalance, timestamp) => {
  // Save to PostgreSQL
  await db.query(
    "INSERT INTO transactions (member, amount, balance, timestamp) VALUES ($1, $2, $3, $4)",
    [member, amount, newBalance, timestamp]
  );
});
```

**If events are wrong:**
- Frontend doesn't update
- Database gets out of sync
- Analytics are incorrect
- Users don't get notified

**Testing ensures events work correctly BEFORE deployment.**
</details>

<details>
<summary><strong>Question 5:</strong> What's the purpose of testing reentrancy attacks?</summary>

**Answer:**
To **verify your protection actually works** before deploying real money contracts.

**The DAO Hack (2016):**
- $60 million stolen via reentrancy attack
- Attacker called `withdraw()` recursively
- Contract didn't update balance before sending Ether
- Led to Ethereum fork (ETH vs ETC)

**Our test simulates this:**
```typescript
// Attacker contract
receive() external payable {
    if (attackCount < 3) {
        target.withdraw(1 ether); // Try to re-enter
    }
}

// Test verifies protection
await expect(attacker.attack())
  .to.be.revertedWith("No reentrancy"); // Protected!
```

**What we verify:**
1. Attack is blocked by `nonReentrant` modifier
2. Normal operations still work after attempt
3. Funds are safe

**Real-world parallel:** Penetration testing for web security.
</details>

<details>
<summary><strong>Question 6:</strong> Why are tests written in TypeScript, not JavaScript?</summary>

**Answer:**
**Hardhat 3 requires TypeScript test files** - JavaScript tests no longer supported.

**Benefits of TypeScript tests:**
1. **Type safety:** Catch errors at compile time
```typescript
const amount: bigint = ethers.parseEther("1.0");
await wallet.withdraw(amount); // ✅ Type-checked

await wallet.withdraw("1.0"); // ❌ TypeScript error
```

2. **IntelliSense:** Autocomplete for contract methods
```typescript
wallet. // VS Code shows: deposit, withdraw, addMember, etc.
```

3. **TypeChain integration:** Generated types from contracts
```typescript
import type { FamilyWallet } from "../typechain-types";
const wallet: FamilyWallet = // Fully typed contract instance
```

4. **Refactoring safety:** Rename functions, types update everywhere

**Migration from Hardhat 2:**
- Hardhat 2: `.js` or `.ts` tests
- Hardhat 3: Only `.ts` tests (`npx hardhat test` requires TypeScript)
</details>

<details>
<summary><strong>Question 7:</strong> How do you achieve >80% code coverage?</summary>

**Answer:**
Test **all paths** through your code including edge cases.

**Steps:**
1. **Run coverage:**
```powershell
npx hardhat coverage
```

2. **Identify uncovered lines:**
```
FamilyWallet.sol
  Lines: 85% (34/40)
  Branches: 75% (12/16)
  Functions: 90% (9/10)
```

3. **Add missing tests:**
- **Uncovered if branches:** Test both true and false conditions
- **Uncovered functions:** Add tests for unused functions
- **Uncovered error paths:** Test all `require` and `revert` statements

**Example:**
```solidity
function withdraw(uint256 amount) public {
    require(amount > 0, "Zero amount"); // Test with amount == 0
    require(amount <= balances[msg.sender], "Insufficient"); // Test with amount > balance
    // Both branches need tests for 100% coverage
}
```

**Coverage goals:**
- **Lines:** >80% (industry standard)
- **Branches:** >75% (all if/else paths)
- **Functions:** >90% (most functions tested)

**Note:** 100% coverage doesn't mean bug-free, but <80% means definitely undertested.
</details>

---

## 🎯 Key Takeaways

1. **Tests are mandatory for smart contracts** - Immutable code + real money = comprehensive testing required

2. **Use fixtures for speed** - `loadFixture()` makes tests 10-100x faster via snapshots

3. **Test all paths** - Happy paths, edge cases, error conditions, and attack scenarios

4. **TypeScript is required** - Hardhat 3 only supports `.test.ts` files with full type safety

5. **Events must be tested** - Off-chain systems depend on events being correct

6. **Simulate attacks** - Test reentrancy, access control bypass, overflow/underflow

7. **Aim for >80% coverage** - Use `npx hardhat coverage` to identify gaps

---

## 📚 Next Steps

**Before Class 5.4:**
- Ensure all tests pass
- Achieve >80% code coverage
- Understand why each test is important
- Review any failing tests and fix bugs

**Coming up in Class 5.4:**
- Deploy FamilyWallet to Sepolia testnet
- Verify contract on Etherscan
- Interact with deployed contract via Etherscan
- Use Hardhat scripts for deployment
- Manage deployment addresses
- Monitor deployed contracts

---

## 📖 Reading References

**Ethereum Book:**
- Chapter 9: Smart Contract Security - Testing best practices

**Hardhat Documentation:**
- Testing: https://hardhat.org/hardhat-runner/docs/guides/test-contracts
- Chai Matchers: https://hardhat.org/hardhat-chai-matchers/docs/overview

**Testing Resources:**
- Consensys Testing Guide: https://consensys.github.io/smart-contract-best-practices/development-recommendations/solidity-specific/test-coverage/
- OpenZeppelin Test Helpers: https://docs.openzeppelin.com/test-helpers/

---

## 🧑‍💻 Teaching Notes (for Claude Code)

**Pacing:**
- 30-40 minutes on concepts
- 2.5-3 hours on hands-on testing
- 20 minutes for review and troubleshooting

**Common Student Questions:**
1. **"Do I really need to test EVERYTHING?"** → Yes! Explain the DAO hack cost
2. **"Why so many tests for one function?"** → Show different paths (happy, edge, error)
3. **"Can't I just test in production?"** → No! Immutable contracts mean no fixes

**Live Coding Tips:**
- Write tests BEFORE showing expected output
- Run tests frequently (`npx hardhat test` after each addition)
- Show failing tests first, then make them pass (TDD)
- Use `console.log()` in contracts for debugging

**Debugging Demo:**
- Show how to read test error messages
- Demonstrate using `--grep` to run specific tests
- Show `npx hardhat coverage` output interpretation

**Connection to Previous Classes:**
- Class 5.1: Using Solidity syntax in tests
- Class 5.2: Testing the contract we built
- Class 5.4: Tests must pass before deployment

**Red Flags to Watch:**
- Students skipping edge case tests
- Not using fixtures (slow tests)
- Comparing BigInt with `===` (doesn't work)
- Forgetting `await` on async calls
- Not checking event parameters

**Advanced Topics (if time):**
- Gas reporter (`REPORT_GAS=true npx hardhat test`)
- Fuzzing with Echidna (Week 26 topic)
- Formal verification (advanced security)

---

*Course Version: 2.0 (30-week structure)*
*Last Updated: January 2025*
*Part of: FamilyChain Blockchain Development Course*
