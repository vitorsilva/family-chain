# Week 5 - Class 5.1: Solidity Basics and Development Tools

**Duration:** 3-4 hours
**Prerequisites:** Week 1-4 completed, Hardhat 3.0.8 installed, basic programming knowledge
**Why It Matters:** Solidity is the primary language for writing Ethereum smart contracts. Understanding its syntax, data types, and patterns is essential for building secure, efficient contracts.

---

## 📋 Learning Objectives

By the end of this class, you will be able to:

1. Understand Solidity's syntax, structure, and naming conventions
2. Use Solidity data types appropriately (uint, address, bool, strings, arrays, mappings)
3. Write functions with proper visibility and state mutability modifiers
4. Create and use custom modifiers for access control and validation
5. Emit and listen for events in smart contracts
6. Understand the difference between storage, memory, and calldata
7. Use OpenZeppelin libraries for secure contract development

---

## 🎯 Key Concepts

### 1. What is Solidity?

**Solidity** is a statically-typed, contract-oriented programming language designed for writing smart contracts on Ethereum and other EVM-compatible blockchains.

**Key Characteristics:**
- **Statically-typed:** Types must be declared (unlike JavaScript)
- **Object-oriented:** Contracts are like classes in OOP
- **Compiled language:** Solidity compiles to EVM bytecode
- **Influenced by:** JavaScript, C++, and Python
- **Current stable version:** 0.8.28 (as of this course)

**Bitcoin Script vs Solidity:**

| Aspect | Bitcoin Script | Solidity |
|--------|---------------|----------|
| **Paradigm** | Stack-based, procedural | Object-oriented, stateful |
| **Turing Complete** | No (no loops) | Yes (with loops, conditions) |
| **State** | Stateless | Stateful (storage variables) |
| **Complexity** | Simple conditions | Complex business logic |
| **Use Case** | Authorization/authentication | Full applications (DeFi, NFTs, DAOs) |

### 2. Contract Structure

Every Solidity contract follows this basic structure:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Contract definition
contract MyContract is Ownable {
    // State variables
    uint256 public value;

    // Events
    event ValueChanged(uint256 newValue);

    // Modifiers
    modifier validValue(uint256 _value) {
        require(_value > 0, "Value must be positive");
        _;
    }

    // Constructor
    constructor(address initialOwner) Ownable(initialOwner) {}

    // Functions
    function setValue(uint256 _value) public onlyOwner validValue(_value) {
        value = _value;
        emit ValueChanged(_value);
    }
}
```

**Component Order (Style Guide):**
1. SPDX license identifier
2. Pragma statement (compiler version)
3. Import statements
4. Interfaces, libraries, contracts
5. Inside contracts:
   - Type declarations (structs, enums)
   - State variables
   - Events
   - Errors (custom)
   - Modifiers
   - Constructor
   - Functions (grouped by visibility)

### 3. Data Types

#### **Value Types**

| Type | Description | Example | Range |
|------|-------------|---------|-------|
| `uint` / `uint256` | Unsigned integer | `uint256 count = 100;` | 0 to 2^256-1 |
| `int` / `int256` | Signed integer | `int256 balance = -50;` | -2^255 to 2^255-1 |
| `address` | Ethereum address | `address owner = 0x123...;` | 20 bytes |
| `address payable` | Address that can receive Ether | `address payable recipient;` | 20 bytes |
| `bool` | Boolean | `bool isActive = true;` | true or false |
| `bytes32` | Fixed-size byte array | `bytes32 hash;` | 32 bytes |
| `string` | Dynamic string | `string name = "Alice";` | Variable |
| `bytes` | Dynamic byte array | `bytes data;` | Variable |

#### **Reference Types (require location specifier)**

```solidity
// Storage - persistent, expensive
uint256[] storage myStorageArray;

// Memory - temporary, cheaper (function scope)
uint256[] memory myMemoryArray = new uint256[](5);

// Calldata - read-only, cheapest (external function params)
function process(uint256[] calldata data) external { }
```

#### **Mappings (key-value storage)**

```solidity
// Mapping declaration
mapping(address => uint256) public balances;
mapping(uint256 => address) public tokenOwners;

// Nested mapping
mapping(address => mapping(address => uint256)) public allowances;

// Usage
balances[msg.sender] = 100;
uint256 myBalance = balances[msg.sender]; // Returns 0 if not set
```

**Important:** Mappings don't have a length and can't be iterated over!

### 4. Functions

#### **Function Visibility**

| Modifier | Description | Callable From |
|----------|-------------|---------------|
| `public` | Accessible everywhere | Internal + External |
| `external` | Only from outside contract | External only (gas efficient) |
| `internal` | Only within contract + derived contracts | Internal only |
| `private` | Only within contract | This contract only |

#### **State Mutability**

| Modifier | Description | Reads State? | Writes State? | Sends Ether? |
|----------|-------------|--------------|---------------|--------------|
| `pure` | No state access | ❌ | ❌ | ❌ |
| `view` | Reads but doesn't modify | ✅ | ❌ | ❌ |
| (none) | Can modify state | ✅ | ✅ | ✅ |
| `payable` | Can receive Ether | ✅ | ✅ | ✅ |

```solidity
// Pure function - no state access
function add(uint256 a, uint256 b) public pure returns (uint256) {
    return a + b;
}

// View function - reads state
function getBalance() public view returns (uint256) {
    return balances[msg.sender];
}

// State-changing function
function setBalance(uint256 amount) public {
    balances[msg.sender] = amount;
}

// Payable function - can receive Ether
function deposit() public payable {
    balances[msg.sender] += msg.value;
}
```

#### **Function Parameters and Returns**

```solidity
// Single return value
function getValue() public view returns (uint256) {
    return value;
}

// Multiple return values
function getInfo() public view returns (uint256, string memory, bool) {
    return (value, name, isActive);
}

// Named returns (automatically declared)
function calculate(uint256 x) public pure returns (uint256 result) {
    result = x * 2; // No need for explicit return
}
```

### 5. Modifiers

**Modifiers** alter the behavior of functions declaratively. They're commonly used for:
- Access control
- Input validation
- State checks
- Reentrancy guards

```solidity
// Simple modifier
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _; // Function body executes here
}

// Modifier with parameters
modifier validAmount(uint256 amount) {
    require(amount > 0, "Amount must be positive");
    require(amount <= maxAmount, "Amount too large");
    _;
}

// Modifier with post-execution logic
modifier noReentrancy() {
    require(!locked, "Reentrant call");
    locked = true;
    _; // Function executes
    locked = false; // Cleanup after function
}

// Using modifiers
function withdraw(uint256 amount)
    public
    onlyOwner
    validAmount(amount)
    noReentrancy
{
    // Function logic
}
```

### 6. Events

**Events** provide logging functionality for the EVM. They're crucial for:
- Frontend notifications
- Blockchain indexing (subgraphs, The Graph)
- Debugging and monitoring
- Cheap storage (vs state variables)

```solidity
// Event declaration
event Transfer(address indexed from, address indexed to, uint256 value);
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

// Emitting events
function transfer(address to, uint256 amount) public {
    require(balances[msg.sender] >= amount, "Insufficient balance");

    balances[msg.sender] -= amount;
    balances[to] += amount;

    emit Transfer(msg.sender, to, amount); // Emit event
}
```

**Indexed Parameters:**
- Up to 3 parameters can be `indexed`
- Indexed parameters can be filtered in queries
- Non-indexed parameters are cheaper but not searchable

### 7. Storage, Memory, and Calldata

Understanding data location is critical for gas optimization:

```solidity
contract DataLocations {
    // Storage - persistent across function calls
    uint256[] public storageArray;

    function exampleStorage() public {
        // Reference to storage
        uint256[] storage localRef = storageArray;
        localRef.push(1); // Modifies storageArray directly
    }

    function exampleMemory() public {
        // Memory copy - temporary
        uint256[] memory tempArray = new uint256[](5);
        tempArray[0] = 1; // Only exists during function execution
    }

    // Calldata - read-only, for external function parameters
    function exampleCalldata(uint256[] calldata data) external pure {
        // data[0] = 1; // ERROR: Cannot modify calldata
        uint256 first = data[0]; // Can read
    }
}
```

**Gas Cost Comparison:**

| Operation | Relative Cost |
|-----------|---------------|
| Read from calldata | 🟢 Cheapest (3 gas) |
| Read from memory | 🟡 Cheap (3 gas) |
| Read from storage | 🔴 Expensive (200-2100 gas) |
| Write to storage | 🔴🔴 Very expensive (5,000-20,000 gas) |

### 8. Naming Conventions

Following Solidity style guide improves readability:

| Element | Convention | Example |
|---------|-----------|---------|
| Contracts | CapWords | `FamilyWallet`, `TokenFactory` |
| Interfaces | CapWords with `I` prefix | `IUniswapV2Router` |
| Libraries | CapWords | `SafeMath`, `Strings` |
| Functions | mixedCase | `transfer`, `getBalance` |
| Variables | mixedCase | `totalSupply`, `ownerAddress` |
| Constants | ALL_CAPS | `MAX_SUPPLY`, `DECIMALS` |
| Private/Internal | Leading underscore | `_balances`, `_mint` |
| Events | CapWords | `Transfer`, `Approval` |
| Modifiers | mixedCase | `onlyOwner`, `whenNotPaused` |

---

## 🛠️ Hands-On Activities

### Activity 1: Create Your First Solidity Contract (20 minutes)

**Objective:** Write a simple storage contract demonstrating basic Solidity syntax.

**Step 1:** Create the contract file

```powershell
# Navigate to contracts directory
cd C:\Users\vitor410rodrigues\source\repos\FamilyChain

# Create new contract file
New-Item -Path "contracts\SimpleStorage.sol" -ItemType File
```

**Step 2:** Write the contract code

Open `contracts/SimpleStorage.sol` in VS Code and write:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title SimpleStorage
 * @notice A basic contract demonstrating Solidity fundamentals
 */
contract SimpleStorage {
    // State variable - stored on blockchain
    uint256 private storedData;
    address public owner;

    // Event - emitted when data changes
    event DataStored(uint256 indexed oldValue, uint256 indexed newValue, address indexed setter);

    // Modifier - access control
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    // Constructor - runs once at deployment
    constructor() {
        owner = msg.sender;
        storedData = 0;
    }

    /**
     * @notice Store a new value
     * @param x The value to store
     */
    function set(uint256 x) public onlyOwner {
        uint256 oldValue = storedData;
        storedData = x;
        emit DataStored(oldValue, x, msg.sender);
    }

    /**
     * @notice Retrieve the stored value
     * @return The stored value
     */
    function get() public view returns (uint256) {
        return storedData;
    }

    /**
     * @notice Increment the stored value by 1
     */
    function increment() public onlyOwner {
        uint256 oldValue = storedData;
        storedData += 1;
        emit DataStored(oldValue, storedData, msg.sender);
    }
}
```

**Step 3:** Compile the contract

```powershell
npx hardhat build
```

**Expected Output:**
```
Compiled 1 Solidity file successfully (evm target: paris).
```

### Activity 2: Explore Data Types (15 minutes)

**Objective:** Understand different Solidity data types through practical examples.

Create `contracts/DataTypesDemo.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DataTypesDemo {
    // Value types
    uint256 public myUint = 123;
    int256 public myInt = -456;
    address public myAddress = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    bool public myBool = true;
    bytes32 public myBytes32 = "Hello";

    // Reference types
    string public myString = "Hello, Solidity!";
    uint256[] public myArray;

    // Mapping
    mapping(address => uint256) public balances;

    // Struct
    struct Person {
        string name;
        uint256 age;
        address wallet;
    }

    Person public person;

    constructor() {
        // Initialize array
        myArray.push(1);
        myArray.push(2);
        myArray.push(3);

        // Initialize mapping
        balances[msg.sender] = 100;

        // Initialize struct
        person = Person("Alice", 30, msg.sender);
    }

    // Function demonstrating memory vs storage
    function modifyArray() public {
        // Memory copy - doesn't affect myArray
        uint256[] memory tempArray = myArray;
        tempArray[0] = 999; // Only changes memory, not storage

        // Storage reference - modifies myArray directly
        uint256[] storage storageRef = myArray;
        storageRef[0] = 999; // Changes persistent storage
    }

    // Function with calldata (read-only)
    function processData(uint256[] calldata data) external pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < data.length; i++) {
            sum += data[i];
        }
        return sum;
    }
}
```

Compile and note the different data types:

```powershell
npx hardhat build
```

### Activity 3: Functions and Modifiers (25 minutes)

**Objective:** Master function visibility, state mutability, and custom modifiers.

Create `contracts/FunctionsDemo.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract FunctionsDemo {
    uint256 private value;
    address public owner;
    bool private locked;

    event ValueChanged(uint256 newValue);

    // Custom error (more gas efficient than require strings)
    error Unauthorized();
    error InvalidValue(uint256 provided, uint256 minimum);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier validValue(uint256 _value) {
        if (_value == 0) revert InvalidValue(_value, 1);
        _;
    }

    modifier noReentrancy() {
        require(!locked, "No reentrancy");
        locked = true;
        _;
        locked = false;
    }

    constructor() {
        owner = msg.sender;
    }

    // Pure function - no state access
    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }

    // View function - reads state, doesn't modify
    function getValue() public view returns (uint256) {
        return value;
    }

    // State-changing function with modifiers
    function setValue(uint256 _value)
        public
        onlyOwner
        validValue(_value)
    {
        value = _value;
        emit ValueChanged(_value);
    }

    // Multiple return values
    function getInfo() public view returns (
        uint256 currentValue,
        address currentOwner,
        bool isLocked
    ) {
        return (value, owner, locked);
    }

    // Named returns
    function calculate(uint256 x) public pure returns (uint256 doubled, uint256 tripled) {
        doubled = x * 2;
        tripled = x * 3;
        // No explicit return needed
    }

    // Payable function
    function deposit() public payable {
        // msg.value contains the Ether sent
        require(msg.value > 0, "Must send Ether");
    }

    // Function with reentrancy protection
    function dangerousWithdraw() public onlyOwner noReentrancy {
        // Protected against reentrancy attacks
        uint256 amount = address(this).balance;
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
```

Compile:

```powershell
npx hardhat build
```

### Activity 4: Events and Logging (20 minutes)

**Objective:** Learn to emit and structure events for off-chain monitoring.

Create `contracts/EventsDemo.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract EventsDemo {
    // Events with indexed parameters (up to 3)
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    // Event with non-indexed data (cheaper, but not searchable)
    event DataUpdated(
        uint256 indexed id,
        string oldData,  // Not indexed - cheaper storage
        string newData   // Not indexed
    );

    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;
    mapping(uint256 => string) public data;

    constructor() {
        balances[msg.sender] = 1000;
    }

    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        balances[to] += amount;

        // Emit event - logged on blockchain
        emit Transfer(msg.sender, to, amount);
    }

    function approve(address spender, uint256 amount) public {
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
    }

    function updateData(uint256 id, string memory newData) public {
        string memory oldData = data[id];
        data[id] = newData;
        emit DataUpdated(id, oldData, newData);
    }
}
```

Compile:

```powershell
npx hardhat build
```

### Activity 5: OpenZeppelin Integration (30 minutes)

**Objective:** Use battle-tested OpenZeppelin contracts for security patterns.

**Step 1:** Install OpenZeppelin Contracts

```powershell
npm install --save-dev @openzeppelin/contracts
```

**Step 2:** Create a contract using OpenZeppelin

Create `contracts/SecureWallet.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SecureWallet
 * @notice Demonstrates OpenZeppelin security patterns
 */
contract SecureWallet is Ownable, ReentrancyGuard {
    mapping(address => uint256) public balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Deposit Ether into the wallet
     */
    function deposit() public payable {
        require(msg.value > 0, "Must send Ether");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw your balance (protected from reentrancy)
     */
    function withdraw(uint256 amount) public nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Owner can withdraw all funds (emergency)
     */
    function emergencyWithdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Get contract balance
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
```

**Step 3:** Compile

```powershell
npx hardhat build
```

**Expected Output:**
```
Compiled 3 Solidity files successfully (evm target: paris).
```

**Step 4:** Verify OpenZeppelin integration

```powershell
# Check that OpenZeppelin contracts were compiled
ls artifacts/@openzeppelin/contracts
```

---

## ✅ Expected Outputs

After completing all activities, you should have:

1. **5 compiled contracts:**
   - `SimpleStorage.sol` - Basic syntax demonstration
   - `DataTypesDemo.sol` - Data types exploration
   - `FunctionsDemo.sol` - Functions and modifiers
   - `EventsDemo.sol` - Event logging
   - `SecureWallet.sol` - OpenZeppelin integration

2. **Compiled artifacts in:**
   - `artifacts/contracts/` directory
   - `cache/` directory with build info

3. **Understanding of:**
   - Solidity syntax and structure
   - Data types and data locations
   - Function visibility and state mutability
   - Custom modifiers for validation
   - Event emission and logging
   - OpenZeppelin security patterns

---

## 📦 Deliverables

- [ ] All 5 contracts compile without errors
- [ ] Understand the difference between storage, memory, and calldata
- [ ] Can write functions with appropriate visibility modifiers
- [ ] Can create and use custom modifiers
- [ ] Can emit events with indexed parameters
- [ ] Successfully integrated OpenZeppelin contracts
- [ ] Can explain when to use `pure`, `view`, and `payable` functions

---

## ⚠️ Common Issues & Solutions

### Issue 1: Compiler Version Mismatch

**Error:**
```
Error HH606: The project cannot be compiled, see reasons below.
Solidity 0.8.28 is not supported
```

**Solution:**
```powershell
# Update hardhat.config.ts to include 0.8.28
# Edit hardhat.config.ts and add:
compilers: [
  { version: "0.8.28" }
]

# Clean and rebuild
npx hardhat clean
npx hardhat build
```

### Issue 2: OpenZeppelin Import Not Found

**Error:**
```
Error HH411: Cannot find module '@openzeppelin/contracts/access/Ownable.sol'
```

**Solution:**
```powershell
# Install OpenZeppelin
npm install --save-dev @openzeppelin/contracts

# Verify installation
npm list @openzeppelin/contracts
```

### Issue 3: Stack Too Deep Error

**Error:**
```
CompilerError: Stack too deep when compiling inline assembly
```

**Solution:**
```solidity
// Too many local variables in one function
// Solution: Break into smaller functions or use structs

// Instead of:
function complex(uint256 a, uint256 b, uint256 c, uint256 d, uint256 e) {
    uint256 result1 = a + b;
    uint256 result2 = c + d;
    uint256 result3 = e * 2;
    // ... more variables
}

// Do:
function complex(uint256 a, uint256 b, uint256 c, uint256 d, uint256 e) {
    uint256 result1 = _calculate1(a, b);
    uint256 result2 = _calculate2(c, d, e);
}
```

### Issue 4: Gas Estimation Failed

**Error:**
```
Error: Transaction reverted without a reason string
```

**Solution:**
```solidity
// Add require messages for better debugging
require(msg.sender == owner, "Not authorized"); // Good
require(msg.sender == owner); // Bad - no error message

// Or use custom errors (more gas efficient)
error Unauthorized();
if (msg.sender != owner) revert Unauthorized();
```

---

## 🎓 Self-Assessment Quiz

Test your understanding before moving to Class 5.2:

<details>
<summary><strong>Question 1:</strong> What's the difference between <code>memory</code> and <code>storage</code>?</summary>

**Answer:**
- **Storage:** Persistent data stored on the blockchain. Expensive to write/read. Used for state variables.
- **Memory:** Temporary data that exists only during function execution. Cheaper than storage. Erased after function completes.
- **Example:** Arrays declared with `memory` are temporary copies; arrays declared with `storage` reference the actual state variable.

**Gas costs:** Storage writes cost 20,000 gas, memory writes cost ~3 gas.
</details>

<details>
<summary><strong>Question 2:</strong> When should you use <code>pure</code> vs <code>view</code> vs regular functions?</summary>

**Answer:**
- **`pure`:** Function doesn't read or modify state. Example: `function add(uint a, uint b) pure returns (uint) { return a + b; }`
- **`view`:** Function reads state but doesn't modify it. Example: `function getBalance() view returns (uint) { return balance; }`
- **Regular (no modifier):** Function can both read and modify state. Example: `function deposit() payable { balance += msg.value; }`

**Rule:** Use the most restrictive modifier possible for gas optimization and clarity.
</details>

<details>
<summary><strong>Question 3:</strong> What does the <code>_</code> symbol mean in a modifier?</summary>

**Answer:**
The `_` is a placeholder for where the modified function's code will execute.

**Example:**
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _; // Function body executes here
}
```

**Execution order:**
1. Modifier code before `_` runs
2. Function body executes
3. Modifier code after `_` runs (if any)

This is useful for checks (before) and cleanup (after).
</details>

<details>
<summary><strong>Question 4:</strong> Why use <code>indexed</code> parameters in events?</summary>

**Answer:**
`indexed` parameters can be filtered and searched in event logs.

**Benefits:**
- Frontend can filter events by indexed parameters
- Block explorers can index and search
- Subgraphs can create efficient queries

**Limitations:**
- Maximum 3 indexed parameters per event
- Costs slightly more gas
- Non-indexed parameters are cheaper but not searchable

**Example:**
```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
// Can filter: "Show all transfers FROM this address" ✅
// Cannot filter by value (not indexed) ❌
```
</details>

<details>
<summary><strong>Question 5:</strong> What's the difference between <code>address</code> and <code>address payable</code>?</summary>

**Answer:**
- **`address`:** Can store an Ethereum address but cannot receive Ether directly
- **`address payable`:** Can store an address AND receive Ether via `.transfer()` or `.send()`

**Example:**
```solidity
address user = 0x123...;
address payable recipient = payable(0x456...);

// user.transfer(1 ether); // ERROR: address doesn't have transfer
recipient.transfer(1 ether); // OK: address payable has transfer
```

**Conversion:** `address payable(myAddress)` converts address to payable.
</details>

<details>
<summary><strong>Question 6:</strong> What security pattern does OpenZeppelin's <code>ReentrancyGuard</code> provide?</summary>

**Answer:**
Prevents **reentrancy attacks** where a malicious contract calls back into your function before the first execution completes.

**How it works:**
```solidity
bool private locked;

modifier nonReentrant() {
    require(!locked, "Reentrant call");
    locked = true;
    _;
    locked = false;
}
```

**Attack scenario prevented:**
1. User calls `withdraw(100)`
2. Contract sends 100 Ether to user
3. User's fallback function calls `withdraw(100)` again (reentrancy!)
4. Without guard: succeeds (double withdrawal)
5. With guard: reverts (locked = true)

**Use case:** Any function that makes external calls (transfers, calls to other contracts).
</details>

<details>
<summary><strong>Question 7:</strong> Why can't you iterate over a mapping?</summary>

**Answer:**
Mappings in Solidity don't store keys, only values. The storage location of a value is computed using `keccak256(key, slot)`, making iteration impossible.

**Workaround: Use an array to track keys**
```solidity
mapping(address => uint256) public balances;
address[] public users; // Track keys manually

function addUser(address user, uint256 balance) public {
    if (balances[user] == 0) {
        users.push(user); // Add to tracking array
    }
    balances[user] = balance;
}

// Now you can iterate
function getAllBalances() public view returns (uint256[] memory) {
    uint256[] memory result = new uint256[](users.length);
    for (uint256 i = 0; i < users.length; i++) {
        result[i] = balances[users[i]];
    }
    return result;
}
```

**Trade-off:** Arrays cost more gas but enable iteration.
</details>

---

## 🎯 Key Takeaways

1. **Solidity is statically-typed and object-oriented** - Every variable must have a declared type, and contracts are like classes.

2. **Data location matters for gas costs** - Use `calldata` for external function params, `memory` for temporary data, and `storage` for persistent state.

3. **Function modifiers enforce visibility and mutability** - Use `public`, `external`, `internal`, `private` for visibility; `pure`, `view`, `payable` for state access.

4. **Custom modifiers reduce code duplication** - Write reusable checks as modifiers (e.g., `onlyOwner`, `validAmount`).

5. **Events are cheaper than storage for logging** - Emit events for off-chain tracking instead of storing all data on-chain.

6. **OpenZeppelin provides security best practices** - Use battle-tested patterns like `Ownable`, `ReentrancyGuard`, and `Pausable` instead of writing from scratch.

7. **Always add error messages to require statements** - Makes debugging much easier during development and for users.

---

## 📚 Next Steps

**Before Class 5.2:**
- Ensure all 5 contracts compile successfully
- Experiment with modifying the contracts (add functions, events, modifiers)
- Read Solidity documentation on storage layout: https://docs.soliditylang.org/en/v0.8.28/internals/layout_in_storage.html

**Coming up in Class 5.2:**
- Design the FamilyWallet contract architecture
- Implement access control and multi-user support
- Add deposit and withdrawal functionality
- Emit events for transaction tracking

---

## 📖 Reading References

**Bitcoin Book:**
- Chapter 7: Authorization and Authentication - Script language basics and authorization patterns

**Ethereum Book:**
- Chapter 7: Smart Contracts and Solidity - Introduction, data types, functions

**Official Documentation:**
- Solidity Docs: https://docs.soliditylang.org/en/v0.8.28/
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts/5.x/

---

## 🧑‍💻 Teaching Notes (for Claude Code)

**Pacing:**
- Spend 30-40 minutes on theory (sections 1-8)
- Spend 2-2.5 hours on hands-on activities
- Allow 15-20 minutes for self-assessment

**Common Student Questions:**
1. **"Why do I need to specify `memory` or `storage`?"** → Explain gas costs and persistence
2. **"What's the difference between `require` and `revert`?"** → Show custom errors are more gas-efficient
3. **"Can I return a mapping from a function?"** → No, but you can return structs or arrays

**Key Teaching Points:**
- Emphasize gas optimization early (it affects every design decision)
- Show examples of both correct and incorrect code
- Connect to Week 4 database concepts (storage = database, memory = RAM)
- Demonstrate VS Code Solidity extensions for better DX

**Troubleshooting Tips:**
- If students get "stack too deep" errors, teach function decomposition
- If imports fail, verify `node_modules/@openzeppelin` exists
- Emphasize the importance of compiler version matching (0.8.28)

**Next Class Prep:**
- Ensure students have a working development environment
- All contracts should compile without warnings
- Students should be comfortable with function syntax before Class 5.2

---

*Course Version: 2.0 (30-week structure)*
*Last Updated: January 2025*
*Part of: FamilyChain Blockchain Development Course*
