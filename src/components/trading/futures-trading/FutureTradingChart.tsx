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
}: FutureTradingChartProps) {
  const getTradingViewSymbol = (sym: string) => {
    if (!sym) return "BINANCE:BTCUSDT";
    if (sym.includes(":")) return sym.toUpperCase();

    const s = sym.toUpperCase();
    const hasSlash = s.includes("/");
    const base = hasSlash ? s.split("/")[0] : s;
    const quote = hasSlash ? s.split("/")[1] : "";

    // Verified TradingView symbol mappings
    const mappings: Record<string, string> = {
      // ═══════════════════════════════════════════════════════════════
      // STOCKS (from backend: AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, BRK_B, LLY, V)
      // ═══════════════════════════════════════════════════════════════
      AAPL: "NASDAQ:AAPL",
      MSFT: "NASDAQ:MSFT",
      GOOGL: "NASDAQ:GOOGL",
      AMZN: "NASDAQ:AMZN",
      NVDA: "NASDAQ:NVDA",
      META: "NASDAQ:META",
      TSLA: "NASDAQ:TSLA",
      "BRK-B": "NYSE:BRK.B",
      BRK_B: "NYSE:BRK.B",
      LLY: "NYSE:LLY",
      V: "NYSE:V",

      // ═══════════════════════════════════════════════════════════════
      // COMMODITIES (from backend: GOLD, SILVER, OIL, NATGAS, COPPER, PLATINUM, PALLADIUM, WHEAT, CORN, COFFEE)
      // Using OANDA and CAPITALCOM for reliable free widget support
      // ═══════════════════════════════════════════════════════════════
      GOLD: "OANDA:XAUUSD",
      SILVER: "OANDA:XAGUSD",
      OIL: "BLACKBULL:WTI",
      NATGAS: "CAPITALCOM:NATURALGAS",
      COPPER: "CAPITALCOM:COPPER",
      PLATINUM: "OANDA:XPTUSD",
      PALLADIUM: "OANDA:XPDUSD",
      WHEAT: "CAPITALCOM:WHEAT",
      CORN: "CAPITALCOM:CORN",
      COFFEE: "PEPPERSTONE:COFFEE",

      // ═══════════════════════════════════════════════════════════════
      // FOREX (from backend: EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, CHFJPY, EURGBP, EURJPY, USDCHF, NZDUSD)
      // ═══════════════════════════════════════════════════════════════
      EURUSD: "FX:EURUSD",
      GBPUSD: "FX:GBPUSD",
      USDJPY: "FX:USDJPY",
      AUDUSD: "FX:AUDUSD",
      USDCAD: "FX:USDCAD",
      CHFJPY: "FX:CHFJPY",
      EURGBP: "FX:EURGBP",
      EURJPY: "FX:EURJPY",
      USDCHF: "FX:USDCHF",
      NZDUSD: "FX:NZDUSD",

      // ═══════════════════════════════════════════════════════════════
      // INDICES
      // Using OANDA, TVC, INDEX for 100% reliable free widget support
      // ═══════════════════════════════════════════════════════════════
      "^GSPC": "OANDA:SPX500USD", SPX: "OANDA:SPX500USD", SP500: "OANDA:SPX500USD",
      "^DJI": "OANDA:US30USD", DJI: "OANDA:US30USD",
      "^IXIC": "OANDA:NAS100USD", IXIC: "OANDA:NAS100USD", NASDAQ: "OANDA:NAS100USD",
      "^NYA": "INDEX:NYA", "^RUT": "OANDA:US2000USD", RUT: "OANDA:US2000USD",
      "^FTSE": "OANDA:UK100GBP", FTSE: "OANDA:UK100GBP", "^FTMC": "TVC:MCX",
      "^GDAXI": "TVC:DE40", GDAXI: "TVC:DE40",
      "^FCHI": "OANDA:FR40EUR", FCHI: "OANDA:FR40EUR",
      "^STOXX50E": "TVC:EU50", STOXX50E: "TVC:EU50",
      "^IBEX": "TVC:ES35", IBEX: "TVC:ES35",
      "^N225": "OANDA:JP225USD", N225: "OANDA:JP225USD",
      "^TOPX": "TSE:TOPIX", "000001.SS": "SSE:000001",
      "^HSI": "OANDA:HK33HKD", HSI: "OANDA:HK33HKD",
      "399001.SZ": "SZSE:399001", "^NSEI": "NSE:NIFTY", NSEI: "NSE:NIFTY",
      "^BSESN": "BSE:SENSEX", BSESN: "BSE:SENSEX", "^KSE": "PSX:KSE100", KSE: "PSX:KSE100",
      "^AXJO": "OANDA:AU200AUD", AXJO: "OANDA:AU200AUD", "^GSPTSE": "TSX:TSX", GSPTSE: "TSX:TSX",
      URTH: "AMEX:URTH"
    };

    // Check mappings first (prioritize exact matches for base symbol)
    if (mappings[base]) return mappings[base];
    if (mappings[s]) return mappings[s];

    const cleanSym = s.replace('/', '');

    // Check if cleanSym is in mappings (for forex pairs or other)
    if (mappings[cleanSym]) return mappings[cleanSym];

    // Forex pairs: 6 characters, common currency prefixes - use FX: prefix
    const forexPrefixes = ["EUR", "GBP", "AUD", "JPY", "CAD", "CHF", "NZD", "USD"];
    if (cleanSym.length === 6 && forexPrefixes.some(prefix => cleanSym.startsWith(prefix))) {
      return `FX:${cleanSym}`;
    }

    // Crypto pairs with USDT/USD quote
    if (quote) {
      if (quote === "USDT" || quote === "USD") {
        return `BINANCE:${base}USDT`;
      }
      return `BINANCE:${cleanSym}`;
    }

    if (cleanSym.endsWith("USDT") || cleanSym.endsWith("USD")) {
      return `BINANCE:${cleanSym.endsWith("USD") ? cleanSym + "T" : cleanSym}`;
    }

    return base.replace('^', '');
  };

  const tvSymbol = getTradingViewSymbol(symbol);

  const formatPrice = (val?: number | string) => {
    if (val === undefined || val === null) return "N/A";
    const parsed = typeof val === "string" ? parseFloat(val) : val;
    if (Number.isNaN(parsed)) return "N/A";
    return `$${parsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const calcPreviousClose = () => {
    const price = ((marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value) ?? marketInfo?.price ?? marketInfo?.value);
    const change = marketInfo?.change24h;
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
              locale="en"
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
                  (marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value)
                    ? formatPrice(marketInfo.usd || marketInfo.price || marketInfo.value)
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


