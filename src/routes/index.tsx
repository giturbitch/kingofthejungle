import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { Agent } from '../server/storage';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [survivors, setSurvivors] = useState<Agent[]>([]);
  const [stats, setStats] = useState({ total: 0, alive: 0, volume: 0 });

  useEffect(() => {
    const stored = localStorage.getItem('jungle_agents');
    if (stored) {
      try {
        const agents = JSON.parse(stored);
        setSurvivors(agents);
        setStats({
          total: agents.length,
          alive: agents.filter((a: Agent) => a.status === 'alive').length,
          volume: agents.reduce((sum: number, a: Agent) => sum + a.dailyVolume, 0),
        });
      } catch (e) {
        console.error('Error loading survivors:', e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10">
        <div className="border-b border-green-600/20 bg-gradient-to-b from-slate-900/80 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="flex items-end space-x-4 mb-8">
              <div className="text-7xl">🦁</div>
              <div>
                <h1 className="text-6xl font-black tracking-wider">JUNGLE PREDATORS</h1>
                <p className="text-amber-400 font-bold text-lg mt-2">Mint • Hunt • Dominate • Earn</p>
              </div>
            </div>
            <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
              Mint your own AI-powered survivor agents. Watch them hunt, gather, build camps, and compete on the food chain.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-3 gap-6 mb-20">
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm border border-green-600/50 rounded-2xl p-8">
              <div className="text-sm text-gray-300 uppercase tracking-widest font-bold mb-3">Active Survivors</div>
              <div className="text-5xl font-black text-green-300 mb-2">{stats.alive}</div>
              <div className="text-sm text-gray-400">of {stats.total} total</div>
            </div>

            <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-sm border border-amber-600/50 rounded-2xl p-8">
              <div className="text-sm text-gray-300 uppercase tracking-widest font-bold mb-3">24h Hunt Volume</div>
              <div className="text-5xl font-black text-amber-300 mb-2">${stats.volume.toFixed(0)}</div>
              <div className="text-sm text-gray-400">Ecosystem yield</div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm border border-purple-600/50 rounded-2xl p-8">
              <div className="text-sm text-gray-300 uppercase tracking-widest font-bold mb-3">Mint Cost</div>
              <div className="text-5xl font-black text-purple-300 mb-2">1 FARM</div>
              <div className="text-sm text-gray-400">per survivor</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-20">
            <button
              onClick={() => navigate({ to: '/jungle' })}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-1 transition-all hover:scale-105"
            >
              <div className="relative bg-slate-950 rounded-2xl px-8 py-8 text-center transition-all group-hover:bg-slate-900">
                <div className="text-5xl mb-3">🌿</div>
                <div className="text-2xl font-black mb-2">Enter the Jungle</div>
                <div className="text-sm text-gray-400">View survivors, mint new agents</div>
              </div>
            </button>

            <button
              onClick={() => navigate({ to: '/test' })}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-1 transition-all hover:scale-105"
            >
              <div className="relative bg-slate-950 rounded-2xl px-8 py-8 text-center transition-all group-hover:bg-slate-900">
                <div className="text-5xl mb-3">📊</div>
                <div className="text-2xl font-black mb-2">Management Console</div>
                <div className="text-sm text-gray-400">Stats and survivor control</div>
              </div>
            </button>
          </div>
        </div>

        <div className="border-t border-green-600/20 mt-20 bg-gradient-to-t from-slate-950/50 to-transparent">
          <div className="max-w-7xl mx-auto px-8 py-8 text-center text-sm text-gray-500">
            <p>Jungle Predators • AI Agent Survivors</p>
          </div>
        </div>
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