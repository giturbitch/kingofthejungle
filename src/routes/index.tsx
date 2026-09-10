import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Agent } from "../server/storage";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [survivors, setSurvivors] = useState<Agent[]>([]);
  const [stats, setStats] = useState({ total: 0, alive: 0, volume: 0 });

  useEffect(() => {
    const stored = localStorage.getItem("jungle_agents");
    if (stored) {
      try {
        const agents = JSON.parse(stored);
        setSurvivors(agents);
        setStats({
          total: agents.length,
          alive: agents.filter((a: Agent) => a.status === "alive").length,
          volume: agents.reduce((sum: number, a: Agent) => sum + a.dailyVolume, 0),
        });
      } catch (e) {
        console.error("Error loading survivors:", e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white overflow-hidden">
      {/* Dark jungle fog effect */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-900/50 to-slate-950"></div>
      </div>

      <div className="relative z-10">
        {/* Header - Dark jungle entrance */}
        <div className="border-b border-amber-900/30 backdrop-blur-sm bg-slate-950/40">
          <div className="max-w-7xl mx-auto px-8 py-16">
            <div className="flex items-end space-x-6 mb-8">
              <div className="text-8xl drop-shadow-2xl">🦁</div>
              <div>
                <h1 className="text-7xl font-black tracking-wider text-amber-50 drop-shadow-xl">
                  JUNGLE PREDATORS
                </h1>
                <p className="text-amber-600 font-bold text-xl mt-3 drop-shadow-lg">
                  Enter the hunt • Claim your territory • Dominate the food chain
                </p>
              </div>
            </div>
            <p className="text-gray-300 max-w-3xl text-lg leading-relaxed">
              Mint AI survivor agents. Watch them hunt, gather, and compete in the untamed jungle. Your predators earn yield through tribal conquest.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-20">
          {/* Stats - Dark, minimal */}
          <div className="grid grid-cols-3 gap-8 mb-24">
            <div className="border border-amber-900/40 rounded-lg p-8 bg-slate-900/30 backdrop-blur-sm">
              <div className="text-sm text-amber-700 uppercase tracking-widest font-bold mb-4">Survivors Alive</div>
              <div className="text-6xl font-black text-amber-100 mb-2">{stats.alive}</div>
              <div className="text-sm text-gray-500">of {stats.total} total</div>
            </div>

            <div className="border border-amber-900/40 rounded-lg p-8 bg-slate-900/30 backdrop-blur-sm">
              <div className="text-sm text-amber-700 uppercase tracking-widest font-bold mb-4">Hunt Volume</div>
              <div className="text-6xl font-black text-amber-100 mb-2">${stats.volume.toFixed(0)}</div>
              <div className="text-sm text-gray-500">24h ecosystem</div>
            </div>

            <div className="border border-amber-900/40 rounded-lg p-8 bg-slate-900/30 backdrop-blur-sm">
              <div className="text-sm text-amber-700 uppercase tracking-widest font-bold mb-4">Mint Cost</div>
              <div className="text-6xl font-black text-amber-100 mb-2">1</div>
              <div className="text-sm text-gray-500">$FARM per survivor</div>
            </div>
          </div>

          {/* CTA - Dark buttons */}
          <div className="grid grid-cols-2 gap-8 mb-24">
            <button
              onClick={() => navigate({ to: "/jungle" })}
              className="group relative border-2 border-amber-900/60 hover:border-amber-700 rounded-lg p-12 bg-slate-900/40 backdrop-blur-sm transition-all hover:bg-slate-900/60 text-left"
            >
              <div className="text-6xl mb-4">🌿</div>
              <div className="text-3xl font-black text-amber-50 mb-3">Enter the Jungle</div>
              <div className="text-gray-400">Scout territories, mint predators, claim dominance</div>
            </button>

            <button
              onClick={() => navigate({ to: "/test" })}
              className="group relative border-2 border-amber-900/60 hover:border-amber-700 rounded-lg p-12 bg-slate-900/40 backdrop-blur-sm transition-all hover:bg-slate-900/60 text-left"
            >
              <div className="text-6xl mb-4">⚔️</div>
              <div className="text-3xl font-black text-amber-50 mb-3">War Room</div>
              <div className="text-gray-400">Command center, real-time intel, leaderboard</div>
            </button>
          </div>

          {/* Recent Survivors */}
          {survivors.length > 0 && (
            <div className="border-t border-amber-900/30 pt-20">
              <h2 className="text-4xl font-black text-amber-50 mb-12">The Predators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {survivors
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .slice(0, 6)
                  .map((survivor) => (
                    <div
                      key={survivor.id}
                      className="border border-amber-900/40 rounded-lg p-6 bg-slate-900/30 backdrop-blur-sm hover:border-amber-700/60 transition-all cursor-pointer"
                      onClick={() => navigate({ to: "/jungle" })}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-5xl">{getAnimalEmoji(survivor.animal)}</div>
                        <div className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                          survivor.status === "alive"
                            ? "bg-amber-900/30 text-amber-200"
                            : "bg-red-900/30 text-red-200"
                        }`}>
                          {survivor.status === "alive" ? "Hunting" : "Dead"}
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-amber-50 mb-3">{survivor.name}</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-400">
                          <span>Territory Rank</span>
                          <span className="font-bold text-amber-200">#{survivor.weeklyRank}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Health</span>
                          <span className="font-bold text-amber-200">{survivor.health}%</span>
                        </div>
                        <div className="w-full bg-slate-900/50 rounded h-1.5 overflow-hidden">
                          <div
                            className="bg-amber-700 h-full"
                            style={{ width: `${survivor.health}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getAnimalEmoji(animal: string): string {
  const emojis: Record<string, string> = {
    LION: "🦁",
    TIGER: "🐯",
    PANTHER: "🐆",
    WOLF: "🐺",
    BEAR: "🐻",
    GORILLA: "🦍",
    EAGLE: "🦅",
    SNAKE: "🐍",
    CROCODILE: "🐊",
    JAGUAR: "🐆",
    HYENA: "🐕",
    BOAR: "🐗",
  };
  return emojis[animal] || "🦁";
}