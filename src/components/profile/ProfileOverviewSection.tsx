"use client";
import React, { useState, useEffect } from "react";
import { LuEye, LuEyeOff, LuSearch } from "react-icons/lu";
import { BiSolidCopy } from "react-icons/bi";
import { FaCaretDown, FaStar, FaRegStar } from "react-icons/fa";
import { PiCaretUpDownFill } from "react-icons/pi";
import { apiRequest } from "@/lib/api";

interface ProfileOverviewProps {
  user: any;
  wallet: any;
  onDeposit: () => void;
  onWithdraw: () => void;
}

const ALL_COINS = ["BTC", "ETH", "USDT", "SOL", "BNB"];

const COIN_ICONS: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  USDT: "https://assets.coingecko.com/coins/images/325/small/tether.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/binancecoin.png",
};

const COIN_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT: "Tether",
  SOL: "Solana",
  BNB: "BNB",
};

type MarketTab = "Favorite" | "Hot" | "Top gainers" | "Top losers" | "24h Volume";

export default function ProfileOverview({ user, wallet, onDeposit, onWithdraw }: ProfileOverviewProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [prices, setPrices] = useState<Record<string, { usd: number; change24h: number; volume24h: number; marketCap: number }>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMarketTab, setActiveMarketTab] = useState<MarketTab>("Hot");
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      let coinFavs: string[] = [];
      let foundMarket = false;
      try {
        const marketSaved = localStorage.getItem("market_favorites");
        if (marketSaved) {
          const parsed = JSON.parse(marketSaved);
          if (Array.isArray(parsed)) {
            coinFavs = parsed
              .filter((p: string) => p.endsWith("/USDT"))
              .map((p: string) => p.replace("/USDT", ""));
            foundMarket = true;
          }
        }
      } catch (err) {}

      if (foundMarket) {
        return coinFavs;
      }

      const saved = localStorage.getItem("favoriteCoins");
      return saved ? JSON.parse(saved) : ["BTC", "ETH"];
    }
    return ["BTC", "ETH"];
  });

  const balances = wallet?.balances || [];

  // Fetch live market prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await apiRequest("/market/prices");
        setPrices(data);
      } catch (err) {
        console.error("Failed to fetch prices:", err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleVisibility = () => setShowBalance(!showBalance);

  const toggleFavorite = (coin: string) => {
    const isFav = favorites.includes(coin);
    const updated = isFav
      ? favorites.filter(f => f !== coin)
      : [...favorites, coin];
    setFavorites(updated);
    
    // Fallback sync
    localStorage.setItem("favoriteCoins", JSON.stringify(updated));

    // Sync with market\_favorites so it appears in the Market page
    if (typeof window !== "undefined") {
      try {
        const marketSaved = localStorage.getItem("market_favorites");
        const marketFavs = marketSaved ? new Set(JSON.parse(marketSaved)) : new Set();
        const pair = `${coin}/USDT`;
        if (isFav) {
          marketFavs.delete(pair);
        } else {
          marketFavs.add(pair);
        }
        localStorage.setItem("market_favorites", JSON.stringify(Array.from(marketFavs)));
        // Dispatch storage event to notify other components if on same page
        window.dispatchEvent(new Event("storage"));
      } catch (err) {}
    }
  };

  const getBalance = (asset: string) => {
    const balance = balances.find((b: any) => b.asset === asset);
    return balance ? balance.amount : 0;
  };

  const getPrice = (asset: string) => prices[asset]?.usd || 0;
  const getChange = (asset: string) => prices[asset]?.change24h || 0;
  const getVolume = (asset: string) => prices[asset]?.volume24h || 0;
  const getMarketCap = (asset: string) => prices[asset]?.marketCap || 0;

  // Build market coin list from ALL supported coins
  const allMarketCoins = ALL_COINS.map(name => ({
    name,
    fullName: COIN_NAMES[name] || name,
    balance: getBalance(name),
    usdValue: getBalance(name) * getPrice(name),
    price: getPrice(name),
    icon: COIN_ICONS[name],
    change24h: getChange(name),
    volume24h: getVolume(name),
    marketCap: getMarketCap(name),
    isFavorite: favorites.includes(name),
  }));

  // Sort based on active tab
  const getSortedCoins = () => {
    let coins = [...allMarketCoins];

    // Filter by search
    if (searchTerm) {
      coins = coins.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (activeMarketTab) {
      case "Favorite":
        return coins.filter(c => c.isFavorite);
      case "Hot":
        // Sort by market cap (popularity)
        return coins.sort((a, b) => b.marketCap - a.marketCap);
      case "Top gainers":
        return coins.sort((a, b) => b.change24h - a.change24h);
      case "Top losers":
        return coins.sort((a, b) => a.change24h - b.change24h);
      case "24h Volume":
        return coins.sort((a, b) => b.volume24h - a.volume24h);
      default:
        return coins;
    }
  };

  const displayCoins = getSortedCoins();

  // Total portfolio value in USD (from wallet balances only)
  const totalUsd = allMarketCoins.reduce((sum, c) => sum + c.usdValue, 0);
  const totalBtc = getPrice("BTC") > 0 ? totalUsd / getPrice("BTC") : 0;

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(2)}K`;
    return `$${vol.toFixed(2)}`;
  };

  const tabs: MarketTab[] = ["Favorite", "Hot", "Top gainers", "Top losers", "24h Volume"];

  return (
    <div className="min-h-screen md:py-0 py-5 bg-[#1D1D1D] text-white px-3 sm:px-4 font-manrope">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row border-b pb-4 md:pb-5 border-[#181818] md:items-center justify-between gap-4 md:gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
              <img
                src={user?.avatar || "/images/manimage.png"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user?.name || "User"}</h2>
              <p className="text-gray-400 text-xs">{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center gap-6 text-xs text-gray-500">
            <div className="flex flex-col gap-1">
              <span className="text-right">UID</span>
              <div className="flex items-center gap-2 text-white font-medium">
                <span>{user?._id?.substring(0, 8) || "N/A"}</span>
                <BiSolidCopy
                  size={14}
                  className="cursor-pointer hover:text-blue-500 transition-colors"
                  onClick={() => navigator.clipboard.writeText(user?._id)}
                />
              </div>
            </div>


          </div>
        </div>

        {/* Balance Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 md:mb-12">
          <div>
            <div
              className="flex items-center gap-2 text-gray-500 text-xs mb-1 cursor-pointer select-none group"
              onClick={toggleVisibility}
            >
              <span>Estimated value</span>
              {showBalance ? (
                <LuEye className="text-white transition-colors group-hover:text-blue-400" size={14} />
              ) : (
                <LuEyeOff className="text-white transition-colors group-hover:text-blue-400" size={14} />
              )}
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                {showBalance ? `${totalBtc.toFixed(6)} BTC` : "****** BTC"}
              </h1>
              <span className="text-gray-400 p-1 bg-[#252525] rounded-sm cursor-pointer hover:text-white transition-colors">
                <FaCaretDown size={12} />
              </span>
            </div>

            <p className="text-gray-500 text-sm mt-1">
              {showBalance ? `≈$${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "≈$******"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onDeposit}
              className="flex-1 bg-[#0055FF] hover:bg-blue-700 text-white px-10 py-2.5 rounded-sm transition-all"
            >
              Deposit
            </button>
            <button
              onClick={onWithdraw}
              className="flex-1 bg-[#1F1F26] hover:bg-[#323234] text-white px-10 py-2.5 rounded-sm transition-all"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-4 md:gap-6">
            <h3 className="text-lg font-semibold">Market</h3>
            <label className="flex items-center gap-2 text-gray-500 text-xs cursor-pointer">
              <input type="radio" className="w-3.5 h-3.5 accent-blue-500 cursor-pointer" />
              <span className="text-sm">Hide other assets less than 1 USD</span>
            </label>
          </div>

          <div className="relative w-full md:w-72">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={20} />
            <input
              type="text"
              placeholder="Search for currency pairs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#18181E] rounded-sm py-3 pl-10 pr-4 text-sm w-full focus:outline-none"
            />
          </div>
        </div>

        {/* Market Tabs */}
        <div className="mb-5 overflow-x-auto">
          <div className="flex min-w-max border-b border-b-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMarketTab(tab)}
                className={`px-4 pb-1 whitespace-nowrap transition-colors ${activeMarketTab === tab
                  ? "border-b-4 border-b-[#00B595] text-white font-semibold"
                  : "text-gray-500 hover:text-gray-300"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Table */}
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-4">
          <table className="w-full min-w-225 text-left">
            <thead>
              <tr className="text-gray-400 text-sm">
                <th className="py-3 font-medium w-8"></th>
                <th className="py-3 font-medium">Coin</th>
                <th className="py-3 font-medium">
                  <div className="inline-flex items-center gap-1">
                    Price (USD)
                    <PiCaretUpDownFill className="text-xs" />
                  </div>
                </th>
                <th className="py-3 font-medium">
                  <div className="inline-flex items-center gap-1">
                    Your Balance
                    <PiCaretUpDownFill className="text-xs" />
                  </div>
                </th>
                <th className="py-3 font-medium">24h Change</th>
                <th className="py-3 font-medium">24h Volume</th>
                <th className="py-3 font-medium text-right">Operations</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/3">
              {displayCoins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    {activeMarketTab === "Favorite"
                      ? "No favorite coins yet. Click the star to add."
                      : "No matching assets found."}
                  </td>
                </tr>
              ) : (
                displayCoins.map((coin, idx) => (
                  <tr key={idx} className="hover:bg-white/1 transition-colors">
                    {/* Favorite star */}
                    <td className="py-5">
                      <button onClick={() => toggleFavorite(coin.name)} className="text-sm">
                        {coin.isFavorite ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FaRegStar className="text-gray-600 hover:text-yellow-400 transition-colors" />
                        )}
                      </button>
                    </td>
                    {/* Coin info */}
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <img src={coin.icon} alt={coin.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-semibold text-sm">{coin.name}</div>
                          <div className="text-gray-500 text-xs">{coin.fullName}</div>
                        </div>
                      </div>
                    </td>
                    {/* Price */}
                    <td className="py-5 text-sm font-medium">
                      ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    {/* Your balance */}
                    <td className="py-5">
                      <div className="font-semibold text-sm">
                        {showBalance
                          ? coin.balance > 0
                            ? `${coin.balance.toFixed(coin.name === "BTC" ? 6 : coin.name === "ETH" ? 4 : 2)} ${coin.name}`
                            : "—"
                          : "******"}
                      </div>
                      {showBalance && coin.balance > 0 && (
                        <div className="text-gray-500 text-xs">
                          ≈${coin.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      )}
                    </td>
                    {/* 24h Change */}
                    <td className="py-5 text-sm">
                      <span className={coin.change24h >= 0 ? "text-green-500" : "text-red-500"}>
                        {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                      </span>
                    </td>
                    {/* 24h Volume */}
                    <td className="py-5 text-sm text-gray-300">
                      {formatVolume(coin.volume24h)}
                    </td>
                    {/* Operations */}
                    <td className="py-5 text-right">
                      <button
                        onClick={onDeposit}
                        className="text-blue-500 hover:text-blue-400 font-semibold text-sm mr-3"
                      >
                        Deposit
                      </button>
                      <button
                        onClick={onWithdraw}
                        className="text-blue-500 hover:text-blue-400 font-semibold text-sm"
                      >
                        Withdraw
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
