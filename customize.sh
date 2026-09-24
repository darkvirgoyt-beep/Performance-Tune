#!/system/bin/sh
# ========================================================
# Virgo Core Installer - Engineered by VirgoYT
# All Credits to VirgoYT
# Guaranteed KernelSU WebUI, APatch, & Magisk Installation
# Dynamic Preservation of Existing User virgo.conf Settings
# ========================================================

SKIPUNZIP=0

ui_print " "
ui_print " __      _______ _____   _____  ______     _______ "
ui_print " \\ \\    / /_   _|  __ \\ / ____|/ __ \\ \\   / /__   __|"
ui_print "  \\ \\  / /  | | | |__) | |  __ | |  | \\ \\_/ /   | |   "
ui_print "   \\ \\/ /   | | |  _  /| | |_ || |  | |\\   /    | |   "
ui_print "    \\  /   _| |_| | \\ \\| |__| || |__| | | |     | |   "
ui_print "     \\/   |_____|_|  \\_\\\\_____/ \\____/  |_|     |_|   "
ui_print "==================================================="
ui_print "       VIRGO CORE // 120 FPS & IOS SMOOTH SUITE    "
ui_print "                 Author: VirgoYT                   "
ui_print "              All Credits to VirgoYT               "
ui_print "==================================================="
ui_print "[*] Target Display: Maximum Refresh Rate (120Hz/144Hz/165Hz)"
ui_print "[*] Flagship Aim Stick: 720Hz Digitizer & 800Hz Gyro"
ui_print "[*] Small Cores locked at: 2016 MHz"
ui_print "[*] Big Cores locked at: 2304 MHz"
ui_print "[*] GPU locked at: 900 MHz"
ui_print "[*] Memory: Swappiness 10, VFS Cache 50, ZRAM & LMK"
ui_print "[*] Tubes / Scheduler: TurboSched & EAS Bypass Active"
ui_print "[*] Network Engine: TCP BBR Anti-Desync Active"
ui_print " "

# Preserve existing configuration across re-flashes or updates
EXISTING_CONF="/data/adb/modules/virgo-bgmi-core/virgo.conf"
TEMP_CONF="/data/local/tmp/virgo_existing.conf"
rm -f "$TEMP_CONF" 2>/dev/null

if [ -f "$EXISTING_CONF" ]; then
  ui_print "- Found existing user configuration! Backing up to preserve custom settings..."
  cp -f "$EXISTING_CONF" "$TEMP_CONF"
fi

# Ensure webroot directory structure exists for KernelSU WebUI / KsuWebUI
mkdir -p "$MODPATH/webroot"

# Extract entire zip contents into MODPATH
ui_print "- Extracting Virgo Core files & WebUI assets..."
unzip -o "$ZIPFILE" -d "$MODPATH" >&2

# Verify webroot/index.html presence for KsuWebUI
if [ ! -f "$MODPATH/webroot/index.html" ]; then
  ui_print "- Populating KernelSU WebUI fallback..."
  mkdir -p "$MODPATH/webroot"
  unzip -o "$ZIPFILE" "webroot/*" -d "$MODPATH" >&2
fi

# Restore or create persistent virgo.conf runtime configuration
if [ -f "$TEMP_CONF" ]; then
  ui_print "- Restoring your persistent user configuration across boot and updates..."
  cp -f "$TEMP_CONF" "$MODPATH/virgo.conf"
  rm -f "$TEMP_CONF"
elif [ ! -f "$MODPATH/virgo.conf" ]; then
  cat << 'EOC' > "$MODPATH/virgo.conf"
# ========================================================
# Virgo Core Runtime Hardware & Engine Configuration
# Author: VirgoYT | All Credits to VirgoYT
# Persistent User Configuration (Preserved Across Boot)
# ========================================================
ENABLE_MAX_REFRESH_RATE=1
LOCKED_REFRESH_RATE_HZ=120
ENABLE_FLAGSHIP_AIM_STICK=1
ENABLE_IOS_PROMOTION_PACING=1
TOUCH_SAMPLING_RATE=720
GYRO_ODR_HZ=800
ENABLE_CPU_CLOCKS=1
SMALL_CORE_FREQ_KHZ=2016000
BIG_CORE_FREQ_KHZ=2304000
CPU_GOVERNOR=performance
ENABLE_GPU_LOCK=1
GPU_MAX_FREQ_HZ=900000000
GPU_MIN_MHZ=900
GPU_GOVERNOR=performance
ENABLE_MEMORY_TWEAKS=1
ENABLE_TUBES_SCHEDTUNE=1
ENABLE_THERMAL_OPTIMIZATION=1
THERMAL_POLL_MS=300
ENABLE_ANTI_DESYNC_BBR=1
ENABLE_CPUSET_PRIORITY=1
ENABLE_BGMI_WATCHDOG=1
DISABLE_LOGCAT=1
SET_CLOUDFLARE_DNS=1
EOC
fi

# Set proper execution permissions for Magisk, KernelSU, and APatch
set_perm_recursive "$MODPATH" 0 0 0755 0644
set_perm_recursive "$MODPATH/webroot" 0 0 0755 0644
set_perm "$MODPATH/service.sh" 0 0 0755
set_perm "$MODPATH/post-fs-data.sh" 0 0 0755
set_perm "$MODPATH/action.sh" 0 0 0755
chmod 0755 "$MODPATH/service.sh" 2>/dev/null
chmod 0755 "$MODPATH/post-fs-data.sh" 2>/dev/null
chmod 0755 "$MODPATH/action.sh" 2>/dev/null
chmod -R 0755 "$MODPATH/webroot" 2>/dev/null
chmod 0644 "$MODPATH/webroot/index.html" 2>/dev/null
chmod 0644 "$MODPATH/virgo.conf" 2>/dev/null

ui_print " "
ui_print "[✓] KernelSU WebUI registered: /data/adb/modules/virgo-bgmi-core/webroot/index.html"
ui_print "[✓] Configuration permanently active and preserved across reboots."
ui_print "==================================================="
ui_print "              All Credits to VirgoYT               "
ui_print "==================================================="
