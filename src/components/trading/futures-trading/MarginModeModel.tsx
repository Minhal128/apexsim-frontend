"use client";
import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MarginModeModal({ isOpen, onClose }: Props) {
  const [mode, setMode] = useState<"Cross" | "Isolated">("Cross");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
      <div className="bg-[#08070E] w-full max-w-90 overflow-hidden p-5">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-base">BTCUSDT</h2>
          <IoClose 
            onClick={onClose} 
            size={22} 
            className="text-gray-400 hover:text-white cursor-pointer transition-colors" 
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            onClick={() => setMode("Cross")}
            className={`relative py-2 rounded font-bold text-xs border transition-all cursor-pointer ${
              mode === "Cross" 
              ? "bg-[#1E2329] border-[#00B595] text-white" 
              : "bg-transparent border-white/10 text-gray-400 hover:border-white/20"
            }`}
          >
            Cross
            {mode === "Cross" && (
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#00B595] rounded-bl-sm flex items-center justify-center">
                <div className="w-1 h-2 border-r border-b border-[#0B0E11] rotate-45 mb-0.5" />
              </div>
            )}
          </button>

          <button 
            onClick={() => setMode("Isolated")}
            className={`relative py-2 rounded font-bold text-xs border transition-all cursor-pointer ${
              mode === "Isolated" 
              ? "bg-[#1E2329] border-[#00B595] text-white" 
              : "bg-transparent border-white/10 text-gray-400 hover:border-white/20"
            }`}
          >
            Isolated
            {mode === "Isolated" && (
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#00B595] rounded-bl-sm flex items-center justify-center">
                <div className="w-1 h-2 border-r border-b border-[#0B0E11] rotate-45 mb-0.5" />
              </div>
            )}
          </button>
        </div>

        <div className="flex items-center mb-30 justify-between text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">
          <span className="text-[13px]">What is Cross and isolated</span>
          <FaCaretDown size={14} />
        </div>
      </div>
    </div>
  );
}