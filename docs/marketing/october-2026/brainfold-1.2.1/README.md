# Brainfold 1.2.1 — approved schoolbook panel and native Mac gallery

Owner approved the English schoolbook composition on October 9, 2026 for localization, native macOS production and screenshot upload to 1.2.1. This delivery adds the import story at position 2. Each iPhone/iPad gallery retains all six previous approved images, byte for byte, and now contains seven. The Mac story contains seven native desktop compositions.

## Artwork

- Editable import translations: `import-copy.json`; `import-copy.tsv` is the base bilingual production sheet. Mac-only headline variants live in JSON.
- Editable composition: `art.html`, rendered by `scripts/marketing/brainfold-store-render.mjs`.
- Full-size exports: `exports/<source-locale>/store-1..7.png`, `ipad-store-1..7.png`, and `mac-store-1..7.png`. Export/native folders are local production artifacts ignored by Git; checksum manifests, copy, provenance and review previews are tracked.
- iPhone: 1320 × 2868. iPad: 2064 × 2752. Mac: 2880 × 1800. All masters are opaque RGB PNGs.
- `ios-validation.json` verifies preservation of the six old panels and the exact approved English pilot. `mac-validation.json` verifies native inputs, opacity, copy, dimensions and every exported checksum.
- `previews/` contains mobile reading checks. The Mac uses approximately 32px headlines and 16px descriptions at 390px width. Longer translations use shorter native-market wording or the app's verified localized mode names/subtitles rather than smaller type. `mac-copy-overrides.json` and `native-short-copy.json` record those decisions.

The original school mathematics book photo and ivory sticker outline are retained from `../brainfold-import-pilot/assets/scan-schoolbook-sticker-v2.png`. The measured SVG silhouette masks ambient generated haze without painting the app or hardware. Complete real flashcards and selected tutor messages are composited in front of the device. Other panels stay clean. Intentional lower-edge device cropping keeps native frames large. The PDF prop is editorial artwork. Original book printing remains English as a shared photographed prop; native UI and marketing text use the appropriate locale.

Apple hardware provenance is in `mac-frame.json` and `../device-framing.json`. The MacBook display opening is 3456 × 2234, starting at y303; the center notch ends lower, at y367. Do not mistake the notch bottom for the display top. Native captures are contained without stretching and the original PNG covers the notch and bezel.

## Native Mac capture

`capture-manifest.json` records 312 real Mac Catalyst captures in 52 supported source locales, their hashes and the isolated binary hash. The capture uses production SwiftUI views and existing bundled localized fixtures. It captures only the app's UIKit hierarchy, without reading the desktop or personal app data. The production Brainfold checkout was not modified.

The reproducible capture patch, capture root and source revision are in `capture/`. Make an isolated Git archive of that revision, apply `capture/capture-only.patch` with `git apply --unidiff-zero`, copy `MarketingCaptureRoot.swift` to `Brainfold/App/`, generate with xcodegen, and build the Brainfold scheme for `platform=macOS,variant=Mac Catalyst` with code signing disabled. Pass the resulting isolated executable to `scripts/marketing/brainfold-macos-capture.py --binary <path>`. Use the approved Apple frame file recorded in `mac-frame.json` before rendering.

```sh
node scripts/marketing/brainfold-store-render.mjs --formats=iphone,ipad,mac
```

The old repository test labeled Mac uses an iPad and is not a source for this gallery. Desktop copy says import pages or a PDF, without promising a desktop camera scanner. The schoolbook photograph illustrates capturing source material on a phone.

## App Store delivery

Fresh Apple read-back verified 147 galleries and 1,029 screenshots in COMPLETE state across iPhone, iPad and Mac (49 listing localizations each), with the schoolbook/PDF image second. Original iOS screenshot IDs and bytes, builds, previews, published versions, listing text, keywords and release settings were preserved. No review submission was made. The Mac draft has no release notes in its 50 existing/new listing records; 12 new localizations also lack description/support URL. These fields remain owner work for a later submission and were not filled with unrelated copy.

The supported source language inventory contains 52 locales. The Apple listing map produces 49 localizations per device family, using same-language regional reuse. Bulgarian, Kazakh and Lithuanian have no corresponding listing locale. The preexisting unsupported `zh-Hans` listing is preserved rather than relabeling Traditional Chinese screenshots. No source language was replaced with another language.

Freeze masters, validate and create a scoped plan before uploading. The uploader defaults Brainfold to these revised masters; explicit flags make replay clear:

```sh
node scripts/marketing/app-store-screenshot-sync.mjs --plan --apps=brainfold --platforms=IOS,MAC_OS --version=1.2.1 --masters-dir=docs/marketing/october-2026/brainfold-1.2.1/exports --preserve-insert=2 --audit-dir=docs/marketing/october-2026/app-store-connect/brainfold-1.2.1
```

Use the existing external MagicLab ASC account environment. Replace `--plan` with `--apply --resume-verified` for an authorized continuation. Original iOS filenames and screenshot IDs are retained when moved to positions 3–7. Credentials and presigned URLs never belong in this repository.

Live baseline, combined plan, final delivered gallery IDs and fresh Apple read-back are in `../app-store-connect/brainfold-1.2.1/`. Check `delivery-status.json` for verified completion and required listing text still missing. This task changes screenshots only: published versions, attached builds, existing previews, keywords, localized text and release settings are preserved. It does not submit a version for review or publish the internal documents to the website.
