import React from 'react';
import { 
  Zap, 
  Flame, 
  Wifi, 
  Crosshair, 
  Cpu, 
  Code, 
  Layers,
  Boxes,
  Activity,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { TabType } from '../types';
import { translations } from '../locales/translations';

interface NavbarProps {
  currentTab: TabType;
  setTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setTab,
}) => {
  const t = translations.english;

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t.nav.overview, icon: <Layers className="w-4 h-4" /> },
    { id: 'fps-ios-smooth', label: t.nav.fpsIos, icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    { id: 'cpu-gpu-thermal', label: t.nav.cpuGpu, icon: <Cpu className="w-4 h-4" /> },
    { id: 'magisk-generator', label: t.nav.magisk, icon: <Code className="w-4 h-4" /> },
    { id: 'root-compatibility', label: t.nav.rootManagers, icon: <Boxes className="w-4 h-4" /> },
    { id: 'network-tester', label: t.nav.network, icon: <Wifi className="w-4 h-4" /> },
    { id: 'desync-mechanics', label: t.nav.desync, icon: <Zap className="w-4 h-4" /> },
    { id: 'bullet-registration', label: t.nav.bullets, icon: <Crosshair className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#090a0f]/95 backdrop-blur-md border-b border-purple-500/20 shadow-lg shadow-black/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Author */}
          <div 
            onClick={() => setTab('overview')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-orange-500 to-red-600 text-white shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl tracking-wider text-white group-hover:text-purple-400 transition-colors">
                  VIRGO CORE
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  120 FPS PRO
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400">
                Author: <strong className="text-orange-400">VirgoYT</strong> | All Credits to VirgoYT
              </p>
            </div>
          </div>

          {/* Status Badges (iOS Smooth & 120 FPS Constant) */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              <span>120 FPS Locked</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>iOS Touch Curve</span>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2.5 scrollbar-none border-t border-zinc-800/80">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/30 to-orange-500/30 text-white font-bold border border-purple-500/50 shadow-md shadow-purple-950/50'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-purple-400' : 'text-zinc-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
