import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { JungleScene3D } from '../components/jungle/JungleScene3D';
import type { Agent } from '../server/storage';

export const Route = createFileRoute('/jungle')({
  component: JunglePage,
});

function JunglePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  // Load agents using direct server call
  useEffect(() => {
    const loadAgents = async () => {
      try {
        // For MVP, we'll load from localStorage to simulate the backend
        // In production, use proper API endpoints
        const stored = localStorage.getItem('jungle_agents');
        if (stored) {
          const agentsList = JSON.parse(stored);
          setAgents(agentsList);
          setLoading(false);
          return;
        }

        // Fallback: create a demo agent
        const demoAgent: Agent = {
          id: 'demo-1',
          owner: '0x1234',
          name: 'King Leonidas',
          animal: 'LION',
          status: 'alive',
          health: Math.floor(Math.random() * 40 + 60),
          hunger: Math.floor(Math.random() * 40 + 60),
          food: Math.floor(Math.random() * 100),
          wood: Math.floor(Math.random() * 100),
          stone: Math.floor(Math.random() * 100),
          gold: Math.floor(Math.random() * 20),
          baseLevel: 3,
          totalEarned: 1250,
          dailyVolume: 5400,
          dailyMarketCap: 125000,
          weeklyRank: 1,
          createdAt: Date.now() - 86400000,
          lastActionAt: Date.now(),
        };

        setAgents([demoAgent]);
        localStorage.setItem('jungle_agents', JSON.stringify([demoAgent]));
        setLoading(false);
      } catch (error) {
        console.error('Error loading agents:', error);
        setLoading(false);
      }
    };

    loadAgents();
    const interval = setInterval(loadAgents, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate agent updates
  useEffect(() => {
    const updateAgents = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => ({
          ...agent,
          health: Math.max(0, Math.min(100, agent.health + (Math.random() - 0.5) * 10)),
          hunger: Math.max(0, Math.min(100, agent.hunger + (Math.random() - 0.5) * 8)),
          food: Math.max(0, agent.food + Math.floor((Math.random() - 0.5) * 20)),
          wood: Math.max(0, agent.wood + Math.floor((Math.random() - 0.5) * 15)),
          stone: Math.max(0, agent.stone + Math.floor((Math.random() - 0.5) * 10)),
          lastActionAt: Date.now(),
        })),
      );
    }, 2000);

    return () => clearInterval(updateAgents);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌿</div>
          <p className="text-white text-xl">Loading Jungle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-900 relative overflow-hidden">
      {/* 3D Scene */}
      <JungleScene3D
        agents={agents}
        selectedAgentId={selectedAgent?.id}
        onAgentClick={(agentId) => {
          const agent = agents.find((a) => a.id === agentId);
          if (agent) setSelectedAgent(agent);
        }}
      />

      {/* Top HUD Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent p-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          {/* Title Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="text-5xl">🦁</div>
              <div>
                <h1 className="text-5xl font-black text-white drop-shadow-2xl tracking-wider">
                  KING OF THE JUNGLE
                </h1>
                <p className="text-green-300 font-bold drop-shadow-lg">
                  {agents.filter((a) => a.status === 'alive').length} Predators Surviving
                </p>
              </div>
            </div>
          </div>

          {/* Global Stats */}
          <div className="text-right space-y-4">
            <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 backdrop-blur-sm border border-yellow-600/50 rounded-lg p-4">
              <div className="text-xs text-gray-300 uppercase tracking-widest">24h Volume</div>
              <div className="text-4xl font-black text-yellow-300 drop-shadow-lg">
                ${agents.reduce((sum, a) => sum + a.dailyVolume, 0).toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Sidebar */}
      <div className="absolute top-0 right-0 h-screen w-96 bg-gradient-to-b from-slate-900/95 to-slate-950/98 border-l border-amber-600/30 shadow-2xl overflow-y-auto pointer-events-auto">
        <div className="sticky top-0 bg-gradient-to-b from-slate-900 to-slate-900/80 p-6 border-b border-amber-600/20">
          <h2 className="text-2xl font-black text-amber-300 drop-shadow-lg">🏆 LEADERBOARD</h2>
          <p className="text-xs text-gray-400 mt-1">Rankings by 24h volume</p>
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
                {/* Rank Badge */}
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
                        <div className="text-xs text-gray-400">Level {agent.baseLevel} • Rank {agent.weeklyRank}</div>
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

                {/* Health bar */}
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

      {/* Selected Agent Detail Panel */}
      {selectedAgent && (
        <div className="absolute bottom-0 left-0 right-96 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent p-8 pointer-events-auto">
          <div className="max-w-4xl space-y-6">
            {/* Agent Header */}
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
                      {selectedAgent.status === 'alive' ? '🟢 ALIVE' : '⚫ DEAD'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              {/* Health */}
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

              {/* Hunger */}
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

              {/* Earnings */}
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm border border-purple-600/50 rounded-lg p-4">
                <div className="text-xs text-gray-300 uppercase font-bold tracking-widest mb-2">Total Earned</div>
                <div className="text-2xl font-black text-purple-300">${selectedAgent.totalEarned.toFixed(0)}</div>
              </div>

              {/* Level */}
              <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-sm border border-cyan-600/50 rounded-lg p-4">
                <div className="text-xs text-gray-300 uppercase font-bold tracking-widest mb-2">Level</div>
                <div className="text-2xl font-black text-cyan-300">{selectedAgent.baseLevel}</div>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-3">Resources</h4>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-sm border border-orange-600/50 rounded-lg p-3">
                  <div className="text-2xl mb-2">🍗</div>
                  <div className="text-xs text-gray-400">Food</div>
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

      {/* Controls Help */}
      <div className="absolute bottom-6 left-6 text-xs text-gray-500 pointer-events-none">
        <div>🖱️ Move mouse to rotate view</div>
        <div>🔜 Scroll to zoom</div>
        <div>🎯 Click agent to select</div>
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
