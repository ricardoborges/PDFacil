# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PDFacil (BentoPDF) is a privacy-first, client-side PDF toolkit that runs entirely in the browser with no server-side processing. It supports both web deployment (via Docker or self-hosting) and desktop apps via Tauri.

## Common Commands

```bash
# Development
npm run dev              # Vite dev server (port 5173)
npm run tauri:dev        # Tauri desktop app dev mode

# Building
npm run build            # Production web build
npm run tauri:build      # Build desktop app (MSI/DMG/AppImage)

# Testing
npm run test             # Run Vitest (watch mode)
npm run test:run         # Single test run
npm run test:coverage    # Coverage report (80% threshold)

# Code Quality
npm run format           # Prettier formatting

# Release
npm run release          # Patch version bump
npm run release:minor    # Minor version bump
npm run release:major    # Major version bump
```

## Architecture

### Directory Structure
- `src/js/logic/` - 77 TypeScript files, one per PDF tool (e.g., `merge-pdf-page.ts`, `compress-pdf-page.ts`)
- `src/js/handlers/fileHandler.ts` - Centralized file upload/download handling
- `src/js/utils/` - Shared utilities (helpers, render-utils, font-loader, cpdf-helper)
- `src/js/config/` - Tool definitions and configuration
- `src/pages/` - HTML pages for each tool (70+ pages)
- `src-tauri/` - Tauri desktop app (Rust backend, minimal - just plugin setup in `lib.rs`)
- `public/locales/` - i18n translations (en, de, pt-BR, vi, zh)
- `scripts/` - Build automation (release.js, update-version.js, build.js for obfuscation)

### Key Patterns
- Each PDF tool follows the `*-page.ts` pattern in `src/js/logic/`
- Entry point: `src/js/main.ts` initializes the app and routes to tool pages
- State management: Simple pattern in `src/js/state.ts`
- UI utilities: `src/js/ui.ts` for DOM manipulation and event binding

### Build System
- Vite with custom plugins in `vite.config.ts`:
  - Page rewrite plugin for URL routing (maps `/merge-pdf` to `/src/pages/merge-pdf.html`)
  - Output flattening moves pages from `src/pages/` to root level in dist
  - Node.js polyfills via `vite-plugin-node-polyfills` for browser compatibility
- TypeScript with path alias: `@/*` maps to `./src/*`

### PDF Processing Stack
- **pdf-lib** - Core PDF manipulation
- **pdfjs-dist** - PDF rendering (Mozilla)
- **qpdf-wasm** - Advanced PDF operations via WebAssembly
- **tesseract.js** - OCR functionality
- **jspdf + html2canvas** - HTML to PDF conversion

## Testing

Tests are in `src/tests/` using Vitest with jsdom environment. Coverage thresholds require 80% for lines, functions, branches, and statements.

Run a single test file:
```bash
npx vitest run src/tests/helpers.test.ts
```

## Docker

```bash
# Development
docker compose -f docker-compose.dev.yml up

# Production build
npm run build:docker
docker compose up
```

Supports `BASE_URL` for subdirectory deployment and `SIMPLE_MODE` build-time flag for simplified UI.

## Tauri Desktop App

Prerequisites vary by OS - see `TAURI.md`. The desktop app uses the same web codebase with native file dialogs via Tauri plugins (dialog, fs, shell).

## i18n

Uses i18next with translations in `public/locales/{lang}/common.json`. Check translation completeness with:
```bash
node scripts/check-translations.js
```

## Contributing

CLA required (see ICLA.md/CCLA.md). Code style enforced via Prettier (2-space indent, single quotes, trailing commas ES5).
