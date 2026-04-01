"use client";
import React from "react";
import dynamic from "next/dynamic";
import { APP_LANGUAGE_EVENT, AppLanguageCode, getAppLanguage, t } from "@/lib/i18n";

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
    price?: number;
    value?: number;
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

export default React.memo(function FutureTradingChart({
  activeView = "chart",
  symbol = "BTC/USDT",
  coinImage,
  coinName = "Bitcoin",
  marketInfo,
  currentPrice,
  high24h,
  low24h,
}: FutureTradingChartProps) {
  const [lang, setLang] = React.useState<AppLanguageCode>("Eng");
  const tr = (key: string) => t(key, lang);
  const getTradingViewSymbol = (sym: string) => {
    if (!sym) return "BINANCE:BTCUSDT";

    // Check indices/forex
    if (sym === "VIX" || sym === "^VIX") return "CBOE:VIX";
    if (sym === "^RUT") return "CBOE:VIX"; // fallback
    if (sym === "SPX" || sym === "SPY" || sym === "^SPX") return "SP:SPX";
    if (sym === "NDX" || sym === "^NDX") return "NDX:NDX"; // etc
    if (sym === "DXY" || sym === "^DXY") return "TVC:DXY";
    if (sym === "DJI" || sym === "^DJI") return "DJ:DJI";

    let cleanSym = sym.replace('/', '').toUpperCase();
    const isForex = /^[A-Z]{6}$/.test(cleanSym) && !cleanSym.includes("USDT") && !cleanSym.includes("BTC") && !cleanSym.includes("ETH");
    if (isForex) {
      return `FX:${cleanSym}`;
    }

    let base = sym;
    let quote = "";
    if (sym.includes('/')) {
      const parts = sym.split('/');
      base = parts[0].toUpperCase();
      quote = parts[1].toUpperCase();
    } else {
      base = cleanSym;
    }

    // Crypto pairs with USDT/USD quote
    if (quote) {
      if (quote === "USDT" || quote === "USD") {
        return `BINANCE:${base}USDT`;
      }
      return `BINANCE:${base}${quote}`;
    }

    if (cleanSym.endsWith("USDT") || cleanSym.endsWith("USD")) {
      return `BINANCE:${cleanSym}`;
    }

    return cleanSym.replace('^', '');
  };

  const tvSymbol = getTradingViewSymbol(symbol);

  const formatPrice = (val?: number | string) => {
    if (val === undefined || val === null) return "N/A";
    const parsed = typeof val === "string" ? parseFloat(val) : val;
    if (Number.isNaN(parsed)) return "N/A";
    return `$${parsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const [quoteData, setQuoteData] = React.useState<any>(null);

  const fetchBackendData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5001';
      const res = await fetch(`${baseUrl}/api/market/prices`);
      if (!res.ok) {
        throw new Error(`Market API failed with status ${res.status}`);
      }

      const data = await res.json();
      const normalizedSymbol = (symbol || '').toString();
      const baseSymbol = normalizedSymbol.includes('/') ? normalizedSymbol.split('/')[0] : normalizedSymbol;
      if (!baseSymbol) return;
      
      const exactMatch = data[baseSymbol] || data[baseSymbol.toUpperCase()] || data[baseSymbol.replace('^', '')] || data[`^${baseSymbol}`];
      if (exactMatch) {
         setQuoteData(exactMatch);
      }
    } catch (error) {
      console.error("Error fetching max data:", error);
    }
  };

  React.useEffect(() => {
    if (activeView === "info") {
      fetchBackendData();
    }
  }, [activeView, symbol]);

  React.useEffect(() => {
    const applyLanguage = () => setLang(getAppLanguage());
    applyLanguage();
    window.addEventListener('storage', applyLanguage);
    window.addEventListener(APP_LANGUAGE_EVENT, applyLanguage as EventListener);
    return () => {
      window.removeEventListener('storage', applyLanguage);
      window.removeEventListener(APP_LANGUAGE_EVENT, applyLanguage as EventListener);
    };
  }, []);

  const calcPreviousClose = () => {
    const price = ((marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value) ?? currentPrice ?? quoteData?.usd ?? quoteData?.price ?? quoteData?.value ?? quoteData?.regularMarketPrice);
    const change = marketInfo?.change24h ?? quoteData?.usd_24h_change ?? quoteData?.change24h ?? quoteData?.regularMarketChangePercent;
    if (price === undefined || change === undefined) return undefined;
    return price / (1 + change / 100);
  };

  return (
    <div className="bg-[#181818] w-full h-full font-manrope flex flex-col overflow-hidden">
      <div className="grow relative overflow-hidden bg-[#181818]">
        {activeView === "chart" && (
          <div className="w-full h-full">
            <AdvancedRealTimeChart
              theme="dark"
              symbol={tvSymbol}
              autosize
              interval="D"
              timezone="Etc/UTC"
              style="1"
              locale={lang === "Esp" ? "es" : "en"}
              enable_publishing={false}
              allow_symbol_change={true}
              save_image={false}
              hide_side_toolbar={false}
            />
          </div>
        )}
        {activeView === "info" && (
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
                <img src={`https://ui-avatars.com/api/?name=${(symbol || "BTC").split("/")[0].substring(0,3)}&background=2A2A2A&color=fff&rounded=true&bold=true`} alt="" className="w-7 h-7 rounded-full" />
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
            <h3 className="text-gray-100 text-lg font-semibold">{tr('information')}</h3>
            <div className="mt-2 space-y-2">
              <InfoRow
                label={tr('price')}
                value={
                  (marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value) !== undefined
                    ? formatPrice((marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value))
                    : quoteData?.usd ?? quoteData?.price ?? quoteData?.value ?? quoteData?.regularMarketPrice
                    ? formatPrice(quoteData.usd || quoteData.price || quoteData.value || quoteData.regularMarketPrice)
                    : currentPrice ? formatPrice(currentPrice) : "N/A"
                }
              />
              <InfoRow
                label={tr('change24h')}
                value={
                  marketInfo?.change24h !== undefined && marketInfo?.change24h !== null
                    ? `${marketInfo.change24h.toFixed(2)}%`
                    : quoteData?.usd_24h_change !== undefined || quoteData?.change24h !== undefined || quoteData?.regularMarketChangePercent !== undefined
                    ? `${(quoteData.usd_24h_change ?? quoteData.change24h ?? quoteData.regularMarketChangePercent).toFixed(2)}%` : "N/A"
                }
              />
              <InfoRow
                label={tr('previousClose')}
                value={formatPrice(calcPreviousClose())}
              />
              <InfoRow
                label={tr('high24h')}
                value={
                  marketInfo?.high24h
                    ? formatPrice(marketInfo.high24h)
                    : quoteData?.high24h ?? quoteData?.regularMarketDayHigh
                    ? formatPrice(quoteData?.high24h ?? quoteData?.regularMarketDayHigh) : "N/A"
                }
              />
              <InfoRow
                label={tr('low24h')}
                value={
                  marketInfo?.low24h
                    ? formatPrice(marketInfo.low24h)
                    : quoteData?.low24h ?? quoteData?.regularMarketDayLow
                    ? formatPrice(quoteData?.low24h ?? quoteData?.regularMarketDayLow) : "N/A"
                }
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}, (prev, next) => {
  if (prev.activeView !== next.activeView || prev.symbol !== next.symbol) return false;
  // If we are in "chart" view, we don't care if marketInfo changes, because it doesn't affect the chart!
  if (next.activeView === "chart") return true;
  // Otherwise, we do care
  return prev.marketInfo === next.marketInfo;
});

const InfoRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="text-gray-100 text-sm font-medium">{value}</span>
  </div>
);


