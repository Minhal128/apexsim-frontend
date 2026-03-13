import React from "react";

import TradeForm from "@/components/trading/bot-trading/market/BotMarketForm";
import OrderTabs from "@/components/trading/bot-trading/market/BotMarketFooter";
import TradingChart from "@/components/trading/bot-trading/market/BotMarketChart";

export default function TradingPage() {
  return (
    <div className="bg-[#181818] px-2 h-full text-gray-300  font-manrope">
      <div className="flex items-center gap-4 md:px-4 px-6 md:py-4 py-2 border-b border-white/5 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-center gap-2 min-w-fit">
          <img
            src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png"
            className="md:w-8 md:h-8 w-6 h-6"
            alt="btc"
          />
          <div className="flex flex-col">
            <span className="text-white md:text-md text-sm tracking-tight font-bold">
              BTC/USDT
            </span>
            <span className="text-[12px] text-gray-500">Bitcoin</span>
          </div>
        </div>
        <div className="flex gap-4 font-semibold text-[11px]">
          <div>
            <p className="text-[#ef5350] md:text-lg text-sm font-bold">
              88,200.84
            </p>
            <p className="text-gray-500 text-[12px]">$88,200.84</p>
          </div>
          <div>
            <p className="text-gray-500 md:text-[12px] text-[10px]">
              24h Change
            </p>
            <p className="text-white text-sm">88,200.84</p>
          </div>
          <div className="">
            <p className="text-gray-500 md:text-[12px] text-[10px]">24h High</p>
            <p className="text-white text-sm font-medium">89,120.00</p>
          </div>
          <div className="">
            <p className="text-gray-500 md:text-[12px] text-[10px]">24h Low</p>
            <p className="text-white text-sm font-medium">87,400.00</p>
          </div>
          <div className="">
            <p className="text-gray-500 md:text-[12px] text-[9px]">
              24hvol(BTC)
            </p>
            <p className="text-white text-sm font-medium">100.78K</p>
          </div>
          <div className="">
            <p className="text-gray-500 md:text-[12px] text-[9px]">
              24hvol(USDT)
            </p>
            <p className="text-white text-sm font-medium">100B</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-full gap-px bg-white/5">
        <div className="grow flex flex-col min-w-0 bg-[#181818]">
          <div className="flex items-center gap-4 px-4 md:py-3 py-2 border-b border-white/5 text-[12px] font-semibold">
            <span className="text-[#00B595] border-b-2 border-[#00B595] pb-1 cursor-pointer">
              Chart
            </span>
            <span className="text-gray-500 hover:text-white cursor-pointer">
              Info
            </span>
          </div>
          <div className="h-137.5">
            <TradingChart />
          </div>
        </div>

        <TradeForm />
      </div>

      <OrderTabs />
    </div>
  );
}
