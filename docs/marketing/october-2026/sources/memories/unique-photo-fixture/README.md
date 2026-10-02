# Memories unique photo repair — October 2, 2026

Only home (panel 1) and highlights (panel 3) are recaptured. Archival film
and soundtrack native screenshots remain byte-for-byte unchanged, in every locale.
Derived panel 2 artwork uses an approved empty-room sample photo behind the
transparent foreground cat; all UI pixels outside that photo remain identical.
`memories-photo-plate.mjs` detects the photo bounds and asserts this pixel identity.
Localized tablet landscape photos are retained. Source and plate hashes and photo
bounds are recorded in the derived website device metadata.

The capture harness mounts production SwiftUI views in an isolated source copy,
loads existing fictional photo fixtures from its own offline cache, disables
account/network integrations, and positions the native month carousel two months
back on iPhone and six on iPad (the wider carousel exposes more covers). That position keeps monthly mosaics distinct from the recent photo grid.
It is an ordinary native carousel state, not a repainted screenshot.

Source revision: `76729fc56bcdd3cb9236479b228163940874eff4`.
The sibling `capture-harness.patch` records the isolated changes. Do not apply it
to the production app repository. Build the source copy with Xcode and retain its
binary hash in the capture manifests.

Prepare the cache with `scripts/marketing/prepare-memories-unique-photos.py`, using
the archived original stock cache. It combines distinct archived travel/pet photos
with the approved fictional photo assets. The manifest verifies unique hashes for
all 144 child album items. Launch `capture-localized-native.py` with
`MAGICLAB_MEMORIES_CACHE`, `MAGICLAB_CAPTURE_APP`, and
`MAGICLAB_CAPTURE_BUNDLE=com.magiclabsolutions.memories` on dedicated simulators.
Remove only the affected native-1/native-3 output files before recapturing.

Regenerate store/social panels 1 and 3, plus panel 2's transparent cat accent,
using `MAGICLAB_PANELS=1,2,3`. Preserve panel 4 exports. Share previews follow
panel 1. Website photographic cutouts are distinct from verified native UI crops.

The dedicated iPad package uses bundle `com.magiclabsolutions.memories.marketing`
and `UIDeviceFamily=[1,2]`, matching the existing native tablet capture harness.
It is signed ad hoc for the simulator only.

Tablet monthly mosaic covers select distinct older photos from each real fixture
month. This keeps covers separate from the latest six recent photos even when
the wider native carousel exposes the current month. The fixture changes only
which existing sample photos the native mosaic renders; it adds no UI features.
The production app repository remains unchanged.
