import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SHOP_CATEGORIES, SHOP_ITEMS, type ShopCategory } from "@/lib/jungle/treasury";
import {
  useChainTreasury,
  useDepotCatalog,
  usePurchaseOnChain,
  type ChainItem,
  type OwnedSurvivor,
} from "@/lib/chain/useProtocol";
import { CONTRACTS, NOT_DEPLOYED_MESSAGE } from "@/lib/chain/addresses";
import { explorerTx } from "@/lib/chain/robinhood";
import { Sheet } from "./Overlays";
import { eth, pct, useTreasury } from "./useTreasury";

const CLASS_TONE: Record<string, string> = {
  COSMETIC: "text-jungle-light border-jungle-light/50",
  SIMULATION: "text-ivory border-border",
  "PROTOCOL UTILITY": "text-gold border-gold/60",
};

const CHAIN_CATEGORIES: ShopCategory[] = [
  "EQUIPMENT",
  "CAMP",
  "SURVIVAL",
  "COSMETICS",
  "PRESTIGE",
];

interface DepotItem {
  key: string;
  onChainId: number | null;
  name: string;
  category: ShopCategory;
  itemClass: string;
  price: number;
  treasuryBps: number;
  blurb: string;
  active: boolean;
}

function classify(item: ChainItem): string {
  if (item.utility) return "PROTOCOL UTILITY";
  if (item.cosmetic) return "COSMETIC";
  return "SIMULATION";
}

export function DepotOverlay({
  connected,
  survivors,
  onClose,
  onOpenTreasury,
}: {
  connected: boolean;
  survivors: OwnedSurvivor[];
  onClose: () => void;
  onOpenTreasury: () => void;
}) {
  const [tab, setTab] = useState<ShopCategory>("EQUIPMENT");
  const [survivorId, setSurvivorId] = useState<number | null>(null);

  const simulated = useTreasury();
  const chain = useChainTreasury();
  const catalog = useDepotCatalog();
  const { purchase, pending } = usePurchaseOnChain();

  const pool = chain.data?.pool ?? simulated.data?.pool ?? 0;
  const live = Boolean(CONTRACTS.supplyDepot);
  const activeSurvivor =
    survivorId ?? (survivors.length > 0 ? survivors[0]!.tokenId : null);

  const items: DepotItem[] = useMemo(() => {
    if (live && catalog.data) {
      return catalog.data.map((i) => ({
        key: `chain-${i.id}`,
        onChainId: i.id,
        name: i.name.toUpperCase(),
        category: CHAIN_CATEGORIES[i.category] ?? "EQUIPMENT",
        itemClass: classify(i),
        price: i.price,
        treasuryBps: i.treasuryBps,
        blurb:
          SHOP_ITEMS.find(
            (s) => s.name.toUpperCase() === i.name.toUpperCase(),
          )?.blurb ?? "",
        active: i.active,
      }));
    }
    return SHOP_ITEMS.map((s) => ({
      key: s.id,
      onChainId: null,
      name: s.name,
      category: s.category,
      itemClass: s.itemClass,
      price: s.price,
      treasuryBps: s.treasuryBps,
      blurb: s.blurb,
      active: false,
    }));
  }, [catalog.data, live]);

  const shown = items.filter((i) => i.category === tab);
  const note = SHOP_CATEGORIES.find((c) => c.id === tab)?.note;

  const buy = async (item: DepotItem) => {
    if (item.onChainId === null) {
      toast.error("Purchase unavailable", { description: NOT_DEPLOYED_MESSAGE });
      return;
    }
    if (activeSurvivor === null) {
      toast.error("No survivor", {
        description: "Mint a survivor in the Forge before buying equipment.",
      });
      return;
    }
    try {
      const hash = await purchase(activeSurvivor, item.onChainId, item.price);
      toast.success(`UPGRADE ACQUIRED — ${item.name}`, {
        description: `Treasury contribution +${((item.price * item.treasuryBps) / 10_000).toFixed(4)} ETH`,
        action: {
          label: "Explorer",
          onClick: () => window.open(explorerTx(hash), "_blank"),
        },
      });
      void chain.refetch();
    } catch (e) {
      toast.error("Purchase not completed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  };

  return (
    <Sheet
      title="Supply Depot"
      subtitle={connected ? "OUTFIT YOUR SURVIVOR" : "WALLET NOT CONNECTED"}
      onClose={onClose}
    >
      <button
        onClick={onOpenTreasury}
        className="mb-6 flex w-full flex-wrap items-center gap-x-4 gap-y-1 border border-gold/40 bg-gold/5 p-4 text-left hover:border-gold"
      >
        <span className="label-eyebrow">Today&apos;s Jungle Treasury</span>
        <span className="display-xl text-xl text-gold">{eth(pool)}</span>
        <span className="font-mono text-[0.65rem] tracking-widest text-muted-foreground">
          EVERY ELIGIBLE PURCHASE ROUTES A CONFIGURED SHARE INTO TODAY&apos;S PRIZE
          TREASURY
        </span>
      </button>

      {/* survivor selector — purchases are attached to a survivor on-chain */}
      <div className="mb-6 border border-border bg-card/50 p-4">
        <p className="label-eyebrow">Equipping</p>
        {survivors.length === 0 ? (
          <p className="mt-2 font-mono text-[0.7rem] text-muted-foreground">
            {connected
              ? "NO SURVIVOR IN THIS WALLET — MINT ONE IN THE FORGE FIRST."
              : "CONNECT YOUR WALLET TO SEE YOUR SURVIVORS."}
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {survivors.map((s) => (
              <button
                key={s.tokenId}
                onClick={() => setSurvivorId(s.tokenId)}
                className={`border px-3 py-2 font-mono text-[0.65rem] tracking-[0.16em] transition-colors ${
                  activeSurvivor === s.tokenId
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:text-ivory"
                }`}
              >
                #{s.tokenId} {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {!live && (
        <p className="mb-6 border border-destructive/40 bg-destructive/5 p-3 font-mono text-[0.65rem] leading-relaxed tracking-widest text-destructive uppercase">
          {NOT_DEPLOYED_MESSAGE}
        </p>
      )}

      <div className="mb-3 flex flex-wrap gap-x-6 gap-y-2">
        {SHOP_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setTab(c.id)}
            className={`font-mono text-[0.7rem] tracking-[0.22em] uppercase transition-colors ${
              tab === c.id ? "text-gold" : "text-muted-foreground hover:text-ivory"
            }`}
          >
            {c.id}
          </button>
        ))}
      </div>
      <p className="mb-6 font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase">
        {note}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {shown.map((item) => (
          <div key={item.key} className="border border-border bg-card/60 p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="display-xl text-base text-ivory">{item.name}</p>
              <span
                className={`shrink-0 border px-2 py-1 font-mono text-[0.55rem] tracking-[0.16em] ${
                  CLASS_TONE[item.itemClass]
                }`}
              >
                {item.itemClass}
              </span>
            </div>
            {item.blurb && (
              <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
                {item.blurb}
              </p>
            )}
            <dl className="mt-4 space-y-1 font-mono text-[0.65rem]">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">PRICE</dt>
                <dd className="text-ivory">{item.price.toFixed(3)} ETH</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">TO TREASURY</dt>
                <dd className="text-gold">
                  {pct(item.treasuryBps)} ·{" "}
                  {((item.price * item.treasuryBps) / 10_000).toFixed(4)} ETH
                </dd>
              </div>
            </dl>
            <button
              onClick={() => void buy(item)}
              disabled={pending === item.onChainId || !live || item.active === false}
              className="mt-4 w-full border border-gold/50 py-2 font-mono text-[0.65rem] tracking-[0.24em] text-gold uppercase transition-colors hover:bg-gold hover:text-primary-foreground disabled:opacity-50"
            >
              {pending === item.onChainId ? "Confirming…" : "Acquire"}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-8 font-mono text-[0.65rem] leading-relaxed tracking-widest text-muted-foreground uppercase">
        Cosmetic items change appearance only. Simulation items affect your survivor&apos;s
        camp and progression. Protocol utility items change on-chain behaviour. Purchases
        are not investments and carry no promise of reward.
      </p>
    </Sheet>
  );
}
