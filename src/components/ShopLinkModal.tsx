import React, { useState } from "react";
import { X, Store, Copy, Check, ExternalLink, Sparkles, AlertCircle, Compass } from "lucide-react";
import { useShop } from "../context/ShopContext";

interface ShopLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
}

export default function ShopLinkModal({ isOpen, onClose, isArabic }: ShopLinkModalProps) {
  const { shop, isDemo, activeSlug, switchShop, resetToDemo } = useShop();
  const [slugInput, setSlugInput] = useState(activeSlug !== "demo" ? activeSlug : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}${activeSlug && activeSlug !== "demo" ? `?shop=${activeSlug}` : ""}`
    : "";

  const handleCopy = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  const handleSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slugInput.trim()) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    const ok = await switchShop(slugInput.trim());
    setIsSubmitting(false);
    if (ok) {
      onClose();
    } else {
      setErrorMsg(
        isArabic
          ? `لم يتم العثور على المعرض "${slugInput.trim()}". يرجى التحقق من الاسم أو كتابة "demo".`
          : `Optical boutique "${slugInput.trim()}" was not found. Please verify the handle or enter "demo".`
      );
    }
  };

  const handleResetDemo = () => {
    resetToDemo();
    setSlugInput("");
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#141414] border border-brand-gold/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        dir={isArabic ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1c180f] via-[#2d2314] to-[#1c180f] border-b border-brand-gold/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-gold/15 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-brand-gold uppercase tracking-widest block font-bold">
                {isArabic ? "إدارة رابط المعرض البصري" : "OPTICAL BOUTIQUE LINK"}
              </span>
              <h3 className="font-serif text-lg text-white font-medium">
                {shop.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Active Status Badge */}
          <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400 block mb-0.5">
                {isArabic ? "المعرض النشط حالياً:" : "Current Active Boutique:"}
              </span>
              <span className="font-serif text-white text-base font-medium">
                {shop.name}
              </span>
            </div>
            <span className={`font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-md border ${
              isDemo
                ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            }`}>
              {isDemo ? (isArabic ? "وضع تجريبي" : "DEMO SHOWROOM") : `${shop.slug}`}
            </span>
          </div>

          {/* Shareable Link Box */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              {isArabic ? "رابط المعرض الشخصي للعملاء:" : "Your Customer Showroom Link:"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-300 select-all outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 px-4 bg-brand-gold hover:bg-brand-gold/90 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isArabic ? "تم النسخ" : "Copied!") : (isArabic ? "نسخ" : "Copy")}</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              {isArabic 
                ? "شارك هذا الرابط مع عملائك لحجز تجربة الإطارات في معرضك مع خصم VIP."
                : "Share this personal link with your patients/customers to reserve frames for in-store try-on."}
            </p>
          </div>

          {/* Switch Boutique Form */}
          <form onSubmit={handleSwitch} className="space-y-3 pt-2 border-t border-zinc-800">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              {isArabic ? "التبديل إلى معرض بصري آخر:" : "Switch to Another Optical Shop:"}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={slugInput}
                onChange={(e) => {
                  setSlugInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder={isArabic ? "مثال: al-noor أو demo أو الرابط كاملاً" : "e.g. al-noor, demo, or full link"}
                className="flex-1 bg-black/60 border border-zinc-700 focus:border-brand-gold rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={isSubmitting || !slugInput.trim()}
                className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-medium rounded-xl border border-zinc-700 transition-colors cursor-pointer"
              >
                {isSubmitting ? "..." : (isArabic ? "فتح المعرض" : "Open Shop")}
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg p-2.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>

          {/* Quick Demo Reset */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              {isArabic ? "استكشاف المعرض النموذجي:" : "Looking for the sample showroom?"}
            </span>
            <button
              type="button"
              onClick={handleResetDemo}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-brand-gold/30 text-brand-gold hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isArabic ? "العودة للوضع التجريبي" : "Reset to Flagship Demo"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
