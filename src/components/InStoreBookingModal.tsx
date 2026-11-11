import React, { useState, useEffect } from "react";
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Percent, 
  Phone, 
  Mail, 
  User, 
  Eye, 
  Glasses, 
  Gift, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2,
  Stethoscope,
  Info
} from "lucide-react";
import { 
  StoreLocation, 
  InStoreReservation, 
  LensTypeOption, 
  LensIndexOption, 
  LensUpgrades, 
  OrderBumpItem, 
  BiometricAnalysisResult,
  ShopOwnerPromotionConfig 
} from "../types";
import { TIME_SLOTS, DEFAULT_SHOP_PROMOTION } from "../data/stores";
import { useShop } from "../context/ShopContext";
import { getShopLocations } from "../lib/shopStore";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface InStoreBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
  frame: any;
  prescription: {
    odSph: string;
    odCyl: string;
    odAxis: string;
    osSph: string;
    osCyl: string;
    osAxis: string;
    pd: string;
  };
  lensType: LensTypeOption;
  lensIndex: LensIndexOption;
  lensUpgrades: LensUpgrades;
  selectedBumps: OrderBumpItem[];
  analysisResult?: BiometricAnalysisResult | null;
  promotionConfig?: ShopOwnerPromotionConfig;
  onReservationConfirmed: (reservation: InStoreReservation) => void;
}

export default function InStoreBookingModal({
  isOpen,
  onClose,
  isArabic,
  frame,
  prescription,
  lensType,
  lensIndex,
  lensUpgrades,
  selectedBumps,
  analysisResult,
  promotionConfig = DEFAULT_SHOP_PROMOTION,
  onReservationConfirmed
}: InStoreBookingModalProps) {
  // Selected store and time
  const { shop } = useShop();
  const locations = getShopLocations(shop);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(locations[0].id);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(TIME_SLOTS[2].id);

  // Customer form inputs
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Fetch customer registration profile from Supabase Auth & Profiles table
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadProfileData = async () => {
      // 1. Check local cached profile for instant population
      try {
        const cached = localStorage.getItem("envision_user_profile");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (isMounted) {
            if (parsed.fullName) setFullName(parsed.fullName);
            if (parsed.email) setEmail(parsed.email);
            if (parsed.phone) setPhone(parsed.phone);
            if (parsed.fullName || parsed.email) setIsProfileLoaded(true);
          }
        }
      } catch (e) {
        // ignore parse error
      }

      // 2. Fetch directly from Supabase Auth and Profiles table
      if (isSupabaseConfigured) {
        try {
          const userRes = await supabase.auth.getUser().catch((authErr) => {
            console.warn("Notice fetching Supabase user in booking modal:", authErr);
            return null;
          });
          const user = userRes?.data?.user;
          if (user && isMounted) {
            const metaFullName = user.user_metadata?.full_name || user.user_metadata?.fullName || user.user_metadata?.name;
            const userEmail = user.email || "";
            const metaPhone = user.user_metadata?.whatsapp_number || user.user_metadata?.whatsapp || user.user_metadata?.phone || user.phone;

            let resolvedName = metaFullName || "";
            let resolvedEmail = userEmail;
            let resolvedPhone = metaPhone || "";

            // Query the Supabase profiles table for any custom user data
            try {
              const { data: profile, error: profileErr } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

              if (profile && !profileErr) {
                if (profile.full_name) resolvedName = profile.full_name;
                if (profile.email) resolvedEmail = profile.email;
                if (profile.whatsapp_number) resolvedPhone = profile.whatsapp_number;
                else if (profile.phone) resolvedPhone = profile.phone;
              }
            } catch (pErr) {
              console.warn("Notice checking profiles table:", pErr);
            }

            if (isMounted) {
              if (resolvedName) setFullName(resolvedName);
              if (resolvedEmail) setEmail(resolvedEmail);
              if (resolvedPhone) setPhone(resolvedPhone);
              if (resolvedName || resolvedEmail) setIsProfileLoaded(true);

              try {
                localStorage.setItem("envision_user_profile", JSON.stringify({
                  fullName: resolvedName,
                  email: resolvedEmail,
                  phone: resolvedPhone
                }));
              } catch (e) {}
            }
          }
        } catch (authErr) {
          console.warn("Notice fetching Supabase user in booking modal:", authErr);
        }
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);
  
  // Perks toggles
  const [includeFreeExam, setIncludeFreeExam] = useState(true);
  const [includeCustomFitting, setIncludeCustomFitting] = useState(true);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculation for in-store estimate & discount
  const discountPercent = promotionConfig.discountPercent || 10;
  const framePriceUsd = frame?.price || 95;

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
  
  // Apply discount percent
  const discountSavingsUsd = Math.round((subtotalUsd * discountPercent) / 100);
  const finalEstimatedUsd = Math.max(0, subtotalUsd - discountSavingsUsd);

  const subtotalSar = Math.round(subtotalUsd * 3.75);
  const discountSavingsSar = Math.round(discountSavingsUsd * 3.75);
  const finalEstimatedSar = Math.round(finalEstimatedUsd * 3.75);

  const selectedStore = locations.find(s => s.id === selectedStoreId) || locations[0];

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) {
      errors.fullName = isArabic ? "يرجى كتابة الاسم الكريم" : "Full name is required";
    }
    if (!phone.trim()) {
      errors.phone = isArabic ? "يرجى إدخال رقم الهاتف للتواصل" : "Phone number is required";
    }
    if (!email.trim() || !email.includes("@")) {
      errors.email = isArabic ? "يرجى إدخال بريد إلكتروني صالح لاستلام القسيمة" : "Valid email is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reservationId = `VIP-TRYON-${randomSuffix}`;
    const voucherCode = `${promotionConfig.promoCode}-${randomSuffix}`;

    setTimeout(() => {
      const reservationData: InStoreReservation = {
        reservationId,
        voucherCode,
        discountPercent,
        discountType: "percentage",
        createdAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        preferredDate: selectedDate,
        preferredTimeSlot: TIME_SLOTS.find(t => t.id === selectedTimeSlot)?.labelEn || selectedTimeSlot,
        store: selectedStore,
        customer: {
          fullName,
          phone,
          whatsapp: whatsapp || phone,
          email,
          notes
        },
        frame: {
          id: frame.id || 34,
          name: frame.frame_name || frame.model_name || "Envision 2061",
          brand: frame.brand || "Envision",
          priceUsd: framePriceUsd,
          priceSar: Math.round(framePriceUsd * 3.75),
          imageUrl: frame.media_url,
          shapeCategory: frame.shapeCategory
        },
        lensPreference: {
          type: lensType,
          index: lensIndex,
          interestedUpgrades: lensUpgrades,
          includeFreeEyeExam: includeFreeExam,
          includeCustomFitting: includeCustomFitting
        },
        prescription,
        biometricSummary: analysisResult ? {
          faceShape: analysisResult.faceShape,
          faceShapeAr: analysisResult.faceShapeAr,
          ipd: analysisResult.interpupillaryDistance,
          symmetry: analysisResult.symmetry
        } : undefined,
        estimatedFrameTotalUsd: subtotalUsd,
        estimatedFrameTotalSar: subtotalSar,
        discountSavingsUsd,
        discountSavingsSar,
        finalEstimatedTotalUsd: finalEstimatedUsd,
        finalEstimatedTotalSar: finalEstimatedSar
      };

      setIsSubmitting(false);
      onReservationConfirmed(reservationData);
    }, 900);
  };

  if (!isOpen || !frame) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#101010] border border-brand-gold/40 rounded-xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1b150b] via-[#2d200e] to-[#1b150b] border-b border-brand-gold/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-brand-gold uppercase tracking-widest font-bold">
                  {isArabic ? "حجز تجربة حصرية في المتجر" : "VIP IN-STORE FITTING & RESERVATION PASS"}
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold">
                  {isArabic ? `خصم ${discountPercent}٪ مضمون` : `${discountPercent}% OFF PASS`}
                </span>
              </div>
              <h3 className="font-serif text-lg md:text-xl font-medium text-white tracking-wide">
                {isArabic 
                  ? "تجهيز صندوق عرض خاص بالنظارات المطابقة لملامحك + قسيمة الخصم" 
                  : "Reserve Your Biometric Frame Tray & Claim Your In-Store Voucher"}
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

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8">
          
          <form onSubmit={handleConfirmReservation} className="space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Store Selection & Appointment Details (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Boutique Branch Selector */}
                <div className="space-y-3">
                  <label className="font-serif text-sm font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-gold" />
                    <span>{isArabic ? "١. اختر فرع المعرض لتجربة النظارة" : "1. Select Optical Boutique Branch"}</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {locations.map((loc) => {
                      const isSelected = selectedStoreId === loc.id;
                      return (
                        <div
                          key={loc.id}
                          onClick={() => setSelectedStoreId(loc.id)}
                          className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "border-brand-gold bg-brand-gold/10 ring-1 ring-brand-gold"
                              : "border-white/10 bg-[#151515] hover:border-white/30"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif text-sm font-semibold text-white">
                                {isArabic ? loc.nameAr : loc.nameEn}
                              </span>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-brand-gold bg-brand-gold text-black" : "border-zinc-600"}`}>
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                            </div>
                            <p className="text-[11.5px] text-zinc-400 font-sans leading-tight">
                              {isArabic ? loc.addressAr : loc.addressEn}
                            </p>
                          </div>
                          <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                            <span>{loc.cityEn}</span>
                            <span className="text-brand-gold">{loc.phone}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Date & Time Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-serif text-sm font-semibold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-gold" />
                      <span>{isArabic ? "٢. تاريخ الزيارة المفضل" : "2. Preferred Visit Date"}</span>
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-[#161616] border border-white/15 rounded px-3 py-2.5 text-sm text-white font-mono focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-serif text-sm font-semibold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-gold" />
                      <span>{isArabic ? "٣. الوقت المناسب لتجهيز صندوق العرض الخاص" : "3. VIP Time Slot"}</span>
                    </label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full bg-[#161616] border border-white/15 rounded px-3 py-2.5 text-xs text-white font-mono focus:border-brand-gold focus:outline-none"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot.id} value={slot.id} className="bg-black text-white">
                          {isArabic ? slot.labelAr : slot.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Customer Info */}
                <div className="space-y-4 pt-2">
                  <label className="font-serif text-sm font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                    <User className="w-4 h-4 text-brand-gold" />
                    <span>{isArabic ? "٤. بيانات استلام قسيمة الـ VIP ورقم الحجز" : "4. Contact Details for Digital Voucher & SMS"}</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 flex items-center justify-between mb-1.5">
                        <span>{isArabic ? "الاسم الكامل *" : "Full Name *"}</span>
                        {isProfileLoaded && fullName && (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-mono text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded border border-brand-gold/30">
                            <Check className="w-2.5 h-2.5 text-brand-gold" />
                            <span>{isArabic ? "ملف Supabase" : "Supabase Profile"}</span>
                          </span>
                        )}
                      </label>
                      <input
                        id="booking-full-name"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={isArabic ? "سارة محمد" : "Alexander Wright"}
                        className={`w-full bg-[#131313] border rounded-md px-3.5 py-2.5 text-sm text-white transition-all shadow-inner focus:outline-none ${
                          formErrors.fullName 
                            ? "border-rose-500 focus:ring-1 focus:ring-rose-500" 
                            : isProfileLoaded && fullName
                              ? "border-brand-gold/45 bg-[#171612] focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50"
                              : "border-white/15 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50"
                        }`}
                      />
                      {formErrors.fullName && <p className="text-rose-400 text-[10px] mt-1">{formErrors.fullName}</p>}
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 flex items-center justify-between mb-1.5">
                        <span>{isArabic ? "رقم الجوال / واتساب (لاستلام القسيمة) *" : "Phone / WhatsApp (For Pass & QR) *"}</span>
                        {isProfileLoaded && phone && (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-mono text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded border border-brand-gold/30">
                            <Check className="w-2.5 h-2.5 text-brand-gold" />
                            <span>{isArabic ? "ملف Supabase" : "Supabase Profile"}</span>
                          </span>
                        )}
                      </label>
                      <input
                        id="booking-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+966 50 123 4567"
                        className={`w-full bg-[#131313] border rounded-md px-3.5 py-2.5 text-sm text-white font-mono transition-all shadow-inner focus:outline-none ${
                          formErrors.phone 
                            ? "border-rose-500 focus:ring-1 focus:ring-rose-500" 
                            : isProfileLoaded && phone
                              ? "border-brand-gold/45 bg-[#171612] focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50"
                              : "border-white/15 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50"
                        }`}
                      />
                      {formErrors.phone && <p className="text-rose-400 text-[10px] mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 flex items-center justify-between mb-1.5">
                      <span>{isArabic ? "البريد الإلكتروني (لإرسال تفاصيل التقرير الحيوي) *" : "Email Address (For Full Biometric Report) *"}</span>
                      {isProfileLoaded && email && (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-mono text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded border border-brand-gold/30">
                          <Check className="w-2.5 h-2.5 text-brand-gold" />
                          <span>{isArabic ? "ملف Supabase" : "Supabase Profile"}</span>
                        </span>
                      )}
                    </label>
                    <input
                      id="booking-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@envision-eyewear.com"
                      className={`w-full bg-[#131313] border rounded-md px-3.5 py-2.5 text-sm text-white font-mono transition-all shadow-inner focus:outline-none ${
                        formErrors.email 
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-500" 
                          : isProfileLoaded && email
                            ? "border-brand-gold/45 bg-[#171612] focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50"
                            : "border-white/15 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50"
                      }`}
                    />
                    {formErrors.email && <p className="text-rose-400 text-[10px] mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                      {isArabic ? "ملاحظات خاصة للأخصائي (اختياري)" : "Special Requests / Notes for the Optician (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={isArabic ? "أرغب بتجربة لون إطار إضافي أيضاً..." : "Looking forward to trying progressive lenses..."}
                      className="w-full bg-[#161616] border border-white/15 rounded px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Free In-Store Perks Included with Pass */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                    <Gift className="w-4 h-4" />
                    <span>{isArabic ? "مزايا مجانية مرفقة مع حجزك:" : "COMPLIMENTARY IN-STORE CLINICAL PERKS:"}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px] text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{isArabic ? "فحص بصر شامل مجاناً (وفر ٢٥٠ ر.س)" : "Free Comprehensive Eye Exam ($65 Value)"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{isArabic ? "صندوق عرض خاص VIP معقم ومجهز" : "Sanitized VIP Velvet Try-On Tray"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{isArabic ? "ضبط وسادات الأنف وميلان الإطار" : "Bespoke Ergonomic Nose & Ear Fit"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{isArabic ? `خصم ${discountPercent}٪ على أي إطار أو عدسة` : `Guaranteed ${discountPercent}% Discount Voucher`}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Frame Summary, Voucher Pass Preview, & Savings Tally (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Visual VIP Pass Card */}
                <div className="p-5 rounded-xl bg-gradient-to-b from-[#181818] via-[#121212] to-[#0A0A0A] border-2 border-brand-gold shadow-[0_0_25px_color-mix(in_srgb,var(--color-brand-gold)_15%,transparent)] space-y-4">
                  
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Glasses className="w-5 h-5 text-brand-gold" />
                      <span className="font-serif text-sm font-semibold text-white uppercase tracking-wider">
                        {isArabic ? "النظارة المحجوزة في صندوق العرض الخاص" : "Reserved Try-On Frame"}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] bg-brand-gold text-white font-extrabold px-2 py-0.5 rounded uppercase">
                      {isArabic ? `خصم ${discountPercent}٪` : `${discountPercent}% OFF`}
                    </span>
                  </div>

                  {/* Frame preview image & details */}
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-16 bg-black/60 rounded border border-white/10 flex items-center justify-center p-1 shrink-0">
                      {frame.media_url ? (
                        <img src={frame.media_url} alt="Frame" className="max-h-full max-w-full object-contain filter drop-shadow" referrerPolicy="no-referrer" />
                      ) : (
                        <Eye className="w-6 h-6 text-zinc-600" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-serif text-base font-bold text-white capitalize leading-tight">
                        {frame.frame_name || frame.model_name || "Envision Bespoke"}
                      </h5>
                      <p className="font-mono text-[10px] text-zinc-400 mt-0.5">
                        {frame.brand || "Envision"} • {frame.material || "Grade 5 Titanium"}
                      </p>
                      <p className="font-mono text-xs text-brand-gold font-bold mt-1">
                        {isArabic ? `${Math.round(framePriceUsd * 3.75)} ر.س` : `$${framePriceUsd.toFixed(2)}`}
                      </p>
                    </div>
                  </div>

                  {/* Biometric Match Confirmation Badge */}
                  {analysisResult && (
                    <div className="p-2.5 rounded bg-white/[0.03] border border-white/5 space-y-1 text-[11px] font-mono text-zinc-300">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">{isArabic ? "مطابقة شكل الوجه:" : "Face Shape Match:"}</span>
                        <span className="text-brand-gold font-medium">{analysisResult.faceShapeAr || analysisResult.faceShape}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">{isArabic ? "مسافة الحدقتين (IPD):" : "Calibrated IPD:"}</span>
                        <span className="text-zinc-200">{analysisResult.interpupillaryDistance.toFixed(1)}mm</span>
                      </div>
                    </div>
                  )}

                  {/* Estimated Pricing and In-Store Savings Breakdown */}
                  <div className="border-t border-white/10 pt-3 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-zinc-400">
                      <span>{isArabic ? "قيمة الإطار التقديرية:" : "Estimated Frame Value:"}</span>
                      <span>{isArabic ? `${subtotalSar} ر.س` : `$${subtotalUsd.toFixed(2)}`}</span>
                    </div>

                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        {isArabic ? `خصم القسيمة الفوري (${discountPercent}٪):` : `VIP Pass In-Store Discount (${discountPercent}%):`}
                      </span>
                      <span>-{isArabic ? `${discountSavingsSar} ر.س` : `$${discountSavingsUsd.toFixed(2)}`}</span>
                    </div>

                    <div className="flex justify-between text-emerald-400">
                      <span>{isArabic ? "فحص البصر السريري:" : "Clinical Optometrist Exam:"}</span>
                      <span className="uppercase font-bold">{isArabic ? "مجاناً (0 ر.س)" : "FREE ($0)"}</span>
                    </div>

                    <div className="border-t border-white/10 pt-2 flex justify-between items-baseline">
                      <span className="text-white font-serif text-sm font-medium">
                        {isArabic ? "المبلغ التقديري عند الشراء بالمعرض:" : "Estimated In-Store Total:"}
                      </span>
                      <div className="text-right">
                        <span className="font-serif text-xl font-bold text-brand-gold">
                          {isArabic ? `${finalEstimatedSar} ر.س` : `$${finalEstimatedUsd.toFixed(2)}`}
                        </span>
                        <span className="text-[9px] text-zinc-500 block font-mono">
                          {isArabic ? "الدفع يتم بالمعرض بعد التجربة والرضا" : "Pay at the boutique only after fitting"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Big Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-brand-gold hover:bg-brand-gold/90 text-white font-serif text-base font-bold rounded-lg shadow-[0_0_25px_color-mix(in_srgb,var(--color-brand-gold)_30%,transparent)] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                      <span>{isArabic ? "جاري حجز صندوق العرض الخاص وإصدار القسيمة..." : "Generating In-Store Pass..."}</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>{isArabic ? `تأكيد الحجز والحصول على خصم ${discountPercent}٪` : `Claim ${discountPercent}% Pass & Reserve In-Store Tray`}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-zinc-500 font-mono">
                  {isArabic 
                    ? "لا يترتب عليك أي التزام بالشراء عند الحجز. زيارتك وتجربتك للنظارة مجانية بالكامل." 
                    : "Zero purchase obligation. Try on the frames and enjoy complimentary vision testing."}
                </p>

              </div>

            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
