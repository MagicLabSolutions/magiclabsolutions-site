# Memories — native macOS screenshots, version 1.1.1

Six panels cover personal memories, the month film, highlights, soundtrack choices, the annual birthday film and separate projects. The project panel identifies the Plus feature. Retain the approved family photography, use the current Ocean Teal native palette and original Apple MacBook hardware, and alternate clean frames with selected native photo, soundtrack and project-identity components. Cropping the hardware at the canvas bottom is intentional; native pixels fit uniformly into the measured opening, with a separate inset below its camera notch.

## Native production source

App Store Mac 1.1.1 has build 13 attached. Source revision `ca06912c20fb698deef96eb5e2e4d7998f4b99ad` is its release commit: the main checkout still predates the actual Mac Catalyst release and must not supply these captures. Build the isolated archive with Xcode 27, Debug, `platform=macOS,variant=Mac Catalyst,arch=arm64`, a task-owned DerivedData/package directory, `-skipMacroValidation -skipPackagePluginValidation`, and unsigned `com.magiclabsolutions.memories.marketingcapture` identifier. The capture patch only changes that disposable source snapshot. Current production checkouts and auth/billing stay unchanged.

`capture/native-capture.patch` records the offline UIKit capture driver and hosts derived from the current release's screenshot target. It mounts real production content views at 1200 × 776 points and captures their own hierarchy at 2x; the desktop and personal app data are never photographed. An in-memory SwiftData model and task-owned per-locale media folder supply demonstration memories. SDK initialization uses offline placeholder Firebase options; production auth, purchases, fetching and lifecycle scheduling are bypassed. The app-group identifier is isolated too.

Re-use `../localized/work/memories-unique-cache` and its existing photo-identity/provenance manifest at `../sources/memories/unique-photo-fixture/manifest.json`. Each child-album photo has its own identity; current months contain the accepted fictional family, pet and travel assets. Native month mosaics use the earlier distinct memories, while compilation posters use different files. The annual photo lives in the existing `../memories-1.1.1/assets/` package and is written into the real yearly compilation thumbnail path. This fixture changes media and seeded content, not the production photo interface or feature set. Language-neutral names `Léo`, `Léo & Mia` and `2026` accompany native localized project kinds.

The production build's Mac icon is extracted from its archived AppIcon.icns. Store geometry uses the original Apple MacBook opening, not the notch bottom. Per-language image measurements select complete photograph bounds, a whole soundtrack tile and a complete project identity (avatar, name and kind), trimming only the row's unused blank padding. Foreground content does not cover the title and remains within the canvas. Longer annual-film layouts use a native short heading plus the original benefit as their description; device width is measured against the yearly poster, ready badge and title so those details remain visible above the bottom crop.

## Reproduction

- `scripts/marketing/memories-macos-capture.py --binary=<isolated executable>` writes verified `native/<locale>/` captures. It fingerprints both the native executable and its Debug dylib, verifies immutability and records six images per locale.
- `scripts/marketing/memories-macos-render.mjs --preflight` verifies all copy layouts using English solely as a size placeholder; no localized master is exported in that mode.
- `scripts/marketing/memories-macos-render.mjs --wait-native` renders actual localized native interfaces, reads complete component bounds per language and applies editable `copy.json` plus accepted/native short captions. Type is not reduced for long languages.
- `scripts/marketing/memories-macos-package.mjs` validates/finalizes opaque 2880 × 1800 masters, source/capture hashes, component bounds, text metrics, contact sheet and 320px QA samples.

Native captures and full PNG masters remain local and ignored. Sources, compact review images and manifests are versioned. At 390px, titles are 32px and descriptions 16px; 320px review samples verify the smaller presentation too. These are layout and brand checks, not certified native-speaker review.

## App Store scope

Upload only MAC_OS/1.1.1, app 6763877209, draft a6fe63eb-2741-48f8-a016-2529684eab01. The initial 50 Mac locales contain no screenshots. Preserve the attached build 13, metadata/keywords, release settings and previews. The iOS 1.1.1 version is already WAITING_FOR_REVIEW; that version and three published iOS versions are protected by before/after comparison.

The scoped upload uses `--apps=memories --platforms=MAC_OS --version=1.1.1 --masters-dir=docs/marketing/october-2026/memories-macos-1.1.1/exports --audit-dir=docs/marketing/october-2026/app-store-connect/memories-macos-1.1.1 --resume-verified --reuse-uploaded`. Native app locales and Apple listing locales are mapped explicitly by the plan. Target: 50 galleries × six screenshots = 300; all must reach COMPLETE and match order, dimensions and original file MD5s on a fresh remote read-back.

`memories-macos-delivery.mjs --before/--verify` records that independent audit. This task does not submit for review, release a binary, change listing copy or deploy unrelated public website edits.

## Final artwork validation

Verified 55 source languages, 330 native captures from one immutable executable/Debug-dylib fingerprint and 330 opaque RGB PNGs at 2880 × 1800. Half the panels are clean frames and half contain selected complete native components. All localized copy fits at the fixed 236/118px export sizes; the annual wide variants additionally retain the poster, ready badge and year title above the bottom crop. Reviewed the six-panel English contact sheet and representative Arabic, Malayalam, Tamil and Japanese mobile previews.

The capture patch applies cleanly to the recorded release source. Python/JavaScript syntax checks passed. The clean public-site snapshot builds with Jekyll; portfolio validation passes for 22 products × eight locales. Only internal store production files change in this task.

## Verified App Store delivery

The fresh independent read-back confirms 50 `APP_DESKTOP` galleries / 300 screenshots, all `COMPLETE`, with exact master MD5s, dimensions and ordering on Mac 1.1.1. Build 13, target listing metadata/keywords, previews and release settings remain unchanged. All four iOS versions, including iOS 1.1.1 `WAITING_FOR_REVIEW`, match the original snapshot. The Mac version remains `PREPARE_FOR_SUBMISSION`; no review submission was performed.

Delivery records are in `../app-store-connect/memories-macos-1.1.1/`: `delivery-status.json`, `delivered-galleries.json`, the frozen upload plans and before/after snapshots. The existing `whatsNew` field is empty in all 50 Mac listing locales and was preserved; description and support URL are present.
