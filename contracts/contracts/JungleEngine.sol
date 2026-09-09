// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ISurvivor} from "./interfaces/ISurvivor.sol";
import {IFarmToken} from "./interfaces/IFarmToken.sol";

contract JungleEngine {
    enum Status { Idle, Growing, Ripe, Cooldown }

    struct Farmer {
        Status status;
        uint256 readyAt;
        uint256 nextActionAt;
        string targetCategory;
        string targetTicker;
        uint256 harvests;
    }

    mapping(uint256 => Farmer) public farmers;
    ISurvivor public immutable survivor;
    IFarmToken public immutable farmToken;

    uint256 public constant SLOW_GROWTH = 8 hours;
    uint256 public constant STANDARD_GROWTH = 4 hours;
    uint256 public constant SWIFT_GROWTH = 2 hours;
    uint256 public constant COOLDOWN_DURATION = 1 hours;
    uint256 public constant HARVEST_REWARD = 100 * 10 ** 18;

    event Hunt(uint256 indexed tokenId, string targetCategory, string targetTicker, uint256 readyAt);
    event Ripened(uint256 indexed tokenId);
    event Harvest(uint256 indexed tokenId, uint256 harvests);

    constructor(address _survivor, address _farmToken) {
        survivor = ISurvivor(_survivor);
        farmToken = IFarmToken(_farmToken);
    }

    function hunt(uint256 tokenId, string calldata targetCategory, string calldata targetTicker) external {
        require(survivor.ownerOf(tokenId) == msg.sender, "ENGINE: not owner");

        Farmer storage f = farmers[tokenId];
        require(
            f.status == Status.Idle || (f.status == Status.Cooldown && block.timestamp >= f.readyAt),
            "ENGINE: not idle"
        );

        uint256 growth = _growthFor(tokenId);
        f.status = Status.Growing;
        f.readyAt = block.timestamp + growth;
        f.nextActionAt = f.readyAt;
        f.targetCategory = targetCategory;
        f.targetTicker = targetTicker;

        emit Hunt(tokenId, targetCategory, targetTicker, f.readyAt);
    }

    function ripen(uint256 tokenId) external {
        Farmer storage f = farmers[tokenId];
        require(f.status == Status.Growing && block.timestamp >= f.readyAt, "ENGINE: not ready");
        f.status = Status.Ripe;
        emit Ripened(tokenId);
    }

    function harvest(uint256 tokenId) external {
        require(survivor.ownerOf(tokenId) == msg.sender, "ENGINE: not owner");

        Farmer storage f = farmers[tokenId];
        require(f.status == Status.Ripe, "ENGINE: not ripe");

        f.harvests += 1;
        f.status = Status.Cooldown;
        f.readyAt = block.timestamp + COOLDOWN_DURATION;
        f.nextActionAt = f.readyAt;
        f.targetCategory = "";
        f.targetTicker = "";

        farmToken.mint(msg.sender, HARVEST_REWARD);
        emit Harvest(tokenId, f.harvests);
    }

    function _growthFor(uint256 tokenId) internal view returns (uint256) {
        ISurvivor.Traits memory t = survivor.getTraits(tokenId);
        bytes32 speedHash = keccak256(bytes(t.speedTier));
        if (speedHash == keccak256("SWIFT")) return SWIFT_GROWTH;
        if (speedHash == keccak256("STANDARD")) return STANDARD_GROWTH;
        return SLOW_GROWTH;
    }
}
