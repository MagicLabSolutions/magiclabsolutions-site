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
