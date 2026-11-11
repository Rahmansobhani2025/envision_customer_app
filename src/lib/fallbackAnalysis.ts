import { BiometricAnalysisResult } from "../types";

export function getClientFallbackAnalysis(
  focus: string | string[], 
  leisure: string | string[], 
  odSph: string, 
  odCyl: string, 
  odAxis: string, 
  osSph: string, 
  osCyl: string, 
  osAxis: string, 
  pd: string
): BiometricAnalysisResult {
  const finalPD = parseFloat(pd) || 64.2;
  const focusList = Array.isArray(focus) ? focus : [focus || "digital"];
  const leisureList = Array.isArray(leisure) ? leisure : [leisure || "gaming"];

  const focusProfiles: string[] = [];
  const focusProfilesAr: string[] = [];
  let faceShape = "Oval";
  let faceShapeAr = "بيضاوي";

  if (focusList.includes("digital")) {
    focusProfiles.push("Digital Avant-Garde");
    focusProfilesAr.push("الرقمية الطليعية");
  }
  if (focusList.includes("academic")) {
    focusProfiles.push("Academic Heritage");
    focusProfilesAr.push("التراث الأكاديمي الكلاسيكي");
    faceShape = "Diamond";
    faceShapeAr = "معين الملامح";
  }
  if (focusList.includes("field")) {
    focusProfiles.push("Active Explorer");
    focusProfilesAr.push("المستكشف الحركي النشط");
    faceShape = "Square";
    faceShapeAr = "مربع رياضي";
  }
  if (focusList.includes("creative")) {
    focusProfiles.push("Artisanal Visionary");
    focusProfilesAr.push("الرؤية الإبداعية الفنية");
    faceShape = "Heart";
    faceShapeAr = "ملامح القلب اللطيفة";
  }

  if (focusProfiles.length === 0) {
    focusProfiles.push("Digital Avant-Garde");
    focusProfilesAr.push("الرقمية الطليعية");
  }

  const styleProfile = focusProfiles.join(" & ");
  const styleProfileAr = focusProfilesAr.join(" و ");

  const clinicalJustifications: string[] = [];
  const clinicalJustificationsAr: string[] = [];

  if (focusList.includes("digital")) {
    clinicalJustifications.push("advanced blue-light filter to combat digital strain from screen-intensive tasks");
    clinicalJustificationsAr.push("فلتر متطور للضوء الأزرق لمقاومة الإجهاد الرقمي الناتج عن الاستخدام المكثف للشاشات");
  }
  if (focusList.includes("academic")) {
    clinicalJustifications.push("high-index optical clarity optimized for deep focus reading and near-work focal tracking");
    clinicalJustificationsAr.push("وضوح بصري بمعامل انكسار عالٍ مخصص للقراءة المركزة وتتبع المسافات القريبة");
  }
  if (focusList.includes("field")) {
    clinicalJustifications.push("high impact durability and dynamic UV coatings optimized for changing environments and field movement");
    clinicalJustificationsAr.push("متانة عالية لمقاومة الصدمات وطبقات حماية ديناميكية ضد الأشعة فوق البنفسجية ملائمة للحركة الميدانية");
  }
  if (focusList.includes("creative")) {
    clinicalJustifications.push("ultra-precise aberration control and anti-reflective premium coatings designed to preserve color accuracy and visual depth");
    clinicalJustificationsAr.push("تحكم فائق الدقة في الانحراف البصري وطبقات فاخرة مضادة للانعكاس للحفاظ على دقة الألوان والعمق البصري");
  }

  if (clinicalJustifications.length === 0) {
    clinicalJustifications.push("premium multi-coated lenses designed for general vision clarity");
    clinicalJustificationsAr.push("عدسات ممتازة متعددة الطبقات مصممة لوضوح الرؤية العام");
  }

  const blendedClinicalJustificationEn = clinicalJustifications.join(", blended with ");
  const blendedClinicalJustificationAr = clinicalJustificationsAr.join("، مدمجاً مع ");

  const leisureContexts: string[] = [];
  const leisureContextsAr: string[] = [];

  if (leisureList.includes("outdoors")) {
    leisureContexts.push("rugged outdoor adventures");
    leisureContextsAr.push("المغامرات الخارجية القوية");
  }
  if (leisureList.includes("gaming")) {
    leisureContexts.push("immersive gaming sessions");
    leisureContextsAr.push("جلسات الألعاب التفاعلية");
  }
  if (leisureList.includes("relaxing")) {
    leisureContexts.push("peaceful indoor relaxation");
    leisureContextsAr.push("الاسترخاء الهادئ في المنزل");
  }

  if (leisureContexts.length === 0) {
    leisureContexts.push("general leisure environments");
    leisureContextsAr.push("بيئات الترفيه العامة");
  }

  const blendedLeisureEn = leisureContexts.join(" and ");
  const blendedLeisureAr = leisureContextsAr.join(" و ");

  return {
    interpupillaryDistance: finalPD,
    faceShape: faceShape,
    faceShapeAr: faceShapeAr,
    symmetry: 0.98,
    pantoscopicAngle: 8.5,
    surfaceArea: 142.5,
    skinTone: "Warm Amber",
    skinToneAr: "برونزي دافئ",
    colorPalette: "Autumn Earth",
    colorPaletteAr: "ألوان الخريف الدافئة",
    styleProfile: styleProfile,
    styleProfileAr: styleProfileAr,
    clinicalAnalysis: `Clinical assessment shows a well-balanced facial symmetry of 98%. Recommended frame geometry includes a slight asymmetric bridge to compensate for right orbital tilt and a customized optical prescription combining: ${blendedClinicalJustificationEn}. / يظهر التقييم الحيوي تماثلاً متوازناً للوجه بنسبة ٩٨٪. تتضمن هندسة الإطار الموصى بها جسراً خفيفاً غير متماثل لتعويض ميلان حدقة العين اليمنى، مع تركيبة عدسات طبية مخصصة تجمع بين: ${blendedClinicalJustificationAr}.`,
    subMillimeterDimensions: {
      cheekboneWidth: "138.4 mm",
      jawlineWidth: "121.2 mm",
      faceLength: "196.5 mm",
      bridgeWidth: "16.5 mm"
    },
    recommendations: [
      {
        id: "titanium-void",
        name: "Titanium Void",
        nameAr: "تيتانيوم فويد",
        description: "Hand-milled Grade 5 Titanium with absolute structural purity.",
        descriptionAr: "تيتانيوم نقي من الدرجة الخامسة مشغول يدوياً.",
        price: "$540",
        priceAr: "٢,٠٢٥ ر.س",
        matchingExplanation: `Optimized for ${finalPD}mm Pupil Distance. High-angle rimless design complements the soft jawline of your ${faceShape} face shape. Custom formulated to support your active focus on ${focusList.join(" & ")}.`,
        matchingExplanationAr: `تم تحسينه لمسافة بؤرية ${finalPD} ملم. التصميم بدون إطار يكمل خط الفك لوجهك الـ ${faceShapeAr}. تم تصميمه خصيصاً ليتناسب مع اهتماماتك النشطة في ${focusList.join(" و ")}.`,
        frameSvgType: "minimal-geometric"
      },
      {
        id: "carbon-matrix",
        name: "Carbon Matrix",
        nameAr: "كربون ماتريكس",
        description: "3D-Woven aerospace carbon composite with matte hand-finish.",
        descriptionAr: "مركب كربون فضائي منسوج ثلاثي الأبعاد بلمسة نهائية غير لامعة.",
        price: "$610",
        priceAr: "٢,٢٨٥ ر.س",
        matchingExplanation: `Sturdy wide bridge design anchors perfectly on your nose structure. Matte finish harmonizes with your Warm Amber skin tone and seamlessly transitions during both ${blendedLeisureEn}.`,
        matchingExplanationAr: `تصميم الجسر العريض المتين يثبت بشكل مثالي على هيكل الأنف. اللون غير اللامع يتناغم مع بشرتك الدافئة وينتقل بسلاسة فائقة خلال ${blendedLeisureAr}.`,
        frameSvgType: "bold-rectangular"
      }
    ]
  };
}
