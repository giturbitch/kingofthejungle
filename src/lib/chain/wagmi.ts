import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { activeChain, robinhood, robinhoodTestnet } from "./robinhood";

export const wagmiConfig = createConfig({
  chains: [activeChain, robinhood, robinhoodTestnet],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [robinhood.id]: http(),
    [robinhoodTestnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
