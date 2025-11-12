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
        require(!locked, "Reentrant call detected");
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
      function calculate(uint256 x) public pure returns (
        uint256 doubled, 
        uint256 tripled
    ) {
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