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

      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 pointer-events-none">
        <div className="flex justify-between items-start">
          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">🦁 KING OF THE JUNGLE</h1>
            <p className="text-gray-300 text-sm drop-shadow">
              {agents.filter((a) => a.status === 'alive').length} Predators Surviving
            </p>
          </div>

          {/* Stats */}
          <div className="text-right text-white drop-shadow">
            <div className="text-sm text-gray-300">Total Volume</div>
            <div className="text-3xl font-bold text-yellow-400">
              ${agents.reduce((sum, a) => sum + a.dailyVolume, 0).toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Sidebar */}
      <div className="absolute top-0 right-0 h-screen w-80 bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-l border-slate-700 overflow-y-auto pointer-events-auto">
        <div className="p-6 space-y-3">
          <h2 className="text-xl font-bold text-amber-400 mb-4">🏆 LEADERBOARD</h2>

          {agents
            .filter((a) => a.status === 'alive')
            .slice(0, 15)
            .map((agent, i) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`p-3 rounded cursor-pointer transition ${
                  selectedAgent?.id === agent.id
                    ? 'bg-blue-600/40 border border-blue-400'
                    : 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white">#{i + 1} {agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.animal} • Level {agent.baseLevel}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-sm">${agent.totalEarned.toFixed(0)}</div>
                    <div className={`text-xs ${agent.health > 50 ? 'text-green-400' : agent.health > 25 ? 'text-yellow-400' : 'text-red-400'}`}>
                      ❤️ {agent.health}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Selected Agent Panel */}
      {selectedAgent && (
        <div className="absolute bottom-0 left-0 right-80 bg-gradient-to-t from-slate-950 to-transparent p-6 pointer-events-auto">
          <div className="max-w-2xl">
            <div className="grid grid-cols-5 gap-4">
              {/* Agent Info */}
              <div className="col-span-2 bg-slate-800/80 p-4 rounded border border-slate-700">
                <div className="text-4xl mb-2">{getAnimalEmoji(selectedAgent.animal)}</div>
                <h3 className="text-xl font-bold text-white">{selectedAgent.name}</h3>
                <div className="text-sm text-gray-400 mt-2">
                  <div>Level {selectedAgent.baseLevel}</div>
                  <div className={selectedAgent.status === 'alive' ? 'text-green-400' : 'text-red-400'}>
                    {selectedAgent.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Health & Hunger */}
              <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
                <div className="text-xs text-gray-400 mb-2">HEALTH</div>
                <div className="w-full bg-slate-700 rounded h-3 overflow-hidden mb-3">
                  <div
                    className="bg-green-500 h-full transition-all"
                    style={{ width: `${selectedAgent.health}%` }}
                  />
                </div>
                <div className="text-lg font-bold text-green-400">{selectedAgent.health}</div>

                <div className="text-xs text-gray-400 mt-4 mb-2">HUNGER</div>
                <div className="w-full bg-slate-700 rounded h-3 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full transition-all"
                    style={{ width: `${selectedAgent.hunger}%` }}
                  />
                </div>
                <div className="text-lg font-bold text-yellow-400">{selectedAgent.hunger}</div>
              </div>

              {/* Resources */}
              <div className="col-span-2 bg-slate-800/80 p-4 rounded border border-slate-700">
                <div className="text-xs text-gray-400 mb-3">RESOURCES</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-orange-400 font-bold">🍗</div>
                    <div className="text-white">{selectedAgent.food}</div>
                  </div>
                  <div>
                    <div className="text-amber-600 font-bold">🪵</div>
                    <div className="text-white">{selectedAgent.wood}</div>
                  </div>
                  <div>
                    <div className="text-gray-300 font-bold">⬜</div>
                    <div className="text-white">{selectedAgent.stone}</div>
                  </div>
                  <div>
                    <div className="text-yellow-300 font-bold">✨</div>
                    <div className="text-white">{selectedAgent.gold}</div>
                  </div>
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
