# Week 5 - Class 5.2: Writing the Family Wallet Contract

**Duration:** 3-4 hours
**Prerequisites:** Class 5.1 completed, understanding of Solidity basics, OpenZeppelin contracts installed
**Why It Matters:** This class teaches you to design and implement a real-world smart contract with multiple users, access control, and event tracking - the foundation of the FamilyChain platform.

---

## 📋 Learning Objectives

By the end of this class, you will be able to:

1. Design a multi-user wallet contract architecture
2. Implement access control with owner and family member roles
3. Build deposit and withdrawal functionality with proper security
4. Emit events for transaction tracking and off-chain monitoring
5. Handle Ether transfers safely using best practices
6. Validate inputs and handle edge cases
7. Structure contract code for maintainability and upgradability

---

## 🎯 Key Concepts

### 1. FamilyWallet Requirements

Our **FamilyWallet** contract needs to support:

**Core Features:**
- Owner can add/remove family members
- Family members can deposit Ether
- Family members can withdraw their own balance
- Owner can withdraw any member's balance (parental control)
- Track individual balances per family member
- Emit events for all transactions

**Security Requirements:**
- Only owner can add/remove members
- Members can only withdraw their own balance (unless owner)
- Prevent reentrancy attacks
- Validate all inputs
- Emit events for audit trail

**Architecture Diagram:**
```
┌─────────────────────────────────────┐
│        FamilyWallet Contract        │
├─────────────────────────────────────┤
│ State Variables:                    │
│  - owner (address)                  │
│  - familyMembers (mapping)          │
│  - balances (mapping)               │
│  - memberList (array)               │
├─────────────────────────────────────┤
│ Functions:                          │
│  - addMember()     [Owner only]     │
│  - removeMember()  [Owner only]     │
│  - deposit()       [Members]        │
│  - withdraw()      [Members/Owner]  │
│  - getBalance()    [View]           │
├─────────────────────────────────────┤
│ Events:                             │
│  - MemberAdded                      │
│  - MemberRemoved                    │
│  - Deposited                        │
│  - Withdrawn                        │
└─────────────────────────────────────┘
```

### 2. Access Control Patterns

**Pattern 1: Owner-Only (Simple)**
```solidity
address public owner;

modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _;
}

function adminFunction() public onlyOwner {
    // Only owner can call
}
```

**Pattern 2: OpenZeppelin Ownable (Recommended)**
```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyContract is Ownable {
    constructor(address initialOwner) Ownable(initialOwner) {}

    function adminFunction() public onlyOwner {
        // Built-in onlyOwner modifier
    }
}
```

**Pattern 3: Role-Based (Advanced)**
```solidity
mapping(address => bool) public familyMembers;

modifier onlyFamily() {
    require(familyMembers[msg.sender], "Not a family member");
    _;
}
```

### 3. Safe Ether Handling

**Three ways to send Ether:**

| Method | Gas Stipend | Reverts on Failure | Recommended? |
|--------|-------------|-------------------|--------------|
| `transfer()` | 2300 gas | ✅ Yes | ⚠️ Deprecated |
| `send()` | 2300 gas | ❌ No (returns false) | ❌ No |
| `call()` | All gas | ❌ No (returns bool) | ✅ **Yes** |

**Modern Best Practice:**
```solidity
// RECOMMENDED (Solidity 0.8+)
(bool success, ) = recipient.call{value: amount}("");
require(success, "Transfer failed");

// OLD WAY (avoid)
recipient.transfer(amount); // Fixed gas limit issues
```

### 4. Reentrancy Protection

**The Attack:**
```solidity
// Vulnerable contract
function withdraw() public {
    uint256 amount = balances[msg.sender];

    // Problem: State change AFTER external call
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);

    balances[msg.sender] = 0; // TOO LATE! Attacker re-entered
}

// Attacker contract
receive() external payable {
    if (address(victim).balance > 0) {
        victim.withdraw(); // Re-enter before state update!
    }
}
```

**The Fix (Checks-Effects-Interactions Pattern):**
```solidity
// Secure contract
function withdraw() public nonReentrant {
    uint256 amount = balances[msg.sender];

    // 1. CHECKS
    require(amount > 0, "No balance");

    // 2. EFFECTS (update state FIRST)
    balances[msg.sender] = 0;

    // 3. INTERACTIONS (external calls LAST)
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}
```

### 5. Event Design Patterns

**Good Event Design:**
```solidity
// ✅ GOOD: Indexed addresses, clear naming, complete data
event Deposited(
    address indexed member,
    uint256 amount,
    uint256 newBalance,
    uint256 timestamp
);

// ❌ BAD: No indexed params, vague naming, missing context
event Action(address user, uint256 value);
```

**Why Events Matter:**
- **Frontend notifications** - Real-time updates in UI
- **Database synchronization** - Sync blockchain state to PostgreSQL (Week 4)
- **Audit trails** - Permanent record of all transactions
- **Cost-effective storage** - Much cheaper than state variables

### 6. Input Validation Strategy

**Always validate inputs to prevent edge cases:**

```solidity
// Address validation
function addMember(address member) public {
    require(member != address(0), "Zero address"); // ✅
    require(member != owner(), "Owner already admin"); // ✅
    require(!familyMembers[member], "Already a member"); // ✅
    // ... proceed
}

// Amount validation
function withdraw(uint256 amount) public {
    require(amount > 0, "Amount must be positive"); // ✅
    require(amount <= balances[msg.sender], "Insufficient balance"); // ✅
    // ... proceed
}

// State validation
function deposit() public payable {
    require(familyMembers[msg.sender], "Not a member"); // ✅
    require(msg.value > 0, "Must send Ether"); // ✅
    // ... proceed
}
```

### 7. Storage Layout Optimization

**Gas costs matter - organize storage efficiently:**

```solidity
// ❌ BAD: 3 storage slots (expensive)
bool public active;      // Slot 0
address public owner;    // Slot 1
bool public paused;      // Slot 2

// ✅ GOOD: 2 storage slots (cheaper)
address public owner;    // Slot 0 (20 bytes)
bool public active;      // Slot 0 (1 byte) - packed!
bool public paused;      // Slot 0 (1 byte) - packed!
```

**Each storage slot = 32 bytes**
- Reading 1 slot = 200-2100 gas
- Writing 1 slot = 20,000 gas
- Pack small types together when possible

---

## 🛠️ Hands-On Activities

### Activity 1: Basic FamilyWallet Structure (30 minutes)

**Objective:** Set up the contract skeleton with state variables and events.

**Step 1:** Create the contract file

```powershell
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain
New-Item -Path "contracts\FamilyWallet.sol" -ItemType File
```

**Step 2:** Write the basic structure

Open `contracts/FamilyWallet.sol` and write:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FamilyWallet
 * @notice A multi-user wallet for family members with parental controls
 * @dev Uses OpenZeppelin's Ownable and ReentrancyGuard for security
 */
contract FamilyWallet is Ownable, ReentrancyGuard {
    // State variables
    mapping(address => bool) public familyMembers;
    mapping(address => uint256) public balances;
    address[] private memberList;

    // Events
    event MemberAdded(address indexed member, uint256 timestamp);
    event MemberRemoved(address indexed member, uint256 timestamp);
    event Deposited(
        address indexed member,
        uint256 amount,
        uint256 newBalance,
        uint256 timestamp
    );
    event Withdrawn(
        address indexed member,
        uint256 amount,
        uint256 remainingBalance,
        uint256 timestamp
    );

    // Custom errors (more gas efficient than require strings)
    error NotAMember();
    error AlreadyAMember();
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientBalance(uint256 requested, uint256 available);
    error CannotRemoveOwner();

    /**
     * @notice Initialize the wallet with the owner
     * @param initialOwner Address of the wallet owner (parent)
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        require(initialOwner != address(0), "Invalid owner address");
    }

    /**
     * @notice Check if address is a family member
     * @param account Address to check
     * @return bool True if account is a member
     */
    function isMember(address account) public view returns (bool) {
        return familyMembers[account];
    }

    /**
     * @notice Get list of all family members
     * @return address[] Array of member addresses
     */
    function getMembers() public view returns (address[] memory) {
        return memberList;
    }

    /**
     * @notice Get total number of family members
     * @return uint256 Member count
     */
    function getMemberCount() public view returns (uint256) {
        return memberList.length;
    }

    /**
     * @notice Get contract's total balance
     * @return uint256 Total Ether held in contract
     */
    function getTotalBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
```

**Step 3:** Compile to verify structure

```powershell
npx hardhat build
```

**Expected Output:**
```
Compiled 1 Solidity file successfully (evm target: paris).
```

### Activity 2: Implement Member Management (25 minutes)

**Objective:** Add functions to add/remove family members (owner-only).

Add these functions to `FamilyWallet.sol`:

```solidity
    /**
     * @notice Add a new family member (owner only)
     * @param member Address of the new member
     */
    function addMember(address member) public onlyOwner {
        // Validation
        if (member == address(0)) revert ZeroAddress();
        if (member == owner()) revert CannotRemoveOwner();
        if (familyMembers[member]) revert AlreadyAMember();

        // Update state
        familyMembers[member] = true;
        memberList.push(member);

        // Emit event
        emit MemberAdded(member, block.timestamp);
    }

    /**
     * @notice Remove a family member (owner only)
     * @param member Address of the member to remove
     * @dev Remaining balance stays in contract for owner to manage
     */
    function removeMember(address member) public onlyOwner {
        // Validation
        if (!familyMembers[member]) revert NotAMember();
        if (member == owner()) revert CannotRemoveOwner();

        // Update state
        familyMembers[member] = false;

        // Remove from memberList array (find and swap with last)
        for (uint256 i = 0; i < memberList.length; i++) {
            if (memberList[i] == member) {
                // Move last element to this position
                memberList[i] = memberList[memberList.length - 1];
                // Remove last element
                memberList.pop();
                break;
            }
        }

        // Emit event
        emit MemberRemoved(member, block.timestamp);
    }
```

**Step 4:** Test compilation

```powershell
npx hardhat build
```

### Activity 3: Implement Deposit Functionality (25 minutes)

**Objective:** Allow family members to deposit Ether into their individual balance.

Add the deposit function:

```solidity
    /**
     * @notice Deposit Ether into your balance
     * @dev Must be a family member to deposit
     */
    function deposit() public payable {
        // Validation
        if (!familyMembers[msg.sender] && msg.sender != owner()) {
            revert NotAMember();
        }
        if (msg.value == 0) revert ZeroAmount();

        // Update balance
        balances[msg.sender] += msg.value;

        // Emit event
        emit Deposited(
            msg.sender,
            msg.value,
            balances[msg.sender],
            block.timestamp
        );
    }

    /**
     * @notice Convenience function to get your own balance
     * @return uint256 Your balance in Wei
     */
    function getMyBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    /**
     * @notice Get balance of any family member (public for transparency)
     * @param member Address to check
     * @return uint256 Balance in Wei
     */
    function getBalance(address member) public view returns (uint256) {
        return balances[member];
    }
```

**Test compilation:**

```powershell
npx hardhat build
```

### Activity 4: Implement Withdrawal Functionality (30 minutes)

**Objective:** Allow members to withdraw their balance with reentrancy protection.

Add withdrawal functions:

```solidity
    /**
     * @notice Withdraw from your own balance
     * @param amount Amount in Wei to withdraw
     * @dev Protected against reentrancy attacks
     */
    function withdraw(uint256 amount) public nonReentrant {
        // Validation
        if (!familyMembers[msg.sender] && msg.sender != owner()) {
            revert NotAMember();
        }
        if (amount == 0) revert ZeroAmount();
        if (amount > balances[msg.sender]) {
            revert InsufficientBalance(amount, balances[msg.sender]);
        }

        // Effects (update state BEFORE external call)
        balances[msg.sender] -= amount;

        // Interaction (external call LAST)
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        // Emit event
        emit Withdrawn(
            msg.sender,
            amount,
            balances[msg.sender],
            block.timestamp
        );
    }

    /**
     * @notice Withdraw all of your balance
     * @dev Convenience function for full withdrawal
     */
    function withdrawAll() public nonReentrant {
        uint256 amount = balances[msg.sender];

        if (!familyMembers[msg.sender] && msg.sender != owner()) {
            revert NotAMember();
        }
        if (amount == 0) revert ZeroAmount();

        // Effects first
        balances[msg.sender] = 0;

        // Interaction last
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount, 0, block.timestamp);
    }

    /**
     * @notice Owner withdraws from any member's balance (parental control)
     * @param member Address of the member
     * @param amount Amount to withdraw
     * @dev Only owner can withdraw from others' balances
     */
    function ownerWithdraw(address member, uint256 amount)
        public
        onlyOwner
        nonReentrant
    {
        // Validation
        if (amount == 0) revert ZeroAmount();
        if (amount > balances[member]) {
            revert InsufficientBalance(amount, balances[member]);
        }

        // Effects first
        balances[member] -= amount;

        // Interaction last
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(member, amount, balances[member], block.timestamp);
    }
```

**Test compilation:**

```powershell
npx hardhat build
```

### Activity 5: Add Emergency Functions (20 minutes)

**Objective:** Implement emergency withdrawal and pause functionality.

Add emergency functions:

```solidity
    /**
     * @notice Emergency withdrawal by owner (all contract funds)
     * @dev Use only in emergencies - bypasses individual balances
     */
    function emergencyWithdraw() public onlyOwner nonReentrant {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No funds to withdraw");

        (bool success, ) = owner().call{value: contractBalance}("");
        require(success, "Emergency withdrawal failed");

        // Note: Individual balances remain recorded but funds withdrawn
        // This is intentional for emergency scenarios
    }

    /**
     * @notice Receive function to accept direct Ether transfers
     * @dev Credits sender's balance
     */
    receive() external payable {
        if (familyMembers[msg.sender] || msg.sender == owner()) {
            balances[msg.sender] += msg.value;
            emit Deposited(
                msg.sender,
                msg.value,
                balances[msg.sender],
                block.timestamp
            );
        } else {
            revert NotAMember();
        }
    }

    /**
     * @notice Fallback function for invalid calls
     */
    fallback() external payable {
        revert("Invalid function call");
    }
```

**Final compilation:**

```powershell
npx hardhat build
```

---

## ✅ Expected Outputs

After completing all activities, you should have:

1. **Complete FamilyWallet.sol contract with:**
   - ✅ Member management (add/remove)
   - ✅ Deposit functionality
   - ✅ Withdrawal functionality (member + owner)
   - ✅ Emergency withdrawal
   - ✅ Reentrancy protection
   - ✅ Comprehensive events
   - ✅ Input validation

2. **Security features:**
   - ✅ OpenZeppelin Ownable for access control
   - ✅ ReentrancyGuard for attack prevention
   - ✅ Checks-Effects-Interactions pattern
   - ✅ Custom errors for gas efficiency

3. **Compiled artifacts:**
   - ✅ `artifacts/contracts/FamilyWallet.sol/FamilyWallet.json`
   - ✅ TypeChain types (if configured)

---

## 📦 Deliverables

- [ ] FamilyWallet contract compiles without errors
- [ ] All functions have proper access control (onlyOwner where needed)
- [ ] Events emitted for all state changes
- [ ] Reentrancy protection on all withdrawal functions
- [ ] Input validation on all public functions
- [ ] Member management working (add/remove)
- [ ] Deposit and withdrawal logic implemented
- [ ] Emergency functions for owner
- [ ] Code follows Solidity style guide

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Transfer Failed" Error

**Symptom:**
```
Error: Transaction reverted: Transfer failed
```

**Possible Causes:**
1. Recipient is a contract without `receive()` or `fallback()`
2. Insufficient gas sent with transaction
3. Recipient's receive function reverts

**Solution:**
```solidity
// Add more gas to the call
(bool success, ) = recipient.call{value: amount, gas: 30000}("");
require(success, "Transfer failed");

// Or handle failure gracefully
(bool success, ) = recipient.call{value: amount}("");
if (!success) {
    // Refund to balance
    balances[msg.sender] += amount;
    revert("Transfer failed - funds refunded");
}
```

### Issue 2: Reentrancy Test Fails

**Symptom:**
Contract vulnerable to reentrancy despite using `nonReentrant`.

**Solution:**
Verify the Checks-Effects-Interactions pattern:

```solidity
// ✅ CORRECT ORDER
function withdraw(uint256 amount) public nonReentrant {
    // 1. CHECKS
    require(amount <= balances[msg.sender], "Insufficient");

    // 2. EFFECTS (state changes FIRST)
    balances[msg.sender] -= amount;

    // 3. INTERACTIONS (external calls LAST)
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}

// ❌ WRONG ORDER
function withdraw(uint256 amount) public nonReentrant {
    require(amount <= balances[msg.sender], "Insufficient");

    // External call BEFORE state change = VULNERABLE
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);

    balances[msg.sender] -= amount; // TOO LATE!
}
```

### Issue 3: Array Management Gas Issues

**Symptom:**
`removeMember()` fails with out-of-gas error for large arrays.

**Solution:**
Our implementation uses swap-and-pop (O(1) operation), but if you have issues:

```solidity
// Alternative: Don't delete from array, just mark as inactive
mapping(address => bool) public activeMember;
address[] public allMembers; // Never delete

function removeMember(address member) public onlyOwner {
    activeMember[member] = false; // Just deactivate
}

function getActiveMembers() public view returns (address[] memory) {
    uint256 activeCount = 0;
    // Count active members
    for (uint256 i = 0; i < allMembers.length; i++) {
        if (activeMember[allMembers[i]]) activeCount++;
    }

    // Create result array
    address[] memory result = new address[](activeCount);
    uint256 j = 0;
    for (uint256 i = 0; i < allMembers.length; i++) {
        if (activeMember[allMembers[i]]) {
            result[j++] = allMembers[i];
        }
    }
    return result;
}
```

### Issue 4: Custom Errors Not Working

**Symptom:**
```
TypeError: Unknown type for custom error
```

**Solution:**
Ensure Solidity version is 0.8.4+ for custom errors:

```solidity
pragma solidity ^0.8.28; // ✅ Supports custom errors

error InsufficientBalance(uint256 requested, uint256 available);

function withdraw(uint256 amount) public {
    if (amount > balances[msg.sender]) {
        revert InsufficientBalance(amount, balances[msg.sender]);
    }
}
```

### Issue 5: Event Not Emitting

**Symptom:**
Events don't show up in transaction logs.

**Solution:**
Check that:
1. Event is declared at contract level (not inside functions)
2. Using `emit` keyword
3. Transaction is actually mined (not a `call` simulation)

```solidity
// ✅ CORRECT
event Deposited(address indexed member, uint256 amount);

function deposit() public payable {
    emit Deposited(msg.sender, msg.value); // Must use 'emit'
}

// ❌ WRONG
function deposit() public payable {
    Deposited(msg.sender, msg.value); // Missing 'emit'
}
```

---

## 🎓 Self-Assessment Quiz

<details>
<summary><strong>Question 1:</strong> Why do we update <code>balances[msg.sender]</code> BEFORE calling <code>msg.sender.call()</code>?</summary>

**Answer:**
To prevent **reentrancy attacks** following the **Checks-Effects-Interactions** pattern.

**If we call first:**
1. Contract sends Ether to user
2. User's contract `receive()` calls `withdraw()` again (reentrancy!)
3. Balance hasn't been updated yet, so check passes
4. Contract sends Ether again (double withdrawal!)

**Correct order:**
1. **Check:** Verify balance is sufficient
2. **Effect:** Update state (`balances[msg.sender] -= amount`)
3. **Interact:** Make external call (`msg.sender.call{value: amount}`)

Even with `nonReentrant` modifier, it's best practice to follow this pattern.
</details>

<details>
<summary><strong>Question 2:</strong> What's the difference between <code>transfer()</code>, <code>send()</code>, and <code>call()</code> for sending Ether?</summary>

**Answer:**

| Method | Gas Limit | Reverts? | Returns | Recommended? |
|--------|-----------|----------|---------|--------------|
| `transfer()` | 2300 gas | ✅ Yes | Nothing | ❌ Deprecated |
| `send()` | 2300 gas | ❌ No | `bool` | ❌ No |
| `call()` | All available | ❌ No | `(bool, bytes)` | ✅ **Yes** |

**Modern best practice:**
```solidity
(bool success, ) = recipient.call{value: amount}("");
require(success, "Transfer failed");
```

**Why avoid `transfer()`?**
- Fixed 2300 gas not enough for contracts with complex `receive()` functions
- EIP-1884 made some operations more expensive, breaking transfer()
- `call()` forwards all available gas
</details>

<details>
<summary><strong>Question 3:</strong> Why use custom errors instead of <code>require()</code> strings?</summary>

**Answer:**
Custom errors are **more gas-efficient** and provide **better debugging**.

**Gas comparison:**
```solidity
// ❌ Expensive (stores string on-chain)
require(amount > 0, "Amount must be positive"); // ~3,000 gas

// ✅ Cheaper (only error signature)
error ZeroAmount(); // ~1,500 gas
if (amount == 0) revert ZeroAmount();
```

**Additional benefits:**
- Can include parameters: `error InsufficientBalance(uint256 requested, uint256 available);`
- Better type safety in tests
- Cleaner ABI for frontend integration
- Lower deployment costs

**When to use require():**
- When you need the error string for debugging during development
- For critical assertions that should never fail
</details>

<details>
<summary><strong>Question 4:</strong> What happens to a member's balance when they're removed from the family?</summary>

**Answer:**
**The balance stays in the contract** - it's not automatically withdrawn or transferred.

**Reasons for this design:**
1. **Parental control** - Owner decides when/if to release funds
2. **Gas efficiency** - Automatic refund would cost more gas
3. **Flexibility** - Owner can use `ownerWithdraw()` to manage the funds

**Alternative designs could:**
- Automatically refund balance to member (costs more gas)
- Transfer balance to owner (requires extra logic)
- Block removal if member has balance (prevents cleanup)

**Current behavior:**
```solidity
// Member has 1 ETH balance
removeMember(alice); // Alice removed but still has 1 ETH recorded

// Owner can withdraw Alice's balance
ownerWithdraw(alice, 1 ether); // Sends to owner

// Or Alice could be re-added and withdraw herself
addMember(alice);
// Alice can now withdraw her 1 ETH
```
</details>

<details>
<summary><strong>Question 5:</strong> Why do we need both <code>receive()</code> and <code>fallback()</code> functions?</summary>

**Answer:**
They handle different types of incoming Ether and function calls.

**`receive()`** - Called when Ether is sent with NO data:
```solidity
receive() external payable {
    // Handle plain Ether transfers
    balances[msg.sender] += msg.value;
}
```

**`fallback()`** - Called when:
- Function called doesn't exist
- Ether sent WITH data but no matching function
```solidity
fallback() external payable {
    // Handle unknown function calls
    revert("Invalid function call");
}
```

**Decision tree:**
```
Ether sent to contract?
  ↓
msg.data empty?
  → YES: Call receive()
  → NO: Try to match function signature
     ↓
     Match found?
       → YES: Call that function
       → NO: Call fallback()
```

**Example:**
```solidity
// Calls receive()
someAddress.transfer(1 ether);

// Calls fallback()
someAddress.call{value: 1 ether}(abi.encodeWithSignature("nonExistent()"));
```
</details>

<details>
<summary><strong>Question 6:</strong> What does the <code>indexed</code> keyword do in events?</summary>

**Answer:**
`indexed` parameters can be **filtered and searched** in event logs.

**Usage:**
```solidity
event Deposited(
    address indexed member,  // Searchable
    uint256 amount,          // Not searchable (cheaper)
    uint256 newBalance       // Not searchable
);
```

**Benefits:**
- **Frontend filtering:** `contract.on(Deposited, { member: '0x123...' })`
- **Database queries:** Subgraphs can efficiently query by indexed params
- **Block explorers:** Can search "all deposits by address"

**Limitations:**
- Maximum 3 indexed parameters per event
- Indexed params cost slightly more gas
- Complex types (structs, arrays) can't be indexed directly

**When to use:**
- Addresses that need filtering (users, tokens)
- IDs that need searching (tokenId, transactionId)
- Enums or small integers used for categorization
</details>

<details>
<summary><strong>Question 7:</strong> Why does <code>emergencyWithdraw()</code> bypass individual balances?</summary>

**Answer:**
For **emergency situations** where immediate access to funds is needed.

**Scenarios:**
1. **Contract bug discovered** - Need to secure funds quickly
2. **Upgrade needed** - Migrate funds to new contract
3. **Legal requirement** - Court order to freeze/release funds
4. **Security incident** - Suspected attack in progress

**Trade-offs:**
- **Pros:** Fast recovery in emergencies, owner has ultimate control
- **Cons:** Centralization risk, trust required in owner

**Alternative designs:**
- **Time-lock:** Require 24-hour delay before emergency withdrawal
- **Multi-sig:** Require multiple signatures for emergency actions
- **DAO vote:** Require governance approval for emergencies

**Current implementation:**
```solidity
function emergencyWithdraw() public onlyOwner {
    // Withdraws ALL contract funds to owner
    // Individual balances remain recorded but unfunded
    // This is intentional for emergency recovery
}
```

**After emergency withdrawal:**
- Contract still tracks who owned what (balances mapping)
- Owner responsible for manually returning funds
- Members cannot withdraw (no funds in contract)
</details>

---

## 🎯 Key Takeaways

1. **Access control is critical** - Use OpenZeppelin's `Ownable` for battle-tested owner management. Don't roll your own unless you have a good reason.

2. **Always follow Checks-Effects-Interactions** - Validate inputs, update state, then make external calls. This prevents reentrancy even without `nonReentrant`.

3. **Use `call()` for Ether transfers** - Modern Solidity recommends `call()` over `transfer()` due to gas forwarding flexibility.

4. **Events are your audit trail** - Emit events for every state change. They're much cheaper than storage and essential for off-chain monitoring.

5. **Custom errors save gas** - Replace long `require()` strings with custom errors for 50%+ gas savings on failures.

6. **Input validation prevents bugs** - Check for zero addresses, zero amounts, and state consistency before processing.

7. **Emergency functions need careful design** - Balance owner control with decentralization principles. Consider time-locks or multi-sig for production.

---

## 📚 Next Steps

**Before Class 5.3:**
- Understand every line of the FamilyWallet contract
- Think about edge cases (what happens if...?)
- Review OpenZeppelin's ReentrancyGuard implementation
- Read about the DAO hack (famous reentrancy attack): https://www.gemini.com/cryptopedia/the-dao-hack-makerdao

**Coming up in Class 5.3:**
- Write comprehensive tests for FamilyWallet
- Test member management functions
- Test deposit and withdrawal logic
- Simulate reentrancy attacks
- Achieve >80% code coverage
- Use Hardhat fixtures for efficient testing

---

## 📖 Reading References

**Bitcoin Book:**
- Chapter 7: Authorization and Authentication - Multi-signature patterns

**Ethereum Book:**
- Chapter 7: Smart Contracts and Solidity - Security best practices
- Chapter 9: Smart Contract Security - Reentrancy, access control

**OpenZeppelin Documentation:**
- Ownable: https://docs.openzeppelin.com/contracts/5.x/access-control#ownership-and-ownable
- ReentrancyGuard: https://docs.openzeppelin.com/contracts/5.x/api/utils#ReentrancyGuard

**Key Security Resources:**
- Consensys Smart Contract Best Practices: https://consensys.github.io/smart-contract-best-practices/
- SWC Registry (Smart Contract Weakness Classification): https://swcregistry.io/

---

## 🧑‍💻 Teaching Notes (for Claude Code)

**Pacing:**
- 40-50 minutes on concepts (sections 1-7)
- 2-2.5 hours on hands-on implementation (activities 1-5)
- 20-30 minutes for self-assessment and wrap-up

**Common Student Questions:**
1. **"Why not just use one big `balance` instead of per-member balances?"** → Explain accounting and individual tracking
2. **"Can't the owner just steal everyone's money?"** → Yes! Discuss trust, multi-sig, and DAO governance as alternatives
3. **"What if the owner's private key is lost?"** → Contract funds locked forever. Discuss key management and recovery options

**Teaching Emphasis:**
- **Security first:** Explain every security pattern as you implement it
- **Real-world context:** Connect to Week 4 database (events sync to PostgreSQL)
- **Code quality:** Emphasize readable code over clever tricks
- **Gas awareness:** Point out expensive operations (loops, storage writes)

**Live Coding Tips:**
- Build the contract incrementally (don't paste all at once)
- Compile after each major addition
- Show VS Code Solidity extension features (syntax highlighting, compilation errors)
- Demonstrate how to read compiler warnings

**Common Mistakes to Watch:**
- Forgetting `payable` on functions that receive Ether
- Updating state AFTER external calls (reentrancy vulnerability)
- Not checking for zero address in `addMember`
- Using `transfer()` instead of `call()` for Ether transfers

**Connection to Next Class:**
- Emphasize that testing (Class 5.3) will verify all these security measures
- Preview how tests will simulate attacks (reentrancy)
- Mention that deployment (Class 5.4) requires passing all tests first

**Advanced Discussion (if time permits):**
- ERC-4337 account abstraction and how it differs
- Upgradeable contracts using proxies (Week 6 topic)
- Multi-signature wallets (Gnosis Safe) as alternative to single owner

---

*Course Version: 2.0 (30-week structure)*
*Last Updated: January 2025*
*Part of: FamilyChain Blockchain Development Course*
