"use client";
import React from "react";

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  imageSrc: string;
  isSmall?: boolean;
}

const TestimonialCard = ({
  name,
  role,
  content,
  imageSrc,
  isSmall,
}: TestimonialCardProps) => (
  <div
    data-animate="true"
    className={`relative p-px rounded-2xl overflow-hidden group shrink-0 
    ${isSmall ? "w-75 md:w-85" : "w-[320px] md:w-100"}`}
  >
    {/* Gradient Border Overlay - Top-left highlight */}

    {/* Inner Card Content */}
    <div className="relative bg-[#1A1B1B] border border-white/20 px-5 md:py-10 py-7 rounded-[15px] h-full flex flex-col justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex flex-col items-start gap-2">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-blue-900/20 border border-white/10">
            <img
              src={imageSrc}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-start justify-center gap-2">
            <h4 className="text-white font-medium text-sm md:text-base">
              {name} ,
            </h4>
            <span className="text-white font-extralight">|</span>
            <span className="text-gray-500 text-xs md:text-sm">{role}</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm md:text-[15px] leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  </div>
);

export default function Testimonials() {
  const row1 = [
    {
      name: "David K",
      role: "Crypto Investor",
      content:
        "Finally, peace of mind. I know my assets are safe no matter what happens online.",
      imageSrc: "https://i.pravatar.cc/150?u=1",
    },
    {
      name: "Sarah L",
      role: "Day Trader",
      content:
        "The simulated environment is incredibly realistic. Best tool for backtesting.",
      imageSrc: "https://i.pravatar.cc/150?u=2",
    },
    {
      name: "David K",
      role: "Crypto Investor",
      content:
        "Finally, peace of mind. I know my assets are safe no matter what happens online.",
      imageSrc: "https://i.pravatar.cc/150?u=3",
    },
    {
      name: "Sarah L",
      role: "Day Trader",
      content:
        "The simulated environment is incredibly realistic. Best tool for backtesting.",
      imageSrc: "https://i.pravatar.cc/150?u=4",
    },
  ];

  const row2 = [
    {
      name: "James W",
      role: "Investor",
      content:
        "I love the clean interface and the security features. It's exactly what I needed.",
      imageSrc: "https://i.pravatar.cc/150?u=5",
    },
    {
      name: "David K",
      role: "Crypto Investor",
      content:
        "Finally, peace of mind. I know my assets are safe no matter what happens online.",
      imageSrc: "https://i.pravatar.cc/150?u=6",
    },
    {
      name: "James W",
      role: "Investor",
      content:
        "I love the clean interface and the security features. It's exactly what I needed.",
      imageSrc: "https://i.pravatar.cc/150?u=7",
    },
    {
      name: "David K",
      role: "Crypto Investor",
      content:
        "Finally, peace of mind. I know my assets are safe no matter what happens online.",
      imageSrc: "https://i.pravatar.cc/150?u=8",
    },
  ];

  return (
    <section className="relative font-manrope bg-black/1 text-white py-20 overflow-hidden">
      {/* Background Grid Pattern - As seen in your screenshot */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 0.5px, transparent 0.5px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 mb-16 text-center relative z-10">
        <span className="text-gray-400 text-[11px] uppercase tracking-widest bg-[#2A2B2B] inline-block px-8 py-1.5 rounded-full border border-[#4D4D4D] mb-6">
          TESTIMONIAL
        </span>
        <h2 className="text-xl tracking-wide md:text-4xl font-semibold mb-4">
          What People Are Saying About Us
        </h2>
        <p className="text-gray-500 max-w-sm mx-auto text-base md:text-lg">
          A simple, safe and fast platform to explore the fun in trading
        </p>
      </div>

      <div className="flex flex-col relative z-10">
        {/* ROW 1: RIGHT TO LEFT */}
        <div className="flex overflow-hidden">
          <div className="flex gap-2 animate-scroll-left py-1">
            {[...row1, ...row1].map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        </div>

        {/* ROW 2: LEFT TO RIGHT (Smaller cards) */}
        <div className="flex overflow-hidden">
          <div className="flex gap-2 animate-scroll-left py-1 pb-10">
            {[...row2, ...row2].map((t, i) => (
              <TestimonialCard key={i} {...t} isSmall />
            ))}
          </div>
        </div>
      </div>

      {/* Side Fades */}

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-scroll-left {
          animation: scroll-left 45s linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right 45s linear infinite;
        }
        .flex:hover .animate-scroll-left,
        .flex:hover .animate-scroll-right {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
