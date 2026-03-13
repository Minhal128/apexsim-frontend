"use client";
import React, { useState } from "react";
import Link from "next/link";
import { EyeOff, Eye, ChevronDown } from "lucide-react";
import { IoLogoApple } from "react-icons/io5";
import SignupView from "./SignupScreen";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useSignIn } from "@clerk/nextjs";

const tokens = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    price: "$67,528.875",
    change: "+%1.71",
    image: "/images/animateone.png",
  },
  {
    name: "Solana",
    symbol: "SOL",
    price: "$126.745",
    change: "-%0.65",
    image: "/images/animatetwo.png",
  },
  {
    name: "Dash",
    symbol: "DASH",
    price: "$40",
    change: "+%1.71",
    image: "/images/animatethree.png",
  },
  {
    name: "XRP",
    symbol: "XRP",
    price: "$1.91295",
    change: "+%1.68",
    image: "/images/animatefour.png",
  },
];

const countries = [
  { code: "+1", label: "USA" },
  { code: "+44", label: "UK" },
  { code: "+61", label: "Australia" },
  { code: "+92", label: "Pakistan" },
  { code: "+91", label: "India" },
];

export default function LoginView() {

  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({ email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { signIn } = useSignIn();

  // Google — server-side code flow via backend (uses hardcoded client_id + secret)
  const handleGoogleLogin = () => {
    setSocialLoading("google");
    window.location.href = "https://apexsim-backend.vercel.app/api/auth/google";
  };

  // Facebook — via Clerk OAuth (no Facebook app or SDK needed)
  const handleFacebookLogin = async () => {
    if (!signIn) return;
    setSocialLoading("facebook");
    try {
      await signIn.sso({
        strategy: "oauth_facebook",
        redirectUrl: "/sso-callback",
        redirectCallbackUrl: "/sso-callback/complete",
      });
    } catch {
      setError("Facebook sign in failed. Please try again.");
      setSocialLoading("");
    }
  };

  // Apple — via Clerk OAuth (no Apple developer account needed)
  const handleAppleLogin = async () => {
    if (!signIn) return;
    setSocialLoading("apple");
    try {
      await signIn.sso({
        strategy: "oauth_apple",
        redirectUrl: "/sso-callback",
        redirectCallbackUrl: "/sso-callback/complete",
      });
    } catch {
      setError("Apple sign in failed. Please try again.");
      setSocialLoading("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: loginMethod === "email" ? formData.email : `${countryCode}${formData.phone}`,
          password: formData.password,
        }),
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.replace("/dashboard/market");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="md:min-h-screen bg-[#181818] px-4 md:px-8 py-6 md:py-12 flex items-center justify-center font-inter">
      <div className="max-w-325 font-manrope w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-[#1f1f1f] rounded-2xl px-4 md:px-10 pt-10 pb-12 flex flex-col justify-start">
          <h2 className="text-3xl md:text-3xl font-semibold text-white mb-8 mt-2 font-bricolage">
            Welcome to ApexSim
          </h2>

          <div className="flex gap-6 mb-8 relative">
            <button
              onClick={() => setLoginMethod("email")}
              className={`pb-2 text-md font-medium transition-all cursor-pointer relative z-10 ${loginMethod === "email" ? "text-white" : "text-gray-500"
                }`}
            >
              Email address
              {loginMethod === "email" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full" />
              )}
            </button>
            <button
              onClick={() => setLoginMethod("phone")}
              className={`pb-2 text-md font-medium transition-all cursor-pointer relative z-10 ${loginMethod === "phone" ? "text-white" : "text-gray-500"
                }`}
            >
              Phone number
              {loginMethod === "phone" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full" />
              )}
            </button>
            <div className="absolute bottom-0 left-0 w-full h-px bg-white/10" />
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="space-y-2">
              {loginMethod === "email" ? (
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#252525] border border-transparent rounded-full px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all font-inter"
                />
              ) : (
                <div className="flex gap-2 relative">
                  <div
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    className="w-25 bg-[#252525] rounded-full px-4 py-4 flex items-center justify-between border border-transparent hover:border-white/10 group relative cursor-pointer"
                  >
                    <span className="text-white text-sm">{countryCode}</span>
                    <ChevronDown
                      size={14}
                      className="text-gray-500 group-hover:text-white transition-colors"
                    />

                    {countryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-[#1f1f1f] rounded-xl border border-white/10 overflow-hidden z-50">
                        {countries.map((item) => (
                          <div
                            key={item.code}
                            onClick={() => {
                              setCountryCode(item.code);
                              setCountryDropdownOpen(false);
                            }}
                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-white/10 ${countryCode === item.code
                              ? "text-white bg-white/10"
                              : "text-gray-400"
                              }`}
                          >
                            {item.label} ({item.code})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="flex-1 bg-[#252525] border border-transparent rounded-full px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all font-inter"
                  />
                </div>
              )}

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#252525] border border-transparent rounded-full px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all font-inter"
                />
                <div
                  className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye className="text-white w-5 h-5 hover:text-gray-400 transition-colors" />
                  ) : (
                    <EyeOff className="text-white w-5 h-5 hover:text-gray-400 transition-colors" />
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/reset-password")}
              type="button"
              className="text-sm font-medium text-white cursor-pointer hover:underline block w-fit"
            >
              Forgot password?
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0055FF] text-white py-4 rounded-full font-semibold text-md shadow-[0_8px_30px_rgb(0,85,255,0.3)] cursor-pointer disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>


            <div className="pt-3">
              <div className="flex items-center justify-center mb-4 gap-4">
                <div className="flex-1 h-1px bg-white/10" />
                <span className="text-lg text-gray-500 tracking-wide font-manrope whitespace-nowrap">
                  Or login in with
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  disabled={!!socialLoading}
                  onClick={handleGoogleLogin}
                  className="w-16 h-16 rounded-full bg-[#1E1E1E] border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  {socialLoading === "google" ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <img src="https://www.svgrepo.com/show/303108/google-icon-logo.svg" alt="Google" className="w-7 h-7" />
                  )}
                </button>
                <button
                  type="button"
                  disabled={!!socialLoading}
                  onClick={handleAppleLogin}
                  className="w-16 h-16 rounded-full bg-[#1E1E1E] border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  {socialLoading === "apple" ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <IoLogoApple className="text-white w-8 h-8" />
                  )}
                </button>
                <button
                  type="button"
                  disabled={!!socialLoading}
                  onClick={handleFacebookLogin}
                  className="w-16 h-16 rounded-full bg-[#1E1E1E] border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  {socialLoading === "facebook" ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <img src="https://www.svgrepo.com/show/303114/facebook-3-logo.svg" alt="Facebook" className="w-7 h-7" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-gray-500 text-md pt-4 font-inter">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="text-white font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>
          </form>
        </div>

        {/* RIGHT SECTION: BRANDING & ASSETS */}
        <div className="hidden lg:flex bg-[#2563EB] rounded-2xl py-12 px-8 flex-col items-center justify-between relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-white/20 blur-[120px] rounded-full" />

          <div className="relative z-10 mt-10 text-center">
            <h2 className="text-[40px] font-bold text-white mb-2 font-manrope ">
              The New Era of crypto
            </h2>
            <p className="text-blue-100/80 max-w-95 mx-auto text-lg leading-relaxed font-inter">
              Keep your digital assets offline, safe, and always under your
              control—secure storage with the freedom to invest anytime.
            </p>
          </div>

          <div className="w-full bg-[#07348E] backdrop-blur-md mb-20 rounded-[20px] border border-white/10 px-0 py-14 mt-0 relative h-full translate-y-10 overflow-hidden">
            <div className="flex flex-col gap-6 w-full">
              {[0, 1, 2, 3].map((row) => (
                <div
                  key={row}
                  className={`flex gap-4 whitespace-nowrap w-full ${row % 2 === 0
                    ? "animate-scroll-left"
                    : "animate-scroll-right"
                    }`}
                >
                  {[...tokens, ...tokens, ...tokens, ...tokens].map(
                    (token, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 bg-linear-to-r from-white/40 to-[#6C8ED1]/70 border border-white/10 rounded-full px-2 py-2 hover:bg-[#3359d4] transition-colors"
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shadow-lg">
                          <img
                            src={token.image}
                            alt={token.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-left">
                          <span className="text-white text-sm font-bold font-manrope">
                            {token.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-blue-200 font-inter">
                              {token.price}
                            </span>
                            <span
                              className={`text-[11px] font-bold ${token.change.startsWith("+")
                                ? "text-green-400"
                                : "text-red-300"
                                }`}
                            >
                              {token.change}
                            </span>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ))}
            </div>

            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(11,30,77,0.9)]" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes scrollRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-scroll-left {
          animation: scrollLeft 60s linear infinite;
        }
        .animate-scroll-right {
          animation: scrollRight 60s linear infinite;
        }
      `}</style>
    </section>
  );
}
