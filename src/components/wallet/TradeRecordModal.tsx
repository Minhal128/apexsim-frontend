"use client";

import { useState, useEffect, useRef } from "react";
import { X, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { APP_LANGUAGE_EVENT, AppLanguageCode, getAppLanguage, t } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TradeRecordModal({ open, onClose }: Props) {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<AppLanguageCode>("Eng");
  const tr = (key: string) => t(key, lang);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) fetchPositions();
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

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/trading/positions");
      setPositions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const TableContent = () => (
    <div className="mt-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{positions.length} {lang === "Esp" ? "posiciones activas" : `active position${positions.length !== 1 ? "s" : ""}`}</p>
        <button
          onClick={fetchPositions}
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && positions.length === 0 ? (
        <div className="text-center text-gray-500 py-12 text-sm">{tr("loadingPositions")}</div>
      ) : positions.length === 0 ? (
        <div className="text-center py-12">
          <img src="/images/search.png" alt="" className="w-14 h-14 mx-auto mb-3 opacity-60" />
          <p className="text-gray-500 text-sm font-semibold">{tr("noActivePositions")}</p>
          <p className="text-gray-600 text-xs mt-1">{tr("openTradeHint")}</p>
        </div>
      ) : (
        <>
          {/* Cards layout for positions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {positions.map((pos: any) => {
              const symbol = pos.symbol ?? "—";
              const quantity = Number(pos.quantity ?? 0);
              const avgPrice = Number(pos.avgPrice ?? 0);
              const currentValue = quantity * avgPrice;
              const totalCost = Number(pos.totalCost ?? currentValue);
              const unrealizedPnl = currentValue - totalCost;
              const isProfit = unrealizedPnl >= 0;

              return (
                <div key={symbol} className="bg-[#1D1D1D] rounded-lg p-4 border border-white/5 hover:border-white/10 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-sm">{symbol}</div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${isProfit ? "text-green-400" : "text-red-400"}`}>
                      {isProfit ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {isProfit ? "+" : ""}{unrealizedPnl.toFixed(2)} USDT
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <p className="text-gray-500">{tr("quantity")}</p>
                      <p className="font-semibold mt-0.5">
                        {quantity < 1 ? quantity.toFixed(6) : quantity.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">{tr("avgCost")}</p>
                      <p className="font-semibold mt-0.5">${avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{lang === "Esp" ? "Costo total" : "Total Cost"}</p>
                      <p className="font-semibold mt-0.5">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{tr("estValue")}</p>
                      <p className="font-semibold mt-0.5">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary row */}
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 mt-1">
            <span className="text-xs text-gray-400 font-semibold">{tr("totalPositionsValue")}</span>
            <span className="text-sm font-bold">
              ${positions.reduce((acc: number, pos: any) => acc + Number(pos.quantity ?? 0) * Number(pos.avgPrice ?? 0), 0)
                .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden fixed inset-0 z-50 bg-black/60">
        <div className="fixed inset-0 bg-[#181818] text-white overflow-y-auto px-5 py-6">
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400"><X size={22} /></button>
          <h2 className="text-lg font-semibold font-manrope">{tr("tradeRecordTitle")}</h2>
          <p className="text-xs text-gray-500 mt-1">{tr("yourCurrentOpenPositions")}</p>
          <TableContent />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex fixed inset-0 z-50 bg-black/60 items-center justify-center">
        <div ref={modalRef} className="bg-[#181818] rounded-xl w-full max-w-3xl text-white px-8 py-8 relative max-h-[85vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white"><X size={22} /></button>
          <h2 className="text-lg font-semibold font-manrope">{tr("tradeRecordTitle")}</h2>
          <p className="text-xs text-gray-500 mt-1">{tr("yourCurrentOpenPositions")}</p>
          <TableContent />
        </div>
      </div>
    </>
  );
}
