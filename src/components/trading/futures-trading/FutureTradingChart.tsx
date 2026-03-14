"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { MdClose } from "react-icons/md";

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
  currentPrice,
  high24h,
  low24h,
  onTrade,
  externalSize,
  onSizeChange,
}: FutureTradingChartProps) {
  const [tradeSize, setTradeSize] = useState(externalSize || "");
  const [activeInterval, setActiveInterval] = useState("D");
  const container = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tradeMode, setTradeMode] = useState(true);

  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [lockedPos, setLockedPos] = useState<{ x: number; y: number; price: number } | null>(null);

  useEffect(() => {
    if (externalSize !== undefined) setTradeSize(externalSize);
  }, [externalSize]);

  useEffect(() => {
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  const getPriceAtY = useCallback((y: number): number => {
    if (!chartWrapperRef.current || !currentPrice) return currentPrice ?? 0;
    const chartHeight = chartWrapperRef.current.getBoundingClientRect().height;
    if (chartHeight === 0) return currentPrice;
    const hi = high24h ?? currentPrice * 1.03;
    const lo = low24h ?? currentPrice * 0.97;
    const frac = Math.max(0, Math.min(1, y / chartHeight));
    return hi - frac * (hi - lo);
  }, [currentPrice, high24h, low24h]);

  const handleChartMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tradeMode || lockedPos || !chartWrapperRef.current) return;
    if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
    const rect = chartWrapperRef.current.getBoundingClientRect();
    setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [tradeMode, lockedPos]);

  const handleChartMouseLeave = useCallback(() => {
    if (lockedPos) return;
    hideTimerRef.current = setTimeout(() => setHoverPos(null), 300);
  }, [lockedPos]);

  const handleChartClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tradeMode || !chartWrapperRef.current) return;
    const rect = chartWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const price = getPriceAtY(y);
    setLockedPos({ x, y, price });
    setHoverPos(null);
    setTimeout(() => sizeInputRef.current?.focus(), 50);
  }, [tradeMode, getPriceAtY]);

  const unlock = useCallback(() => {
    setLockedPos(null);
    setHoverPos(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') unlock(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [unlock]);

  const handlePanelMouseEnter = useCallback(() => {
    if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
  }, []);

  const handleSizeInput = (val: string) => { setTradeSize(val); onSizeChange?.(val); };

  const executeTrade = useCallback((type: 'buy' | 'sell') => {
    const price = lockedPos?.price ?? getPriceAtY(hoverPos?.y ?? 0);
    const size = parseFloat(tradeSize);
    onTrade?.(type, size, price);
    unlock();
    setTradeSize("");
    onSizeChange?.("");
  }, [lockedPos, hoverPos, tradeSize, onTrade, unlock, getPriceAtY, onSizeChange]);

  const PANEL_W = 440;
  const PANEL_H = 72;
  const OFFSET_Y = 18;

  const activePos = lockedPos ?? hoverPos;
  const isLocked = !!lockedPos;

  const panelStyle = (() => {
    if (!activePos || !chartWrapperRef.current) return { left: 0, top: 0 };
    const { width } = chartWrapperRef.current.getBoundingClientRect();
    const left = Math.min(Math.max(activePos.x - PANEL_W / 2, 8), width - PANEL_W - 8);
    const top = activePos.y - PANEL_H - OFFSET_Y < 8
      ? activePos.y + OFFSET_Y + 8
      : activePos.y - PANEL_H - OFFSET_Y;
    return { left, top };
  })();

  const panelPrice = isLocked ? lockedPos!.price : getPriceAtY(hoverPos?.y ?? 0);
  const priceFormatted = panelPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

  return (
    <div className="bg-[#181818] w-full h-full font-manrope flex flex-col overflow-hidden relative">

      {/* Chart area */}
      <div
        ref={chartWrapperRef}
        className="flex-1 w-full relative"
        onMouseMove={handleChartMouseMove}
        onMouseLeave={handleChartMouseLeave}
      >
        {/* TradingView Widget */}
        <div className="w-full h-full" ref={container}>
          <AdvancedRealTimeChart
            symbol={symbol.includes('/') && symbol.includes('USDT') ? `BINANCE:${symbol.replace('/', '')}` : symbol.replace('/', '')}
            theme="dark"
            autosize
            interval={activeInterval as any}
            timezone="Etc/UTC"
            style="1"
            locale="en"
            allow_symbol_change={false}
            calendar={false}
            hide_top_toolbar={false}
            hide_legend={false}
            save_image={false}
          />
        </div>

        {/* Crosshair hit layer — captures hover + click when NOT locked */}
        {tradeMode && !isLocked && (
          <div
            className="absolute inset-0 z-20"
            style={{ cursor: 'crosshair' }}
            onClick={handleChartClick}
          />
        )}

        {/* Click-to-dismiss backdrop when locked */}
        {tradeMode && isLocked && (
          <div
            className="absolute inset-0 z-20"
            style={{ cursor: 'crosshair' }}
            onClick={unlock}
          />
        )}

        {/* Floating Buy/Sell panel */}
        {tradeMode && activePos && (
          <div
            className="absolute z-50 pointer-events-auto"
            style={{ left: panelStyle.left, top: panelStyle.top, width: PANEL_W }}
            onMouseEnter={handlePanelMouseEnter}
            onMouseLeave={handleChartMouseLeave}
          >
            <div className={`flex items-stretch bg-[#1a1a1a] rounded-lg overflow-hidden border shadow-2xl w-full transition-all duration-150 ${
              isLocked ? 'border-[#00B595]/60 shadow-[0_0_20px_rgba(0,181,149,0.15)]' : 'border-white/10'
            }`}>

              {/* Buy / Long */}
              <button
                onClick={(e) => { e.stopPropagation(); executeTrade('buy'); }}
                disabled={isLocked && !tradeSize}
                className="flex-1 bg-[#00B595] hover:bg-[#00a386] disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2.5 text-white text-center transition-colors border-none cursor-pointer"
              >
                <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">Buy / Long</div>
                <div className="text-sm font-mono font-bold leading-tight">{priceFormatted}</div>
              </button>

              {/* Size input */}
              <div className="px-3 py-2 border-x border-white/10 text-center bg-[#111] flex flex-col justify-center min-w-[130px]">
                <div className="text-[9px] text-gray-500 font-semibold uppercase mb-1">
                  Size ({symbol.split('/')[0]})
                </div>
                <input
                  ref={sizeInputRef}
                  type="number"
                  min="0"
                  step="0.001"
                  value={tradeSize}
                  onChange={(e) => handleSizeInput(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="0.000"
                  className={`bg-transparent border rounded px-2 text-center text-white text-[13px] font-mono font-bold outline-none w-full py-1 transition-colors ${
                    isLocked && !tradeSize
                      ? 'border-yellow-400 animate-pulse placeholder-yellow-400/60'
                      : isLocked
                      ? 'border-[#00B595]/60 placeholder-gray-600'
                      : 'border-white/20 placeholder-gray-600'
                  }`}
                />
                {isLocked && !tradeSize && (
                  <span className="text-[9px] text-yellow-400 mt-0.5">Enter size to trade</span>
                )}
              </div>

              {/* Sell / Short */}
              <button
                onClick={(e) => { e.stopPropagation(); executeTrade('sell'); }}
                disabled={isLocked && !tradeSize}
                className="flex-1 bg-[#FF383C] hover:bg-[#e43236] disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2.5 text-white text-center transition-colors border-none cursor-pointer"
              >
                <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">Sell / Short</div>
                <div className="text-sm font-mono font-bold leading-tight">{priceFormatted}</div>
              </button>

              {/* Close button */}
              {isLocked && (
                <button
                  onClick={(e) => { e.stopPropagation(); unlock(); }}
                  className="px-2 bg-[#1a1a1a] hover:bg-white/5 text-gray-500 hover:text-white transition-colors border-none cursor-pointer flex items-center"
                >
                  <MdClose size={16} />
                </button>
              )}
            </div>

            {/* Status hint */}
            <div className="flex items-center justify-center mt-1">
              {isLocked ? (
                <span className="text-[10px] text-[#00B595]/80 font-medium tracking-wide">
                  Locked at {priceFormatted} · click chart or ESC to dismiss
                </span>
              ) : (
                <span className="text-[10px] text-gray-600 font-medium">
                  Click to lock price
                </span>
              )}
            </div>

            {/* Caret arrow */}
            {activePos.y - PANEL_H - OFFSET_Y >= 8 && (
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: `6px solid ${isLocked ? 'rgba(0,181,149,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  marginLeft: Math.min(
                    Math.max(activePos.x - (panelStyle.left as number) - 6, 10),
                    PANEL_W - 22
                  ),
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
