import { useQuery } from "@tanstack/react-query";
import {
  fetchDistribution,
  fetchEpochHistory,
  fetchFeed,
  fetchTodaysHunt,
  fetchTreasury,
} from "@/lib/jungle/treasury";
import { useChainTreasury } from "@/lib/chain/useProtocol";

/**
 * Treasury state. When the on-chain treasury is deployed, its pool, epoch and
 * window are authoritative and override the local development values.
 */
export function useTreasury() {
  const chain = useChainTreasury();
  const query = useQuery({
    queryKey: ["treasury"],
    queryFn: fetchTreasury,
    refetchInterval: 15_000,
  });

  if (!chain.data || !query.data) return query;
  return {
    ...query,
    data: {
      ...query.data,
      epoch: chain.data.epoch,
      pool: chain.data.pool,
      startsAt: chain.data.startsAt,
      endsAt: chain.data.endsAt,
      status: chain.data.endsAt <= Date.now() ? ("VERIFYING" as const) : query.data.status,
    },
  };
}

export function useDistribution() {
  return useQuery({ queryKey: ["distribution"], queryFn: fetchDistribution });
}

export function useTodaysHunt() {
  return useQuery({
    queryKey: ["todays-hunt"],
    queryFn: fetchTodaysHunt,
    refetchInterval: 20_000,
  });
}

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: fetchFeed,
    refetchInterval: 30_000,
  });
}

export function useEpochHistory() {
  return useQuery({ queryKey: ["epoch-history"], queryFn: fetchEpochHistory });
}

export function usd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

export function eth(n: number, digits = 2): string {
  return `${n.toFixed(digits)} ETH`;
}

export function pct(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 1)}%`;
}
