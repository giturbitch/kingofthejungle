import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";
import { decodeEventLog, formatEther, parseEther, type Address } from "viem";
import { depotAbi, farmTokenAbi, survivorAbi, treasuryAbi } from "./abis";
import { CONTRACTS, NOT_DEPLOYED_MESSAGE } from "./addresses";
import { activeChain } from "./robinhood";
import { wagmiConfig } from "./wagmi";
import type { ForgeSpec } from "@/lib/jungle/protocol";

/* -------------------------------------------------------------------------- */
/* Wallet                                                                     */
/* -------------------------------------------------------------------------- */

export function useWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();

  const connect = useCallback(async () => {
    const connector = connectors[0];
    if (!connector) throw new Error("No browser wallet detected.");
    await connectAsync({ connector, chainId: activeChain.id });
  }, [connectAsync, connectors]);

  const ensureChain = useCallback(async () => {
    if (chainId !== activeChain.id) {
      await switchChainAsync({ chainId: activeChain.id });
    }
  }, [chainId, switchChainAsync]);

  return {
    address: address ?? null,
    isConnected,
    connecting: isPending,
    wrongChain: isConnected && chainId !== activeChain.id,
    connect,
    disconnect,
    ensureChain,
    chainName: activeChain.name,
  };
}

export function short(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/* -------------------------------------------------------------------------- */
/* Reads                                                                      */
/* -------------------------------------------------------------------------- */

export interface OwnedSurvivor {
  tokenId: number;
  name: string;
  animal: string;
  categories: string[];
  speedTier: string;
  launchpad: string;
}

async function readOwnedSurvivors(owner: Address): Promise<OwnedSurvivor[]> {
  if (!CONTRACTS.survivor) return [];
  const count = await readContract(wagmiConfig, {
    address: CONTRACTS.survivor,
    abi: survivorAbi,
    functionName: "balanceOf",
    args: [owner],
  });
  const out: OwnedSurvivor[] = [];
  for (let i = 0n; i < count; i++) {
    const tokenId = await readContract(wagmiConfig, {
      address: CONTRACTS.survivor,
      abi: survivorAbi,
      functionName: "tokenOfOwnerByIndex",
      args: [owner, i],
    });
    const t = await readContract(wagmiConfig, {
      address: CONTRACTS.survivor,
      abi: survivorAbi,
      functionName: "getTraits",
      args: [tokenId],
    });
    out.push({
      tokenId: Number(tokenId),
      name: t.name,
      animal: t.animal,
      categories: [...t.categories],
      speedTier: t.speedTier,
      launchpad: t.launchpad,
    });
  }
  return out;
}

export function useMySurvivors() {
  const { address } = useWallet();
  return useQuery({
    queryKey: ["survivors", address],
    enabled: Boolean(address && CONTRACTS.survivor),
    queryFn: () => readOwnedSurvivors(address as Address),
  });
}

export function useFarmBalance() {
  const { address } = useWallet();
  return useQuery({
    queryKey: ["farm-balance", address],
    enabled: Boolean(address && CONTRACTS.farmToken),
    refetchInterval: 30_000,
    queryFn: async () => {
      const raw = await readContract(wagmiConfig, {
        address: CONTRACTS.farmToken as Address,
        abi: farmTokenAbi,
        functionName: "balanceOf",
        args: [address as Address],
      });
      return Number(formatEther(raw));
    },
  });
}

/** Live on-chain treasury state. Null when the treasury is not deployed. */
export function useChainTreasury() {
  return useQuery({
    queryKey: ["chain-treasury"],
    enabled: Boolean(CONTRACTS.jungleTreasury),
    refetchInterval: 15_000,
    queryFn: async () => {
      const address = CONTRACTS.jungleTreasury as Address;
      const base = { address, abi: treasuryAbi } as const;
      const [epoch, pool, startedAt, endsAt, finalHunt, protocolBps, adminBps, rolloverBps] =
        await Promise.all([
          readContract(wagmiConfig, { ...base, functionName: "currentEpoch" }),
          readContract(wagmiConfig, { ...base, functionName: "currentPool" }),
          readContract(wagmiConfig, { ...base, functionName: "currentEpochStartedAt" }),
          readContract(wagmiConfig, { ...base, functionName: "currentEpochEnd" }),
          readContract(wagmiConfig, { ...base, functionName: "isFinalHunt" }),
          readContract(wagmiConfig, { ...base, functionName: "protocolBps" }),
          readContract(wagmiConfig, { ...base, functionName: "adminBps" }),
          readContract(wagmiConfig, { ...base, functionName: "rolloverBps" }),
        ]);
      return {
        epoch: Number(epoch),
        pool: Number(formatEther(pool)),
        startsAt: Number(startedAt) * 1000,
        endsAt: Number(endsAt) * 1000,
        finalHunt,
        protocolBps: Number(protocolBps),
        adminBps: Number(adminBps),
        rolloverBps: Number(rolloverBps),
      };
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Writes                                                                     */
/* -------------------------------------------------------------------------- */

export function useForgeSurvivor() {
  const { isConnected, connect, ensureChain, address } = useWallet();
  const [pending, setPending] = useState(false);

  const forge = useCallback(
    async (spec: ForgeSpec): Promise<{ tokenId: number; hash: string }> => {
      if (!CONTRACTS.survivor) throw new Error(NOT_DEPLOYED_MESSAGE);
      if (!isConnected) await connect();
      await ensureChain();

      setPending(true);
      try {
        const hash = await writeContract(wagmiConfig, {
          address: CONTRACTS.survivor,
          abi: survivorAbi,
          functionName: "forge",
          args: [
            spec.name,
            spec.animal,
            spec.categories as unknown as string[],
            spec.speedTier,
            spec.launchpad,
          ],
        });
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });

        let tokenId = -1;
        for (const log of receipt.logs) {
          try {
            const parsed = decodeEventLog({
              abi: survivorAbi,
              data: log.data,
              topics: log.topics,
            });
            if (parsed.eventName === "Forged") {
              tokenId = Number((parsed.args as { tokenId: bigint }).tokenId);
              break;
            }
          } catch {
            /* not our event */
          }
        }
        return { tokenId, hash };
      } finally {
        setPending(false);
      }
    },
    [connect, ensureChain, isConnected],
  );

  return { forge, pending, address };
}

export interface ChainItem {
  id: number;
  name: string;
  category: number;
  price: number;
  treasuryBps: number;
  cosmetic: boolean;
  utility: boolean;
  active: boolean;
}

/** Reads the on-chain Supply Depot catalog (ids 0..47). */
export function useDepotCatalog() {
  return useQuery({
    queryKey: ["depot-catalog"],
    enabled: Boolean(CONTRACTS.supplyDepot),
    queryFn: async () => {
      const address = CONTRACTS.supplyDepot as Address;
      const items: ChainItem[] = [];
      for (let id = 0; id < 48; id++) {
        const r = await readContract(wagmiConfig, {
          address,
          abi: depotAbi,
          functionName: "items",
          args: [BigInt(id)],
        });
        const [, name, category, price, treasuryBps, cosmetic, utility, active] = r;
        if (!name) break;
        items.push({
          id,
          name,
          category: Number(category),
          price: Number(formatEther(price)),
          treasuryBps: Number(treasuryBps),
          cosmetic,
          utility,
          active,
        });
      }
      return items;
    },
  });
}

export function usePurchaseOnChain() {
  const { isConnected, connect, ensureChain } = useWallet();
  const [pending, setPending] = useState<number | null>(null);

  const purchase = useCallback(
    async (survivorTokenId: number, itemId: number, priceEth: number) => {
      if (!CONTRACTS.supplyDepot) throw new Error(NOT_DEPLOYED_MESSAGE);
      if (!isConnected) await connect();
      await ensureChain();

      setPending(itemId);
      try {
        const hash = await writeContract(wagmiConfig, {
          address: CONTRACTS.supplyDepot,
          abi: depotAbi,
          functionName: "purchase",
          args: [BigInt(survivorTokenId), BigInt(itemId)],
          value: parseEther(String(priceEth)),
        });
        await waitForTransactionReceipt(wagmiConfig, { hash });
        return hash;
      } finally {
        setPending(null);
      }
    },
    [connect, ensureChain, isConnected],
  );

  return { purchase, pending };
}

/** Account summary used by the header. */
export function useJungleAccount() {
  const { address } = useWallet();
  const survivors = useMySurvivors();
  const farm = useFarmBalance();

  return useMemo(
    () => ({
      address,
      farmBalance: farm.data ?? 0,
      survivors: survivors.data ?? [],
      survivorCount: survivors.data?.length ?? 0,
    }),
    [address, farm.data, survivors.data],
  );
}
