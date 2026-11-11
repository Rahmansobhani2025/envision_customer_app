import { supabase } from "./supabase";
import { DEMO_SHOP_ID, PublicShop } from "./shop";
import { DEMO_INVENTORY, DEMO_MEDIA } from "../data/demoInventory";

export interface ShopInventory { items: any[]; media: any[]; }
const cache = new Map<string, Promise<ShopInventory>>();

/** Loads ONLY this shop's frames (embedding vectors are stripped server-side). */
export function loadShopInventory(shop: PublicShop, force = false): Promise<ShopInventory> {
  if (shop.id === DEMO_SHOP_ID) return Promise.resolve({ items: DEMO_INVENTORY, media: DEMO_MEDIA });
  if (!force && cache.has(shop.id)) return cache.get(shop.id)!;
  const p = (async () => {
    const { data, error } = await supabase.rpc("get_shop_inventory", { p_shop_id: shop.id });
    if (error) throw error;
    const rows = (data as any[]) || [];
    const items = rows.map(({ media, ...item }) => item);
    const mediaAll = rows.flatMap((r) => (r.media || []) as any[]);
    return { items, media: mediaAll };
  })();
  cache.set(shop.id, p);
  p.catch(() => cache.delete(shop.id));
  return p;
}

/** Best still image for a frame: transparent PNG cut-outs first, then primary image. Videos are skipped. */
export function pickBestMediaUrl(media: any[], inventoryId: number | string): string | null {
  const imgs = media.filter((m) => m.inventory_id === inventoryId && m.media_type !== "video" && m.media_url);
  const png = imgs.find((m) => /\.png(\?|$)/i.test(m.media_url));
  return (png || imgs.find((m) => m.is_primary) || imgs[0])?.media_url || null;
}

/**
 * Vector matching restricted to this shop (uses the match_shop_inventory SQL function).
 * Ready for when the face-analysis embedding is available; returns [{id, similarity}].
 */
export async function matchShopFramesByEmbedding(
  shop: PublicShop, embedding: number[], limit = 8, gender?: "Men" | "Women" | null
): Promise<{ id: number; similarity: number }[]> {
  const { data, error } = await supabase.rpc("match_shop_inventory", {
    p_shop_id: shop.id, p_embedding: embedding as any, p_limit: limit, p_gender: gender ?? null,
  });
  if (error) throw error;
  return (data as any[]) || [];
}
