import React, { useState } from "react";
import { X, Store, Percent, Gift, Check, Palette, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { ShopOwnerPromotionConfig } from "../types";
import { useShop } from "../context/ShopContext";

interface ShopOwnerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
  config: ShopOwnerPromotionConfig;
  onSaveConfig: (config: ShopOwnerPromotionConfig) => void;
}

export default function ShopOwnerSettingsModal({
  isOpen,
  onClose,
  isArabic,
  config,
  onSaveConfig
}: ShopOwnerSettingsModalProps) {
  const { shop } = useShop();
  const [discountPercent, setDiscountPercent] = useState<number>(config.discountPercent);
  const [promoCode, setPromoCode] = useState<string>(config.promoCode);
  const [shopNameEn, setShopNameEn] = useState<string>(config.shopNameEn || shop.name);
  const [shopNameAr, setShopNameAr] = useState<string>(config.shopNameAr || shop.name);
  const [bonusGiftEn, setBonusGiftEn] = useState<string>(config.bonusGiftEn);
  const [bonusGiftAr, setBonusGiftAr] = useState<string>(config.bonusGiftAr);
  const [voucherValidityDays, setVoucherValidityDays] = useState<number>(config.voucherValidityDays);

  // Custom Branding Fields (from shop_configs)
  const [customPrimaryColor, setCustomPrimaryColor] = useState<string>(shop.primary_color || "#0A3A6B");
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(shop.logo_url || "");
  const [customBgImageUrl, setCustomBgImageUrl] = useState<string>(shop.background_image_url || "");

  const presetDiscounts = [10, 15, 20, 25];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save promotion config
    onSaveConfig({
      discountPercent: Number(discountPercent) || 10,
      promoCode: promoCode.trim() || "OPTIC10VIP",
      shopNameEn: shopNameEn.trim(),
      shopNameAr: shopNameAr.trim(),
      bonusGiftEn: bonusGiftEn.trim(),
      bonusGiftAr: bonusGiftAr.trim(),
      voucherValidityDays: Number(voucherValidityDays) || 14
    });

    // Save custom shop_configs branding to local cache so preview updates immediately
    try {
      const customBranding = {
        primary_color: customPrimaryColor.trim() || "#0A3A6B",
        logo_url: customLogoUrl.trim() || null,
        background_image_url: customBgImageUrl.trim() || null,
        shop_name: shopNameEn.trim() || shop.name,
      };
      localStorage.setItem("envision_custom_branding", JSON.stringify(customBranding));
      // Dispatch storage event or reload so context hydrates
      window.dispatchEvent(new Event("storage"));
    } catch {}

    onClose();
    // Soft reload to apply all dynamic styles cleanly
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ direction: isArabic ? "rtl" : "ltr" }}
      >
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-800 shadow-xs"
              style={{ color: customPrimaryColor }}
            >
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                {isArabic ? "لوحة تحكم صاحب المعرض" : "BOUTIQUE OWNER BRANDING & PROMO"}
              </span>
              <h3 className="font-serif text-lg text-[#111827] font-semibold">
                {isArabic ? "إعدادات الهوية والعروض الخاصة" : "Designate Branding & In-Store Promo"}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 text-xs font-sans overflow-y-auto">
          
          {/* Custom Branding (shop_configs) */}
          <div className="space-y-4 border-b border-gray-100 pb-5">
            <h4 className="font-sans text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-600" />
              <span>{isArabic ? "تخصيص هوية المتجر (shop_configs)" : "Custom Shop Branding (shop_configs)"}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 block">
                  {isArabic ? "اللون الأساسي (Primary Color):" : "Brand Primary Color:"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customPrimaryColor}
                    onChange={(e) => setCustomPrimaryColor(e.target.value)}
                    className="w-10 h-9 p-0.5 border border-gray-300 rounded cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={customPrimaryColor}
                    onChange={(e) => setCustomPrimaryColor(e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-sans text-gray-900 focus:outline-none"
                    placeholder="#0A3A6B"
                  />
                </div>
              </div>

              {/* Shop Logo URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 block">
                  {isArabic ? "رابط الشعار (Logo URL):" : "Shop Logo URL:"}
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={customLogoUrl}
                    onChange={(e) => setCustomLogoUrl(e.target.value)}
                    placeholder="https://.../logo.png"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-sans text-gray-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Background Image URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 block flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
                <span>{isArabic ? "صورة خلفية المتجر (Background Image URL):" : "Boutique Background Image (Watermark Texture):"}</span>
              </label>
              <input
                type="url"
                value={customBgImageUrl}
                onChange={(e) => setCustomBgImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-1591076482161-42ce6da69f67..."
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-sans text-gray-900 focus:outline-none"
              />
              <span className="text-[11px] text-gray-500 block">
                {isArabic 
                  ? "تظهر كعلامة مائية فاخرة بنسبة شفافية ١٨٪ مع طبقة بيضاء بنسبة ٨٢٪ لضمان وضوح النصوص." 
                  : "Applied at 18% opacity with an 82% off-white overlay for high-contrast luxury readability."}
              </span>
            </div>
          </div>

          {/* Discount Selector */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-semibold text-gray-900 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-gray-600" />
              <span>{isArabic ? "نسبة الخصم الممنوحة للعميل عند زيارة المعرض *" : "Designated In-Store Discount (%) *"}</span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {presetDiscounts.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    setDiscountPercent(pct);
                    setPromoCode(`OPTIC${pct}VIP`);
                  }}
                  className={`py-2 rounded-xl font-sans text-xs font-bold border transition-all cursor-pointer ${
                    discountPercent === pct
                      ? "text-white shadow-xs"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                  style={discountPercent === pct ? { backgroundColor: customPrimaryColor, borderColor: customPrimaryColor } : undefined}
                >
                  {pct}% OFF
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-gray-500 text-xs">{isArabic ? "أو أدخل نسبة مخصصة:" : "Or Custom %:"}</span>
              <input
                type="number"
                min="1"
                max="90"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-20 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-900 font-sans text-center focus:outline-none text-xs"
              />
              <span className="text-gray-500">%</span>
            </div>
          </div>

          {/* Promo Code & Validity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 block">
                {isArabic ? "كود القسيمة (Voucher Code):" : "Voucher Code:"}
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-sans text-xs focus:outline-none uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 block">
                {isArabic ? "صلاحية القسيمة (أيام):" : "Voucher Validity (Days):"}
              </label>
              <input
                type="number"
                value={voucherValidityDays}
                onChange={(e) => setVoucherValidityDays(Number(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-sans text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Bonus Gift Description */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-gray-900 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-gray-600" />
              <span>{isArabic ? "المزايا والهدايا المجانية المشمولة في الزيارة:" : "Complimentary In-Store Perks:"}</span>
            </label>
            <input
              type="text"
              value={isArabic ? bonusGiftAr : bonusGiftEn}
              onChange={(e) => isArabic ? setBonusGiftAr(e.target.value) : setBonusGiftEn(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-xs focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-sans text-xs transition-colors"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white font-sans text-xs font-semibold rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              style={{ backgroundColor: customPrimaryColor }}
            >
              <Check className="w-4 h-4" />
              <span>{isArabic ? "حفظ وتطبيق التغييرات" : "Save & Apply Changes"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
