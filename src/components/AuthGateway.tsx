import React, { useState } from "react";
import { supabase, isPlaceholderConfig, supabaseUrl } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import { Eye, EyeOff, ShieldAlert, Sparkles, Key, Mail, UserPlus, LogIn, Globe, AlertTriangle, Phone } from "lucide-react";

interface AuthGatewayProps {
  onAuthSuccess: () => void;
  isArabic: boolean;
  onLanguageToggle: () => void;
  onBack?: () => void;
}

export default function AuthGateway({ onAuthSuccess, isArabic, onLanguageToggle, onBack }: AuthGatewayProps) {
  const { shop } = useShop();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(isArabic ? "الرجاء إدخال البريد الإلكتروني وكلمة المرور." : "Please enter both email and password.");
      return;
    }

    if (mode === "signup" && !whatsapp) {
      setError(isArabic ? "الرجاء إدخال رقم الواتساب." : "Please enter your WhatsApp number.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (isPlaceholderConfig) {
      setSuccessMsg(isArabic ? "تم تسجيل الدخول بنجاح (الوضع التجريبي الفوري)!" : "Signed in successfully (Instant Demo Mode)!");
      setTimeout(() => {
        onAuthSuccess();
      }, 700);
      setLoading(false);
      return;
    }

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        try {
          const existing = localStorage.getItem("envision_user_profile");
          const parsed = existing ? JSON.parse(existing) : {};
          localStorage.setItem("envision_user_profile", JSON.stringify({
            ...parsed,
            email
          }));
        } catch (e) {}
        onAuthSuccess();
      } else {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              whatsapp: whatsapp || "",
              role: "customer",       // never an agent/staff account
              shop_slug: shop.slug,   // which shop's link they signed up from
            }
          }
        });

        if (signUpError) throw signUpError;

        try {
          localStorage.setItem("envision_user_profile", JSON.stringify({
            email,
            phone: whatsapp || ""
          }));
        } catch (e) {}

        if (data?.session) {
          setSuccessMsg(isArabic ? "تم إنشاء الحساب بنجاح وتأكيد الدخول!" : "Account successfully created and signed in!");
          setTimeout(() => {
            onAuthSuccess();
          }, 1500);
        } else {
          setSuccessMsg(
            isArabic 
              ? "تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب إذا لزم الأمر." 
              : "Registration successful! Please check your email to confirm your account if required."
          );
        }
      }
    } catch (err: any) {
      console.warn("Auth notice:", err);
      // Catch network errors/Failed to fetch and provide graceful explanation
      if (err.message?.includes("fetch") || err.message?.includes("Failed to fetch") || !err.status) {
        setError(
          isArabic
            ? "فشل الاتصال بـ Supabase (Failed to fetch). يرجى التأكد من إدخال قيم صالحة للمتغيرات VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف البيئة."
            : `Failed to fetch (Supabase Connection Error). Verify your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct and active.`
        );
      } else {
        setError(err.message || (isArabic ? "حدث خطأ أثناء الاتصال بالخادم." : "An error occurred during authentication."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#0C0C0C] text-[#F5F5F7] flex flex-col justify-between selection:bg-brand-gold/30 animate-fade-in"
      dir={isArabic ? "rtl" : "ltr"}
    >
      
      {/* Brand Header */}
      <header className="border-b border-brand-gold/10 bg-[#0C0C0C]/90 backdrop-blur-md px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {shop.logo_url ? (
            <img src={shop.logo_url} alt={shop.name} className="h-9 w-auto max-w-[120px] object-contain" />
          ) : (
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-brand-gold/20 blur-sm"></div>
              <LogIn className="w-8 h-8 text-brand-gold relative" />
            </div>
          )}
          <div>
            <h1 className="font-serif text-[22px] md:text-[26px] uppercase tracking-[0.2em] text-brand-gold font-semibold leading-none">
              {shop.name}
            </h1>
            <p className="font-mono text-[9px] tracking-widest text-zinc-400 uppercase mt-1">
              AI CLINICAL LAB & STYLE SUITE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLanguageToggle}
            className="font-mono text-[11px] border border-brand-gold/30 px-4 py-2 hover:bg-brand-gold/10 hover:border-brand-gold transition-all flex items-center gap-2 text-zinc-300 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-brand-gold" />
            <span>{isArabic ? "ENGLISH" : "العربية"}</span>
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="font-mono text-[11px] border border-white/20 px-4 py-2 hover:bg-white/10 hover:border-white transition-all text-zinc-300 cursor-pointer"
            >
              <span>{isArabic ? "رجوع للتطبيق" : "BACK TO APP"}</span>
            </button>
          )}
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white/[0.02] border border-white/5 p-8 md:p-10 rounded-sm relative shadow-2xl space-y-6 backdrop-blur-sm">
          {/* Subtle design lines */}
          <div className="absolute top-0 left-0 w-8 h-[1px] bg-brand-gold" />
          <div className="absolute top-0 left-0 w-[1px] h-8 bg-brand-gold" />
          <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-brand-gold" />
          <div className="absolute bottom-0 right-0 w-[1px] h-8 bg-brand-gold" />

          {/* Configuration Status Notice */}
          {isPlaceholderConfig && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-sm space-y-2 animate-in fade-in duration-300">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-amber-400 font-mono uppercase tracking-wider">
                    {isArabic ? "نمط العرض التجريبي نشط" : "Sandbox Demo Mode Active"}
                  </h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    {isArabic 
                      ? "لم يتم إعداد مفاتيح Supabase الفعلية بعد. يرجى تهيئة بيانات الاعتماد الحقيقية في الإعدادات."
                      : `Supabase environment keys are using fallback placeholders. Please configure real credentials in settings.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 text-center">
            <span className="font-mono text-[10px] text-brand-gold tracking-[0.4em] uppercase block animate-pulse">
              {mode === "signin"
                ? (isArabic ? "بوابة تسجيل الدخول الأمنة" : "SECURE PORTAL ACCESS")
                : (isArabic ? "بوابة التسجيل والمصادقة" : "SECURE REGISTRATION GATEWAY")}
            </span>
            <h2 className="font-serif text-[28px] md:text-[32px] tracking-wide text-white">
              {mode === "signin" 
                ? (isArabic ? "تسجيل الدخول" : "Portal Login") 
                : (isArabic ? "إنشاء حساب جديد" : "Create Account")}
            </h2>
            <p className="text-zinc-400 text-[12px] leading-relaxed">
              {isArabic
                ? "ادخل إلى ملف قياساتك البصرية والنمط الحيوي المخصص المشغل بـ AI."
                : "Access your tailored biometric measurements & clinical lens profile powered by Gemini."}
            </p>
          </div>

          {/* Clear visual tabs indicating active mode */}
          <div className="grid grid-cols-2 gap-2 border-b border-white/10 pb-2">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`pb-3 text-center text-[12px] font-mono tracking-widest transition-all cursor-pointer ${
                mode === "signin"
                  ? "text-brand-gold border-b-2 border-brand-gold font-bold"
                  : "text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent"
              }`}
            >
              {isArabic ? "تسجيل الدخول (LOGIN)" : "LOGIN PORTAL"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`pb-3 text-center text-[12px] font-mono tracking-widest transition-all cursor-pointer ${
                mode === "signup"
                  ? "text-brand-gold border-b-2 border-brand-gold font-bold"
                  : "text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent"
              }`}
            >
              {isArabic ? "إنشاء حساب (SIGN UP)" : "SIGN UP FORM"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-sm space-y-3 animate-in fade-in duration-300">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-[12px] text-red-400 font-mono leading-relaxed">{error}</p>
                    {(error.toLowerCase().includes("credentials") || error.toLowerCase().includes("invalid")) && (
                      <div className="pt-2 border-t border-red-500/10 text-[11px] text-brand-gold/90 font-sans leading-normal">
                        {isArabic ? (
                          <span>
                            💡 <strong>تلميح:</strong> إذا لم يكن لديك حساب نشط بعد، يرجى الضغط على علامة التبويب <strong>"إنشاء حساب (SIGN UP)"</strong> أعلاه لتسجيل بياناتك أولاً. بمجرد التسجيل، سيتم تفعيل حسابك ودخولك فوراً.
                          </span>
                        ) : (
                          <span>
                            💡 <strong>Tip:</strong> If you don't have an active account yet, please click the <strong>"SIGN UP FORM"</strong> tab above to register your credentials first. Once registered, your account is verified and logged in instantly.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm flex items-start gap-3 animate-in fade-in duration-300">
                <Sparkles className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <p className="text-[12px] text-emerald-400 font-mono leading-relaxed">{successMsg}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider block">
                {isArabic ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="designer@envision.com"
                  className="w-full bg-[#0C0C0C] border border-white/10 pl-11 pr-4 py-3 text-[13px] text-white font-mono focus:border-brand-gold focus:outline-none transition-all rounded-sm"
                />
              </div>
            </div>

            {/* WhatsApp field shown ONLY in signup mode */}
            {mode === "signup" && (
              <div className="space-y-1.5 animate-in fade-in duration-300">
                <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider block">
                  {isArabic ? "رقم الواتساب" : "WhatsApp Number"}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-[#0C0C0C] border border-brand-gold/35 focus:border-brand-gold pl-11 pr-4 py-3 text-[13px] text-white font-mono focus:outline-none transition-all rounded-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider block">
                {isArabic ? "كلمة المرور" : "Password Security"}
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0C0C0C] border border-white/10 pl-11 pr-11 py-3 text-[13px] text-white font-mono focus:border-brand-gold focus:outline-none transition-all rounded-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-brand-gold transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gold hover:bg-brand-gold/90 active:scale-[0.98] text-[#0C0C0C] font-serif font-bold text-[14px] uppercase tracking-wider py-3.5 transition-all rounded-sm flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_color-mix(in_srgb,var(--color-brand-gold)_15%,transparent)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#0C0C0C] border-t-transparent rounded-full animate-spin" />
              ) : mode === "signin" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{isArabic ? "تسجيل الدخول" : "ACCESS LAB PORTAL"}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{isArabic ? "إنشاء حساب" : "REGISTER PROFILE"}</span>
                </>
              )}
            </button>
          </form>



          <div className="border-t border-white/5 pt-4 text-center">
            <p className="text-[12px] text-zinc-400">
              {mode === "signin" 
                ? (isArabic ? "ليس لديك حساب؟ " : "Need clinical lab access? ") 
                : (isArabic ? "لديك حساب بالفعل؟ " : "Already registered? ")}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-brand-gold hover:underline font-mono text-[11px] font-semibold"
              >
                {mode === "signin" 
                  ? (isArabic ? "سجل الآن" : "Register Credentials") 
                  : (isArabic ? "تسجيل الدخول" : "Sign In Portal")}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Luxury Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-[10px] text-zinc-500 tracking-wider">
        <p>
          {isArabic 
            ? "تشفير حيوي آمن ٢٥ ك-بت ونظام مصادقة SUPABASE."
            : "SECURE 256-BIT CLINICAL ENCRYPTION & SUPABASE AUTH SHIELD."}
        </p>
      </footer>
    </div>
  );
}

