/**
 * HYPHENATION CORE v4.0
 * Syllabic splitting logic for professional text flow.
 */

export const SOFT_HYPHEN = '\u00AD';

/**
 * Analyzes a word and identifies syllabic break points.
 */
export const getSyllables = (word: string): string[] => {
  if (word.length <= 5) return [word];
  
  // Heuristic: Break after vowels if followed by multiple consonants, 
  // or between double consonants. Matches standard pro-converter behavior.
  const regex = /([aeiouy][^aeiouy]{2,}|[^aeiouy]{1,}[aeiouy]{1,}|[aeiouy]{2,})/gi;
  const parts = word.split(regex).filter(Boolean);
  
  return parts.length > 0 ? parts : [word];
};

/**
 * Injects invisible break opportunities into a word.
 */
export const prepareWord = (word: string): string => {
  if (word.includes(SOFT_HYPHEN)) return word;
  return getSyllables(word).join(SOFT_HYPHEN);
};
