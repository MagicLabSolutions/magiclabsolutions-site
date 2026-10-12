# MagicLab — Apple header and search creatives

Scope: Sundust, Giftly, GroundControl, Brainfold, Memories, Poof, Soooon,
My Renewals, TocToc, TumTum, zuzu and Kinfold. Hooray has no Apple app record.
Additional studio apps are not silently included in this campaign.

There are 1,008 full-resolution opaque masters: one header and one search image
for each of 504 product/native-language combinations. Language coverage comes
from each shipped app's catalog, rather than applying one universal language list.
GroundControl is English-only. Existing TumTum/Soooon screenshot designs and
Sundust's store previews are retained.

Headers are 3840×1646; search images are 3840×2560. Headers use approved brand
art, an actual icon and a concise localized benefit. Search images add real
native UI or gameplay. TocToc uses its iPhone interface. Composition and text
are separate editable layers; original approved product photos and relevant
props remain consistent with each app. No new voiceover or video was generated.

`records/` contains master hashes, native source hashes, copy and measured layout.
`copy-overrides.json` holds authored short variants. `previews/` and `index.html`
provide a local review catalogue. `review-browser-qa.json` covers 42 combinations
at a 390px viewport. Full-resolution `exports/` is local and ignored by Git.
This package is excluded from the public Jekyll site.

## Apple delivery

`store-placements-sync.mjs` reserves `CREATIVE_ASSETS` in the app's Asset Library,
uploads the exact master, verifies processing and creates header/search placements
on editable versions. It paginates all assets, uses hash-based reservation names
and keeps durable per-image delivery records. Default placements allow one image;
old bindings are backed up and restored if replacement fails. Old library images
are retained. Collection and single-placement reads include `image` to verify
their image relationships.

When authorized and no editable or review version is open, the tool creates the
next minor draft with manual release. A version already in review is preserved;
its images are uploaded to the independent library for later placement. No
binary, review withdrawal or standalone asset review is submitted by this tool.

`store-placements-localizations.mjs` completes missing supported Apple listing
locales on editable drafts and attaches both assets with explicit regional reuse.
It records missing descriptions, support URLs and keywords for later metadata
completion. Native languages without Apple locale slots remain in the library.

`store-creative-audit.mjs` validates all current delivery hashes, freshly reads
the processed libraries and placements, audits the Kinfold galleries and verifies
the retained Sundust preview IDs/checksums. Final JSON evidence identifies draft
versions, library-only apps and missing listing metadata.

Apple headers/search placements currently display on iOS/iPadOS 27 or later.
Upload acceptance for Mac-only apps does not establish Mac storefront support.
Creative assets can be reviewed independently and approved assets can replace
creative on a live version, but upload, placement, review and publication are
separate operations. This delivery does not claim public publication.

See the reusable studio skill:
`Skills/magiclab-store-art-direction/references/apple-creative-assets.md`.
