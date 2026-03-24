"use client";
import React from 'react';
import { FaCaretDown } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { LuSettings2 } from "react-icons/lu";
import { useState } from 'react';

const RECENT_TRADES_DATA = [
    { price: 19967.98, amount: "0.10016", time: "19:59:01", side: 'sell' },
    { price: 19967.69, amount: "0.00100", time: "19:59:00", side: 'sell' },
    { price: 19967.66, amount: "0.00066", time: "19:58:59", side: 'sell' },
    { price: 19967.61, amount: "0.27769", time: "19:58:58", side: 'sell' },
    { price: 19967.60, amount: "0.01961", time: "19:58:57", side: 'buy' },
    { price: 19967.59, amount: "0.73579", time: "19:58:56", side: 'buy' },
    { price: 19967.58, amount: "0.09455", time: "19:58:55", side: 'sell' },
    { price: 19967.57, amount: "0.05009", time: "19:58:54", side: 'buy' },
    { price: 19967.56, amount: "0.10016", time: "19:58:53", side: 'buy' },
    { price: 19967.43, amount: "0.02000", time: "19:58:52", side: 'sell' },
    { price: 19967.42, amount: "0.16787", time: "19:58:51", side: 'buy' },
    { price: 19967.36, amount: "0.04000", time: "19:58:50", side: 'sell' },
    { price: 19967.11, amount: "0.00130", time: "19:58:49", side: 'buy' },
    { price: 19967.10, amount: "0.18559", time: "19:58:48", side: 'buy' },
    { price: 19966.99, amount: "0.00200", time: "19:58:47", side: 'sell' },
    { price: 19966.98, amount: "0.52856", time: "19:58:46", side: 'buy' },
    { price: 19966.56, amount: "0.00066", time: "19:58:45", side: 'sell' },
    { price: 19966.52, amount: "0.00250", time: "19:58:44", side: 'buy' },
    { price: 19966.48, amount: "0.01100", time: "19:58:43", side: 'sell' },
    { price: 19966.32, amount: "0.03450", time: "19:58:42", side: 'buy' },
    { price: 19966.20, amount: "0.00750", time: "19:58:41", side: 'sell' },
    { price: 19966.10, amount: "0.22000", time: "19:58:40", side: 'buy' },
    { price: 19965.98, amount: "0.00400", time: "19:58:39", side: 'sell' },
];

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

export default function OrderBook({ symbol = "BTC/USDT", currentPrice }: { symbol?: string; currentPrice?: number }) {
    const [activeTab, setActiveTab] = useState<'liquidity' | 'trades'>('liquidity');
    const [precision, setPrecision] = useState('0.01');
    const [showPrecisionMenu, setShowPrecisionMenu] = useState(false);

    const precisionOptions = ['0.1', '0.01', '0.001'];
    
    const basePriceOffset = currentPrice ? currentPrice - 19967 : 0;

    return (
        <div className="w-full md:w-[320px] flex flex-col bg-[#181818] border-x border-white/5 h-full select-none">

            <div className="flex items-center justify-between px-3 h-12 border-b border-white/5">
                <div className="flex gap-2 h-full items-center">
                    {/* Display selected symbol */}
                    <img
                          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.split('/')[0].toLowerCase()}.png`}
                          alt={symbol.split('/')[0]}
                          className="w-4 h-4 rounded-full object-contain"
                          onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${(symbol || "A").split("/")[0].substring(0,3)}&background=2A2A2A&color=fff&rounded=true&bold=true`;
                        }}
                    />
                    <span className="text-xs text-gray-400 font-medium">{symbol}</span>
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <div className="flex gap-4 h-full items-center">
                        <div
                            onClick={() => setActiveTab('liquidity')}
                            className="relative h-full flex items-center cursor-pointer group"
                        >
                            <span className={`text-[13px] font-medium transition-colors ${activeTab === 'liquidity' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                Liquidity
                            </span>
                            {activeTab === 'liquidity' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00B595]" />
                            )}
                        </div>

                        <div
                            onClick={() => setActiveTab('trades')}
                            className="relative h-full flex items-center cursor-pointer group"
                        >
                            <span className={`text-[13px] font-medium transition-colors ${activeTab === 'trades' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                Recent trades
                            </span>
                            {activeTab === 'trades' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00B595]" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end px-3 py-2.5">

                <div className="flex items-center gap-1.5 relative">
                    <div 
                        onClick={() => setShowPrecisionMenu(!showPrecisionMenu)}
                        className="bg-[#24262b] pl-2 pr-1.5 py-0.5 rounded flex items-center gap-3 cursor-pointer hover:bg-[#2d3036] border border-white/5"
                    >
                        <span className="text-[11px] text-gray-300">{precision}</span>
                        <FaCaretDown size={10} className="text-gray-500" />
                    </div>
                    {showPrecisionMenu && (
                        <div className="absolute top-full right-6 z-50 mt-1 w-20 bg-[#24262b] border border-[#2d3036] rounded shadow-xl py-1">
                            {precisionOptions.map((opt) => (
                                <div
                                    key={opt}
                                    onClick={() => {
                                        setPrecision(opt);
                                        setShowPrecisionMenu(false);
                                    }}
                                    className={`px-3 py-1.5 text-[11px] cursor-pointer hover:bg-[#2d3036] ${precision === opt ? 'text-[#00B595]' : 'text-gray-300'}`}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {activeTab === 'liquidity' ? (
                <>
                    <div className="grid grid-cols-3 text-[10px] text-gray-500 px-3 pb-1 uppercase font-medium">
                          <span>Price({symbol.split('/')[1] || 'USDT'})</span>
                          <span className="text-right">Amount({symbol.split('/')[0]})</span>
                          <span className="text-right">Total</span>
                    </div>

                    <div className="grow overflow-y-auto no-scrollbar pb-2">
                        {ORDER_DATA.map((item, i) => (
                            <div
                                key={i}
                                className={`relative grid grid-cols-3 text-[11px] py-[2.5px] px-3 hover:bg-white/5 cursor-pointer group ${item.type === 'buy' && i === 14 ? 'mt-1' : ''
                                    }`}
                            >
                                <div
                                    className={`absolute right-0 top-0 h-full transition-all duration-300 ${item.type === 'sell' ? 'bg-[#ef5350]/10' : 'bg-[#00B595]/10'
                                        }`}
                                    style={{ width: `${item.depth}%` }}
                                />
                                <span className={`font-medium z-10 ${item.type === 'sell' ? 'text-[#F6465D]' : 'text-[#2EBD85]'}`}>
                                      {(Math.floor((item.price + basePriceOffset) / parseFloat(precision)) * parseFloat(precision)).toFixed(precision.split('.')[1]?.length || 0)}
                                </span>
                                <span className="text-right text-[#c9ccd0] z-10 font-medium tracking-tight">
                                    {item.amount}
                                </span>
                                <span className="text-right text-[#848e9c] z-10 font-medium tabular-nums">
                                      {((item.price + basePriceOffset) * parseFloat(item.amount)).toLocaleString('en-US', { minimumFractionDigits: 5, maximumFractionDigits: 5 })}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-3 text-[10px] text-gray-500 px-3 pb-1 uppercase font-medium">
                          <span>Price({symbol.split('/')[1] || 'USDT'})</span>
                          <span className="text-right">Amount({symbol.split('/')[0]})</span>
                          <span className="text-right">Time</span>
                    </div>

                    <div className="grow overflow-y-auto no-scrollbar pb-2">
                        {RECENT_TRADES_DATA.map((item, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-3 text-[11px] py-[2.5px] px-3 hover:bg-white/5 cursor-pointer"
                            >
                                <span className={`font-medium ${item.side === 'sell' ? 'text-[#F6465D]' : 'text-[#2EBD85]'}`}>
                                      {(item.price + basePriceOffset).toFixed(2)}
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