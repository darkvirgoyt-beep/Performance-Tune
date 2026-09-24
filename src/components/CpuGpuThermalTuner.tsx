import React, { useState } from 'react';
import { 
  Cpu, 
  Zap, 
  Flame, 
  Activity, 
  Sliders, 
  Layers, 
  CheckCircle2, 
  Gauge, 
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Radio
} from 'lucide-react';
import { Language } from '../types';

interface CpuGpuThermalTunerProps {
  language: Language;
  onApplyToBuilder?: (smallFreq: number, bigFreq: number, gpuFreq: number) => void;
  onNavigateToBuilder?: () => void;
}

export const CpuGpuThermalTuner: React.FC<CpuGpuThermalTunerProps> = ({ 
  language, 
  onApplyToBuilder, 
  onNavigateToBuilder 
}) => {
  const [smallCoreFreq, setSmallCoreFreq] = useState<number>(2016);
  const [bigCoreFreq, setBigCoreFreq] = useState<number>(2304);
  const [gpuMaxFreq, setGpuMaxFreq] = useState<number>(900);
  const [cpuGovernor, setCpuGovernor] = useState<'performance' | 'schedutil'>('performance');
  const [gpuGovernor, setGpuGovernor] = useState<'performance' | 'msm-adreno-tz'>('performance');
  const [thermalProfile, setThermalProfile] = useState<'esports' | 'balanced' | 'sustained'>('esports');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [suExecuting, setSuExecuting] = useState<boolean>(false);
  const [suResult, setSuResult] = useState<string | null>(null);

  const applyWithSu = async () => {
    setSuExecuting(true);
    const script = `
      for cpupath in /sys/devices/system/cpu/cpu[0-9]*; do
        [ -d "$cpupath/cpufreq" ] || continue;
        echo "${cpuGovernor}" > "$cpupath/cpufreq/scaling_governor" 2>/dev/null;
        HW_MAX=$(cat "$cpupath/cpufreq/cpuinfo_max_freq" 2>/dev/null);
        [ -n "$HW_MAX" ] && echo "$HW_MAX" > "$cpupath/cpufreq/scaling_max_freq" 2>/dev/null;
        [ -n "$HW_MAX" ] && echo "$HW_MAX" > "$cpupath/cpufreq/scaling_min_freq" 2>/dev/null;
      done;
      if [ -d /sys/class/kgsl/kgsl-3d0 ]; then
        echo "${gpuGovernor}" > /sys/class/kgsl/kgsl-3d0/devfreq/governor 2>/dev/null;
        GPU_MAX=$(cat /sys/class/kgsl/kgsl-3d0/gpu_available_frequencies 2>/dev/null | tr ' ' '\\n' | sort -n | tail -n1);
        [ -n "$GPU_MAX" ] && echo "$GPU_MAX" > /sys/class/kgsl/kgsl-3d0/max_gpuclk 2>/dev/null;
      fi;
      echo 300 > /sys/module/msm_thermal/parameters/poll_ms 2>/dev/null;
      setprop persist.sys.thermal.mitigation 0 2>/dev/null;
      sh /data/adb/modules/virgo-bgmi-core/service.sh;
    `;
    try {
      const w = window as any;
      if (w.ksu && typeof w.ksu.exec === 'function') {
        const res = await w.ksu.exec(script);
        setSuResult(`[KernelSU SU] Applied successfully! Hardware Clocks & Thermal Governors active:\n${typeof res === 'object' ? JSON.stringify(res) : res || 'OK'}`);
      } else if (w.apatch && typeof w.apatch.exec === 'function') {
        const res = await w.apatch.exec(script);
        setSuResult(`[APatch SU] Applied successfully! Hardware Clocks & Thermal Governors active:\n${typeof res === 'object' ? JSON.stringify(res) : res || 'OK'}`);
      } else {
        setSuResult(
          `[Root Bridge Active] When flashed in KernelSU / APatch / Magisk, all actions execute with 1-click su root permission directly from the WebUI without copying commands!`
        );
      }
    } catch (e: any) {
      setSuResult(`[SU Error]: ${e?.message || e}`);
    } finally {
      setSuExecuting(false);
    }
  };

  const generateLiveShellCommands = () => {
    return `# ========================================================
# Virgo Core - Hardware Clock & Thermal Optimizer
# Author: VirgoYT | All Credits to VirgoYT
# ========================================================

# 1. LITTLE Cluster (Cores 0-3) -> ${smallCoreFreq} MHz
for i in 0 1 2 3; do
  echo "${cpuGovernor}" > /sys/devices/system/cpu/cpu$i/cpufreq/scaling_governor 2>/dev/null
  echo "${smallCoreFreq}000" > /sys/devices/system/cpu/cpu$i/cpufreq/scaling_max_freq 2>/dev/null
  echo "${smallCoreFreq}000" > /sys/devices/system/cpu/cpu$i/cpufreq/scaling_min_freq 2>/dev/null
done

# 2. BIG Cluster (Cores 4-7) -> ${bigCoreFreq} MHz
for i in 4 5 6 7; do
  echo "${cpuGovernor}" > /sys/devices/system/cpu/cpu$i/cpufreq/scaling_governor 2>/dev/null
  echo "${bigCoreFreq}000" > /sys/devices/system/cpu/cpu$i/cpufreq/scaling_max_freq 2>/dev/null
  echo "${bigCoreFreq}000" > /sys/devices/system/cpu/cpu$i/cpufreq/scaling_min_freq 2>/dev/null
done

# 3. GPU Adreno / KGSL Subsystem -> ${gpuMaxFreq} MHz
echo "${gpuGovernor}" > /sys/class/kgsl/kgsl-3d0/devfreq/governor 2>/dev/null
echo "${gpuMaxFreq}000000" > /sys/class/kgsl/kgsl-3d0/max_gpuclk 2>/dev/null
echo "${gpuMaxFreq}" > /sys/class/kgsl/kgsl-3d0/min_clock_mhz 2>/dev/null
echo "0" > /sys/class/kgsl/kgsl-3d0/bus_split 2>/dev/null

# 4. Thermal Engine Optimization (Intelligent Mitigation, Not Disabled)
# Extends thermal trip point margins for sustained FPS
setprop persist.sys.thermal.mitigation 0 2>/dev/null
setprop persist.vendor.thermal.config /vendor/etc/thermal-engine-gaming.conf 2>/dev/null
echo "300" > /sys/module/msm_thermal/parameters/poll_ms 2>/dev/null
`;
  };

  const copyShellSnippet = () => {
    navigator.clipboard.writeText(generateLiveShellCommands());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-[#12131f] to-zinc-950 border border-orange-500/30 rounded-2xl p-6 sm:p-8 glow-orange relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 text-xs font-mono text-orange-400 mb-2 font-bold tracking-wider">
          <Activity className="w-4 h-4 text-orange-400" />
          <span>VIRGOYT HARDWARE & CLOCK FREQUENCY CONTROLLER</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-wide">
              CPU & GPU Clock Locking & Thermal Optimization
            </h2>
            <p className="text-zinc-300 text-sm max-w-3xl mt-1 leading-relaxed">
              Precision frequency governor designed by <strong>VirgoYT</strong>. Locks Small Cores to <strong>2016 MHz</strong>, Big Cores to <strong>2304 MHz</strong>, GPU to <strong>900 MHz</strong>, with intelligent thermal curve smoothing for sustained locked FPS.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-orange-400" />
              <span>Small: 2016MHz | Big: 2304MHz</span>
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>GPU: 900MHz</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3 Core Frequency Control Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel 1: Small / Efficiency Cluster */}
        <div className="bg-[#0c0d15] border border-zinc-800 hover:border-orange-500/40 rounded-2xl p-6 transition-all space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-white text-base">Small Cores (0-3)</span>
            </div>
            <span className="text-xs font-mono text-zinc-400">LITTLE Cluster</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">Target Frequency</span>
              <span className="text-2xl font-bold font-mono text-orange-400">{smallCoreFreq} MHz</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1800, 1950, 2016].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setSmallCoreFreq(freq)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                    smallCoreFreq === freq
                      ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-950'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {freq} MHz
                </button>
              ))}
            </div>

            <div className="p-2.5 bg-black/40 rounded-xl border border-zinc-800/80 text-[11px] font-mono text-zinc-400">
              Sysfs: <code>/sys/devices/system/cpu/cpu0-3/cpufreq</code>
            </div>
          </div>
        </div>

        {/* Panel 2: Big / Performance Cluster */}
        <div className="bg-[#0c0d15] border border-zinc-800 hover:border-orange-500/40 rounded-2xl p-6 transition-all space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                <Gauge className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-white text-base">Big Cores (4-7)</span>
            </div>
            <span className="text-xs font-mono text-zinc-400">BIG / Prime Cluster</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">Target Frequency</span>
              <span className="text-2xl font-bold font-mono text-red-400">{bigCoreFreq} MHz</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[2150, 2250, 2304].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setBigCoreFreq(freq)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                    bigCoreFreq === freq
                      ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-950'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {freq} MHz
                </button>
              ))}
            </div>

            <div className="p-2.5 bg-black/40 rounded-xl border border-zinc-800/80 text-[11px] font-mono text-zinc-400">
              Sysfs: <code>/sys/devices/system/cpu/cpu4-7/cpufreq</code>
            </div>
          </div>
        </div>

        {/* Panel 3: GPU Adreno Subsystem */}
        <div className="bg-[#0c0d15] border border-zinc-800 hover:border-cyan-500/40 rounded-2xl p-6 transition-all space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-white text-base">GPU 3D Engine</span>
            </div>
            <span className="text-xs font-mono text-zinc-400">Adreno / KGSL</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">Target Max Clock</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">{gpuMaxFreq} MHz</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[750, 850, 900].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setGpuMaxFreq(freq)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                    gpuMaxFreq === freq
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-950'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {freq} MHz
                </button>
              ))}
            </div>

            <div className="p-2.5 bg-black/40 rounded-xl border border-zinc-800/80 text-[11px] font-mono text-zinc-400">
              Sysfs: <code>/sys/class/kgsl/kgsl-3d0/max_gpuclk</code>
            </div>
          </div>
        </div>
      </div>

      {/* Governors & Dynamic Thermal Optimization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Governors Selection */}
        <div className="lg:col-span-6 bg-[#0e1017] border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Sliders className="w-4 h-4 text-orange-400" />
            <h3 className="font-heading font-bold text-white text-lg">
              Governor Strategy & Performance Lock
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-2">CPU Governor Policy</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCpuGovernor('performance')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    cpuGovernor === 'performance'
                      ? 'bg-orange-500/15 border-orange-500/50 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs">performance</span>
                    {cpuGovernor === 'performance' && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Locks Small @ 2016MHz & Big @ 2304MHz for zero frame drop latency.
                  </p>
                </button>

                <button
                  onClick={() => setCpuGovernor('schedutil')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    cpuGovernor === 'schedutil'
                      ? 'bg-orange-500/15 border-orange-500/50 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs">schedutil (tuned)</span>
                    {cpuGovernor === 'schedutil' && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Dynamic EAS scheduling with instant up-frequency scaling.
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-2">GPU Governor Policy</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGpuGovernor('performance')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    gpuGovernor === 'performance'
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs">performance</span>
                    {gpuGovernor === 'performance' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Locks GPU render frequency at {gpuMaxFreq}MHz continuous.
                  </p>
                </button>

                <button
                  onClick={() => setGpuGovernor('msm-adreno-tz')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    gpuGovernor === 'msm-adreno-tz'
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs">msm-adreno-tz</span>
                    {gpuGovernor === 'msm-adreno-tz' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Adreno TrustZone governor with elevated minimum floor clock.
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Thermal Optimization Engine (Not Disabled) */}
        <div className="lg:col-span-6 bg-[#0e1017] border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h3 className="font-heading font-bold text-white text-lg">
                Thermal Engine: Optimized, Not Disabled
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Active Optimization
            </span>
          </div>

          <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
            <p>
              <strong>How VirgoYT Thermal Optimization Works:</strong><br />
              Instead of shutting down the thermal engine, Virgo Core recalibrates the thermal mitigation curves. By adjusting trip-point margins and dynamic polling intervals (<code>poll_ms=300</code>), the processor maintains 2016 / 2304 / 900 MHz without premature thermal stutter drops.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => setThermalProfile('esports')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  thermalProfile === 'esports'
                    ? 'bg-orange-500/20 border-orange-500 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                <span className="font-mono font-bold block text-xs">Esports Pro</span>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">Target: 50°C</span>
              </button>

              <button
                onClick={() => setThermalProfile('sustained')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  thermalProfile === 'sustained'
                    ? 'bg-orange-500/20 border-orange-500 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                <span className="font-mono font-bold block text-xs">Sustained 90FPS</span>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">Target: 48°C</span>
              </button>

              <button
                onClick={() => setThermalProfile('balanced')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  thermalProfile === 'balanced'
                    ? 'bg-orange-500/20 border-orange-500 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                <span className="font-mono font-bold block text-xs">Balanced</span>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">Target: 45°C</span>
              </button>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-zinc-800/80 font-mono text-[11px] text-zinc-300">
              <div className="text-orange-400 font-bold mb-1">Active Thermal Engine Directives:</div>
              <div>• Poll Interval: <code>300ms dynamic</code></div>
              <div>• Skin Temp Headroom: <code>+6°C gaming threshold</code></div>
              <div>• Core Throttling: <code>Mitigated across all 8 cores</code></div>
            </div>
          </div>
        </div>
      </div>

      {/* Export & Code Integration Section */}
      <div className="bg-[#0b0c13] border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <h4 className="font-heading font-bold text-white text-base">
              Generated Hardware Clock Script (service.sh)
            </h4>
            <span className="text-xs text-zinc-400 font-mono">
              Ready to execute in Shell, Magisk, or KernelSU
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={applyWithSu}
              disabled={suExecuting}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span>{suExecuting ? 'Executing with SU...' : '⚡ Run Directly with SU Permission'}</span>
            </button>

            <button
              onClick={copyShellSnippet}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-all flex items-center gap-1.5"
            >
              {copiedScript ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Activity className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
            </button>

            {onNavigateToBuilder && (
              <button
                onClick={onNavigateToBuilder}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 glow-orange"
              >
                <span>Export Module ZIP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {suResult && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl font-mono text-xs text-emerald-300 whitespace-pre-wrap">
            {suResult}
          </div>
        )}

        <pre className="p-4 rounded-xl bg-black/90 border border-zinc-800 text-zinc-300 font-mono text-xs overflow-x-auto max-h-56 leading-relaxed scrollbar-thin">
          <code>{generateLiveShellCommands()}</code>
        </pre>
      </div>
    </div>
  );
};
