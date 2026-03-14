"use client";
import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type CalcTab = "Profit/ loss" | "Target Price" | "Liquidation price";
type Side = "long" | "short";

export default function TradingCalculator({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<CalcTab>("Profit/ loss");
  const [side, setSide] = useState<Side>("long");

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center md:justify-end justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#09090D] md:top-3 md:absolute w-full max-w-[400px] overflow-hidden shadow-2xl rounded-lg border border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
       
        <div className="relative border-b border-white/10 px-4">
          <div className="flex gap-6">
            {(["Profit/ loss", "Target Price", "Liquidation price"] as CalcTab[]).map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-[13px] font-semibold cursor-pointer transition-all relative z-10 ${
                  activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute -bottom-px left-0 w-full h-0.5 bg-[#00B595] shadow-[0_0_8px_rgba(0,181,149,0.4)]" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-5">
          <div className="flex bg-[#1e2023] rounded-md overflow-hidden ">
            <button
              onClick={() => setSide('long')}
              className={`flex-1 py-2 text-sm rounded cursor-pointer transition-all ${
                side === 'long' ? 'bg-[#0ECB81] text-white' : 'text-gray-400 '
              }`}
            >Open Long</button>
            <button
              onClick={() => setSide('short')}
              className={`flex-1 py-2 text-sm  rounded cursor-pointer transition-all ${
                side === 'short' ? 'bg-[#0ECB81] text-white' : 'text-gray-400'
              }`}
            >Open Short</button>
          </div>

          <div className="pt-2">
             <div className="relative h-1 flex items-center mb-6">
               <div className="absolute w-full h-0.5 bg-[#2d3036]" />
               <div className="absolute left-0 w-0 h-0.5 bg-[#00B595]" />
               
               <div className="absolute w-full flex justify-between z-10 px-0.5">
                 {[1, 15, 30, 45, 60, 75].map((val) => (
                   <div key={val} className="flex flex-col items-center relative">
                     <div className={`w-2 h-2 rotate-45 border-2 transform translate-y-[-0.5px] ${
                        val === 1 ? 'bg-[#09090D] border-[#00B595]' : 'bg-[#09090D] border-[#2d3036]'
                      }`} />
                     {/* Label */}
                     <span className="absolute top-4 text-[11px] text-gray-500 whitespace-nowrap">{val}x</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[12px] text-gray-400">Entry price</label>
              <div className="relative">
                <input placeholder="Please enter" className="w-full bg-[#181B1F] border border-transparent rounded p-3 text-sm outline-none  text-white placeholder:text-gray-600" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">USDT</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] text-gray-400">Target price</label>
              <div className="relative">
                <input placeholder="Please enter" className="w-full bg-[#181B1F] border border-transparent rounded p-3 text-sm outline-none  text-white placeholder:text-gray-600" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">USDT</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] text-gray-400">Size</label>
              <div className="relative">
                <input placeholder="Please enter" className="w-full bg-[#181B1F] border border-transparent rounded p-3 text-sm outline-none  text-white placeholder:text-gray-600" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">BNB</span>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-[13px] font-bold text-white">Result</h3>
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">Margin Balance</span>
              <span className="text-white font-medium">0 USDT</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">PNL</span>
              <span className="text-white font-medium">0 USDT</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">ROI</span>
              <span className="text-white font-medium">0%</span>
            </div>
          </div>

          {/* Calculate Button */}
          <button className="w-full py-3.5 bg-[#24262b] hover:bg-[#2d3036] text-white rounded font-bold text-sm cursor-pointer transition-colors mt-2">
            Calculate
          </button>
        </div>
      </div>
    </div>
  );
}