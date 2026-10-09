# Memories 1.1.1 — two additional features

Append screenshot 5 (the whole year in a film on the project anniversary) and screenshot 6 (separate child/year/together projects) to the four previously approved images. The existing translated screenshot catalog and `copy-overrides.json` supply editable headline and supporting copy in 55 supported app locales; Apple locale mappings are recorded in the delivery plan. Multiple-project artwork carries a Plus label, consistent with the current one-project free limit.

Current production SwiftUI `CompilationRevealView` and `ProjectSwitcherSheet` are captured on explicit task-owned iPhone/iPad simulators. An isolated offline fixture adds a completed yearly compilation with 144 unique album memories and a fictional first-birthday poster. The production checkout stays unchanged. iPad project captures use the real system accessibility text size for legibility, recorded in the capture script. The poster photo is demonstration media, not an invented interface. The existing screen geometry, text, buttons and animations come from the app.

`native-capture.patch` applies to Memories source revision 76729fc56bcdd3cb9236479b228163940874eff4. Build with Xcode 27, `-skipMacroValidation -skipPackagePluginValidation`, `ARCHS=arm64`, and the isolated RevenueCat compatibility patch already recorded at `../sources/memories/capture-sdk-compatibility.patch`.

Reproduce with `scripts/marketing/memories-anniversary-capture.py`, then `scripts/marketing/memories-store-render.mjs`. PNG masters and raw captures remain local and ignored; editable copy, prompts, geometry checks, checksums and compact review previews are versioned. Original Apple iPhone/iPad hardware is reused from the private frame cache.

App Store upload is scoped to Memories/iOS/1.1.1 and these six-image galleries. Preserve the four existing image IDs and checksums, all metadata/keywords, previews, build, release settings and published versions. `scripts/marketing/memories-store-delivery.mjs --before/--verify` records a fresh baseline/read-back. Screenshot delivery does not submit for review or publish a binary.

## Verified production coverage

55 source app locales, 220 real native captures and 660 validated RGB PNG masters. Apple maps these to 50 listing locales (100 iPhone/iPad galleries). The upload adds 200 screenshots while preserving the 400 previous images. `coverage.json` keeps regional reuse explicit; `package-manifest.json` freezes every master and the compositor/copy/photo/frame hashes.

Readability checked at 390px (headlines 42px, descriptions 19.5px) and 320px (headlines 34.5px, descriptions 16px). Supported-script and RTL samples reviewed visually; these checks do not claim certified native-speaker review. Only internal production scripts/docs changed in the website repository. A clean Jekyll build and 22-products × 8-locales portfolio check passed; public product pages were not changed in this task.

The two task-owned simulator instances were removed after capture verification. Recreate them and update `capture-devices.json` to recapture. Retained native images and masters stay in the local directories listed in the manifests.

## Completed App Store delivery — October 9, 2026

Fresh App Store Connect read-back confirmed all 100 galleries (50 listing locales, iPhone and iPad) with six COMPLETE screenshots each: 600 total, including 200 appended images. The original 400 screenshot IDs, file checksums and first-four positions are preserved. Builds, metadata/keywords, previews, release settings and all three published versions are unchanged. Version 1.1.1 remains PREPARE_FOR_SUBMISSION; no App Review submission or binary release was performed.

Delivery evidence is retained in `../app-store-connect/memories-1.1.1/delivery-status.json`, `delivered-galleries.json`, and the before/after snapshots. Masters stay frozen at the package-manifest hashes.

## Existing listing metadata (outside this image-only task)

The initial 1.1.1 draft already lacks descriptions/support URLs in 12 listing locales (sl-SI, pa-IN, ur-PK, mr-IN, te-IN, gu-IN, kn-IN, ta-IN, ml-IN, en-CA, bn-BD, or-IN), and release notes in all 50 locales. Preserve those fields during screenshot delivery; fill them before a later App Review submission. Keywords remain unchanged.

Reusable product decisions were recorded in the project Skills repository, `magiclab-store-art-direction/references/product-decisions.md` (commit c43227b).
