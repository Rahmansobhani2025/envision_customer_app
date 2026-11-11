import React, { useState, useEffect } from "react";
import { Sparkles, Clock, ShieldCheck, MapPin, Check, Percent, Gift } from "lucide-react";
import { ShopOwnerPromotionConfig } from "../types";
import { DEFAULT_SHOP_PROMOTION } from "../data/stores";

interface FunnelPromoBannerProps {
  isArabic: boolean;
  onApplyDiscount?: () => void;
  promotionConfig?: ShopOwnerPromotionConfig;
}

export default function FunnelPromoBanner({
  isArabic,
  onApplyDiscount,
  promotionConfig = DEFAULT_SHOP_PROMOTION
}: FunnelPromoBannerProps) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({
    minutes: 24,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");
  const discount = promotionConfig.discountPercent || 10;

  return (
    <div className="bg-gradient-to-r from-[#17130b] via-[#281c0c] to-[#17130b] border-b border-brand-gold/40 text-zinc-100 py-2.5 px-4 text-xs font-sans relative overflow-hidden z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Value Proposition: In-Store VIP Experience & Discount */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-gold text-white font-bold text-[10px] shadow-[0_0_10px_color-mix(in_srgb,var(--color-brand-gold)_40%,transparent)]">
            <Percent className="w-3 h-3" />
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif font-bold text-brand-gold tracking-wide text-xs sm:text-sm">
              {isArabic 
                ? `قسيمة خصم ${discount}٪ لتجربة النظارة في المتجر + فحص بصر مجاني` 
                : `VIP In-Store Pass: Get ${discount}% OFF + Free Comprehensive Optometrist Exam`}
            </span>
            <span className="text-zinc-300 hidden md:inline text-[11.5px]">
              {isArabic 
                ? "— احجز موعد تجربة النظارة المطابقة لملامحك في أقرب فرع وسيجهزها الأخصائي لك فور وصولك" 
                : "— Reserve your AI-matched frame on a VIP fitting tray at our nearest optical boutique"}
            </span>
          </div>
        </div>

        {/* Promo Code + Countdown Timer */}
        <div className="flex items-center gap-3 flex-wrap ml-auto">
          <div className="flex items-center gap-1.5 bg-black/60 border border-brand-gold/50 px-2.5 py-1 rounded">
            <Gift className="w-3 h-3 text-brand-gold" />
            <span className="text-[10px] text-zinc-400 font-mono">
              {isArabic ? "كوبون المتجر:" : "BOUTIQUE PASS:"}
            </span>
            <span className="font-mono font-bold text-brand-gold tracking-wider text-[11px]">
              {promotionConfig.promoCode}
            </span>
            <span className="text-emerald-400 text-[10px] flex items-center gap-0.5 ml-1 font-mono font-semibold">
              <Check className="w-3 h-3 stroke-[3]" />
              {isArabic ? `خصم ${discount}٪` : `${discount}% OFF`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[11px] hidden sm:flex">
            <Clock className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
            <span className="text-zinc-400 text-[10px]">
              {isArabic ? "صلاحية الحجز السريع:" : "Pass valid for:"}
            </span>
            <span className="bg-brand-gold/10 text-brand-gold font-bold px-2 py-0.5 rounded border border-brand-gold/30">
              {formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
