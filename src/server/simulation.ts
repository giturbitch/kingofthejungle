import { getDB } from './db';

interface AgentRow {
  id: string;
  status: string;
  health: number;
  hunger: number;
  food: number;
  wood: number;
  stone: number;
  gold: number;
  baseLevel: number;
}

const CONFIG = {
  TICK_INTERVAL: 5 * 60 * 1000,        // 5 minutes
  BASE_FOOD_GATHER: 10,
  BASE_WOOD_GATHER: 8,
  BASE_STONE_GATHER: 5,
  BASE_FOOD_CONSUME: 5,
  BASE_WOOD_CONSUME: 2,
  HEALTH_RECOVERY: 2,
  STARVATION_DAMAGE: 5,
  HUNGER_DECREMENT: 8,
};

export class SimulationEngine {
  private db = getDB();
  private lastSimulationTime = 0;

  tick() {
    const now = Date.now();

    // Get all alive agents
    const agents = this.db
      .prepare('SELECT * FROM agents WHERE status = ?')
      .all('alive') as AgentRow[];

    for (const agent of agents) {
      this.updateAgent(agent);
    }

    this.lastSimulationTime = now;
  }

  private updateAgent(agent: AgentRow) {
    // 1. Gather resources
    const gathered = this.gatherResources(agent);

    // 2. Consume resources
    const { food, wood } = this.consumeResources(agent);

    // 3. Calculate health
    const health = this.calculateHealth(
      agent,
      gathered.food,
      food,
    );

    // 4. Check death
    const status = health <= 0 ? 'dead' : 'alive';
    const deathAt = status === 'dead' ? Date.now() : null;

    // 5. Update agent
    const stmt = this.db.prepare(`
      UPDATE agents
      SET
        food = ?,
        wood = ?,
        stone = ?,
        health = ?,
        hunger = ?,
        status = ?,
        deathAt = ?,
        lastActionAt = ?
      WHERE id = ?
    `);

    const newFood = Math.max(0, agent.food + gathered.food - food);
    const newWood = Math.max(0, agent.wood + gathered.wood - wood);
    const newHunger = Math.max(0, agent.hunger - CONFIG.HUNGER_DECREMENT);

    stmt.run(
      newFood,
      newWood,
      agent.stone + gathered.stone,
      Math.max(0, health),
      newHunger,
      status,
      deathAt,
      Date.now(),
      agent.id,
    );
  }

  private gatherResources(agent: AgentRow) {
    const variance = (Math.random() - 0.5) * 0.4; // ±20%
    const baseMultiplier = 1 + (agent.baseLevel - 1) * 0.1;

    return {
      food: Math.round(CONFIG.BASE_FOOD_GATHER * baseMultiplier * (1 + variance)),
      wood: Math.round(CONFIG.BASE_WOOD_GATHER * baseMultiplier * (1 + variance)),
      stone: Math.round(CONFIG.BASE_STONE_GATHER * baseMultiplier * (1 + variance)),
    };
  }

  private consumeResources(agent: AgentRow) {
    const consumption = {
      food: CONFIG.BASE_FOOD_CONSUME,
      wood: CONFIG.BASE_WOOD_CONSUME,
    };

    return consumption;
  }

  private calculateHealth(
    agent: AgentRow,
    foodGathered: number,
    foodConsumed: number,
  ): number {
    let health = agent.health;

    // Base recovery
    health += CONFIG.HEALTH_RECOVERY;

    // Hunger penalty if starving
    if (agent.hunger < 20) {
      health -= CONFIG.STARVATION_DAMAGE;
    } else if (agent.hunger < 50) {
      health -= 1; // Slow health loss
    }

    // Cap at 100
    return Math.min(100, Math.max(0, health));
  }

  getCurrentLeaderboard(limit = 100) {
    return this.db
      .prepare(`
        SELECT
          id,
          name,
          animal,
          owner,
          health,
          baseLevel,
          dailyVolume,
          dailyMarketCap,
          totalEarned,
          status
        FROM agents
        WHERE status = 'alive'
        ORDER BY dailyVolume DESC, dailyMarketCap DESC
        LIMIT ?
      `)
      .all(limit);
  }

  getAgentState(agentId: string) {
    return this.db
      .prepare('SELECT * FROM agents WHERE id = ?')
      .get(agentId);
  }

  resetDailyCounters() {
    this.db.prepare(`
      UPDATE agents
      SET
        dailyVolume = 0,
        dailyMarketCap = 0,
        launchesToday = 0
      WHERE status = 'alive'
    `).run();
  }
}

export const simulationEngine = new SimulationEngine();

// Export function to run simulation on schedule
export function startSimulation() {
  // Run immediately
  simulationEngine.tick();

  // Then run every CONFIG.TICK_INTERVAL
  setInterval(() => {
    try {
      simulationEngine.tick();
      console.log(`[Simulation] Tick at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('[Simulation] Error during tick:', error);
    }
  }, CONFIG.TICK_INTERVAL);
}

// Daily reset
export function startDailyReset() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    try {
      simulationEngine.resetDailyCounters();
      console.log('[Simulation] Daily reset at UTC midnight');
      // Reschedule for next day
      startDailyReset();
    } catch (error) {
      console.error('[Simulation] Error during daily reset:', error);
    }
  }, msUntilMidnight);
}
