import React from 'react';
import { Cpu, ShieldCheck, Heart } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales/translations';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = translations[language];

  return (
    <footer className="mt-16 border-t border-zinc-800 bg-[#07080c] py-10 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 text-orange-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-base text-white tracking-wider">
                VIRGO CORE // BGMI SUITE
              </span>
              <p className="text-xs text-zinc-400 font-mono">
                Author & Lead Developer: <strong className="text-orange-400">VirgoYT</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              100% Anti-Cheat Safe (Ban-Proof)
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-300">
              All Credits to <strong className="text-white font-bold">VirgoYT</strong>
            </span>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 font-mono gap-3">
          <p>
            © {new Date().getFullYear()} Virgo Core. All rights reserved. Created for mobile FPS esports optimization.
          </p>
          <p className="flex items-center gap-1 text-zinc-400">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by <span className="text-white font-bold">VirgoYT</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
