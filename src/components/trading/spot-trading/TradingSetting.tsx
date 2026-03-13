"use client";
import React, { useState } from "react";
import { IoClose } from "react-icons/io5";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [selectedLayout, setSelectedLayout] = useState<"standard" | "pro">(
    "standard",
  );
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end font-sans">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full md:w-100 bg-[#0C0C14] h-full border-l border-white/10 shadow-2xl text-white flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-[18px] font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
          >
            <IoClose size={20} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <section className="px-6 py-4">
            <p className="text-[13px] text-gray-500 mb-4">Layout</p>
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedLayout("standard")}
                className="group cursor-pointer"
              >
                <div
                  className={`aspect-16/10 bg-[#16161E] border p-2 flex gap-1 transition-all ${selectedLayout === "standard" ? "border-white" : "border-white/10 group-hover:border-white/20"}`}
                >
                  <div className="w-[18%] bg-[#08080A]" />
                  <div className="flex flex-col gap-1 w-[57%]">
                    <div className="h-[65%] bg-[#08080A]" />
                    <div className="h-[35%] bg-[#08080A]" />
                  </div>
                  <div className="flex flex-col gap-1 w-[25%]">
                    <div className="h-[25%] bg-[#08080A]" />
                    <div className="h-[75%] bg-[#08080A]" />
                  </div>
                </div>
                <p
                  className={`text-[12px] mt-2 text-center ${selectedLayout === "standard" ? "text-white" : "text-gray-500"}`}
                >
                  Standard
                </p>
              </div>

              {/* Pro */}
              <div
                onClick={() => setSelectedLayout("pro")}
                className="group cursor-pointer"
              >
                <div
                  className={`aspect-16/10 bg-[#16161E] border p-2 flex gap-1 transition-all ${selectedLayout === "pro" ? "border-white" : "border-white/10 group-hover:border-white/20"}`}
                >
                  <div className="flex flex-col gap-1 w-[60%]">
                    <div className="h-[70%] bg-[#08080A]" />
                    <div className="h-[30%] bg-[#08080A]" />
                  </div>
                  <div className="w-[20%] bg-[#08080A]" />
                  <div className="w-[20%] bg-[#08080A]" />
                </div>
                <p
                  className={`text-[12px] mt-2 text-center ${selectedLayout === "pro" ? "text-white" : "text-gray-500"}`}
                >
                  Left View Panel
                </p>
              </div>
            </div>
          </section>

          <section className="px-6 py-6">
            <p className="text-[13px] text-gray-500 mb-4">Mode</p>
            <div className="flex gap-30">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  className="hidden"
                  checked={theme === "dark"}
                  onChange={() => setTheme("dark")}
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${theme === "dark" ? "border-[#3B82F6]" : "border-gray-600"}`}
                >
                  {theme === "dark" && (
                    <div className="w-2 h-2 bg-[#3B82F6] rounded-full" />
                  )}
                </div>
                <span
                  className={`text-[14px] ${theme === "dark" ? "text-white" : "text-gray-400"}`}
                >
                  Dark
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  className="hidden"
                  checked={theme === "light"}
                  onChange={() => setTheme("light")}
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${theme === "light" ? "border-[#3B82F6]" : "border-gray-600"}`}
                >
                  {theme === "light" && (
                    <div className="w-2 h-2 bg-[#3B82F6] rounded-full" />
                  )}
                </div>
                <span
                  className={`text-[14px] ${theme === "light" ? "text-white" : "text-gray-400"}`}
                >
                  Light
                </span>
              </label>
            </div>
          </section>

          <div className="h-px bg-white/5 mx-6" />

          <section className="px-6 py-6 space-y-6">
            <p className="text-[13px] text-gray-500 mb-2">Order confirmation</p>
            <div className="space-y-5">
              <SwitchItem label="Limit order" defaultChecked />
              <SwitchItem label="Market order" defaultChecked />
              <SwitchItem label="Stop Limit Order" defaultChecked />
              <SwitchItem label="Iceberg" defaultChecked />
            </div>
          </section>

          <div className="h-px bg-white/5 mx-6" />

          <section className="px-6 py-6 space-y-6">
            <SwitchItem label="Trade Notifications" defaultChecked />
            <div className="flex justify-between items-center group cursor-pointer">
              <span className="text-[14px] text-white">Trading rules</span>
              <span className="text-[12px] text-gray-500 flex items-center gap-1">
                BTC/USDT
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function SwitchItem({
  label,
  defaultChecked = false,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultChecked);
  return (
    <div className="flex justify-between items-center">
      <span className="text-[14px] text-white font-medium">{label}</span>
      <div
        onClick={() => setEnabled(!enabled)}
        className={`w-8.5 h-4.5 rounded-full transition-all duration-200 relative cursor-pointer ${enabled ? "bg-[#3B82F6]" : "bg-[#2D2D35]"}`}
      >
        <div
          className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${enabled ? "translate-x-4.5" : "translate-x-0.5"}`}
        />
      </div>
    </div>
  );
}
