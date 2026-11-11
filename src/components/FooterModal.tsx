/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, Shield, FileText, Cpu, CheckCircle } from "lucide-react";

interface FooterModalProps {
  isOpen: boolean;
  type: "privacy" | "terms" | "tech" | null;
  onClose: () => void;
  isArabic: boolean;
}

export default function FooterModal({ isOpen, type, onClose, isArabic }: FooterModalProps) {
  if (!isOpen || !type) return null;

  const getContent = () => {
    switch (type) {
      case "privacy":
        return {
          title: isArabic ? "سياسة الخصوصية" : "PRIVACY POLICY",
          subtitle: isArabic ? "أمن وسرية معالجة ملامح الوجه" : "Biometric Face Scanning Security & Privacy Protection",
          icon: <Shield className="w-8 h-8 text-brand-gold" />,
          sections: [
            {
              title: isArabic ? "أمن فحص الوجه البيومتري" : "Biometric Face Scanning Security",
              content: isArabic 
                ? "عند إجراء تحليل الوجه، يقوم الماسح ثلاثي الأبعاد عالي الدقة لدينا بالتقاط نسب ملامح وجهك، والمسافة بين حدقتي العين (PD)، ومعالم الوجه الأساسية. يتم تحويل هذه البيانات فوراً إلى متجهات رياضية مجهولة الهوية (مصفوفات رقمية)."
                : "When you perform the face analysis, our custom 3D high-resolution scanner captures your facial feature ratios, interpupillary distance (PD), and facial landmarks. This data is converted immediately into anonymous math vectors (numerical matrices)."
            },
            {
              title: isArabic ? "عدم تخزين الصور على السحابة" : "Zero Image Storage on Cloud",
              content: isArabic
                ? "لقطات الكاميرا المباشرة وتغذية الفيديو لا تغادر جهازك المحلي أبداً. يتم معالجة بكسلات الفيديو الفعلية بنسبة ١٠٠٪ على الجهاز في الوقت الفعلي، وتُستخدم فقط المعلمات الرقمية المستخرجة لتخصيص النظارات."
                : "Your live camera images/video feed never leave your local device. The actual video frame pixels are processed 100% on-device in real-time, and only the derived numerical parameters are used to customize your eyewear."
            },
            {
              title: isArabic ? "قبو Supabase الآمن وتشفير البيانات" : "Private Supabase Vault & Encryption",
              content: isArabic
                ? "يتم تأمين جميع المقاييس الرقمية المحفوظة، واختيارات النظارات المخصصة، وحسابات المستخدمين داخل قاعدة بيانات مشفرة بالكامل وخاضعة لحماية أمنية صارمة على مستوى الصف (RLS). لا يمكن لأي جهة عامة أو طرف ثالث غير مصرح له أو معلن خارجي الوصول إلى بياناتك أو الاستعلام عنها."
                : "All saved numerical metrics, custom eyewear selections, and user accounts are secured within a military-grade, fully encrypted database protected by Row-Level Security (RLS). No public viewer, unauthorized third party, or external advertiser can ever access or query your data."
            },
            {
              title: isArabic ? "الامتثال للأنظمة العالمية وحماية البيانات" : "GDPR & HIPAA Compliance Alignment",
              content: isArabic
                ? "نحن نحترم حقك في محو البيانات والتحكم بخصوصيتك. يمكنك تسجيل الخروج بأمان في أي وقت، أو الاتصال بنا لحذف ملفك الشخصي البصري والبيانات المرتبطة به تماماً من خوادمنا على الفور وبشكل دائم."
                : "We respect your right to be forgotten and control your privacy. You can securely sign out or contact us to completely delete your optical profile and associated data from our servers instantly and permanently."
            }
          ]
        };
      case "terms":
        return {
          title: isArabic ? "شروط الخدمة" : "TERMS OF SERVICE",
          subtitle: isArabic ? "الاتفاقية القانونية وشروط الاستخدام البصري" : "Legal Agreement & Optical Terms of Use",
          icon: <FileText className="w-8 h-8 text-brand-gold" />,
          sections: [
            {
              title: isArabic ? "موافقة التقييم البيومتري" : "Biometric Assessment Consent",
              content: isArabic
                ? "من خلال إطلاق محرك تخطيط الوجه ثلاثي الأبعاد، فإنك توافق صراحة على الالتقاط المؤقت والمعالجة الرياضية لنسب وجهك بهدف مواءمة أحجام الإطارات وعدسات النظارات الطبية المخصصة فقط."
                : "By launching the 3D facial geometry scanning engine, you explicitly consent to the temporary capture and mathematical processing of your facial proportions solely for tailoring optical frame sizes and lens dimensions."
            },
            {
              title: isArabic ? "لا يوجد ضمان طبي أو حيوي" : "No Medical / Clinical Guarantee",
              content: isArabic
                ? "المقاييس المستخرجة من هذا التطبيق (بما في ذلك الحساب الرقمي للمسافة بين الحدقتين) يتم حسابها باستخدام خوارزميات رؤية حاسوبية متقدمة. على الرغم من دقتها العالية لملائمة الإطار، إلا أنها لا تحل محل الفحص الطبي الشامل لصحة العين من قبل طبيب عيون أو أخصائي بصريات مرخص."
                : "The measurements derived from this application (including the automatic digital interpupillary distance calculation) are calculated using advanced computer vision heuristics. While highly precise for structural frame fit, they do not replace a full, clinical eye health exam by an ophthalmologist or licensed optometrist."
            },
            {
              title: isArabic ? "قيود الاستخدام الشخصي والتجاري" : "Personal & Commercial Use Limits",
              content: isArabic
                ? "التوصيات البصرية المقدمة هي لإرشادك الشخصي. أنت توافق على عدم استغلال محرك التصميم المملوك لنا، أو الأصول ثلاثية الأبعاد، أو معلمات رندرة الإطار، أو الخوارزميات لأغراض تجارية غير مصرح بها."
                : "The optical recommendations provided are for your personal guidance. You agree not to exploit our proprietary design engine, 3D assets, frame rendering parameters, or algorithms for unauthorized commercial purposes."
            },
            {
              title: isArabic ? "أمن الحساب والمصادقة" : "Supabase Protected Account Security",
              content: isArabic
                ? "أنت مسؤول عن الحفاظ على سرية معلومات تسجيل الدخول الخاصة بك عند إنشاء ملفك الشخصي البصري الحيوي. يجب الإبلاغ عن أي نشاط غير مصرح به فوراً لحماية أمن المنصة."
                : "You are responsible for maintaining the confidentiality of your credentials when creating your clinical optical profile. Any unauthorized activity should be reported immediately to protect platform security."
            }
          ]
        };
      case "tech":
        return {
          title: isArabic ? "المواصفات التقنية" : "TECHNICAL SPECIFICATIONS",
          subtitle: isArabic ? "الخوارزميات والبنية التحتية لمعالجة الصور" : "Imaging Algorithms & Infrastructure Specs",
          icon: <Cpu className="w-8 h-8 text-brand-gold" />,
          sections: [
            {
              title: isArabic ? "خوارزمية كشف معالم الوجه" : "Facial Landmark Detection Algorithm",
              content: isArabic
                ? "تعتمد على شبكات عصبية تلافيفية خفيفة الوزن ومحسنة للويب تعمل عبر بيئات WebGL/WebAssembly لضمان دقة تتبع المعالم بأجزاء من المليمتر دون الحاجة لمعالجة سحابية ثقيلة."
                : "Built on lightweight web-optimized convolutional neural networks running in WebGL/WebAssembly for sub-millimeter landmark tracking accuracy directly within the user's browser."
            },
            {
              title: isArabic ? "محرك المسافة الفراغية بين الحدقتين (PD)" : "Spatial Interpupillary Distance (PD) Engine",
              content: isArabic
                ? "يستخدم إسقاطات هندسية فراغية معروفة ومقارنات الأهداف المادية، مع التسامح في دقة القياس بنسبة ±0.5 ملم تحت ظروف الإضاءة الأمامية المباشرة والواضحة."
                : "Utilizes known spatial projection geometry and physical target comparisons, measuring with a precision tolerance of ±0.5mm in clear frontal lighting conditions."
            },
            {
              title: isArabic ? "محرك رندرة وإسقاط الإطارات" : "Besoke Frame Rendering Engine",
              content: isArabic
                ? "مدعوم ببروتوكولات تسريع الأجهزة ثنائية وثنائية ونصف الأبعاد على وسم HTML5 Canvas، حيث يتم مطابقة موديلات النظارات المصممة حسب المقاس مع إحداثيات حدقة العين المكتشفة، وزوايا الدوران (Yaw/Pitch/Roll)، ومؤشرات عمق المسافة في الوقت الفعلي."
                : "Powered by hardware-accelerated 2D/3D projection on an HTML5 canvas, mapping the bespoke eyeglasses models to detected pupil coordinates, rotation yaw/pitch/roll angles, and depth scale indicators in real-time."
            },
            {
              title: isArabic ? "بروتوكول التشفير السحابي والتحقق" : "Encryption Protocol & Vault Security",
              content: isArabic
                ? "تستخدم جميع حمولات واجهة برمجة التطبيقات (API) واتصالات قاعدة البيانات بروتوكولات تشفير TLS 1.3 أثناء النقل، مع قفل الأصول البرمجية على الخوادم في بيئات Supabase المحمية بضوابط تحقق مشفرة عبر الرموز المميزة (JWT)."
                : "All API payloads and database connections utilize TLS 1.3 encryption transit protocols, with server-side assets locked inside secure Supabase environments using JWT-authorized endpoint controls."
            }
          ]
        };
      default:
        return null;
    }
  };

  const data = getContent();
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-2xl bg-white border border-gray-200 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col max-h-[90vh] text-left animate-in zoom-in-95 duration-300"
        style={{ direction: isArabic ? "rtl" : "ltr" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 pb-5 mb-5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-gold/10 border border-brand-gold/30 rounded-xl shrink-0">
              {data.icon}
            </div>
            <div>
              <span className="font-sans text-[11px] text-brand-gold font-bold tracking-wider uppercase block mb-1">
                {isArabic ? "مستند قانوني وتطبيقي" : "Legal Documentation"}
              </span>
              <h2 className="text-xl md:text-2xl font-serif text-[#111827] font-semibold tracking-tight">
                {data.title}
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                {data.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-500 hover:text-[#111827] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-2 pl-2 space-y-6 flex-1 custom-scrollbar scrollbar-thin">
          {data.sections.map((section, idx) => (
            <div 
              key={idx} 
              className="space-y-1.5 border-l-2 border-l-brand-gold pl-4 pr-1 rtl:border-l-0 rtl:border-r-2 rtl:border-r-brand-gold rtl:pr-4 rtl:pl-1 py-1"
            >
              <h3 className="text-sm font-sans font-semibold text-[#111827] tracking-tight flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-gold shrink-0" />
                {section.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-sans">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 mt-5 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-white font-sans text-xs tracking-wider uppercase font-medium rounded-xl transition-all cursor-pointer shadow-xs"
          >
            {isArabic ? "إغلاق نافذة العرض" : "Dismiss Document"}
          </button>
        </div>
      </div>
    </div>
  );
}
