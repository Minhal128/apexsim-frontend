"use client";
import React from 'react';
import Image from 'next/image';


export default function DashboardFooter() {
    const footerLinks = {
        "About us": ["Terms of use", "Privacy Policy", "Cookie Policy", "Disclaimer", "Support Policy", "About Us", "Fees"],
        "Tools": ["API Doc", "Apply for listing", "Trading view"],
        "Our services": ["Buy crypto", "Trade crypto", "Futures trading"],
        "Help center": ["Support", "Contact Us"]
    };

    return (
        <footer className="text-white pt-5 pb-10 md:px-6 overflow-hidden">
            <div className="max-w-9xl mx-auto">


                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:mb-50 mb-10">

                    <div className="md:col-span-4 md:ml-20 ml-5">
                        <h3 className="md:text-2xl text-xl font-bricolage font-bold mb-3 tracking-wide">APEXSIM</h3>
                        <p className="text-gray-400 mb-3 font-manrope leading-6 max-w-xs">
                            Securely Protecting Your Digital Wealth, Today And Tomorrow.
                        </p>
                        <div className="flex gap-2">
                            {[
                                { src: "/images/gmail.png", alt: "Mail" },
                                { src: "/images/insta.png", alt: "Instagram" },
                                { src: "/images/telegram.png", alt: "Telegram" },
                                { src: "/images/twitter.png", alt: "Twitter" }
                            ].map((img, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-lg bg-[#353B40]  flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer group"
                                >
                                    <img
                                        src={img.src}
                                        alt={img.alt}
                                        className="w-5 h-5 object-contain  group-hover:opacity-100 transition-opacity"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className='md:col-span-8 grid font-inter grid-cols-2 md:flex md:gap-10 gap-x-34 gap-y-8 md:absolute md:right-25 md:bottom-77 md:mx-4 mx-6'>
                        {Object.entries(footerLinks).map(([title, links]) => (
                            <div key={title} className="flex flex-col">
                                <h4 className="font-semibold mb-4 md:text-xl text-lg text-white whitespace-nowrap">
                                    {title}
                                </h4>
                                <ul className="md:space-y-4 space-y-3">
                                    {links.map((link) => (
                                        <li key={link}>
                                            <a
                                                href="#"
                                                className="text-gray-500 hover:text-white transition-colors md:text-md text-md cursor-pointer block"
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t max-w-7xl font-manrope mx-auto border-blue-700/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 ">
                    <p className="text-gray-500 text-sm tracking-widest uppercase">
                        COPYRIGHT 2025, ALL RIGHT RESERVED
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="text-gray-500 hover:text-white text-sm tracking-widest uppercase cursor-pointer">PRIVACY</a>
                        <a href="#" className="text-gray-500 hover:text-white text-sm tracking-widest uppercase cursor-pointer">TERMS</a>
                    </div>
                </div>

                <div className="md:mt-10 mt-5 pointer-events-none select-none">
                    <h1 className="md:text-[9vw] font-manrope text-4xl font-bold leading-none text-center tracking-tighter 
        bg-linear-to-b from-gray-500 via-white/9 to-transparent 
        bg-clip-text text-transparent">
                        APEXSIM EXCHANGE
                    </h1>
                </div>
            </div>
        </footer>
    );
}