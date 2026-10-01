# zuzu — native studio set

Six iPhone, six iPad and six Android layouts cover distinct native experiences.
Apple artwork keeps the initial family photograph for the opening and uses the
nursery environment for quieter feature panels. Three of six images per platform emphasize selected UI components; the other
three retain clean device views. UI components cross the original
hardware bezel; the full chart, summary, countdown and timer retain their pixels.
English copy and measured rectangles are in `zuzu-studio.json` and locale data.
The new nursery prop was generated with the built-in ImageGen tool; the exact
prompt, original file and hash are in `assets/zuzu/provenance.json`.

## Android correction

Earlier files collected from `Zuzu-android/screenshots` showed iOS system chrome.
Repository location did not establish platform provenance. Those six sources and
web thumbnails are now replaced with fresh 1280×2856 Android emulator captures.
The real current composables run with the repository's offline LayoutAudit
fixtures on an isolated Pixel 9 Pro emulator; no account or production data is
used. Source revision: `23531c4` (2.6.0). Capture-only changes disable Firebase
build plugins because the local checkout lacks google-services.json, provide an
invalid sign-in client string for compilation, and select phone portrait capture.
The production repository remains unchanged. The harness is saved separately (apply with `git apply --unidiff-zero`).
Six existing fixture capture tests completed successfully.

The authentic Pixel bezel and camera mask come from the installed Android Studio
`device-art-resources/pixel_9_pro` package. Its layout specifies a 1408×2974 frame
and 1280×2856 opening at (60,61), with a 109px corner radius. Its two layers are
combined deterministically in the private frame cache. Native screen pixels fit
this measured opening exactly, with no letterbox or iOS hardware.

Android images intentionally show their own native functions: daily care,
timeline, quick actions, nap timer, Sleep School and the first-week guide. They do
not borrow Apple pregnancy or growth screenshots. Apple and Android website
examples are labeled and grouped independently.
