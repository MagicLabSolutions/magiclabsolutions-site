# Giftly native macOS collection — version 1.2.1

Four distinct native Mac views: Today, Upcoming, People and Calendar. The set uses
the approved Giftly celebration background and original gift cutout, large copy,
wide native app windows, intentional bottom cropping and two complete native
interface-card overlays. It does not reuse phone or tablet captures.

The Mac-specific benefit copy is editable in `marketing-copy.tsv`; `fixtures.json`
contains localized clothing-size values. There are 34 source languages and 39
App Store listing locales, with regional English/French/Spanish reuse mapped in
the upload plan. Translations are model-written with brand and layout review,
not certified native-speaker review. Native app translations come from its
shipping string catalogs.

Source: Giftly `498473153fb492cbca2c6face9bad0853a4c079e` (1.2.1, build 12).
The capture-only entry point `CaptureMain.swift` replaces the main entry point in
a temporary source archive. It runs actual `MacRootView` with an in-memory
SwiftData container and synthetic sample people. It clears English freeform
notes, localizes clothing sizes and selects Emma's native detail pane. It never
starts production sync, billing, notifications or a personal app database.
The temporary bundle identity is separate. Native content is rendered offscreen
through AppKit/NSHostingView at 1280 × 800 points, 2× (2560 × 1600 pixels).

`art.html` composes the native captures as landscape Mac app windows with window
chrome, without iPhone hardware. Card bounds are measured from each language's
native paper surfaces independently, including RTL. Marketing copy is measured
before positioning the window. UI pixels are never stretched or translated by
image editing. Store masters are opaque RGB PNGs at 2880 × 1800.

## Reproduce locally

From the website repository, with Xcode, XcodeGen and the bundled Node runtime:

```sh
python3 scripts/marketing/giftly-macos-build.py --work /private/tmp/giftly-macos-new-capture
python3 scripts/marketing/giftly-macos-capture.py --binary /private/tmp/giftly-macos-new-capture/dd/Build/Products/Debug/Giftly.app/Contents/MacOS/Giftly
python3 -m http.server 8766 --bind 127.0.0.1
# In another terminal:
node scripts/marketing/giftly-macos-render.mjs
node scripts/marketing/giftly-macos-qa.mjs
```

`--locales` restricts capture; positional locale arguments restrict rendering.
Do not run render batches concurrently: their manifests merge sequentially.
Raw captures and full-size PNG exports stay local in ignored folders; editable
inputs, hashes, validation evidence and optimized review sheets are versioned.

## Store delivery

Use the existing credential environment outside the repository. The upload
command must select `--apps=giftly --platforms=MAC_OS --version=1.2.1` and isolated
`--audit-dir=docs/marketing/october-2026/app-store-connect/giftly-macos-1.2.1`.
Run `--plan` before `--apply`. Never send the Mac masters to an iOS gallery.
`giftly-macos-delivery.mjs --before` saves the pre-upload baseline;
`--keywords` applies the already planned keywords in four English listing regions;
`--complete-new-locale` fills missing description, support/marketing links and
release notes in the newly created en-CA locale from the existing en-US Mac
version's text, without rewriting any pre-existing localized copy;
`--verify` reads every gallery back and compares count, order and source MD5s.
It also checks the published Mac version, iOS version, attached build, release
setting, previews and other metadata against the baseline.

This operation updates the editable Mac draft only. App Review submission and
release remain separate actions. Website source and other ongoing Giftly page
work are outside this delivery.
