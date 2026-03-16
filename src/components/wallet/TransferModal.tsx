"use client";

import { useState, useEffect, useRef } from "react";
import { X, ArrowDownUp } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ToastContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ACCOUNTS = ["Spot Account", "Futures Account", "Bot Account"];
const ASSETS = ["BTC", "ETH", "USDT", "SOL", "AVAX"];

export default function TransferModal({ open, onClose }: Props) {
  const [fromAccount, setFromAccount] = useState("Spot Account");
  const [toAccount, setToAccount] = useState("Futures Account");
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) fetchWallet();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (window.innerWidth >= 768 && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/wallet");
      setWalletData(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  const getBalance = (symbol: string) => {
    const b = walletData?.balances?.find((b: any) => b.asset === symbol);
    return b ? b.amount : 0;
  };

  const swapAccounts = () => {
    setFromAccount(toAccount);
    setToAccount(fromAccount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccount === toAccount) {
      addToast("From and To accounts must be different.", "error");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      addToast("Enter a valid amount.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/wallet/transfer", {
        method: "POST",
        body: JSON.stringify({ fromAccount, toAccount, asset, amount: parseFloat(amount) }),
      });
      addToast("Transfer submitted successfully.", "success");
      setAmount("");
      onClose();
    } catch (err: any) {
      addToast(err?.message || "Transfer failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const availableBalance = getBalance(asset);

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
      {/* From */}
      <div>
        <label className="text-xs text-gray-400 font-semibold mb-1 block">From</label>
        <select
          value={fromAccount}
          onChange={(e) => setFromAccount(e.target.value)}
          className="w-full bg-[#242424] border border-white/10 rounded px-3 py-2.5 text-sm text-white focus:outline-none"
        >
          {ACCOUNTS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Swap */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={swapAccounts}
          className="bg-[#1D1D1D] border border-white/10 rounded-full p-2 hover:bg-white/10 transition-colors"
        >
          <ArrowDownUp size={16} className="text-gray-400" />
        </button>
      </div>

      {/* To */}
      <div>
        <label className="text-xs text-gray-400 font-semibold mb-1 block">To</label>
        <select
          value={toAccount}
          onChange={(e) => setToAccount(e.target.value)}
          className="w-full bg-[#242424] border border-white/10 rounded px-3 py-2.5 text-sm text-white focus:outline-none"
        >
          {ACCOUNTS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Asset */}
      <div>
        <label className="text-xs text-gray-400 font-semibold mb-1 block">Coin</label>
        <select
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
          className="w-full bg-[#242424] border border-white/10 rounded px-3 py-2.5 text-sm text-white focus:outline-none"
        >
          {ASSETS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-xs text-gray-400 font-semibold">Amount</label>
          <span className="text-xs text-gray-500">
            Available: {loading ? "..." : `${availableBalance.toFixed(6)} ${asset}`}
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-[#242424] border border-white/10 rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30"
          />
          <button
            type="button"
            onClick={() => setAmount(availableBalance.toString())}
            className="px-3 py-2.5 bg-[#0055FF] text-xs font-semibold rounded hover:opacity-90 transition-opacity"
          >
            Max
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#0055FF] py-3 rounded text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Transferring..." : "Confirm Transfer"}
      </button>
    </form>
  );

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden fixed inset-0 z-50 bg-black/60">
        <div className="fixed inset-x-0 bottom-0 bg-[#181818] rounded-t-2xl text-white overflow-y-auto px-6 py-6 max-h-[90vh]">
          <button onClick={onClose} className="absolute top-4 right-5 text-gray-400"><X size={22} /></button>
          <h2 className="text-lg font-semibold font-manrope">Transfer</h2>
          <p className="text-xs text-gray-500 mt-1">Move funds between your accounts</p>
          {formContent}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex fixed inset-0 z-50 bg-black/60 items-center justify-center">
        <div ref={modalRef} className="bg-[#181818] rounded-xl w-full max-w-md text-white px-8 py-8 relative">
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white"><X size={22} /></button>
          <h2 className="text-lg font-semibold font-manrope">Transfer</h2>
          <p className="text-xs text-gray-500 mt-1">Move funds between your accounts</p>
          {formContent}
        </div>
      </div>
    </>
  );
}
