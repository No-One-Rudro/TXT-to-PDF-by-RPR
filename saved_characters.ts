
/**
 * CITADEL STATIC GLYPH REGISTRY
 * Hardcoded character mappings for rapid offline lookup.
 */
export interface StaticGlyph {
  unicode: string;
  data: string; // Base64
}

// Initialized with empty array; populate via AI scans exported from the app
export const PRE_SCANNED_GLYPHS: StaticGlyph[] = [
  // Example: { unicode: '0x41', data: '...' }
];
