// Simplified in-memory agent storage for MVP
// TODO: Replace with proper database when deploying

interface Agent {
  id: string;
  owner: string;
  name: string;
  animal: string;
  status: 'alive' | 'dead' | 'resting';
  health: number;
  hunger: number;
  food: number;
  wood: number;
  stone: number;
  gold: number;
  baseLevel: number;
  totalEarned: number;
  dailyVolume: number;
  dailyMarketCap: number;
  weeklyRank: number;
  createdAt: number;
  lastActionAt: number;
  deathAt?: number;
}

interface Launch {
  id: string;
  agentId: string;
  tokenName: string;
  tokenSymbol: string;
  initialSupply: number;
  agentEarned: number;
  treasuryEarned: number;
  tradingVolume: number;
  marketCap: number;
  launchedAt: number;
  tokenAddress?: string;
}

// In-memory storage
const agents = new Map<string, Agent>();
const launches = new Map<string, Launch>();
let agentSequence = 0;

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
    for (const agent of agents.values()) {
      if (agent.name === name) {
        throw new Error('Agent name already taken');
      }
    }

    const agentId = `agent-${++agentSequence}-${Date.now()}`;
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
    };

    agents.set(agentId, agent);
    return agent;
  },

  getAgent(agentId: string): Agent | undefined {
    return agents.get(agentId);
  },

  getAgentsByOwner(owner: string): Agent[] {
    const result = [];
    for (const agent of agents.values()) {
      if (agent.owner === owner) {
        result.push(agent);
      }
    }
    return result;
  },

  launchToken(
    agentId: string,
    tokenName: string,
    tokenSymbol: string,
    initialSupply: number,
    agentEarned: number,
  ): Launch {
    const agent = agents.get(agentId);
    if (!agent) throw new Error('Agent not found');
    if (agent.status !== 'alive') throw new Error('Agent is dead');

    const launchId = `launch-${Date.now()}`;
    const now = Date.now();

    const launch: Launch = {
      id: launchId,
      agentId,
      tokenName,
      tokenSymbol,
      initialSupply,
      agentEarned,
      treasuryEarned: agentEarned * 0.4 / 0.6,
      tradingVolume: 0,
      marketCap: 0,
      launchedAt: now,
    };

    launches.set(launchId, launch);

    // Update agent
    agent.totalEarned += agentEarned;
    agent.lastActionAt = now;

    return launch;
  },

  getAgentLaunches(agentId: string, limit = 50): Launch[] {
    const result = [];
    for (const launch of launches.values()) {
      if (launch.agentId === agentId) {
        result.push(launch);
      }
    }
    return result.sort((a, b) => b.launchedAt - a.launchedAt).slice(0, limit);
  },

  getLeaderboard(limit = 100): Agent[] {
    const aliveAgents = Array.from(agents.values())
      .filter((a) => a.status === 'alive')
      .sort((a, b) => b.dailyVolume - a.dailyVolume || b.dailyMarketCap - a.dailyMarketCap);

    // Update ranks
    aliveAgents.forEach((agent, i) => {
      agent.weeklyRank = i + 1;
    });

    return aliveAgents.slice(0, limit);
  },

  updateAgentHealth(agentId: string, delta: number): void {
    const agent = agents.get(agentId);
    if (agent) {
      agent.health = Math.max(0, Math.min(100, agent.health + delta));
      if (agent.health === 0) {
        agent.status = 'dead';
        agent.deathAt = Date.now();
      }
      agent.lastActionAt = Date.now();
    }
  },

  updateAgentResources(agentId: string, resources: Partial<Omit<Agent, keyof typeof resources>>): void {
    const agent = agents.get(agentId);
    if (agent) {
      Object.assign(agent, resources);
      agent.lastActionAt = Date.now();
    }
  },

  getAllAgents(): Agent[] {
    return Array.from(agents.values());
  },
};
