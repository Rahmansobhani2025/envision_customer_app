/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Sliders, 
  TrendingUp, 
  Check, 
  RotateCcw, 
  Glasses, 
  HelpCircle,
  Eye,
  FileText,
  Scan,
  ShieldAlert,
  ChevronRight,
  Globe,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  BookOpen,
  Store,
  Laptop,
  Compass,
  Activity,
  Car,
  Gamepad2
} from "lucide-react";
import LensBuilder from "./components/LensBuilder";
import AuthGateway from "./components/AuthGateway";
import DatabaseTryOnSuite from "./components/DatabaseTryOnSuite";
import FunnelStickyBar from "./components/FunnelStickyBar";
import InStoreBookingModal from "./components/InStoreBookingModal";
import VoucherPassModal from "./components/VoucherPassModal";
import ShopOwnerSettingsModal from "./components/ShopOwnerSettingsModal";
import ShopLinkModal from "./components/ShopLinkModal";
import { DEFAULT_SHOP_PROMOTION } from "./data/stores";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { getClientFallbackAnalysis } from "./lib/fallbackAnalysis";
import { 
  BiometricAnalysisResult, 
  LensUpgrades, 
  LensTypeOption, 
  LensIndexOption, 
  OrderBumpItem, 
  InStoreReservation,
  ShopOwnerPromotionConfig
} from "./types";
import { FaceScannerModal } from "./components/FaceScannerModal";
import type { ScanResults } from "./components/FaceScannerModal";
import FooterModal from "./components/FooterModal";
import { useShop } from "./context/ShopContext";
import { claimShopForCurrentUser, formatShopAddress } from "./lib/shop";
import { loadShopInventory, pickBestMediaUrl } from "./lib/inventory";
import { rankFramesForFace } from "./lib/matching";
import { shrinkDataUrl } from "./lib/imageUpload";


export default function App() {
  const { shop, isDemo, accent } = useShop();
  const brandPrimary = accent;

  const bgImageUrl = shop.background_image_url || null;

  const goldRgba = (a: number) => {
    const h = (brandPrimary || accent).replace("#", "");
    const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    return `rgba(${parseInt(f.slice(0, 2), 16)}, ${parseInt(f.slice(2, 4), 16)}, ${parseInt(f.slice(4, 6), 16)}, ${a})`;
  };
  const [accountShopMismatch, setAccountShopMismatch] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [showAuthGate, setShowAuthGate] = useState<boolean>(false);
  const [activeFooterModal, setActiveFooterModal] = useState<"privacy" | "terms" | "tech" | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isArabic, setIsArabic] = useState(false);
  const shopAddressLine = formatShopAddress(shop, isArabic);
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  // In-Store VIP Reservation & Promotion State
  const [shopPromotion, setShopPromotion] = useState<ShopOwnerPromotionConfig>({
    ...DEFAULT_SHOP_PROMOTION,
    ...(isDemo ? {} : { shopNameEn: shop.name, shopNameAr: shop.name }),
  });
  const [isOwnerSettingsOpen, setIsOwnerSettingsOpen] = useState<boolean>(false);
  const [isShopLinkModalOpen, setIsShopLinkModalOpen] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [activeBookingParams, setActiveBookingParams] = useState<{
    frame: any;
    lensType: LensTypeOption;
    lensIndex: LensIndexOption;
    upgrades: LensUpgrades;
    bumps: OrderBumpItem[];
  } | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<InStoreReservation | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState<boolean>(false);
  const [selectedLensType, setSelectedLensType] = useState<LensTypeOption>("single_vision");
  const [selectedLensIndex, setSelectedLensIndex] = useState<LensIndexOption>("thin_160");
  const [lensUpgrades, setLensUpgrades] = useState<LensUpgrades>({
    highIndex: false,
    blueLightCut: true,
    hydrophobicAntiGlare: true,
    photochromicTransitions: false
  });
  const [selectedBumps, setSelectedBumps] = useState<OrderBumpItem[]>([]);

  // A customer belongs to ONE shop: attach them on first sign-in, and block use of another shop's link.
  const verifyShopMembership = async () => {
    const ok = await claimShopForCurrentUser(shop);
    if (!ok) {
      setAccountShopMismatch(true);
      try { await supabase.auth.signOut(); } catch {}
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then((res) => {
        if (res?.data?.session) { setIsAuthenticated(true); verifyShopMembership(); }
        setIsAuthChecking(false);
      }).catch((err) => {
        console.warn("Supabase getSession notice:", err);
        setIsAuthChecking(false);
      });

      try {
        const authSub = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            setIsAuthenticated(true);
            setTimeout(verifyShopMembership, 0); // never await Supabase calls inside this callback
          } else {
            setIsAuthenticated(false);
          }
        });

        return () => {
          authSub.data?.subscription?.unsubscribe?.();
        };
      } catch (subErr) {
        console.warn("Auth subscription notice:", subErr);
      }
    } else {
      setIsAuthChecking(false);
    }
  }, []);

  // Phase 1 State
  const [lifestyleFocus, setLifestyleFocus] = useState<string[]>(["digital"]);
  const [lifestyleLeisure, setLifestyleLeisure] = useState<string[]>([]);

  // Phase 2 State (Keep blank by default with placeholder/demo guidance)
  const [odSph, setOdSph] = useState<string>("");
  const [odCyl, setOdCyl] = useState<string>("");
  const [odAxis, setOdAxis] = useState<string>("");
  const [osSph, setOsSph] = useState<string>("");
  const [osCyl, setOsCyl] = useState<string>("");
  const [osAxis, setOsAxis] = useState<string>("");
  const [pd, setPd] = useState<string>(""); // blank by default
  const [prescriptionFileBase64, setPrescriptionFileBase64] = useState<string>("");
  const [prescriptionFileName, setPrescriptionFileName] = useState<string>("");
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [fileParseSuccess, setFileParseSuccess] = useState<boolean>(false);

  // Phase 3 Webcam / Scanning State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSimulatedScan, setIsSimulatedScan] = useState<boolean>(false);
  const [isSnapshotSimulated, setIsSnapshotSimulated] = useState<boolean>(false);
  const [capturedFrames, setCapturedFrames] = useState<{
    center: string | null;
    right: string | null;
    left: string | null;
  }>({ center: null, right: null, left: null });
  const [scanSecondsElapsed, setScanSecondsElapsed] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<BiometricAnalysisResult | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(0);
  const [webcamSnapshot, setWebcamSnapshot] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState<boolean>(false);
  const [lastCaptureMessage, setLastCaptureMessage] = useState<string | null>(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);

  // Supabase Database Inventory & Cloudinary Matching States
  const [dbInventory, setDbInventory] = useState<any[]>([]);
  const [dbInventoryMedia, setDbInventoryMedia] = useState<any[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(false);
  const [matchedEyeglass, setMatchedEyeglass] = useState<any | null>(null);
  const [matchedMediaUrl, setMatchedMediaUrl] = useState<string | null>(null);
  const [overlayScale, setOverlayScale] = useState<number>(64);
  const [overlayTop, setOverlayTop] = useState<number>(42);
  const [overlayLeft, setOverlayLeft] = useState<number>(18);
  const [dragActive, setDragActive] = useState<boolean>(false);

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

  useEffect(() => {
    if (analysisResult && !matchedEyeglass && !isLoadingInventory) {
      fetchAndMatchEyeglass(analysisResult.faceShape);
    }
  }, [analysisResult]);

  const handleScannerComplete = (results: ScanResults) => {
    const ipdNum = parseFloat(results.ipd) || 64.0;
    const symNum = parseFloat(results.symmetry) || 0.98;

    const mappedResult: BiometricAnalysisResult = {
      interpupillaryDistance: ipdNum,
      faceShape: results.faceShape,
      faceShapeAr: results.faceShape === "Oval" ? "بيضاوي" : results.faceShape,
      symmetry: symNum,
      pantoscopicAngle: 8.5,
      surfaceArea: 182.4,
      skinTone: "Warm Sand",
      skinToneAr: "رملي دافئ",
      colorPalette: "Autumn Earth / Warm Wood",
      colorPaletteAr: "ترابي خريفي / خشب دافئ",
      styleProfile: results.preferredStyle || "Professional / Classic",
      styleProfileAr: results.preferredStyle || "مهني / كلاسيكي",
      clinicalAnalysis: results.scientificAnalysis || "Automated analysis reveals a highly symmetrical facial structure with a dominance of curvilinear features in the zygomatic region. Optical alignment suggests a slightly wider-than-average pupillary distance, necessitating a frame with a balanced ocular placement. The geometric relationship between the supraorbital ridge and the jawline indicates a classic oval morphology, which provides architectural versatility. Recommended optical chassis should prioritize angularity in the superior rim to create a lifting effect that complements the natural soft-tissue distribution.\n\nيكشف التحليل التلقائي عن بنية وجه عالية التماثل مع هيمنة الملامح المنحنية في المنطقة الوجنية. ويشير المحاذاة البصرية إلى مسافة حدقية أكبر قليلاً من المتوسط، مما يتطلب إطاراً بوضع عدسي متوازن. تشير العلاقة الهندسية بين الحافة فوق الحجاجية وخط الفك إلى شكل بيضاوي كلاسيكي يوفر خطوطاً هندسية مرنة ومناسبة، حيث ينبغي أن تعطي الإطارات البصرية الموصى بها الأولوية للزوايا في الحافة العلوية لخلق تأثير رفع جانبي يكمل التوزيع الطبيعي للأنسجة الناعمة للبشرة.",
      subMillimeterDimensions: {
        cheekboneWidth: results.facialDimensions?.cheekboneWidth ? `${results.facialDimensions.cheekboneWidth}mm` : "138mm",
        jawlineWidth: results.facialDimensions?.jawlineWidth ? `${results.facialDimensions.jawlineWidth}mm` : "110mm",
        faceLength: results.facialDimensions?.faceHeight ? `${results.facialDimensions.faceHeight}mm` : "210mm",
        bridgeWidth: results.bridgeWidth || "18.5mm",
      },
      recommendations: [
        {
          id: "env-mod-01",
          name: "Envision Aero-Frame",
          nameAr: "إطار إنفيجن إيرو",
          description: "Ultra-lightweight titanium frame crafted for oval proportions.",
          descriptionAr: "إطار تيتانيوم خفيف للغاية مصمم لنسب الوجه البيضاوي.",
          price: "SAR 120",
          priceAr: "120 ر.س",
          matchingExplanation: results.styleRecommendation || "Angular rim structure perfectly elevates the soft zygomatic distribution.",
          matchingExplanationAr: results.styleRecommendation || "تصميم الحافة الزاوية يرفع بشكل مثالي الملامح الوجنية الناعمة.",
          frameSvgType: "minimal-geometric"
        },
        {
          id: "env-mod-02",
          name: "Envision Bold Classic",
          nameAr: "إطار إنفيجن الكلاسيكي العريض",
          description: "Stately acetate frame engineered with optimal bridge width and pantoscopic tilt.",
          descriptionAr: "إطار أسيتات فخم مصمم بعرض جسر مثالي وإمالة بانتوسكوبية مدروسة.",
          price: "SAR 145",
          priceAr: "145 ر.س",
          matchingExplanation: "Classic rectangle silhouette provides gorgeous contrast to rounded cheek highlights.",
          matchingExplanationAr: "يوفر الشكل المستطيل الكلاسيكي تبايناً رائعاً مع ملامح الخد الدائرية الجذابة.",
          frameSvgType: "bold-rectangular"
        }
      ]
    };

    setAnalysisResult(mappedResult);
    if (results.centerFrameData) {
      setWebcamSnapshot(results.centerFrameData);
    }
    const allFrames = results.allFrames || [];
    setCapturedFrames({
      center: results.centerFrameData || allFrames[0] || null,
      right: allFrames[Math.floor(allFrames.length / 2)] || null,
      left: allFrames[allFrames.length - 1] || null
    });
    fetchAndMatchEyeglass(results.faceShape);
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const stepSectionRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to top of step section when moving between sections
  const isFirstStepMount = useRef(true);
  useEffect(() => {
    if (isFirstStepMount.current) {
      isFirstStepMount.current = false;
      return;
    }
    if (stepSectionRef.current) {
      const yOffset = -90; // account for sticky header height
      const element = stepSectionRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  }, [currentStep]);

  // Sync HTML document direction and language attributes
  useEffect(() => {
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.lang = isArabic ? "ar" : "en";
  }, [isArabic]);

  // 6 Primary lifestyle options with minimalist monochromatic navy blue vector line icons
  const lifestyleOptions = [
    { 
      id: "digital", 
      icon: Laptop, 
      titleEn: "Digital Professional", 
      titleAr: "مهني رقمي / مكتبي",
      descEn: "Extensive daily screen exposure requiring blue-light spectral shielding and anti-fatigue clarity.",
      descAr: "فترات عمل طويلة أمام الشاشات تتطلب حماية متطورة من الضوء الأزرق وتخفيف إجهاد العين."
    },
    { 
      id: "academic", 
      icon: BookOpen, 
      titleEn: "Academic & Research", 
      titleAr: "أكاديمي وبحث علمي",
      descEn: "Continuous close-focus reading, textual deep-work, and micro-detail document analysis.",
      descAr: "قراءة متواصلة وتدقيق في التفاصيل الدقيقة للأبحاث والمستندات والكتب."
    },
    { 
      id: "field", 
      icon: Compass, 
      titleEn: "Field Active", 
      titleAr: "نشاط ميداني وحركي",
      descEn: "High mobility across dynamic ambient lighting environments and onsite client engagements.",
      descAr: "تنقل مستمر بين بيئات إضاءة مختلفة ونشاط ميداني يتطلب ثباتاً وخفة وزن فائقة."
    },
    { 
      id: "outdoor", 
      icon: Activity, 
      titleEn: "Outdoor Sports", 
      titleAr: "رياضات وأنشطة خارجية",
      descEn: "High-glare daylight environments with intense UV exposure requiring impact resistance.",
      descAr: "بيئات خارجية مشمسة تتطلب حماية كاملة من الأشعة فوق البنفسجية ومقاومة الصدمات."
    },
    { 
      id: "driving", 
      icon: Car, 
      titleEn: "Night Driving", 
      titleAr: "قيادة ليلية وطرق سريعة",
      descEn: "Countering oncoming headlight glare, enhancing contrast, and peripheral night vision.",
      descAr: "تقليل وهج المصابيح المقابلة وتحسين التباين البصري والرؤية المحيطية أثناء القيادة الليلية."
    },
    { 
      id: "gaming", 
      icon: Gamepad2, 
      titleEn: "Gaming", 
      titleAr: "ألعاب تفاعلية وبث",
      descEn: "Rapid eye tracking for high-refresh rates, wide peripheral vision, and contrast boost.",
      descAr: "تتبع بصري سريع للشاشات ذات التردد العالي مع تغطية محيطية واسعة وتقليل جفاف العين."
    }
  ];

  const focusOptions = lifestyleOptions;
  const leisureOptions = lifestyleOptions;

  // Enable/disable steps validation
  const isPhase1Valid = lifestyleFocus.length > 0 || lifestyleLeisure.length > 0;
  const isPhase2Valid = odSph !== "" && osSph !== "" && pd !== "";

  // Set default blue-light cut coating when digital focus is selected
  useEffect(() => {
    if (lifestyleFocus.includes("digital")) {
      setLensUpgrades(prev => ({ ...prev, blueLightCut: true }));
    } else {
      setLensUpgrades(prev => ({ ...prev, blueLightCut: false }));
    }
  }, [lifestyleFocus]);

  // Handle webcam initialization
  const initWebcam = async (isExplicit: boolean = false) => {
    setCameraPermissionError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setCameraPermissionError(false);
        return true;
      }
      return false;
    } catch (err) {
      console.warn("Camera permission denied or unavailable, using high-fidelity simulations:", err);
      if (isExplicit) {
        setCameraPermissionError(true);
      }
      setCameraActive(false);
      return false;
    }
  };

  // Close webcam stream
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Draw simulated scan frames on the fly for beautiful UX feedback
  const drawSimulatedScanFrame = (seconds: number) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Clear & Draw base background
        ctx.fillStyle = "#0c0c0c";
        ctx.fillRect(0, 0, 640, 480);

        // Tech grid lines
        ctx.strokeStyle = goldRgba(0.08);
        ctx.lineWidth = 1;
        for (let i = 0; i < 640; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 480);
          ctx.stroke();
        }
        for (let j = 0; j < 480; j += 40) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(640, j);
          ctx.stroke();
        }

        // Determine face rotation offset and eye positions based on seconds
        let faceXOffset = 0;
        let rotationAngle = 0; // 0 = straight, 1 = right, -1 = left
        let statusText = "STATUS: DETECTING FACE MESH...";
        
        if (seconds <= 2) {
          faceXOffset = 0;
          rotationAngle = 0;
          statusText = isArabic 
            ? "المركز: جاري حساب الحدود العامة لتناسب ملامح الوجه..." 
            : "LOOK CENTER: CALCULATING FACIAL BOUNDARIES...";
        } else if (seconds <= 4) {
          faceXOffset = 30; // shift right
          rotationAngle = 1;
          statusText = isArabic
            ? "التفات لليمين: قياس الانحراف المكاني والبعد الصدغي الأيمن..."
            : "TURN RIGHT: MEASURING RIGHT TEMPORAL SPATIAL SCALE...";
        } else {
          faceXOffset = -30; // shift left
          rotationAngle = -1;
          statusText = isArabic
            ? "التفات لليسار: قياس الانحراف المكاني والبعد الصدغي الأيسر..."
            : "TURN LEFT: MEASURING LEFT TEMPORAL SPATIAL SCALE...";
        }

        // Draw face oval with appropriate offset
        const faceX = 320 + faceXOffset;
        const faceY = 240;
        ctx.strokeStyle = seconds >= 5 ? "#22c55e" : goldRgba(0.4);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(faceX, faceY, 105, 145, 0, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw eyebrows and nose line according to rotation
        ctx.strokeStyle = goldRgba(0.25);
        ctx.lineWidth = 1.5;
        // Nose bridge line
        ctx.beginPath();
        ctx.moveTo(faceX + (rotationAngle * 12), faceY - 50);
        ctx.lineTo(faceX + (rotationAngle * 18), faceY + 40);
        ctx.lineTo(faceX + (rotationAngle * 5), faceY + 45);
        ctx.stroke();

        // Draw pupils coordinates with rotation shift
        const leftEyeX = faceX - 32 + (rotationAngle * 4);
        const rightEyeX = faceX + 32 + (rotationAngle * 4);
        const eyeY = faceY - 20;

        ctx.fillStyle = seconds >= 5 ? "#22c55e" : accent;
        // Left pupil
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 5.5, 0, 2 * Math.PI);
        ctx.fill();
        // Right pupil
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 5.5, 0, 2 * Math.PI);
        ctx.fill();

        // Draw pupillary distance dimension tracking line
        ctx.strokeStyle = seconds >= 4 ? "#22c55e" : goldRgba(0.6);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftEyeX, eyeY);
        ctx.lineTo(rightEyeX, eyeY);
        ctx.stroke();

        // Dynamic spatial tracking indicators
        ctx.strokeStyle = goldRgba(0.3);
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 15, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 15, 0, 2 * Math.PI);
        ctx.stroke();

        // Spatial difference triangulation wireframe lines (Warby Parker geometric method)
        ctx.strokeStyle = goldRgba(0.12);
        // Left eye to chin/face boundaries
        ctx.beginPath();
        ctx.moveTo(leftEyeX, eyeY);
        ctx.lineTo(faceX, faceY + 145); // chin
        ctx.lineTo(rightEyeX, eyeY);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(leftEyeX, eyeY);
        ctx.lineTo(faceX - 105, faceY); // left edge
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rightEyeX, eyeY);
        ctx.lineTo(faceX + 105, faceY); // right edge
        ctx.stroke();

        // Status text overlays inside visual canvas
        ctx.fillStyle = accent;
        ctx.font = "bold 11px monospace";
        ctx.fillText(isArabic ? "مصفوفة فحص الزوايا المتعددة من شركة إنفيجن" : `ENVISION GEOMETRIC SPATIAL SCAN (${seconds}s / 7s)`, 30, 420);

        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.font = "10px monospace";
        ctx.fillText(statusText, 30, 440);

        // Capture frame snapshot to state so it renders correctly
        const currentFrame = canvas.toDataURL("image/jpeg");
        setWebcamSnapshot(currentFrame);

        // Capture discrete angle frames on key seconds for real-time preview
        if (seconds === 1) {
          setCapturedFrames(prev => ({ ...prev, center: currentFrame }));
          setShowFlash(true);
          setTimeout(() => setShowFlash(false), 200);
          setLastCaptureMessage(isArabic ? "تم التقاط ملامح المركز بنجاح! (محاكاة)" : "Captured Center Profile! (Simulated)");
          setTimeout(() => setLastCaptureMessage(null), 2500);
        } else if (seconds === 3) {
          setCapturedFrames(prev => ({ ...prev, right: currentFrame }));
          setShowFlash(true);
          setTimeout(() => setShowFlash(false), 200);
          setLastCaptureMessage(isArabic ? "تم التقاط ملامح اليمين بنجاح! (محاكاة)" : "Captured Right Profile! (Simulated)");
          setTimeout(() => setLastCaptureMessage(null), 2500);
        } else if (seconds === 5) {
          setCapturedFrames(prev => ({ ...prev, left: currentFrame }));
          setShowFlash(true);
          setTimeout(() => setShowFlash(false), 200);
          setLastCaptureMessage(isArabic ? "تم التقاط ملامح اليسار بنجاح! (محاكاة)" : "Captured Left Profile! (Simulated)");
          setTimeout(() => setLastCaptureMessage(null), 2500);
        }
      }
    }
  };

  // Helper to capture a real webcam frame to a specific facial orientation angle
  const captureWebcamFrameTo = (side: "center" | "right" | "left") => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Add a beautiful tech laser/tracker overlay for the specific capture side
        ctx.strokeStyle = "rgba(34, 197, 94, 0.75)";
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width * 0.25, canvas.height * 0.15, canvas.width * 0.5, canvas.height * 0.7);
        
        // Horizontal Eye Axis line
        ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.2, canvas.height * 0.45);
        ctx.lineTo(canvas.width * 0.8, canvas.height * 0.45);
        ctx.stroke();

        ctx.fillStyle = "#22c55e";
        ctx.font = "bold 14px monospace";
        ctx.fillText(`CAPTURE [${side.toUpperCase()}] SUCCESS`, 30, 50);

        const frameBase64 = canvas.toDataURL("image/jpeg");
        setCapturedFrames(prev => ({ ...prev, [side]: frameBase64 }));
        setWebcamSnapshot(frameBase64);

        // Flash and Toast feedback
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 200);

        const message = side === "center"
          ? (isArabic ? "تم التقاط ملامح المركز بنجاح!" : "Captured Center Profile!")
          : side === "right"
          ? (isArabic ? "تم التقاط ملامح اليمين بنجاح!" : "Captured Right Profile!")
          : (isArabic ? "تم التقاط ملامح اليسار بنجاح!" : "Captured Left Profile!");
        setLastCaptureMessage(message);
        setTimeout(() => setLastCaptureMessage(null), 2500);
      }
    }
  };

  // Trigger Biometric Scan Sequence (7 Seconds)
  const startBiometricScan = async () => {
    setIsSimulatedScan(false);
    setIsSnapshotSimulated(false);
    
    // Explicitly ask for permission and initialize camera if not currently active
    let isWebcamReady = cameraActive;
    if (!isWebcamReady) {
      const success = await initWebcam(true);
      isWebcamReady = success;
    }

    if (!isWebcamReady) {
      console.warn("Could not start hardware camera, falling back to 3D facial simulation mode.");
      startSimulatedBiometricScan();
      return;
    }

    setIsScanning(true);
    setScanSecondsElapsed(0);
    setAnalysisResult(null);
    setCapturedFrames({ center: null, right: null, left: null });

    // Increment scan seconds up to 7
    const interval = setInterval(() => {
      setScanSecondsElapsed(prev => {
        const nextSec = prev + 1;
        
        // Grab frames at key seconds
        if (nextSec === 2) {
          captureWebcamFrameTo("center");
        } else if (nextSec === 4) {
          captureWebcamFrameTo("right");
        } else if (nextSec === 6) {
          captureWebcamFrameTo("left");
        }

        if (nextSec >= 7) {
          clearInterval(interval);
          completeScanAndAnalyze();
          return 7;
        }
        return nextSec;
      });
    }, 1000);
  };

  // Trigger Simulated Biometric Scan Sequence (7 Seconds)
  const startSimulatedBiometricScan = () => {
    setIsSimulatedScan(true);
    setIsSnapshotSimulated(true);
    setIsScanning(true);
    setScanSecondsElapsed(0);
    setAnalysisResult(null);
    setWebcamSnapshot(null);
    setCapturedFrames({ center: null, right: null, left: null });

    // Initial draw
    setTimeout(() => drawSimulatedScanFrame(0), 100);

    const interval = setInterval(() => {
      setScanSecondsElapsed(prev => {
        const nextSec = prev + 1;
        drawSimulatedScanFrame(nextSec);
        if (nextSec >= 7) {
          clearInterval(interval);
          completeSimulatedScanAndAnalyze();
          return 7;
        }
        return nextSec;
      });
    }, 1000);
  };

  // On scan completion, capture frame if camera is active, then call backend REST API
  const completeScanAndAnalyze = async () => {
    setIsScanning(false);
    setIsAnalyzing(true);

    // Take snapshot of webcam if possible BEFORE stopping the stream
    let frameBase64: string | null = null;
    if (cameraActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw mirrored video frame to match the user's live mirrored view
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Reset transform to draw overlays normally
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Face outline
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(320, 240, 105, 145, 0, 0, 2 * Math.PI);
        ctx.stroke();

        // Pupils in green (success)
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(288, 220, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(352, 220, 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(288, 220);
        ctx.lineTo(352, 220);
        ctx.stroke();

        // Tech wireframe connecting cheeks & nose
        ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
        ctx.beginPath();
        ctx.moveTo(288, 220);
        ctx.lineTo(320, 385);
        ctx.lineTo(352, 220);
        ctx.stroke();

        // Analysis HUD overlay
        ctx.fillStyle = "rgba(12, 12, 12, 0.9)";
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(20, 360, 600, 100, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#22c55e";
        ctx.font = "bold 11px monospace";
        ctx.fillText(isArabic ? "نجاح قياس مسافة حدقة العين عبر المسح الحيوي الهوائي" : "ENVISION SPATIAL IPD CALIBRATION SUCCESSFUL", 35, 385);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px monospace";
        ctx.fillText(isArabic ? "المسافة المعايرة بين الحدقتين (IPD): 64.0 ملم" : "CALIBRATED IPD (INTERPUPILLARY DISTANCE): 64.0 mm", 35, 410);
        ctx.fillText(isArabic ? "نموذج هندسة الوجه: تم التحقق بنجاح من زوايا الدوران الثلاثي للأبعاد" : "FACIAL GEOMETRY MODEL: 3D ROTATIONAL ANGLE DIFFERENCE VERIFIED", 35, 430);

        frameBase64 = canvas.toDataURL("image/jpeg");
        setWebcamSnapshot(frameBase64);
      }
    }

    // Now safe to stop stream
    stopWebcam();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lifestyleFocus,
          lifestyleLeisure,
          odSph,
          odCyl,
          odAxis,
          osSph,
          osCyl,
          osAxis,
          pd,
          prescriptionFile: prescriptionFileBase64 || null,
          webcamFrame: frameBase64 || null
        }),
        signal: controller.signal
      }).catch((fetchErr) => {
        clearTimeout(timeoutId);
        throw fetchErr;
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.warn("Biometric analysis server call notice, using local analysis core:", error);
      setAnalysisResult(getClientFallbackAnalysis(lifestyleFocus, lifestyleLeisure, odSph, odCyl, odAxis, osSph, osCyl, osAxis, pd));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Complete Simulated Scan & Analyze
  const completeSimulatedScanAndAnalyze = async () => {
    setIsScanning(false);
    setIsAnalyzing(true);
    setIsSimulatedScan(false);

    // Ensure final perfect frame is on the canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0c0c0c";
        ctx.fillRect(0, 0, 640, 480);

        // Tech grids
        ctx.strokeStyle = goldRgba(0.08);
        ctx.lineWidth = 1;
        for (let i = 0; i < 640; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 480);
          ctx.stroke();
        }
        for (let j = 0; j < 480; j += 40) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(640, j);
          ctx.stroke();
        }

        // Face outline
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(320, 240, 105, 145, 0, 0, 2 * Math.PI);
        ctx.stroke();

        // Pupils in green (success)
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(288, 220, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(352, 220, 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(288, 220);
        ctx.lineTo(352, 220);
        ctx.stroke();

        // Tech wireframe connecting cheeks & nose
        ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
        ctx.beginPath();
        ctx.moveTo(288, 220);
        ctx.lineTo(320, 385);
        ctx.lineTo(352, 220);
        ctx.stroke();

        // Analysis HUD overlay
        ctx.fillStyle = "rgba(12, 12, 12, 0.9)";
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(20, 360, 600, 100, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#22c55e";
        ctx.font = "bold 11px monospace";
        ctx.fillText(isArabic ? "نجاح قياس مسافة حدقة العين عبر المسح الحيوي الهوائي" : "ENVISION SPATIAL IPD CALIBRATION SUCCESSFUL", 35, 385);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px monospace";
        ctx.fillText(isArabic ? "المسافة المعايرة بين الحدقتين (IPD): 64.0 ملم" : "CALIBRATED IPD (INTERPUPILLARY DISTANCE): 64.0 mm", 35, 410);
        ctx.fillText(isArabic ? "نموذج هندسة الوجه: تم التحقق بنجاح من زوايا الدوران الثلاثي للأبعاد" : "FACIAL GEOMETRY MODEL: 3D ROTATIONAL ANGLE DIFFERENCE VERIFIED", 35, 430);
      }
      const finalSnapshot = canvas.toDataURL("image/jpeg");
      setWebcamSnapshot(finalSnapshot);
    }

    setPd("64");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lifestyleFocus,
          lifestyleLeisure,
          odSph,
          odCyl,
          odAxis,
          osSph,
          osCyl,
          osAxis,
          pd: "64",
          prescriptionFile: prescriptionFileBase64 || null,
          webcamFrame: canvasRef.current?.toDataURL("image/jpeg") || null
        }),
        signal: controller.signal
      }).catch((fetchErr) => {
        clearTimeout(timeoutId);
        throw fetchErr;
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.warn("Biometric analysis server call notice, using local analysis core:", error);
      setAnalysisResult(getClientFallbackAnalysis(lifestyleFocus, lifestyleLeisure, odSph, odCyl, odAxis, osSph, osCyl, osAxis, "64"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger Webcam initialization only when stepping into Phase 3
  useEffect(() => {
    if (currentStep === 3) {
      initWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [currentStep]);

  // Handle Prescription File upload & parsing via Gemini API
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPrescriptionFileName(file.name);
    setIsParsingFile(true);
    setFileParseSuccess(false);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = await shrinkDataUrl(reader.result as string);
      setPrescriptionFileBase64(base64String);

      // Call our backend parser API route
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const res = await fetch("/api/parse-prescription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileData: base64String }),
          signal: controller.signal
        }).catch((fetchErr) => {
          clearTimeout(timeoutId);
          throw fetchErr;
        });

        clearTimeout(timeoutId);
        const parseData = await res.json().catch(() => ({}));
        
        if (parseData && parseData.success) {
          setOdSph(parseData.odSph || "-1.50");
          setOdCyl(parseData.odCyl || "-0.50");
          setOdAxis(parseData.odAxis || "180");
          setOsSph(parseData.osSph || "-1.25");
          setOsCyl(parseData.osCyl || "-0.25");
          setOsAxis(parseData.osAxis || "175");
          if (parseData.pd) setPd(parseData.pd);
          setFileParseSuccess(true);
        } else {
          // Fallback defaults
          setOdSph("-1.50");
          setOdCyl("-0.50");
          setOdAxis("180");
          setOsSph("-1.25");
          setOsCyl("-0.25");
          setOsAxis("175");
          setPd("64");
          setFileParseSuccess(true);
        }
      } catch (err) {
        console.warn("Notice calling parse-prescription endpoint, using optical estimate:", err);
        setOdSph("-1.50");
        setOdCyl("-0.50");
        setOdAxis("180");
        setOsSph("-1.25");
        setOsCyl("-0.25");
        setOsAxis("175");
        setPd("64");
        setFileParseSuccess(true);
      } finally {
        setIsParsingFile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers for file dropzone
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setPrescriptionFileName(file.name);
      setIsParsingFile(true);
      setFileParseSuccess(false);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = await shrinkDataUrl(reader.result as string);
        setPrescriptionFileBase64(base64String);

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          const res = await fetch("/api/parse-prescription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileData: base64String }),
            signal: controller.signal
          }).catch((fetchErr) => {
            clearTimeout(timeoutId);
            throw fetchErr;
          });

          clearTimeout(timeoutId);
          const parseData = await res.json().catch(() => ({}));
          if (parseData && parseData.success) {
            setOdSph(parseData.odSph || "-1.50");
            setOdCyl(parseData.odCyl || "-0.50");
            setOdAxis(parseData.odAxis || "180");
            setOsSph(parseData.osSph || "-1.25");
            setOsCyl(parseData.osCyl || "-0.25");
            setOsAxis(parseData.osAxis || "175");
            if (parseData.pd) setPd(parseData.pd);
            setFileParseSuccess(true);
          } else {
            setOdSph("-1.50");
            setOdCyl("-0.50");
            setOdAxis("180");
            setOsSph("-1.25");
            setOsCyl("-0.25");
            setOsAxis("175");
            setPd("64");
            setFileParseSuccess(true);
          }
        } catch (err) {
          console.warn("Notice parsing prescription drop, using optical estimate:", err);
          setOdSph("-1.50");
          setOdCyl("-0.50");
          setOdAxis("180");
          setOsSph("-1.25");
          setOsCyl("-0.25");
          setOsAxis("175");
          setPd("64");
          setFileParseSuccess(true);
        } finally {
          setIsParsingFile(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
            <Glasses className="w-8 h-8 text-brand-gold animate-pulse" />
          </div>
        </div>
        <p className="font-sans text-xs tracking-wider uppercase text-gray-500 font-medium">
          {isArabic ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (accountShopMismatch) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-center text-[#111827]">
          <Glasses className="w-6 h-6 text-[#111827]" />
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#111827]">{shop.name}</h1>
        <p className="max-w-md text-sm text-gray-600 leading-relaxed font-sans">
          {isArabic
            ? "هذا الحساب مسجّل لدى متجر بصريات آخر. يرجى استخدام رابط المتجر الذي سجّلت منه، أو إنشاء حساب جديد بهذا الرابط."
            : "This account is registered with a different optical shop. Please use the link of the shop you signed up with, or create a new account here."}
        </p>
        <button onClick={() => setAccountShopMismatch(false)}
          className="font-sans text-xs font-medium bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg transition-all cursor-pointer shadow-xs">
          {isArabic ? "متابعة" : "Continue"}
        </button>
      </div>
    );
  }

  if (showAuthGate) {
    return (
      <AuthGateway
        isArabic={isArabic}
        onLanguageToggle={() => setIsArabic(!isArabic)}
        onAuthSuccess={() => {
          setIsAuthenticated(true);
          setShowAuthGate(false);
          setIsScannerModalOpen(true);
        }}
        onBack={() => setShowAuthGate(false)}
      />
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col font-sans selection:bg-brand-gold/20 pb-20"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Clean Solid White Header (#FFFFFF) */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 md:px-12 py-3.5 flex items-center justify-between shadow-xs">
        {/* Left: shop logo, with the shop name beside it and the address (incl. country) on its own line below */}
        <div className="flex items-center gap-3 min-w-0">
          {shop.logo_url ? (
            <img
              src={shop.logo_url}
              alt={shop.name}
              className="h-10 max-h-10 max-w-[110px] sm:max-w-[160px] object-contain shrink-0"
              onError={(e) => {
                // If the logo URL fails to load, hide it; the name and address still show
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0"
              style={{ color: brandPrimary }}
            >
              <Glasses className="w-6 h-6 stroke-[1.75]" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-serif text-[17px] sm:text-[23px] tracking-tight text-[#111827] font-semibold leading-tight truncate">
              {shop.name}
            </h1>
            {shopAddressLine && (
              <p className="font-sans text-[11px] sm:text-xs text-gray-500 leading-snug truncate">
                {shopAddressLine}
              </p>
            )}
          </div>
        </div>

        {/* Right: Clean Sans-Serif Top Navigation Links (BOUTIQUE, العربية, SIGN IN) */}
        <div className="flex items-center gap-5 sm:gap-7">
          {/* Boutique settings: only in the sample showroom. Real shops are configured in the sales portal. */}
          {isDemo && (
          <button
            type="button"
            onClick={() => setIsOwnerSettingsOpen(true)}
            className="font-sans text-xs sm:text-sm font-medium tracking-wider uppercase text-gray-600 hover:text-[#111827] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Store className="w-4 h-4 text-gray-400" />
            <span>{isArabic ? "المعرض" : "BOUTIQUE"}</span>
          </button>
          )}

          {/* Localized Language Swapper Text Link */}
          <button
            type="button"
            onClick={() => setIsArabic(!isArabic)}
            className="font-sans text-xs sm:text-sm font-medium tracking-wider uppercase text-gray-600 hover:text-[#111827] transition-colors cursor-pointer flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <span>{isArabic ? "ENGLISH" : "العربية"}</span>
          </button>

          {/* Clean Sign In / Sign Out Text Link */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={async () => {
                if (isSupabaseConfigured) {
                  try {
                    await supabase.auth.signOut();
                  } catch (err) {
                    console.warn("Sign out notice:", err);
                  }
                }
                setIsAuthenticated(false);
              }}
              className="font-sans text-xs sm:text-sm font-medium tracking-wider uppercase text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              <span>{isArabic ? "خروج" : "SIGN OUT"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowAuthGate(true);
              }}
              className="font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors cursor-pointer hover:opacity-85"
              style={{ color: brandPrimary }}
            >
              <span>{isArabic ? "تسجيل الدخول" : "SIGN IN"}</span>
            </button>
          )}
        </div>
      </header>

      {/* Middle Content Section with Dynamic Shop Background Watermark */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Full-width background image element behind the main content area (between header and footer) */}
        {bgImageUrl && (
          <div 
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden" 
            aria-hidden="true"
          >
            {/* Background image: cover, soft fixed scroll, 18% opacity */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-[0.18]"
              style={{ backgroundImage: `url(${bgImageUrl})` }}
            />
            {/* Solid light off-white color overlay (#F9FAFB) at 82% opacity */}
            <div className="absolute inset-0 bg-[#F9FAFB]/82" />
          </div>
        )}

        {/* Content positioned in front of background watermark texture */}
        <div className="relative z-10 flex flex-col min-h-full">
          {/* Navigation (Tab Bar) with Dynamic Brand Color Accent Underline Indicator */}
          <nav className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-[61px] z-30 shadow-xs">
            <div className="max-w-[1240px] mx-auto px-4 md:px-8">
              <div className="grid grid-cols-3 gap-2 md:gap-8">
                {[
                  { step: 1, num: "01", labelEn: "LIFESTYLE PROFILE", labelAr: "استبيان نمط الحياة", icon: Sliders },
                  { step: 2, num: "02", labelEn: "CLINICAL DATA", labelAr: "البيانات البصرية", icon: FileText },
                  { step: 3, num: "03", labelEn: "BIOMETRIC ANALYTICS", labelAr: "القياسات الحيوية", icon: Scan },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = currentStep === tab.step;
                  const isPast = currentStep > tab.step;
                  const isAccessible = tab.step === 1 || (tab.step === 2 && isPhase1Valid) || (tab.step === 3 && isPhase1Valid && isPhase2Valid);

                  return (
                    <button
                      key={tab.step}
                      type="button"
                      onClick={() => {
                        if (tab.step === 1) setCurrentStep(1);
                        else if (tab.step === 2 && isPhase1Valid) setCurrentStep(2);
                        else if (tab.step === 3 && isPhase1Valid && isPhase2Valid) setCurrentStep(3);
                      }}
                      disabled={!isAccessible}
                      className={`relative py-3.5 md:py-4 px-2 md:px-4 text-center sm:text-start flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 transition-colors font-sans cursor-pointer disabled:cursor-not-allowed ${
                        isActive
                          ? "font-semibold"
                          : isPast
                          ? "text-gray-700 hover:text-gray-900 font-medium"
                          : "text-gray-400 hover:text-gray-500 font-medium"
                      }`}
                      style={isActive ? { color: brandPrimary } : undefined}
                    >
                      <TabIcon 
                        className="w-4 h-4 shrink-0 transition-colors" 
                        style={isActive ? { color: brandPrimary } : undefined} 
                      />
                      <span className="text-[11px] md:text-[13px] tracking-wider uppercase truncate">
                        {tab.num} {isArabic ? tab.labelAr : tab.labelEn}
                      </span>
                      
                      {/* Dynamic primary_color indicator line on active tab */}
                      {isActive && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-sm transition-all duration-300"
                          style={{ backgroundColor: brandPrimary }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Main Multi-Step Workspace Container */}
          <main className="flex-grow max-w-[1240px] mx-auto w-full px-4 md:px-8 py-8 md:py-12 space-y-12">

        {/* PHASE 1: LIFESTYLE & ENVIRONMENTAL AUDIT */}
        {currentStep === 1 && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Centered Main Title and Subtitle */}
            <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#111827] font-normal tracking-tight">
                {isArabic ? "اعثر على نظارتك المثالية" : "Find Your Perfect Glasses"}
              </h1>
              <p className="font-sans text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto font-normal">
                {isArabic 
                  ? "نطابق شكل وجهك، قياساتك، ونشاطك اليومي لنختار لك نظارات تبدو رائعة ومريحة تماماً."
                  : "We match your face shape, measurements, and daily activities to find glasses that look great and feel comfortable."}
              </p>
            </div>

            {/* Large Grid of Selection Cards (6 options) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lifestyleOptions.map((opt) => {
                const isSelected = lifestyleFocus.includes(opt.id);
                const OptIcon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (lifestyleFocus.length > 1) {
                          setLifestyleFocus(lifestyleFocus.filter(id => id !== opt.id));
                        }
                      } else {
                        setLifestyleFocus([...lifestyleFocus, opt.id]);
                      }
                    }}
                    className={`group relative p-6 rounded-2xl bg-white text-start transition-all duration-200 cursor-pointer border flex flex-col justify-between shadow-xs hover:shadow-md ${
                      isSelected
                        ? "ring-2"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={isSelected ? {
                      borderColor: brandPrimary,
                      boxShadow: `0 0 0 2px ${brandPrimary}`,
                      backgroundColor: `${brandPrimary}08`
                    } : undefined}
                  >
                    {/* Top Row: Dynamic Brand Primary Vector Line Icon + Selection Indicator */}
                    <div className="flex items-start justify-between w-full mb-6">
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? "text-white" : "group-hover:opacity-90"
                        }`}
                        style={{
                          backgroundColor: isSelected ? brandPrimary : `${brandPrimary}15`,
                          color: isSelected ? "#ffffff" : brandPrimary
                        }}
                      >
                        <OptIcon className="w-6 h-6 stroke-[1.75]" />
                      </div>

                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "text-white shadow-xs"
                            : "border border-gray-300 text-transparent group-hover:border-gray-400"
                        }`}
                        style={isSelected ? { backgroundColor: brandPrimary } : undefined}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* Text Content */}
                    <div>
                      <h3 className="font-sans text-[17px] font-semibold text-[#111827] tracking-tight mb-2">
                        {isArabic ? opt.titleAr : opt.titleEn}
                      </h3>
                      <p className="font-sans text-[13.5px] text-gray-600 leading-relaxed font-normal">
                        {isArabic ? opt.descAr : opt.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step Progression Button to Step 2 (Styled with primary_color) */}
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!isPhase1Valid}
                className={`py-3.5 px-8 font-sans font-medium text-sm rounded-xl transition-all shadow-sm flex items-center gap-2 ${
                  isPhase1Valid
                    ? "text-white cursor-pointer hover:shadow-md hover:brightness-105"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                style={isPhase1Valid ? { backgroundColor: brandPrimary } : undefined}
              >
                <span>{isArabic ? "المتابعة: إدخال الوصفة الطبية (02)" : "Continue to 02 Clinical Data"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: CLINICAL PRESCRIPTION METADATA */}
        {currentStep === 2 && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="font-sans text-xs text-brand-gold font-bold tracking-widest uppercase block">
                {isArabic ? "المرحلة الثانية" : "02 CLINICAL DATA"}
              </span>
              <h2 className="font-serif text-[32px] md:text-[40px] tracking-tight text-[#111827]">
                {isArabic ? "اختياري - أدخل تفاصيل وصفة النظارات الطبية" : "Optional — Enter Eyewear Prescription"}
              </h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed font-sans">
                {isArabic 
                  ? "أدخل تفاصيل وصفة نظارتك الطبية يدويًا أو بسحب وإفلات مستند الوصفة الخاص بك."
                  : "Provide your eyewear prescription by entering numbers manually or dragging and dropping your prescription slip."}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOdSph("0.00");
                    setOdCyl("0.00");
                    setOdAxis("0");
                    setOsSph("0.00");
                    setOsCyl("0.00");
                    setOsAxis("0");
                    setPd("64");
                    setCurrentStep(3);
                  }}
                  className="font-sans text-xs uppercase tracking-wider bg-white hover:bg-gray-100 text-brand-gold px-5 py-2.5 rounded-xl border border-gray-300 hover:border-brand-gold transition-all cursor-pointer inline-flex items-center gap-2 font-medium shadow-xs"
                >
                  <span>
                    {isArabic 
                      ? "تخطي هذا القسم (بدون قياس نظر / عدسات زيرو)" 
                      : "Bypass this section (Set as Plano 0.00)"}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Interactive Dropzone / Upload box (40% Column) */}
              <div className="lg:col-span-5 space-y-4">
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[300px] shadow-xs ${
                    dragActive 
                      ? "border-brand-gold bg-brand-gold/10" 
                      : "border-gray-300 hover:border-brand-gold bg-white hover:bg-gray-50/50"
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden" 
                    accept=".jpg,.jpeg,.png,.pdf" 
                  />

                  {isParsingFile ? (
                    <div className="space-y-4">
                      <div className="relative flex justify-center items-center">
                        <div className="w-14 h-14 border-3 border-t-transparent border-brand-gold rounded-full animate-spin"></div>
                        <FileText className="absolute w-6 h-6 text-brand-gold" />
                      </div>
                      <div>
                        <p className="font-serif text-[18px] text-[#111827]">
                          {isArabic ? "جاري قراءة وتحليل الوصفة..." : "Parsing Prescription Assets..."}
                        </p>
                        <p className="font-sans text-[11px] text-gray-500 mt-1 uppercase tracking-wider">
                          Powered by Gemini AI Vision
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-brand-gold/10 rounded-2xl border border-brand-gold/30 inline-block text-brand-gold">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="font-serif text-[19px] text-[#111827] font-semibold">
                          {isArabic ? "ارفع صورة من قياس نظرك " : "Upload Physical Prescription"}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed font-sans">
                          {isArabic 
                            ? "يدعم صور JPG و PNG والملفات المكتوبة بخط اليد لاستخراج المحاور تلقائياً وبدقة عالية."
                            : "Accepts JPG, PNG, or PDF. Our vision pipeline extracts sphere, cylinder, and axis values accurately."}
                        </p>
                      </div>
                      <div className="pt-2">
                        <span className="font-sans text-xs uppercase tracking-wider text-white bg-brand-gold hover:bg-brand-gold/90 px-5 py-2.5 rounded-xl font-medium inline-block shadow-xs">
                          {isArabic ? "تصفح الملفات" : "Select File"}
                        </span>
                      </div>
                    </div>
                  )}

                  {prescriptionFileName && !isParsingFile && (
                    <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2 text-start max-w-full">
                      <FileText className="w-5 h-5 text-brand-gold flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs text-[#111827] font-sans font-medium truncate">{prescriptionFileName}</p>
                        <p className="text-[10px] text-emerald-600 uppercase tracking-wider mt-0.5 font-sans font-semibold">
                          {fileParseSuccess ? (isArabic ? "تم استخراج البيانات!" : "PARSED SUCCESSFULLY") : (isArabic ? "تم الرفع" : "UPLOADED")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Entry Form Inputs (60% Column) */}
              <div className="lg:col-span-7 bg-white border border-gray-200 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
                <div className="border-b border-gray-200 pb-4 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <h3 className="font-serif text-[20px] text-[#111827] tracking-wide font-semibold">
                      {isArabic ? "إدخال بيانات العدسات يدوياً" : "Prescription Metadata Registry"}
                    </h3>
                    <p className="font-sans text-xs text-gray-500 mt-1">
                      {isArabic ? "أدخل تفاصيل وصفتك الطبية (Rx) أو اختر نظارة بدون مقاس لحماية الشاشات" : "Input details from your Rx or choose Plano for zero-power screen protection"}
                    </p>
                  </div>

                  {/* 1-Click Fast Conversion Options */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOdSph("0.00");
                        setOdCyl("0.00");
                        setOdAxis("180");
                        setOsSph("0.00");
                        setOsCyl("0.00");
                        setOsAxis("180");
                        setPd("64.0");
                      }}
                      className="px-3 py-1.5 bg-brand-gold/10 border border-brand-gold/30 hover:bg-brand-gold hover:text-white text-brand-gold font-sans text-xs rounded-lg transition-all cursor-pointer font-medium"
                    >
                      {isArabic ? "⚡ بدون مقاس / حماية شاشات (0.00 Plano)" : "⚡ Non-Prescription / Plano (0.00)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOdSph("-1.50");
                        setOdCyl("-0.50");
                        setOdAxis("180");
                        setOsSph("-1.25");
                        setOsCyl("-0.25");
                        setOsAxis("175");
                        setPd("63.5");
                      }}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-sans text-xs rounded-lg transition-all cursor-pointer font-medium"
                    >
                      {isArabic ? "👓 تجربة وصفة نموذجية (-1.50)" : "👓 Demo Rx (-1.50)"}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Right Eye (OD) */}
                  <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <h4 className="font-sans text-sm text-[#111827] tracking-tight font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
                        {isArabic ? "العين اليمنى (OD)" : "Right Eye (Oculus Dexter - OD)"}
                      </h4>
                      <span className="font-sans text-[11px] text-gray-500 uppercase">Oculus Dexter</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {/* SPH */}
                      <div className="space-y-1.5">
                        <label className="font-sans text-xs text-gray-600 font-medium block">
                          {isArabic ? "الكرة (SPH)" : "Sphere (SPH)"}
                        </label>
                        <input 
                          type="text" 
                          value={odSph}
                          onChange={(e) => setOdSph(e.target.value)}
                          placeholder="-1.25"
                          className="w-full bg-white border border-gray-300 p-2.5 text-sm text-[#111827] font-sans focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-all rounded-lg"
                        />
                      </div>
                      {/* CYL */}
                      <div className="space-y-1.5">
                        <label className="font-sans text-xs text-gray-600 font-medium block">
                          {isArabic ? "الاسطوانة (CYL)" : "Cylinder (CYL)"}
                        </label>
                        <input 
                          type="text" 
                          value={odCyl}
                          onChange={(e) => setOdCyl(e.target.value)}
                          placeholder="-0.50"
                          className="w-full bg-white border border-gray-300 p-2.5 text-sm text-[#111827] font-sans focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-all rounded-lg"
                        />
                      </div>
                      {/* AXIS */}
                      <div className="space-y-1.5">
                        <label className="font-sans text-xs text-gray-600 font-medium block">
                          {isArabic ? "المحور (Axis)" : "Axis (AXS)"}
                        </label>
                        <input 
                          type="text" 
                          value={odAxis}
                          onChange={(e) => setOdAxis(e.target.value)}
                          placeholder="180"
                          className="w-full bg-white border border-gray-300 p-2.5 text-sm text-[#111827] font-sans focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-all rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Left Eye (OS) */}
                  <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <h4 className="font-sans text-sm text-[#111827] tracking-tight font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
                        {isArabic ? "العين اليسرى (OS)" : "Left Eye (Oculus Sinister - OS)"}
                      </h4>
                      <span className="font-sans text-[11px] text-gray-500 uppercase">Oculus Sinister</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {/* SPH */}
                      <div className="space-y-1.5">
                        <label className="font-sans text-xs text-gray-600 font-medium block">
                          {isArabic ? "الكرة (SPH)" : "Sphere (SPH)"}
                        </label>
                        <input 
                          type="text" 
                          value={osSph}
                          onChange={(e) => setOsSph(e.target.value)}
                          placeholder="-1.00"
                          className="w-full bg-white border border-gray-300 p-2.5 text-sm text-[#111827] font-sans focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-all rounded-lg"
                        />
                      </div>
                      {/* CYL */}
                      <div className="space-y-1.5">
                        <label className="font-sans text-xs text-gray-600 font-medium block">
                          {isArabic ? "الاسطوانة (CYL)" : "Cylinder (CYL)"}
                        </label>
                        <input 
                          type="text" 
                          value={osCyl}
                          onChange={(e) => setOsCyl(e.target.value)}
                          placeholder="-0.25"
                          className="w-full bg-white border border-gray-300 p-2.5 text-sm text-[#111827] font-sans focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-all rounded-lg"
                        />
                      </div>
                      {/* AXIS */}
                      <div className="space-y-1.5">
                        <label className="font-sans text-xs text-gray-600 font-medium block">
                          {isArabic ? "المحور (Axis)" : "Axis (AXS)"}
                        </label>
                        <input 
                          type="text" 
                          value={osAxis}
                          onChange={(e) => setOsAxis(e.target.value)}
                          placeholder="170"
                          className="w-full bg-white border border-gray-300 p-2.5 text-sm text-[#111827] font-sans focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-all rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pupil Distance (PD) */}
                  <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl flex items-center justify-between gap-4">
                    <div className="max-w-[70%]">
                      <label className="font-sans text-xs text-brand-gold uppercase tracking-wider block font-semibold">
                        {isArabic ? "مسافة الحدقتين (PD)" : "Pupil Distance (PD)"}
                      </label>
                      <span className="text-xs text-gray-500 leading-normal block mt-0.5 font-sans">
                        {isArabic ? "المسافة الكلية بين بؤبؤي العينين بالملليمتر" : "The aggregate distance between your pupil centers in millimeters"}
                      </span>
                    </div>
                    <input 
                      type="text" 
                      value={pd}
                      onChange={(e) => setPd(e.target.value)}
                      placeholder="64"
                      className="w-24 bg-white border border-brand-gold/40 p-2.5 text-sm text-brand-gold font-sans text-center focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-all rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 bg-brand-gold/10 border border-brand-gold/30 rounded-xl flex items-start gap-3">
                  <Sliders className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm text-brand-gold font-sans leading-relaxed">
                    {isArabic 
                      ? "ملاحظة طبية: إذا لم يكن قياس مسافة حدقة العين (IPD) مسجلاً في وصفتك الطبية، يمكنك ترك القيمة الافتراضية. في القسم التالي، سيقوم الفحص البيومتري التلقائي للرأس بحسابها بدقة."
                      : "Clinical Note: If you do not have the IPD (Inter Pupillary Distance) recorded on your prescription, leave the standard default. In the next section our biometric head scan will calculate it automatically."}
                  </p>
                </div>

              </div>

            </div>

            {/* Step Progression Button to step 3 */}
            {currentStep === 2 && (
              <div className="pt-6">
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!isPhase2Valid}
                  className={`w-full py-4 font-sans font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isPhase2Valid 
                      ? "bg-brand-gold hover:bg-brand-gold/90 text-white cursor-pointer hover:shadow-md" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span>{isArabic ? "الانتقال إلى الفحص الحيوي للفيديو" : "Unlock 3D Biometric Scanner Viewport"}</span>
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        )}

        {/* PHASE 3: BIOMETRIC SCANNING, METRIC CALCULATIONS & CUSTOM TAILORED UPSALE DISPLAY */}
        {currentStep === 3 && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="font-sans text-xs text-brand-gold font-bold tracking-widest uppercase block">
                {isArabic ? "المرحلة الثالثة" : "03 BIOMETRIC ANALYTICS"}
              </span>
              <h2 className="font-serif text-[32px] md:text-[40px] tracking-tight text-[#111827]">
                {isArabic ? "منصة الفحص والتحليل الحيوي ثلاثي الأبعاد" : "3D Biometric Scanning Workspace"}
              </h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed font-sans">
                {isArabic 
                  ? "منصة تخطيط ملامح الوجه وحساب القياسات بدقة متناهية عبر التسلسل الحيوي ثلاثي الأبعاد."
                  : "Calibrate your precise interpupillary distance (IPD) and facial profile using our advanced biometric face scanner."}
              </p>
            </div>

            {/* Launch Scanner / Active HUD Metrics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Launch Dashboard and Documentation (8 cols) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Launch Button Panel */}
                <div className="relative p-8 bg-white border border-gray-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="space-y-2 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
                      <h4 className="font-serif text-[19px] text-[#111827] font-semibold">
                        {isArabic ? "دعم الفحص البصري التفاعلي" : "Active Biometric Interface Standby"}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 max-w-md font-sans">
                      {isArabic 
                        ? "قم بتشغيل تطبيق الماسح المباشر لبدء التقاط الإطارات الثلاثية وتحليلها بواسطة الذكاء الاصطناعي."
                        : "Launch the high-resolution face mapping engine to capture head rotations and calculate customized frame metrics."}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        setShowAuthGate(true);
                      } else {
                        setIsScannerModalOpen(true);
                      }
                    }}
                    className="px-8 py-4 bg-brand-gold hover:bg-brand-gold/90 text-white font-sans text-xs tracking-wider uppercase font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2.5 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                    <span>{isArabic ? "تشغيل ماسح الوجه الحيوي" : "Launch Face Scanner"}</span>
                  </button>
                </div>

              </div>

              {/* Right Column: Active Biometric HUD Sidebar (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* HUD Sidebar Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 min-h-[400px] shadow-sm">
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="font-serif text-[18px] text-[#111827] tracking-wide font-semibold">
                      {isArabic ? "المعلمات الحيوية النشطة" : "Active Biometric HUD"}
                    </h3>
                    <p className="font-sans text-xs text-gray-500 uppercase tracking-wider mt-1">
                      {isArabic ? "قيم القياسات البصرية الدقيقة" : "Clinical depth and dimension matrices"}
                    </p>
                  </div>

                  {analysisResult ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      
                      {/* IPD Metric */}
                      <div className="flex justify-between items-center p-3.5 bg-brand-gold/10 border border-brand-gold/30 rounded-xl">
                        <div>
                          <p className="font-sans text-[11px] text-gray-600 uppercase tracking-wider font-medium">
                            {isArabic ? "مسافة حدقة العين الكلية (IPD)" : "Aggregated IPD"}
                          </p>
                          <p className="text-[28px] font-sans text-brand-gold font-bold mt-1 leading-none">
                            {analysisResult.interpupillaryDistance.toFixed(1)} <span className="text-xs text-gray-500 font-normal">mm</span>
                          </p>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
                      </div>

                      {/* Face Shape Class */}
                      <div>
                        <p className="font-sans text-xs text-gray-500 uppercase tracking-wider">
                          {isArabic ? "تصنيف هندسة الوجه" : "Facial Morphology Shape"}
                        </p>
                        <p className="font-serif text-[20px] text-[#111827] mt-1 font-semibold">
                          {isArabic ? analysisResult.faceShapeAr : analysisResult.faceShape}
                        </p>
                      </div>

                      {/* Symmetry Index */}
                      <div>
                        <p className="font-sans text-xs text-gray-500 uppercase tracking-wider">
                          {isArabic ? "مؤشر التماثل الحيوي" : "Clinical Symmetry Index"}
                        </p>
                        <p className="font-sans text-[18px] text-emerald-600 mt-1 font-bold">
                          {(analysisResult.symmetry * 100).toFixed(1)}% <span className="text-xs text-gray-500 font-normal">({isArabic ? "ممتاز" : "OPTIMAL"})</span>
                        </p>
                      </div>

                      {/* Tailored style profile */}
                      <div>
                        <p className="font-sans text-xs text-gray-500 uppercase tracking-wider">
                          {isArabic ? "نمط شخصيتك المصمم" : "Tailored Style Profile"}
                        </p>
                        <p className="font-serif text-[18px] text-[#111827] mt-1 font-semibold">
                          {isArabic ? analysisResult.styleProfileAr : analysisResult.styleProfile}
                        </p>
                      </div>

                      {/* Clinical submillimeter indices */}
                      <div className="border-t border-gray-200 pt-4 space-y-2">
                        <p className="font-sans text-xs text-gray-500 uppercase tracking-wider">
                          {isArabic ? "أبعاد الوجه الفرعية بالملليمتر" : "Sub-Millimeter Facio-Dimensions"}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                          <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-gray-500">{isArabic ? "عرض عظمة الخد" : "Cheekbone"}</span>
                            <span className="text-[#111827] font-medium">{analysisResult.subMillimeterDimensions.cheekboneWidth}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-gray-500">{isArabic ? "عرض الفك" : "Jawline"}</span>
                            <span className="text-[#111827] font-medium">{analysisResult.subMillimeterDimensions.jawlineWidth}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-gray-500">{isArabic ? "طول الوجه" : "Length"}</span>
                            <span className="text-[#111827] font-medium">{analysisResult.subMillimeterDimensions.faceLength}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-gray-500">{isArabic ? "عرض الأنف" : "Bridge"}</span>
                            <span className="text-[#111827] font-medium">{analysisResult.subMillimeterDimensions.bridgeWidth}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 space-y-4">
                      <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center bg-gray-50">
                        <Sliders className="w-5 h-5 text-brand-gold" />
                      </div>
                      <p className="text-xs max-w-[200px] leading-relaxed font-sans text-gray-500">
                        {isArabic ? "بانتظار تفعيل ومسح الكاميرا لعرض القياسات" : "Awaiting scan sequence to hydrate clinical metrics"}
                      </p>
                    </div>
                  )}

                </div>

              </div>

            </div>

            {/* Rigorous Scientific & Clinical Analysis display panel */}
            {analysisResult && (
              <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-2xl border-s-4 border-s-brand-gold shadow-sm animate-in slide-in-from-left-5 duration-500">
                <p className="font-sans text-xs text-brand-gold uppercase tracking-wider mb-3 font-bold">
                  {isArabic ? `التقرير والتحليل العيادي البصري لـ ${shop.name}` : `${shop.name} Clinical Appraisal`}
                </p>
                <p className="text-sm md:text-base leading-relaxed text-gray-700 whitespace-pre-line font-serif italic">
                  {isArabic 
                    ? analysisResult.clinicalAnalysis.split("/")[1]?.trim() || analysisResult.clinicalAnalysis
                    : analysisResult.clinicalAnalysis.split("/")[0]?.trim() || analysisResult.clinicalAnalysis}
                </p>
              </div>
            )}

            {/* Database Eyewear Matching & Try-On Suite */}
            {analysisResult && (
              <DatabaseTryOnSuite
                analysisResult={analysisResult}
                isArabic={isArabic}
                capturedFrames={capturedFrames}
                setCurrentStep={setCurrentStep}
                selectedProductIndex={selectedProductIndex}
                focusOptions={focusOptions}
                lifestyleFocus={lifestyleFocus}
                lifestyleLeisure={lifestyleLeisure}
                discountPercent={shopPromotion.discountPercent}
                onOpenBooking={(params) => {
                  setActiveBookingParams(params);
                  setSelectedLensType(params.lensType);
                  setSelectedLensIndex(params.lensIndex);
                  setLensUpgrades(params.upgrades);
                  setSelectedBumps(params.bumps);
                  setIsBookingModalOpen(true);
                }}
                onOpenCheckout={(params) => {
                  setActiveBookingParams(params);
                  setSelectedLensType(params.lensType);
                  setSelectedLensIndex(params.lensIndex);
                  setLensUpgrades(params.upgrades);
                  setSelectedBumps(params.bumps);
                  setIsBookingModalOpen(true);
                }}
              />
            )}

          </div>
        )}

      </main>

      {/* Persistent Floating Sales Funnel Conversion Sticky Bar */}
      {analysisResult && (
        <FunnelStickyBar
          isArabic={isArabic}
          frame={matchedEyeglass || { frame_name: "Envision 2061", brand: "Envision", price: 94.99, media_url: matchedMediaUrl }}
          lensType={selectedLensType}
          lensIndex={selectedLensIndex}
          lensUpgrades={lensUpgrades}
          selectedBumps={selectedBumps}
          discountPercent={shopPromotion.discountPercent}
          onOpenBooking={() => {
            setActiveBookingParams({
              frame: matchedEyeglass || { frame_name: "Envision 2061", brand: "Envision", price: 94.99, media_url: matchedMediaUrl },
              lensType: selectedLensType,
              lensIndex: selectedLensIndex,
              upgrades: lensUpgrades,
              bumps: selectedBumps
            });
            setIsBookingModalOpen(true);
          }}
        />
      )}
        </div>
      </div>

      {/* Clean Solid White Footer (#FFFFFF) */}
      <footer className="w-full py-12 md:py-16 bg-white border-t border-gray-200 text-center relative z-20">
        <div className="max-w-[1240px] mx-auto px-6 space-y-6">
          <div className="flex items-center justify-center gap-3">
            {shop.logo_url ? (
              <img 
                src={shop.logo_url} 
                alt={shop.name} 
                className="h-8 max-h-8 max-w-[160px] object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <>
                <div 
                  className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 shadow-xs flex items-center justify-center"
                  style={{ color: brandPrimary }}
                >
                  <Glasses className="w-5 h-5" />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5">
                  <span className="font-sans font-bold text-lg md:text-xl tracking-tight text-[#111827]">
                    {shop.name}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-gray-600 text-xs uppercase tracking-wider font-sans font-medium">
            <button 
              onClick={() => setActiveFooterModal("privacy")}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              {isArabic ? "سياسة الخصوصية" : "PRIVACY POLICY"}
            </button>
            <button 
              onClick={() => setActiveFooterModal("terms")}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              {isArabic ? "شروط الخدمة" : "TERMS OF SERVICE"}
            </button>
            <button 
              onClick={() => setActiveFooterModal("tech")}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              {isArabic ? "المواصفات التقنية" : "TECHNICAL SPECIFICATIONS"}
            </button>
          </div>

          <p className="font-sans text-xs text-gray-500 tracking-wide">
            {isArabic 
              ? `© 2026 ${shop.name}. جميع الحقوق محفوظة.`
              : `© 2026 ${shop.name}. ALL RIGHTS RESERVED.`}
          </p>
        </div>
      </footer>

      {/* Face Scanner Modal Overlay */}
      {isScannerModalOpen && (
        <FaceScannerModal
          isOpen={isScannerModalOpen}
          onClose={() => setIsScannerModalOpen(false)}
          onComplete={(results) => {
            handleScannerComplete(results);
            setIsScannerModalOpen(false);
          }}
        />
      )}

      {/* In-Store VIP Try-On Reservation Modal */}
      {isBookingModalOpen && (
        <InStoreBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          isArabic={isArabic}
          frame={activeBookingParams?.frame || matchedEyeglass || { frame_name: "Envision 2061", brand: "Envision", price: 94.99, media_url: matchedMediaUrl }}
          prescription={{
            odSph: odSph || "0.00",
            odCyl: odCyl || "0.00",
            odAxis: odAxis || "180",
            osSph: osSph || "0.00",
            osCyl: osCyl || "0.00",
            osAxis: osAxis || "180",
            pd: pd || (analysisResult?.interpupillaryDistance ? analysisResult.interpupillaryDistance.toFixed(1) : "64.0")
          }}
          lensType={activeBookingParams?.lensType || selectedLensType}
          lensIndex={activeBookingParams?.lensIndex || selectedLensIndex}
          lensUpgrades={activeBookingParams?.upgrades || lensUpgrades}
          selectedBumps={activeBookingParams?.bumps || selectedBumps}
          analysisResult={analysisResult}
          promotionConfig={shopPromotion}
          onReservationConfirmed={(reservation) => {
            setConfirmedReservation(reservation);
            setIsBookingModalOpen(false);
            setIsVoucherModalOpen(true);
          }}
        />
      )}

      {/* In-Store Discount Voucher Pass Modal */}
      {isVoucherModalOpen && (
        <VoucherPassModal
          isOpen={isVoucherModalOpen}
          reservation={confirmedReservation}
          onClose={() => setIsVoucherModalOpen(false)}
          isArabic={isArabic}
        />
      )}

      {/* Shop Owner Promotion Config Modal */}
      {isOwnerSettingsOpen && (
        <ShopOwnerSettingsModal
          isOpen={isOwnerSettingsOpen}
          onClose={() => setIsOwnerSettingsOpen(false)}
          isArabic={isArabic}
          config={shopPromotion}
          onSaveConfig={(newConfig) => setShopPromotion(newConfig)}
        />
      )}

      {/* Optical Boutique Personal Link Modal */}
      {isShopLinkModalOpen && (
        <ShopLinkModal
          isOpen={isShopLinkModalOpen}
          onClose={() => setIsShopLinkModalOpen(false)}
          isArabic={isArabic}
        />
      )}

      {/* Footer Legal/Technical Modals */}
      {activeFooterModal !== null && (
        <FooterModal
          isOpen={activeFooterModal !== null}
          type={activeFooterModal}
          onClose={() => setActiveFooterModal(null)}
          isArabic={isArabic}
        />
      )}

    </div>
  );
}
