
import { jsPDF } from 'jspdf';
import { CustomFont } from './types';
import { getGlyphRegistry, logMissingCharacter } from './persistentRegistry';
import { PRE_SCANNED_GLYPHS } from './saved_characters';

export * from './CharacterMaster';
export * from './HyphenationCore';
export * from './LineManager';

// Registers fonts for the invisible text layer (jsPDF internal)
export const registerCustomFonts = (doc: jsPDF, fonts: CustomFont[]) => {
  fonts.forEach(font => {
    if (font.format === 'glyph-map') return;
    try {
      doc.addFileToVFS(`${font.name}.${font.format}`, font.data);
      doc.addFont(`${font.name}.${font.format}`, font.name, 'normal');
    } catch (e) {
      console.warn(`Font load failed: ${font.name}`);
    }
  });
};

// Injects fonts into the Browser DOM for the visible Canvas layer
export const injectDOMFonts = async (fonts: CustomFont[]) => {
  for (const font of fonts) {
    if (font.format === 'glyph-map') continue;
    
    // Check if already loaded
    if (document.fonts.check(`12px "${font.name}"`)) continue;

    try {
      const fontFace = new FontFace(font.name, `url(data:font/${font.format};base64,${font.data})`);
      const loadedFace = await fontFace.load();
      document.fonts.add(loadedFace);
      console.log(`[System] Injected font into DOM: ${font.name}`);
    } catch (e) {
      console.error(`[System] Failed to inject font ${font.name}`, e);
    }
  }
};

export const loadGlyphCache = async (): Promise<Map<string, HTMLImageElement>> => {
  const cache = new Map<string, HTMLImageElement>();
  const registry = getGlyphRegistry();
  const allGlyphs = [
    ...PRE_SCANNED_GLYPHS,
    ...Object.entries(registry).map(([unicode, entry]) => ({ unicode, data: entry.data }))
  ];

  const promises = allGlyphs.map(g => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        cache.set(g.unicode, img);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = `data:image/png;base64,${g.data}`;
    });
  });

  await Promise.all(promises);
  return cache;
};

/**
 * PRIORITY FALLBACK CHAIN
 * The scanner will attempt these fonts if the primary stack fails.
 * Expanded to include monospace and generic families to match native terminal capabilities.
 */
const PRIORITY_FALLBACKS = [
  'Noto Sans',
  'Noto Serif',
  'Noto Sans Mono',
  'Noto Sans JP', 'Noto Sans KR', 'Noto Sans SC', 'Noto Sans TC', // CJK
  'Noto Naskh Arabic', 'Noto Sans Arabic', // Arabic
  'Roboto',
  'Roboto Mono',
  'Droid Sans Mono',
  'monospace',
  'Segoe UI',
  'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', // Emoji
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'sans-serif',
  'serif'
];

/**
 * Checks if a character is a control char or ignorable (e.g. Variation Selector)
 * These should not trigger "missing glyph" alerts even if invisible.
 */
const isIgnorable = (char: string) => {
  const code = char.codePointAt(0) || 0;
  // Variation Selectors (FE00-FE0F), Tags (E0000-E007F)
  if (code >= 0xFE00 && code <= 0xFE0F) return true; 
  if (code >= 0xE0000 && code <= 0xE007F) return true;
  // Control chars (0-31, 127-159)
  if (code <= 31 || (code >= 127 && code <= 159)) return true;
  // Zero Width chars (200B-200F, 202A-202E, 2060-206F)
  if (code === 0x200B || code === 0x200C || code === 0x200D || code === 0x200E || code === 0x200F) return true;
  return false;
};

/**
 * INTELLIGENT GLYPH SCANNER v5.0 (Corrected Zero-Width Logic)
 * 1. Checks primary font stack.
 * 2. If Tofu detected, iterates through PRIORITY_FALLBACKS.
 * 3. 0-width characters are now considered VALID (invisible) rather than missing, 
 *    unless they explicitly render as a Tofu box (which has width).
 */
export const scanTextForMissingGlyphs = (text: string, fontStack: string) => {
  const canvas = document.createElement('canvas');
  const SIZE = 40;
  canvas.width = SIZE; 
  canvas.height = SIZE;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  
  // Base settings
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000000';

  // Helper: Capture Tofu Fingerprint for a given font
  const getTofuFingerprint = (font: string) => {
    ctx.font = `24px ${font}`;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillText('\uFFFF', SIZE / 2, SIZE / 2);
    return {
      width: ctx.measureText('\uFFFF').width,
      data: ctx.getImageData(0, 0, SIZE, SIZE).data
    };
  };

  // Helper: Check if character is Tofu using current context font
  const checkIsTofu = (char: string, tofuRef: { width: number, data: Uint8ClampedArray }) => {
    const w = ctx.measureText(char).width;
    
    // CORRECTION: Width 0 means invisible/supported (like ZWSP or Combining Mark), NOT missing.
    // Missing glyphs almost always render a box (Tofu) which has width.
    if (w === 0) return false; 
    
    // If width differs significantly from Tofu, it's likely a valid glyph
    if (Math.abs(w - tofuRef.width) > 0.05) return false;

    // Pixel heuristic: Compare exact pixels
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillText(char, SIZE / 2, SIZE / 2);
    const charData = ctx.getImageData(0, 0, SIZE, SIZE).data;

    const len = charData.length;
    for (let i = 0; i < len; i += 4) {
       // Check Alpha
       if (charData[i+3] !== tofuRef.data[i+3]) return false;
       // If visible, check RGB
       if (charData[i+3] > 0) {
           if (charData[i] !== tofuRef.data[i] || 
               charData[i+1] !== tofuRef.data[i+1] || 
               charData[i+2] !== tofuRef.data[i+2]) {
               return false;
           }
       }
    }
    return true; // Pixels match Tofu exactly
  };

  // 1. Capture Primary Tofu (Primary Stack)
  const primaryTofu = getTofuFingerprint(fontStack);

  const checkedChars = new Set<string>();
  let asciiChecked = false;

  for (const char of text) {
    if (isIgnorable(char)) continue;

    // Fast path: ASCII 
    if (char.length === 1 && char.charCodeAt(0) < 128) {
        if (asciiChecked) continue;
        asciiChecked = true; 
    }

    if (checkedChars.has(char)) continue;
    checkedChars.add(char);

    if (!char.trim()) continue; 
    
    // --- PHASE 1: Primary Stack Check ---
    let isMissing = false;
    
    // Browser API Fast Check
    if (document.fonts && document.fonts.check && !document.fonts.check(`24px ${fontStack}`, char)) {
       isMissing = true;
    } else {
       ctx.font = `24px ${fontStack}`;
       if (checkIsTofu(char, primaryTofu)) {
           isMissing = true;
       }
    }

    // --- PHASE 2: Fallback Chain Check ---
    if (isMissing) {
       let recovered = false;
       
       for (const fallbackFont of PRIORITY_FALLBACKS) {
          // Use the specific fallback font plus sans-serif to ensure system linking
          const fallbackStack = `"${fallbackFont}", sans-serif`;
          const fallbackTofu = getTofuFingerprint(fallbackStack);
          
          ctx.font = `24px ${fallbackStack}`;
          
          // If this fallback actually renders the char (not Tofu), we are good.
          if (!checkIsTofu(char, fallbackTofu)) {
              recovered = true;
              break;
          }
       }

       if (!recovered) {
          logMissingCharacter(char);
       }
    }
  }
};
