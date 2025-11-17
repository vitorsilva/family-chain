// Sources flattened with hardhat v3.0.8 https://hardhat.org
// Manually reordered for correct compilation order

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// File npm/@openzeppelin/contracts@5.4.0/utils/Context.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File npm/@openzeppelin/contracts@5.4.0/access/Ownable.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File npm/@openzeppelin/contracts@5.4.0/utils/ReentrancyGuard.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File contracts/FamilyWallet.sol

// Original license: SPDX_License_Identifier: MIT

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
     * @notice Add a new family member (owner only)
     * @param member Address of the new member
     */
    function addMember(address member) public onlyOwner {
        // Validation
        if (member == address(0)) revert ZeroAddress();
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
                memberList[i] = memberList[memberList.length - 1];
                memberList.pop();
                break;
            }
        }

        // Emit event
        emit MemberRemoved(member, block.timestamp);
    }

    /**
     * @notice Deposit Ether into your balance
     * @dev Must be a family member to deposit
     */
    function deposit() public payable {
        // Validation
        if (!familyMembers[msg.sender]) revert NotAMember();
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
     * @notice Get balance of any family member
     * @param member Address to check
     * @return uint256 Balance in Wei
     */
    function getBalance(address member) public view returns (uint256) {
        return balances[member];
    }

    /**
     * @notice Withdraw from your own balance
     * @param amount Amount in Wei to withdraw
     * @dev Protected against reentrancy attacks
     */
    function withdraw(uint256 amount) public nonReentrant {
        // 1. CHECKS
        if (!familyMembers[msg.sender]) revert NotAMember();
        if (amount == 0) revert ZeroAmount();
        if (amount > balances[msg.sender]) {
            revert InsufficientBalance(amount, balances[msg.sender]);
        }

        // 2. EFFECTS (update state BEFORE external call)
        balances[msg.sender] -= amount;

        // 3. INTERACTIONS (external call LAST)
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
     * @notice Owner can withdraw from any member's balance (parental control)
     * @param member Address of the member whose balance to withdraw from
     * @param amount Amount in Wei to withdraw
     */
    function ownerWithdraw(address member, uint256 amount) public onlyOwner nonReentrant {
        // 1. CHECKS
        if (!familyMembers[member]) revert NotAMember();
        if (amount == 0) revert ZeroAmount();
        if (amount > balances[member]) {
            revert InsufficientBalance(amount, balances[member]);
        }

        // 2. EFFECTS
        balances[member] -= amount;

        // 3. INTERACTIONS
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        // Emit event
        emit Withdrawn(
            member,
            amount,
            balances[member],
            block.timestamp
        );
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
