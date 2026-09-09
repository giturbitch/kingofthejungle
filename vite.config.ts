// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// The dev source-tagging plugin injects `data-tsd-source` props into every JSX
// element. react-three-fiber tries to apply unknown props onto three.js objects
// and throws for these, blanking the 3D canvas. Strip them from 3D scene files.
const stripR3FSourceTags = {
  name: "strip-r3f-source-tags",
  enforce: "post" as const,
  apply: "serve" as const,
  transform(code: string, id: string) {
    if (!/src\/components\/jungle\//.test(id)) return null;
    if (!code.includes("data-tsd-source")) return null;
    return {
      code: code.replace(/"data-tsd-source":\s*"[^"]*",?\s*/g, ""),
      map: null,
    };
  },
};

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [stripR3FSourceTags],
  },
});

