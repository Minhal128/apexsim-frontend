"use client";
import React from 'react';
import { LuCopy } from "react-icons/lu";

const InviteCard = ({ title, desc, img }: { title: string; desc: string; img: string }) => (
    <div className="bg-[#202020] rounded-xl p-6 w-full md:p-8 flex flex-col items-center text-center">
        {/* Optimized Image Container: Responsive size using aspect ratio */}
        <div className="w-24 h-24 md:w-32 md:h-32  mb-3 flex items-center justify-center">
            <img src={img} alt={title} className="w-full h-full object-contain" />
        </div>

        <h3 className="text-white border-t border-t-[#323030] pt-2 w-full font-semibold text-base md:text-lg ">{title}</h3>
        <p className="text-gray-400 text-xs md:text-[15px] leading-relaxed max-w-75">{desc}</p>
    </div>
);

export default function InviteFriends() {
    const inviteSteps = [
        {
            title: "Share Your Code and Link",
            desc: "You can invite your friends to use all Bybit products with just one referral code.",
            img: "/images/speaker.png"
        },
        {
            title: "Share Your Code and Link",
            desc: "You can invite your friends to use all Bybit products with just one referral code.",
            img: "/images/person.png"
        },
        {
            title: "Share Your Code and Link",
            desc: "You can invite your friends to use all Bybit products with just one referral code.",
            img: "/images/money.png"
        }
    ];

    return (
        <div className="min-h-screen bg-[#181818] text-white p-4 md:p-12 font-manrope">
            <div className="max-w-350 mx-auto">

                <div className="mb-8 md:mb-10">
                    <h1 className="text-xl md:text-3xl font-semibold leading-snug md:leading-normal">
                        Invite Friends to Earn Over <br />
                        115 USDC and 15% Commission
                    </h1>
                </div>

                <div className="bg-[#202020] rounded-lg p-4 mb-10 md:mb-10 w-full md:w-3xl flex items-center justify-between group cursor-pointer">
                    <span className="text-gray-50 text-sm md:text-md">My referral code</span>
                    <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-white font-mono tracking-wider text-sm md:text-lg">5Y5LJKJ</span>
                        <LuCopy className="text-blue-500 group-hover:scale-110 transition-transform" size={18} />
                    </div>
                </div>

                <div className="mb-10 md:mb-12">
                    <h2 className="text-lg md:text-2xl font-semibold mb-3">How to invite</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {inviteSteps.map((step, idx) => (
                            <InviteCard key={idx} {...step} />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-[#202020] rounded-xl p-6 md:p-4 border border-white/5">
                        <p className="text-gray-400 text-xs md:text-[15px] mb-2 md:mb-4">Total commission</p>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl md:text-4xl font-semibold text-white">0</span>
                            <span className="text-gray-500 text-sm md:font-medium">USDT</span>
                        </div>
                    </div>

                    <div className="bg-[#202020] rounded-xl p-6 md:p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
                        <div>
                            <p className="text-gray-400 text-xs md:text-[15px] mb-2 md:mb-4">Withdrawable Balance</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl md:text-4xl font-semibold text-white">0</span>
                                <span className="text-gray-500 text-sm md:font-medium">USDT</span>
                            </div>
                        </div>
                        <button className="w-full sm:w-auto bg-blue-600  text-white px-8 md:px-10 py-3 rounded-md  text-sm cursor-pointer shadow-lg shadow-blue-500/10">
                            Withdraw
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}