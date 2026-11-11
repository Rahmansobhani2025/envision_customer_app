import React, { useState } from "react";
import { 
  CheckCircle2, 
  Sparkles, 
  Truck, 
  Calendar, 
  FileText, 
  Download, 
  Share2, 
  Phone, 
  ArrowRight, 
  Plus, 
  ShieldCheck, 
  Check, 
  Eye,
  Percent,
  X
} from "lucide-react";
import { PlacedOrderSummary } from "../types";

interface OrderSuccessModalProps {
  isOpen: boolean;
  order: PlacedOrderSummary | null;
  onClose: () => void;
  isArabic: boolean;
  onAddSecondPairOffer?: () => void;
}

export default function OrderSuccessModal({
  isOpen,
  order,
  onClose,
  isArabic,
  onAddSecondPairOffer
}: OrderSuccessModalProps) {
  const [hasClaimedOto, setHasClaimedOto] = useState(false);
  const [otoLoading, setOtoLoading] = useState(false);

  if (!isOpen || !order) return null;

  const handleClaimSecondPair = () => {
    setOtoLoading(true);
    setTimeout(() => {
      setHasClaimedOto(true);
      setOtoLoading(false);
      if (onAddSecondPairOffer) onAddSecondPairOffer();
    }, 800);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#111111] border border-brand-gold/40 rounded-xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#1c2c1f] to-emerald-950 border-b border-emerald-500/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest block font-semibold">
                {isArabic ? "تم استلام الطلب وتأكيد التفصيل بنجاح" : "ORDER CONFIRMED & TRANSMITTED TO OPTICAL LAB"}
              </span>
              <h3 className="font-serif text-xl font-medium text-white tracking-wide">
                {isArabic ? `رقم طلبك: ${order.orderId}` : `Order Reference: #${order.orderId}`}
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
        <div className="overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Top Congratulations & Delivery Timeline */}
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h4 className="font-serif text-2xl md:text-3xl text-white">
              {isArabic ? `شكراً لك، ${order.customer.fullName}!` : `Thank you, ${order.customer.fullName}!`}
            </h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {isArabic 
                ? "تم إرسال قياساتك البصرية الحيوية إلى مختبر البصريات لبدء قص وصقل العدسات يدوياً وفق أعلى معايير الجودة." 
                : "Your biometric and optical parameters have been received by our optical lab. Lens milling and hand-calibration are now in progress."}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-brand-gold">
              <span className="flex items-center gap-1.5 bg-brand-gold/10 border border-brand-gold/30 px-3 py-1 rounded-full">
                <Truck className="w-3.5 h-3.5" />
                {isArabic ? "التسليم المتوقع: خلال ٣ - ٥ أيام عمل" : "Estimated Delivery: 3-5 Business Days"}
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isArabic ? "ضمان ملاءمة واستبدال ٣٠ يوماً" : "30-Day Fit & Rx Guarantee"}
              </span>
            </div>
          </div>

          {/* 🔥 HIGH-CONVERTING POST-PURCHASE ONE-TIME OFFER (OTO) */}
          <div className="relative p-6 md:p-7 rounded-xl bg-gradient-to-r from-[color-mix(in_srgb,var(--color-brand-gold)_10%,#0c0c0c)] via-[color-mix(in_srgb,var(--color-brand-gold)_20%,#0c0c0c)] to-[color-mix(in_srgb,var(--color-brand-gold)_10%,#0c0c0c)] border-2 border-brand-gold shadow-[0_0_30px_color-mix(in_srgb,var(--color-brand-gold)_20%,transparent)] overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand-gold text-white font-mono text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-bl-lg">
              {isArabic ? "عرض خاص لمرة واحدة فقط (OTO)" : "VIP ONE-TIME SPECIAL OFFER"}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-start">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="p-1 rounded bg-brand-gold/20 text-brand-gold">
                    <Percent className="w-4 h-4" />
                  </span>
                  <h5 className="font-serif text-xl font-bold text-white tracking-wide">
                    {isArabic ? "أضف نظارة ثانية أو نظارة شمسية بخصم ٤٠٪!" : "Add a 2nd Backup Pair or Sunglasses for 40% OFF!"}
                  </h5>
                </div>
                <p className="text-zinc-300 text-xs md:text-sm max-w-lg leading-relaxed">
                  {isArabic 
                    ? "وفر ٤٠٪ فوراً عند إضافة إطار احتياطي للسيارة أو نظارة شمسية مستقطبة بنفس وصفتك الطبية. ستشحن مع طلبك الحالي بدون أي رسوم إضافية!" 
                    : "Secure an exact duplicate backup pair or polarized driving sunglasses with your active Rx calibration. Shipped together in the same luxury parcel with $0 shipping."}
                </p>
                <div className="flex items-center gap-3 justify-center md:justify-start font-mono text-xs text-emerald-400">
                  <span className="line-through text-zinc-500">
                    {isArabic ? "٧٥٠ ر.س" : "$199"}
                  </span>
                  <span className="text-base font-bold text-brand-gold">
                    {isArabic ? "فقط ٤٥٠ ر.س" : "Only $119 (40% Savings)"}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                {hasClaimedOto ? (
                  <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 px-6 py-3 rounded-lg font-mono text-xs flex items-center gap-2 font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{isArabic ? "تمت إضافة النظارة الثانية للطلب بنجاح!" : "2nd VIP Pair Added To Your Order!"}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleClaimSecondPair}
                    disabled={otoLoading}
                    className="px-6 py-3.5 bg-brand-gold hover:bg-brand-gold/90 text-white font-serif text-sm font-bold rounded-lg shadow-lg transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    {otoLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>{isArabic ? "نعم! أضف النظارة الثانية بخصم ٤٠٪" : "Claim 40% Off 2nd Pair"}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Order Details & Digital Receipt */}
          <div className="border border-white/10 bg-black/40 rounded-lg p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <h5 className="font-serif text-base text-white font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-gold" />
                <span>{isArabic ? "الفاتورة والمواصفات الطبية" : "Order Summary & Clinical Specification"}</span>
              </h5>
              <div className="flex gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isArabic ? "طباعة الفاتورة" : "Print Receipt"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Product info */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block font-semibold">
                  {isArabic ? "تفاصيل الإطار والعدسات:" : "Frame & Optical Build:"}
                </span>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded space-y-1.5">
                  <p className="text-white font-serif font-medium text-sm capitalize">
                    {order.frame.name} ({order.frame.brand})
                  </p>
                  <p className="text-zinc-400 font-mono">
                    {isArabic ? "نوع العدسة:" : "Lens Type:"} <span className="text-zinc-200 capitalize">{order.lensType.replace("_", " ")}</span>
                  </p>
                  <p className="text-zinc-400 font-mono">
                    {isArabic ? "معامل السماكة:" : "Lens Index:"} <span className="text-brand-gold capitalize">{order.lensIndex.replace("_", " ")}</span>
                  </p>
                  <p className="text-zinc-400 font-mono">
                    {isArabic ? "المسافة بين الحدقتين (IPD):" : "Calibrated IPD:"} <span className="text-brand-gold font-bold">{order.prescription.pd}mm</span>
                  </p>
                </div>
              </div>

              {/* Shipping address & payment info */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block font-semibold">
                  {isArabic ? "عنوان الشحن والتواصل:" : "Shipping & Recipient:"}
                </span>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded space-y-1 text-zinc-300 font-sans">
                  <p className="font-medium text-white">{order.customer.fullName}</p>
                  <p>{order.customer.addressLine1}, {order.customer.city}, {order.customer.country}</p>
                  <p className="font-mono text-zinc-400">{order.customer.phone} • {order.customer.email}</p>
                  <p className="font-mono text-brand-gold text-[11px] pt-1">
                    {isArabic ? `طريقة الدفع: ${order.customer.paymentMethod}` : `Payment: ${order.customer.paymentMethod.replace("_", " ").toUpperCase()}`}
                  </p>
                </div>
              </div>

            </div>

            {/* Total tally */}
            <div className="border-t border-white/10 pt-3 flex justify-between items-center font-mono text-sm">
              <span className="text-zinc-400">{isArabic ? "المجموع المدفوع بالكامل:" : "Total Amount Paid:"}</span>
              <span className="font-serif text-xl text-brand-gold font-bold">
                {isArabic ? `${order.totalSar} ر.س` : `$${order.totalUsd.toFixed(2)}`}
              </span>
            </div>

          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>
                {isArabic 
                  ? "هل تحتاج مساعدة في الوصفة الطبية؟ تواصل مع أخصائي البصريات عبر الواتساب: 966500000000+" 
                  : "Need assistance with your optical prescription? WhatsApp 24/7 Optical Support"}
              </span>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              {isArabic ? "إغلاق والعودة للرئيسية" : "Done / Return to Dashboard"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
