import { animalForFarmer } from "@/lib/jungle/animals";
import type { Farmer, LeaderboardEntry, Launch } from "@/lib/jungle/protocol";
import { countdown, timeAgo, useNow } from "./useJungle";

export function Sheet({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-md sm:p-10">
      <div className="animate-rise w-full max-w-3xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="display-xl text-3xl text-ivory sm:text-5xl">{title}</h2>
            {subtitle && (
              <p className="label-eyebrow mt-3">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs tracking-[0.24em] text-muted-foreground uppercase hover:text-ivory"
          >
            Close
          </button>
        </div>
        <div className="gold-rule mb-8" />
        {children}
      </div>
    </div>
  );
}

const CROWN = ["KING", "ALPHA", "HUNTER"];

export function KingOverlay({
  leaderboard,
  farmers,
  onClose,
  onEnter,
}: {
  leaderboard: LeaderboardEntry[];
  farmers: Farmer[];
  onClose: () => void;
  onEnter: (id: number) => void;
}) {
  const byId = new Map(farmers.map((f) => [f.id, f]));
  const top = leaderboard.slice(0, 3);
  const pack = leaderboard.slice(3);

  return (
    <Sheet title="King of the Jungle" subtitle="THE FOOD CHAIN · LIVE PROTOCOL DATA" onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-3">
        {top.map((e, i) => {
          const animal = animalForFarmer(e.farmerId);
          return (
            <button
              key={e.farmerId}
              onClick={() => onEnter(e.farmerId)}
              className={`border p-5 text-left transition-colors ${
                i === 0
                  ? "border-gold bg-gold/10 sm:scale-[1.03]"
                  : "border-border bg-card/60 hover:border-gold/50"
              }`}
            >
              <p className="label-eyebrow">
                #{e.rank} · {CROWN[i]}
              </p>
              <div className={i === 0 ? "my-3 text-5xl" : "my-3 text-4xl"}>
                {animal.glyph}
              </div>
              <p className="display-xl text-lg text-ivory">{e.name}</p>
              <p className="mt-2 font-mono text-xs text-gold-dim">
                {e.harvests} HARVESTS
              </p>
              <p className="mt-1 font-mono text-[0.65rem] text-muted-foreground">
                {byId.get(e.farmerId)?.owner}
              </p>
            </button>
          );
        })}
      </div>

      <p className="label-eyebrow mt-10 mb-3">The pack</p>
      <div className="divide-y divide-border border border-border">
        {pack.map((e) => (
          <button
            key={e.farmerId}
            onClick={() => onEnter(e.farmerId)}
            className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-accent/40"
          >
            <span className="w-10 font-mono text-xs text-muted-foreground">
              #{e.rank}
            </span>
            <span className="text-lg">{animalForFarmer(e.farmerId).glyph}</span>
            <span className="flex-1 font-mono text-sm text-ivory">{e.name}</span>
            <span className="font-mono text-xs text-gold-dim">{e.harvests}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

export function HuntOverlay({
  launches,
  onClose,
  onEnter,
}: {
  launches: Launch[];
  onClose: () => void;
  onEnter: (id: number) => void;
}) {
  const now = useNow(30000);
  return (
    <Sheet title="The Hunt" subtitle="COMPLETED HUNTS · HARVESTED LAUNCHES" onClose={onClose}>
      <div className="divide-y divide-border border border-border">
        {launches.map((l) => (
          <button
            key={l.id}
            onClick={() => onEnter(l.farmerId)}
            className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-4 text-left hover:bg-accent/40"
          >
            <span className="text-xl">{animalForFarmer(l.farmerId).glyph}</span>
            <span className="font-mono text-sm text-ivory">{l.farmerName}</span>
            <span className="label-eyebrow">harvested</span>
            <span className="font-mono text-sm text-gold">{l.ticker}</span>
            <span className="font-mono text-[0.65rem] tracking-widest text-muted-foreground">
              {l.category} · {l.launchpad}
            </span>
            <span className="ml-auto font-mono text-[0.65rem] text-muted-foreground">
              {timeAgo(l.at, now)}
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

export function KingdomOverlay({
  farmers,
  connected,
  onClose,
  onEnter,
}: {
  farmers: Farmer[];
  connected: boolean;
  onClose: () => void;
  onEnter: (id: number) => void;
}) {
  const now = useNow();
  return (
    <Sheet
      title="My Kingdom"
      subtitle={connected ? "YOUR PREDATORS" : "WALLET NOT CONNECTED"}
      onClose={onClose}
    >
      {!connected ? (
        <p className="max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
          Connect a wallet to see the farmers you own. Ownership, cooldowns and
          boosts are read from the protocol — nothing here is simulated.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {farmers.map((f) => (
            <div key={f.id} className="border border-border bg-card/60 p-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{animalForFarmer(f.id).glyph}</span>
                <p className="display-xl text-base text-ivory">{f.name}</p>
              </div>
              <dl className="mt-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">STATUS</dt>
                  <dd className="text-ivory uppercase">{f.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">TARGET</dt>
                  <dd className="text-ivory">{f.targetCategory}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">NEXT ACTION</dt>
                  <dd className="text-gold">{countdown(f.nextActionAt, now)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">BOOST</dt>
                  <dd className={f.boostActive ? "text-gold" : "text-muted-foreground"}>
                    {f.boostActive ? "ACTIVE" : "INACTIVE"}
                  </dd>
                </div>
              </dl>
              <button
                onClick={() => onEnter(f.id)}
                className="mt-4 w-full border border-border py-2 font-mono text-[0.65rem] tracking-[0.24em] uppercase hover:border-gold hover:text-gold"
              >
                Enter territory
              </button>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}

