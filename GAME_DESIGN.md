# Jungle Predators: Agent Simulation Design

## 1. Agent State Structure

```typescript
interface Agent {
  // Identity
  id: string                    // On-chain agent ID
  owner: string                 // Wallet address
  name: string                  // Immutable name (minted)
  animal: string                // Lion, Tiger, Panther, etc.
  
  // Status
  status: 'alive' | 'dead' | 'resting'
  health: number                // 0-100
  hunger: number                // 0-100 (0 = starving)
  
  // Resources
  resources: {
    food: number                // From hunting
    wood: number                // From gathering
    stone: number               // From mining
    gold: number                // Rare resource
  }
  
  // Base/Territory
  baseLevel: number             // 1-10
  baseTier: number              // Current upgrade tier
  buildingQueue: Building[]     // Currently building
  
  // Economy
  totalEarned: number           // Lifetime $ from launches
  lastLaunchTime: number        // Unix timestamp
  launchesToday: number         // Resets every 24h
  treasuryShare: number         // % of daily treasury earned
  
  // Leaderboard
  dailyVolume: number           // Trading volume last 24h
  dailyMarketCap: number        // Highest MC launched coin
  weeklyRank: number            // Updated daily
  
  // Social
  alliance?: string             // Alliance ID (optional)
  partners: string[]            // Other agent IDs for joint launches
  
  // Timestamps
  createdAt: number
  lastActionAt: number
  deathAt?: number
}

interface Building {
  type: 'storage' | 'farm' | 'forge' | 'defense'
  level: number
  progress: number              // 0-100%
  resourceCost: Record<string, number>
  startedAt: number
  completesAt: number
}
```

---

## 2. Simulation Loop

**Runs every 5 minutes (configurable)**

### 2.1 Resource Gathering Phase
```
For each alive agent:
  1. Check hunger level
     - If hunger < 20: damage health (starvation)
     - If hunger < 50: slow resource gathering
  
  2. Hunt (food gathering)
     - Base rate: 10 food per tick
     - Bonus: +2 per base level
     - Random: ±20% variance
     - Success chance: 85% (15% chance hunt fails)
  
  3. Gather (wood/stone)
     - Base rate: 8 wood + 5 stone per tick
     - Bonus: +1 per base level
     - Random: ±20% variance
  
  4. Passive gold generation
     - 1 gold per 20 ticks (rare)
     - Bonus: +0.5 per base level

  5. Consume resources
     - Base maintenance: -5 food, -2 wood per tick
     - Building maintenance: -1 wood per building level
     - If resources depleted: health damage starts
```

### 2.2 Building Phase
```
For each building in queue:
  1. Progress building by 10% per tick (configurable)
  2. When complete:
     - Add to base
     - Increase gathering rates
     - Unlock new mechanics
```

### 2.3 Health Phase
```
For each alive agent:
  1. Calculate health changes:
     - Base: +2 per tick (natural recovery)
     - Hunger penalty: -5 per tick if hunger < 20
     - Sickness: -3 per tick if in "sick" state
     - Building bonus: +1 per defensive building
  
  2. If health reaches 0:
     - status = 'dead'
     - Set deathAt timestamp
     - Agent removed from active simulation
     - Can respawn if owner pays fee?
```

### 2.4 Threat Phase (PvP)
```
For each alive agent:
  1. Random raid chance (2% per tick)
  2. If raided:
     - Attacker: randomly selected from leaderboard
     - Defender loses resources: 10-30%
     - Attacker gains: 50% of what defender lost
     - Event logged for UI visualization
```

### 2.5 Launch Check Phase
```
For each alive agent:
  1. Check if 24h has passed since last launch
     - If yes: agent is "required to launch"
     - Status indicator: "MUST LAUNCH TODAY"
  
  2. If launchesToday < maxLaunches (configurable, e.g., 5):
     - Agent is eligible to launch
  
  3. If agent is in "launch ready" state:
     - Trigger token launch (see section 3)
```

### 2.6 Leaderboard Update Phase
```
Every 24 hours at UTC midnight:
  1. Calculate dailyVolume for each agent
     - Sum of trading volume of all tokens launched
  2. Calculate dailyMarketCap for each agent
     - Highest MC reached by any launched token
  3. Rank agents by dailyVolume
  4. Top 3 agents win prize from treasury
  5. Reset daily counters
```

---

## 3. Token Launch Mechanics

**Triggered when agent decides to launch** (player action or automated)

```typescript
interface LaunchEvent {
  agentId: string
  tokenName: string             // Generated from agent theme
  tokenSymbol: string           // 4-5 chars
  initialSupply: number         // Based on resources
  initialPrice: number          // Calculated from agent treasury share
  launchpadId: string           // PonsFamily, etc.
  chainId: 'robinhood'
  
  // Resource cost
  resourceBurned: {
    gold: number                // 5-20 gold required
    food: number                // 50-200 food
  }
  
  // Revenue split
  agentEarns: number            // 60% of launch fees
  treasuryEarns: number         // 40% of launch fees
  
  launchedAt: number
  tokenAddress?: string         // Set after launch
}
```

### Launch Flow
```
1. Agent has sufficient resources (gold + food)
2. Player clicks "LAUNCH" or auto-triggered at 24h mark
3. Token created on PonsFamily
4. Resources burned from agent
5. Earnings tracked to agent.totalEarned + agent.treasuryShare
6. Event logged: token shows in "Recent Hunts" leaderboard
7. Agent resets launchesToday counter after 24h
```

---

## 4. Leaderboard Logic

**Daily Rankings (Updated every 24h)**

```typescript
interface LeaderboardEntry {
  rank: number                  // 1-100
  agentId: string
  agentName: string
  animal: string
  owner: string
  
  dailyVolume: number           // Total trading vol
  dailyMarketCap: number        // Peak MC
  tokensLaunched: number        // Count
  totalEarned: number           // Lifetime
  
  prizeWon?: number             // If top 3
  healthStatus: string          // Visual indicator
}

// Prize Distribution
TOP_1_PRIZE = treasury * 0.50   // 50%
TOP_2_PRIZE = treasury * 0.30   // 30%
TOP_3_PRIZE = treasury * 0.20   // 20%

// If tied: order by token count, then by earliest launch time
```

---

## 5. Base Building Progression

**Building Types & Benefits**

```typescript
const BUILDINGS = {
  storage: {
    level1: { wood: 50, stone: 50, food: 20 },    // +25% resource capacity
    level2: { wood: 100, stone: 100, food: 40 },  // +50% capacity
    level3: { wood: 200, stone: 200, food: 80 },  // +100% capacity
  },
  
  farm: {
    level1: { wood: 30, stone: 20 },               // +50% food gathering
    level2: { wood: 60, stone: 40 },               // +100% food gathering
    level3: { wood: 120, stone: 80 },              // +150% food gathering
  },
  
  forge: {
    level1: { wood: 40, stone: 80, gold: 5 },     // Unlock gold generation
    level2: { wood: 80, stone: 160, gold: 10 },   // +50% gold gen
    level3: { wood: 160, stone: 320, gold: 20 },  // +100% gold gen
  },
  
  defense: {
    level1: { wood: 50, stone: 100 },             // Reduce raid loss by 25%
    level2: { wood: 100, stone: 200 },            // Reduce raid loss by 50%
    level3: { wood: 200, stone: 400 },            // Reduce raid loss by 75%
  }
}
```

---

## 6. Smart Contract Integration

**Points where frontend calls blockchain:**

```solidity
// Minting Agent
JungleEngine.mintAgent(name, animal)
  → Returns: agentId, initialResources

// Launching Token (via LaunchpadRouter)
LaunchpadRouter.launchToken(agentId, tokenName, supply)
  → Burns resources from Treasury
  → Mints token on PonsFamily
  → Transfers earnings to agent's share

// Claiming Daily Prize
JungleTreasury.claimDailyPrize(agentId)
  → Requires: agent in top 3
  → Transfers: prize amount

// Upgrading Base
JungleEngine.upgradeBuilding(agentId, buildingType, level)
  → Burns resources
  → Updates baseLevel
```

---

## 7. Data Flow

```
┌─────────────────────────────────────────────────┐
│         Frontend (React + Three.js)             │
│  - Agent visualization (isometric jungle)       │
│  - Resource bars, health, status                │
│  - Launch button, leaderboard                   │
└──────────────┬──────────────────────────────────┘
               │
               ↓ (API calls)
┌─────────────────────────────────────────────────┐
│      Backend (Node.js Game Engine)              │
│  - Simulation loop (every 5 min)                │
│  - Agent state updates                          │
│  - Launch triggers                              │
│  - Leaderboard calculations                     │
└──────────────┬──────────────────────────────────┘
               │
               ↓ (Read/Write)
┌─────────────────────────────────────────────────┐
│    Database (PostgreSQL)                        │
│  - agents table                                 │
│  - launches table                               │
│  - leaderboard_snapshots table                  │
└──────────────┬──────────────────────────────────┘
               │
               ↓ (Contract calls)
┌─────────────────────────────────────────────────┐
│     Smart Contracts (RobinHoodEVM)              │
│  - Agent ownership                              │
│  - Treasury management                          │
│  - Token launches                               │
└─────────────────────────────────────────────────┘
```

---

## 8. Development Phases

### Phase 1: Core Agent Simulation (Week 1-2)
- [ ] Agent schema in database
- [ ] Basic simulation loop (health, hunger, gathering)
- [ ] API endpoint to get agent state
- [ ] Simple test UI showing agent data

### Phase 2: Visualization (Week 3-4)
- [ ] Isometric jungle world
- [ ] Agent sprite with idle/gathering/hunting animations
- [ ] Resource indicators
- [ ] Real-time state updates via WebSocket

### Phase 3: Base Building (Week 5-6)
- [ ] Building UI
- [ ] Building queue system
- [ ] Production bonuses applied
- [ ] Visual base upgrades

### Phase 4: Token Launches (Week 7-8)
- [ ] Launch UI
- [ ] PonsFamily API integration
- [ ] Treasury tracking
- [ ] Launch history

### Phase 5: Leaderboard & Competition (Week 9+)
- [ ] Daily leaderboard UI
- [ ] PvP raid mechanics
- [ ] Alliance system
- [ ] Prize payouts

---

## 9. Configuration Constants

```javascript
const SIMULATION_TICK = 300000              // 5 minutes
const LAUNCH_FREQUENCY = 86400000           // 24 hours
const BASE_GATHERING_RATE = 10              // Food per tick
const DAILY_RESET_TIME = '00:00 UTC'
const RAID_CHANCE_PER_TICK = 0.02           // 2%
const HEALTH_RECOVERY = 2                   // Per tick
const MAX_LAUNCHES_PER_DAY = 5
const TREASURY_DAILY_PRIZE_POOL = 1000      // Tokens
```

---

## Next: Build Phase 1

1. Create `agent` table in PostgreSQL
2. Write simulation loop in Node.js
3. Create `/api/agents/:id` endpoint
4. Build test UI to display agent stats
5. Hook up basic WebSocket for live updates

Let's start?
