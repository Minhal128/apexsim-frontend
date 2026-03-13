"use client";
import React from 'react';
import { FaCaretDown } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { LuSettings2 } from "react-icons/lu";
import { useState } from 'react';

const ORDER_DATA = [
    { price: 19967.98, amount: "0.10016", total: "1,999.99288", depth: 20, type: 'sell' },
    { price: 19967.69, amount: "0.00100", total: "19.96769", depth: 2, type: 'sell' },
    { price: 19967.66, amount: "0.00066", total: "13.17866", depth: 2, type: 'sell' },
    { price: 19967.61, amount: "0.27769", total: "5,544.80562", depth: 40, type: 'sell' },
    { price: 19967.60, amount: "0.01961", total: "391.56464", depth: 8, type: 'sell' },
    { price: 19967.59, amount: "0.73579", total: "14,691.95305", depth: 90, type: 'sell' },
    { price: 19967.58, amount: "0.09455", total: "1,887.93469", depth: 15, type: 'sell' },
    { price: 19967.57, amount: "0.05009", total: "1,000.17558", depth: 10, type: 'sell' },
    { price: 19967.56, amount: "0.10016", total: "1,999.95081", depth: 20, type: 'sell' },
    { price: 19967.43, amount: "0.02000", total: "399.34860", depth: 5, type: 'sell' },
    { price: 19967.42, amount: "0.16787", total: "3,351.93080", depth: 25, type: 'sell' },
    { price: 19967.36, amount: "0.04000", total: "798.69440", depth: 8, type: 'sell' },
    { price: 19967.11, amount: "0.00130", total: "25.95724", depth: 2, type: 'sell' },
    { price: 19967.10, amount: "0.18559", total: "3,705.69409", depth: 30, type: 'sell' },
    { price: 19966.99, amount: "0.00200", total: "39.93398", depth: 5, type: 'buy' },
    { price: 19966.98, amount: "0.52856", total: "10,553.74695", depth: 70, type: 'buy' },
    { price: 19966.56, amount: "0.00066", total: "13.17793", depth: 2, type: 'buy' },
    { price: 19966.52, amount: "0.00250", total: "49.91630", depth: 4, type: 'buy' },
    { price: 19966.52, amount: "0.00250", total: "49.91630", depth: 4, type: 'buy' },
    { price: 19966.52, amount: "0.00250", total: "49.91630", depth: 4, type: 'buy' },
    { price: 19966.52, amount: "0.00250", total: "49.91630", depth: 4, type: 'buy' },
    { price: 19966.52, amount: "0.00250", total: "49.91630", depth: 4, type: 'buy' },
    { price: 19966.52, amount: "0.00250", total: "49.91630", depth: 4, type: 'buy' },
];

interface FutureTradingBookProps {
    symbol?: string;
    currentPrice?: number;
}

type OrderBookEntry = {
    price: number;
    amount: string;
    total: string;
    depth: number;
    type: 'buy' | 'sell';
};

type RecentTradeEntry = {
    price: number;
    amount: string;
    time: string;
    side: 'buy' | 'sell';
};

function generateOrderBookData(basePrice: number): OrderBookEntry[] {
    const data: OrderBookEntry[] = [];
    const spread = basePrice * 0.0001;

    for (let i = 14; i > 0; i--) {
        const price = basePrice + spread + (i * basePrice * 0.00005);
        const amount = (Math.random() * 2).toFixed(4);
        data.push({
            price,
            amount,
            total: (price * parseFloat(amount)).toLocaleString('en-US', { maximumFractionDigits: 2 }),
            depth: Math.floor(Math.random() * 80) + 10,
            type: 'sell',
        });
    }

    for (let i = 0; i < 15; i++) {
        const price = basePrice - spread - (i * basePrice * 0.00005);
        const amount = (Math.random() * 2).toFixed(4);
        data.push({
            price,
            amount,
            total: (price * parseFloat(amount)).toLocaleString('en-US', { maximumFractionDigits: 2 }),
            depth: Math.floor(Math.random() * 80) + 10,
            type: 'buy',
        });
    }
    return data;
}

function generateRecentTradesData(basePrice: number): RecentTradeEntry[] {
    const data: RecentTradeEntry[] = [];
    const spread = basePrice * 0.0001;
    for (let i = 0; i < 30; i++) {
        const price = basePrice + (Math.random() * spread * 2 - spread);
        const amount = (Math.random() * 2).toFixed(4);
        const date = new Date(Date.now() - i * 5000);
        data.push({
            price,
            amount,
            time: date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            side: Math.random() > 0.5 ? 'buy' : 'sell',
        });
    }
    return data;
}

export default function FutureTradingBook({ symbol = "BTC/USDT", currentPrice }: FutureTradingBookProps) {
    const asset = symbol.split('/')[0];
    const basePrice = currentPrice || 88200.84;
    const [activeTab, setActiveTab] = useState<'Order books' | 'Last trades'>('Order books');

    // Initialized empty — populated client-side only to avoid SSR/hydration mismatch
    // (Math.random() and toLocaleString produce different values on server vs client)
    const [orderBookData, setOrderBookData] = useState<OrderBookEntry[]>([]);
    const [recentTradesData, setRecentTradesData] = useState<RecentTradeEntry[]>([]);

    React.useEffect(() => {
        setOrderBookData(generateOrderBookData(basePrice));
        setRecentTradesData(generateRecentTradesData(basePrice));
    }, [basePrice]);

    return (
        <div className="w-full md:w-[320px] flex flex-col bg-[#181818] border-x border-white/5 h-full md:h-137.5 select-none">
            {/* ... header and tabs ... */}
            <div className="flex items-center justify-between px-3 h-10 shrink-0 border-b border-white/5">
                <div className="flex gap-4 h-full items-center">
                    <div
                        onClick={() => setActiveTab('Order books')}
                        className="relative h-full flex items-center cursor-pointer group"
                    >
                        <span className={`text-[12px] md:text-[13px] font-medium transition-colors ${activeTab === 'Order books' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                            Order books
                        </span>
                        {activeTab === 'Order books' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00B595]" />
                        )}
                    </div>

                    <div
                        onClick={() => setActiveTab('Last trades')}
                        className="relative h-full flex items-center cursor-pointer group"
                    >
                        <span className={`text-[12px] md:text-[13px] font-medium transition-colors ${activeTab === 'Last trades' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                            Last trades
                        </span>
                        {activeTab === 'Last trades' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00B595]" />
                        )}
                    </div>
                </div>
                <LuSettings2 size={16} className="text-gray-400 cursor-pointer hover:text-white" />
            </div>

            <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3.5">
                    <svg width="14" height="14" viewBox="0 0 16 16" className="text-[#00B595] cursor-pointer">
                        <rect x="2" y="2" width="5" height="5" fill="currentColor" rx="0.5" />
                        <rect x="9" y="2" width="5" height="5" fill="currentColor" rx="0.5" />
                        <rect x="2" y="9" width="5" height="5" fill="currentColor" rx="0.5" opacity="0.5" />
                        <rect x="9" y="9" width="5" height="5" fill="currentColor" rx="0.5" opacity="0.5" />
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 16 16" className="text-gray-600 cursor-pointer hover:text-gray-400">
                        <rect x="2" y="2" width="12" height="5" fill="currentColor" rx="0.5" />
                        <rect x="2" y="9" width="12" height="5" fill="currentColor" rx="0.5" opacity="0.5" />
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 16 16" className="text-gray-600 cursor-pointer hover:text-gray-400">
                        <rect x="2" y="2" width="12" height="5" fill="currentColor" rx="0.5" opacity="0.5" />
                        <rect x="2" y="9" width="12" height="5" fill="currentColor" rx="0.5" />
                    </svg>
                </div>

                <div className="flex items-center gap-1.5">
                    <div className="bg-[#24262b] pl-2 pr-1.5 py-0.5 rounded flex items-center gap-3 cursor-pointer hover:bg-[#2d3036] border border-white/5">
                        <span className="text-[10px] text-gray-300">0.01</span>
                        <FaCaretDown size={10} className="text-gray-500" />
                    </div>
                    <BsThreeDotsVertical className="text-gray-500 cursor-pointer hover:text-white" size={14} />
                </div>
            </div>

            {activeTab === 'Order books' ? (
                <>
                    <div className="grid grid-cols-3 text-[10px] text-gray-500 px-3 pb-1 font-medium border-b border-white/5 lg:border-none">
                        <span>Price(USDT)</span>
                        <span className="text-right">Amount({asset})</span>
                        <span className="text-right">Total</span>
                    </div>

                    <div className="grow no-scrollbar pb-2 max-h-100 md:max-h-none overflow-y-auto">
                        {orderBookData.map((item, i) => (
                            <div
                                key={i}
                                className={`relative grid grid-cols-3 text-[11px] py-0.75 px-3 hover:bg-white/5 cursor-pointer group ${item.type === 'buy' && orderBookData[i - 1]?.type === 'sell' ? 'mt-2 border-y border-white/5 py-2 bg-white/2' : ''}`}
                            >
                                <div
                                    className={`absolute right-0 top-0 h-full transition-all duration-300 ${item.type === 'sell' ? 'bg-[#ef5350]/10' : 'bg-[#00B595]/10'}`}
                                    style={{ width: `${item.depth}%` }}
                                />

                                <span className={`font-medium z-10 ${item.type === 'sell' ? 'text-[#ef5350]' : 'text-[#00B595]'}`}>
                                    {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>

                                <span className="text-right text-[#c9ccd0] z-10 font-medium tracking-tight">
                                    {item.amount}
                                </span>

                                <span className="text-right text-[#848e9c] z-10 font-medium tabular-nums">
                                    {item.total}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-3 text-[10px] text-gray-500 px-3 pb-1 uppercase font-medium border-b border-white/5 lg:border-none">
                        <span>Price(USDT)</span>
                        <span className="text-right">Amount({asset})</span>
                        <span className="text-right">Time</span>
                    </div>

                    <div className="grow no-scrollbar pb-2 max-h-100 md:max-h-none overflow-y-auto">
                        {recentTradesData.map((item, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-3 text-[11px] py-[2.5px] px-3 hover:bg-white/5 cursor-pointer"
                            >
                                <span className={`font-medium ${item.side === 'sell' ? 'text-[#F6465D]' : 'text-[#2EBD85]'}`}>
                                    {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-right text-[#c9ccd0] font-medium tracking-tight">
                                    {item.amount}
                                </span>
                                <span className="text-right text-[#848e9c] font-medium tabular-nums">
                                    {item.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}