// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface ITreasury {
    function contribute() external payable;
}

contract SupplyDepot is Ownable {
    enum Category { Equipment, Camp, Survival, Cosmetics, Prestige }

    struct Item {
        uint256 id;
        string name;
        Category category;
        uint256 price;
        uint256 treasuryBps;
        bool cosmetic;
        bool utility;
        bool active;
    }

    uint256 private _nextItemId;
    mapping(uint256 => Item) public items;
    mapping(uint256 => mapping(uint256 => bool)) public survivorOwns;

    ITreasury public treasury;
    uint256 public protocolBps = 2_000; // 20% of item price to protocol after treasury share

    event ItemAdded(uint256 indexed id, string name, uint256 price, Category category);
    event ItemUpdated(uint256 indexed id, uint256 price, bool active);
    event Purchased(uint256 indexed survivorTokenId, uint256 indexed itemId, uint256 treasuryAmount, uint256 protocolAmount);

    constructor(address initialOwner, address _treasury) Ownable(initialOwner) {
        treasury = ITreasury(_treasury);
    }

    function addItem(
        string calldata name,
        Category category,
        uint256 price,
        uint256 treasuryBps,
        bool cosmetic,
        bool utility
    ) external onlyOwner returns (uint256 id) {
        require(price > 0, "DEPOT: price zero");
        require(treasuryBps <= 10_000, "DEPOT: bps overflow");

        id = _nextItemId++;
        items[id] = Item({
            id: id,
            name: name,
            category: category,
            price: price,
            treasuryBps: treasuryBps,
            cosmetic: cosmetic,
            utility: utility,
            active: true
        });

        emit ItemAdded(id, name, price, category);
    }

    function setItem(uint256 id, uint256 price, bool active) external onlyOwner {
        require(price > 0, "DEPOT: price zero");
        Item storage item = items[id];
        require(item.id == id, "DEPOT: unknown item");
        item.price = price;
        item.active = active;
        emit ItemUpdated(id, price, active);
    }

    function purchase(uint256 survivorTokenId, uint256 itemId) external payable {
        Item storage item = items[itemId];
        require(item.active, "DEPOT: item inactive");
        require(msg.value == item.price, "DEPOT: wrong value");

        uint256 treasuryAmount = (msg.value * item.treasuryBps) / 10_000;
        uint256 protocolAmount = (msg.value * protocolBps) / 10_000;
        uint256 netToSeller = msg.value - treasuryAmount - protocolAmount;

        survivorOwns[survivorTokenId][itemId] = true;

        if (treasuryAmount > 0) {
            treasury.contribute{value: treasuryAmount}();
        }

        if (netToSeller > 0) {
            (bool ok, ) = owner().call{value: netToSeller}("");
            require(ok, "DEPOT: seller transfer failed");
        }

        emit Purchased(survivorTokenId, itemId, treasuryAmount, protocolAmount);
    }

    function setProtocolBps(uint256 _protocolBps) external onlyOwner {
        require(_protocolBps <= 10_000, "DEPOT: bps overflow");
        protocolBps = _protocolBps;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = ITreasury(_treasury);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "DEPOT: no balance");
        (bool ok, ) = owner().call{value: balance}("");
        require(ok, "DEPOT: withdraw failed");
    }
}
