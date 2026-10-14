# Brainfold Mac visibility correction — 1.3.0

The owner requested a Mac gallery comparable to Memories on October 13, 2026,
because the previous copy block pushed most of Brainfold's interface below the
canvas. These seven native desktop images keep the full Mac display visible.
The title uses concise localized benefits or verified native mode names; supporting
copy occupies a separate column. The schoolbook/PDF story remains second, and
selected complete interface components stay overlaid on the Mac.

## Production

- Source art: `../brainfold-1.2.1/art.html`.
- Native captures, measured Apple M5 hardware, book photograph and editable
  translations remain in the existing `brainfold-1.2.1` and import-pilot packages.
- Render with `node scripts/marketing/brainfold-store-render.mjs --formats=mac
  --output-dir=docs/marketing/october-2026/brainfold-macos-visibility-1.3.0`.
- The 364 opaque 2880 × 1800 PNGs in `exports/` cover 52 native source locales.
  They remain ignored local production masters. `validation.json` records their
  exact hashes, native capture hashes, copy and measured display visibility.
- The native display is fully visible in every composition; the laptop is at
  least 1,830px wide on the 2,880px canvas. Headlines remain approximately 32px
  and descriptions 16px when viewed at 390px wide.
- RTL descriptions remain within the text column; long localized descriptions
  use verified short native wording before wrapping an exceptional long word.
- `frozen-master-reuse.json` records exact first-pass bytes retained when a new
  browser render differed only in negligible one-level RGB text rounding. Actual
  copy-fitting changes use new masters. Freeze the final manifest before upload.
- `previews/`, `contact.jpg` and `index.html` provide the review. `browser-qa.json`
  checks the seven-image review in six representative languages at 320/1440px.

## Delivery

Use the existing editable Mac draft **1.3.0**, independently of published 1.2.1.
The upload covers 49 supported Apple listing localizations, seven screenshots
per gallery (343 placements), using the existing explicit language map. Bulgarian,
Kazakh and Lithuanian have no matching listing locale; their native exports are
retained locally. The unsupported Simplified Chinese screenshot gallery is
preserved instead of relabeling a Traditional Chinese capture.

Upload evidence and fresh ordered checksum/state verification live in
`../app-store-connect/brainfold-macos-visibility-1.3.0/`. The operation changes only
Mac screenshots, preserving listing text, keywords, build and release settings.
It does not submit a binary or App Review.

The Mac search artwork also has a larger centered native display. Its 53 source
variants and 50 localized draft bindings are verified in
`../platform-placements/audit/scoped-verification.json`. Existing approved
headers are retained. Draft creative assignment does not imply public release.
