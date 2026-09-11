---
layout: null
published: false
---

# TumTum parent documents

- English: `/tumtum/privacy-policy/` and `/tumtum/terms-of-use/`.
- Portuguese: `/pt-BR/tumtum/privacy-policy/` and `/pt-BR/tumtum/terms-of-use/`.
- The app's `Sources/ParentLinks.swift` chooses Portuguese for a Portuguese
  device locale and English for other device languages. It never uses the play language.
- Copy lives in `_data/tumtum_legal.json`. The isolated `tumtum-legal` layout
  deliberately has no `gtag`, analytics, forms, external fonts or scripts.
- Keep language links and canonical URLs inside Polyglot `static_href` blocks.
  Without those, the English button on a Portuguese page points back to Portuguese.
- Run `bundle exec jekyll build` and `python3 scripts/check-tumtum-legal.py _site`.

Content was adapted for the current TumTum implementation on 2026-09-09, after
checking `Household`, `HouseholdStore`, `PlaySettings`, local playroom persistence,
motion handling, bundled narration and the parent contact flow. There is no
TumTum account, app networking/analytics SDK or in-game purchase integration.
An adult's email and browser requests are separate from offline play. Changes to
data handling, support retention, the operator or monetization require a content review.

The icon is the approved TumTum paper icon (`IconPreview1`); Nunito fonts were
copied from the app, with their SIL Open Font License alongside them. Source art
direction: `../TumTum/.agents/skills/tumtum-art-direction/` (resolve from repo root).
Apple's Standard EULA and GitHub/Apple privacy statements are linked directly
instead of copying their legal clauses or inheriting another app's policy.


## Coming-soon page

- `/apps/tumtum/`, translated into the site's eight languages. Portuguese:
  `/pt-BR/apps/tumtum/`. Copy lives in `_data/tumtum_page.json`; layout and
  styles are isolated in `apps/tumtum/index.html` and `css/tumtum-coming-soon.css`.
- `_projects/2026-09-10-tumtum.md` lists the game on the Home and Games grids,
  with `coming_soon: true`, no store link and a localized status badge.
- `images/tumtum/coming-soon.webp` is a 640px web export of the app's approved
  `Sources/Assets.xcassets/AppIcon.appiconset/icon-1024.png` at app commit
  `e6e693d`. It is brand artwork, not a gameplay screenshot. `paper.webp` is
  the approved `material.cream` region from the app's `paper-atlas.json`.
  Together these two web images are about 63 KiB. No new artwork or alpha
  processing was performed. Existing Nunito files and license are reused.
- The page has no signup, analytics, autoplay, launch date, pricing or store
  download badge. Contact opens the adult's email app only when requested.
- Legal pages link back to the localized product page. Other language versions
  link to the existing English legal documents; Portuguese links stay Portuguese.
- Reviewed at desktop and phone widths. Jekyll build and the existing legal
  page checks passed; all eight product routes, listing cards, local assets,
  canonical URLs and coming-soon labels were checked on the generated output.
- To launch, update availability/copy and add the real store destination once
  confirmed. Do not silently retain the coming-soon label beside a download CTA.

## Approved App Store screenshots on the product page

- The gallery on `/apps/tumtum/#screenshots` shows the eight approved scenes:
  Home, House, Town, Dinosaurs, Cooking, Aquarium, Phonics and parent Settings.
  Every one of the eight page languages uses its own approved localized posters,
  with both iPhone and iPad views. Coming-soon status remains in place.
- Sources are `../TumTum/fastlane/screenshots/<App Store locale>/*.png`, from
  the collection approved for version 1.0. Original PNGs are left unchanged.
- `scripts/export-tumtum-screenshots.py /path/to/TumTum` exports WebP at two
  widths per device (iPhone 480/1080, iPad 640/1440), quality 86. It verifies
  the approved source manifest hashes, keeps the original proportions, and
  generates `_data/tumtum_screenshots.json` plus `screenshots-manifest.json`.
  Run with Python 3 and Pillow. Re-export only when new images are approved.
- `images/tumtum/screenshots/<site language>/` contains 256 web exports, about
  23 MiB total across all languages and sizes. `srcset` selects an appropriate
  size; lazy loading and the device selector avoid sending the entire collection
  to each visitor. Enlarged images are loaded on demand. Original App Store
  PNGs are not published with the site.
- Gallery controls/copy live in `_data/tumtum_page.json`; poster copy is copied
  from the App Store text files and also supplied as accessible HTML descriptions.
- `js/tumtum-gallery.js` uses native horizontal scrolling and a native dialog.
  No autoplay, tracking, CDN dependency or third-party gallery. Escape closes
  the dialog, arrow keys change images, and focus returns to the original link.
  The close control stays visible while scrolling. Reduced motion is respected.
  Without JavaScript, the gallery scrolls normally and each image link opens
  the larger WebP. Device selection is native radio controls plus CSS.
- Checked: Jekyll build; all eight languages, 16 images per route, source hashes,
  file paths and accessible references; existing four legal-page checks;
  desktop, 390px phone and 320px German layout; device toggle, navigation,
  enlargement, Escape and focus restoration. No horizontal page overflow.
