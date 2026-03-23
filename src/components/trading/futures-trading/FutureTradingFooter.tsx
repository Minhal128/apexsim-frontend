"use client";
import React, { useState, useEffect } from 'react';
import { FaCaretDown } from "react-icons/fa";
import { apiRequest } from '@/lib/api';
import { initializeSocket } from '@/lib/socket';

export default function FutureTradingFooter() {
  const [activeTab, setActiveTab] = useState("Open orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [marketPrices, setMarketPrices] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);

  const tabs = ["Open orders", "Orders history", "Trade history", "Positions", "Funds"];
  const columns = ["Date", "Pair", "Type", "Side", "Price", "Amount", "Filled", "Total", "Action"];
  const positionColumns = ["Pair", "Size", "Entry", "Mark Price", "Pnl", "Margin", "ROE", "Action"];

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

  useEffect(() => {
    const socket = initializeSocket();
    
    // We expect the main trading page has already emitted subscribe-market.
    // If not, we could, but let's just listen.
    const handleMarketUpdate = (data: any) => {
        if (!data) return;
        const newPrices: {[key: string]: number} = {};
        Object.keys(data).forEach(coin => {
            if (data[coin] && (data[coin].usd || data[coin].price || data[coin].value)) {
                newPrices[`${coin}/USDT`] = (data[coin].usd || data[coin].price || data[coin].value);
            }
        });
        setMarketPrices(prev => ({...prev, ...newPrices}));
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
    // Refresh every 10 seconds as a fallback
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getActiveData = () => {
    if (activeTab === "Positions") return positions;
    if (activeTab.startsWith("Open orders")) return orders;
    if (activeTab === "Orders history" || activeTab === "Trade history") return history;
    if (activeTab === "Funds") return balances;
    return [];
  };

  const data = getActiveData();

  return (
    <div className="bg-[#181818] border-t border-white/5 min-h-100 flex flex-col font-sans w-full relative">

      <div className="flex items-center justify-between border-b border-white/5 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-6 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-[14px] font-medium transition-all relative cursor-pointer whitespace-nowrap ${(activeTab === tab || (activeTab.startsWith("Open orders") && tab.startsWith("Open orders"))) ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {tab}
              {(activeTab === tab || (activeTab.startsWith("Open orders") && tab.startsWith("Open orders"))) && (
                <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#00B595]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar cursor-pointer">
        <div className="min-w-250 w-full">
          <div className="grid grid-cols-10 px-4 py-2 items-center">
            {activeTab === "Funds" ? (
              <>
                <div className="text-gray-500 text-[15px] font-semibold py-3">Asset</div>
                <div className="text-gray-500 text-[15px] font-semibold py-3">Balance</div>
                <div className="text-gray-500 text-[15px] font-semibold py-3">Locked</div>
                <div className="col-span-7"></div>
              </>
            ) : activeTab === "Positions" ? (
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

            {activeTab.startsWith("Open orders") && orders.length > 0 && (
              <div className="flex md:ml-1 justify-end">
                <button className="bg-[#2B2E33] hover:bg-[#363A40] text-white text-[12px] px-8 py-1.5 rounded-[3px] transition-colors cursor-pointer whitespace-nowrap border border-white/5">
                  Cancel all
                </button>
              </div>
            )}
          </div>

          <div className="px-4">
            {data.length > 0 ? (
              data.map((item: any, idx: number) => (
                <div key={item._id || idx} className="grid grid-cols-10 border-b border-white/5 py-3 text-[13px] text-gray-300 items-center">
                  {activeTab === "Funds" ? (
                    <>
                      <div className="font-medium text-white">{item.asset}</div>
                      <div>{item.amount.toFixed(4)}</div>
                      <div className="text-gray-500">{item.locked?.toFixed(4) || "0.0000"}</div>
                      <div className="col-span-7"></div>
                    </>
                  ) : activeTab === "Positions" ? (
                    <>
                      <div className="text-white font-bold">{item.symbol} <span className={item.quantity > 0 ? 'text-green-500 text-[10px]' : 'text-red-500 text-[10px]'}>{item.quantity > 0 ? 'LONG' : 'SHORT'}</span></div>
                      <div>{Math.abs(item.quantity).toFixed(4)}</div>
                      <div>{item.avgPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                      <div>{marketPrices[item.symbol] ? marketPrices[item.symbol].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : item.avgPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                      <div className="text-orange-400">--</div>
                      <div>{item.margin ? item.margin.toFixed(2) : (item.totalCost / 5).toFixed(2)} USDT</div>
                      {(() => {
                          const currentPx = marketPrices[item.symbol] || item.avgPrice;
                          const size = Math.abs(item.quantity);
                          const pnl = item.quantity > 0 
                              ? (currentPx - item.avgPrice) * size
                              : (item.avgPrice - currentPx) * size;
                          const margin = item.margin || (item.totalCost / 5);
                          const roe = margin > 0 ? (pnl / margin) * 100 : 0;
                          return (
                            <>
                              <div className={pnl >= 0 ? "text-green-500" : "text-red-500"}>{pnl > 0 ? '+' : ''}{pnl.toFixed(2)} USDT</div>
                              <div className={roe >= 0 ? "text-green-500" : "text-red-500"}>{roe > 0 ? '+' : ''}{roe.toFixed(2)}%</div>
                            </>
                          );
                      })()}
                      <div className="flex gap-2">
                        {/* We could add logic to link back to Close tab but that requires setting state in parent. For now, it indicates the symbol. */}
                        <button className="text-blue-500 hover:underline">Close</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
                      <div className="text-white font-medium">{item.symbol}</div>
                      <div>{item.orderType || 'Market'}</div>
                      <div className={item.type === 'buy' ? 'text-green-500' : 'text-red-500'}>{item.type?.toUpperCase()}</div>
                      <div>{item.price?.toLocaleString()}</div>
                      <div>{item.amount}</div>
                      <div>{item.status === 'completed' ? item.amount : '0.00'}</div>
                      <div>{item.total?.toLocaleString()}</div>
                      <div className="text-gray-500">None</div>
                      <div className="flex justify-end">
                        {item.status === 'pending' && (
                          <button className="text-red-500 hover:text-red-400 text-[12px]">Cancel</button>
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
                  <p className="text-gray-500 text-sm mt-4">No data available for this section</p>
                </div>
              )
            )}
            {loading && data.length === 0 && (
              <div className="py-20 text-center text-gray-500 font-mono animate-pulse">
                LOADING TRADING DATA...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
