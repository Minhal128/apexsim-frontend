"use client";
import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { MdChevronRight } from "react-icons/md";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLeverageClick: () => void;
}

export default function PreferenceModal({ isOpen, onClose, onLeverageClick }: Props) {
  const [secondConfirm, setSecondConfirm] = useState(true);
  const [reverseConfirm, setReverseConfirm] = useState(true);

  if (!isOpen) return null;

  const SettingRow = ({ label, value, onClick, hasChevron = true }: any) => (
    <div 
      onClick={onClick}
      className="flex items-center justify-between py-3.75 px-4 hover:bg-white/5 transition-colors cursor-pointer"
    >
      <span className="text-[13px] text-gray-200">{label}</span>
      <div className="flex items-center gap-1">
        {value && <span className="text-[13px] text-gray-500 font-medium">{value}</span>}
        {hasChevron && <MdChevronRight className="text-gray-500" size={18} />}
      </div>
    </div>
  );

  const ToggleRow = ({ label, enabled, setEnabled }: any) => (
    <div className="flex items-center justify-between py-3.75 px-4">
      <span className="text-[13px] text-gray-200">{label}</span>
      <div 
        onClick={() => setEnabled(!enabled)}
        className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
          enabled ? 'bg-[#00B595]' : 'bg-[#474D57]'
        }`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
          enabled ? 'left-4.5' : 'left-0.5'
        }`} />
      </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-100 flex justify-end bg-black/60 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#08070E] w-full max-w-85 h-screen flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        <div className="flex items-center justify-between px-4 bg-[#121212] py-3 border-b border-white/5">
          <h2 className="text-white font-semibold text-[16px]">Preference</h2>
          <IoClose 
            onClick={onClose} 
            size={22} 
            className="text-gray-400 hover:text-white cursor-pointer transition-colors" 
          />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-2">
          <div className="flex flex-col">
            
            <SettingRow 
              label="BTC/USDT" 
              value="Hedging Mode" 
              onClick={onLeverageClick} 
            />
            
            <SettingRow label="Contract Unit" value="BNB" />
            
            <ToggleRow 
              label="Second confirmation order" 
              enabled={secondConfirm} 
              setEnabled={setSecondConfirm} 
            />
            
            <ToggleRow 
              label="Reverse Position confirmation" 
              enabled={reverseConfirm} 
              setEnabled={setReverseConfirm} 
            />

            <SettingRow label="Validity period" value="Permanently" />
          </div>
        </div>

      </div>
    </div>
  );
}