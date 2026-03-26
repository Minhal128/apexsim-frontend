"use client";
import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaBitcoin, FaCaretDown } from "react-icons/fa";
import { RiSettingsFill } from "react-icons/ri";
import SettingsModal from "./TradingSetting";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ToastContext";
import { useRouter } from "next/navigation";
import { initializeSocket } from "@/lib/socket";
import { APP_LANGUAGE_EVENT, AppLanguageCode, getAppLanguage, t } from "@/lib/i18n";

type OrderType = "Limit" | "Market" | "Stop limit";

interface TradeFormProps {
  symbol?: string;
  currentPrice?: number;
}

export default function TradeForm({ symbol = "BTC/USDT", currentPrice }: TradeFormProps) {
  const toast = useToast();
  const router = useRouter();
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<OrderType>("Limit");
  const [price, setPrice] = useState("0.00");
  const [currentMarketPrice, setCurrentMarketPrice] = useState("0.00");
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState("");
  const assetBase = symbol.split('/')[0];
  const [usdtBalance, setUsdtBalance] = useState("0");
  const [assetBalance, setAssetBalance] = useState("0");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    apiRequest('/profile/me').then(data => setUserId(data._id)).catch(console.error);
  }, []);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<AppLanguageCode>("Eng");
  const tr = (key: string) => t(key, lang);

  useEffect(() => {
    const applyLanguage = () => setLang(getAppLanguage());
    applyLanguage();
    window.addEventListener('storage', applyLanguage);
    window.addEventListener(APP_LANGUAGE_EVENT, applyLanguage as EventListener);
    return () => {
      window.removeEventListener('storage', applyLanguage);
      window.removeEventListener(APP_LANGUAGE_EVENT, applyLanguage as EventListener);
    };
  }, []);

  const fetchBalances = async () => {
    try {
      const data = await apiRequest("/wallet");
      const assetBase = symbol.split('/')[0].toUpperCase();

      const usdtBalanceRaw = data.balances.find((b: any) => (b.asset || '').toString().toUpperCase() === "USDT")?.amount || 0;
      const assetBalanceRaw = data.balances.find((b: any) => (b.asset || '').toString().toUpperCase() === assetBase)?.amount || 0;

      const usdtNum = typeof usdtBalanceRaw === 'string' ? parseFloat(usdtBalanceRaw) : usdtBalanceRaw;
      const assetNum = typeof assetBalanceRaw === 'string' ? parseFloat(assetBalanceRaw) : assetBalanceRaw;

      setUsdtBalance(Number.isFinite(usdtNum) ? usdtNum.toFixed(2) : "0");
      setAssetBalance(Number.isFinite(assetNum) ? assetNum.toFixed(6) : "0");
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }
  };

  const fetchMarketPrice = async () => {
    if (currentPrice && currentPrice > 0) return; // skip if we have prop 
    try {
      const prices = await apiRequest("/market/prices");
      const assetBase = symbol.split('/')[0];
      const fetchedPrice = (prices[assetBase]?.usd || prices[assetBase]?.price || prices[assetBase]?.value) || 0;
      if (fetchedPrice > 0) {
        setPrice(fetchedPrice.toString());
        setCurrentMarketPrice(fetchedPrice.toString());
      }
    } catch (err) {
      console.error("Failed to fetch market price:", err);
    }
  };

  useEffect(() => {
    if (currentPrice && currentPrice > 0) {
        setCurrentMarketPrice(currentPrice.toString());
        if (orderType !== "Market" && (!price || parseFloat(price) === 0)) {
            setPrice(currentPrice.toString());
        }
    }
  }, [currentPrice, orderType, price]);

  useEffect(() => {
    fetchBalances();
    // Reset inputs when switching symbols so new prices can snap in
    setPrice("");
    setAmount("");
    setTotal("");

    fetchMarketPrice();
    
    const socket = initializeSocket();
    if (!socket) return;
    
    // In our system, marketType comes from the context, but let's assume it's crypto for default
    socket.emit('subscribe-market', 'crypto');

    const handleMarketUpdate = (data: any) => {
        const assetBase = symbol.split('/')[0];
        if (data[assetBase] && (data[assetBase].usd || data[assetBase].price || data[assetBase].value)) {
            const livePrice = (data[assetBase].usd || data[assetBase].price || data[assetBase].value).toString();
            setCurrentMarketPrice(livePrice);
        }
    };

    const handleWalletUpdate = (data: any) => {
        if (userId && data.userId === userId) {
            const walletData = data.wallet;
            const usdtBalanceRaw = walletData.balances.find((b: any) => (b.asset || '').toString().toUpperCase() === "USDT")?.amount || 0;
            const assetBalanceRaw = walletData.balances.find((b: any) => (b.asset || '').toString().toUpperCase() === assetBase)?.amount || 0;
            
            const usdtNum = typeof usdtBalanceRaw === 'string' ? parseFloat(usdtBalanceRaw) : usdtBalanceRaw;
            const assetNum = typeof assetBalanceRaw === 'string' ? parseFloat(assetBalanceRaw) : assetBalanceRaw;
            
            setUsdtBalance(Number.isFinite(usdtNum) ? usdtNum.toFixed(2) : "0");
            setAssetBalance(Number.isFinite(assetNum) ? assetNum.toFixed(6) : "0");
        }
    };

    socket.on('market-update', handleMarketUpdate);
    socket.on('wallet-update', handleWalletUpdate);

    return () => {
        socket.off('market-update', handleMarketUpdate);
        socket.off('wallet-update', handleWalletUpdate);
    };
  }, [symbol, userId]);

  // Sync total when price or amount changes
  useEffect(() => {
    if (orderType === "Limit") {
      const p = parseFloat(price) || 0;
      const a = parseFloat(amount) || 0;
      if (p > 0 && a > 0) {
        setTotal((p * a).toFixed(2));
      } else {
        setTotal("");
      }
    }
  }, [price, amount, orderType]);

  const handleAmountChange = (val: string) => {
    setAmount(val);
    if (orderType === "Market") {
      const p = parseFloat(currentMarketPrice) || 0;
      const a = parseFloat(val) || 0;
      if (p > 0 && a > 0) {
        setTotal((p * a).toFixed(2));
      } else {
        setTotal("");
      }
    }
  };

  const handleTotalChange = (val: string) => {
    setTotal(val);
    const p = parseFloat(price) || 0;
    const t = parseFloat(val) || 0;
    if (p > 0 && t > 0) {
      setAmount((t / p).toFixed(6));
    } else {
      setAmount("");
    }
  };

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      await apiRequest("/trading/order", {
        method: "POST",
        body: JSON.stringify({
          symbol: symbol,
          type: side,
          marketType: "spot",
          price: orderType === "Market" ? parseFloat(currentMarketPrice) : parseFloat(price),
          amount: parseFloat(amount),
          orderType: orderType.toLowerCase(),
        }),
      });
      // Refresh balances after trade
      fetchBalances();
      setAmount("");
      toast.addToast(`${side.toUpperCase()} order placed successfully!`, "success");
    } catch (err: any) {
      toast.addToast(err.message || "Trade failed", "error");
    } finally {
      setLoading(false);
    }
  };


  const handleSwitchToFutures = () => {
    router.push('/dashboard/futures-trade');
  };

  return (
    <div className="w-full md:w-[320px] bg-[#181818] p-3 flex flex-col gap-4 h-auto select-none font-sans">
      {/* Trading Type Tabs */}
      <div className="flex gap-4 text-[13px] font-semibold border-b border-white/5 items-center">
        <div className="relative pb-2 cursor-pointer">
          <span className="text-white">{tr('spot')}</span>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00B595]" />
        </div>
        <span className="text-gray-500 hover:text-gray-300 cursor-pointer" onClick={handleSwitchToFutures}>
          {tr('futures')}
        </span>
        {/* Display selected asset icon and name */}
        <div className="ml-auto flex items-center gap-2">
          <img
            src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.split('/')[0].toLowerCase()}.png`}
            alt={symbol.split('/')[0]}
            className="w-4 h-4 rounded-full object-contain"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${(symbol || "A").split("/")[0].substring(0,3)}&background=2A2A2A&color=fff&rounded=true&bold=true`;
            }}
          />
          <span className="text-xs text-gray-400">{symbol}</span>
        </div>
      </div>

      <div className="absolute md:top-28 right-10 text-white">
        <RiSettingsFill
          onClick={() => setIsSettingOpen(true)}
          size={22}
          className="cursor-pointer text-gray-50 hover:text-white"
        />
      </div>

      <div className="flex bg-[#1e2023] rounded-md">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-2.5 text-md  rounded cursor-pointer transition-all ${side === "buy" ? "bg-white text-black" : "text-gray-400"
            }`}
        >
          {tr('buy')} {symbol.split('/')[0]}
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-2.5 text-md  rounded cursor-pointer transition-all ${side === "sell" ? "bg-[#323539] text-white" : "text-gray-400"
            }`}
        >
          {tr('sell')} {symbol.split('/')[0]}
        </button>
      </div>

      <div className="space-y-3.5">
        <div className="flex gap-4 text-[13px] font-semibold uppercase tracking-wider">
          {(["Limit", "Market", "Stop limit"] as OrderType[]).map((tVal) => (
            <span
              key={tVal}
              onClick={() => setOrderType(tVal)}
              className={`cursor-pointer transition-colors ${orderType === tVal
                ? "text-white "
                : "text-gray-500 hover:text-gray-300"
                }`}
            >
              {tVal === 'Limit' ? tr('limit') : tVal === 'Market' ? tr('market') : tr('stopLimit')}
            </span>
          ))}
        </div>

        <div className="flex gap-2 text-[12px] text-gray-500 items-center">
          <span>
            {tr('avbl')}{" "}
            <span className="text-gray-300 font-medium">
              {side === "buy" ? `${usdtBalance} USDT` : `${assetBalance} ${assetBase}`}
            </span>
          </span>
          <FaPlusCircle
            className="text-[#3b82f6] cursor-pointer hover:text-blue-400"
            size={11}
          />
        </div>

        <div className="flex flex-col gap-3">
          {orderType === "Limit" && (
            <>
              {/* Price Field */}
              <div className="relative group">
                <input
                  placeholder={`${tr('price')} (${symbol.split('/')[1] || "USDT"})`}
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#181B1F] border border-white/10 rounded-md p-2.5 text-white text-sm outline-none focus:border-[#3b82f6]"
                />
              </div>
              {/* Amount Field */}
              <div className="relative group">
                <input
                  placeholder={`${tr('amount')} (${symbol.split('/')[0]})`}
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full bg-[#181B1F] border border-white/10 rounded-md p-2.5 text-white text-sm outline-none focus:border-[#3b82f6]"
                />
              </div>
            </>
          )}

          {orderType === "Market" && (
            <div className="flex flex-col gap-3">
              <div className="relative group">
                <input
                  placeholder={tr('marketPrice')}
                  type="text"
                  value={`~${currentMarketPrice} ${symbol.split('/')[1] || "USDT"}`}
                  readOnly
                  className="w-full bg-[#181B1F]/50 border border-white/5 rounded-md p-2.5 text-gray-500 text-sm outline-none cursor-not-allowed"
                />
              </div>
              <div className="relative group">
                <input
                  placeholder={`${tr('amount')} (${symbol.split('/')[0]})`}
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full bg-[#181B1F] border border-white/10 rounded-md p-2.5 text-white text-sm outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
          )}

          {orderType === "Stop limit" && (
            <div className="h-22 flex items-center justify-center border border-dashed border-white/10 rounded-md">
              <span className="text-gray-600 text-[10px]">
                {lang === 'Esp' ? 'Sin parámetros para Stop límite' : 'No parameters for Stop Limit'}
              </span>
            </div>
          )}
        </div>

        <div className="relative h-6 flex items-center mt-4 mb-2 px-1 cursor-pointer">
          {(() => {
            const balanceNum = side === "buy" ? parseFloat(usdtBalance) || 0 : parseFloat(assetBalance) || 0;
            const priceNum = orderType === "Market" ? parseFloat(currentMarketPrice) : (parseFloat(price) || 0);

            let maxAmount = 0;
            if (side === "buy" && priceNum > 0) {
              maxAmount = balanceNum / priceNum;
            } else if (side === "sell") {
              maxAmount = balanceNum;
            }

            const currentPercent = maxAmount > 0 ? ((parseFloat(amount) || 0) / maxAmount) * 100 : 0;
            const fillPercent = Math.min(Math.max(currentPercent, 0), 100);

            return (
              <>
                <div className="absolute w-[calc(100%-8px)] h-[3px] bg-[#2b3139] rounded" />
                <div className={`absolute h-[3px] rounded transition-all ${side === 'buy' ? 'bg-[#0eb27e]' : 'bg-[#db4658]'}`} style={{ width: `calc(${fillPercent}% - 8px)` }} />
                <div className="absolute w-[calc(100%-8px)] flex justify-between z-10 left-1">
                  {[0, 25, 50, 75, 100].map((percent) => {
                    const isFilled = fillPercent >= percent;
                    return (
                      <div
                        key={percent}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (maxAmount > 0) {
                            const newAmount = (maxAmount * (percent / 100));
                            handleAmountChange(newAmount > 0 ? newAmount.toFixed(6).replace(/\.?0+$/, '') : "");
                          }
                        }}
                        className={`w-3.5 h-3.5 rotate-45 rounded-[2px] transition-all
                          ${isFilled 
                            ? (side === 'buy' ? 'bg-[#0eb27e]' : 'bg-[#db4658]') 
                            : 'bg-[#181a20] border-[2.5px] border-[#2b3139]'
                          }`}
                      />
                    );
                  })}
                </div>
                <input
                   type="range"
                   min="0"
                   max="100"
                   value={fillPercent || 0}
                   onChange={(e) => {
                       const pct = parseFloat(e.target.value);
                       if (maxAmount > 0) {
                          const newAmount = (maxAmount * (pct / 100));
                          handleAmountChange(newAmount > 0 ? newAmount.toFixed(6).replace(/\.?0+$/, '') : "");
                       }
                   }}
                   className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                />
              </>
            );
          })()}
        </div>

        <div className="relative">
          <input
            type="number"
            value={total}
            onChange={(e) => handleTotalChange(e.target.value)}
            className="w-full bg-[#181B1F] border border-white/5 rounded-md p-2.5 text-sm text-white outline-none focus:border-[#3b82f6]"
            placeholder={`${tr('total')} (USDT)`}
          />
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              className="w-3.5 h-3.5 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-gray-400"
            />
            <span className="text-[17px] text-gray-50 font-medium">
              {orderType === "Market" ? tr('maxSlippage') : tr('advancedOptions')}
            </span>
          </div>
          <div className="flex gap-2 text-[17px] mt-1">
            <span className="text-gray-500">{tr('maxBuy')}</span>
            <span className="text-white">
              {((orderType === 'Market' ? currentMarketPrice : price) && parseFloat(orderType === 'Market' ? currentMarketPrice : price) > 0) 
                ? (parseFloat(usdtBalance) / parseFloat(orderType === 'Market' ? currentMarketPrice : price)).toFixed(6) 
                : "0.000000"} {symbol.split('/')[0]}
            </span>
          </div>
        </div>

        <button
          onClick={handleTrade}
          disabled={loading}
          className={`w-full py-3 rounded-md text-[16px] font-bold cursor-pointer transition-all active:scale-[0.98] ${side === "buy"
            ? "bg-linear-to-r from-[#0052ff] to-[#0070ff] text-white shadow-[0_4px_12px_rgba(0,82,255,0.3)]"
            : "bg-[#ef5350] text-white"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? tr('processing') : `${side === 'buy' ? tr('buy') : tr('sell')} ${symbol.split('/')[0]}`}
        </button>

        <div className="flex gap-2.5 pt-1 ">
          <button
            onClick={() => router.push('/dashboard/deposit')}
            className="flex-1 py-2 bg-[#24262b] rounded-md text-[15px]  text-gray-300 hover:bg-[#2d3036] cursor-pointer transition-colors"
          >
            {tr('deposit')}
          </button>
          <button
            onClick={() => router.push('/dashboard/wallet')}
            className="flex-1 py-2 bg-[#24262b] rounded-md text-[15px] text-gray-300 hover:bg-[#2d3036] cursor-pointer transition-colors"
          >
            {tr('transfer')}
          </button>
        </div>

        {orderType === "Market" && (
          <div className="pt-2 flex flex-col gap-1 border-t border-white/5 mt-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500 border-b border-dotted border-gray-700">
                {lang === 'Esp' ? 'Balance USDT' : 'USDT Balance'}
              </span>
              <span className="text-white font-medium">{usdtBalance} USDT</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500 border-b border-dotted border-gray-700">
                {assetBase} {tr('balance')}
              </span>
              <span className="text-white font-medium">{assetBalance} {assetBase}</span>
            </div>
          </div>
        )}
      </div>
      <SettingsModal
        isOpen={isSettingOpen}
        onClose={() => setIsSettingOpen(false)}
      />
    </div>
  );
}
