#!/system/bin/sh
# Virgo Core — Motorola Moto G45 / Android 17 stock-ROM profile
# Game-only performance tuning. Keeps the stock sensor HAL, thermal policy,
# Wi-Fi stack, and scheduler in control to avoid gyro stalls and latency spikes.

MODDIR=${0%/*}
CONF_FILE="$MODDIR/virgo.conf"
LOGFILE="/data/local/tmp/virgoyt_optimizer.log"
LOCKFILE="/data/local/tmp/virgo-core-service.pid"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOGFILE"; }
write_node() { [ -e "$1" ] || return 1; printf '%s\n' "$2" > "$1" 2>/dev/null; }

clear_legacy_properties() {
  resetprop_bin=""
  for candidate in /data/adb/magisk/resetprop /data/adb/ksu/bin/resetprop /data/adb/ap/bin/resetprop; do
    [ -x "$candidate" ] && { resetprop_bin="$candidate"; break; }
  done
  [ -n "$resetprop_bin" ] || return 0
  for prop in \
    persist.vendor.sensors.gyro.odr \
    persist.vendor.sensors.gyro.batch_limit \
    persist.vendor.sensors.direct_channel \
    vendor.sensor.gyro.delay \
    persist.sys.thermal.mitigation \
    persist.vendor.thermal.config \
    persist.sys.cpu.governor \
    persist.sys.gpu.governor \
    persist.sys.gpu.max_clk \
    net.tcp.buffersize.default \
    net.tcp.buffersize.wifi; do
    "$resetprop_bin" --delete "$prop" 2>/dev/null || true
  done
  log "Cleared legacy gyro, thermal, governor, and network properties"
}

# Avoid creating multiple watchdogs when KernelSU WebUI action is tapped.
if [ -f "$LOCKFILE" ]; then
  old_pid=$(cat "$LOCKFILE" 2>/dev/null)
  if [ -n "$old_pid" ] && kill -0 "$old_pid" 2>/dev/null; then
    exit 0
  fi
fi
echo "$$" > "$LOCKFILE"
trap 'rm -f "$LOCKFILE"' EXIT

until [ "$(getprop sys.boot_completed 2>/dev/null)" = "1" ]; do sleep 2; done
sleep 2

[ -f "$CONF_FILE" ] && . "$CONF_FILE"
clear_legacy_properties
: "${ENABLE_GAME_TUNING:=1}"
: "${ENABLE_MEMORY_TRIM:=1}"
: "${ENABLE_NETWORK_TUNING:=0}"
: "${RAM_TRIM_INTERVAL_SEC:=45}"
: "${RAM_TRIM_LEVEL:=RUNNING_LOW}"
: "${GAME_NICE:=-5}"
: "${ENABLE_REFRESH_LOCK:=0}"
: "${LOCKED_REFRESH_RATE_HZ:=120}"

BGMI_PKGS="com.pubg.imobile com.tencent.ig com.pubg.krmobile com.vng.pubgmobile com.rekoo.pubgm"
FREEFIRE_PKGS="com.dts.freefireth com.dts.freefiremax"
GAME_PKGS="$BGMI_PKGS $FREEFIRE_PKGS"
LAST_GAME=""
LAST_TRIM=0

is_game_pkg() {
  case " $GAME_PKGS " in *" $1 "*) return 0 ;; esac
  return 1
}

foreground_pkg() {
  dumpsys activity activities 2>/dev/null \
    | grep -m 1 -E 'mResumedActivity|mFocusedApp' \
    | sed -n 's/.*[ /]\([A-Za-z0-9_]*\.[A-Za-z0-9_.]*\)\/.*/\1/p' \
    | head -n 1
}

pids_for_pkg() {
  pidof "$1" 2>/dev/null
}

apply_game_priority() {
  pkg="$1"
  for pkg_pid in $(pids_for_pkg "$pkg"); do
    # Moderate priority boost only. RT-99 and all-core taskset caused sensor
    # and networking starvation on the G45, so they are intentionally removed.
    renice "$GAME_NICE" -p "$pkg_pid" >/dev/null 2>&1 || true
    write_node "/proc/$pkg_pid/oom_score_adj" -800
  done
  log "Game priority applied: $pkg (nice $GAME_NICE; no RT pinning)"
}

apply_cpu_game_mode() {
  [ "$ENABLE_GAME_TUNING" = "1" ] || return 0
  for policy in /sys/devices/system/cpu/cpufreq/policy*; do
    [ -d "$policy" ] || continue
    if grep -qw performance "$policy/scaling_available_governors" 2>/dev/null; then
      write_node "$policy/scaling_governor" performance
    fi
    # Never force scaling_min_freq to cpuinfo_max_freq: that overheats the
    # G45 and makes the modem/sensor path less responsive after throttling.
  done
  for gpu in /sys/class/kgsl/kgsl-3d0 /sys/class/devfreq/*gpu*; do
    [ -d "$gpu" ] || continue
    if [ -e "$gpu/governor" ]; then
      grep -qw performance "$gpu/available_governors" 2>/dev/null && write_node "$gpu/governor" performance
    elif [ -e "$gpu/devfreq/governor" ]; then
      write_node "$gpu/devfreq/governor" performance
    fi
  done
}

apply_refresh_mode() {
  [ "$ENABLE_REFRESH_LOCK" = "1" ] || return 0
  [ -n "$LOCKED_REFRESH_RATE_HZ" ] || return 0
  settings put system peak_refresh_rate "${LOCKED_REFRESH_RATE_HZ}.0" 2>/dev/null || true
  settings put system min_refresh_rate "${LOCKED_REFRESH_RATE_HZ}.0" 2>/dev/null || true
}

trim_background_apps() {
  [ "$ENABLE_MEMORY_TRIM" = "1" ] || return 0
  now=$(date +%s)
  [ $((now - LAST_TRIM)) -lt "$RAM_TRIM_INTERVAL_SEC" ] && return 0
  LAST_TRIM="$now"
  # Ask Android to trim user apps, but never send a trim request to either
  # protected game family. This avoids force-stopping games or corrupting state.
  pm list packages -3 2>/dev/null | sed 's/^package://' | while read -r pkg; do
    [ -n "$pkg" ] || continue
    is_game_pkg "$pkg" && continue
    am send-trim-memory "$pkg" "$RAM_TRIM_LEVEL" >/dev/null 2>&1 || true
  done
  log "Background app memory trim requested; BGMI/Free Fire excluded"
}

apply_network_mode() {
  [ "$ENABLE_NETWORK_TUNING" = "1" ] || return 0
  # BBR is used only when the stock kernel advertises it. Do not override DNS,
  # TCP timestamps, socket buffers, or Wi-Fi sleep behavior on the stock ROM.
  available=$(cat /proc/sys/net/ipv4/tcp_allowed_congestion_control 2>/dev/null)
  case " $available " in
    *" bbr "*) write_node /proc/sys/net/ipv4/tcp_congestion_control bbr; log "Stock kernel BBR selected" ;;
    *) log "Stock kernel does not advertise BBR; network settings left unchanged" ;;
  esac
}

# Explicitly leave gyro/sensor properties untouched. The Android 17 G45 stock
# sensor HAL owns batching and direct channels; forcing them caused sticking.
log "G45 Android 17 safe mode: stock gyro HAL and thermal policy preserved"
apply_network_mode

while true; do
  active=$(foreground_pkg)
  if is_game_pkg "$active"; then
    if [ "$active" != "$LAST_GAME" ]; then
      log "Protected game foreground: $active"
      apply_cpu_game_mode
      apply_game_priority "$active"
      apply_refresh_mode
      LAST_GAME="$active"
    else
      apply_game_priority "$active"
    fi
    trim_background_apps
  else
    LAST_GAME=""
    trim_background_apps
  fi
  sleep 5
done
