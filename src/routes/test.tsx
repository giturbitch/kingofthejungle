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

  useEffect(() => {
    const initSurvivors: Agent[] = [
      { id: 'demo-1', owner: '0x1111', name: 'King Leonidas', animal: 'LION', status: 'alive', health: 92, hunger: 88, food: 145, wood: 110, stone: 95, gold: 14, baseLevel: 5, totalEarned: 3250, dailyVolume: 9800, dailyMarketCap: 285000, weeklyRank: 1, createdAt: Date.now() - 604800000, lastActionAt: Date.now() },
      { id: 'demo-2', owner: '0x2222', name: 'Shadow Panther', animal: 'PANTHER', status: 'alive', health: 76, hunger: 71, food: 98, wood: 115, stone: 70, gold: 9, baseLevel: 4, totalEarned: 2100, dailyVolume: 7400, dailyMarketCap: 198000, weeklyRank: 2, createdAt: Date.now() - 432000000, lastActionAt: Date.now() },
      { id: 'demo-3', owner: '0x3333', name: 'Inferno Tiger', animal: 'TIGER', status: 'alive', health: 84, hunger: 69, food: 152, wood: 88, stone: 102, gold: 17, baseLevel: 4, totalEarned: 1950, dailyVolume: 6900, dailyMarketCap: 175000, weeklyRank: 3, createdAt: Date.now() - 345600000, lastActionAt: Date.now() }
    ];
    setSurvivors(initSurvivors);
    localStorage.setItem('jungle_survivors', JSON.stringify(initSurvivors));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSurvivors((prev) => prev.map((survivor) => ({ ...survivor, health: Math.max(0, Math.min(100, survivor.health + (Math.random() - 0.5) * 8)), hunger: Math.max(0, Math.min(100, survivor.hunger + (Math.random() - 0.5) * 6)), food: Math.max(0, survivor.food + Math.floor((Math.random() - 0.5) * 20)), wood: Math.max(0, survivor.wood + Math.floor((Math.random() - 0.5) * 15)), stone: Math.max(0, survivor.stone + Math.floor((Math.random() - 0.5) * 12)), gold: Math.max(0, survivor.gold + (Math.random() > 0.8 ? 1 : 0)), dailyVolume: survivor.dailyVolume + Math.random() * 150, lastActionAt: Date.now() })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleMint = async () => {
    if (!agentName.trim()) { setMessage('Enter a survivor name'); return; }
    if (survivors.some((s) => s.name.toLowerCase() === agentName.toLowerCase())) { setMessage('That name is taken!'); return; }
    setLoading(true);
    setMessage('');
    await new Promise((resolve) => setTimeout(resolve, 800));
    const animals = ['LION', 'TIGER', 'PANTHER', 'WOLF', 'BEAR', 'EAGLE', 'BOAR'];
    const newSurvivor: Agent = { id: `survivor-${Date.now()}`, owner: ownerAddress, name: agentName, animal: animals[Math.floor(Math.random() * animals.length)], status: 'alive', health: 100, hunger: 100, food: 50, wood: 30, stone: 20, gold: 0, baseLevel: 1, totalEarned: 0, dailyVolume: 0, dailyMarketCap: 0, weeklyRank: survivors.length + 1, createdAt: Date.now(), lastActionAt: Date.now() };
    setSurvivors((prev) => { const updated = [...prev, newSurvivor]; localStorage.setItem('jungle_survivors', JSON.stringify(updated)); return updated; });
    setMessage(`${newSurvivor.name} has entered!`);
    setAgentName('');
    setSelectedSurvivor(newSurvivor);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate({ to: '/' })} className="mb-6 px-4 py-2 bg-slate-900/50 border border-amber-900/40 rounded text-sm font-bold text-amber-300">← Home</button>
        <h1 className="text-6xl font-black mb-2 text-amber-50">🦁 JUNGLE PREDATORS</h1>
        <p className="text-amber-600 font-bold text-lg mb-12">War Room • Command Center</p>

        <div className="grid grid-cols-3 gap-8 mb-12">
          <div className="bg-slate-900/30 border border-amber-900/40 rounded-lg p-8">
            <h2 className="text-2xl font-black text-amber-100 mb-6">🦁 Mint Predator</h2>
            <div className="space-y-4">
              <input type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleMint()} placeholder="e.g., King Leonidas" disabled={loading} className="w-full bg-slate-800/60 border border-amber-900/40 rounded px-4 py-3 text-white"/>
              <div className="font-mono text-xs text-gray-400 bg-slate-800/60 border border-amber-900/40 rounded px-4 py-3 truncate">{ownerAddress}</div>
              <button onClick={handleMint} disabled={loading} className="w-full bg-amber-900/60 hover:bg-amber-900/80 text-white font-black py-3 rounded">🦁 MINT</button>
              {message && <div className="p-3 rounded text-sm font-bold text-amber-200 bg-amber-900/30 border border-amber-900/50">{message}</div>}
            </div>
          </div>

          <div className="bg-slate-900/30 border border-amber-900/40 rounded-lg p-8">
            <h2 className="text-2xl font-black text-amber-100 mb-6">⚔️ War Stats</h2>
            <div className="space-y-3">
              <div className="bg-slate-800/40 rounded p-3 border border-amber-900/30"><div className="text-xs text-amber-600">Survivors</div><div className="text-3xl font-black text-amber-100">{survivors.length}</div></div>
              <div className="bg-slate-800/40 rounded p-3 border border-amber-900/30"><div className="text-xs text-amber-600">Active</div><div className="text-3xl font-black text-amber-100">{survivors.filter((s) => s.status === 'alive').length}</div></div>
              <div className="bg-slate-800/40 rounded p-3 border border-amber-900/30"><div className="text-xs text-amber-600">Volume</div><div className="text-2xl font-black text-amber-100">${survivors.reduce((sum, s) => sum + s.dailyVolume, 0).toFixed(0)}</div></div>
              <div className="bg-slate-800/40 rounded p-3 border border-amber-900/30"><div className="text-xs text-amber-600">Status</div><div className="text-lg font-bold text-amber-300">🟢 Live</div></div>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-amber-900/40 rounded-lg p-8">
            <h2 className="text-2xl font-black text-amber-100 mb-6">🎯 Features</h2>
            <div className="space-y-2 text-sm"><div>✓ <span className="font-bold text-amber-100">Survivor Minting</span></div><div>✓ <span className="font-bold text-amber-100">Live Simulation</span></div><div>✓ <span className="font-bold text-amber-100">Territory Ranking</span></div><div>✓ <span className="font-bold text-amber-100">Resource Economy</span></div></div>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-amber-900/40 rounded-lg p-8">
          <h2 className="text-3xl font-black text-amber-100 mb-6">🏆 FOOD CHAIN</h2>
          <div className="grid gap-3">
            {survivors.filter((s) => s.status === 'alive').sort((a, b) => b.dailyVolume - a.dailyVolume).map((survivor, i) => (
              <div key={survivor.id} onClick={() => setSelectedSurvivor(survivor)} className={`p-4 rounded cursor-pointer transition-all ${selectedSurvivor?.id === survivor.id ? 'bg-amber-900/40 border-2 border-amber-700/60' : 'bg-slate-800/30 hover:bg-slate-700/30 border border-slate-700/50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-amber-600/80' : i === 1 ? 'bg-gray-600/80' : 'bg-orange-700/80'}`}>{i + 1}</div>
                    <div className="text-2xl">{getAnimalEmoji(survivor.animal)}</div>
                    <div>
                      <div className="font-bold text-white">{survivor.name}</div>
                      <div className="text-xs text-gray-400">L{survivor.baseLevel} • T#{survivor.weeklyRank}</div>
                    </div>
                  </div>
                  <div className="text-right"><div className="text-amber-300 font-black">${survivor.totalEarned}</div><div className="text-xs font-bold text-amber-300">❤️ {survivor.health}%</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getAnimalEmoji(animal: string): string {
  const emojis: Record<string, string> = { LION: '🦁', TIGER: '🐯', PANTHER: '🐆', WOLF: '🐺', BEAR: '🐻', GORILLA: '🦍', EAGLE: '🦅', SNAKE: '🐍', CROCODILE: '🐊', JAGUAR: '🐆', HYENA: '🐕', BOAR: '🐗' };
  return emojis[animal] || '🦁';
}