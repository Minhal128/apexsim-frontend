"use client";

import { useState, useEffect } from "react";
import {
  FaChevronDown,
  FaQuestionCircle,
  FaWallet,
  FaRegBell,
  FaSun,
  FaCreditCard,
  FaCaretDown,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

const coins = [
  { id: "btc", name: "BTC", icon: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  { id: "eth", name: "ETH", icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { id: "usdt", name: "USDT", icon: "https://assets.coingecko.com/coins/images/325/small/tether.png" },
  { id: "sol", name: "SOL", icon: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
];

const networks = ["BTC", "ERC20", "TRC20", "SOL"];

export default function DepositPage() {
  const [depositType, setDepositType] = useState<"crypto" | "fiat">("crypto");
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [fiatAmount, setFiatAmount] = useState("0");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await apiRequest("/transactions/history");
      setHistory(data.filter((tx: any) => tx.type === 'deposit'));
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleDeposit = async () => {
    setLoading(true);
    try {
      const sanitizedAmount = parseFloat(fiatAmount.toString().replace(/[^0-9.]/g, ''));
      const finalAmount = depositType === 'crypto' ? (selectedCoin.name === 'BTC' ? 0.001 : 100) : sanitizedAmount;

      if (!finalAmount || finalAmount <= 0) {
        alert("Please enter a valid amount");
        setLoading(false);
        return;
      }

      await apiRequest("/transactions/deposit", {
        method: "POST",
        body: JSON.stringify({
          asset: depositType === 'crypto' ? selectedCoin.name : 'USDT',
          amount: finalAmount,
          network: selectedNetwork,
          address: "Apex-Wallet-Address"
        }),
      });
      alert("Deposit successful!");
      fetchHistory();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 md:px-30 md:py-10 py-5 font-manrope min-h-screen text-white">
      <div className="flex items-center md:px-0 px-4 justify-between md:mb-10 mb-4">
        <h1 className="md:text-4xl text-xl font-semibold font-manrope tracking-tight">
          Deposit
        </h1>
        <div className="flex items-center gap-3">
          <FaQuestionCircle className="text-gray-50 md:w-full md:h-full h-5 w-5 hover:text-white cursor-pointer" size={30} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-10 gap-5 mb-16 items-stretch">
        <div className="bg-[#202020] rounded-3xl flex items-center justify-center p-12 border border-white/5 min-h-112.5">
          <img src="/images/deposit.png" alt="Deposit" className="w-full max-w-85 object-contain" />
        </div>

        <div className="bg-[#1B1B1B] font-manrope rounded-3xl md:p-8 p-6 border border-white/5 flex flex-col">
          <div className="grid grid-cols-2 gap-4 md:mb-10 mb-5">
            <button onClick={() => setDepositType("crypto")} className={`py-4.5 rounded-lg text-sm font-semibold border transition-all ${depositType === "crypto" ? "bg-[#252525] border-white/10" : "text-gray-500 border-white/5"}`}>Crypto deposit</button>
            <button onClick={() => setDepositType("fiat")} className={`py-4.5 rounded-lg text-sm font-semibold border transition-all ${depositType === "fiat" ? "bg-[#252525] border-white/10" : "text-gray-500 border-white/5"}`}>Fiat deposit</button>
          </div>

          {depositType === "crypto" ? (
            <div className="space-y-0">
              <div className="relative pb-6 pl-8 border-l border-dashed border-white/10">
                <span className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-[#252525] border border-white/10 flex items-center justify-center text-sm font-bold text-white">1</span>
                <p className="text-lg font-semibold mb-5">Choose coin to deposit</p>
                <div className="flex flex-wrap gap-2.5">
                  {coins.map((coin) => (
                    <button key={coin.id} onClick={() => setSelectedCoin(coin)} className={`flex items-center gap-2.5 px-3 py-2 bg-[#252525] border rounded-lg transition-all ${selectedCoin.id === coin.id ? "border-blue-500" : "border-white/5"}`}>
                      <img src={coin.icon} className="w-5 h-5" alt="" />
                      <span className="text-[13px] font-bold">{coin.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative pb-6 pl-8 border-l border-dashed border-white/10">
                <span className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-[#252525] border border-white/10 flex items-center justify-center text-sm font-bold text-white">2</span>
                <p className="text-lg font-semibold mb-5">Choose chain</p>
                <div className="flex gap-2">
                  {networks.map(net => (
                    <button key={net} onClick={() => setSelectedNetwork(net)} className={`px-4 py-2 rounded-lg bg-[#252525] border ${selectedNetwork === net ? 'border-blue-500' : 'border-white/5'}`}>{net}</button>
                  ))}
                </div>
              </div>

              <div className="relative pl-8">
                <span className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-[#252525] border border-white/10 flex items-center justify-center text-sm font-bold text-white">3</span>
                <p className="text-lg font-semibold">Ready to deposit {selectedCoin.name}</p>
                <button onClick={handleDeposit} disabled={loading} className="w-full bg-[#0055FF] py-3 rounded-lg mt-4 disabled:opacity-50">{loading ? "Processing..." : `Click to Deposit ${selectedCoin.name}`}</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="bg-[#252525] mb-3 border border-white/5 rounded-lg p-4">
                <h1 className="text-gray-500 pb-1">Amount</h1>
                <input type="text" value={fiatAmount} onChange={(e) => setFiatAmount(e.target.value)} className="bg-transparent text-xl font-bold w-full outline-none" />
              </div>
              <div className="flex flex-wrap mb-5 gap-2">
                {["$100", "$200", "$500", "$1,000", "$5,000"].map((amt) => (
                  <button key={amt} onClick={() => setFiatAmount(amt.replace("$", "").replace(",", ""))} className="px-4 py-2 bg-[#252525] border border-white/5 rounded-md text-sm font-semibold hover:border-white/20">{amt}</button>
                ))}
              </div>
              <button onClick={handleDeposit} disabled={loading} className="w-full bg-[#0055FF] text-white py-3 rounded-xl shadow-lg mt-auto disabled:opacity-50">{loading ? "Processing..." : "Deposit Fiat"}</button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-8">Recent Deposit</h2>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-[15px]">
                <th className="pb-6 text-left px-4">Coin</th>
                <th className="pb-6 text-left px-4">Chain type</th>
                <th className="pb-6 text-left px-4">QTY</th>
                <th className="pb-6 text-left px-4">Status</th>
                <th className="pb-6 text-left px-4">Date & time</th>
              </tr>
            </thead>
            <tbody>
              {fetchingHistory ? (
                <tr><td colSpan={5} className="py-10 text-center text-gray-500">Loading history...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-gray-500">No deposits found</td></tr>
              ) : history.map((tx) => (
                <tr key={tx._id} className="border-b border-white/5">
                  <td className="py-4 px-4">{tx.asset}</td>
                  <td className="py-4 px-4 text-gray-400">{tx.network || 'N/A'}</td>
                  <td className="py-4 px-4 font-semibold">{tx.amount}</td>
                  <td className="py-4 px-4"><span className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs">Completed</span></td>
                  <td className="py-4 px-4 text-gray-400">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

