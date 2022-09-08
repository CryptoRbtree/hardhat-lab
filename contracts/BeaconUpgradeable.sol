// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract ShipV1 is Initializable {
    event Move();

    string public name;
    uint public fuel;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string calldata _name, uint _fuel) initializer public {
        name = _name;
        fuel = _fuel;
    }

    function move() public {
        require(fuel > 0, "no fuel");
        fuel -= 1;
        emit Move();
    }
}

contract ShipV2 is Initializable {
    event Move();
    event Refuel();

    string public name;
    uint256 public fuel;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string calldata _name, uint256 _fuel) initializer external {
        name = _name;
        fuel = _fuel;
    }

    function move() public {
        require(fuel > 0, "no fuel");
        fuel -= 1;
        emit Move();
    }

    function refuel() public {
        fuel += 1;
        emit Refuel();
    }
}