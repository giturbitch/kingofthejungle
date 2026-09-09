# Farming Agents — On-Chain Protocol

Isolated Hardhat package for the Farming Agents jungle protocol.

## Contracts

- `FarmToken.sol` — ERC20 `$FARM` reward token, 1B initial supply, minting restricted to the engine.
- `Survivor.sol` — ERC721 survivor NFT with validated name, animal, categories, speed tier, and launchpad.
- `JungleEngine.sol` — hunt/ripen/harvest state machine for survivors, mints `$FARM` rewards.
- `JungleTreasury.sol` — 24-hour daily treasury pool, configurable protocol/admin/rollover shares, keeper settlement.
- `SupplyDepot.sol` — shop that splits item payments between treasury, protocol, and seller.
- `LaunchpadRouter.sol` — registry of token launch requests fulfilled by a keeper on Robinhood-chain launchpads.

## Environment

Copy `.env.example` to `contracts/.env` and fill in real values before deploying.

```
RPC_URL_MAINNET=https://rpc.mainnet.chain.robinhood.com
RPC_URL_TESTNET=https://rpc.testnet.chain.robinhood.com
PRIVATE_KEY=0x...
KEEPER_PRIVATE_KEY=0x...
```

## Commands

```bash
bun install
bunx hardhat test        # run the full test suite
bunx hardhat compile     # compile contracts
bunx hardhat run scripts/deploy.js --network robinhood-testnet
bunx hardhat verify --network robinhood-testnet <address> <constructor args>
bun run keeper           # run the off-chain keeper (set VITE_* addresses in .env)
```

## Keeper

`keeper/keeper.js` is an off-chain autonomous agent skeleton. It:

1. Connects to the Robinhood EVM RPC.
2. Watches `Hunt` events and records token IDs.
3. Calls `ripen()` automatically when a farmer becomes ready.
4. Watches `LaunchRequested` events so the keeper can create tokens on PONS, LONG, LUNCH, BAGS, BANKR, or POOLS and call `fulfillLaunch()`.

Real launchpad adapter code must be added once official contract ABIs/addresses are confirmed.

## Important

- This code has not been audited. Do not deploy to mainnet with real money without a professional security audit.
- The daily prize/treasury mechanic may be regulated in your jurisdiction. Obtain legal review before going live.
- Keeper private keys must be stored securely and rotated regularly.
