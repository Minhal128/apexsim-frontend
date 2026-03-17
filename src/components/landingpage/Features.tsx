"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  imageSrc: string;
  orderClass?: string;
}

const FeatureCard = ({ title, imageSrc, orderClass }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{
      type: "spring",
      stiffness: 90,
      damping: 18,
      mass: 0.6,
    }}
    data-animate="true"
    className={`flex flex-col items-center justify-center py-10 px-6 border-r border-b border-white/15 hover:bg-white/1 transition-colors text-center group ${orderClass} md:order-0`}
  >
    <div className="relative p-px rounded-xl mb-6 group">
      <div className="absolute inset-0 rounded-lg bg-linear-to-br from-white/30 via-transparent to-transparent opacity-100" />

      <div className="relative w-14 h-14 bg-[#212020] rounded-lg flex items-center justify-center overflow-hidden shadow-2xl">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-contain p-3 opacity-70 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>

    <p className="text-gray-400 group-hover:text-white transition-colors text-xs md:text-sm font-medium tracking-wide">
      {title}
    </p>
  </motion.div>
);

export default function Features() {
  const features = [
    { title: "Maximum Security", imageSrc: "/images/one.png" },
    { title: "Instant Access", imageSrc: "/images/two.png" },
    { title: "Trade with confidence", imageSrc: "/images/three.png" },
    { title: "User-friendly", imageSrc: "/images/four.png" },
    { title: "Easy Control", imageSrc: "/images/five.png" },
    { title: "Support all digital assets.", imageSrc: "/images/six.png" },
    { title: "Simple setup", imageSrc: "/images/seven.png" },
    { title: "Future-ready security", imageSrc: "/images/eight.png" },
  ];

  return (
    <section
      data-animate="true"
      className="text-white font-manrope md:py-10 px-6 bg-[#181818] mt-11 w-full"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header (NO animation) */}
        <div className="text-center mb-10">
          <span className="text-gray-300 md:text-[15px] text-xs bg-[#2A2B2B] inline-block px-4 py-1 rounded-full border border-[#4D4D4D] backdrop-blur-md">
            Key Features
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold mt-1 mb-2">
            Why Choose APEXSIM
          </h2>
          <p className="text-[#7F8186] max-w-lg mx-auto text-base md:text-lg">
            Keep your digital assets offline, safe, and always under your
            control—secure storage with the freedom to invest anytime.
          </p>
        </div>

        {/* 🔥 ONLY THIS PART ANIMATES */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 70,
            damping: 22,
            mass: 0.8,
          }}
          className="flex items-center justify-center md:mb-20"
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 max-w-5xl w-full border border-white/15 overflow-hidden">
            {/* First 4 items */}
            {features.slice(0, 4).map((f, i) => (
              <FeatureCard
                key={i}
                title={f.title}
                imageSrc={f.imageSrc}
                orderClass="order-1"
              />
            ))}

            {/* CENTER SPECIAL CARD */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 90,
                damping: 18,
              }}
              className="col-span-2 md:col-span-1 order-2 md:order-0 bg-linear-to-tr from-blue-600 to-blue-500 flex flex-col rounded-lg items-center justify-center py-10 px-6 text-center relative overflow-hidden group border-r border-b border-white/15"
            >
              <h3 className="text-white text-lg mb-8 relative z-10">
                And of course more...
              </h3>
              <Link
                href="/login"
                className="bg-white text-[#0055FF] px-10 py-3.5 rounded-full font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative z-10"
              >
                Start trading
              </Link>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            {/* Remaining 4 items */}
            {features.slice(4).map((f, i) => (
              <FeatureCard
                key={i + 5}
                title={f.title}
                imageSrc={f.imageSrc}
                orderClass="order-3"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
