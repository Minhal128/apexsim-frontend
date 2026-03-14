"use client";
import React, { useState, useEffect } from 'react';
import { FaPlusCircle, FaCaretDown } from "react-icons/fa";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { RiSettingsFill } from "react-icons/ri";
import SettingsModal from '../spot-trading/TradingSetting';
import { FaCalculator } from "react-icons/fa";
import TradingCalculator from './CalculatorModel';
import PreferenceModal from './PreferenceModel';
import LeverageModal from './LeverageModel';
import MarginModeModal from './MarginModeModel';
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ToastContext";
import { useRouter } from 'next/navigation';
import TransferModal from '@/components/wallet/TransferModal';

type OrderType = "Limit order" | "Market order" | "Stop order";

interface FutureTradingFormProps {
    symbol?: string;
    balance?: string;
    onSizeChange?: (size: string) => void;
    externalSize?: string;
    currentPrice?: number;
}

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
    const [loading, setLoading] = useState(false);
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
    }, [balance]);

    const fetchBalance = async () => {
        if (balance && balance !== "0.00") {
            setUsdtBalance(balance);
            return;
        }
        try {
            const data = await apiRequest("/wallet");
            const usdt = data.balances?.find((b: any) => b.asset === "USDT")?.amount || 0;
            setUsdtBalance(usdt.toFixed(2));
        } catch (err) {
            console.error("Failed to fetch balance:", err);
        }
    };

    useEffect(() => {
        if (currentPrice && !price && orderType !== "Market order") {
            setPrice(currentPrice.toString());
        }
    }, [currentPrice, orderType]);

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

        setLoading(true);
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
            setLoading(false);
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

        setLoading(true);
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
            setLoading(false);
        }
    };

    return (
        <div className="w-full md:w-[320px] bg-[#181818] p-4 flex flex-col gap-4 h-auto select-none font-sans text-gray-300 md:relative">

            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-1 gap-2">
                    <div className="flex-1 flex items-center justify-between bg-[#24262b] px-3 py-1.5 rounded cursor-pointer border border-transparent hover:border-white/10"
                        onClick={() => setIsMarginModeOpen(true)}>
                        <span className="text-sm font-medium">{marginMode === "cross" ? "Cross" : "Isolated"}</span>
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

                <div className="md:absolute md:right-5 md:-top-14 flex items-center gap-3 ml-1">
                    <FaCalculator
                        onClick={() => setIsCalcOpen(true)}
                        size={18}
                        className="cursor-pointer text-white hover:text-white transition-colors"
                    />
                    <RiSettingsFill
                        onClick={() => setIsSettingOpen(true)}
                        size={20}
                        className="cursor-pointer text-white hover:text-white transition-colors"
                    />
                </div>
            </div>

            <div className="flex bg-[#24262b] rounded-md ">
                <button onClick={() => setTab('Open')} className={`flex-1 py-1.5 text-sm font-semibold rounded cursor-pointer transition-all active:scale-[0.98] ${tab === 'Open' ? 'bg-[#00B595] text-white' : 'text-gray-400'}`}>Open</button>
                <button onClick={() => setTab('Close')} className={`flex-1 py-1.5 text-sm font-semibold rounded cursor-pointer transition-all active:scale-[0.98] ${tab === 'Close' ? 'bg-[#00B595] text-white' : 'text-gray-400'}`}>Close</button>
            </div>

            <div className="flex justify-between items-center text-[12px] font-medium text-gray-500 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar whitespace-nowrap gap-4">
                {(["Limit order", "Market order", "Stop order"] as OrderType[]).map((t) => (
                    <span key={t} onClick={() => setOrderType(t)} className={`cursor-pointer transition-colors pb-1 ${orderType === t ? 'text-white border-b border-[#00B595]' : 'hover:text-gray-300'}`}>{t}</span>
                ))}
            </div>

            <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5"><span className="text-gray-500">Avbl</span><span className="text-white">{usdtBalance} USDT</span></div>
                <HiOutlineSwitchHorizontal size={14} className="text-[#00B595] cursor-pointer" />
            </div>

            {tab === "Open" && (
                <div className="space-y-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={orderType === "Market order" ? "Market Price" : "Price"}
                            value={orderType === "Market order" ? "" : price}
                            disabled={orderType === "Market order"}
                            onChange={(e) => setPrice(e.target.value)}
                            className={`w-full bg-[#1E2023] border border-white/5 rounded-md p-2.5 text-sm outline-none focus:border-[#00B595] ${orderType === "Market order" ? "opacity-50 cursor-not-allowed" : ""}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-500">USDT</span>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder='Size'
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full bg-[#1E2023] border border-white/5 rounded-md p-2.5 text-sm outline-none focus:border-[#00B595]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-500">{symbol.split('/')[0]}</span>
                    </div>
                </div>
            )}

            {tab === "Close" && positions.length > 0 && (
                <div className="space-y-3">
                    <div className="bg-[#24262b] p-2 rounded text-sm">
                        <p className="text-gray-400">Current Position: {positions.find(p => p.symbol === symbol)?.quantity || 0} BTC</p>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder='Price'
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-[#1E2023] border border-white/5 rounded-md p-2.5 text-sm outline-none focus:border-[#00B595]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-500">USDT</span>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder='Size'
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full bg-[#1E2023] border border-white/5 rounded-md p-2.5 text-sm outline-none focus:border-[#00B595]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-500">{symbol.split('/')[0]}</span>
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
                    <span className="font-semibold">Advanced options</span>
                    <FaCaretDown size={12} className="text-gray-500" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px] bg-[#24262b]/30 p-2 rounded">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[#00B595] font-medium">Max Buy</span>
                        <span className="text-white font-mono">
                            {price && parseFloat(price) > 0
                                ? (parseFloat(usdtBalance) * leverage / parseFloat(price)).toFixed(4)
                                : "0.0000"} {symbol.split('/')[0]}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-right">
                        <span className="text-[#ef5350] font-medium">Max Sell</span>
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
                        disabled={loading}
                        className="flex-1 py-3 bg-[#00B595] text-white rounded font-bold text-sm cursor-pointer active:scale-95 transition-all shadow-lg shadow-[#00B595]/10 disabled:opacity-50"
                    >
                        {loading ? "Opening..." : "Open long"}
                    </button>
                    <button
                        onClick={() => handleOpenPosition("short")}
                        disabled={loading}
                        className="flex-1 py-3 bg-[#ef5350] text-white rounded font-bold text-sm cursor-pointer active:scale-95 transition-all shadow-lg shadow-[#ef5350]/10 disabled:opacity-50"
                    >
                        {loading ? "Opening..." : "Open short"}
                    </button>
                </div>
            )}

            {tab === "Close" && (
                <button
                    onClick={handleClosePosition}
                    disabled={loading || positions.length === 0}
                    className="w-full py-3 bg-[#00B595] text-white rounded font-bold text-sm cursor-pointer active:scale-95 transition-all shadow-lg shadow-[#00B595]/10 disabled:opacity-50"
                >
                    {loading ? "Closing..." : "Close Position"}
                </button>
            )}

            <div className="pt-4 border-t border-white/5 space-y-2.5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Asset Balance</h3>
                <div className="space-y-2">
                    {[{ label: "Total Balance", value: `${usdtBalance} USDT` }, { label: "Wallet Balance", value: `${usdtBalance} USDT` }, { label: "Unrealized PnL", value: "0.00 USDT" }].map((item) => (
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
                      Deposit
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowTransfer(true)}
                      className="flex-1 py-2 bg-[#24262b] hover:bg-[#2d3036] rounded text-[12px] font-semibold cursor-pointer active:scale-95 transition-colors"
                    >
                      Transfer
                    </button>
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2 pb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contract Info</h3>
                <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">Symbol</span><span className="text-white">{symbol}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">Expiry</span><span className="text-white">Perpetual</span>
                </div>
                <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">Leverage</span><span className="text-white">{leverage}x</span>
                </div>
                <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">Mode</span><span className="text-white capitalize">{marginMode}</span>
                </div>
            </div>

            <SettingsModal
                isOpen={isSettingOpen}
                onClose={() => setIsSettingOpen(false)}
            />
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