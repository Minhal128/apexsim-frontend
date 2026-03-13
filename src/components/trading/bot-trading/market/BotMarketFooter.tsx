"use client";
import React, { useState } from 'react';


export default function BotMarketFooter() {
  const [activeTab, setActiveTab] = useState("Open orders (0)");

  const tabs = ['Running', 'History', 'PNL Analysis'];
  return (
    <div className="bg-[#181818] border-t border-white/5 min-h-100 flex flex-col font-sans w-full relative">

      <div className="flex items-center justify-between border-b border-white/5 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-6 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-[14px] font-medium transition-all relative cursor-pointer whitespace-nowrap ${
                activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#00B595]" />
              )}
            </button>
          ))}
        </div>
      </div>

      

    </div>
  );
}