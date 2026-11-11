import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Sliders, 
  Check, 
  Globe, 
  Camera, 
  Download, 
  Maximize2, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  Layers,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { 
  BiometricAnalysisResult, 
  LensUpgrades, 
  LensTypeOption, 
  LensIndexOption, 
  OrderBumpItem 
} from "../types";
import LensBuilder from "./LensBuilder";
import FunnelTrustBadges from "./FunnelTrustBadges";
import { useShop } from "../context/ShopContext";
import { loadShopInventory, pickBestMediaUrl } from "../lib/inventory";
import { rankFramesForFace } from "../lib/matching";


interface DatabaseTryOnSuiteProps {
  analysisResult: BiometricAnalysisResult;
  isArabic: boolean;
  capturedFrames: {
    center: string | null;
    right: string | null;
    left: string | null;
  };
  setCurrentStep: (step: number) => void;
  selectedProductIndex: number;
  focusOptions: any[];
  lifestyleFocus: string[];
  lifestyleLeisure: string[];
  discountPercent?: number;
  onOpenBooking?: (params: {
    frame: any;
    lensType: LensTypeOption;
    lensIndex: LensIndexOption;
    upgrades: LensUpgrades;
    bumps: OrderBumpItem[];
  }) => void;
  onOpenCheckout?: (params: {
    frame: any;
    lensType: LensTypeOption;
    lensIndex: LensIndexOption;
    upgrades: LensUpgrades;
    bumps: OrderBumpItem[];
  }) => void;
}

export default function DatabaseTryOnSuite({
  analysisResult,
  isArabic,
  capturedFrames,
  setCurrentStep,
  selectedProductIndex,
  focusOptions,
  lifestyleFocus,
  lifestyleLeisure,
  discountPercent = 10,
  onOpenBooking,
  onOpenCheckout
}: DatabaseTryOnSuiteProps) {
  const { shop } = useShop();
  // Supabase Database Inventory & Cloudinary Matching States
  const [dbInventory, setDbInventory] = useState<any[]>([]);
  const [dbInventoryMedia, setDbInventoryMedia] = useState<any[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(false);
  const [matchedEyeglass, setMatchedEyeglass] = useState<any | null>(null);
  const [matchedMediaUrl, setMatchedMediaUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  // Funnel selections
  const [lensType, setLensType] = useState<LensTypeOption>("single_vision");
  const [lensIndex, setLensIndex] = useState<LensIndexOption>("thin_160");
  const [lensUpgrades, setLensUpgrades] = useState<LensUpgrades>({
    highIndex: false,
    blueLightCut: true,
    hydrophobicAntiGlare: true,
    photochromicTransitions: false
  });
  const [selectedBumps, setSelectedBumps] = useState<OrderBumpItem[]>([]);

  // Zoom and Pan States for Enlarge Lightbox
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [zoomOffset, setZoomOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const isDraggingRef = useRef(false);
  const touchStartDistRef = useRef(0);
  const touchStartScaleRef = useRef(1);
  const touchStartCenterRef = useRef({ x: 0, y: 0 });
  const touchStartOffsetRef = useRef({ x: 0, y: 0 });
  const lastTouchRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isImageModalOpen) {
      setZoomScale(1);
      setZoomOffset({ x: 0, y: 0 });
    }
  }, [isImageModalOpen]);

  const fetchAndMatchEyeglass = async (detectedShape: string) => {
    setIsLoadingInventory(true);
    try {
      // Only THIS shop's frames, ranked for the detected face shape
      const { items, media } = await loadShopInventory(shop);
      const ranked = rankFramesForFace(items, detectedShape);
      setDbInventory(ranked);
      setDbInventoryMedia(media);
      const selected = ranked[0];
      if (selected) {
        setMatchedEyeglass(selected);
        setMatchedMediaUrl(pickBestMediaUrl(media, selected.id));
      }
    } catch (err) {
      console.error("Error loading shop inventory:", err);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const handleSelectEyeglass = (item: any) => {
    setMatchedEyeglass(item);
    setMatchedMediaUrl(pickBestMediaUrl(dbInventoryMedia, item.id));
  };

  const getMediaForItem = (itemId: number) => {
    return pickBestMediaUrl(dbInventoryMedia, itemId);
  };

  useEffect(() => {
    if (analysisResult) {
      fetchAndMatchEyeglass(analysisResult.faceShape);
    }
  }, [analysisResult]);

  const triggerCheckout = () => {
    const params = {
      frame: {
        ...matchedEyeglass,
        media_url: matchedMediaUrl
      },
      lensType,
      lensIndex,
      upgrades: lensUpgrades,
      bumps: selectedBumps
    };
    if (onOpenBooking) {
      onOpenBooking(params);
    } else if (onOpenCheckout) {
      onOpenCheckout(params);
    }
  };

  return (
    <div className="space-y-12 pt-8 animate-in fade-in duration-700" id="db-eyewear-suite">
      
      {/* Section Title */}
      <div className="text-center md:text-start border-b border-white/5 pb-4">
        <span className="font-mono text-[10px] text-brand-gold uppercase tracking-[0.3em] font-bold block mb-1">
          {isArabic ? "المرحلة الرابعة: العرض المخصص" : "Phase Four: Core Bespoke Offer"}
        </span>
        <h3 className="font-serif text-2xl md:text-3xl text-white tracking-wide flex items-center justify-center md:justify-start gap-2">
          <Sparkles className="w-5 h-5 text-brand-gold" />
          <span>{isArabic ? "توصية النظارات وباقة العدسات المخصصة" : "Bespoke Eyewear Match & Custom Package"}</span>
        </h3>
        <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-1">
          {isArabic 
            ? "نظام الذكاء الاصطناعي طابق قياساتك الحيوية مع الإطار الأنسب من المخزون مع باقة عدسات مخصصة" 
            : "AI matched your facial morphology against inventory with dynamic optical lens precision calibration"}
        </p>
      </div>

      {/* Frame Catalog Selector Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
            {isArabic ? "تصفح الإطارات المتطابقة مع ملامحك:" : "Alternative Curated Frames:"}
          </span>
          <span className="text-[11px] font-mono text-brand-gold">
            {isArabic ? "كل الإطارات تشمل علبة فاخرة وضمان ٣٠ يوماً" : "All frames include luxury case & 30-day trial"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {dbInventory.map((item) => {
            const isSelected = matchedEyeglass?.id === item.id;
            const itemMediaUrl = getMediaForItem(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleSelectEyeglass(item)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between text-center ${
                  isSelected
                    ? "border-brand-gold bg-brand-gold/10 shadow-[0_0_15px_color-mix(in_srgb,var(--color-brand-gold)_20%,transparent)] ring-1 ring-brand-gold"
                    : "border-white/10 bg-[#121212] hover:border-white/30 hover:bg-[#181818]"
                }`}
              >
                <div className="h-16 flex items-center justify-center mb-2">
                  {itemMediaUrl ? (
                    <img src={itemMediaUrl} alt={item.frame_name} className="max-h-full max-w-full object-contain filter drop-shadow" referrerPolicy="no-referrer" />
                  ) : (
                    <Eye className="w-6 h-6 text-zinc-600" />
                  )}
                </div>
                <div>
                  <h6 className="font-serif text-xs font-semibold text-white truncate capitalize">
                    {item.frame_name || item.model_name}
                  </h6>
                  <p className="font-mono text-[11px] text-brand-gold font-bold mt-0.5">
                    {isArabic ? `${Math.round(item.price * 3.75)} ر.س` : `$${item.price.toFixed(2)}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Matched Frame Card */}
      <div className="max-w-4xl mx-auto space-y-8">
        
        {isLoadingInventory ? (
          <div className="glass-panel p-12 flex flex-col items-center justify-center text-zinc-400 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gold">
              {isArabic ? "جاري مطابقة الإطار الأمثل من قاعدة البيانات..." : "Querying Database Inventory..."}
            </p>
          </div>
        ) : matchedEyeglass ? (
          <div className="glass-panel p-6 md:p-8 space-y-6 relative border border-brand-gold/30 bg-black/40 rounded-xl shadow-2xl">
            
            {/* Top row details */}
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <span className="font-mono text-[9px] bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-3 py-1 uppercase tracking-widest font-bold inline-block mb-3 rounded-full">
                  {isArabic 
                    ? `مطابقة هيكلية لشكل الوجه الـ ${analysisResult.faceShapeAr}` 
                    : `Optimal Match for ${analysisResult.faceShape} Profile`}
                </span>
                <h4 className="font-serif text-3xl md:text-4xl text-white capitalize leading-tight font-medium">
                  {matchedEyeglass.frame_name || matchedEyeglass.model_name}
                </h4>
                <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-1">
                  {isArabic ? "العلامة التجارية:" : "Bespoke Brand:"} <span className="text-zinc-200 font-semibold capitalize">{matchedEyeglass.brand}</span>
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-serif text-3xl md:text-4xl text-brand-gold font-bold leading-none">
                  {isArabic 
                    ? `${Math.round((matchedEyeglass.price || 95) * 3.75)} ر.س`
                    : `$${(matchedEyeglass.price || 95).toFixed(2)}`}
                </p>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mt-1">
                  {isArabic ? "شامل الإطار والعلبة والضمان" : "Includes frame, case & warranty"}
                </span>
              </div>
            </div>

            {/* Technical Spec List */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-y border-white/5 py-4 my-2">
              <div>
                <p className="font-mono text-[8.5px] text-zinc-500 uppercase tracking-widest">{isArabic ? "المواد المصنعة" : "Material Profile"}</p>
                <p className="text-[13px] text-zinc-200 font-serif font-medium mt-0.5">{matchedEyeglass.material || "Grade 5 Titanium & Acetate"}</p>
              </div>
              <div>
                <p className="font-mono text-[8.5px] text-zinc-500 uppercase tracking-widest">{isArabic ? "كود الموديل" : "Model Reference"}</p>
                <p className="text-[13px] text-zinc-200 font-mono mt-0.5 capitalize">{matchedEyeglass.model_name || matchedEyeglass.id}</p>
              </div>
              <div>
                <p className="font-mono text-[8.5px] text-zinc-500 uppercase tracking-widest">{isArabic ? "عرض جسر الأنف" : "Bridge Width Coordinate"}</p>
                <p className="text-[13px] text-zinc-200 font-mono mt-0.5">{analysisResult.subMillimeterDimensions.bridgeWidth || "18.5mm"}</p>
              </div>
            </div>

            {/* Cloudinary Image Display with Interactive Zoom */}
            <div className="space-y-2">
              <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">
                {isArabic ? "معاينة المنتج الحقيقي من المخزون" : "High-Resolution Inventory Preview"}
              </span>
              <div className="aspect-[2.2/1] bg-gradient-to-b from-[#161616] to-[#0A0A0A] border border-white/10 rounded-lg flex items-center justify-center p-6 relative overflow-hidden shadow-inner group">
                <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {matchedMediaUrl ? (
                  <>
                    <img 
                      src={matchedMediaUrl} 
                      alt="Eyeglass Product" 
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_25px_color-mix(in_srgb,var(--color-brand-gold)_20%,transparent)] transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => setIsImageModalOpen(true)}
                      className="absolute bottom-4 right-4 bg-zinc-900/90 hover:bg-brand-gold hover:text-white border border-white/10 hover:border-transparent text-brand-gold px-4 py-2 rounded font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl cursor-pointer"
                      title={isArabic ? "تكبير الصورة" : "Enlarge Image"}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{isArabic ? "تكبير وتفحص" : "Enlarge 360 View"}</span>
                    </button>
                  </>
                ) : (
                  <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                    {isArabic ? "لم يتم العثور على صورة في الجدول" : "No Cloudinary asset link"}
                  </span>
                )}
              </div>
            </div>

            {/* Suitability Report */}
            <div className="bg-gradient-to-br from-[#141414] to-[#0a0a0a] border border-brand-gold/20 rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <div className="w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
                <span className="font-mono text-[10px] text-brand-gold uppercase tracking-widest font-semibold">
                  {isArabic ? "تقرير الملاءمة والتحليل الجمالي الفردي" : "Bespoke Biometric Compatibility & Suitability Report"}
                </span>
              </div>
              
              <p className="text-[13.5px] text-zinc-300 leading-relaxed font-serif font-light">
                {isArabic ? (
                  <>
                    بناءً على مسح الوجه ثلاثي الأبعاد لملامحك الفريدة، تم تحديد هذا الإطار كأفضل مطابقة بصرية وهيكلية. إن وجهك ذو الشكل <strong className="text-brand-gold font-normal">{(analysisResult.faceShapeAr || analysisResult.faceShape)}</strong> يمتلك تفاصيل ممتازة مع تناسق مذهل بنسبة <span className="font-mono text-[12px] text-brand-gold">{analysisResult.symmetry}%</span>. يساهم تصميم الإطار بدقة في موازنة الطول العمودي لوجهك البالغ <span className="font-mono text-[12px] text-brand-gold">{analysisResult.subMillimeterDimensions.faceLength}</span> مع عرض عظام الخدين البالغ <span className="font-mono text-[12px] text-brand-gold">{analysisResult.subMillimeterDimensions.cheekboneWidth}</span>.
                  </>
                ) : (
                  <>
                    Based on the high-fidelity 3D facial topography of your unique features, this frame is curated as your optimal optical and structural match. Your <strong className="text-brand-gold font-medium">{(analysisResult.faceShape || "Oval")}</strong> face structure exhibits exceptional organic balance with a facial symmetry score of <span className="font-mono text-[12px] text-brand-gold font-semibold">{analysisResult.symmetry}%</span>. The frame geometry is precisely calibrated to distribute weight evenly across your <span className="font-mono text-[12px] text-brand-gold">{analysisResult.subMillimeterDimensions.bridgeWidth}</span> nasal bridge, creating a seamless ergonomic fit that prevents slippage.
                  </>
                )}
              </p>
            </div>

          </div>
        ) : (
          <div className="glass-panel p-8 text-center text-zinc-500">
            {isArabic ? "لا توجد توصيات متطابقة حالياً." : "No matching recommendations found."}
          </div>
        )}

        {/* Lens Customization Builder & Order Bumps */}
        <div className="pt-4">
          <LensBuilder 
            lifestyleFocus={focusOptions[selectedProductIndex]?.id || "digital"}
            isArabic={isArabic}
            onUpgradeChange={(upgrades) => setLensUpgrades(upgrades)}
            onLensTypeChange={(type) => setLensType(type)}
            onLensIndexChange={(idx) => setLensIndex(idx)}
            onBumpsChange={(bumps) => setSelectedBumps(bumps)}
            selectedLensType={lensType}
            selectedLensIndex={lensIndex}
            selectedBumps={selectedBumps}
          />
        </div>

        {/* Trust Badges & Guarantees */}
        <FunnelTrustBadges isArabic={isArabic} discountPercent={discountPercent} />

        {/* Big Conversion Call-to-Action Bar for In-Store VIP Try-On */}
        <div className="p-8 bg-white border-2 border-brand-gold rounded-2xl shadow-md text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-brand-gold text-white font-sans text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isArabic ? `قسيمة خصم ${discountPercent}٪ لتجربة المعرض + فحص طبي مجاني` : `VIP IN-STORE PASS • ${discountPercent}% OFF + FREE CLINICAL EXAM`}</span>
          </div>
          <h4 className="font-serif text-2xl md:text-3xl text-[#111827] font-semibold">
            {isArabic ? "هل ترغب بتجربة هذه النظارة على ملامحك الحقيقية في المعرض؟" : "Want to Try This Exact Frame in Person at Our Boutique?"}
          </h4>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed font-sans">
            {isArabic 
              ? `احجز موعداً خاصاً لتجهيز صندوق عرض خاص VIP باسمك في أقرب فرع، جرب النظارة وافحص نظرك مجاناً مع أخصائي البصريات واحصل على خصم ${discountPercent}٪ الفوري.` 
              : `Reserve your curated VIP try-on tray at our nearest optical boutique. Enjoy a complimentary clinical vision check and lock in your ${discountPercent}% in-store discount voucher.`}
          </p>
          <button
            onClick={triggerCheckout}
            className="px-8 py-3.5 bg-brand-gold hover:bg-brand-gold/90 text-white font-sans text-sm md:text-base font-semibold rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isArabic ? `احجز صندوق العرض الخاص واحصل على كود خصم ${discountPercent}٪` : `Reserve In-Store VIP Fitting & Claim ${discountPercent}% Pass`}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

      </div>

      {/* Lightbox / Enlarge Image Modal */}
      {isImageModalOpen && matchedMediaUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fadeIn">
          <div className="absolute inset-0 cursor-zoom-out" onClick={() => setIsImageModalOpen(false)} />
          <div className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center">
            
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 border border-white/10 text-white p-2 rounded-full transition-all cursor-pointer z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="absolute -top-12 left-0 flex items-center gap-2 z-10">
              <button
                onClick={() => setZoomScale(prev => Math.min(prev + 0.5, 5))}
                className="bg-white/10 hover:bg-brand-gold hover:text-white border border-white/10 text-white p-2 rounded-full transition-all cursor-pointer"
                title={isArabic ? "تكبير" : "Zoom In"}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setZoomScale(prev => {
                    const next = Math.max(prev - 0.5, 1);
                    if (next === 1) setZoomOffset({ x: 0, y: 0 });
                    return next;
                  });
                }}
                className="bg-white/10 hover:bg-brand-gold hover:text-white border border-white/10 text-white p-2 rounded-full transition-all cursor-pointer"
                title={isArabic ? "تصغير" : "Zoom Out"}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setZoomScale(1);
                  setZoomOffset({ x: 0, y: 0 });
                }}
                className="bg-white/10 hover:bg-brand-gold hover:text-white border border-white/10 text-white p-2 rounded-full transition-all cursor-pointer"
                title={isArabic ? "إعادة تعيين" : "Reset Zoom"}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="relative w-full max-h-[70vh] flex items-center justify-center overflow-hidden bg-black/40 rounded-lg p-2">
              <img
                src={matchedMediaUrl}
                alt="Eyeglass Product Enlarged"
                className="max-w-full max-h-[70vh] object-contain filter drop-shadow-[0_20px_50px_color-mix(in_srgb,var(--color-brand-gold)_25%,transparent)]"
                style={{
                  transform: `translate(${zoomOffset.x}px, ${zoomOffset.y}px) scale(${zoomScale})`,
                }}
                referrerPolicy="no-referrer"
              />
            </div>

            {matchedEyeglass && (
              <div className="text-center mt-4">
                <h4 className="font-serif text-2xl text-white capitalize">
                  {matchedEyeglass.frame_name || matchedEyeglass.model_name}
                </h4>
                <p className="font-mono text-xs text-brand-gold uppercase tracking-widest mt-1">
                  {matchedEyeglass.brand} — {isArabic ? "عرض عالي الدقة" : "High-Resolution Optical Studio View"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
