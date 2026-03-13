"use client";
import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => {
  return (
    <div data-animate="true" className="relative p-px rounded-2xl mb-2 overflow-hidden">
      {/* Gradient Border */}
      <div
        className={`absolute inset-0 bg-linear-to-br from-white/40 via-white/5 to-white/5 ${
          isOpen ? "opacity-100" : "opacity-70"
        }`}
      />

      {/* Inner Content */}
      <div className="relative rounded-[15px] bg-[#1A1B1B] overflow-hidden">
        <button
          onClick={onClick}
          className={`w-full flex items-center justify-between px-6 ${
            isOpen ? "py-2 mt-4" : "py-4"
          } text-left cursor-pointer group`}
        >
          <span className="font-medium md:text-lg pr-4 text-white">
            {question}
          </span>
          <div className="shrink-0 text-white">
            {isOpen ? (
              <Minus className="w-7 h-7" />
            ) : (
              <Plus className="w-7 h-7" />
            )}
          </div>
        </button>

        {/* ✅ SMOOTH ANIMATED ANSWER (ONLY THIS PART) */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.35,
                ease: "easeInOut",
              }}
            >
              <div className="px-6 pb-6 text-gray-400 leading-relaxed text-sm md:text-base border-t border-white/5">
                {answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = [
    {
      question: "What is ApexSim and how does it work?",
      answer:
        "ApexSim is a private paper trading platform built for simulation and education. It allows users to practice trading across multiple markets using virtual funds, realistic charts, and simulated trade execution. All activity on ApexSim is visual and educational only; there is no real money, no live brokerage connection, and no real trade execution.",
    },
    {
      question: "Is ApexSim a real trading platform or broker?",
      answer:
        "No, ApexSim is strictly a simulation environment. We do not hold licenses to act as a financial broker, and you cannot place real-market trades through our interface.",
    },
    {
      question: "Do I use real money on ApexSim?",
      answer:
        "Never. ApexSim uses virtual currency for all simulations. This allows you to test strategies and learn market movements without any financial risk.",
    },
    {
      question: "Who is ApexSim designed for?",
      answer:
        "It is designed for beginners who want to learn the basics of trading and experienced traders who want to backtest new strategies in a risk-free environment.",
    },
    {
      question: "Can I withdraw money from ApexSim?",
      answer:
        "Since all funds are virtual and used only for educational simulation, there is no real balance to withdraw.",
    },
  ];

  return (
    <section
      data-animate="true"
      className="bg-[#161616] text-white md:py-24 py-10 px-6 md:min-h-screen"
    >
      <div className="max-w-4xl font-manrope mx-auto">
        {/* Header (NO animation added here) */}
        <div className="text-center">
          <span className="text-gray-300 md:text-[12px] text-xs bg-[#2A2B2B] inline-block px-4 py-1 rounded-full border border-[#4D4D4D] backdrop-blur-md">
            FAQ
          </span>
          <h2 className="text-2xl md:text-4xl tracking-wide mt-4 mb-2">
            Got Questions? We’ve Got Answers.
          </h2>
          <p className="text-gray-400 text-base md:text-md max-w-lg mx-auto">
            Everything you need to know about keeping your assets safe, simple,
            and secure with APEXSIM
          </p>
        </div>

        {/* Accordion */}
        <div className="mt-8">
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
