"use client";
import React, { useState } from "react";
import Link from "next/link";
import { EyeOff, Eye } from "lucide-react";
import { IoLogoApple } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useSignUp } from "@clerk/nextjs";


const countries = [
  { code: "af", label: "Afghanistan" },
  { code: "al", label: "Albania" },
  { code: "dz", label: "Algeria" },
  { code: "ad", label: "Andorra" },
  { code: "ao", label: "Angola" },
  { code: "ag", label: "Antigua and Barbuda" },
  { code: "ar", label: "Argentina" },
  { code: "am", label: "Armenia" },
  { code: "au", label: "Australia" },
  { code: "at", label: "Austria" },
  { code: "az", label: "Azerbaijan" },
  { code: "bs", label: "Bahamas" },
  { code: "bh", label: "Bahrain" },
  { code: "bd", label: "Bangladesh" },
  { code: "bb", label: "Barbados" },
  { code: "by", label: "Belarus" },
  { code: "be", label: "Belgium" },
  { code: "bz", label: "Belize" },
  { code: "bj", label: "Benin" },
  { code: "bt", label: "Bhutan" },
  { code: "bo", label: "Bolivia" },
  { code: "ba", label: "Bosnia and Herzegovina" },
  { code: "bw", label: "Botswana" },
  { code: "br", label: "Brazil" },
  { code: "bn", label: "Brunei" },
  { code: "bg", label: "Bulgaria" },
  { code: "bf", label: "Burkina Faso" },
  { code: "bi", label: "Burundi" },
  { code: "cv", label: "Cabo Verde" },
  { code: "kh", label: "Cambodia" },
  { code: "cm", label: "Cameroon" },
  { code: "ca", label: "Canada" },
  { code: "cf", label: "Central African Republic" },
  { code: "td", label: "Chad" },
  { code: "cl", label: "Chile" },
  { code: "cn", label: "China" },
  { code: "co", label: "Colombia" },
  { code: "km", label: "Comoros" },
  { code: "cd", label: "Congo (DRC)" },
  { code: "cg", label: "Congo (Republic)" },
  { code: "cr", label: "Costa Rica" },
  { code: "ci", label: "Côte d'Ivoire" },
  { code: "hr", label: "Croatia" },
  { code: "cu", label: "Cuba" },
  { code: "cy", label: "Cyprus" },
  { code: "cz", label: "Czech Republic" },
  { code: "dk", label: "Denmark" },
  { code: "dj", label: "Djibouti" },
  { code: "dm", label: "Dominica" },
  { code: "do", label: "Dominican Republic" },
  { code: "ec", label: "Ecuador" },
  { code: "eg", label: "Egypt" },
  { code: "sv", label: "El Salvador" },
  { code: "gq", label: "Equatorial Guinea" },
  { code: "er", label: "Eritrea" },
  { code: "ee", label: "Estonia" },
  { code: "sz", label: "Eswatini" },
  { code: "et", label: "Ethiopia" },
  { code: "fj", label: "Fiji" },
  { code: "fi", label: "Finland" },
  { code: "fr", label: "France" },
  { code: "ga", label: "Gabon" },
  { code: "gm", label: "Gambia" },
  { code: "ge", label: "Georgia" },
  { code: "de", label: "Germany" },
  { code: "gh", label: "Ghana" },
  { code: "gr", label: "Greece" },
  { code: "gd", label: "Grenada" },
  { code: "gt", label: "Guatemala" },
  { code: "gn", label: "Guinea" },
  { code: "gw", label: "Guinea-Bissau" },
  { code: "gy", label: "Guyana" },
  { code: "ht", label: "Haiti" },
  { code: "hn", label: "Honduras" },
  { code: "hu", label: "Hungary" },
  { code: "is", label: "Iceland" },
  { code: "in", label: "India" },
  { code: "id", label: "Indonesia" },
  { code: "ir", label: "Iran" },
  { code: "iq", label: "Iraq" },
  { code: "ie", label: "Ireland" },
  { code: "il", label: "Israel" },
  { code: "it", label: "Italy" },
  { code: "jm", label: "Jamaica" },
  { code: "jp", label: "Japan" },
  { code: "jo", label: "Jordan" },
  { code: "kz", label: "Kazakhstan" },
  { code: "ke", label: "Kenya" },
  { code: "ki", label: "Kiribati" },
  { code: "kw", label: "Kuwait" },
  { code: "kg", label: "Kyrgyzstan" },
  { code: "la", label: "Laos" },
  { code: "lv", label: "Latvia" },
  { code: "lb", label: "Lebanon" },
  { code: "ls", label: "Lesotho" },
  { code: "lr", label: "Liberia" },
  { code: "ly", label: "Libya" },
  { code: "li", label: "Liechtenstein" },
  { code: "lt", label: "Lithuania" },
  { code: "lu", label: "Luxembourg" },
  { code: "mg", label: "Madagascar" },
  { code: "mw", label: "Malawi" },
  { code: "my", label: "Malaysia" },
  { code: "mv", label: "Maldives" },
  { code: "ml", label: "Mali" },
  { code: "mt", label: "Malta" },
  { code: "mh", label: "Marshall Islands" },
  { code: "mr", label: "Mauritania" },
  { code: "mu", label: "Mauritius" },
  { code: "mx", label: "Mexico" },
  { code: "fm", label: "Micronesia" },
  { code: "md", label: "Moldova" },
  { code: "mc", label: "Monaco" },
  { code: "mn", label: "Mongolia" },
  { code: "me", label: "Montenegro" },
  { code: "ma", label: "Morocco" },
  { code: "mz", label: "Mozambique" },
  { code: "mm", label: "Myanmar" },
  { code: "na", label: "Namibia" },
  { code: "nr", label: "Nauru" },
  { code: "np", label: "Nepal" },
  { code: "nl", label: "Netherlands" },
  { code: "nz", label: "New Zealand" },
  { code: "ni", label: "Nicaragua" },
  { code: "ne", label: "Niger" },
  { code: "ng", label: "Nigeria" },
  { code: "kp", label: "North Korea" },
  { code: "mk", label: "North Macedonia" },
  { code: "no", label: "Norway" },
  { code: "om", label: "Oman" },
  { code: "pk", label: "Pakistan" },
  { code: "pw", label: "Palau" },
  { code: "pa", label: "Panama" },
  { code: "pg", label: "Papua New Guinea" },
  { code: "py", label: "Paraguay" },
  { code: "pe", label: "Peru" },
  { code: "ph", label: "Philippines" },
  { code: "pl", label: "Poland" },
  { code: "pt", label: "Portugal" },
  { code: "qa", label: "Qatar" },
  { code: "ro", label: "Romania" },
  { code: "ru", label: "Russia" },
  { code: "rw", label: "Rwanda" },
  { code: "kn", label: "Saint Kitts and Nevis" },
  { code: "lc", label: "Saint Lucia" },
  { code: "vc", label: "Saint Vincent and the Grenadines" },
  { code: "ws", label: "Samoa" },
  { code: "sm", label: "San Marino" },
  { code: "st", label: "Sao Tome and Principe" },
  { code: "sa", label: "Saudi Arabia" },
  { code: "sn", label: "Senegal" },
  { code: "rs", label: "Serbia" },
  { code: "sc", label: "Seychelles" },
  { code: "sl", label: "Sierra Leone" },
  { code: "sg", label: "Singapore" },
  { code: "sk", label: "Slovakia" },
  { code: "si", label: "Slovenia" },
  { code: "sb", label: "Solomon Islands" },
  { code: "so", label: "Somalia" },
  { code: "za", label: "South Africa" },
  { code: "ss", label: "South Sudan" },
  { code: "es", label: "Spain" },
  { code: "lk", label: "Sri Lanka" },
  { code: "sd", label: "Sudan" },
  { code: "sr", label: "Suriname" },
  { code: "se", label: "Sweden" },
  { code: "ch", label: "Switzerland" },
  { code: "sy", label: "Syria" },
  { code: "tw", label: "Taiwan" },
  { code: "tj", label: "Tajikistan" },
  { code: "tz", label: "Tanzania" },
  { code: "th", label: "Thailand" },
  { code: "tl", label: "Timor-Leste" },
  { code: "tg", label: "Togo" },
  { code: "to", label: "Tonga" },
  { code: "tt", label: "Trinidad and Tobago" },
  { code: "tn", label: "Tunisia" },
  { code: "tr", label: "Turkey" },
  { code: "tm", label: "Turkmenistan" },
  { code: "tv", label: "Tuvalu" },
  { code: "ug", label: "Uganda" },
  { code: "ua", label: "Ukraine" },
  { code: "ae", label: "United Arab Emirates" },
  { code: "uk", label: "United Kingdom" },
  { code: "us", label: "United States" },
  { code: "uy", label: "Uruguay" },
  { code: "uz", label: "Uzbekistan" },
  { code: "vu", label: "Vanuatu" },
  { code: "ve", label: "Venezuela" },
  { code: "vn", label: "Vietnam" },
  { code: "ye", label: "Yemen" },
  { code: "zm", label: "Zambia" },
  { code: "zw", label: "Zimbabwe" },
];

const countryCodes = [
  { code: "+93", label: "Afghanistan" },
  { code: "+355", label: "Albania" },
  { code: "+213", label: "Algeria" },
  { code: "+376", label: "Andorra" },
  { code: "+244", label: "Angola" },
  { code: "+1268", label: "Antigua and Barbuda" },
  { code: "+54", label: "Argentina" },
  { code: "+374", label: "Armenia" },
  { code: "+61", label: "Australia" },
  { code: "+43", label: "Austria" },
  { code: "+994", label: "Azerbaijan" },
  { code: "+1242", label: "Bahamas" },
  { code: "+973", label: "Bahrain" },
  { code: "+880", label: "Bangladesh" },
  { code: "+1246", label: "Barbados" },
  { code: "+375", label: "Belarus" },
  { code: "+32", label: "Belgium" },
  { code: "+501", label: "Belize" },
  { code: "+229", label: "Benin" },
  { code: "+975", label: "Bhutan" },
  { code: "+591", label: "Bolivia" },
  { code: "+387", label: "Bosnia and Herzegovina" },
  { code: "+267", label: "Botswana" },
  { code: "+55", label: "Brazil" },
  { code: "+673", label: "Brunei" },
  { code: "+359", label: "Bulgaria" },
  { code: "+226", label: "Burkina Faso" },
  { code: "+257", label: "Burundi" },
  { code: "+238", label: "Cabo Verde" },
  { code: "+855", label: "Cambodia" },
  { code: "+237", label: "Cameroon" },
  { code: "+1", label: "Canada" },
  { code: "+236", label: "Central African Republic" },
  { code: "+235", label: "Chad" },
  { code: "+56", label: "Chile" },
  { code: "+86", label: "China" },
  { code: "+57", label: "Colombia" },
  { code: "+269", label: "Comoros" },
  { code: "+243", label: "Congo (DRC)" },
  { code: "+242", label: "Congo (Republic)" },
  { code: "+506", label: "Costa Rica" },
  { code: "+225", label: "Côte d'Ivoire" },
  { code: "+385", label: "Croatia" },
  { code: "+53", label: "Cuba" },
  { code: "+357", label: "Cyprus" },
  { code: "+420", label: "Czech Republic" },
  { code: "+45", label: "Denmark" },
  { code: "+253", label: "Djibouti" },
  { code: "+1767", label: "Dominica" },
  { code: "+1809", label: "Dominican Republic" },
  { code: "+593", label: "Ecuador" },
  { code: "+20", label: "Egypt" },
  { code: "+503", label: "El Salvador" },
  { code: "+240", label: "Equatorial Guinea" },
  { code: "+291", label: "Eritrea" },
  { code: "+372", label: "Estonia" },
  { code: "+268", label: "Eswatini" },
  { code: "+251", label: "Ethiopia" },
  { code: "+679", label: "Fiji" },
  { code: "+358", label: "Finland" },
  { code: "+33", label: "France" },
  { code: "+241", label: "Gabon" },
  { code: "+220", label: "Gambia" },
  { code: "+995", label: "Georgia" },
  { code: "+49", label: "Germany" },
  { code: "+233", label: "Ghana" },
  { code: "+30", label: "Greece" },
  { code: "+1473", label: "Grenada" },
  { code: "+502", label: "Guatemala" },
  { code: "+224", label: "Guinea" },
  { code: "+245", label: "Guinea-Bissau" },
  { code: "+592", label: "Guyana" },
  { code: "+509", label: "Haiti" },
  { code: "+504", label: "Honduras" },
  { code: "+36", label: "Hungary" },
  { code: "+354", label: "Iceland" },
  { code: "+91", label: "India" },
  { code: "+62", label: "Indonesia" },
  { code: "+98", label: "Iran" },
  { code: "+964", label: "Iraq" },
  { code: "+353", label: "Ireland" },
  { code: "+972", label: "Israel" },
  { code: "+39", label: "Italy" },
  { code: "+1876", label: "Jamaica" },
  { code: "+81", label: "Japan" },
  { code: "+962", label: "Jordan" },
  { code: "+7", label: "Kazakhstan" },
  { code: "+254", label: "Kenya" },
  { code: "+686", label: "Kiribati" },
  { code: "+965", label: "Kuwait" },
  { code: "+996", label: "Kyrgyzstan" },
  { code: "+856", label: "Laos" },
  { code: "+371", label: "Latvia" },
  { code: "+961", label: "Lebanon" },
  { code: "+266", label: "Lesotho" },
  { code: "+231", label: "Liberia" },
  { code: "+218", label: "Libya" },
  { code: "+423", label: "Liechtenstein" },
  { code: "+370", label: "Lithuania" },
  { code: "+352", label: "Luxembourg" },
  { code: "+261", label: "Madagascar" },
  { code: "+265", label: "Malawi" },
  { code: "+60", label: "Malaysia" },
  { code: "+960", label: "Maldives" },
  { code: "+223", label: "Mali" },
  { code: "+356", label: "Malta" },
  { code: "+692", label: "Marshall Islands" },
  { code: "+222", label: "Mauritania" },
  { code: "+230", label: "Mauritius" },
  { code: "+52", label: "Mexico" },
  { code: "+691", label: "Micronesia" },
  { code: "+373", label: "Moldova" },
  { code: "+377", label: "Monaco" },
  { code: "+976", label: "Mongolia" },
  { code: "+382", label: "Montenegro" },
  { code: "+212", label: "Morocco" },
  { code: "+258", label: "Mozambique" },
  { code: "+95", label: "Myanmar" },
  { code: "+264", label: "Namibia" },
  { code: "+674", label: "Nauru" },
  { code: "+977", label: "Nepal" },
  { code: "+31", label: "Netherlands" },
  { code: "+64", label: "New Zealand" },
  { code: "+505", label: "Nicaragua" },
  { code: "+227", label: "Niger" },
  { code: "+234", label: "Nigeria" },
  { code: "+850", label: "North Korea" },
  { code: "+389", label: "North Macedonia" },
  { code: "+47", label: "Norway" },
  { code: "+968", label: "Oman" },
  { code: "+92", label: "Pakistan" },
  { code: "+680", label: "Palau" },
  { code: "+507", label: "Panama" },
  { code: "+675", label: "Papua New Guinea" },
  { code: "+595", label: "Paraguay" },
  { code: "+51", label: "Peru" },
  { code: "+63", label: "Philippines" },
  { code: "+48", label: "Poland" },
  { code: "+351", label: "Portugal" },
  { code: "+974", label: "Qatar" },
  { code: "+40", label: "Romania" },
  { code: "+7", label: "Russia" },
  { code: "+250", label: "Rwanda" },
  { code: "+1869", label: "Saint Kitts and Nevis" },
  { code: "+1758", label: "Saint Lucia" },
  { code: "+1784", label: "Saint Vincent and the Grenadines" },
  { code: "+685", label: "Samoa" },
  { code: "+378", label: "San Marino" },
  { code: "+239", label: "Sao Tome and Principe" },
  { code: "+966", label: "Saudi Arabia" },
  { code: "+221", label: "Senegal" },
  { code: "+381", label: "Serbia" },
  { code: "+248", label: "Seychelles" },
  { code: "+232", label: "Sierra Leone" },
  { code: "+65", label: "Singapore" },
  { code: "+421", label: "Slovakia" },
  { code: "+386", label: "Slovenia" },
  { code: "+677", label: "Solomon Islands" },
  { code: "+252", label: "Somalia" },
  { code: "+27", label: "South Africa" },
  { code: "+211", label: "South Sudan" },
  { code: "+34", label: "Spain" },
  { code: "+94", label: "Sri Lanka" },
  { code: "+249", label: "Sudan" },
  { code: "+597", label: "Suriname" },
  { code: "+46", label: "Sweden" },
  { code: "+41", label: "Switzerland" },
  { code: "+963", label: "Syria" },
  { code: "+886", label: "Taiwan" },
  { code: "+992", label: "Tajikistan" },
  { code: "+255", label: "Tanzania" },
  { code: "+66", label: "Thailand" },
  { code: "+670", label: "Timor-Leste" },
  { code: "+228", label: "Togo" },
  { code: "+676", label: "Tonga" },
  { code: "+1868", label: "Trinidad and Tobago" },
  { code: "+216", label: "Tunisia" },
  { code: "+90", label: "Turkey" },
  { code: "+993", label: "Turkmenistan" },
  { code: "+688", label: "Tuvalu" },
  { code: "+256", label: "Uganda" },
  { code: "+380", label: "Ukraine" },
  { code: "+971", label: "United Arab Emirates" },
  { code: "+44", label: "United Kingdom" },
  { code: "+1", label: "United States" },
  { code: "+598", label: "Uruguay" },
  { code: "+998", label: "Uzbekistan" },
  { code: "+678", label: "Vanuatu" },
  { code: "+58", label: "Venezuela" },
  { code: "+84", label: "Vietnam" },
  { code: "+967", label: "Yemen" },
  { code: "+260", label: "Zambia" },
  { code: "+263", label: "Zimbabwe" },
];

export default function SignupView() {
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [codeDropdownOpen, setCodeDropdownOpen] = useState(false);
  const [codeSearch, setCodeSearch] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { signUp } = useSignUp();

  // Google — server-side code flow via backend
  const handleGoogleSignup = () => {
    setSocialLoading("google");
    window.location.href = "https://apexsim-backend.vercel.app/api/auth/google";
  };

  // Facebook — via Clerk OAuth (no Facebook app or SDK needed)
  const handleFacebookSignup = async () => {
    if (!signUp) return;
    setSocialLoading("facebook");
    try {
      await signUp.sso({
        strategy: "oauth_facebook",
        redirectUrl: "/sso-callback",
        redirectCallbackUrl: "/sso-callback/complete",
      });
    } catch {
      setError("Facebook sign up failed. Please try again.");
      setSocialLoading("");
    }
  };

  // Apple — via Clerk OAuth (no Apple developer account needed)
  const handleAppleSignup = async () => {
    if (!signUp) return;
    setSocialLoading("apple");
    try {
      await signUp.sso({
        strategy: "oauth_apple",
        redirectUrl: "/sso-callback",
        redirectCallbackUrl: "/sso-callback/complete",
      });
    } catch {
      setError("Apple sign up failed. Please try again.");
      setSocialLoading("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone ? `${countryCode}${formData.phone}` : undefined
        }),
      });
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/auth/verify-signup", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, otp: otp.join("") }),
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.replace("/dashboard/wallet");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextElementSibling && element.value !== "") {
      (element.nextElementSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && (e.currentTarget.previousElementSibling)) {
      (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
    }
  };

  return (
    <section className="md:min-h-screen bg-[#181818] px-4 md:px-8 py-6 md:py-12 flex items-center justify-center font-inter">
      <div className="max-w-325 font-manrope w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-[#1f1f1f] rounded-2xl px-4 md:px-10 pt-10 pb-12 flex flex-col justify-start">

          {step === 'signup' ? (
            <>
              <h2 className="text-3xl md:text-3xl font-semibold text-white mb-8 mt-2 font-bricolage">
                Create an Account
              </h2>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#252525] border border-transparent rounded-full px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all font-inter"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#252525] border border-transparent rounded-full px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all font-inter"
                  />
                  <div className="relative">
                    <div
                      onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                      className="w-full bg-[#252525] rounded-full px-4 py-4 flex items-center justify-between border border-transparent hover:border-white/10 group relative cursor-pointer"
                    >
                      <span className="text-white text-md">
                        {selectedCountry ? countries.find((c) => c.code === selectedCountry)?.label : "Country of Residence"}
                      </span>
                      <FaCaretDown size={18} className="text-gray-500 group-hover:text-white transition-colors pointer-events-none" />
                    </div>
                    {countryDropdownOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-full bg-[#1f1f1f] rounded-xl border border-white/10 z-50 flex flex-col" style={{maxHeight: '260px'}}>
                        <div className="px-3 pt-3 pb-2 sticky top-0 bg-[#1f1f1f]">
                          <input
                            type="text"
                            autoFocus
                            placeholder="Search country..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30"
                          />
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {countries.filter(c => c.label.toLowerCase().includes(countrySearch.toLowerCase())).map((country) => (
                            <div
                              key={country.code}
                              onClick={() => {
                                setSelectedCountry(country.code);
                                setCountryDropdownOpen(false);
                                setCountrySearch("");
                              }}
                              className={`px-4 py-2 text-md cursor-pointer hover:bg-white/10 ${selectedCountry === country.code ? "text-white bg-white/10" : "text-gray-400"}`}
                            >
                              {country.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 relative">
                    <div
                      onClick={() => setCodeDropdownOpen(!codeDropdownOpen)}
                      className="w-25 bg-[#252525] rounded-full px-4 py-4 flex items-center justify-between border border-transparent hover:border-white/10 group relative cursor-pointer"
                    >
                      <span className="text-white text-md">{countryCode}</span>
                      <FaCaretDown size={14} className="text-gray-500 group-hover:text-white transition-colors pointer-events-none" />
                      {codeDropdownOpen && (
                        <div className="absolute bottom-full left-0 mb-2 bg-[#1f1f1f] rounded-xl border border-white/10 z-50 flex flex-col" style={{width: '220px', maxHeight: '260px'}}>
                          <div className="px-3 pt-3 pb-2 sticky top-0 bg-[#1f1f1f]">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search..."
                              value={codeSearch}
                              onChange={(e) => setCodeSearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30"
                            />
                          </div>
                          <div className="overflow-y-auto flex-1">
                            {countryCodes.filter(c => c.label.toLowerCase().includes(codeSearch.toLowerCase()) || c.code.includes(codeSearch)).map((c, i) => (
                              <div
                                key={`${c.code}-${i}`}
                                onClick={() => {
                                  setCountryCode(c.code);
                                  setCodeDropdownOpen(false);
                                  setCodeSearch("");
                                }}
                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-white/10 ${countryCode === c.code ? "text-white bg-white/10" : "text-gray-400"}`}
                              >
                                {c.label} ({c.code})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="flex-1 bg-[#252525] border border-transparent rounded-full px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all font-inter"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-[#252525] border border-transparent rounded-full px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all font-inter"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <Eye className="text-white w-5 h-5 hover:text-gray-400 transition-colors" /> : <EyeOff className="text-white w-5 h-5 hover:text-gray-400 transition-colors" />}
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0055FF] text-white py-4 rounded-full font-semibold text-md shadow-[0_8px_30px_rgb(0,85,255,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Signing up..." : "Sign up"}
                </button>
                <div className="pt-3">
                  <div className="flex items-center justify-center mb-4 gap-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-md text-gray-500 tracking-wide font-manrope whitespace-nowrap">Or sign up with</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <div className="flex justify-center gap-4">
                    <button type="button" disabled={!!socialLoading} onClick={handleGoogleSignup} className="w-14 h-14 rounded-full bg-[#1E1E1E] border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                      {socialLoading === "google" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <img src="https://www.svgrepo.com/show/303108/google-icon-logo.svg" alt="Google" className="w-6 h-6" />}
                    </button>
                    <button type="button" disabled={!!socialLoading} onClick={handleAppleSignup} className="w-14 h-14 rounded-full bg-[#1E1E1E] border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                      {socialLoading === "apple" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <IoLogoApple className="text-white w-7 h-7" />}
                    </button>
                    <button type="button" disabled={!!socialLoading} onClick={handleFacebookSignup} className="w-14 h-14 rounded-full bg-[#1E1E1E] border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                      {socialLoading === "facebook" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <img src="https://www.svgrepo.com/show/303114/facebook-3-logo.svg" alt="Facebook" className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
                <p className="text-center text-gray-500 text-md pt-4 font-inter">
                  Already have an account? <button type="button" onClick={() => router.push("/login")} className="text-white font-semibold hover:underline">Login</button>
                </p>
              </form>
            </>
          ) : (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl font-semibold text-white mb-4 mt-2 font-bricolage">Verify Email</h2>
              <p className="text-gray-400 mb-8 font-inter">We've sent a 6-digit verification code to your email. Please enter it below.</p>

              <form onSubmit={handleVerifyOtp} className="space-y-8">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-between gap-2 mb-8">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={data}
                      onChange={e => handleOtpChange(e.target, index)}
                      onKeyDown={e => handleKeyDown(e, index)}
                      onFocus={e => e.target.select()}
                      className="w-full h-14 bg-[#252525] border border-transparent rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-white/20 transition-all"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0055FF] text-white py-4 rounded-full font-semibold text-md shadow-[0_8px_30px_rgb(0,85,255,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
                <p className="text-center text-gray-500 text-md font-inter">
                  Didn't receive the code? <button type="button" onClick={async () => { setLoading(true); setError(""); try { await apiRequest("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email: formData.email }) }); alert("OTP resent!"); } catch (err: any) { setError(err.message); } finally { setLoading(false); } }} className="text-white font-semibold hover:underline">Resend</button>
                </p>
              </form>
            </div>
          )}
        </div>

        <div className="hidden lg:flex border border-gray-300/10 rounded-2xl flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute z-30 top-30 text-center ">
            <h2 className="text-[40px] font-bold text-white  font-manrope">
              Enjoy up to $100 <span className="text-[#508BFF]"> USDT</span>
            </h2>
            <p className="text-gray-400 max-w-lg py-5 mx-auto text-lg leading-relaxed font-inter">
              Get up to $5,030 by signing up, depositing, and trading!
            </p>
          </div>

          <div className="relative top-20 z-10 w-full max-w-137.5 h-125 flex items-center justify-center">
            <img
              src="/images/signuppic.png"
              alt="Branding Illustration"
              className="w-full h-full object-contain "
            />
          </div>
        </div>
      </div>
    </section>
  );
}

