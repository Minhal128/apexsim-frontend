"use client";
import { useState } from "react";
import {
  FaChevronDown,
  FaQuestionCircle,
  FaWallet,
  FaRegBell,
  FaSun,
  FaCreditCard,
  FaCaretDown,
} from "react-icons/fa";

const coins = [
  {
    id: "btc",
    name: "BTC",
    icon: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  },
  {
    id: "sol",
    name: "SOL",
    icon: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  },
  {
    id: "eth",
    name: "ETH",
    icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  },
  {
    id: "usdt",
    name: "USDT",
    icon: "https://assets.coingecko.com/coins/images/325/small/tether.png",
  },
];

export default function DepositPage() {
  const [amount, setAmount] = useState("0");

  return (
    <div className="max-w-full mx-auto px-4 md:px-30 md:py-10 py-5 font-manrope min-h-screen text-white">
      {/* Header Section */}
      <div className="flex items-center md:px-0 px-4 justify-between md:mb-10 mb-4">
        <h1 className="md:text-4xl text-xl font-semibold font-manrope tracking-tight">
          Convert
        </h1>
        <div className="flex items-center gap-3">
          <FaQuestionCircle
            className="text-gray-50 md:w-full md:h-full h-5 w-5 hover:text-white cursor-pointer"
            size={30}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-10 gap-5 mb-16 items-stretch">

        <div className="bg-[#202020] rounded-3xl flex items-center justify-center p-15 border border-white/5 min-h-112.5">
          <img
            src="/images/convert.png"
            alt="Deposit Illustration"
            className="w-full max-w-85 py-10 object-contain drop-shadow-2xl"
          />
        </div>

        <div className="bg-[#1B1B1B] font-manrope rounded-3xl md:p-8 p-6 border border-white/5 flex flex-col">

          <div className="space-y-4 flex-1">
            <div className="bg-[#252525] px-4 py-3 rounded-lg border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-lg font-medium">From</span>
                <span className="text-gray-50 flex items-center justify-center gap-1 text-[13px]">
                  Available: 0 BTC{" "}
                  <img src="/images/plus.png" className="w-3 h-3" alt="" />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2  py-1.5 cursor-pointer">
                  <img src="/images/tcoin.png" className="w-7 h-7" alt="USDT" />
                  <span className="text-md">USDT</span>
                  <FaCaretDown className="text-gray-50" />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent text-right text-2xl font-semibold outline-none w-24"
                  />
                  <span className="text-gray-500 font-bold text-lg underline border-l pl-3 border-l-gray-700 cursor-pointer hover:text-white transition-colors">
                    Max
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#252525] px-4 py-3 md:mb-10 rounded-lg border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-lg font-medium">To</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2  py-1.5 cursor-pointer">
                  <img src="/images/tcoin.png" className="w-7 h-7" alt="USDT" />
                  <span className="text-md">USDT</span>
                  <FaCaretDown className="text-gray-50" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-lg font-medium">
                  Transaction fees
                </span>
                <span className="text-white font-bold text-md">0 fees</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-lg font-medium">
                  You'll get
                </span>
                <span className="text-white font-bold text-md">----------</span>
              </div>
            </div>
          </div>

          <button className="w-full bg-[#0055FF] text-white py-4 rounded-xl  text-md shadow-[0_10px_20px_rgba(37,109,253,0.2)] hover:opacity-90 transition-all cursor-pointer mt-8">
            Proceed
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-8">
          Recent Convert
        </h2>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-250">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  "Coin",
                  "Chain type",
                  "QTY",
                  "Address",
                  "TXID",
                  "Status",
                  "Date & time",
                  "Action",
                ].map((header) => (
                  <th
                    key={header}
                    className="pb-6 text-[15px] font-semibold text-gray-500 text-left px-4"
                  >
                    <div className="flex items-center gap-2 group cursor-pointer">
                      {header}
                      {header !== "Coin" && header !== "Action" && (
                        <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-4 border-b-gray-400"></div>
                          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-4 border-t-gray-400"></div>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
}
