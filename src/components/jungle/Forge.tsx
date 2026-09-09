import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ANIMALS, ANIMAL_IDS, type AnimalId } from "@/lib/jungle/animals";
import {
  CATEGORIES,
  FORGE_RULES,
  LAUNCHPADS,
  SPEED_TIERS,
  type Category,
  type SpeedTier,
} from "@/lib/jungle/protocol";
import { useForgeSurvivor } from "@/lib/chain/useProtocol";
import { explorerTx } from "@/lib/chain/robinhood";
import { Sheet } from "./Overlays";

type StepId = "name" | "predator" | "territories" | "speed" | "launchpad" | "forge";

const STEPS: { id: StepId; n: string; short: string; title: string; note: string }[] = [
  { id: "name", short: "Name", n: "01", title: "Name your farmer", note: "Permanent. Choose wisely." },
  { id: "predator", short: "Predator", n: "02", title: "Choose your predator", note: "Your animal identity in the jungle." },
  { id: "territories", short: "Territories", n: "03", title: "Choose your territories", note: "The categories you hunt in." },
  { id: "speed", short: "Speed", n: "04", title: "Choose your speed", note: "Cooldown tier of every hunt." },
  { id: "launchpad", short: "Launchpad", n: "05", title: "Choose your launchpad", note: "Robinhood chain — where the harvest is launched." },
  { id: "forge", short: "Forge", n: "06", title: "Forge farmer", note: "The birth of a new predator." },
];

export function ForgeOverlay({
  onClose,
  connected,
}: {
  onClose: () => void;
  connected: boolean;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [animal, setAnimal] = useState<AnimalId | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [speed, setSpeed] = useState<SpeedTier | null>(null);
  const [launchpad, setLaunchpad] = useState<string | null>(null);
  const [forging, setForging] = useState(false);
  const { forge } = useForgeSurvivor();

  const current = STEPS[step]!;
  const trimmed = name.trim();

  const nameError = useMemo(() => {
    if (!trimmed) return null;
    if (trimmed.length < FORGE_RULES.nameMin)
      return `At least ${FORGE_RULES.nameMin} characters.`;
    if (trimmed.length > FORGE_RULES.nameMax)
      return `At most ${FORGE_RULES.nameMax} characters.`;
    if (!FORGE_RULES.namePattern.test(trimmed))
      return "Letters, numbers, spaces and apostrophes only.";
    return null;
  }, [trimmed]);

  const stepValid = (() => {
    switch (current.id) {
      case "name":
        return Boolean(trimmed) && !nameError;
      case "predator":
        return Boolean(animal);
      case "territories":
        return categories.length >= FORGE_RULES.minCategories;
      case "speed":
        return Boolean(speed);
      case "launchpad":
        return Boolean(launchpad);
      default:
        return true;
    }
  })();

  const toggleCategory = (c: Category) => {
    setCategories((prev) => {
      if (prev.includes(c)) return prev.filter((x) => x !== c);
      if (prev.length >= FORGE_RULES.maxCategories) {
        toast(`Maximum ${FORGE_RULES.maxCategories} territories.`);
        return prev;
      }
      return [...prev, c];
    });
  };

  const submit = async () => {
    if (!animal || !speed || !launchpad) return;
    setForging(true);
    try {
      const { tokenId, hash } = await forge({
        name: trimmed.toUpperCase(),
        animal,
        categories,
        speedTier: speed,
        launchpad,
      });
      toast.success(
        tokenId >= 0 ? `Survivor #${tokenId} minted.` : "Survivor minted.",
        {
          description: "View transaction",
          action: {
            label: "Explorer",
            onClick: () => window.open(explorerTx(hash), "_blank"),
          },
        },
      );
      onClose();
    } catch (e) {
      toast.error("Mint not completed", {
        description: e instanceof Error ? e.message : "Forge failed.",
      });
    } finally {
      setForging(false);
    }
  };

  return (
    <Sheet
      title="The Forge"
      subtitle="EVERY PREDATOR IS BORN SOMEWHERE"
      onClose={onClose}
    >
      {/* step rail */}
      <ol className="mb-8 flex flex-wrap gap-x-5 gap-y-2">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              onClick={() => i <= step && setStep(i)}
              disabled={i > step}
              className={`font-mono text-[0.6rem] tracking-[0.24em] uppercase transition-colors ${
                i === step
                  ? "text-gold"
                  : i < step
                    ? "text-ivory/70 hover:text-gold"
                    : "text-muted-foreground/50"
              }`}
            >
              {s.n} {s.short}
            </button>
          </li>
        ))}
      </ol>

      <div className="border border-border bg-card/50 p-5 sm:p-7">
        <p className="label-eyebrow">
          {current.n} · Step {step + 1} of {STEPS.length}
        </p>
        <h3 className="display-xl mt-2 text-2xl text-ivory">{current.title}</h3>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{current.note}</p>

        <div className="mt-7">
          {current.id === "name" && (
            <div className="max-w-md">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && stepValid) setStep(step + 1);
                }}
                maxLength={FORGE_RULES.nameMax}
                placeholder="NIGHTFANG"
                className="w-full border-b border-border bg-transparent pb-3 font-mono text-xl tracking-[0.12em] text-ivory uppercase outline-none placeholder:text-muted-foreground/40 focus:border-gold"
              />
              <div className="mt-3 flex justify-between font-mono text-[0.65rem]">
                <span className={nameError ? "text-destructive" : "text-muted-foreground"}>
                  {nameError ?? "This name is written on-chain and cannot be changed."}
                </span>
                <span className="text-muted-foreground">
                  {trimmed.length}/{FORGE_RULES.nameMax}
                </span>
              </div>
            </div>
          )}

          {current.id === "predator" && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ANIMAL_IDS.map((id) => {
                const a = ANIMALS[id]!;
                const active = animal === id;
                return (
                  <button
                    key={id}
                    onClick={() => setAnimal(id)}
                    className={`border p-4 text-left transition-colors ${
                      active ? "border-gold bg-gold/10" : "border-border hover:border-gold/50"
                    }`}
                  >
                    <span className="text-2xl">{a.glyph}</span>
                    <p className="mt-3 font-mono text-xs tracking-[0.16em] text-ivory">{id}</p>
                    <p className="mt-1 font-mono text-[0.6rem] tracking-[0.2em] text-gold-dim">
                      {a.trait}
                    </p>
                    <span
                      className="mt-3 block h-1 w-8"
                      style={{ backgroundColor: a.body }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {current.id === "territories" && (
            <>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const active = categories.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleCategory(c)}
                      className={`border px-3 py-2 font-mono text-[0.65rem] tracking-[0.2em] transition-colors ${
                        active
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-border text-muted-foreground hover:border-gold/50 hover:text-ivory"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 font-mono text-[0.65rem] text-muted-foreground">
                {categories.length}/{FORGE_RULES.maxCategories} selected · pick at least{" "}
                {FORGE_RULES.minCategories}
              </p>
            </>
          )}

          {current.id === "speed" && (
            <div className="grid gap-3 sm:grid-cols-3">
              {SPEED_TIERS.map((t) => {
                const active = speed === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSpeed(t.id)}
                    className={`border p-5 text-left transition-colors ${
                      active ? "border-gold bg-gold/10" : "border-border hover:border-gold/50"
                    }`}
                  >
                    <p className="font-mono text-sm tracking-[0.2em] text-ivory">{t.label}</p>
                    <p className="mt-2 font-mono text-[0.65rem] leading-relaxed text-muted-foreground">
                      {t.note}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {current.id === "launchpad" && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {LAUNCHPADS.map((l) => {
                const active = launchpad === l;
                return (
                  <button
                    key={l}
                    onClick={() => setLaunchpad(l)}
                    className={`border p-5 font-mono text-xs tracking-[0.2em] transition-colors ${
                      active
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-border text-muted-foreground hover:border-gold/50 hover:text-ivory"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          )}

          {current.id === "forge" && (
            <>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{animal ? ANIMALS[animal]!.glyph : "—"}</span>
                <div>
                  <p className="display-xl text-xl text-ivory">
                    {trimmed.toUpperCase() || "UNNAMED"}
                  </p>
                  <p className="font-mono text-[0.65rem] tracking-[0.2em] text-gold-dim">
                    {animal} {animal ? `· ${ANIMALS[animal]!.trait}` : ""}
                  </p>
                </div>
              </div>
              <dl className="mt-6 divide-y divide-border border-y border-border font-mono text-xs">
                {[
                  ["TERRITORIES", categories.join(" · ") || "—"],
                  ["SPEED", speed ?? "—"],
                  ["LAUNCHPAD", launchpad ?? "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-3">
                    <dt className="text-muted-foreground tracking-[0.2em]">{k}</dt>
                    <dd className="text-right text-ivory">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 font-mono text-[0.65rem] leading-relaxed text-muted-foreground">
                Forging writes to the protocol. The name is permanent, and the
                creation rules and forge fee are enforced on-chain.
              </p>
            </>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="border border-border px-5 py-3 font-mono text-[0.65rem] tracking-[0.24em] uppercase text-muted-foreground hover:border-gold hover:text-gold"
            >
              Back
            </button>
          )}
          {current.id !== "forge" ? (
            <button
              disabled={!stepValid}
              onClick={() => setStep(step + 1)}
              className="border border-gold bg-gold/10 px-6 py-3 font-mono text-[0.65rem] tracking-[0.24em] uppercase text-gold transition-colors hover:bg-gold/20 disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted-foreground/60"
            >
              Continue
            </button>
          ) : (
            <button
              disabled={forging}
              onClick={submit}
              className="border border-gold bg-gold/10 px-6 py-3 font-mono text-[0.65rem] tracking-[0.24em] uppercase text-gold transition-colors hover:bg-gold/20 disabled:opacity-60"
            >
              {forging ? "Forging…" : connected ? "Forge farmer" : "Connect wallet to forge"}
            </button>
          )}
        </div>
      </div>
    </Sheet>
  );
}
