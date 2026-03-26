"use client";

import { useState, useEffect, useRef } from "react";
import { X, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { APP_LANGUAGE_EVENT, AppLanguageCode, getAppLanguage, t } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "text-green-400 bg-green-400/10",
  pending: "text-yellow-400 bg-yellow-400/10",
  cancelled: "text-red-400 bg-red-400/10",
};

const TYPE_COLORS: Record<string, string> = {
  buy: "text-green-400",
  sell: "text-red-400",
};

export default function TradeHistoryModal({ open, onClose }: Props) {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");
  const [lang, setLang] = useState<AppLanguageCode>("Eng");
  const tr = (key: string) => t(key, lang);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) fetchHistory();
  }, [open]);

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
    const handleClickOutside = (e: MouseEvent) => {
      if (window.innerWidth >= 768 && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/trading/history");
      setTrades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch trade history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const filtered = filter === "all" ? trades : trades.filter((t) => t.type === filter);

  const TableContent = () => (
    <div className="mt-5 flex flex-col gap-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        {(["all", "buy", "sell"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-colors ${
              filter === f ? "bg-[#0055FF] text-white" : "bg-[#242424] text-gray-400 hover:bg-white/10"
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={fetchHistory}
          className="ml-auto text-gray-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && trades.length === 0 ? (
        <div className="text-center text-gray-500 py-12 text-sm">{tr("loadingDots")}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <img src="/images/search.png" alt="" className="w-14 h-14 mx-auto mb-3 opacity-60" />
          <p className="text-gray-500 text-sm font-semibold">{tr("noTradeHistoryFound")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-white/5">
                <th className="py-2 text-left font-semibold">{tr("symbol")}</th>
                <th className="py-2 text-left font-semibold">{tr("type")}</th>
                <th className="py-2 text-left font-semibold">{tr("market")}</th>
                <th className="py-2 text-left font-semibold">{tr("price")}</th>
                <th className="py-2 text-left font-semibold">{tr("amount")}</th>
                <th className="py-2 text-left font-semibold">{tr("total")}</th>
                <th className="py-2 text-left font-semibold">{tr("status")}</th>
                <th className="py-2 text-left font-semibold">{tr("date")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trade: any) => (
                <tr key={trade._id} className="border-b border-white/5 hover:bg-white/2 transition">
                  <td className="py-3 font-semibold">{trade.symbol}</td>
                  <td className={`py-3 font-semibold uppercase text-xs ${TYPE_COLORS[trade.type] ?? "text-gray-300"}`}>
                    {trade.type}
                  </td>
                  <td className="py-3 text-gray-400 capitalize text-xs">{trade.marketType || "spot"}</td>
                  <td className="py-3">${Number(trade.executedPrice ?? trade.price).toLocaleString()}</td>
                  <td className="py-3">{Number(trade.amount).toFixed(6)}</td>
                  <td className="py-3">${Number(trade.total).toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${STATUS_COLORS[trade.status] ?? "text-gray-400 bg-gray-400/10"}`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400 text-xs">
                    {trade.createdAt ? new Date(trade.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden fixed inset-0 z-50 bg-black/60">
        <div className="fixed inset-0 bg-[#181818] text-white overflow-y-auto px-5 py-6">
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400"><X size={22} /></button>
          <h2 className="text-lg font-semibold font-manrope">{tr("tradeHistoryTitle")}</h2>
          <p className="text-xs text-gray-500 mt-1">{tr("yourCompletedCancelledOrders")}</p>
          <TableContent />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex fixed inset-0 z-50 bg-black/60 items-center justify-center">
        <div ref={modalRef} className="bg-[#181818] rounded-xl w-full max-w-4xl text-white px-8 py-8 relative max-h-[85vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white"><X size={22} /></button>
          <h2 className="text-lg font-semibold font-manrope">{tr("tradeHistoryTitle")}</h2>
          <p className="text-xs text-gray-500 mt-1">{tr("yourCompletedCancelledOrders")}</p>
          <TableContent />
        </div>
      </div>
    </>
  );
}
