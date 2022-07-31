// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "./MyERC777.sol";

contract GLDToken777 is MyERC777 {
    constructor(uint256 initialSupply, address[] memory defaultOperators, address erc1820)
        MyERC777("Gold", "GLD", defaultOperators, erc1820)
    {
        _mint(msg.sender, initialSupply, "", "");
    }
}