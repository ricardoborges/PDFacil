# AGENTS.md — BentoPDF / PDFácil

This file contains project-specific guidance for AI coding agents working on this repository. All information is derived from the actual codebase — do not assume details not listed here.

---

## Project Overview

**BentoPDF** (also branded as **PDFácil** in the desktop app) is a privacy-first, client-side PDF toolkit. All PDF processing happens entirely in the browser — no files are uploaded to a server. The project supports:

- **Web deployment** via Docker or static self-hosting
- **Desktop app** via Tauri v2 (Rust backend + Web frontend)
- **70+ PDF tools** covering merge, split, compress, convert, edit, OCR, encrypt, annotate, and more

The codebase is a multi-page Vite application written in TypeScript with vanilla JavaScript (no frontend framework like React or Vue).

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Build Tool | Vite 7.x |
| Language | TypeScript 5.9.x (ES2022, ES modules) |
| Styling | Tailwind CSS 4.x |
| Testing | Vitest 3.x + jsdom |
| Desktop Shell | Tauri 2.x (Rust) |
| Container | Docker (nginx-unprivileged) |
| i18n | i18next with browser language detection |

### Core PDF Libraries

- **pdf-lib** — primary PDF manipulation (create, modify, merge, split)
- **pdfjs-dist** (Mozilla PDF.js) — PDF rendering and viewer engine
- **qpdf-wasm** — advanced PDF operations via WebAssembly
- **tesseract.js** — OCR (Optical Character Recognition)
- **jspdf + html2canvas** — HTML-to-PDF conversion
- **pdfkit + blob-stream** — PDF generation from images/text
- **embedpdf-snippet** — PDF annotation/editing viewer (vendored)

### UI Libraries

- **lucide** — icon system
- **sortablejs** — drag-and-drop page ordering
- **cropperjs** — image cropping

---

## Architecture & Directory Structure

```
├── src/
│   ├── js/
│   │   ├── main.ts                    # App entry point: initializes i18n, renders tool grid, sets up event listeners
│   │   ├── ui.ts                      # Central DOM references, loader/alerts, thumbnail rendering, file display
│   │   ├── state.ts                   # Minimal global state (activeTool, files, pdfDoc, etc.)
│   │   ├── canvasEditor.ts            # Canvas-based editor for crop/redact tools
│   │   ├── handlers/
│   │   │   └── fileHandler.ts         # Centralized file upload/download logic per tool type
│   │   ├── config/
│   │   │   ├── tools.ts               # Tool definitions organized by category (used for homepage grid)
│   │   │   ├── pdf-tools.ts           # Tool ID classifications: singlePdfLoadTools, multiFileTools, simpleTools
│   │   │   ├── tesseract-languages.ts # OCR language packs config
│   │   │   └── font-mappings.ts       # Font mapping utilities
│   │   ├── logic/                     # One file per PDF tool (~77 files)
│   │   │   ├── merge-pdf-page.ts
│   │   │   ├── compress-pdf-page.ts
│   │   │   ├── edit-pdf-page.ts
│   │   │   ├── ocr-pdf-page.ts
│   │   │   ├── sign-pdf-page.ts
│   │   │   ├── pdf-multi-tool.ts      # Unified multi-tool interface
│   │   │   ├── index.ts               # Exports toolLogic registry
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── helpers.ts             # Shared utilities (formatBytes, parsePageRanges, hexToRgb, etc.)
│   │   │   ├── render-utils.ts        # Progressive/lazy PDF page rendering
│   │   │   ├── rotation-state.ts      # Page rotation state management
│   │   │   ├── font-loader.ts         # Custom font loading for PDF generation
│   │   │   ├── cpdf-helper.ts         # CoherentPDF helper wrapper
│   │   │   ├── lucide-init.ts         # Icon initialization
│   │   │   └── shortcuts-init.ts      # Keyboard shortcuts initialization
│   │   ├── i18n/
│   │   │   ├── i18n.ts                # i18next setup, language detection, URL rewriting
│   │   │   ├── index.ts               # Re-exports + DOM translation helpers
│   │   │   └── language-switcher.ts   # Language dropdown UI
│   │   └── types/
│   │       ├── index.ts               # Shared TypeScript types
│   │       ├── form-creator.ts        # Form creator types
│   │       └── ocr.ts                 # OCR types
│   ├── pages/                         # HTML page templates for each tool
│   │   ├── merge-pdf.html
│   │   ├── edit-pdf.html
│   │   └── ... (70+ pages)
│   ├── css/
│   │   ├── styles.css                 # Main stylesheet
│   │   └── bookmark.css               # Bookmark-specific styles
│   ├── tests/
│   │   ├── setup.ts                   # Vitest setup (ResizeObserver, matchMedia, IntersectionObserver mocks)
│   │   ├── helpers.test.ts
│   │   ├── state.test.ts
│   │   ├── tools.test.ts
│   │   ├── pdf-tools.test.ts
│   │   └── watermark.test.ts
│   ├── types/
│   │   ├── globals.d.ts               # Global type declarations
│   │   └── coherentpdf.global.d.ts    # CoherentPDF global types
│   └── version.ts                     # Reads version from package.json and injects into DOM
├── src-tauri/                         # Tauri desktop app (Rust)
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── build.rs
│   ├── src/
│   │   ├── main.rs                    # Rust entry point
│   │   └── lib.rs                     # Tauri plugin setup
│   ├── capabilities/
│   │   └── default.json               # Tauri permission capabilities
│   └── icons/                         # App icons for all platforms
├── public/
│   ├── images/                        # Static images and logos
│   ├── locales/                       # i18n translation files
│   │   ├── en/common.json
│   │   ├── en/tools.json
│   │   ├── pt-BR/common.json
│   │   ├── pt-BR/tools.json
│   │   ├── de/, zh/, vi/
│   │   └── ...
│   ├── pdfjs-viewer/                  # PDF.js viewer assets
│   ├── pdfjs-annotation-viewer/       # Annotation viewer assets
│   └── workers/                       # Web workers (Tesseract, etc.)
├── scripts/
│   ├── release.js                     # Semantic version bump, git tag, build + package
│   ├── update-version.js              # Updates version strings in HTML files
│   ├── package-dist.js                # Creates dist-{version}.zip for releases
│   ├── build.js                       # Code obfuscation build script
│   └── check-translations.js          # Translation completeness checker
├── vite.config.ts                     # Vite config with custom page-routing plugins
├── vitest.config.ts                   # Vitest config (jsdom, coverage thresholds)
├── tsconfig.json                      # TypeScript config (strict mode disabled)
├── package.json
├── Dockerfile                         # Multi-stage build -> nginx-unprivileged
├── nginx.conf                         # Non-root nginx config (port 8080)
├── docker-compose.yml                 # Production compose (uses published image)
├── docker-compose.dev.yml             # Development compose (builds from Dockerfile)
├── build-tauri.ps1                    # Windows PowerShell Tauri build helper
├── .prettierrc                        # Code formatting rules
└── TAURI.md                           # Desktop app build instructions (Portuguese)
```

---

## Build and Development Commands

```bash
# Install dependencies
npm install

# Development server (Vite, port 5173)
npm run dev

# Production build
npm run build

# Preview production build locally (port 4173)
npm run preview

# Serve simple mode locally (port 3000)
npm run serve:simple

# Serve default mode locally (port 3000)
npm run serve

# Format all files with Prettier
npm run format

# Update version strings in HTML files
npm run update-version

# Package dist/ into dist-{version}.zip
npm run package
```

### Tauri Desktop Commands

```bash
# Run desktop app in development mode
npm run tauri:dev

# Build desktop installers (MSI, NSIS, DMG, AppImage, DEB, RPM)
npm run tauri:build
```

### Docker Commands

```bash
# Development build + run
npm run build:docker
docker compose -f docker-compose.dev.yml up --build -d

# Production (uses pre-built image)
docker compose up -d
```

### Release Commands

```bash
npm run release          # Patch bump (0.0.1 -> 0.0.2)
npm run release:minor    # Minor bump (0.0.1 -> 0.1.0)
npm run release:major    # Major bump (0.0.1 -> 1.0.0)
```

The release script (`scripts/release.js`) will:
1. Bump `package.json` version
2. Run `npm run update-version` to update HTML files
3. Git commit and tag
4. Run `npm run package` to build the distribution zip
5. Push to `origin main` and push the tag

---

## Code Style Guidelines

Enforced by **Prettier** (`.prettierrc`):
- **Indent**: 2 spaces, no tabs
- **Quotes**: single quotes
- **Semicolons**: required
- **Trailing commas**: ES5 compatible
- **Print width**: 80 characters

TypeScript conventions:
- `camelCase` for variables and functions
- `PascalCase` for types and classes
- **Strict mode is disabled** in `tsconfig.json` (`"strict": false`)
- Path alias `@/*` maps to `./src/*`
- Import `.js` extensions even for TypeScript files (Vite bundler mode requirement)

When modifying code:
- Follow existing patterns in `src/js/logic/*-page.ts` files
- Use the `dom` object from `src/js/ui.ts` for DOM element references
- Use `showLoader()` / `hideLoader()` and `showAlert()` / `hideAlert()` for UX feedback
- Use `t('key')` from `src/js/i18n/i18n.ts` for all user-facing strings

---

## Testing Instructions

Test framework: **Vitest** with **jsdom** environment.

```bash
# Run tests in watch mode
npm run test

# Run tests once (CI)
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

Coverage thresholds (enforced in `vitest.config.ts`):
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

Coverage exclusions: `node_modules/`, `src/tests/`, `dist/`, `public/`, `scripts/`, config files, `**/*.d.ts`.

Test setup (`src/tests/setup.ts`) mocks:
- `ResizeObserver`
- `window.matchMedia`
- `IntersectionObserver`
- Cleans `document.body` and `document.head` after each test

Run a single test file:
```bash
npx vitest run src/tests/helpers.test.ts
```

---

## How to Add a New PDF Tool

1. **Create the logic file**: `src/js/logic/my-tool-page.ts`
   - Export a `process` function (and optionally `setup`)
   - Register it in `src/js/logic/index.ts` under `toolLogic`

2. **Create the HTML page**: `src/pages/my-tool.html`
   - Use existing pages as templates
   - Include the standard layout with drop zone, options, and process button

3. **Add to Vite build inputs**: `vite.config.ts`
   - Add `'my-tool': resolve(__dirname, 'src/pages/my-tool.html')` to `rollupOptions.input`

4. **Add to tool configuration**:
   - Add to `src/js/config/tools.ts` in the appropriate category
   - Add to `src/js/config/pdf-tools.ts` in the correct classification array (`singlePdfLoadTools`, `multiFileTools`, or `simpleTools`)

5. **Add translations**:
   - Add tool name/subtitle keys to all `public/locales/*/tools.json` files
   - Run `node scripts/check-translations.js` to verify completeness

6. **Add tests** in `src/tests/` if the tool introduces new utilities.

---

## Internationalization (i18n)

Supported languages: **pt-BR** (default), **en**, **de**, **zh**, **vi**.

- Translation files live in `public/locales/{lang}/{common,tools}.json`
- Fallback language is `pt-BR`
- Language is detected from URL path (`/en/merge-pdf.html`), localStorage, or browser preference
- Use `data-i18n` attributes in HTML for static text; `applyTranslations()` processes them at runtime
- Use `t('key')` in TypeScript for dynamic strings
- Links are automatically rewritten to include the active language prefix via `rewriteLinks()`

Check translation completeness:
```bash
node scripts/check-translations.js
```

---

## Desktop App (Tauri)

The Tauri app wraps the same web frontend in a native desktop shell.

- **Product name**: PDFácil
- **Identifier**: `com.pdfacil.app`
- **Window**: 1200x800, min 800x600
- **Tauri plugins**: `shell`, `dialog`, `fs`

Build outputs (per platform):
- Windows: MSI + NSIS installer
- macOS: DMG + App Bundle
- Linux: AppImage + DEB + RPM

See `TAURI.md` for OS-specific prerequisites (Rust toolchain, WebView2, etc.).

---

## Docker & Deployment

### Image Details
- **Base**: `nginxinc/nginx-unprivileged:stable-alpine-slim`
- **Port**: 8080 (non-root)
- **Security headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, COOP, CORP
- **Build args**:
  - `BASE_URL` — for subdirectory deployment (must include trailing slash, e.g., `/tools/bentopdf/`)
  - `SIMPLE_MODE` — `true` to hide branding/marketing content

### Simple Mode
When `SIMPLE_MODE=true` is set at build time:
- Hides navigation, hero, features, FAQ, testimonials, footer
- Shows only essential PDF tools
- Updates page title to "PDF Tools"

### Subdirectory Hosting
```bash
BASE_URL=/tools/bentopdf/ npm run build
```

---

## Security Considerations

- **Client-side only**: No file data leaves the browser; all processing is local
- **Non-root container**: Docker runs as `nginx` user on port 8080
- **Encrypted PDF handling**: Password-protected PDFs are rejected by most tools with a user alert; they must first be decrypted via the dedicated Decrypt tool
- **CSP**: Tauri config has `csp: null` — the web app relies on standard browser sandboxing
- **Vulnerability reporting**: Do not open public issues; contact `contact@bentopdf.com`
- **CLA required**: Contributors must sign ICLA/CCLA before PRs are merged (enforced by bot)

---

## Key Dependencies & Browser Compatibility Notes

- **COOP/COEP headers**: Required in dev server and nginx for WebAssembly (qpdf-wasm) and SharedArrayBuffer support
- **Node.js polyfills**: `buffer`, `stream`, `util`, `zlib`, `process` are polyfilled via `vite-plugin-node-polyfills`
- **pdfkit/blob-stream**: Pre-bundled via `optimizeDeps.include`
- **coherentpdf**: Excluded from optimization (loaded separately)

---

## Useful Scripts

| Script | Purpose |
|--------|---------|
| `scripts/release.js` | Semantic release with git tagging and packaging |
| `scripts/update-version.js` | Syncs version strings across HTML files |
| `scripts/package-dist.js` | Zips `dist/` into `dist-{version}.zip` |
| `scripts/check-translations.js` | Validates translation key completeness across languages |
| `scripts/build.js` | Code obfuscation (used sparingly) |

---

## License

The `package.json` and `src-tauri/Cargo.toml` specify **Apache-2.0**. The project also distributes under a dual-license model (AGPL-3.0 for open source + commercial license for proprietary use). See `ICLA.md` and `CCLA.md` for contributor agreements.
