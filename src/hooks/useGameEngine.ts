import { useQuery, useMutation } from '@tanstack/react-query';

const API_BASE = '/api';

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
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/agents`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      return data.data as Agent[];
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}

export function useAgent(agentId: string) {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/agents/${agentId}`);
      if (!res.ok) throw new Error('Failed to fetch agent');
      const data = await res.json();
      return data.data;
    },
    refetchInterval: 10000, // Refresh every 10s for real-time updates
    enabled: !!agentId,
  });
}

export function useAgentLaunches(agentId: string) {
  return useQuery({
    queryKey: ['launches', agentId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/agents/${agentId}/launches`);
      if (!res.ok) throw new Error('Failed to fetch launches');
      const data = await res.json();
      return data.data;
    },
    refetchInterval: 5000, // Refresh every 5s
    enabled: !!agentId,
  });
}

export function useMintAgent() {
  return useMutation({
    mutationFn: async (params: { owner: string; name: string }) => {
      const res = await fetch(`${API_BASE}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Failed to mint agent');
      const data = await res.json();
      return data.data;
    },
  });
}

export function useLaunchToken() {
  return useMutation({
    mutationFn: async (params: {
      agentId: string;
      tokenName: string;
      tokenSymbol: string;
      initialSupply: number;
      agentEarned: number;
    }) => {
      const res = await fetch(`${API_BASE}/agents/${params.agentId}/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Failed to launch token');
      const data = await res.json();
      return data.data;
    },
  });
}

export function useSimulationState() {
  return useQuery({
    queryKey: ['simulation-state'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/simulation/state`);
      if (!res.ok) throw new Error('Failed to fetch simulation state');
      const data = await res.json();
      return data.data;
    },
    refetchInterval: 5000, // Refresh every 5s
  });
}
