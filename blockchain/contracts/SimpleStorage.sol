// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title SimpleStorage
 * @notice A basic contract demonstrating Solidity fundamentals
 */

contract SimpleStorage {
    // State Variables
    uint256 private storedData;
    address public owner;

    // Event
    event DataStored(uint256 indexed oldValue, uint, address indexed);

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
     * @param x The new value to store
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