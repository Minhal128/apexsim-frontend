import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LuEye, LuSearch } from "react-icons/lu";
import { FaCaretDown } from "react-icons/fa";
import { PiCaretUpDownFill } from "react-icons/pi";
import { apiRequest } from "@/lib/api";
import { getSocket } from "@/lib/socket";

const coinIcons: Record<string, string> = {
    BTC: "/images/bitcoin.png",
    ETH: "/images/etherium.png",
    USDT: "/images/tcoin.png",
    SOL: "/images/stype.png",
    AVAX: "/images/red.png",
    XRP: "/images/doublev.png",
};

export default function FundsOverview() {
    const [walletData, setWalletData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCoin, setSelectedCoin] = useState("BTC");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchWallet();

        const socket = getSocket();
        let handleWalletUpdate: any = null;

        if (socket) {
            handleWalletUpdate = (eventData: any) => {
                // If we know user ID we should check it, but here we can just refetch
                // or just assume we should wait/check. Wait, if we use eventData.wallet
                // we can just set it. But how do we know it's our wallet?
                // By fetching profile? Let's just do a fetchWallet() on any update.
                // Or better: get user ID and check.
                apiRequest('/profile/me').then(user => {
                    if (eventData.userId === user._id) {
                        setWalletData(eventData.wallet);
                    }
                }).catch(() => {});
            };
            socket.on('wallet-update', handleWalletUpdate);
        }
        return () => {
            if (socket && handleWalletUpdate) socket.off('wallet-update', handleWalletUpdate);
        };
    }, []);

    const fetchWallet = async () => {
        try {
            const data = await apiRequest("/wallet");
            setWalletData(data);
        } catch (err) {
            console.error("Failed to fetch wallet:", err);
        } finally {
            setLoading(false);
        }
    };

    const getBalance = (symbol: string) => {
        return walletData?.balances?.find((b: any) => b.asset === symbol)?.amount || 0;
    };

    const assets = [
        { symbol: "BTC", name: "Bitcoin" },
        { symbol: "ETH", name: "Ethereum" },
        { symbol: "USDT", name: "Tether" },
        { symbol: "SOL", name: "Solana" },
        { symbol: "AVAX", name: "Avalanche" },
    ];

    const currentBalance = getBalance(selectedCoin);

    return (
        <div className="min-h-screen bg-[#1D1D1D] text-white font-manrope px-4 sm:px-6 md:px-8">
            <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 mb-10 pt-6">
                    <div>
                        <div className="flex items-center font-semibold gap-2 text-gray-500 text-sm mb-1">
                            <span>Valuation</span>
                            <LuEye className="cursor-pointer text-white" size={14} />
                        </div>
                        <div className="flex items-center gap-2 relative">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                                {loading ? "Loading..." : `${currentBalance.toFixed(selectedCoin === 'USDT' ? 2 : 6)} ${selectedCoin}`}
                            </h1>
                            <span 
                                className="text-gray-400 p-1 bg-[#252525] rounded-sm cursor-pointer hover:bg-[#333]"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <FaCaretDown size={12} />
                            </span>
                            {isDropdownOpen && (
                                <div className="absolute top-12 left-0 w-32 bg-[#252525] rounded-sm shadow-lg z-50 overflow-hidden">
                                    {assets.map((asset) => (
                                        <div 
                                            key={asset.symbol}
                                            className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm font-semibold"
                                            onClick={() => {
                                                setSelectedCoin(asset.symbol);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            {asset.symbol}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="sm:text-right">
                        <div className="flex items-center sm:justify-end gap-2 mb-1">
                            <span className="text-gray-400 font-semibold text-xs border-b border-gray-600 border-dotted">Profit and Loss</span>
                            <div className="bg-[#262628] px-2 py-0.5 rounded flex items-center gap-1 text-[11px] text-gray-300">Today <FaCaretDown size={10} /></div>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-semibold">$0.00</h2>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex md:flex-row flex-col sm:items-center justify-between gap-4 mb-4 py-3 border-y border-white/5">
                        <h3 className="text-lg font-semibold">My Assets</h3>
                        <div className="relative w-full sm:w-64">
                            <LuSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input placeholder="Search..." className="w-full bg-[#222222] pl-9 pr-3 py-3 rounded-sm text-sm outline-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto max-w-6xl">
                <table className="w-full min-w-225 text-sm">
                    <thead>
                        <tr className="text-gray-400">
                            <th className="py-3 text-left">Coin</th>
                            <th className="py-3 text-left">Total</th>
                            <th className="py-3 text-left">Available</th>
                            <th className="py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((coin) => {
                            const balance = getBalance(coin.symbol);
                            return (
                                <tr key={coin.symbol} className="border-b border-white/5 hover:bg-white/2 transition">
                                    <td className="py-4 flex items-center gap-3">
                                        <img src={coinIcons[coin.symbol] || "/images/bitcoin.png"} alt={coin.symbol} className="w-7 h-7" />
                                        <div>
                                            <div className="font-semibold">{coin.symbol}</div>
                                            <div className="text-gray-500 text-xs">{coin.name}</div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div>{balance.toFixed(coin.symbol === 'BTC' ? 6 : 2)} {coin.symbol}</div>
                                    </td>
                                    <td className="py-4">{balance.toFixed(coin.symbol === 'BTC' ? 6 : 2)}</td>
                                    <td className="py-4 text-right">
                                        <Link 
                                            href={`/dashboard/deposit`}
                                            className="text-[#00B595] hover:underline mr-4"
                                        >
                                            Deposit
                                        </Link>
                                        <Link 
                                            href={`/dashboard/spot-trade?asset=${coin.symbol}/USDT`}
                                            className="text-[#00B595] hover:underline"
                                        >
                                            Trade
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

