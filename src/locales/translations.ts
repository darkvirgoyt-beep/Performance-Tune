export const translations = {
  english: {
    appTitle: "VIRGO CORE // 120 FPS & IOS-SMOOTH SUITE",
    appSubtitle: "120 FPS Constant Lock, iOS-Like Touch Pacing, Small 2016MHz, Big 2304MHz, GPU 900MHz",
    authorTag: "Engineered by VirgoYT",
    credits: "All Credits to VirgoYT",
    langName: "English",
    nav: {
      overview: "Telemetry Dashboard",
      fpsIos: "120 FPS & iOS Smoothness",
      cpuGpu: "CPU/GPU & Thermal Tuner",
      magisk: "Module & ZIP Builder",
      rootManagers: "KernelSU WebUI & Flash Guide",
      network: "Ping & Jitter Lab",
      desync: "Desync & Tickrate Lab",
      bullets: "Bullet Reg & Spread Bloom"
    },
    hero: {
      badge: "VIRGOYT ESPORTS 120 FPS & IOS SMOOTH ENGINE",
      heading: "Constant 120 FPS, iOS-Grade Touch Curve & Locked Hardware Clocks",
      subheading: "Engineered by VirgoYT: Constant 120 FPS display lock, iOS-style ProMotion frame pacing, zero-jitter 720Hz touch sampling, Small 2016MHz, Big 2304MHz, GPU 900MHz, and universal Magisk / KernelSU WebUI flashable package.",
      authorCredit: "Curated & Engineered by VirgoYT",
      quickStats: {
        fps: "Target: 120 FPS Constant",
        clocks: "Small 2016M | Big 2304M | GPU 900M",
        pacing: "iOS-Grade 8.33ms Frame Pacing"
      }
    },
    alert: {
      title: "VIRGO CORE ARCHITECTURE PROFILE",
      desc: "Zero dropped frames: Locks display compositor refresh to 120Hz constant with iOS-calibrated touch response curves. CPU small cores locked at 2016MHz, big cores at 2304MHz, and GPU at 900MHz under full performance governor."
    },
    fpsIos: {
      title: "120 Constant FPS & iOS-Like Fluidity Engine",
      desc: "Eliminates Android micro-stutter and frame pacing jitter, delivering iPhone ProMotion silky smoothness.",
      constant120Title: "120 FPS SurfaceFlinger Synchronization",
      constant120Desc: "Locks Android SurfaceFlinger compositor to an unyielding 120Hz refresh rate (8.33ms frame interval). Disables dynamic refresh rate throttling.",
      touchCurveTitle: "iOS-Grade Instantaneous Touch Response",
      touchCurveDesc: "Calibrates gesture touch filtering with 720Hz hardware digitizer sampling. Replicates iOS instant gyro and swipe tracking without jitter.",
      framePacingTitle: "Micro-Stutter Pacing Eliminator",
      framePacingDesc: "Early phase offsets force the GPU and display driver to synchronize frames before V-Sync signals, completely eradicating dropped frames."
    },
    network: {
      title: "Live Ping, Jitter & Latency Diagnostics",
      desc: "High-precision latency and jitter diagnostic testing against Indian gaming CDN nodes.",
      startTest: "Start Ping & Jitter Test",
      stopTest: "Stop Test",
      currentPing: "Current Ping",
      avgPing: "Average Ping",
      jitter: "Network Jitter",
      packetLoss: "Packet Loss",
      grade: "Connection Grade",
      gradeDesc: "Jitter < 3ms and 0% packet loss guarantees instantaneous hit packet delivery to BGMI servers.",
      pingAdvice: "VirgoYT Tip: 5GHz Wi-Fi with BBR congestion control yields the lowest bufferbloat."
    },
    desync: {
      title: "Desync & Tickrate Mechanics",
      desc: "Mathematical breakdown of client-server tickrate reconciliation and latency delta.",
      tickrateTitle: "Server Tick Rate (20-30Hz)",
      tickrateDesc: "Display renders at 120 FPS while server reconciles world state 20-30 times per second.",
      peekersTitle: "Peeker's Latency Window",
      peekersDesc: "The peeking player's position is processed earlier, creating a ~80-120ms peeker advantage window.",
      interactiveLabel: "Interactive Desync Calculator"
    },
    bullets: {
      title: "Bullet Registration & Spread Bloom Physics",
      desc: "Weapon recoil spread expansion and hit confirmation mechanics.",
      ghostBulletTitle: "Ghost Bullets (Client vs Server Hitbox)",
      ghostBulletDesc: "Client renders hit splash, but server rejects validation if packet arrival time exceeds reconciliation threshold.",
      spreadTitle: "Bullet Spread (Bloom Cone)",
      spreadDesc: "Unreal Engine dynamic weapon spread expands with continuous fire and movement velocity.",
      cheatWarning: "Legitimate Mechanics: Laser sights reduce bloom by 25%, crouching stabilizes hipfire spread.",
      safeTips: "Hardware Advantage: 720Hz touch polling rate significantly tightens gyro aiming tracking."
    },
    thermals: {
      title: "Intelligent Thermal Mitigation & Governor Tuning",
      desc: "Maintains maximum 2016MHz / 2304MHz CPU and 900MHz GPU without aggressive dropouts.",
      whyThrottle: "Dynamic Thermal Headroom",
      whyThrottleDesc: "Calibrates polling interval to 300ms, smoothing out thermal transitions.",
      disasterTitle: "Optimization Benefits",
      disasterList: [
        "Core Locking: Small @ 2016 MHz, Big @ 2304 MHz",
        "GPU Subsystem: Adreno locked at 900 MHz",
        "Sustained Performance: Zero micro-stutter frame pacing"
      ],
      realFixTitle: "Professional Thermal Management",
      realFixDesc: "Optimized thermal curves allow full sustained gaming performance."
    },
    magisk: {
      title: "Virgo Core Universal Module & ZIP Builder",
      desc: "Compile ready-to-flash .zip modules for Magisk, KernelSU, and APatch.",
      moduleConfig: "Hardware & Tuning Parameters",
      preview: "Script Preview",
      download: "Download Script (.sh)",
      downloadZip: "Download Flashable .ZIP",
      copy: "Copy Script",
      copied: "Copied!"
    }
  }
};
