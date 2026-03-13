"use client";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ToastContext";

interface BotTradingCardProps {
  bot?: {
    _id: string;
    name: string;
    description: string;
    roi: number;
    traders: number;
    price: number | 'free';
    status: 'active' | 'inactive';
  };
  onActivate?: () => void;
}

const BotTradingCard = ({ bot, onActivate }: BotTradingCardProps) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(bot?.status === 'active' || false);

  // Default mock bot if none provided
  const defaultBot = {
    _id: "mock-bot",
    name: "BTCUSDT Trading Bot",
    description: "Advanced trading bot",
    roi: 56.6,
    traders: 1250,
    price: "free",
    status: "inactive" as const,
  };

  const botData = bot || defaultBot;

  const handleActivateBot = async () => {
    setLoading(true);
    try {
      await apiRequest(`/trading/bots/${botData._id}/activate`, {
        method: "POST",
        body: JSON.stringify({
          enabled: !isActive
        }),
      });
      setIsActive(!isActive);
      toast.addToast(`${botData.name} ${!isActive ? 'activated' : 'deactivated'} successfully!`, "success");
      if (onActivate) onActivate();
    } catch (err: any) {
      toast.addToast(err.message || "Failed to update bot status", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#181818] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all font-manrope">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-white text-lg tracking-tight">{botData.name}</h3>
          <p className="text-gray-500 text-xs mt-1">{botData.description}</p>
        </div>
        <button 
          onClick={handleActivateBot}
          disabled={loading}
          className={`px-8 py-2.5 rounded-md text-sm cursor-pointer transition-all shadow-lg ${
            isActive
              ? 'bg-[#ef5350] text-white shadow-red-900/20 hover:opacity-90'
              : 'bg-[#0055FF] text-white shadow-blue-900/20 hover:opacity-90'
          } ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? 'Loading...' : (isActive ? 'Stop' : 'Activate')}
        </button>
      </div>

      <div className="space-y-1 mb-4">
        <p className="text-[12px] text-gray-500 font-bold underline decoration-gray-700 underline-offset-4">
          30 Days ROI
        </p>
        <p className={`md:text-3xl text-xl tracking-tight ${botData.roi >= 0 ? 'text-[#34C759]' : 'text-[#ef5350]'}`}>
          {botData.roi >= 0 ? '+' : ''}{botData.roi.toFixed(1)}%
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-5">
        <div>
          <p className="text-[12px] text-gray-500 underline decoration-gray-700 underline-offset-4 uppercase mb-1">
            Traders
          </p>
          <p className="text-white text-[15px]">{botData.traders}</p>
        </div>
        <div>
          <p className="text-[12px] text-gray-500 whitespace-nowrap">
            Price
          </p>
          <p className="text-white text-[15px]">
            {botData.price === 'free' ? 'Free' : `$${botData.price}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-gray-500 whitespace-nowrap">
            Status
          </p>
          <p className={`text-[15px] ${isActive ? 'text-[#34C759]' : 'text-gray-400'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BotTradingCard;