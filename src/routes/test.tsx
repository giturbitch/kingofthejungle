import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import type { Agent } from '../server/storage';

export const Route = createFileRoute('/test')({
  component: TestPage,
});

function TestPage() {
  const [agentName, setAgentName] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('0x1234567890123456789012345678901234567890');
  const [leaderboard, setLeaderboard] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load leaderboard
  const loadLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.data || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  // Load leaderboard on mount and every 5 seconds
  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load selected agent details
  useEffect(() => {
    if (!selectedAgent) return;

    const loadAgent = async () => {
      try {
        const response = await fetch(`/api/agent/${selectedAgent.id}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedAgent(data.data);
        }
      } catch (error) {
        console.error('Error loading agent:', error);
      }
    };

    loadAgent();
    const interval = setInterval(loadAgent, 3000);
    return () => clearInterval(interval);
  }, [selectedAgent?.id]);

  // Mint agent
  const handleMint = async () => {
    if (!agentName.trim()) {
      setMessage('Please enter an agent name');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/mint-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner: ownerAddress, name: agentName }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Agent "${data.data.name}" minted! (${data.data.animal})`);
        setAgentName('');
        setSelectedAgent(data.data);
        await loadLeaderboard();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">🎮 Jungle Predators</h1>
          <p className="text-gray-400">Game Engine Control Panel • Phase 1 MVP</p>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* Mint Section */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg border border-green-700/30 hover:border-green-600/50 transition">
            <h2 className="text-xl font-bold mb-4 text-green-400">✨ Mint Agent</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-slate-700 rounded px-3 py-2 text-xs text-white border border-slate-600 focus:border-green-500 focus:outline-none"
              />
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Agent Name"
                className="w-full bg-slate-700 rounded px-3 py-2 text-sm text-white border border-slate-600 focus:border-green-500 focus:outline-none"
              />
              <button
                onClick={handleMint}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 py-2 rounded font-bold transition text-sm"
              >
                {loading ? '⏳ Minting...' : '🦁 Mint'}
              </button>
              {message && (
                <div className={`text-xs p-2 rounded ${message.startsWith('✅') ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg border border-blue-700/30">
            <h2 className="text-xl font-bold mb-4 text-blue-400">📊 Stats</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-400">Active Agents</div>
                <div className="text-2xl font-bold text-green-400">{leaderboard.filter(a => a.status === 'alive').length}</div>
              </div>
              <div>
                <div className="text-gray-400">Total Volume</div>
                <div className="text-2xl font-bold text-yellow-400">
                  ${leaderboard.reduce((sum, a) => sum + a.dailyVolume, 0).toFixed(0)}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Simulation</div>
                <div className="text-green-400">🟢 Running (30s ticks)</div>
              </div>
            </div>
          </div>

          {/* Backend Status */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg border border-purple-700/30">
            <h2 className="text-xl font-bold mb-4 text-purple-400">⚙️ Backend</h2>
            <div className="space-y-2 text-xs text-gray-400">
              <div>✅ Agent Service</div>
              <div>✅ Persistent Storage</div>
              <div>✅ Simulation Loop</div>
              <div>✅ Leaderboard System</div>
              <div className="text-purple-400 mt-3 font-mono">5min ticks configured</div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg border border-amber-700/30 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">🏆 Leaderboard</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-3 text-sm text-gray-400">TOP AGENTS</h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((agent, i) => (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`p-3 rounded cursor-pointer transition ${
                      selectedAgent?.id === agent.id
                        ? 'bg-blue-600/30 border border-blue-500'
                        : 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm">#{i + 1} {agent.name}</div>
                        <div className="text-xs text-gray-400">{agent.animal} • Lvl {agent.baseLevel}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold text-sm">${agent.totalEarned.toFixed(0)}</div>
                        <div className="text-xs text-gray-400">HP: {agent.health}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Details */}
            {selectedAgent && (
              <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
                <h3 className="font-bold mb-3 text-sm text-gray-400">AGENT DETAILS</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-400">Name</div>
                    <div className="font-bold text-lg">{selectedAgent.name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-gray-400 text-xs">Health</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-600 rounded h-2 overflow-hidden">
                          <div
                            className="bg-green-500 h-full transition-all"
                            style={{ width: `${selectedAgent.health}%` }}
                          />
                        </div>
                        <span className="text-green-400 font-bold">{selectedAgent.health}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Hunger</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-600 rounded h-2 overflow-hidden">
                          <div
                            className="bg-yellow-500 h-full transition-all"
                            style={{ width: `${selectedAgent.hunger}%` }}
                          />
                        </div>
                        <span className="text-yellow-400 font-bold">{selectedAgent.hunger}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-600 pt-3">
                    <div className="text-gray-400 text-xs mb-2">Resources</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-600/50 p-2 rounded">
                        <div className="text-orange-400">🍗 Food</div>
                        <div className="font-bold">{selectedAgent.food}</div>
                      </div>
                      <div className="bg-slate-600/50 p-2 rounded">
                        <div className="text-amber-600">🪵 Wood</div>
                        <div className="font-bold">{selectedAgent.wood}</div>
                      </div>
                      <div className="bg-slate-600/50 p-2 rounded">
                        <div className="text-gray-300">⬜ Stone</div>
                        <div className="font-bold">{selectedAgent.stone}</div>
                      </div>
                      <div className="bg-slate-600/50 p-2 rounded">
                        <div className="text-yellow-300">✨ Gold</div>
                        <div className="font-bold">{selectedAgent.gold}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-600 pt-3">
                    <div className="text-gray-400 text-xs mb-1">Status: <span className={selectedAgent.status === 'alive' ? 'text-green-400' : 'text-red-400'} className="font-bold">{selectedAgent.status.toUpperCase()}</span></div>
                    <div className="text-gray-400 text-xs">Last Updated: {new Date(selectedAgent.lastActionAt).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs">
          Phase 1: Backend Simulation ✅ | Ready for Phase 2: Visualization 🎨
        </div>
      </div>
    </div>
  );
}
