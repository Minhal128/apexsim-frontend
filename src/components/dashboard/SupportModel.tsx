"use client";
import React, { useState, useRef, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { FiPlus, FiMinus } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { APP_LANGUAGE_EVENT, AppLanguageCode, getAppLanguage, t } from "@/lib/i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportFAQModal({ isOpen, onClose }: Props) {
  const [openCategory, setOpenCategory] = useState<string | null>("account");
  const [lang, setLang] = useState<AppLanguageCode>("Eng");
  const tr = (key: string) => t(key, lang);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    const handleOutsideClick = (event: MouseEvent) => {
      if (window.innerWidth >= 768) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = [
    {
      id: "account",
      name: tr("supportAccount"),
      questions: [
        tr("qCreateAccount"),
        tr("qChangeEmailPhone"),
        tr("qAccountLocked"),
        tr("qKycStatus"),
      ],
    },
    {
      id: "security",
      name: tr("supportSecurity"),
      questions: [tr("qEnable2fa"), tr("qResetPassword")],
    },
    { id: "wallets", name: tr("supportWallets"), questions: [tr("qDepositStatus"), tr("qWithdrawalLimits")] },
    { id: "transactions", name: tr("supportTransactions"), questions: [tr("qTradingFees"), tr("qOrderHistory")] },
  ];

  return (
    <>
      <div className="md:hidden fixed inset-0 bg-black/60 z-200 animate-in fade-in duration-200">
        <div className="fixed inset-x-0 top-0 bottom-0 bg-[#181818] animate-in slide-in-from-bottom duration-300">
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-white text-lg font-medium mb-3">{tr("support")}</h2>
                <p className="text-white text-lg">{tr("howCanWeHelpYou")}</p>
                <p className="text-[#AFC0D0] text-sm mt-1">
                  {tr("getHelpTradingAccount")}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className="relative mb-6">
              <IoSearchOutline
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder={tr("searchHelpArticles")}
                className="w-full bg-[#1C1C1C] text-[13px] py-4 rounded-full pl-11 pr-4 text-white focus:outline-none"
              />
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="border-b border-white/5 pb-3 last:border-0"
                >
                  <button
                    onClick={() =>
                      setOpenCategory(
                        openCategory === cat.id ? null : cat.id,
                      )
                    }
                    className="w-full flex items-center justify-between text-white text-[14px] cursor-pointer"
                  >
                    {cat.name}
                    {openCategory === cat.id ? (
                      <FiMinus size={14} />
                    ) : (
                      <FiPlus size={14} />
                    )}
                  </button>

                  {openCategory === cat.id && (
                    <div className="mt-3 ml-2 animate-in slide-in-from-top-1 duration-200">
                      {cat.questions.length > 0 ? (
                        cat.questions.map((q) => (
                          <p
                            key={q}
                            className="text-gray-400 cursor-pointer text-[13px] py-1 transition-colors block hover:text-[#00B595]"
                          >
                            {q}
                          </p>
                        ))
                      ) : (
                        <p className="text-gray-600 text-xs italic">
                          {tr("noArticlesFound")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Dropdown */}
      <div
        ref={dropdownRef}
        className="hidden md:block absolute top-full right-120 md:right-120 z-200 w-112.5 animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <div className="bg-[#181818] w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-white text-lg font-medium mb-3">{tr("support")}</h2>
                <p className="text-white text-lg">{tr("howCanWeHelpYou")}</p>
                <p className="text-[#AFC0D0] text-sm mt-1">
                  {tr("getHelpTradingAccount")}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <IoSearchOutline
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder={tr("searchHelpArticles")}
                className="w-full bg-[#1C1C1C] text-[13px] py-4 rounded-full pl-11 pr-4 text-white focus:outline-none"
              />
            </div>

            {/* Categories */}
            <div className="space-y-3 max-h-100 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="border-b border-white/5 pb-3 last:border-0"
                >
                  <button
                    onClick={() =>
                      setOpenCategory(
                        openCategory === cat.id ? null : cat.id,
                      )
                    }
                    className="w-full flex items-center justify-between text-white text-[14px] cursor-pointer"
                  >
                    {cat.name}
                    {openCategory === cat.id ? (
                      <FiMinus size={14} />
                    ) : (
                      <FiPlus size={14} />
                    )}
                  </button>

                  {openCategory === cat.id && (
                    <div className="mt-3 ml-2 animate-in slide-in-from-top-1 duration-200">
                      {cat.questions.length > 0 ? (
                        cat.questions.map((q) => (
                          <p
                            key={q}
                            className="text-gray-400 cursor-pointer text-[13px] py-1 transition-colors block hover:text-[#00B595]"
                          >
                            {q}
                          </p>
                        ))
                      ) : (
                        <p className="text-gray-600 text-xs italic">
                          {tr("noArticlesFound")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
