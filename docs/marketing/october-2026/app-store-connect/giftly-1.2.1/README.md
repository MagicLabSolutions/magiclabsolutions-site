# Giftly 1.2.1 — store screenshot delivery

The owner requested the prepared Giftly store images for the existing iOS version
1.2.1 on October 8, 2026. This batch is scoped to that exact editable version.
It preserves both attached builds, their release settings and preview videos.

The approved masters are in `localized/exports/<source-locale>/giftly/` and match
the SHA-256 inventory in `giftly-localized/asset-validation.json`: four iPhone
screenshots and four native iPad screenshots per source language. Thirty-four
languages map to thirty-nine Apple listing locales, including regional reuse.

- `inventory.json` identifies the app and its live version states before upload.
- `before.json` records independent draft gallery IDs, builds and previews.
- `plan-applied.json` records source paths, language mappings, dimensions and MD5s.
- `delivered-galleries.json` contains Apple's processed image IDs, exact order and checksums.
- `upload-status.json` records verified totals and preserved version settings.
- `work/backups/` keeps original full-size images and sanitized metadata locally.

Use the existing account credentials outside the repository:

```sh
node scripts/marketing/app-store-screenshot-sync.mjs --apply --apps=giftly --version=1.2.1 --audit-dir=docs/marketing/october-2026/app-store-connect/giftly-1.2.1
```

`--version` requires one named app and fails if that exact version is missing or
not editable. `--audit-dir` isolates delivery evidence and resume checkpoints.
A later audit must read App Store Connect again; these checkpoints belong to this
operation. Uploading screenshots does not submit or release the version. Any
listing fields still needed before review are recorded in `upload-status.json`.
