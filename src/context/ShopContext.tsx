import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { isSupabaseConfigured } from "../lib/supabase";
import { 
  DEMO_SHOP, 
  DEMO_SHOP_ID, 
  DEMO_ENABLED,
  PublicShop, 
  fetchPublicShop, 
  pickAccent, 
  resolveShopSlug, 
  remember, 
  forget, 
  extractSlugFromInput,
  getDemoShopWithCustomBranding
} from "../lib/shop";

export type Phase = "loading" | "ready" | "no_slug" | "not_found" | "error";

export interface Ctx {
  phase: Phase;
  shop: PublicShop;
  accent: string;
  isDemo: boolean;
  activeSlug: string;
  loadError?: string | null;
  switchShop: (slugOrUrl: string) => Promise<boolean>;
  resetToDemo: () => void;
}

const ShopCtx = createContext<Ctx>({
  phase: "ready",
  shop: DEMO_SHOP,
  accent: pickAccent(DEMO_SHOP),
  isDemo: true,
  activeSlug: "demo",
  loadError: null,
  switchShop: async () => false,
  resetToDemo: () => {},
});

export const useShop = () => useContext(ShopCtx);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [shop, setShop] = useState<PublicShop>(DEMO_SHOP);
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [activeSlug, setActiveSlug] = useState<string>("demo");
  const [loadError, setLoadError] = useState<string | null>(null);

  const applyShop = useCallback((loadedShop: PublicShop, demo: boolean, slugVal: string) => {
    setShop(loadedShop);
    setIsDemo(demo);
    setActiveSlug(slugVal);
    setPhase("ready");
    setLoadError(null);
  }, []);

  const loadSlug = useCallback(async (slugToLoad: string): Promise<boolean> => {
    if (!slugToLoad) {
      setPhase("no_slug");
      return false;
    }
    const targetSlug = slugToLoad;

    if (targetSlug === "demo" || targetSlug === DEMO_SHOP_ID || !isSupabaseConfigured) {
      if (!DEMO_ENABLED) {
        setPhase("not_found");
        setLoadError(`Shop "${targetSlug}" was not found.`);
        return false;
      }
      applyShop(getDemoShopWithCustomBranding(), true, "demo");
      return true;
    }

    setPhase("loading");
    setLoadError(null);
    try {
      const fetched = await fetchPublicShop(targetSlug);
      if (!fetched) {
        setPhase("not_found");
        setLoadError(`Shop "${targetSlug}" was not found.`);
        return false;
      }
      applyShop(fetched, false, targetSlug);
      remember(targetSlug);
      return true;
    } catch (err: any) {
      console.warn("Shop lookup failed:", err);
      setPhase("error");
      setLoadError(err?.message || "Failed to connect to optical shop");
      return false;
    }
  }, [applyShop]);

  useEffect(() => {
    const slug = resolveShopSlug();
    loadSlug(slug);
  }, [loadSlug]);

  const switchShop = useCallback(async (slugOrUrl: string): Promise<boolean> => {
    const extracted = extractSlugFromInput(slugOrUrl);
    if (!extracted) {
      setLoadError("Please enter a valid optical shop name or link.");
      return false;
    }
    const success = await loadSlug(extracted);
    if (success) {
      try {
        const url = new URL(window.location.href);
        if (extracted === "demo") {
          url.searchParams.delete("shop");
        } else {
          url.searchParams.set("shop", extracted);
        }
        window.history.replaceState({}, "", url.toString());
      } catch {}
    }
    return success;
  }, [loadSlug]);

  const resetToDemo = useCallback(() => {
    if (!DEMO_ENABLED) return;
    forget();
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("shop");
      window.history.replaceState({}, "", url.toString());
    } catch {}
    applyShop(getDemoShopWithCustomBranding(), true, "demo");
  }, [applyShop]);

  const accent = pickAccent(shop);

  // Theme + browser tab title follow the shop
  useEffect(() => {
    document.documentElement.style.setProperty("--color-brand-gold", accent);
    document.documentElement.style.setProperty("--brand-primary", accent);
    if (phase === "ready") {
      document.title = `${shop.name} — Find Your Perfect Glasses`;
    }
  }, [accent, phase, shop.name]);

  const contextValue: Ctx = {
    phase,
    shop,
    accent,
    isDemo,
    activeSlug,
    loadError,
    switchShop,
    resetToDemo,
  };

  return <ShopCtx.Provider value={contextValue}>{children}</ShopCtx.Provider>;
}
