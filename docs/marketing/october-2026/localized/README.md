# Localized campaign images

Scope: the twelve campaign products, in the languages their native repositories actually support. `languages.json` is the source inventory; regional app and store mappings are explicit. Review the published collection at https://www.magiclabsolutions.com/localized-images/.

- `copy/`: editable marketing headlines, descriptions, labels and social text; `copy-overrides.json` retains manual corrections and compact wording.
- `native/<product>/<locale>/<platform>/`: actual native captures, excluded from Git. Capture manifests record source and binary hashes. Isolated offline fixtures use fictional data; production app repositories are unchanged.
- `card-bounds/`: complete native UI components remeasured for the locale. Unverified crops are omitted.
- `exports/<locale>/<product>/`: full-size store, post, carousel and share PNGs, excluded from Git. Optimized website art is versioned under `images/campaign-localized/`, `images/products-localized/` and `images/share/`.
- `sources/`: capture-only patches, original character assets, font license and fictional-data translations needed to reproduce the collection.
- `_data/localized_image_coverage.json`: actual rendering and platform completion, independently of copy preparation. `images/localized-manifest.json` makes completed collections available to the public review gallery.

Marketing translations were drafted through the free Google Translate web interface and reviewed for brand names, leaked translation markers, readable layout and selected regional vocabulary. They are editable drafts, not certified native-speaker reviews. Native interface strings come from each app's own localization resources. Language-neutral scenes and regional variants are reused only when recorded explicitly.

TumTum's retained store PNGs are copied from its existing localized Fastlane collection. Soooon's retained eight-slide mobile and five-slide Mac story is rendered from the original compositor's configuration and native character assets, using localized native screens and editable text. These are separate from social posts and link previews. Videos remain disabled and no new audio is generated.

Render with `node scripts/marketing/prepare-localized-assets.mjs <product>`; `MAGICLAB_LOCALES` limits locales and `MAGICLAB_REBUILD=1` regenerates composed exports. Native captures must exist first. All store PNGs use RGB without alpha; `normalize-store-png.mjs` verifies lossless decoded-pixel equality when converting canvas output. `store-format-normalization.json` records source and output hashes. Google Play compositions use 1440 × 2560 RGB PNGs; native Android capture dimensions and hardware opening remain unchanged.

Build Jekyll and run `scripts/marketing/check-localized-images.py --build <destination>` for complete coverage, alongside the existing portfolio, launch and social-preview checks. Use `--partial` only for an explicitly intermediate publication. Link previews have content-hashed URLs so each page advertises the current locale-specific thumbnail.
