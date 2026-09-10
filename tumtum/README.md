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
