# magiclabsolutions.com — roadmap

Jekyll 4.4 + polyglot (8 locales), deployed by GitHub Actions to GitHub Pages. The site is the
studio's storefront and every app's legal/support home, so it moves with every release.

## Fix list (week of 14/09/2026)

- [ ] MyRenewals page: `/privacy` and `/terms` → `/privacy-policy/` and `/terms-of-use/` (they 404 today) — `apps/myrenewals/index.html:1391,1429,1430`. Kinfold: add the trailing slashes.
- [ ] `_config.yml`: the second `include:` (line 84) silently overrides the first (line 43) — merge them. `url:` says apex while `CNAME` is `www` — pick one and redirect the other.
- [ ] Legal pages dated "January 1, 2025": refresh the copy to name every app and the data each one touches (Pauta, TumTum, Giftly, Sundust, Kinfold, Hooray), date it.
- [ ] Contact form posts to itself (`form_action: ''`): point it at a free form backend (Formspree free tier or a `mailto:` fallback) so `/thanks` is reachable.
- [ ] Footer links `/project/<name>/` while cards use `/apps/<name>/`; Hooray should point to hooraycards.com. Remove the theme leftovers (`_LICENSE.md`, `_README.md`, `_includes/demo-post.md`, `images/demo/`), untrack `.DS_Store`.
- [ ] `README.md` with build/deploy instructions (`BUNDLE_GEMFILE` + `--disable-disk-cache` trick).

## Per app

| App | Needed | When |
|---|---|---|
| Pauta | `/pauta/privacy-policy/`, `/pauta/terms-of-use/`, `/pauta/support/` (en, pt-BR, es) + coming-soon card; landing at launch | 14/09 (legal), 25/09 (landing) |
| TumTum | flip `coming_soon` and add the store link the day it is approved; keep its pages script-free | at approval |
| Casecraft | `/games/casecraft/` coming soon (W3 of its roadmap), live at launch | 28/09 → 13/10 |
| Sundust | terms page (only privacy exists) + support page; Steam link when live | Oct |
| Zuzu, Kinfold, MyRenewals, QRamen, Hooray | support pages (Apple requires a support URL per app) | Oct, one per Friday |
| Giftly | done (share page, support) — keep the What's New in sync | — |

## Analytics (free, no cookies)

Cloudflare Web Analytics snippet on every page except TumTum's legal pages: page views, referrers,
countries. No consent banner needed. Keep the Google Ads gtag only where a campaign runs.

## Redesign proposal (October)

- Home as a studio page: three shelves (Apps · Games · For families), each card with icon, one line,
  platforms and store badges; a "What's new" strip fed by the (currently empty) blog collection.
- One page per app with the same skeleton: hero, three benefits, screenshots by locale, FAQ, support,
  legal links, "also from MagicLab".
- Press kit page (`/press/`): logos, icons, screenshots, one-paragraph bios, contact.
- Newsletter: Buttondown free tier (up to 100 subscribers) with a launch-only cadence.
- Build it as a design canvas first (the `design` skill), approve, then implement in Jekyll.

## Content cadence

A post in `_posts/` for every version that ships (notes in the MagicLab voice), and one studio update
a month. The blog is already configured (`/blog/:slug`, pagination 6) — it only lacks posts and a nav
entry.
