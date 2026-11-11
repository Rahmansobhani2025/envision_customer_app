import { StoreLocation } from "../types";
import { BOUTIQUE_LOCATIONS } from "../data/stores";
import { DEMO_SHOP_ID, PublicShop } from "./shop";

/** The shop's own branch for in-store booking (address/phone/hours come from the portal when available). */
export function getShopLocations(shop: PublicShop): StoreLocation[] {
  if (shop.id === DEMO_SHOP_ID) return BOUTIQUE_LOCATIONS;
  const c = shop.config || {};
  const address = c.physical_address || shop.location || "";
  const phone = c.primary_phone || shop.phone || "";
  const hours = c.operating_hours || "";
  return [{
    id: shop.id,
    nameEn: shop.name, nameAr: shop.name,
    cityEn: shop.location || "", cityAr: shop.location || "",
    addressEn: address, addressAr: address,
    phone, whatsapp: phone,
    hoursEn: hours, hoursAr: hours,
    mapUrl: `https://maps.google.com/?q=${encodeURIComponent(`${shop.name} ${address}`.trim())}`,
  }];
}
