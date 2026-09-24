#!/system/bin/sh
# KernelSU / APatch Quick Action Trigger
# Start the singleton watcher in the background so the WebUI action does not hang.
MODDIR=${0%/*}
sh "$MODDIR/service.sh" >/dev/null 2>&1 &
echo "G45 safe game tuner restarted"
