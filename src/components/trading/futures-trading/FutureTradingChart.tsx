"use client";
import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Dynamically import TradingView Advanced Real-Time Chart widget
const AdvancedRealTimeChart = dynamic(
  () => import("react-ts-tradingview-widgets").then((w) => w.AdvancedRealTimeChart),
  { ssr: false }
);

interface FutureTradingChartProps {
  symbol?: string;
  currentPrice?: number;
  high24h?: number;
  low24h?: number;
  onTrade?: (type: 'buy' | 'sell', amount: number, price: number) => void;
  externalSize?: string;
  onSizeChange?: (size: string) => void;
}

export default function FutureTradingChart({
  symbol = "BTC/USDT",
}: FutureTradingChartProps) {
  const tvSymbol = symbol.includes('/') && symbol.includes('USDT') 
    ? `BINANCE:${symbol.replace('/', '')}` 
    : symbol.replace('/', '');

  return (
    <div className="bg-[#181818] w-full h-full font-manrope flex flex-col overflow-hidden relative">
      <div className="flex-1 w-full relative">
        <div className="w-full h-full">
          <AdvancedRealTimeChart
            theme="dark"
            symbol={tvSymbol}
            autosize
            interval="D"
            timezone="Etc/UTC"
            style="1"
            locale="en"
            enable_publishing={false}
            allow_symbol_change={true}
            save_image={false}
            hide_side_toolbar={false}
          />
        </div>
      </div>
    </div>
  );
}
