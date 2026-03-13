"use client";
import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { initializeSocket } from '@/lib/socket';

interface Coin {
  symbol: string;
  name: string;
  usd: number;
  change24h: number;
  image: string;
}

interface CoinSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (symbol: string) => void;
  currentAsset: string;
}

export default function CoinSelector({ isOpen, onClose, onSelect, currentAsset }: CoinSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const socket = initializeSocket();
    socket.emit('subscribe-market', 'crypto');

    const handleMarketData = (data: any) => {
      // Filter out invalid/zeroed data from backend
      const validData = Object.entries(data).filter(([_, details]: [string, any]) => details.usd > 0);
      
      if (validData.length > 0) {
        const formatted: Coin[] = validData.map(([symbol, details]: [string, any]) => ({
          symbol,
          name: details.name || symbol,
          usd: details.usd || 0,
          change24h: details.change24h || 0,
          image: details.image || `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`
        }));
        setCoins(formatted);
        setLoading(false);
      }
    };

    // Initial search for coins if socket is slow/broken
    const fetchInitialCoins = async () => {
      try {
        const resp = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false');
        const data = await resp.json();
        if (Array.isArray(data)) {
          const formatted: Coin[] = data.map(coin => ({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            usd: coin.current_price,
            change24h: coin.price_change_percentage_24h,
            image: coin.image
          }));
          setCoins(formatted);
          setLoading(false);
        }
      } catch (e) {
        console.error("CoinSelector public fallback failed", e);
      }
    };

    fetchInitialCoins();

    socket.on('market-data', handleMarketData);
    socket.on('market-update', handleMarketData);

    return () => {
      socket.off('market-data', handleMarketData);
      socket.off('market-update', handleMarketData);
    };
  }, [isOpen]);

  const filteredCoins = coins.filter(coin => 
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Select Asset</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text" 
              placeholder="Search coin name or symbol"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#262629] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00B595] transition-all"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2">
          {loading && coins.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Loading coins...</div>
          ) : (
            <div className="space-y-1">
              {filteredCoins.map((coin) => (
                <div 
                  key={coin.symbol}
                  onClick={() => {
                    onSelect(`${coin.symbol}/USDT`);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all hover:bg-white/5 ${currentAsset.includes(coin.symbol) ? 'bg-[#00B595]/10 border border-[#00B595]/20' : 'border border-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={coin.image} 
                      alt={coin.symbol} 
                      className="w-8 h-8 rounded-full bg-gray-800"
                      onError={(e) => {
                        e.currentTarget.src = "https://assets.coingecko.com/coins/images/1/small/bitcoin.png";
                      }}
                    />
                    <div>
                      <p className="text-sm font-bold text-white uppercase">{coin.symbol}</p>
                      <p className="text-[11px] text-gray-500">{coin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">${coin.usd.toLocaleString()}</p>
                    <p className={`text-[11px] font-medium ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
              {filteredCoins.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">No coins found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
