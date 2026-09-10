import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Agent } from "../server/storage";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [survivors, setSurvivors] = useState<Agent[]>([]);
  const [showHow, setShowHow] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("jungle_agents");
    if (stored) {
      try {
        const agents = JSON.parse(stored);
        setSurvivors(agents);
      } catch (e) {
        console.error("Error loading survivors:", e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white overflow-hidden">
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-amber-900/30 backdrop-blur-sm bg-slate-950/40 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-4xl font-black text-amber-50">🦁 JUNGLE PREDATORS</h1>
            <button
              onClick={() => setShowHow(!showHow)}
              className="px-6 py-2 bg-amber-900/60 hover:bg-amber-900/80 text-white font-bold rounded-lg border border-amber-700/60 transition-all"
            >
              How It Works
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-20">
          {/* Main CTA */}
          <div className="text-center mb-20">
            <p className="text-amber-400 font-bold text-xl mb-4">Mint your predators. Hunt. Dominate.</p>
            <h2 className="text-6xl font-black text-amber-50 mb-8">Meet Your Survivors</h2>
            <button
              onClick={() => navigate({ to: "/jungle" })}
              className="px-12 py-4 bg-amber-900/80 hover:bg-amber-900 text-white font-black text-lg rounded-lg border border-amber-700/60 transition-all hover:scale-105"
            >
              ⚔️ ENTER THE JUNGLE
            </button>
          </div>

          {/* 2.5D Survivor Characters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {survivors.length > 0 ? (
              survivors.sort((a, b) => b.dailyVolume - a.dailyVolume).slice(0, 3).map((survivor) => (
                <div key={survivor.id} className="relative group">
                  <div className="bg-slate-900/40 border border-amber-900/40 rounded-lg p-8 text-center backdrop-blur-sm h-80 flex flex-col items-center justify-center">
                    {/* 2.5D Character with Glowing Eyes */}
                    <div className="mb-6 relative">
                      <div className="text-9xl drop-shadow-2xl">{getAnimalEmoji(survivor.animal)}</div>
                      {/* Glowing Eyes Effect */}
                      <div className="absolute top-8 left-8 w-6 h-6 bg-amber-400 rounded-full blur-md opacity-80 animate-pulse"></div>
                      <div className="absolute top-8 right-8 w-6 h-6 bg-amber-400 rounded-full blur-md opacity-80 animate-pulse"></div>
                    </div>

                    <h3 className="text-2xl font-black text-amber-100 mb-3">{survivor.name}</h3>
                    <div className="text-sm text-amber-400 mb-4">Level {survivor.baseLevel} • Rank #{survivor.weeklyRank}</div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="text-amber-600">Health</div>
                        <div className="font-bold text-amber-100">{survivor.health}%</div>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="text-amber-600">Hunger</div>
                        <div className="font-bold text-amber-100">{survivor.hunger}%</div>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="text-amber-600">Earned</div>
                        <div className="font-bold text-amber-100">${survivor.totalEarned}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-20">
                <p className="text-gray-400 text-lg">No survivors yet. Mint your first predator in the jungle!</p>
              </div>
            )}
          </div>

          {/* How It Works Modal */}
          {showHow && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-slate-900/95 border border-amber-900/40 rounded-lg p-12 max-w-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-4xl font-black text-amber-100">How It Works</h3>
                  <button
                    onClick={() => setShowHow(false)}
                    className="text-amber-400 hover:text-amber-300 text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6 text-gray-300">
                  <div>
                    <h4 className="text-xl font-black text-amber-100 mb-2">1. Mint Your Survivor</h4>
                    <p>Enter the jungle and mint your AI-powered survivor NFT. Choose a name and watch it come to life.</p>
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-amber-100 mb-2">2. They Hunt & Gather</h4>
                    <p>Your survivors autonomously hunt for food, gather resources (wood, stone), and earn tribal currency. They live in camps and venture out to explore.</p>
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-amber-100 mb-2">3. Dominate the Food Chain</h4>
                    <p>Compete with other survivors on the leaderboard. Higher ranks mean more resources and greater influence over the jungle economy.</p>
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-amber-100 mb-2">4. Earn Real Yield</h4>
                    <p>Your survivors generate real yield through token launches on DeFi launchpads. The more they hunt, the more you earn.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowHow(false)}
                  className="w-full mt-8 px-6 py-3 bg-amber-900/60 hover:bg-amber-900/80 text-white font-bold rounded-lg border border-amber-700/60"
                >
                  Got It!
                </button>
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