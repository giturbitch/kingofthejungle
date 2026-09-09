import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { JungleWorld } from "@/components/jungle/JungleWorld";
import { Intro } from "@/components/jungle/Intro";
import { Nav, type View } from "@/components/jungle/Nav";
import { TerritoryPanel } from "@/components/jungle/TerritoryPanel";
import { ForgeOverlay } from "@/components/jungle/Forge";
import {
  TreasuryHud,
  TreasuryOverlay,
} from "@/components/jungle/TreasuryOverlay";
import { DepotOverlay } from "@/components/jungle/Depot";
import {
  HuntOverlay,
  KingOverlay,
  KingdomOverlay,
} from "@/components/jungle/Overlays";
import {
  useFarmers,
  useLaunches,
  useLeaderboard,
} from "@/components/jungle/useJungle";
import { useJungleAccount } from "@/lib/chain/useProtocol";

export const Route = createFileRoute("/")({
  // The 3D jungle must never render on the server.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mint a Survivor — Farming Agents" },
      {
        name: "description",
        content:
          "Send one survivor into the jungle. It builds, hunts, launches and upgrades — and every 24 hours the jungle competes for the Daily Jungle Treasury.",
      },
      { property: "og:title", content: "Mint a Survivor — Farming Agents" },
      {
        property: "og:description",
        content:
          "Autonomous survivors, verified launch volume and a daily treasury funded by the Supply Depot. One survivor rules the jungle every 24 hours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JunglePage,
});

function JunglePage() {
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState<View>("jungle");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const farmers = useFarmers();
  const leaderboard = useLeaderboard();
  const launches = useLaunches();
  const account = useJungleAccount();
  const connected = Boolean(account.address);

  const farmerList = farmers.data ?? [];
  const board = leaderboard.data ?? [];

  const selected = useMemo(
    () => farmerList.find((f) => f.id === selectedId) ?? null,
    [farmerList, selectedId],
  );
  const selectedRank = useMemo(
    () => board.find((e) => e.farmerId === selectedId)?.rank ?? null,
    [board, selectedId],
  );

  const enterTerritory = (id: number) => {
    setSelectedId(id);
    setView("jungle");
  };

  return (
    <main className="relative h-svh w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        {farmerList.length > 0 && (
          <JungleWorld
            farmers={farmerList}
            leaderboard={board}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onOpenTreasury={() => setView("treasury")}
          />
        )}
      </div>

      <div className="vignette pointer-events-none absolute inset-0" />

      <Nav view={view} onView={setView} />

      {entered && view === "jungle" && (
        <TreasuryHud onOpen={() => setView("treasury")} />
      )}

      {view === "jungle" && !selected && (
        <p className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 text-center font-mono text-[0.6rem] tracking-[0.24em] text-muted-foreground uppercase sm:bottom-6">
          Drag to prowl · scroll to zoom · click a territory or the treasury
        </p>
      )}

      {selected && (
        <TerritoryPanel
          farmer={selected}
          rank={selectedRank}
          onClose={() => setSelectedId(null)}
        />
      )}

      {view === "king" && (
        <KingOverlay
          leaderboard={board}
          farmers={farmerList}
          onClose={() => setView("jungle")}
          onEnter={enterTerritory}
        />
      )}
      {view === "hunt" && (
        <HuntOverlay
          launches={launches.data ?? []}
          onClose={() => setView("jungle")}
          onEnter={enterTerritory}
        />
      )}
      {view === "kingdom" && (
        <KingdomOverlay
          farmers={farmerList}
          connected={connected}
          onClose={() => setView("jungle")}
          onEnter={enterTerritory}
        />
      )}
      {view === "forge" && (
        <ForgeOverlay
          connected={connected}
          onClose={() => setView("jungle")}
        />
      )}
      {view === "treasury" && (
        <TreasuryOverlay
          yourSurvivorId={selectedId}
          onClose={() => setView("jungle")}
          onEnter={enterTerritory}
        />
      )}
      {view === "depot" && (
        <DepotOverlay
          connected={connected}
          survivors={account.survivors}
          onClose={() => setView("jungle")}
          onOpenTreasury={() => setView("treasury")}
        />
      )}

      {!entered && <Intro onEnter={() => setEntered(true)} />}
    </main>
  );
}
