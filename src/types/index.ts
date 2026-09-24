export type Language = 'english';

export type TabType = 
  | 'overview'
  | 'magisk-generator'
  | 'cpu-gpu-thermal'
  | 'fps-ios-smooth'
  | 'network-tester'
  | 'desync-mechanics'
  | 'bullet-registration'
  | 'root-compatibility';

export interface PingDataPoint {
  id: number;
  time: string;
  ping: number;
  jitter: number;
}

export interface NetworkTestResult {
  minPing: number;
  maxPing: number;
  avgPing: number;
  jitter: number;
  packetLossPercent: number;
  qualityScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface MagiskConfigOptions {
  moduleName: string;
  author: string;
  version: string;
  // Core CPU & GPU Frequencies
  smallCoreFreq: number; // 2016 MHz
  bigCoreFreq: number;   // 2304 MHz
  gpuMaxFreq: number;    // 900 MHz
  cpuGovernor: 'performance' | 'schedutil';
  gpuGovernor: 'performance' | 'msm-adreno-tz';
  // Thermal Engine Optimization
  enableThermalOptimization: boolean;
  thermalSkinHeadroom: number;
  // 120 Constant FPS & iOS-Like Ultra Smoothness
  lock120Fps: boolean;
  enableIosFramePacing: boolean;
  touchSamplingRate: number; // 480 or 720 Hz
  enableIosTouchCurve: boolean;
  // Network & Display
  enableTcpBbr: boolean;
  enableTouchPolling: boolean;
  disableWifiScanThrottling: boolean;
  enableSurfaceFlingerPriority: boolean;
  minimizeLogcat: boolean;
  enableGpuPreload: boolean;
  setDns1111: boolean;
}
