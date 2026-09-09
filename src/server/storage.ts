import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.game-data');
const AGENTS_FILE = path.join(DATA_DIR, 'agents.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export interface Agent {
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
  lastSimulationTick?: number;
  deathAt?: number;
}

interface GameData {
  agents: Record<string, Agent>;
  lastTick: number;
}

function loadData(): GameData {
  ensureDataDir();
  try {
    if (fs.existsSync(AGENTS_FILE)) {
      const data = fs.readFileSync(AGENTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading game data:', error);
  }
  return { agents: {}, lastTick: Date.now() };
}

function saveData(data: GameData) {
  ensureDataDir();
  try {
    fs.writeFileSync(AGENTS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving game data:', error);
  }
}

let gameData = loadData();

export const storage = {
  getAgents(): Agent[] {
    return Object.values(gameData.agents);
  },

  getAgent(id: string): Agent | undefined {
    return gameData.agents[id];
  },

  addAgent(agent: Agent) {
    gameData.agents[agent.id] = agent;
    saveData(gameData);
  },

  updateAgent(id: string, updates: Partial<Agent>) {
    if (gameData.agents[id]) {
      gameData.agents[id] = { ...gameData.agents[id], ...updates };
      saveData(gameData);
    }
  },

  getLeaderboard(limit = 100): Agent[] {
    return Object.values(gameData.agents)
      .filter((a) => a.status === 'alive')
      .sort((a, b) => b.dailyVolume - a.dailyVolume || b.dailyMarketCap - a.dailyMarketCap)
      .slice(0, limit)
      .map((agent, i) => ({ ...agent, weeklyRank: i + 1 }));
  },

  updateLeaderboard() {
    const leaderboard = this.getLeaderboard(9999);
    leaderboard.forEach((agent, i) => {
      gameData.agents[agent.id].weeklyRank = i + 1;
    });
    saveData(gameData);
  },

  getLastTick(): number {
    return gameData.lastTick;
  },

  setLastTick(tick: number) {
    gameData.lastTick = tick;
    saveData(gameData);
  },

  resetDailyCounters() {
    for (const agent of this.getAgents()) {
      agent.dailyVolume = 0;
      agent.dailyMarketCap = 0;
    }
    saveData(gameData);
  },
};
