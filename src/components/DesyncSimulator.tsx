import React, { useState } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  RotateCcw, 
  Clock, 
  Cpu, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales/translations';

interface DesyncSimulatorProps {
  language: Language;
}

export const DesyncSimulator: React.FC<DesyncSimulatorProps> = ({ language }) => {
  const t = translations.english;

  const [yourPing, setYourPing] = useState<number>(30);
  const [enemyPing, setEnemyPing] = useState<number>(75);
  const [serverTickRate, setServerTickRate] = useState<number>(20); // 20Hz default in mobile BR
  const [simulationState, setSimulationState] = useState<'idle' | 'peeking' | 'firing' | 'knocked'>('idle');

  // Mathematical Calculation of Desync Window
  const tickIntervalMs = Math.round(1000 / serverTickRate);
  const oneWayEnemy = Math.round(enemyPing / 2);
  const oneWayYou = Math.round(yourPing / 2);
  const desyncDelayMs = oneWayEnemy + oneWayYou + tickIntervalMs + 8; // 8.33ms at 120 FPS

  const runSimulation = () => {
    setSimulationState('peeking');
    setTimeout(() => {
      setSimulationState('firing');
      setTimeout(() => {
        setSimulationState('knocked');
      }, 700);
    }, 600);
  };

  const resetSim = () => {
    setSimulationState('idle');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#12131c] to-zinc-900 border border-orange-500/30 rounded-2xl p-6 glow-orange">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-400 mb-2">
          <Zap className="w-4 h-4" />
          <span>VIRGOYT UNREAL ENGINE 4 SERVER ANALYSIS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
          {t.desync.title}
        </h2>
        <p className="text-zinc-400 text-sm max-w-3xl mt-1">
          {t.desync.desc}
        </p>
      </div>

      {/* Interactive Desync Lab Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls & Variables */}
        <div className="lg:col-span-5 bg-[#0d0e17] border border-zinc-800 rounded-2xl p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-400" />
              Network & Tick Variables
            </h3>
            <span className="text-xs font-mono text-zinc-400">UE4 Physics Engine</span>
          </div>

          <div className="space-y-5">
            {/* Your Ping Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300">Your Latency (RTT):</span>
                <span className="text-emerald-400 font-bold">{yourPing} ms</span>
              </div>
              <input
                type="range"
                min="15"
                max="160"
                value={yourPing}
                onChange={(e) => setYourPing(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Enemy Ping Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300">Enemy Latency (RTT):</span>
                <span className="text-red-400 font-bold">{enemyPing} ms</span>
              </div>
              <input
                type="range"
                min="20"
                max="220"
                value={enemyPing}
                onChange={(e) => setEnemyPing(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Server Tick Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300">Server Tickrate:</span>
                <span className="text-orange-400 font-bold">{serverTickRate} Hz ({tickIntervalMs}ms tick interval)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[20, 30, 60].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setServerTickRate(rate)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-all ${
                      serverTickRate === rate
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {rate} Hz {rate === 20 ? '(BGMI Match)' : rate === 30 ? '(Endzone)' : '(Custom/Scrim)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Peeker Advantage Window */}
            <div className="p-4 bg-gradient-to-r from-orange-950/40 via-red-950/30 to-zinc-900 border border-orange-500/30 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-300">Calculated Peeker Advantage:</span>
                <span className="text-xl font-bold font-mono text-orange-400">{desyncDelayMs} ms</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                The enemy sees your player model <strong>{desyncDelayMs}ms</strong> before your screen receives the server packet indicating that the enemy peeked from cover!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={runSimulation}
                disabled={simulationState !== 'idle'}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Simulate Peeker&apos;s Desync</span>
              </button>
              <button
                onClick={resetSim}
                className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-all flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Visual 2D Simulation Stage */}
        <div className="lg:col-span-7 bg-[#0d0e17] border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="font-heading font-bold text-lg text-white">
                Live Peeker&apos;s Advantage Simulator
              </h3>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                simulationState === 'knocked'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : simulationState === 'firing'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                State: {simulationState.toUpperCase()}
              </span>
            </div>

            {/* Simulation Canvas Viewport */}
            <div className="relative h-64 bg-[#07080d] border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-between px-10">
              {/* Floor grid */}
              <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

              {/* Player 1: Enemy (Peeker) */}
              <div 
                className={`relative z-10 flex flex-col items-center transition-all duration-500 ${
                  simulationState === 'peeking' || simulationState === 'firing' || simulationState === 'knocked'
                    ? 'translate-x-8'
                    : 'translate-x-0'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center shadow-lg shadow-red-950/80">
                  <span className="text-xs font-bold text-white font-mono">PEEKER</span>
                </div>
                <div className="text-[11px] font-mono text-red-400 mt-1">Enemy ({enemyPing}ms)</div>
                {simulationState === 'firing' && (
                  <div className="text-[10px] font-mono text-amber-400 font-bold mt-0.5 animate-pulse">
                    Fired Spray!
                  </div>
                )}
              </div>

              {/* Bullet Stream Animation */}
              {simulationState === 'firing' && (
                <div className="absolute left-28 right-28 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 animate-pulse shadow-sm shadow-red-500" />
                </div>
              )}

              {/* Central Wall / Concrete Cover */}
              <div className="relative z-20 flex flex-col items-center">
                <div className="w-10 h-44 bg-zinc-700/80 border-2 border-zinc-500 rounded-lg flex items-center justify-center shadow-2xl">
                  <span className="transform -rotate-90 text-[10px] font-mono font-bold text-zinc-300 tracking-wider">
                    WALL COVER
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono mt-1">Solid Wall</span>
              </div>

              {/* Player 2: You (Ducked Behind Cover) */}
              <div 
                className={`relative z-10 flex flex-col items-center transition-all duration-500 ${
                  simulationState === 'firing' || simulationState === 'knocked'
                    ? '-translate-x-2'
                    : 'translate-x-0'
                }`}
              >
                <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-lg transition-all ${
                  simulationState === 'knocked'
                    ? 'bg-red-950/80 border-red-500 shadow-red-950'
                    : 'bg-emerald-600/30 border-emerald-500 shadow-emerald-950/80'
                }`}>
                  <span className="text-xs font-bold text-white font-mono">
                    {simulationState === 'knocked' ? 'KNOCKED!' : 'YOU'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 mt-1">You ({yourPing}ms)</div>
                {simulationState === 'knocked' && (
                  <div className="text-[11px] font-mono text-red-400 font-bold mt-0.5 animate-pulse">
                    Dead behind wall!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Explanation Step-by-Step */}
          <div className="mt-4 bg-zinc-900/70 border border-zinc-800 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="border-l-2 border-orange-500 pl-3">
                <span className="text-orange-400 font-bold block mb-1">Step 1: Peeker Action</span>
                <span className="text-zinc-400">The opponent initiates a fast right-peek. Their local client fires immediately and dispatches hit packets to the server.</span>
              </div>
              <div className="border-l-2 border-amber-500 pl-3">
                <span className="text-amber-400 font-bold block mb-1">Step 2: Server Reconciliation</span>
                <span className="text-zinc-400">The server evaluates historical game state at 20-30Hz: You were visible in the open when the opponent fired. Hit is validated!</span>
              </div>
              <div className="border-l-2 border-red-500 pl-3">
                <span className="text-red-400 font-bold block mb-1">Step 3: Delayed Knock Packet</span>
                <span className="text-zinc-400">You retreated behind solid cover on your screen, but the damage packet reaches your device {desyncDelayMs}ms late, knocking you behind the wall!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VirgoYT Competitive Tactical Guidelines */}
      <div className="bg-[#0e1017] border border-zinc-800 rounded-2xl p-6">
        <h4 className="font-heading font-bold text-white text-lg mb-3 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          Can a Magisk Module Eliminate Desync 100%?
        </h4>
        <div className="text-sm text-zinc-300 space-y-3 leading-relaxed">
          <p>
            <strong>The Transparent Engineering Fact:</strong> Desync cannot be eliminated 100% strictly from the client side because server tickrates (20-30Hz) and opponents&apos; ping variance are controlled by Krafton&apos;s server infrastructure.
          </p>
          <p>
            <strong>How Virgo Core Cuts Peeker Advantage by Up to 70%:</strong>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs">
              <span className="text-orange-400 font-bold block mb-1">1. Always Be The Peeker</span>
              <span className="text-zinc-400">Never remain static holding an angle. Always pre-fire while peeking out to utilize the {desyncDelayMs}ms peeker advantage yourself.</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs">
              <span className="text-orange-400 font-bold block mb-1">2. TCP BBR Buffer Tuning</span>
              <span className="text-zinc-400">Minimizes kernel packet queue latency so your movement updates reach the server before the next reconciliation tick.</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs">
              <span className="text-orange-400 font-bold block mb-1">3. 120 FPS & 720Hz Digitizer Polling</span>
              <span className="text-zinc-400">Locks display refresh rate to 120Hz (8.33ms) and touch polling to 720Hz (1.3ms), cutting client-side latency to the absolute floor.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
