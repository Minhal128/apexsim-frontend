"use client";
import React, { useState, useEffect } from 'react';
import { FaCaretDown } from "react-icons/fa";
import { apiRequest } from '@/lib/api';
import { initializeSocket } from '@/lib/socket';
import { APP_LANGUAGE_EVENT, AppLanguageCode, getAppLanguage, t } from '@/lib/i18n';
import { useToast } from '@/components/ToastContext';

interface FooterPositionRow {
  _id?: string;
  symbol?: string;
  quantity?: number;
  avgPrice?: number;
  margin?: number;
  totalCost?: number;
}

export default function FutureTradingFooter() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"openOrders" | "ordersHistory" | "tradeHistory" | "positions" | "funds">("openOrders");
  const [orders, setOrders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [marketPrices, setMarketPrices] = useState<{[key: string]: number}>({});
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<AppLanguageCode>('Eng');
  const tr = (key: string) => t(key, lang);

  const tabs: Array<{ key: "openOrders" | "ordersHistory" | "tradeHistory" | "positions" | "funds"; label: string }> = [
    { key: 'openOrders', label: tr('openOrders') },
    { key: 'ordersHistory', label: tr('ordersHistory') },
    { key: 'tradeHistory', label: tr('tradeHistory') },
    { key: 'positions', label: tr('positions') },
    { key: 'funds', label: tr('funds') },
  ];
  const columns = [tr('date'), tr('pair'), tr('type'), tr('side'), tr('price'), tr('amount'), tr('filled'), tr('total'), tr('action')];
  const positionColumns = [tr('pair'), tr('size'), tr('entry'), tr('markPrice'), tr('pnl'), tr('margin'), tr('roe'), tr('action')];

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

  const fetchData = async () => {
    try {
      const [ordersData, historyData, walletData, positionsData] = await Promise.all([
        apiRequest("/trading/open-orders"),
        apiRequest("/trading/history"),
        apiRequest("/wallet"),
        apiRequest("/trading/positions")
      ]);
      setOrders(ordersData || []);
      setHistory(historyData || []);
      setBalances(walletData?.balances || []);
      setPositions(positionsData || []);
    } catch (err) {
      console.error("Failed to fetch footer data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketPrices = async () => {
    try {
      const [cryptoData, stocksData, indicesData, forexData, commoditiesData] = await Promise.all([
        apiRequest('/market/prices'),
        apiRequest('/market/stocks'),
        apiRequest('/market/indices'),
        apiRequest('/market/forex'),
        apiRequest('/market/commodities'),
      ]);

      const nextPrices: { [key: string]: number } = {};

      const ingestPayload = (payload: Record<string, any> | null | undefined) => {
        if (!payload || typeof payload !== 'object') return;

        Object.entries(payload).forEach(([rawKey, details]) => {
          if (!details || typeof details !== 'object') return;

          const rawPrice =
            details.usd ??
            details.price ??
            details.value ??
            details.close ??
            details.regularMarketPrice;

          const price = Number(rawPrice);
          if (!Number.isFinite(price) || price <= 0) return;

          const key = (rawKey || '').toString().toUpperCase();
          const symbol = (details.symbol || rawKey || '').toString().toUpperCase();
          const base = symbol.includes('/') ? symbol.split('/')[0] : symbol;

          [key, symbol, base, `${base}/USDT`]
            .filter(Boolean)
            .forEach((k) => {
              nextPrices[k] = price;
            });
        });
      };

      ingestPayload(cryptoData);
      ingestPayload(stocksData);
      ingestPayload(indicesData);
      ingestPayload(forexData);
      ingestPayload(commoditiesData);

      if (Object.keys(nextPrices).length > 0) {
        setMarketPrices((prev) => ({ ...prev, ...nextPrices }));
      }
    } catch (err) {
      console.error('Failed to fetch market prices:', err);
    }
  };

  useEffect(() => {
    const socket = initializeSocket();
    
    // We expect the main trading page has already emitted subscribe-market.
    // If not, we could, but let's just listen.
    const handleMarketUpdate = (data: any) => {
        if (!data) return;
        const newPrices: {[key: string]: number} = {};
        Object.keys(data).forEach((coinKey) => {
            const details = data[coinKey];
            if (!details) return;

            const rawPrice = details.usd ?? details.price ?? details.value ?? details.regularMarketPrice;
            const price = Number(rawPrice);
            if (!Number.isFinite(price) || price <= 0) return;

            const normalizedCoinKey = (coinKey || '').toString().toUpperCase();
            const symbolFromPayload = (details.symbol || coinKey || '').toString().toUpperCase();
            const baseSymbol = symbolFromPayload.includes('/') ? symbolFromPayload.split('/')[0] : symbolFromPayload;

            [normalizedCoinKey, symbolFromPayload, baseSymbol, `${baseSymbol}/USDT`]
              .filter(Boolean)
              .forEach((k) => {
                newPrices[k] = price;
              });
        });

        if (Object.keys(newPrices).length > 0) {
          setMarketPrices(prev => ({...prev, ...newPrices}));
        }
    };

    const handleTradeUpdate = () => {
        // Instantly fetch data when a trade event occurs
        fetchData();
    };
    
    socket.on('market-update', handleMarketUpdate);
    socket.on('market-data', handleMarketUpdate);
    
    socket.on('trading:order-placed', handleTradeUpdate);
    socket.on('trading:order-executed', handleTradeUpdate);
    socket.on('trading:order-cancelled', handleTradeUpdate);
    socket.on('trading:position-opened', handleTradeUpdate);
    socket.on('trading:position-closed', handleTradeUpdate);
    
    return () => {
        socket.off('market-update', handleMarketUpdate);
        socket.off('market-data', handleMarketUpdate);
        socket.off('trading:order-placed', handleTradeUpdate);
        socket.off('trading:order-executed', handleTradeUpdate);
        socket.off('trading:order-cancelled', handleTradeUpdate);
        socket.off('trading:position-opened', handleTradeUpdate);
        socket.off('trading:position-closed', handleTradeUpdate);
    };
  }, []);

  useEffect(() => {
    fetchData();
    fetchMarketPrices();
    // Refresh every 10 seconds as a fallback
    const interval = setInterval(() => {
      fetchData();
      fetchMarketPrices();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const resolveMarkPrice = (symbol: string, fallback?: number) => {
    const normalized = (symbol || '').toString().toUpperCase();
    const base = normalized.includes('/') ? normalized.split('/')[0] : normalized;
    const resolved =
      marketPrices[normalized] ??
      marketPrices[base] ??
      marketPrices[`${base}/USDT`] ??
      fallback;

    const numeric = Number(resolved);
    return Number.isFinite(numeric) ? numeric : undefined;
  };

  const handleClosePosition = async (position: FooterPositionRow) => {
    const symbol = (position?.symbol || '').toString();
    const quantity = Math.abs(Number(position?.quantity || 0));

    if (!symbol || quantity <= 0) {
      toast.addToast('Invalid position data', 'error');
      return;
    }

    const closePrice = resolveMarkPrice(symbol, Number(position?.avgPrice));
    if (!closePrice || closePrice <= 0) {
      toast.addToast('Live market price not available for this position', 'error');
      return;
    }

    const closeType: 'buy' | 'sell' = Number(position?.quantity || 0) > 0 ? 'sell' : 'buy';
    const positionId = (position?._id || symbol).toString();

    setClosingPositionId(positionId);
    try {
      await apiRequest('/trading/order', {
        method: 'POST',
        body: ({
          symbol,
          type: closeType,
          marketType: 'futures',
          price: closePrice,
          amount: quantity,
          orderType: 'market',
          action: 'close',
        } as unknown as BodyInit),
      });

      toast.addToast(`${symbol} position closed`, 'success');
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to close position';
      toast.addToast(message, 'error');
    } finally {
      setClosingPositionId(null);
    }
  };

  const getActiveData = () => {
    if (activeTab === "positions") return positions;
    if (activeTab === "openOrders") return orders;
    if (activeTab === "ordersHistory" || activeTab === "tradeHistory") return history;
    if (activeTab === "funds") return balances;
    return [];
  };

  const data = getActiveData();

  return (
    <div className="bg-[#181818] border-t border-white/5 min-h-100 flex flex-col font-sans w-full relative">

      <div className="flex items-center justify-between border-b border-white/5 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-6 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 text-[14px] font-medium transition-all relative cursor-pointer whitespace-nowrap ${activeTab === tab.key ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#00B595]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar cursor-pointer">
        <div className="min-w-250 w-full">
          <div className={`grid ${activeTab === "positions" ? 'grid-cols-8' : 'grid-cols-10'} px-4 py-2 items-center`}>
            {activeTab === "funds" ? (
              <>
                <div className="text-gray-500 text-[15px] font-semibold py-3">Asset</div>
                <div className="text-gray-500 text-[15px] font-semibold py-3">Balance</div>
                <div className="text-gray-500 text-[15px] font-semibold py-3">Locked</div>
                <div className="col-span-7"></div>
              </>
            ) : activeTab === "positions" ? (
              positionColumns.map((col) => (
                <div key={col} className="text-gray-500 text-[15px] font-semibold flex items-center py-3">
                  {col}
                </div>
              ))
            ) : (
              columns.map((col) => (
                <div key={col} className="text-gray-500 text-[15px] font-semibold flex items-center py-3">
                  {col}
                  {col === 'Type' && (
                    <FaCaretDown size={12} className='pl-2' />
                  )}
                </div>
              ))
            )}

            {activeTab === "openOrders" && orders.length > 0 && (
              <div className="flex md:ml-1 justify-end">
                <button className="bg-[#2B2E33] hover:bg-[#363A40] text-white text-[12px] px-8 py-1.5 rounded-[3px] transition-colors cursor-pointer whitespace-nowrap border border-white/5">
                  {tr('cancelAll')}
                </button>
              </div>
            )}
          </div>

          <div className="px-4">
            {data.length > 0 ? (
              data.map((item: any, idx: number) => (
                <div key={item._id || idx} className={`grid ${activeTab === "positions" ? 'grid-cols-8' : 'grid-cols-10'} border-b border-white/5 py-3 text-[13px] text-gray-300 items-center`}>
                  {activeTab === "funds" ? (
                    <>
                      <div className="font-medium text-white">{item.asset}</div>
                      <div>{item.amount.toFixed(4)}</div>
                      <div className="text-gray-500">{item.locked?.toFixed(4) || "0.0000"}</div>
                      <div className="col-span-7"></div>
                    </>
                  ) : activeTab === "positions" ? (
                    (() => {
                      const symbol = (item.symbol || '').toString();
                      const quantity = Number(item.quantity || 0);
                      const size = Math.abs(quantity);
                      const entryPrice = Number(item.avgPrice || 0);
                      const markPrice = resolveMarkPrice(symbol, entryPrice) ?? entryPrice;
                      const margin = Number(item.margin || (item.totalCost / 5) || 0);
                      const pnl = quantity > 0
                        ? (markPrice - entryPrice) * size
                        : (entryPrice - markPrice) * size;
                      const roe = margin > 0 ? (pnl / margin) * 100 : 0;
                      const positionId = (item._id || symbol).toString();
                      const isClosing = closingPositionId === positionId;

                      return (
                        <>
                          <div className="text-white font-bold">{symbol} <span className={quantity > 0 ? 'text-green-500 text-[10px]' : 'text-red-500 text-[10px]'}>{quantity > 0 ? 'LONG' : 'SHORT'}</span></div>
                          <div>{size.toFixed(4)}</div>
                          <div>{entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                          <div>{markPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                          <div className={pnl >= 0 ? "text-green-500" : "text-red-500"}>{pnl > 0 ? '+' : ''}{pnl.toFixed(2)} USDT</div>
                          <div>{margin.toFixed(2)} USDT</div>
                          <div className={roe >= 0 ? "text-green-500" : "text-red-500"}>{roe > 0 ? '+' : ''}{roe.toFixed(2)}%</div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleClosePosition(item)}
                              disabled={isClosing}
                              className="text-blue-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isClosing ? tr('closing') : tr('closeLabel')}
                            </button>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <>
                      <div className="text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
                      <div className="text-white font-medium">{item.symbol}</div>
                      <div>{item.orderType || tr('market')}</div>
                      <div className={item.type === 'buy' ? 'text-green-500' : 'text-red-500'}>{item.type === 'buy' ? tr('buy').toUpperCase() : tr('sell').toUpperCase()}</div>
                      <div>{item.price?.toLocaleString()}</div>
                      <div>{item.amount}</div>
                      <div>{item.status === 'completed' ? item.amount : '0.00'}</div>
                      <div>{item.total?.toLocaleString()}</div>
                      <div className="text-gray-500">None</div>
                      <div className="flex justify-end">
                        {item.status === 'pending' && (
                          <button className="text-red-500 hover:text-red-400 text-[12px]">{tr('cancel')}</button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              !loading && (
                <div className="grow flex flex-col items-center justify-center py-20">
                  <div className="relative w-20 h-20 opacity-50">
                    <img src="/images/search.png" className="w-full h-full object-contain" alt="No data" />
                  </div>
                  <p className="text-gray-500 text-sm mt-4">{tr('noDataAvailable')}</p>
                </div>
              )
            )}
            {loading && data.length === 0 && (
              <div className="py-20 text-center text-gray-500 font-mono animate-pulse">
                {tr('loadingTradingData')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
