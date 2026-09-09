// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract JungleTreasury is Ownable {
    struct Epoch {
        uint256 startedAt;
        uint256 endedAt;
        uint256 totalPool;
        uint256 winnerPayout;
        uint256 protocolShare;
        uint256 adminShare;
        uint256 rollover;
        address winner;
        uint256 verifiedVolume;
        bool settled;
    }

    uint256 public constant EPOCH_DURATION = 24 hours;
    uint256 public constant FINAL_HUNT_SECONDS = 10 minutes;

    uint256 public protocolBps = 1_000; // 10%
    uint256 public adminBps = 500;      // 5%
    uint256 public rolloverBps = 0;     // 0% default

    uint256 public currentEpoch;
    uint256 public currentEpochStartedAt;
    uint256 public currentPool;
    uint256 public totalSettled;

    mapping(uint256 => Epoch) public epochs;

    address public keeper;

    event Contributed(uint256 indexed epoch, address indexed source, uint256 amount);
    event EpochSettled(
        uint256 indexed epoch,
        address indexed winner,
        uint256 winnerPayout,
        uint256 protocolShare,
        uint256 adminShare,
        uint256 rollover,
        uint256 verifiedVolume
    );
    event SharesWithdrawn(address indexed to, uint256 protocolAmount, uint256 adminAmount);
    event ConfigUpdated(uint256 protocolBps, uint256 adminBps, uint256 rolloverBps);
    event KeeperUpdated(address indexed keeper);

    constructor(address initialOwner, address _keeper) Ownable(initialOwner) {
        keeper = _keeper;
        _startEpoch();
    }

    modifier onlyKeeperOrOwner() {
        require(msg.sender == keeper || msg.sender == owner(), "TREASURY: not keeper or owner");
        _;
    }

    receive() external payable {
        contribute();
    }

    function contribute() public payable {
        require(msg.value > 0, "TREASURY: zero contribution");
        currentPool += msg.value;
        emit Contributed(currentEpoch, msg.sender, msg.value);
    }

    function currentEpochEnd() public view returns (uint256) {
        return currentEpochStartedAt + EPOCH_DURATION;
    }

    function remainingSeconds() public view returns (uint256) {
        uint256 endAt = currentEpochEnd();
        return block.timestamp >= endAt ? 0 : endAt - block.timestamp;
    }

    function isFinalHunt() public view returns (bool) {
        uint256 endAt = currentEpochEnd();
        return block.timestamp >= endAt - FINAL_HUNT_SECONDS && block.timestamp < endAt;
    }

    function setConfig(uint256 _protocolBps, uint256 _adminBps, uint256 _rolloverBps) external onlyOwner {
        require(_protocolBps + _adminBps + _rolloverBps <= 10_000, "TREASURY: bps overflow");
        protocolBps = _protocolBps;
        adminBps = _adminBps;
        rolloverBps = _rolloverBps;
        emit ConfigUpdated(_protocolBps, _adminBps, _rolloverBps);
    }

    function setKeeper(address _keeper) external onlyOwner {
        keeper = _keeper;
        emit KeeperUpdated(_keeper);
    }

    function settleEpoch(address winner, uint256 verifiedVolume) external onlyKeeperOrOwner {
        uint256 endAt = currentEpochEnd();
        require(block.timestamp >= endAt, "TREASURY: epoch active");
        require(winner != address(0), "TREASURY: no winner");
        require(currentPool > 0, "TREASURY: empty pool");

        uint256 protocolShare = (currentPool * protocolBps) / 10_000;
        uint256 adminShare = (currentPool * adminBps) / 10_000;
        uint256 rollover = (currentPool * rolloverBps) / 10_000;
        uint256 winnerPayout = currentPool - protocolShare - adminShare - rollover;

        epochs[currentEpoch] = Epoch({
            startedAt: currentEpochStartedAt,
            endedAt: block.timestamp,
            totalPool: currentPool,
            winnerPayout: winnerPayout,
            protocolShare: protocolShare,
            adminShare: adminShare,
            rollover: rollover,
            winner: winner,
            verifiedVolume: verifiedVolume,
            settled: true
        });

        totalSettled += currentPool;
        currentPool = rollover;

        (bool ok, ) = winner.call{value: winnerPayout}("");
        require(ok, "TREASURY: winner payout failed");

        emit EpochSettled(currentEpoch, winner, winnerPayout, protocolShare, adminShare, rollover, verifiedVolume);

        currentEpoch += 1;
        currentEpochStartedAt = block.timestamp;
    }

    function withdrawShares() external onlyOwner {
        uint256 protocolAmount = address(this).balance - currentPool;
        require(protocolAmount > 0, "TREASURY: no shares");
        (bool ok, ) = owner().call{value: protocolAmount}("");
        require(ok, "TREASURY: withdraw failed");
        emit SharesWithdrawn(owner(), protocolAmount, 0);
    }

    function _startEpoch() internal {
        currentEpoch = 1;
        currentEpochStartedAt = block.timestamp;
    }
}
