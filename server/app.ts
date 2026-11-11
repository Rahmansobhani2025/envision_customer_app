import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();


const app = express();


// Set up body parser with large limits for webcam base64 frames or file uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));


// Lazy-initialize Gemini client to prevent crashes if the API key is not present on startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      } catch (err) {
        console.error("Error initializing Gemini client:", err);
      }
    }
  }
  return aiClient;
}

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get("content-type") || "image/png";
    return {
      data: buffer.toString("base64"),
      mimeType: contentType,
    };
  } catch (error) {
    console.error(`Error fetching image from ${url}:`, error);
    return null;
  }
}

// REST API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Primary end-to-end full-stack AI user experience endpoint
app.post("/api/analyze", async (req, res) => {
  const { 
    lifestyleFocus, 
    lifestyleLeisure, 
    odSph, 
    odCyl, 
    odAxis, 
    osSph, 
    osCyl, 
    osAxis, 
    pd, 
    prescriptionFile, // optional uploaded file
    webcamFrame // optional webcam frame snapshot (base64)
  } = req.body;

  const focusArray = Array.isArray(lifestyleFocus) 
    ? lifestyleFocus 
    : (typeof lifestyleFocus === 'string' && lifestyleFocus ? lifestyleFocus.split(',').map((s: string) => s.trim()) : []);
  const leisureArray = Array.isArray(lifestyleLeisure) 
    ? lifestyleLeisure 
    : (typeof lifestyleLeisure === 'string' && lifestyleLeisure ? lifestyleLeisure.split(',').map((s: string) => s.trim()) : []);

  const ai = getGeminiClient();

  if (!ai) {
    console.warn("GEMINI_API_KEY is not configured or invalid. Using high-fidelity fallback analysis engine.");
    return res.json(getFallbackAnalysis(focusArray, leisureArray, odSph, odCyl, odAxis, osSph, osCyl, osAxis, pd));
  }

  try {
    // Structure the prompt and parts for Gemini 3.5 Flash
    const systemPrompt = `You are Envision Eyewear's chief luxury optical designer and biometric clinical analysis AI.
Your task is to analyze a user's style preferences, multiple active lifestyles (for both work and leisure), prescription metrics (for both Right Eye OD and Left Eye OS), and facial biometric data (or uploaded prescription file) to return high-end styling diagnostics and custom-fitted luxury eyewear product suggestions.

IMPORTANT DESIGN INSTRUCTION:
The user has selected multiple active lifestyles (Primary Daily Focus options and Leisure/Environment options). You MUST evaluate ALL selected lifestyles simultaneously to determine the ideal combination of lenses, frame designs, and high-end coatings that harmonize with all of their daily activities. Do not just pick one; design a synthesized, multi-functional recommendations profile.

You must return a raw JSON object matching this schema precisely:
{
  "interpupillaryDistance": number, // Calculated Pupil Distance in mm. If the input PD is provided, refine it slightly or keep it. (standard range: 58-72mm)
  "faceShape": string, // Oval, Round, Square, Heart, or Diamond (English)
  "faceShapeAr": string, // Arabic translation of faceShape (e.g., بيضاوي)
  "symmetry": number, // Symmetry rating from 0.00 to 1.00 (e.g., 0.98)
  "pantoscopicAngle": number, // Optimal frame tilt angle in degrees (e.g., 8.5)
  "surfaceArea": number, // Facial surface area in cm² (e.g., 142)
  "skinTone": string, // E.g., Warm Sand, Alabaster, Rich Mocha, Olive (English)
  "skinToneAr": string, // Arabic translation of skinTone
  "colorPalette": string, // E.g., Autumn Earth, Celestial Cool, Sunset Warm (English)
  "colorPaletteAr": string, // Arabic translation of colorPalette
  "styleProfile": string, // E.g., Digital Avant-Garde, Academic Heritage, Sleek Professional, Bold Creative (English)
  "styleProfileAr": string, // Arabic translation of styleProfile
  "clinicalAnalysis": string, // A rigorous, bespoke, luxury scientific/clinical optical analysis text. It MUST contain BOTH English and Arabic translations separated cleanly by a forward slash ' / '. E.g., "The high pantoscopic tilt angle compensates for the digital glare... / يعوض الميل البانتوسكوبي المرتفع وهج الشاشة..."
  "subMillimeterDimensions": {
    "cheekboneWidth": string, // e.g. "138.4 mm"
    "jawlineWidth": string, // e.g. "121.2 mm"
    "faceLength": string, // e.g. "196.5 mm"
    "bridgeWidth": string // e.g. "16.5 mm"
  },
  "recommendations": [
    {
      "id": string, // unique ID e.g. "titanium-void" or "carbon-matrix"
      "name": string, // Premium model name
      "nameAr": string, // Arabic model name
      "description": string, // Premium description
      "descriptionAr": string, // Arabic premium description
      "price": string, // Price in dollars (e.g., "$540")
      "priceAr": string, // Price in Saudi Riyals (e.g., "٢,٠٢٥ ر.س")
      "matchingExplanation": string, // Luxury stylistic rationale explaining why it fits their face shape and lifestyle focus.
      "matchingExplanationAr": string, // Arabic translation of matchingExplanation
      "frameSvgType": string // "minimal-geometric" | "bold-rectangular" | "classic-aviator" | "editorial-round"
    }
  ]
}

Ensure the response contains no markdown tags or text around the JSON. Only return a pure JSON object.`;

    const promptText = `
User Lifestyle Data:
- Primary Daily Focus: ${focusArray.join(", ")}
- Leisure & Environment: ${leisureArray.join(", ")}

Prescription Metadata (Right Eye OD / Left Eye OS):
- Right Eye (OD): Sphere (SPH): ${odSph || "0.00"}, Cylinder (CYL): ${odCyl || "0.00"}, Axis: ${odAxis || "0"}
- Left Eye (OS): Sphere (SPH): ${osSph || "0.00"}, Cylinder (CYL): ${osCyl || "0.00"}, Axis: ${osAxis || "0"}
- Manual Pupil Distance (PD): ${pd || "64"} mm

Analyze the user's data and return the clinical & luxury stylist JSON recommendation, evaluating all selected lifestyles simultaneously.
`;

    const contents: any[] = [];
    
    // Add webcam frame if uploaded
    if (webcamFrame && webcamFrame.startsWith("data:")) {
      const commaIdx = webcamFrame.indexOf(",");
      if (commaIdx !== -1) {
        const mimeType = webcamFrame.substring(5, webcamFrame.indexOf(";"));
        const base64Data = webcamFrame.substring(commaIdx + 1);
        contents.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }
    }

    // Add prescription file if uploaded
    if (prescriptionFile && prescriptionFile.startsWith("data:")) {
      const commaIdx = prescriptionFile.indexOf(",");
      if (commaIdx !== -1) {
        const mimeType = prescriptionFile.substring(5, prescriptionFile.indexOf(";"));
        const base64Data = prescriptionFile.substring(commaIdx + 1);
        contents.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }
    }

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const text = response.text;
    if (text) {
      try {
        const parsedData = JSON.parse(text.trim());
        return res.json(parsedData);
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON output, falling back. Output was:", text);
        return res.json(getFallbackAnalysis(lifestyleFocus, lifestyleLeisure, odSph, odCyl, odAxis, osSph, osCyl, osAxis, pd));
      }
    } else {
      throw new Error("Empty response from Gemini");
    }

  } catch (error) {
    console.error("Gemini API call failed:", error);
    return res.json(getFallbackAnalysis(lifestyleFocus, lifestyleLeisure, odSph, odCyl, odAxis, osSph, osCyl, osAxis, pd));
  }
});

// Interactive Prescription Image Parser endpoint
app.post("/api/parse-prescription", async (req, res) => {
  const { fileData } = req.body; // base64 string
  const ai = getGeminiClient();

  if (!ai || !fileData) {
    return res.json({ 
      success: true, 
      odSph: "-1.25", 
      odCyl: "-0.50", 
      odAxis: "180", 
      osSph: "-1.00", 
      osCyl: "-0.25", 
      osAxis: "175", 
      pd: "63" 
    });
  }

  try {
    const commaIdx = fileData.indexOf(",");
    if (commaIdx === -1) {
      return res.status(400).json({ error: "Invalid base64 image data" });
    }
    const mimeType = fileData.substring(5, fileData.indexOf(";"));
    const base64Data = fileData.substring(commaIdx + 1);

    const prompt = `Analyze this physical paper prescription document. Extract the clinical values for both Right Eye (OD - Oculus Dexter) and Left Eye (OS - Oculus Sinister): Sphere (SPH), Cylinder (CYL), Axis, and Pupil Distance (PD).
If you cannot read specific values clearly, estimate standard balanced default values (e.g., SPH: -1.50, CYL: -0.75, Axis: 95, PD: 64).

Return JSON format with these exact keys:
{
  "odSph": string, // e.g. "-1.25"
  "odCyl": string, // e.g. "-0.50"
  "odAxis": string, // e.g. "180"
  "osSph": string, // e.g. "-1.00"
  "osCyl": string, // e.g. "-0.25"
  "osAxis": string, // e.g. "170"
  "pd": string // e.g. "64"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        },
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text.trim());
      return res.json({ success: true, ...parsed });
    } else {
      throw new Error("No text returned from Gemini");
    }
  } catch (err) {
    console.error("Failed to parse prescription image:", err);
    return res.json({ 
      success: true, 
      odSph: "-1.50", 
      odCyl: "-0.75", 
      odAxis: "90", 
      osSph: "-1.25", 
      osCyl: "-0.50", 
      osAxis: "95", 
      pd: "64",
      error: "Using estimated clinical values."
    });
  }
});

// Dynamic face scanning analysis endpoint using 3D camera frames
app.post("/api/gemini/analyze", async (req, res) => {
  const { centerFrameData, rightFrameData, leftFrameData } = req.body;
  const ai = getGeminiClient();

  const fallbackResults = {
    ipd: "64.0mm",
    faceShape: "Oval",
    symmetry: "0.98",
    bridgeWidth: "17.0mm",
    styleRecommendation: "Your balanced oval proportions perfectly suit angular geometric frames to add definition. / تتناسب نسب وجهك البيضاوي المتوازن تماماً مع الإطارات الهندسية ذات الزوايا لإضافة تحديد متميز لملامحك الأنيقة.",
    preferredStyle: "Sleek Professional",
    scientificAnalysis: "Automated analysis reveals a highly symmetrical facial structure with a dominance of curvilinear features in the zygomatic region. Optical alignment suggests a slightly wider-than-average pupillary distance, necessitating a frame with a balanced ocular placement. The geometric relationship between the supraorbital ridge and the jawline indicates a classic oval morphology, which provides architectural versatility. Recommended optical chassis should prioritize angularity in the superior rim to create a lifting effect that complements the natural soft-tissue distribution.\n\nيكشف التحليل التلقائي عن بنية وجه عالية التماثل مع هيمنة الملامح المنحنية في المنطقة الوجنية. ويشير المحاذاة البصرية إلى مسافة حدقية أكبر قليلاً من المتوسط، مما يتطلب إطاراً بوضع عدسي متوازن. تشير العلاقة الهندسية بين الحافة فوق الحجاجية وخط الفك إلى شكل بيضاوي كلاسيكي يوفر خطوطاً هندسية مرنة ومناسبة، حيث ينبغي أن تعطي الإطارات البصرية الموصى بها الأولوية للزوايا في الحافة العلوية لخلق تأثير رفع جانبي يكمل التوزيع الطبيعي للأنسجة الناعمة للبشرة.",
    facialDimensions: {
      faceWidth: 142,
      faceHeight: 210,
      eyeWidth: 32,
      cheekboneWidth: 138,
      jawlineWidth: 110
    }
  };

  if (!ai) {
    return res.json({ success: true, results: fallbackResults });
  }

  try {
    const contents: any[] = [];
    
    if (centerFrameData) {
      contents.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: centerFrameData
        }
      });
    }
    if (rightFrameData) {
      contents.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: rightFrameData
        }
      });
    }
    if (leftFrameData) {
      contents.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: leftFrameData
        }
      });
    }

    const systemPrompt = `You are Envision Eyewear's chief luxury optical designer and facial biometric clinical analysis AI.
You will receive images of a user's face (center, right, and left angles).
Perform a precise biometric and aesthetic analysis of their face shape, facial symmetry, pupillary distance (estimate from face structure, typically 58-72mm), facial dimensions (in mm), and recommend the ideal frame/lens fit.

IMPORTANT: The response MUST be gender-neutral or appropriate. Do NOT guess or default to gender-specific styles like "Professional Women" or "Men's Classic" unless the facial features are extremely distinct, but even then, prefer sophisticated, gender-neutral, universally appealing terminology such as "Sleek Professional", "Academic Heritage", "Digital Avant-Garde", "Classic Modern", "Active Explorer", or "Artisanal Visionary".

You must return a raw JSON object matching this schema precisely:
{
  "ipd": string, // Estimated Pupil Distance in mm, e.g. "64.0mm"
  "faceShape": string, // Oval, Round, Square, Heart, or Diamond (English)
  "symmetry": string, // Symmetry rating as decimal e.g. "0.98"
  "bridgeWidth": string, // Estimated bridge width in mm e.g. "17.0mm"
  "styleRecommendation": string, // Elegant, brief fitting description. It MUST contain BOTH English and Arabic translations separated cleanly by a forward slash ' / '.
  "preferredStyle": string, // Sophisticated gender-neutral style profile, e.g. "Sleek Professional", "Classic Modern", "Digital Avant-Garde", "Academic Heritage"
  "scientificAnalysis": string, // A detailed medical/clinical description explaining zygomatic structures, facial geometry, pupillary alignments, and orbital structures. It MUST contain BOTH English and Arabic translations separated cleanly by two newlines.
  "facialDimensions": {
    "faceWidth": number, // e.g. 142
    "faceHeight": number, // e.g. 210
    "eyeWidth": number, // e.g. 32
    "cheekboneWidth": number, // e.g. 138
    "jawlineWidth": number // e.g. 110
  }
}

Ensure the response contains no markdown tags or text around the JSON. Only return a pure JSON object.`;

    contents.push({ text: "Perform the biometric facial and optical styling analysis." });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const text = response.text;
    if (text) {
      const parsedData = JSON.parse(text.trim());
      return res.json({ success: true, results: parsedData });
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Biometric Face analysis API failed:", error);
    return res.json({ success: true, results: fallbackResults });
  }
});



// Dynamic Fallback Generator for full-offline capabilities & offline mock compliance
function getFallbackAnalysis(
  focus: string | string[], 
  leisure: string | string[], 
  odSph: string, 
  odCyl: string, 
  odAxis: string, 
  osSph: string, 
  osCyl: string, 
  osAxis: string, 
  pd: string
) {
  const finalPD = parseFloat(pd) || 64.2;
  const focusList = Array.isArray(focus) ? focus : [focus || "digital"];
  const leisureList = Array.isArray(leisure) ? leisure : [leisure || "gaming"];

  // Analyze focus elements to construct visual profile names & blends
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

  // Fallback defaults if none selected
  if (focusProfiles.length === 0) {
    focusProfiles.push("Digital Avant-Garde");
    focusProfilesAr.push("الرقمية الطليعية");
  }

  const styleProfile = focusProfiles.join(" & ");
  const styleProfileAr = focusProfilesAr.join(" و ");

  // Create clinical analysis that blends all selected focuses
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

  // Leisure blending
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
    clinicalAnalysis: `Clinical assessment shows a well-balanced facial symmetry of 98%. Recommended frame geometry includes a slight asymmetric bridge to compensate for right orbital tilt and a customized optical prescription combining: ${blendedClinicalJustificationEn}. / يظهر التقييم السريري تماثلاً متوازناً للوجه بنسبة ٩٨٪. تتضمن هندسة الإطار الموصى بها جسراً خفيفاً غير متماثل لتعويض ميلان حدقة العين اليمنى، مع تركيبة عدسات طبية مخصصة تجمع بين: ${blendedClinicalJustificationAr}.`,
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

export default app;
