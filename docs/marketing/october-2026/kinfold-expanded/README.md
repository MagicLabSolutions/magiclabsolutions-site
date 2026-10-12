# Kinfold — approved multiplatform store galleries

Six product stories: family vault, document details, trip planning, packing,
family schedule and search. The owner approved the English iPhone/iPad pilot
and authorized all supported languages, macOS, visionOS and App Store uploads.

## Coverage and art direction

- 55 native languages × six stories × four platforms = 1,320 opaque PNG masters.
- iPhone: 1320×2868; iPad: 2064×2752; Mac: 2880×1800; Vision: 3840×2160.
- Apple currently offers 50 corresponding listing locale slots, including regional
  English reuse. The delivery target is 200 galleries / 1,200 screenshots.
- Native Bulgarian, Kazakh and Lithuanian have no corresponding Apple listing
  slots. Six native languages/variants without distinct listing slots contribute
  144 additional library images. Together with the galleries, all 1,320 native
  masters are represented in Apple. Canadian English reuses US English.
- Original English phone/tablet masters are retained byte for byte. Other languages
  use the shipped native UI catalog and authored marketing translations.
- Panels 2, 4 and 6 use enlarged real interface details on phone/tablet. The other
  panels remain clean. Mac uses document and packing details; Vision shows its
  actual native window without a fictitious headset frame.
- Headlines and descriptions remain separate editable layers. Long desktop copy
  uses concise benefits or a localized native feature title. RTL layouts are
  composed directly; neither interface text nor Apple hardware is mirrored.

## Native capture provenance

Production source: `FamilyKit`, commit
`57a9c8b1b7dabae56ba71cb873160c863d4b8d64`. Production files were not edited.
All capture-only changes live in isolated copies under
`/private/tmp/kinfold-store-20261011/`. The executable uses a separate marketing
bundle ID, in-memory fictional family data and specimen documents.

`capture/provenance.json` verifies all 220 locale/platform capture records,
their native image hashes and their executable hashes. Platform fixture patches
are saved beside it. Mac's AppKit entry point renders production content views
at 1440×900 points; the navigation sidebar is omitted from the composition.
Vision packing has a separate capture-only outer scroll hook so the actual
packing list is visible. Its per-image executable override is recorded for all
55 languages. English phone/tablet native source comes from the approved pilot.

Capture and full-resolution exports stay local and are ignored by Git. The
reproducible patches, editable copy, render source, frame metadata, render records
and 390/320px previews are versioned. Frame bitmaps reuse the approved Apple
device assets already recorded by the pilot and `mac-frame.json`.

## Reproduction and review

Apply the appropriate `capture/fixture-*.patch` to an isolated copy of the source
commit; use the debug marketing bundle and the task-owned simulator/device IDs
in the provenance file. Build before running `kinfold-expanded-capture.py`.
The renderer's Mac binary guard pins the build inspected for this campaign. For
a rebuild, inspect its English native captures first, then update that guard to
the rebuilt debug-library SHA recorded in the capture provenance.
Apply the Vision packing patch after its fixture patch and run
`kinfold-vision-packing.py` for the dedicated packing captures. Never apply these
fixtures to a production app or customer data store.

`scripts/marketing/kinfold-expanded-render.mjs` renders from `copy.json`, actual
native pixels, the approved background and documented frame openings. It rejects
text overflow, excessive phone/tablet copy height and invalid highlighted-card
bounds. Targeted corrections use `--panels=5 --force` and keep the other records
and image files intact. Desktop English schedule copy uses the complete short
benefit “One family schedule.” `store-creative-review.mjs` checks every master hash, generates contact
sheets and builds the local review catalogue. `index.html` supports all 55
languages and four platforms. The website's Jekyll configuration excludes this
private campaign package from the public site.

## Delivery

Use `kinfold-expanded-sync.mjs` with explicit `--apps=kinfold`, `--version=1.2`,
`--masters-dir=docs/marketing/october-2026/kinfold-expanded/exports` and selected
`--platforms=IOS,MAC_OS,VISION_OS`. `--apply --reuse-uploaded --resume-verified`
resumes durable per-gallery checkpoints. Unknown write failures require a fresh
resource read; 429 responses are explicitly rejected and may be retried.

The tool backs up replaced screenshots, uploads opaque PNGs, verifies Apple's
processing, sets their six-image order and reads the final IDs/checksums back.
All other apps, app previews, build selection and review submission are outside
its mutation scope. `store-creative-audit.mjs` performs a fresh read-only final
audit and rejects incomplete delivery before contacting Apple. Final evidence
is saved outside ignored `work/` folders. Uploading to a draft is not a release.

`kinfold-library-sync.mjs` independently uploads the six unmapped native
language/region variants as `APP_SCREENSHOTS_AND_PREVIEWS`, without creating
unsupported listing locales or submitting them for review. Hash-based filenames
and reference names make these reservations resumable. Apple processing is
polled at a moderate interval, and retries honor its `Retry-After` header.
