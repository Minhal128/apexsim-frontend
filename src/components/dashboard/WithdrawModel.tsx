"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ToastContext";
import { APP_LANGUAGE_EVENT, AppLanguageCode, getAppLanguage, t } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
}

const WithdrawModal = ({ open, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<"bank" | "crypto">("bank");
  const [walletData, setWalletData] = useState<any>(null);
  const [lang, setLang] = useState<AppLanguageCode>("Eng");
  const tr = (key: string) => t(key, lang);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const applyLanguage = () => setLang(getAppLanguage());
    applyLanguage();
    window.addEventListener("storage", applyLanguage);
    window.addEventListener(APP_LANGUAGE_EVENT, applyLanguage as EventListener);
    return () => {
      window.removeEventListener("storage", applyLanguage);
      window.removeEventListener(APP_LANGUAGE_EVENT, applyLanguage as EventListener);
    };
  }, []);

  useEffect(() => {
    if (open) {
      fetchWallet();
    }
  }, [open]);

  const fetchWallet = async () => {
    try {
      const data = await apiRequest("/wallet");
      setWalletData(data);
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (window.innerWidth >= 768) {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="md:hidden fixed inset-0 z-50 bg-black/60 animate-in fade-in duration-200">
        <div className="fixed inset-x-0 top-0 bottom-0 bg-[#181818] animate-in slide-in-from-bottom duration-300 text-white overflow-y-auto px-6 py-6">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-400"><X size={24} /></button>
          <h2 className="mb-5 text-lg font-manrope">{tr("withdrawFunds")}</h2>

          <div className="flex gap-5 pb-3 border-b border-gray-700 mb-6">
            <button onClick={() => setActiveTab("bank")} className={`text-sm ${activeTab === "bank" ? "text-white border-b-2 border-[#0055FF]" : "text-gray-400"}`}>{tr("bankTransfer")}</button>
            <button onClick={() => setActiveTab("crypto")} className={`text-sm ${activeTab === "crypto" ? "text-white border-b-2 border-[#0055FF]" : "text-gray-400"}`}>{tr("cryptoTransfer")}</button>
          </div>

          {activeTab === "bank" ? <BankTransfer wallet={walletData} onComplete={onClose} lang={lang} /> : <CryptoTransfer wallet={walletData} onComplete={onClose} lang={lang} />}
        </div>
      </div>

      <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center bg-black/60 px-3">
        <div ref={modalRef} className="relative w-full max-w-md rounded-2xl bg-[#181818] px-6 py-6 text-white shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-manrope">{tr("withdrawFunds")}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
          </div>

          <div className="flex gap-5 pb-3 border-b border-gray-700 mb-6">
            <button onClick={() => setActiveTab("bank")} className={`text-sm transition-all pb-2 ${activeTab === "bank" ? "text-white border-b-2 border-[#0055FF]" : "text-gray-400"}`}>{tr("bankTransfer")}</button>
            <button onClick={() => setActiveTab("crypto")} className={`text-sm transition-all pb-2 ${activeTab === "crypto" ? "text-white border-b-2 border-[#0055FF]" : "text-gray-400"}`}>{tr("cryptoTransfer")}</button>
          </div>

          {activeTab === "bank" ? <BankTransfer wallet={walletData} onComplete={onClose} lang={lang} /> : <CryptoTransfer wallet={walletData} onComplete={onClose} lang={lang} />}
        </div>
      </div>
    </>
  );
};

const BankTransfer = ({ wallet, onComplete, lang }: { wallet: any, onComplete: () => void, lang: AppLanguageCode }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const available = wallet?.balances?.find((b: any) => b.asset === 'USDT')?.amount || 0;
  const tr = (key: string) => t(key, lang);

  const toast = useToast();

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) return toast.addToast(tr("enterValidAmount"), "warning");
    setLoading(true);
    try {
      await apiRequest("/transactions/withdraw", {
        method: "POST",
        body: JSON.stringify({ asset: 'USDT', amount: Number(amount), address: 'User-Bank-Account', network: 'Bank' })
      });
      toast.addToast(tr("withdrawalSubmitted"), "success");
      onComplete();
    } catch (err: any) {
      toast.addToast(err.message || tr("withdrawalFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$0.00" className="w-full bg-[#1C1C1C] rounded-full px-4 py-3 outline-none" />
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>{tr("available")}: ${available.toFixed(2)} USDT</span>
        <button onClick={() => setAmount(available.toString())} className="text-[#0055FF]">{tr("max")}</button>
      </div>
      <input placeholder={tr("bankNameId")} className="w-full bg-[#1C1C1C] rounded-full px-4 py-3 outline-none" />
      <button onClick={handleWithdraw} disabled={loading} className="w-full bg-[#0055FF] py-3 rounded-lg font-bold disabled:opacity-50">
        {loading ? tr("processing") : tr("withdrawFundsBtn")}
      </button>
    </div>
  );
};

const CryptoTransfer = ({ wallet, onComplete, lang }: { wallet: any, onComplete: () => void, lang: AppLanguageCode }) => {
  const [amount, setAmount] = useState("");
  const [coin, setCoin] = useState("USDT");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const tr = (key: string) => t(key, lang);

  const coins = [
    { name: "USDT", icon: "/images/tcoin.png" },
    { name: "BTC", icon: "/images/bitcoin.png" },
    { name: "ETH", icon: "/images/etherium.png" },
  ];

  const available = wallet?.balances?.find((b: any) => b.asset === coin)?.amount || 0;

  const toast = useToast();

  const handleWithdraw = async () => {
    if (!amount || !address) return toast.addToast(tr("fillAllFields"), "warning");
    setLoading(true);
    try {
      await apiRequest("/transactions/withdraw", {
        method: "POST",
        body: JSON.stringify({ asset: coin, amount: Number(amount), address, network: 'Crypto' })
      });
      toast.addToast(tr("withdrawalSubmitted"), "success");
      onComplete();
    } catch (err: any) {
      toast.addToast(err.message || tr("withdrawalFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$0.00" className="w-full bg-[#1C1C1C] rounded-full px-4 py-3 outline-none" />
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>{tr("available")}: {available.toFixed(coin === 'BTC' ? 6 : 2)} {coin}</span>
        <button onClick={() => setAmount(available.toString())} className="text-[#0055FF]">{tr("max")}</button>
      </div>

      <div className="relative">
        <button onClick={() => setOpen(!open)} className="w-full flex justify-between bg-[#1C1C1C] rounded-full px-4 py-3">
          <span>{coin}</span> <ChevronDown size={18} />
        </button>
        {open && (
          <div className="absolute top-full left-0 w-full mt-2 bg-[#1C1C1C] rounded-xl overflow-hidden z-10">
            {coins.map(c => (
              <button key={c.name} onClick={() => { setCoin(c.name); setOpen(false); }} className="w-full px-4 py-3 hover:bg-white/5 text-left">{c.name}</button>
            ))}
          </div>
        )}
      </div>

      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={tr("recipientAddress")} className="w-full bg-[#1C1C1C] rounded-full px-4 py-3 outline-none" />
      <button onClick={handleWithdraw} disabled={loading} className="w-full bg-[#0055FF] py-3 rounded-lg font-bold disabled:opacity-50">
        {loading ? tr("processing") : tr("proceedWithdrawal")}
      </button>
    </div>
  );
};

export default WithdrawModal;