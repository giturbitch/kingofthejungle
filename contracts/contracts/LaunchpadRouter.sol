// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISurvivor} from "./interfaces/ISurvivor.sol";

contract LaunchpadRouter is Ownable {
    enum Launchpad { PONS, LONG, LUNCH, BAGS, BANKR, POOLS }

    struct Launch {
        uint256 id;
        uint256 tokenId;
        Launchpad launchpad;
        string ticker;
        uint256 supply;
        string metadataURI;
        address requester;
        uint256 requestedAt;
        bool launched;
        address launchedToken;
        bytes32 launchTxHash;
    }

    uint256 private _nextLaunchId;
    mapping(uint256 => Launch) public launches;

    ISurvivor public immutable survivor;
    address public keeper;
    uint256 public launchFee;

    event LaunchRequested(
        uint256 indexed launchId,
        uint256 indexed tokenId,
        Launchpad launchpad,
        string ticker,
        uint256 supply,
        address requester
    );
    event LaunchFulfilled(
        uint256 indexed launchId,
        address launchedToken,
        bytes32 launchTxHash
    );
    event KeeperUpdated(address indexed keeper);
    event LaunchFeeUpdated(uint256 fee);

    constructor(address initialOwner, address _survivor, address _keeper, uint256 _launchFee) Ownable(initialOwner) {
        survivor = ISurvivor(_survivor);
        keeper = _keeper;
        launchFee = _launchFee;
    }

    modifier onlyKeeper() {
        require(msg.sender == keeper, "ROUTER: not keeper");
        _;
    }

    function setKeeper(address _keeper) external onlyOwner {
        keeper = _keeper;
        emit KeeperUpdated(_keeper);
    }

    function setLaunchFee(uint256 _launchFee) external onlyOwner {
        launchFee = _launchFee;
        emit LaunchFeeUpdated(_launchFee);
    }

    function requestLaunch(
        uint256 tokenId,
        Launchpad launchpad,
        string calldata ticker,
        uint256 supply,
        string calldata metadataURI
    ) external payable returns (uint256 launchId) {
        require(msg.value == launchFee, "ROUTER: fee mismatch");
        require(survivor.ownerOf(tokenId) == msg.sender, "ROUTER: not owner");
        require(bytes(ticker).length > 0, "ROUTER: empty ticker");
        require(supply > 0, "ROUTER: zero supply");

        launchId = _nextLaunchId++;
        launches[launchId] = Launch({
            id: launchId,
            tokenId: tokenId,
            launchpad: launchpad,
            ticker: ticker,
            supply: supply,
            metadataURI: metadataURI,
            requester: msg.sender,
            requestedAt: block.timestamp,
            launched: false,
            launchedToken: address(0),
            launchTxHash: bytes32(0)
        });

        emit LaunchRequested(launchId, tokenId, launchpad, ticker, supply, msg.sender);
    }

    function fulfillLaunch(uint256 launchId, address launchedToken, bytes32 launchTxHash) external onlyKeeper {
        Launch storage l = launches[launchId];
        require(l.id == launchId, "ROUTER: unknown launch");
        require(!l.launched, "ROUTER: already launched");
        require(launchedToken != address(0), "ROUTER: no token");

        l.launched = true;
        l.launchedToken = launchedToken;
        l.launchTxHash = launchTxHash;

        emit LaunchFulfilled(launchId, launchedToken, launchTxHash);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "ROUTER: no fees");
        (bool ok, ) = owner().call{value: balance}("");
        require(ok, "ROUTER: withdraw failed");
    }
}
