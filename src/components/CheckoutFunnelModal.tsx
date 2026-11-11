import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Truck, 
  Check, 
  Sparkles, 
  Tag, 
  CheckCircle2, 
  Eye, 
  Package, 
  Phone, 
  Mail, 
  User, 
  MapPin, 
  Globe,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { 
  LensUpgrades, 
  LensTypeOption, 
  LensIndexOption, 
  OrderBumpItem, 
  CheckoutCustomerData, 
  PlacedOrderSummary,
  BiometricAnalysisResult 
} from "../types";

interface CheckoutFunnelModalProps {
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
  analysisResult: BiometricAnalysisResult | null;
  onOrderPlaced: (order: PlacedOrderSummary) => void;
}

export default function CheckoutFunnelModal({
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
  onOrderPlaced
}: CheckoutFunnelModalProps) {
  // Form State
  const [formData, setFormData] = useState<CheckoutCustomerData>({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    addressLine1: "",
    city: "",
    country: isArabic ? "Saudi Arabia" : "United States",
    postalCode: "",
    shippingSpeed: "express",
    paymentMethod: "card",
    notes: ""
  });

  const [cardInfo, setCardInfo] = useState({
    cardNumber: "4532 •••• •••• 8829",
    expiry: "09/28",
    cvc: "842"
  });

  const [couponCode, setCouponCode] = useState("ENVISION20");
  const [isCouponApplied, setIsCouponApplied] = useState(true);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Pricing calculations
  const framePriceUsd = frame?.price || 95;
  const framePriceSar = Math.round(framePriceUsd * 3.75);

  // Lens type price
  let lensTypePriceUsd = 0;
  if (lensType === "progressive") lensTypePriceUsd = 79;
  if (lensType === "reading") lensTypePriceUsd = 25;

  // Lens index price
  let lensIndexPriceUsd = 0;
  if (lensIndex === "thin_160") lensIndexPriceUsd = 35;
  if (lensIndex === "ultrathin_167") lensIndexPriceUsd = 65;
  if (lensIndex === "featherweight_174") lensIndexPriceUsd = 110;

  // Coating upgrades price
  let coatingsPriceUsd = 0;
  if (lensUpgrades.blueLightCut) coatingsPriceUsd += 45;
  if (lensUpgrades.hydrophobicAntiGlare) coatingsPriceUsd += 35;
  if (lensUpgrades.photochromicTransitions) coatingsPriceUsd += 80;
  if (lensUpgrades.highIndex && lensIndex !== "ultrathin_167" && lensIndex !== "featherweight_174") {
    coatingsPriceUsd += 95;
  }

  // Bumps price
  const bumpsPriceUsd = selectedBumps.reduce((acc, b) => acc + b.priceUsd, 0);

  // Subtotal
  const subtotalUsd = framePriceUsd + lensTypePriceUsd + lensIndexPriceUsd + coatingsPriceUsd + bumpsPriceUsd;
  const subtotalSar = Math.round(subtotalUsd * 3.75);

  // Discount calculation (20% off lenses & coatings with ENVISION20)
  const totalLensPortionUsd = lensTypePriceUsd + lensIndexPriceUsd + coatingsPriceUsd + 20; // guaranteed minimum discount base
  const discountUsd = isCouponApplied ? Math.round(totalLensPortionUsd * 0.20) : 0;
  const discountSar = Math.round(discountUsd * 3.75);

  // Shipping
  const shippingUsd = formData.shippingSpeed === "vip_white_glove" ? 15 : 0;
  const shippingSar = Math.round(shippingUsd * 3.75);

  // Final Total
  const finalTotalUsd = Math.max(0, subtotalUsd - discountUsd + shippingUsd);
  const finalTotalSar = Math.round(finalTotalUsd * 3.75);

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "ENVISION20" || couponCode.trim().toUpperCase() === "VIP20") {
      setIsCouponApplied(true);
      setCouponError(null);
    } else {
      setIsCouponApplied(false);
      setCouponError(isArabic ? "رمز غير صالح. استخدم ENVISION20 للحصول على خصم ٢٠٪" : "Invalid coupon code. Try ENVISION20 for 20% OFF");
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) {
      errors.fullName = isArabic ? "الاسم الكامل مطلوب" : "Full name is required";
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      errors.email = isArabic ? "بريد إلكتروني صالح مطلوب" : "Valid email is required";
    }
    if (!formData.phone.trim() && !formData.whatsapp.trim()) {
      errors.phone = isArabic ? "رقم الهاتف أو الواتساب مطلوب" : "Phone or WhatsApp is required";
    }
    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = isArabic ? "عنوان التوصيل مطلوب" : "Delivery address is required";
    }
    if (!formData.city.trim()) {
      errors.city = isArabic ? "المدينة مطلوبة" : "City is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);

    setTimeout(() => {
      const orderId = "ENV-" + Math.floor(100000 + Math.random() * 900000);
      const placedOrder: PlacedOrderSummary = {
        orderId,
        orderDate: new Date().toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        customer: formData,
        frame: {
          id: frame.id,
          name: frame.frame_name || frame.model_name || "Envision Bespoke Frame",
          brand: frame.brand || "Envision",
          priceUsd: framePriceUsd,
          priceSar: framePriceSar,
          imageUrl: frame.media_url
        },
        lensType,
        lensIndex,
        lensUpgrades,
        prescription,
        selectedBumps,
        subtotalUsd,
        subtotalSar,
        discountUsd,
        discountSar,
        shippingUsd,
        shippingSar,
        totalUsd: finalTotalUsd,
        totalSar: finalTotalSar,
        couponCodeApplied: isCouponApplied ? couponCode.toUpperCase() : null,
        biometricSummary: analysisResult ? {
          faceShape: analysisResult.faceShape,
          faceShapeAr: analysisResult.faceShapeAr,
          ipd: analysisResult.interpupillaryDistance,
          symmetry: Math.round(analysisResult.symmetry * 100)
        } : undefined
      };

      setIsProcessing(false);
      onOrderPlaced(placedOrder);
    }, 1200);
  };

  if (!isOpen || !frame) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#111111] border border-brand-gold/30 rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Funnel Bar */}
        <div className="bg-gradient-to-r from-[#1f190e] via-[#2d2212] to-[#1f190e] border-b border-brand-gold/30 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-white tracking-wide flex items-center gap-2">
                {isArabic ? "بوابة الدفع والتفصيل البصري الآمن" : "Secure Precision Optical Checkout"}
              </h3>
              <span className="font-mono text-[10px] text-brand-gold uppercase tracking-wider block">
                {isArabic ? "تشفير بنكي ٢٥٦-بت | ضمان استرجاع ٣٠ يوماً" : "256-BIT SSL ENCRYPTED • 30-DAY MONEY-BACK GUARANTEE"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Column Layout */}
        <div className="overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Customer Details & Payment (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleCompleteOrder} id="checkout-form" className="space-y-6">
              
              {/* Section 1: Customer Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="font-serif text-base text-white font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-gold" />
                    <span>{isArabic ? "١. بيانات العميل والتواصل" : "1. Customer Contact Details"}</span>
                  </h4>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {isArabic ? "لإرسال تفاصيل التتبع والفاتورة" : "For Rx verification & tracking"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      {isArabic ? "الاسم الكامل *" : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isArabic ? "محمد العتيبي" : "Sarah Jenkins"}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/15 focus:border-brand-gold rounded p-2.5 text-sm text-white font-sans focus:outline-none transition-colors"
                    />
                    {formErrors.fullName && <p className="text-red-400 text-xs mt-1">{formErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      {isArabic ? "البريد الإلكتروني *" : "Email Address *"}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="client@envision.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/15 focus:border-brand-gold rounded p-2.5 text-sm text-white font-sans focus:outline-none transition-colors"
                    />
                    {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      {isArabic ? "رقم الهاتف / الواتساب *" : "Phone / WhatsApp *"}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+966 50 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsapp: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/15 focus:border-brand-gold rounded p-2.5 text-sm text-white font-sans focus:outline-none transition-colors"
                    />
                    {formErrors.phone && <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      {isArabic ? "ملاحظات طبية خاصة (اختياري)" : "Special Ophthalmic Notes"}
                    </label>
                    <input
                      type="text"
                      placeholder={isArabic ? "مثال: حساسية الضوء العالية" : "e.g., Sensitive to glare"}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/15 focus:border-brand-gold rounded p-2.5 text-sm text-white font-sans focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery & Shipping Address */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="font-serif text-base text-white font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-gold" />
                    <span>{isArabic ? "٢. عنوان التوصيل والشحن" : "2. Shipping Address & Delivery Speed"}</span>
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      {isArabic ? "عنوان الشارع والحي *" : "Street Address & District *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isArabic ? "طريق الملك فهد، حي النخيل، مبنى ٤٢" : "742 Evergreen Terrace, Suite 100"}
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-white/15 focus:border-brand-gold rounded p-2.5 text-sm text-white font-sans focus:outline-none transition-colors"
                    />
                    {formErrors.addressLine1 && <p className="text-red-400 text-xs mt-1">{formErrors.addressLine1}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                        {isArabic ? "المدينة *" : "City *"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isArabic ? "الرياض" : "New York"}
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-white/15 focus:border-brand-gold rounded p-2.5 text-sm text-white font-sans focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                        {isArabic ? "الدولة" : "Country"}
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-white/15 rounded p-2.5 text-sm text-white font-sans focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                        {isArabic ? "الرمز البريدي" : "Postal Code"}
                      </label>
                      <input
                        type="text"
                        placeholder="11564"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-white/15 focus:border-brand-gold rounded p-2.5 text-sm text-white font-sans focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Shipping Method Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div
                      onClick={() => setFormData({ ...formData, shippingSpeed: "express" })}
                      className={`p-3 border rounded cursor-pointer transition-all flex items-center justify-between ${
                        formData.shippingSpeed === "express"
                          ? "border-brand-gold bg-brand-gold/10"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-brand-gold" />
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {isArabic ? "شحن سريع مؤمن (Express)" : "Complimentary Insured Express"}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {isArabic ? "خلال ٢ - ٤ أيام عمل" : "Delivered in 2-4 business days"}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-emerald-400 font-bold">
                        {isArabic ? "مجاناً" : "FREE"}
                      </span>
                    </div>

                    <div
                      onClick={() => setFormData({ ...formData, shippingSpeed: "vip_white_glove" })}
                      className={`p-3 border rounded cursor-pointer transition-all flex items-center justify-between ${
                        formData.shippingSpeed === "vip_white_glove"
                          ? "border-brand-gold bg-brand-gold/10"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {isArabic ? "توصيل VIP وتجربة شخصية" : "Priority White-Glove VIP"}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {isArabic ? "شحن ذو أولوية فائقة + تغليف هدايا" : "Next-day optical lab priority"}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-brand-gold font-bold">
                        {isArabic ? "+56 ر.س" : "+$15"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Section 3: Payment Method */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="font-serif text-base text-white font-medium flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-brand-gold" />
                    <span>{isArabic ? "٣. طريقة الدفع الآمنة" : "3. Payment Method"}</span>
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isArabic ? "مدفوعات مؤمنة بالكامل" : "Guaranteed Secure"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "card", labelEn: "Credit / Mada", labelAr: "بطاقة ائتمان / مدى", icon: "💳" },
                    { id: "apple_pay", labelEn: "Apple Pay", labelAr: "أبل باي (Apple Pay)", icon: "" },
                    { id: "tabby_installments", labelEn: "Tabby 4-Split", labelAr: "تابي (٤ أقساط)", icon: "✨" },
                    { id: "cod", labelEn: "Cash on Delivery", labelAr: "الدفع عند الاستلام", icon: "💵" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: p.id as any })}
                      className={`p-3 border rounded text-center transition-all ${
                        formData.paymentMethod === p.id
                          ? "border-brand-gold bg-brand-gold/10 text-white"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20"
                      }`}
                    >
                      <span className="text-base block mb-1">{p.icon}</span>
                      <span className="text-xs font-serif block font-medium">
                        {isArabic ? p.labelAr : p.labelEn}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Card input simulation if card selected */}
                {formData.paymentMethod === "card" && (
                  <div className="p-4 bg-black/50 border border-white/10 rounded space-y-3 mt-2">
                    <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                      <span>{isArabic ? "تفاصيل البطاقة (تجريبي فوري)" : "Card Details (Instant Simulation)"}</span>
                      <div className="flex gap-1.5 text-zinc-300 font-bold text-[10px]">
                        <span>VISA</span>
                        <span>•</span>
                        <span>MASTERCARD</span>
                        <span>•</span>
                        <span>MADA</span>
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={cardInfo.cardNumber}
                        onChange={(e) => setCardInfo({ ...cardInfo, cardNumber: e.target.value })}
                        className="w-full bg-[#0f0f0f] border border-white/10 p-2 text-xs font-mono text-white rounded focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={cardInfo.expiry}
                        onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                        placeholder="MM/YY"
                        className="w-full bg-[#0f0f0f] border border-white/10 p-2 text-xs font-mono text-white rounded focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="password"
                        value={cardInfo.cvc}
                        onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                        placeholder="CVC"
                        className="w-full bg-[#0f0f0f] border border-white/10 p-2 text-xs font-mono text-white rounded focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Tabby 4 split explanation */}
                {formData.paymentMethod === "tabby_installments" && (
                  <div className="p-4 bg-[#3EFEBA]/10 border border-[#3EFEBA]/30 rounded text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-[#3EFEBA]">
                      <span>{isArabic ? "قسّم فاتورتك على ٤ دفعات بدون فوائد" : "Split into 4 interest-free payments"}</span>
                      <span>{isArabic ? `${Math.round(finalTotalSar / 4)} ر.س / شهر` : `$${(finalTotalUsd / 4).toFixed(2)}/mo`}</span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">
                      {isArabic ? "متوافق مع أحكام الشريعة وبدون رسوم تأخير." : "No interest, no hidden fees, instant approval."}
                    </p>
                  </div>
                )}
              </div>

            </form>
          </div>

          {/* Right Column: Order Review, Coupon & Conversion Trigger (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-lg border border-white/10 space-y-5 bg-gradient-to-b from-[#141414] to-[#0A0A0A]">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-serif text-lg text-white font-medium">
                  {isArabic ? "ملخص طلبك المصمم خصيصاً" : "Your Bespoke Optical Order"}
                </h4>
                <span className="font-mono text-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded">
                  {isArabic ? "مطابقة حيوية" : "AI Tailored"}
                </span>
              </div>

              {/* Matched Frame Item */}
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded">
                <div className="w-16 h-12 bg-black/60 rounded flex items-center justify-center p-1 shrink-0 border border-white/5">
                  {frame.media_url ? (
                    <img src={frame.media_url} alt="Frame" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <Eye className="w-6 h-6 text-brand-gold" />
                  )}
                </div>
                <div className="flex-grow">
                  <h5 className="font-serif text-sm font-medium text-white capitalize">
                    {frame.frame_name || frame.model_name || "Envision 2061"}
                  </h5>
                  <p className="font-mono text-[10px] text-zinc-400 uppercase">
                    {frame.brand || "Envision"} • {frame.material || "Titanium & Acetate"}
                  </p>
                </div>
                <div className="text-right font-mono text-xs font-semibold text-white">
                  {isArabic ? `${framePriceSar} ر.س` : `$${framePriceUsd}`}
                </div>
              </div>

              {/* Configured Lens & Tech Package */}
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded space-y-2 text-xs">
                <div className="flex justify-between items-center text-zinc-300 font-mono">
                  <span>{isArabic ? "نوع العدسة:" : "Lens Optical Type:"}</span>
                  <span className="text-white capitalize">{lensType.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-300 font-mono">
                  <span>{isArabic ? "معامل السماكة:" : "Lens Index:"}</span>
                  <span className="text-brand-gold capitalize">{lensIndex.replace("_", " ")}</span>
                </div>

                {/* Coatings list */}
                <div className="border-t border-white/5 pt-2 space-y-1 text-[11px] text-zinc-400">
                  {lensUpgrades.blueLightCut && (
                    <div className="flex justify-between items-center text-sky-300">
                      <span>✓ {isArabic ? "درع الضوء الأزرق للشاشات" : "Blue-Light Guard"}</span>
                      <span>{isArabic ? "+169 ر.س" : "+$45"}</span>
                    </div>
                  )}
                  {lensUpgrades.hydrophobicAntiGlare && (
                    <div className="flex justify-between items-center text-emerald-300">
                      <span>✓ {isArabic ? "طلاء مضاد للوهج والماء" : "Hydrophobic Anti-Glare"}</span>
                      <span>{isArabic ? "+131 ر.س" : "+$35"}</span>
                    </div>
                  )}
                  {lensUpgrades.photochromicTransitions && (
                    <div className="flex justify-between items-center text-amber-300">
                      <span>✓ {isArabic ? "عدسات متكيفة مع الشمس (فوتوكروميك)" : "Photochromic Transitions"}</span>
                      <span>{isArabic ? "+300 ر.س" : "+$80"}</span>
                    </div>
                  )}
                  {lensUpgrades.highIndex && (
                    <div className="flex justify-between items-center text-brand-gold">
                      <span>✓ {isArabic ? "صقل حواف مضغوط خفيف" : "High-Index Slim Profile"}</span>
                      <span>{isArabic ? "+356 ر.س" : "+$95"}</span>
                    </div>
                  )}
                </div>

                {/* Prescription preview */}
                <div className="border-t border-white/5 pt-2 text-[10px] font-mono text-zinc-400 flex justify-between">
                  <span>OD: {prescription.odSph || "0.00"} / {prescription.odCyl || "0.00"}</span>
                  <span>OS: {prescription.osSph || "0.00"} / {prescription.osCyl || "0.00"}</span>
                  <span className="text-brand-gold font-bold">PD: {prescription.pd || "64"}mm</span>
                </div>
              </div>

              {/* Order Bumps List if any */}
              {selectedBumps.length > 0 && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded space-y-1.5 text-xs">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 font-bold block">
                    {isArabic ? "الملحقات المختارة:" : "Selected VIP Add-ons:"}
                  </span>
                  {selectedBumps.map((b) => (
                    <div key={b.id} className="flex justify-between items-center text-[11px] text-zinc-300">
                      <span>{b.icon} {isArabic ? b.nameAr : b.nameEn}</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {isArabic ? `${b.priceSar} ر.س` : `$${b.priceUsd}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon Code Input */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  {isArabic ? "كود الخصم الترويجي" : "Promo / Voucher Code"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="ENVISION20"
                    className="flex-grow bg-[#0c0c0c] border border-white/15 focus:border-brand-gold rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-white/10 hover:bg-brand-gold hover:text-white text-white px-3 py-1.5 rounded text-xs font-mono uppercase font-semibold transition-colors cursor-pointer"
                  >
                    {isArabic ? "تطبيق" : "Apply"}
                  </button>
                </div>
                {isCouponApplied && (
                  <p className="text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {isArabic ? "تم تطبيق خصم ٢٠٪ على باقة العدسات!" : "20% Optical Discount Applied!"}
                  </p>
                )}
                {couponError && <p className="text-red-400 text-[11px]">{couponError}</p>}
              </div>

              {/* Price Calculation Tally */}
              <div className="border-t border-white/10 pt-3 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>{isArabic ? "المجموع الفرعي:" : "Subtotal:"}</span>
                  <span>{isArabic ? `${subtotalSar} ر.س` : `$${subtotalUsd.toFixed(2)}`}</span>
                </div>

                {discountUsd > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>{isArabic ? "خصم الباقة الحيوية (٢٠٪):" : "VIP Funnel Discount (20%):"}</span>
                    <span>{isArabic ? `-${discountSar} ر.س` : `-$${discountUsd.toFixed(2)}`}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-400">
                  <span>{isArabic ? "الشحن والتأمين البصري:" : "Insured Express Shipping:"}</span>
                  <span className={shippingUsd === 0 ? "text-emerald-400 font-semibold" : "text-white"}>
                    {shippingUsd === 0 
                      ? (isArabic ? "مجاناً (عرض اليوم)" : "FREE (Special Offer)") 
                      : (isArabic ? `${shippingSar} ر.س` : `$${shippingUsd}`)}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="font-serif text-base text-white block">
                      {isArabic ? "المجموع النهائي الكامل:" : "Total Investment:"}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {isArabic ? "شامل الضريبة والعلبة والضمان" : "Includes Frame, Lenses & Case"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-2xl md:text-3xl text-brand-gold font-bold block">
                      {isArabic ? `${finalTotalSar} ر.س` : `$${finalTotalUsd.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Big High-Converting CTA Submit Button */}
              <button
                type="button"
                onClick={handleCompleteOrder}
                disabled={isProcessing}
                className="w-full py-4 px-6 bg-brand-gold hover:bg-brand-gold/90 text-white font-serif text-base font-bold rounded-lg shadow-[0_0_25px_color-mix(in_srgb,var(--color-brand-gold)_30%,transparent)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 tracking-wide"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
                    <span>{isArabic ? "جاري تشفير وتأكيد تفصيل الطلب..." : "Locking In Custom Prescription..."}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{isArabic ? "تأكيد الطلب وبدء التصنيع فوراً" : "Complete Order & Begin Lab Crafting"}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </button>

              {/* Reassurance text */}
              <div className="text-center space-y-1">
                <p className="text-[11px] text-zinc-400 font-mono flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {isArabic 
                    ? "ضمان ملاءمة واسترجاع كامل لمدة ٣٠ يوماً بدون مخاطرة" 
                    : "100% Optical Fit Guarantee • 30 Days Free Return"}
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
