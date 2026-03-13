"use client";
import { useState, useEffect } from 'react';
import { FaSearch, FaCaretDown } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { LuRepeat } from "react-icons/lu";
import BotTradingCard from './BotTradingCards';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ToastContext';

interface TradingBot {
  _id: string;
  name: string;
  description: string;
  roi: number;
  traders: number;
  price: number | 'free';
  status: 'active' | 'inactive';
}

export default function BotTradingPage() {
    const router = useRouter();
    const toast = useToast();
    const [bots, setBots] = useState<TradingBot[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchBots();
    }, []);

    const fetchBots = async () => {
        setLoading(true);
        try {
            const data = await apiRequest("/trading/bots");
            setBots(data);
        } catch (err: any) {
            console.error("Failed to fetch bots:", err);
            // Use mock data if API fails
            setBots(generateMockBots());
        } finally {
            setLoading(false);
        }
    };

    const generateMockBots = (): TradingBot[] => {
        return [
            {
                _id: "bot-1",
                name: "Smart Grid Bot",
                description: "Advanced grid trading bot with AI-powered price prediction",
                roi: 45.2,
                traders: 1250,
                price: "free",
                status: "active"
            },
            {
                _id: "bot-2",
                name: "DCA Bot",
                description: "Dollar cost averaging bot for long-term holders",
                roi: 32.5,
                traders: 890,
                price: "free",
                status: "active"
            },
            {
                _id: "bot-3",
                name: "Momentum Bot",
                description: "Trades based on market momentum and volume",
                roi: 58.3,
                traders: 2100,
                price: 9.99,
                status: "active"
            },
            {
                _id: "bot-4",
                name: "Arbitrage Bot",
                description: "Exploits price differences across exchanges",
                roi: 67.8,
                traders: 450,
                price: 19.99,
                status: "active"
            },
            {
                _id: "bot-5",
                name: "Scalping Bot",
                description: "Fast-paced scalping strategy for quick profits",
                roi: 28.9,
                traders: 620,
                price: 14.99,
                status: "active"
            },
            {
                _id: "bot-6",
                name: "Swing Trading Bot",
                description: "Medium-term swing trading with technical analysis",
                roi: 41.2,
                traders: 980,
                price: "free",
                status: "active"
            }
        ];
    };

    const filteredBots = bots.filter(bot =>
        bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bot.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#181818] text-white p-4 md:p-12 font-manrope">
            <div className="max-w-350 mx-auto">

                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-5">
                    <div className="space-y-4">
                        <h1 className="md:text-3xl text-xl font-semibold text-white tracking-tight">Bot Trading</h1>
                    </div>

                    <div className="relative w-full md:w-60">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-50" size={14} />
                        <input
                            type="text"
                            placeholder="Search bots"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#222222] py-5 pl-11 pr-4 text-xs focus:outline-none border border-white/5 focus:border-white/20 rounded-md transition-colors"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    <div onClick={()=>router.push('/dashboard/trading-bot/market')} className="bg-[#181818] border border-white/5 p-6 rounded-lg cursor-pointer hover:border-white/20 transition-colors">
                        <img src='/images/rightnleft.png' className="text-[#0055FF] w-12 h-12 mb-3" />
                        <h3 className="font-bold text-lg mb-1">Spot Grid</h3>
                        <p className="text-gray-500 text-xs">Buy low and sell high, 24/7 availability</p>
                    </div>

                    <div className="bg-[#181818] border border-white/5 p-6 rounded-lg cursor-pointer hover:border-white/20 transition-colors">
                        <img src='/images/rightnleft.png' className="text-[#0055FF] w-12 h-12  mb-3" />
                        <h3 className="font-bold text-lg mb-1">Futures Grid</h3>
                        <p className="text-gray-500 text-xs">Automate longs and shorts</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <h2 className="text-white md:text-2xl text-xl font-semibold">Bot Marketplace</h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-400">Loading trading bots...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredBots.map((bot) => (
                            <BotTradingCard key={bot._id} bot={bot} onActivate={() => fetchBots()} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}