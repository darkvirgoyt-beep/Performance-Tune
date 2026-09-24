#!/system/bin/sh
# ========================================================
# Virgo Core - post-fs-data.sh (Early Boot Stage)
# Engineered by VirgoYT | All Credits to VirgoYT
# Early Memory, Tubes (SchedTune) & Cpuset Hierarchy
# ========================================================

MODDIR=${0%/*}
LOGFILE="/data/local/tmp/virgo_postfs.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Virgo Core post-fs-data initiated by VirgoYT" > "$LOGFILE"

# 1. Early Cpuset Hierarchy Setup
if [ -d /dev/cpuset ]; then
  echo "0-7" > /dev/cpuset/top-app/cpus 2>/dev/null
  echo "0-7" > /dev/cpuset/foreground/cpus 2>/dev/null
  echo "0-1" > /dev/cpuset/background/cpus 2>/dev/null
  echo "0-3" > /dev/cpuset/system-background/cpus 2>/dev/null
  echo "[VirgoYT] Early cpusets configured" >> "$LOGFILE"
fi

# 2. Early Memory & RAM Buffer Calibration
sysctl -w vm.swappiness=10 2>/dev/null
sysctl -w vm.vfs_cache_pressure=50 2>/dev/null
sysctl -w vm.dirty_ratio=15 2>/dev/null
sysctl -w vm.dirty_background_ratio=5 2>/dev/null
sysctl -w vm.page-cluster=0 2>/dev/null
sysctl -w vm.stat_interval=10 2>/dev/null

# 3. Tubes (SchedTune / TurboSched) Early Initialization
if [ -d /dev/stune ]; then
  echo "30" > /dev/stune/top-app/schedtune.boost 2>/dev/null
  echo "1" > /dev/stune/top-app/schedtune.prefer_idle 2>/dev/null
  echo "0" > /dev/stune/background/schedtune.boost 2>/dev/null
  echo "0" > /dev/stune/background/schedtune.prefer_idle 2>/dev/null
  echo "[VirgoYT] SchedTune tubes configured" >> "$LOGFILE"
fi

# Uclamp (Android 11+ EAS Task Scheduler)
if [ -f /dev/cpuset/top-app/cpu.uclamp.min ]; then
  echo "80.00" > /dev/cpuset/top-app/cpu.uclamp.min 2>/dev/null
  echo "1" > /dev/cpuset/top-app/cpu.uclamp.latency_sensitive 2>/dev/null
  echo "0.00" > /dev/cpuset/background/cpu.uclamp.min 2>/dev/null
fi

# 4. Early Low-Latency Network Socket Tuning (TCP BBR)
sysctl -w net.ipv4.tcp_congestion_control=bbr 2>/dev/null
sysctl -w net.ipv4.tcp_window_scaling=1 2>/dev/null
sysctl -w net.ipv4.tcp_low_latency=1 2>/dev/null
sysctl -w net.ipv4.tcp_timestamps=0 2>/dev/null
sysctl -w net.ipv4.tcp_sack=1 2>/dev/null
sysctl -w net.core.rmem_max=16777216 2>/dev/null
sysctl -w net.core.wmem_max=16777216 2>/dev/null

# 5. Disable Logging Overhead (Decreases background I/O during combat)
setprop logcat.live disable
setprop ro.logd.size 64K
setprop debug.atrace.tags.enableflags 0
profiler.force_disable_ulog 1

echo "[VirgoYT] post-fs-data completed successfully" >> "$LOGFILE"
exit 0
