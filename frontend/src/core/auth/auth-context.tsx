// Auth state: token + user, persisted (token in secure store, user in KV).
// Provides login/register/logout and exposes the token to the api client.

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import * as api from "@/src/core/api/endpoints";
import { setTokenGetter } from "@/src/core/api/client";
import { STORAGE_KEYS } from "@/src/core/config";
import { storage } from "@/src/utils/storage";
import type { User } from "@/src/shared/models";

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (phone: string, password: string) => Promise<void>;
  signUp: (payload: Parameters<typeof api.register>[0]) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: User) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep the api client's token in sync.
  useEffect(() => {
    setTokenGetter(() => token);
  }, [token]);

  // Restore session on launch.
  useEffect(() => {
    (async () => {
      const savedToken = await storage.secureGet(STORAGE_KEYS.token, "");
      const savedUser = await storage.getItem<User | null>(STORAGE_KEYS.user, null);
      if (savedToken) setToken(savedToken);
      if (savedUser) setUserState(savedUser as User);
      setLoading(false);
    })();
  }, []);

  const persist = async (t: string, u: User) => {
    setToken(t);
    setUserState(u);
    await storage.secureSet(STORAGE_KEYS.token, t);
    await storage.setItem(STORAGE_KEYS.user, u as any);
  };

  const signIn = async (phone: string, password: string) => {
    const res = await api.login(phone, password);
    await persist(res.access_token, res.user);
  };

  const signUp = async (payload: Parameters<typeof api.register>[0]) => {
    const res = await api.register(payload);
    await persist(res.access_token, res.user);
  };

  const signOut = async () => {
    setToken(null);
    setUserState(null);
    await storage.secureRemove(STORAGE_KEYS.token);
    await storage.removeItem(STORAGE_KEYS.user);
  };

  const refreshUser = async () => {
    try {
      const me = await api.getMe();
      setUserState(me);
      await storage.setItem(STORAGE_KEYS.user, me as any);
    } catch {
      // keep cached user if offline / transient error
    }
  };

  const setUser = (u: User) => {
    setUserState(u);
    storage.setItem(STORAGE_KEYS.user, u as any);
  };

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      loading,
      isAdmin: user?.role === "admin",
      signIn,
      signUp,
      signOut,
      refreshUser,
      setUser,
    }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
