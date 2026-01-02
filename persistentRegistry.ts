
/**
 * CITADEL PERSISTENT GLYPH REGISTRY v2.6
 * Handles the storage of AI-verified unicodes and missing glyph mappings in LocalStorage.
 */
export interface GlyphRegistryEntry {
  unicode: string;
  data: string;
  timestamp: number;
}

export const saveGlyphMapping = (unicode: string, data: string) => {
  const existing = JSON.parse(localStorage.getItem('citadel_glyph_registry') || '{}');
  existing[unicode.toUpperCase()] = { data, timestamp: Date.now() };
  localStorage.setItem('citadel_glyph_registry', JSON.stringify(existing));
};

export const getGlyphRegistry = (): Record<string, { data: string; timestamp: number }> => {
  try {
    return JSON.parse(localStorage.getItem('citadel_glyph_registry') || '{}');
  } catch {
    return {};
  }
};

export const logMissingCharacter = (char: string) => {
  // Use codePointAt to handle surrogate pairs (emojis) correctly
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) return;
  const code = '0x' + codePoint.toString(16).toUpperCase();
  
  const existing = JSON.parse(localStorage.getItem('citadel_missing_characters') || '[]');
  if (!existing.includes(code)) {
    existing.push(code);
    localStorage.setItem('citadel_missing_characters', JSON.stringify(existing));
  }
};

export const getMissingCharacters = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('citadel_missing_characters') || '[]');
  } catch {
    return [];
  }
};

export const clearMissingCharacters = () => {
  localStorage.setItem('citadel_missing_characters', '[]');
};

export const deleteGlyphMapping = (unicode: string) => {
  const existing = getGlyphRegistry();
  delete existing[unicode.toUpperCase()];
  localStorage.setItem('citadel_glyph_registry', JSON.stringify(existing));
};
