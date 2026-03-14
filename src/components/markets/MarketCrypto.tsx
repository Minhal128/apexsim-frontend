"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Star } from 'lucide-react';
import { FaPlayCircle } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { initializeSocket, getSocket } from '@/lib/socket';

const PairIcon = ({ icons, isSingle = false }: { icons: string[]; isSingle?: boolean }) => {
    if (icons.length === 1 || isSingle) {
        return (
            <img
                src={icons[0]}
                className="w-7 h-7 rounded-full object-cover bg-gray-700"
                alt=""
                onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/32?text=📈';
                }}
            />
        );
    }

    return (
        <div className="relative flex items-center w-10 h-7">
            <img
                src={icons[0]}
                className="w-7 h-7 rounded-full border-2 border-[#181818] z-0 object-cover bg-gray-700"
                alt="base"
                onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://flagcdn.com/w80/us.png';
                }}
            />
            <img
                src={icons[1]}
                className="w-7 h-7 rounded-full border-2 border-[#181818] -ml-3 z-10 object-cover bg-gray-700"
                alt="quote"
                onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://flagcdn.com/w80/us.png';
                }}
            />
        </div>
    );
};

interface MarketData {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    high24h: number;
    low24h: number;
    volume24h: number;
    marketCap: number;
    image: string;
    sparkline: number[];
}

interface CardData {
    pair: string;
    price: string;
    vol: string;
    icons: string[];
    change: string;
}

interface TableData {
    pair: string;
    price: string;
    change: string;
    high: string;
    low: string;
    volume: string;
    icons: string[];
}

const MarketContent = ({
    cardData,
    tableData,
    activeTab,
    favorites,
    onToggleFavorite,
    activeCategory,
}: {
    cardData: CardData[];
    tableData: TableData[];
    activeTab: string;
    favorites: Set<string>;
    onToggleFavorite: (pair: string) => void;
    activeCategory: string;
}) => {
    const router = useRouter()

    if (activeTab === 'Favorites' && tableData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Star size={40} className="mb-4 opacity-40" />
                <p className="text-lg font-semibold">No favorites yet</p>
                <p className="text-sm mt-1">Star a trading pair to add it here</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {cardData.slice(0, 4).map((item, i) => (
                    <div key={i} className="bg-[#222222] rounded-xl p-5 cursor-pointer group hover:bg-[#282828] transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <PairIcon icons={item.icons} />
                                <span className="text-sm font-bold text-gray-50 ml-1">{item.pair}</span>
                            </div>
                            <span className={`text-sm font-semibold ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{item.change}</span>
                        </div>
                        <div className="text-2xl mb-1 font-bold">{item.price}</div>
                        <div className="flex justify-between items-center text-gray-500 " onClick={() => router.push(activeTab === 'Futures' ? '/dashboard/futures-trade' : '/dashboard/spot-trade')}>
                            <span className="text-sm font-semibold">{item.vol}</span>
                            <FaPlayCircle size={18} fill="currentColor" className="hover:text-blue-500 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-225">
                    <thead>
                        <tr className="text-gray-500 text-sm font-semibold border-b border-white/5">
                            <th className="text-left pb-4 font-medium w-8"></th>
                            <th className="text-left pb-4 font-medium">Trading pairs</th>
                            <th className="text-left pb-4 font-medium px-4">Last traded price</th>
                            <th className="text-left pb-4 font-medium px-4">24H Change %</th>
                            <th className="text-left pb-4 font-medium px-4">24H High</th>
                            <th className="text-left pb-4 font-medium px-4">24H Low</th>
                            <th className="text-left pb-4 font-medium px-4">Market Volume</th>
                            <th className="text-left pb-4 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/2">
                        {tableData.map((row, idx) => {
                            const isFav = favorites.has(row.pair);
                            let baseAsset = row.pair;
                            let quoteAsset = 'USDT';
                            if (row.pair.includes('/')) {
                                baseAsset = row.pair.split('/')[0];
                                quoteAsset = row.pair.split('/')[1];
                            } else if (row.pair.length > 3) {
                                // Fallback if no slash for crypto like BTCUSDT
                                if (row.pair.endsWith('USDT')) {
                                    baseAsset = row.pair.replace('USDT', '');
                                    quoteAsset = 'USDT';
                                }
                            }
                            
                            const tradeTarget = activeTab === 'Futures'
                                ? `/dashboard/futures-trade?asset=${encodeURIComponent(baseAsset + '/' + quoteAsset)}&category=${activeCategory.toLowerCase()}`
                                : `/dashboard/spot-trade?asset=${encodeURIComponent(baseAsset + '/' + quoteAsset)}&category=${activeCategory.toLowerCase()}`;
                            return (
                                <tr key={idx} className="group hover:bg-white/2 transition-colors">
                                    <td className="py-5 pr-2">
                                        <button
                                            onClick={() => onToggleFavorite(row.pair)}
                                            className="p-1 cursor-pointer transition-colors"
                                            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            <Star
                                                size={15}
                                                className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 hover:text-yellow-400'}
                                            />
                                        </button>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-3">
                                            <PairIcon icons={row.icons} />
                                            <span className="font-bold text-sm tracking-tight">{row.pair}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-4 font-bold text-sm">${parseFloat(row.price.replace(/,/g, '')).toFixed(2)}</td>
                                    <td className={`py-5 px-4 font-bold text-sm ${row.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{row.change}</td>
                                    <td className="py-5 px-4 font-bold text-sm">${parseFloat(row.high.replace(/,/g, '')).toFixed(2)}</td>
                                    <td className="py-5 px-4 font-bold text-sm">${parseFloat(row.low.replace(/,/g, '')).toFixed(2)}</td>
                                    <td className="py-5 px-4 font-bold text-sm">{row.volume}</td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-3">
                                            <button className="p-2 bg-white/5 rounded-lg text-gray-400 hover:bg-white/10 transition-colors cursor-pointer">
                                                <FileText size={16} />
                                            </button>
                                            <button
                                                type='button'
                                                onClick={() => router.push(tradeTarget)}
                                                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all cursor-pointer"
                                            >
                                                Trade
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default function MarketComponent() {
    const [activeCategory, setActiveCategory] = useState("Crypto");
    const [activeTab, setActiveTab] = useState("Spot");
    const [marketData, setMarketData] = useState<MarketData[]>([]);
    const [filteredData, setFilteredData] = useState<MarketData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<Set<string>>(() => {
        if (typeof window === 'undefined') return new Set();
        try {
            const stored = localStorage.getItem('market_favorites');
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    });

    const toggleFavorite = (pair: string) => {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(pair)) {
                next.delete(pair);
            } else {
                next.add(pair);
            }
            try {
                localStorage.setItem('market_favorites', JSON.stringify(Array.from(next)));
            } catch { /* ignore */ }
            return next;
        });
    };

    const categories = ["Crypto", "Forex", "Commodities", "Stocks", "Indices"];
    const subTabs = ["Favorites", "Spot", "Futures"];

    // Fetch market data based on category (REST API fallback - socket will handle updates)
    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                setLoading(true);
                let endpoint = '/api/market/prices'; // default

                if (activeCategory === 'Forex') endpoint = '/api/market/forex';
                else if (activeCategory === 'Commodities') endpoint = '/api/market/commodities';
                else if (activeCategory === 'Stocks') endpoint = '/api/market/stocks';
                else if (activeCategory === 'Indices') endpoint = '/api/market/indices';

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${endpoint}`);

                const data = await response.json();

                // Use the socket update function for consistent formatting
                updateMarketDataFromSocket(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching market data:', err);
                setLoading(false);
            }
        };

        fetchMarketData();
    }, [activeCategory]);

    // Connect to Socket.io for real-time updates
    useEffect(() => {
        const socket = initializeSocket();

        // Subscribe to market updates for the current category
        const categoryMap: { [key: string]: string } = {
            'Crypto': 'crypto',
            'Forex': 'forex',
            'Commodities': 'commodities',
            'Stocks': 'stocks',
            'Indices': 'indices'
        };

        const socketCategory = categoryMap[activeCategory] || 'crypto';
        socket?.emit('subscribe-market', socketCategory);

        // Listen for initial market data
        socket?.on('market-data', (data: any) => {
            console.log('📊 Received initial market data for', activeCategory, ':', Object.keys(data).length, 'items');
            updateMarketDataFromSocket(data);
        });

        // Listen for real-time market updates
        socket?.on('market-update', (data: any) => {
            console.log('📈 Received real-time market update for', activeCategory);
            updateMarketDataFromSocket(data);
        });

        socket?.on('error', (error: any) => {
            console.error('Socket error:', error);
        });

        return () => {
            socket?.off('market-data');
            socket?.off('market-update');
            socket?.off('error');
        };
    }, [activeCategory]);

    // Helper function to update market data from socket
    const updateMarketDataFromSocket = (data: any) => {
        let formatted: MarketData[] = [];

        if (activeCategory === 'Crypto') {
            formatted = Object.entries(data).map(([symbol, details]: [string, any]) => ({
                id: details.id || symbol.toLowerCase(),
                symbol,
                name: details.name || symbol,
                price: parseFloat(details.usd || details.price || 0),
                change24h: parseFloat(details.change24h || 0),
                high24h: parseFloat(details.high24h || details.usd * 1.02 || 0),
                low24h: parseFloat(details.low24h || details.usd * 0.98 || 0),
                volume24h: details.volume24h || 0,
                marketCap: details.marketCap || 0,
                image: details.image || getIconUrl(symbol),
                sparkline: []
            }));
        } else if (activeCategory === 'Forex') {
            formatted = Object.entries(data).map(([key, details]: [string, any]) => ({
                id: key.toLowerCase(),
                symbol: details.pair?.split('/')[0] || key,
                name: details.pair || key,
                price: details.price || 0,
                change24h: details.change24h || 0,
                high24h: details.high24h || 0,
                low24h: details.low24h || 0,
                volume24h: details.volume24h || 0,
                marketCap: 0,
                image: details.logo || details.icons?.[0] || 'https://flagcdn.com/w80/us.png',
                sparkline: []
            }));
        } else if (activeCategory === 'Commodities') {
            formatted = Object.entries(data).map(([key, details]: [string, any]) => ({
                id: key.toLowerCase(),
                symbol: details.symbol || key,
                name: details.name || key,
                price: details.price || 0,
                change24h: details.change24h || 0,
                high24h: details.high24h || 0,
                low24h: details.low24h || 0,
                volume24h: details.volume24h || 0,
                marketCap: 0,
                image: details.logo || details.image || `https://via.placeholder.com/100?text=${details.symbol || key}`,
                sparkline: []
            }));
        } else if (activeCategory === 'Stocks') {
            formatted = Object.entries(data).map(([key, details]: [string, any]) => ({
                id: key.toLowerCase(),
                symbol: details.symbol || key,
                name: details.name || key,
                price: details.price || 0,
                change24h: details.change24h || 0,
                high24h: details.high24h || 0,
                low24h: details.low24h || 0,
                volume24h: details.volume24h || 0,
                marketCap: 0,
                image: details.logo || `https://via.placeholder.com/100?text=${details.symbol || key}`,
                sparkline: []
            }));
        } else if (activeCategory === 'Indices') {
            formatted = Object.entries(data).map(([key, details]: [string, any]) => ({
                id: key.toLowerCase(),
                symbol: details.symbol || key,
                name: details.name || key,
                price: details.value || details.price || 0,
                change24h: details.change24h || 0,
                high24h: details.high24h || 0,
                low24h: details.low24h || 0,
                volume24h: details.volume24h || 0,
                marketCap: 0,
                image: details.logo || `https://via.placeholder.com/100?text=${details.symbol || key}`,
                sparkline: []
            }));
        }

        setMarketData(formatted);
        filterData(formatted, searchTerm);
    };

    const filterData = (data: MarketData[], search: string) => {
        if (!search) {
            setFilteredData(data);
            return;
        }

        const filtered = data.filter(item =>
            item.symbol.toLowerCase().includes(search.toLowerCase()) ||
            item.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredData(filtered);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        filterData(marketData, value);
    };

    const getIconUrl = (symbol: string) => {
        const iconMap: { [key: string]: string } = {
            BTC: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
            ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
            USDT: 'https://assets.coingecko.com/coins/images/325/small/tether.png',
            SOL: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
            BNB: 'https://assets.coingecko.com/coins/images/825/small/binancecoin.png',
        };
        return iconMap[symbol] || 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png';
    };

    const getCurrentData = () => {
        // Filter by favorites tab when on Crypto category
        let sourceData = filteredData;
        if (activeCategory === 'Crypto') {
            if (activeTab === 'Favorites') {
                sourceData = filteredData.filter(item => {
                    const pair = `${item.symbol}/USDT`;
                    return favorites.has(pair);
                });
            }
            // Spot and Futures show all data — Futures just navigates to futures-trade
        }

        const displayData = sourceData.slice(0, 10);

        const cards: CardData[] = displayData.slice(0, 4).map(item => {
            const priceValue = activeCategory === 'Indices' ? item.price : item.price;
            let icons = [item.image];

            // For Forex, show two flags if available
            if (activeCategory === 'Forex') {
                const parts = (item.name || '').split('/');
                const flag1 = parts[0] ? `https://flagcdn.com/w80/${getFlagCode(parts[0])}.png` : item.image;
                const flag2 = parts[1] ? `https://flagcdn.com/w80/${getFlagCode(parts[1])}.png` : item.image;
                icons = [flag1, flag2];
            }

            return {
                pair: activeCategory === 'Crypto'
                    ? `${item.symbol} / USDT`
                    : activeCategory === 'Forex'
                        ? item.name
                        : `${item.symbol}`,
                price: `$${priceValue.toFixed(2)}`,
                vol: `24h Vol $${(item.volume24h / 1e9).toFixed(1)}B`,
                icons: icons,
                change: `${item.change24h.toFixed(2)}%`
            };
        });

        const table: TableData[] = displayData.map(item => {
            const priceValue = activeCategory === 'Indices' ? item.price : item.price;
            let icons = [item.image];

            // For Forex, show two flags if available
            if (activeCategory === 'Forex') {
                const parts = (item.name || '').split('/');
                const flag1 = parts[0] ? `https://flagcdn.com/w80/${getFlagCode(parts[0])}.png` : item.image;
                const flag2 = parts[1] ? `https://flagcdn.com/w80/${getFlagCode(parts[1])}.png` : item.image;
                icons = [flag1, flag2];
            }

            return {
                pair: activeCategory === 'Crypto'
                    ? `${item.symbol}/USDT`
                    : activeCategory === 'Forex'
                        ? item.name
                        : item.symbol,
                price: priceValue.toFixed(2),
                change: `${item.change24h.toFixed(2)}%`,
                high: item.high24h.toFixed(2),
                low: item.low24h.toFixed(2),
                volume: `${(item.volume24h / 1e9).toFixed(2)}B`,
                icons: icons
            };
        });

        return { cards, table };
    };

    const getFlagCode = (currency: string) => {
        const codes: { [key: string]: string } = {
            'EUR': 'eu',
            'USD': 'us',
            'GBP': 'gb',
            'JPY': 'jp',
            'AUD': 'au',
            'CAD': 'ca',
            'CHF': 'ch',
            'CNY': 'cn',
            'INR': 'in',
        };
        return codes[currency.toUpperCase()] || 'us';
    };

    const currentData = getCurrentData();

    return (
        <div className="bg-[#181818] min-h-screen text-white p-4 md:p-10 font-manrope">
            <div className="max-w-350 mx-auto">
                <div className='flex items-center mb-5 justify-between'>
                    <h1 className="text-3xl font-bold">Market</h1>

                    <div className="relative w-40 md:w-60">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-50" size={14} />
                        <input
                            type="text"
                            placeholder="Search for currency pairs"
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full bg-[#222222] md:py-5 py-3 pl-11 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all rounded-lg"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex mb-10 overflow-hidden rounded-lg">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`md:px-6 px-2 py-5 md:text-[14px] text-[11px] font-semibold transition-all cursor-pointer 
                                ${activeCategory === cat ? "bg-[#2B2B2B] text-white" : "bg-[#1E1E1E] text-gray-500 hover:text-gray-300"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Sub Tabs */}
                {activeCategory === "Crypto" && (
                    <div className="flex items-center gap-6 mb-6 border-b border-white/5">
                        {subTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer
          ${activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.75 bg-blue-500 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="text-gray-400">Loading market data...</div>
                    </div>
                ) : (
                    <MarketContent
                        cardData={currentData.cards}
                        tableData={currentData.table}
                        activeTab={activeTab}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                        activeCategory={activeCategory}
                    />
                )}
            </div>
        </div>
    );
}