import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Flame, 
  Wifi, 
  Crosshair, 
  Cpu, 
  Code, 
  ArrowRight, 
  CheckCircle2, 
  Monitor, 
  Smartphone, 
  Gauge, 
  Boxes, 
  Archive,
  Activity,
  Layers,
  Battery,
  HardDrive
} from 'lucide-react';
import { Language, TabType } from '../types';
import { translations } from '../locales/translations';

interface OverviewDashboardProps {
  language: Language;
  setTab: (tab: TabType) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ language, setTab }) => {
  const t = translations[language];

  // Real-time dynamic telemetry states
  const [liveHz, setLiveHz] = useState<number>(60);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(16.67);
  const [deviceModel, setDeviceModel] = useState<string>('Detecting Hardware...');
  const [gpuRenderer, setGpuRenderer] = useState<string>('Detecting GPU...');
  const [cpuCores, setCpuCores] = useState<number>(8);
  const [ramGigabytes, setRamGigabytes] = useState<string>('8+ GB');
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [networkType, setNetworkType] = useState<string>('Low Jitter Wi-Fi / LTE');

  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const rafIdRef = useRef<number>(0);

  useEffect(() => {
    // 1. Detect Real Device Model from User Agent
    const ua = navigator.userAgent;
    let detectedModel = 'Android Device';

    // Check modern userAgentData if available
    const navAny = navigator as any;
    if (navAny.userAgentData && navAny.userAgentData.model) {
      detectedModel = navAny.userAgentData.model;
    } else {
      // Regex parsing for Android models (e.g. POCO, Xiaomi, Samsung, OnePlus, iQOO, ROG, etc.)
      const androidMatch = ua.match(/Android.*?; ([A-Za-z0-9\s_-]+)\s+Build/);
      if (androidMatch && androidMatch[1]) {
        detectedModel = androidMatch[1].trim();
      } else if (ua.includes('iPhone')) {
        detectedModel = 'Apple iPhone';
      } else if (ua.includes('Windows')) {
        detectedModel = 'Windows Gaming PC';
      } else if (ua.includes('Linux')) {
        detectedModel = 'Linux / Android Architecture';
      }
    }
    setDeviceModel(detectedModel);

    // 2. Detect CPU Cores & Memory
    setCpuCores(navigator.hardwareConcurrency || 8);
    if (navAny.deviceMemory) {
      setRamGigabytes(`${navAny.deviceMemory} GB`);
    }

    // 3. Detect Real GPU Renderer via WebGL Unmasked Info
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (renderer) {
            // Clean up renderer string
            setGpuRenderer(renderer.replace(/Direct3D\d+\s+vs_\d+_\d+\s+ps_\d+_\d+/, '').replace(/\s*\([^)]*\)/g, '').trim());
          }
        }
      }
    } catch {
      setGpuRenderer('Adreno / Mali Graphics Subsystem');
    }

    // 4. Detect Battery if API available
    if (navAny.getBattery) {
      navAny.getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }

    // 5. Detect Network Downlink
    if (navAny.connection) {
      const conn = navAny.connection;
      const speed = conn.downlink ? `${conn.downlink} Mbps` : 'High Speed';
      setNetworkType(`${conn.effectiveType ? conn.effectiveType.toUpperCase() : 'Wi-Fi'} (${speed})`);
    }

    // 6. Real-Time High-Precision Display Refresh Rate (Hz) Engine
    const measureLiveHz = (now: number) => {
      frameCountRef.current++;
      const elapsed = now - lastTimeRef.current;

      // Update every 500ms for rock-solid stability and zero jitter flicker
      if (elapsed >= 500) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / elapsed);
        let standardHz = 60;
        if (measuredFps >= 155) standardHz = 165;
        else if (measuredFps >= 135) standardHz = 144;
        else if (measuredFps >= 105) standardHz = 120;
        else if (measuredFps >= 75) standardHz = 90;
        else standardHz = 60;

        setLiveHz(standardHz);
        setFrameTimeMs(parseFloat((1000 / standardHz).toFixed(2)));

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafIdRef.current = requestAnimationFrame(measureLiveHz);
    };

    rafIdRef.current = requestAnimationFrame(measureLiveHz);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-zinc-950 via-[#14121c] to-zinc-950 border border-orange-500/30 p-6 sm:p-10 overflow-hidden shadow-2xl glow-orange">
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 text-orange-400 text-xs font-mono font-bold tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>VIRGO CORE v4.0 PRO // HARDWARE & KERNELSU ENGINE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-wide leading-tight">
            Small 2016MHz, Big 2304MHz, GPU 900MHz & Optimized Thermals
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Engineered by <strong className="text-orange-400">VirgoYT</strong>. Real-time hardware frequency governor, dynamic thermal mitigation curve, low-jitter TCP BBR network buffers, and 100% universal flashable package for Magisk, KernelSU WebUI, and APatch.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-orange-950/40 border border-orange-500/30 text-orange-300 font-bold">
              Author: VirgoYT
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 font-bold">
              All Credits to VirgoYT
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold">
              Real SU & KernelSU WebUI Active
            </span>
          </div>
        </div>

        {/* Quick Hardware Targets Bar */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="bg-black/50 border border-zinc-800/90 rounded-2xl p-4">
            <span className="text-[11px] font-mono text-zinc-400 block mb-1">Small Cores (Cluster 0)</span>
            <div className="text-xl font-bold font-mono text-white flex items-center justify-between">
              <span className="text-orange-400">2016 MHz</span>
              <span className="text-xs text-zinc-400 font-normal">Cores 0-3</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Performance governor locked for minimal frame pacing delay.
            </p>
          </div>

          <div className="bg-black/50 border border-zinc-800/90 rounded-2xl p-4">
            <span className="text-[11px] font-mono text-zinc-400 block mb-1">Big Cores (Cluster 1)</span>
            <div className="text-xl font-bold font-mono text-white flex items-center justify-between">
              <span className="text-red-400">2304 MHz</span>
              <span className="text-xs text-zinc-400 font-normal">Cores 4-7</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Prime cores set to maximum gaming frequency state.
            </p>
          </div>

          <div className="bg-black/50 border border-zinc-800/90 rounded-2xl p-4">
            <span className="text-[11px] font-mono text-zinc-400 block mb-1">GPU Max 3D Clock</span>
            <div className="text-xl font-bold font-mono text-white flex items-center justify-between">
              <span className="text-cyan-400">900 MHz</span>
              <span className="text-xs text-zinc-400 font-normal">Adreno/KGSL</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Direct KGSL bus split disable for sustained 90 FPS rendering.
            </p>
          </div>
        </div>
      </div>

      {/* Real-Time Hardware & Telemetry Engine (Live Detects Device & Hz) */}
      <div className="bg-[#0d0e17] border border-orange-500/30 rounded-2xl p-6 glow-orange">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-white text-lg">
                Real-Time Hardware & Telemetry Engine
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Live Dynamic Hardware Sensing by VirgoYT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-Time Sensor Active</span>
            </span>
          </div>
        </div>

        {/* Dynamic Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Live Display Hz */}
          <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 block">Real-Time Refresh</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 flex items-baseline gap-1">
              <span>{liveHz}</span>
              <span className="text-xs text-zinc-400">Hz</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 block">{frameTimeMs} ms frame interval</span>
          </div>

          {/* Device Model */}
          <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 block">Detected Model</span>
            <div className="text-sm font-bold font-mono text-white truncate" title={deviceModel}>
              {deviceModel}
            </div>
            <span className="text-[10px] font-mono text-orange-400 block">Android Mobile OS</span>
          </div>

          {/* CPU Cores */}
          <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 block">CPU Architecture</span>
            <div className="text-lg font-bold font-mono text-orange-400">
              {cpuCores} Cores
            </div>
            <span className="text-[10px] font-mono text-zinc-400 block">Octa-Core Octa-Thread</span>
          </div>

          {/* GPU Hardware */}
          <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 block">GPU Renderer</span>
            <div className="text-xs font-bold font-mono text-cyan-400 truncate" title={gpuRenderer}>
              {gpuRenderer}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 block">WebGL 3D Accelerated</span>
          </div>

          {/* System Memory */}
          <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 block">Device Memory</span>
            <div className="text-lg font-bold font-mono text-purple-400">
              {ramGigabytes}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 block">High Bandwidth LPDDR</span>
          </div>

          {/* Battery Status */}
          <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 block">Battery & Power</span>
            <div className="text-lg font-bold font-mono text-amber-400 flex items-center gap-1.5">
              <span>{batteryLevel}%</span>
              {isCharging && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 block">
              {isCharging ? 'Fast Charging' : 'Discharging'}
            </span>
          </div>
        </div>
      </div>

      {/* Feature Deep Dives (Interactive Navigation Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: CPU/GPU & Thermal Tuner */}
        <div 
          onClick={() => setTab('cpu-gpu-thermal')}
          className="group cursor-pointer bg-[#0e1017] hover:bg-[#12141f] border border-zinc-800 hover:border-orange-500/60 rounded-2xl p-6 transition-all duration-300 space-y-4 glow-orange-hover"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white font-heading group-hover:text-orange-300 transition-colors">
              CPU / GPU & Thermal Tuner
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Lock Small Cores @ 2016MHz, Big Cores @ 2304MHz, GPU @ 900MHz with performance governor and calibrated thermal mitigation.
            </p>
          </div>

          <div className="pt-2 text-xs font-mono text-orange-400 flex items-center gap-1.5 font-bold">
            <span>Configure Hardware Clocks</span>
            <span>→</span>
          </div>
        </div>

        {/* Card 2: Magisk Module & Flashable ZIP */}
        <div 
          onClick={() => setTab('magisk-generator')}
          className="group cursor-pointer bg-[#0e1017] hover:bg-[#12141f] border border-zinc-800 hover:border-emerald-500/60 rounded-2xl p-6 transition-all duration-300 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white font-heading group-hover:text-emerald-300 transition-colors">
              Universal Module & ZIP Compiler
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              1-Click generate and download flashable <code>VirgoCore.zip</code> for Magisk, KernelSU, and APatch with VirgoYT ASCII art in <code>customize.sh</code>.
            </p>
          </div>

          <div className="pt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
            <span>Build & Download ZIP</span>
            <span>→</span>
          </div>
        </div>

        {/* Card 3: KernelSU WebUI & Root Compatibility */}
        <div 
          onClick={() => setTab('root-compatibility')}
          className="group cursor-pointer bg-[#0e1017] hover:bg-[#12141f] border border-zinc-800 hover:border-cyan-500/60 rounded-2xl p-6 transition-all duration-300 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <Boxes className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white font-heading group-hover:text-cyan-300 transition-colors">
              KernelSU WebUI & Real SU Bridge
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Live interactive preview of how the WebUI interface and <code>window.ksu.exec</code> root bridge operate inside KernelSU and APatch.
            </p>
          </div>

          <div className="pt-2 text-xs font-mono text-cyan-400 flex items-center gap-1.5 font-bold">
            <span>Open KernelSU WebUI Lab</span>
            <span>→</span>
          </div>
        </div>

        {/* Card 4: Network & Jitter Testing */}
        <div 
          onClick={() => setTab('network-tester')}
          className="group cursor-pointer bg-[#0e1017] hover:bg-[#12141f] border border-zinc-800 hover:border-orange-500/60 rounded-2xl p-6 transition-all duration-300 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 group-hover:scale-110 transition-transform">
              <Wifi className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white font-heading group-hover:text-orange-300 transition-colors">
              Live Ping & Jitter Testing Lab
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Measure real round-trip time and jitter variance against Indian gaming nodes to eliminate packet queuing delay.
            </p>
          </div>

          <div className="pt-2 text-xs font-mono text-orange-400 flex items-center gap-1.5 font-bold">
            <span>Launch Network Diagnostics</span>
            <span>→</span>
          </div>
        </div>

        {/* Card 5: Desync & Tickrate Lab */}
        <div 
          onClick={() => setTab('desync-mechanics')}
          className="group cursor-pointer bg-[#0e1017] hover:bg-[#12141f] border border-zinc-800 hover:border-amber-500/60 rounded-2xl p-6 transition-all duration-300 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white font-heading group-hover:text-amber-300 transition-colors">
              Desync & Tickrate Simulator
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Interactive 2D top-down simulation of BGMI 20-30Hz server tickrate, peeker&apos;s latency window, and client-server reconciliation.
            </p>
          </div>

          <div className="pt-2 text-xs font-mono text-amber-400 flex items-center gap-1.5 font-bold">
            <span>Explore Desync Simulator</span>
            <span>→</span>
          </div>
        </div>

        {/* Card 6: Bullet Reg & Spread Range */}
        <div 
          onClick={() => setTab('bullet-registration')}
          className="group cursor-pointer bg-[#0e1017] hover:bg-[#12141f] border border-zinc-800 hover:border-red-500/60 rounded-2xl p-6 transition-all duration-300 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 group-hover:scale-110 transition-transform">
              <Crosshair className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white font-heading group-hover:text-red-300 transition-colors">
              Bullet Reg & Spread Simulator
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Test M416 vs AKM vs UMP45 spray spread cone, crouch stabilization, and laser sight 25% hipfire spread reduction.
            </p>
          </div>

          <div className="pt-2 text-xs font-mono text-red-400 flex items-center gap-1.5 font-bold">
            <span>Open Shooting Range</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </div>
  );
};
