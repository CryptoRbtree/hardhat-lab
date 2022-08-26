// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/escrow/ConditionalEscrow.sol";
import "@openzeppelin/contracts/utils/escrow/Escrow.sol";
import "@openzeppelin/contracts/utils/escrow/RefundEscrow.sol";

contract EscrowTest is RefundEscrow {
    constructor(address payable beneficiary_) RefundEscrow(beneficiary_) {}
}
