import React from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Eye, 
  UserCheck, 
  Clock, 
  Glasses, 
  Percent, 
  CalendarCheck,
  CheckCircle2
} from "lucide-react";

interface FunnelTrustBadgesProps {
  isArabic: boolean;
  discountPercent?: number;
}

export default function FunnelTrustBadges({
  isArabic,
  discountPercent = 10
}: FunnelTrustBadgesProps) {
  const storePerks = [
    {
      icon: <Glasses className="w-5 h-5 text-brand-gold" />,
      titleEn: "Reserved In-Store VIP Tray",
      titleAr: "تجهيز صندوق عرض خاص VIP باسمك في المتجر",
      descEn: "Your AI-matched frame & curated alternates prepared on a velvet tray prior to your arrival.",
      descAr: "يتم تعقيم وتجهيز النظارات المطابقة لملامحك في صندوق عرض خاص بانتظار تشريفك للمتجر."
    },
    {
      icon: <Eye className="w-5 h-5 text-emerald-400" />,
      titleEn: "Free Clinical Optometrist Exam",
      titleAr: "فحص بصر طبي شامل ومجاني",
      descEn: "Complete vision refraction & prescription calibration with licensed opticians ($65 value, free with pass).",
      descAr: "فحص سريري متكامل لقوة النظر وتحديد مسافة بؤبؤ العين الدقيقة مع أخصائي البصريات مجاناً."
    },
    {
      icon: <Percent className="w-5 h-5 text-brand-gold" />,
      titleEn: `Guaranteed ${discountPercent}% In-Store Discount`,
      titleAr: `خصم ${discountPercent}٪ مضمون في المتجر`,
      descEn: `Present your digital reservation pass at our optical boutique to claim your exclusive ${discountPercent}% discount.`,
      descAr: `أظهر رمز الـ QR أو القسيمة الرقمية عند زيارة الفرع للحصول على خصم ${discountPercent}٪ الفوري على الإطار والعدسات.`
    },
    {
      icon: <UserCheck className="w-5 h-5 text-sky-400" />,
      titleEn: "Bespoke Ergonomic Hand-Fitting",
      titleAr: "ضبط وضبط انحناء النظارة يدوياً",
      descEn: "Custom nose-pad calibration and temple alignment to guarantee zero slipping and zero ear fatigue.",
      descAr: "تعديل زوايا وسادات الأنف وذراعي النظارة هندسياً لتناسب أبعاد وجهك بنسبة ١٠٠٪ دون ضغط."
    }
  ];

  return (
    <div className="space-y-6 pt-4">
      
      {/* 4 In-Store Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {storePerks.map((perk, idx) => (
          <div 
            key={idx}
            className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-brand-gold shadow-xs transition-colors flex flex-col justify-between space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
              {perk.icon}
            </div>
            <div>
              <h5 className="font-serif text-sm font-semibold text-[#111827] tracking-tight">
                {isArabic ? perk.titleAr : perk.titleEn}
              </h5>
              <p className="text-xs text-gray-500 font-sans leading-relaxed mt-1">
                {isArabic ? perk.descAr : perk.descEn}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-sans text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isArabic ? "مشمول مجاناً في حجزك" : "Included with VIP Pass"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* No-Risk In-Store Reassurance */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h6 className="font-serif text-sm font-semibold text-[#111827]">
              {isArabic ? "تجربة فاخرة في المعرض بدون أي التزام بالشراء" : "Zero Obligation VIP In-Store Try-On Experience"}
            </h6>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              {isArabic 
                ? "تفضل بزيارة الفرع، جرب النظارة بنفسك وتأكد من ملاءمتها لملامحك، ثم قرر براحتك مع الاحتفاظ بخصمك." 
                : "Try the curated frames on in person, test lens options with our opticians, and apply your 10% discount if you wish to purchase."}
            </p>
          </div>
        </div>

        <div className="font-sans text-xs text-brand-gold bg-brand-gold/10 border border-brand-gold/30 px-3.5 py-1.5 rounded-lg flex items-center gap-2 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{isArabic ? "صلاحية القسيمة: ١٤ يوماً من تاريخ الحجز" : "Voucher Valid For 14 Days"}</span>
        </div>
      </div>

    </div>
  );
}
