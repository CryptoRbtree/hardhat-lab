// contracts/GameItems.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "./ERC1820Registry.sol";

contract ContractAccount is IERC777Recipient, IERC721Receiver, IERC1155Receiver {
    event Receive(address, uint256);
    event Fallback(address, uint256);
    event TokensReceived(address, address, address, uint256, bytes, bytes);
    event OnERC721Received(address, address, uint256, bytes);
    event OnERC1155Received(address, address, uint256, uint256, bytes);
    event OnERC1155BatchReceived(address, address from, uint256[] ids, uint256[] values, bytes);

    bytes32 private constant _TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");

    function registerERC1820(address erc1820) public {
        ERC1820Registry(erc1820).setInterfaceImplementer(address(this), _TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
    }

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external {
        emit TokensReceived(operator, from, to, amount, userData, operatorData);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) virtual override external returns (bytes4) {
        emit OnERC721Received(operator, from, tokenId, data);
        return IERC721Receiver.onERC721Received.selector;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) virtual override external returns (bytes4) {
        emit OnERC1155Received(operator, from, id, value, data);
        return IERC1155Receiver.onERC1155Received.selector;
    }
    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) virtual override external returns (bytes4) {
        emit OnERC1155BatchReceived(operator, from, ids, values, data);
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) virtual override external view returns (bool) {
        return interfaceId == type(IERC777Recipient).interfaceId ||
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId;
    }

    receive() external payable {
        emit Receive(msg.sender, msg.value);
    }

    fallback() external payable {
        emit Fallback(msg.sender, msg.value);
    }
}