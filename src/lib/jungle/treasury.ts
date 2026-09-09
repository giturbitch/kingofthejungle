/**
 * ============================================================================
 * TREASURY / EPOCH ADAPTER — the seam between the Jungle frontend and the
 * authoritative protocol infrastructure (shop contract, treasury contract,
 * epoch accounting, volume indexer, verification engine, payout contract).
 * ============================================================================
 *
 * IMPORTANT CONTRACT OF THIS FILE
 *  - The frontend NEVER decides winners, scores or payouts. It renders state.
 *  - Distribution percentages are read from the protocol (`fetchDistribution`),
 *    never hardcoded in components.
 *  - Volume shown is ELIGIBLE / VERIFIED volume as reported by the verification
 *    engine. Raw transfer volume is never displayed as a score.
 *  - Anti-abuse heuristics live server-side and are intentionally not described
 *    here beyond the public methodology summary.
 *
 * To go live, replace the bodies below with the real reads/writes and keep the
 * return shapes identical.
 */

import { hash, fetchFarmers } from "./protocol";

export type EpochStatus = "ACTIVE" | "VERIFYING" | "SETTLED";

export interface Distribution {
  /** basis points, read from the protocol/admin config */
  winnerBps: number;
  protocolBps: number;
  rolloverBps: number;
}

export interface Treasury {
  epoch: number;
  status: EpochStatus;
  /** ETH currently held for this epoch */
  pool: number;
  /** ETH rolled over from the previous epoch */
  rollover: number;
  startsAt: number;
  endsAt: number;
  contributions24h: number;
  eligibleLaunches: number;
}

export interface HuntEntry {
  rank: number;
  survivorId: number;
  name: string;
  owner: string;
  /** verified/eligible volume in USD for the active epoch */
  verifiedVolume: number;
  eligibleLaunches: number;
  /** volume flagged and excluded by the verification engine */
  excludedVolume: number;
  isYours: boolean;
}

export interface FeedEvent {
  id: string;
  at: number;
  kind: "MOVE" | "LEAD" | "LAUNCH" | "TREASURY" | "CLOSE";
  text: string;
}

export interface EpochRecord {
  epoch: number;
  day: number;
  startsAt: number;
  endsAt: number;
  winnerId: number;
  winnerName: string;
  verifiedVolume: number;
  pool: number;
  winnerPayout: number;
  protocolShare: number;
  rollover: number;
  eligibleLaunches: number;
  payoutTx: string;
}

export interface WinRecord {
  survivorId: number;
  wins: number;
  largestWin: number;
  allTimeVolume: number;
  bestFinish: number;
}

/** Published scoring summary — safe to display, no heuristics revealed. */
export const SCORING_SUMMARY = [
  "Score = verified external trading volume on tokens launched by the survivor inside the active epoch.",
  "Owner, survivor, protocol and designated related wallets are excluded.",
  "Circular, self-directed and coordinated wallet activity is filtered before scoring.",
  "Minimum unique-trader and holding thresholds apply per launch.",
  "Results are finalized only after the indexer confirms the epoch is complete.",
];

const DAY_MS = 86_400_000;

export function epochWindow(now = Date.now()) {
  const startsAt = Math.floor(now / DAY_MS) * DAY_MS;
  return { startsAt, endsAt: startsAt + DAY_MS, epoch: Math.floor(now / DAY_MS) };
}

export async function fetchDistribution(): Promise<Distribution> {
  // Live build: read the configured split from the treasury contract.
  return { winnerBps: 6000, protocolBps: 2000, rolloverBps: 2000 };
}

export async function fetchTreasury(): Promise<Treasury> {
  const now = Date.now();
  const { startsAt, endsAt, epoch } = epochWindow(now);
  const progress = (now - startsAt) / DAY_MS;
  const base = 4 + hash(`pool:${epoch}`) * 9;
  const remaining = endsAt - now;
  return {
    epoch,
    status: remaining <= 0 ? "VERIFYING" : "ACTIVE",
    pool: Number((base + progress * (9 + hash(`rate:${epoch}`) * 12)).toFixed(4)),
    rollover: Number((hash(`roll:${epoch}`) * 3).toFixed(4)),
    startsAt,
    endsAt,
    contributions24h: 120 + Math.floor(hash(`c:${epoch}`) * 400),
    eligibleLaunches: 18 + Math.floor(hash(`el:${epoch}`) * 40),
  };
}

/** TODAY'S HUNT — live epoch standings by verified volume. */
export async function fetchTodaysHunt(): Promise<HuntEntry[]> {
  const survivors = await fetchFarmers();
  const { epoch } = epochWindow();
  const progress = (Date.now() - epochWindow().startsAt) / DAY_MS;
  return survivors
    .map((s) => {
      const v = hash(`vol:${epoch}:${s.id}`);
      return {
        survivorId: s.id,
        name: s.name,
        owner: s.owner,
        verifiedVolume: Math.round(v * v * 420_000 * (0.2 + progress)),
        eligibleLaunches: 1 + Math.floor(hash(`la:${epoch}:${s.id}`) * 5),
        excludedVolume: Math.round(hash(`ex:${epoch}:${s.id}`) * 40_000),
        isYours: false,
      };
    })
    .sort((a, b) => b.verifiedVolume - a.verifiedVolume)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

export async function fetchFeed(): Promise<FeedEvent[]> {
  const board = await fetchTodaysHunt();
  const now = Date.now();
  const leader = board[0];
  const out: FeedEvent[] = [];
  board.slice(0, 8).forEach((e, i) => {
    const gap = leader ? leader.verifiedVolume - e.verifiedVolume : 0;
    const pct = leader && leader.verifiedVolume > 0
      ? (gap / leader.verifiedVolume) * 100
      : 0;
    out.push({
      id: `f:${e.survivorId}`,
      at: now - Math.floor(hash(`fa:${e.survivorId}`) * 3 * 3600_000),
      kind: i === 0 ? "LEAD" : "MOVE",
      text:
        i === 0
          ? `${e.name} EXTENDED THE LEAD`
          : `${e.name} IS ${pct.toFixed(1)}% FROM FIRST PLACE`,
    });
  });
  return out.sort((a, b) => b.at - a.at);
}

export async function fetchEpochHistory(): Promise<EpochRecord[]> {
  const survivors = await fetchFarmers();
  const dist = await fetchDistribution();
  const { epoch } = epochWindow();
  return Array.from({ length: 7 }, (_, i) => {
    const e = epoch - (i + 1);
    const w = survivors[Math.floor(hash(`w:${e}`) * survivors.length)]!;
    const pool = Number((6 + hash(`hp:${e}`) * 14).toFixed(4));
    return {
      epoch: e,
      day: e - (epoch - 184),
      startsAt: e * DAY_MS,
      endsAt: (e + 1) * DAY_MS,
      winnerId: w.id,
      winnerName: w.name,
      verifiedVolume: Math.round(180_000 + hash(`hv:${e}`) * 320_000),
      pool,
      winnerPayout: Number(((pool * dist.winnerBps) / 10_000).toFixed(4)),
      protocolShare: Number(((pool * dist.protocolBps) / 10_000).toFixed(4)),
      rollover: Number(((pool * dist.rolloverBps) / 10_000).toFixed(4)),
      eligibleLaunches: 14 + Math.floor(hash(`he:${e}`) * 40),
      payoutTx: `0x${Math.floor(hash(`tx:${e}`) * 0xffffffff)
        .toString(16)
        .padStart(8, "0")}…${Math.floor(hash(`tx2:${e}`) * 0xffff)
        .toString(16)
        .padStart(4, "0")}`,
    };
  });
}

export async function fetchWinRecord(survivorId: number): Promise<WinRecord> {
  return {
    survivorId,
    wins: Math.floor(hash(`wins:${survivorId}`) * 8),
    largestWin: Number((hash(`lw:${survivorId}`) * 6).toFixed(2)),
    allTimeVolume: Math.round(hash(`atv:${survivorId}`) * 2_000_000),
    bestFinish: 1 + Math.floor(hash(`bf:${survivorId}`) * 12),
  };
}

/* -------------------------------------------------------------------------- */
/* SUPPLY DEPOT                                                               */
/* -------------------------------------------------------------------------- */

export type ShopCategory =
  | "EQUIPMENT"
  | "CAMP"
  | "SURVIVAL"
  | "COSMETICS"
  | "PRESTIGE";

/** Every item states plainly what it actually affects. */
export type ItemClass = "COSMETIC" | "SIMULATION" | "PROTOCOL UTILITY";

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  itemClass: ItemClass;
  /** price in ETH */
  price: number;
  /** share of the price routed to the daily treasury, in basis points */
  treasuryBps: number;
  blurb: string;
}

export const SHOP_CATEGORIES: { id: ShopCategory; note: string }[] = [
  { id: "EQUIPMENT", note: "Packs, tools, navigation, comms." },
  { id: "CAMP", note: "Shelter, storage, light, towers, power, walls." },
  { id: "SURVIVAL", note: "Medical, water, food, utility." },
  { id: "COSMETICS", note: "Clothing, banners, patches, fire, skins." },
  { id: "PRESTIGE", note: "Rare structures, trophies, decoration." },
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: "pack-1", name: "REINFORCED BACKPACK", category: "EQUIPMENT", itemClass: "SIMULATION", price: 0.012, treasuryBps: 2500, blurb: "Carries more between hunts." },
  { id: "tool-1", name: "MACHETE, HONED", category: "EQUIPMENT", itemClass: "SIMULATION", price: 0.009, treasuryBps: 2500, blurb: "Cuts a faster path through the canopy." },
  { id: "nav-1", name: "FIELD COMPASS", category: "EQUIPMENT", itemClass: "SIMULATION", price: 0.014, treasuryBps: 2500, blurb: "Steadier target selection." },
  { id: "comm-1", name: "LONG-RANGE RADIO", category: "EQUIPMENT", itemClass: "PROTOCOL UTILITY", price: 0.045, treasuryBps: 2500, blurb: "Adds a launch notification channel to the operation." },
  { id: "camp-1", name: "REINFORCED WATCHTOWER", category: "CAMP", itemClass: "SIMULATION", price: 0.038, treasuryBps: 2500, blurb: "Sees the hunt coming. Raises camp standing." },
  { id: "camp-2", name: "DIESEL GENERATOR", category: "CAMP", itemClass: "SIMULATION", price: 0.03, treasuryBps: 2500, blurb: "Keeps the camp lit through the night cycle." },
  { id: "camp-3", name: "STORM SHELTER", category: "CAMP", itemClass: "SIMULATION", price: 0.026, treasuryBps: 2500, blurb: "Survives the worst of the season." },
  { id: "camp-4", name: "PERIMETER FORTIFICATION", category: "CAMP", itemClass: "SIMULATION", price: 0.052, treasuryBps: 2500, blurb: "Holds the territory line." },
  { id: "surv-1", name: "FIELD MEDICAL KIT", category: "SURVIVAL", itemClass: "SIMULATION", price: 0.011, treasuryBps: 2500, blurb: "Fewer lost days." },
  { id: "surv-2", name: "WATER FILTRATION", category: "SURVIVAL", itemClass: "SIMULATION", price: 0.016, treasuryBps: 2500, blurb: "Clean water, longer operation." },
  { id: "surv-3", name: "DRY FOOD STORE", category: "SURVIVAL", itemClass: "SIMULATION", price: 0.013, treasuryBps: 2500, blurb: "Rations for the long hunt." },
  { id: "cos-1", name: "OILED CANVAS COAT", category: "COSMETICS", itemClass: "COSMETIC", price: 0.008, treasuryBps: 2500, blurb: "Appearance only." },
  { id: "cos-2", name: "CAMP BANNER", category: "COSMETICS", itemClass: "COSMETIC", price: 0.01, treasuryBps: 2500, blurb: "Flies over your camp. Appearance only." },
  { id: "cos-3", name: "EMBER CAMPFIRE", category: "COSMETICS", itemClass: "COSMETIC", price: 0.007, treasuryBps: 2500, blurb: "Fire style. Appearance only." },
  { id: "pres-1", name: "TROPHY WALL", category: "PRESTIGE", itemClass: "COSMETIC", price: 0.09, treasuryBps: 2500, blurb: "Displays every daily treasury win." },
  { id: "pres-2", name: "COMMAND TENT", category: "PRESTIGE", itemClass: "COSMETIC", price: 0.12, treasuryBps: 2500, blurb: "Rare camp structure." },
  { id: "pres-3", name: "BONE ARCH", category: "PRESTIGE", itemClass: "COSMETIC", price: 0.16, treasuryBps: 2500, blurb: "Marks a survivor that has ruled the jungle." },
];

export interface PurchaseResult {
  item: ShopItem;
  treasuryContribution: number;
  poolBefore: number;
  poolAfter: number;
}

/** Wire the real Shop contract call here. Treasury routing happens on-chain. */
export async function purchaseItem(_item: ShopItem): Promise<PurchaseResult> {
  throw new Error("Connect wallet: the Supply Depot purchase call is not wired in this build.");
}
