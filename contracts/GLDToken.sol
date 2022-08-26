// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract GLDToken is ERC20, ERC20Permit {
    constructor(uint256 initialSupply) ERC20("Gold", "GLD") ERC20Permit("Gold") {
        _mint(msg.sender, initialSupply);
    }
}