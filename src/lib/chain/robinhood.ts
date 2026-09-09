import { defineChain } from "viem";

/** Robinhood Chain (Ethereum-compatible L2, ETH gas). */
export const robinhood = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://robinhoodchain.blockscout.com",
    },
  },
});

export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.testnet.chain.robinhood.com",
    },
  },
  testnet: true,
});

const target = import.meta.env["VITE_CHAIN"] as string | undefined;

/** The chain the frontend transacts on. Defaults to testnet until mainnet is live. */
export const activeChain = target === "mainnet" ? robinhood : robinhoodTestnet;

export function explorerTx(hash: string): string {
  return `${activeChain.blockExplorers.default.url}/tx/${hash}`;
}
