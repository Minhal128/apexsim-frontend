import React, { useEffect, useState } from "react";
import { LuEye } from "react-icons/lu";
import { FaCaretDown } from "react-icons/fa";
import { apiRequest } from "@/lib/api";
import { getSocket } from "@/lib/socket";

export default function Overview() {
  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const socket = getSocket();
    if (socket) {
        socket.on('wallet-update', (eventData: any) => {
            apiRequest('/profile/me').then(user => {
                if (eventData.userId === user._id) {
                    setWalletData(eventData.wallet);
                }
            }).catch(() => {});
        });
    }
    return () => {
        if (socket) socket.off('wallet-update');
    };
  }, []);

  const fetchData = async () => {
    try {
      const [wallet, history] = await Promise.all([
        apiRequest("/wallet"),
        apiRequest("/transactions/history")
      ]);
      setWalletData(wallet);
      setTransactions(history.slice(0, 5)); // Show only latest 5
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBalance = (asset: string) => {
    const balance = walletData?.balances?.find((b: any) => b.asset === asset);
    return balance ? balance.amount.toFixed(6) : "0.000000";
  };
  const getFuturesBalance = (asset: string) => {
    const balance = walletData?.futuresBalances?.find((b: any) => b.asset === asset);
    return balance ? balance.amount.toFixed(6) : "0.000000";
  };

  const assets = [
    { name: "Spot Account", image: "/images/iconone.png", quantity: `${getBalance('BTC')} BTC` },
    { name: "Futures Account", image: "/images/icontwo.png", quantity: `${getFuturesBalance('USDT')} USDT` }, // Assuming USDT for futures/bot for now
    { name: "Bot Account", image: "/images/iconthree.png", quantity: `${getBalance('ETH')} ETH` },
  ];

  const totalBtc = getBalance('BTC');


  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#1D1D1D] text-white font-manrope">

      <div className="flex-1 px-4 sm:px-6 md:px-8 md:border-r-4 md:border-[#181818] max-w-full md:max-w-4xl">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 mb-10 pt-6">

          <div>
            <div className="flex items-center font-semibold gap-2 text-gray-500 text-sm mb-1">
              <span>Valuation</span>
              <LuEye className="cursor-pointer text-white transition-colors" size={14} />
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                {loading ? "Loading..." : `${totalBtc} BTC`}
              </h1>

            </div>

            <p className="text-gray-500 font-semibold text-sm mt-1">≈$0.00</p>
          </div>

        </div>

        {/* Assets */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 py-3 border-y border-white/5">
            <h3 className="text-lg font-semibold">My Assets</h3>

          </div>

          <div className="overflow-x-auto">
            <table className="min-w-125 w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm">
                  <th className="pb-4 font-semibold">Symbol</th>
                  <th className="pb-4 font-semibold text-right">Quantity</th>
                </tr>
              </thead>

              <tbody>
                {assets.map((asset, idx) => (
                  <tr key={idx} className="hover:bg-white/2 transition-colors border-b border-white/5">
                    <td className="py-3 flex items-center gap-3">
                      <img src={asset.image} className="w-6 h-6" />
                      <span className="font-semibold text-sm sm:text-[15px]">
                        {asset.name}
                      </span>
                    </td>


                    <td className="py-3 text-right font-semibold">
                      <div className="font-semibold text-sm sm:text-[15px]">
                        {asset.quantity}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full lg:w-87.5 px-4 sm:px-6 py-8 border-t lg:border-t-0 border-white/5">
        <h3 className="text-lg md:text-xl font-semibold mb-6">
          Recent Activities
        </h3>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center">
            <img src="/images/search.png" alt="" className="w-16 h-16 sm:w-20 sm:h-20" />
            <p className="text-gray-500 text-sm sm:text-lg font-semibold mt-4">
              No recent activities
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx: any) => (
              <div key={tx._id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="font-bold text-sm uppercase">{tx.type}</div>
                  <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.asset}
                  </div>
                  <div className="text-[10px] text-gray-500 capitalize">{tx.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
