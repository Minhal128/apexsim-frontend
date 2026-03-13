"use client";
import { useState, useEffect } from "react";
import { FaInfoCircle, FaSearch } from "react-icons/fa";
import TraderCard from "./CopyTradingCards";
import { IoEyeSharp } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ToastContext";

interface Trader {
  _id: string;
  email: string;
  totalCopiers: number;
  roi30d: number;
  pnl30d: number;
  aum: number;
  mdd: number;
  sharpeRatio: number;
  avatar?: string;
}

export default function CopyTradingPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("ROI");
  const [traders, setTraders] = useState<Trader[]>([]);
  const [balance, setBalance] = useState("0.00");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTraders();
    fetchBalance();
  }, []);

  const fetchTraders = async () => {
    setLoading(true);
    try {
      // This endpoint would need to be created in the backend
      const data = await apiRequest("/trading/top-traders");
      setTraders(data);
    } catch (err: any) {
      console.error("Failed to fetch traders:", err);
      // Use mock data if API fails
      setTraders(generateMockTraders());
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const data = await apiRequest("/wallet");
      const btc = data.balances?.find((b: any) => b.asset === "BTC")?.amount || 0;
      setBalance(parseFloat(btc).toFixed(6));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  const generateMockTraders = (): Trader[] => {
    return [1, 2, 3, 4, 5, 6].map((i) => ({
      _id: `trader-${i}`,
      email: `trader${i}@example.com`,
      totalCopiers: Math.floor(Math.random() * 500),
      roi30d: Math.random() * 500 - 50,
      pnl30d: Math.random() * 500000 - 50000,
      aum: Math.random() * 1000000,
      mdd: Math.random() * 50,
      sharpeRatio: Math.random() * 3,
    }));
  };

  const sortedTraders = [...traders].sort((a, b) => {
    switch (activeTab) {
      case "ROI":
        return b.roi30d - a.roi30d;
      case "PnL":
        return b.pnl30d - a.pnl30d;
      case "Win rate":
        return b.roi30d - a.roi30d; // Placeholder
      case "Number for copy traders":
        return b.totalCopiers - a.totalCopiers;
      case "Current holding position size":
        return b.aum - a.aum;
      default:
        return 0;
    }
  });

  const filteredTraders = sortedTraders.filter(trader =>
    trader.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#181818] text-white md:p-6 p-4 md:px-12 mt-5 font-manrope">
      <div className="max-w-350 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
          <div className="space-y-4">
            <h1 className="md:text-3xl text-xl tracking-tight md:mb-8">
              Copy Trading
            </h1>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <span>Total Margin Balance</span>
                <IoEyeSharp size={14} className="text-white cursor-pointer" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="md:text-3xl text-xl">{balance} BTC</span>
              </div>
              <p className="text-gray-500 text-sm">≈${(parseFloat(balance) * 40000).toFixed(2)}</p>
            </div>

            <button className="bg-[#0055FF] px-6 py-2.5 rounded-md text-xs cursor-pointer hover:bg-blue-600 transition-colors">
              Copy Overview
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-60">
            <FaSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-50"
              size={14}
            />
            <input
              type="text"
              placeholder="Search traders"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#222222] py-5 pl-11 pr-4 text-xs focus:outline-none border border-white/5 focus:border-white/20 rounded-md transition-colors"
            />
          </div>
        </div>

        {/* TABS SECTION */}
        <div className="flex items-center overflow-x-auto gap-4 flex-nowrap whitespace-nowrap justify-between mb-8">
          <div className="flex items-center">
            {[
              "ROI",
              "PnL",
              "Win rate",
              "Number for copy traders",
              "Current holding position size",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2.5 px-6 text-sm transition-all cursor-pointer relative ${
                  activeTab === tab
                    ? "text-white rounded-md bg-[#262628]"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">Loading traders...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTraders.map((trader) => (
              <TraderCard key={trader._id} trader={trader} onCopy={() => fetchBalance()} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
