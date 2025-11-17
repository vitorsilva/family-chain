# Week 5 Learning Notes
## Smart Contract Foundations - Part 1

**Week Duration:** January 11, 2025 - TBD
**Current Status:** Class 5.2 Complete ✅

---

## Session 1: Class 5.1 - Solidity Basics and Development Tools

**Date:** January 11, 2025
**Duration:** ~3-4 hours
**Status:** ✅ Complete

### Activities Completed

1. ✅ **Activity 1:** Created SimpleStorage.sol contract
2. ✅ **Activity 2:** Created DataTypesDemo.sol contract
3. ✅ **Activity 3:** Created FunctionsDemo.sol contract
4. ✅ **Activity 4:** Created EventsDemo.sol contract
5. ✅ **Activity 5:** Installed OpenZeppelin and created SecureWallet.sol
6. ✅ **Self-Assessment Quiz:** Completed (6.5/7)

---

## Key Concepts Learned

### 1. Storage, Memory, and Calldata

**Initial Understanding:**
- User correctly identified that data location affects gas costs and duration
- Made excellent connection to Week 4 concepts (PostgreSQL = storage, Redis = memory)

**Key Insight:**
- Storage = permanent on blockchain (~20,000 gas for writes)
- Memory = temporary during function execution (~3 gas)
- Calldata = read-only function parameters (~3 gas, cheapest)
- Storage is **6,667x more expensive** than memory!

**Mental Model Established:**
- C# class variables = RAM (temporary, lost when app stops)
- Solidity state variables = Blockchain storage (permanent, automatic persistence)
- **Critical difference:** No explicit "save" needed in Solidity - state variables auto-persist!

---

### 2. Modifiers and the `_` Placeholder

**User Question:** "What does the `_;` mean?"

**Understanding Achieved:**
- `_` is a placeholder indicating where the modified function body executes
- Execution order: modifier code before `_` → function body → modifier code after `_`
- Used for access control, validation, and cleanup patterns

**Example Understanding:**
```solidity
modifier onlyOwner() {
    require(msg.sender == owner);  // Runs first
    _;                              // Function body here
}                                   // Cleanup after (if any)
```

**Follow-up Clarification:**
- User asked about `onlyOwner` modifier concept
- Explained it as reusable access control (DRY principle)
- Compared to security guard checking ID before building entry
- Multiple modifiers execute in order (like middleware chain)

---

### 3. Constructor Behavior - Critical Insight!

**User Question:** "The constructor is not like a constructor in C# where it's called every time an object is instantiated, right? It's only called once?"

**Major Breakthrough:**
- ✅ User correctly identified that Solidity constructors run ONLY ONCE at deployment
- Unlike C# where `new MyClass()` runs constructor each time
- Solidity: ONE contract per address, constructor runs once, then code is discarded

**Key Understanding:**
- C# = Multiple instances in RAM (constructor runs per instance)
- Solidity = Single contract on blockchain (constructor runs once at deployment)
- Constructor code is NOT part of deployed bytecode (removed after deployment)
- To get "another instance," must deploy entirely new contract

**Inheritance Understanding:**
```solidity
constructor(address initialOwner) Ownable(initialOwner) {}
//                                 ^^^^^^^^^^^^^^^^^^^^^^
//                                 Calls parent constructor (like C# : base())
```

---

### 4. Payable Keyword and msg.value

**Initial Confusion:**
- User initially thought `payable` on address was about using `msg.value`
- Clarified difference between:
  - `payable` on functions (allows function to receive Ether)
  - `address payable` type (allows sending Ether to that address)

**User Question:** "Explain the `payable` keyword and how it relates to `msg`"

**Understanding Achieved:**
- `msg.value` = Amount of Ether sent with transaction (in wei)
- `msg.sender` = Address calling the function
- Functions without `payable` reject Ether (transaction reverts)
- `address payable` can receive Ether via `.transfer()` or `.send()`

---

### 5. Low-Level Call Syntax

**User Question:** "Explain the syntax: `(bool success, ) = owner.call{value: amount}("");`"

**Complex Syntax Broken Down:**
1. `owner.call("")` = Low-level call to address
2. `{value: amount}` = Send Ether with the call
3. `(bool success, )` = Capture return values (success status, ignore data)

**Understanding Achieved:**
- `.call` is recommended over `.transfer()` or `.send()`
- Forwards all gas (more flexible)
- Returns `(bool success, bytes memory returnData)`
- Why "dangerous": Calls external code you don't control

**Three Ways to Send Ether:**
- `transfer()` - Old, 2300 gas limit (not recommended)
- `send()` - Old, 2300 gas limit (not recommended)
- `call{value: X}("")` - Current best practice (flexible gas)

---

### 6. Events and Indexed Parameters

**User Question:** "What is the indexed keyword? What do you mean by searchable? How can we search events?"

**Excellent Follow-up Questions:**
- "Is it sufficient to set as indexed or does that only happen if we raise an error?"
- "Where are events stored?"

**Understanding Achieved:**
- `indexed` = Creates searchable index (like database index)
- Events stored in transaction receipt logs (NOT contract storage)
- Can filter events by indexed parameters in queries
- **Maximum 3 indexed** parameters per event
- **Only fixed-length types** can be indexed (no strings/arrays directly)
- For strings: Hash first, then index the hash

**Critical Clarification:**
- Events emit when you `emit` them (successful transactions)
- Errors are separate (`revert` causes transaction failure)
- Events ≠ Errors (different purposes)

**Gas Comparison:**
- Storing in state variable: ~20,000 gas
- Emitting event: ~375 gas (**50x cheaper!**)

---

### 7. Allowances Concept

**User Question:** "What is allowances?"

**Real-World Understanding:**
- Allowances = Permission for someone else to spend your tokens
- `mapping(address => mapping(address => uint256))` = owner → spender → amount
- Used in ERC-20 tokens (approve/transferFrom pattern)
- Real example: Approving Uniswap to spend your USDC

**Flow:**
1. Alice approves Bob to spend 20 tokens
2. Bob can call `transferFrom(Alice, Charlie, 10)`
3. Allowance reduces from 20 to 10

---

### 8. ERC-20 Token Standard

**User Question:** "What is an ERC-20 token?"

**Understanding Achieved:**
- ERC-20 = Standard interface for fungible tokens
- Fungible = Interchangeable (1 USDC = any other 1 USDC)
- All ERC-20 tokens have same functions (transfer, approve, balanceOf, etc.)
- Benefits: Wallets, exchanges, DApps work with ALL ERC-20 tokens automatically
- Examples: USDC, DAI, LINK, UNI

---

### 9. ReentrancyGuard Security

**Initial Answer:** "Prevents a contract from calling another contract multiple times without receiving confirmation first"

**Clarified Understanding:**
- Attack is **opposite direction**: Malicious contract calls YOUR function again before it finishes
- Famous DAO hack (2016) - $50 million stolen using reentrancy
- `nonReentrant` modifier uses lock flag to prevent re-entry
- Always use with functions that send Ether or call external contracts

**Best Practice Learned:**
- Checks-Effects-Interactions pattern (update state BEFORE external calls)
- ReentrancyGuard as extra safety layer
- Defense in depth = both patterns together

---

### 10. Mapping Iteration Limitation

**User Question:** "Why can't you iterate over a mapping?"

**Understanding Achieved:**
- Mappings don't store keys (only compute storage locations)
- Storage location = `keccak256(key, slot)`
- Benefits: O(1) lookup, unlimited keys, no initialization cost
- Trade-off: Cannot iterate, no `.length`, can't list all keys

**Workaround:**
- Manually maintain array of keys
- Trade-off: Costs more gas but enables iteration
- Alternative: OpenZeppelin's `EnumerableMap`

**Comparison to PostgreSQL:**
- PostgreSQL: Can `SELECT *`, `COUNT(*)`, filter, sort
- Solidity mapping: Can ONLY get value by specific key

---

## User Questions and Insights

### Excellent Questions Asked:

1. ✅ "Why do we need to specify storage/memory/calldata?" (Connected to gas costs)
2. ✅ "What does `_` mean in modifiers?" (Placeholder for function body)
3. ✅ "Constructor only called once, not like C# objects?" (Critical insight!)
4. ✅ "Explain `payable` and `msg.value`" (Function vs type distinction)
5. ✅ "Explain `(bool success, ) = owner.call{value: amount}("");`" (Complex syntax)
6. ✅ "What is `indexed`? What does searchable mean?" (Events and filtering)
7. ✅ "Is it only stored if we raise an error?" (Events vs errors clarification)
8. ✅ "Where are events stored?" (Transaction logs)
9. ✅ "What is allowances?" (ERC-20 approval pattern)
10. ✅ "What is an ERC-20 token?" (Token standard)

### Key Insights Demonstrated:

1. **Made excellent connections** to previous weeks (Week 4 PostgreSQL/Redis)
2. **Asked clarifying questions** when concepts were unclear
3. **Recognized pattern differences** between C# and Solidity (constructors)
4. **Understood gas optimization** importance early
5. **Grasped security concepts** (reentrancy, access control)

---

## Technical Concepts Mastered

### Solidity Fundamentals
- ✅ Contract structure and organization
- ✅ SPDX license and pragma statements
- ✅ Import statements and OpenZeppelin integration
- ✅ Naming conventions (contracts, functions, variables, modifiers)

### Data Types
- ✅ Value types (uint, int, address, bool, bytes32)
- ✅ Reference types (string, arrays, structs)
- ✅ Mappings (key-value storage)
- ✅ Data locations (storage, memory, calldata)

### Functions
- ✅ Visibility modifiers (public, external, internal, private)
- ✅ State mutability (pure, view, payable)
- ✅ Custom modifiers (onlyOwner, validValue, noReentrancy)
- ✅ Multiple return values
- ✅ Named returns

### Events
- ✅ Event declaration and emission
- ✅ Indexed parameters (up to 3)
- ✅ Gas efficiency (50x cheaper than storage)
- ✅ Filtering and querying

### Security Patterns
- ✅ OpenZeppelin Ownable (access control)
- ✅ OpenZeppelin ReentrancyGuard (reentrancy protection)
- ✅ Custom errors (gas-efficient error handling)
- ✅ Checks-Effects-Interactions pattern

---

## Files Created

### Contracts
1. `contracts/SimpleStorage.sol` - Basic syntax demonstration
2. `contracts/DataTypesDemo.sol` - Data types and locations
3. `contracts/FunctionsDemo.sol` - Functions, modifiers, custom errors
4. `contracts/EventsDemo.sol` - Event logging and indexed parameters
5. `contracts/SecureWallet.sol` - OpenZeppelin integration

### Dependencies Installed
- `@openzeppelin/contracts` (v5.x.x)

---

## Compilation Results

**All contracts compiled successfully:**
```
Compiled 8 Solidity files successfully (evm target: cancun).
```

**Artifacts generated:**
- 5 custom contracts
- 3 OpenZeppelin imports (Ownable, ReentrancyGuard, Context)

---

## Self-Assessment Quiz Results

**Score:** 6.5/7 ⭐⭐⭐⭐⭐

1. ✅ **Memory vs Storage** - Perfect understanding
2. ✅ **Pure vs View vs Regular** - Perfect understanding
3. ✅ **The `_` placeholder** - Perfect understanding
4. ✅ **Indexed parameters** - Perfect with clarification
5. ⚠️ **Address vs Address Payable** - Good concept, needed clarification
6. ⚠️ **ReentrancyGuard** - Right idea, refined understanding
7. ℹ️ **Mapping iteration** - Learned during quiz

---

## Key Takeaways

### Most Important Concepts:
1. **Data location = gas costs** - Storage 6,667x more expensive than memory
2. **Constructors run once** - Not like C# objects (critical mental model shift!)
3. **OpenZeppelin is essential** - Don't reinvent security patterns
4. **Events are cheap logging** - 50x cheaper than storage
5. **ReentrancyGuard prevents $50M hacks** - Always use with external calls
6. **Mappings can't iterate** - Must manually track keys if needed

### Mental Models Established:
- Storage = PostgreSQL (permanent, expensive)
- Memory = Redis (temporary, cheap)
- Calldata = Read-only parameters (cheapest)
- Constructor = One-time initialization (not per-instance like C#)
- Events = Transaction logs (not contract storage)
- Mappings = Key-value lookup only (no iteration)

---

## Issues Encountered

### Issue 1: Understanding Compilation Output
**Question:** "How do I know it compiled SimpleStorage? Only seeing if it's in artifacts folder?"

**Resolution:**
- Hardhat only recompiles changed files (smart optimization)
- "Nothing to compile" = files already up-to-date
- Use `npx hardhat clean` then `npx hardhat build` to rebuild everything
- Check `artifacts/contracts/` for compiled contracts

### Issue 2: `payable` vs `address payable` Confusion
**Initial confusion:** Mixed up function `payable` with `address payable` type

**Resolution:**
- Function `payable` = allows function to receive Ether
- `address payable` = address type that can receive Ether via `.transfer()`
- Separate concepts serving different purposes

---

## Time Breakdown

- **Theory (Sections 1-8):** ~45 minutes
- **Activity 1 (SimpleStorage):** ~20 minutes
- **Activity 2 (DataTypesDemo):** ~20 minutes (includes mapping/allowances discussion)
- **Activity 3 (FunctionsDemo):** ~35 minutes (includes payable/call syntax deep dive)
- **Activity 4 (EventsDemo):** ~25 minutes (includes indexed/ERC-20 discussion)
- **Activity 5 (OpenZeppelin):** ~30 minutes (includes constructor inheritance)
- **Self-Assessment Quiz:** ~30 minutes

**Total:** ~3-3.5 hours (within estimated 3-4 hours)

---

## Next Steps

**Class 5.2: Writing the Family Wallet Contract** (4-5 hours)
- Design FamilyWallet contract architecture
- Implement access control and multi-user support
- Add deposit and withdrawal functionality
- Emit events for transaction tracking
- Apply all concepts learned in Class 5.1

**Prerequisites Completed:**
- ✅ All 5 contracts compile successfully
- ✅ OpenZeppelin installed and working
- ✅ Understanding of modifiers, events, and security patterns
- ✅ Solid grasp of Solidity fundamentals

---

## Personal Notes

### Learning Style Observations:
- **Asks clarifying questions** when concepts are unclear (excellent!)
- **Makes connections** to previous material (Week 4 database concepts)
- **Recognizes patterns** and differences from other languages (C#)
- **Challenges assumptions** ("Constructor only called once?") - critical thinking!
- **Seeks deeper understanding** beyond surface-level explanations

### Areas of Strength:
1. Gas optimization awareness (understands why it matters)
2. Security pattern recognition (reentrancy, access control)
3. Connecting blockchain to traditional programming concepts
4. Asking "why" not just "how"

### Teaching Adjustments Made:
1. Provided real-world analogies (library card catalog for indexed)
2. Used C# comparisons when explaining Solidity concepts
3. Broke down complex syntax step-by-step (`.call{value}("")`)
4. Connected to Week 4 concepts (PostgreSQL, Redis)
5. Emphasized security early (DAO hack, reentrancy)

---

**Session End:** January 11, 2025
**Next Session:** Class 5.2 - Writing the Family Wallet Contract
**Status:** Ready to proceed when user returns from break

---

## Session 2: Class 5.2 - Writing the Family Wallet Contract

**Date:** November 17, 2025
**Duration:** ~1.5 hours
**Status:** ✅ Complete

### Activities Completed

1. ✅ **Activity 1:** Created basic FamilyWallet structure with state variables and events
2. ✅ **Activity 2:** Implemented member management (addMember, removeMember)
3. ✅ **Activity 3:** Implemented deposit functionality
4. ✅ **Activity 4:** Implemented withdrawal with reentrancy protection
5. ✅ **Activity 5:** Added owner withdrawal (parental control)
6. ✅ **Activity 6:** Added helper view functions

---

## Key Concepts Learned

### 1. Dual Data Structures for Members

**User Insight:** Correctly identified why we need both mapping AND array:
- `familyMembers` mapping → O(1) lookup for membership check
- `memberList` array → Enables iteration (list all members, count them)

**Trade-off understood:** Extra gas to maintain both, but gains important functionality for UI/frontend.

---

### 2. Contract Architecture Design Decision

**Critical Discussion:** Owner as separate role vs. family member

**Option A:** Owner IS automatically a family member
- Simpler but less flexible
- Constructor adds owner to memberList

**Option B:** Owner is SEPARATE (chosen design)
- Owner is administrator role
- Owner can optionally add themselves as member
- Cleaner separation of concerns
- More flexible for different use cases

**User's Reasoning:**
- Caught logical inconsistency in learning guide
- Asked "shouldn't owner be able to add themselves if Option B?"
- Correctly identified that preventing owner from being member contradicts flexibility goal

**Resolution:** Removed `OwnerCannotBeMember` check entirely, allowing owner to optionally join as member.

---

### 3. Bug Detection in Learning Guide

**User Caught Error:**
```solidity
// WRONG (in original guide):
if (member == owner()) revert CannotRemoveOwner();  // In addMember - wrong error!

// CORRECT:
// Either use proper error name or remove check entirely
```

**User's observation:** "Shouldn't it be AlreadyAMember since owner was created in constructor?"

This led to the architecture discussion above and better contract design.

---

### 4. Checks-Effects-Interactions Pattern

**Understanding Demonstrated:**

User correctly explained why we update balance BEFORE external call:
> "We first remove the value from our side (balances[]) so that if other call is made to the contract before the transfer is made, the balance already reflects what is expected"

**Reentrancy Attack Prevention:**
1. CHECKS - Validate all inputs
2. EFFECTS - Update state (balance -= amount)
3. INTERACTIONS - External call (send Ether)

If reversed, attacker could re-enter and drain contract.

---

### 5. Unsigned Integer Safety

**User Question:** "Shouldn't we test if msg.value < 0?"

**Understanding Achieved:**
- `uint256` is unsigned - cannot be negative by definition
- Compiler/EVM enforces this at protocol level
- Eliminates entire class of edge cases
- Only need to check for zero (if that's invalid)

---

### 6. View Functions and Gas Costs

**User Understanding:**
> "They are marked as view to say that they don't affect state, and in this way they cost a lot less"

**Clarification Added:**
- `view` functions cost **zero gas** when called externally
- Only cost gas if called from within a transaction
- Perfect for frontend queries (free balance checks)

---

### 7. OpenZeppelin Constructor Inheritance

**User Question:** "What does `Ownable(initialOwner)` do in the constructor?"

**Understanding via Documentation:**
- Similar to C#'s `: base(initialOwner)` syntax
- Passes initial owner to parent Ownable contract
- Ownable stores this internally and provides `onlyOwner` modifier
- Official docs: https://docs.openzeppelin.com/contracts/5.x/api/access#Ownable

---

## User Questions and Insights

### Excellent Questions Asked:

1. ✅ "Why do we need both mapping and array for members?" (Dual data structure reasoning)
2. ✅ "Shouldn't the error be AlreadyAMember, not CannotRemoveOwner?" (Bug detection!)
3. ✅ "If owner is separate, shouldn't they be able to add themselves?" (Logical consistency)
4. ✅ "What does Ownable(initialOwner) do?" (Constructor inheritance)
5. ✅ "Shouldn't we test if msg.value < 0?" (Unsigned integer understanding)
6. ✅ "Why update balance BEFORE external call?" (Reentrancy protection)
7. ✅ "Why send to msg.sender in ownerWithdraw?" (Security design)

### Key Insights Demonstrated:

1. **Caught bug in learning guide** - Critical thinking about error naming
2. **Questioned design decisions** - Not accepting things at face value
3. **Connected concepts** - Linked mapping limitations from Class 5.1
4. **Security awareness** - Understood reentrancy attack vector
5. **Type system understanding** - Grasped unsigned integer implications

---

## Technical Concepts Mastered

### Contract Architecture
- ✅ Multi-role access control (Owner vs Members)
- ✅ Dual data structures (mapping + array for different use cases)
- ✅ Event-driven design for off-chain monitoring
- ✅ Custom errors for gas efficiency

### Security Patterns
- ✅ Checks-Effects-Interactions pattern
- ✅ ReentrancyGuard (nonReentrant modifier)
- ✅ Input validation (zero address, zero amount, insufficient balance)
- ✅ Owner-only administrative functions

### Solidity Specifics
- ✅ Constructor inheritance with OpenZeppelin
- ✅ Payable functions for receiving Ether
- ✅ View functions for gas-free queries
- ✅ Safe Ether transfer with `.call{value: amount}("")`

---

## Files Created/Modified

### Contracts
- `contracts/FamilyWallet.sol` - Complete family wallet implementation

### Contract Features Implemented
1. **State Variables:**
   - `familyMembers` mapping (address => bool)
   - `balances` mapping (address => uint256)
   - `memberList` array (address[])

2. **Events:**
   - MemberAdded (indexed member, timestamp)
   - MemberRemoved (indexed member, timestamp)
   - Deposited (indexed member, amount, newBalance, timestamp)
   - Withdrawn (indexed member, amount, remainingBalance, timestamp)

3. **Custom Errors:**
   - NotAMember()
   - AlreadyAMember()
   - ZeroAddress()
   - ZeroAmount()
   - InsufficientBalance(uint256 requested, uint256 available)
   - CannotRemoveOwner()

4. **Functions:**
   - addMember() - Owner only
   - removeMember() - Owner only
   - deposit() - Members only, payable
   - withdraw() - Members only, nonReentrant
   - ownerWithdraw() - Owner only, nonReentrant
   - isMember() - View
   - getMembers() - View
   - getMemberCount() - View
   - getBalance() - View
   - getTotalBalance() - View

---

## Compilation Results

**Final Build:**
```
Compiled 7 Solidity files with solc 0.8.28 (evm target: cancun)
Compiled 1 Solidity file with solc 0.8.28 (evm target: cancun)
```

**All contracts compiling:**
- HelloFamily.sol
- SimpleStorage.sol
- DataTypesDemo.sol
- FunctionsDemo.sol
- SecureWallet.sol
- FamilyWallet.sol (NEW)
- OpenZeppelin imports

---

## Issues Encountered

### Issue 1: Learning Guide Bug
**Problem:** `addMember` had wrong custom error (`CannotRemoveOwner` instead of something like `OwnerCannotBeMember`)

**Resolution:** User caught it, led to architecture redesign where we allow owner to optionally add themselves as member.

### Issue 2: Logical Inconsistency
**Problem:** Option B design said owner can add themselves, but code prevented it

**Resolution:** Removed the restriction, making design consistent with stated goals.

---

## Time Breakdown

- **Architecture discussion:** ~20 minutes (owner as member vs separate)
- **Activity 1 (Structure):** ~15 minutes
- **Activity 2 (Member Management):** ~20 minutes (included bug fix discussion)
- **Activity 3 (Deposit):** ~10 minutes
- **Activity 4 (Withdraw):** ~15 minutes (reentrancy discussion)
- **Activity 5 (Owner Withdraw):** ~5 minutes
- **Activity 6 (Helper Functions):** ~5 minutes

**Total:** ~1.5 hours (faster than estimated 3-4 hours due to solid Class 5.1 foundation)

---

## Key Takeaways

### Most Important Concepts:
1. **Dual data structures solve mapping limitations** - Array for iteration, mapping for O(1) lookup
2. **Design decisions have trade-offs** - Flexibility vs. simplicity in role separation
3. **Question everything** - Even learning guides can have bugs!
4. **Checks-Effects-Interactions is critical** - Order matters for security
5. **Type system helps** - uint256 eliminates negative value bugs
6. **View functions are free** - Great for frontend queries

### Design Decisions Made:
- Owner is SEPARATE from members (can optionally join)
- Members tracked in both mapping (fast lookup) and array (iteration)
- Parental control via ownerWithdraw sends funds to owner, not member
- Custom errors over require strings for gas efficiency

---

## Next Steps

**Class 5.3: Testing Smart Contracts** (4-5 hours)
- Write comprehensive tests for FamilyWallet
- Test all functions and edge cases
- Test security (reentrancy attempts)
- Use Hardhat testing framework
- Apply knowledge from Week 3 testing

**Prerequisites Completed:**
- ✅ FamilyWallet.sol complete and compiling
- ✅ Understanding of all contract features
- ✅ Security patterns implemented
- ✅ Ready to verify functionality with tests

---

## Personal Notes

### Learning Style Observations:
- **Catches inconsistencies** - Spotted bug in learning guide immediately
- **Questions design decisions** - Doesn't accept things without understanding why
- **Thinks through implications** - Considered practical usage scenarios
- **Builds on previous knowledge** - Connected mapping limitations from 5.1

### Areas of Strength:
1. Critical thinking about code correctness
2. Understanding security implications
3. Connecting concepts across classes
4. Asking clarifying questions
5. Validating design decisions against use cases

### Teaching Adjustments Made:
1. Allowed user to drive architecture decisions
2. Provided options rather than single answers
3. Used context7 MCP for official OpenZeppelin docs
4. Validated user's bug finding rather than dismissing
5. Kept activities focused on core functionality

---

**Session End:** November 17, 2025
**Next Session:** Class 5.3 - Testing Smart Contracts
**Status:** FamilyWallet complete, ready for comprehensive testing

---

*These notes capture the actual learning experience, questions asked, and insights gained during Week 5, Class 5.2.*
