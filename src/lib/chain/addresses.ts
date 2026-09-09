import { isAddress, type Address } from "viem";

function addr(key: string): Address | null {
  const v = import.meta.env[key] as string | undefined;
  return v && isAddress(v) ? (v as Address) : null;
}

export const CONTRACTS = {
  survivor: addr("VITE_SURVIVOR"),
  farmToken: addr("VITE_FARM_TOKEN"),
  jungleEngine: addr("VITE_JUNGLE_ENGINE"),
  jungleTreasury: addr("VITE_JUNGLE_TREASURY"),
  supplyDepot: addr("VITE_SUPPLY_DEPOT"),
  launchpadRouter: addr("VITE_LAUNCHPAD_ROUTER"),
} as const;

/** Protocol owner / deployer wallet for this deployment. */
export const PROTOCOL_OWNER: Address =
  "0x10f8B20954D991b30D02361b139a6463488127f1";

export const isDeployed = Boolean(
  CONTRACTS.survivor && CONTRACTS.supplyDepot && CONTRACTS.jungleTreasury,
);

export const NOT_DEPLOYED_MESSAGE =
  "Protocol contracts are not deployed yet. Add the deployed addresses to the project environment to enable live minting and purchases.";
