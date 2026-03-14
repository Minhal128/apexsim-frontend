"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaChartLine } from "react-icons/fa";
import { MdOutlineOpenInFull, MdOutlineGridView } from "react-icons/md";

// Dynamically import TradingView Advanced Real-Time Chart widget
const AdvancedRealTimeChart = dynamic(
  () => import("react-ts-tradingview-widgets").then((w) => w.AdvancedRealTimeChart),
  { ssr: false }
);

interface TwelveDataQuote {
  symbol: string;
  name: string;
  close: string;
  previous_close: string;
  change: string;
  percent_change: string;
  fifty_two_week: {
    low: string;
    high: string;
  };
}

interface TradingChartProps {
  activeView: "chart" | "info";
  symbol?: string;
  coinId?: string;
  coinImage?: string;
  coinName?: string;
}

export default function TradingChart({
  activeView,
  symbol = "BTC/USDT",
  coinImage,
  coinName = "Bitcoin",
}: TradingChartProps) {
  const activeTab = activeView;
  const [quoteData, setQuoteData] = useState<TwelveDataQuote | null>(null);
  const [loading, setLoading] = useState(false);

  // Fix prefix based on asset type if possible, or just pass symbol directly
  // TradingView can auto-resolve symbols like AAPL or EURUSD without exchange prefixes in most cases.
  const tvSymbol = symbol.includes("/") && symbol.includes("USDT") 
    ? `BINANCE:${symbol.replace("/", "").toUpperCase()}`
    : symbol.replace("/", "").toUpperCase();

  useEffect(() => {
    if (activeTab === "info") {
      const fetchTwelveData = async () => {
        try {
          setLoading(true);
          const baseSymbol = symbol.split('/')[0];
          // Use baseSymbol/USD for Twelve Data as fiat pairs are widely supported
          const tdSymbol = `${baseSymbol}/USD`;
          const res = await fetch(`https://api.twelvedata.com/quote?symbol=${tdSymbol}&apikey=9e733d2d46d5412bb217e815edd25816`);
          const data = await res.json();
          if (data && !data.code) { // Twelve Data returns error inside 'code'
            setQuoteData(data);
          }
        } catch (error) {
          console.error("Error fetching Twelve Data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTwelveData();
    }
  }, [activeTab, symbol]);

  const formatPrice = (valStr?: string) => {
    if (!valStr) return "N/A";
    const val = parseFloat(valStr);
    return isNaN(val) ? "N/A" : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  return (
    <div className="bg-[#181818] w-full h-full font-manrope flex flex-col overflow-hidden">
      <div className="grow relative overflow-hidden bg-[#181818]">
        {activeTab === "chart" && (
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
        )}

        {activeTab === "info" && (
          <div className="absolute inset-0 h-full bg-[#181818] p-6 text-white z-50 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2 border-b pb-5 border-b-white/5">
              <div className="h-7 w-7">
                {coinImage ? (
                  <img src={coinImage} alt={coinName} className="w-7 h-7 rounded-full" />
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
              {loading ? (
                <div className="text-gray-400 text-sm mt-2">Loading data...</div>
              ) : quoteData ? (
                <div className="mt-2">
                  <InfoRow label="Price" value={formatPrice(quoteData.close)} />
                  <InfoRow label="24h Change" value={`${parseFloat(quoteData.percent_change).toFixed(2)}%`} />
                  <InfoRow label="Previous Close" value={formatPrice(quoteData.previous_close)} />
                  <InfoRow label="52 Week High" value={formatPrice(quoteData.fifty_two_week?.high)} />
                  <InfoRow label="52 Week Low" value={formatPrice(quoteData.fifty_two_week?.low)} />
                </div>
              ) : (
                <div className="mt-2">
                  <div className="text-gray-400 text-sm">Data not available</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="text-gray-100 text-sm font-medium">{value}</span>
  </div>
);
