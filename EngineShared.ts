
import { jsPDF } from 'jspdf';
import { CustomFont } from './types';
import { getGlyphRegistry } from './persistentRegistry';
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
