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