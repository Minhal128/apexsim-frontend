"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FaCaretDown, FaRegBell } from "react-icons/fa";

const tradeCategories = [
  {
    title: "Spot trade",
    desc: "Trade the spot market",
    icon: "/images/upanddown.png",
    path: "/dashboard/spot-trade",
  },
  {
    title: "Futures trade",
    desc: "Trade the futures market",
    icon: "/images/upanddown.png",
    path: "/dashboard/futures-trade",
  },
  {
    title: "Trading bot",
    desc: "Use an AI Bot",
    icon: "/images/upanddown.png",
    path: "/dashboard/trading-bot",
  },
  {
    title: "Copy trade",
    desc: "Trade with expert and earn",
    icon: "/images/upanddown.png",
    path: "/dashboard/copy-trade",
  },
];

const quoteCurrencies = ["USDT", "USDC", "USDQ", "EUR"];

const tradeAssets = [
  {
    name: "BTC/USDT",
    icon: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  },
  {
    name: "ETH/USDT",
    icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  },
  {
    name: "AVAX/USDT",
    icon: "https://assets.coingecko.com/coins/images/12559/small/avalanche.png",
  },
  {
    name: "SOL/USDT",
    icon: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  },
  { name: "XRP/USDT", icon: "https://assets.coingecko.com/coins/images/44/small/xrp.png" },
  {
    name: "USDC/USDT",
    icon: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
  },
  {
    name: "ADA/USDT",
    icon: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  },
  {
    name: "BCH/USDT",
    icon: "https://assets.coingecko.com/coins/images/231/small/bitcoin-cash.png",
  },
  {
    name: "XLM/USDT",
    icon: "https://assets.coingecko.com/coins/images/100/small/stellar.png",
  },
];

const moreItems = [
  {
    title: "Learn",
    desc: "Master the markets",
    icon: <FaRegBell size={14} />,
    path: "/dashboard/learn",
  },
  {
    title: "Referral",
    desc: "Invite friends, earn together",
    icon: <FaRegBell size={14} />,
    path: "/dashboard/referral",
  },
  {
    title: "Announcements",
    desc: "Latest updates",
    icon: <FaRegBell size={14} />,
    path: "#",
  },
];

interface NavItemProps {
  label: string;
  type: "trade" | "more";
  isMobile?: boolean;
  onItemClick?: () => void;
}

export default function NavItem({
  label,
  type,
  isMobile,
  onItemClick,
}: NavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeQuote, setActiveQuote] = useState("USDT");
  const [isSelected, setIsSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    closeDropdown();
    if (onItemClick) {
      onItemClick();
    }
  };

  const items = type === "trade" ? tradeCategories : moreItems;

  return (
    <div className={isMobile ? "w-full" : "relative"} ref={containerRef}>
      <button
        onClick={handleButtonClick}
        className={`flex items-center gap-1 text-gray-400 hover:text-white transition-all py-2 cursor-pointer w-full font-manrope ${isMobile
            ? "justify-between text-lg border-b border-white/5"
            : "text-sm font-medium"
          }`}
      >
        {label}
        <FaCaretDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={
            isMobile
              ? "pl-4 flex flex-col gap-2 my-2"
              : `absolute top-[110%] -left-5 bg-[#1c1c1c] border border-white/10 rounded-sm shadow-2xl z-150 overflow-hidden ${type === "trade" ? "w-130 flex" : "w-75"}`
          }
          onClick={(e) => e.stopPropagation()}
        >
          {type === "trade" && !isMobile && (
            <>
              <div className="w-[45%] bg-[#181818] p-2 border-r border-white/5">
                <p className="text-[10px] text-gray-600 font-bold uppercase px-3 py-3">
                  Trading
                </p>
                {tradeCategories.map((cat) => (
                  <Link
                    key={cat.title}
                    href={cat.path}
                    onClick={() => {
                      setIsSelected(cat.title);
                      handleLinkClick();
                    }}
                    className={`block p-3 rounded-md cursor-pointer group transition-colors mb-1 ${isSelected === cat.title
                        ? "bg-[#232526]"
                        : "hover:bg-white/5"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 flex items-center justify-center opacity-80 group-hover:opacity-100">
                        <img src={cat.icon} className="w-4 h-4" alt="" />
                      </div>
                      <div>
                        <p
                          className={`text-[13px] font-semibold ${isSelected === cat.title
                              ? "text-white"
                              : "text-gray-300 group-hover:text-white"
                            }`}
                        >
                          {cat.title}
                        </p>
                        <p className="text-gray-500 text-[10px]">{cat.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="w-[55%] p-4 flex flex-col gap-3 max-h-105 no-scrollbar bg-[#232526]">
                <div className="flex gap-5 text-[11px] font-bold text-gray-500 border-b border-white/5 pb-0 mb-1">
                  {quoteCurrencies.map((quote) => (
                    <button
                      key={quote}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveQuote(quote);
                      }}
                      className={`pb-2 transition-all cursor-pointer border-b-2 ${activeQuote === quote
                          ? "text-white border-blue-500"
                          : "text-gray-500 border-transparent hover:text-gray-300"
                        }`}
                    >
                      {quote}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-1">
                  {tradeAssets.map((asset) => {
                    // determine target path based on selected category (default to spot)
                    const selectedCategory = tradeCategories.find(c => c.title === isSelected);
                    const basePath = selectedCategory?.path || tradeCategories[0].path;
                    const query = `asset=${encodeURIComponent(asset.name)}&quote=${encodeURIComponent(activeQuote)}`;
                    const href = `${basePath}?${query}`;
                    return (
                      <Link
                        key={asset.name}
                        href={href}
                        onClick={handleLinkClick}
                        className="flex items-center justify-between py-2 px-1 hover:bg-white/5 rounded-md cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={asset.icon}
                            alt={asset.name}
                            className="w-5 h-5 rounded-full object-contain"
                          />
                          <span className="text-[13px] text-gray-300 group-hover:text-white font-medium">
                            {asset.name}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* MORE DESKTOP */}
          {type === "more" && !isMobile && (
            <div className="p-2 flex flex-col gap-1 bg-[#1c1c1c]">
              <p className="px-3 py-3 text-gray-500 text-[10px] uppercase font-bold">
                More
              </p>
              {moreItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.path}
                  onClick={() => {
                    setIsSelected(item.title);
                    handleLinkClick();
                  }}
                  className={`block p-4 rounded-md cursor-pointer group transition-colors ${isSelected === item.title
                      ? "bg-[#232526]"
                      : "hover:bg-white/5"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <p
                        className={`text-[14px] font-semibold ${isSelected === item.title
                            ? "text-white"
                            : "text-white group-hover:text-white"
                          }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-gray-500 text-[11px] mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* MOBILE DROPDOWN */}
          {isMobile && (
            <div className="flex flex-col gap-1 py-2 bg-[#111111]">
              {items.map((item) => (
                <Link
                  key={item.title}
                  href={item.path}
                  onClick={handleLinkClick}
                  className="text-gray-400 text-sm hover:text-white py-3 px-4 border-l-2 border-transparent hover:border-blue-500 hover:bg-white/5 transition-all"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
