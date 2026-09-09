import { createFileRoute, json } from '@tanstack/react-router';
import { agentService } from '../server/agents';
import { simulationEngine } from '../server/simulation';

export const Route = createFileRoute('/api/agents')({
  beforeLoad: async () => {
    // Ensure simulation is initialized
  },
  component: ApiAgents,
});

export async function ApiAgents() {
  return null;
}

// GET /api/agents - List all agents (leaderboard)
export async function GET_AGENTS() {
  try {
    const leaderboard = agentService.getLeaderboard(100);
    return json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// GET /api/agents/:id - Get agent state
export async function GET_AGENT(agentId: string) {
  try {
    const agent = agentService.getAgent(agentId);
    if (!agent) {
      return json(
        {
          success: false,
          error: 'Agent not found',
        },
        { status: 404 },
      );
    }

    const launches = agentService.getAgentLaunches(agentId, 10);

    return json({
      success: true,
      data: {
        agent,
        launches,
      },
    });
  } catch (error) {
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// POST /api/agents - Mint new agent
export async function POST_AGENT(
  owner: string,
  name: string,
) {
  try {
    const agent = agentService.mintAgent(owner, name);
    return json(
      {
        success: true,
        data: agent,
      },
      { status: 201 },
    );
  } catch (error) {
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    );
  }
}

// POST /api/agents/:id/launch - Launch token
export async function POST_LAUNCH(
  agentId: string,
  tokenName: string,
  tokenSymbol: string,
  initialSupply: number,
  agentEarned: number,
) {
  try {
    const launch = agentService.launchToken(
      agentId,
      tokenName,
      tokenSymbol,
      initialSupply,
      agentEarned,
    );

    return json(
      {
        success: true,
        data: launch,
      },
      { status: 201 },
    );
  } catch (error) {
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    );
  }
}

// GET /api/agents/:id/launches - Get agent launches
export async function GET_AGENT_LAUNCHES(agentId: string) {
  try {
    const launches = agentService.getAgentLaunches(agentId, 50);
    return json({
      success: true,
      data: launches,
    });
  } catch (error) {
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// GET /api/simulation/state - Get current simulation state
export async function GET_SIMULATION_STATE() {
  try {
    const leaderboard = simulationEngine.getCurrentLeaderboard(10);
    return json({
      success: true,
      data: {
        leaderboard,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
