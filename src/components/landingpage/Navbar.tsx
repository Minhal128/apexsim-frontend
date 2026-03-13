"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Navigation configuration
const mainNavigation = [
  { label: "Deposit", href: "/login", enabled: true },
  { label: "Withdraw", href: "/login", enabled: true },
  { label: "Market", href: "/dashboard/market", enabled: true },
  { label: "Futures", href: "/dashboard/futures-trade", enabled: true },
];

const dropdownNavigation = [
  { label: "Trade", items: ["Spot Trading", "Futures Trading"], paths: ["/dashboard/spot-trade", "/dashboard/futures-trade"], enabled: true },
  { label: "More", items: ["Staking", "Launchpad"], paths: ["#", "#"], enabled: true },
];

const supportNavigation = [
  { label: "Support", href: "#support", enabled: true },
];

const NavItem = ({
  label,
  items,
  paths,
  isMobile,
}: {
  label: string;
  items?: string[];
  paths?: string[];
  isMobile?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleProps = isMobile
    ? { onClick: () => setIsOpen(!isOpen) }
    : {
      onMouseEnter: () => setIsOpen(true),
      onMouseLeave: () => setIsOpen(false),
    };

  return (
    <div className={isMobile ? "w-full" : "relative"} {...toggleProps}>
      <button
        className={`flex items-center gap-1 text-gray-400 hover:text-white transition-all py-2 cursor-pointer w-full ${isMobile ? "justify-between text-lg" : ""}`}
      >
        {label}{" "}
        {items && (
          <span
            className={`text-[10px] ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        )}
      </button>

      {items && isOpen && (
        <div
          className={
            isMobile
              ? "pl-4 flex flex-col gap-2 mb-2"
              : "absolute top-full left-0 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1"
          }
        >
          {items.map((item, idx) => (
            <Link
              key={item}
              href={paths?.[idx] || "#"}
              className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              {item}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="w-full border-b border-[#393747] backdrop-blur-[2px] relative z-100">
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <div className="md:text-2xl text-xl font-bricolage font-bold text-[#D5D5D5] tracking-wider">
          APEXSIM
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center font-manrope gap-9">
          {mainNavigation.filter(item => item.enabled).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              {item.label}
            </Link>
          ))}

          {dropdownNavigation.filter(item => item.enabled).map((item) => (
            <NavItem key={item.label} label={item.label} items={item.items} paths={item.paths} />
          ))}

          {supportNavigation.filter(item => item.enabled).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Buttons & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex font-manrope items-center gap-4">
            <button
              onClick={() => router.push("/login")}
              className="text-[#256DFD] hover:text-white font-semibold px-4 transition-colors cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-all cursor-pointer"
            >
              Sign up
            </button>
          </div>

          {/* Mobile Menu */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div
              className={`w-6 h-0.5 bg-gray-400 transition-all ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <div
              className={`w-6 h-0.5 bg-gray-400 transition-all ${isMenuOpen ? "opacity-0" : ""}`}
            />
            <div
              className={`w-6 h-0.5 bg-gray-400 transition-all ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full font-manrope left-0 w-full bg-[#0a0a0a] border-b border-[#393747] px-6 py-8 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          {mainNavigation.filter(item => item.enabled).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-gray-400 text-lg py-2 border-b border-white/5 cursor-pointer"
            >
              {item.label}
            </Link>
          ))}

          {dropdownNavigation.filter(item => item.enabled).map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              items={item.items}
              paths={item.paths}
              isMobile={true}
            />
          ))}

          {supportNavigation.filter(item => item.enabled).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-gray-400 text-lg py-2 border-b border-white/5 cursor-pointer"
            >
              {item.label}
            </Link>
          ))}

          <div className="flex flex-col gap-4 pt-4">
            <button
              onClick={() => router.push("/login")}
              className="w-full text-[#256DFD] py-3 text-lg font-manrope border border-[#256DFD] rounded-full cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="w-full bg-white text-black py-3 text-lg font-manrope rounded-full cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
