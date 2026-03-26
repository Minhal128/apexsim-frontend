"use client";
import React, { useState, useEffect } from 'react';
import { FaCaretDown } from "react-icons/fa";
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ToastContext';
import { initializeSocket } from '@/lib/socket';
import { APP_LANGUAGE_EVENT, AppLanguageCode, getAppLanguage, t } from '@/lib/i18n';

interface Order {
  _id: string;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  executedAt?: string;
}

export default function OrderTabs() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"openOrders" | "ordersHistory" | "tradeHistory" | "iceberg" | "funds">("openOrders");
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<AppLanguageCode>('Eng');
  const tr = (key: string) => t(key, lang);

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

  const tabs: Array<{ key: "openOrders" | "ordersHistory" | "tradeHistory" | "iceberg" | "funds"; label: string }> = [
    { key: 'openOrders', label: tr('openOrders') },
    { key: 'ordersHistory', label: tr('ordersHistory') },
    { key: 'tradeHistory', label: tr('tradeHistory') },
    { key: 'iceberg', label: tr('iceberg') },
    { key: 'funds', label: tr('funds') },
  ];
  const columns = [tr('date'), tr('pair'), tr('type'), tr('side'), tr('price'), tr('amount'), tr('filled'), tr('total'), tr('action')];

  useEffect(() => {
    if (activeTab === 'openOrders') {
      fetchOpenOrders();
    } else if (activeTab === 'ordersHistory' || activeTab === 'tradeHistory') {
      fetchOrderHistory();
    }
  }, [activeTab]);

  const fetchOpenOrders = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/trading/open-orders');
      setOpenOrders(data);
    } catch (err) {
      console.error('Failed to fetch open orders:', err);
      setOpenOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/trading/history');
      setOrderHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setOrderHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const socket = initializeSocket();
    
    const handleTradeUpdate = () => {
      if (activeTab === 'openOrders') {
        fetchOpenOrders();
      } else if (activeTab === 'ordersHistory' || activeTab === 'tradeHistory') {
        fetchOrderHistory();
      }
    };

    socket.on('trading:order-placed', handleTradeUpdate);
    socket.on('trading:order-executed', handleTradeUpdate);
    socket.on('trading:order-cancelled', handleTradeUpdate);

    return () => {
      socket.off('trading:order-placed', handleTradeUpdate);
      socket.off('trading:order-executed', handleTradeUpdate);
      socket.off('trading:order-cancelled', handleTradeUpdate);
    };
  }, [activeTab]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await apiRequest(`/trading/cancel/${orderId}`, {
        method: 'POST',
      });
      toast.addToast('Order cancelled successfully', 'success');
      fetchOpenOrders();
    } catch (err: any) {
      toast.addToast(err.message || 'Failed to cancel order', 'error');
    }
  };

  const handleCancelAll = async () => {
    try {
      for (const order of openOrders) {
        await apiRequest(`/trading/cancel/${order._id}`, {
          method: 'POST',
        });
      }
      toast.addToast('All orders cancelled', 'success');
      fetchOpenOrders();
    } catch (err: any) {
      toast.addToast(err.message || 'Failed to cancel orders', 'error');
    }
  };

  const displayData = activeTab === 'openOrders' ? openOrders : orderHistory;
  const displayCount = activeTab === 'openOrders' ? openOrders.length : orderHistory.length;

  return (
    <div className="bg-[#181818] border-t border-white/5 min-h-100 flex flex-col font-sans w-full relative">

      <div className="flex items-center justify-between border-b border-white/5 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-6 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 text-[14px] font-medium transition-all relative cursor-pointer whitespace-nowrap ${
                activeTab === tab.key ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label} {(tab.key === 'openOrders' || tab.key === 'ordersHistory' || tab.key === 'tradeHistory') && `(${displayCount})`}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#00B595]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {displayData.length > 0 && (
        <div className="overflow-x-auto no-scrollbar cursor-pointer">
          <div className="min-w-250 w-full">
            <div className="grid gap-4 px-4 py-2 items-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
              {columns.map((col) => (
                <div key={col} className="text-gray-500 text-[15px] font-semibold flex items-center py-3">
                  {col}
                  {col === 'Type' && (
                    <FaCaretDown size={12} className='pl-1.5' />
                  )}
                </div>
              ))}
            </div>

            {displayData.map((order) => (
              <div key={order._id} className="grid gap-4 px-4 py-3 items-center border-b border-white/5 hover:bg-[#1a1d21] transition-colors" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
                <div className="text-white text-sm">{new Date(order.createdAt).toLocaleDateString()}</div>
                <div className="text-white text-sm font-medium">{order.symbol}</div>
                <div className={`text-sm font-medium ${order.type === 'buy' ? 'text-[#34C759]' : 'text-[#ef5350]'}`}>
                  {order.type === 'buy' ? tr('buy').toUpperCase() : tr('sell').toUpperCase()}
                </div>
                <div className="text-white text-sm">{order.type === 'buy' ? tr('buy') : tr('sell')}</div>
                <div className="text-white text-sm">${order.price.toFixed(2)}</div>
                <div className="text-white text-sm">{order.amount.toFixed(6)}</div>
                <div className="text-gray-400 text-sm">{order.status === 'completed' ? '100%' : '0%'}</div>
                <div className="text-white text-sm font-medium">${order.total.toFixed(2)}</div>
                {activeTab === 'openOrders' && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="bg-[#2B2E33] hover:bg-[#363A40] text-white text-[12px] px-4 py-1.5 rounded transition-colors cursor-pointer whitespace-nowrap border border-white/5"
                  >
                    {tr('cancel')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {displayData.length === 0 && !loading && (
        <>
          {activeTab === 'openOrders' && openOrders.length === 0 && (
            <div className="flex md:ml-1 justify-end px-4 py-2 mb-4">
              <button 
                onClick={handleCancelAll}
                disabled={openOrders.length === 0}
                className="bg-[#2B2E33] hover:bg-[#363A40] disabled:opacity-50 text-white text-[12px] px-8 py-1.5 rounded-[3px] transition-colors cursor-pointer whitespace-nowrap border border-white/5"
              >
                {tr('cancelAll')}
              </button>
            </div>
          )}

          <div className="grow flex flex-col items-center justify-center p-10">
            <div className="relative w-25 h-25">
              <img
                src="/images/paper.png"
                className="w-full h-full object-contain"
                alt="No data"
              />              
            </div>
            <p className="text-gray-600 text-sm mt-2">
              {activeTab === 'openOrders' ? tr('noActiveOrdersFound') : tr('noOrderHistory')}
            </p>
          </div>
        </>
      )}

      {loading && (
        <div className="grow flex flex-col items-center justify-center p-10">
          <p className="text-gray-400 text-sm">{tr('loading')} {activeTab.toLowerCase()}...</p>
        </div>
      )}

    </div>
  );
}