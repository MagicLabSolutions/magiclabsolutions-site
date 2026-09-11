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

## Parent-facing product explanations

The product page also includes play examples, Montessori inspiration, language
exploration and the parent controls. Each of the eight locales has its own file
in `_data/tumtum_details/`; use the same keys and array order as `en.json` when
adding another language. All headings, body copy, navigation and disclosures
are live HTML text. The Montessori explanation uses native `details`/`summary`
so it works with a keyboard and without JavaScript. Keep coming-soon status.

Product facts were checked against TumTum on 2026-09-11:

- `Household` and `HouseholdModel`: profiles and per-child toy selection, initial
  age recommendations that parents can override, and an age-change review prompt.
- `HomeToyRotation`: at most 15 distinct selected toys, rotating on app launch
  when the selection is larger. The full toy catalog remains accessible.
- `PlayLanguage` and `PlayroomIntroduction`: eight household play languages;
  Home/game text and narration follow this choice. Setup, settings and the toy
  catalog use the device language. Do not claim a separate language per child,
  automatic bilingual lessons, a language course or guaranteed learning outcomes.
- `PlaySettings`, `ParentSessionSection` and `PlaySession`: optional session
  limits (off by default), hours/minutes chosen by an adult, active play counted
  separately per child, and a rest screen until an adult holds to restart.
  Background, device lock and parent controls pause counting. This is not an
  OS-wide screen-time restriction. The Home moon opens these controls directly.
- `PlaySettings` and `GrownUpsPlaySections`: separate narration/effect volumes,
  quieter default effects, Home shake/tilt switches and Flashlight difficulty.
- `PlayroomIntroduction` and `ParentExternalLink`: hold menus reduce accidental
  navigation; external links/email require a separate adult check. Do not
  describe holding alone as a secure parental gate.

Montessori copy is an original summary, informed by Association Montessori
Internationale's [Montessori environments](https://montessori-ami.org/node/2169)
and [home guidance](https://digital.montessori-ami.org/index.php/general-guidelines).
Describe TumTum as inspired by principles, never certified, endorsed, equivalent
to a Montessori classroom, or a replacement for real materials and relationships.
The page links to AMI as further reading, not as an endorsement. Shared-play
prompts and everyday language ideas are suggestions, not learning guarantees.

When reviewing updates, build all eight routes and check headings, local anchor
links, the disclosure, gallery, small screens and enlarged text. No new images,
fonts, scripts, tracking or external embeds are needed for these sections.

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
