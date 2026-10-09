# zuzu iOS 2.8.0 — App Store delivery

Verified directly against App Store Connect at 2026-10-09T03:26:00.624Z.

- App ID: `6757988505`; version ID: `3e870d6a-74cc-4c56-aa16-f480816344f8`.
- 50 Apple listing localizations, each with six iPhone and six iPad screenshots: **600 images / 100 galleries**.
- All images are `COMPLETE`. Remote count, ordering, source checksum and dimensions match the approved localized masters.
- 50 localized keyword fields match `keyword-plan.json` and `keywords-verification.json`.
- Published version 2.7.1, existing Apple Watch galleries, previews, attached-build state and manual release setting preserved.
- No App Review submission or release performed. Version remains `PREPARE_FOR_SUBMISSION`.

## Remaining listing work before a later App Review submission

The draft has no build attached. Release notes (`whatsNew`) are empty in 50 localizations. The 12 newly added listing locales also need descriptions and support URLs; see `delivery-status.json` for the exact locales. These unrelated text fields were preserved.

## Evidence and recovery

`before.json` and `after.json` capture the published/draft comparison. `delivered-galleries.json` preserves ordered screenshot IDs and checksums. `plan-applied.json` records all final masters. Failed network attempts were resumed by inspecting remote resources; final verification has no missing or failed images.

Original full-size gallery backups remain in the ignored `work/backups/` folder. Per-gallery checkpoints are in `work/results/`. Do not remove the originals during later campaign edits.

## Keywords in the app repository

The 38 existing Fastlane locale keyword files were synchronized to the verified values in the zuzu repository, commit `099ba188`, branch `codex/zuzu-280-store-keywords` (pushed). No other app files were changed. The 12 additional Apple listing locales are recorded in `local-keyword-sync.json`; their complete listing text and future Fastlane locale support remain separate work.

## Local checks

- `node --check scripts/marketing/zuzu-store-delivery.mjs`: passed.
- Clean website source snapshot: Jekyll build passed; portfolio checker passed (22 products × 8 locales).
- No public website pages changed or redeployed for this store upload. Unrelated Giftly edits in the website working tree were excluded.
