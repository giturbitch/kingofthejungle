import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  fetchAccount,
  fetchFarmers,
  fetchLaunches,
  fetchLeaderboard,
} from "@/lib/jungle/protocol";

export function useFarmers() {
  return useQuery({ queryKey: ["farmers"], queryFn: fetchFarmers });
}

export function useLeaderboard() {
  return useQuery({ queryKey: ["leaderboard"], queryFn: fetchLeaderboard });
}

export function useLaunches() {
  return useQuery({ queryKey: ["launches"], queryFn: fetchLaunches });
}

export function useAccount() {
  return useQuery({ queryKey: ["account"], queryFn: fetchAccount });
}

/** One shared 1s clock so every countdown in the UI stays in sync. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function countdown(target: number | null, now: number): string {
  if (target === null) return "—";
  const s = Math.max(0, Math.floor((target - now) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

export function timeAgo(at: number, now: number): string {
  const m = Math.max(0, Math.round((now - at) / 60000));
  if (m < 60) return `${m} MIN AGO`;
  const h = Math.floor(m / 60);
  return `${h} HR AGO`;
}
