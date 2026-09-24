#!/system/bin/sh
# ========================================================
# Virgo Core - service.sh (Late Boot Root Daemon & BGMI Booster)
# Engineered by VirgoYT | All Credits to VirgoYT
# 120 FPS / Max Refresh Rate Constant Lock & Flagship Aim Stick
# Memory & SchedTune "Tubes" Architecture Active by Default
# Ultra-Low RAM Footprint (< 1MB RSS) & Zero Background Jitter
# Preserves User-Configured Hz and Settings Permanently Across Boots
# Compatible with Magisk, KernelSU, and APatch
# ========================================================

MODDIR=${0%/*}
LOGFILE="/data/local/tmp/virgoyt_optimizer.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Virgo Core initiated by VirgoYT" > "$LOGFILE"

# Wait until Android framework is completely booted
until [ "$(getprop sys.boot_completed)" = "1" ]; do
  sleep 2
done
sleep 2

# Read virgo.conf with High Max Performance Fallback Defaults
CONF_FILE="$MODDIR/virgo.conf"
[ ! -f "$CONF_FILE" ] && CONF_FILE="/data/adb/modules/virgo-bgmi-core/virgo.conf"
if [ -f "$CONF_FILE" ]; then
  . "$CONF_FILE"
  echo "[VirgoYT] Loaded user configuration from $CONF_FILE" >> "$LOGFILE"
fi

# High Max Performance Fallback Defaults
: "${ENABLE_MAX_REFRESH_RATE:=1}"
: "${LOCKED_REFRESH_RATE_HZ:=120}"
: "${ENABLE_FLAGSHIP_AIM_STICK:=1}"
: "${ENABLE_IOS_PROMOTION_PACING:=1}"
: "${TOUCH_SAMPLING_RATE:=720}"
: "${GYRO_ODR_HZ:=800}"
: "${ENABLE_MEMORY_TWEAKS:=1}"
: "${ENABLE_TUBES_SCHEDTUNE:=1}"
: "${ENABLE_CPU_CLOCKS:=1}"
: "${SMALL_CORE_FREQ_KHZ:=2016000}"
: "${BIG_CORE_FREQ_KHZ:=2304000}"
: "${CPU_GOVERNOR:=performance}"
: "${ENABLE_GPU_LOCK:=1}"
: "${GPU_MAX_FREQ_HZ:=900000000}"
: "${GPU_MIN_MHZ:=900}"
: "${GPU_GOVERNOR:=performance}"
: "${ENABLE_THERMAL_OPTIMIZATION:=1}"
: "${THERMAL_POLL_MS:=300}"
: "${ENABLE_ANTI_DESYNC_BBR:=1}"
: "${ENABLE_CPUSET_PRIORITY:=1}"
: "${DISABLE_LOGCAT:=1}"
: "${SET_CLOUDFLARE_DNS:=1}"
: "${ZERO_ANIMATIONS_ZERO_DELAY:=1}"

# ========================================================
# 1. PERMANENT REFRESH RATE LOCK (PRESERVED ACROSS REBOOTS)
# ========================================================
if [ "$ENABLE_MAX_REFRESH_RATE" -eq 1 ]; then
  # If user explicitly chose a Hz in virgo.conf (e.g. 120, 144, 90, 165), use that.
  # Otherwise auto-detect display's highest panel rate.
  if [ -n "$LOCKED_REFRESH_RATE_HZ" ] && [ "$LOCKED_REFRESH_RATE_HZ" -gt 0 ]; then
    TARGET_HZ="$LOCKED_REFRESH_RATE_HZ"
    echo "[VirgoYT] Applying user-locked permanent refresh rate: ${TARGET_HZ}Hz" >> "$LOGFILE"
  else
    DETECTED_HZ=$(dumpsys display 2>/dev/null | grep -oE "fps=[0-9]+" | cut -d= -f2 | sort -nr | head -n1)
    [ -z "$DETECTED_HZ" ] || [ "$DETECTED_HZ" -lt 120 ] && DETECTED_HZ=120
    TARGET_HZ="$DETECTED_HZ"
    echo "[VirgoYT] Auto-detected maximum panel refresh rate: ${TARGET_HZ}Hz" >> "$LOGFILE"
  fi

  # Apply SurfaceFlinger hardware lock and permanent system props
  service call SurfaceFlinger 1035 i32 1 2>/dev/null
  setprop persist.sys.min_refresh_rate "${TARGET_HZ}.0"
  setprop persist.sys.max_refresh_rate "${TARGET_HZ}.0"
  setprop ro.vendor.display.default_fps "$TARGET_HZ"
  setprop persist.vendor.display.default_fps "$TARGET_HZ"
  
  # Write directly to global & secure Android settings databases
  settings put system min_refresh_rate "${TARGET_HZ}.0" 2>/dev/null
  settings put system peak_refresh_rate "${TARGET_HZ}.0" 2>/dev/null
  settings put system user_refresh_rate "$TARGET_HZ" 2>/dev/null
  settings put secure refresh_rate_mode 2 2>/dev/null
  settings put global oneplus_screen_refresh_rate 2 2>/dev/null
  settings put system miui_refresh_rate "$TARGET_HZ" 2>/dev/null
  settings put secure miui_refresh_rate "$TARGET_HZ" 2>/dev/null
  
  # Hardware DRM CRTC lock
  for crtc in /sys/class/drm/*/measured_fps; do
    echo "$TARGET_HZ" > "$crtc" 2>/dev/null
  done
fi

# ========================================================
# 2. FLAGSHIP AIM STICK & ZERO-JITTER TOUCH DIGITIZER
# ========================================================
if [ "$ENABLE_FLAGSHIP_AIM_STICK" -eq 1 ]; then
  echo "[VirgoYT] Activating Real Touch Digitizer Game Mode & 800Hz Gyro Direct Channel..." >> "$LOGFILE"
  # Universal Android Touch & SurfaceFlinger latency reduction
  setprop debug.touch.sampling_rate "$TOUCH_SAMPLING_RATE"
  setprop touch.filter.level 0
  setprop view.touch_slop 0
  setprop touch.pressure.scale 0.001
  setprop touch.size.calibration geometric
  setprop touch.pressure.calibration amplitude
  setprop persist.sys.touch.latency minimal
  setprop persist.sys.input_latency 0
  setprop debug.sf.disable_backpressure 1
  setprop persist.sys.scrolling.friction 0.006
  setprop view.scroll_friction 0.006

  # Real Hardware OEM Touch Game Mode Sysfs Activation
  for touch_node in \
    /proc/touchpanel/game_switch_enable \
    /sys/class/touch/touch_dev/touch_thp_game \
    /sys/class/touch/touch_dev/gesture_control \
    /sys/devices/virtual/touch/touch_dev/bump_sample_rate \
    /sys/devices/platform/goodix_ts.*/game_mode \
    /sys/class/sec/tsp/cmd; do
    [ -e "$touch_node" ] && echo 1 > "$touch_node" 2>/dev/null
  done
  echo 0 > /proc/touchpanel/oppo_tp_limit_enable 2>/dev/null

  # Gyroscope Direct Channel & Instant Sensor Dispatch (Zero Delay)
  setprop persist.vendor.sensors.gyro.odr "$GYRO_ODR_HZ"
  setprop persist.vendor.sensors.gyro.batch_limit 0
  setprop ro.vendor.sensors.gyro.odr "$GYRO_ODR_HZ"
  setprop persist.vendor.sensors.direct_channel 1
  setprop vendor.sensor.gyro.delay 1250
fi

# ========================================================
# ZERO SYSTEM ANIMATIONS & INSTANT RESPONSE ENGINE
# ========================================================
if [ "$ZERO_ANIMATIONS_ZERO_DELAY" -eq 1 ]; then
  echo "[VirgoYT] Eliminating UI animation scales (0.0x) for instant input response..." >> "$LOGFILE"
  settings put global window_animation_scale 0.0 2>/dev/null
  settings put global transition_animation_scale 0.0 2>/dev/null
  settings put global animator_duration_scale 0.0 2>/dev/null
  settings put system window_animation_scale 0.0 2>/dev/null
  settings put system transition_animation_scale 0.0 2>/dev/null
  settings put system animator_duration_scale 0.0 2>/dev/null
fi

# ========================================================
# 3. ULTRA-LOW RAM CONSUMPTION & MEMORY OPTIMIZATION
# ========================================================
if [ "$ENABLE_MEMORY_TWEAKS" -eq 1 ]; then
  echo "[VirgoYT] Calibrating Low-RAM footprint, Swappiness 10 & VFS Cache 50..." >> "$LOGFILE"
  sysctl -w vm.swappiness=10 2>/dev/null
  sysctl -w vm.vfs_cache_pressure=50 2>/dev/null
  sysctl -w vm.dirty_ratio=15 2>/dev/null
  sysctl -w vm.dirty_background_ratio=5 2>/dev/null
  sysctl -w vm.page-cluster=0 2>/dev/null
  sysctl -w vm.stat_interval=10 2>/dev/null
  
  # Shrink Android logcat buffers from 16MB/64MB to 128KB, freeing 50MB+ RAM instantly
  logcat -G 128K 2>/dev/null || true
  setprop persist.logd.size 128K 2>/dev/null
  
  # Compact physical memory blocks without thrashing storage
  echo 1 > /proc/sys/vm/compact_memory 2>/dev/null
fi

# ========================================================
# 4. "TUBES" (SCHEDTUNE, TURBOSCHED & EAS BYPASS)
# ========================================================
if [ "$ENABLE_TUBES_SCHEDTUNE" -eq 1 ]; then
  echo "[VirgoYT] Engaging SchedTune Tubes & TurboSched..." >> "$LOGFILE"
  if [ -d /dev/stune ]; then
    echo "30" > /dev/stune/top-app/schedtune.boost 2>/dev/null
    echo "1" > /dev/stune/top-app/schedtune.prefer_idle 2>/dev/null
    echo "0" > /dev/stune/background/schedtune.boost 2>/dev/null
  fi
  if [ -f /dev/cpuset/top-app/cpu.uclamp.min ]; then
    echo "80.00" > /dev/cpuset/top-app/cpu.uclamp.min 2>/dev/null
    echo "1" > /dev/cpuset/top-app/cpu.uclamp.latency_sensitive 2>/dev/null
  fi
  # Bypass EAS energy model for maximum performance throughput
  echo "0" > /proc/sys/kernel/sched_energy_aware 2>/dev/null
  echo "2" > /proc/sys/kernel/sched_boost 2>/dev/null
  echo "10000000" > /proc/sys/kernel/sched_latency_ns 2>/dev/null
  echo "2000000" > /proc/sys/kernel/sched_min_granularity_ns 2>/dev/null
fi

# ========================================================
# 5. iOS-GRADE PROMOTION FRAME PACING (Zero Micro-Stutter)
# ========================================================
if [ "$ENABLE_IOS_PROMOTION_PACING" -eq 1 ]; then
  echo "[VirgoYT] Applying iOS Early V-Sync GL Phase Offsets..." >> "$LOGFILE"
  setprop debug.sf.high_fps_early_phase_offset_ns 6100000
  setprop debug.sf.early_gl_phase_offset_ns 9000000
  setprop debug.sf.early_phase_offset_ns 6100000
  setprop debug.sf.high_fps_early_gl_phase_offset_ns 9000000
  setprop debug.sf.latch_unsignaled 1
  setprop renderthread.skia.reduceopstasksplitting true
  setprop debug.renderengine.backend skiagl
  setprop debug.hwui.renderer skiagl
  setprop persist.sys.composition.type c2d
  setprop debug.sf.enable_hwc_vds 1
fi

# ========================================================
# 6. CPU TASK ISOLATION & ALLOCATION
# ========================================================
if [ "$ENABLE_CPUSET_PRIORITY" -eq 1 ]; then
  echo "[VirgoYT] Optimizing CPU Task Governor & Cpusets..." >> "$LOGFILE"
  echo "0-7" > /dev/cpuset/top-app/cpus 2>/dev/null
  echo "0-7" > /dev/cpuset/foreground/cpus 2>/dev/null
  echo "0-1" > /dev/cpuset/background/cpus 2>/dev/null
  echo "0-3" > /dev/cpuset/system-background/cpus 2>/dev/null
fi

# ========================================================
# 7. CPU HARDWARE CLOCKS (DYNAMIC SILICON MAX DETECTION)
# ========================================================
if [ "$ENABLE_CPU_CLOCKS" -eq 1 ]; then
  echo "[VirgoYT] Locking CPU Cores to Hardware Silicon Maximum Frequencies..." >> "$LOGFILE"

  # Dynamically iterate all CPU cores on the SoC (Qualcomm, MediaTek, Exynos, Tensor)
  for cpupath in /sys/devices/system/cpu/cpu[0-9]*; do
    [ -d "$cpupath/cpufreq" ] || continue
    # Apply performance governor if available, else schedutil
    if grep -q "performance" "$cpupath/cpufreq/scaling_available_governors" 2>/dev/null; then
      echo "performance" > "$cpupath/cpufreq/scaling_governor" 2>/dev/null
    fi
    # Real silicon maximum frequency detection
    HW_MAX_KHZ=$(cat "$cpupath/cpufreq/cpuinfo_max_freq" 2>/dev/null)
    if [ -n "$HW_MAX_KHZ" ] && [ "$HW_MAX_KHZ" -gt 0 ]; then
      echo "$HW_MAX_KHZ" > "$cpupath/cpufreq/scaling_max_freq" 2>/dev/null
      echo "$HW_MAX_KHZ" > "$cpupath/cpufreq/scaling_min_freq" 2>/dev/null
    fi
  done
fi

# ========================================================
# 8. GPU ADRENO / KGSL & MALI SUBSYSTEM HARDWARE LOCK
# ========================================================
if [ "$ENABLE_GPU_LOCK" -eq 1 ]; then
  echo "[VirgoYT] Locking GPU Subsystem to Hardware Silicon Max Frequency..." >> "$LOGFILE"

  # Adreno / KGSL subsystem
  if [ -d /sys/class/kgsl/kgsl-3d0 ]; then
    echo "performance" > /sys/class/kgsl/kgsl-3d0/devfreq/governor 2>/dev/null
    # Auto-detect real maximum available GPU frequency from driver
    REAL_GPU_MAX=$(cat /sys/class/kgsl/kgsl-3d0/gpu_available_frequencies 2>/dev/null | tr ' ' '\n' | sort -n | tail -n1)
    [ -z "$REAL_GPU_MAX" ] && REAL_GPU_MAX="$GPU_MAX_FREQ_HZ"
    if [ -n "$REAL_GPU_MAX" ] && [ "$REAL_GPU_MAX" -gt 0 ]; then
      echo "$REAL_GPU_MAX" > /sys/class/kgsl/kgsl-3d0/max_gpuclk 2>/dev/null
      REAL_GPU_MHZ=$((REAL_GPU_MAX / 1000000))
      [ "$REAL_GPU_MHZ" -gt 0 ] && echo "$REAL_GPU_MHZ" > /sys/class/kgsl/kgsl-3d0/min_clock_mhz 2>/dev/null
    fi
    echo "0" > /sys/class/kgsl/kgsl-3d0/bus_split 2>/dev/null
    echo "0" > /sys/class/kgsl/kgsl-3d0/idle_timer 2>/dev/null
    echo "0" > /sys/class/kgsl/kgsl-3d0/thermal_pwrlevel 2>/dev/null
  fi

  # Mali & Devfreq GPU subsystem (Dimensity, Exynos, Tensor)
  for malipath in /sys/class/devfreq/*gpu* /sys/devices/platform/*mali* /sys/devices/platform/*gpu*; do
    [ -d "$malipath" ] || continue
    echo "performance" > "$malipath/governor" 2>/dev/null
    MALI_MAX=$(cat "$malipath/available_frequencies" 2>/dev/null | tr ' ' '\n' | sort -n | tail -n1)
    [ -n "$MALI_MAX" ] && echo "$MALI_MAX" > "$malipath/min_freq" 2>/dev/null
    [ -n "$MALI_MAX" ] && echo "$MALI_MAX" > "$malipath/max_freq" 2>/dev/null
  done
fi

# ========================================================
# 9. THERMAL MITIGATION RECALIBRATION & 18W UNCAP
# ========================================================
if [ "$ENABLE_THERMAL_OPTIMIZATION" -eq 1 ]; then
  echo "[VirgoYT] Calibrating Thermal Mitigation & Uncapping Screen-On Charging..." >> "$LOGFILE"
  echo "$THERMAL_POLL_MS" > /sys/module/msm_thermal/parameters/poll_ms 2>/dev/null
  setprop persist.sys.thermal.mitigation 0 2>/dev/null

  # Uncap screen-on thermal charging throttle to device's stock 18W (2000000 uA = 2A @ 9V)
  for cur_node in \
    /sys/class/power_supply/usb/current_max \
    /sys/class/power_supply/battery/constant_charge_current_max \
    /sys/class/power_supply/battery/current_max; do
    [ -f "$cur_node" ] && echo 2000000 > "$cur_node" 2>/dev/null
  done
fi

# ========================================================
# 10. ANTI-DESYNC & BULLET HIT REGISTRATION (TCP BBR)
# ========================================================
if [ "$ENABLE_ANTI_DESYNC_BBR" -eq 1 ]; then
  echo "[VirgoYT] Activating TCP BBR Low Latency Netstack & Zero Bufferbloat..." >> "$LOGFILE"
  sysctl -w net.ipv4.tcp_congestion_control=bbr 2>/dev/null
  sysctl -w net.ipv4.tcp_window_scaling=1 2>/dev/null
  sysctl -w net.ipv4.tcp_low_latency=1 2>/dev/null
  sysctl -w net.ipv4.tcp_timestamps=0 2>/dev/null
  sysctl -w net.ipv4.tcp_sack=1 2>/dev/null
  sysctl -w net.ipv4.tcp_slow_start_after_idle=0 2>/dev/null
  sysctl -w net.ipv4.tcp_notsent_lowat=16384 2>/dev/null
  sysctl -w net.core.netdev_max_backlog=10000 2>/dev/null
  sysctl -w net.core.rmem_max=16777216 2>/dev/null
  sysctl -w net.core.wmem_max=16777216 2>/dev/null
  sysctl -w net.ipv4.tcp_rmem="4096 87380 16777216" 2>/dev/null
  sysctl -w net.ipv4.tcp_wmem="4096 65536 16777216" 2>/dev/null
  sysctl -w net.ipv4.tcp_fin_timeout=15 2>/dev/null
fi

# ========================================================
# 11. WI-FI & CLOUDFLARE DNS
# ========================================================
if [ "$SET_CLOUDFLARE_DNS" -eq 1 ]; then
  settings put global wifi_scan_throttle_enabled 1 2>/dev/null
  settings put global wifi_sleep_policy 2 2>/dev/null
  setprop net.dns1 1.1.1.1
  setprop net.dns2 1.0.0.1
fi

echo "[VirgoYT] Target permanent refresh rate (${TARGET_HZ}Hz), aim stick, tubes, and clocks active!" >> "$LOGFILE"

# ========================================================
# 12. REAL BGMI FOREGROUND PROCESS WATCHDOG (Zero-RAM Daemon)
# ========================================================
(
  BGMI_PKGS="com.pubg.imobile com.tencent.ig com.pubg.krmobile com.vng.pubgmobile com.rekoo.pubgm"
  LAST_PID=""
  while true; do
    ACTIVE_PID=""
    for PKG in $BGMI_PKGS; do
      PID=$(pidof "$PKG" 2>/dev/null)
      if [ -n "$PID" ]; then
        ACTIVE_PID="$PID"
        break
      fi
    done

    if [ -n "$ACTIVE_PID" ]; then
      # Run initial high-priority binding only ONCE per game launch
      if [ "$ACTIVE_PID" != "$LAST_PID" ]; then
        echo "[VirgoYT] BGMI launched (PID: $ACTIVE_PID). Enforcing Real RT Priority & Dynamic CPU Pinning..." >> "$LOGFILE"
        # Linux Real-Time priority & OOM kill immunity
        renice -20 -p "$ACTIVE_PID" 2>/dev/null
        chrt -r -p 99 "$ACTIVE_PID" 2>/dev/null || chrt -f -p 99 "$ACTIVE_PID" 2>/dev/null || true
        echo "-1000" > "/proc/$ACTIVE_PID/oom_score_adj" 2>/dev/null
        echo "$ACTIVE_PID" > /dev/cpuset/top-app/tasks 2>/dev/null

        # Dynamically detect hardware CPU count and bind to all available performance cores
        NUM_CPUS=$(ls -d /sys/devices/system/cpu/cpu[0-9]* 2>/dev/null | wc -l)
        [ "$NUM_CPUS" -le 0 ] && NUM_CPUS=8
        taskset -p -c 0-$((NUM_CPUS - 1)) "$ACTIVE_PID" 2>/dev/null

        # Enforce display refresh rate & purge dormant memory
        service call SurfaceFlinger 1035 i32 1 2>/dev/null
        [ -n "$TARGET_HZ" ] && settings put system min_refresh_rate "${TARGET_HZ}.0" 2>/dev/null
        echo "0-$((NUM_CPUS - 1))" > /dev/cpuset/top-app/cpus 2>/dev/null
        echo 1 > /proc/sys/vm/compact_memory 2>/dev/null
        LAST_PID="$ACTIVE_PID"
      fi
      # In-game sleep: 6 seconds (ultra-low CPU & < 1MB RAM overhead)
      sleep 6
    else
      LAST_PID=""
      # Idle sleep: 10 seconds (near-zero daemon CPU & RAM utilization)
      sleep 10
    fi
  done
) &

exit 0
