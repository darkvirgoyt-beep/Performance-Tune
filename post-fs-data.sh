#!/system/bin/sh
# Virgo Core — G45 Android 17 stock-ROM-safe early boot setup
# Do not modify the sensor HAL, cpuset topology, thermal policy, or DNS here.

LOGFILE=/data/local/tmp/virgo_postfs.log
echo "[$(date '+%Y-%m-%d %H:%M:%S')] G45 safe module early boot" > "$LOGFILE"

# Conservative VM values only; Android LMKD remains responsible for reclaim.
sysctl -w vm.vfs_cache_pressure=50 2>/dev/null || true
sysctl -w vm.page-cluster=0 2>/dev/null || true

# Leave congestion control, timestamps, buffers, Wi-Fi, and DNS under stock ROM control.

echo "[$(date '+%Y-%m-%d %H:%M:%S')] G45 safe early boot complete" >> "$LOGFILE"
exit 0
