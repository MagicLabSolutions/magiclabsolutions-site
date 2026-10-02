# Native product-page refresh — October 1, 2026

The owner requested product-page experiences inspired by https://musicaistudio.app/:
large benefit-first openings, slightly tilted native devices, relevant original moving
assets, complete interface details outside selected frames, direct store/platform links,
meaningful small browser demonstrations, scroll reveals and a combined device stage.

Scope: the 12 campaign products — Giftly, Brainfold, Zuzu, Sundust, Memories,
My Renewals, Toc Toc, Ground Control, Poof, Soooon, Hooray and TumTum. The other
10 public catalog entries retain their existing layouts.

`_plugins/product_launch.rb` selects the new shared layout without modifying legacy
product-page sources. The shared design uses original native captures and measured
Apple/Android hardware, not store backdrops or headlines baked into screenshots.
Component cutouts use real, complete interface rectangles. There are 58 feature stages.
Platform captures appear together and can be enlarged; unsupported or missing native
platform captures are not fabricated. Existing platform availability remains in the catalog.

Each local demo is identified as a browser illustration with fictional data. It does
not access accounts, files or calendars. No autoplay audio. Existing useful plans,
privacy, support, and TumTum methodology/language/parent content are preserved.
English feature artwork/captures are clearly labeled. Existing locale hero copy and
new navigation/FAQ labels support the site's eight locales. Demo controls support
English and Portuguese; other locales honestly use an English-labelled illustration.

Videos remain disabled. TumTum and Soooon store exports, Sundust's store video,
and paused multilingual store production remain independent and unchanged.
Concurrent uncommitted Giftly localization work was preserved and excluded from
this publication.

## Reproduction and checks

- `scripts/marketing/prepare-product-launch.mjs`: native asset optimization and
  traceable originals; set `MAGICLAB_NODE_MODULES` to a Sharp-enabled Node runtime.
- `docs/portfolio/product-launch-assets.json`: source hashes and output paths.
- `scripts/marketing/prepare-product-share-cards.mjs`: clean 1200 × 630 HTML share
  compositions, captured with the Codex browser; versioned JPEG URLs prevent stale
  image-cache collisions. The first pass uses English previews on all locale links.
- `scripts/check-product-launch.py`: 96 new pages, original captures, measured
  frame aspect ratios, internal anchors/routes, release promises and video policy.
- Existing portfolio check: all 22 products × 8 locales.
- Existing TumTum legal and 184 localized social-metadata checks.
- `docs/portfolio/product-launch-browser-qa.json`: browser evidence for all 96
  pages at 320px, all 12 product interactions, keyboard enlargement/Escape/focus
  return, motion pause and locale/canonical checks. Desktop openings and combined
  platform stages were visually inspected. Reduced-motion CSS/media handling was
  reviewed; the operating-system preference was not changed.

The owner has explicitly authorized publishing site updates. Validate the committed
snapshot separately from concurrent dirty work, then use the normal main-branch
GitHub Pages deployment. Store submission is not part of this change.
