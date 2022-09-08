// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract TransparentV1 is Initializable {
    event IncreaseV1();

    uint public val;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint _val) public initializer {
        val = _val; // set initial value in initializer
    }

    function increase() public {
        val += 1;
        emit IncreaseV1();
    }
}

contract TransparentV2 is Initializable {
    event IncreaseV2();

    uint public val;

    function increase() public {
        val += 2;
        emit IncreaseV2();
    }
}