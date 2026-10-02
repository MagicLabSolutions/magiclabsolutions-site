# October 2026 English creative review

The Giftly pilot was approved on October 1, 2026. Its large native devices, readable benefit copy, product-specific environments and selected complete interface cutouts now guide the studio rollout. The owner requested a varied set rather than emphasis on every image, flexible counts, publication after website updates, and revisions before multilingual artwork.

Open `index.html` through the source HTTP server on localhost:8766. The review links to strategy, calendars, exports and local per-product ZIPs. `studio-rollout.json` records current counts and publication evidence; individual `*-studio-validation.json` and `*-web-validation.json` files record checks.

## Owner revision pass — October 1, 2026

Product-page changes and multilingual creative are paused for the next owner request.
This pass uses `scripts/marketing/package-review.py`, which updates only private
review assets, editable English strings and review ZIPs. It never mutates public
product data, galleries or Open Graph metadata.

- Keep TumTum and Soooon's current store collections; prior alternate drafts are
  excluded from the proposed review ZIPs and store-gallery views.
- Keep Sundust's current store video. Its revised English still set now has six
  iPhone and six native iPad panels, including real orbital flight, surfaces,
  unexpected visitors and Vey contact. The backdrop is cleaner original space art.
- Measure subsequent phone frame placement from actual copy, with a compact gap.
  Brainfold, Memories, My Renewals and zuzu use this placement. Preserve lifestyle
  hero breathing room and exact native screen/hardware proportions.
- Memories uses eight fictional original family, pet and travel photographs in
  the real native demo. Source prompts, hashes and cache mappings are saved.
- zuzu's second panel focuses on sleep/wake timing. Native sleep cards are enlarged;
  moon, pacifier, blocks and knitted socks vary the corner art across its six panels.
- Toc Toc includes practical meeting/calendar support for ADHD workdays. This is
  audience positioning, not a treatment or clinical-effectiveness claim. Context:
  https://www.nimh.nih.gov/health/publications/adhd-what-you-need-to-know
  Its keywords use regional terminology in both native listings: TDAH in Brazil,
  PHDA in Portugal, ADHD in English, ADHS in German and native terms elsewhere.
  `toctoc-keywords.json` records the 30 source locales, five reused store locales,
  terminology sources and the conservative 100 UTF-8 byte checks. The Toc Toc
  review ZIP includes 70 platform/locale keyword files. Metadata localization is
  explicitly requested; multilingual artwork and public page changes remain paused.
- All 48 static posts and 48 carousel slides use a dedicated social layout with
  large native devices and occasional whole cards over the frame; no side column.
  Sundust social posts use the real iPad captures to keep flight, terrain and the
  rocket visible in the shorter social canvas.
- Twelve English link previews at 1200×630 are prepared in the private exports.
  `share-preview-proposal.json` records them. They are **not published** while the
  website stage is paused; existing public link cards remain unchanged.

Open `index.html` through the source preview server on port 8766. Review widths:
1440, 390 and 320 pixels. The studio's versioned skill includes these refinements.


## Current English artwork

| Product | Primary | Native iPad | Native Android |
| --- | ---: | ---: | ---: |
| Giftly | 4 iPhone | 4 | — |
| Brainfold | 6 iPhone | 4 | — |
| zuzu | 6 iPhone | 6 | 6 |
| Sundust | 5 iPhone | 4 | — |
| Memories | 4 iPhone | 4 | — |
| Hooray | 4 browser | — | — |
| Soooon | 6 iPhone | 6 | — |
| My Renewals | 6 iPhone | 6 | — |
| Ground Control | 3 Mac | — | — |
| Poof | 4 Mac | — | — |
| TocToc | 3 Mac | — | — |
| TumTum | 6 portrait iPhone editorial | Original approved gallery retained | — |

There are 97 current editorial/store images across these variants. TumTum's six new portrait editorial pieces are independent of its original approved store art. Native Mac and browser views retain their proportions. Apple hardware uses original PNG bezels measured against the actual screen opening; only zuzu has an Android store variant, with separate native Android captures. Native source records, capture-only harness patches and hashes live under `sources/<product>/`.

The product websites use the corresponding English highlights, readable components, native capture controls and image dialogs. Existing translated copy, product-specific support and legal material remain. Public website updates have been deployed under the owner's explicit authorization; this does not constitute store-image approval or App Store submission.

## Campaign preparation and paused work

- The initial English campaign includes 48 static social drafts and 48 carousel drafts, plus 96 proposed product-channel slots and a separate 12-post studio rotation. These are planning and draft assets; no social posts have been scheduled or published.
- The 24 existing video drafts and caption sources are retained for a later creative pass. The owner paused videos because they need improvement. All product-page video sections remain disabled by `product_videos_enabled: false`; do not restore them during screenshot work.
- Voice scripts, editable SRT/VTT, voice direction and audio insertion plans are retained. ElevenLabs production waits for credits and the owner's continuation; no new paid audio calls were made in this screenshot rollout.
- English metadata drafts are in `metadata/en-US/`, isolated from production Fastlane directories. Keyword strategy is a hypothesis based on actual features, not measured search volume.
- `locales/` keeps editable English reference strings and translation scaffolds. The owner authorized all supported app languages on October 2, 2026. Localized artwork is tracked separately in `localized/languages.json`, with native capture hashes, editable text and per-language completion records.

## Reproduction

Use Python with Pillow, Node with Playwright and installed Chrome. Point `MAGICLAB_NODE_MODULES` to the bundled Node dependency directory, and serve the repository source on port 8766. Original Apple hardware stays in the ignored `.frames-cache`; its sources and measured geometry are in `device-framing.json` and product configurations.

For one current studio product:

1. Inspect `campaign.json`, its native source provenance and the corresponding studio skill before editing. Do not rerun the original collection/brief scripts over accepted creative.
2. Run `MAGICLAB_FORMATS=store,ipad-store,play-store,editorial node scripts/marketing/render.mjs <slug>`. `studio-art.html` composes the current direction; Giftly retains its approved pilot template.
3. Run `node scripts/marketing/validate-studio-art.mjs <slug>` and inspect the complete exports and contact sheets. Source UI components must be complete, with correct native aspect, safe camera clearance and readable copy at 390px and 320px.
4. For newly captured Apple screens, run `node scripts/marketing/capture-frames.mjs <slug>`. Package accepted studio pieces with `python3 scripts/marketing/studio-package.py <slug>`. Giftly's approved pilot has its own packaging path. ZIPs are generated locally and omitted from Git.
5. Build Jekyll into an isolated destination and run `validate-studio-web.mjs <slug>` against its preview. Check the portfolio, TumTum legal pages and social previews with the existing repository validators. Native capture controls, keyboard zoom, Escape, focus return and narrow mobile widths are covered.

The original social/video composition scripts remain available for that later creative pass. `finish-audio.py` without recording flags prepares an audio plan without an API call. Never interpret an existing script as permission to publish social posts, submit store images, purchase advertising or spend paid API credits.

## Provenance and limitations

New native screenshots use actual product views with synthetic fixtures. Capture-only application and SDK adjustments were confined to isolated checkouts/DerivedData and archived with the capture recipe; production authentication, billing, filesystem operations and app repositories were not changed. Existing TumTum and Soooon paper/character assets are reused from their canonical sources. Generated background and photographic prop provenance remains under `lifestyle/`, `assets/` and the campaign provenance files. Illustrative people are not testimonials, and editorial props are not additional app features.

All new artwork remains in the English revision stage. No store upload, social posting, advertising purchase or multilingual image rollout was performed.
