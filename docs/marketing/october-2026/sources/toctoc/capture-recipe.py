#!/usr/bin/env python3
"""Capture the store scenes from the real app, in every store language.

Builds the Debug app unsigned (a signed build is sandboxed and cannot write the PNGs where we
ask), then runs it once per scene and language with the demo agenda, the demo clock and
-captureWindow. Each run draws the scene itself at 2560x1600 and quits.

    Tools/store/.venv/bin/python Tools/store/capture.py            # all locales
    Tools/store/.venv/bin/python Tools/store/capture.py pt-BR      # one (a store locale)
    Tools/store/.venv/bin/python Tools/store/capture.py alert      # one scene, every locale
"""
import json
import pathlib
import subprocess
import sys

from store_locales import store_locales

ROOT = pathlib.Path(__file__).resolve().parents[2]
STORE = ROOT / "Tools" / "store"
DERIVED = ROOT / "build" / "DerivedData"
APP = DERIVED / "Build" / "Products" / "Debug" / "Toc Toc.app"


def build() -> None:
    subprocess.run(
        ["xcodebuild", "-project", str(ROOT / "TocToc.xcodeproj"), "-scheme", "TocToc", "-destination", "platform=macOS",
         "-derivedDataPath", str(DERIVED), "CODE_SIGNING_ALLOWED=NO", "build", "-quiet"],
        check=True,
    )


def capture(locale: str, app_language: str, scene: str, arguments: list[str]) -> pathlib.Path:
    folder = STORE / "captures" / locale
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / f"{scene}.png"
    target.unlink(missing_ok=True)
    subprocess.run(
        ["open", "-n", "-W", str(APP), "--args", *arguments, "-TocTocLocale", app_language, "-captureWindow", str(target)],
        check=True,
    )
    if not target.exists():
        note = target.with_suffix(".png.txt")
        raise SystemExit(f"{locale}/{scene}: no capture ({note.read_text() if note.exists() else 'no note'})")
    print(f"captured {target.relative_to(ROOT)}")
    return target


def main() -> None:
    copy = json.loads((STORE / "copy.json").read_text(encoding="utf-8"))
    scenes = [a for a in sys.argv[1:] if a in copy["scenes"]] or copy["order"]
    wanted = [a for a in sys.argv[1:] if a not in copy["scenes"]]
    build()
    for entry in store_locales():
        if wanted and entry["store"] not in wanted:
            continue
        for scene in scenes:
            capture(entry["store"], entry["app"], scene, copy["scenes"][scene])


if __name__ == "__main__":
    main()
