# My Renewals — native macOS App Store gallery (1.2.7)

Six benefit-led images: recurring overview, import review, upcoming renewals, personal/work profiles, subscription details and the plan list. Each comes from the real current Mac Catalyst production content views. Screenshots 2, 4 and 5 enlarge a complete native import row, profile breakdown and next-renewal-date card; the others remain clean. Synthetic prices, provider names and profile totals are demonstration data, not price offers or measured customer spending.

The existing approved quiet desk photograph and cyan/ink palette are reused. Original Apple MacBook Pro hardware is measured at the complete 3456 × 2234 display opening within the 4260 × 2840 PNG. Native content fits without warping, with a separate 72-original-pixel white inset below the camera notch. Side compositions intentionally crop the far-right hardware and retain the native center column. Longer localized benefits use a full-width heading and larger MacBook below it, with a deliberate bottom crop. Native interface pixels and hardware are never generated, translated or mirrored by AI.

## Reproduction and sources

- `capture/source-revision.txt`: SubscriptionManager revision 17f9ecdf20c205d614bc7e6c4b5f8ccc5f22b1b1, checked against origin/main on October 9, 2026.
- `capture/native-capture.patch`: isolated capture-only AppDelegate/SceneDelegate and offline fixtures. Production checkout source is unchanged; unrelated Finder `.DS_Store` changes are preserved.
- `capture/sdk-compatibility.patch`: the existing RevenueCat 5.37 Swift 6/Xcode 27 compatibility initializer move, confined to the task's package checkout.
- `scripts/marketing/myrenewals-macos-capture.py`: execute only the caller-specified isolated native binary, reset process locale through launch arguments and capture its own UIKit hierarchy. It does not photograph the desktop or access personal subscription data.
- Build: Xcode 27, SubscriptionManager scheme, Debug, `platform=macOS,variant=Mac Catalyst,arch=arm64`, unsigned marketing bundle identifier, `-skipMacroValidation -skipPackagePluginValidation`. Local AppStoreScreenshotGenerator reference is recorded in the patch; keep dependencies outside the production checkout.
- `capture-manifest.json`: 330 verified real native captures (2400 × 1552) in 55 supported app locales, with one immutable binary hash and per-file checksums.
- `copy.json`, `art.html`, `mac-frame.json`, `scripts/marketing/myrenewals-macos-render.mjs`: editable accepted copy, real localized interface and deterministic composition. Short captions/native headings are recorded when a language needs more space; type is not reduced.
- `type-layout/` contains text-only layout preflight evidence. Its English native image is solely a size/layout placeholder and is never exported as localized art. `validation/` is the actual per-language rendered-image evidence with native captures and exact complete-card rectangles.

Master PNGs and raw native captures stay local and ignored. Previews and reproducible sources are versioned. All store masters are 2880 × 1800 RGB PNGs without alpha. At a 390px preview, titles are 32px and descriptions 16px; at 320px they are 26px/13px. Translation reuses accepted campaign copy and current native catalog strings, with layout/brand checks. No certified native-speaker review is claimed.

## App Store delivery

Delivered and independently audited on October 9, 2026: 50 Apple listing locales × six images = **300 screenshots, all COMPLETE**, with exact source checksums, dimensions and gallery order. The existing Mac 1.2.7 draft is 8fdeed78-9fe9-4282-9f09-9ebc17ca79cd and remains PREPARE_FOR_SUBMISSION. Its four old images were backed up before replacing the gallery. Source-to-store regional mappings are in the scoped plan. Bulgarian, Kazakh and Lithuanian source images remain available even where Apple has no corresponding listing locale.

Run the shared uploader with `--apps=myrenewals --platforms=MAC_OS --version=1.2.7 --masters-dir=docs/marketing/october-2026/myrenewals-macos-1.2.7/exports --audit-dir=docs/marketing/october-2026/app-store-connect/myrenewals-macos-1.2.7`.

`myrenewals-macos-delivery.mjs --before/--verify` preserves metadata/keywords, build, previews and release settings, and checks all 14 other iOS/Mac draft/published versions against the baseline. Exact source hashes, dimensions, ordered screenshots and COMPLETE state must pass a fresh remote read-back. This task does not submit for App Review or release a binary. Newly created image localizations may need listing descriptions/support URLs and release notes before a future review; report actual missing fields in `delivery-status.json`.

The independent audit passed against all 14 protected versions, including iOS 1.2.7 and the published Mac galleries. Existing metadata/keywords, attached build, previews, version state and release settings were preserved. The upload finished with 50 verified sets, zero failures and zero unprocessed tasks. Before a future submission, 45 newly added locales still need descriptions and support URLs, and all 50 locales need release notes; these fields were not changed by this screenshot-only operation. Evidence is saved in `../app-store-connect/myrenewals-macos-1.2.7/` (`delivery-status.json`, `delivered-galleries.json`, `before.json`, `after.json`, plans and upload run).

Only internal production docs/scripts change in the website repository. Public product pages are outside this follow-up's Mac store-image/upload scope; unrelated Giftly edits are not included or deployed.

## Validation

- Package validation passed for 330 native captures and 330 opaque 2880 × 1800 masters in 55 source locales, including complete native-card bounds, frozen source hashes and text layout without overflow.
- The English contact sheet and 320px samples in English, Arabic, Tamil, Malayalam, French, Japanese and Simplified Chinese were visually reviewed.
- The capture patch passes `git apply --check` against the recorded production revision. Capture Python compilation and renderer/uploader/audit JavaScript syntax checks passed.
- A clean public-site snapshot built with Jekyll; `scripts/check-portfolio.py` passed for 22 products × eight website locales. This store-only follow-up does not deploy unrelated working-tree pages.
