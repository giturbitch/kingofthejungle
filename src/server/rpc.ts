import { createServerFn } from '@tanstack/react-start';
import { agentService } from './agents.simple';

export const mintAgentFn = createServerFn('POST', async (params: { owner: string; name: string }) => {
  try {
    const agent = agentService.mintAgent(params.owner, params.name);
    return { success: true, data: agent };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

export const getAgentFn = createServerFn('GET', async (agentId: string) => {
  try {
    const agent = agentService.getAgent(agentId);
    if (!agent) {
      return { success: false, error: 'Agent not found' };
    }
    return { success: true, data: { agent, launches: [] } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

export const getLeaderboardFn = createServerFn('GET', async () => {
  try {
    const leaderboard = agentService.getLeaderboard(100);
    return { success: true, data: leaderboard };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

// Start simulation loop on server init
let simulationInterval: NodeJS.Timeout | null = null;

export function startSimulation() {
  if (simulationInterval) return;

  console.log('[Game] Starting simulation loop (5 min ticks)');

  // Run immediately
  agentService.simulationTick();

  // Then run every 5 minutes (or every 30 seconds for testing)
  simulationInterval = setInterval(() => {
    try {
      agentService.simulationTick();
      console.log(`[Game] Simulation tick at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('[Game] Simulation error:', error);
    }
  }, 30 * 1000); // 30 seconds for testing (change to 5 * 60 * 1000 for production)
}
