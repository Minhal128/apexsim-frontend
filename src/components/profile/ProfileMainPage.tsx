"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileOverview from "./ProfileOverviewSection";
import SecuritySettings from "./SecuritySection";
import ProfileSettings from "./ProfileSettingsPage";
import WithdrawModal from "../dashboard/WithdrawModel";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ToastContext";

export default function ProfileMainPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedActivity, setSelectedActivity] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const fetchData = async () => {
    try {
      const [profileResult, walletResult] = await Promise.allSettled([
        apiRequest("/profile/me"),
        apiRequest("/wallet")
      ]);

      if (profileResult.status === "fulfilled") {
        setUser(profileResult.value);
      } else {
        console.error("Failed to fetch profile:", profileResult.reason);
      }

      if (walletResult.status === "fulfilled") {
        setWallet(walletResult.value);
      } else {
        // Wallet may not exist yet for new users — not a fatal error
        console.warn("Wallet not found:", walletResult.reason?.message);
      }
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDepositClose = () => {
    setShowDepositModal(false);
    fetchData(); // Refresh wallet after deposit
  };

  const handleWithdrawClose = () => {
    setShowWithdrawModal(false);
    fetchData(); // Refresh wallet after withdraw
  };

  const tabs = ["Overview", "Security", "Settings"];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    // Token missing or invalid — redirect to sign in
    if (typeof window !== "undefined") router.replace("/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white md:py-8 py-4 font-manrope">
      <div className="max-w-350 mx-auto px-4 md:px-0">
        <div className="flex md:flex-row flex-col items-start md:items-center mb-8 justify-between gap-6">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        </div>

        <div className="flex bg-[#1D1D1D] py-6 md:py-12 flex-col md:flex-row">
          {/* SIDEBAR */}
          <aside className="w-full md:w-100 space-y-1 border-r-4 border-[#181818] shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedActivity(false);
                }}
                className={`w-full text-left px-4 py-3 text-lg transition-all cursor-pointer relative group ${activeTab === tab
                  ? "text-white font-semibold bg-white/5"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/2"
                  }`}
              >
                {activeTab === tab && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-white" />
                )}
                {tab}
              </button>
            ))}
          </aside>

          <main className="flex-1">
            {activeTab === "Overview" && (
              <ProfileOverview
                user={user}
                wallet={wallet}
                onDeposit={() => setShowDepositModal(true)}
                onWithdraw={() => setShowWithdrawModal(true)}
              />
            )}
            {activeTab === "Security" && <SecuritySettings user={user} />}
            {activeTab === "Settings" && <ProfileSettings user={user} />}
          </main>
        </div>
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal open={showWithdrawModal} onClose={handleWithdrawClose} />

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Quick Deposit</h2>
              <button onClick={handleDepositClose} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            <DepositInlineForm onComplete={handleDepositClose} />
          </div>
        </div>
      )}
    </div>
  );
}

// Inline deposit form for the modal
function DepositInlineForm({ onComplete }: { onComplete: () => void }) {
  const [depositType, setDepositType] = useState<"crypto" | "fiat">("crypto");
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [selectedNetwork, setSelectedNetwork] = useState("ERC20");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const coins = ["BTC", "ETH", "USDT", "SOL"];
  const networks = ["BTC", "ERC20", "TRC20", "SOL"];

  const toast = useToast();

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) return toast.addToast("Enter a valid amount", "warning");
    setLoading(true);
    try {
      await apiRequest("/transactions/deposit", {
        method: "POST",
        body: JSON.stringify({
          asset: depositType === "crypto" ? selectedCoin : "USDT",
          amount: Number(amount),
          network: selectedNetwork,
          address: "wallet-deposit"
        })
      });
      toast.addToast("Deposit successful!", "success");
      onComplete();
    } catch (err: any) {
      toast.addToast(err.message || "Deposit failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setDepositType("crypto")} className={`py-3 rounded-lg text-sm font-semibold border transition-all ${depositType === "crypto" ? "bg-[#252525] border-white/10" : "text-gray-500 border-white/5"}`}>Crypto</button>
        <button onClick={() => setDepositType("fiat")} className={`py-3 rounded-lg text-sm font-semibold border transition-all ${depositType === "fiat" ? "bg-[#252525] border-white/10" : "text-gray-500 border-white/5"}`}>Fiat (USDT)</button>
      </div>

      {depositType === "crypto" && (
        <div className="flex flex-wrap gap-2">
          {coins.map(c => (
            <button key={c} onClick={() => setSelectedCoin(c)} className={`px-4 py-2 rounded-lg bg-[#252525] border text-sm font-semibold ${selectedCoin === c ? "border-blue-500" : "border-white/5"}`}>{c}</button>
          ))}
        </div>
      )}

      {depositType === "crypto" && (
        <div className="flex flex-wrap gap-2">
          {networks.map(n => (
            <button key={n} onClick={() => setSelectedNetwork(n)} className={`px-3 py-1.5 rounded-lg bg-[#252525] border text-xs ${selectedNetwork === n ? "border-blue-500" : "border-white/5"}`}>{n}</button>
          ))}
        </div>
      )}

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={depositType === "crypto" ? `Amount in ${selectedCoin}` : "Amount in USD"}
        className="w-full bg-[#252525] border border-white/5 rounded-lg py-3 px-4 outline-none text-sm"
      />

      {depositType === "fiat" && (
        <div className="flex flex-wrap gap-2">
          {["100", "200", "500", "1000", "5000"].map((amt) => (
            <button key={amt} onClick={() => setAmount(amt)} className="px-3 py-1.5 bg-[#252525] border border-white/5 rounded-md text-xs font-semibold hover:border-white/20">${amt}</button>
          ))}
        </div>
      )}

      <button onClick={handleDeposit} disabled={loading} className="w-full bg-[#0055FF] hover:bg-blue-700 py-3 rounded-lg font-bold disabled:opacity-50 transition-all">
        {loading ? "Processing..." : `Deposit ${depositType === "crypto" ? selectedCoin : "USDT"}`}
      </button>
    </div>
  );
}
