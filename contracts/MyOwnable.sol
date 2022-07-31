// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MyOwnable is Ownable {
    function normalThing() public {
        // anyone can call this normalThing()
    }

    function specialThing() public onlyOwner {
        // only the owner can call specialThing()!
    }

    function transferOwnership(address newOwner) public virtual override {
        super.transferOwnership(newOwner);
    }
}