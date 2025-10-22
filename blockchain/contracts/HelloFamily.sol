// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract HelloFamily { 
    string public greeting;
    address public owner;

    event GreetingChanged(string newGreeting, address changedBy);

    constructor(string memory _greeting) {
        greeting = _greeting;
        owner = msg.sender;
    }

    function setGreeting(string memory _greeting) public {
        // Only the owner can change the greeting
        require(msg.sender == owner, "Only owner can set greeting");
        greeting = _greeting;
        emit GreetingChanged(_greeting, msg.sender);
    }
}
