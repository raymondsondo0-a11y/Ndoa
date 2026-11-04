# Raymond Report Studio v2

A React/Vite frontend migration scaffold for the Ndoa repository. It is intentionally isolated from the existing report-studio PHP site so the currently deployed version is not overwritten during development.

## Selected architecture
- Frontend: React + Vite with responsive interface styling.
- Static hosting: InfinityFree serves the compiled dist output.
- Document extraction: PDF.js for text-based PDFs and Mammoth.js for DOCX, executed in the user's browser.
- No AI API: reference documents are not sent to a generative AI provider.
- No database: draft persistence will use IndexedDB in a later implementation stage.
- Hybrid processing: an optional external non-AI processing endpoint can be added for OCR of scanned PDFs and heavier file conversions. It is not configured or deployed yet.

## Current implementation
- Multi-file reference upload.
- File size/type validation and per-file progress/status.
- PDF text extraction with PDF.js.
- DOCX text extraction with Mammoth.js.
- Per-file failure handling so one bad file does not cancel the remaining uploads.
- Deterministic reference intelligence: detects common front matter, chapter headings, practical activities, conclusions, references and appendices.
- Editable suggested outline with section inclusion controls.
- Downloadable JSON structure plan.
- Basic Node test suite for the heading-analysis engine.
- Clear notice for scanned PDFs and legacy DOC files.
- Separate React application folder; existing PHP application remains untouched.

## Local development (Windows CMD)
From the repository root:
```cmd
cd report-studio-v2
npm install
npm run dev
```

Create a production build:
```cmd
npm run build
npm test
```
Vite writes the deployable static site to report-studio-v2/dist/.

## InfinityFree deployment
1. Build locally with npm run build.
2. Upload the contents of dist/ to a new directory such as /htdocs/report-studio-v2/.
3. Do not upload node_modules/ or the source folder as the production site.
4. Keep /htdocs/report-studio/ in place until the new version passes acceptance testing.
5. An .htaccess fallback is only needed if client-side routes are introduced.

## Next milestones
1. Store extracted reference text and metadata in IndexedDB so navigation/reload does not lose work.
2. Analyse heading hierarchy and build an editable suggested report outline (structure only; do not copy source paragraphs).
3. Add report details, activity/logbook, image evidence and chapter editor steps.
4. Generate full live A4 preview and reliable PDF/DOCX/print exports.
5. Add separately hosted, non-AI OCR/conversion only if scanned PDFs or legacy DOC conversion are required.
6. Test on desktop/mobile and deploy to a staging directory before switching the main domain path.

## Important limitations
- Scanned PDFs need OCR; PDF.js text extraction cannot read text that exists only inside page images.
- Legacy binary DOC is not supported by Mammoth.js; convert it to DOCX before upload.
- Browser storage is device/browser-specific and can be cleared. There is no cloud backup because this design has no database.
- The hybrid OCR service is a future integration and must not be represented as active until deployed and tested.