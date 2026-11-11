import React, { useState } from "react";
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Sun, 
  Eye, 
  Glasses, 
  Zap, 
  Plus, 
  CheckCircle2,
  PackageCheck,
  Award,
  Stethoscope
} from "lucide-react";
import { 
  LensUpgrades, 
  LensTypeOption, 
  LensIndexOption, 
  OrderBumpItem 
} from "../types";

interface LensBuilderProps {
  lifestyleFocus: string;
  isArabic: boolean;
  onUpgradeChange: (upgrades: LensUpgrades) => void;
  onLensTypeChange?: (lensType: LensTypeOption) => void;
  onLensIndexChange?: (lensIndex: LensIndexOption) => void;
  onBumpsChange?: (bumps: OrderBumpItem[]) => void;
  selectedLensType?: LensTypeOption;
  selectedLensIndex?: LensIndexOption;
  selectedBumps?: OrderBumpItem[];
  discountPercent?: number;
}

export const AVAILABLE_ORDER_BUMPS: OrderBumpItem[] = [
  {
    id: "titanium_travel_case",
    nameEn: "Bespoke Hard Travel Vault + Microfiber Care Kit",
    nameAr: "علبة السفر الصلبة الفاخرة + حقيبة العناية بالألياف الدقيقة",
    descEn: "Machined aerospace shell lined with velvet to protect your handcrafted frame anywhere.",
    descAr: "هيكل معدني قوي مبطن بالمخمل لحماية نظارتك الفاخرة أثناء السفر والتنقل.",
    priceUsd: 15,
    priceSar: 56,
    originalPriceUsd: 35,
    originalPriceSar: 131,
    icon: "📦"
  },
  {
    id: "accidental_damage_warranty",
    nameEn: "1-Year Optical Scratch & Total Loss Protection",
    nameAr: "ضمان حماية لمدة عام ضد الخدوش والكسر الشامل",
    descEn: "100% no-questions-asked replacement for lens scratches, frame drops, or accidental damage.",
    descAr: "استبدال فوري بدون أي أسئلة في حال خدش العدسات أو كسر الإطار أو الحوادث اليومية.",
    priceUsd: 19,
    priceSar: 71,
    originalPriceUsd: 49,
    originalPriceSar: 184,
    icon: "🛡️"
  },
  {
    id: "antifog_nano_wipes",
    nameEn: "100-Pack Nano Anti-Fog & Anti-Static Optical Wipes",
    nameAr: "عبوة ١٠٠ مسحة نانو مضادة للضباب والكهرباء الساكنة",
    descEn: "Hospital-grade streak-free clarity that prevents fogging during hot climate transitions.",
    descAr: "تنظيف فائق بنقاء طبي يمنع تكون الضباب والشوائب في الأجواء الحارة والرطبة.",
    priceUsd: 9,
    priceSar: 34,
    originalPriceUsd: 22,
    originalPriceSar: 82,
    icon: "✨"
  }
];

export default function LensBuilder({
  lifestyleFocus,
  isArabic,
  onUpgradeChange,
  onLensTypeChange,
  onLensIndexChange,
  onBumpsChange,
  selectedLensType = "single_vision",
  selectedLensIndex = "thin_160",
  selectedBumps = [],
  discountPercent = 10
}: LensBuilderProps) {
  const [lensType, setLensType] = useState<LensTypeOption>(selectedLensType);
  const [lensIndex, setLensIndex] = useState<LensIndexOption>(selectedLensIndex);

  const [upgrades, setUpgrades] = useState<LensUpgrades>({
    highIndex: selectedLensIndex === "ultrathin_167" || selectedLensIndex === "featherweight_174",
    blueLightCut: true,
    hydrophobicAntiGlare: true,
    photochromicTransitions: false
  });

  const [activeBumps, setActiveBumps] = useState<OrderBumpItem[]>(selectedBumps);

  const handleToggleUpgrade = (key: keyof LensUpgrades) => {
    const next = { ...upgrades, [key]: !upgrades[key] };
    setUpgrades(next);
    onUpgradeChange(next);
  };

  const handleSelectLensType = (type: LensTypeOption) => {
    setLensType(type);
    if (onLensTypeChange) onLensTypeChange(type);
  };

  const handleSelectLensIndex = (idx: LensIndexOption) => {
    setLensIndex(idx);
    if (onLensIndexChange) onLensIndexChange(idx);
    
    // Auto-sync high index flag
    const isHigh = idx === "ultrathin_167" || idx === "featherweight_174";
    const nextUpgrades = { ...upgrades, highIndex: isHigh };
    setUpgrades(nextUpgrades);
    onUpgradeChange(nextUpgrades);
  };

  const handleToggleBump = (bump: OrderBumpItem) => {
    const exists = activeBumps.some(b => b.id === bump.id);
    let next: OrderBumpItem[];
    if (exists) {
      next = activeBumps.filter(b => b.id !== bump.id);
    } else {
      next = [...activeBumps, bump];
    }
    setActiveBumps(next);
    if (onBumpsChange) onBumpsChange(next);
  };

  const lensTypesList: { id: LensTypeOption; nameEn: string; nameAr: string; descEn: string; descAr: string; priceUsd: number; priceSar: number }[] = [
    {
      id: "single_vision",
      nameEn: "Single Vision (Distance / Reading)",
      nameAr: "رؤية أحادية (مسافات أو قراءة)",
      descEn: "Calibrated for clear single-range correction. Demo lenses available at the boutique.",
      descAr: "تصحيح بصري عالي الدقة لمجال رؤية محدد. ستتوفر عدسات تجريبية في الفرع لتجربتها.",
      priceUsd: 0,
      priceSar: 0
    },
    {
      id: "progressive",
      nameEn: "Custom Progressive Multifocal",
      nameAr: "عدسات متعددة البؤر تدريجية (بروجريسيف)",
      descEn: "Seamless corridor from reading to distance vision without lines. Optometrist fitting on-site.",
      descAr: "انتقال سلس ومتدرج بين القراءة والمسافات المتوسطة والبعيدة. سيقوم الأخصائي بضبط ممرات الرؤية لك بالفرع.",
      priceUsd: 79,
      priceSar: 296
    },
    {
      id: "reading",
      nameEn: "Dedicated Near-Work Reading",
      nameAr: "عدسات مخصصة للقراءة والعمل المكتبي",
      descEn: "Wide optical corridor engineered specifically for books, paperwork, and computer screens.",
      descAr: "مجال بصري واسع مخصص للمطالعة والوثائق والأعمال المكتبية والشاشات.",
      priceUsd: 25,
      priceSar: 94
    },
    {
      id: "plano",
      nameEn: "Plano Non-Prescription (Blue-Light Screen Shield)",
      nameAr: "عدسات بدون قياس طبي (لحماية العين من الشاشات)",
      descEn: "Zero power lenses for eye strain protection and pure aesthetic elegance.",
      descAr: "عدسات بلا درجات بصرية مخصصة لحماية العين من إجهاد الشاشات والمظهر العصري.",
      priceUsd: 0,
      priceSar: 0
    }
  ];

  const lensIndexList: { id: LensIndexOption; labelEn: string; labelAr: string; thicknessEn: string; thicknessAr: string; priceUsd: number; priceSar: number; badge?: string }[] = [
    {
      id: "standard_150",
      labelEn: "1.50 Standard Optical Clarity",
      labelAr: "1.50 عدسات قياسية متوازنة",
      thicknessEn: "Ideal for mild prescriptions (0 to ±2.00)",
      thicknessAr: "مثالية للدرجات الخفيفة (0 إلى ±2.00)",
      priceUsd: 0,
      priceSar: 0
    },
    {
      id: "thin_160",
      labelEn: "1.60 Ultra-Thin Impact Resistant",
      labelAr: "1.60 عدسات رقيقة ومقاومة للصدمات",
      thicknessEn: "25% Thinner, highly recommended for daily wear",
      thicknessAr: "أنحف بنسبة ٢٥٪ وموصى بها للاستخدام اليومي",
      priceUsd: 35,
      priceSar: 131,
      badge: isArabic ? "الأكثر طلباً" : "MOST POPULAR"
    },
    {
      id: "ultrathin_167",
      labelEn: "1.67 High-Index Compression",
      labelAr: "1.67 ضغط فائق الرقة وخفيف الوزن",
      thicknessEn: "40% Thinner for stronger prescriptions (±2.50 to ±6.00)",
      thicknessAr: "أنحف بنسبة ٤٠٪ للدرجات المتوسطة والقوية",
      priceUsd: 65,
      priceSar: 244
    },
    {
      id: "featherweight_174",
      labelEn: "1.74 Featherweight Maximum Slim",
      labelAr: "1.74 أنحف عدسة بصرية في العالم (خفة استثنائية)",
      thicknessEn: "55% Thinnest possible profile for high prescriptions (±6.00+)",
      thicknessAr: "أنحف بنسبة ٥٥٪ للدرجات العالية جداً مع مظهر أنيق",
      priceUsd: 110,
      priceSar: 412,
      badge: isArabic ? "أعلى أداء" : "ULTIMATE PERFORMANCE"
    }
  ];

  return (
    <div className="glass-panel p-6 md:p-8 rounded-lg space-y-10 border border-brand-gold/20 bg-[#0C0C0C]/80" id="lens-builder">
      
      {/* Header with In-Store Consultation Focus */}
      <div className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2 text-brand-gold mb-1">
          <Stethoscope className="w-5 h-5" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] font-bold">
            {isArabic ? "تفضيلات استشارة العدسات في المتجر" : "IN-STORE OPTICAL CONSULTATION PREFERENCES"}
          </span>
        </div>
        <h4 className="font-serif text-2xl md:text-3xl text-white tracking-wide">
          {isArabic ? "حدد خيارات العدسات لتجهيز عينات تجربتها بالفرع" : "Select Lens Technologies to Test During Your Visit"}
        </h4>
        <p className="text-zinc-400 text-sm mt-1 max-w-2xl leading-relaxed">
          {isArabic 
            ? `سيقوم أخصائي البصريات في المعرض بتجهيز عينات حقيقية من هذه العدسات والطبقات لتجربتها بنفسك، مع تطبيق خصم الـ ${discountPercent}٪ عند رغبتك بالشراء.`
            : `Our licensed optician will prepare physical demonstration lenses and coatings for your VIP session, with your ${discountPercent}% discount applied to the final build.`}
        </p>
      </div>

      {/* 1. Choose Lens Type */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-serif text-lg text-white font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold font-mono text-xs flex items-center justify-center font-bold">1</span>
            <span>{isArabic ? "نوع العدسة المفضلة للاختبار في المتجر" : "Select Lens Type for In-Store Consultation"}</span>
          </h5>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lensTypesList.map((type) => {
            const isSelected = lensType === type.id;
            return (
              <div
                key={type.id}
                onClick={() => handleSelectLensType(type.id)}
                className={`p-4 border rounded-md cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-brand-gold bg-brand-gold/10 text-white shadow-[0_0_15px_color-mix(in_srgb,var(--color-brand-gold)_15%,transparent)]"
                    : "border-white/10 bg-[#141414] text-zinc-300 hover:border-white/30 hover:bg-[#1a1a1a]"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-serif text-base font-semibold text-white">
                    {isArabic ? type.nameAr : type.nameEn}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-brand-gold font-bold">
                      {type.priceUsd === 0 
                        ? (isArabic ? "مشمول مجاناً" : "Included ($0)") 
                        : (isArabic ? `+${type.priceSar} ر.س` : `+$${type.priceUsd}`)}
                    </span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "border-brand-gold bg-brand-gold text-black" : "border-zinc-600"}`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  {isArabic ? type.descAr : type.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Lens Index / Thickness */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-serif text-lg text-white font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold font-mono text-xs flex items-center justify-center font-bold">2</span>
            <span>{isArabic ? "معامل انكسار وسماكة العدسة (Index)" : "Lens Index & Thickness Compression"}</span>
          </h5>
          <span className="text-[11px] font-mono text-emerald-400">
            {isArabic ? "سيساعدك الأخصائي باختيار السماكة المناسبة لدرجتك" : "Optician will verify exact index in-store"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {lensIndexList.map((idx) => {
            const isSelected = lensIndex === idx.id;
            return (
              <div
                key={idx.id}
                onClick={() => handleSelectLensIndex(idx.id)}
                className={`p-4 border rounded-md cursor-pointer transition-all flex flex-col justify-between relative ${
                  isSelected
                    ? "border-brand-gold bg-brand-gold/10 text-white shadow-[0_0_15px_color-mix(in_srgb,var(--color-brand-gold)_15%,transparent)]"
                    : "border-white/10 bg-[#141414] text-zinc-300 hover:border-white/30 hover:bg-[#1a1a1a]"
                }`}
              >
                {idx.badge && (
                  <span className="absolute -top-2.5 right-3 bg-brand-gold text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {idx.badge}
                  </span>
                )}
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-serif text-sm font-semibold text-white">
                      {isArabic ? idx.labelAr : idx.labelEn}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-zinc-400 font-sans mb-3">
                    {isArabic ? idx.thicknessAr : idx.thicknessEn}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="font-mono text-xs font-bold text-brand-gold">
                    {idx.priceUsd === 0 
                      ? (isArabic ? "مجاناً مع الإطار" : "Free ($0)") 
                      : (isArabic ? `+${idx.priceSar} ر.س` : `+$${idx.priceUsd}`)}
                  </span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-brand-gold bg-brand-gold text-black" : "border-zinc-600"}`}>
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. High-Performance Coating Demonstrations */}
      <div className="space-y-4">
        <h5 className="font-serif text-lg text-white font-medium flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold font-mono text-xs flex items-center justify-center font-bold">3</span>
          <span>{isArabic ? "طبقات الحماية البصرية لتجربتها بالليزر وجهاز المحاكاة" : "Optical Coatings to Test in the Boutique Light Chamber"}</span>
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Blue light */}
          <div
            onClick={() => handleToggleUpgrade("blueLightCut")}
            className={`p-4 border rounded-md cursor-pointer transition-all flex flex-col justify-between ${
              upgrades.blueLightCut
                ? "border-brand-gold bg-brand-gold/10 text-white"
                : "border-white/10 bg-[#141414] text-zinc-300 hover:border-white/30"
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-serif text-sm font-semibold flex items-center gap-2 text-white">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>{isArabic ? "فلتر الضوء الأزرق للشاشات" : "Digital Blue-Light Shield"}</span>
                </span>
                <span className="font-mono text-xs text-brand-gold font-bold">
                  {isArabic ? "+١٦٨ ر.س" : "+$45"}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {isArabic 
                  ? "يحجب ٩٩٪ من إشعاع الضوء الأزرق الصادر من الشاشات لمنع إجهاد العين والصداع." 
                  : "Blocks high-energy 420nm blue spectrum emitted by laptops and mobile screens."}
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-[11px] font-mono">
              <span className="text-zinc-400">{isArabic ? "اختبار الليزر الأزرق بالمتجر" : "In-Store Blue Laser Demo"}</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${upgrades.blueLightCut ? "border-brand-gold bg-brand-gold text-black" : "border-zinc-600"}`}>
                {upgrades.blueLightCut && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* Hydrophobic Anti-Glare */}
          <div
            onClick={() => handleToggleUpgrade("hydrophobicAntiGlare")}
            className={`p-4 border rounded-md cursor-pointer transition-all flex flex-col justify-between ${
              upgrades.hydrophobicAntiGlare
                ? "border-brand-gold bg-brand-gold/10 text-white"
                : "border-white/10 bg-[#141414] text-zinc-300 hover:border-white/30"
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-serif text-sm font-semibold flex items-center gap-2 text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isArabic ? "طبقة نانو عاكسة للوهج والماء" : "Hydrophobic Anti-Glare AR"}</span>
                </span>
                <span className="font-mono text-xs text-brand-gold font-bold">
                  {isArabic ? "+١٣١ ر.س" : "+$35"}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {isArabic 
                  ? "تمنع انعكاس أضواء السيارات ليلاً وتطرد قطرات الماء والغبار لسهولة التنظيف." 
                  : "Diamond anti-reflective multi-coating that repels water, oils, and night glare."}
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-[11px] font-mono">
              <span className="text-zinc-400">{isArabic ? "اختبار مقاومة الماء والخدش" : "Hydrophobic Beading Test"}</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${upgrades.hydrophobicAntiGlare ? "border-brand-gold bg-brand-gold text-black" : "border-zinc-600"}`}>
                {upgrades.hydrophobicAntiGlare && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* Transitions */}
          <div
            onClick={() => handleToggleUpgrade("photochromicTransitions")}
            className={`p-4 border rounded-md cursor-pointer transition-all flex flex-col justify-between ${
              upgrades.photochromicTransitions
                ? "border-brand-gold bg-brand-gold/10 text-white"
                : "border-white/10 bg-[#141414] text-zinc-300 hover:border-white/30"
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-serif text-sm font-semibold flex items-center gap-2 text-white">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>{isArabic ? "عدسات ترانزيشن الذكية للشمس" : "Gen 8 Photochromic Transitions"}</span>
                </span>
                <span className="font-mono text-xs text-brand-gold font-bold">
                  {isArabic ? "+٣٠٠ ر.س" : "+$80"}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {isArabic 
                  ? "تتحول تلقائياً إلى نظارة شمسية داكنة وفلتر UV400 كامل فور التعرض لأشعة الشمس." 
                  : "Fast-adapting transition molecules that darken into deep sunglasses in sunlight."}
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-[11px] font-mono">
              <span className="text-zinc-400">{isArabic ? "تجربة صندوق الأشعة UV بالفرع" : "UV Lightbox Demo in Store"}</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${upgrades.photochromicTransitions ? "border-brand-gold bg-brand-gold text-black" : "border-zinc-600"}`}>
                {upgrades.photochromicTransitions && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Boutique Travel Accessories & Protection Bumps */}
      <div className="space-y-4 pt-2">
        <h5 className="font-serif text-lg text-white font-medium flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold font-mono text-xs flex items-center justify-center font-bold">4</span>
          <span>{isArabic ? "ملحقات العناية المتوفرة للاستلام مع النظارة" : "Optional Boutique Care & Travel Upgrades"}</span>
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {AVAILABLE_ORDER_BUMPS.map((bump) => {
            const isBumpSelected = activeBumps.some(b => b.id === bump.id);
            return (
              <div
                key={bump.id}
                onClick={() => handleToggleBump(bump)}
                className={`p-4 border rounded-md cursor-pointer transition-all flex flex-col justify-between ${
                  isBumpSelected
                    ? "border-brand-gold bg-brand-gold/10 text-white"
                    : "border-white/10 bg-[#141414] text-zinc-300 hover:border-white/30"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="font-serif text-sm font-semibold text-white flex items-center gap-2">
                      <span>{bump.icon}</span>
                      <span>{isArabic ? bump.nameAr : bump.nameEn}</span>
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    {isArabic ? bump.descAr : bump.descEn}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="line-through text-zinc-500">
                      {isArabic ? `${bump.originalPriceSar} ر.س` : `$${bump.originalPriceUsd}`}
                    </span>
                    <span className="font-bold text-brand-gold">
                      {isArabic ? `${bump.priceSar} ر.س` : `$${bump.priceUsd}`}
                    </span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isBumpSelected ? "border-brand-gold bg-brand-gold text-black" : "border-zinc-600"}`}>
                    {isBumpSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
