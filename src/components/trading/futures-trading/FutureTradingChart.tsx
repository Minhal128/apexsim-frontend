"use client";
import React from "react";
import dynamic from "next/dynamic";

// Dynamically import TradingView Advanced Real-Time Chart widget
const AdvancedRealTimeChart = dynamic(
  () => import("react-ts-tradingview-widgets").then((w) => w.AdvancedRealTimeChart),
  { ssr: false }
);

interface FutureTradingChartProps {
  activeView?: "chart" | "info";
  symbol?: string;
  coinName?: string;
  coinImage?: string;
  currentPrice?: number;
  high24h?: number;
  low24h?: number;
  marketInfo?: {
    usd?: number;
    change24h?: number;
    high24h?: number;
    low24h?: number;
    volume24h?: number;
    image?: string;
  };
  onTrade?: (type: "buy" | "sell", amount: number, price: number) => void;
  externalSize?: string;
  onSizeChange?: (size: string) => void;
}

export default function FutureTradingChart({
  activeView = "chart",
  symbol = "BTC/USDT",
  coinImage,
  coinName = "Bitcoin",
  marketInfo,
}: FutureTradingChartProps) {
  // Match behavior from spot trading chart: always use upper-case symbols and add a BINANCE prefix for USDT pairs.
  const tvSymbol = symbol.includes("/") && symbol.includes("USDT")
    ? `BINANCE:${symbol.replace("/", "").toUpperCase()}`
    : symbol.replace("/", "").toUpperCase();

  const formatPrice = (val?: number | string) => {
    if (val === undefined || val === null) return "N/A";
    const parsed = typeof val === "string" ? parseFloat(val) : val;
    if (Number.isNaN(parsed)) return "N/A";
    return `$${parsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const calcPreviousClose = () => {
    const price = marketInfo?.usd;
    const change = marketInfo?.change24h;
    if (price === undefined || change === undefined) return undefined;
    return price / (1 + change / 100);
  };

  return (
    <div className="bg-[#181818] w-full h-full font-manrope flex flex-col overflow-hidden relative">
      {activeView === "chart" ? (
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
      ) : (
        <div className="absolute inset-0 h-full bg-[#181818] p-6 text-white z-[9999] overflow-y-auto">
          <div className="flex items-center gap-2 mb-2 border-b pb-5 border-b-white/5">
            <div className="h-7 w-7">
              {coinImage || marketInfo?.image ? (
                <img
                  src={coinImage || marketInfo?.image!}
                  alt={coinName}
                  className="w-7 h-7 rounded-full"
                />
              ) : (
                <img src="/images/bitcoin.png" alt="" />
              )}
            </div>
            <div>
              <h1 className="text-sm flex items-center gap-1">
                {symbol.split("/")[0]} <span className="text-gray-500 font-medium">/{symbol.split("/")[1] ?? "USDT"}</span>
              </h1>
              <p className="text-gray-400 text-xs">{coinName}</p>
            </div>
          </div>

          <div className="w-full max-w-4xl">
            <h3 className="text-gray-100 text-lg font-semibold">Information</h3>
            <div className="mt-2 space-y-2">
              <InfoRow
                label="Price"
                value={
                  marketInfo?.usd
                    ? formatPrice(marketInfo.usd)
                    : "N/A"
                }
              />
              <InfoRow
                label="24h Change"
                value={
                  marketInfo?.change24h !== undefined && marketInfo?.change24h !== null
                    ? `${marketInfo.change24h.toFixed(2)}%`
                    : "N/A"
                }
              />
              <InfoRow
                label="Previous Close"
                value={formatPrice(calcPreviousClose())}
              />
              <InfoRow
                label="24h High"
                value={
                  marketInfo?.high24h
                    ? formatPrice(marketInfo.high24h)
                    : "N/A"
                }
              />
              <InfoRow
                label="24h Low"
                value={
                  marketInfo?.low24h
                    ? formatPrice(marketInfo.low24h)
                    : "N/A"
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="text-gray-100 text-sm font-medium">{value}</span>
  </div>
);
