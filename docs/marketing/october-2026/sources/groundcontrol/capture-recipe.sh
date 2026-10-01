#!/bin/bash
# App Store screenshots: the real app, driven invisibly through each scene on a demo fleet,
# photographed at 2×, then framed with a caption (groundcontrol-art store). Nothing here touches a
# real repository. Usage: Tools/store/shots.sh   (builds Debug first; writes fastlane/screenshots/en-US)
set -euo pipefail
ROOT="/private/tmp/magiclab-groundcontrol-capture"
# /private/tmp: the one place outside the home folder the sandboxed Debug build may write.
WORK="/private/tmp/magiclab-groundcontrol-capture-fleet"
RAW="/private/tmp/magiclab-groundcontrol-native"
APP="/private/tmp/magiclab-groundcontrol-build/Build/Products/Debug/Ground Control.app/Contents/MacOS/Ground Control"
rm -rf "$WORK" "$RAW"; mkdir -p "$WORK" "$RAW"

# shoot <name> <repo inside the fleet> <script>: a fresh fleet each time — pulls change it.
# Wait before answering a question: dismissing an alert sheet mid-animation crashed AppKit.
shoot() {
  local fleet="$WORK/$1/Development"
  "$ROOT/Tools/demo/make-store-fleet.sh" "$fleet" >/dev/null
  # A demo identity and no global config: a rebase in a shot re-commits, and the committer must
  # never be whoever runs this (a screenshot once said "Committed by" the owner). US English, so
  # dates read "Sep 28, 2025" whatever this Mac's region is.
  GIT_CONFIG_GLOBAL=/dev/null GIT_AUTHOR_NAME="Ada Lovelace" GIT_AUTHOR_EMAIL=ada@example.com \
  GIT_COMMITTER_NAME="Ada Lovelace" GIT_COMMITTER_EMAIL=ada@example.com \
  GROUNDCONTROL_SNAPSHOT_SCALE=2 GROUNDCONTROL_LIBRARY="$WORK/$1/library.json" \
  GROUNDCONTROL_DEFAULTS=com.magiclabsolutions.groundcontrol.store GROUNDCONTROL_ADD="$fleet" \
  GROUNDCONTROL_SELECT="$fleet/$2" GROUNDCONTROL_SNAPSHOT="$RAW" \
  GROUNDCONTROL_SCRIPT="width 1280; wait 3; quiet; $3; quit" \
    perl -e 'alarm 90; exec { $ARGV[0] } @ARGV' "$APP" -AppleLocale en_US -AppleLanguages "(en)" >/dev/null
  [ -f "$RAW/$1.png" ] || { echo "shots: $1 was not taken" >&2; exit 1; }
  echo "shot $1"
}
shoot 1-flight-map Apps/Orbiter "select HEAD; wait 1; photo 1-flight-map"
shoot 2-conflicts Apps/Lander "inspector off; pull; wait 0.8; answer confirm; wait 0.8; resolve; quiet; wait 0.8; photo 2-conflicts; inspector on"
# Orbiter has diverged and has uncommitted work: merge or rebase, then "set your changes aside?".
shoot 3-pull Apps/Orbiter "pull; wait 0.8; answer rebase; wait 0.8; answer confirm; wait 0.8; select HEAD; wait 0.8; photo 3-pull"
shoot 4-changes Apps/Orbiter "select WIP; wait 0.8; photo 4-changes"

# Nobody's real name in a store picture.
if grep -l -i "hoffmann\|evandro" "$RAW"/*.txt >/dev/null 2>&1; then echo "shots: a real name in the state files" >&2; exit 1; fi

