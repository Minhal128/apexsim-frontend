"use client";
import React, { useState } from "react";
import { FaPlusCircle, FaCaretDown } from "react-icons/fa";
import { TbArrowBackUp } from "react-icons/tb";

type TabType = "AI" | "Popular" | "Manual";

export default function BotMarketForm() {
  const [activeTab, setActiveTab] = useState<TabType>("AI");
  const [selectedOption, setSelectedOption] = useState<string>(
    "Sell all base coins on stops",
  );

  const aiStrategies = [
    {
      title: "Short-term fluctuation-7D",
      apr: "+251.467%",
      range: "$88,200.84-$88,967",
      grids: 6,
      fee: "0.13%-0.20%",
    },
    {
      title: "Mid-term sideways-30D",
      apr: "+251.467%",
      range: "$88,200.84-$88,967",
      grids: 6,
      fee: "0.13%-0.20%",
    },
  ];

  const radioOptions = [
    "Trailing settings",
    "TP and SL",
    "Sell all base coins on stops",
  ];

  return (
    <div className="w-full md:w-87.5 bg-[#181818] flex flex-col h-full select-none font-sans text-[#EAECEF]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5">
        <TbArrowBackUp size={22} className="cursor-pointer text-white" />
        <h2 className="text-xl">Spot</h2>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-2 gap-6 border-b border-white/5 relative">
        {(["AI", "Popular", "Manual"] as TabType[]).map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-[15px] font-medium cursor-pointer relative ${
              activeTab === tab ? "text-white" : "text-gray-500"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.75 bg-[#00B595] rounded-t-full" />
            )}
          </div>
        ))}
      </div>

      {/* Currency Selector */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-[#1E2023] px-3 py-1.5 rounded cursor-pointer">
          <span className="text-[10px]">BTC /USDT</span>
          <FaCaretDown size={12} className="text-gray-50" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {activeTab === "AI" && (
          <div className="space-y-4">
            {aiStrategies.map((strat, idx) => (
              <div
                key={idx}
                className="bg-[#1C1C1D] p-4 flex flex-col gap-4 border border-transparent"
              >
                <h3 className="text-[18px] border-b border-b-gray-800 font-semibold text-gray-200 pb-2">
                  {strat.title}
                </h3>
                <div className="grid grid-cols-2">
                  <div>
                    <p className="text-[15px] text-gray-500">Backtested APR</p>
                    <p className="text-[#00B595] text-2xl font-bold">
                      {strat.apr}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] text-gray-500">Profit per grid</p>
                    <p className="text-[15px] text-gray-500 font-bold">
                      {strat.fee}
                    </p>
                  </div>
                  <div className="mt-2">
                    <p className="text-[15px] text-gray-500">
                      Price range (USDT)
                    </p>
                    <p className="text-[13px] font-medium">{strat.range}</p>
                  </div>
                  <div className="text-right mt-2">
                    <p className="text-[15px] text-gray-500">Number of grids</p>
                    <p className="text-[15px] font-bold">{strat.grids}</p>
                  </div>
                </div>
                <button className="w-full py-2 bg-[#0052FF] text-white rounded cursor-pointer">
                  Copy
                </button>
              </div>
            ))}
          </div>
        )}

        {/* --- MANUAL SECTION --- */}
        {(activeTab === "Manual" || activeTab === "Popular") && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[15px] text-gray-50">Price range</label>
                <input
                  placeholder="Lower"
                  className="w-full bg-[#1C1C1D] mt-2 border border-white/10 rounded p-2.5 text-sm outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[15px] text-gray-50">Price range</label>
                <input
                  placeholder="Upper"
                  className="w-full bg-[#1C1C1D] mt-2 border border-white/10 rounded p-2.5 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[15px] text-gray-50">
                The number of grids
              </label>
              <div className="relative">
                <select className="w-full bg-[#1C1C1D] text-gray-500 mt-2 border border-white/10 rounded p-2.5 text-sm outline-none appearance-none cursor-pointer">
                  <option>2-170</option>
                </select>
                <FaCaretDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-50 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[15px] text-gray-50">
                Investment amount
              </label>
              <div className="relative">
                <input
                  placeholder="50.00"
                  className="w-full bg-[#1C1C1D] border mt-2 border-white/10 rounded p-2.5 text-sm outline-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-[13px] text-gray-50 pl-2 border-l border-white/10">
                    USDT
                  </span>
                  <FaCaretDown size={10} className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="relative h-6 flex items-center px-1 cursor-pointer">
              <div className="absolute w-full h-0.5 bg-[#2d3036] rounded" />
              <div className="absolute w-full flex justify-between z-10">
                {[0, 25, 50, 75, 100].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rotate-45 rounded-sm border-2 ${i === 0 ? "bg-[#121212] border-[#00B595]" : "bg-[#121212] border-[#2d3036]"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[11px] flex items-center text-gray-500">
              9,500.0564107 USDT{" "}
              <span className="cursor-pointer ml-1 text-[#3b82f6]">
                <FaPlusCircle size={9} />
              </span>
            </p>

            <div className="pt-2 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between cursor-pointer">
                <span className="text-[14px] font-medium">
                  Advanced options
                </span>
                <FaCaretDown className="text-gray-500" />
              </div>

              <div className="space-y-3">
                {radioOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => setSelectedOption(option)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        selectedOption === option
                          ? "border-[#0052FF]"
                          : "border-gray-600"
                      }`}
                    >
                      {selectedOption === option && (
                        <div className="w-2 h-2 rounded-full bg-[#0052FF]" />
                      )}
                    </div>
                    <span
                      className={`text-[13px] ${selectedOption === option ? "text-gray-200" : "text-gray-400"}`}
                    >
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-linear-to-r from-[#0052FF] to-[#0070FF] text-white rounded-md cursor-pointer transition-all active:scale-[0.98]">
              Create
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
