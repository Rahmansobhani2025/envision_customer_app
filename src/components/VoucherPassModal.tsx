import React, { useState } from "react";
import { 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  Download, 
  Share2, 
  Phone, 
  Check, 
  X, 
  Percent, 
  QrCode, 
  Navigation, 
  Copy, 
  ExternalLink,
  Glasses,
  Gift
} from "lucide-react";
import { InStoreReservation } from "../types";

interface VoucherPassModalProps {
  isOpen: boolean;
  reservation: InStoreReservation | null;
  onClose: () => void;
  isArabic: boolean;
}

export default function VoucherPassModal({
  isOpen,
  reservation,
  onClose,
  isArabic
}: VoucherPassModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen || !reservation) return null;

  const handleCopyVoucher = () => {
    if (!reservation) return;
    navigator.clipboard.writeText(reservation.voucherCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePrintPass = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    isArabic
      ? `مرحباً إنفيجن، قمت بحجز موعد لتجربة نظارة ${reservation?.frame?.name || ""} في ${reservation?.store?.nameAr || ""} برقم حجز ${reservation?.reservationId || ""} وكود خصم ${reservation?.voucherCode || ""}`
      : `Hello Envision, I reserved an in-store VIP fitting for ${reservation?.frame?.name || ""} at ${reservation?.store?.nameEn || ""}. Reservation #${reservation?.reservationId || ""}, Voucher: ${reservation?.voucherCode || ""}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#111111] border border-brand-gold/50 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#1c2c1f] to-emerald-950 border-b border-emerald-500/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest block font-semibold">
                {isArabic ? "تم تأكيد حجز صندوق العرض الخاص وإصدار قسيمة الخصم" : "VIP IN-STORE TRAY RESERVED & VOUCHER ISSUED"}
              </span>
              <h3 className="font-serif text-lg md:text-xl font-medium text-white tracking-wide">
                {isArabic ? `رقم الحجز: ${reservation.reservationId}` : `Reservation Pass #${reservation.reservationId}`}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Congratulations Greeting */}
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h4 className="font-serif text-2xl md:text-3xl text-white">
              {isArabic ? `أهلاً بك، ${reservation.customer.fullName}!` : `You're All Set, ${reservation.customer.fullName}!`}
            </h4>
            <p className="text-zinc-300 text-xs md:text-sm leading-relaxed">
              {isArabic 
                ? `تم تجهيز صندوق عرض خاص VIP باسمك يحتوي على إطار ${reservation.frame.name} مع عينات بديلة لدى فرعنا (${reservation.store.nameAr}).`
                : `Your curated velvet try-on tray with ${reservation.frame.name} and calibrated optical samples is reserved at our ${reservation.store.nameEn}.`}
            </p>
          </div>

          {/* Golden VIP Voucher Card (Present to Shop Attendant) */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-[color-mix(in_srgb,var(--color-brand-gold)_10%,#0c0c0c)] via-[color-mix(in_srgb,var(--color-brand-gold)_20%,#0c0c0c)] to-[color-mix(in_srgb,var(--color-brand-gold)_10%,#0c0c0c)] border-2 border-brand-gold shadow-[0_0_30px_color-mix(in_srgb,var(--color-brand-gold)_25%,transparent)] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand-gold text-white font-mono text-[9px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-bl-lg">
              {isArabic ? `قسيمة خصم ${reservation.discountPercent}٪ صالحة ١٤ يوماً` : `VIP PASS • ${reservation.discountPercent}% OFF`}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* Left Details */}
              <div className="space-y-3 text-center sm:text-start">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Gift className="w-5 h-5 text-brand-gold" />
                  <span className="font-serif text-lg font-bold text-white tracking-wide">
                    {isArabic ? "كوبون الخصم الخاص بك في المتجر" : "Your Boutique Discount Voucher"}
                  </span>
                </div>

                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <div className="px-4 py-2 bg-black/70 border border-brand-gold rounded font-mono text-xl md:text-2xl text-brand-gold font-extrabold tracking-widest">
                    {reservation.voucherCode}
                  </div>
                  <button
                    onClick={handleCopyVoucher}
                    className="p-2 bg-white/10 hover:bg-brand-gold hover:text-white text-white rounded transition-colors cursor-pointer"
                    title={isArabic ? "نسخ الكود" : "Copy Code"}
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[11.5px] text-zinc-300">
                  {isArabic 
                    ? `أظهر هذا الكود أو رمز الـ QR للبائع في المعرض لتفعيل خصم ${reservation.discountPercent}٪ فوراً.` 
                    : `Present this voucher code or QR scan to the boutique optician to apply your ${reservation.discountPercent}% discount.`}
                </p>
              </div>

              {/* QR Code Graphic Box */}
              <div className="shrink-0 flex flex-col items-center bg-white p-3 rounded-lg border border-black shadow-inner">
                {/* SVG Mock QR Code */}
                <svg className="w-24 h-24 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm10 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-6-4h2v2h-2v-2zm0 4h2v2h-2v-2zM6 6h0v0zm12 0h0v0zM6 18h0v0z" />
                </svg>
                <span className="font-mono text-[8px] text-zinc-800 font-bold mt-1 tracking-tighter">
                  {reservation.reservationId}
                </span>
              </div>

            </div>
          </div>

          {/* Appointment Schedule & Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* Store Information */}
            <div className="p-4 bg-[#161616] border border-white/10 rounded-lg space-y-2">
              <span className="font-mono text-[10px] text-brand-gold uppercase tracking-widest block font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {isArabic ? "فرع المعرض المحدد:" : "Selected Boutique Location:"}
              </span>
              <h5 className="font-serif text-sm font-bold text-white">
                {isArabic ? reservation.store.nameAr : reservation.store.nameEn}
              </h5>
              <p className="text-zinc-400 text-[11.5px] leading-relaxed font-sans">
                {isArabic ? reservation.store.addressAr : reservation.store.addressEn}
              </p>
              <p className="font-mono text-[11px] text-zinc-400">
                {isArabic ? "ساعات العمل:" : "Hours:"} {isArabic ? reservation.store.hoursAr : reservation.store.hoursEn}
              </p>
              <div className="pt-1">
                <a
                  href={reservation.store.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-brand-gold hover:underline"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{isArabic ? "فتح في خرائط جوجل (Google Maps)" : "Open Directions in Google Maps"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Appointment Time & Reserved Item */}
            <div className="p-4 bg-[#161616] border border-white/10 rounded-lg space-y-2">
              <span className="font-mono text-[10px] text-brand-gold uppercase tracking-widest block font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {isArabic ? "تفاصيل الموعد والنظارة المحجوزة:" : "Appointment Schedule & Tray:"}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-10 bg-black/60 rounded border border-white/10 flex items-center justify-center p-1 shrink-0">
                  {reservation.frame.imageUrl ? (
                    <img src={reservation.frame.imageUrl} alt="Frame" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <Glasses className="w-5 h-5 text-brand-gold" />
                  )}
                </div>
                <div>
                  <h6 className="font-serif text-sm font-semibold text-white capitalize">
                    {reservation.frame.name} ({reservation.frame.brand})
                  </h6>
                  <p className="font-mono text-[11px] text-emerald-400">
                    {isArabic ? `تاريخ الزيارة: ${reservation.preferredDate}` : `Date: ${reservation.preferredDate}`}
                  </p>
                </div>
              </div>
              <p className="font-mono text-[11px] text-zinc-300">
                <Clock className="w-3 h-3 inline mr-1 text-brand-gold" />
                {reservation.preferredTimeSlot}
              </p>
            </div>

          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${reservation.store.whatsapp.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-mono text-xs flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isArabic ? "إرسال تأكيد عبر الواتساب" : "Confirm via WhatsApp"}</span>
              </a>

              <button
                onClick={handlePrintPass}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isArabic ? "طباعة قسيمة الـ VIP" : "Print VIP Pass"}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-serif text-xs font-bold rounded uppercase tracking-wider transition-colors cursor-pointer"
            >
              {isArabic ? "تم / العودة للرئيسية" : "Done / Return"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
