/**
 * ============================================================================
 * PROTOCOL ADAPTER — the single seam between the Jungle frontend and the
 * Farming Agents engine (wallet, contracts, ABIs, indexer).
 * ============================================================================
 *
 * The jungle world NEVER invents protocol values: every visual state is derived
 * from the shapes returned here. To go live, replace the bodies of
 * `fetchFarmers`, `fetchLeaderboard`, `fetchLaunches` and `fetchAccount` with
 * the existing calls (Field.sow / Field.harvest / farmer registry reads /
 * $FARM balance) and keep the return shapes identical. Nothing else changes.
 *
 * Terminology map (visual layer only — protocol names stay intact):
 *   farmer -> predator | field -> jungle | plot -> territory
 *   crop -> prey/target | sow -> hunt | harvest -> kill | rot -> prey escaped
 */

export type CropStage = "seed" | "growing" | "ripe" | "rot";
export type FarmerStatus =
  | "idle"
  | "growing"
  | "ripe"
  | "cooldown"
  | "rot"
  | "harvesting";

export type Category =
  | "MEME"
  | "ANIMAL"
  | "AI"
  | "DEFI"
  | "GAMING"
  | "ART"
  | "MUSIC"
  | "SPORTS"
  | "POLITICS"
  | "SCIENCE"
  | "SPACE"
  | "NOSTALGIA"
  | "DOOMER";

export const CATEGORIES: Category[] = [
  "MEME",
  "ANIMAL",
  "AI",
  "DEFI",
  "GAMING",
  "ART",
  "MUSIC",
  "SPORTS",
  "POLITICS",
  "SCIENCE",
  "SPACE",
  "NOSTALGIA",
  "DOOMER",
];

export interface Farmer {
  /** on-chain farmer id — drives all deterministic visuals */
  id: number;
  name: string;
  owner: string;
  status: FarmerStatus;
  cropStage: CropStage;
  /** unix ms when the current crop/cooldown resolves (null when idle) */
  readyAt: number | null;
  nextActionAt: number | null;
  targetCategory: Category;
  targetTicker: string | null;
  categories: Category[];
  launchpad: string;
  boostActive: boolean;
  /** protocol counters — used only to scale visual richness, never invented */
  harvests: number;
  speedTier: "SLOW" | "STANDARD" | "SWIFT";
  rank: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  farmerId: number;
  name: string;
  owner: string;
  harvests: number;
}

export interface Launch {
  id: string;
  farmerId: number;
  farmerName: string;
  ticker: string;
  category: Category;
  launchpad: string;
  at: number;
}

export interface Account {
  address: string | null;
  farmBalance: number;
  farmerCount: number;
  boostSlots: { farmerId: number | null; active: boolean }[];
}

/* -------------------------------------------------------------------------- */
/* Deterministic development source. Replace with live engine reads.          */
/* -------------------------------------------------------------------------- */

export function hash(input: string | number): number {
  let h = 2166136261;
  const s = String(input);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const NAMES = [
  "KING LEONIDAS",
  "NIGHTFANG",
  "OBSIDIAN",
  "MARROW",
  "SABLE VEIL",
  "IRONJAW",
  "ASHEN CLAW",
  "MOTHER OF DUST",
  "VELVET DEATH",
  "SILENT RIVER",
  "GRAVEBLOOM",
  "THE ARCHITECT",
  "RUIN WALKER",
  "EMBERTOOTH",
  "PALE MONARCH",
  "STORMHIDE",
  "LAST LIGHT",
  "SEVEN SCARS",
  "HOLLOW CROWN",
  "DUSK HERALD",
  "BONE ORCHARD",
  "SPINE OF THE HILL",
  "COLD MERCY",
  "WIDOW OF WATERS",
];

/** Launchpads available on the Robinhood chain. */
export const LAUNCHPADS = [
  "PONS",
  "LONG",
  "LUNCH",
  "BAGS",
  "BANKR",
  "POOLS",
];

export const LAUNCHPAD_URLS: Record<string, string> = {
  PONS: "https://www.ponsfamily.com/launchpad",
  LONG: "https://app.long.xyz/",
  LUNCH: "https://www.lunch.fun/",
  BAGS: "https://bags.fm/",
  BANKR: "https://bankr.bot/terminal",
  POOLS: "https://pools.trade/",
};

export type SpeedTier = "SLOW" | "STANDARD" | "SWIFT";

/** Creation parameters — must mirror the existing farmer creation call. */
export interface ForgeSpec {
  name: string;
  animal: string;
  categories: Category[];
  speedTier: SpeedTier;
  launchpad: string;
}

/** Protocol creation constraints (enforced on-chain; mirrored for the UI). */
export const FORGE_RULES = {
  nameMin: 3,
  nameMax: 24,
  namePattern: /^[A-Za-z0-9 ']+$/,
  minCategories: 1,
  maxCategories: 3,
} as const;

export const SPEED_TIERS: {
  id: SpeedTier;
  label: string;
  note: string;
}[] = [
  { id: "SLOW", label: "SLOW", note: "Longest cooldown, lowest forge cost." },
  { id: "STANDARD", label: "STANDARD", note: "Balanced cooldown and cost." },
  { id: "SWIFT", label: "SWIFT", note: "Shortest cooldown, highest forge cost." },
];

const TICKERS = [
  "ROAR",
  "FANG",
  "PREY",
  "HOWL",
  "CLAW",
  "MANE",
  "HUNT",
  "TALON",
  "SCALE",
  "PACK",
];

function pick<T>(arr: T[], r: number): T {
  return arr[Math.min(arr.length - 1, Math.floor(r * arr.length))] as T;
}

function statusFor(r: number): FarmerStatus {
  if (r < 0.3) return "growing";
  if (r < 0.48) return "ripe";
  if (r < 0.68) return "cooldown";
  if (r < 0.78) return "rot";
  return "idle";
}

const stageFor: Record<FarmerStatus, CropStage> = {
  idle: "seed",
  growing: "growing",
  ripe: "ripe",
  harvesting: "ripe",
  cooldown: "seed",
  rot: "rot",
};

export async function fetchFarmers(): Promise<Farmer[]> {
  const now = Date.now();
  return NAMES.map((name, i) => {
    const id = 400 + i * 7 + Math.floor(hash(name) * 40);
    const r = hash(`status:${id}`);
    const status = statusFor(r);
    const harvests = Math.floor(hash(`h:${id}`) * 240);
    const cats = CATEGORIES.filter((_, ci) => hash(`c:${id}:${ci}`) > 0.76);
    const primary: Category =
      cats[0] ?? CATEGORIES[Math.floor(hash(`p:${id}`) * 13)] ?? "MEME";
    return {
      id,
      name,
      owner: `0x${Math.floor(hash(`o:${id}`) * 0xffffff)
        .toString(16)
        .padStart(6, "0")}...${Math.floor(hash(`o2:${id}`) * 0xfff)
        .toString(16)
        .padStart(3, "0")
        .toUpperCase()}`,
      status,
      cropStage: stageFor[status],
      readyAt:
        status === "growing" || status === "cooldown"
          ? now + Math.floor(hash(`t:${id}`) * 40_000_000)
          : null,
      nextActionAt: now + Math.floor(hash(`n:${id}`) * 60_000_000),
      targetCategory: primary,
      targetTicker:
        status === "growing" || status === "ripe"
          ? `$${pick(TICKERS, hash(`tk:${id}`))}`
          : null,
      categories: cats.length ? cats : [primary],
      launchpad: pick(LAUNCHPADS, hash(`l:${id}`)),
      boostActive: hash(`b:${id}`) > 0.62,
      harvests,
      speedTier:
        hash(`s:${id}`) > 0.7
          ? "SWIFT"
          : hash(`s:${id}`) > 0.35
            ? "STANDARD"
            : "SLOW",
      rank: null,
    } satisfies Farmer;
  });
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const farmers = await fetchFarmers();
  return [...farmers]
    .sort((a, b) => b.harvests - a.harvests)
    .map((f, i) => ({
      rank: i + 1,
      farmerId: f.id,
      name: f.name,
      owner: f.owner,
      harvests: f.harvests,
    }));
}

export async function fetchLaunches(): Promise<Launch[]> {
  const farmers = await fetchFarmers();
  const now = Date.now();
  return farmers
    .filter((f) => f.harvests > 0)
    .slice(0, 12)
    .map((f, i) => ({
      id: `${f.id}-${i}`,
      farmerId: f.id,
      farmerName: f.name,
      ticker: `$${pick(TICKERS, hash(`lt:${f.id}`))}`,
      category: f.targetCategory,
      launchpad: f.launchpad,
      at: now - Math.floor(hash(`la:${f.id}`) * 6 * 3600_000),
    }))
    .sort((a, b) => b.at - a.at);
}

export async function fetchAccount(): Promise<Account> {
  // Live build: read the connected wallet + $FARM balance from the engine.
  return { address: null, farmBalance: 0, farmerCount: 0, boostSlots: [] };
}

/** Wire the real Field.sow() / Field.harvest() calls here. */
export async function hunt(_farmerId: number): Promise<void> {
  throw new Error("Connect wallet: Field.sow() is not wired in this build.");
}

export async function harvest(_farmerId: number): Promise<void> {
  throw new Error("Connect wallet: Field.harvest() is not wired in this build.");
}

/**
 * Wire the existing farmer creation call here (the same contract method the
 * current app uses: name + animal + categories + speed tier + launchpad, with
 * the on-chain forge fee). The UI already validates against FORGE_RULES, but
 * the protocol remains the source of truth.
 */
export async function forgeFarmer(_spec: ForgeSpec): Promise<{ id: number }> {
  throw new Error(
    "Connect wallet: farmer creation is not wired in this build.",
  );
}
