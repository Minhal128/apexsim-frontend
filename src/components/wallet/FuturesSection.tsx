import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LuEye, LuSearch } from "react-icons/lu";
import { FaCaretDown, FaFileAlt } from "react-icons/fa";
import { PiCaretUpDownFill } from "react-icons/pi";
import { apiRequest } from "@/lib/api";

const coinIcons: Record<string, string> = {
    BTC: "/images/bitcoin.png",
    ETH: "/images/etherium.png",
    USDT: "/images/tcoin.png",
    SOL: "/images/stype.png",
    AVAX: "/images/red.png",
    XRP: "/images/doublev.png",
};

export default function FuturesSection() {
    const [walletData, setWalletData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWallet();
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
    ];

    const totalBtc = getBalance('BTC');

    return (
        <div className="min-h-screen bg-[#1D1D1D] text-white font-manrope px-4 sm:px-6 md:px-8">
            <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 mb-10 pt-6">
                    <div>
                        <div className="flex items-center font-semibold gap-2 text-gray-500 text-sm mb-1">
                            <span>Valuation</span>
                            <LuEye className="cursor-pointer text-white" size={14} />
                        </div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                                {loading ? "Loading..." : `${totalBtc.toFixed(6)} BTC`}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex md:flex-row flex-col sm:items-center justify-between gap-4 mb-4 py-3 border-y border-white/5">
                        <h3 className="text-lg font-semibold">My Assets</h3>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto max-w-6xl">
                <table className="w-full min-w-225 text-sm">
                    <thead>
                        <tr className="text-gray-400">
                            <th className="py-3 text-left">Coin</th>
                            <th className="py-3 text-left">Total Balance</th>
                            <th className="py-3 text-left">Wallet Balance</th>
                            <th className="py-3 text-right">Operations</th>
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
                                    <td className="py-4">{balance.toFixed(coin.symbol === 'BTC' ? 6 : 2)} {coin.symbol}</td>
                                    <td className="py-4">{balance.toFixed(coin.symbol === 'BTC' ? 6 : 2)}</td>
                                    <td className="py-4 text-right">
                                        <Link 
                                            href={`/dashboard/futures-trade?asset=${coin.symbol}/USDT`}
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

