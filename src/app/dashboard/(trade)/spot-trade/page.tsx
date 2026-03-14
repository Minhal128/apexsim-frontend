"use client";
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import OrderBook from '@/components/trading/spot-trading/OrderBook';
import TradeForm from '@/components/trading/spot-trading/TradeForm';
import OrderTabs from '@/components/trading/spot-trading/TradingFooter';
import TradingChart from '@/components/trading/spot-trading/TradingChart';
import { initializeSocket } from '@/lib/socket';

interface CoinInfo {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
}

function TradingPageContent() {
  const [activeTab, setActiveTab] = useState<"chart" | "info">("chart");
  const searchParams = useSearchParams();
  const initialAsset = searchParams?.get('asset') || 'BTC/USDT';
  const quoteParam   = searchParams?.get('quote') || 'USDT';

  // Coin dropdown state
  const [coins, setCoins]               = useState<CoinInfo[]>([]);
  const [coinsLoading, setCoinsLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<CoinInfo>({
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    current_price: 0,
    price_change_percentage_24h: 0,
    market_cap_rank: 1,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [dropdownPos,  setDropdownPos]  = useState({ top: 0, left: 0, width: 288 });

  // Refs — trigger button for measuring, overlay div for outside-click
  const triggerRef  = useRef<HTMLButtonElement>(null);
  const overlayRef  = useRef<HTMLDivElement>(null);

  // Live market data
  const [marketInfo, setMarketInfo] = useState<any>(null);

  // Fetch top 100 coins from CoinGecko on mount
  useEffect(() => {
    fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false',
    )
      .then((r) => r.json())
      .then((data: CoinInfo[]) => {
        if (!Array.isArray(data)) return;
        setCoins(data);
        // Pre-select the coin that matches the URL param
        const assetBase = initialAsset.split('/')[0].toLowerCase();
        const match = data.find((c) => c.symbol.toLowerCase() === assetBase);
        if (match) setSelectedCoin(match);
      })
      .catch(console.error)
      .finally(() => setCoinsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown when clicking outside the fixed overlay
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;
      const isInsideOverlay  = overlayRef.current?.contains(target);
      const isInsideTrigger  = triggerRef.current?.contains(target);
      if (!isInsideOverlay && !isInsideTrigger) {
        setDropdownOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [dropdownOpen]);

  // Recalculate position when window resizes while open
  useEffect(() => {
    if (!dropdownOpen) return;
    function onResize() {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      setDropdownPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 288) });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [dropdownOpen]);

  const openDropdown = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setDropdownPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 288) });
    setDropdownOpen(true);
    setSearchQuery('');
  }, []);

  // Socket live price for selected coin
  useEffect(() => {
    const assetBase = selectedCoin.symbol.toUpperCase();
    const socket = initializeSocket();
    const subCategory = searchParams?.get('category') || 'crypto';
    socket.emit('subscribe-market', subCategory.toLowerCase());
    const handler = (data: any) => {
      if (data?.[assetBase]) setMarketInfo(data[assetBase]);
    };
    socket.on('market-update', handler);
    return () => { socket.off('market-update', handler); };
  }, [selectedCoin.symbol]);

  const assetSymbol   = `${selectedCoin.symbol.toUpperCase()}/${quoteParam}`;
  const filteredCoins = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-[#181818] px-2 h-full text-gray-300 font-manrope">

      {/* Header Section */}
      <div className="flex items-center gap-4 md:px-4 px-6 md:py-4 py-2 border-b border-white/5 overflow-x-auto no-scrollbar">

        {/* ── Coin Selector Dropdown ── */}
        <div className="relative min-w-fit">
          <button
            ref={triggerRef}
            onClick={dropdownOpen ? () => { setDropdownOpen(false); setSearchQuery(''); } : openDropdown}
            className="flex items-center gap-2 bg-[#222] hover:bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
          >
            <img
              src={selectedCoin.image}
              alt={selectedCoin.name}
              className="md:w-7 md:h-7 w-5 h-5 rounded-full"
              onError={(e) => { e.currentTarget.src = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'; }}
            />
            <div className="flex flex-col items-start">
              <span className="text-white md:text-sm text-xs font-bold leading-none">
                {selectedCoin.symbol.toUpperCase()}/USDT
              </span>
              <span className="text-gray-500 text-[10px] leading-none mt-0.5">{selectedCoin.name}</span>
            </div>
            <svg className={`w-3 h-3 text-gray-400 transition-transform ml-1 ${dropdownOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 320 512">
              <path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z" />
            </svg>
          </button>

          {/* Portal — renders outside the overflow-clipping header */}
          {dropdownOpen && typeof document !== 'undefined' && createPortal(
            <div
              ref={overlayRef}
              style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
              className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Search */}
              <div className="p-2 border-b border-white/10">
                <input
                  autoFocus
                  type="search"
                  placeholder="Search coin…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  name="coin-search"
                  className="w-full bg-[#2a2a2a] text-white text-sm rounded-lg px-3 py-1.5 outline-none placeholder-gray-600 border border-white/10 focus:border-[#f0b90b]/50"
                />
              </div>

              {/* Coin list */}
              <div className="max-h-80 overflow-y-auto">
                {coinsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-[#f0b90b] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredCoins.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">No results</p>
                ) : (
                  filteredCoins.map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => {
                        setSelectedCoin(coin);
                        setDropdownOpen(false);
                        setSearchQuery('');
                        setMarketInfo(null);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors ${
                        coin.id === selectedCoin.id ? 'bg-[#f0b90b]/10' : ''
                      }`}
                    >
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        onError={(e) => { e.currentTarget.src = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'; }}
                      />
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="text-white text-sm font-semibold leading-tight">
                          {coin.symbol.toUpperCase()}/USDT
                        </span>
                        <span className="text-gray-500 text-[11px] truncate w-full text-left leading-tight">{coin.name}</span>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                        <span className="text-white text-xs font-medium">
                          ${coin.current_price.toLocaleString()}
                        </span>
                        <span className={`text-[11px] font-medium ${(coin.price_change_percentage_24h ?? 0) >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
                          {(coin.price_change_percentage_24h ?? 0) >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* Market Stats */}
        <div className="flex gap-4 font-semibold text-[11px]">
          <div>
            <p className={`md:text-lg text-sm font-bold ${(marketInfo?.usd_24h_change ?? selectedCoin.price_change_percentage_24h) >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
              ${(marketInfo?.usd ?? selectedCoin.current_price)?.toLocaleString() || '0.00'}
            </p>
            <p className="text-gray-500 text-[12px]">${(marketInfo?.usd ?? selectedCoin.current_price)?.toLocaleString() || '0.00'}</p>
          </div>
          <div>
            <p className="text-gray-500 md:text-[12px] text-[10px]">24h Change</p>
            <p className={`text-sm ${(selectedCoin.price_change_percentage_24h ?? 0) >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
              {selectedCoin.price_change_percentage_24h?.toFixed(2) || '0.00'}%
            </p>
          </div>
          <div>
            <p className="text-gray-500 md:text-[12px] text-[10px]">24h High</p>
            <p className="text-white text-sm font-medium">{marketInfo?.high24h || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 md:text-[12px] text-[10px]">24h Low</p>
            <p className="text-white text-sm font-medium">{marketInfo?.low24h || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 md:text-[12px] text-[9px]">24hvol({selectedCoin.symbol.toUpperCase()})</p>
            <p className="text-white text-sm font-medium">{marketInfo?.volume24h?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-gray-500 md:text-[12px] text-[9px]">24hvol({quoteParam})</p>
            <p className="text-white text-sm font-medium">{marketInfo?.volume24h?.toLocaleString() || '0'}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-full gap-px bg-white/5">
        <div className="grow flex flex-col min-w-0 bg-[#181818]">
          {/* Chart / Info tabs */}
          <div className="flex items-center gap-4 px-4 md:py-3 py-2 border-b border-white/5 text-[12px] font-semibold">
            <span
              onClick={() => setActiveTab("chart")}
              className={`pb-1 !cursor-pointer transition-all ${activeTab === "chart" ? "text-[#00B595] border-b-2 border-[#00B595]" : "text-gray-500 hover:text-white"}`}
            >
              Chart
            </span>
            <span
              onClick={() => setActiveTab("info")}
              className={`pb-1 !cursor-pointer transition-all ${activeTab === "info" ? "text-[#00B595] border-b-2 border-[#00B595]" : "text-gray-500 hover:text-white"}`}
            >
              Info
            </span>
          </div>

          <div className="h-137.5">
            <TradingChart
              activeView={activeTab}
              symbol={assetSymbol}
              coinId={selectedCoin.id}
              coinImage={selectedCoin.image}
              coinName={selectedCoin.name}
              marketInfo={marketInfo}
            />
          </div>
        </div>

        <OrderBook />
        <TradeForm symbol={assetSymbol} />
      </div>

      <OrderTabs />
    </div>
  );
}

export default function TradingPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#181818] flex items-center justify-center text-gray-500">Loading trading terminal...</div>}>
      <TradingPageContent />
    </Suspense>
  );
}