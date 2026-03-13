"use client";
import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LeverageModal({ isOpen, onClose, onConfirm }: Props) {
  const [leverage, setLeverage] = useState(5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
      <div className="bg-[#08070E] w-full max-w-90  overflow-hidden">
        
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-white font-semibold text-[15px]">BTCUSDT leverage level</h2>
          <IoClose 
            onClick={onClose} 
            size={22} 
            className="text-gray-400 hover:text-white cursor-pointer transition-colors" 
          />
        </div>

        <div className="p-4 pt-2">
          <div className="flex items-center bg-[#181B1F] rounded  mb-6">
            <button 
              onClick={() => setLeverage(prev => Math.max(1, prev - 1))}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white text-xl cursor-pointer"
            >
              −
            </button>
            <div className="flex-1 text-center text-white  text-xs">
              {leverage}x
            </div>
            <button 
              onClick={() => setLeverage(prev => Math.min(75, prev + 1))}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white text-xl cursor-pointer"
            >
              +
            </button>
          </div>

          <div className="relative px-2 mb-8">
            <input 
              type="range" 
              min="1" 
              max="75" 
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full h-0.5 bg-gray-700 appearance-none cursor-pointer accent-[#00B595]"
            />
            <div className="flex justify-between mt-3 text-[11px] text-gray-500 font-medium">
              <span>1x</span>
              <span>15x</span>
              <span>30x</span>
              <span>45x</span>
              <span>60x</span>
              <span>75x</span>
            </div>
          </div>

          <button 
            onClick={onConfirm}
            className="w-full py-2 bg-[#00B595] hover:bg-[#00a386] text-white  rounded text-sm transition-all cursor-pointer active:scale-[0.98] mb-4"
          >
            Confirm
          </button>

          <div className="flex justify-between items-center text-[12px]">
            <span className="text-gray-500">Position limit</span>
            <span className="text-white">30,000,000 USDT</span>
          </div>
        </div>
      </div>
    </div>
  );
}