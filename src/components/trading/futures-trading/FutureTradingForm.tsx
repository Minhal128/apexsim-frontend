"use client";
import React, { useState, useEffect, useRef } from 'react';
import { FaPlusCircle, FaCaretDown } from "react-icons/fa";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { RiSettingsFill } from "react-icons/ri";
import { FaCalculator } from "react-icons/fa";
import TradingCalculator from './CalculatorModel';
import PreferenceModal from './PreferenceModel';
import LeverageModal from './LeverageModel';
import MarginModeModal from './MarginModeModel';
import { apiRequest } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useToast } from "@/components/ToastContext";
import { useRouter } from 'next/navigation';
import TransferModal from '@/components/wallet/TransferModal';
import { APP_LANGUAGE_EVENT, AppLanguageCode, getAppLanguage, t } from '@/lib/i18n';

type OrderType = "Limit order" | "Market order" | "Stop order";

interface FutureTradingFormProps {
    symbol?: string;
    balance?: string;
    onSizeChange?: (size: string) => void;
    externalSize?: string;
    currentPrice?: number;
}

let globalHasWarnedEmptyWallet = false;

export default function TradeForm({ symbol = "BTC/USDT", balance, onSizeChange, externalSize, currentPrice }: FutureTradingFormProps) {
    const toast = useToast();
    const router = useRouter();
    const [showTransfer, setShowTransfer] = useState(false);
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [tab, setTab] = useState<"Open" | "Close">("Open");
    const [orderType, setOrderType] = useState<OrderType>("Limit order");
    const [isCalcOpen, setIsCalcOpen] = useState(false);
    const [leverage, setLeverage] = useState(5);
    const [marginMode, setMarginMode] = useState<"cross" | "isolated">("cross");
    const [price, setPrice] = useState("");
    const [size, setSize] = useState("");
    const [total, setTotal] = useState("");
    const [usdtBalance, setUsdtBalance] = useState("0");
    const [userId, setUserId] = useState<string | null>(null);
    const [loadingAction, setLoadingAction] = useState<"long" | "short" | "close" | null>(null);
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

    useEffect(() => {
        apiRequest('/profile/me').then(data => setUserId(data._id)).catch(console.error);
    }, []);
    const [positions, setPositions] = useState<any[]>([]);

    const [isLeverageOpen, setIsLeverageOpen] = useState(false);
    const [isMarginModeOpen, setIsMarginModeOpen] = useState(false);
    const handleOpenLeverageFromPreference = () => {
        setIsSettingOpen(false);
        setIsLeverageOpen(true);
    };

    const handleLeverageConfirm = () => {
        setIsLeverageOpen(false);
        setIsMarginModeOpen(true);
    };

    // Fetch user balance and positions
    useEffect(() => {
        fetchBalance();
        fetchPositions();

        const socket = getSocket();
        if (!socket) return;
        
        const handleWalletUpdate = (data: any) => {
            if (userId && data.userId === userId) {
                const balancesArray = data.wallet?.futuresBalances || data.futuresBalances || [];
                const usdt = balancesArray.find((b: any) => b.asset === "USDT")?.amount || 0;
                setUsdtBalance(usdt.toFixed(2));
            }
        };
        
        socket.on('wallet-update', handleWalletUpdate);
        
        return () => {
            socket.off('wallet-update', handleWalletUpdate);
        };
    }, [balance, userId]);

    const fetchBalance = async () => {
        try {
            const data = await apiRequest("/wallet");
            const balancesArray = data.wallet?.futuresBalances || data.futuresBalances || [];
            const usdt = balancesArray.find((b: any) => b.asset === "USDT")?.amount || 0;
            setUsdtBalance(usdt.toFixed(2));
            if (usdt === 0 && !globalHasWarnedEmptyWallet) {
                globalHasWarnedEmptyWallet = true;
                toast.addToast("Your futures wallet is empty. Please transfer money from your Spot wallet.", "warning");
                setShowTransfer(true); // Optional: if you have a transfer modal
            }
        } catch (err) {
            console.error("Failed to fetch balance:", err);
        }
    };

    useEffect(() => {
        // Reset price and size when symbol changes. 
        // This will allow the currentPrice effect below to grab the fresh price.
        setPrice("");
        setSize("");
    }, [symbol]);

    useEffect(() => {
        // If price is empty, populate it with currentPrice.
        // Also ensure if we switch back to a Limit/Stop order we auto-fill.
        if (currentPrice && !price && orderType !== "Market order") {
            setPrice(currentPrice.toString());
        }
    }, [currentPrice, orderType, price]);

    useEffect(() => {
        if (externalSize !== undefined) {
            setSize(externalSize);
        }
    }, [externalSize]);

    const handleSizeChange = (val: string) => {
        setSize(val);
        onSizeChange?.(val);
    };

    const fetchPositions = async () => {
        try {
            const data = await apiRequest("/trading/positions");
            setPositions(data);
        } catch (err) {
            console.error("Failed to fetch positions:", err);
        }
    };

    // Calculate total based on price and size
    useEffect(() => {
        if (price && size) {
            const totalValue = (parseFloat(price) * parseFloat(size) / leverage).toFixed(2);
            setTotal(totalValue);
        }
    }, [price, size, leverage]);

    const handleOpenPosition = async (type: "long" | "short") => {
        const orderPrice = orderType === "Market order" ? (parseFloat(price) || currentPrice) : parseFloat(price);

        if (!orderPrice || orderPrice <= 0 || !size || parseFloat(size) <= 0) {
            toast.addToast(`Please enter valid ${orderType === "Market order" ? "" : "price and "}size`, "error");
            return;
        }

        setLoadingAction(type);
        try {
            await apiRequest("/trading/order", {
                method: "POST",
                body: JSON.stringify({
                    symbol: symbol,
                    type: type === "long" ? "buy" : "sell",
                    marketType: "futures",
                    price: orderPrice,
                    amount: parseFloat(size),
                    leverage: leverage,
                    marginMode: marginMode,
                    orderType: orderType === "Market order" ? "market" : "limit"
                }),
            });
            fetchBalance();
            fetchPositions();
            if (orderType !== "Market order") setPrice("");
            setSize("");
            setTotal("");
            toast.addToast(`${type.toUpperCase()} position opened successfully!`, "success");
        } catch (err: any) {
            toast.addToast(err.message || "Failed to open position", "error");
        } finally {
            setLoadingAction(null);
        }
    };

    const handleClosePosition = async () => {
        if (!size || parseFloat(size) <= 0) {
            toast.addToast("Please enter valid size", "error");
            return;
        }

        const closePrice = parseFloat(price) || currentPrice;
        if (!closePrice || closePrice <= 0) {
            toast.addToast("Please enter valid price or wait for market price", "error");
            return;
        }

        setLoadingAction("close");
        try {
            const position = positions.find(p => p.symbol === symbol);
            if (!position) {
                toast.addToast("No position found for this symbol", "error");
                return;
            }

            await apiRequest("/trading/order", {
                method: "POST",
                body: JSON.stringify({
                    symbol: symbol,
                    type: position.quantity > 0 ? "sell" : "buy",
                    marketType: "futures",
                    price: closePrice,
                    amount: parseFloat(size),
                    leverage: leverage,
                    marginMode: marginMode,
                    orderType: "market", // Close is usually market or custom price
                    action: "close"
                }),
            });
            fetchBalance();
            fetchPositions();
            setPrice("");
            setSize("");
            toast.addToast("Position closed successfully!", "success");
        } catch (err: any) {
            toast.addToast(err.message || "Failed to close position", "error");
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <div className="w-full md:w-[320px] bg-[#181818] p-4 flex flex-col gap-4 h-auto select-none font-sans text-gray-300 md:relative">

            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-1 gap-2">
                    <div className="flex-1 flex items-center justify-between bg-[#24262b] px-3 py-1.5 rounded cursor-pointer border border-transparent hover:border-white/10"
                        onClick={() => setIsMarginModeOpen(true)}>
                        <span className="text-sm font-medium">{marginMode === "cross" ? tr('cross') : tr('isolated')}</span>
                        <FaCaretDown size={12} className="text-gray-500" />
                    </div>
                    <div
                        onClick={() => setIsLeverageOpen(true)}
                        className="flex-1 flex items-center justify-between bg-[#24262b] px-3 py-1.5 rounded cursor-pointer border border-transparent hover:border-white/10 transition-colors"
                    >
                        <span className="text-sm font-medium">{leverage}x</span>
                        <FaCaretDown size={12} className="text-gray-500" />
                    </div>
                </div>
            </div>

            <div className="flex bg-[#24262b] rounded-md ">
                <button onClick={() => setTab('Open')} className={`flex-1 py-1.5 text-sm font-semibold rounded cursor-pointer transition-all active:scale-[0.98] ${tab === 'Open' ? 'bg-[#00B595] text-white' : 'text-gray-400'}`}>{tr('open')}</button>
                <button onClick={() => setTab('Close')} className={`flex-1 py-1.5 text-sm font-semibold rounded cursor-pointer transition-all active:scale-[0.98] ${tab === 'Close' ? 'bg-[#00B595] text-white' : 'text-gray-400'}`}>{tr('close')}</button>
            </div>

            <div className="flex justify-between items-center text-[12px] font-medium text-gray-500 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar whitespace-nowrap gap-4">
                {(["Limit order", "Market order", "Stop order"] as OrderType[]).map((tVal) => (
                    <span key={tVal} onClick={() => setOrderType(tVal)} className={`cursor-pointer transition-colors pb-1 ${orderType === tVal ? 'text-white border-b border-[#00B595]' : 'hover:text-gray-300'}`}>{tVal === 'Limit order' ? tr('limitOrder') : tVal === 'Market order' ? tr('marketOrder') : tr('stopOrder')}</span>
                ))}
            </div>

            <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5"><span className="text-gray-500">{tr('avbl')}</span><span className="text-white">{usdtBalance} USDT</span></div>
                <HiOutlineSwitchHorizontal size={14} className="text-[#00B595] cursor-pointer" />
            </div>

            {tab === "Open" && (
                <div className="space-y-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={orderType === "Market order" ? tr('marketPrice') : `${tr('price')} (${symbol.split('/')[1] || "USDT"})`}
                            value={orderType === "Market order" ? `~${currentPrice || 0} ${symbol.split('/')[1] || "USDT"}` : price}
                            disabled={orderType === "Market order"}
                            onChange={(e) => setPrice(e.target.value)}
                            className={`w-full bg-[#1E2023] border border-white/5 rounded-md p-2.5 text-sm outline-none focus:border-[#00B595] ${orderType === "Market order" ? "opacity-50 cursor-not-allowed" : ""}`}
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={`${tr('size')} (${symbol.split('/')[0]})`}
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full bg-[#1E2023] border border-white/5 rounded-md p-2.5 text-sm outline-none focus:border-[#00B595]"
                        />
                    </div>
                </div>
            )}

            {tab === "Close" && positions.length > 0 && (
                <div className="space-y-3">
                    <div className="bg-[#24262b] p-2 rounded text-sm">
                          <p className="text-gray-400">{tr('currentPosition')}: {positions.find(p => p.symbol === symbol)?.quantity || 0} {symbol.split('/')[0]}</p>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={orderType === "Market order" ? tr('marketPrice') : `${tr('price')} (${symbol.split('/')[1] || "USDT"})`}
                            value={orderType === "Market order" ? `~${currentPrice || 0} ${symbol.split('/')[1] || "USDT"}` : price}
                            disabled={orderType === "Market order"}
                            onChange={(e) => setPrice(e.target.value)}
                            className={`w-full bg-[#1E2023] border border-white/5 rounded-md p-2.5 text-sm outline-none focus:border-[#00B595] ${orderType === "Market order" ? "opacity-50 cursor-not-allowed" : ""}`}
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={`${tr('size')} (${symbol.split('/')[0]})`}
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full bg-[#1E2023] border border-white/5 rounded-md p-2.5 text-sm outline-none focus:border-[#00B595]"
                        />
                    </div>
                </div>
            )}

            <div className="relative h-6 flex items-center px-1 cursor-pointer my-4">
                {(() => {
                    const balanceNum = parseFloat(usdtBalance) || 0;
                    const priceNum = parseFloat(price) || 0;
                    
                    let maxAmount = 0;
                    if (priceNum > 0) {
                        maxAmount = (balanceNum * leverage) / priceNum;
                    }

                    const currentPercent = maxAmount > 0 ? ((parseFloat(size) || 0) / maxAmount) * 100 : 0;
                    const fillPercent = Math.min(Math.max(currentPercent, 0), 100);

                    return (
                      <>
                        <div className="absolute w-[calc(100%-8px)] h-[3px] bg-[#2b3139] rounded" />
                        <div className={`absolute h-[3px] rounded transition-all ${tab === 'Open' ? 'bg-[#0eb27e]' : 'bg-[#db4658]'}`} style={{ width: `calc(${fillPercent}% - 8px)` }} />
                        <div className="absolute w-[calc(100%-8px)] flex justify-between z-10 left-1">
                          {[0, 25, 50, 75, 100].map((percent) => {
                            const isFilled = fillPercent >= percent;
                            return (
                              <div
                                key={percent}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (maxAmount > 0) {
                                    const newSize = (maxAmount * (percent / 100));
                                    setSize(newSize > 0 ? newSize.toFixed(4).replace(/\.?0+$/, '') : "");
                                  }
                                }}
                                className={`w-3.5 h-3.5 rotate-45 rounded-[2px] transition-all
                                  ${isFilled 
                                    ? (tab === 'Open' ? 'bg-[#0eb27e]' : 'bg-[#db4658]') 
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
                                  const newSize = (maxAmount * (pct / 100));
                                  setSize(newSize > 0 ? newSize.toFixed(4).replace(/\.?0+$/, '') : "");
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
                    placeholder='Total'
                    value={price && size ? (parseFloat(price) * parseFloat(size)).toFixed(2) : ""}
                    readOnly
                    className="w-full bg-[#1E2023] border border-white/5 rounded-md p-2.5 text-sm outline-none"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-1 text-[13px] text-gray-300 cursor-pointer hover:text-white">
                    <span className="font-semibold">{tr('advancedOptions')}</span>
                    <FaCaretDown size={12} className="text-gray-500" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px] bg-[#24262b]/30 p-2 rounded">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[#00B595] font-medium">{tr('maxBuy')}</span>
                        <span className="text-white font-mono">
                            {price && parseFloat(price) > 0
                                ? (parseFloat(usdtBalance) * leverage / parseFloat(price)).toFixed(4)
                                : "0.0000"} {symbol.split('/')[0]}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-right">
                        <span className="text-[#ef5350] font-medium">{tr('maxSell')}</span>
                        <span className="text-white font-mono">
                            {price && parseFloat(price) > 0
                                ? (parseFloat(usdtBalance) * leverage / parseFloat(price)).toFixed(4)
                                : "0.0000"} {symbol.split('/')[0]}
                        </span>
                    </div>
                </div>
            </div>

            {tab === "Open" && (
                <div className="flex gap-3">
                    <button
                        onClick={() => handleOpenPosition("long")}
                        disabled={loadingAction !== null}
                        className="flex-1 py-3 bg-[#00B595] text-white rounded font-bold text-sm cursor-pointer active:scale-95 transition-all shadow-lg shadow-[#00B595]/10 disabled:opacity-50"
                    >
                        {loadingAction === "long" ? tr('opening') : tr('openLong')}
                    </button>
                    <button
                        onClick={() => handleOpenPosition("short")}
                        disabled={loadingAction !== null}
                        className="flex-1 py-3 bg-[#ef5350] text-white rounded font-bold text-sm cursor-pointer active:scale-95 transition-all shadow-lg shadow-[#ef5350]/10 disabled:opacity-50"
                    >
                        {loadingAction === "short" ? tr('opening') : tr('openShort')}
                    </button>
                </div>
            )}

            {tab === "Close" && (
                <button
                    onClick={handleClosePosition}
                    disabled={loadingAction !== null || positions.length === 0}
                    className="w-full py-3 bg-[#00B595] text-white rounded font-bold text-sm cursor-pointer active:scale-95 transition-all shadow-lg shadow-[#00B595]/10 disabled:opacity-50"
                >
                    {loadingAction === "close" ? tr('closing') : tr('closePosition')}
                </button>
            )}

            <div className="pt-4 border-t border-white/5 space-y-2.5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{tr('assetBalance')}</h3>
                <div className="space-y-2">
                    {[{ label: tr('totalBalance'), value: `${usdtBalance} USDT` }, { label: tr('walletBalance'), value: `${usdtBalance} USDT` }, { label: tr('unrealizedPnl'), value: "0.00 USDT" }].map((item) => (
                        <div key={item.label} className="flex justify-between text-[12px]">
                            <span className="text-gray-500 underline decoration-gray-700 decoration-dotted underline-offset-4">{item.label}</span>
                            <span className="text-white font-medium">{item.value}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 pt-2">
                    <button 
                      type="button"
                      onClick={() => router.push('/dashboard/deposit')}
                      className="flex-1 py-2 bg-[#24262b] hover:bg-[#2d3036] rounded text-[12px] font-semibold cursor-pointer active:scale-95 transition-colors"
                    >
                      {tr('deposit')}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowTransfer(true)}
                      className="flex-1 py-2 bg-[#24262b] hover:bg-[#2d3036] rounded text-[12px] font-semibold cursor-pointer active:scale-95 transition-colors"
                    >
                      {tr('transfer')}
                    </button>
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2 pb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{tr('contractInfo')}</h3>
                <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">{tr('symbol')}</span><span className="text-white">{symbol}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">{tr('expiry')}</span><span className="text-white">{tr('perpetual')}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">Leverage</span><span className="text-white">{leverage}x</span>
                </div>
                <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">{tr('mode')}</span><span className="text-white capitalize">{marginMode === 'cross' ? tr('cross') : tr('isolated')}</span>
                </div>
            </div>

            <TradingCalculator
                isOpen={isCalcOpen}
                onClose={() => setIsCalcOpen(false)}
            />
            <PreferenceModal
                isOpen={isSettingOpen}
                onClose={() => setIsSettingOpen(false)}
                onLeverageClick={handleOpenLeverageFromPreference}
            />
            <LeverageModal
                isOpen={isLeverageOpen}
                onClose={() => setIsLeverageOpen(false)}
                onConfirm={() => {
                    handleLeverageConfirm();
                }}
            />
            <MarginModeModal
                isOpen={isMarginModeOpen}
                onClose={() => setIsMarginModeOpen(false)}
            />
            {showTransfer && (
                <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} />
            )}
        </div>
    );
}