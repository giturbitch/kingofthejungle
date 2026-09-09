import { useMemo } from "react";
import { animalForFarmer } from "@/lib/jungle/animals";
import { SCORING_SUMMARY } from "@/lib/jungle/treasury";
import { Sheet } from "./Overlays";
import { countdown, useNow } from "./useJungle";
import {
  eth,
  pct,
  usd,
  useDistribution,
  useEpochHistory,
  useFeed,
  useTodaysHunt,
  useTreasury,
} from "./useTreasury";

/** Always-visible treasury ticker — the daily round is part of the world. */
export function TreasuryHud({ onOpen }: { onOpen: () => void }) {
  const now = useNow();
  const treasury = useTreasury();
  const board = useTodaysHunt();
  const t = treasury.data;
  const leader = board.data?.[0];
  if (!t) return null;

  const remaining = t.endsAt - now;
  const finalHour = remaining < 3600_000;
  const finalHunt = remaining < 600_000;

  return (
    <button
      onClick={onOpen}
      className={`animate-rise pointer-events-auto fixed top-20 left-5 z-20 border bg-background/80 px-4 py-3 text-left backdrop-blur transition-colors sm:left-8 ${
        finalHour ? "border-danger/70" : "border-gold/40 hover:border-gold"
      }`}
    >
      <p className="label-eyebrow">
        {finalHunt ? "FINAL HUNT" : "TODAY'S JUNGLE TREASURY"}
      </p>
      <p className="display-xl mt-1 text-2xl text-gold sm:text-3xl">
        {eth(t.pool)}
      </p>
      <p className="mt-2 font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground">
        ENDS IN{" "}
        <span className={finalHour ? "text-danger" : "text-ivory"}>
          {countdown(t.endsAt, now)}
        </span>
      </p>
      {leader && (
        <p className="mt-1 font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground">
          LEADER <span className="text-ivory">{leader.name}</span>
        </p>
      )}
    </button>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "gold" | "danger" }) {
  return (
    <div className="border border-border bg-card/60 p-4">
      <p className="label-eyebrow">{label}</p>
      <p
        className={`mt-2 font-mono text-lg ${
          tone === "gold" ? "text-gold" : tone === "danger" ? "text-danger" : "text-ivory"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function TreasuryOverlay({
  yourSurvivorId,
  onClose,
  onEnter,
}: {
  yourSurvivorId: number | null;
  onClose: () => void;
  onEnter: (id: number) => void;
}) {
  const now = useNow();
  const treasury = useTreasury();
  const dist = useDistribution();
  const hunt = useTodaysHunt();
  const feed = useFeed();
  const history = useEpochHistory();

  const t = treasury.data;
  const board = hunt.data ?? [];
  const leader = board[0];
  const totalVolume = useMemo(
    () => board.reduce((s, e) => s + e.verifiedVolume, 0),
    [board],
  );
  const yours = board.find((e) => e.survivorId === yourSurvivorId) ?? null;
  const remaining = t ? t.endsAt - now : 0;
  const finalHour = remaining < 3600_000;

  const winnerShare =
    t && dist.data ? (t.pool * dist.data.winnerBps) / 10_000 : 0;

  return (
    <Sheet
      title="The Jungle Treasury"
      subtitle={
        t
          ? `EPOCH ${t.epoch} · ${t.status} · 00:00–23:59:59 UTC`
          : "LOADING EPOCH"
      }
      onClose={onClose}
    >
      {!t ? (
        <p className="font-mono text-sm text-muted-foreground">Reading epoch state…</p>
      ) : (
        <div className="space-y-10">
          <div className="border border-gold/40 bg-gold/5 p-6 text-center">
            <p className="label-eyebrow">Today&apos;s Jungle Treasury</p>
            <p className="display-xl mt-3 text-5xl text-gold sm:text-6xl">
              {eth(t.pool)}
            </p>
            <p
              className={`mt-4 font-mono text-sm tracking-[0.28em] ${
                finalHour ? "text-danger" : "text-ivory"
              }`}
            >
              {t.status === "VERIFYING"
                ? "VERIFYING THE HUNT…"
                : `ENDS IN ${countdown(t.endsAt, now)}`}
            </p>
            <p className="mt-3 font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground">
              FUNDED BY {t.contributions24h} ELIGIBLE SUPPLY DEPOT PURCHASES · INCLUDES{" "}
              {eth(t.rollover)} ROLLOVER
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="Current leader" value={leader?.name ?? "—"} tone="gold" />
            <Stat label="24h verified volume" value={usd(totalVolume)} />
            <Stat label="Eligible launches" value={String(t.eligibleLaunches)} />
            <Stat label="Winner share (est.)" value={eth(winnerShare)} tone="gold" />
          </div>

          <section>
            <p className="label-eyebrow mb-3">Distribution — configured on-chain</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {dist.data ? (
                <>
                  <Stat label="Winning survivor / owner" value={pct(dist.data.winnerBps)} tone="gold" />
                  <Stat label="Protocol treasury" value={pct(dist.data.protocolBps)} />
                  <Stat label="Rollover / ecosystem reserve" value={pct(dist.data.rolloverBps)} />
                </>
              ) : (
                <p className="font-mono text-xs text-muted-foreground">
                  Reading configured split…
                </p>
              )}
            </div>
            <p className="mt-3 font-mono text-[0.65rem] leading-relaxed tracking-widest text-muted-foreground uppercase">
              Percentages are read from the protocol configuration and can change between
              epochs. Nothing here is a promise of income or returns.
            </p>
          </section>

          <section>
            <div className="mb-3 flex items-end justify-between">
              <p className="label-eyebrow">Today&apos;s Hunt — verified volume</p>
              <p className="font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground">
                LIVE
              </p>
            </div>

            {yours && (
              <div className="mb-4 border border-gold/50 bg-gold/10 p-4">
                <p className="label-eyebrow">Your position</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-sm">
                  <span className="display-xl text-2xl text-gold">#{yours.rank}</span>
                  <span className="text-ivory">{yours.name}</span>
                  <span className="text-gold-dim">{usd(yours.verifiedVolume)} volume</span>
                  <span className="text-muted-foreground">
                    {leader
                      ? `${usd(leader.verifiedVolume - yours.verifiedVolume)} behind #1`
                      : ""}
                  </span>
                </div>
              </div>
            )}

            <div className="divide-y divide-border border border-border">
              {board.slice(0, 12).map((e) => {
                const gap = leader ? leader.verifiedVolume - e.verifiedVolume : 0;
                return (
                  <button
                    key={e.survivorId}
                    onClick={() => onEnter(e.survivorId)}
                    className={`flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left hover:bg-accent/40 ${
                      e.survivorId === yourSurvivorId ? "bg-gold/5" : ""
                    }`}
                  >
                    <span className="w-9 font-mono text-xs text-muted-foreground">
                      #{e.rank}
                    </span>
                    <span className="text-lg">{animalForFarmer(e.survivorId).glyph}</span>
                    <span className="flex-1 font-mono text-sm text-ivory">{e.name}</span>
                    <span className="font-mono text-xs text-gold-dim">
                      {usd(e.verifiedVolume)}
                    </span>
                    <span className="w-28 text-right font-mono text-[0.6rem] tracking-widest text-muted-foreground">
                      {gap === 0 ? "LEADER" : `-${usd(gap)}`}
                    </span>
                    <span className="w-24 text-right font-mono text-[0.6rem] tracking-widest text-muted-foreground">
                      {e.eligibleLaunches} LAUNCHES
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="label-eyebrow mb-3">Race activity</p>
            <div className="divide-y divide-border border border-border">
              {(feed.data ?? []).map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-4 px-4 py-3 font-mono text-xs"
                >
                  <span
                    className={`w-16 tracking-widest ${
                      f.kind === "LEAD" ? "text-gold" : "text-muted-foreground"
                    }`}
                  >
                    {f.kind}
                  </span>
                  <span className="text-ivory">{f.text}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="label-eyebrow mb-3">Verified volume only</p>
            <ul className="space-y-2 border border-border bg-card/40 p-5">
              {SCORING_SUMMARY.map((line) => (
                <li
                  key={line}
                  className="font-mono text-[0.7rem] leading-relaxed text-muted-foreground"
                >
                  — {line}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-[0.65rem] leading-relaxed tracking-widest text-muted-foreground uppercase">
              Scoring, eligibility and settlement are performed by the protocol. This
              screen only displays finalized state.
            </p>
          </section>

          <section>
            <p className="label-eyebrow mb-3">Settled epochs — audit trail</p>
            <div className="divide-y divide-border border border-border">
              {(history.data ?? []).map((r) => (
                <div key={r.epoch} className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      EPOCH {r.epoch}
                    </span>
                    <span className="display-xl text-base text-ivory">
                      {r.winnerName}
                    </span>
                    <span className="font-mono text-xs text-gold">
                      {eth(r.winnerPayout)} WON
                    </span>
                    <span className="ml-auto font-mono text-[0.6rem] tracking-widest text-muted-foreground">
                      {r.payoutTx}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-x-6 gap-y-1 font-mono text-[0.65rem] text-muted-foreground sm:grid-cols-3">
                    <span>VERIFIED VOLUME {usd(r.verifiedVolume)}</span>
                    <span>POOL {eth(r.pool, 4)}</span>
                    <span>ELIGIBLE LAUNCHES {r.eligibleLaunches}</span>
                    <span>PROTOCOL {eth(r.protocolShare, 4)}</span>
                    <span>ROLLOVER {eth(r.rollover, 4)}</span>
                    <span>
                      {new Date(r.startsAt).toISOString().slice(0, 10)} 00:00 UTC
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </Sheet>
  );
}
