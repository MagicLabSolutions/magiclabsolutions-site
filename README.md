# MagicLabSolutionsSite

## Localization

The site uses [jekyll-polyglot](https://github.com/untra/polyglot) to generate localized versions of all pages.

### Currently supported languages

| Code | Language |
|------|----------|
| `en` | English (default) |
| `de` | Deutsch |
| `es` | Español |
| `fr` | Français |
| `pt-BR` | Português (Brasil) |
| `ja` | 日本語 |
| `ko` | 한국어 |
| `zh-Hans` | 简体中文 |

### URL structure

- Default (English): `magiclabsolutions.com/about/`
- Localized: `magiclabsolutions.com/de/about/`, `magiclabsolutions.com/ja/about/`, etc.

### How to add a new language

1. **Add the language code** to the `languages` array in `_config.yml`
2. **Add the native name** to `_data/language_names.yml` (e.g., `it: "Italiano"`)
3. **Create the translation file** at `_data/translations/{code}.yml` — copy `en.yml` as a starting point
4. **Run the seed script** (optional) to auto-translate via Google Translate:
   ```bash
   # Add the new language code to the LANGUAGES list in scripts/seed_translations.py
   # Then run:
   python3 scripts/seed_translations.py
   ```
5. **Review the translations** in `_data/translations/{code}.yml` and adjust as needed
6. **Rebuild the site**: `bundle exec jekyll build`

### Translation file structure

All UI strings live in `_data/translations/{lang}.yml`. Keys:

- `nav.*` — Navigation menu items
- `footer.*` — Footer headings and links
- `contact_form.*` — Contact form labels and placeholders
- `legal.*` — Legal page labels
- `app_card.*` — App card CTA text
- `home.*` — Homepage content (hero, featured apps, philosophy)
- `apps_page.*` — Apps index page
- `error_404.*` — 404 page
- `thanks.*` — Thank you page
- `about.*` — About page (including `content` key for full markdown)
- `contact_page.*` — Contact page

### What is NOT localized

- **Standalone landing pages** (`apps/zuzu/index.html`, etc.) — these have their own `locale.js` for client-side screenshot swapping
- **Legal pages** (Privacy Policy, Terms of Use) — kept in English for legal accuracy
- **Static assets** (images, CSS, JS)

### Fastlane metadata

The seed script can pull app descriptions from fastlane metadata at:
- iOS: `~/Development/MagicLabSolutions/Zuzu/fastlane/metadata/`
- Android: `~/Development/MagicLabSolutions/ZuzuAndroid/fastlane/metadata/android/`

Map polyglot codes to fastlane codes in the `FASTLANE_LOCALE_MAP` dict in `scripts/seed_translations.py`.
