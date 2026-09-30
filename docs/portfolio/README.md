# Portfolio refresh — 2026-09-30

## Delivery

- 17 requested repositories are present and fetched under the studio directory. Existing dirty work and feature branches were preserved; only safe fast-forwards were applied.
- 22 product pages, including 11 new landing pages and shared interactive sections on 11 existing pages. Zuzu combines its Apple and Android repositories.
- A shared searchable catalog on the home, apps and games entry points.
- Real app/store/public-web captures, current primary app icons, and labeled in-game artwork. Two new website icons: Hortulus and Moonfold.
- TumTum launch confirmed on 2026-09-30. MyRenewals corrected from the obsolete store ID 6670665785 to 6752888662 (version 1.2.6).
- Product-specific search phrases, descriptive content, structured data, canonical routes and locale alternates. New landing-page and demo copy is Portuguese and English; other locale routes explicitly mark English fallback. Existing translated landing pages remain.
- Reusable skill lives in ../Skills/magiclab-site-update and is linked into ~/.codex/skills/magiclab-site-update.

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
| WhyMe | concept | 0 | 0 |
| TumTum | released | 2 | 0 |
| Giftly | released | 3 | 0 |
| Sundust | released | 1 | 0 |
| Kinfold | released | 2 | 0 |
| MyRenewals | released | 2 | 0 |
| QRamen | released | 1 | 0 |

## Remaining evidence

- Poof: its existing store ID 6816976275 returns no public BR/US listing and the public URL returned 404. The page offers a preview without a download promise. This does not prove that it has never launched in another channel.
- WhyMe: README contains only the name. Product description and custom icon await the owner’s brief.
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
| WhyMe | WhyMe Magic Lab, projetos Magic Lab |
| TumTum | brinquedos digitais infantis, jogo Montessori, toddler playroom |
| Giftly | organizador presentes, gift planner, lista de presentes |
| Sundust | jogo exploração espacial, space exploration game, Sundust |
| Kinfold | documentos da família, family document vault, travel organiser |
| MyRenewals | controle assinaturas, subscription tracker, pagamentos recorrentes |
| QRamen | gerador QR code, QR code scanner, leitor QR |

Reference: https://developers.google.com/search/docs/crawling-indexing/special-tags

## Publishing

Changes are prepared on codex/interactive-portfolio. Production deployment was not requested and has not been triggered. The repository deploys GitHub Pages from main.
