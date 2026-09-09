import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/test')({
  component: TestPage,
});

// Import server functions using dynamic import to avoid client/server boundary issues
async function callMintAgent(owner: string, name: string) {
  const res = await fetch('/__server__/mint-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner, name }),
  });
  return res.json();
}

async function callGetLeaderboard() {
  const res = await fetch('/__server__/get-leaderboard');
  return res.json();
}

async function callGetAgent(agentId: string) {
  const res = await fetch(`/__server__/get-agent?id=${agentId}`);
  return res.json();
}

function TestPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [agentName, setAgentName] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('0x1234567890123456789012345678901234567890');

  // Simple demo - just show the interface
  const handleMint = async () => {
    if (!agentName.trim()) {
      alert('Please enter an agent name');
      return;
    }

    try {
      const result = await callMintAgent(ownerAddress, agentName);
      if (result.success) {
        setSelectedAgentId(result.data.id);
        setAgentName('');
        alert(`Agent "${result.data.name}" minted!`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">🎮 Jungle Predators</h1>
        <p className="text-gray-400 mb-8">Game Engine Test Dashboard (MVP)</p>

        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Mint Section */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">✨ Mint New Agent</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-300">Owner Address</label>
                <input
                  type="text"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  className="w-full bg-slate-700 rounded px-3 py-2 text-white text-sm border border-slate-600 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-300">Agent Name (Unique)</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g., King Leonidas"
                  className="w-full bg-slate-700 rounded px-3 py-2 text-white text-sm border border-slate-600 focus:border-green-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleMint}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 py-3 rounded font-bold transition"
              >
                🦁 Mint Agent
              </button>
              <div className="text-xs text-gray-400 bg-slate-800 p-3 rounded">
                ℹ️ Agent names are permanent and unique. Choose wisely!
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">📊 Leaderboard</h2>
            <div className="space-y-3">
              <div className="bg-slate-700 p-4 rounded">
                <div className="text-gray-400 text-sm">Status</div>
                <div className="text-lg font-bold text-green-400">🟢 Backend Ready</div>
                <div className="text-xs text-gray-400 mt-2">
                  Agent simulation engine initialized
                </div>
              </div>
              <div className="bg-slate-700 p-4 rounded">
                <div className="text-gray-400 text-sm">Active Agents</div>
                <div className="text-lg font-bold">0</div>
              </div>
              <div className="bg-slate-700 p-4 rounded">
                <div className="text-gray-400 text-sm">Total Volume</div>
                <div className="text-lg font-bold text-yellow-400">$0.00</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">🚀 Backend Features Implemented</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">✓</span>
                <div>
                  <div className="font-bold">Agent Minting</div>
                  <div className="text-sm text-gray-400">Create unique AI agents with names</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">✓</span>
                <div>
                  <div className="font-bold">Simulation Engine</div>
                  <div className="text-sm text-gray-400">5-min ticks: gathering, health, hunger</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">✓</span>
                <div>
                  <div className="font-bold">Resource Management</div>
                  <div className="text-sm text-gray-400">Food, wood, stone, gold tracking</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">✓</span>
                <div>
                  <div className="font-bold">Token Launches</div>
                  <div className="text-sm text-gray-400">Track earnings from launches</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">✓</span>
                <div>
                  <div className="font-bold">Leaderboard System</div>
                  <div className="text-sm text-gray-400">Daily rankings by volume & market cap</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">✓</span>
                <div>
                  <div className="font-bold">Death Mechanics</div>
                  <div className="text-sm text-gray-400">Health-based agent elimination</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-900/30 border border-blue-700 p-6 rounded-lg">
          <h3 className="font-bold text-blue-300 mb-3">📋 Next Steps</h3>
          <ul className="space-y-2 text-sm text-blue-200">
            <li>✓ Phase 1: Agent Mechanics ← You are here</li>
            <li>→ Phase 2: Frontend Visualization (isometric jungle)</li>
            <li>→ Phase 3: Smart Contract Integration</li>
            <li>→ Phase 4: PvP & Alliances</li>
            <li>→ Phase 5: Leaderboard & Prize System</li>
          </ul>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          Built with TanStack Start • TypeScript • React Query • In-Memory MVP Storage
        </div>
      </div>
    </div>
  );
}
