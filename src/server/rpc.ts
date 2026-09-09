'use server';
import { agentService } from './agents.simple';

// Start simulation loop on server init
let simulationInterval: NodeJS.Timeout | null = null;

function ensureSimulationStarted() {
  if (simulationInterval) return;

  console.log('[Game] Starting simulation loop');

  // Run immediately
  agentService.simulationTick();

  // Then run every 30 seconds (for testing; 5 min in prod)
  simulationInterval = setInterval(() => {
    try {
      agentService.simulationTick();
      console.log(`[Simulation] Tick at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('[Simulation] Error:', error);
    }
  }, 30 * 1000);
}

// Simulate server functions as API endpoints
// For MVP, we'll expose these as global exports
export const gameApi = {
  getLeaderboard() {
    ensureSimulationStarted();
    return agentService.getLeaderboard(100);
  },

  getAgent(agentId: string) {
    return agentService.getAgent(agentId);
  },

  mintAgent(owner: string, name: string) {
    return agentService.mintAgent(owner, name);
  },

  getAllAgents() {
    return agentService.getAllAgents();
  },
};
