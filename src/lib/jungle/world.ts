import { hash } from "./protocol";
import type { Category, Farmer } from "./protocol";

export const WORLD_RADIUS = 78;

/** Visual environment themes per protocol category (skin only). */
export const CATEGORY_THEME: Record<
  Category,
  { ground: string; foliage: string; label: string }
> = {
  MEME: { ground: "#3d5326", foliage: "#7bb03a", label: "chaotic jungle" },
  ANIMAL: { ground: "#3a4a24", foliage: "#6f9b3c", label: "wildlife" },
  AI: { ground: "#22383c", foliage: "#3f8f92", label: "futuristic jungle" },
  DEFI: { ground: "#233a45", foliage: "#c9a35a", label: "river treasure" },
  GAMING: { ground: "#3f3325", foliage: "#a4713a", label: "arena" },
  ART: { ground: "#3d2c3c", foliage: "#b4568c", label: "exotic bloom" },
  MUSIC: { ground: "#232a42", foliage: "#5f6bb0", label: "night jungle" },
  SPORTS: { ground: "#2f4229", foliage: "#89a63c", label: "contested ground" },
  POLITICS: { ground: "#3a2a24", foliage: "#8c4a34", label: "battlefield" },
  SCIENCE: { ground: "#26383a", foliage: "#5aa89a", label: "experiment" },
  SPACE: { ground: "#242038", foliage: "#7a6bc4", label: "cosmic jungle" },
  NOSTALGIA: { ground: "#3b382a", foliage: "#a89b62", label: "ancient ruins" },
  DOOMER: { ground: "#2a2a26", foliage: "#5c5a4c", label: "dead forest" },
};

export interface Region {
  name: string;
  x: number;
  z: number;
  r: number;
  color: string;
}

/** Fixed environmental regions — purely visual geography. */
export const REGIONS: Region[] = [
  { name: "DARK FOREST", x: -46, z: -40, r: 34, color: "#1b2a1c" },
  { name: "SWAMP", x: 40, z: -46, r: 30, color: "#1e2a24" },
  { name: "SAVANNA", x: 48, z: 34, r: 34, color: "#4a4326" },
  { name: "ANCIENT RUINS", x: -44, z: 42, r: 28, color: "#33322a" },
  { name: "MOUNTAINS", x: 0, z: -70, r: 40, color: "#26282c" },
  { name: "JUNGLE", x: 0, z: 6, r: 40, color: "#22331f" },
];

/** Deterministic territory placement: same farmer, same land, every load. */
export function territoryLayout(farmers: Farmer[]) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return farmers.map((f, i) => {
    const t = (i + 0.5) / farmers.length;
    const radius = Math.sqrt(t) * (WORLD_RADIUS - 12);
    const angle = i * golden + hash(`a:${f.id}`) * 0.5;
    const jitter = (hash(`j:${f.id}`) - 0.5) * 6;
    return {
      farmer: f,
      x: Math.cos(angle) * radius + jitter,
      z: Math.sin(angle) * radius - jitter,
      /** territory size scales with real harvest count only */
      scale: 1 + Math.min(f.harvests, 240) / 240,
      seed: hash(`t:${f.id}`),
    };
  });
}

export type TerritoryPlacement = ReturnType<typeof territoryLayout>[number];

/** Background flora scattered outside territories. */
export function scatterTrees(count: number) {
  const out: { x: number; z: number; s: number; tint: number }[] = [];
  for (let i = 0; i < count; i++) {
    const a = hash(`ta:${i}`) * Math.PI * 2;
    const r = 14 + Math.sqrt(hash(`tr:${i}`)) * (WORLD_RADIUS + 16);
    out.push({
      x: Math.cos(a) * r,
      z: Math.sin(a) * r,
      s: 0.7 + hash(`ts:${i}`) * 1.5,
      tint: hash(`tt:${i}`),
    });
  }
  return out;
}
