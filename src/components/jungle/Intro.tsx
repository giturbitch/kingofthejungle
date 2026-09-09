import { useEffect, useState } from "react";

/**
 * Opening sequence: dark screen, fog, drifting leaves, distant silhouettes,
 * a pair of eyes. Purely CSS/DOM so it never delays the jungle behind it.
 */
export function Intro({ onEnter }: { onEnter: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 420),
      setTimeout(() => setStage(2), 1500),
      setTimeout(() => setStage(3), 2500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-background">
      {/* fog layers */}
      <div className="animate-fog pointer-events-none absolute -inset-x-1/4 inset-y-0 opacity-40 [background:radial-gradient(ellipse_at_60%_70%,color-mix(in_oklab,var(--jungle)_40%,transparent),transparent_60%)]" />
      <div className="animate-fog pointer-events-none absolute -inset-x-1/3 bottom-0 h-2/3 opacity-30 [animation-duration:38s] [background:radial-gradient(ellipse_at_30%_100%,color-mix(in_oklab,var(--jungle-light)_28%,transparent),transparent_65%)]" />

      {/* distant silhouettes */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-70">
        <svg viewBox="0 0 1200 400" className="h-full w-full" preserveAspectRatio="none">
          <path
            d="M0 400 L0 250 Q120 150 200 240 Q280 120 380 250 Q470 170 560 260 Q660 130 760 250 Q860 160 960 250 Q1080 170 1200 240 L1200 400 Z"
            fill="oklch(0.19 0.02 152)"
          />
          <path
            d="M0 400 L0 320 Q160 260 300 330 Q460 250 640 330 Q820 260 1000 330 Q1120 300 1200 330 L1200 400 Z"
            fill="oklch(0.14 0.015 152)"
          />
        </svg>
      </div>

      {/* swaying leaves */}
      {[12, 32, 58, 74, 88].map((left, i) => (
        <div
          key={left}
          className="animate-leaf pointer-events-none absolute top-0 h-40 w-40 opacity-25"
          style={{
            left: `${left}%`,
            animationDelay: `${i * 1.4}s`,
            animationDuration: `${10 + i * 2}s`,
          }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <path
              d="M50 0 C20 30 10 60 50 100 C90 60 80 30 50 0 Z"
              fill="oklch(0.3 0.06 150)"
            />
          </svg>
        </div>
      ))}

      {/* content column — scrolls when the viewport is short */}
      <div className="relative z-10 flex min-h-full flex-col items-center justify-center px-6 py-20 text-center">
        {/* eyes */}
        <div
          className="mb-14 flex gap-10 transition-opacity duration-1000"
          style={{ opacity: stage >= 1 && stage < 3 ? 1 : stage >= 3 ? 0.25 : 0 }}
        >
          {[0, 1].map((i) => (
            <span
              key={i}
              className="animate-eye block h-3 w-8 rounded-full bg-gold"
              style={{
                boxShadow: "0 0 24px 8px color-mix(in oklab, var(--gold) 45%, transparent)",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* headline */}
        <div
          className="w-full transition-all duration-1000"
          style={{
            opacity: stage >= 2 ? 1 : 0,
            transform: `translateY(${stage >= 2 ? "0" : "24px"})`,
          }}
        >
        <p className="label-eyebrow mb-6">FARMING AGENTS PROTOCOL</p>
        <h1 className="display-xl text-4xl text-ivory sm:text-6xl lg:text-7xl">
          You send one man
          <br />
          into the
          <br />
          <span className="text-gold">jungle.</span>
        </h1>
        <div className="gold-rule mx-auto my-8 w-40" />
        <p className="font-mono text-[0.7rem] leading-relaxed tracking-[0.2em] text-muted-foreground uppercase">
          He starts with almost nothing.
          <br />
          He builds. He hunts. He launches. He upgrades.
          <br />
          Every 24 hours, one survivor rules the jungle.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={onEnter}
            className="group relative border border-gold/60 bg-gold/10 px-10 py-4 font-mono text-xs tracking-[0.28em] text-gold uppercase transition-colors hover:bg-gold hover:text-primary-foreground"
          >
            Mint a survivor
          </button>
          <button
            onClick={onEnter}
            className="px-6 py-4 font-mono text-xs tracking-[0.28em] text-muted-foreground uppercase transition-colors hover:text-ivory"
          >
            Enter the jungle
          </button>
        </div>
        </div>
      </div>

      <div className="vignette pointer-events-none absolute inset-0" />
    </div>
  );
}
