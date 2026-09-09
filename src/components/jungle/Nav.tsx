import { toast } from "sonner";
import { short, useJungleAccount, useWallet } from "@/lib/chain/useProtocol";

export type View =
  | "jungle"
  | "forge"
  | "treasury"
  | "depot"
  | "hunt"
  | "kingdom"
  | "king";

const ITEMS: { id: View; label: string; short: string }[] = [
  { id: "jungle", label: "Jungle", short: "Jungle" },
  { id: "forge", label: "Mint", short: "Mint" },
  { id: "treasury", label: "Treasury", short: "Treasury" },
  { id: "depot", label: "Supply Depot", short: "Depot" },
  { id: "hunt", label: "The Hunt", short: "Hunt" },
  { id: "kingdom", label: "My Camp", short: "Camp" },
  { id: "king", label: "King", short: "King" },
];

export function Nav({ view, onView }: { view: View; onView: (v: View) => void }) {
  const wallet = useWallet();
  const account = useJungleAccount();
  const connected = wallet.isConnected && Boolean(wallet.address);

  const onConnect = async () => {
    try {
      await wallet.connect();
    } catch (e) {
      toast.error("Wallet not connected", {
        description:
          e instanceof Error ? e.message : "No browser wallet detected.",
      });
    }
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
      <button
        onClick={() => onView("jungle")}
        className="pointer-events-auto text-left"
      >
        <span className="display-xl block text-sm leading-tight text-ivory sm:text-base">
          King of
          <br className="sm:hidden" /> the Jungle
        </span>
      </button>

      <nav className="pointer-events-auto hidden gap-7 sm:flex">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onView(item.id)}
            className={`font-mono text-[0.7rem] tracking-[0.22em] uppercase transition-colors ${
              view === item.id ? "text-gold" : "text-muted-foreground hover:text-ivory"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="pointer-events-auto flex items-center gap-3">
        {wallet.wrongChain && (
          <button
            onClick={() => void wallet.ensureChain()}
            className="border border-destructive/60 px-3 py-2 font-mono text-[0.6rem] tracking-[0.18em] text-destructive uppercase"
          >
            Switch to {wallet.chainName}
          </button>
        )}
        {connected ? (
          <button
            onClick={() => wallet.disconnect()}
            title="Disconnect"
            className="text-right font-mono text-[0.65rem] tracking-widest text-muted-foreground hover:text-ivory"
          >
            <span className="block text-ivory">{short(wallet.address!)}</span>
            <span className="block">
              {account.farmBalance.toFixed(2)} $FARM · {account.survivorCount}{" "}
              SURVIVORS
            </span>
          </button>
        ) : (
          <button
            onClick={() => void onConnect()}
            disabled={wallet.connecting}
            className="border border-gold/50 px-4 py-2 font-mono text-[0.65rem] tracking-[0.22em] text-gold uppercase transition-colors hover:bg-gold hover:text-primary-foreground disabled:opacity-60"
          >
            {wallet.connecting ? "Connecting…" : "Connect wallet"}
          </button>
        )}
      </div>

      {/* mobile nav */}
      <nav className="pointer-events-auto fixed inset-x-0 bottom-0 flex justify-between border-t border-border bg-background/90 px-2 py-2 backdrop-blur sm:hidden">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onView(item.id)}
            className={`flex-1 px-0.5 py-2 font-mono text-[0.5rem] tracking-[0.08em] uppercase ${
              view === item.id ? "text-gold" : "text-muted-foreground"
            }`}
          >
            {item.short}
          </button>
        ))}
      </nav>
    </header>
  );
}
