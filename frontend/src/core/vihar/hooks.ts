// React Query hooks for vihar data, with offline fallback to local storage so
// travelling users still see today's vihar and their seva.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/src/core/api/endpoints";
import { OfflineError } from "@/src/core/api/client";
import { STORAGE_KEYS } from "@/src/core/config";
import { storage } from "@/src/utils/storage";
import type { Vihar } from "@/src/shared/models";

export const qk = {
  vihars: ["vihars"] as const,
  myVihars: ["myVihars"] as const,
  vihar: (id: string) => ["vihar", id] as const,
  report: (p: string) => ["report", p] as const,
  participants: (id: string) => ["participants", id] as const,
  users: ["users"] as const,
};

export function useVihars() {
  return useQuery({
    queryKey: qk.vihars,
    queryFn: async (): Promise<Vihar[]> => {
      try {
        const data = await api.listVihars();
        storage.setItem(STORAGE_KEYS.cacheVihars, data as any);
        return data;
      } catch (e) {
        if (e instanceof OfflineError) {
          return (await storage.getItem<Vihar[]>(STORAGE_KEYS.cacheVihars, [])) ?? [];
        }
        throw e;
      }
    },
  });
}

export function useMyVihars() {
  return useQuery({
    queryKey: qk.myVihars,
    queryFn: async (): Promise<Vihar[]> => {
      try {
        const data = await api.getMyVihars();
        storage.setItem(STORAGE_KEYS.cacheMyVihars, data as any);
        return data;
      } catch (e) {
        if (e instanceof OfflineError) {
          return (await storage.getItem<Vihar[]>(STORAGE_KEYS.cacheMyVihars, [])) ?? [];
        }
        throw e;
      }
    },
  });
}

export function useVihar(id: string) {
  return useQuery({
    queryKey: qk.vihar(id),
    queryFn: async (): Promise<Vihar> => {
      const key = `vsg.cache.vihar.${id}`;
      try {
        const data = await api.getVihar(id);
        storage.setItem(key, data as any);
        return data;
      } catch (e) {
        if (e instanceof OfflineError) {
          const cached = await storage.getItem<Vihar | null>(key, null);
          if (cached) return cached as Vihar;
        }
        throw e;
      }
    },
    enabled: !!id,
  });
}

export function useParticipate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "in" | "out" }) =>
      api.participate(id, status),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: qk.vihars });
      qc.invalidateQueries({ queryKey: qk.myVihars });
      qc.invalidateQueries({ queryKey: qk.vihar(vars.id) });
      qc.invalidateQueries({ queryKey: qk.participants(vars.id) });
    },
  });
}
