// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SignedMath.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SignedSafeMath.sol";

contract MathTest {
    function max(uint256 a, uint256 b) public pure returns (uint256) {
        return Math.max(a, b);
    }

    function min(uint256 a, uint256 b) public pure returns (uint256) {
        return Math.min(a, b);
    }

    function average(uint256 a, uint256 b) public pure returns (uint256) {
        return Math.average(a, b);
    }

    function ceilDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        return Math.ceilDiv(a, b);
    }

    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 denominator
    ) public pure returns (uint256 result) {
        return Math.mulDiv(x, y, denominator);
    }

    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 denominator,
        Math.Rounding rounding
    ) public pure returns (uint256) {
        return Math.mulDiv(x, y, denominator, rounding);
    }

    function sqrt(uint256 a) public pure returns (uint256) {
        return Math.sqrt(a);
    }

    function sqrt(uint256 a, Math.Rounding rounding) public pure returns (uint256) {
        return Math.sqrt(a, rounding);
    }

    function max(int256 a, int256 b) public pure returns (int256) {
        return SignedMath.max(a, b);
    }

    function min(int256 a, int256 b) public pure returns (int256) {
        return SignedMath.min(a, b);
    }

    function average(int256 a, int256 b) public pure returns (int256) {
        return SignedMath.average(a, b);
    }

    function abs(int256 n) public pure returns (uint256) {
        return SignedMath.abs(n);
    }
}