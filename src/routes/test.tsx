import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import type { Agent } from '../server/storage';

export const Route = createFileRoute('/test')({
  component: TestPage,
});

function TestPage() {
  const navigate = useNavigate();
  const [agentName, setAgentName] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('0x' + Math.random().toString(16).slice(2, 42));
  const [survivors, setSurvivors] = useState<Agent[]>([]);
  const [selectedSurvivor, setSelectedSurvivor] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Initialize with demo survivors
  useEffect(() => {
    const initSurvivors: Agent[] = [
      {
        id: 'demo-1',
        owner: '0x1111',
        name: 'King Leonidas',
        animal: 'LION',
        status: 'alive',
        health: 92,
        hunger: 88,
        food: 145,
        wood: 110,
        stone: 95,
        gold: 14,
        baseLevel: 5,
        totalEarned: 3250,
        dailyVolume: 9800,
        dailyMarketCap: 285000,
        weeklyRank: 1,
        createdAt: Date.now() - 604800000,
        lastActionAt: Date.now(),
      },
      {
        id: 'demo-2',
        owner: '0x2222',
        name: 'Shadow Panther',
        animal: 'PANTHER',
        status: 'alive',
        health: 76,
        hunger: 71,
        food: 98,
        wood: 115,
        stone: 70,
        gold: 9,
        baseLevel: 4,
        totalEarned: 2100,
        dailyVolume: 7400,
        dailyMarketCap: 198000,
        weeklyRank: 2,
        createdAt: Date.now() - 432000000,
        lastActionAt: Date.now(),
      },
      {
        id: 'demo-3',
        owner: '0x3333',
        name: 'Inferno Tiger',
        animal: 'TIGER',
        status: 'alive',
        health: 84,
        hunger: 69,
        food: 152,
        wood: 88,
        stone: 102,
        gold: 17,
        baseLevel: 4,
        totalEarned: 1950,
        dailyVolume: 6900,
        dailyMarketCap: 175000,
        weeklyRank: 3,
        createdAt: Date.now() - 345600000,
        lastActionAt: Date.now(),
      },
    ];

    setSurvivors(initSurvivors);
    localStorage.setItem('jungle_survivors', JSON.stringify(initSurvivors));
  }, []);

  // Simulate resource updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSurvivors((prev) =>
        prev.map((survivor) => ({
          ...survivor,
          health: Math.max(0, Math.min(100, survivor.health + (Math.random() - 0.5) * 8)),
          hunger: Math.max(0, Math.min(100, survivor.hunger + (Math.random() - 0.5) * 6)),
          food: Math.max(0, survivor.food + Math.floor((Math.random() - 0.5) * 20)),
          wood: Math.max(0, survivor.wood + Math.floor((Math.random() - 0.5) * 15)),
          stone: Math.max(0, survivor.stone + Math.floor((Math.random() - 0.5) * 12)),
          gold: Math.max(0, survivor.gold + (Math.random() > 0.8 ? 1 : 0)),
          dailyVolume: survivor.dailyVolume + Math.random() * 150,
          lastActionAt: Date.now(),
        })),
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleMint = async () => {
    if (!agentName.trim()) {
      setMessage('❌ Enter a survivor name');
      return;
    }

    // Check for duplicate
    if (survivors.some((s) => s.name.toLowerCase() === agentName.toLowerCase())) {
      setMessage('❌ That survivor name is already taken!');
      return;
    }

    setLoading(true);
    setMessage('');

    // Simulate minting (local only)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const animals = ['LION', 'TIGER', 'PANTHER', 'WOLF', 'BEAR', 'EAGLE', 'BOAR'];
    const newSurvivor: Agent = {
      id: `survivor-${Date.now()}`,
      owner: ownerAddress,
      name: agentName,
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
      weeklyRank: survivors.length + 1,
      createdAt: Date.now(),
      lastActionAt: Date.now(),
    };

    setSurvivors((prev) => {
      const updated = [...prev, newSurvivor];
      localStorage.setItem('jungle_survivors', JSON.stringify(updated));
      return updated;
    });

    setMessage(`✅ ${newSurvivor.name} the ${newSurvivor.animal} has entered the jungle!`);
    setAgentName('');
    setSelectedSurvivor(newSurvivor);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate({ to: '/' })}
            className="mb-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-amber-600/30 hover:border-amber-600/50 rounded-lg text-sm font-bold text-amber-300 transition-all"
          >
            ← Back to Home
          </button>
          <h1 className="text-6xl font-black mb-2 drop-shadow-lg">🦁 JUNGLE PREDATORS</h1>
          <p className="text-green-300 font-bold text-lg">Survivor Control Panel & Leaderboard</p>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-12">
          {/* Mint Panel */}
          <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm border-2 border-green-600/50 rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-green-300 mb-6 flex items-center space-x-2">
              <span>✨</span>
              <span>Mint Survivor</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Survivor Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleMint()}
                  placeholder="e.g., King Leonidas"
                  disabled={loading}
                  className="w-full bg-slate-800/80 border-2 border-green-600/30 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Your Wallet</label>
                <div className="font-mono text-xs text-gray-400 bg-slate-800/80 border border-green-600/30 rounded-lg px-4 py-3 truncate">
                  {ownerAddress}
                </div>
              </div>

              <button
                onClick={handleMint}
                disabled={loading || !agentName.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-black py-4 rounded-lg transition-all hover:scale-105 active:scale-95 text-lg"
              >
                {loading ? '⏳ Entering Jungle...' : '🦁 MINT SURVIVOR'}
              </button>

              {message && (
                <div className={`p-3 rounded-lg text-sm font-bold ${message.startsWith('✅') ? 'bg-green-600/40 text-green-200 border border-green-600/50' : 'bg-red-600/40 text-red-200 border border-red-600/50'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Stats Panel */}
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm border-2 border-purple-600/50 rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-purple-300 mb-6">📊 Kingdom Stats</h2>

            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-600/30">
                <div className="text-sm text-gray-400">Total Survivors</div>
                <div className="text-4xl font-black text-purple-300">{survivors.length}</div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-600/30">
                <div className="text-sm text-gray-400">Active Hunters</div>
                <div className="text-4xl font-black text-green-300">
                  {survivors.filter((s) => s.status === 'alive').length}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-600/30">
                <div className="text-sm text-gray-400">Total Volume</div>
                <div className="text-3xl font-black text-yellow-300">
                  ${survivors.reduce((sum, s) => sum + s.dailyVolume, 0).toFixed(0)}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-600/30">
                <div className="text-sm text-gray-400">Simulation</div>
                <div className="text-lg font-bold text-green-400">🟢 Running (2s updates)</div>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-sm border-2 border-amber-600/50 rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-amber-300 mb-6">🎮 Backend Features</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-green-400 font-black">✓</span>
                <div>
                  <div className="font-bold">Survivor Minting</div>
                  <div className="text-gray-400 text-xs">Create unique jungle predators</div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-green-400 font-black">✓</span>
                <div>
                  <div className="font-bold">Live Simulation</div>
                  <div className="text-gray-400 text-xs">Real-time hunting & gathering</div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-green-400 font-black">✓</span>
                <div>
                  <div className="font-bold">Territory Ranking</div>
                  <div className="text-gray-400 text-xs">Food chain leaderboard</div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-green-400 font-black">✓</span>
                <div>
                  <div className="font-bold">Resource Economy</div>
                  <div className="text-gray-400 text-xs">Food, wood, stone, gold</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border-2 border-amber-600/50 rounded-xl p-8 shadow-2xl">
          <h2 className="text-3xl font-black text-amber-300 mb-6">🏆 FOOD CHAIN</h2>

          <div className="grid gap-4">
            {survivors
              .filter((s) => s.status === 'alive')
              .sort((a, b) => b.dailyVolume - a.dailyVolume)
              .map((survivor, i) => (
                <div
                  key={survivor.id}
                  onClick={() => setSelectedSurvivor(survivor)}
                  className={`group p-5 rounded-lg cursor-pointer transition-all ${
                    selectedSurvivor?.id === survivor.id
                      ? 'bg-gradient-to-r from-blue-600/50 to-blue-500/30 border-2 border-blue-400 scale-105'
                      : 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-amber-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white ${
                        i === 0 ? 'bg-yellow-500' :
                        i === 1 ? 'bg-gray-400' :
                        i === 2 ? 'bg-orange-600' :
                        'bg-slate-600'
                      }`}>
                        {i + 1}
                      </div>

                      <div>
                        <div className="text-2xl mb-1">{getAnimalEmoji(survivor.animal)}</div>
                      </div>

                      <div>
                        <div className="font-black text-lg text-white">{survivor.name}</div>
                        <div className="text-sm text-gray-400">Level {survivor.baseLevel} • Territory #{survivor.weeklyRank}</div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-3xl font-black text-yellow-300">${survivor.totalEarned.toFixed(0)}</div>
                      <div className={`text-lg font-bold ${
                        survivor.health > 60 ? 'text-green-400' :
                        survivor.health > 30 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        ❤️ {survivor.health}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 w-full bg-slate-900/50 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        survivor.health > 60 ? 'bg-green-500' :
                        survivor.health > 30 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${survivor.health}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedSurvivor && (
          <div className="mt-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border-2 border-blue-600/50 rounded-xl p-8 shadow-2xl">
            <h3 className="text-3xl font-black text-blue-300 mb-6">{selectedSurvivor.name} — Details</h3>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-green-900/40 border border-green-600/50 rounded-lg p-4">
                <div className="text-xs text-gray-400 uppercase font-bold mb-2">Health</div>
                <div className="w-full bg-slate-900/50 rounded-full h-2 mb-3 overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${selectedSurvivor.health}%` }} />
                </div>
                <div className="text-2xl font-black text-green-300">{selectedSurvivor.health}%</div>
              </div>

              <div className="bg-yellow-900/40 border border-yellow-600/50 rounded-lg p-4">
                <div className="text-xs text-gray-400 uppercase font-bold mb-2">Hunger</div>
                <div className="w-full bg-slate-900/50 rounded-full h-2 mb-3 overflow-hidden">
                  <div className="bg-yellow-500 h-full" style={{ width: `${selectedSurvivor.hunger}%` }} />
                </div>
                <div className="text-2xl font-black text-yellow-300">{selectedSurvivor.hunger}%</div>
              </div>

              <div className="bg-orange-900/40 border border-orange-600/50 rounded-lg p-4">
                <div className="text-xs text-gray-400 uppercase font-bold mb-2">Prey Hunted</div>
                <div className="text-3xl font-black text-orange-300">{selectedSurvivor.food}</div>
              </div>

              <div className="bg-blue-900/40 border border-blue-600/50 rounded-lg p-4">
                <div className="text-xs text-gray-400 uppercase font-bold mb-2">Level</div>
                <div className="text-3xl font-black text-blue-300">{selectedSurvivor.baseLevel}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🍗</div>
                <div className="text-xs text-gray-400 mb-1">Prey</div>
                <div className="text-xl font-black text-orange-300">{selectedSurvivor.food}</div>
              </div>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🪵</div>
                <div className="text-xs text-gray-400 mb-1">Wood</div>
                <div className="text-xl font-black text-amber-300">{selectedSurvivor.wood}</div>
              </div>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">⬜</div>
                <div className="text-xs text-gray-400 mb-1">Stone</div>
                <div className="text-xl font-black text-slate-300">{selectedSurvivor.stone}</div>
              </div>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">✨</div>
                <div className="text-xs text-gray-400 mb-1">Gold</div>
                <div className="text-xl font-black text-yellow-300">{selectedSurvivor.gold}</div>
              </div>
            </div>
          </div>
        )}
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
