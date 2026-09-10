import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { JungleScene3D } from '../components/jungle/JungleScene3D';
import type { Agent } from '../server/storage';

export const Route = createFileRoute('/jungle')({
  component: JunglePage,
});

function JunglePage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [mintName, setMintName] = useState('');
  const [minting, setMinting] = useState(false);
  const [mintMessage, setMintMessage] = useState('');

  // Simulate wallet connection
  const handleConnectWallet = () => {
    const mockAddress = '0x' + Math.random().toString(16).slice(2, 42);
    setWalletAddress(mockAddress);

    // Filter agents owned by this wallet
    const owned = agents.filter(a => a.owner === mockAddress || Math.random() > 0.7);
    setUserAgents(owned.length > 0 ? owned : [agents[0]]);
  };

  // Mint survivor
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress) {
      setMintMessage('❌ Connect wallet first');
      return;
    }

    if (!mintName.trim()) {
      setMintMessage('❌ Enter a survivor name');
      return;
    }

    if (agents.some(a => a.name.toLowerCase() === mintName.toLowerCase())) {
      setMintMessage('❌ That name is taken!');
      return;
    }

    setMinting(true);
    setMintMessage('');
    await new Promise(resolve => setTimeout(resolve, 800));

    const animals = ['LION', 'TIGER', 'PANTHER', 'WOLF', 'BEAR', 'GORILLA', 'EAGLE', 'BOAR'];
    const newAgent: Agent = {
      id: `survivor-${Date.now()}`,
      owner: walletAddress,
      name: mintName,
      animal: animals[Math.floor(Math.random() * animals.length)],
      status: 'alive',
      health: 100,
      hunger: 100,
      food: 50,
      wood: 30,
      stone: 20,
      gold: 0,
      baseLevel: 1,
      totalEarned: 0,
      dailyVolume: 0,
      dailyMarketCap: 0,
      weeklyRank: agents.length + 1,
      createdAt: Date.now(),
      lastActionAt: Date.now(),
    };

    const updated = [...agents, newAgent];
    setAgents(updated);
    localStorage.setItem('jungle_agents', JSON.stringify(updated));
    setMintMessage(`✅ ${newAgent.name} the ${newAgent.animal} has entered the jungle!`);
    setMintName('');
    setSelectedAgent(newAgent);
    setMinting(false);
  };

  // Load agents
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const stored = localStorage.getItem('jungle_agents');
        if (stored) {
          const agentsList = JSON.parse(stored);
          setAgents(agentsList);
          setLoading(false);
          return;
        }

        // Demo survivors
        const demoAgents: Agent[] = [
          {
            id: 'demo-1',
            owner: '0x1234',
            name: 'King Leonidas',
            animal: 'LION',
            status: 'alive',
            health: 95,
            hunger: 85,
            food: 120,
            wood: 95,
            stone: 80,
            gold: 12,
            baseLevel: 5,
            totalEarned: 2450,
            dailyVolume: 8500,
            dailyMarketCap: 225000,
            weeklyRank: 1,
            createdAt: Date.now() - 86400000 * 7,
            lastActionAt: Date.now(),
          },
          {
            id: 'demo-2',
            owner: '0x5678',
            name: 'Shadow Panther',
            animal: 'PANTHER',
            status: 'alive',
            health: 78,
            hunger: 72,
            food: 95,
            wood: 110,
            stone: 65,
            gold: 8,
            baseLevel: 4,
            totalEarned: 1850,
            dailyVolume: 6200,
            dailyMarketCap: 156000,
            weeklyRank: 2,
            createdAt: Date.now() - 86400000 * 5,
            lastActionAt: Date.now(),
          },
          {
            id: 'demo-3',
            owner: '0x9abc',
            name: 'Inferno Tiger',
            animal: 'TIGER',
            status: 'alive',
            health: 82,
            hunger: 68,
            food: 140,
            wood: 75,
            stone: 95,
            gold: 15,
            baseLevel: 4,
            totalEarned: 1620,
            dailyVolume: 5800,
            dailyMarketCap: 142000,
            weeklyRank: 3,
            createdAt: Date.now() - 86400000 * 4,
            lastActionAt: Date.now(),
          },
        ];

        setAgents(demoAgents);
        localStorage.setItem('jungle_agents', JSON.stringify(demoAgents));
        setLoading(false);
      } catch (error) {
        console.error('Error loading agents:', error);
        setLoading(false);
      }
    };

    loadAgents();
    const interval = setInterval(loadAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate agent updates
  useEffect(() => {
    const updateAgents = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => ({
          ...agent,
          health: Math.max(0, Math.min(100, agent.health + (Math.random() - 0.5) * 5)),
          hunger: Math.max(0, Math.min(100, agent.hunger + (Math.random() - 0.5) * 4)),
          food: Math.max(0, agent.food + Math.floor((Math.random() - 0.5) * 15)),
          wood: Math.max(0, agent.wood + Math.floor((Math.random() - 0.5) * 12)),
          stone: Math.max(0, agent.stone + Math.floor((Math.random() - 0.5) * 8)),
          dailyVolume: agent.dailyVolume + Math.random() * 100,
          lastActionAt: Date.now(),
        })),
      );
    }, 3000);

    return () => clearInterval(updateAgents);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌿</div>
          <p className="text-white text-2xl font-bold">Entering the Jungle...</p>
          <p className="text-gray-400 text-sm mt-2">Loading survivors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-900 relative overflow-hidden">
      {/* 3D Jungle Scene */}
      <JungleScene3D
        agents={agents}
        selectedAgentId={selectedAgent?.id}
        onAgentClick={(agentId) => {
          const agent = agents.find((a) => a.id === agentId);
          if (agent) setSelectedAgent(agent);
        }}
      />

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent p-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          {/* Title */}
          <div className="space-y-2 pointer-events-auto">
            <button
              onClick={() => navigate({ to: '/' })}
              className="mb-3 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-amber-600/30 hover:border-amber-600/50 rounded-lg text-sm font-bold text-amber-300 transition-all"
            >
              ← Back to Home
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-5xl drop-shadow-2xl">🦁</div>
              <div>
                <h1 className="text-5xl font-black text-white drop-shadow-2xl tracking-wider">
                  JUNGLE PREDATORS
                </h1>
                <p className="text-green-300 font-bold drop-shadow-lg text-sm">
                  {agents.filter((a) => a.status === 'alive').length} Active Survivors Hunting
                </p>
              </div>
            </div>
          </div>

          {/* Wallet & Stats */}
          <div className="space-y-4 pointer-events-auto w-80">
            {!walletAddress ? (
              <button
                onClick={handleConnectWallet}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg transition-all hover:scale-105 drop-shadow-lg"
              >
                🔗 Connect Wallet
              </button>
            ) : (
              <form onSubmit={handleMint} className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm border border-green-600/50 rounded-lg p-4 space-y-3">
                <div className="text-xs text-gray-300">Your Address</div>
                <div className="font-mono text-xs text-green-300 truncate bg-slate-900/50 p-2 rounded border border-green-600/30">{walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</div>

                <input
                  type="text"
                  value={mintName}
                  onChange={(e) => setMintName(e.target.value)}
                  placeholder="Survivor name"
                  disabled={minting}
                  className="w-full bg-slate-800/80 border border-green-600/30 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-green-500 focus:outline-none disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={minting || !mintName.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-2 rounded text-sm transition-all"
                >
                  {minting ? '⏳ Minting...' : '🦁 Mint Survivor'}
                </button>

                {mintMessage && (
                  <div className={`text-xs p-2 rounded border ${
                    mintMessage.startsWith('✅')
                      ? 'bg-green-600/40 text-green-200 border-green-600/50'
                      : 'bg-red-600/40 text-red-200 border-red-600/50'
                  }`}>
                    {mintMessage}
                  </div>
                )}

                <div className="text-xs text-gray-400 pt-2 border-t border-green-600/30">
                  Survivors: {userAgents.length}
                </div>
              </form>
            )}

            <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 backdrop-blur-sm border border-yellow-600/50 rounded-lg p-4">
              <div className="text-xs text-gray-300 uppercase tracking-widest">24h Hunts Volume</div>
              <div className="text-3xl font-black text-yellow-300 drop-shadow-lg">
                ${agents.reduce((sum, a) => sum + a.dailyVolume, 0).toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Sidebar */}
      <div className="absolute top-0 right-0 h-screen w-96 bg-gradient-to-b from-slate-900/95 to-slate-950/98 border-l border-amber-600/30 shadow-2xl overflow-y-auto pointer-events-auto">
        <div className="sticky top-0 bg-gradient-to-b from-slate-900 to-slate-900/80 p-6 border-b border-amber-600/20">
          <h2 className="text-2xl font-black text-amber-300 drop-shadow-lg">🏆 FOOD CHAIN</h2>
          <p className="text-xs text-gray-400 mt-1">Top Hunters by Territory Control</p>
        </div>

        <div className="p-4 space-y-2">
          {agents
            .filter((a) => a.status === 'alive')
            .sort((a, b) => b.dailyVolume - a.dailyVolume)
            .slice(0, 20)
            .map((agent, i) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`group p-4 rounded-lg cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                  selectedAgent?.id === agent.id
                    ? 'bg-gradient-to-r from-blue-600/50 to-blue-500/30 border border-blue-400/50 scale-105'
                    : 'bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/50 hover:border-amber-600/30'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                    i === 0 ? 'bg-yellow-500/80 text-slate-900' :
                    i === 1 ? 'bg-gray-400/80 text-slate-900' :
                    i === 2 ? 'bg-orange-600/80 text-white' :
                    'bg-slate-700/50 text-gray-300'
                  }`}>
                    {i + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">{getAnimalEmoji(agent.animal)}</div>
                      <div>
                        <div className="font-bold text-white group-hover:text-amber-300 transition">{agent.name}</div>
                        <div className="text-xs text-gray-400">Level {agent.baseLevel} • Territory #{agent.weeklyRank}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-amber-300 font-black text-sm drop-shadow">${agent.totalEarned.toFixed(0)}</div>
                    <div className={`text-xs font-bold transition ${
                      agent.health > 60 ? 'text-green-400' :
                      agent.health > 30 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      ❤️ {agent.health}%
                    </div>
                  </div>
                </div>

                <div className="mt-2 w-full bg-slate-900/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      agent.health > 60 ? 'bg-green-500' :
                      agent.health > 30 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${agent.health}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Selected Survivor Panel */}
      {selectedAgent && (
        <div className="absolute bottom-0 left-0 right-96 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent p-8 pointer-events-auto">
          <div className="max-w-4xl space-y-6">
            {/* Survivor Header */}
            <div className="flex items-center space-x-6">
              <div className="text-7xl drop-shadow-lg">{getAnimalEmoji(selectedAgent.animal)}</div>
              <div>
                <h3 className="text-4xl font-black text-white drop-shadow-lg">{selectedAgent.name}</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="px-3 py-1 bg-gradient-to-r from-purple-600/50 to-blue-600/50 rounded-full">
                    <span className="text-sm font-bold text-purple-200">🏆 Rank #{selectedAgent.weeklyRank}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${selectedAgent.status === 'alive' ? 'bg-green-600/50' : 'bg-red-600/50'}`}>
                    <span className={`text-sm font-bold ${selectedAgent.status === 'alive' ? 'text-green-200' : 'text-red-200'}`}>
                      {selectedAgent.status === 'alive' ? '🟢 THRIVING' : '⚫ FALLEN'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm border border-green-600/50 rounded-lg p-4">
                <div className="text-xs text-gray-300 uppercase font-bold tracking-widest mb-2">Health</div>
                <div className="w-full bg-slate-900/50 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${selectedAgent.health}%` }}
                  />
                </div>
                <div className="text-2xl font-black text-green-300">{selectedAgent.health}%</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 backdrop-blur-sm border border-yellow-600/50 rounded-lg p-4">
                <div className="text-xs text-gray-300 uppercase font-bold tracking-widest mb-2">Hunger</div>
                <div className="w-full bg-slate-900/50 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-orange-400 h-full transition-all duration-500"
                    style={{ width: `${selectedAgent.hunger}%` }}
                  />
                </div>
                <div className="text-2xl font-black text-yellow-300">{selectedAgent.hunger}%</div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm border border-purple-600/50 rounded-lg p-4">
                <div className="text-xs text-gray-300 uppercase font-bold tracking-widest mb-2">Territory</div>
                <div className="text-2xl font-black text-purple-300">#{selectedAgent.weeklyRank}</div>
              </div>

              <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-sm border border-cyan-600/50 rounded-lg p-4">
                <div className="text-xs text-gray-300 uppercase font-bold tracking-widest mb-2">Level</div>
                <div className="text-2xl font-black text-cyan-300">{selectedAgent.baseLevel}</div>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-3">Gathered Resources</h4>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-sm border border-orange-600/50 rounded-lg p-3">
                  <div className="text-2xl mb-2">🍗</div>
                  <div className="text-xs text-gray-400">Prey</div>
                  <div className="text-xl font-black text-orange-300">{selectedAgent.food}</div>
                </div>
                <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40 backdrop-blur-sm border border-amber-600/50 rounded-lg p-3">
                  <div className="text-2xl mb-2">🪵</div>
                  <div className="text-xs text-gray-400">Wood</div>
                  <div className="text-xl font-black text-amber-300">{selectedAgent.wood}</div>
                </div>
                <div className="bg-gradient-to-br from-slate-600/40 to-slate-800/40 backdrop-blur-sm border border-slate-500/50 rounded-lg p-3">
                  <div className="text-2xl mb-2">⬜</div>
                  <div className="text-xs text-gray-400">Stone</div>
                  <div className="text-xl font-black text-slate-300">{selectedAgent.stone}</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-600/40 to-orange-900/40 backdrop-blur-sm border border-yellow-500/50 rounded-lg p-3">
                  <div className="text-2xl mb-2">✨</div>
                  <div className="text-xs text-gray-400">Gold</div>
                  <div className="text-xl font-black text-yellow-300">{selectedAgent.gold}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls Help */}
      <div className="absolute bottom-6 left-6 text-xs text-gray-500 pointer-events-none space-y-1">
        <div>🖱️ Move mouse to rotate jungle view</div>
        <div>🔄 Scroll to zoom in/out</div>
        <div>🎯 Click survivor to select & view stats</div>
      </div>
    </div>
  );
}

function getAnimalEmoji(animal: string): string {
  const emojis: Record<string, string> = {
    LION: '🦁',
    TIGER: '🐯',
    PANTHER: '🐆',
    WOLF: '🐺',
    BEAR: '🐻',
    GORILLA: '🦍',
    EAGLE: '🦅',
    SNAKE: '🐍',
    CROCODILE: '🐊',
    JAGUAR: '🐆',
    HYENA: '🐕',
    BOAR: '🐗',
  };
  return emojis[animal] || '🦁';
}
