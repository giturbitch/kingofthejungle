import { storage, type Agent } from './storage';
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

export const agentService = {
  mintAgent(owner: string, name: string): Agent {
    // Check if name exists
    const existing = storage.getAgents().find((a) => a.name === name);
    if (existing) {
      throw new Error('Agent name already taken');
    }

    const agentId = crypto.randomUUID();
    const animal = hashToAnimal(agentId);
    const now = Date.now();

    const agent: Agent = {
      id: agentId,
      owner,
      name,
      animal,
      status: 'alive',
      health: 100,
      hunger: 100,
      food: 50,
      wood: 30,
      stone: 20,
      gold: 0,
      baseLevel: 1,
      totalEarned: 0,
      dailyVolume: 0,
      dailyMarketCap: 0,
      weeklyRank: 999,
      createdAt: now,
      lastActionAt: now,
      lastSimulationTick: now,
    };

    storage.addAgent(agent);
    return agent;
  },

  getAgent(agentId: string): Agent | undefined {
    return storage.getAgent(agentId);
  },

  getAgentsByOwner(owner: string): Agent[] {
    return storage.getAgents().filter((a) => a.owner === owner);
  },

  getLeaderboard(limit = 100): Agent[] {
    return storage.getLeaderboard(limit);
  },

  updateAgent(agentId: string, updates: Partial<Agent>) {
    storage.updateAgent(agentId, updates);
  },

  getAllAgents(): Agent[] {
    return storage.getAgents();
  },

  // Simulation tick - called every 5 minutes
  simulationTick() {
    const now = Date.now();
    const agents = storage.getAgents();

    for (const agent of agents) {
      if (agent.status !== 'alive') continue;

      // Gather resources
      const foodGain = Math.round(10 * (1 + (agent.baseLevel - 1) * 0.1) + (Math.random() - 0.5) * 4);
      const woodGain = Math.round(8 * (1 + (agent.baseLevel - 1) * 0.1) + (Math.random() - 0.5) * 3);
      const stoneGain = Math.round(5 * (1 + (agent.baseLevel - 1) * 0.1) + (Math.random() - 0.5) * 2);

      // Consume resources
      const foodConsume = 5;
      const woodConsume = 2;

      // Update hunger
      const newHunger = Math.max(0, agent.hunger - 8);

      // Calculate health changes
      let healthDelta = 2; // Base recovery
      if (newHunger < 20) {
        healthDelta -= 5; // Starvation damage
      } else if (newHunger < 50) {
        healthDelta -= 1; // Slow loss
      }

      const newHealth = Math.max(0, Math.min(100, agent.health + healthDelta));
      const newStatus = newHealth === 0 ? 'dead' : 'alive';

      // Update agent
      storage.updateAgent(agent.id, {
        food: Math.max(0, agent.food + foodGain - foodConsume),
        wood: Math.max(0, agent.wood + woodGain - woodConsume),
        stone: agent.stone + stoneGain,
        health: newHealth,
        hunger: newHunger,
        status: newStatus as 'alive' | 'dead',
        lastActionAt: now,
        lastSimulationTick: now,
        deathAt: newStatus === 'dead' ? now : undefined,
      });
    }

    // Update leaderboard
    storage.updateLeaderboard();
  },
};
