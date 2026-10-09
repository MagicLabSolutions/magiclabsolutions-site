# Brainfold — books/PDF to flashcards, English approval pilot

User requested one English image first, followed by localization and the native macOS set only after approval. Intended position: second screenshot in both iOS and macOS galleries. macOS destination: version 1.2.1. No store metadata or screenshot gallery was changed in this pilot.

## Review

- Master: `exports/en-US/store-2-pilot.png` — opaque 1320 × 2868 PNG.
- Mobile reading checks: `preview-390.jpg` and `preview-320.jpg`.
- Editable composition/copy: `art.html` and `pilot.json`.
- Reproduce: `node scripts/marketing/brainfold-import-pilot-render.mjs` from the website repository.

English copy:

> Books & PDFs. / Into flashcards.
>
> Scan a page or import a PDF. / AI builds your study deck.

The isolated book-scanning photo was generated and refined with the built-in `image_gen` tool. Exact initial/refinement prompts and original output path are preserved in `provenance.json`. A measured SVG silhouette mask removes the generated peripheral haze in the layout; the image keeps its original pixels and ivory contour. The PDF file illustration is editorial artwork, not a claimed native interface control.

The iPhone frame is the existing original Apple PNG, with its measured 1320 × 2868 opening. The flashcard pixels and complete rounded component are from the existing real English app capture; no UI or device hardware was generated or altered. `validation.json` records source hashes, screenshot dimensions, card crop, copy metrics and frame geometry.

Feature evidence: `Brainfold/Features/Scan/CameraScanView.swift`, `Brainfold/Features/Scan/PDFImportView.swift`, and `Brainfold/Core/Services/ScanService.swift` in the Brainfold repository. Native macOS captures will be required for the Mac set after approval; old test artifacts labeled Mac that originate from iPad must not be used as native desktop screenshots.

Await approval before updating the campaign master/locales, adding this image to the current approved gallery, producing macOS artwork, or uploading. Retain the existing flashcard panel when inserting this new second image. Website pages and existing approved store masters remain unchanged.

Checks passed: real screenshot/frame fit, complete flashcard bounds, measured 5.5%-of-width copy/device gap, 320px and 390px visual inspection, PNG size/opacity, JavaScript syntax, clean Jekyll build and portfolio validation (22 products × 8 locales). This internal pilot is excluded from the generated website and was not published.
