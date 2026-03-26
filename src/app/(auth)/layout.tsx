"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaCaretDown } from "react-icons/fa";
import { useRouter, usePathname } from 'next/navigation';
import { APP_LANGUAGE_EVENT, APP_LANGUAGE_STORAGE_KEY } from '@/lib/i18n';

// Navigation configuration
const navigationItems = [
  "Deposit",
  "Withdraw", 
  "Market",
  "Futures",
  "Trade",
  "More",
  "Support"
];

const languages = [
  { code: 'Eng', name: 'English', flag: 'https://flagcdn.com/us.svg' },
  { code: 'Esp', name: 'Spanish', flag: 'https://flagcdn.com/es.svg' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(() => {
    if (typeof window === 'undefined') return languages[0];
    const stored = localStorage.getItem(APP_LANGUAGE_STORAGE_KEY);
    return languages.find((l) => l.code === stored) || languages[0];
  });
  const langRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Check if we are on the reset password page
  const isResetPage = pathname === '/reset-password';

  // Auth guard: if user already has a valid token, redirect them to dashboard.
  // Uses router.replace so the login/signup page is removed from history,
  // preventing the browser back button from returning to it.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isResetPage) {
      router.replace('/dashboard/market');
    }
  }, [router, isResetPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, selectedLang.code);
    window.dispatchEvent(new CustomEvent(APP_LANGUAGE_EVENT, { detail: { code: selectedLang.code } }));
  }, [selectedLang]);

  return (
    <div className="min-h-screen bg-[#181818]">
      {/* DYNAMIC HEADER: 
          If isResetPage: bg-transparent, no border-bottom
          Otherwise: bg-[#181818], border-b border-[#393747]
      */}
      <header className={`fixed top-0 left-0 w-full border-b border-[#393747] z-[100] transition-all duration-300 ${
        isResetPage 
          ? "bg-transparent " 
          : "bg-[#181818] "
      }`}>
        <nav className="flex items-center justify-between px-6 md:py-5 py-4 max-w-7xl mx-auto w-full">
          <div className="md:text-2xl text-xl font-bricolage font-bold text-[#D5D5D5] tracking-wider">APEXSIM</div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center font-manrope gap-9">
            {navigationItems.map((link) => (
              <Link key={link} href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">{link}</Link>
            ))}
            
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block" ref={langRef}>
              <div
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 bg-[#222222] border border-white/10 p-3 rounded-md !cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="w-4 h-4 overflow-hidden rounded-sm ">
                  <img src={selectedLang.flag} alt={selectedLang.name} className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="text-xs text-white font-manrope">{selectedLang.code}</span>
                <FaCaretDown size={12} className={`text-gray-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </div>

              {isLangOpen && (
                <div className="absolute top-full right-0 mt-2 w-36 bg-[#111111] border border-white/10 rounded-xl shadow-2xl z-[110] p-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setSelectedLang(lang); setIsLangOpen(false); }}
                      className="relative w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg !cursor-pointer font-inter"
                    >
                      <img src={lang.flag} className="w-4 h-3 rounded-sm object-cover" alt="" />
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => router.push('/login')} className="text-[#256DFD] hover:text-white font-semibold px-4 transition-colors cursor-pointer">Login</button>
              <button onClick={() => router.push('/signup')} className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-all cursor-pointer">Sign up</button>
            </div>

            <button className="md:hidden px-2 !cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <div className={`w-6 h-0.5 bg-gray-400 mb-1.5 transition-all ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <div className={`w-6 h-0.5 bg-gray-400 mb-1.5 ${isMenuOpen ? "opacity-0" : ""}`} />
              <div className={`w-6 h-0.5 bg-gray-400 transition-all ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-black border-b border-[#393747] px-6 py-6 flex flex-col gap-2 h-[calc(100vh-70px)] overflow-y-auto z-[200]">
            {navigationItems.map((l) => (
              <Link key={l} href="#" className="text-gray-400 text-lg py-3 border-b border-white/5 !cursor-pointer font-manrope">{l}</Link>
            ))}
            
            <div className="flex flex-col gap-4 mt-6 pb-10">
              <button className="w-full text-[#256DFD] py-3 text-lg font-bold border border-[#256DFD] rounded-full !cursor-pointer font-manrope">Login</button>
              <button className="w-full bg-white text-black py-3 text-lg font-bold rounded-full !cursor-pointer font-manrope">Sign up</button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT ADJUSTMENT:
          On Reset page, we remove the padding-top so the V-lines start at the literal top of the screen.
          On other pages, we keep pt-20 so content doesn't get hidden behind the solid navbar.
      */}
      <main className={isResetPage ? "" : "pt-20"}>
        {children}
      </main>
    </div>
  );
}