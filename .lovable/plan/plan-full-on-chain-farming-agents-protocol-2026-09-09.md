# Plan: Full on-chain Farming Agents protocol

We are moving from the existing jungle frontend shell to a real protocol on **Robinhood Chain** (EVM-compatible, live since July 2026). The frontend already exists; the engine does not.

## Core architecture

1. **Smart contracts** (Solidity, Foundry) — deployed on Robinhood Chain
   - `Survivor` ERC721: name, animal, categories, speed tier, launchpad, harvest count, state machine
   - `$FARM` ERC20: in-game currency
   - `JungleEngine`: hunt / harvest / cooldown logic
   - `SupplyDepot`: shop catalog, purchase routing, treasury contribution
   - `JungleTreasury`: daily epoch accumulation, winner settlement, payout, rollover
2. **AI keeper** (server function / scheduled worker)
   - Monitors every survivor's state
   - Picks targets using an LLM + on-chain data
   - Signs and submits `hunt()` and `launch()` transactions via a secure signer
3. **Launchpad adapters**
   - PONS, LONG, LUNCH, BAGS, BANKR, POOLS
   - Each adapter knows how to launch a token and read back 24h verified volume
4. **Indexer / backend** (Lovable Cloud)
   - Aggregate on-chain events into leaderboard, feed, epoch history
   - Store off-chain metadata and AI decisions
5. **Frontend wiring**
   - Replace mock protocol adapters with real contract calls
   - Wallet connect (RainbowKit / wagmi for Robinhood Chain)

## Phase 1 — Protocol foundation

- Add Foundry to the repo (`contracts/` directory)
- Write and test:
  - `Survivor.sol` with minting rules matching the Forge UI
  - `FarmToken.sol` ERC20
  - `JungleEngine.sol` state machine (idle → growing → ripe → cooldown → harvest)
- Write deployment script for Robinhood Chain testnet
- Deliver: deployable and tested core contracts

## Phase 2 — Treasury and Supply Depot

- `SupplyDepot.sol`: item catalog, price oracle fallback, treasury split on purchase
- `JungleTreasury.sol`: 24h epoch, winner scoring from verified launch volume, payout, rollover, protocol/admin distribution
- Tests for edge cases: no eligible launches, tie, zero treasury, late settlement
- Deliver: shop purchase and treasury settlement work on testnet

## Phase 3 — AI keeper skeleton

- Server-side service that reads all survivor states
- LLM target selection using on-chain + launchpad data
- Transaction signing via AWS KMS / Turnkey / a funded hot wallet
- Safety guardrails: max gas spend, cooldown checks, human pause switch
- Deliver: keeper can auto-trigger `hunt()` for survivors on testnet

## Phase 4 — Launchpad bridges

- Research and implement adapters for the six launchpads
- Launch token on behalf of a survivor
- Read 24h volume / market cap back into treasury scoring
- Deliver: survivor can launch a token through at least one launchpad

## Phase 5 — Frontend wiring

- Add wagmi + RainbowKit for Robinhood Chain
- Replace `src/lib/jungle/protocol.ts` stubs with contract reads/writes
- Wire treasury, shop, and hunt/harvest buttons to real transactions
- Deliver: the jungle UI controls real contracts

## Phase 6 — Production hardening

- Testnet end-to-end run with fake volume
- Contract audit by a third-party security firm
- Legal review for the prize / daily-bounty mechanic
- Mainnet deployment + frontend switch
- Deliver: production-ready protocol

## Critical blockers and warnings

- **Security**: this code will hold and move user money. Nothing here replaces a professional smart-contract audit.
- **Legal**: daily prize treasuries are regulated in most jurisdictions. Legal review is required before mainnet.
- **Keeper key management**: an autonomous hot wallet is a high-value target. Use a secure signer (KMS/Turnkey) and a pause mechanism.
- **Verified volume**: launchpads report different metrics. Scoring must be manipulation-resistant; exact heuristics stay server-side.
- **Robinhood Chain specifics**: RPC, block time, gas token, and canonical token standards must be confirmed from official docs.

## What I will build now

By default I will start with **Phase 1** (core contracts) and a minimal testnet deployment script, unless you say otherwise. This gives us a real engine behind the existing jungle UI before we add money, AI, or prizes.
