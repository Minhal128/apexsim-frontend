import React, { useEffect, useState } from "react";
import { LuEye, LuSearch } from "react-icons/lu";
import { apiRequest } from "@/lib/api";
import { APP_LANGUAGE_EVENT, AppLanguageCode, getAppLanguage, t } from "@/lib/i18n";

export default function BotSection() {
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Spot Grid" | "Futures Grid">("Spot Grid");
  const [profit, setProfit] = useState(0);
  const [lang, setLang] = useState<AppLanguageCode>("Eng");
  const tr = (key: string) => t(key, lang);

  useEffect(() => {
    fetchWallet();
    fetchProfit();
  }, []);

  useEffect(() => {
    const applyLanguage = () => setLang(getAppLanguage());
    applyLanguage();
    window.addEventListener("storage", applyLanguage);
    window.addEventListener(APP_LANGUAGE_EVENT, applyLanguage as EventListener);
    return () => {
      window.removeEventListener("storage", applyLanguage);
      window.removeEventListener(APP_LANGUAGE_EVENT, applyLanguage as EventListener);
    };
  }, []);

  const fetchWallet = async () => {
    try {
      const data = await apiRequest("/wallet");
      setWalletData(data);
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfit = async () => {
    try {
      // Mocking fetch or hitting an endpoint if available.
      // E.g. get positions and calculate profit. Here we set dynamically to 0.000000 or whatever is returned.
      const positions = await apiRequest("/trading/positions").catch(() => []);
      const totalPnl = Array.isArray(positions) ? positions.reduce((acc, pos) => acc + (pos.unrealizedPnl || 0), 0) : 0;
      setProfit(totalPnl);
    } catch (error) {
      console.error("Failed to fetch profit", error);
    }
  };

  const getBalance = (symbol: string) => {
    return walletData?.balances?.find((b: any) => b.asset === symbol)?.amount || 0;
  };

  const getFuturesBalance = (symbol: string) => {
    return walletData?.futuresBalances?.find((b: any) => b.asset === symbol)?.amount || 0;
  };

  const currentBalance = activeTab === "Spot Grid" ? getBalance('BTC') : getFuturesBalance('USDT');
  const currencySymbol = activeTab === "Spot Grid" ? "BTC" : "USDT";

  return (
    <div className="min-h-screen bg-[#1D1D1D] text-white p-4 font-manrope">
      <div className="max-w-6xl mx-auto">
        <div className="mb-7">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-1">
            <span>{tr("valuation")}</span>
            <LuEye className="cursor-pointer text-white transition-colors" size={14} />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {loading ? tr("loadingDots") : `${currentBalance.toFixed(activeTab === "Spot Grid" ? 6 : 2)} ${currencySymbol}`}
          </h1>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab("Spot Grid")}
            className={`${activeTab === "Spot Grid" ? "bg-[#262628] text-white" : "text-gray-500 hover:text-gray-300"} px-4 py-1.5 rounded text-sm font-medium cursor-pointer transition-colors`}
          >
            {lang === "Esp" ? "Grid Spot" : "Spot Grid"}
          </button>
          <button 
            onClick={() => setActiveTab("Futures Grid")}
            className={`${activeTab === "Futures Grid" ? "bg-[#262628] text-white" : "text-gray-500 hover:text-gray-300"} px-4 py-1.5 rounded text-sm font-medium cursor-pointer transition-colors`}
          >
            {lang === "Esp" ? "Grid Futuros" : "Futures Grid"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4 border-b border-white/5 pb-4">
          <div>
            <p className="text-gray-500 text-sm font-semibold mb-2">{tr("walletBalanceLabel")}</p>
            <h2 className="text-2xl md:text-3xl font-semibold">{currentBalance.toFixed(activeTab === "Spot Grid" ? 6 : 2)} {currencySymbol}</h2>
          </div>
          <div className="md:text-center">
            <p className="text-gray-500 text-sm font-semibold mb-2">{lang === "Esp" ? "Ganancia total" : "Total Profit"}</p>
            <h2 className="text-2xl md:text-3xl font-bold">{profit.toFixed(6)} {currencySymbol}</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex flex-col items-center justify-center text-center py-10">
            <img src="/images/search.png" alt="" className="w-16 h-16 mb-4" />
            <p className="text-gray-500 font-semibold text-sm">{tr("noData")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

