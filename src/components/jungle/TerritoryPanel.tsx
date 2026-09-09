import { useQuery } from "@tanstack/react-query";
import { animalForFarmer } from "@/lib/jungle/animals";
import { CATEGORY_THEME } from "@/lib/jungle/world";
import { harvest, hunt, type Farmer } from "@/lib/jungle/protocol";
import { fetchWinRecord } from "@/lib/jungle/treasury";
import { countdown, useNow } from "./useJungle";
import { usd, useTodaysHunt } from "./useTreasury";
import { toast } from "sonner";

/** Camp record — permanent daily-treasury history and trophies. */
function CampRecord({ farmerId }: { farmerId: number }) {
  const record = useQuery({
    queryKey: ["win-record", farmerId],
    queryFn: () => fetchWinRecord(farmerId),
  });
  const board = useTodaysHunt();
  const today = board.data?.find((e) => e.survivorId === farmerId);
  const r = record.data;
  if (!r) return null;

  return (
    <div className="mt-6 border border-gold/30 bg-gold/5 p-4">
      <p className="label-eyebrow">Camp record</p>
      <dl className="mt-3 space-y-1.5 font-mono text-[0.7rem]">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">DAILY TREASURY WINS</dt>
          <dd className="text-gold">{r.wins}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">LARGEST WIN</dt>
          <dd className="text-ivory">{r.largestWin.toFixed(2)} ETH</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">ALL-TIME VERIFIED VOLUME</dt>
          <dd className="text-ivory">{usd(r.allTimeVolume)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">BEST FINISH</dt>
          <dd className="text-ivory">#{r.bestFinish}</dd>
        </div>
        {today && (
          <>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">TODAY&apos;S RANK</dt>
              <dd className="text-gold">#{today.rank}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">TODAY&apos;S VERIFIED VOLUME</dt>
              <dd className="text-ivory">{usd(today.verifiedVolume)}</dd>
            </div>
          </>
        )}
      </dl>
      {r.wins > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Array.from({ length: r.wins }, (_, i) => (
            <span
              key={i}
              title="Daily treasury win"
              className="border border-gold/50 px-2 py-0.5 font-mono text-[0.6rem] text-gold"
            >
              ♛
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_COPY: Record<Farmer["status"], { label: string; note: string }> = {
  idle: { label: "IDLE", note: "Prowling its territory" },
  growing: { label: "GROWING", note: "Tracking prey" },
  ripe: { label: "RIPE", note: "Ready to harvest" },
  cooldown: { label: "COOLDOWN", note: "Resting" },
  rot: { label: "ROT", note: "The hunt was missed." },
  harvesting: { label: "HARVESTING", note: "Moving in for the kill" },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border/60 py-3">
      <p className="label-eyebrow mb-1">{label}</p>
      <div className="font-mono text-sm text-ivory">{children}</div>
    </div>
  );
}

export function TerritoryPanel({
  farmer,
  rank,
  onClose,
}: {
  farmer: Farmer;
  rank: number | null;
  onClose: () => void;
}) {
  const now = useNow();
  const animal = animalForFarmer(farmer.id);
  const theme = CATEGORY_THEME[farmer.targetCategory];
  const status = STATUS_COPY[farmer.status];

  const act = async (fn: () => Promise<void>) => {
    try {
      await fn();
      toast.success("Transaction submitted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transaction failed");
    }
  };

  return (
    <aside className="animate-rise fixed inset-x-0 bottom-0 z-30 max-h-[70svh] overflow-y-auto border-t border-gold/25 bg-card/95 backdrop-blur-md md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[24rem] md:border-t-0 md:border-l">
      <div className="flex items-start justify-between p-6 pb-4">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="text-3xl">{animal.glyph}</span>
            <span className="label-eyebrow">{animal.id} · {animal.trait}</span>
          </div>
          <h2 className="display-xl text-2xl text-ivory">{farmer.name}</h2>
          <p className="mt-1 font-mono text-xs tracking-widest text-gold-dim">
            TERRITORY #{farmer.id}
            {rank !== null && ` · FOOD CHAIN #${rank}`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="font-mono text-xs text-muted-foreground hover:text-ivory"
          aria-label="Close territory"
        >
          ✕
        </button>
      </div>

      <div className="px-6 pb-8">
        <Row label="Owner">{farmer.owner}</Row>
        <Row label="Current status">
          <span
            className={
              farmer.status === "rot"
                ? "text-danger"
                : farmer.status === "ripe"
                  ? "text-gold"
                  : "text-ivory"
            }
          >
            {status.label}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">{status.note}</span>
          {farmer.readyAt !== null && (
            <div className="mt-1 text-lg tracking-widest text-gold">
              {countdown(farmer.readyAt, now)}
            </div>
          )}
        </Row>
        <Row label="Current target">
          {farmer.targetTicker ?? "—"}{" "}
          <span className="text-muted-foreground">
            · {farmer.targetCategory} · {theme.label}
          </span>
        </Row>
        <Row label="Territories / categories">
          <div className="flex flex-wrap gap-1.5">
            {farmer.categories.map((c) => (
              <span
                key={c}
                className="border border-border px-2 py-0.5 text-[0.65rem] tracking-widest"
              >
                {c}
              </span>
            ))}
          </div>
        </Row>
        <Row label="Launchpad">{farmer.launchpad}</Row>
        <Row label="Speed">{farmer.speedTier}</Row>
        <Row label="Boost">
          {farmer.boostActive ? (
            <span className="text-gold">ACTIVE</span>
          ) : (
            <span className="text-muted-foreground">INACTIVE</span>
          )}
        </Row>
        <Row label="Harvests">{farmer.harvests}</Row>
        <Row label="Next hunt">{countdown(farmer.nextActionAt, now)}</Row>

        <CampRecord farmerId={farmer.id} />

        {farmer.status === "rot" && (
          <p className="mt-6 border-l-2 border-danger pl-3 font-mono text-xs tracking-[0.2em] text-danger uppercase">
            The hunt was missed.
          </p>
        )}

        <div className="mt-6 flex gap-3">
          {farmer.status === "ripe" ? (
            <button
              onClick={() => act(() => harvest(farmer.id))}
              className="flex-1 border border-gold bg-gold/15 py-3 font-mono text-xs tracking-[0.24em] text-gold uppercase transition-colors hover:bg-gold hover:text-primary-foreground"
            >
              Harvest
            </button>
          ) : (
            <button
              onClick={() => act(() => hunt(farmer.id))}
              className="flex-1 border border-border py-3 font-mono text-xs tracking-[0.24em] text-ivory uppercase transition-colors hover:border-gold hover:text-gold"
            >
              Hunt
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
