// contracts/GameItem.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MetaNFT is ERC2771Context, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(address trustedForwarder) ERC721("MetaNFT", "MT") ERC2771Context(trustedForwarder) {}

    function safeMint() public virtual {
        safeMint("");
    }

    function safeMint(bytes memory _data) internal virtual {
        uint256 tokenId = _tokenIds.current();
        _safeMint(_msgSender(), tokenId, _data);
        _tokenIds.increment();
    }

    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }
}

import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";
contract Forwarder is MinimalForwarder {}