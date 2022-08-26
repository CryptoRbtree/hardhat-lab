// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@rari-capital/solmate/src/tokens/ERC20.sol";

contract RariToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Gold", "GLD", 18) {
        _mint(msg.sender, initialSupply);
    }
}