import React from "react";
import { Sparkles, MapPin, ArrowRight, Check, Eye, Percent, Gift } from "lucide-react";
import { LensUpgrades, LensTypeOption, LensIndexOption, OrderBumpItem } from "../types";

interface FunnelStickyBarProps {
  isArabic: boolean;
  frame: any;
  lensType: LensTypeOption;
  lensIndex: LensIndexOption;
  lensUpgrades: LensUpgrades;
  selectedBumps: OrderBumpItem[];
  discountPercent?: number;
  onOpenBooking: () => void;
}

export default function FunnelStickyBar({
  isArabic,
  frame,
  lensType,
  lensIndex,
  lensUpgrades,
  selectedBumps,
  discountPercent = 10,
  onOpenBooking
}: FunnelStickyBarProps) {
  if (!frame) return null;

  const framePriceUsd = frame.price || 95;
  
  let lensTypePriceUsd = 0;
  if (lensType === "progressive") lensTypePriceUsd = 79;
  if (lensType === "reading") lensTypePriceUsd = 25;

  let lensIndexPriceUsd = 0;
  if (lensIndex === "thin_160") lensIndexPriceUsd = 35;
  if (lensIndex === "ultrathin_167") lensIndexPriceUsd = 65;
  if (lensIndex === "featherweight_174") lensIndexPriceUsd = 110;

  let coatingsPriceUsd = 0;
  if (lensUpgrades.blueLightCut) coatingsPriceUsd += 45;
  if (lensUpgrades.hydrophobicAntiGlare) coatingsPriceUsd += 35;
  if (lensUpgrades.photochromicTransitions) coatingsPriceUsd += 80;

  const bumpsPriceUsd = selectedBumps.reduce((acc, b) => acc + b.priceUsd, 0);
  const subtotalUsd = framePriceUsd + lensTypePriceUsd + lensIndexPriceUsd + coatingsPriceUsd + bumpsPriceUsd;
  
  // discount
  const discountSavingsUsd = Math.round((subtotalUsd * discountPercent) / 100);
  const finalEstimatedUsd = Math.max(0, subtotalUsd - discountSavingsUsd);
  const finalEstimatedSar = Math.round(finalEstimatedUsd * 3.75);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg py-3 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Selected Frame + In-Store Perks */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center p-1 shrink-0 hidden sm:flex">
            {frame.media_url ? (
              <img src={frame.media_url} alt="Frame" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <Eye className="w-5 h-5 text-brand-gold" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-sm md:text-base font-semibold text-[#111827] capitalize">
                {frame.frame_name || frame.model_name || "Frame"}
              </span>
              <span className="text-[10px] font-sans bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1">
                <Percent className="w-2.5 h-2.5" />
                {isArabic ? `خصم ${discountPercent}٪ بالمعرض` : `${discountPercent}% IN-STORE PASS`}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-sans flex items-center gap-2 mt-0.5">
              <span className="text-brand-gold font-medium">{isArabic ? "صندوق عرض خاص معقم وجاهز للزيارة" : "VIP Tray Reserved on Arrival"}</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">{isArabic ? "فحص بصر مجاني" : "Free Clinical Eye Exam"}</span>
            </p>
          </div>
        </div>

        {/* Right: Estimated In-Store Value + Big Reserve Button */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="text-right hidden sm:block">
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-xs text-gray-400 line-through font-sans">
                {isArabic ? `${Math.round(subtotalUsd * 3.75)} ر.س` : `$${subtotalUsd.toFixed(2)}`}
              </span>
              <span className="font-sans text-xl md:text-2xl text-brand-gold font-bold">
                {isArabic ? `${finalEstimatedSar} ر.س` : `$${finalEstimatedUsd.toFixed(2)}`}
              </span>
            </div>
            <span className="text-[10px] font-sans text-emerald-600 uppercase tracking-wider block font-semibold">
              {isArabic ? `وفرت ${discountPercent}٪ + فحص مجاني` : `Includes ${discountPercent}% Discount Voucher`}
            </span>
          </div>

          <button
            onClick={onOpenBooking}
            className="px-6 md:px-8 py-3 bg-brand-gold hover:bg-brand-gold/90 text-white font-sans text-xs md:text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider shrink-0"
          >
            <MapPin className="w-4 h-4" />
            <span>{isArabic ? `احجز تجربة VIP واحصل على خصم ${discountPercent}٪` : `Reserve In-Store Fitting & Get ${discountPercent}% Pass`}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

      </div>
    </div>
  );
}
