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