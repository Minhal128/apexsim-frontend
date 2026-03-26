"use client";
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import OrderBook from '@/components/trading/futures-trading/FutureTradingBook';
import TradeForm from '@/components/trading/futures-trading/FutureTradingForm';
import OrderTabs from '@/components/trading/futures-trading/FutureTradingFooter';
import TradingChart from '@/components/trading/futures-trading/FutureTradingChart';
import CoinSelector from '@/components/trading/futures-trading/CoinSelector';
import { initializeSocket } from '@/lib/socket';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ToastContext';
import { APP_LANGUAGE_EVENT, AppLanguageCode, getAppLanguage, t } from '@/lib/i18n';


interface CoinInfo {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
}

interface FuturesPosition {
  margin?: number;
  totalCost?: number;
  leverage?: number;
  unrealizedPnl?: number;
}

function FutureTradingPageContent() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sharedSize, setSharedSize] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const assetParam = searchParams?.get('asset') || 'BTC/USDT';
  const quoteParam = searchParams?.get('quote') || 'USDT';
  const categoryParam = searchParams?.get('category') || 'crypto';
  // For crypto: BTC/USDT -> BTC, for others: GOLD -> GOLD
  const assetBase = assetParam.includes('/') ? assetParam.split('/')[0] : assetParam;

  // Coin dropdown state
  const [coins, setCoins]               = useState<CoinInfo[]>([]);
  const [coinsLoading, setCoinsLoading] = useState(true);
  const [category, setCategory] = useState(categoryParam || 'crypto');
  const categories = ['crypto', 'forex', 'commodities', 'indices', 'stocks'];
  const [selectedCoin, setSelectedCoin] = useState<CoinInfo>({
    id: assetBase.toLowerCase(),
    symbol: assetBase.toLowerCase(),
    name: assetBase,
    image: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${assetBase.toLowerCase().replace('^', '')}.png`,
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

  const [marketInfo, setMarketInfo] = useState<any>(null);
  const [lang, setLang] = useState<AppLanguageCode>("Eng");
  const tr = (key: string) => t(key, lang);

  useEffect(() => {
    let mounted = true;
    setMarketInfo(null);
    
    const fetchMarketData = async () => {
      try {
        const data = await apiRequest("/market/prices");
        if (!mounted) return;
        
        const match = data[assetBase] || data[assetBase.toUpperCase()] || data[`^${assetBase}`] || data[assetBase.replace('^', '')];
        if (match) {
          setMarketInfo(match);
        }
      } catch (err) {
        console.error("Backend market data failed", err);
      }
    };

    fetchMarketData();

    const socket = initializeSocket();
    socket.emit('subscribe-market', categoryParam.toLowerCase());
    
    const handler = (data: any) => {
      const match = data[assetBase] || data[assetBase.toUpperCase()] || data[`^${assetBase}`] || data[assetBase.replace('^', '')];
      if (match && (match.usd || match.price || match.value || match.regularMarketPrice) > 0) {
        setMarketInfo(match);
      }
    };

    socket.on('market-data', handler);
    socket.on('market-update', handler);

    const interval = setInterval(fetchMarketData, 5000); // 5s fallback

    return () => {
      mounted = false;
      socket.off('market-data', handler);
      socket.off('market-update', handler);
      clearInterval(interval);
    };
  }, [assetBase, categoryParam]);

  const getIconUrl = (symbol: string) => {
    const mapping: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'SOL': 'solana',
      'BNB': 'binancecoin',
      'XRP': 'ripple',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
    };
    const coinId = mapping[symbol] || 'bitcoin';

    const idMapping: { [key: string]: string } = {
      'BTC': '1',
      'ETH': '279',
      'USDT': '825',
      'SOL': '4128',
    };
    const id = idMapping[symbol];

  };

  
  // Sync selectedCoin when URL asset changes
  useEffect(() => {
    const match = coins.find((c) => c.symbol.toLowerCase() === assetBase.toLowerCase());
    if (match && match.symbol.toLowerCase() !== selectedCoin.symbol.toLowerCase()) {
      setSelectedCoin(match);
      setMarketInfo(null); // Reset market info for new asset
    }
  }, [assetBase, coins]);

  // Fetch coins from backend or socket
  useEffect(() => {
    let mounted = true;
    const socket = initializeSocket();
    socket.emit('subscribe-market', category);
    
    const handleMarketData = (data: any) => {
      const validData = Object.entries(data).filter(([_, details]: [string, any]) => (details.usd > 0 || details.price > 0 || details.value > 0 || details.regularMarketPrice > 0));
      if (validData.length > 0) {
        const formatted: CoinInfo[] = validData.map(([symbol, details]: [string, any]) => ({
          id: symbol.toLowerCase(),
          symbol: details.symbol || symbol.toUpperCase(),
          name: details.name || details.pair || symbol,
          current_price: details.usd || details.price || details.value || details.regularMarketPrice || 0,
          price_change_percentage_24h: details.change24h || details.regularMarketChangePercent || 0,
          image: details.image || `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase().replace('^', '')}.png`,
          market_cap_rank: 1
        }));
        setCoins(formatted);
        const match = formatted.find((c) => c.symbol.toLowerCase() === assetBase.toLowerCase());
        if (match) setSelectedCoin(match);
        setCoinsLoading(false);
      }
    };

    apiRequest('/market/prices').then((data: any) => {
      if (!mounted) return;
      handleMarketData(data);
    }).catch((e) => {
      console.error("Failed to load initial market data", e);
      setCoinsLoading(false);
    });

    socket.on('market-data', handleMarketData);
    socket.on('market-update', handleMarketData);

    return () => {
      mounted = false;
      socket.off('market-data', handleMarketData);
      socket.off('market-update', handleMarketData);
    };
  }, [category, assetBase]); 

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

  const [walletInfo, setWalletInfo] = useState<any>({
    total: "0.00",
    equity: "0.00",
    marginUsed: "0.00",
    marginLevel: "0%",
    pnl: "0.00"
  });
  const [activeView, setActiveView] = useState<'chart' | 'info'>('chart');

  const fetchWallet = async () => {
    try {
      const [walletData, positionsData] = await Promise.all([
        apiRequest("/wallet"),
        apiRequest("/trading/positions").catch(() => []),
      ]);

      const futuresUsdtRaw = walletData?.futuresBalances?.find((b: any) => b.asset === "USDT")?.amount || 0;
      const positions = Array.isArray(positionsData) ? (positionsData as FuturesPosition[]) : [];

      const futuresUsdt = Number(futuresUsdtRaw);
      const safeFuturesUsdt = Number.isFinite(futuresUsdt) ? futuresUsdt : 0;

      const marginUsed = positions.reduce((sum: number, pos: FuturesPosition) => {
        const totalCost = Number(pos.totalCost || 0);
        const leverage = Number(pos.leverage || 1);
        const fallbackMargin = totalCost / (leverage || 1);
        const margin = Number(pos.margin);
        return sum + (Number.isFinite(margin) && margin > 0 ? margin : (Number.isFinite(fallbackMargin) ? fallbackMargin : 0));
      }, 0);

      const unrealizedPnl = positions.reduce((sum: number, pos: FuturesPosition) => {
        const pnl = Number(pos.unrealizedPnl);
        return sum + (Number.isFinite(pnl) ? pnl : 0);
      }, 0);

      const equity = safeFuturesUsdt + marginUsed + unrealizedPnl;
      const marginLevelValue = marginUsed > 0 ? (equity / marginUsed) * 100 : 0;

      setWalletInfo({
        total: safeFuturesUsdt.toFixed(2),
        equity: equity.toFixed(2),
        marginUsed: marginUsed.toFixed(2),
        marginLevel: marginUsed > 0 ? `${marginLevelValue.toFixed(0)}%` : "0%",
        pnl: unrealizedPnl.toFixed(2),
      });
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    }
  };

  useEffect(() => {
    fetchWallet();

    const refreshInterval = setInterval(fetchWallet, 10000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const socket = initializeSocket();
    if (!socket) return;

    const refresh = () => {
      fetchWallet();
    };

    socket.on('wallet-update', refresh);
    socket.on('trading:order-placed', refresh);
    socket.on('trading:order-executed', refresh);
    socket.on('trading:order-cancelled', refresh);

    return () => {
      socket.off('wallet-update', refresh);
      socket.off('trading:order-placed', refresh);
      socket.off('trading:order-executed', refresh);
      socket.off('trading:order-cancelled', refresh);
    };
  }, []);

  useEffect(() => {
    const applyLanguage = () => setLang(getAppLanguage());
    applyLanguage();
    window.addEventListener('storage', applyLanguage);
    window.addEventListener(APP_LANGUAGE_EVENT, applyLanguage as EventListener);
    return () => {
      window.removeEventListener('storage', applyLanguage);
      window.removeEventListener(APP_LANGUAGE_EVENT, applyLanguage as EventListener);
    };
  }, []);

  
  const filteredCoins = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleExecuteTrade = async (type: 'buy' | 'sell', amount: number, price: number) => {
    if (amount <= 0) {
      toast.addToast("Please enter a valid size", "error");
      return;
    }
    try {
      await apiRequest("/trading/order", {
        method: "POST",
        body: {
          symbol: assetParam,
          type: type,
          marketType: "futures",
          price: price,
          amount: amount,
          leverage: 5, // Default leverage
          marginMode: "cross",
          orderType: "market"
        } as any,
      });
      toast.addToast(`Position opened successfully!`, "success");
      fetchWallet();
    } catch (err: any) {
      toast.addToast(err.message || "Failed to open position", "error");
    }
  };

  return (
    <div className="bg-[#181818] min-h-screen text-gray-300 font-manrope overflow-x-hidden">

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
              onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${selectedCoin.symbol.substring(0,3)}&background=2A2A2A&color=fff&rounded=true&bold=true`; }}
            />
            <div className="flex flex-col items-start">
              <span className="text-white md:text-sm text-xs font-bold leading-none">
                {selectedCoin.symbol.toUpperCase()}{category === 'crypto' ? '/USDT' : ''}
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
              {/* Categories */}
              <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar border-b border-white/10">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setCoins([]); setCoinsLoading(true); }}
                    className={`px-2 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${category === cat ? 'bg-[#f0b90b] text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="p-2 border-b border-white/10">
                <input
                  autoFocus
                  type="search"
                  placeholder={tr('searchCoin')}
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
                  <p className="text-gray-500 text-sm text-center py-6">{tr('noResults')}</p>
                ) : (
                  filteredCoins.map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => {
                        setSelectedCoin(coin);
                        setDropdownOpen(false);
                        setSearchQuery('');
                        setMarketInfo(null);

                        // Keep URL in sync so refresh/bookmarks keep the selected asset
                        // For crypto use SYMBOL/USDT, for other categories just the symbol
                        const assetValue = category === 'crypto' 
                          ? `${coin.symbol.toUpperCase()}/USDT`
                          : coin.symbol.toUpperCase();
                        router.replace(`?asset=${assetValue}&category=${category}`);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors ${
                        coin.id === selectedCoin.id ? 'bg-[#f0b90b]/10' : ''
                      }`}
                    >
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${coin.symbol.substring(0,3)}&background=2A2A2A&color=fff&rounded=true&bold=true`; }}
                      />
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="text-white text-sm font-semibold leading-tight">
                          {coin.symbol.toUpperCase()}{category === 'crypto' ? '/USDT' : ''}
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
        <div className="flex gap-4 font-semibold text-[11px] min-w-max">
          <div>
            <p className={`md:text-lg text-sm font-bold ${(marketInfo?.regularMarketChangePercent ?? marketInfo?.changePercent ?? marketInfo?.usd_24h_change ?? selectedCoin.price_change_percentage_24h) >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
              ${(marketInfo?.price ?? marketInfo?.value ?? marketInfo?.usd ?? marketInfo?.regularMarketPrice ?? selectedCoin.current_price)?.toLocaleString() || '0.00'}
            </p>
            <p className="text-gray-500 text-[12px]">${(marketInfo?.price ?? marketInfo?.value ?? marketInfo?.usd ?? marketInfo?.regularMarketPrice ?? selectedCoin.current_price)?.toLocaleString() || '0.00'}</p>
          </div>
          <div>
            <p className="text-gray-500 md:text-[12px] text-[10px]">{tr('change24h')}</p>
            <p className={`text-sm ${(marketInfo?.change24h ?? marketInfo?.regularMarketChangePercent ?? marketInfo?.usd_24h_change ?? selectedCoin.price_change_percentage_24h ?? 0) >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
              {(marketInfo?.change24h ?? marketInfo?.regularMarketChangePercent ?? marketInfo?.usd_24h_change ?? selectedCoin.price_change_percentage_24h)?.toFixed(2) || '0.00'}%
            </p>
          </div>
          <div>
            <p className="text-gray-500 md:text-[12px] text-[10px]">{tr('high24h')}</p>
            <p className="text-white text-sm font-medium">{(marketInfo?.high24h ?? marketInfo?.regularMarketDayHigh)?.toLocaleString() || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 md:text-[12px] text-[10px]">{tr('low24h')}</p>
            <p className="text-white text-sm font-medium">{(marketInfo?.low24h ?? marketInfo?.regularMarketDayLow)?.toLocaleString() || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 md:text-[12px] text-[9px]">24hvol({selectedCoin.symbol.toUpperCase()})</p>
            <p className="text-white text-sm font-medium">
              {(marketInfo?.volume24h ?? marketInfo?.regularMarketVolume) && (marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value ?? marketInfo?.regularMarketPrice) 
                  ? ((marketInfo?.volume24h ?? marketInfo?.regularMarketVolume) / (marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value ?? marketInfo?.regularMarketPrice)).toLocaleString(undefined, { maximumFractionDigits: 0 }) 
                  : '0'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 md:text-[12px] text-[9px]">24hvol({quoteParam})</p>
            <p className="text-white text-sm font-medium">{(marketInfo?.volume24h ?? marketInfo?.regularMarketVolume)?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}</p>
          </div>
        </div>

        {/* Futures Account Metrics */}
        <div className="hidden md:flex items-center ml-auto bg-[#1f1f1f] border border-white/10 rounded-md overflow-hidden min-w-fit">
          <div className="px-3 py-1.5 border-r border-white/10">
            <p className="text-[10px] text-gray-400">{tr('walletBalance')}</p>
            <p className="text-xs font-semibold text-white">${walletInfo.total}</p>
          </div>
          <div className="px-3 py-1.5 border-r border-white/10">
            <p className="text-[10px] text-gray-400">{tr('equity')}</p>
            <p className="text-xs font-semibold text-white">${walletInfo.equity}</p>
          </div>
          <div className="px-3 py-1.5 border-r border-white/10">
            <p className="text-[10px] text-gray-400">{tr('margin')}</p>
            <p className="text-xs font-semibold text-white">{walletInfo.marginLevel}</p>
          </div>
          <div className="px-3 py-1.5">
            <p className="text-[10px] text-gray-400">{tr('pnl')}</p>
            <p className={`text-xs font-semibold ${Number(walletInfo.pnl) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {Number(walletInfo.pnl) > 0 ? '+' : ''}${walletInfo.pnl}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full md:overflow-y-auto lg:overflow-visible">

        <div className="flex flex-col flex-1 min-w-0">

          <div className="flex flex-col lg:flex-row border-b border-white/5">
            {/* Chart Area */}
            <div className="grow flex flex-col min-w-0 bg-[#181818] lg:border-r border-white/5 order-1">
              <div className="flex items-center gap-4 px-4 md:py-3 py-2 border-b border-white/5 text-[12px] font-semibold">
                <span
                  className={`pb-1 cursor-pointer ${activeView === 'chart'
                    ? 'text-[#00B595] border-b-2 border-[#00B595]'
                    : 'text-gray-500 hover:text-white transition-colors'}`}
                  onClick={() => setActiveView('chart')}
                >
                  {tr('chart')}
                </span>
                <span
                  className={`pb-1 cursor-pointer ${activeView === 'info'
                    ? 'text-[#00B595] border-b-2 border-[#00B595]'
                    : 'text-gray-500 hover:text-white transition-colors'}`}
                  onClick={() => setActiveView('info')}
                >
                  {tr('info')}
                </span>
              </div>
              <div className="h-100 md:h-137.5">
                <TradingChart
                  activeView={activeView}
                  symbol={assetParam}
                  currentPrice={(marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value ?? marketInfo?.regularMarketPrice)}
                  high24h={(marketInfo?.high24h ?? marketInfo?.regularMarketDayHigh)}
                  low24h={(marketInfo?.low24h ?? marketInfo?.regularMarketDayLow)}
                  marketInfo={marketInfo}
                  onTrade={handleExecuteTrade}
                  externalSize={sharedSize}
                  onSizeChange={setSharedSize}
                />
              </div>
            </div>

            <div className="w-full md:w-[320px] shrink-0 border-b md:border-b-0 lg:border-r border-white/5 order-2">
              <OrderBook symbol={assetParam} currentPrice={(marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value ?? marketInfo?.regularMarketPrice)} />
            </div>
          </div>

          <div className="w-full lg:hidden mt-35 order-3 bg-[#181818] border-b border-white/5">
            <TradeForm
              symbol={assetParam}
              balance={walletInfo.total}
              externalSize={sharedSize}
              onSizeChange={setSharedSize}
              currentPrice={(marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value ?? marketInfo?.regularMarketPrice)}
            />
          </div>

          <div className="w-full order-last md:order-0">
            <OrderTabs />
          </div>
        </div>

        <div className="hidden md:block w-[320px] shrink-0 bg-[#181818] border-l border-white/5">
          <TradeForm
            symbol={assetParam}
            balance={walletInfo.total}
            externalSize={sharedSize}
            onSizeChange={setSharedSize}
            currentPrice={(marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value ?? marketInfo?.regularMarketPrice)}
          />
        </div>
      </div>

      
    </div>
  );
}

export default function FutureTradingPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#181818] flex items-center justify-center text-gray-500">Loading futures trading...</div>}>
      <FutureTradingPageContent />
    </Suspense>
  );
}
