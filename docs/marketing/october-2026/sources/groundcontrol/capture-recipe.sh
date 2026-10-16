#!/bin/bash
# Website captures of Ground Control 1.0 as it ships (2026-10-16): the real app, driven invisibly
# through each scene on a disposable demo fleet by its SnapshotDirector, photographed with
# ScreenCaptureKit (`photo`, the app's own window) at 1280 pt. Nothing touches a real repository.
# Run from the Ground Control repository after a Debug build; writes /private/tmp/magiclab-groundcontrol-native.
set -euo pipefail
ROOT="$(pwd)"                                        # the GroundControl repository
WORK="/private/tmp/magiclab-groundcontrol-capture-fleet"
RAW="/private/tmp/magiclab-groundcontrol-native"     # Debug is the strict sandbox plus /private/tmp
APP="$ROOT/build/dd/Build/Products/Debug/Ground Control.app/Contents/MacOS/Ground Control"
rm -rf "$WORK" "$RAW"; mkdir -p "$WORK" "$RAW"

shoot() {
  local fleet="$WORK/$1/Development"
  "$ROOT/Tools/demo/make-store-fleet.sh" "$fleet" >/dev/null
  # A demo identity and no global config: nobody's real name in a picture. US English dates.
  GIT_CONFIG_GLOBAL=/dev/null GIT_AUTHOR_NAME="Ada Lovelace" GIT_AUTHOR_EMAIL=ada@example.com \
  GIT_COMMITTER_NAME="Ada Lovelace" GIT_COMMITTER_EMAIL=ada@example.com \
  GROUNDCONTROL_LIBRARY="$WORK/$1/library.json" GROUNDCONTROL_DEFAULTS=com.magiclabsolutions.groundcontrol.site \
  GROUNDCONTROL_ADD="$fleet" GROUNDCONTROL_SELECT="$fleet/$2" GROUNDCONTROL_SNAPSHOT="$RAW" \
  GROUNDCONTROL_DISPLAY_HOME="$WORK/$1" \
  GROUNDCONTROL_SCRIPT="width 1280; wait 3; quiet; ${3//FLEET/$fleet}; quit" \
    perl -e 'alarm 120; exec { $ARGV[0] } @ARGV' "$APP" -AppleLocale en_US -AppleLanguages "(en)" >"$WORK/$1.log" 2>&1
  [ -f "$RAW/$1.png" ] || { echo "capture: $1 was not taken ($WORK/$1.log)" >&2; exit 1; }
  echo "captured $1"
}
# Several tabs open: opening repositories one after another needs a wait between them.
shoot native-1 Apps/Orbiter "repo FLEET/Apps/Telescope; wait 0.8; repo FLEET/Apps/Almanac; wait 0.8; repo FLEET/Apps/Lander; wait 0.8; repo FLEET/Apps/Orbiter; wait 1; select HEAD; wait 1; photo native-1"
shoot native-2 Apps/Lander "inspector off; pull; wait 0.8; answer confirm; wait 0.8; resolve; quiet; wait 1; photo native-2; inspector on"
shoot native-3 Apps/Orbiter "find sound; wait 1.5; photo native-3; find off"

if grep -l -i "hoffmann\|evandro" "$RAW"/*.txt >/dev/null 2>&1; then echo "capture: a real name in the state files" >&2; exit 1; fi
