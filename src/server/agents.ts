import { getDB } from './db';
import crypto from 'crypto';

const ANIMALS = [
  'LION', 'TIGER', 'PANTHER', 'WOLF', 'BEAR',
  'GORILLA', 'EAGLE', 'SNAKE', 'CROCODILE', 'JAGUAR',
  'HYENA', 'BOAR',
];

function hashToAnimal(hash: string): string {
  const index = parseInt(hash.slice(0, 8), 16) % ANIMALS.length;
  return ANIMALS[index];
}

export class AgentService {
  private db = getDB();

  mintAgent(owner: string, name: string) {
    // Check if name exists
    const existing = this.db
      .prepare('SELECT id FROM agents WHERE name = ?')
      .get(name);

    if (existing) {
      throw new Error('Agent name already taken');
    }

    // Generate deterministic animal from agent ID
    const agentId = crypto.randomUUID();
    const animal = hashToAnimal(agentId);

    const now = Date.now();

    const stmt = this.db.prepare(`
      INSERT INTO agents (
        id, owner, name, animal,
        status, health, hunger,
        food, wood, stone, gold,
        baseLevel,
        createdAt, lastActionAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      agentId,           // id
      owner,             // owner
      name,              // name
      animal,            // animal
      'alive',           // status
      100,               // health
      100,               // hunger
      50,                // food
      30,                // wood
      20,                // stone
      0,                 // gold
      1,                 // baseLevel
      now,               // createdAt
      now,               // lastActionAt
    );

    return this.getAgent(agentId);
  }

  getAgent(agentId: string) {
    return this.db
      .prepare('SELECT * FROM agents WHERE id = ?')
      .get(agentId);
  }

  getAgentsByOwner(owner: string) {
    return this.db
      .prepare('SELECT * FROM agents WHERE owner = ? ORDER BY createdAt DESC')
      .all(owner);
  }

  launchToken(
    agentId: string,
    tokenName: string,
    tokenSymbol: string,
    initialSupply: number,
    agentEarned: number,
  ) {
    const agent = this.getAgent(agentId);
    if (!agent) throw new Error('Agent not found');
    if (agent.status !== 'alive') throw new Error('Agent is dead');

    // Check cooldown (24h between launches)
    const hoursSinceLaunch = (Date.now() - agent.lastLaunchTime) / (1000 * 60 * 60);
    if (agent.launchesToday > 0 && hoursSinceLaunch < 24) {
      throw new Error('Agent must wait 24 hours between launches');
    }

    // Create launch record
    const launchId = crypto.randomUUID();
    const now = Date.now();

    const stmt = this.db.prepare(`
      INSERT INTO launches (
        id, agentId, tokenName, tokenSymbol,
        initialSupply, launchpadId,
        agentEarned, treasuryEarned,
        launchedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      launchId,
      agentId,
      tokenName,
      tokenSymbol,
      initialSupply,
      'ponsfamily',
      agentEarned,
      agentEarned * 0.4 / 0.6, // Assuming 60/40 split
      now,
    );

    // Update agent
    const updateStmt = this.db.prepare(`
      UPDATE agents
      SET
        totalEarned = totalEarned + ?,
        treasuryShare = treasuryShare + ?,
        lastLaunchTime = ?,
        launchesToday = launchesToday + 1,
        lastActionAt = ?
      WHERE id = ?
    `);

    updateStmt.run(
      agentEarned,
      agentEarned * 0.4 / 0.6,
      now,
      now,
      agentId,
    );

    return this.db
      .prepare('SELECT * FROM launches WHERE id = ?')
      .get(launchId);
  }

  getAgentLaunches(agentId: string, limit = 50) {
    return this.db
      .prepare(`
        SELECT * FROM launches
        WHERE agentId = ?
        ORDER BY launchedAt DESC
        LIMIT ?
      `)
      .all(agentId, limit);
  }

  updateLeaderboardRank() {
    const ranks = this.db
      .prepare(`
        SELECT id FROM agents
        WHERE status = 'alive'
        ORDER BY dailyVolume DESC, dailyMarketCap DESC
      `)
      .all();

    const updateStmt = this.db.prepare(`
      UPDATE agents SET weeklyRank = ? WHERE id = ?
    `);

    ranks.forEach((row: any, index: number) => {
      updateStmt.run(index + 1, row.id);
    });
  }

  getLeaderboard(limit = 100) {
    return this.db
      .prepare(`
        SELECT
          id, name, animal, owner, health, baseLevel,
          dailyVolume, dailyMarketCap, totalEarned,
          status, weeklyRank
        FROM agents
        WHERE status = 'alive'
        ORDER BY weeklyRank ASC
        LIMIT ?
      `)
      .all(limit);
  }

  awardDailyPrizes(treasuryAmount: number) {
    const topAgents = this.db
      .prepare(`
        SELECT id FROM agents
        WHERE status = 'alive'
        ORDER BY weeklyRank ASC
        LIMIT 3
      `)
      .all();

    const prizes = [
      treasuryAmount * 0.5,  // 1st place: 50%
      treasuryAmount * 0.3,  // 2nd place: 30%
      treasuryAmount * 0.2,  // 3rd place: 20%
    ];

    const updateStmt = this.db.prepare(`
      UPDATE agents
      SET treasuryShare = treasuryShare + ?
      WHERE id = ?
    `);

    topAgents.forEach((row: any, index: number) => {
      if (index < prizes.length) {
        updateStmt.run(prizes[index], row.id);
      }
    });

    return topAgents;
  }
}

export const agentService = new AgentService();
