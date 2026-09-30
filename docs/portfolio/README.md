# Portfolio refresh — 2026-09-30

## Delivery

- 17 requested repositories are present and fetched under the studio directory. Existing dirty work and feature branches were preserved; only safe fast-forwards were applied.
- 22 product pages, including 11 new landing pages and shared interactive sections on 11 existing pages. Zuzu combines its Apple and Android repositories.
- A shared searchable catalog on the home, apps and games entry points.
- Real app/store/public-web captures, current primary app icons, and labeled in-game artwork. Two new website icons: Hortulus and Moonfold.
- TumTum launch confirmed on 2026-09-30. MyRenewals corrected from the obsolete store ID 6670665785 to 6752888662 (version 1.2.6).
- Product-specific search phrases, descriptive content, structured data, canonical routes and locale alternates. New landing-page and demo copy is Portuguese and English; other locale routes explicitly mark English fallback. Existing translated landing pages remain.
- Reusable skill lives in ../Skills/magiclab-site-update and is linked into ~/.codex/skills/magiclab-site-update.

## Flow refinement — 2026-09-30

The home now follows the visual rhythm of the owner’s Stem Split reference: oversized type,
open screenshot compositions, curved light trails, a native-scroll sequence with a sticky image,
and a two-column editorial catalog. The mobile layout places each image with its corresponding
text; reduced motion removes animated transforms and fades. Existing approved icon files are
unchanged. Why Me? is the sole icon substitution: the studio favicon was replaced by the native
repository’s current Tampinha placeholder.

Verification for this refinement: desktop scene switching, 390px visual review, all eight home
locales at 320px, search, game filter, hero keyboard tabs, Toc Toc start/join, and Why Me? draw/reset
with pointer and keyboard. Both changed JavaScript files pass syntax checks. The build and all
176 product-route checks pass. Reduced-motion behavior was reviewed in source; no OS preference
was changed for testing. Why Me? remains in development and has no fabricated app captures.

## Availability and imagery

| Product | Status | Real captures | Game illustrations |
|---|---|---:|---:|
| Toc Toc | beta | 2 | 0 |
| Soooon | development | 0 | 0 |
| GroundControl | beta | 3 | 0 |
| Poof | unverified | 1 | 0 |
| Hooray | released | 2 | 0 |
| Memories | released | 3 | 0 |
| CaseCraft | development | 0 | 2 |
| Dona Neusa | released | 1 | 0 |
| Pauta | beta | 3 | 0 |
| Brainfold | released | 2 | 0 |
| Starwake | development | 0 | 2 |
| Murmur | development | 3 | 0 |
| Zuzu | released | 3 | 0 |
| Hortulus | development | 0 | 0 |
| Moonfold | development | 3 | 0 |
| Why Me? | development | 0 | 0 |
| TumTum | released | 2 | 0 |
| Giftly | released | 3 | 0 |
| Sundust | released | 1 | 0 |
| Kinfold | released | 2 | 0 |
| MyRenewals | released | 2 | 0 |
| QRamen | released | 1 | 0 |

## Remaining evidence

- Memories icon correction (2026-09-30): the public App Store 1.1.0 icon (teal lens with a heart) supersedes the orange film icon still in the source repository. The catalog now uses the store asset with a content-versioned filename; source and hash are in asset-provenance.json.

- Poof: its existing store ID 6816976275 returns no public BR/US listing and the public URL returned 404. The page offers a preview without a download promise. This does not prove that it has never launched in another channel.
- Why Me?: rechecked after the repository was populated. README, product brief, design tokens and implementation checklist establish a bar-table / who-pays game for iPhone and iPad, still in development. The site now uses the native Tampinha placeholder icon, descriptive copy and a labeled browser-only draw. No native app screenshots exist in the repository yet. Active app changes were preserved.
- Soooon and Hortulus: no screenshots were present. Native app capture was blocked because the Mac session was locked.
- CaseCraft and Starwake: current game illustrations are displayed and labeled; gameplay captures remain to be added.
- Native-app icon asset catalogs were preserved. Newly generated icons are website assets, with masters ready for future app integration.

## Verification

- Jekyll build passed; existing Sass deprecation warnings remain.
- Static validator passed 22 products across 8 locale routes (176 pages), local image/script/style assets, one demo per page, duplicate IDs, valid JSON-LD and home catalog coverage.
- Browser: one interaction on each of the 22 pages at 390px, with an additional 320px layout sweep, no broken loaded images or horizontal page overflow; see browser-validation.json.
- Home search and available-products filter passed. Screenshot lightbox opened and closed with Escape.
- Motion respects prefers-reduced-motion. Decorative movement is bounded; no autoplay audio.
- Existing TumTum legal validator passed all four pages. Skill validator passed.

## Search strategy

Search phrases belong in meaningful copy, titles and descriptions. Google does not use the meta keywords tag for ranking. No ratings, prices or release dates were invented for structured data.

| Product | Search topics |
|---|---|
| Toc Toc | alerta de reunião Mac, lembrete de reunião iPhone, meeting reminders |
| Soooon | contagem regressiva, countdown app, aniversários e viagens |
| GroundControl | cliente Git Mac, Git dashboard, gerenciador repositórios |
| Poof | limpeza de Mac, Mac cleaner, liberar espaço macOS |
| Hooray | cartão coletivo online, group greeting cards, cartão aniversário |
| Memories | vídeo mesversário, baby milestone video, fotos bebê |
| CaseCraft | jogo detetive, detective puzzle, jogo lógica investigação |
| Dona Neusa | abrigo de animais, plataforma adoção, gestão abrigo |
| Pauta | gerenciador de tarefas, organizador de projetos, task planner |
| Brainfold | flashcards com IA, repetição espaçada, AI flashcards |
| Starwake | exploração espacial, procedural galaxy game, jogo planetas |
| Murmur | histórias interativas, interactive chat stories, ficção escolhas |
| Zuzu | rotina do bebê, baby tracker, sono alimentação fraldas |
| Hortulus | cuidados com plantas, plant care app, herbário digital |
| Moonfold | histórias para dormir, bedtime stories app, rotina noturna infantil |
| Why Me? | jogos de boteco, quem paga a conta, party games iPhone, who pays the bill app |
| TumTum | brinquedos digitais infantis, jogo Montessori, toddler playroom |
| Giftly | organizador presentes, gift planner, lista de presentes |
| Sundust | jogo exploração espacial, space exploration game, Sundust |
| Kinfold | documentos da família, family document vault, travel organiser |
| MyRenewals | controle assinaturas, subscription tracker, pagamentos recorrentes |
| QRamen | gerador QR code, QR code scanner, leitor QR |

Reference: https://developers.google.com/search/docs/crawling-indexing/special-tags

## Publishing

The portfolio was published with the owner’s approval on 2026-09-30. The repository deploys GitHub Pages from main; updates are prepared on codex/interactive-portfolio and fast-forwarded after validation.


## Link previews

The home and all 22 products have 1200×630 JPEG share cards, rendered from approved icons and existing localized copy. Product translations fall back to English when unavailable. `_includes/social-meta.html` supplies consistent Open Graph and Twitter metadata, absolute image URLs, image dimensions and localized page URLs.

Regenerate with `node scripts/generate-social-cards.cjs` in an environment with `sharp` available. The generator writes content-versioned assets to `images/share/` and updates `_data/share_images.json`. Validate the Jekyll output with `python3 scripts/check-social-previews.py <build-directory>`. Filename changes allow platforms to fetch the updated artwork; previously shared messages may retain platform-managed caches.
