"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import OrderBook from '@/components/trading/futures-trading/FutureTradingBook';
import TradeForm from '@/components/trading/futures-trading/FutureTradingForm';
import OrderTabs from '@/components/trading/futures-trading/FutureTradingFooter';
import TradingChart from '@/components/trading/futures-trading/FutureTradingChart';
import CoinSelector from '@/components/trading/futures-trading/CoinSelector';
import { initializeSocket } from '@/lib/socket';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ToastContext';

function FutureTradingPageContent() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sharedSize, setSharedSize] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const assetParam = searchParams?.get('asset') || 'BTC/USDT';
  const quoteParam = searchParams?.get('quote') || 'USDT';
  const assetBase = assetParam.split('/')[0];

  const [marketInfo, setMarketInfo] = useState<any>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Try backend first
        const data = await apiRequest("/market/prices");
        if (data && data[assetBase] && data[assetBase].usd > 0) {
          setMarketInfo(data[assetBase]);
          return;
        }
      } catch (err) {
        console.error("Backend market data failed, trying public API fallout...");
      }

      // Secondary Fallback: Direct Public CoinGecko fetch (Only for price/change)
      try {
        const coinMapping: { [key: string]: string } = {
          'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'USDT': 'tether'
        };
        const coinId = coinMapping[assetBase] || 'bitcoin';
        const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_24hr_high_low=true`);
        const data = await resp.json();
        
        if (data[coinId]) {
          setMarketInfo({
            usd: data[coinId].usd,
            change24h: data[coinId].usd_24h_change,
            high24h: data[coinId].usd_24h_high || data[coinId].usd * 1.02,
            low24h: data[coinId].usd_24h_low || data[coinId].usd * 0.98,
            volume24h: data[coinId].usd_24h_vol || 0,
            image: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${assetBase.toLowerCase()}.png`
          });
        }
      } catch (e) {
        console.error("Critical: All market data sources failed", e);
      }
    };

    fetchMarketData();

    const socket = initializeSocket();
    const subCategory = searchParams?.get('category') || 'crypto';
    socket.emit('subscribe-market', subCategory.toLowerCase());
    
    const handler = (data: any) => {
      if (data && data[assetBase] && data[assetBase].usd > 0) {
        setMarketInfo(data[assetBase]);
      }
    };

    socket.on('market-data', handler);
    socket.on('market-update', handler);

    const interval = setInterval(fetchMarketData, 10000); // 10s fallback

    return () => {
      socket.off('market-data', handler);
      socket.off('market-update', handler);
      clearInterval(interval);
    };
  }, [assetBase]);

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
    if (id) return `https://assets.coingecko.com/coins/images/${id}/small/${mapping[symbol] || symbol.toLowerCase()}.png`;
    return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`;
  };

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
      const data = await apiRequest("/wallet");
      const usdt = data.balances?.find((b: any) => b.asset === "USDT")?.amount || 0;
      setWalletInfo((prev: any) => ({
        ...prev,
        total: usdt.toFixed(2),
        equity: usdt.toFixed(2), // Simplification
      }));
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

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

      <div className="flex items-center justify-between gap-4 md:px-4 px-4 md:py-5 py-3 border-b border-white/5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6 shrink-0">
          <div 
            onClick={() => setIsSelectorOpen(true)}
            className="flex items-center gap-2 min-w-fit cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors"
          >
            <img
              src={marketInfo?.image || getIconUrl(assetBase)}
              className="md:w-6 md:h-6 w-5 h-5 rounded-full object-contain bg-white/5"
              alt={assetBase.toLowerCase()}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${assetBase.toLowerCase()}.png`;
              }}
            />
            <div className='flex items-center gap-1 whitespace-nowrap'>
              <span className="text-white md:text-[16px] text-sm font-bold">{assetParam}</span>
              <span className="text-[12px] text-gray-500 font-medium ml-1">{assetBase}</span>
              <span className="text-gray-600 transition-transform group-hover:translate-y-0.5">▼</span>
            </div>
          </div>
          <div className="flex gap-6 items-center shrink-0">
            <div className="whitespace-nowrap">
              <p className={`text-[16px] font-bold ${!marketInfo ? 'text-gray-600' : (marketInfo?.change24h || 0) >= 0 ? 'text-[#00B595]' : 'text-[#ef5350]'}`}>
                {marketInfo?.usd ? marketInfo.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Loading...'}
              </p>
              <p className="text-gray-500 text-[11px] font-medium">
                ${marketInfo?.usd ? marketInfo.usd.toLocaleString() : '---'}
              </p>
            </div>
            <div className="whitespace-nowrap">
              <p className="text-gray-500 text-[11px]">24h Change</p>
              <p className={`text-[13px] font-medium ${!marketInfo ? 'text-gray-600' : (marketInfo?.change24h || 0) >= 0 ? 'text-[#00B595]' : 'text-[#ef5350]'}`}>
                {marketInfo?.change24h ? marketInfo.change24h.toFixed(2) : '0.00'}%
              </p>
            </div>
            <div className="whitespace-nowrap">
              <p className="text-gray-500 text-[11px]">24h High</p>
              <p className="text-white text-[13px] font-medium">{marketInfo?.high24h ? marketInfo.high24h.toLocaleString() : '---'}</p>
            </div>
            <div className="whitespace-nowrap">
              <p className="text-gray-500 text-[11px]">24h Low</p>
              <p className="text-white text-[13px] font-medium">{marketInfo?.low24h ? marketInfo.low24h.toLocaleString() : '---'}</p>
            </div>
            <div className="whitespace-nowrap">
              <p className="text-gray-500 text-[11px]">24h Vol ({assetBase})</p>
              <p className="text-white text-[13px] font-medium">
                {marketInfo?.volume24h && marketInfo?.usd 
                  ? (marketInfo.volume24h / marketInfo.usd).toLocaleString(undefined, { maximumFractionDigits: 0 }) 
                  : '0'}
              </p>
            </div>
            <div className="whitespace-nowrap">
              <p className="text-gray-500 text-[11px]">24h Vol ({quoteParam})</p>
              <p className="text-white text-[13px] font-medium">{marketInfo?.volume24h ? marketInfo.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:pr-20 shrink-0">
          <div className="bg-[#262629]/50 px-4 py-2 rounded flex items-center gap-6 border border-white/5 whitespace-nowrap">
            <div className="flex flex-col cursor-pointer"><span className="text-gray-500 text-[10px]">Total Balance</span><span className="text-white text-[15px] font-bold">${walletInfo.total}</span></div>
            <div className="flex flex-col border-l border-white/10 pl-4 cursor-pointer"><span className="text-gray-500 text-[10px]">Equity</span><span className="text-white text-[15px] font-bold">${walletInfo.equity}</span></div>
            <div className="flex flex-col border-l border-white/10 pl-4 cursor-pointer"><span className="text-gray-500 text-[10px]">Margin Used</span><span className="text-white text-[15px] font-bold">${walletInfo.marginUsed}</span></div>
            <div className="flex flex-col border-l border-white/10 pl-4 cursor-pointer"><span className="text-gray-500 text-[10px]">Margin Level</span><span className="text-white text-[15px] font-bold">{walletInfo.marginLevel}</span></div>
            <div className="flex flex-col border-l border-white/10 pl-4 cursor-pointer"><span className="text-gray-500 text-[10px]">Pnl</span><span className="text-[#0088FF] text-[15px] font-bold">{walletInfo.pnl >= 0 ? '+' : ''}${walletInfo.pnl}</span></div>
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
                  Chart
                </span>
                <span
                  className={`pb-1 cursor-pointer ${activeView === 'info'
                    ? 'text-[#00B595] border-b-2 border-[#00B595]'
                    : 'text-gray-500 hover:text-white transition-colors'}`}
                  onClick={() => setActiveView('info')}
                >
                  Info
                </span>
              </div>
              <div className="h-100 md:h-137.5">
                <TradingChart
                  activeView={activeView}
                  symbol={assetParam}
                  currentPrice={marketInfo?.usd}
                  high24h={marketInfo?.high24h}
                  low24h={marketInfo?.low24h}
                  marketInfo={marketInfo}
                  onTrade={handleExecuteTrade}
                  externalSize={sharedSize}
                  onSizeChange={setSharedSize}
                />
              </div>
            </div>

            <div className="w-full md:w-[320px] shrink-0 border-b md:border-b-0 lg:border-r border-white/5 order-2">
              <OrderBook symbol={assetParam} currentPrice={marketInfo?.usd} />
            </div>
          </div>

          <div className="w-full lg:hidden mt-35 order-3 bg-[#181818] border-b border-white/5">
            <TradeForm
              symbol={assetParam}
              balance={walletInfo.total}
              externalSize={sharedSize}
              onSizeChange={setSharedSize}
              currentPrice={marketInfo?.usd}
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
            currentPrice={marketInfo?.usd}
          />
        </div>

      </div>

      <CoinSelector 
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={(symbol) => {
          router.push(`/dashboard/futures-trade?asset=${symbol}`);
        }}
        currentAsset={assetParam}
      />
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
