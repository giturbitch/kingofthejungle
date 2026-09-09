import { hash } from "./protocol";

export type AnimalId =
  | "LION"
  | "TIGER"
  | "PANTHER"
  | "WOLF"
  | "BEAR"
  | "GORILLA"
  | "EAGLE"
  | "SNAKE"
  | "CROCODILE"
  | "JAGUAR"
  | "HYENA"
  | "BOAR";

export interface Animal {
  id: AnimalId;
  glyph: string;
  trait: string;
  /** stylised silhouette palette + proportions for the 3D predator */
  body: string;
  dark: string;
  height: number;
  length: number;
  bulk: number;
  ears: "round" | "point" | "none";
  tail: "long" | "short" | "none";
}

export const ANIMALS: Record<AnimalId, Animal> = {
  LION: { id: "LION", glyph: "🦁", trait: "DOMINANT", body: "#b9884a", dark: "#6b4a22", height: 1, length: 1.05, bulk: 1.05, ears: "round", tail: "long" },
  TIGER: { id: "TIGER", glyph: "🐅", trait: "AGGRESSION", body: "#c07a30", dark: "#3a2412", height: 0.95, length: 1.15, bulk: 1, ears: "round", tail: "long" },
  PANTHER: { id: "PANTHER", glyph: "🐆", trait: "SPEED", body: "#2b2b33", dark: "#14141a", height: 0.92, length: 1.2, bulk: 0.85, ears: "round", tail: "long" },
  WOLF: { id: "WOLF", glyph: "🐺", trait: "PACK", body: "#77797f", dark: "#3d3f45", height: 0.9, length: 1.05, bulk: 0.85, ears: "point", tail: "long" },
  BEAR: { id: "BEAR", glyph: "🐻", trait: "FORCE", body: "#6b4b34", dark: "#33221a", height: 1.05, length: 1, bulk: 1.35, ears: "round", tail: "short" },
  GORILLA: { id: "GORILLA", glyph: "🦍", trait: "POWER", body: "#33343a", dark: "#191a1f", height: 1.05, length: 0.85, bulk: 1.3, ears: "round", tail: "none" },
  EAGLE: { id: "EAGLE", glyph: "🦅", trait: "VISION", body: "#8a6a3c", dark: "#e8dcc0", height: 0.7, length: 0.7, bulk: 0.7, ears: "none", tail: "short" },
  SNAKE: { id: "SNAKE", glyph: "🐍", trait: "STEALTH", body: "#4e7a3a", dark: "#22331c", height: 0.35, length: 1.5, bulk: 0.55, ears: "none", tail: "long" },
  CROCODILE: { id: "CROCODILE", glyph: "🐊", trait: "PATIENCE", body: "#43563a", dark: "#222b1d", height: 0.45, length: 1.6, bulk: 0.95, ears: "none", tail: "long" },
  JAGUAR: { id: "JAGUAR", glyph: "🐆", trait: "AMBUSH", body: "#c9a35a", dark: "#3a2a14", height: 0.9, length: 1.15, bulk: 0.95, ears: "round", tail: "long" },
  HYENA: { id: "HYENA", glyph: "🐕", trait: "ENDURANCE", body: "#9a8358", dark: "#4a3d26", height: 0.85, length: 1, bulk: 0.9, ears: "point", tail: "short" },
  BOAR: { id: "BOAR", glyph: "🐗", trait: "RAGE", body: "#4a3b33", dark: "#241c18", height: 0.75, length: 1, bulk: 1.15, ears: "point", tail: "short" },
};

ANIMALS.JAGUAR.body = "#c9a35a";

export const ANIMAL_IDS = Object.keys(ANIMALS) as AnimalId[];

/** Deterministic: a farmer id always maps to the same predator. */
export function animalForFarmer(farmerId: number): Animal {
  const i = Math.min(
    ANIMAL_IDS.length - 1,
    Math.floor(hash(`animal:${farmerId}`) * ANIMAL_IDS.length),
  );
  return ANIMALS[ANIMAL_IDS[i] as AnimalId];
}
