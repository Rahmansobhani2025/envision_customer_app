import React, { useState } from "react";
import { Glasses, Link2Off, PauseCircle, ArrowRight, Sparkles, Store } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { DEMO_ENABLED } from "../lib/shop";

/**
 * Decides what a visitor sees before the app itself:
 *  - loading the shop
 *  - paused shop
 *  - no / unknown shop link (with a box to type a shop link; the sample showroom only if enabled)
 */
export default function ShopGate({ children }: { children: React.ReactNode }) {
  const { phase, shop, loadError, switchShop, resetToDemo } = useShop();
  const [inputSlug, setInputSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-4">
        <Glasses className="w-10 h-10 text-brand-gold animate-spin [animation-duration:3s]" />
        <span className="font-sans text-xs uppercase tracking-widest text-gray-400">Loading showroom...</span>
      </div>
    );
  }

  if (phase === "ready" && shop.status !== "active") {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <PauseCircle className="w-12 h-12 text-brand-gold" />
        <h1 className="font-serif text-2xl font-semibold tracking-tight">{shop.name}</h1>
        <p className="max-w-md text-sm text-gray-500 leading-relaxed">
          This online showroom is temporarily unavailable. Please contact the shop directly or visit again soon.
        </p>
      </div>
    );
  }

  if (phase === "ready") return <>{children}</>;

  // no_slug | not_found | error
  let title = "Open your optical shop's link";
  let subtitle = "This app is opened from your optical shop's personal link. Please use the link your shop shared with you, or type it below.";
  let icon = <Store className="w-10 h-10 text-brand-gold" />;
  if (phase === "not_found") {
    title = "Shop not found";
    subtitle = loadError || "We couldn't find a shop for this link. Please check the link or ask your optical shop for a new one.";
    icon = <Link2Off className="w-10 h-10 text-brand-gold" />;
  } else if (phase === "error") {
    title = "Can't connect right now";
    subtitle = "We couldn't load this shop. Please check your connection and try again in a moment.";
    icon = <Link2Off className="w-10 h-10 text-brand-gold" />;
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSlug.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    const ok = await switchShop(inputSlug.trim());
    setIsSubmitting(false);
    if (!ok) setErrorMessage(`Could not find a shop matching "${inputSlug.trim()}". Please check the spelling.`);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-5">{icon}</div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight mb-2">{title}</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{subtitle}</p>

        <form onSubmit={handleConnect} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={inputSlug}
              onChange={(e) => { setInputSlug(e.target.value); setErrorMessage(null); }}
              placeholder="e.g. al-noor or the full link"
              className="flex-1 bg-white border border-gray-300 focus:border-brand-gold rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting || !inputSlug.trim()}
              className="py-2.5 px-5 bg-brand-gold hover:bg-brand-gold/90 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              {isSubmitting ? "Connecting..." : "Open Shop"}
            </button>
          </div>
          {errorMessage && <p className="text-xs text-red-600 text-left px-1">{errorMessage}</p>}
        </form>

        {DEMO_ENABLED && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={() => resetToDemo()}
              className="w-full py-3 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>Explore the sample showroom</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
