import { createFileRoute } from '@tanstack/react-router';
import { agentService } from '../server/agents.simple';
import { startSimulation } from '../server/rpc';

// Initialize simulation on first request
let simulationStarted = false;

export const Route = createFileRoute('/api')({
  beforeLoad: () => {
    if (!simulationStarted) {
      simulationStarted = true;
      startSimulation();
    }
  },
});

// This is a catch-all for API routes
// In production, use a proper API framework, but this works for MVP
export async function handleApiRequest(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // /api/leaderboard
  if (pathname === '/api/leaderboard' && request.method === 'GET') {
    const leaderboard = agentService.getLeaderboard(100);
    return new Response(JSON.stringify({ success: true, data: leaderboard }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // /api/agent/:id
  const agentMatch = pathname.match(/^\/api\/agent\/(.+)$/);
  if (agentMatch && request.method === 'GET') {
    const agent = agentService.getAgent(agentMatch[1]);
    if (agent) {
      return new Response(
        JSON.stringify({ success: true, data: agent }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
    return new Response(JSON.stringify({ success: false, error: 'Agent not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // /api/mint-agent
  if (pathname === '/api/mint-agent' && request.method === 'POST') {
    try {
      const body = await request.json();
      const agent = agentService.mintAgent(body.owner, body.name);
      return new Response(JSON.stringify({ success: true, data: agent }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}
