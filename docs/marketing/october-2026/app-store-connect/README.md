# Approved store screenshot upload — October 2, 2026

The owner authorized uploading the generated store images and creating the next
App Store versions when needed. This is an image delivery task, not permission to
release a binary. TumTum and Soooon's current store collections remain retained;
Hooray has no Apple app record. Social images, share thumbnails, Android screenshots
and app previews/videos are outside the screenshot upload scope.

Final delivery: 2,401 images in 469 verified galleries for Sundust, Brainfold,
Memories, My Renewals, TocToc and GroundControl. See `upload-status.md` for the
current version states and `delivery-verification.json` for the completed checks.
One initial My Renewals Arabic ordering read returned stale data; the scoped
retry verified the correct gallery. Historical run logs retain that initial error,
while the final delivery has no unresolved errors.

## Evidence and recovery

- `inventory-before.json`: version IDs, platform, state and listing locales before changes.
- `plan.json`: read-only inventory of eligible images, locale mapping and draft versions.
- `plan-applied.json`: most recently applied batch, including original PNG paths and MD5s.
- `review-before-*.json`: existing pending reviews and attached build IDs, preserved unchanged.
- `work/backups/`: original full-size Apple screenshots and sanitized set metadata before removal.
- `work/results/`: completed gallery read-back, exact order, image IDs, MD5s and COMPLETE state.
- `delivered-galleries.json`: final portable copy of verified gallery checkpoints.
- `run-*.json`: each completed run's successes, errors and remaining work.

Large backup files and per-gallery checkpoints are local working artifacts ignored
by Git. Preserve them until the replacements are approved. A backup's downloaded
Apple-rendered PNG may differ byte-for-byte from its original upload; the metadata
records the original source checksum separately. To restore, reserve and upload the
backed-up PNG with its own newly computed checksum, then restore the recorded order.

The sync command is `node scripts/marketing/app-store-screenshot-sync.mjs --plan`.
Use the existing account environment outside this repository; never commit API
private keys, JWTs or presigned upload URLs. `--apply --apps=<slugs>` performs the
authorized upload. `--locales=en-US` scopes a pilot. Re-running is idempotent: only
the exact filename, MD5 and COMPLETE state counts as a previously delivered image.

The uploader validates native device dimensions and PNG opacity, backs up obsolete
images, uploads bytes with Apple's supplied upload headers, commits checksums,
waits for processing, orders the set and reads it back. Older custom phone/tablet
galleries are cleared only after the replacement largest-device gallery is verified,
so Apple's automatic device scaling uses the new art. Preview video resources are
never modified.

`sundust-preview-order.json` confirms the original complete iPhone and iPad
videos retained the same IDs/checksums. Apple displays app previews before
screenshots, so Sundust's video remains the first media item. The primary preview
is shown across storefronts unless a localized preview exists.

`--resume-verified` is only for continuing this same delivery using unchanged
masters and version IDs. It reuses original verified timestamps from local
checkpoints; a fresh audit should read App Store Connect again. A DELETE 404 during
obsolete-image cleanup is already absent, not a failed replacement.

App language codes are mapped to Apple's current listing locale codes. Unsupported
listing languages such as Bulgarian, Kazakh and Lithuanian cannot be created on
App Store Connect. Regional English and Spanish listings reuse the available app
language as recorded by `sourceLocale`; this does not pretend the native binary
has a separate regional translation. A new screenshot localization can require
listing text before an eventual review submission; creating images does not fill
or overwrite descriptions, keywords or support links.

The final report's `listingTextToCompleteBeforeReview` lists missing release
notes as well as missing description/support fields. This includes existing
localizations with empty release notes, not only newly created language records.

Giftly, zuzu and Poof were already waiting for review. Withdrawing and resubmitting
those reviews is a separate pending owner decision. No current review is canceled
by this script: it accepts only editable version states. New version drafts use
manual release and are not submitted by the uploader.
