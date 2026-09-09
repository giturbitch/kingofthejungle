// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Survivor is ERC721, ERC721Enumerable, Ownable {
    struct Traits {
        string name;
        string animal;
        uint256 mintedAt;
        string[] categories;
        string speedTier;
        string launchpad;
    }

    uint256 private _nextTokenId;
    mapping(uint256 => Traits) public traits;
    string public baseTokenURI;

    uint256 public constant NAME_MIN = 3;
    uint256 public constant NAME_MAX = 24;

    event Forged(
        uint256 indexed tokenId,
        address indexed owner,
        string name,
        string animal,
        string[] categories,
        string speedTier,
        string launchpad
    );

    constructor(address initialOwner, string memory _baseTokenURI)
        ERC721("Farming Agents Survivor", "SURVIVOR")
        Ownable(initialOwner)
    {
        baseTokenURI = _baseTokenURI;
    }

    function forge(
        string memory name,
        string memory animal,
        string[] memory categories,
        string memory speedTier,
        string memory launchpad
    ) external returns (uint256 tokenId) {
        require(bytes(name).length >= NAME_MIN && bytes(name).length <= NAME_MAX, "SURVIVOR: name length");

        for (uint256 i = 0; i < bytes(name).length; i++) {
            bytes1 c = bytes(name)[i];
            bool isDigit = c >= 0x30 && c <= 0x39;
            bool isUpper = c >= 0x41 && c <= 0x5A;
            bool isLower = c >= 0x61 && c <= 0x7A;
            bool isSpace = c == 0x20;
            bool isApostrophe = c == 0x27;
            require(isDigit || isUpper || isLower || isSpace || isApostrophe, "SURVIVOR: invalid name char");
        }

        require(bytes(animal).length > 0, "SURVIVOR: no animal");
        require(categories.length >= 1 && categories.length <= 3, "SURVIVOR: categories count");
        require(bytes(speedTier).length > 0, "SURVIVOR: no speed tier");
        require(bytes(launchpad).length > 0, "SURVIVOR: no launchpad");

        tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        traits[tokenId] = Traits({
            name: name,
            animal: animal,
            mintedAt: block.timestamp,
            categories: categories,
            speedTier: speedTier,
            launchpad: launchpad
        });

        emit Forged(tokenId, msg.sender, name, animal, categories, speedTier, launchpad);
    }

    function getTraits(uint256 tokenId) external view returns (Traits memory) {
        return traits[tokenId];
    }

    function setBaseURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
