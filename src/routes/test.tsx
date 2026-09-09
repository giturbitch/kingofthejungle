import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  useLeaderboard,
  useMintAgent,
  useAgent,
  useAgentLaunches,
  Agent,
} from '../hooks/useGameEngine';

export const Route = createFileRoute('/test')({
  component: TestPage,
});

function TestPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [agentName, setAgentName] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('0x1234567890123456789012345678901234567890');

  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard();
  const { data: agentData, isLoading: agentLoading } = useAgent(selectedAgentId);
  const { data: launches, isLoading: launchesLoading } = useAgentLaunches(selectedAgentId);
  const mintMutation = useMintAgent();
  const agent = agentData?.agent as Agent | undefined;

  const handleMint = async () => {
    if (!agentName.trim()) {
      alert('Please enter an agent name');
      return;
    }

    await mintMutation.mutateAsync(
      {
        owner: ownerAddress,
        name: agentName,
      },
      {
        onSuccess: (newAgent) => {
          setSelectedAgentId(newAgent.id);
          setAgentName('');
          alert(`Agent "${newAgent.name}" minted! ID: ${newAgent.id}`);
        },
        onError: (error: any) => {
          alert(`Error: ${error.message}`);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Game Engine Test Dashboard</h1>

        <div className="grid grid-cols-2 gap-8">
          {/* Mint Section */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Mint New Agent</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Owner Address</label>
                <input
                  type="text"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  className="w-full bg-slate-700 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Agent Name (Unique)</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g., King Leonidas"
                  className="w-full bg-slate-700 rounded px-3 py-2 text-white"
                />
              </div>
              <button
                onClick={handleMint}
                disabled={mintMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 py-2 rounded font-bold"
              >
                {mintMutation.isPending ? 'Minting...' : 'Mint Agent'}
              </button>
              {mintMutation.error && (
                <div className="text-red-400 text-sm">
                  Error: {(mintMutation.error as Error).message}
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
            {leaderboardLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : !leaderboard || leaderboard.length === 0 ? (
              <p className="text-gray-400">No agents yet. Mint one!</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((a: any, i: number) => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAgentId(a.id)}
                    className={`p-3 rounded cursor-pointer ${
                      selectedAgentId === a.id
                        ? 'bg-blue-600'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-bold">
                          #{i + 1} {a.name} ({a.animal})
                        </div>
                        <div className="text-sm text-gray-400">
                          Health: {a.health} | Level: {a.baseLevel}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-yellow-400">${a.totalEarned?.toFixed(2) || '0.00'}</div>
                        <div className="text-gray-400">Vol: {a.dailyVolume?.toFixed(0) || '0'}</div>
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
          <div className="mt-8 bg-slate-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Agent Details</h2>
            {agentLoading ? (
              <p className="text-gray-400">Loading agent data...</p>
            ) : agent ? (
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-bold mb-4">{agent.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Animal:</span>
                      <span className="ml-2 font-bold">{agent.animal}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span
                        className={`ml-2 font-bold ${
                          agent.status === 'alive' ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {agent.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Level:</span>
                      <span className="ml-2 font-bold">{agent.baseLevel}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3">Health & Hunger</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Health</span>
                        <span className="text-green-400">{agent.health}/100</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded h-2">
                        <div
                          className="bg-green-500 h-2 rounded"
                          style={{ width: `${agent.health}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Hunger</span>
                        <span className="text-yellow-400">{agent.hunger}/100</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded"
                          style={{ width: `${agent.hunger}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3">Resources</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Food:</span>
                      <span className="font-bold text-orange-400">{agent.food}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Wood:</span>
                      <span className="font-bold text-amber-600">{agent.wood}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stone:</span>
                      <span className="font-bold text-gray-300">{agent.stone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gold:</span>
                      <span className="font-bold text-yellow-300">{agent.gold}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Agent not found</p>
            )}

            {/* Recent Launches */}
            {selectedAgentId && (
              <div className="mt-6">
                <h3 className="font-bold mb-3">Recent Launches</h3>
                {launchesLoading ? (
                  <p className="text-gray-400">Loading launches...</p>
                ) : !launches || launches.length === 0 ? (
                  <p className="text-gray-400">No launches yet</p>
                ) : (
                  <div className="space-y-2">
                    {launches.slice(0, 5).map((launch: any) => (
                      <div key={launch.id} className="bg-slate-700 p-3 rounded text-sm">
                        <div className="flex justify-between">
                          <div className="font-bold">${launch.tokenSymbol}</div>
                          <div className="text-yellow-400">
                            ${launch.agentEarned?.toFixed(2) || '0.00'}
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
