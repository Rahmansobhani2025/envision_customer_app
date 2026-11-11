import { supabase, isSupabaseConfigured } from "./supabase";

const env = (import.meta as any).env || {};

/** Base domain used for subdomain links, e.g. https://al-noor.envisioneyewear.store */
export const BASE_DOMAIN: string = String(env.VITE_BASE_DOMAIN || "envisioneyewear.store").toLowerCase();
const STORAGE_KEY = "envision_shop_slug";
export const DEMO_SHOP_ID = "demo";
/** The sample showroom is only available in local previews, or when VITE_ENABLE_DEMO="true". Never on a live domain by default. */
export const DEMO_ENABLED: boolean = !isSupabaseConfigured || String(env.VITE_ENABLE_DEMO || "").toLowerCase() === "true";

export type ShopStatus = "active" | "on_hold" | "suspended" | "maintenance" | string;

export interface PublicShop {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  phone: string | null;
  tier: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  background_image_url: string | null;
  country_code?: string | null;
  currency_code: string | null;
  currency_symbol: string | null;
  config: Record<string, any>;
  status: ShopStatus;
  has_face_analysis: boolean;
  has_vto_image: boolean;
  has_vto_video: boolean;
}

export const DEMO_SHOP: PublicShop = {
  id: DEMO_SHOP_ID,
  slug: "demo",
  name: "Alfa Optical",
  location: "Riyadh, Saudi Arabia",
  phone: "+966 11 456 7890",
  tier: "platinum",
  logo_url: null,
  primary_color: "#0A3A6B",
  secondary_color: "#082d54",
  background_image_url: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=2000&q=80",
  country_code: "SA",
  currency_code: null,
  currency_symbol: null,
  config: {
    physical_address: "Olaya Towers, King Fahd Rd",
    primary_phone: "+966 11 456 7890",
    operating_hours: "Sat - Thu: 9:30 AM – 10:30 PM | Fri: 4:00 PM – 11:00 PM",
  },
  status: "active",
  has_face_analysis: true,
  has_vto_image: true,
  has_vto_video: true,
};

const cleanSlug = (s: string | null | undefined): string | null => {
  const v = String(s || "").toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
  return v.length > 0 && v.length <= 63 ? v : null;
};

export function extractSlugFromInput(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.includes("?") || trimmed.includes("/")) {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      const param = url.searchParams.get("shop");
      if (param) return cleanSlug(param);
      const host = url.hostname.toLowerCase();
      if (host.endsWith("." + BASE_DOMAIN)) {
        const sub = host.slice(0, -(BASE_DOMAIN.length + 1)).split(".")[0];
        if (sub && sub !== "www" && sub !== "app") return cleanSlug(sub);
      }
    }
  } catch {
    // fall back to cleanSlug
  }
  return cleanSlug(trimmed);
}

/**
 * Which shop is this visitor on?
 * 1) ?shop=slug   2) {slug}.BASE_DOMAIN   3) remembered slug (survives signup / email-confirm redirects)
 * 4) VITE_DEFAULT_SHOP_SLUG (development only)
 * 5) "demo" only when the sample showroom is enabled (see DEMO_ENABLED)
 */
export function resolveShopSlug(): string | null {
  try {
    const fromQuery = cleanSlug(new URLSearchParams(window.location.search).get("shop"));
    if (fromQuery) { remember(fromQuery); return fromQuery; }

    const host = window.location.hostname.toLowerCase();
    if (host.endsWith("." + BASE_DOMAIN)) {
      const sub = cleanSlug(host.slice(0, -(BASE_DOMAIN.length + 1)).split(".")[0]);
      if (sub && sub !== "www" && sub !== "app") { remember(sub); return sub; }
    }

    const stored = cleanSlug(localStorage.getItem(STORAGE_KEY));
    if (stored) return stored;
  } catch { /* storage may be blocked */ }
  return cleanSlug(env.VITE_DEFAULT_SHOP_SLUG) || (DEMO_ENABLED ? "demo" : null);
}

export function remember(slug: string) {
  try { localStorage.setItem(STORAGE_KEY, slug); } catch { /* ignore */ }
}

export function forget() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export function applyShopConfigToShop(shop: PublicShop, configRow: any): PublicShop {
  if (!configRow) return shop;
  const updated: PublicShop = { ...shop };
  if (configRow.logo_url !== undefined && configRow.logo_url !== null) updated.logo_url = configRow.logo_url;
  if (configRow.primary_color) updated.primary_color = configRow.primary_color;
  if (configRow.secondary_color) updated.secondary_color = configRow.secondary_color;
  if (configRow.background_image_url !== undefined && configRow.background_image_url !== null) {
    updated.background_image_url = configRow.background_image_url;
  }
  if (configRow.shop_name || configRow.name) updated.name = configRow.shop_name || configRow.name;
  if (configRow.config && typeof configRow.config === "object") {
    updated.config = { ...updated.config, ...configRow.config };
    if (!updated.background_image_url && configRow.config.background_image_url) {
      updated.background_image_url = configRow.config.background_image_url;
    }
    if (!updated.logo_url && configRow.config.logo_url) {
      updated.logo_url = configRow.config.logo_url;
    }
    if (!updated.primary_color && configRow.config.primary_color) {
      updated.primary_color = configRow.config.primary_color;
    }
    if (!updated.secondary_color && configRow.config.secondary_color) {
      updated.secondary_color = configRow.config.secondary_color;
    }
  }
  return updated;
}

export function getDemoShopWithCustomBranding(): PublicShop {
  const shop = { ...DEMO_SHOP };
  try {
    const stored = localStorage.getItem("envision_custom_branding");
    if (stored) {
      const parsed = JSON.parse(stored);
      return applyShopConfigToShop(shop, parsed);
    }
  } catch {}
  return shop;
}

export async function fetchPublicShop(slug: string): Promise<PublicShop | null> {
  const isDemoRequest = slug === "demo" || slug === DEMO_SHOP_ID;
  if (isDemoRequest) return DEMO_ENABLED ? getDemoShopWithCustomBranding() : null;
  if (!isSupabaseConfigured) return null;

  // One narrow, safe database function. It returns only storefront-safe fields
  // (no owner e-mail, no billing). No direct table reads from the browser.
  const { data, error } = await supabase.rpc("get_public_shop", { p_slug: slug });
  if (error) throw error;
  return (data as PublicShop) || null;
}

/** Attach the signed-in customer to this shop (once). Returns whether the account belongs to this shop. */
export async function claimShopForCurrentUser(shop: PublicShop): Promise<boolean> {
  if (!isSupabaseConfigured || shop.id === DEMO_SHOP_ID) return true;
  const { data, error } = await supabase.rpc("claim_customer_shop", { p_slug: shop.slug });
  if (error) { console.warn("claim_customer_shop notice:", error.message); return true; }
  const res = data as { shop_id?: string | null; matches?: boolean } | null;
  return res?.matches !== false;
}

/* ---------- colour helpers: keep the brand colour readable on the light UI ---------- */
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const toRgb = (hex: string): [number, number, number] => {
  let h = hex.slice(1);
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
};
const toHex = (rgb: number[]) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export const DEFAULT_ACCENT = "#0A3A6B";
/**
 * The shop's primary colour (or secondary, or the default), darkened only as much as needed so that
 * it stays readable as text on white AND white text stays readable on it (contrast >= 4.5:1).
 */
export function pickAccent(shop: Pick<PublicShop, "primary_color" | "secondary_color">): string {
  const base = [shop.primary_color, shop.secondary_color]
    .map((c) => (c || "").trim())
    .find((c) => HEX.test(c)) || DEFAULT_ACCENT;
  let rgb = toRgb(base);
  for (let i = 0; i < 20 && luminance(toHex(rgb)) > 0.18; i++) rgb = rgb.map((v) => v * 0.9) as [number, number, number];
  return toHex(rgb);
}

/* ---------- address line: "Street, City, Country" ---------- */
export function formatShopAddress(shop: PublicShop, isArabic = false): string {
  const c = shop.config || {};
  const pick = (en: any, ar: any) => String((isArabic && ar) || en || "").trim();
  let country = pick(c.country, c.country_ar);
  const code = (shop.country_code || "").trim().toUpperCase();
  if (!country && /^[A-Z]{2}$/.test(code)) {
    try { country = new Intl.DisplayNames([isArabic ? "ar" : "en"], { type: "region" }).of(code) || ""; } catch { /* ignore */ }
  }
  const parts = [
    pick(c.physical_address || c.address, c.address_ar),
    pick(c.city || shop.location, c.city_ar),
    country,
  ].filter(Boolean);
  // drop repeats / parts already contained in the previous one (e.g. location already says the country)
  const out: string[] = [];
  for (const part of parts) {
    const low = part.toLowerCase();
    if (!out.some((o) => o.toLowerCase().includes(low))) out.push(part);
  }
  return out.join(", ");
}
