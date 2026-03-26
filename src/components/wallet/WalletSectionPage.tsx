"use client";
import { useEffect, useState } from "react";
import Overview from "./OverviewSection";
import SpotAccountSection from "./SpotAccountSection";
import FuturesSection from "./FuturesSection";
import BotSection from "./BotSections";
import { useRouter } from "next/navigation";
import WithdrawModal from "@/components/dashboard/WithdrawModel";
import TransferModal from "./TransferModal";
import TradeHistoryModal from "./TradeHistoryModal";
import TradeRecordModal from "./TradeRecordModal";
import { APP_LANGUAGE_EVENT, AppLanguageCode, getAppLanguage, t } from "@/lib/i18n";

export default function WalletSectionPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showTradeHistory, setShowTradeHistory] = useState(false);
  const [showTradeRecord, setShowTradeRecord] = useState(false);
  const [lang, setLang] = useState<AppLanguageCode>("Eng");
  const tr = (key: string) => t(key, lang);
  const router = useRouter();

  const tabs = ["Overview", "Spot Account", "Futures", "Bot"];
  const tabLabel: Record<string, string> = {
    Overview: tr("overview"),
    "Spot Account": tr("spotAccount"),
    Futures: tr("futures"),
    Bot: "Bot",
  };

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

  return (
    <div className="min-h-screen bg-[#181818] text-white md:py-8 py-4 font-manrope">
      <div className="max-w-350 mx-auto px-4 md:px-0">
        <div className="flex md:flex-row flex-col items-start md:items-center mb-8 justify-between gap-6">
          <h1 className="text-3xl font-bold tracking-tight">{tr("assets")}</h1>

          <div className="md:w-150 w-full md:flex md:flex-row gap-4">
            <div className="grid grid-cols-2 gap-3 w-full md:flex  md:gap-3">
              <button
                onClick={() => router.push("/dashboard/deposit")}
                className="w-full rounded-sm bg-[#0055FF] px-3 py-2 text-sm hover:opacity-90 transition-opacity"
              >
                {tr("deposit")}
              </button>
              <button
                onClick={() => setShowWithdraw(true)}
                className="w-full rounded-sm bg-[#1D1D1D] px-3 py-2 text-sm hover:bg-[#252525] transition-colors"
              >
                {tr("withdraw")}
              </button>
              <button className="w-full rounded-sm bg-[#1D1D1D] px-3 py-2 text-sm" onClick={() => setShowTransfer(true)}>
                {tr("transferTitle")}
              </button>
              <button className="w-full rounded-sm bg-[#1D1D1D] px-3 py-2 text-sm" onClick={() => setShowTradeHistory(true)}>
                {tr("tradeHistoryTitle")}
              </button>
              <button className="w-full rounded-sm bg-[#1D1D1D] px-3 py-2 text-sm" onClick={() => setShowTradeRecord(true)}>
                {tr("tradeRecordTitle")}
              </button>
            </div>
          </div>
        </div>

        <div className="flex bg-[#1D1D1D] py-6 md:py-12 flex-col md:flex-row">
          <aside className="w-full md:w-100 space-y-1 border-r-4 border-[#181818] shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 text-lg transition-all cursor-pointer relative group ${activeTab === tab
                    ? "text-white font-semibold bg-white/5"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/2"
                  }`}
              >
                {activeTab === tab && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-white" />
                )}
                {tabLabel[tab] || tab}
              </button>
            ))}
          </aside>

          <main className="flex-1">
            {activeTab === "Overview" && <Overview />}
            {activeTab === "Spot Account" && <SpotAccountSection />}
            {activeTab === "Futures" && <FuturesSection />}
            {activeTab === "Bot" && <BotSection />}
          </main>
        </div>
      </div>

      <WithdrawModal open={showWithdraw} onClose={() => setShowWithdraw(false)} />
      <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} />
      <TradeHistoryModal open={showTradeHistory} onClose={() => setShowTradeHistory(false)} />
      <TradeRecordModal open={showTradeRecord} onClose={() => setShowTradeRecord(false)} />
    </div>
  );
}

