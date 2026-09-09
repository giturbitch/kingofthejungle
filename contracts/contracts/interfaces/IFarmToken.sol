// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IFarmToken {
    function decimals() external view returns (uint8);
    function mint(address to, uint256 amount) external;
}
