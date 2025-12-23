import createModule from '@neslinesli93/qpdf-wasm';
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { createIcons } from 'lucide';
import { state, resetState } from '../state.js';
import * as pdfjsLib from 'pdfjs-dist';

// Tauri APIs - imported dynamically to avoid errors in browser
let tauriDialog: typeof import('@tauri-apps/plugin-dialog') | null = null;
let tauriFs: typeof import('@tauri-apps/plugin-fs') | null = null;
let tauriShell: typeof import('@tauri-apps/plugin-shell') | null = null;

// Check if running in Tauri environment (works with both Tauri V1 and V2)
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' &&
    (!!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__);
};

// Dynamically load Tauri plugins (only in Tauri environment)
const loadTauriPlugins = async () => {
  if (!isTauri()) return;

  try {
    if (!tauriDialog) {
      tauriDialog = await import('@tauri-apps/plugin-dialog');
    }
    if (!tauriFs) {
      tauriFs = await import('@tauri-apps/plugin-fs');
    }
    if (!tauriShell) {
      tauriShell = await import('@tauri-apps/plugin-shell');
    }
  } catch (error) {
    console.error('Failed to load Tauri plugins:', error);
  }
};

// Get file extension filter for save dialog
const getFileFilters = (filename: string): { name: string; extensions: string[] }[] => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const filterMap: Record<string, { name: string; extensions: string[] }> = {
    'pdf': { name: 'PDF Documents', extensions: ['pdf'] },
    'zip': { name: 'ZIP Archives', extensions: ['zip'] },
    'png': { name: 'PNG Images', extensions: ['png'] },
    'jpg': { name: 'JPEG Images', extensions: ['jpg', 'jpeg'] },
    'jpeg': { name: 'JPEG Images', extensions: ['jpg', 'jpeg'] },
    'webp': { name: 'WebP Images', extensions: ['webp'] },
    'bmp': { name: 'BMP Images', extensions: ['bmp'] },
    'tiff': { name: 'TIFF Images', extensions: ['tiff', 'tif'] },
    'tif': { name: 'TIFF Images', extensions: ['tiff', 'tif'] },
    'json': { name: 'JSON Files', extensions: ['json'] },
    'txt': { name: 'Text Files', extensions: ['txt'] },
  };

  const filter = filterMap[ext];
  return filter ? [filter] : [];
};

const STANDARD_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
  Tabloid: { width: 792, height: 1224 },
  A3: { width: 841.89, height: 1190.55 },
  A5: { width: 419.53, height: 595.28 },
};

export function getStandardPageName(width: any, height: any) {
  const tolerance = 1; // Allow for minor floating point variations
  for (const [name, size] of Object.entries(STANDARD_SIZES)) {
    if (
      (Math.abs(width - size.width) < tolerance &&
        Math.abs(height - size.height) < tolerance) ||
      (Math.abs(width - size.height) < tolerance &&
        Math.abs(height - size.width) < tolerance)
    ) {
      return name;
    }
  }
  return 'Custom';
}

export function convertPoints(points: any, unit: any) {
  let result = 0;
  switch (unit) {
    case 'in':
      result = points / 72;
      break;
    case 'mm':
      result = (points / 72) * 25.4;
      break;
    case 'px':
      result = points * (96 / 72); // Assuming 96 DPI
      break;
    default: // 'pt'
      result = points;
      break;
  }
  return result.toFixed(2);
}

// Convert hex color to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    }
    : { r: 0, g: 0, b: 0 }
}

export const formatBytes = (bytes: any, decimals = 1) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const downloadFile = async (blob: Blob, filename: string): Promise<boolean> => {
  // Check if running in Tauri environment
  if (isTauri()) {
    try {
      await loadTauriPlugins();

      if (tauriDialog && tauriFs) {
        // Open native "Save As" dialog
        const filePath = await tauriDialog.save({
          defaultPath: filename,
          filters: getFileFilters(filename),
          title: 'Salvar arquivo',
        });

        if (filePath) {
          // Convert blob to Uint8Array and write to file
          const arrayBuffer = await blob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          await tauriFs.writeFile(filePath, uint8Array);

          // Show success message
          showTauriSuccessModal(filePath);
          return true; // Indicates Tauri save was successful
        } else {
          // User cancelled the save dialog
          console.log('Save cancelled by user');
          return true; // Return true to prevent secondary alerts
        }
      }
    } catch (error) {
      console.error('Tauri save failed, falling back to browser download:', error);
      // Fall through to browser download
    }
  }

  // Browser fallback (or Tauri failed)
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return false; // Browser download, caller can show their own success message
};

// Show simple success message for Tauri saves
const showTauriSuccessModal = (filePath: string): void => {
  // Create a simple success modal
  const modal = document.createElement('div');
  modal.id = 'tauri-success-modal';
  modal.className = 'fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full border border-gray-700 mx-4">
      <div class="flex items-center gap-3 mb-4">
        <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-xl font-bold text-white">Arquivo salvo com sucesso!</h3>
      </div>
      <p class="text-gray-400 text-sm mb-4 break-all">${filePath}</p>
      <button id="close-success-btn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
        Fechar
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('#close-success-btn');

  const closeModal = () => {
    modal.remove();
  };

  closeBtn?.addEventListener('click', closeModal);

  // Close on click outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
};


export const readFileAsArrayBuffer = (file: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export function parsePageRanges(rangeString: string, totalPages: number): number[] {
  if (!rangeString || rangeString.trim() === '') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const indices = new Set<number>();
  const parts = rangeString.split(',');

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) continue;

    if (trimmedPart.includes('-')) {
      const [start, end] = trimmedPart.split('-').map(Number);
      if (
        isNaN(start) ||
        isNaN(end) ||
        start < 1 ||
        end > totalPages ||
        start > end
      ) {
        console.warn(`Invalid range skipped: ${trimmedPart}`);
        continue;
      }

      for (let i = start; i <= end; i++) {
        indices.add(i - 1);
      }
    } else {
      const pageNum = Number(trimmedPart);

      if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
        console.warn(`Invalid page number skipped: ${trimmedPart}`);
        continue;
      }
      indices.add(pageNum - 1);
    }
  }


  return Array.from(indices).sort((a, b) => a - b);
}


/**
 * Formats an ISO 8601 date string (e.g., "2008-02-21T17:15:56-08:00")
 * into a localized, human-readable string.
 * @param {string} isoDateString - The ISO 8601 date string.
 * @returns {string} A localized date and time string, or the original string if parsing fails.
 */
export function formatIsoDate(isoDateString) {
  if (!isoDateString || typeof isoDateString !== 'string') {
    return isoDateString; // Return original value if it's not a valid string
  }
  try {
    const date = new Date(isoDateString);
    // Check if the date object is valid
    if (isNaN(date.getTime())) {
      return isoDateString; // Return original string if the date is invalid
    }
    return date.toLocaleString();
  } catch (e) {
    console.error('Could not parse ISO date:', e);
    return isoDateString; // Return original string on any error
  }
}

let qpdfInstance: any = null;

/**
 * Initialize qpdf-wasm singleton.
 * Subsequent calls return the same instance.
 */
export async function initializeQpdf() {
  if (qpdfInstance) return qpdfInstance;

  showLoader('Initializing PDF engine...');
  try {
    qpdfInstance = await createModule({
      locateFile: () => import.meta.env.BASE_URL + 'qpdf.wasm',
    });
  } catch (error) {
    console.error('Failed to initialize qpdf-wasm:', error);
    showAlert(
      'Initialization Error',
      'Could not load the PDF engine. Please refresh the page and try again.'
    );
    throw error;
  } finally {
    hideLoader();
  }

  return qpdfInstance;
}

export function initializeIcons(): void {
  createIcons({
    attrs: {
      class: 'bento-icon',
      'stroke-width': '1.5',
    },
  });
}

export function formatStars(num: number) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

/**
 * Truncates a filename to a maximum length, adding ellipsis if needed.
 * Preserves the file extension.
 * @param filename - The filename to truncate
 * @param maxLength - Maximum length (default: 30)
 * @returns Truncated filename with ellipsis if needed
 */
export function truncateFilename(filename: string, maxLength: number = 25): string {
  if (filename.length <= maxLength) {
    return filename;
  }

  const lastDotIndex = filename.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  const nameWithoutExt = lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;

  const availableLength = maxLength - extension.length - 3; // 3 for '...'

  if (availableLength <= 0) {
    return filename.substring(0, maxLength - 3) + '...';
  }

  return nameWithoutExt.substring(0, availableLength) + '...' + extension;
}

export function formatShortcutDisplay(shortcut: string, isMac: boolean): string {
  if (!shortcut) return '';
  return shortcut
    .replace('mod', isMac ? '⌘' : 'Ctrl')
    .replace('ctrl', isMac ? '^' : 'Ctrl') // Control key on Mac shows as ^
    .replace('alt', isMac ? '⌥' : 'Alt')
    .replace('shift', 'Shift')
    .split('+')
    .map(k => k.charAt(0).toUpperCase() + k.slice(1))
    .join(isMac ? '' : '+');
}

export function resetAndReloadTool(preResetCallback?: () => void) {
  const toolid = state.activeTool;

  if (preResetCallback) {
    preResetCallback();
  }

  resetState();

  if (toolid) {
    const element = document.querySelector(
      `[data-tool-id="${toolid}"]`
    ) as HTMLElement;
    if (element) element.click();
  }
}

/**
 * Wrapper for pdfjsLib.getDocument that adds the required wasmUrl configuration.
 * Use this instead of calling pdfjsLib.getDocument directly.
 * @param src The source to load (url string, typed array, or parameters object)
 * @returns The PDF loading task
 */
export function getPDFDocument(src: any) {
  let params = src;

  // Handle different input types similar to how getDocument handles them, 
  // but we ensure we have an object to attach wasmUrl to.
  if (typeof src === 'string') {
    params = { url: src };
  } else if (src instanceof Uint8Array || src instanceof ArrayBuffer) {
    params = { data: src };
  }

  // Ensure params is an object
  if (typeof params !== 'object' || params === null) {
    params = {};
  }

  // Add wasmUrl pointing to our public/wasm directory
  // This is required for PDF.js v5+ to load OpenJPEG for certain images
  return pdfjsLib.getDocument({
    ...params,
    wasmUrl: import.meta.env.BASE_URL + 'pdfjs-viewer/wasm/',
  });
}
