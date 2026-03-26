"use client";
import React from 'react';
import Image from 'next/image';
import { APP_LANGUAGE_EVENT, AppLanguageCode, getAppLanguage, t } from '@/lib/i18n';


export default function DashboardFooter() {
    const [lang, setLang] = React.useState<AppLanguageCode>('Eng');
    const tr = (key: string) => t(key, lang);

    React.useEffect(() => {
        const applyLanguage = () => setLang(getAppLanguage());
        applyLanguage();
        window.addEventListener('storage', applyLanguage);
        window.addEventListener(APP_LANGUAGE_EVENT, applyLanguage as EventListener);
        return () => {
            window.removeEventListener('storage', applyLanguage);
            window.removeEventListener(APP_LANGUAGE_EVENT, applyLanguage as EventListener);
        };
    }, []);

    return (
        <footer className="text-white pt-5 pb-10 md:px-6 overflow-hidden">
            <div className="max-w-9xl mx-auto">


                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:mb-50 mb-10">

                    <div className="md:col-span-4 md:ml-20 ml-5">
                        <h3 className="md:text-2xl text-xl font-bricolage font-bold mb-3 tracking-wide">APEXSIM</h3>
                        <p className="text-gray-400 mb-3 font-manrope leading-6 max-w-xs">
                            {tr('footerTagline')}
                        </p>
                    </div>
                </div>

                <div className="border-t max-w-7xl font-manrope mx-auto border-blue-700/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 ">
                    <p className="text-gray-500 text-sm tracking-widest uppercase">
                        {tr('copyright2025')}
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="text-gray-500 hover:text-white text-sm tracking-widest uppercase cursor-pointer">{tr('privacy')}</a>
                        <a href="#" className="text-gray-500 hover:text-white text-sm tracking-widest uppercase cursor-pointer">{tr('terms')}</a>
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