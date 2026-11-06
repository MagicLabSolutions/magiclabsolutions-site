# Sundust on Google Play, free to download — November 6, 2026

Sundust shipped two changes the website did not reflect: it is now on Google Play as well
as the App Store, and it is free to download with a single in-app unlock instead of a paid
download. Only the Sundust entry and the pages that quote its availability were touched;
every other product keeps its current content, assets and status.

## Release evidence (checked 2026-11-06)

| Store | Source | Result |
| --- | --- | --- |
| App Store | `itunes.apple.com/lookup?id=6791888066&country=us` | `Sundust: Cozy Space Program`, version 1.3.0, `Free`, current version released 2026-10-28 |
| App Store (BR) | `…&country=br` | `Sundust: Voo Aconchegante`, 1.3.0, `Grátis` |
| Google Play | `play.google.com/store/apps/details?id=com.magiclabsolutions.sundust` | HTTP 200, `Sundust: Cozy Space Program`, Install, "In-app purchases" |

The free boundary is server-controlled, not baked into the build: Horse Revenue remote
config has `free_through = "luna"` with `paywall_enabled = true`. The site therefore says
the Moon round trip is free and one in-app purchase opens the rest, and names no price —
the unlock is priced per storefront.

## Catalog

`_data/portfolio.json` — Sundust now carries `play_url`, `platform`
"iPhone · iPad · Mac · Apple TV · Android", `version` 1.3.0, `release_platforms` at 1.3.0
for IOS/MAC_OS/TV_OS, `checked_at` 2026-11-06, and an `availability_note` in all eight
site languages. `release_platforms` stays Apple-only because
`scripts/marketing/refresh-product-platforms.mjs` generates it from App Store Connect
evidence; Android availability lives in `platform` and `play_url`, as it does for Zuzu.

The catalog `name` stays "Sundust". Every one of the 23 products uses its short brand
name rather than its full store name; the store name "Sundust: Cozy Space Program" was
added to `keywords` instead, with "cozy space game", "Android space game" and
"orbital mechanics game".

Six localized product descriptions enumerated the platforms and were missing Android
(de, es, fr, ja, ko, zh-Hans). The English and Portuguese descriptions do not list
platforms and were left alone.

## Pages that quote availability

- `_data/product_launch.json` and `_data/product_launch_localized.json` — "Android" added
  to `platforms` for the base entry and all 55 app languages, so the Platforms section and
  the hero/FAQ/closer lines name it everywhere. `_data/product_platform_media.json` is
  derived from that file and was updated to match its 55 Sundust records.
- `_data/translations/*.yml` — the two Sundust descriptions in each of the eight site
  languages (`projects.project-sundust.description` and `sundust_desc`) now name Android.
- `_projects/2025-08-01-sundust.md` — live at `/project/sundust/` and linked from the
  footer. It claimed **"No ads, no in-app purchases, no internet required."**, which the
  App Store and Play listings now contradict. It now reads free to download, Moon round
  trip free, one in-app purchase for the rest, no ads, no subscription, no internet
  required — and carries `play_store_url`, matching Zuzu's front matter.
- `index.html` — the home stage tag for Sundust reads
  "iPhone, iPad, Mac, Apple TV + Android".
- `apps/sundust/index.html` — this page's body is **not rendered**: `_plugins/product_launch.rb`
  reassigns it to the `product-launch` layout, which has no `{{ content }}`. It carried the
  same false no-in-app-purchases claim in three places. The claims were corrected and the
  file given an Android badge and Google Play buttons so it stays truthful and coherent if
  anyone revives it. Confirmed against the live page before and after: the published
  `/apps/sundust/` has never contained that markup.

`sundust-privacy-policy.html` already described the unlock and Google Play payment and
needed no change. The archived store-evidence snapshots under `docs/` are historical
records of the October submission and were deliberately left as they are.

## Verification

- `bundle exec jekyll build` exits 0; 1,088 pages; no Liquid errors (only the repository's
  pre-existing Sass `lighten()` deprecations and post excerpt notices).
- All 55 `/…/apps/sundust/` routes carry an Android platform label and the Play link.
- The home, `/project/sundust/` and `/apps/sundust/` routes in all eight site languages:
  Android present, no "no in-app purchases" claim, Play link on both product routes.
- Looked at the rendered pages, not just the templates: hero with both store buttons and
  the availability note, the Platforms chips (iPhone · iPad · Mac · Apple TV · Android),
  the FAQ "Where can I use it?" answer, and `/project/sundust/` beside `/project/zuzu/` —
  the two dual-store pages present identically.
- 375 px mobile: `scrollWidth` equals `clientWidth`, no horizontal overflow; buttons stack
  and the eyebrow wraps cleanly.
- CaseCraft and Starwake still read "iPhone · iPad · Mac · Apple TV"; no other product
  changed.

## Not done

- The de/es/fr/ja/ko/zh-Hans `features` arrays in the Sundust catalog copy are still the
  English strings. That predates this change and is left for a localization pass.
- Product videos stay disabled per the October 1 pause.
