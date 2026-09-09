// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ISurvivor {
    struct Traits {
        string name;
        string animal;
        uint256 mintedAt;
        string[] categories;
        string speedTier;
        string launchpad;
    }

    function ownerOf(uint256 tokenId) external view returns (address);
    function traits(uint256 tokenId) external view returns (Traits memory);
    function getTraits(uint256 tokenId) external view returns (Traits memory);
    function forge(string memory name, string memory animal, string[] memory categories, string memory speedTier, string memory launchpad) external returns (uint256 tokenId);
}
