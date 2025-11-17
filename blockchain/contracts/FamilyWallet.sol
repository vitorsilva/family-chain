// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

  /**
   * @title FamilyWallet
   * @notice A multi-user wallet for family members with parental         
  controls
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