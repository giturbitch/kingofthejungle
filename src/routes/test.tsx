import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  mintAgentFn,
  getAgentFn,
  getLeaderboardFn,
  getAgentLaunchesFn,
} from '../server/rpc';

export const Route = createFileRoute('/test')({
  component: TestPage,
});

function TestPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [agentName, setAgentName] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('0x1234567890123456789012345678901234567890');

  const { data: leaderboard, refetch: refetchLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboardFn(),
    refetchInterval: 5000,
  });

  const { data: agentData, refetch: refetchAgent } = useQuery({
    queryKey: ['agent', selectedAgentId],
    queryFn: () => getAgentFn(selectedAgentId),
    refetchInterval: 5000,
    enabled: !!selectedAgentId,
  });

  const { data: launches } = useQuery({
    queryKey: ['launches', selectedAgentId],
    queryFn: () => getAgentLaunchesFn(selectedAgentId),
    refetchInterval: 5000,
    enabled: !!selectedAgentId,
  });

  const mintMutation = useMutation({
    mutationFn: () =>
      mintAgentFn({
        owner: ownerAddress,
        name: agentName,
      }),
    onSuccess: (result) => {
      if (result.success) {
        setSelectedAgentId(result.data.id);
        setAgentName('');
        refetchLeaderboard();
        alert(`Agent "${result.data.name}" minted!`);
      } else {
        alert(`Error: ${result.error}`);
      }
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    },
  });

  const agent = agentData?.data?.agent;
  const leaderboardData = leaderboard?.data || [];

  const handleMint = async () => {
    if (!agentName.trim()) {
      alert('Please enter an agent name');
      return;
    }
    await mintMutation.mutateAsync();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🎮 Game Engine Test Dashboard</h1>

        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Mint Section */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">✨ Mint New Agent</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Owner Address</label>
                <input
                  type="text"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  className="w-full bg-slate-700 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Agent Name (Unique)</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g., King Leonidas"
                  className="w-full bg-slate-700 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <button
                onClick={handleMint}
                disabled={mintMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 py-2 rounded font-bold"
              >
                {mintMutation.isPending ? '⏳ Minting...' : '🦁 Mint Agent'}
              </button>
              {mintMutation.error && (
                <div className="text-red-400 text-sm">
                  Error: {(mintMutation.error as Error).message}
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">🏆 Leaderboard</h2>
            {!leaderboard ? (
              <p className="text-gray-400">Loading...</p>
            ) : leaderboardData.length === 0 ? (
              <p className="text-gray-400">No agents yet. Mint one!</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {leaderboardData.slice(0, 10).map((a: any, i: number) => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAgentId(a.id)}
                    className={`p-3 rounded cursor-pointer transition ${
                      selectedAgentId === a.id ? 'bg-blue-600 border border-blue-400' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-bold">
                          #{i + 1} {a.name} ({a.animal})
                        </div>
                        <div className="text-sm text-gray-400">
                          ❤️ {a.health} | 🏗️ Level {a.baseLevel}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-yellow-400 font-bold">${a.totalEarned?.toFixed(2) || '0.00'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Agent Details */}
        {selectedAgentId && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-bold mb-6">📊 Agent Details</h2>
            {!agentData ? (
              <p className="text-gray-400">Loading agent data...</p>
            ) : agent ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-700 p-4 rounded">
                    <div className="text-gray-400 text-sm">Name</div>
                    <div className="text-2xl font-bold">{agent.name}</div>
                    <div className="text-yellow-400">{agent.animal}</div>
                  </div>
                  <div className="bg-slate-700 p-4 rounded">
                    <div className="text-gray-400 text-sm">Status</div>
                    <div
                      className={`text-2xl font-bold ${
                        agent.status === 'alive' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {agent.status.toUpperCase()}
                    </div>
                    <div className="text-gray-400 text-sm">Level {agent.baseLevel}</div>
                  </div>
                  <div className="bg-slate-700 p-4 rounded">
                    <div className="text-gray-400 text-sm">Total Earned</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      ${agent.totalEarned?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div className="bg-slate-700 p-4 rounded">
                    <div className="text-gray-400 text-sm">Rank</div>
                    <div className="text-2xl font-bold">#{agent.weeklyRank || '?'}</div>
                  </div>
                </div>

                {/* Health & Hunger */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-bold">❤️ Health</span>
                      <span className="text-green-400">{agent.health}/100</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded h-4 overflow-hidden">
                      <div
                        className="bg-green-500 h-4 transition-all"
                        style={{ width: `${agent.health}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-bold">😋 Hunger</span>
                      <span className="text-yellow-400">{agent.hunger}/100</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded h-4 overflow-hidden">
                      <div
                        className="bg-yellow-500 h-4 transition-all"
                        style={{ width: `${agent.hunger}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Resources */}
                <div className="bg-slate-700 p-4 rounded">
                  <h3 className="font-bold mb-4">🛠️ Resources</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Food</div>
                      <div className="text-orange-400 text-2xl font-bold">{agent.food}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Wood</div>
                      <div className="text-amber-600 text-2xl font-bold">{agent.wood}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Stone</div>
                      <div className="text-gray-300 text-2xl font-bold">{agent.stone}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">Gold</div>
                      <div className="text-yellow-300 text-2xl font-bold">{agent.gold}</div>
                    </div>
                  </div>
                </div>

                {/* Recent Launches */}
                <div className="bg-slate-700 p-4 rounded">
                  <h3 className="font-bold mb-4">🚀 Recent Launches</h3>
                  {!launches ? (
                    <p className="text-gray-400">Loading launches...</p>
                  ) : launches.data?.length === 0 ? (
                    <p className="text-gray-400">No launches yet</p>
                  ) : (
                    <div className="space-y-2">
                      {launches.data?.slice(0, 5).map((launch: any) => (
                        <div key={launch.id} className="bg-slate-600 p-3 rounded text-sm">
                          <div className="flex justify-between">
                            <div className="font-bold">${launch.tokenSymbol}</div>
                            <div className="text-yellow-400">
                              +${launch.agentEarned?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(launch.launchedAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Agent not found</p>
            )}
          </div>
        )}

        <div className="mt-8 text-center text-gray-400 text-sm">
          🎮 Game Engine MVP • Auto-refresh every 5 seconds • Server Functions via TanStack Start
        </div>
      </div>
    </div>
  );
}
