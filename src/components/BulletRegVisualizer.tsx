import React, { useState } from 'react';
import { 
  Crosshair, 
  ShieldAlert, 
  RotateCcw, 
  Sparkles, 
  Target, 
  HelpCircle,
  AlertOctagon,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales/translations';

interface BulletRegVisualizerProps {
  language: Language;
}

interface BulletImpact {
  id: number;
  x: number;
  y: number;
  isHit: boolean;
  isGhost: boolean;
}

export const BulletRegVisualizer: React.FC<BulletRegVisualizerProps> = ({ language }) => {
  const t = translations.english;

  const [weapon, setWeapon] = useState<'m416' | 'akm' | 'ump45'>('m416');
  const [stance, setStance] = useState<'standing' | 'crouch' | 'jiggling'>('standing');
  const [hasLaserSight, setHasLaserSight] = useState<boolean>(false);
  const [packetLossSimulation, setPacketLossSimulation] = useState<number>(5); // 5% packet loss
  const [bullets, setBullets] = useState<BulletImpact[]>([]);
  const [isFiring, setIsFiring] = useState<boolean>(false);

  // Weapon Base Spread Radii (pixels from center)
  const weaponConfigs = {
    m416: { name: 'M416 (5.56 AR)', baseSpread: 38, fireRate: 85, recoil: 'Medium' },
    akm: { name: 'AKM (7.62 AR)', baseSpread: 56, fireRate: 100, recoil: 'High' },
    ump45: { name: 'UMP45 (.45 SMG)', baseSpread: 24, fireRate: 90, recoil: 'Low' },
  };

  const calculateEffectiveSpread = () => {
    let spread = weaponConfigs[weapon].baseSpread;
    if (stance === 'crouch') spread *= 0.7; // Crouch tightens spread by 30%
    if (stance === 'jiggling') spread *= 1.45; // Moving / Jiggling expands spread by 45%
    if (hasLaserSight) spread *= 0.75; // Laser sight reduces hipfire bloom by 25%
    return Math.round(spread);
  };

  const fireSpray = () => {
    if (isFiring) return;
    setIsFiring(true);
    setBullets([]);

    const totalRounds = 30;
    const currentSpread = calculateEffectiveSpread();
    const newImpacts: BulletImpact[] = [];

    let count = 0;
    const interval = setInterval(() => {
      count++;
      
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * currentSpread;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // Hit validation: target radius is 50px
      const isWithinHitbox = radius <= 50;
      // Simulated packet drop (ghost bullet: blood effect client-side, 0 dmg on server)
      const isGhost = isWithinHitbox && Math.random() * 100 < packetLossSimulation;
      const isHit = isWithinHitbox && !isGhost;

      newImpacts.push({
        id: count,
        x,
        y,
        isHit,
        isGhost,
      });

      setBullets([...newImpacts]);

      if (count >= totalRounds) {
        clearInterval(interval);
        setIsFiring(false);
      }
    }, weaponConfigs[weapon].fireRate);
  };

  const resetTarget = () => {
    setBullets([]);
  };

  const totalFired = bullets.length;
  const confirmedHits = bullets.filter(b => b.isHit).length;
  const ghostBullets = bullets.filter(b => b.isGhost).length;
  const missedBullets = bullets.filter(b => !b.isHit && !b.isGhost).length;
  const accuracy = totalFired > 0 ? Math.round((confirmedHits / totalFired) * 100) : 0;
  const spreadRadius = calculateEffectiveSpread();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#13151f] to-zinc-900 border border-orange-500/30 rounded-2xl p-6 glow-orange">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-400 mb-2">
          <Crosshair className="w-4 h-4" />
          <span>VIRGOYT BALLISTICS & UNREAL ENGINE PHYSICS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
          {t.bullets.title}
        </h2>
        <p className="text-zinc-400 text-sm max-w-3xl mt-1">
          {t.bullets.desc}
        </p>
      </div>

      {/* Interactive Shooting Range Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 bg-[#0d0e17] border border-zinc-800 rounded-2xl p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-400" />
              Weapon & Stance Configuration
            </h3>
            <span className="text-xs font-mono text-zinc-400">30-Round Magazine</span>
          </div>

          <div className="space-y-5">
            {/* Weapon Selector */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-300 block">Select Weapon Archetype:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['m416', 'akm', 'ump45'] as const).map(w => (
                  <button
                    key={w}
                    onClick={() => { setWeapon(w); setBullets([]); }}
                    className={`p-2 rounded-xl text-xs font-mono border text-center transition-all ${
                      weapon === w
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold">{w.toUpperCase()}</div>
                    <div className="text-[10px] text-zinc-400">{weaponConfigs[w].recoil} Recoil</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stance Selector */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-300 block">Movement & Player Stance:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'standing', label: 'Standing', desc: '100% Base Bloom' },
                  { id: 'crouch', label: 'Crouched', desc: '-30% Bloom (Tight)' },
                  { id: 'jiggling', label: 'Fast Jiggle', desc: '+45% Bloom (Wide)' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setStance(s.id as any); setBullets([]); }}
                    className={`p-2 rounded-xl text-xs font-mono border text-center transition-all ${
                      stance === s.id
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div>{s.label}</div>
                    <div className="text-[10px] text-zinc-400">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Attachments Toggle */}
            <div className="flex items-center justify-between p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
              <div>
                <span className="text-xs font-mono text-white font-bold block">Equip Laser Sight Attachment</span>
                <span className="text-[11px] text-zinc-400">Tightens hipfire bullet bloom by 25%</span>
              </div>
              <button
                onClick={() => { setHasLaserSight(!hasLaserSight); setBullets([]); }}
                className={`w-12 h-6 rounded-full transition-colors relative ${hasLaserSight ? 'bg-orange-500' : 'bg-zinc-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${hasLaserSight ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Network Packet Drop Simulation Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300">Packet Jitter & Drop Simulation:</span>
                <span className="text-red-400 font-bold">{packetLossSimulation}% Ghost Bullets</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={packetLossSimulation}
                onChange={(e) => setPacketLossSimulation(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <span className="text-[10px] text-zinc-400 block font-mono">
                Simulates hit validation packets rejected by the server due to high latency variance.
              </span>
            </div>

            {/* Spray Trigger */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={fireSpray}
                disabled={isFiring}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow flex items-center justify-center gap-2"
              >
                <Crosshair className="w-4 h-4" />
                <span>{isFiring ? 'Firing Spray...' : 'Fire 30-Round Hipfire Spray'}</span>
              </button>
              <button
                onClick={resetTarget}
                className="py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-all flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Target Stage Canvas */}
        <div className="lg:col-span-7 bg-[#0d0e17] border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <span>Interactive Hitbox & Bloom Canvas</span>
              </h3>
              <span className="text-xs font-mono text-orange-400">
                Spread Radius: {spreadRadius}px
              </span>
            </div>

            {/* Target Area */}
            <div className="relative h-72 bg-[#07080d] border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

              {/* Spread Cone Ring (Dynamic based on weapon, stance & laser sight) */}
              <div 
                className="absolute rounded-full border-2 border-dashed border-orange-500/50 bg-orange-500/5 transition-all duration-300 pointer-events-none"
                style={{
                  width: `${spreadRadius * 2}px`,
                  height: `${spreadRadius * 2}px`,
                }}
              />

              {/* Enemy Hitbox Circle (50px radius = 100px diameter) */}
              <div className="relative w-24 h-24 rounded-full border-2 border-emerald-500/80 bg-emerald-950/20 flex items-center justify-center shadow-lg shadow-emerald-950/40 pointer-events-none">
                <div className="w-10 h-10 rounded-full border border-red-500/80 bg-red-950/30 flex items-center justify-center">
                  <span className="text-[9px] font-mono font-bold text-red-400">HEAD</span>
                </div>
                <div className="absolute top-1 right-2 text-[8px] font-mono text-emerald-400">BODY</div>
              </div>

              {/* Crosshair Center Reticle */}
              <div className="absolute w-2 h-2 rounded-full bg-orange-400 pointer-events-none" />
              <div className="absolute w-8 h-0.5 bg-orange-400/60 pointer-events-none" />
              <div className="absolute h-8 w-0.5 bg-orange-400/60 pointer-events-none" />

              {/* Bullet Impacts */}
              {bullets.map((b) => (
                <div
                  key={b.id}
                  style={{
                    transform: `translate(${b.x}px, ${b.y}px)`,
                  }}
                  className={`absolute w-3.5 h-3.5 rounded-full -ml-1.5 -mt-1.5 flex items-center justify-center transition-all ${
                    b.isHit
                      ? 'bg-emerald-400 shadow-md shadow-emerald-400 glow-emerald animate-ping-once'
                      : b.isGhost
                      ? 'bg-red-500 shadow-md shadow-red-500 animate-pulse border-2 border-white'
                      : 'bg-zinc-600/80'
                  }`}
                  title={b.isGhost ? 'Ghost Bullet (Blood showed, 0 damage on server)' : b.isHit ? 'Confirmed Damage Hit' : 'Missed Spread'}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono mt-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                Confirmed Damage Hits ({confirmedHits})
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-3 h-3 rounded-full bg-red-500 border border-white" />
                Ghost Bullets (Dropped on Server) ({ghostBullets})
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-3 h-3 rounded-full bg-zinc-600" />
                Spread Misses ({missedBullets})
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 grid grid-cols-3 gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-center">
            <div>
              <span className="text-[11px] font-mono text-zinc-400 block">Total Fired</span>
              <span className="text-xl font-bold font-mono text-white">{totalFired}/30</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-zinc-400 block">Effective Accuracy</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{accuracy}%</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-zinc-400 block">Ghost Bullets</span>
              <span className="text-xl font-bold font-mono text-red-400">{ghostBullets}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Production & Integrity Advisory */}
      <div className="bg-[#0e1017] border border-red-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-white font-heading">
              VirgoYT Production Advisory: The Technical Truth on Bullet Spread & Anti-Cheat
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed">
              In competitive mobile shooters running Unreal Engine 4, weapon spread angles and recoil impulses are strictly validated server-side. Any modification claiming &quot;zero recoil&quot; or &quot;zero spread&quot; does not perform system-level optimizations; rather, it injects into game memory (<code>libUE4.so</code> and <code>libanogs.so</code>).
            </p>
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 font-mono">
              ⚠️ Krafton&apos;s Anti-Cheat Expert (ACE) performs periodic integrity hash audits every 60 seconds. Memory tampering results in an immediate 10-year ban. Virgo Core avoids memory tampering entirely, focusing 100% on real-time display compositing, 720Hz digitizer latency, hardware clock locking, and TCP bufferbloat elimination.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
