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

    const launches = agentService.getAgentLaunches(agentId, 10);
    return { success: true, data: { agent, launches } };
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

export const launchTokenFn = createServerFn(
  'POST',
  async (params: {
    agentId: string;
    tokenName: string;
    tokenSymbol: string;
    initialSupply: number;
    agentEarned: number;
  }) => {
    try {
      const launch = agentService.launchToken(
        params.agentId,
        params.tokenName,
        params.tokenSymbol,
        params.initialSupply,
        params.agentEarned,
      );
      return { success: true, data: launch };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
);

export const getAgentLaunchesFn = createServerFn('GET', async (agentId: string) => {
  try {
    const launches = agentService.getAgentLaunches(agentId, 50);
    return { success: true, data: launches };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});
