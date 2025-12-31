
/**
 * LINE MANAGER v6.0 - INTELLIGENT WRAP ENGINE
 * Uses Intl.Segmenter for locale-aware word breaking (CJK, Thai, etc.)
 */
import { segmentRuns } from './CharacterMaster';

export interface RenderLine {
  runs: string[];
  width: number;
}

export interface RenderPage {
  lines: RenderLine[];
}

export const calculateLayout = (
  text: string,
  maxWidth: number,
  maxHeight: number,
  lineHeight: number,
  measure: (s: string) => number
): RenderPage[] => {
  const paragraphs = text.split(/\r?\n/);
  const pages: RenderPage[] = [{ lines: [] }];
  let currentPage = pages[0];
  let currentY = 0;

  // Reduce effective width slightly to prevent float rounding errors clipping text
  const effectiveMaxWidth = maxWidth - 1;

  const flushLine = (line: RenderLine) => {
    if (effectiveMaxWidth < 10) return;

    if (currentY + lineHeight > maxHeight && currentPage.lines.length > 0) {
      currentPage = { lines: [] };
      pages.push(currentPage);
      currentY = 0;
    }
    currentPage.lines.push(line);
    currentY += lineHeight;
  };

  // Setup Segmenter for robust tokenization
  let segmenter: any = null;
  if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
    segmenter = new (Intl as any).Segmenter(undefined, { granularity: 'word' });
  }

  for (const para of paragraphs) {
    if (para === '') {
      flushLine({ runs: [], width: 0 });
      continue;
    }

    // Tokenize: Use Intl.Segmenter if available, otherwise fallback to basic split
    let tokens: string[] = [];
    if (segmenter) {
      const segments = segmenter.segment(para);
      for (const seg of segments) {
        tokens.push(seg.segment);
      }
    } else {
      // Legacy Fallback (preserves spaces by splitting with delimiter)
      tokens = para.split(/(\s+)/).filter(Boolean);
    }

    let currentLineRuns: string[] = [];
    let currentLineWidth = 0;

    for (const token of tokens) {
      // Normalize tabs
      const displayToken = token.replace(/\t/g, '    ');
      const tokenW = measure(displayToken);

      // CASE 1: Token fits
      if (currentLineWidth + tokenW <= effectiveMaxWidth) {
        currentLineRuns.push(displayToken);
        currentLineWidth += tokenW;
      }
      // CASE 2: Token doesn't fit
      else {
        // Flush existing line
        if (currentLineRuns.length > 0) {
          flushLine({ runs: currentLineRuns, width: currentLineWidth });
          currentLineRuns = [];
          currentLineWidth = 0;
        }

        // Retry on new line
        if (tokenW <= effectiveMaxWidth) {
          currentLineRuns.push(displayToken);
          currentLineWidth = tokenW;
        }
        // CASE 3: Token is HUGE (longer than a full line) -> Forced Character Split
        else {
          const graphemes = segmentRuns(displayToken); // Cluster-aware split
          let tempRuns: string[] = [];
          let tempW = 0;

          for (const grapheme of graphemes) {
            const gWidth = measure(grapheme);
            if (tempW + gWidth <= effectiveMaxWidth) {
              tempRuns.push(grapheme);
              tempW += gWidth;
            } else {
              if (tempRuns.length > 0) {
                flushLine({ runs: tempRuns, width: tempW });
              }
              tempRuns = [grapheme];
              tempW = gWidth;
            }
          }
          if (tempRuns.length > 0) {
            currentLineRuns = tempRuns;
            currentLineWidth = tempW;
          }
        }
      }
    }

    if (currentLineRuns.length > 0) {
      flushLine({ runs: currentLineRuns, width: currentLineWidth });
    }
  }

  return pages;
};
