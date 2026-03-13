import { FaUsers } from "react-icons/fa";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ToastContext";

interface TraderCardProps {
  trader?: {
    _id: string;
    email: string;
    totalCopiers: number;
    roi30d: number;
    pnl30d: number;
    aum: number;
    mdd: number;
    sharpeRatio: number;
    avatar?: string;
  };
  onCopy?: () => void;
}

const TraderCard = ({ trader, onCopy }: TraderCardProps) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Default mock trader if none provided
  const defaultTrader = {
    _id: "mock-trader",
    email: "nosleeping@outlook.com",
    totalCopiers: 8,
    roi30d: 226.8,
    pnl30d: 226468.43,
    aum: 740567.24,
    mdd: 36.98,
    sharpeRatio: 1.87,
    avatar: "/images/manimage.png",
  };

  const traderData = trader || defaultTrader;

  const handleCopyTrader = async () => {
    setLoading(true);
    try {
      await apiRequest("/trading/copy-trader", {
        method: "POST",
        body: JSON.stringify({
          traderId: traderData._id,
          allocation: 0.5, // Default 50% allocation
        }),
      });
      toast.addToast(`Now copying trades from ${traderData.email}!`, "success");
      if (onCopy) onCopy();
    } catch (err: any) {
      toast.addToast(err.message || "Failed to copy trader", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMockTrading = () => {
    toast.addToast(`Mock trading enabled for ${traderData.email}`, "info");
  };

  return (
    <div className="bg-[#181818] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all font-manrope">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
            <img 
              src={traderData.avatar || "/images/manimage.png"} 
              alt="avatar"
              onError={(e) => {
                e.currentTarget.src = "/images/manimage.png";
              }}
            />
          </div>
          <div>
            <p className="text-white text-md truncate">{traderData.email}</p>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
              <FaUsers size={12} />
              <span>{traderData.totalCopiers}/500</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <p className="text-[12px] underline text-gray-500 font-bold">30 Days PNL (USD)</p>
        <p className={`text-2xl ${traderData.pnl30d >= 0 ? "text-[#34C759]" : "text-[#ef5350]"}`}>
          {traderData.pnl30d >= 0 ? "+" : ""}${traderData.pnl30d.toFixed(2)}
        </p>
        <p className="text-[14px] text-gray-400">
          30 Days ROI <span className={traderData.roi30d >= 0 ? "text-[#34C759]" : "text-[#ef5350]"}>
            {traderData.roi30d >= 0 ? "+" : ""}{traderData.roi30d.toFixed(1)}%
          </span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 border-t border-white/5 pt-4">
        <div>
          <p className="text-[12px] underline text-gray-500 font-bold uppercase">AUM</p>
          <p className="text-white text-sm">${traderData.aum.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-[12px] text-gray-500 font-bold">30 Days MDD</p>
          <p className="text-white text-sm">{traderData.mdd.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-[12px] text-gray-500 font-bold">Sharp Ratio</p>
          <p className="text-white text-sm">{traderData.sharpeRatio.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={handleMockTrading}
          className="flex-1 bg-[#262628] text-gray-300 py-2.5 rounded-sm text-sm cursor-pointer hover:bg-[#2d2d2f] transition-colors"
        >
          Mock
        </button>
        <button 
          onClick={handleCopyTrader}
          disabled={loading}
          className="flex-1 bg-[#0055FF] text-white py-2.5 rounded-sm text-sm cursor-pointer hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Copying..." : "Copy"}
        </button>
      </div>
    </div>
  );
};

export default TraderCard;